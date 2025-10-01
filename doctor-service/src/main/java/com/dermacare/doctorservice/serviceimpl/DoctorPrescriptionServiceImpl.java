package com.dermacare.doctorservice.serviceimpl;

import java.util.ArrayList;
import java.util.Comparator;
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
            // 1. Validate input
            if (dto == null || dto.getMedicines() == null || dto.getMedicines().isEmpty()) {
                return new Response(false, null,
                        "Prescription must have at least one medicine",
                        HttpStatus.BAD_REQUEST.value());
            }

            if (dto.getClinicId() == null || dto.getClinicId().isBlank()) {
                return new Response(false, null,
                        "Clinic ID is required",
                        HttpStatus.BAD_REQUEST.value());
            }

            // 2. Fetch existing prescription for this clinic
            List<DoctorPrescription> prescriptions = repository.findByClinicId(dto.getClinicId());
            DoctorPrescription entity = prescriptions.isEmpty()
                    ? new DoctorPrescription()
                    : prescriptions.get(0); // only one prescription per clinic

            entity.setClinicId(dto.getClinicId());

            List<Medicine> existingMedicines = Optional.ofNullable(entity.getMedicines())
                    .orElse(new ArrayList<>());

            boolean updatedExistingMedicine = false;
            boolean addedNewMedicine = false;

            // 3. Process incoming medicines
            for (MedicineDTO incomingMed : dto.getMedicines()) {
                if (incomingMed == null || incomingMed.getName() == null || incomingMed.getName().isBlank()) {
                    continue;
                }

                String normalizedName = incomingMed.getName().trim().replaceAll("\\s+", " ").toLowerCase();

                Optional<Medicine> existingMedOpt = existingMedicines.stream()
                        .filter(m -> m.getName() != null &&
                                m.getName().trim().replaceAll("\\s+", " ").toLowerCase().equals(normalizedName))
                        .findFirst();

                if (existingMedOpt.isPresent()) {
                    // Update existing medicine
                    Medicine existingMed = existingMedOpt.get();
                    existingMed.setDose(incomingMed.getDose());
                    existingMed.setDuration(incomingMed.getDuration());
                    existingMed.setDurationUnit(incomingMed.getDurationUnit());
                    existingMed.setNote(incomingMed.getNote());
                    existingMed.setFood(incomingMed.getFood());
                    existingMed.setMedicineType(incomingMed.getMedicineType());
                    existingMed.setRemindWhen(incomingMed.getRemindWhen());
                    existingMed.setTimes(incomingMed.getTimes());
                    existingMed.setOthers(incomingMed.getOthers());
                    existingMed.setSerialNumber(incomingMed.getSerialNumber());
                    existingMed.setGenericName(incomingMed.getGenericName());
                    existingMed.setBrandName(incomingMed.getBrandName());
                    existingMed.setNameAndAddressOfTheManufacturer(incomingMed.getNameAndAddressOfTheManufacturer());
                    existingMed.setBatchNumber(incomingMed.getBatchNumber());               
                    existingMed.setDateOfManufacturing(incomingMed.getDateOfManufacturing());               
                    existingMed.setDateOfExpriy(incomingMed.getDateOfExpriy());               
                    existingMed.setManufacturingLicenseNumber(incomingMed.getManufacturingLicenseNumber());               

                    updatedExistingMedicine = true;
                } else {
                    // Add new medicine
                    existingMedicines.add(new Medicine(
                            UUID.randomUUID().toString(),
                            incomingMed.getName().trim(),
                            incomingMed.getDose(),
                            incomingMed.getDuration(),
                            incomingMed.getDurationUnit(),
                            incomingMed.getNote(),
                            incomingMed.getFood(),
                            incomingMed.getMedicineType(),
                            incomingMed.getRemindWhen(),
                            incomingMed.getOthers(),
                            incomingMed.getTimes(),
                            incomingMed.getSerialNumber(),
                            incomingMed.getGenericName(),
                            incomingMed.getBrandName(),
                            incomingMed.getNameAndAddressOfTheManufacturer(),
                            incomingMed.getBatchNumber(),
                            incomingMed.getDateOfManufacturing(),
                            incomingMed.getDateOfExpriy(),
                            incomingMed.getManufacturingLicenseNumber()
                    ));
                    addedNewMedicine = true;
                }
            }

            // 4. Save prescription
            entity.setMedicines(existingMedicines);
            DoctorPrescription saved = repository.save(entity);

            // 5. Build response DTO
            DoctorPrescriptionDTO responseDTO = new DoctorPrescriptionDTO();
            responseDTO.setId(saved.getId());
            responseDTO.setClinicId(saved.getClinicId());
            responseDTO.setMedicines(saved.getMedicines().stream()
                    .map(m -> new MedicineDTO(
                            m.getId(),
                            m.getName(),
                            m.getDose(),
                            m.getDuration(),
                            m.getDurationUnit(),
                            m.getNote(),
                            m.getFood(),
                            m.getMedicineType(),
                            m.getRemindWhen(),
                            m.getTimes(),
                            m.getOthers(),
                            m.getSerialNumber(),
                            m.getGenericName(),
                            m.getBrandName(),
                            m.getNameAndAddressOfTheManufacturer(),
                            m.getBatchNumber(),
                            m.getDateOfManufacturing(),
                            m.getDateOfExpriy(),
                            m.getManufacturingLicenseNumber()
                    ))
                    .collect(Collectors.toList())
            );

            String finalMessage;
            if (updatedExistingMedicine && addedNewMedicine) {
                finalMessage = "Prescription updated with new and existing medicines";
            } else if (updatedExistingMedicine) {
                finalMessage = "Existing medicines updated successfully";
            } else if (addedNewMedicine) {
                finalMessage = "Prescription created successfully";
            } else {
                finalMessage = "No changes were made to the prescription";
            }

            return new Response(true, responseDTO, finalMessage, HttpStatus.CREATED.value());

        } catch (Exception e) {
            return new Response(false, null,
                    "Failed to create/update prescription: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    @Override
    public Response getAllPrescriptions() {
        try {
            List<DoctorPrescriptionDTO> dtos = repository.findAll().stream().map(p -> {
                DoctorPrescriptionDTO dto = new DoctorPrescriptionDTO();
                dto.setId(p.getId());
                dto.setClinicId(p.getClinicId());

                List<MedicineDTO> meds = Optional.ofNullable(p.getMedicines()).orElse(List.of()).stream()
                        .map(m -> new MedicineDTO(
                                m.getId(),
                                m.getName(),
                                m.getDose(),
                                m.getDuration(),
                                m.getDurationUnit(),
                                m.getNote(),
                                m.getFood(),
                                m.getMedicineType(),
                                m.getRemindWhen(),
                                m.getTimes(),
                                m.getOthers(),
                                m.getSerialNumber(),
                                m.getGenericName(),
                                m.getBrandName(),
                                m.getNameAndAddressOfTheManufacturer(),
                                m.getBatchNumber(),
                                m.getDateOfManufacturing(),
                                m.getDateOfExpriy(),
                                m.getManufacturingLicenseNumber()
                        ))
                        .collect(Collectors.toList());

                dto.setMedicines(meds);
                return dto;
            }).collect(Collectors.toList());

            return new Response(true, dtos, "Fetched all prescriptions successfully", HttpStatus.OK.value());

        } catch (Exception e) {
            return new Response(false, null, "Error fetching prescriptions: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
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
                dto.setClinicId(p.getClinicId());

                List<MedicineDTO> meds = Optional.ofNullable(p.getMedicines()).orElse(List.of()).stream()
                        .map(m -> new MedicineDTO(
                                m.getId(),
                                m.getName(),
                                m.getDose(),
                                m.getDuration(),
                                m.getDurationUnit(),
                                m.getNote(),
                                m.getFood(),
                                m.getMedicineType(),
                                m.getRemindWhen(),
                                m.getTimes(),
                                m.getOthers(),
                                m.getSerialNumber(),
                                m.getGenericName(),
                                m.getBrandName(),
                                m.getNameAndAddressOfTheManufacturer(),
                                m.getBatchNumber(),
                                m.getDateOfManufacturing(),
                                m.getDateOfExpriy(),
                                m.getManufacturingLicenseNumber()
                        ))
                        .collect(Collectors.toList());

                dto.setMedicines(meds);
                return new Response(true, dto, "Prescription found", HttpStatus.OK.value());
            } else {
                return new Response(false, null, "Prescription not found", HttpStatus.NOT_FOUND.value());
            }
        } catch (Exception e) {
            return new Response(false, null, "Error retrieving prescription: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
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
                        m.getId(),
                        m.getName(),
                        m.getDose(),
                        m.getDuration(),
                        m.getDurationUnit(),
                        m.getNote(),
                        m.getFood(),
                        m.getMedicineType(),
                        m.getRemindWhen(),
                        m.getTimes(),
                        m.getOthers(),
                        m.getSerialNumber(),
                        m.getGenericName(),
                        m.getBrandName(),
                        m.getNameAndAddressOfTheManufacturer(),
                        m.getBatchNumber(),
                        m.getDateOfManufacturing(),
                        m.getDateOfExpriy(),
                        m.getManufacturingLicenseNumber()
                )).collect(Collectors.toList());

                return new Response(true, dtos, "Medicine found", HttpStatus.OK.value());
            } else {
                return new Response(false, null, "No medicine found with given ID", HttpStatus.NOT_FOUND.value());
            }
        } catch (Exception e) {
            return new Response(false, null, "Error while fetching medicine: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
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
            return new Response(false, null, "Failed to delete: " + e.getMessage(),
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
            return new Response(false, null, "Error deleting medicine: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    @Override
    public Response searchMedicinesByName(String keyword) {
        try {
            if (keyword == null || keyword.trim().isEmpty()) {
                return new Response(false, null,
                        "Keyword must not be empty",
                        HttpStatus.BAD_REQUEST.value());
            }

            String normalizedKeyword = keyword.trim().replaceAll("\\s+", " ").toLowerCase();

            Optional<Medicine> latestMedicine = repository.findAll().stream()
                    .flatMap(p -> Optional.ofNullable(p.getMedicines()).orElse(List.of()).stream())
                    .filter(m -> m.getName() != null &&
                            m.getName().trim().replaceAll("\\s+", " ").toLowerCase().equals(normalizedKeyword))
                    .max(Comparator.comparing(Medicine::getId));

            if (latestMedicine.isEmpty()) {
                return new Response(false, null,
                        "No medicine found with exact name: " + keyword,
                        HttpStatus.NOT_FOUND.value());
            }

            Medicine m = latestMedicine.get();
            MedicineDTO dto = new MedicineDTO(
                    m.getId(),
                    m.getName(),
                    m.getDose(),
                    m.getDuration(),
                    m.getDurationUnit(),
                    m.getNote(),
                    m.getFood(),
                    m.getMedicineType(),
                    m.getRemindWhen(),
                    m.getTimes(),
                    m.getOthers(),
                    m.getSerialNumber(),
                    m.getGenericName(),
                    m.getBrandName(),
                    m.getNameAndAddressOfTheManufacturer(),
                    m.getBatchNumber(),
                    m.getDateOfManufacturing(),
                    m.getDateOfExpriy(),
                    m.getManufacturingLicenseNumber()
            );

            return new Response(true, List.of(dto), "Medicine found", HttpStatus.OK.value());

        } catch (Exception e) {
            return new Response(false, null,
                    "Error searching medicine: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
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
                                m.getId(),
                                m.getName(),
                                m.getDose(),
                                m.getDuration(),
                                m.getDurationUnit(),
                                m.getNote(),
                                m.getFood(),
                                m.getMedicineType(),
                                m.getRemindWhen(),
                                m.getTimes(),
                                m.getOthers(),
                                m.getSerialNumber(),
                                m.getGenericName(),
                                m.getBrandName(),
                                m.getNameAndAddressOfTheManufacturer(),
                                m.getBatchNumber(),
                                m.getDateOfManufacturing(),
                                m.getDateOfExpriy(),
                                m.getManufacturingLicenseNumber()
                        ))
                        .collect(Collectors.toList());

                dto.setMedicines(meds);
                return dto;
            }).collect(Collectors.toList());

            return new Response(true, dtos, "Prescriptions fetched successfully for clinicId: " + clinicId,
                    HttpStatus.OK.value());

        } catch (Exception e) {
            return new Response(false, null, "Error fetching prescriptions by clinicId: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }
}
