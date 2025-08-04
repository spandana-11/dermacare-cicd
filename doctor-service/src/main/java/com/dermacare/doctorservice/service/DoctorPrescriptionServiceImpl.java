package com.dermacare.doctorservice.service;

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

@Service
public class DoctorPrescriptionServiceImpl implements DoctorPrescriptionService {

    @Autowired
    private DoctorPrescriptionRepository repository;

    @Override
    public Response createPrescription(DoctorPrescriptionDTO dto) {
        try {
            DoctorPrescription entity = new DoctorPrescription();

            // Always assign a new prescription ID
            entity.setPrescriptionId(UUID.randomUUID().toString());

            List<Medicine> medicineList = dto.getMedicines().stream().map(m -> {
                boolean isNew = m.getId() == null || m.getId().isBlank();

                if (!isNew) {
                    // Use correct query: get all prescriptions containing this medicine ID
                    List<DoctorPrescription> existingPrescriptions = repository.findByMedicines_Id(m.getId());

                    if (!existingPrescriptions.isEmpty()) {
                        boolean nameMatches = false;

                        for (DoctorPrescription pres : existingPrescriptions) {
                            for (Medicine med : pres.getMedicines()) {
                                if (med.getId().equals(m.getId())) {
                                    if (med.getName().equalsIgnoreCase(m.getName())) {
                                        nameMatches = true;
                                        break;
                                    }
                                }
                            }
                            if (nameMatches) break;
                        }

                        if (!nameMatches) {
                            isNew = true; // ID exists but name differs
                        }
                    } else {
                        isNew = true; // ID doesn't exist in any prescription
                    }
                }

                String medId = isNew ? UUID.randomUUID().toString() : m.getId();

                return new Medicine(
                    medId,
                    m.getName(),
                    m.getDose(),
                    m.getDuration(),
                    m.getNote(),
                    m.getRemindWhen(),
                    m.getTimes()
                );
            }).collect(Collectors.toList());

            entity.setMedicines(medicineList);
            DoctorPrescription saved = repository.save(entity);

            // Convert saved entity to DTO for response
            DoctorPrescriptionDTO responseDTO = new DoctorPrescriptionDTO();
            responseDTO.setPrescriptionId(saved.getPrescriptionId());
            responseDTO.setMedicines(saved.getMedicines().stream().map(m -> new MedicineDTO(
                m.getId(),
                m.getName(),
                m.getDose(),
                m.getDuration(),
                m.getNote(),
                m.getRemindWhen(),
                m.getTimes()
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
                        m.getId(), m.getName(), m.getDose(), m.getDuration(), m.getNote(), m.getRemindWhen(), m.getTimes()
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
                        m.getId(), m.getName(), m.getDose(), m.getDuration(), m.getNote(), m.getRemindWhen(), m.getTimes()
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
                        m.getId(), m.getName(), m.getDose(), m.getDuration(), m.getNote(), m.getRemindWhen(), m.getTimes()
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
    
 // DoctorPrescriptionServiceImpl.java

    @Override
    public Response searchMedicinesByName(String keyword) {
        List<DoctorPrescription> allPrescriptions = repository.findAll();

        List<Medicine> matchedMedicines = allPrescriptions.stream()
            .flatMap(prescription -> prescription.getMedicines().stream())
            .filter(m -> m.getName() != null && m.getName().toLowerCase().contains(keyword.toLowerCase()))
            .distinct() // optional: avoid exact duplicates
            .collect(Collectors.toList());

        if (matchedMedicines.isEmpty()) {
            return new Response(false, null, "No medicine found with name containing: " + keyword, 404);
        }

        return new Response(true, matchedMedicines, "Matching medicines found", 200);
    }


    @Override
    
    public Response deleteMedicineById(String medicineId) {
        try {
            List<DoctorPrescription> allPrescriptions = repository.findAll();

            for (DoctorPrescription prescription : allPrescriptions) {
                List<Medicine> medicines = prescription.getMedicines() != null 
                    ? new ArrayList<>(prescription.getMedicines()) 
                    : new ArrayList<>();

                boolean removed = medicines.removeIf(med -> 
                    med.getId() != null && med.getId().equals(medicineId));

                if (removed) {
                    prescription.setMedicines(medicines);
                    repository.save(prescription);
                    return new Response(true, null, "Medicine deleted successfully", HttpStatus.OK.value());
                }
            }
            return new Response(false, null, "Medicine not found", HttpStatus.NOT_FOUND.value());
        } catch (Exception e) {
            return new Response(false, null, "Error deleting medicine: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }
    }
