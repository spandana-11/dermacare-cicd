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
            // ✅ 1. Validate input
            if (dto == null || dto.getMedicines() == null || dto.getMedicines().isEmpty()) {
                return new Response(false, null, "Prescription must have at least one medicine", HttpStatus.BAD_REQUEST.value());
            }

            if (dto.getClinicId() == null || dto.getClinicId().isBlank()) {
                return new Response(false, null, "Clinic ID is required", HttpStatus.BAD_REQUEST.value());
            }

            // If you have a separate ClinicRepository, validate against it
            // boolean clinicExists = clinicRepository.existsById(dto.getClinicId());
            // if (!clinicExists) {
            //     return new Response(false, null, "Invalid Clinic ID", HttpStatus.NOT_FOUND.value());
            // }

            DoctorPrescription entity = (dto.getId() != null && !dto.getId().isBlank())
                    ? repository.findById(dto.getId()).orElse(new DoctorPrescription())
                    : new DoctorPrescription();

            entity.setClinicId(dto.getClinicId());

            List<Medicine> existingMedicines = Optional.ofNullable(entity.getMedicines())
                    .orElse(new ArrayList<>());

            boolean updatedExistingMedicine = false;
            boolean addedNewMedicine = false;

            for (MedicineDTO incomingMed : dto.getMedicines()) {
                if (incomingMed == null || incomingMed.getName() == null || incomingMed.getName().isBlank()) {
                    continue;
                }

                String normalizedName = incomingMed.getName().trim().replaceAll("\\s+", " ").toLowerCase();

                // Find existing medicine in ANY prescription
                Medicine foundMedicine = repository.findAll().stream()
                        .flatMap(pres -> Optional.ofNullable(pres.getMedicines()).orElse(List.of()).stream())
                        .filter(m -> m.getName() != null &&
                                m.getName().trim().replaceAll("\\s+", " ").toLowerCase().equals(normalizedName))
                        .findFirst()
                        .orElse(null);

                if (foundMedicine != null) {
                    updatedExistingMedicine = true;

                    // ✅ Update details of found medicine everywhere
                    repository.findAll().forEach(pres -> {
                        if (pres.getMedicines() != null) {
                            pres.getMedicines().forEach(m -> {
                                if (m.getName() != null &&
                                        m.getName().trim().replaceAll("\\s+", " ").toLowerCase().equals(normalizedName)) {
                                    m.setDose(incomingMed.getDose());
                                    m.setDuration(incomingMed.getDuration());
                                    m.setNote(incomingMed.getNote());
                                    m.setFood(incomingMed.getFood());
                                    m.setRemindWhen(incomingMed.getRemindWhen());
                                    m.setTimes(incomingMed.getTimes());
                                }
                            });
                            repository.save(pres);
                        }
                    });

                    // Add to current prescription if not already there
                    boolean existsInCurrent = existingMedicines.stream()
                            .anyMatch(m -> m.getName() != null &&
                                    m.getName().trim().replaceAll("\\s+", " ").toLowerCase().equals(normalizedName));

                    if (!existsInCurrent) {
                        existingMedicines.add(foundMedicine);
                    }
                } else {
                    addedNewMedicine = true;

                    // ✅ Create new medicine
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

          
            String finalMessage;
            if (updatedExistingMedicine && addedNewMedicine) {
                finalMessage = "Prescription created and existing medicines updated successfully";
            } else if (updatedExistingMedicine) {
                finalMessage = "Existing medicines updated successfully";
            } else if (addedNewMedicine) {
                finalMessage = "Prescription created successfully";
            } else {
                finalMessage = "No changes were made to the prescription";
            }

            return new Response(true, responseDTO, finalMessage, HttpStatus.CREATED.value());

        } catch (Exception e) {
            return new Response(false, null, "Failed to create/update prescription: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
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

            // Get only medicines that exactly match the searched keyword
            List<MedicineDTO> matchedMedicines = repository.findAll().stream()
                .flatMap(prescription -> Optional.ofNullable(prescription.getMedicines())
                                                 .orElse(List.of())
                                                 .stream())
                .filter(medicine -> medicine.getName() != null &&
                    medicine.getName().trim().replaceAll("\\s+", " ").toLowerCase().equals(normalizedKeyword))
                .map(m -> new MedicineDTO(
                    m.getId(),
                    m.getName(),
                    m.getDose(),
                    m.getDuration(),
                    m.getNote(),
                    m.getFood(),
                    m.getRemindWhen(),
                    m.getTimes()
                ))
                .collect(Collectors.toList());

            if (matchedMedicines.isEmpty()) {
                return new Response(false, null, "No medicine found with exact name: " + keyword, HttpStatus.NOT_FOUND.value());
            }

            return new Response(true, matchedMedicines, "Medicine found", HttpStatus.OK.value());

        } catch (Exception e) {
            return new Response(false, null, "Error searching medicine: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
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
