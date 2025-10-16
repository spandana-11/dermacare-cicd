package com.dermacare.doctorservice.serviceimpl;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
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
import com.dermacare.doctorservice.feignclient.AdminFeignClient;
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
    private ClinicAdminServiceClient clinicAdminServiceClient;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BookingFeignClient bookingFeignClient;
    
    @Autowired 
    private AdminFeignClient adminFeignClient;

//    @Override
//    public Response saveDoctorDetails(DoctorSaveDetailsDTO dto) {
//        try {
//            // ----------------------- Step 0: Validate Booking ID -----------------------
//            if (dto.getBookingId() == null || dto.getBookingId().isBlank()) {
//                return buildResponse(false, null,
//                        "Booking ID must not be null or empty",
//                        HttpStatus.BAD_REQUEST.value());
//            }
//
//            // ----------------------- Step 1: Fetch Booking -----------------------
//            ResponseEntity<ResponseStructure<BookingResponse>> bookingEntity =
//                    bookingFeignClient.getBookedService(dto.getBookingId());
//
//            if (bookingEntity == null || bookingEntity.getBody() == null) {
//                return buildResponse(false, null,
//                        "Unable to fetch booking details. Booking service returned null.",
//                        HttpStatus.BAD_GATEWAY.value());
//            }
//
//            ResponseStructure<BookingResponse> bookingResponse = bookingEntity.getBody();
//            BookingResponse bookingData = bookingResponse.getData();
//            if (bookingData == null) {
//                return buildResponse(false, null,
//                        "Booking not found with ID: " + dto.getBookingId(),
//                        HttpStatus.NOT_FOUND.value());
//            }
//
//            // ----------------------- Step 2: Fetch Doctor -----------------------
//            Response doctorResponse = clinicAdminServiceClient.getDoctorById(dto.getDoctorId()).getBody();
//            if (doctorResponse == null || !doctorResponse.isSuccess() || doctorResponse.getData() == null) {
//                return buildResponse(false, null,
//                        "Doctor not found with ID: " + dto.getDoctorId(),
//                        HttpStatus.NOT_FOUND.value());
//            }
//            Map<String, Object> doctorData = objectMapper.convertValue(doctorResponse.getData(), Map.class);
//            dto.setDoctorName((String) doctorData.get("doctorName"));
//
//            // ----------------------- Step 3: Setup Clinic Info -----------------------
//            dto.setClinicId(Optional.ofNullable(dto.getClinicId()).orElse(""));
//            dto.setClinicName(Optional.ofNullable(dto.getClinicName()).orElse(""));
//
//            // ----------------------- Step 4: Calculate Visit Count & Type -----------------------
//            List<DoctorSaveDetails> previousVisits =
//                    repository.findByDoctorIdAndPatientIdAndSubServiceId(
//                            dto.getDoctorId(),
//                            dto.getPatientId(),
//                            dto.getSubServiceId()   // ✅ Important: subServiceId included
//                    );
//            int visitCount = (previousVisits != null && !previousVisits.isEmpty()) ? previousVisits.size() + 1 : 1;
//            dto.setVisitCount(visitCount);
//            dto.setVisitType(VisitTypeUtil.getVisitTypeFromCount(visitCount));
//            dto.setVisitDateTime(LocalDateTime.now());
//
//            // ----------------------- Step 5: Save Visit -----------------------
//            DoctorSaveDetails entity = convertToEntity(dto);
//            entity.setVisitCount(visitCount);
//            DoctorSaveDetails savedVisit = repository.save(entity);
//
//            // ----------------------- Step 6: Fetch Clinic for Consultation Expiry -----------------------
//            Response clinicResponse = adminFeignClient.getClinicById(dto.getClinicId()).getBody();
//            int expirationDays = 0;
//            String consultationExpirationStr = "";
//            if (clinicResponse != null && clinicResponse.isSuccess() && clinicResponse.getData() != null) {
//                Map<String, Object> clinicData = objectMapper.convertValue(clinicResponse.getData(), Map.class);
//                if (clinicData.containsKey("consultationExpiration") && clinicData.get("consultationExpiration") != null) {
//                    consultationExpirationStr = clinicData.get("consultationExpiration").toString();
//                    expirationDays = parseExpirationDays(consultationExpirationStr);
//                }
//            }
//
//         // ----------------------- Step 7: Update Treatments & Calculate Last Sitting -----------------------
//            LocalDateTime lastSittingDateTime = null;
//            boolean hasTreatments = false;
//
//            if (savedVisit.getTreatments() != null && savedVisit.getTreatments().getGeneratedData() != null) {
//                hasTreatments = true;
//                Map<String, TreatmentDetails> generatedData = savedVisit.getTreatments().getGeneratedData();
//
//                for (TreatmentDetails treatment : generatedData.values()) {
//                    int totalSittings = Optional.ofNullable(treatment.getTotalSittings()).orElse(0);
//                    int completedSittings = 0;
//
//                    if (treatment.getDates() != null && !treatment.getDates().isEmpty()) {
//                        AtomicInteger counter = new AtomicInteger(1);
//
//                        for (Dates d : treatment.getDates()) {
//                            try {
//                                LocalDate sittingDate = LocalDate.parse(d.getDate());
//                                LocalDateTime sittingDateTime = sittingDate.atStartOfDay();
//
//                                // Count completed sittings (past or today)
//                                if (!sittingDate.isAfter(LocalDate.now())) {
//                                    completedSittings++;
//                                }
//
//                                // Track the last sitting (regardless of past/future)
//                                if (lastSittingDateTime == null || sittingDateTime.isAfter(lastSittingDateTime)) {
//                                    lastSittingDateTime = sittingDateTime;
//                                }
//
//                                // Set sitting number if missing
//                                if (d.getSitting() == null || d.getSitting() == 0) {
//                                    d.setSitting(counter.getAndIncrement());
//                                }
//
//                            } catch (Exception ignored) {}
//                        }
//                    }
//
//                    // Update remaining sittings
//                    treatment.setSittings(Math.max(totalSittings - completedSittings, 0));
//                }
//            }
//
//            // Save updated treatments
//            repository.save(savedVisit);
//
//            // ----------------------- Step 8: Consultation Start & Expiry -----------------------
//            LocalDateTime consultationStartDate = hasTreatments && lastSittingDateTime != null
//                    ? lastSittingDateTime.plusDays(1).withHour(0).withMinute(0).withSecond(0).withNano(0)
//                    : LocalDate.now().plusDays(1).atStartOfDay();
//
//            LocalDateTime consultationExpiryDate = consultationStartDate.plusDays(expirationDays);
//
//            savedVisit.setConsultationStartDate(consultationStartDate);
//            savedVisit.setConsultationExpiryDate(consultationExpiryDate);
//
//            repository.save(savedVisit);
//
//         // ----------------------- Step 9: Follow-up Next Date -----------------------
//            if (savedVisit.getFollowUp() != null && savedVisit.getFollowUp().getDurationValue() > 0) {
//                int durationValue = savedVisit.getFollowUp().getDurationValue();
//                String durationUnit = savedVisit.getFollowUp().getDurationUnit();
//
//                // ✅ Always start from consultationStartDate (not before)
//                LocalDateTime baseDate = consultationStartDate.isAfter(LocalDateTime.now())
//                        ? consultationStartDate
//                        : LocalDateTime.now();
//
//                LocalDateTime nextFollowUpDate = baseDate;
//
//                switch (durationUnit.toLowerCase()) {
//                    case "days" -> nextFollowUpDate = consultationStartDate.plusDays(durationValue);
//                    case "weeks" -> nextFollowUpDate = consultationStartDate.plusWeeks(durationValue);
//                    case "months" -> nextFollowUpDate = consultationStartDate.plusMonths(durationValue);
//                    default -> nextFollowUpDate = consultationStartDate.plusDays(durationValue);
//                }
//
//                // ✅ Ensure follow-up never starts before consultation
//                if (nextFollowUpDate.isBefore(consultationStartDate)) {
//                    nextFollowUpDate = consultationStartDate;
//                }
//
//                savedVisit.getFollowUp().setNextFollowUpDate(nextFollowUpDate.toString());
//            }
//
//         // ----------------------- Step 10: Free Follow-ups & Booking Status -----------------------
//            int freeFollowUpsLeft = Optional.ofNullable(bookingData.getFreeFollowUpsLeft()).orElse(0);
//            boolean consultationExpired = consultationExpiryDate != null && !LocalDateTime.now().isBefore(consultationExpiryDate);
//
//            // Check if all sittings are completed
//            boolean allSittingsCompleted = hasTreatments && savedVisit.getTreatments().getGeneratedData().values().stream()
//                    .allMatch(t -> t.getSittings() != null && t.getSittings() == 0);
//
//            // ✅ Only decrease free follow-ups after consultation has started
//            boolean consultationStarted = LocalDateTime.now().isAfter(consultationStartDate) || 
//                                          LocalDateTime.now().isEqual(consultationStartDate);
//
//            // Initialize status
//            String status;
//
//            // 🧠 Logic Flow:
//            // 1️⃣ Before consultationStartDate → "Scheduled"
//            // 2️⃣ After start → "In-Progress" and decrease free follow-ups (if sittings done)
//            // 3️⃣ After expire or all free follow-ups used → "Completed"
//            if (!consultationStarted) {
//                status = "In-Progress";
//            } else if (!consultationExpired) {
//                // Consultation active
//                if (allSittingsCompleted && freeFollowUpsLeft > 0) {
//                    freeFollowUpsLeft--;
//                }
//                status = (freeFollowUpsLeft <= 0) ? "Completed" : "In-Progress";
//            } else {
//                status = "Completed";
//            }
//
//            // ✅ Prevent negative follow-ups
//            bookingData.setFreeFollowUpsLeft(Math.max(freeFollowUpsLeft, 0));
//            bookingData.setStatus(status);
//
//            // Update booking service
//            bookingFeignClient.updateAppointment(bookingData);
//
//
//            // ----------------------- Step 11: Build Response -----------------------
//            DoctorSaveDetailsDTO savedDto = convertToDto(savedVisit);
//            return buildResponse(true,
//                    Map.of(
//                            "savedDetails", savedDto,
//                            "visitNumber", visitCount,
//                            "subServiceId", dto.getSubServiceId(), 
//                            "status", status,
//                            "freeFollowUpsLeft", freeFollowUpsLeft,
//                            "consultationStartDate", consultationStartDate,
//                            "consultationExpiryDate", consultationExpiryDate,
//                            "followUpNextDate", savedVisit.getFollowUp() != null ? savedVisit.getFollowUp().getNextFollowUpDate() : null,
//                            "consultationExpirationDays", expirationDays,
//                            "consultationExpirationStr", consultationExpirationStr
//                    ),
//                    "Doctor details saved successfully",
//                    HttpStatus.CREATED.value());
//
//        } catch (FeignException e) {
//            return buildResponse(false, null,
//                    "Error fetching doctor/booking/clinic details: " + e.getMessage(),
//                    HttpStatus.BAD_GATEWAY.value());
//        } catch (Exception e) {
//            return buildResponse(false, null,
//                    "Unexpected error: " + e.getMessage(),
//                    HttpStatus.INTERNAL_SERVER_ERROR.value());
//        }
//    }
//
//    /** Utility to parse "7 days" -> 7 */
//    private int parseExpirationDays(String expirationStr) {
//        if (expirationStr == null || expirationStr.isBlank()) return 0;
//        expirationStr = expirationStr.toLowerCase().trim();
//        try {
//            if (expirationStr.contains("day")) {
//                return Integer.parseInt(expirationStr.replaceAll("[^0-9]", ""));
//            }
//        } catch (NumberFormatException e) {
//            return 0;
//        }
//        return 0;
//    }
    
