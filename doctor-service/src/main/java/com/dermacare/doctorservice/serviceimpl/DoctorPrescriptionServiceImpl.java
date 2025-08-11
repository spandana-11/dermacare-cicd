package com.dermacare.doctorservice.serviceimpl;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.dermacare.doctorservice.dto.DoctorPrescriptionDTO;
import com.dermacare.doctorservice.dto.MedicineDTO;
import com.dermacare.doctorservice.dto.Response;
import com.dermacare.doctorservice.model.DoctorPrescription;
import com.dermacare.doctorservice.model.Medicine;
import com.dermacare.doctorservice.repository.DoctorPrescriptionRepository;
import com.dermacare.doctorservice.service.DoctorPrescriptionService;

@Service
public class DoctorPrescriptionServiceImpl implements DoctorPrescriptionService {

    @Autowired
    private DoctorPrescriptionRepository repository;

    @Override
    public Response createPrescription(DoctorPrescriptionDTO dto) {
        try {
            if (dto == null || dto.getMedicines() == null || dto.getMedicines().isEmpty()) {
                return new Response(false, null, "Prescription must have at least one medicine", HttpStatus.BAD_REQUEST.value());
            }

            DoctorPrescription entity;
            if (dto.getId() != null && !dto.getId().isBlank()) {
                entity = repository.findById(dto.getId()).orElse(new DoctorPrescription());
            } else {
                entity = new DoctorPrescription();
            }
            if (dto.getClinicId() != null && !dto.getClinicId().isBlank()) {
                entity.setClinicId(dto.getClinicId());
            }


            List<Medicine> existingMedicines = Optional.ofNullable(entity.getMedicines())
                    .orElse(new ArrayList<>());

            // Process each incoming medicine
            for (MedicineDTO incomingMed : dto.getMedicines()) {
                if (incomingMed == null || incomingMed.getName() == null || incomingMed.getName().isBlank()) {
                    continue;
                }

                String normalizedName = incomingMed.getName().trim().toLowerCase();

                // Find all prescriptions containing medicine with this name
                List<DoctorPrescription> prescriptionsWithMedicine = repository.findAll().stream()
                    .filter(prescription -> prescription.getMedicines() != null &&
                        prescription.getMedicines().stream()
                            .anyMatch(med -> med.getName() != null && med.getName().trim().equalsIgnoreCase(normalizedName)))
                    .collect(Collectors.toList());

                if (!prescriptionsWithMedicine.isEmpty()) {
                    // Update medicine details in all these prescriptions
                    for (DoctorPrescription pres : prescriptionsWithMedicine) {
                        for (Medicine med : pres.getMedicines()) {
                            if (med.getName() != null && med.getName().trim().equalsIgnoreCase(normalizedName)) {
                                med.setDose(incomingMed.getDose());
                                med.setDuration(incomingMed.getDuration());
                                med.setNote(incomingMed.getNote());
                                med.setFood(incomingMed.getFood());
                                med.setRemindWhen(incomingMed.getRemindWhen());
                                med.setTimes(incomingMed.getTimes());
                            }
                        }
                        repository.save(pres);
                    }

                    // Check if medicine exists in current prescription; if not, add it
                    boolean existsInCurrent = existingMedicines.stream()
                            .anyMatch(m -> m.getName() != null && m.getName().trim().equalsIgnoreCase(normalizedName));

                    if (!existsInCurrent) {
                        Medicine medToAdd = prescriptionsWithMedicine.get(0).getMedicines().stream()
                            .filter(m -> m.getName() != null && m.getName().trim().equalsIgnoreCase(normalizedName))
                            .findFirst()
                            .orElse(null);

                        if (medToAdd != null) {
                            existingMedicines.add(medToAdd);
                        }
                    }
                } else {
                    // Medicine name does not exist anywhere: add new medicine with new UUID
                    existingMedicines.add(new Medicine(
                        UUID.randomUUID().toString(),
                        incomingMed.getName().trim(),
                        incomingMed.getDose(),
                        incomingMed.getDuration(),
                        incomingMed.getNote(),
                        incomingMed.getFood(),
                        incomingMed.getRemindWhen(),
                        incomingMed.getTimes()
                    ));
                }
            }

            entity.setMedicines(existingMedicines);
            DoctorPrescription saved = repository.save(entity);

            // Prepare response DTO
            DoctorPrescriptionDTO responseDTO = new DoctorPrescriptionDTO();
            responseDTO.setId(saved.getId());
            responseDTO.setClinicId(saved.getClinicId()); 

            responseDTO.setMedicines(saved.getMedicines().stream()
                    .map(m -> new MedicineDTO(
                            m.getId(), m.getName(), m.getDose(), m.getDuration(),
                            m.getNote(), m.getFood(), m.getRemindWhen(), m.getTimes()
                    ))
                    .collect(Collectors.toList())
            );

            return new Response(true, responseDTO, "Prescription created/updated successfully", HttpStatus.CREATED.value());

        } catch (Exception e) {
            return new Response(false, null, "Failed to create/update prescription: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    private void updateMedicine(Medicine existing, MedicineDTO incoming) {
        existing.setDose(incoming.getDose());
        existing.setDuration(incoming.getDuration());
        existing.setNote(incoming.getNote());
        existing.setFood(incoming.getFood());
        existing.setRemindWhen(incoming.getRemindWhen());
        existing.setTimes(incoming.getTimes());
    }


    // Helper method to update medicine details
//    private void updateMedicine(Medicine existing, MedicineDTO incoming) {
//        existing.setName(incoming.getName().trim());
//        existing.setDose(incoming.getDose());
//        existing.setDuration(incoming.getDuration());
//        existing.setNote(incoming.getNote());
//        existing.setFood(incoming.getFood());
//        existing.setRemindWhen(incoming.getRemindWhen());
//        existing.setTimes(incoming.getTimes());
//    }

    @Override
    public Response getAllPrescriptions() {
        try {
            List<DoctorPrescriptionDTO> dtos = repository.findAll().stream().map(p -> {
                DoctorPrescriptionDTO dto = new DoctorPrescriptionDTO();
                dto.setId(p.getId());
                List<MedicineDTO> meds = Optional.ofNullable(p.getMedicines()).orElse(List.of()).stream().map(m -> new MedicineDTO(
                    m.getId(), m.getName(), m.getDose(), m.getDuration(), m.getNote(), m.getFood(), m.getRemindWhen(), m.getTimes()
                )).collect(Collectors.toList());
                dto.setMedicines(meds);
                return dto;
            }).collect(Collectors.toList());

            return new Response(true, dtos, "Fetched all prescriptions successfully", HttpStatus.OK.value());

        } catch (Exception e) {
            return new Response(false, null, "Error fetching prescriptions: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    @Override
    public Response getPrescriptionById(String id) {
        try {
            Optional<DoctorPrescription> optional = repository.findById(id);
            if (optional.isPresent()) {
                DoctorPrescription p = optional.get();
                DoctorPrescriptionDTO dto = new DoctorPrescriptionDTO();
                dto.setId(p.getId());
                List<MedicineDTO> meds = Optional.ofNullable(p.getMedicines()).orElse(List.of()).stream().map(m -> new MedicineDTO(
                    m.getId(), m.getName(), m.getDose(), m.getDuration(), m.getNote(), m.getFood(), m.getRemindWhen(), m.getTimes()
                )).collect(Collectors.toList());
                dto.setMedicines(meds);

                return new Response(true, dto, "Prescription found", HttpStatus.OK.value());
            } else {
                return new Response(false, null, "Prescription not found", HttpStatus.NOT_FOUND.value());
            }
        } catch (Exception e) {
            return new Response(false, null, "Error retrieving prescription: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    @Override
    public Response getMedicineById(String medicineId) {
        try {
            List<Medicine> matches = repository.findAll().stream()
                .flatMap(p -> Optional.ofNullable(p.getMedicines()).orElse(List.of()).stream())
                .filter(m -> m.getId() != null && m.getId().equals(medicineId))
                .distinct()
                .collect(Collectors.toList());

            if (!matches.isEmpty()) {
                List<MedicineDTO> dtos = matches.stream().map(m -> new MedicineDTO(
                    m.getId(), m.getName(), m.getDose(), m.getDuration(), m.getNote(), m.getFood(), m.getRemindWhen(), m.getTimes()
                )).collect(Collectors.toList());

                return new Response(true, dtos, "Medicine found", HttpStatus.OK.value());
            } else {
                return new Response(false, null, "No medicine found with given ID", HttpStatus.NOT_FOUND.value());
            }
        } catch (Exception e) {
            return new Response(false, null, "Error while fetching medicine: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    @Override
    public Response deletePrescription(String id) {
        try {
            if (repository.existsById(id)) {
                repository.deleteById(id);
                return new Response(true, null, "Prescription deleted successfully", HttpStatus.OK.value());
            } else {
                return new Response(false, null, "Prescription not found", HttpStatus.NOT_FOUND.value());
            }
        } catch (Exception e) {
            return new Response(false, null, "Failed to delete: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    @Override
    public Response searchMedicinesByName(String keyword) {
        try {
            if (keyword == null || keyword.trim().isEmpty()) {
                return new Response(false, null, "Keyword must not be empty", HttpStatus.BAD_REQUEST.value());
            }

            String normalizedKeyword = keyword.trim().replaceAll("\\s+", " ").toLowerCase();

            // Use a map to avoid duplicates by medicine ID
            var medicineMap = repository.findAll().stream()
                .flatMap(prescription -> Optional.ofNullable(prescription.getMedicines())
                                                 .orElse(List.of()).stream())
                .filter(medicine -> {
                    if (medicine.getName() == null) return false;
                    String normalizedMedicineName = medicine.getName().trim().replaceAll("\\s+", " ").toLowerCase();
                    return normalizedMedicineName.equals(normalizedKeyword);
                })
                .collect(Collectors.toMap(
                    Medicine::getId,  // key by medicine ID
                    m -> new MedicineDTO(
                        m.getId(),
                        m.getName(),
                        m.getDose(),
                        m.getDuration(),
                        m.getNote(),
                        m.getFood(),
                        m.getRemindWhen(),
                        m.getTimes()
                    ),
                    (existing, replacement) -> existing // in case of duplicates, keep first
                ));

            List<MedicineDTO> matchedMedicines = new ArrayList<>(medicineMap.values());

            if (matchedMedicines.isEmpty()) {
                return new Response(false, null, "No medicine found with exact name: " + keyword, HttpStatus.NOT_FOUND.value());
            }

            return new Response(true, matchedMedicines, "Matching medicine found", HttpStatus.OK.value());

        } catch (Exception e) {
            return new Response(false, null, "Error searching medicines: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }


    @Override
    public Response deleteMedicineById(String medicineId) {
        try {
            List<DoctorPrescription> allPrescriptions = repository.findAll();
            boolean medicineDeleted = false;

            for (DoctorPrescription prescription : allPrescriptions) {
                List<Medicine> medicines = prescription.getMedicines() != null
                    ? new ArrayList<>(prescription.getMedicines())
                    : new ArrayList<>();

                boolean removed = medicines.removeIf(med -> med.getId() != null && med.getId().equals(medicineId));

                if (removed) {
                    prescription.setMedicines(medicines);
                    repository.save(prescription);
                    medicineDeleted = true;
                }
            }

            if (medicineDeleted) {
                return new Response(true, null, "Medicine deleted successfully", HttpStatus.OK.value());
            } else {
                return new Response(false, null, "Medicine not found", HttpStatus.NOT_FOUND.value());
            }

        } catch (Exception e) {
            return new Response(false, null, "Error deleting medicine: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }
    @Override
    public Response getPrescriptionsByClinicId(String clinicId) {
        try {
            List<DoctorPrescription> prescriptions = repository.findByClinicId(clinicId);
            List<DoctorPrescriptionDTO> dtos = prescriptions.stream().map(p -> {
                DoctorPrescriptionDTO dto = new DoctorPrescriptionDTO();
                dto.setId(p.getId());
                dto.setClinicId(p.getClinicId());  

                List<MedicineDTO> meds = Optional.ofNullable(p.getMedicines()).orElse(List.of()).stream()
                    .map(m -> new MedicineDTO(
                        m.getId(), m.getName(), m.getDose(), m.getDuration(), m.getNote(), m.getFood(), m.getRemindWhen(), m.getTimes()
                    )).collect(Collectors.toList());
                dto.setMedicines(meds);
                return dto;
            }).collect(Collectors.toList());

            return new Response(true, dtos, "Prescriptions fetched successfully for clinicId: " + clinicId, HttpStatus.OK.value());

        } catch (Exception e) {
            return new Response(false, null, "Error fetching prescriptions by clinicId: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

}
