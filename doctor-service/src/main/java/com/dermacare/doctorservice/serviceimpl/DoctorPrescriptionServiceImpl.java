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
            DoctorPrescription entity = new DoctorPrescription();
            entity.setPrescriptionId(UUID.randomUUID().toString());

            // Fetch all existing prescriptions to check for existing medicine names
            List<DoctorPrescription> allPrescriptions = repository.findAll();
            List<Medicine> existingMedicines = allPrescriptions.stream()
                .flatMap(p -> Optional.ofNullable(p.getMedicines()).orElse(List.of()).stream())
                .collect(Collectors.toList());

            List<Medicine> medicineList = dto.getMedicines().stream().map(m -> {
                String incomingName = m.getName() != null ? m.getName().trim().toLowerCase() : "";

                Optional<Medicine> existing = existingMedicines.stream()
                    .filter(existingMed -> existingMed.getName() != null &&
                            existingMed.getName().trim().equalsIgnoreCase(incomingName))
                    .findFirst();

                String medId;
                if (existing.isPresent()) {
                    // Update existing medicine by ID
                    medId = existing.get().getId();
                } else {
                    // New unique medicine
                    medId = UUID.randomUUID().toString();
                }

                return new Medicine(
                    medId,
                    m.getName(),
                    m.getDose(),
                    m.getDuration(),
                    m.getNote(),
                    m.getFood(),
                    m.getRemindWhen(),
                    m.getTimes()
                );
            }).collect(Collectors.toList());

            entity.setMedicines(medicineList);

            // Save prescription with updated/new medicines
            DoctorPrescription saved = repository.save(entity);

            DoctorPrescriptionDTO responseDTO = new DoctorPrescriptionDTO();
            responseDTO.setPrescriptionId(saved.getPrescriptionId());
            responseDTO.setMedicines(saved.getMedicines().stream().map(m -> new MedicineDTO(
                m.getId(), m.getName(), m.getDose(), m.getDuration(), m.getNote(), m.getFood(), m.getRemindWhen(), m.getTimes()
            )).collect(Collectors.toList()));

            return new Response(true, responseDTO, "Prescription created successfully", HttpStatus.CREATED.value());

        } catch (Exception e) {
            return new Response(false, null, "Failed to create prescription: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }


    @Override
    public Response getAllPrescriptions() {
        try {
            List<DoctorPrescriptionDTO> dtos = repository.findAll().stream().map(p -> {
                DoctorPrescriptionDTO dto = new DoctorPrescriptionDTO();
                dto.setPrescriptionId(p.getPrescriptionId());
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
                dto.setPrescriptionId(p.getPrescriptionId());
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
                .collect(Collectors.toList());

            if (!matches.isEmpty()) {
                List<MedicineDTO> dtos = matches.stream().map(m -> new MedicineDTO(
                    m.getId(), m.getName(), m.getDose(), m.getDuration(), m.getNote(), m.getFood(), m.getRemindWhen(), m.getTimes()
                )).collect(Collectors.toList());

                return new Response(true, dtos, "Medicine(s) found with given ID", HttpStatus.OK.value());
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

            // Normalize keyword
            String normalizedKeyword = keyword.trim().replaceAll("\\s+", " ").toLowerCase();

            // Get all prescriptions and extract exact name matches
            List<DoctorPrescription> allPrescriptions = repository.findAll();

            List<Medicine> matchedMedicines = allPrescriptions.stream()
                .flatMap(prescription -> Optional.ofNullable(prescription.getMedicines())
                                                 .orElse(List.of()).stream())
                .filter(medicine -> {
                    if (medicine.getName() == null) return false;
                    String normalizedMedicineName = medicine.getName().trim().replaceAll("\\s+", " ").toLowerCase();
                    return normalizedMedicineName.equals(normalizedKeyword);  // ✅ exact match only
                })
                .distinct()
                .collect(Collectors.toList());

            if (matchedMedicines.isEmpty()) {
                return new Response(false, null, "No medicine found with exact name: " + keyword, HttpStatus.NOT_FOUND.value());
            }

            // Convert matched medicines to DTOs
            List<MedicineDTO> dtos = matchedMedicines.stream()
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

            return new Response(true, dtos, "Matching medicines found", HttpStatus.OK.value());

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
}