//    @Override
//    public Response saveDoctorDetails(DoctorSaveDetailsDTO dto) {
//        try {
//            // ----------------------- Step 0: Validate Booking ID -----------------------
//            if (dto.getBookingId() == null || dto.getBookingId().isBlank()) {
//                return buildResponse(false, null,
//                        "Booking ID must not be null or empty",
//                        HttpStatus.BAD_REQUEST.value());
//            }
//
//            // ----------------------- Step 1: Fetch Booking -----------------------
//            ResponseEntity<ResponseStructure<BookingResponse>> bookingEntity =
//                    bookingFeignClient.getBookedService(dto.getBookingId());
//
//            if (bookingEntity == null || bookingEntity.getBody() == null) {
//                return buildResponse(false, null,
//                        "Unable to fetch booking details. Booking service returned null.",
//                        HttpStatus.BAD_GATEWAY.value());
//            }
//
//            ResponseStructure<BookingResponse> bookingResponse = bookingEntity.getBody();
//            BookingResponse bookingData = bookingResponse.getData();
//            if (bookingData == null) {
//                return buildResponse(false, null,
//                        "Booking not found with ID: " + dto.getBookingId(),
//                        HttpStatus.NOT_FOUND.value());
//            }
//
//            // ----------------------- Step 2: Fetch Doctor -----------------------
//            Response doctorResponse = clinicAdminServiceClient.getDoctorById(dto.getDoctorId()).getBody();
//            if (doctorResponse == null || !doctorResponse.isSuccess() || doctorResponse.getData() == null) {
//                return buildResponse(false, null,
//                        "Doctor not found with ID: " + dto.getDoctorId(),
//                        HttpStatus.NOT_FOUND.value());
//            }
//            Map<String, Object> doctorData = objectMapper.convertValue(doctorResponse.getData(), Map.class);
//            dto.setDoctorName((String) doctorData.get("doctorName"));
//
//            // ----------------------- Step 3: Setup Clinic Info -----------------------
//            dto.setClinicId(Optional.ofNullable(dto.getClinicId()).orElse(""));
//            dto.setClinicName(Optional.ofNullable(dto.getClinicName()).orElse(""));
//
//            // ----------------------- Step 4: Calculate Visit Count & Type -----------------------
//            List<DoctorSaveDetails> previousVisits =
//                    repository.findByDoctorIdAndPatientIdAndSubServiceId(
//                            dto.getDoctorId(),
//                            dto.getPatientId(),
//                            dto.getSubServiceId()
//                    );
//            int visitCount = (previousVisits != null && !previousVisits.isEmpty()) ? previousVisits.size() + 1 : 1;
//            dto.setVisitCount(visitCount);
//            dto.setVisitType(VisitTypeUtil.getVisitTypeFromCount(visitCount));
//            dto.setVisitDateTime(LocalDateTime.now());
//
//            // ----------------------- Step 5: Save Visit -----------------------
//            DoctorSaveDetails entity = convertToEntity(dto);
//            entity.setVisitCount(visitCount);
//            DoctorSaveDetails savedVisit = repository.save(entity);
//
//            // ----------------------- Step 6: Fetch Clinic for Expiry Config -----------------------
//            Response clinicResponse = adminFeignClient.getClinicById(dto.getClinicId()).getBody();
//            int expirationDays = 0;
//            String consultationExpirationStr = "";
//            if (clinicResponse != null && clinicResponse.isSuccess() && clinicResponse.getData() != null) {
//                Map<String, Object> clinicData = objectMapper.convertValue(clinicResponse.getData(), Map.class);
//                if (clinicData.containsKey("consultationExpiration") && clinicData.get("consultationExpiration") != null) {
//                    consultationExpirationStr = clinicData.get("consultationExpiration").toString();
//                    expirationDays = parseExpirationDays(consultationExpirationStr);
//                }
//            }
//
//            // ----------------------- Step 7: Treatments & Last Sitting -----------------------
//            LocalDateTime lastSittingDateTime = null;
//            boolean hasTreatments = false;
//
//            if (savedVisit.getTreatments() != null && savedVisit.getTreatments().getGeneratedData() != null) {
//                hasTreatments = true;
//                Map<String, TreatmentDetails> generatedData = savedVisit.getTreatments().getGeneratedData();
//
//                for (TreatmentDetails treatment : generatedData.values()) {
//                    int totalSittings = Optional.ofNullable(treatment.getTotalSittings()).orElse(0);
//                    int completedSittings = 0;
//
//                    if (treatment.getDates() != null && !treatment.getDates().isEmpty()) {
//                        AtomicInteger counter = new AtomicInteger(1);
//
//                        for (Dates d : treatment.getDates()) {
//                            try {
//                                LocalDate sittingDate = LocalDate.parse(d.getDate());
//                                LocalDateTime sittingDateTime = sittingDate.atStartOfDay();
//
//                                // Count completed sittings
//                                if (!sittingDate.isAfter(LocalDate.now())) {
//                                    completedSittings++;
//                                }
//
//                                // Track last sitting
//                                if (lastSittingDateTime == null || sittingDateTime.isAfter(lastSittingDateTime)) {
//                                    lastSittingDateTime = sittingDateTime;
//                                }
//
//                                // Set sitting number
//                                if (d.getSitting() == null || d.getSitting() == 0) {
//                                    d.setSitting(counter.getAndIncrement());
//                                }
//
//                            } catch (Exception ignored) {}
//                        }
//                    }
//
//                    // Update remaining sittings
//                    treatment.setSittings(Math.max(totalSittings - completedSittings, 0));
//                }
//            }
//
//            // Save updated treatments
//            repository.save(savedVisit);
//
//            // ----------------------- Step 8: Consultation Start & Expiry -----------------------
//            LocalDateTime consultationStartDate = hasTreatments && lastSittingDateTime != null
//                    ? lastSittingDateTime.plusDays(1).withHour(0).withMinute(0).withSecond(0).withNano(0)
//                    : LocalDate.now().atStartOfDay();
//
//            LocalDateTime consultationExpiryDate = consultationStartDate.plusDays(expirationDays);
//
//            savedVisit.setConsultationStartDate(consultationStartDate);
//            savedVisit.setConsultationExpiryDate(consultationExpiryDate);
//            repository.save(savedVisit);
//
//            // ----------------------- Step 9: Follow-up Next Date -----------------------
//            if (savedVisit.getFollowUp() != null && savedVisit.getFollowUp().getDurationValue() > 0) {
//                int durationValue = savedVisit.getFollowUp().getDurationValue();
//                String durationUnit = savedVisit.getFollowUp().getDurationUnit();
//
//                LocalDateTime nextFollowUpDate = switch (durationUnit.toLowerCase()) {
//                    case "days" -> consultationStartDate.plusDays(durationValue);
//                    case "weeks" -> consultationStartDate.plusWeeks(durationValue);
//                    case "months" -> consultationStartDate.plusMonths(durationValue);
//                    default -> consultationStartDate.plusDays(durationValue);
//                };
//
//                if (nextFollowUpDate.isBefore(consultationStartDate)) {
//                    nextFollowUpDate = consultationStartDate;
//                }
//
//                savedVisit.getFollowUp().setNextFollowUpDate(nextFollowUpDate.toString());
//            }
//
//            // ----------------------- Step 10: Status & Free Follow-ups -----------------------
//            int freeFollowUpsLeft = Optional.ofNullable(bookingData.getFreeFollowUpsLeft()).orElse(0);
//            boolean consultationExpired = consultationExpiryDate != null && !LocalDateTime.now().isBefore(consultationExpiryDate);
//
//            boolean allSittingsCompleted = hasTreatments && savedVisit.getTreatments().getGeneratedData().values().stream()
//                    .allMatch(t -> t.getSittings() != null && t.getSittings() == 0);
//
//            boolean consultationStarted = LocalDateTime.now().isAfter(consultationStartDate) ||
//                                          LocalDateTime.now().isEqual(consultationStartDate);
//
//            String status;
//            if (!consultationStarted) {
//                status = "Scheduled";
//            } else if (!consultationExpired) {
//                if (allSittingsCompleted && freeFollowUpsLeft > 0) {
//                    freeFollowUpsLeft--;
//                }
//                status = (freeFollowUpsLeft <= 0) ? "Completed" : "In-Progress";
//            } else {
//                status = "Completed";
//            }
//
//            bookingData.setFreeFollowUpsLeft(Math.max(freeFollowUpsLeft, 0));
//            bookingData.setStatus(status);
//
//            // Preserve Consultation Type (important for Online/In-Clinic/Service)
//            if (bookingData.getConsultationType() == null || bookingData.getConsultationType().isBlank()) {
//                bookingData.setConsultationType(dto.getConsultationType()); 
//            }
//
//            bookingFeignClient.updateAppointment(bookingData);
//
//         // ----------------------- Step 11: Build Response -----------------------
//            DoctorSaveDetailsDTO savedDto = convertToDto(savedVisit);
//
//            Map<String, Object> responseMap = new HashMap<>();
//            responseMap.put("savedDetails", savedDto);
//            responseMap.put("visitNumber", visitCount);
//            responseMap.put("subServiceId", dto.getSubServiceId());
//            responseMap.put("status", status);
//
//            // ✅ ensure consultationType is taken from bookingData safely
//            responseMap.put("consultationType", 
//                    bookingData != null ? bookingData.getConsultationType() : null);
//
//            responseMap.put("freeFollowUpsLeft", freeFollowUpsLeft);
//            responseMap.put("consultationStartDate", consultationStartDate);
//            responseMap.put("consultationExpiryDate", consultationExpiryDate);
//
//            // ✅ avoid NPE if followUp is null
//            responseMap.put("followUpNextDate", 
//                    savedVisit.getFollowUp() != null ? savedVisit.getFollowUp().getNextFollowUpDate() : null);
//
//            responseMap.put("consultationExpirationDays", expirationDays);
//            responseMap.put("consultationExpirationStr", consultationExpirationStr);
//
//            return buildResponse(true, responseMap,
//                    "Doctor details saved successfully",
//                    HttpStatus.CREATED.value());
//
//            } catch (FeignException e) {
//                return buildResponse(false, null,
//                        "Error fetching doctor/booking/clinic details: " + e.getMessage(),
//                        HttpStatus.BAD_GATEWAY.value());
//            } catch (Exception e) {
//                return buildResponse(false, null,
//                        "Unexpected error: " + e.getMessage(),
//                        HttpStatus.INTERNAL_SERVER_ERROR.value());
//            }
//    }
//
//
//    /** Utility to parse "7 days" -> 7 */
//    private int parseExpirationDays(String expirationStr) {
//        if (expirationStr == null || expirationStr.isBlank()) return 0;
//        expirationStr = expirationStr.toLowerCase().trim();
//        try {
//            if (expirationStr.contains("day")) {
//                return Integer.parseInt(expirationStr.replaceAll("[^0-9]", ""));
//            }
//        } catch (NumberFormatException e) {
//            return 0;
//        }
//        return 0;
//    }

