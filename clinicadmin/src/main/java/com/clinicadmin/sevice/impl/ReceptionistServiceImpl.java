package com.clinicadmin.sevice.impl;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.clinicadmin.dto.Branch;
import com.clinicadmin.dto.ReceptionistRequestDTO;
import com.clinicadmin.dto.Response;
import com.clinicadmin.dto.ResponseStructure;
import com.clinicadmin.entity.DoctorLoginCredentials;
import com.clinicadmin.entity.ReceptionistEntity;
import com.clinicadmin.feignclient.AdminServiceClient;
import com.clinicadmin.repository.DoctorLoginCredentialsRepository;
import com.clinicadmin.repository.ReceptionistRepository;
import com.clinicadmin.service.ReceptionistService;
import com.clinicadmin.utils.ReceptionistMapper;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ReceptionistServiceImpl implements ReceptionistService {

    @Autowired
    private ReceptionistRepository repository;

	@Autowired
	private DoctorLoginCredentialsRepository credentialsRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;
	
	@Autowired
	AdminServiceClient adminServiceClient;
	
	@Autowired
	ObjectMapper objectMapper;

	
    @Override
    public ResponseStructure<ReceptionistRequestDTO> createReceptionist(ReceptionistRequestDTO dto) {
        if (repository.existsByContactNumber(dto.getContactNumber())) {
            return ResponseStructure.buildResponse(
                    null,
                    "Receptionist with this contact number already exists",
                    HttpStatus.CONFLICT,
                    HttpStatus.CONFLICT.value()
            );
        }
		ResponseEntity <Response> res=adminServiceClient.getBranchById(dto.getBranchId());
		Branch br =objectMapper.convertValue(res.getBody().getData(), Branch.class);

        ReceptionistEntity entity = ReceptionistMapper.toEntity(dto);
        entity.setId(generateReceptionistId());
        entity.setBranchName(br.getBranchName());
       

        ReceptionistEntity saved = repository.save(entity);
        
        String username = dto.getContactNumber();
		String rawPassword = generateStructuredPassword();
		String encodedPassword = passwordEncoder.encode(rawPassword);

		DoctorLoginCredentials credentials = DoctorLoginCredentials.builder()
				.staffId(saved.getId())
				.staffName(saved.getFullName())
				.hospitalId(saved.getClinicId())
				.hospitalName(saved.getHospitalName())
				.branchId(saved.getBranchId())
				.branchName(saved.getBranchName())
				.username(username)
				.password(encodedPassword)
				.role(dto.getRole())
				.permissions(saved.getPermissions())
				.build();
		credentialsRepository.save(credentials);
	

        ReceptionistRequestDTO responseDTO = ReceptionistMapper.toDTO(saved);
        responseDTO.setBranchName(saved.getBranchName());
        responseDTO.setUserName(username);
		responseDTO.setPassword(rawPassword); // expose only on create

        return ResponseStructure.buildResponse(
                responseDTO,
                "Receptionist created successfully",
                HttpStatus.CREATED,
                HttpStatus.CREATED.value()
        );
    }

    @Override
    public ResponseStructure<ReceptionistRequestDTO> getReceptionistById(String id) {
        Optional<ReceptionistEntity> optional = repository.findById(id);
        if (optional.isEmpty()) {
            return ResponseStructure.buildResponse(
                    null,
                    "Receptionist not found",
                    HttpStatus.NOT_FOUND,
                    HttpStatus.NOT_FOUND.value()
            );
        }
        return ResponseStructure.buildResponse(
                ReceptionistMapper.toDTO(optional.get()),
                "Receptionist retrieved successfully",
                HttpStatus.OK,
                HttpStatus.OK.value()
        );
    }

    @Override
    public ResponseStructure<List<ReceptionistRequestDTO>> getAllReceptionists() {
        List<ReceptionistEntity> entities = repository.findAll();
        List<ReceptionistRequestDTO> dtos = entities.stream()
                .map(ReceptionistMapper::toDTO)
                .collect(Collectors.toList());

        return ResponseStructure.buildResponse(
                dtos,
                dtos.isEmpty() ? "No Receptionists found" : "Receptionists retrieved successfully",
                HttpStatus.OK,
                HttpStatus.OK.value()
        );
    }
    public ResponseStructure<ReceptionistRequestDTO> updateReceptionist(String id, ReceptionistRequestDTO dto) {
        Optional<ReceptionistEntity> optional = repository.findById(id);
        if (optional.isEmpty()) {
            return ResponseStructure.buildResponse(
                    null,
                    "Receptionist not found",
                    HttpStatus.NOT_FOUND,
                    HttpStatus.NOT_FOUND.value()
            );
        }

        ReceptionistEntity existing = optional.get();

        // 🔹 update normal fields
        if (dto.getFullName() != null) existing.setFullName(dto.getFullName());
        if (dto.getHospitalName() != null) existing.setHospitalName(dto.getHospitalName());
        if (dto.getRole() != null) existing.setRole(dto.getRole());
        if (dto.getBranchId() != null) existing.setBranchId(dto.getBranchId());
        if (dto.getDateOfBirth() != null) existing.setDateOfBirth(dto.getDateOfBirth());
        if (dto.getContactNumber() != null) existing.setContactNumber(dto.getContactNumber());
        if (dto.getQualification() != null) existing.setQualification(dto.getQualification());
        if (dto.getGovernmentId() != null) existing.setGovernmentId(dto.getGovernmentId());
        if (dto.getDateOfJoining() != null) existing.setDateOfJoining(dto.getDateOfJoining());
        if (dto.getDepartment() != null) existing.setDepartment(dto.getDepartment());
        if (dto.getAddress() != null) existing.setAddress(dto.getAddress());
        if (dto.getEmergencyContact() != null) existing.setEmergencyContact(dto.getEmergencyContact());
        if (dto.getBankAccountDetails() != null) existing.setBankAccountDetails(dto.getBankAccountDetails());
        if (dto.getEmailId() != null) existing.setEmailId(dto.getEmailId());
        if (dto.getPreviousEmploymentHistory() != null) existing.setPreviousEmploymentHistory(dto.getPreviousEmploymentHistory());
        if (dto.getShiftTimingsOrAvailability() != null) existing.setShiftTimingsOrAvailability(dto.getShiftTimingsOrAvailability());

        // 🔹 update Base64 fields (PDF/Image)
        if (dto.getProfilePicture() != null) 
            existing.setProfilePicture(encodeIfNotBase64(dto.getProfilePicture()));

        if (dto.getGraduationCertificate() != null) 
            existing.setGraduationCertificate(encodeIfNotBase64(dto.getGraduationCertificate()));

        if (dto.getComputerSkillsProof() != null) 
            existing.setComputerSkillsProof(encodeIfNotBase64(dto.getComputerSkillsProof()));

        ReceptionistEntity updated = repository.save(existing);

        return ResponseStructure.buildResponse(
                ReceptionistMapper.toDTO(updated),
                "Receptionist updated successfully",
                HttpStatus.OK,
                HttpStatus.OK.value()
        );
    }

    /**
     * Utility method to encode string to Base64 only if not already encoded.
     */
    private String encodeIfNotBase64(String input) {
        try {
            Base64.getDecoder().decode(input); // already Base64
            return input;
        } catch (IllegalArgumentException e) {
            return Base64.getEncoder().encodeToString(input.getBytes(StandardCharsets.UTF_8));
        }
    }


    @Override
    public ResponseStructure<String> deleteReceptionist(String id) {
        Optional<ReceptionistEntity> optional = repository.findById(id);
        if (optional.isEmpty()) {
            return ResponseStructure.buildResponse(
                    null,
                    "Receptionist not found",
                    HttpStatus.NOT_FOUND,
                    HttpStatus.NOT_FOUND.value()
            );
        }
        repository.deleteById(id);
        return ResponseStructure.buildResponse(
                "Deleted Successfully",
                "Receptionist deleted successfully",
                HttpStatus.OK,
                HttpStatus.OK.value()
        );
    }

//    @Override
//    public OnBoardResponse login(String userName, String password) {
//        Optional<ReceptionistEntity> optional = repository.findByUserName(userName);
//
//        if (optional.isEmpty() || !optional.get().getPassword().equals(password)) {
//            return new OnBoardResponse(
//                    "Invalid username or password",
//                    HttpStatus.UNAUTHORIZED,
//                    HttpStatus.UNAUTHORIZED.value(),
//                    null,
//                    null
//            );
//        }
//
//        ReceptionistEntity user = optional.get();
//
//        // ✅ Wrap permissions inside the role
//        Map<String, Map<String, List<String>>> wrappedPermissions = Map.of(
//            user.getRole(), user.getPermissions()
//        );
//
//        return new OnBoardResponse(
//                "Login successful",
//                HttpStatus.OK,
//                HttpStatus.OK.value(),
//                user.getRole(),
//                wrappedPermissions
//        );
//    }


//    @Override
//    public ResponseStructure<String> resetPassword(String contactNumber, ReceptionistRestPassword request) {
//        ReceptionistEntity entity = repository.findByContactNumber(contactNumber)
//                .orElseThrow(() -> new RuntimeException("Receptionist not found with contact number: " + contactNumber));
//
//        ResponseStructure<String> response = new ResponseStructure<>();
//
//        if (!entity.getPassword().equals(request.getCurrentpassword())) {
//            response.setData(null);
//            response.setMessage("Current password is incorrect");
//            response.setHttpStatus(HttpStatus.BAD_REQUEST);
//            return response;
//        }
//
//        if (!request.getNewPassword().equals(request.getConformPassword())) {
//            response.setData(null);
//            response.setMessage("New password and Confirm password do not match");
//            response.setHttpStatus(HttpStatus.BAD_REQUEST);
//            return response;
//        }
//
//        entity.setPassword(request.getNewPassword());
//        repository.save(entity);
//
//        response.setData("Password updated successfully");
//        response.setMessage("Success");
//        response.setHttpStatus(HttpStatus.OK);
//        return response;
//    }

    // ----------------- Helper methods -------------------
    private String generateReceptionistId() {
        return "REC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String generateStructuredPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 10; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    @Override
    public ResponseStructure<List<ReceptionistRequestDTO>> getReceptionistsByClinic(String clinicId) {
        List<ReceptionistEntity> entities = repository.findByClinicId(clinicId);
        List<ReceptionistRequestDTO> dtos = entities.stream()
                .map(ReceptionistMapper::toDTO)
                .collect(Collectors.toList());

        return ResponseStructure.buildResponse(
                dtos,
                dtos.isEmpty() ? "No receptionists found for clinic " + clinicId
                               : "Receptionists retrieved successfully",
                HttpStatus.OK,
                HttpStatus.OK.value()
        );
    }

    @Override
    public ResponseStructure<ReceptionistRequestDTO> getReceptionistByClinicAndId(String clinicId, String receptionistId) {
        ReceptionistEntity entity = repository.findByClinicIdAndId(clinicId, receptionistId)
                .orElseThrow(() -> new RuntimeException(
                        "Receptionist not found with clinicId: " + clinicId + " and receptionistId: " + receptionistId));

        ReceptionistRequestDTO dto = ReceptionistMapper.toDTO(entity);

        return ResponseStructure.<ReceptionistRequestDTO>builder()
                .statusCode(200)
                .message("Receptionist data fetched successfully")
                .data(dto)
                .build();
    }
}
