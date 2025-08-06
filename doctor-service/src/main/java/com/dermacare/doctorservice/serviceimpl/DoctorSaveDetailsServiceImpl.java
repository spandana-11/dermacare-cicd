package com.dermacare.doctorservice.serviceimpl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.dermacare.doctorservice.dermacaredoctorutils.VisitTypeUtil;
import com.dermacare.doctorservice.dto.DoctorSaveDetailsDTO;
import com.dermacare.doctorservice.dto.Response;
import com.dermacare.doctorservice.feignclient.ClinicAdminServiceClient;
import com.dermacare.doctorservice.model.DoctorSaveDetails;
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

            // Set clinicId and clinicName from frontend or use empty string as fallback
            String clinicId = dto.getClinicId() != null ? dto.getClinicId() : "";
            String clinicName = dto.getClinicName() != null ? dto.getClinicName() : "";

            dto.setClinicId(clinicId);
            dto.setClinicName(clinicName);

            // Step 2: Check for existing visits
            List<DoctorSaveDetails> previousVisits = repository.findByPatientId(dto.getPatientId());

            boolean isRevisit = previousVisits.stream()
                .anyMatch(existing -> dto.getBookingId().equals(existing.getBookingId()));

            long uniqueBookingCount = previousVisits.stream()
                .map(DoctorSaveDetails::getBookingId)
                .filter(bid -> bid != null && !bid.isEmpty())
                .distinct()
                .count();

            int visitNumber = (int) uniqueBookingCount + (isRevisit ? 0 : 1);

            // Step 3: Set visit metadata
            dto.setVisitDateTime(LocalDateTime.now());
            int visitTypeCount = (int) uniqueBookingCount + (isRevisit ? 0 : 1);
            dto.setVisitType(VisitTypeUtil.getVisitTypeFromCount(visitTypeCount));


            // Step 4: Convert and save entity
            DoctorSaveDetails entity = convertToEntity(dto);
            DoctorSaveDetails saved = repository.save(entity);

            // Step 5: Return full saved details and visit number
            DoctorSaveDetailsDTO savedDto = convertToDto(saved);

            return buildResponse(true, Map.of(
                    "savedDetails", savedDto,
                    "visitNumber", visitNumber
            ), "Doctor details saved successfully", HttpStatus.CREATED.value());

        } catch (FeignException e) {
            return buildResponse(false, null, "Error fetching doctor details: " + e.getMessage(), HttpStatus.BAD_GATEWAY.value());
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
            // Optionally fetch doctor/clinic info again if needed
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

    // Converts DTO to Entity
    private DoctorSaveDetails convertToEntity(DoctorSaveDetailsDTO dto) {
        return DoctorSaveDetails.builder()
                .patientId(dto.getPatientId())
                .doctorId(dto.getDoctorId())
                .doctorName(dto.getDoctorName())
                .clinicId(dto.getClinicId())
                .clinicName(dto.getClinicName())
                .bookingId(dto.getBookingId())
                .symptoms(dto.getSymptoms())
                .tests(dto.getTests())
                .treatments(dto.getTreatments())
                .followUp(dto.getFollowUp())
                .prescription(dto.getPrescription())
                .visitType(dto.getVisitType())
                .visitDateTime(dto.getVisitDateTime())
                .build();
    }

    // Converts Entity to DTO
    private DoctorSaveDetailsDTO convertToDto(DoctorSaveDetails entity) {
        return DoctorSaveDetailsDTO.builder()
                .id(entity.getId())
                .patientId(entity.getPatientId())
                .doctorId(entity.getDoctorId())
                .doctorName(entity.getDoctorName())
                .clinicId(entity.getClinicId())
                .clinicName(entity.getClinicName())
                .bookingId(entity.getBookingId())
                .symptoms(entity.getSymptoms())
                .tests(entity.getTests())
                .treatments(entity.getTreatments())
                .followUp(entity.getFollowUp())
                .prescription(entity.getPrescription())
                .visitType(entity.getVisitType())
                .visitDateTime(entity.getVisitDateTime())
                .build();
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
}