//    @Override
//    public Response saveDoctorDetails(DoctorSaveDetailsDTO dto) {
//        try {
//            // ----------------------- Step 0: Validate Booking ID -----------------------
//            if (dto.getBookingId() == null || dto.getBookingId().isBlank()) {
//                return buildResponse(false, null,
//                        "Booking ID must not be null or empty",
//                        HttpStatus.BAD_REQUEST.value());
//            }
//
//            // ----------------------- Step 1: Fetch Booking -----------------------
//            ResponseEntity<ResponseStructure<BookingResponse>> bookingEntity =
//                    bookingFeignClient.getBookedService(dto.getBookingId());
//
//            if (bookingEntity == null || bookingEntity.getBody() == null) {
//                return buildResponse(false, null,
//                        "Unable to fetch booking details. Booking service returned null.",
//                        HttpStatus.BAD_GATEWAY.value());
//            }
//
//            ResponseStructure<BookingResponse> bookingResponse = bookingEntity.getBody();
//            BookingResponse bookingData = bookingResponse.getData();
//            if (bookingData == null) {
//                return buildResponse(false, null,
//                        "Booking not found with ID: " + dto.getBookingId(),
//                        HttpStatus.NOT_FOUND.value());
//            }
//
//            // ----------------------- Step 2: Fetch Doctor -----------------------
//            Response doctorResponse = clinicAdminServiceClient.getDoctorById(dto.getDoctorId()).getBody();
//            if (doctorResponse == null || !doctorResponse.isSuccess() || doctorResponse.getData() == null) {
//                return buildResponse(false, null,
//                        "Doctor not found with ID: " + dto.getDoctorId(),
//                        HttpStatus.NOT_FOUND.value());
//            }
//            Map<String, Object> doctorData = objectMapper.convertValue(doctorResponse.getData(), Map.class);
//            dto.setDoctorName((String) doctorData.get("doctorName"));
//
//            // ----------------------- Step 3: Setup Clinic Info -----------------------
//            dto.setClinicId(Optional.ofNullable(dto.getClinicId()).orElse(""));
//            dto.setClinicName(Optional.ofNullable(dto.getClinicName()).orElse(""));
//
//            // ----------------------- Step 4: Calculate Visit Count & Type -----------------------
//            List<DoctorSaveDetails> previousVisits =
//                    repository.findByDoctorIdAndPatientIdAndSubServiceId(
//                            dto.getDoctorId(),
//                            dto.getPatientId(),
//                            dto.getSubServiceId()
//                    );
//            int visitCount = (previousVisits != null && !previousVisits.isEmpty()) ? previousVisits.size() + 1 : 1;
//            dto.setVisitCount(visitCount);
//            dto.setVisitType(VisitTypeUtil.getVisitTypeFromCount(visitCount));
//            dto.setVisitDateTime(LocalDateTime.now());
//
//            // ----------------------- Step 5: Save Visit -----------------------
//            DoctorSaveDetails entity = convertToEntity(dto);
//            entity.setVisitCount(visitCount);
//            DoctorSaveDetails savedVisit = repository.save(entity);
//
//            // ----------------------- Step 6: Fetch Clinic for Consultation Expiry -----------------------
//            Response clinicResponse = adminFeignClient.getClinicById(dto.getClinicId()).getBody();
//            int expirationDays = 0;
//            String consultationExpirationStr = "";
//            if (clinicResponse != null && clinicResponse.isSuccess() && clinicResponse.getData() != null) {
//                Map<String, Object> clinicData = objectMapper.convertValue(clinicResponse.getData(), Map.class);
//                if (clinicData.containsKey("consultationExpiration") && clinicData.get("consultationExpiration") != null) {
//                    consultationExpirationStr = clinicData.get("consultationExpiration").toString();
//                    expirationDays = parseExpirationDays(consultationExpirationStr);
//                }
//            }
//
//            // ----------------------- Step 7: Update Treatments & Calculate Sitting Summary -----------------------
//            LocalDateTime lastSittingDateTime = null;
//            boolean hasTreatments = false;
//
//            int totalSittings = 0;
//            int takenSittings = 0;
//            int pendingSittings = 0;
//            int currentSitting = 0;
//
//            if (savedVisit.getTreatments() != null && savedVisit.getTreatments().getGeneratedData() != null) {
//                hasTreatments = true;
//                Map<String, TreatmentDetails> generatedData = savedVisit.getTreatments().getGeneratedData();
//
//                for (TreatmentDetails treatment : generatedData.values()) {
//                    int total = Optional.ofNullable(treatment.getTotalSittings()).orElse(0);
//                    int completed = 0;
//
//                    if (treatment.getDates() != null && !treatment.getDates().isEmpty()) {
//                        AtomicInteger counter = new AtomicInteger(1);
//
//                        for (Dates d : treatment.getDates()) {
//                            try {
//                                LocalDate sittingDate = LocalDate.parse(d.getDate());
//                                LocalDateTime sittingDateTime = sittingDate.atStartOfDay();
//
//                                // Count completed sittings (past or today)
//                                if (!sittingDate.isAfter(LocalDate.now())) {
//                                    completed++;
//                                    currentSitting = counter.get(); // last completed sitting number
//                                }
//
//                                // Track last sitting date
//                                if (lastSittingDateTime == null || sittingDateTime.isAfter(lastSittingDateTime)) {
//                                    lastSittingDateTime = sittingDateTime;
//                                }
//
//                                // Set sitting number if missing
//                                if (d.getSitting() == null || d.getSitting() == 0) {
//                                    d.setSitting(counter.getAndIncrement());
//                                }
//
//                            } catch (Exception ignored) {}
//                        }
//                    }
//
//                    // Update remaining sittings in treatment
//                    treatment.setSittings(Math.max(total - completed, 0));
//
//                    // Add to summary counters
//                    totalSittings += total;
//                    takenSittings += completed;
//                }
//
//                pendingSittings = Math.max(totalSittings - takenSittings, 0);
//            }
//
//            // Save updated treatments
//            repository.save(savedVisit);
//
//            // ----------------------- Step 8: Consultation Start & Expiry -----------------------
//            LocalDateTime consultationStartDate = hasTreatments && lastSittingDateTime != null
//                    ? lastSittingDateTime.plusDays(1).withHour(0).withMinute(0).withSecond(0).withNano(0)
//                    : LocalDate.now().plusDays(1).atStartOfDay();
//
//            LocalDateTime consultationExpiryDate = consultationStartDate.plusDays(expirationDays);
//
//            savedVisit.setConsultationStartDate(consultationStartDate);
//            savedVisit.setConsultationExpiryDate(consultationExpiryDate);
//
//            repository.save(savedVisit);
//
//            // ----------------------- Step 9: Follow-up Next Date -----------------------
//            if (savedVisit.getFollowUp() != null && savedVisit.getFollowUp().getDurationValue() > 0) {
//                int durationValue = savedVisit.getFollowUp().getDurationValue();
//                String durationUnit = savedVisit.getFollowUp().getDurationUnit();
//
//                LocalDateTime baseDate = consultationStartDate.isAfter(LocalDateTime.now())
//                        ? consultationStartDate
//                        : LocalDateTime.now();
//
//                LocalDateTime nextFollowUpDate = baseDate;
//
//                switch (durationUnit.toLowerCase()) {
//                    case "days" -> nextFollowUpDate = consultationStartDate.plusDays(durationValue);
//                    case "weeks" -> nextFollowUpDate = consultationStartDate.plusWeeks(durationValue);
//                    case "months" -> nextFollowUpDate = consultationStartDate.plusMonths(durationValue);
//                    default -> nextFollowUpDate = consultationStartDate.plusDays(durationValue);
//                }
//
//                if (nextFollowUpDate.isBefore(consultationStartDate)) {
//                    nextFollowUpDate = consultationStartDate;
//                }
//
//                savedVisit.getFollowUp().setNextFollowUpDate(nextFollowUpDate.toString());
//            }
//
//            // ----------------------- Step 10: Free Follow-ups & Booking Status -----------------------
//            int freeFollowUpsLeft = Optional.ofNullable(bookingData.getFreeFollowUpsLeft()).orElse(0);
//            boolean consultationExpired = consultationExpiryDate != null && !LocalDateTime.now().isBefore(consultationExpiryDate);
//
//            boolean allSittingsCompleted = hasTreatments && savedVisit.getTreatments().getGeneratedData().values().stream()
//                    .allMatch(t -> t.getSittings() != null && t.getSittings() == 0);
//
//            boolean consultationStarted = LocalDateTime.now().isAfter(consultationStartDate) ||
//                                          LocalDateTime.now().isEqual(consultationStartDate);
//
//            String status;
//            if (!consultationStarted) {
//                status = "In-Progress";
//            } else if (!consultationExpired) {
//                if (allSittingsCompleted && freeFollowUpsLeft > 0) {
//                    freeFollowUpsLeft--;
//                }
//                status = (freeFollowUpsLeft <= 0) ? "Completed" : "In-Progress";
//            } else {
//                status = "Completed";
//            }
//
//            bookingData.setFreeFollowUpsLeft(Math.max(freeFollowUpsLeft, 0));
//            bookingData.setStatus(status);
//
//            bookingFeignClient.updateAppointment(bookingData);
//
//            // ----------------------- Step 11: Build Response -----------------------
//            DoctorSaveDetailsDTO savedDto = convertToDto(savedVisit);
//
//            // ✅ Sitting summary
//            savedDto.setTotalSittings(totalSittings);
//            savedDto.setTakenSittings(takenSittings);
//            savedDto.setPendingSittings(pendingSittings);
//            savedDto.setCurrentSitting(currentSitting);
//
//         // Create a HashMap to hold all response fields
//            Map<String, Object> responseMap = new HashMap<>();
//            responseMap.put("savedDetails", savedDto);
//            responseMap.put("visitNumber", visitCount);
//            responseMap.put("subServiceId", dto.getSubServiceId());
//            responseMap.put("status", status);
//            responseMap.put("consultationType", bookingData.getConsultationType());
//            responseMap.put("freeFollowUpsLeft", freeFollowUpsLeft);
//            responseMap.put("consultationStartDate", consultationStartDate);
//            responseMap.put("consultationExpiryDate", consultationExpiryDate);
//            responseMap.put("followUpNextDate", savedVisit.getFollowUp() != null ? savedVisit.getFollowUp().getNextFollowUpDate() : null);
//            responseMap.put("consultationExpirationDays", expirationDays);
//            responseMap.put("consultationExpirationStr", consultationExpirationStr);
//            responseMap.put("totalSittings", totalSittings);
//            responseMap.put("pendingSittings", pendingSittings);
//            responseMap.put("takenSittings", takenSittings);
//            responseMap.put("currentSitting", currentSitting);
//
//            return buildResponse(true, responseMap,
//                    "Doctor details saved successfully",
//                    HttpStatus.CREATED.value());
//
//        } catch (FeignException e) {
//            return buildResponse(false, null,
//                    "Error fetching doctor/booking/clinic details: " + e.getMessage(),
//                    HttpStatus.BAD_GATEWAY.value());
//        } catch (Exception e) {
//            return buildResponse(false, null,
//                    "Unexpected error: " + e.getMessage(),
//                    HttpStatus.INTERNAL_SERVER_ERROR.value());
//        }
//    }
//
//    /** Utility to parse "7 days" -> 7 */
//    private int parseExpirationDays(String expirationStr) {
//        if (expirationStr == null || expirationStr.isBlank()) return 0;
//        expirationStr = expirationStr.toLowerCase().trim();
//        try {
//            if (expirationStr.contains("day")) {
//                return Integer.parseInt(expirationStr.replaceAll("[^0-9]", ""));
//            }
//        } catch (NumberFormatException e) {
//            return 0;
//        }
//        return 0;
//    }

