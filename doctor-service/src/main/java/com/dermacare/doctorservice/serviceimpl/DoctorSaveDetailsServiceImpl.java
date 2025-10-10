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
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.dermacare.doctorservice.dermacaredoctorutils.VisitTypeUtil;
import com.dermacare.doctorservice.dto.BookingResponse;
import com.dermacare.doctorservice.dto.DatesDTO;
import com.dermacare.doctorservice.dto.DoctorSaveDetailsDTO;
import com.dermacare.doctorservice.dto.FollowUpDetailsDTO;
import com.dermacare.doctorservice.dto.MedicinesDTO;
import com.dermacare.doctorservice.dto.PrescriptionDetailsDTO;
import com.dermacare.doctorservice.dto.Response;
import com.dermacare.doctorservice.dto.ResponseStructure;
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
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

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
            // ----------------------- Step 0: Validate Booking ID -----------------------
            if (dto.getBookingId() == null || dto.getBookingId().isBlank()) {
                return buildResponse(false, null,
                        "Booking ID must not be null or empty",
                        HttpStatus.BAD_REQUEST.value());
            }

            // ----------------------- Step 1: Validate Booking -----------------------
            ResponseEntity<ResponseStructure<BookingResponse>> bookingEntity =
                    bookingFeignClient.getBookedService(dto.getBookingId());

            if (bookingEntity == null || bookingEntity.getBody() == null) {
                return buildResponse(false, null,
                        "Unable to fetch booking details. Booking service returned null.",
                        HttpStatus.BAD_GATEWAY.value());
            }

            ResponseStructure<BookingResponse> bookingResponse = bookingEntity.getBody();

            BookingResponse bookingData = bookingResponse.getData();
            if (bookingData == null) {
                return buildResponse(false, null,
                        "Booking not found with ID: " + dto.getBookingId(),
                        HttpStatus.NOT_FOUND.value());
            }

            // ----------------------- Step 2: Validate Doctor -----------------------
            Response doctorResponse = clinicAdminClient.getDoctorById(dto.getDoctorId()).getBody();
            if (doctorResponse == null || !doctorResponse.isSuccess() || doctorResponse.getData() == null) {
                return buildResponse(false, null,
                        "Doctor not found with ID: " + dto.getDoctorId(),
                        HttpStatus.NOT_FOUND.value());
            }

            Map<String, Object> doctorData = objectMapper.convertValue(doctorResponse.getData(), Map.class);
            dto.setDoctorName((String) doctorData.get("doctorName"));

            // ----------------------- Step 3: Ensure clinic info safe -----------------------
            dto.setClinicId(dto.getClinicId() != null ? dto.getClinicId() : "");
            dto.setClinicName(dto.getClinicName() != null ? dto.getClinicName() : "");

            // ----------------------- Step 4: Calculate Visit Count -----------------------
            // 🔥 Core logic: doctorId + patientId + subServiceId
            List<DoctorSaveDetails> previousVisits =
                    repository.findByDoctorIdAndPatientIdAndSubServiceId(
                            dto.getDoctorId(),
                            dto.getPatientId(),
                            dto.getSubServiceId()
                    );

            int visitCount = (previousVisits != null && !previousVisits.isEmpty())
                    ? previousVisits.size() + 1
                    : 1;

            dto.setVisitDateTime(LocalDateTime.now());
            dto.setVisitType(VisitTypeUtil.getVisitTypeFromCount(visitCount));
            dto.setVisitCount(visitCount);

            // ----------------------- Step 5: Save Entity -----------------------
            DoctorSaveDetails entity = convertToEntity(dto);
            entity.setVisitCount(visitCount);
            DoctorSaveDetails saved = repository.save(entity);

            // ----------------------- Step 6: Update Booking -----------------------
            bookingData.setStatus("In-Progress");

            if (!"FIRST_VISIT".equalsIgnoreCase(saved.getVisitType())
                    && bookingData.getFreeFollowUpsLeft() != null) {
                Integer left = bookingData.getFreeFollowUpsLeft();
                if (left > 0) {
                    left = left - 1;
                    bookingData.setFreeFollowUpsLeft(left);
                }
                if (left == 0) {
                    bookingData.setStatus("Completed");
                }
            }

            bookingFeignClient.updateAppointment(bookingData);

            // ----------------------- Step 7: Build Response -----------------------
            DoctorSaveDetailsDTO savedDto = convertToDto(saved);

            return buildResponse(true,
                    Map.of(
                            "savedDetails", savedDto,
                            "visitNumber", visitCount,
                            "subServiceId", dto.getSubServiceId()
                    ),
                    "Doctor details saved successfully",
                    HttpStatus.CREATED.value());

        } catch (FeignException e) {
            // Proper Feign exception message from Booking Service
            String errorMessage = e.contentUTF8();
            return buildResponse(false, null,
                    "Booking Service Error: " + (errorMessage != null ? errorMessage : e.getMessage()),
                    HttpStatus.BAD_GATEWAY.value());
        } catch (Exception e) {
            return buildResponse(false, null,
                    "Unexpected error: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
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
                .customerId(dto.getCustomerId())
                .bookingId(dto.getBookingId())
                .subServiceId(dto.getSubServiceId())
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
                      .map(this::decodeIfBase64) 
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
                                                        .durationUnit(med.getDurationUnit())                                                        .food(med.getFood())
                                                        .medicineType(med.getMedicineType()) 
                                                        .note(med.getNote())
                                                        .remindWhen(med.getRemindWhen())
                                                        .times(med.getTimes())
                                                        .others(med.getOthers())
                                                        .build())
                                                .collect(Collectors.toList())
                                        : null)
                                .build()
                        : null
                )

                .visitType(dto.getVisitType())
                .visitDateTime(dto.getVisitDateTime())
                .visitCount(dto.getVisitCount())
                .prescriptionPdf(dto.getPrescriptionPdf())
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
            // Not valid Base64, return origina
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
                .customerId(entity.getCustomerId())
                .bookingId(entity.getBookingId())
                .subServiceId(entity.getSubServiceId())
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
                                                        .durationUnit(med.getDurationUnit())
                                                        .food(med.getFood())
                                                        .medicineType(med.getMedicineType())
                                                        .note(med.getNote())
                                                        .remindWhen(med.getRemindWhen())
                                                        .times(med.getTimes())
                                                        .others(med.getOthers())
                                                        .build())
                                                .collect(Collectors.toList())
                                        : null)
                                .build()
                        : null)

                .visitType(entity.getVisitType())
                .visitDateTime(entity.getVisitDateTime())
                .visitCount(entity.getVisitCount())
                .build();
    }

    private String encodeIfNotBase64(String input) {
        if (input == null || input.isBlank()) {
            return input; 
        }

       
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
                return buildResponse(true, null, "No visit history found for the patient ID", HttpStatus.OK.value());
            }

            if (doctorId != null && !doctorId.isBlank()) {
                visits = visits.stream()
                        .filter(v -> doctorId.equals(v.getDoctorId()))
                        .collect(Collectors.toList());

                if (visits.isEmpty()) {
                    return buildResponse(true, null, "No visit history found for the patient with the specified doctor ID", HttpStatus.OK.value());
                }
            }

            // Sort latest first
            visits.sort((v1, v2) -> {
                LocalDateTime dt1 = v1.getVisitDateTime();
                LocalDateTime dt2 = v2.getVisitDateTime();

                if (dt1 == null && dt2 == null) return 0;
                if (dt1 == null) return 1;
                if (dt2 == null) return -1;
                return dt2.compareTo(dt1); // descending
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
    @Override
    public Response getInProgressDetails(String patientId, String bookingId) {
        try {
            // 1. Fetch booking from Booking Service
            ResponseEntity<ResponseStructure<BookingResponse>> bookingResponseEntity =
                    bookingFeignClient.getBookedService(bookingId);

            if (bookingResponseEntity == null || bookingResponseEntity.getBody() == null) {
                return buildResponse(false, null,
                        "Booking not found for ID " + bookingId,
                        HttpStatus.NOT_FOUND.value());
            }

            BookingResponse booking = bookingResponseEntity.getBody().getData();

            // 2. Validate status
            if (!"In-Progress".equalsIgnoreCase(booking.getStatus())) {
                return buildResponse(false, null,
                        "Booking is not In-Progress. Current status: " + booking.getStatus(),
                        HttpStatus.BAD_REQUEST.value());
            }

            // 3. Fetch doctor details saved in your DB
            List<DoctorSaveDetails> visits = repository.findByPatientIdAndBookingId(patientId, bookingId);

            if (visits.isEmpty()) {
                return buildResponse(false, null,
                        "No doctor details found for patient " + patientId + " and booking " + bookingId,
                        HttpStatus.NOT_FOUND.value());
            }

            List<DoctorSaveDetailsDTO> dtos = visits.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());

            // 4. Build success response
            return buildResponse(true, Map.of(
                    "patientId", patientId,
                    "bookingId", bookingId,
                    "status", booking.getStatus(),
                    "savedDetails", dtos
            ), "In-Progress doctor details fetched successfully", HttpStatus.OK.value());

        } catch (Exception e) {
            return buildResponse(false, null,
                    "Error fetching in-progress details: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }
    
    
    @Override
    public Response getDoctorDetailsByBookingId(String bookingId) {
    	try {
        DoctorSaveDetails optional = repository.findByBookingId(bookingId);
        if(optional != null) {
        	ObjectMapper mapper = new ObjectMapper();
	        mapper.registerModule(new JavaTimeModule());
	        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return new Response(true,mapper.convertValue(optional,DoctorSaveDetailsDTO.class ), "prescription details found", HttpStatus.OK.value());
        }else {
        return new Response(false, null, "prescription details Not found", HttpStatus.NOT_FOUND.value());
        }}catch(Exception e) {
        	 return new Response(false, null,e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }
    
    @Override
    public Response getDoctorDetailsByCustomerId(String customerId) {
    	try {
       List<DoctorSaveDetails> optional = repository.findByCustomerId(customerId);
        if(optional != null && !optional.isEmpty()) {
        	ObjectMapper mapper = new ObjectMapper();
	        mapper.registerModule(new JavaTimeModule());
	        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return new Response(true,mapper.convertValue(optional,new TypeReference<List<DoctorSaveDetailsDTO>>(){}), "prescription details found", HttpStatus.OK.value());
        }else {
        return new Response(false, null, "prescription details Not found", HttpStatus.NOT_FOUND.value());
        }}catch(Exception e) {
        	 return new Response(false, null,e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }
    private String extractErrorMessage(FeignException e) {
        try {
            String body = e.contentUTF8();
            if (body != null && !body.isEmpty()) {
                // Parse Booking Service JSON: {"timestamp":"...","status":500,"error":"Internal Server Error","message":"Invalid Booking Id Please provide Valid Id"}
                Map<String, Object> errorMap = objectMapper.readValue(body, Map.class);
                Object msg = errorMap.get("message");
                return msg != null ? msg.toString() : "Unknown booking service error";
            }
        } catch (Exception ex) {
            // Ignore parsing errors
        }
        return "Booking Service unreachable or internal error";
    }

}
