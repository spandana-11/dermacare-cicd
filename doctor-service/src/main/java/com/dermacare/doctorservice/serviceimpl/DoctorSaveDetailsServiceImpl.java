package com.dermacare.doctorservice.serviceimpl;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.dermacare.doctorservice.dermacaredoctorutils.VisitTypeUtil;
import com.dermacare.doctorservice.dto.BookingResponse;
import com.dermacare.doctorservice.dto.DatesDTO;
import com.dermacare.doctorservice.dto.DoctorSaveDetailsDTO;
import com.dermacare.doctorservice.dto.FollowUpDetailsDTO;
import com.dermacare.doctorservice.dto.MedicinesDTO;
import com.dermacare.doctorservice.dto.PrescriptionDetailsDTO;
import com.dermacare.doctorservice.dto.Response;
import com.dermacare.doctorservice.dto.SymptomDetailsDTO;
import com.dermacare.doctorservice.dto.TestDetailsDTO;
import com.dermacare.doctorservice.dto.TreatmentDetailsDTO;
import com.dermacare.doctorservice.dto.TreatmentResponseDTO;
import com.dermacare.doctorservice.feignclient.BookingFeignClient;
import com.dermacare.doctorservice.feignclient.ClinicAdminServiceClient;
import com.dermacare.doctorservice.model.Dates;
import com.dermacare.doctorservice.model.DoctorSaveDetails;
import com.dermacare.doctorservice.model.FollowUpDetails;
import com.dermacare.doctorservice.model.Medicines;
import com.dermacare.doctorservice.model.PrescriptionDetails;
import com.dermacare.doctorservice.model.SymptomDetails;
import com.dermacare.doctorservice.model.TestDetails;
import com.dermacare.doctorservice.model.TreatmentDetails;
import com.dermacare.doctorservice.model.TreatmentResponse;
import com.dermacare.doctorservice.repository.DoctorSaveDetailsRepository;
import com.dermacare.doctorservice.service.DoctorSaveDetailsService;
import com.fasterxml.jackson.databind.ObjectMapper;

import feign.FeignException;

@Service
public class DoctorSaveDetailsServiceImpl implements DoctorSaveDetailsService {

    @Autowired
    private DoctorSaveDetailsRepository repository;

    @Autowired
    private ClinicAdminServiceClient clinicAdminClient;

    @Autowired
    private ObjectMapper objectMapper;
   

    @Autowired
    private BookingFeignClient bookingFeignClient;