//    @Override
//    public Response saveDoctorDetails(DoctorSaveDetailsDTO dto) {
//        try {
//            // ----------------------- Step 0: Validate Booking ID -----------------------
//            if (dto.getBookingId() == null || dto.getBookingId().isBlank()) {
//                return buildResponse(false, null,
//                        "Booking ID must not be null or empty",
//                        HttpStatus.BAD_REQUEST.value());
//            }
//
//            // ----------------------- Step 1: Fetch Booking -----------------------
//            ResponseEntity<ResponseStructure<BookingResponse>> bookingEntity =
//                    bookingFeignClient.getBookedService(dto.getBookingId());
//
//            if (bookingEntity == null || bookingEntity.getBody() == null) {
//                return buildResponse(false, null,
//                        "Unable to fetch booking details. Booking service returned null.",
//                        HttpStatus.BAD_GATEWAY.value());
//            }
//
//            ResponseStructure<BookingResponse> bookingResponse = bookingEntity.getBody();
//            BookingResponse bookingData = bookingResponse.getData();
//            if (bookingData == null) {
//                return buildResponse(false, null,
//                        "Booking not found with ID: " + dto.getBookingId(),
//                        HttpStatus.NOT_FOUND.value());
//            }
//
//            // ----------------------- Step 2: Fetch Doctor -----------------------
//            Response doctorResponse = clinicAdminServiceClient.getDoctorById(dto.getDoctorId()).getBody();
//            if (doctorResponse == null || !doctorResponse.isSuccess() || doctorResponse.getData() == null) {
//                return buildResponse(false, null,
//                        "Doctor not found with ID: " + dto.getDoctorId(),
//                        HttpStatus.NOT_FOUND.value());
//            }
//            Map<String, Object> doctorData = objectMapper.convertValue(doctorResponse.getData(), Map.class);
//            dto.setDoctorName((String) doctorData.get("doctorName"));
//
//            // ----------------------- Step 3: Setup Clinic Info -----------------------
//            dto.setClinicId(Optional.ofNullable(dto.getClinicId()).orElse(""));
//            dto.setClinicName(Optional.ofNullable(dto.getClinicName()).orElse(""));
//
//            // ----------------------- Step 4: Calculate Visit Count & Type -----------------------
//            List<DoctorSaveDetails> previousVisits =
//                    repository.findByDoctorIdAndPatientIdAndSubServiceId(
//                            dto.getDoctorId(),
//                            dto.getPatientId(),
//                            dto.getSubServiceId()
//                    );
//            int visitCount = (previousVisits != null && !previousVisits.isEmpty()) ? previousVisits.size() + 1 : 1;
//            dto.setVisitCount(visitCount);
//            dto.setVisitType(VisitTypeUtil.getVisitTypeFromCount(visitCount));
//            dto.setVisitDateTime(LocalDateTime.now());
//
//            // ----------------------- Step 5: Save Visit -----------------------
//            DoctorSaveDetails entity = convertToEntity(dto);
//            entity.setVisitCount(visitCount);
//            DoctorSaveDetails savedVisit = repository.save(entity);
//
//            // ----------------------- Step 6: Fetch Clinic for Consultation Expiry -----------------------
//            Response clinicResponse = adminFeignClient.getClinicById(dto.getClinicId()).getBody();
//            int expirationDays = 0;
//            String consultationExpirationStr = "";
//            if (clinicResponse != null && clinicResponse.isSuccess() && clinicResponse.getData() != null) {
//                Map<String, Object> clinicData = objectMapper.convertValue(clinicResponse.getData(), Map.class);
//                if (clinicData.containsKey("consultationExpiration") && clinicData.get("consultationExpiration") != null) {
//                    consultationExpirationStr = clinicData.get("consultationExpiration").toString();
//                    expirationDays = parseExpirationDays(consultationExpirationStr);
//                }
//            }
//
//            // ----------------------- Step 7: Update Treatments & Calculate Sitting Summary -----------------------
//            LocalDateTime lastSittingDateTime = null;
//            boolean hasTreatments = false;
//
//            int totalSittings = 0;
//            int takenSittings = 0;
//            int pendingSittings = 0;
//            int currentSitting = 0;
//
//            if (savedVisit.getTreatments() != null && savedVisit.getTreatments().getGeneratedData() != null) {
//                hasTreatments = true;
//                Map<String, TreatmentDetails> generatedData = savedVisit.getTreatments().getGeneratedData();
//
//                for (TreatmentDetails treatment : generatedData.values()) {
//                    int total = Optional.ofNullable(treatment.getTotalSittings()).orElse(0);
//                    int completed = 0;
//
//                    if (treatment.getDates() != null && !treatment.getDates().isEmpty()) {
//                        AtomicInteger counter = new AtomicInteger(1);
//
//                        for (Dates d : treatment.getDates()) {
//                            try {
//                                LocalDate sittingDate = LocalDate.parse(d.getDate());
//                                LocalDateTime sittingDateTime = sittingDate.atStartOfDay();
//
//                                // Count completed sittings (past or today)
//                                if (!sittingDate.isAfter(LocalDate.now())) {
//                                    completed++;
//                                    currentSitting = counter.get(); // last completed sitting number
//                                }
//
//                                // Track last sitting date
//                                if (lastSittingDateTime == null || sittingDateTime.isAfter(lastSittingDateTime)) {
//                                    lastSittingDateTime = sittingDateTime;
//                                }
//
//                                // Set sitting number if missing
//                                if (d.getSitting() == null || d.getSitting() == 0) {
//                                    d.setSitting(counter.getAndIncrement());
//                                }
//
//                            } catch (Exception ignored) {}
//                        }
//                    }
//
//                    // Update remaining sittings in treatment
//                    treatment.setSittings(Math.max(total - completed, 0));
//
//                    // Add to summary counters
//                    totalSittings += total;
//                    takenSittings += completed;
//                }
//
//                pendingSittings = Math.max(totalSittings - takenSittings, 0);
//            }
//
//            // Save updated treatments
//            repository.save(savedVisit);
//
//            // ----------------------- Step 8: Consultation Start & Expiry -----------------------
//            LocalDateTime consultationStartDate = hasTreatments && lastSittingDateTime != null
//                    ? lastSittingDateTime.plusDays(1).withHour(0).withMinute(0).withSecond(0).withNano(0)
//                    : LocalDate.now().plusDays(1).atStartOfDay();
//
//            LocalDateTime consultationExpiryDate = consultationStartDate.plusDays(expirationDays);
//
//            savedVisit.setConsultationStartDate(consultationStartDate);
//            savedVisit.setConsultationExpiryDate(consultationExpiryDate);
//
//            repository.save(savedVisit);
//
//            // ----------------------- Step 9: Follow-up Next Date -----------------------
//            if (savedVisit.getFollowUp() != null && savedVisit.getFollowUp().getDurationValue() > 0) {
//                int durationValue = savedVisit.getFollowUp().getDurationValue();
//                String durationUnit = savedVisit.getFollowUp().getDurationUnit();
//
//                LocalDateTime baseDate = consultationStartDate.isAfter(LocalDateTime.now())
//                        ? consultationStartDate
//                        : LocalDateTime.now();
//
//                LocalDateTime nextFollowUpDate = baseDate;
//
//                switch (durationUnit.toLowerCase()) {
//                    case "days" -> nextFollowUpDate = consultationStartDate.plusDays(durationValue);
//                    case "weeks" -> nextFollowUpDate = consultationStartDate.plusWeeks(durationValue);
//                    case "months" -> nextFollowUpDate = consultationStartDate.plusMonths(durationValue);
//                    default -> nextFollowUpDate = consultationStartDate.plusDays(durationValue);
//                }
//
//                if (nextFollowUpDate.isBefore(consultationStartDate)) {
//                    nextFollowUpDate = consultationStartDate;
//                }
//
//                savedVisit.getFollowUp().setNextFollowUpDate(nextFollowUpDate.toString());
//            }
//
//            // ----------------------- Step 10: Free Follow-ups & Booking Status -----------------------
//            int freeFollowUpsLeft = Optional.ofNullable(bookingData.getFreeFollowUpsLeft()).orElse(0);
//            boolean consultationExpired = consultationExpiryDate != null && !LocalDateTime.now().isBefore(consultationExpiryDate);
//
//            boolean allSittingsCompleted = hasTreatments && savedVisit.getTreatments().getGeneratedData().values().stream()
//                    .allMatch(t -> t.getSittings() != null && t.getSittings() == 0);
//
//            boolean consultationStarted = LocalDateTime.now().isAfter(consultationStartDate) ||
//                                          LocalDateTime.now().isEqual(consultationStartDate);
//
//            String status;
//            if (!consultationStarted) {
//                status = "In-Progress";
//            } else if (!consultationExpired) {
//                if (allSittingsCompleted && freeFollowUpsLeft > 0) {
//                    freeFollowUpsLeft--;
//                }
//                status = (freeFollowUpsLeft <= 0) ? "Completed" : "In-Progress";
//            } else {
//                status = "Completed";
//            }
//
//            bookingData.setFreeFollowUpsLeft(Math.max(freeFollowUpsLeft, 0));
//            bookingData.setStatus(status);
//
//            bookingFeignClient.updateAppointment(bookingData);
//
//            // ----------------------- Step 11: Build Response -----------------------
//            DoctorSaveDetailsDTO savedDto = convertToDto(savedVisit);
//
//            // ✅ Sitting summary fields added
//            savedDto.setTotalSittings(totalSittings);
//            savedDto.setTakenSittings(takenSittings);
//            savedDto.setPendingSittings(pendingSittings);
//            savedDto.setCurrentSitting(currentSitting);
//
//            // ✅ Build response using HashMap to support >10 entries
//            Map<String, Object> responseMap = new HashMap<>();
//            responseMap.put("savedDetails", savedDto);
//            responseMap.put("visitNumber", visitCount);
//            responseMap.put("subServiceId", dto.getSubServiceId());
//            responseMap.put("status", status);
//            responseMap.put("consultationType", bookingData.getConsultationType());
//            responseMap.put("freeFollowUpsLeft", freeFollowUpsLeft);
//            responseMap.put("consultationStartDate", consultationStartDate);
//            responseMap.put("consultationExpiryDate", consultationExpiryDate);
//            responseMap.put("followUpNextDate", savedVisit.getFollowUp() != null ? savedVisit.getFollowUp().getNextFollowUpDate() : null);
//            responseMap.put("consultationExpirationDays", expirationDays);
//            responseMap.put("consultationExpirationStr", consultationExpirationStr);
//            responseMap.put("totalSittings", totalSittings);
//            responseMap.put("pendingSittings", pendingSittings);
//            responseMap.put("takenSittings", takenSittings);
//            responseMap.put("currentSitting", currentSitting);
//
//            return buildResponse(true, responseMap,
//                    "Doctor details saved successfully",
//                    HttpStatus.CREATED.value());
//
//        } catch (FeignException e) {
//            return buildResponse(false, null,
//                    "Error fetching doctor/booking/clinic details: " + e.getMessage(),
//                    HttpStatus.BAD_GATEWAY.value());
//        } catch (Exception e) {
//            return buildResponse(false, null,
//                    "Unexpected error: " + e.getMessage(),
//                    HttpStatus.INTERNAL_SERVER_ERROR.value());
//        }
//    }
//
//    /** Utility to parse "7 days" -> 7 */
//    private int parseExpirationDays(String expirationStr) {
//        if (expirationStr == null || expirationStr.isBlank()) return 0;
//        expirationStr = expirationStr.toLowerCase().trim();
//        try {
//            if (expirationStr.contains("day")) {
//                return Integer.parseInt(expirationStr.replaceAll("[^0-9]", ""));
//            }
//        } catch (NumberFormatException e) {
//            return 0;
//        }
//        return 0;
//    }

