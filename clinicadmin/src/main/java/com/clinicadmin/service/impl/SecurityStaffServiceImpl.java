package com.clinicadmin.service.impl;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.clinicadmin.dto.Branch;
import com.clinicadmin.dto.Response;
import com.clinicadmin.dto.ResponseStructure;
import com.clinicadmin.dto.SecurityStaffDTO;
import com.clinicadmin.entity.DoctorLoginCredentials;
import com.clinicadmin.entity.SecurityStaff;
import com.clinicadmin.feignclient.AdminServiceClient;
import com.clinicadmin.repository.DoctorLoginCredentialsRepository;
import com.clinicadmin.repository.SecurityStaffRepository;
import com.clinicadmin.service.SecurityStaffService;
import com.clinicadmin.utils.IdGenerator;
import com.clinicadmin.utils.SecurityStaffMapper;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SecurityStaffServiceImpl implements SecurityStaffService {

	@Autowired
	private SecurityStaffRepository repository;

	@Autowired
	private DoctorLoginCredentialsRepository credentialsRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	AdminServiceClient adminServiceClient;

	@Autowired
	ObjectMapper objectMapper;

	@Override
	public ResponseStructure<SecurityStaffDTO> addSecurityStaff(SecurityStaffDTO dto) {

		// Check if contact number already exists
		List<SecurityStaff> existingContacts = repository.findByContactNumber(dto.getContactNumber());
		if (!existingContacts.isEmpty()) {
			return ResponseStructure.buildResponse(null, "Contact number already exists", HttpStatus.CONFLICT,
					HttpStatus.CONFLICT.value());
		}
		if (credentialsRepository.existsByUsername(dto.getContactNumber())) {
			return ResponseStructure.buildResponse(null, "Login credentials already exist for this mobile number",
					HttpStatus.CONFLICT, HttpStatus.CONFLICT.value());
		}
		dto.setSecurityStaffId(IdGenerator.generateSecurityStaffId());

		ResponseEntity<Response> res = adminServiceClient.getBranchById(dto.getBranchId());
		Branch br = objectMapper.convertValue(res.getBody().getData(), Branch.class);

		SecurityStaff staff = SecurityStaffMapper.toEntity(dto);
		staff.setBranchName(br.getBranchName());

		SecurityStaff saved = repository.save(staff);

		String username = saved.getContactNumber();
		String rawPassword = generateStructuredPassword();
		String encodedPassword = passwordEncoder.encode(rawPassword);

		DoctorLoginCredentials credentials = DoctorLoginCredentials.builder().staffId(saved.getSecurityStaffId())
				.staffName(saved.getFullName()).hospitalId(saved.getClinicId()).hospitalName(saved.getHospitalName())
				.branchId(saved.getBranchId()).branchName(saved.getBranchName()).username(username)
				.password(encodedPassword).role(dto.getRole()).permissions(saved.getPermissions()).build();
		credentialsRepository.save(credentials);
		SecurityStaffDTO responseDTO = SecurityStaffMapper.toDTO(saved);
		responseDTO.setBranchName(saved.getBranchName());
		responseDTO.setUserName(username);
		responseDTO.setPassword(rawPassword); // expose only on create
		return ResponseStructure.buildResponse(responseDTO, "Security staff added successfully", HttpStatus.CREATED,
				HttpStatus.CREATED.value());
	}

	@Override
	public ResponseStructure<SecurityStaff> updateSecurityStaff(SecurityStaff staff) {
	    Optional<SecurityStaff> existingOpt = repository.findById(staff.getSecurityStaffId());
	    if (existingOpt.isEmpty()) {
	        return ResponseStructure.buildResponse(null, "Security staff not found",
	                HttpStatus.NOT_FOUND, HttpStatus.NOT_FOUND.value());
	    }

	    List<SecurityStaff> contactOwners = repository.findByContactNumber(staff.getContactNumber());
	    boolean conflict = contactOwners.stream()
	            .anyMatch(s -> !s.getSecurityStaffId().equals(staff.getSecurityStaffId()));

	    if (conflict) {
	        return ResponseStructure.buildResponse(null, "Contact number already exists",
	                HttpStatus.CONFLICT, HttpStatus.CONFLICT.value());
	    }

	    SecurityStaff existing = existingOpt.get();

	    // ---------- Update Normal Fields ----------
	    existing.setFullName(staff.getFullName());
	    existing.setHospitalName(staff.getHospitalName());
	    existing.setBranchId(staff.getBranchId());
	    existing.setRole(staff.getRole());
	    existing.setPermissions(staff.getPermissions());
	    existing.setDateOfBirth(staff.getDateOfBirth());
	    existing.setGender(staff.getGender());
	    existing.setContactNumber(staff.getContactNumber());
	    existing.setGovermentId(staff.getGovermentId());
	    existing.setDateOfJoining(staff.getDateOfJoining());
	    existing.setDepartment(staff.getDepartment());
	    existing.setAddress(staff.getAddress());
	    existing.setBankAccountDetails(staff.getBankAccountDetails());
	    existing.setEmailId(staff.getEmailId());
	    existing.setTraningOrGuardLicense(staff.getTraningOrGuardLicense());
	    existing.setPreviousEmployeeHistory(staff.getPreviousEmployeeHistory());
	    existing.setShiftTimingsOrAvailability(staff.getShiftTimingsOrAvailability());

	    // ---------- Encode Files Before Save ----------
	    existing.setPoliceVerification(SecurityStaffMapper.encode(staff.getPoliceVerification()));
	    existing.setPoliceVerificationCertificate(SecurityStaffMapper.encode(staff.getPoliceVerificationCertificate()));
	    existing.setMedicalFitnessCertificate(SecurityStaffMapper.encode(staff.getMedicalFitnessCertificate()));
	    existing.setProfilePicture(SecurityStaffMapper.encode(staff.getProfilePicture()));
	    existing.setUpdatedDate(LocalDate.now().toString());
	    // ---------- Save ----------
	    SecurityStaff updated = repository.save(existing);

	    // ---------- Decode Before Response ----------
	    updated.setPoliceVerification(SecurityStaffMapper.decode(updated.getPoliceVerification()));
	    updated.setPoliceVerificationCertificate(SecurityStaffMapper.decode(updated.getPoliceVerificationCertificate()));
	    updated.setMedicalFitnessCertificate(SecurityStaffMapper.decode(updated.getMedicalFitnessCertificate()));
	    updated.setProfilePicture(SecurityStaffMapper.decode(updated.getProfilePicture()));
	    

	    return ResponseStructure.buildResponse(updated, "Security staff updated successfully",
	            HttpStatus.OK, HttpStatus.OK.value());
	}

	@Override
	public ResponseStructure<SecurityStaffDTO> getSecurityStaffById(String staffId) {
		return repository.findById(staffId)
				.map(staff -> ResponseStructure.buildResponse(SecurityStaffMapper.toDTO(staff), "Staff found",
						HttpStatus.OK, HttpStatus.OK.value()))
				.orElse(ResponseStructure.buildResponse(null, "Staff not found", HttpStatus.NOT_FOUND,
						HttpStatus.NOT_FOUND.value()));
	}

	@Override
	public ResponseStructure<List<SecurityStaffDTO>> getAllByClinicId(String clinicId) {
		List<SecurityStaff> staffList = repository.findByClinicId(clinicId);

		List<SecurityStaffDTO> dtoList = staffList.stream().map(SecurityStaffMapper::toDTO)
				.collect(Collectors.toList());

		return ResponseStructure.buildResponse(dtoList,
				dtoList.isEmpty() ? "No staff found for this clinic" : "Staff list fetched", HttpStatus.OK,
				HttpStatus.OK.value());
	}

	@Override
	public ResponseStructure<String> deleteSecurityStaff(String staffId) {
	    Optional<SecurityStaff> existing = repository.findById(staffId);
	    if (existing.isEmpty()) {
	        return ResponseStructure.buildResponse(
	            null,
	            "Staff not found",
	            HttpStatus.NOT_FOUND,
	            HttpStatus.NOT_FOUND.value()
	        );
	    }

	    // ✅ Delete staff record
	    repository.deleteById(staffId);

	    // ✅ Delete corresponding credentials if exist
	    Optional<DoctorLoginCredentials> credentials = credentialsRepository.findByStaffId(staffId);
	    if (credentials.isPresent()) {
	        credentialsRepository.deleteById(credentials.get().getId());
	    }

	    return ResponseStructure.buildResponse(
	        staffId,
	        "Staff and credentials deleted successfully",
	        HttpStatus.OK,
	        HttpStatus.OK.value()
	    );
	}

	
	@Override
	public ResponseStructure<List<SecurityStaffDTO>> getSecurityStaffByClinicIdAndBranchId(String clinicId, String branchId) {
	    List<SecurityStaff> staffList = repository.findByClinicIdAndBranchId(clinicId, branchId);

	    if (staffList == null || staffList.isEmpty()) {
	        return ResponseStructure.buildResponse(
	                null,
	                "No security staff found for Clinic ID: " + clinicId + " and Branch ID: " + branchId,
	                HttpStatus.OK,
	                HttpStatus.OK.value()
	        );
	    }

	    List<SecurityStaffDTO> dtoList = staffList.stream()
	            .map(SecurityStaffMapper::toDTO) // Converts Entity to DTO
	            .collect(Collectors.toList());

	    return ResponseStructure.buildResponse(
	            dtoList,
	            "Security staff retrieved successfully for Clinic ID: " + clinicId + " and Branch ID: " + branchId,
	            HttpStatus.OK,
	            HttpStatus.OK.value()
	    );
	}



// --------------   Generate password--------------------------
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