    @Override
    public Response saveDoctorDetails(DoctorSaveDetailsDTO dto) {
        try {
            // Step 1: Fetch doctor details from Clinic Admin service
            Response doctorResponse = clinicAdminClient.getDoctorById(dto.getDoctorId()).getBody();

            if (doctorResponse == null || !doctorResponse.isSuccess() || doctorResponse.getData() == null) {
                return buildResponse(false, null, "Doctor not found with ID: " + dto.getDoctorId(), HttpStatus.NOT_FOUND.value());
            }

            Map<String, Object> doctorData = objectMapper.convertValue(doctorResponse.getData(), Map.class);
            dto.setDoctorName((String) doctorData.get("doctorName"));

            String clinicId = dto.getClinicId() != null ? dto.getClinicId() : "";
            String clinicName = dto.getClinicName() != null ? dto.getClinicName() : "";

            dto.setClinicId(clinicId);
            dto.setClinicName(clinicName);

            List<DoctorSaveDetails> previousVisits = repository.findByPatientId(dto.getPatientId());

            boolean isRevisit = previousVisits.stream()
                .anyMatch(existing -> dto.getBookingId().equals(existing.getBookingId()));

            long uniqueBookingCount = previousVisits.stream()
                .map(DoctorSaveDetails::getBookingId)
                .filter(bid -> bid != null && !bid.isEmpty())
                .distinct()
                .count();

            int visitNumber = (int) uniqueBookingCount + (isRevisit ? 0 : 1);

            dto.setVisitDateTime(LocalDateTime.now());
            int visitTypeCount = (int) uniqueBookingCount + (isRevisit ? 0 : 1);
            dto.setVisitType(VisitTypeUtil.getVisitTypeFromCount(visitTypeCount));

            // Step 2: Save doctor details
            DoctorSaveDetails entity = convertToEntity(dto);
            DoctorSaveDetails saved = repository.save(entity);

            // Step 3: Update booking status to "In-Progress" via Feign
            BookingResponse bookingUpdate = new BookingResponse();
            bookingUpdate.setBookingId(dto.getBookingId());
            bookingUpdate.setStatus("In-Progress");

            bookingFeignClient.updateAppointment(bookingUpdate);

            DoctorSaveDetailsDTO savedDto = convertToDto(saved);

            return buildResponse(true, Map.of(
                    "savedDetails", savedDto,
                    "visitNumber", visitNumber
            ), "Doctor details saved successfully", HttpStatus.CREATED.value());

        } catch (FeignException e) {
            return buildResponse(false, null, "Error fetching doctor/booking details: " + e.getMessage(), HttpStatus.BAD_GATEWAY.value());
        } catch (Exception e) {
            return buildResponse(false, null, "Unexpected error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }
    @Override
    public Response getDoctorDetailsById(String id) {
        Optional<DoctorSaveDetails> optional = repository.findById(id);
        return optional.map(data -> buildResponse(true, data, "Doctor details found", HttpStatus.OK.value()))
                .orElseGet(() -> buildResponse(false, null, "Doctor details not found", HttpStatus.NOT_FOUND.value()));
    }

    @Override
    public Response updateDoctorDetails(String id, DoctorSaveDetailsDTO dto) {
        Optional<DoctorSaveDetails> optional = repository.findById(id);
        if (optional.isPresent()) {
            DoctorSaveDetails updated = convertToEntity(dto);
            updated.setId(id);
            DoctorSaveDetails saved = repository.save(updated);
            DoctorSaveDetailsDTO savedDto = convertToDto(saved);
            return buildResponse(true, savedDto, "Doctor details updated successfully", HttpStatus.OK.value());
        } else {
            return buildResponse(false, null, "Doctor details not found", HttpStatus.NOT_FOUND.value());
        }
    }

    @Override
    public Response deleteDoctorDetails(String id) {
        Optional<DoctorSaveDetails> optional = repository.findById(id);
        if (optional.isPresent()) {
            repository.deleteById(id);
            return buildResponse(true, null, "Doctor details deleted successfully", HttpStatus.OK.value());
        } else {
            return buildResponse(false, null, "Doctor details not found", HttpStatus.NOT_FOUND.value());
        }
    }

    @Override
    public Response getAllDoctorDetails() {
        List<DoctorSaveDetails> list = repository.findAll();
        return buildResponse(true, list, "All doctor details fetched", HttpStatus.OK.value());
    }

    @Override
    public Response getVisitHistoryByPatientAndBooking(String patientId, String bookingId) {
        try {
            List<DoctorSaveDetails> visits = repository.findByPatientIdAndBookingId(patientId, bookingId);

            if (visits.isEmpty()) {
                return buildResponse(false, null, "No visit history found for the given patient and booking ID", HttpStatus.NOT_FOUND.value());
            }

            visits.sort((v1, v2) -> v1.getVisitDateTime().compareTo(v2.getVisitDateTime()));

            return buildResponse(true, Map.of(
                "patientId", patientId,
                "bookingId", bookingId,
                "visitCount", visits.size(),
                "visits", visits
            ), "Visit history fetched successfully", HttpStatus.OK.value());

        } catch (Exception e) {
            return buildResponse(false, null, "Error fetching visit history: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    @Override
    public Response getVisitHistoryByPatient(String patientId) {
        try {
            List<DoctorSaveDetails> visits = repository.findByPatientId(patientId);

            if (visits.isEmpty()) {
                return buildResponse(false, null, "No visit history found for the patient ID", HttpStatus.NOT_FOUND.value());
            }

            visits.sort((v1, v2) -> {
                LocalDateTime dt1 = v1.getVisitDateTime();
                LocalDateTime dt2 = v2.getVisitDateTime();

                if (dt1 == null && dt2 == null) return 0;
                if (dt1 == null) return 1;
                if (dt2 == null) return -1;
                return dt1.compareTo(dt2);
            });

            return buildResponse(true, Map.of(
                "patientId", patientId,
                "totalVisits", visits.size(),
                "visitHistory", visits
            ), "All visit history fetched successfully", HttpStatus.OK.value());

        } catch (Exception e) {
            return buildResponse(false, null, "Error fetching visit history: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    private DoctorSaveDetails convertToEntity(DoctorSaveDetailsDTO dto) {
        return DoctorSaveDetails.builder()
                .id(dto.getId())
                .patientId(dto.getPatientId())
                .doctorId(dto.getDoctorId())
                .doctorName(dto.getDoctorName())
                .clinicId(dto.getClinicId())
                .clinicName(dto.getClinicName())
                .bookingId(dto.getBookingId())
                .symptoms(dto.getSymptoms() != null ?
                        SymptomDetails.builder()
                                .symptomDetails(dto.getSymptoms().getSymptomDetails())
                                .doctorObs(dto.getSymptoms().getDoctorObs())
                                .diagnosis(dto.getSymptoms().getDiagnosis())
                                .duration(dto.getSymptoms().getDuration())
                                .attachments(dto.getSymptoms().getAttachments() != null
                                ? dto.getSymptoms().getAttachments().stream()
                                      .map(this::decodeIfBase64)
                                      .collect(Collectors.toList())
                                : null)
                        .build()
                        : null
                        
)
                
                .prescriptionPdf(dto.getPrescriptionPdf() != null
                ? dto.getPrescriptionPdf()
                      .stream()
                      .map(this::decodeIfBase64) // same as attachments
                      .collect(Collectors.toList())
                : null
            )



                .tests(dto.getTests() != null ?
                        TestDetails.builder()
                                .selectedTests(dto.getTests().getSelectedTests())
                                .testReason(dto.getTests().getTestReason())
                                .build()
                        : null
                )
                .treatments(dto.getTreatments() != null && dto.getTreatments().getGeneratedData() != null ?
                        TreatmentResponse.builder()
                                .selectedTestTreatment(dto.getTreatments().getSelectedTestTreatment())
                                .generatedData(dto.getTreatments().getGeneratedData().entrySet().stream()
                                        .collect(Collectors.toMap(
                                                e -> e.getKey(),
                                                e -> TreatmentDetails.builder()
                                                        .dates(e.getValue().getDates() != null ?
                                                                e.getValue().getDates().stream()
                                                                        .map(d -> Dates.builder()
                                                                                .date(d.getDate())
                                                                                .sitting(d.getSitting())
                                                                                .build())
                                                                        .collect(Collectors.toList())
                                                                : null)
                                                        .reason(e.getValue().getReason())
                                                        .frequency(e.getValue().getFrequency())
                                                        .sittings(e.getValue().getSittings())
                                                        .startDate(e.getValue().getStartDate())
                                                        .build()
                                        )))
                                .build()
                        : null
                )
                .followUp(dto.getFollowUp() != null ?
                        FollowUpDetails.builder()
                                .durationValue(dto.getFollowUp().getDurationValue())
                                .durationUnit(dto.getFollowUp().getDurationUnit())
                                .nextFollowUpDate(dto.getFollowUp().getNextFollowUpDate())
                                .followUpNote(dto.getFollowUp().getFollowUpNote())
                                .build()
                        : null
                )
                .prescription(dto.getPrescription() != null ?
                        PrescriptionDetails.builder()
                                .medicines(dto.getPrescription().getMedicines() != null ?
                                        dto.getPrescription().getMedicines().stream()
                                                .map(med -> Medicines.builder()
                                                        .id(UUID.randomUUID())
                                                        .name(med.getName())
                                                        .dose(med.getDose())
                                                        .duration(med.getDuration())
                                                        .food(med.getFood())
                                                        .note(med.getNote())
                                                        .remindWhen(med.getRemindWhen())
                                                        .times(med.getTimes())
                                                        .build())
                                                .collect(Collectors.toList())
                                        : null)
                                .build()
                        : null
                )
                .visitType(dto.getVisitType())
                .visitDateTime(dto.getVisitDateTime())
                .build();
    }

    private String decodeIfBase64(String base64String) {
        if (base64String == null || base64String.trim().isEmpty()) {
            return base64String; // return as is if null or empty
        }
        try {
            // Try decoding just to validate format
            Base64.getDecoder().decode(base64String);
            return base64String; // It's valid Base64, return as is without converting to text
        } catch (IllegalArgumentException e) {
            // Not valid Base64, return original
            return base64String;
        }
    }




    private DoctorSaveDetailsDTO convertToDto(DoctorSaveDetails entity) {
        return DoctorSaveDetailsDTO.builder()
                .id(entity.getId())
                .patientId(entity.getPatientId())
                .doctorId(entity.getDoctorId())
                .doctorName(entity.getDoctorName())
                .clinicId(entity.getClinicId())
                .clinicName(entity.getClinicName())
                .bookingId(entity.getBookingId())
                .symptoms(entity.getSymptoms() != null ?
                        SymptomDetailsDTO.builder()
                                .symptomDetails(entity.getSymptoms().getSymptomDetails())
                                .doctorObs(entity.getSymptoms().getDoctorObs())
                                .diagnosis(entity.getSymptoms().getDiagnosis())
                                .duration(entity.getSymptoms().getDuration())
                                .attachments(entity.getSymptoms().getAttachments() != null
                                ? entity.getSymptoms().getAttachments().stream()
                                      .map(this::encodeIfNotBase64)
                                      .collect(Collectors.toList())
                                : null)
                        .build()
                        : null)

                .prescriptionPdf(entity.getPrescriptionPdf() != null
                ? entity.getPrescriptionPdf()
                      .stream()
                      .map(this::encodeIfNotBase64) // same as attachments
                      .collect(Collectors.toList())
                : null
            )


              
                .tests(entity.getTests() != null ?
                        TestDetailsDTO.builder()
                                .selectedTests(entity.getTests().getSelectedTests())
                                .testReason(entity.getTests().getTestReason())
                                .build()
                        : null)

                .treatments(entity.getTreatments() != null && entity.getTreatments().getGeneratedData() != null ?
                        TreatmentResponseDTO.builder()
                                .selectedTestTreatment(entity.getTreatments().getSelectedTestTreatment())
                                .generatedData(entity.getTreatments().getGeneratedData().entrySet().stream()
                                        .collect(Collectors.toMap(
                                                Map.Entry::getKey,
                                                e -> TreatmentDetailsDTO.builder()
                                                        .dates(e.getValue().getDates() != null ?
                                                                e.getValue().getDates().stream()
                                                                        .map(d -> DatesDTO.builder()
                                                                                .date(d.getDate())
                                                                                .sitting(d.getSitting())
                                                                                .build())
                                                                        .collect(Collectors.toList())
                                                                : null)
                                                        .reason(e.getValue().getReason())
                                                        .frequency(e.getValue().getFrequency())
                                                        .sittings(e.getValue().getSittings())
                                                        .startDate(e.getValue().getStartDate())
                                                        .build()
                                        )))
                                .build()
                        : null)

                .followUp(entity.getFollowUp() != null ?
                        FollowUpDetailsDTO.builder()
                                .durationValue(entity.getFollowUp().getDurationValue())
                                .durationUnit(entity.getFollowUp().getDurationUnit())
                                .nextFollowUpDate(entity.getFollowUp().getNextFollowUpDate())
                                .followUpNote(entity.getFollowUp().getFollowUpNote())
                                .build()
                        : null)

                .prescription(entity.getPrescription() != null ?
                        PrescriptionDetailsDTO.builder()
                                .medicines(entity.getPrescription().getMedicines() != null ?
                                        entity.getPrescription().getMedicines().stream()
                                                .map(med -> MedicinesDTO.builder()
                                                        .id(med.getId().toString())
                                                        .name(med.getName())
                                                        .dose(med.getDose())
                                                        .duration(med.getDuration())
                                                        .food(med.getFood())
                                                        .note(med.getNote())
                                                        .remindWhen(med.getRemindWhen())
                                                        .times(med.getTimes())
                                                        .build())
                                                .collect(Collectors.toList())
                                        : null)
                                .build()
                        : null)

                .visitType(entity.getVisitType())
                .visitDateTime(entity.getVisitDateTime())
                .build();
    }

    private String encodeIfNotBase64(String input) {
        if (input == null || input.isBlank()) {
            return input; // Null or empty, return as-is
        }

        // Base64 pattern: length multiple of 4, only A-Z a-z 0-9 + /, with optional padding "="
        String base64Pattern = "^[A-Za-z0-9+/]*={0,2}$";

        if (input.matches(base64Pattern) && (input.length() % 4 == 0)) {
            try {
                Base64.getDecoder().decode(input); // Validate decoding works
                return input; // Already Base64
            } catch (IllegalArgumentException e) {
                // Not valid Base64 despite matching pattern — will encode below
            }
        }

        // Encode if not valid Base64
        return Base64.getEncoder().encodeToString(input.getBytes(StandardCharsets.UTF_8));
    }




    // Builds standard Response object
    private Response buildResponse(boolean success, Object data, String message, int status) {
        return Response.builder()
                .success(success)
                .data(data)
                .message(message)
                .status(status)
                .build();
    }
    @Override
    public Response getVisitHistoryByPatientAndDoctor(String patientId, String doctorId) {
        try {
            List<DoctorSaveDetails> visits = repository.findByPatientId(patientId);

            if (visits.isEmpty()) {
                return buildResponse(false, null, "No visit history found for the patient ID", HttpStatus.NOT_FOUND.value());
            }

            // If doctorId is provided, filter visits by doctorId
            if (doctorId != null && !doctorId.isBlank()) {
                visits = visits.stream()
                        .filter(v -> doctorId.equals(v.getDoctorId()))
                        .collect(Collectors.toList());

                if (visits.isEmpty()) {
                    return buildResponse(false, null, "No visit history found for the patient with the specified doctor ID", HttpStatus.NOT_FOUND.value());
                }
            }

            // Sort visits by visitDateTime ascending
            visits.sort((v1, v2) -> {
                LocalDateTime dt1 = v1.getVisitDateTime();
                LocalDateTime dt2 = v2.getVisitDateTime();

                if (dt1 == null && dt2 == null) return 0;
                if (dt1 == null) return 1;
                if (dt2 == null) return -1;
                return dt1.compareTo(dt2);
            });

            return buildResponse(true, Map.of(
                "patientId", patientId,
                "doctorId", doctorId,
                "totalVisits", visits.size(),
                "visitHistory", visits
            ), "Visit history fetched successfully", HttpStatus.OK.value());

        } catch (Exception e) {
            return buildResponse(false, null, "Error fetching visit history: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }
    private String decodeAndSavePdf(String base64Pdf, String bookingId) {
        try {
            // Decode Base64
            byte[] pdfBytes = Base64.getDecoder().decode(base64Pdf);

            // Define file storage path (can be configured)
            String fileName = "prescription_" + bookingId + "_" + System.currentTimeMillis() + ".pdf";
            String storageDir = "/path/to/prescriptions"; // Change to your actual folder
            java.nio.file.Path dirPath = java.nio.file.Paths.get(storageDir);
            if (!java.nio.file.Files.exists(dirPath)) {
                java.nio.file.Files.createDirectories(dirPath);
            }

            // Save file
            java.nio.file.Path filePath = dirPath.resolve(fileName);
            java.nio.file.Files.write(filePath, pdfBytes);

            // Return stored file path (or a URL if serving via API)
            return filePath.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to decode and save PDF", e);
        }
    }
    private String encodePdfToBase64(String filePath) {
        try {
            byte[] pdfBytes = java.nio.file.Files.readAllBytes(java.nio.file.Paths.get(filePath));
            return Base64.getEncoder().encodeToString(pdfBytes);
        } catch (Exception e) {
            throw new RuntimeException("Failed to encode PDF to Base64", e);
        }
    }


}