//    @Override
//    public Response saveDoctorDetails(DoctorSaveDetailsDTO dto) {
//        try {
//            // ----------------------- Step 0: Validate Booking ID -----------------------
//            if (dto.getBookingId() == null || dto.getBookingId().isBlank()) {
//                return buildResponse(false, null,
//                        "Booking ID must not be null or empty",
//                        HttpStatus.BAD_REQUEST.value());
//            }
//
//            // ----------------------- Step 1: Fetch Booking -----------------------
//            ResponseEntity<ResponseStructure<BookingResponse>> bookingEntity =
//                    bookingFeignClient.getBookedService(dto.getBookingId());
//
//            if (bookingEntity == null || bookingEntity.getBody() == null) {
//                return buildResponse(false, null,
//                        "Unable to fetch booking details. Booking service returned null.",
//                        HttpStatus.BAD_GATEWAY.value());
//            }
//
//            BookingResponse bookingData = bookingEntity.getBody().getData();
//            if (bookingData == null) {
//                return buildResponse(false, null,
//                        "Booking not found with ID: " + dto.getBookingId(),
//                        HttpStatus.NOT_FOUND.value());
//            }
//
//            // ----------------------- Step 2: Fetch Doctor -----------------------
//            Response doctorResponse = clinicAdminServiceClient.getDoctorById(dto.getDoctorId()).getBody();
//            if (doctorResponse == null || !doctorResponse.isSuccess() || doctorResponse.getData() == null) {
//                return buildResponse(false, null,
//                        "Doctor not found with ID: " + dto.getDoctorId(),
//                        HttpStatus.NOT_FOUND.value());
//            }
//            Map<String, Object> doctorData = objectMapper.convertValue(doctorResponse.getData(), Map.class);
//            dto.setDoctorName((String) doctorData.get("doctorName"));
//
//            // ----------------------- Step 3: Setup Clinic Info -----------------------
//            dto.setClinicId(Optional.ofNullable(dto.getClinicId()).orElse(""));
//            dto.setClinicName(Optional.ofNullable(dto.getClinicName()).orElse(""));
//
//            // ----------------------- Step 4: Calculate Visit Count & Type -----------------------
//            List<DoctorSaveDetails> previousVisits =
//                    repository.findByDoctorIdAndPatientIdAndSubServiceId(
//                            dto.getDoctorId(),
//                            dto.getPatientId(),
//                            dto.getSubServiceId()
//                    );
//            int visitCount = (previousVisits != null && !previousVisits.isEmpty()) ? previousVisits.size() + 1 : 1;
//            dto.setVisitCount(visitCount);
//            dto.setVisitType(VisitTypeUtil.getVisitTypeFromCount(visitCount));
//            dto.setVisitDateTime(LocalDateTime.now());
//
//            // ----------------------- Step 5: Save Visit -----------------------
//            DoctorSaveDetails entity = convertToEntity(dto);
//            entity.setVisitCount(visitCount);
//            DoctorSaveDetails savedVisit = repository.save(entity);
//
//            // ----------------------- Step 6: Fetch Clinic for Consultation Expiry -----------------------
//            Response clinicResponse = adminFeignClient.getClinicById(dto.getClinicId()).getBody();
//            int expirationDays = 0;
//            String consultationExpirationStr = "";
//            if (clinicResponse != null && clinicResponse.isSuccess() && clinicResponse.getData() != null) {
//                Map<String, Object> clinicData = objectMapper.convertValue(clinicResponse.getData(), Map.class);
//                if (clinicData.containsKey("consultationExpiration") && clinicData.get("consultationExpiration") != null) {
//                    consultationExpirationStr = clinicData.get("consultationExpiration").toString();
//                    expirationDays = parseExpirationDays(consultationExpirationStr);
//                }
//            }
//
//         // ----------------------- Step 7: Update Treatments & Calculate Sitting Summary -----------------------
//            LocalDateTime lastSittingDateTime = null;
//            boolean hasTreatments = false;
//
//            int totalSittings = 0;
//            int takenSittings = 0;
//            int pendingSittings = 0;
//            int currentSitting = 0;
//
//            TreatmentResponseDTO treatmentResponseDTO = new TreatmentResponseDTO();
//            Map<String, TreatmentDetailsDTO> generatedDataDTO = new HashMap<>();
//
//            if (savedVisit.getTreatments() != null && savedVisit.getTreatments().getGeneratedData() != null) {
//                hasTreatments = true;
//                Map<String, TreatmentDetails> generatedData = savedVisit.getTreatments().getGeneratedData();
//
//                for (Map.Entry<String, TreatmentDetails> entry : generatedData.entrySet()) {
//                    TreatmentDetails entityTreatment = entry.getValue();
//
//                    int total = Optional.ofNullable(entityTreatment.getTotalSittings()).orElse(0);
//                    int completed = 0;
//                    int currentSittingForThisTreatment = 0;
//
//                    if (entityTreatment.getDates() != null && !entityTreatment.getDates().isEmpty()) {
//                        AtomicInteger counter = new AtomicInteger(1);
//
//                        for (Dates d : entityTreatment.getDates()) {
//                            try {
//                                LocalDate sittingDate = LocalDate.parse(d.getDate());
//                                LocalDateTime sittingDateTime = sittingDate.atStartOfDay();
//
//                                if (!sittingDate.isAfter(LocalDate.now())) {
//                                    completed++;
//                                    currentSittingForThisTreatment = counter.get();
//                                    currentSitting = currentSittingForThisTreatment; // update overall current sitting
//                                }
//
//                                if (lastSittingDateTime == null || sittingDateTime.isAfter(lastSittingDateTime)) {
//                                    lastSittingDateTime = sittingDateTime;
//                                }
//
//                                if (d.getSitting() == null || d.getSitting() == 0) {
//                                    d.setSitting(counter.getAndIncrement());
//                                }
//
//                            } catch (Exception ignored) {}
//                        }
//                    }
//
//                    // Convert entity to DTO with sitting summary
//                    TreatmentDetailsDTO dtoTreatment = TreatmentDetailsDTO.builder()
//                            .dates(entityTreatment.getDates())
//                            .reason(entityTreatment.getReason())
//                            .frequency(entityTreatment.getFrequency())
//                            .startDate(entityTreatment.getStartDate())
//                            .sittings(Math.max(total - completed, 0))
//                            .totalSittings(total)
//                            .takenSittings(completed)
//                            .pendingSittings(Math.max(total - completed, 0))
//                            .currentSitting(currentSittingForThisTreatment)
//                            .build();
//
//                    generatedDataDTO.put(entry.getKey(), dtoTreatment);
//
//                    // Add to overall summary counters
//                    totalSittings += total;
//                    takenSittings += completed;
//                }
//
//                pendingSittings = Math.max(totalSittings - takenSittings, 0);
//            }
//
//            // Set DTO data
//            treatmentResponseDTO.setGeneratedData(generatedDataDTO);
//            treatmentResponseDTO.setTotalSittings(totalSittings);
//            treatmentResponseDTO.setTakenSittings(takenSittings);
//            treatmentResponseDTO.setPendingSittings(pendingSittings);
//            treatmentResponseDTO.setCurrentSitting(currentSitting);
//
//            // Save updated visit
//            repository.save(savedVisit);
//
//            // ----------------------- Step 8: Consultation Start & Expiry -----------------------
//            LocalDateTime consultationStartDate = hasTreatments && lastSittingDateTime != null
//                    ? lastSittingDateTime.plusDays(1).withHour(0).withMinute(0).withSecond(0).withNano(0)
//                    : LocalDate.now().plusDays(1).atStartOfDay();
//
//            LocalDateTime consultationExpiryDate = consultationStartDate.plusDays(expirationDays);
//
//            savedVisit.setConsultationStartDate(consultationStartDate);
//            savedVisit.setConsultationExpiryDate(consultationExpiryDate);
//            repository.save(savedVisit);
//
//            // ----------------------- Step 9: Follow-up Next Date -----------------------
//            if (savedVisit.getFollowUp() != null && savedVisit.getFollowUp().getDurationValue() > 0) {
//                int durationValue = savedVisit.getFollowUp().getDurationValue();
//                String durationUnit = savedVisit.getFollowUp().getDurationUnit();
//
//                LocalDateTime baseDate = consultationStartDate.isAfter(LocalDateTime.now())
//                        ? consultationStartDate
//                        : LocalDateTime.now();
//
//                LocalDateTime nextFollowUpDate = switch (durationUnit.toLowerCase()) {
//                    case "days" -> consultationStartDate.plusDays(durationValue);
//                    case "weeks" -> consultationStartDate.plusWeeks(durationValue);
//                    case "months" -> consultationStartDate.plusMonths(durationValue);
//                    default -> consultationStartDate.plusDays(durationValue);
//                };
//
//                if (nextFollowUpDate.isBefore(consultationStartDate)) {
//                    nextFollowUpDate = consultationStartDate;
//                }
//
//                savedVisit.getFollowUp().setNextFollowUpDate(nextFollowUpDate.toString());
//            }
//
//            // ----------------------- Step 10: Free Follow-ups & Booking Status -----------------------
//            int freeFollowUpsLeft = Optional.ofNullable(bookingData.getFreeFollowUpsLeft()).orElse(0);
//            boolean consultationExpired = consultationExpiryDate != null && !LocalDateTime.now().isBefore(consultationExpiryDate);
//
//            boolean allSittingsCompleted = hasTreatments && savedVisit.getTreatments().getGeneratedData().values().stream()
//                    .allMatch(t -> t.getSittings() != null && t.getSittings() == 0);
//
//            boolean consultationStarted = LocalDateTime.now().isAfter(consultationStartDate) ||
//                                          LocalDateTime.now().isEqual(consultationStartDate);
//
//            String status;
//            if (!consultationStarted) {
//                status = "In-Progress";
//            } else if (!consultationExpired) {
//                if (allSittingsCompleted && freeFollowUpsLeft > 0) {
//                    freeFollowUpsLeft--;
//                }
//                status = (freeFollowUpsLeft <= 0) ? "Completed" : "In-Progress";
//            } else {
//                status = "Completed";
//            }
//
//            bookingData.setFreeFollowUpsLeft(Math.max(freeFollowUpsLeft, 0));
//            bookingData.setStatus(status);
//
//            bookingFeignClient.updateAppointment(bookingData);
//
//            // ----------------------- Step 11: Build Response -----------------------
//            return buildResponse(true, treatmentResponseDTO,
//                    "Doctor details saved successfully",
//                    HttpStatus.CREATED.value());
//
//        } catch (FeignException e) {
//            return buildResponse(false, null,
//                    "Error fetching doctor/booking/clinic details: " + e.getMessage(),
//                    HttpStatus.BAD_GATEWAY.value());
//        } catch (Exception e) {
//            return buildResponse(false, null,
//                    "Unexpected error: " + e.getMessage(),
//                    HttpStatus.INTERNAL_SERVER_ERROR.value());
//        }
//    }
//
//    /** Utility to parse "7 days" -> 7 */
//    private int parseExpirationDays(String expirationStr) {
//        if (expirationStr == null || expirationStr.isBlank()) return 0;
//        expirationStr = expirationStr.toLowerCase().trim();
//        try {
//            if (expirationStr.contains("day")) {
//                return Integer.parseInt(expirationStr.replaceAll("[^0-9]", ""));
//            }
//        } catch (NumberFormatException e) {
//            return 0;
//        }
//        return 0;
//    }

