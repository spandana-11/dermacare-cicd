package com.clinicadmin.sevice.impl;

import java.security.SecureRandom;
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
import com.clinicadmin.dto.LabTechnicianRequestDTO;
import com.clinicadmin.dto.Response;
import com.clinicadmin.dto.ResponseStructure;
import com.clinicadmin.entity.DoctorLoginCredentials;
import com.clinicadmin.entity.LabTechnicianEntity;
import com.clinicadmin.feignclient.AdminServiceClient;
import com.clinicadmin.repository.DoctorLoginCredentialsRepository;
import com.clinicadmin.repository.LabTechnicianRepository;
import com.clinicadmin.service.LabTechnicianService;
import com.clinicadmin.utils.LabTechnicianMapper;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class LabTechnicianServiceImpl implements LabTechnicianService {

	@Autowired
	private LabTechnicianRepository repository;

	@Autowired
	private DoctorLoginCredentialsRepository credentialsRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	AdminServiceClient adminServiceClient;

	@Autowired
	ObjectMapper objectMapper;

	// ✅ Create Lab Technician
	@Override
	public ResponseStructure<LabTechnicianRequestDTO> createLabTechnician(LabTechnicianRequestDTO dto) {
		if (repository.existsByContactNumber(dto.getContactNumber())) {
			return ResponseStructure.buildResponse(null, "Lab Technician with this contact number already exists",
					HttpStatus.CONFLICT, HttpStatus.CONFLICT.value());
		}
		if (credentialsRepository.existsByUsername(dto.getContactNumber())) {
			return ResponseStructure.buildResponse(null, "Login credentials already exist for this mobile number",
					HttpStatus.CONFLICT, HttpStatus.CONFLICT.value());
		}

		ResponseEntity<Response> res = adminServiceClient.getBranchById(dto.getBranchId());
		Branch br = objectMapper.convertValue(res.getBody().getData(), Branch.class);

		LabTechnicianEntity entity = LabTechnicianMapper.toEntity(dto);
		entity.setBranchName(br.getBranchName());
		entity.setId(generateLabTechId());
//        entity.setUserName(dto.getContactNumber()); // username = contact number
//        entity.setPassword(generateStructuredPassword()); // random password

		LabTechnicianEntity saved = repository.save(entity);

		String username = dto.getContactNumber();
		String rawPassword = generateStructuredPassword();
		String encodedPassword = passwordEncoder.encode(rawPassword);
		DoctorLoginCredentials credentials = DoctorLoginCredentials.builder().staffId(saved.getId())
				.staffName(saved.getFullName()).hospitalId(saved.getClinicId()).hospitalName(saved.getHospitalName())
				.branchId(saved.getBranchId()).branchName(saved.getBranchName()).username(username)
				.password(encodedPassword).role(dto.getRole()).permissions(saved.getPermissions()).build();
		credentialsRepository.save(credentials);

		LabTechnicianRequestDTO responseDTO = LabTechnicianMapper.toDTO(saved);
		responseDTO.setBranchName(saved.getBranchName());
		responseDTO.setUserName(username);
		responseDTO.setPassword(rawPassword); // expose only on create

		return ResponseStructure.buildResponse(responseDTO, "Lab Technician created successfully", HttpStatus.CREATED,
				HttpStatus.CREATED.value());
	}

//	// ✅ Login Method
//	@Override
//	public OnBoardResponse login(LabTechnicianLogin loginRequest) {
//		Optional<LabTechnicianEntity> optional = repository.findByUserNameAndPassword(loginRequest.getUserName(),
//				loginRequest.getPassword());
//
//		if (optional.isEmpty()) {
//			return new OnBoardResponse("Invalid username or password", HttpStatus.UNAUTHORIZED,
//					HttpStatus.UNAUTHORIZED.value(), null, null);
//		}
//
//		LabTechnicianEntity user = optional.get();
//
//		// ✅ Wrap permissions inside the role
//		Map<String, Map<String, List<String>>> wrappedPermissions = Map.of(user.getRole(), user.getPermissions());
//
//		return new OnBoardResponse("Login successful", HttpStatus.OK, HttpStatus.OK.value(), user.getRole(),
//				wrappedPermissions);
//	}

////✅ Reset Password
//	@Override
//	public ResponseStructure<String> resetPassword(String contactNumber, LabTechnicanRestPassword request) {
//		LabTechnicianEntity entity = repository.findByContactNumber(contactNumber)
//				.orElseThrow(() -> new RuntimeException("User not found with contactNumber: " + contactNumber));
//
//		if (!entity.getPassword().equals(request.getCurrentpassword())) {
//			return ResponseStructure.buildResponse(null, "Current password is incorrect", HttpStatus.BAD_REQUEST,
//					HttpStatus.BAD_REQUEST.value());
//		}
//
//		if (!request.getNewPassword().equals(request.getConformPassword())) {
//			return ResponseStructure.buildResponse(null, "New password and Confirm password do not match",
//					HttpStatus.BAD_REQUEST, HttpStatus.BAD_REQUEST.value());
//		}
//
//		entity.setPassword(request.getNewPassword());
//		repository.save(entity);
//
//		return ResponseStructure.buildResponse("Password updated successfully", "Success", HttpStatus.OK,
//				HttpStatus.OK.value());
//	}

	// ✅ Get by ID
	@Override
	public ResponseStructure<LabTechnicianRequestDTO> getLabTechnicianById(String id) {
		Optional<LabTechnicianEntity> optional = repository.findById(id);
		if (optional.isEmpty()) {
			return ResponseStructure.buildResponse(null, "Lab Technician not found", HttpStatus.NOT_FOUND,
					HttpStatus.NOT_FOUND.value());
		}

		LabTechnicianRequestDTO dto = LabTechnicianMapper.toDTO(optional.get());
		return ResponseStructure.buildResponse(dto, "Lab Technician retrieved successfully", HttpStatus.OK,
				HttpStatus.OK.value());
	}

	// ✅ Get All
	@Override
	public ResponseStructure<List<LabTechnicianRequestDTO>> getAllLabTechnicians() {
		List<LabTechnicianEntity> entities = repository.findAll();
		List<LabTechnicianRequestDTO> dtos = entities.stream().map(LabTechnicianMapper::toDTO)
				.collect(Collectors.toList());

		return ResponseStructure.buildResponse(dtos,
				dtos.isEmpty() ? "No Lab Technicians found" : "Lab Technicians retrieved successfully", HttpStatus.OK,
				HttpStatus.OK.value());
	}

	@Override
	public ResponseStructure<LabTechnicianRequestDTO> updateLabTechnician(String id, LabTechnicianRequestDTO dto) {
	    Optional<LabTechnicianEntity> optional = repository.findById(id);
	    if (optional.isEmpty()) {
	        return ResponseStructure.buildResponse(null, "Lab Technician not found", HttpStatus.NOT_FOUND,
	                HttpStatus.NOT_FOUND.value());
	    }

	    LabTechnicianEntity existing = optional.get();

	    // Update normal fields if provided
	    if (dto.getHospitalName() != null) existing.setHospitalName(dto.getHospitalName());
	    if (dto.getBranchId() != null) existing.setBranchId(dto.getBranchId());
	    if (dto.getRole() != null) existing.setRole(dto.getRole());
	    if (dto.getFullName() != null) existing.setFullName(dto.getFullName());
	    if (dto.getGender() != null) existing.setGender(dto.getGender());
	    if (dto.getDateOfBirth() != null) existing.setDateOfBirth(dto.getDateOfBirth());
	    if (dto.getContactNumber() != null) existing.setContactNumber(dto.getContactNumber());
	    if (dto.getGovernmentId() != null) existing.setGovernmentId(dto.getGovernmentId());
	    if (dto.getQualificationOrCertifications() != null) existing.setQualificationOrCertifications(dto.getQualificationOrCertifications());
	    if (dto.getDateOfJoining() != null) existing.setDateOfJoining(dto.getDateOfJoining());
	    if (dto.getDepartmentOrAssignedLab() != null) existing.setDepartmentOrAssignedLab(dto.getDepartmentOrAssignedLab());
	    if (dto.getYearOfExperience() != null) existing.setYearOfExperience(dto.getYearOfExperience());
	    if (dto.getSpecialization() != null) existing.setSpecialization(dto.getSpecialization());
	    if (dto.getShiftTimingsOrAvailability() != null) existing.setShiftTimingsOrAvailability(dto.getShiftTimingsOrAvailability());
	    if (dto.getAddress() != null) existing.setAddress(dto.getAddress());
	    if (dto.getEmergencyContact() != null) existing.setEmergencyContact(dto.getEmergencyContact());
	    if (dto.getBankAccountDetails() != null) existing.setBankAccountDetails(dto.getBankAccountDetails());

	    // ✅ Update files (Base64 strings)
	    if (dto.getMedicalFitnessCertificate() != null)
	        existing.setMedicalFitnessCertificate(dto.getMedicalFitnessCertificate());
	    if (dto.getLabLicenseOrRegistration() != null)
	        existing.setLabLicenseOrRegistration(dto.getLabLicenseOrRegistration());
	    if (dto.getProfilePicture() != null)
	        existing.setProfilePicture(dto.getProfilePicture());

	    // Update remaining fields
	    if (dto.getEmailId() != null) existing.setEmailId(dto.getEmailId());
	    if (dto.getVaccinationStatus() != null) existing.setVaccinationStatus(dto.getVaccinationStatus());
	    if (dto.getPreviousEmploymentHistory() != null) existing.setPreviousEmploymentHistory(dto.getPreviousEmploymentHistory());
	    if (dto.getPermissions() != null) existing.setPermissions(dto.getPermissions());

	    // Save updated entity
	    LabTechnicianEntity updated = repository.save(existing);

	    // Return DTO with Base64 files intact
	    return ResponseStructure.buildResponse(LabTechnicianMapper.toDTO(updated),
	            "Lab Technician updated successfully", HttpStatus.OK, HttpStatus.OK.value());
	}


	// ✅ Delete
	@Override
	public ResponseStructure<String> deleteLabTechnician(String id) {
		Optional<LabTechnicianEntity> optional = repository.findById(id);
		if (optional.isEmpty()) {
			return ResponseStructure.buildResponse(null, "Lab Technician not found", HttpStatus.NOT_FOUND,
					HttpStatus.NOT_FOUND.value());
		}
		repository.deleteById(id);
		return ResponseStructure.buildResponse("Deleted Successfully", "Lab Technician deleted successfully",
				HttpStatus.OK, HttpStatus.OK.value());
	}

	// ✅ Get all Lab Technicians by Clinic Id
	@Override
	public ResponseStructure<List<LabTechnicianRequestDTO>> getLabTechniciansByClinic(String clinicId) {
		List<LabTechnicianEntity> entities = repository.findByClinicId(clinicId);

		List<LabTechnicianRequestDTO> dtos = entities.stream().map(LabTechnicianMapper::toDTO)
				.collect(Collectors.toList());

		return ResponseStructure.buildResponse(dtos, dtos.isEmpty() ? "No lab technicians found for clinic " + clinicId
				: "Lab technicians retrieved successfully", HttpStatus.OK, HttpStatus.OK.value());
	}

	// ✅ Get single Lab Technician by Clinic Id and Technician Id
	@Override
	public ResponseStructure<LabTechnicianRequestDTO> getLabTechnicianByClinicAndId(String clinicId,
			String technicianId) {
		LabTechnicianEntity entity = repository.findByClinicIdAndId(clinicId, technicianId)
				.orElseThrow(() -> new RuntimeException(
						"Lab Technician not found with clinicId: " + clinicId + " and technicianId: " + technicianId));

		LabTechnicianRequestDTO dto = LabTechnicianMapper.toDTO(entity);

		return ResponseStructure.<LabTechnicianRequestDTO>builder().statusCode(200)
				.message("Lab Technician data fetched successfully").data(dto).build();
	}

	// ----------------- Helper methods -------------------
	private String generateLabTechId() {
		return "LAB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
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
}
