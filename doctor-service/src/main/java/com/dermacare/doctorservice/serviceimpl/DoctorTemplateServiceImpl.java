package com.dermacare.doctorservice.serviceimpl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.dermacare.doctorservice.dto.DoctorTemplateDTO;
import com.dermacare.doctorservice.dto.Response;
import com.dermacare.doctorservice.model.DoctorTemplate;
import com.dermacare.doctorservice.model.FollowUpDetails;
import com.dermacare.doctorservice.model.Medicines;
import com.dermacare.doctorservice.model.PrescriptionDetails;
import com.dermacare.doctorservice.model.SymptomDetails;
import com.dermacare.doctorservice.model.TestDetails;
import com.dermacare.doctorservice.model.TreatmentDetails;
import com.dermacare.doctorservice.repository.DoctorTemplateRepository;
import com.dermacare.doctorservice.service.DoctorTemplateService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DoctorTemplateServiceImpl implements DoctorTemplateService {

    private final DoctorTemplateRepository repository;

    @Override
    public Response createTemplate(DoctorTemplateDTO dto) {
        try {
            String normalizedTitle = dto.getTitle().trim().replaceAll("\\s+", " ").toLowerCase();

            boolean exists = repository.findAll().stream()
                .anyMatch(t -> t.getTitle() != null &&
                        t.getTitle().trim().replaceAll("\\s+", " ").toLowerCase().equals(normalizedTitle));

            if (exists) {
                return Response.builder()
                        .success(false)
                        .status(HttpStatus.CONFLICT.value())
                        .message("A template with this title already exists")
                        .data(null)
                        .build();
            }

            DoctorTemplate savedTemplate = repository.save(convertToEntity(dto));
            return Response.builder()
                    .success(true)
                    .status(HttpStatus.CREATED.value())
                    .message("Doctor template created successfully")
                    .data(savedTemplate)
                    .build();

        } catch (Exception e) {
            return Response.builder()
                    .success(false)
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Failed to create doctor template: " + e.getMessage())
                    .data(null)
                    .build();
        }
    }


    @Override
    public Response getTemplateById(String id) {
        Optional<DoctorTemplate> template = repository.findById(id);
        if (template.isPresent()) {
            DoctorTemplateDTO dto = convertToDto(template.get());
            return Response.builder()
                    .success(true)
                    .status(HttpStatus.OK.value())
                    .message("Doctor template found")
                    .data(dto)
                    .build();
        } else {
            return Response.builder()
                    .success(false)
                    .status(HttpStatus.NOT_FOUND.value())
                    .message("Doctor template not found with ID: " + id)
                    .data(null)
                    .build();
        }
    }


    @Override
    public Response getAllTemplates() {
        List<DoctorTemplate> templates = repository.findAll();
        List<DoctorTemplateDTO> dtos = templates.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return Response.builder()
                .success(true)
                .status(HttpStatus.OK.value())
                .message("All doctor templates fetched successfully")
                .data(dtos)
                .build();
    }


    @Override
    public Response deleteTemplate(String id) {
        Optional<DoctorTemplate> existing = repository.findById(id);
        if (existing.isPresent()) {
            repository.deleteById(id);
            return Response.builder()
                    .success(true)
                    .status(HttpStatus.OK.value())
                    .message("Doctor template deleted successfully")
                    .data(null)
                    .build();
        } else {
            return Response.builder()
                    .success(false)
                    .status(HttpStatus.NOT_FOUND.value())
                    .message("Doctor template not found with ID: " + id)
                    .data(null)
                    .build();
        }
    }

    private DoctorTemplate convertToEntity(DoctorTemplateDTO dto) {
        return DoctorTemplate.builder()
                .title(dto.getTitle())
                .createdAt(LocalDateTime.now())

                // Mapping symptoms
                .symptoms(dto.getSymptoms() != null
                        ? SymptomDetails.builder()
                            .symptomDetails(dto.getSymptoms().getSymptomDetails())
                            .doctorObs(dto.getSymptoms().getDoctorObs())
                            .diagnosis(dto.getSymptoms().getDiagnosis())
                            .duration(dto.getSymptoms().getDuration())
                            .reports(dto.getSymptoms().getReports()) // ✅ Use dto instead of entity
                            .build()
                        : null)

                // Mapping tests
                .tests(dto.getTests() != null
                        ? TestDetails.builder()
                            .selectedTests(dto.getTests().getSelectedTests())
                            .testReason(dto.getTests().getTestReason())
                            .build()
                        : null)

                // Mapping treatments
                .treatments(dto.getTreatments() != null
                        ? TreatmentDetails.builder()
                            .selectedTreatments(dto.getTreatments().getSelectedTreatments())
                            .treatmentReason(dto.getTreatments().getTreatmentReason())
                            .build()
                        : null)

                // Mapping follow-up
                .followUp(dto.getFollowUp() != null
                        ? FollowUpDetails.builder()
                            .durationValue(dto.getFollowUp().getDurationValue())
                            .durationUnit(dto.getFollowUp().getDurationUnit())
                            .nextFollowUpDate(dto.getFollowUp().getNextFollowUpDate())
                            .followUpnote(dto.getFollowUp().getFollowUpnote())
                            .build()
                        : null)

                // Mapping prescription
                .prescription(dto.getPrescription() != null
                        ? PrescriptionDetails.builder()
                            .medicines(dto.getPrescription().getMedicines() != null
                                    ? dto.getPrescription().getMedicines().stream()
                                        .map(m -> Medicines.builder()
                                                .id(m.getId() != null && !m.getId().isEmpty()
                                                        ? UUID.fromString(m.getId())
                                                        : UUID.randomUUID())
                                                .name(m.getName())
                                                .dose(m.getDose())
                                                .duration(m.getDuration())
                                                .note(m.getNote())
                                                .food(m.getFood())
                                                .remindWhen(m.getRemindWhen())
                                                .times(m.getTimes())
                                                .build())
                                        .collect(Collectors.toList())
                                    : new ArrayList<>())
                            .build()
                        : null)

                .build();
    }




    @Override
    public ResponseEntity<Response> updateTemplate(String id, DoctorTemplateDTO dto) {
        Optional<DoctorTemplate> existingTemplate = repository.findById(id);

        if (existingTemplate.isPresent()) {
            String newTitleNormalized = dto.getTitle().trim().replaceAll("\\s+", " ").toLowerCase();

            // Check if title is changed
            String currentTitleNormalized = existingTemplate.get().getTitle().trim().replaceAll("\\s+", " ").toLowerCase();

            if (!newTitleNormalized.equals(currentTitleNormalized)) {
                // Title is being changed, check if it's already taken
                boolean titleExists = repository.findAll().stream()
                    .anyMatch(t -> !t.getId().equals(id) && t.getTitle() != null &&
                            t.getTitle().trim().replaceAll("\\s+", " ").toLowerCase().equals(newTitleNormalized));

                if (titleExists) {
                    Response conflictResponse = Response.builder()
                            .success(false)
                            .status(HttpStatus.CONFLICT.value())
                            .message("Another template already exists with the new title")
                            .data(null)
                            .build();
                    return ResponseEntity.status(HttpStatus.CONFLICT).body(conflictResponse);
                }
            }

            // Update entity
            DoctorTemplate updatedEntity = convertToEntity(dto);
            updatedEntity.setId(id);  // keep same ID
            updatedEntity.setCreatedAt(existingTemplate.get().getCreatedAt()); // preserve original creation time

            DoctorTemplate saved = repository.save(updatedEntity);

            Response response = Response.builder()
                    .success(true)
                    .status(HttpStatus.OK.value())
                    .message("Doctor template updated successfully")
                    .data(saved)
                    .build();
            return ResponseEntity.ok(response);
        } else {
            Response response = Response.builder()
                    .success(false)
                    .status(HttpStatus.NOT_FOUND.value())
                    .message("Doctor template not found with ID: " + id)
                    .data(null)
                    .build();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @Override
    public Response searchTemplatesByTitle(String keyword) {
        try {
            if (keyword == null || keyword.trim().isEmpty()) {
                return Response.builder()
                        .success(false)
                        .status(HttpStatus.BAD_REQUEST.value())
                        .message("Keyword must not be empty")
                        .data(null)
                        .build();
            }

            String normalizedKeyword = keyword.trim().replaceAll("\\s+", " ").toLowerCase();

            List<DoctorTemplate> allTemplates = repository.findAll();
            List<DoctorTemplate> filtered = allTemplates.stream()
                .filter(t -> {
                    String keywordLower = normalizedKeyword;

                    // ✅ Title: exact match only
                    boolean inTitle = t.getTitle() != null &&
                            t.getTitle().trim().replaceAll("\\s+", " ").toLowerCase().equals(keywordLower);

                    // 🔁 Other fields (optional: you can also change these to exact match if needed)
                    boolean inSymptoms = t.getSymptoms() != null &&
                            (
                                    (t.getSymptoms().getSymptomDetails() != null &&
                                            t.getSymptoms().getSymptomDetails().toLowerCase().contains(keywordLower)) ||
                                    (t.getSymptoms().getDiagnosis() != null &&
                                            t.getSymptoms().getDiagnosis().toLowerCase().contains(keywordLower)) ||
                                    (t.getSymptoms().getDoctorObs() != null &&
                                            t.getSymptoms().getDoctorObs().toLowerCase().contains(keywordLower))
                            );

                    boolean inTests = t.getTests() != null &&
                            t.getTests().getSelectedTests() != null &&
                            t.getTests().getSelectedTests().stream()
                                    .anyMatch(test -> test != null && test.toLowerCase().contains(keywordLower));

                    boolean inTreatments = t.getTreatments() != null &&
                            t.getTreatments().getSelectedTreatments() != null &&
                            t.getTreatments().getSelectedTreatments().stream()
                                    .anyMatch(treatment -> treatment != null && treatment.toLowerCase().contains(keywordLower));

                    boolean inMedicines = t.getPrescription() != null &&
                            t.getPrescription().getMedicines() != null &&
                            t.getPrescription().getMedicines().stream()
                                    .anyMatch(med -> med.getName() != null &&
                                            med.getName().toLowerCase().contains(keywordLower));

                    // ✅ Match only on exact title
                    return inTitle;
                })
                .collect(Collectors.toList());

            if (filtered.isEmpty()) {
                return Response.builder()
                        .success(false)
                        .status(HttpStatus.NOT_FOUND.value())
                        .message("No templates found with exact title: " + keyword)
                        .data(null)
                        .build();
            }

            return Response.builder()
                    .success(true)
                    .status(HttpStatus.OK.value())
                    .message("Matching templates found")
                    .data(filtered)
                    .build();

        } catch (Exception e) {
            return Response.builder()
                    .success(false)
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Error during template search: " + e.getMessage())
                    .data(null)
                    .build();
        }
    }
    
    private DoctorTemplateDTO convertToDto(DoctorTemplate entity) {
        return DoctorTemplateDTO.builder()
                .title(entity.getTitle())

                .symptoms(entity.getSymptoms() != null ? 
                    com.dermacare.doctorservice.dto.SymptomDetailsDTO.builder()
                        .symptomDetails(entity.getSymptoms().getSymptomDetails())
                        .doctorObs(entity.getSymptoms().getDoctorObs())
                        .diagnosis(entity.getSymptoms().getDiagnosis())
                        .duration(entity.getSymptoms().getDuration())
                        .reports(entity.getSymptoms().getReports()) // ✅ No Base64 encoding
                        .build()
                    : null)

                .tests(entity.getTests() != null ?
                    com.dermacare.doctorservice.dto.TestDetailsDTO.builder()
                        .selectedTests(entity.getTests().getSelectedTests())
                        .testReason(entity.getTests().getTestReason())
                        .build()
                    : null)

                .treatments(entity.getTreatments() != null ?
                    com.dermacare.doctorservice.dto.TreatmentDetailsDTO.builder()
                        .selectedTreatments(entity.getTreatments().getSelectedTreatments())
                        .treatmentReason(entity.getTreatments().getTreatmentReason())
                        .build()
                    : null)

                .followUp(entity.getFollowUp() != null ?
                    com.dermacare.doctorservice.dto.FollowUpDetailsDTO.builder()
                        .durationValue(entity.getFollowUp().getDurationValue())
                        .durationUnit(entity.getFollowUp().getDurationUnit())
                        .nextFollowUpDate(entity.getFollowUp().getNextFollowUpDate())
                        .followUpnote(entity.getFollowUp().getFollowUpnote())
                        .build()
                    : null)

                .prescription(entity.getPrescription() != null ?
                    com.dermacare.doctorservice.dto.PrescriptionDetailsDTO.builder()
                        .medicines(entity.getPrescription().getMedicines().stream()
                            .map(med -> com.dermacare.doctorservice.dto.MedicinesDTO.builder()
                                    .id(med.getId() != null ? med.getId().toString() : null)
                                    .name(med.getName())
                                    .dose(med.getDose())
                                    .duration(med.getDuration())
                                    .note(med.getNote())
                                    .food(med.getFood())
                                    .remindWhen(med.getRemindWhen())
                                    .times(med.getTimes())
                                    .build())
                            .collect(Collectors.toList()))
                        .build()
                    : null)

                .build();
    }




}