//    @Override
//    public Response saveDoctorDetails(DoctorSaveDetailsDTO dto) {
//        try {
//            // ----------------------- Step 0: Validate Booking ID -----------------------
//            if (dto.getBookingId() == null || dto.getBookingId().isBlank()) {
//                return buildResponse(false, null,
//                        "Booking ID must not be null or empty",
//                        HttpStatus.BAD_REQUEST.value());
//            }
//
//            // ----------------------- Step 1: Fetch Booking -----------------------
//            ResponseEntity<ResponseStructure<BookingResponse>> bookingEntity =
//                    bookingFeignClient.getBookedService(dto.getBookingId());
//
//            if (bookingEntity == null || bookingEntity.getBody() == null) {
//                return buildResponse(false, null,
//                        "Unable to fetch booking details. Booking service returned null.",
//                        HttpStatus.BAD_GATEWAY.value());
//            }
//
//            BookingResponse bookingData = bookingEntity.getBody().getData();
//            if (bookingData == null) {
//                return buildResponse(false, null,
//                        "Booking not found with ID: " + dto.getBookingId(),
//                        HttpStatus.NOT_FOUND.value());
//            }
//
//            // ----------------------- Step 2: Fetch Doctor -----------------------
//            Response doctorResponse = clinicAdminServiceClient.getDoctorById(dto.getDoctorId()).getBody();
//            if (doctorResponse == null || !doctorResponse.isSuccess() || doctorResponse.getData() == null) {
//                return buildResponse(false, null,
//                        "Doctor not found with ID: " + dto.getDoctorId(),
//                        HttpStatus.NOT_FOUND.value());
//            }
//            Map<String, Object> doctorData = objectMapper.convertValue(doctorResponse.getData(), Map.class);
//            dto.setDoctorName((String) doctorData.get("doctorName"));
//
//            // ----------------------- Step 3: Setup Clinic Info -----------------------
//            dto.setClinicId(Optional.ofNullable(dto.getClinicId()).orElse(""));
//            dto.setClinicName(Optional.ofNullable(dto.getClinicName()).orElse(""));
//
//            // ----------------------- Step 4: Calculate Visit Count & Type -----------------------
//            List<DoctorSaveDetails> previousVisits =
//                    repository.findByDoctorIdAndPatientIdAndSubServiceId(
//                            dto.getDoctorId(),
//                            dto.getPatientId(),
//                            dto.getSubServiceId()
//                    );
//            int visitCount = (previousVisits != null && !previousVisits.isEmpty()) ? previousVisits.size() + 1 : 1;
//            dto.setVisitCount(visitCount);
//            dto.setVisitType(VisitTypeUtil.getVisitTypeFromCount(visitCount));
//            dto.setVisitDateTime(LocalDateTime.now());
//
//            // ----------------------- Step 5: Save Visit -----------------------
//            DoctorSaveDetails entity = convertToEntity(dto);
//            entity.setVisitCount(visitCount);
//            DoctorSaveDetails savedVisit = repository.save(entity);
//
//            // ----------------------- Step 6: Fetch Clinic for Consultation Expiry -----------------------
//            Response clinicResponse = adminFeignClient.getClinicById(dto.getClinicId()).getBody();
//            int expirationDays = 0;
//            String consultationExpirationStr = "";
//            if (clinicResponse != null && clinicResponse.isSuccess() && clinicResponse.getData() != null) {
//                Map<String, Object> clinicData = objectMapper.convertValue(clinicResponse.getData(), Map.class);
//                if (clinicData.containsKey("consultationExpiration") && clinicData.get("consultationExpiration") != null) {
//                    consultationExpirationStr = clinicData.get("consultationExpiration").toString();
//                    expirationDays = parseExpirationDays(consultationExpirationStr);
//                }
//            }
//
//         // ----------------------- Step 7: Update Treatments & Calculate Sitting Summary -----------------------
//            LocalDateTime lastSittingDateTime = null;
//            boolean hasTreatments = false;
//
//            int totalSittings = 0;
//            int takenSittings = 0;
//            int pendingSittings = 0;
//            int currentSitting = 0;
//
//            TreatmentResponseDTO treatmentResponseDTO = new TreatmentResponseDTO();
//            Map<String, TreatmentDetailsDTO> generatedDataDTO = new HashMap<>();
//
//            if (savedVisit.getTreatments() != null && savedVisit.getTreatments().getGeneratedData() != null) {
//                hasTreatments = true;
//                Map<String, TreatmentDetails> generatedData = savedVisit.getTreatments().getGeneratedData();
//
//                for (Map.Entry<String, TreatmentDetails> entry : generatedData.entrySet()) {
//                    TreatmentDetails entityTreatment = entry.getValue();
//
//                    int total = Optional.ofNullable(entityTreatment.getTotalSittings()).orElse(0);
//                    int completed = 0;
//                    int currentSittingForThisTreatment = 0;
//
//                    List<DatesDTO> datesDTOList = new ArrayList<>();
//                    if (entityTreatment.getDates() != null && !entityTreatment.getDates().isEmpty()) {
//                        AtomicInteger counter = new AtomicInteger(1);
//
//                        for (Dates d : entityTreatment.getDates()) {
//                            try {
//                                LocalDate sittingDate = LocalDate.parse(d.getDate());
//                                LocalDateTime sittingDateTime = sittingDate.atStartOfDay();
//
//                                if (!sittingDate.isAfter(LocalDate.now())) {
//                                    completed++;
//                                    currentSittingForThisTreatment = counter.get();
//                                    currentSitting = currentSittingForThisTreatment; // overall current sitting
//                                }
//
//                                if (lastSittingDateTime == null || sittingDateTime.isAfter(lastSittingDateTime)) {
//                                    lastSittingDateTime = sittingDateTime;
//                                }
//
//                                if (d.getSitting() == null || d.getSitting() == 0) {
//                                    d.setSitting(counter.getAndIncrement());
//                                }
//
//                                // Convert entity Dates -> DatesDTO
//                                DatesDTO dtoDate = DatesDTO.builder()
//                                        .date(d.getDate())
//                                        .sitting(d.getSitting())
//                                        .build();
//                                datesDTOList.add(dtoDate);
//
//                            } catch (Exception ignored) {}
//                        }
//                    }
//
//                    // Convert entity to DTO
//                    TreatmentDetailsDTO dtoTreatment = TreatmentDetailsDTO.builder()
//                            .dates(datesDTOList) // ✅ now it's List<DatesDTO>
//                            .reason(entityTreatment.getReason())
//                            .frequency(entityTreatment.getFrequency())
//                            .startDate(entityTreatment.getStartDate())
//                            .sittings(Math.max(total - completed, 0))
//                            .totalSittings(total)
//                            .takenSittings(completed)
//                            .pendingSittings(Math.max(total - completed, 0))
//                            .currentSitting(currentSittingForThisTreatment)
//                            .build();
//
//                    generatedDataDTO.put(entry.getKey(), dtoTreatment);
//
//                    // Add to overall summary counters
//                    totalSittings += total;
//                    takenSittings += completed;
//                }
//
//                pendingSittings = Math.max(totalSittings - takenSittings, 0);
//            }
//
//            // Set DTO data
//            treatmentResponseDTO.setGeneratedData(generatedDataDTO);
//            treatmentResponseDTO.setTotalSittings(totalSittings);
//            treatmentResponseDTO.setTakenSittings(takenSittings);
//            treatmentResponseDTO.setPendingSittings(pendingSittings);
//            treatmentResponseDTO.setCurrentSitting(currentSitting);
//
//            repository.save(savedVisit);
//
//
//            // ----------------------- Step 8: Consultation Start & Expiry -----------------------
//            LocalDateTime consultationStartDate = hasTreatments && lastSittingDateTime != null
//                    ? lastSittingDateTime.plusDays(1).withHour(0).withMinute(0).withSecond(0).withNano(0)
//                    : LocalDate.now().plusDays(1).atStartOfDay();
//
//            LocalDateTime consultationExpiryDate = consultationStartDate.plusDays(expirationDays);
//
//            savedVisit.setConsultationStartDate(consultationStartDate);
//            savedVisit.setConsultationExpiryDate(consultationExpiryDate);
//
//            repository.save(savedVisit);
//
//            // ----------------------- Step 9: Follow-up Next Date -----------------------
//            if (savedVisit.getFollowUp() != null && savedVisit.getFollowUp().getDurationValue() > 0) {
//                int durationValue = savedVisit.getFollowUp().getDurationValue();
//                String durationUnit = savedVisit.getFollowUp().getDurationUnit();
//
//                LocalDateTime baseDate = consultationStartDate.isAfter(LocalDateTime.now())
//                        ? consultationStartDate
//                        : LocalDateTime.now();
//
//                LocalDateTime nextFollowUpDate = switch (durationUnit.toLowerCase()) {
//                    case "days" -> consultationStartDate.plusDays(durationValue);
//                    case "weeks" -> consultationStartDate.plusWeeks(durationValue);
//                    case "months" -> consultationStartDate.plusMonths(durationValue);
//                    default -> consultationStartDate.plusDays(durationValue);
//                };
//
//                if (nextFollowUpDate.isBefore(consultationStartDate)) {
//                    nextFollowUpDate = consultationStartDate;
//                }
//
//                savedVisit.getFollowUp().setNextFollowUpDate(nextFollowUpDate.toString());
//            }
//
//            // ----------------------- Step 10: Free Follow-ups & Booking Status -----------------------
//            int freeFollowUpsLeft = Optional.ofNullable(bookingData.getFreeFollowUpsLeft()).orElse(0);
//            boolean consultationExpired = consultationExpiryDate != null && !LocalDateTime.now().isBefore(consultationExpiryDate);
//
//            boolean allSittingsCompleted = hasTreatments && savedVisit.getTreatments().getGeneratedData().values().stream()
//                    .allMatch(t -> t.getSittings() != null && t.getSittings() == 0);
//
//            boolean consultationStarted = LocalDateTime.now().isAfter(consultationStartDate) ||
//                                          LocalDateTime.now().isEqual(consultationStartDate);
//
//            String status;
//            if (!consultationStarted) {
//                status = "In-Progress";
//            } else if (!consultationExpired) {
//                if (allSittingsCompleted && freeFollowUpsLeft > 0) {
//                    freeFollowUpsLeft--;
//                }
//                status = (freeFollowUpsLeft <= 0) ? "Completed" : "In-Progress";
//            } else {
//                status = "Completed";
//            }
//
//            bookingData.setFreeFollowUpsLeft(Math.max(freeFollowUpsLeft, 0));
//            bookingData.setStatus(status);
//
//            bookingFeignClient.updateAppointment(bookingData);
//
//            // ----------------------- Step 11: Build Response -----------------------
//            DoctorSaveDetailsDTO savedDto = convertToDto(savedVisit);
//            savedDto.setTreatments(treatmentResponseDTO);
//
//            return buildResponse(true, savedDto,
//                    "Doctor details saved successfully",
//                    HttpStatus.CREATED.value());
//
//        } catch (FeignException e) {
//            return buildResponse(false, null,
//                    "Error fetching doctor/booking/clinic details: " + e.getMessage(),
//                    HttpStatus.BAD_GATEWAY.value());
//        } catch (Exception e) {
//            return buildResponse(false, null,
//                    "Unexpected error: " + e.getMessage(),
//                    HttpStatus.INTERNAL_SERVER_ERROR.value());
//        }
//    }
//
//    /** Utility to parse "7 days" -> 7 */
//    private int parseExpirationDays(String expirationStr) {
//        if (expirationStr == null || expirationStr.isBlank()) return 0;
//        expirationStr = expirationStr.toLowerCase().trim();
//        try {
//            if (expirationStr.contains("day")) {
//                return Integer.parseInt(expirationStr.replaceAll("[^0-9]", ""));
//            }
//        } catch (NumberFormatException e) {
//            return 0;
//        }
//        return 0;
//    }

//    @Override
//    public Response saveDoctorDetails(DoctorSaveDetailsDTO dto) {
//        try {
//            // ----------------------- Step 0: Validate Booking ID -----------------------
//            if (dto.getBookingId() == null || dto.getBookingId().isBlank()) {
//                return buildResponse(false, null,
//                        "Booking ID must not be null or empty",
//                        HttpStatus.BAD_REQUEST.value());
//            }
//
//            // ----------------------- Step 1: Fetch Booking -----------------------
//            ResponseEntity<ResponseStructure<BookingResponse>> bookingEntity =
//                    bookingFeignClient.getBookedService(dto.getBookingId());
//
//            if (bookingEntity == null || bookingEntity.getBody() == null) {
//                return buildResponse(false, null,
//                        "Unable to fetch booking details. Booking service returned null.",
//                        HttpStatus.BAD_GATEWAY.value());
//            }
//
//            BookingResponse bookingData = bookingEntity.getBody().getData();
//            if (bookingData == null) {
//                return buildResponse(false, null,
//                        "Booking not found with ID: " + dto.getBookingId(),
//                        HttpStatus.NOT_FOUND.value());
//            }
//
//            // ----------------------- Step 2: Fetch Doctor -----------------------
//            Response doctorResponse = clinicAdminServiceClient.getDoctorById(dto.getDoctorId()).getBody();
//            if (doctorResponse == null || !doctorResponse.isSuccess() || doctorResponse.getData() == null) {
//                return buildResponse(false, null,
//                        "Doctor not found with ID: " + dto.getDoctorId(),
//                        HttpStatus.NOT_FOUND.value());
//            }
//            Map<String, Object> doctorData = objectMapper.convertValue(doctorResponse.getData(), Map.class);
//            dto.setDoctorName((String) doctorData.get("doctorName"));
//
//            // ----------------------- Step 3: Setup Clinic Info -----------------------
//            dto.setClinicId(Optional.ofNullable(dto.getClinicId()).orElse(""));
//            dto.setClinicName(Optional.ofNullable(dto.getClinicName()).orElse(""));
//
//            // ----------------------- Step 4: Calculate Visit Count & Type -----------------------
//            List<DoctorSaveDetails> previousVisits =
//                    repository.findByDoctorIdAndPatientIdAndSubServiceId(
//                            dto.getDoctorId(),
//                            dto.getPatientId(),
//                            dto.getSubServiceId()
//                    );
//            int visitCount = (previousVisits != null && !previousVisits.isEmpty()) ? previousVisits.size() + 1 : 1;
//            dto.setVisitCount(visitCount);
//            dto.setVisitType(VisitTypeUtil.getVisitTypeFromCount(visitCount));
//            dto.setVisitDateTime(LocalDateTime.now());
//
//            // ----------------------- Step 5: Save Visit -----------------------
//            DoctorSaveDetails entity = convertToEntity(dto);
//            entity.setVisitCount(visitCount);
//            DoctorSaveDetails savedVisit = repository.save(entity);
//
//            // ----------------------- Step 6: Fetch Clinic for Consultation Expiry -----------------------
//            Response clinicResponse = adminFeignClient.getClinicById(dto.getClinicId()).getBody();
//            int expirationDays = 0;
//            String consultationExpirationStr = "";
//            if (clinicResponse != null && clinicResponse.isSuccess() && clinicResponse.getData() != null) {
//                Map<String, Object> clinicData = objectMapper.convertValue(clinicResponse.getData(), Map.class);
//                if (clinicData.containsKey("consultationExpiration") && clinicData.get("consultationExpiration") != null) {
//                    consultationExpirationStr = clinicData.get("consultationExpiration").toString();
//                    expirationDays = parseExpirationDays(consultationExpirationStr);
//                }
//            }
//
//            // ----------------------- Step 7: Update Treatments & Calculate Sitting Summary -----------------------
//            LocalDateTime lastSittingDateTime = null;
//            boolean hasTreatments = false;
//
//            int totalSittings = 0;
//            int takenSittings = 0;
//            int pendingSittings = 0;
//            int currentSitting = 0;
//
//            TreatmentResponseDTO treatmentResponseDTO = new TreatmentResponseDTO();
//            Map<String, TreatmentDetailsDTO> generatedDataDTO = new HashMap<>();
//
//            if (savedVisit.getTreatments() != null && savedVisit.getTreatments().getGeneratedData() != null) {
//                hasTreatments = true;
//                Map<String, TreatmentDetails> generatedData = savedVisit.getTreatments().getGeneratedData();
//
//                for (Map.Entry<String, TreatmentDetails> entry : generatedData.entrySet()) {
//                    TreatmentDetails entityTreatment = entry.getValue();
//
//                    int total = Optional.ofNullable(entityTreatment.getTotalSittings()).orElse(0);
//                    int completed = 0;
//                    int currentSittingForThisTreatment = 0;
//
//                    List<DatesDTO> datesDTOList = new ArrayList<>();
//                    if (entityTreatment.getDates() != null && !entityTreatment.getDates().isEmpty()) {
//                        AtomicInteger counter = new AtomicInteger(1);
//
//                        for (Dates d : entityTreatment.getDates()) {
//                            try {
//                                LocalDate sittingDate = LocalDate.parse(d.getDate());
//                                LocalDateTime sittingDateTime = sittingDate.atStartOfDay();
//
//                                if (!sittingDate.isAfter(LocalDate.now())) {
//                                    completed++;
//                                    currentSittingForThisTreatment = counter.get();
//                                    currentSitting = currentSittingForThisTreatment; // overall current sitting
//                                }
//
//                                if (lastSittingDateTime == null || sittingDateTime.isAfter(lastSittingDateTime)) {
//                                    lastSittingDateTime = sittingDateTime;
//                                }
//
//                                if (d.getSitting() == null || d.getSitting() == 0) {
//                                    d.setSitting(counter.getAndIncrement());
//                                }
//
//                                // Convert entity Dates -> DatesDTO
//                                DatesDTO dtoDate = DatesDTO.builder()
//                                        .date(d.getDate())
//                                        .sitting(d.getSitting())
//                                        .build();
//                                datesDTOList.add(dtoDate);
//
//                            } catch (Exception ignored) {}
//                        }
//                    }
//
//                    // Convert entity to DTO
//                    TreatmentDetailsDTO dtoTreatment = TreatmentDetailsDTO.builder()
//                            .dates(datesDTOList)
//                            .reason(entityTreatment.getReason())
//                            .frequency(entityTreatment.getFrequency())
//                            .startDate(entityTreatment.getStartDate())
//                            .sittings(Math.max(total - completed, 0))
//                            .totalSittings(total)
//                            .takenSittings(completed)
//                            .pendingSittings(Math.max(total - completed, 0))
//                            .currentSitting(currentSittingForThisTreatment)
//                            .build();
//
//                    generatedDataDTO.put(entry.getKey(), dtoTreatment);
//
//                    totalSittings += total;
//                    takenSittings += completed;
//                }
//
//                pendingSittings = Math.max(totalSittings - takenSittings, 0);
//            }
//
//            // Set DTO data
//            treatmentResponseDTO.setGeneratedData(generatedDataDTO);
//            treatmentResponseDTO.setTotalSittings(totalSittings);
//            treatmentResponseDTO.setTakenSittings(takenSittings);
//            treatmentResponseDTO.setPendingSittings(pendingSittings);
//            treatmentResponseDTO.setCurrentSitting(currentSitting);
//
//            repository.save(savedVisit);
//
//            // ----------------------- Step 8: Consultation Start & Expiry -----------------------
//            LocalDateTime consultationStartDate = hasTreatments && lastSittingDateTime != null
//                    ? lastSittingDateTime.plusDays(1).withHour(0).withMinute(0).withSecond(0).withNano(0)
//                    : LocalDate.now().plusDays(1).atStartOfDay();
//
//            LocalDateTime consultationExpiryDate = consultationStartDate.plusDays(expirationDays);
//
//            savedVisit.setConsultationStartDate(consultationStartDate);
//            savedVisit.setConsultationExpiryDate(consultationExpiryDate);
//
//            repository.save(savedVisit);
//
//            // ----------------------- Step 9: Follow-up Next Date -----------------------
//            if (savedVisit.getFollowUp() != null && savedVisit.getFollowUp().getDurationValue() > 0) {
//                int durationValue = savedVisit.getFollowUp().getDurationValue();
//                String durationUnit = savedVisit.getFollowUp().getDurationUnit();
//
//                LocalDateTime baseDate = consultationStartDate.isAfter(LocalDateTime.now())
//                        ? consultationStartDate
//                        : LocalDateTime.now();
//
//                LocalDateTime nextFollowUpDate = switch (durationUnit.toLowerCase()) {
//                    case "days" -> consultationStartDate.plusDays(durationValue);
//                    case "weeks" -> consultationStartDate.plusWeeks(durationValue);
//                    case "months" -> consultationStartDate.plusMonths(durationValue);
//                    default -> consultationStartDate.plusDays(durationValue);
//                };
//
//                if (nextFollowUpDate.isBefore(consultationStartDate)) {
//                    nextFollowUpDate = consultationStartDate;
//                }
//
//                savedVisit.getFollowUp().setNextFollowUpDate(nextFollowUpDate.toString());
//            }
//
//            // ----------------------- Step 10: Free Follow-ups & Booking Status -----------------------
//            int freeFollowUpsLeft = Optional.ofNullable(bookingData.getFreeFollowUpsLeft()).orElse(0);
//            boolean consultationExpired = consultationExpiryDate != null && !LocalDateTime.now().isBefore(consultationExpiryDate);
//
//            boolean allSittingsCompleted = hasTreatments && savedVisit.getTreatments().getGeneratedData().values().stream()
//                    .allMatch(t -> t.getSittings() != null && t.getSittings() == 0);
//
//            boolean consultationStarted = LocalDateTime.now().isAfter(consultationStartDate) ||
//                                          LocalDateTime.now().isEqual(consultationStartDate);
//
//            String status;
//            if (!consultationStarted) {
//                status = "In-Progress";
//            } else if (!consultationExpired) {
//                if (allSittingsCompleted && freeFollowUpsLeft > 0) {
//                    freeFollowUpsLeft--;
//                }
//                status = (freeFollowUpsLeft <= 0) ? "Completed" : "In-Progress";
//            } else {
//                status = "Completed";
//            }
//
//            bookingData.setFreeFollowUpsLeft(Math.max(freeFollowUpsLeft, 0));
//            bookingData.setStatus(status);
//
//            bookingFeignClient.updateAppointment(bookingData);
//
//            // ----------------------- Step 11: Build Response -----------------------
//            DoctorSaveDetailsDTO savedDto = convertToDto(savedVisit);
//
//            // Set TreatmentResponseDTO
//            savedDto.setTreatments(treatmentResponseDTO);
//
//            // ✅ Set overall sitting summary fields in top-level DTO
//            savedDto.setTotalSittings(treatmentResponseDTO.getTotalSittings());
//            savedDto.setTakenSittings(treatmentResponseDTO.getTakenSittings());
//            savedDto.setPendingSittings(treatmentResponseDTO.getPendingSittings());
//            savedDto.setCurrentSitting(treatmentResponseDTO.getCurrentSitting());
//
//            return buildResponse(true, savedDto,
//                    "Doctor details saved successfully",
//                    HttpStatus.CREATED.value());
//
//        } catch (FeignException e) {
//            return buildResponse(false, null,
//                    "Error fetching doctor/booking/clinic details: " + e.getMessage(),
//                    HttpStatus.BAD_GATEWAY.value());
//        } catch (Exception e) {
//            return buildResponse(false, null,
//                    "Unexpected error: " + e.getMessage(),
//                    HttpStatus.INTERNAL_SERVER_ERROR.value());
//        }
//    }
//
//    /** Utility to parse "7 days" -> 7 */
//    private int parseExpirationDays(String expirationStr) {
//        if (expirationStr == null || expirationStr.isBlank()) return 0;
//        expirationStr = expirationStr.toLowerCase().trim();
//        try {
//            if (expirationStr.contains("day")) {
//                return Integer.parseInt(expirationStr.replaceAll("[^0-9]", ""));
//            }
//        } catch (NumberFormatException e) {
//            return 0;
//        }
//        return 0;
//    }

    @Override
    public Response saveDoctorDetails(DoctorSaveDetailsDTO dto) {
        try {
            // ----------------------- Step 0: Validate Booking ID -----------------------
            if (dto.getBookingId() == null || dto.getBookingId().isBlank()) {
                return buildResponse(false, null,
                        "Booking ID must not be null or empty",
                        HttpStatus.BAD_REQUEST.value());
            }

            // ----------------------- Step 1: Fetch Booking -----------------------
            ResponseEntity<ResponseStructure<BookingResponse>> bookingEntity =
                    bookingFeignClient.getBookedService(dto.getBookingId());

            if (bookingEntity == null || bookingEntity.getBody() == null) {
                return buildResponse(false, null,
                        "Unable to fetch booking details. Booking service returned null.",
                        HttpStatus.BAD_GATEWAY.value());
            }

            BookingResponse bookingData = bookingEntity.getBody().getData();
            if (bookingData == null) {
                return buildResponse(false, null,
                        "Booking not found with ID: " + dto.getBookingId(),
                        HttpStatus.NOT_FOUND.value());
            }

            // ----------------------- Step 2: Fetch Doctor -----------------------
            Response doctorResponse = clinicAdminServiceClient.getDoctorById(dto.getDoctorId()).getBody();
            if (doctorResponse == null || !doctorResponse.isSuccess() || doctorResponse.getData() == null) {
                return buildResponse(false, null,
                        "Doctor not found with ID: " + dto.getDoctorId(),
                        HttpStatus.NOT_FOUND.value());
            }
            Map<String, Object> doctorData = objectMapper.convertValue(doctorResponse.getData(), Map.class);
            dto.setDoctorName((String) doctorData.get("doctorName"));

            // ----------------------- Step 3: Setup Clinic Info -----------------------
            dto.setClinicId(Optional.ofNullable(dto.getClinicId()).orElse(""));
            dto.setClinicName(Optional.ofNullable(dto.getClinicName()).orElse(""));

            // ----------------------- Step 4: Calculate Visit Count & Type -----------------------
            List<DoctorSaveDetails> previousVisits =
                    repository.findByDoctorIdAndPatientIdAndSubServiceId(
                            dto.getDoctorId(),
                            dto.getPatientId(),
                            dto.getSubServiceId()
                    );
            int visitCount = (previousVisits != null && !previousVisits.isEmpty()) ? previousVisits.size() + 1 : 1;
            dto.setVisitCount(visitCount);
            dto.setVisitType(VisitTypeUtil.getVisitTypeFromCount(visitCount));
            dto.setVisitDateTime(LocalDateTime.now());

            // ----------------------- Step 5: Save Visit -----------------------
            DoctorSaveDetails entity = convertToEntity(dto);
            entity.setVisitCount(visitCount);
            DoctorSaveDetails savedVisit = repository.save(entity);

            // ----------------------- Step 6: Fetch Clinic for Consultation Expiry -----------------------
            Response clinicResponse = adminFeignClient.getClinicById(dto.getClinicId()).getBody();
            int expirationDays = 0;
            String consultationExpirationStr = "";
            if (clinicResponse != null && clinicResponse.isSuccess() && clinicResponse.getData() != null) {
                Map<String, Object> clinicData = objectMapper.convertValue(clinicResponse.getData(), Map.class);
                if (clinicData.containsKey("consultationExpiration") && clinicData.get("consultationExpiration") != null) {
                    consultationExpirationStr = clinicData.get("consultationExpiration").toString();
                    expirationDays = parseExpirationDays(consultationExpirationStr);
                }
            }

         // ----------------------- Step 7: Update Treatments & Calculate Sitting Summary -----------------------
            LocalDateTime lastSittingDateTime = null;
            boolean hasTreatments = false;

            // Prepare DTO to return in response
            TreatmentResponseDTO treatmentResponseDTO = new TreatmentResponseDTO();
            Map<String, TreatmentDetailsDTO> generatedDataDTO = new HashMap<>();

            // Overall counters for all treatments
            int overallTotalSittings = 0;
            int overallTakenSittings = 0;
            int overallPendingSittings = 0;
            int overallCurrentSitting = 0;

            // Check if treatments exist in saved visit
            if (savedVisit.getTreatments() != null && savedVisit.getTreatments().getGeneratedData() != null) {
                hasTreatments = true;
                Map<String, TreatmentDetails> generatedData = savedVisit.getTreatments().getGeneratedData();

                for (Map.Entry<String, TreatmentDetails> entry : generatedData.entrySet()) {
                    TreatmentDetails entityTreatment = entry.getValue();

                    int total = Optional.ofNullable(entityTreatment.getTotalSittings()).orElse(0);
                    int completed = 0;
                    int currentSittingForThisTreatment = 0;

                    // Convert entity Dates -> DatesDTO for DTO
                    List<DatesDTO> datesDTOList = new ArrayList<>();
                    if (entityTreatment.getDates() != null && !entityTreatment.getDates().isEmpty()) {
                        AtomicInteger counter = new AtomicInteger(1);

                        for (Dates d : entityTreatment.getDates()) {
                            try {
                                LocalDate sittingDate = LocalDate.parse(d.getDate());
                                LocalDateTime sittingDateTime = sittingDate.atStartOfDay();

                                // Count completed sittings (past or today)
                                if (!sittingDate.isAfter(LocalDate.now())) {
                                    completed++;
                                    currentSittingForThisTreatment = counter.get();
                                    overallCurrentSitting = Math.max(overallCurrentSitting, currentSittingForThisTreatment);
                                }

                                // Track last sitting date
                                if (lastSittingDateTime == null || sittingDateTime.isAfter(lastSittingDateTime)) {
                                    lastSittingDateTime = sittingDateTime;
                                }

                                // Assign sitting number if missing
                                if (d.getSitting() == null || d.getSitting() == 0) {
                                    d.setSitting(counter.getAndIncrement());
                                }

                                // Convert to DTO
                                DatesDTO dtoDate = DatesDTO.builder()
                                        .date(d.getDate())
                                        .sitting(d.getSitting())
                                        .build();
                                datesDTOList.add(dtoDate);

                            } catch (Exception ignored) {}
                        }
                    }

                    // Build TreatmentDetailsDTO for response
                    TreatmentDetailsDTO dtoTreatment = TreatmentDetailsDTO.builder()
                            .dates(datesDTOList)
                            .reason(entityTreatment.getReason())
                            .frequency(entityTreatment.getFrequency())
                            .startDate(entityTreatment.getStartDate())
                            .sittings(Math.max(total - completed, 0))
                            .totalSittings(total)
                            .takenSittings(completed)
                            .pendingSittings(Math.max(total - completed, 0))
                            .currentSitting(currentSittingForThisTreatment)
                            .build();

                    // Add to map for response DTO
                    generatedDataDTO.put(entry.getKey(), dtoTreatment);

                    // Update overall counters
                    overallTotalSittings += total;
                    overallTakenSittings += completed;
                    overallPendingSittings += Math.max(total - completed, 0);

                    // Update entity itself for DB
                    entityTreatment.setSittings(Math.max(total - completed, 0));
                    entityTreatment.setTakenSittings(completed);
                    entityTreatment.setPendingSittings(Math.max(total - completed, 0));
                    entityTreatment.setCurrentSitting(currentSittingForThisTreatment);
                }
            }

            // Set the response DTO fields with overall summary
            treatmentResponseDTO.setGeneratedData(generatedDataDTO);
            treatmentResponseDTO.setTotalSittings(overallTotalSittings);
            treatmentResponseDTO.setTakenSittings(overallTakenSittings);
            treatmentResponseDTO.setPendingSittings(overallPendingSittings);
            treatmentResponseDTO.setCurrentSitting(overallCurrentSitting);

            // Save back to entity (DB) with overall summary included
            TreatmentResponse treatmentEntity = TreatmentResponse.builder()
                    .generatedData(generatedDataDTO.entrySet().stream()
                        .collect(Collectors.toMap(
                            Map.Entry::getKey,
                            e -> TreatmentDetails.builder()
                                    .dates(e.getValue().getDates().stream()
                                            .map(d -> new Dates(d.getDate(), d.getSitting()))
                                            .collect(Collectors.toList()))
                                    .reason(e.getValue().getReason())
                                    .frequency(e.getValue().getFrequency())
                                    .startDate(e.getValue().getStartDate())
                                    .sittings(e.getValue().getSittings())
                                    .totalSittings(e.getValue().getTotalSittings())
                                    .takenSittings(e.getValue().getTakenSittings())
                                    .pendingSittings(e.getValue().getPendingSittings())
                                    .currentSitting(e.getValue().getCurrentSitting())
                                    .build()
                        ))
                    )
                    .selectedTestTreatment(savedVisit.getTreatments() != null
                            ? savedVisit.getTreatments().getSelectedTestTreatment() : null)
                    .totalSittings(overallTotalSittings)
                    .takenSittings(overallTakenSittings)
                    .pendingSittings(overallPendingSittings)
                    .currentSitting(overallCurrentSitting)
                    .build();

            savedVisit.setTreatments(treatmentEntity);
            repository.save(savedVisit);

            // ----------------------- Step 8: Consultation Start & Expiry -----------------------
            LocalDateTime consultationStartDate = hasTreatments && lastSittingDateTime != null
                    ? lastSittingDateTime.plusDays(1).withHour(0).withMinute(0).withSecond(0).withNano(0)
                    : LocalDate.now().plusDays(1).atStartOfDay();

            LocalDateTime consultationExpiryDate = consultationStartDate.plusDays(expirationDays);

            savedVisit.setConsultationStartDate(consultationStartDate);
            savedVisit.setConsultationExpiryDate(consultationExpiryDate);
            repository.save(savedVisit);

            // ----------------------- Step 9: Follow-up Next Date -----------------------
            if (savedVisit.getFollowUp() != null && savedVisit.getFollowUp().getDurationValue() > 0) {
                int durationValue = savedVisit.getFollowUp().getDurationValue();
                String durationUnit = savedVisit.getFollowUp().getDurationUnit();

                LocalDateTime baseDate = consultationStartDate.isAfter(LocalDateTime.now())
                        ? consultationStartDate
                        : LocalDateTime.now();

                LocalDateTime nextFollowUpDate = switch (durationUnit.toLowerCase()) {
                    case "days" -> consultationStartDate.plusDays(durationValue);
                    case "weeks" -> consultationStartDate.plusWeeks(durationValue);
                    case "months" -> consultationStartDate.plusMonths(durationValue);
                    default -> consultationStartDate.plusDays(durationValue);
                };

                if (nextFollowUpDate.isBefore(consultationStartDate)) {
                    nextFollowUpDate = consultationStartDate;
                }

                savedVisit.getFollowUp().setNextFollowUpDate(nextFollowUpDate.toString());
            }

            // ----------------------- Step 10: Free Follow-ups & Booking Status -----------------------
            int freeFollowUpsLeft = Optional.ofNullable(bookingData.getFreeFollowUpsLeft()).orElse(0);
            boolean consultationExpired = consultationExpiryDate != null && !LocalDateTime.now().isBefore(consultationExpiryDate);

            boolean allSittingsCompleted = hasTreatments && savedVisit.getTreatments().getGeneratedData().values().stream()
                    .allMatch(t -> t.getSittings() != null && t.getSittings() == 0);

            boolean consultationStarted = LocalDateTime.now().isAfter(consultationStartDate) ||
                                          LocalDateTime.now().isEqual(consultationStartDate);

            String status;
            if (!consultationStarted) {
                status = "In-Progress";
            } else if (!consultationExpired) {
                if (allSittingsCompleted && freeFollowUpsLeft > 0) {
                    freeFollowUpsLeft--;
                }
                status = (freeFollowUpsLeft <= 0) ? "Completed" : "In-Progress";
            } else {
                status = "Completed";
            }

            // ----------------------- Step 11: Update Booking Service -----------------------
            bookingData.setFreeFollowUpsLeft(Math.max(freeFollowUpsLeft, 0));
            bookingData.setStatus(status);

            // ✅ Set sitting summary fields for Booking service
            bookingData.setTotalSittings(overallTotalSittings);
            bookingData.setTakenSittings(overallTakenSittings);
            bookingData.setPendingSittings(overallPendingSittings);
            bookingData.setCurrentSitting(overallCurrentSitting);

            bookingFeignClient.updateAppointment(bookingData);

            // ----------------------- Step 12: Build Response -----------------------
            DoctorSaveDetailsDTO savedDto = convertToDto(savedVisit);
            savedDto.setTreatments(treatmentResponseDTO);

            return buildResponse(true, savedDto,
                    "Doctor details saved successfully",
                    HttpStatus.CREATED.value());

        } catch (FeignException e) {
            return buildResponse(false, null,
                    "Error fetching doctor/booking/clinic details: " + e.getMessage(),
                    HttpStatus.BAD_GATEWAY.value());
        } catch (Exception e) {
            return buildResponse(false, null,
                    "Unexpected error: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    /** Utility to parse "7 days" -> 7 */
    private int parseExpirationDays(String expirationStr) {
        if (expirationStr == null || expirationStr.isBlank()) return 0;
        expirationStr = expirationStr.toLowerCase().trim();
        try {
            if (expirationStr.contains("day")) {
                return Integer.parseInt(expirationStr.replaceAll("[^0-9]", ""));
            }
        } catch (NumberFormatException e) {
            return 0;
        }
        return 0;
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
        if (dto == null) return null;

        return DoctorSaveDetails.builder()
                .id(dto.getId())
                .patientId(dto.getPatientId())
                .doctorId(dto.getDoctorId())
                .doctorName(dto.getDoctorName())
                .clinicId(dto.getClinicId())
                .clinicName(dto.getClinicName())
                .customerId(dto.getCustomerId())
                .bookingId(dto.getBookingId())
                .subServiceId(dto.getSubServiceId()) // ✅ include subServiceId always
                // Symptoms
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
                        : null)
                // prescriptionPdf (store as-is or base64 string depending on upstream)
                .prescriptionPdf(dto.getPrescriptionPdf() != null
                        ? dto.getPrescriptionPdf().stream()
                                .map(this::decodeIfBase64)
                                .collect(Collectors.toList())
                        : null)
                // Tests
                .tests(dto.getTests() != null ?
                        TestDetails.builder()
                                .selectedTests(dto.getTests().getSelectedTests())
                                .testReason(dto.getTests().getTestReason())
                                .build()
                        : null)
                // Treatments
                .treatments(dto.getTreatments() != null && dto.getTreatments().getGeneratedData() != null ?
                        TreatmentResponse.builder()
                                .selectedTestTreatment(dto.getTreatments().getSelectedTestTreatment())
                                .generatedData(dto.getTreatments().getGeneratedData().entrySet().stream()
                                        .collect(Collectors.toMap(
                                                Map.Entry::getKey,
                                                e -> {
                                                    TreatmentDetailsDTO tDto = e.getValue();
                                                    // build Dates list
                                                    List<Dates> dates = tDto.getDates() != null
                                                            ? tDto.getDates().stream()
                                                                    .map(d -> Dates.builder()
                                                                            .date(d.getDate())
                                                                            .sitting(d.getSitting())
                                                                            .build())
                                                                    .collect(Collectors.toList())
                                                            : null;

                                                    Integer totalSittings = tDto.getTotalSittings();
                                                    if (totalSittings == null) {
                                                        totalSittings = dates != null ? dates.size() : 0;
                                                    }

                                                    return TreatmentDetails.builder()
                                                            .dates(dates)
                                                            .reason(tDto.getReason())
                                                            .frequency(tDto.getFrequency())
                                                            .sittings(tDto.getSittings())
                                                            .startDate(tDto.getStartDate())
                                                            .totalSittings(totalSittings)
                                                            .build();
                                                }
                                        )))
                                .build()
                        : null)
                // Follow up
                .followUp(dto.getFollowUp() != null ?
                        FollowUpDetails.builder()
                                .durationValue(dto.getFollowUp().getDurationValue())
                                .durationUnit(dto.getFollowUp().getDurationUnit())
                                .nextFollowUpDate(dto.getFollowUp().getNextFollowUpDate())
                                .followUpNote(dto.getFollowUp().getFollowUpNote())
                                .build()
                        : null)
                // Prescription object
                .prescription(dto.getPrescription() != null ?
                        PrescriptionDetails.builder()
                                .medicines(dto.getPrescription().getMedicines() != null
                                        ? dto.getPrescription().getMedicines().stream()
                                                .map(med -> Medicines.builder()
                                                        .id(UUID.randomUUID())
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
                // Visit meta
                .visitType(dto.getVisitType())
                .visitDateTime(dto.getVisitDateTime())
                .visitCount(dto.getVisitCount())
                // Consultation dates (if present in DTO)
                .consultationStartDate(dto.getConsultationStartDate())
                .consultationExpiryDate(dto.getConsultationExpiryDate())
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
//                .subServiceId(entity.getSubServiceId())
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
                                                        .totalSittings(e.getValue().getTotalSittings() != null ? e.getValue().getTotalSittings() :
                                                            (e.getValue().getDates() != null ? e.getValue().getDates().size() : 0))

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
                .consultationExpiryDate(entity.getConsultationExpiryDate())
                .consultationStartDate(entity.getConsultationStartDate())
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
