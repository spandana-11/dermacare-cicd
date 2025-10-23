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
import com.clinicadmin.dto.Response;
import com.clinicadmin.dto.ResponseStructure;
import com.clinicadmin.dto.WardBoyDTO;
import com.clinicadmin.entity.DoctorLoginCredentials;
import com.clinicadmin.entity.WardBoy;
import com.clinicadmin.feignclient.AdminServiceClient;
import com.clinicadmin.repository.DoctorLoginCredentialsRepository;
import com.clinicadmin.repository.WardBoyRepository;
import com.clinicadmin.service.WardBoyService;
import com.clinicadmin.utils.WardBoyMapper;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WardBoyServiceImpl implements WardBoyService {

	@Autowired
	private WardBoyRepository wardBoyRepository;
	@Autowired
	private DoctorLoginCredentialsRepository credentialsRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	AdminServiceClient adminServiceClient;

	@Autowired
	ObjectMapper objectMapper;

	private static final String CHAR_POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	private static final SecureRandom random = new SecureRandom();

	private String generateWardBoyId() {
		return "WB_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
	}

	@Override
	public ResponseStructure<WardBoyDTO> addWardBoy(WardBoyDTO dto) {
		if (wardBoyRepository.findByContactNumber(dto.getContactNumber()).isPresent()) {

			return ResponseStructure.buildResponse(null,
					"WardBoy already exists with contact number : " + dto.getContactNumber(), HttpStatus.CONFLICT,
					HttpStatus.CONFLICT.value());
		}
		if (credentialsRepository.existsByUsername(dto.getContactNumber())) {
			return ResponseStructure.buildResponse(null, "Login credentials already exist for this mobile number",
					HttpStatus.CONFLICT, HttpStatus.CONFLICT.value());
		}
		ResponseEntity<Response> res = adminServiceClient.getBranchById(dto.getBranchId());
		Branch br = objectMapper.convertValue(res.getBody().getData(), Branch.class);

		WardBoy wardBoy = WardBoyMapper.toEntity(dto);
		wardBoy.setBranchName(br.getBranchName());
		wardBoy.setWardBoyId(generateWardBoyId());

		WardBoy saved = wardBoyRepository.save(wardBoy);

		String username = dto.getContactNumber();
		String rawPassword = generateStructuredPassword();
		String encodedPassword = passwordEncoder.encode(rawPassword);

		DoctorLoginCredentials credentials = DoctorLoginCredentials.builder().staffId(saved.getWardBoyId())
				.staffName(saved.getFullName()).hospitalId(saved.getClinicId()).hospitalName(saved.getHospitalName())
				.branchId(saved.getBranchId()).branchName(saved.getBranchName()).username(username)
				.password(encodedPassword).role(dto.getRole()).permissions(saved.getPermissions()).build();
		credentialsRepository.save(credentials);

		WardBoyDTO responseDto = WardBoyMapper.toDTO(saved);
		responseDto.setBranchName(saved.getBranchName());
		responseDto.setUserName(username);
		responseDto.setPassword(rawPassword);

		return ResponseStructure.buildResponse(responseDto, "WardBoy added successfully", HttpStatus.CREATED,
				HttpStatus.CREATED.value());
	}

	@Override
	public ResponseStructure<WardBoyDTO> getWardBoyById(String id) {
		WardBoy wardBoy = wardBoyRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("WardBoy not found with ID: " + id));
		WardBoyDTO dto = WardBoyMapper.toDTO(wardBoy);
		return ResponseStructure.buildResponse(dto, "WardBoy fetched successfully", HttpStatus.OK,
				HttpStatus.OK.value());
	}

	@Override
	public ResponseStructure<List<WardBoyDTO>> getAllWardBoys() {
		List<WardBoyDTO> wardBoys = wardBoyRepository.findAll().stream().map(WardBoyMapper::toDTO)
				.collect(Collectors.toList());

		return ResponseStructure.buildResponse(wardBoys, "All WardBoys fetched successfully", HttpStatus.OK,
				HttpStatus.OK.value());
	}

	@Override
	public ResponseStructure<WardBoyDTO> updateWardBoy(String id, WardBoyDTO dto) {
		WardBoy existing = wardBoyRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("WardBoy not found with ID: " + id));

		if (dto.getContactNumber() != null && !existing.getContactNumber().equals(dto.getContactNumber())) {
			if (wardBoyRepository.findByContactNumber(dto.getContactNumber()).isPresent()) {
				throw new RuntimeException("WardBoy already exists with contact number: " + dto.getContactNumber());
			}
			existing.setContactNumber(dto.getContactNumber());
		}
		if (dto.getBranchId() != null)
			existing.setBranchId(dto.getBranchId());
		if (dto.getRole() != null)
			existing.setRole(dto.getRole());
		if (dto.getClinicId() != null)
			existing.setClinicId(dto.getClinicId());
		if (dto.getHospitalName() != null)
			existing.setHospitalName(dto.getHospitalName());
		if (dto.getPermissions() != null)
			existing.setPermissions(dto.getPermissions());
		if (dto.getFullName() != null)
			existing.setFullName(dto.getFullName());
		if (dto.getClinicId() != null)
			existing.setClinicId(dto.getClinicId());
		if (dto.getDateOfBirth() != null)
			existing.setDateOfBirth(dto.getDateOfBirth());
		if (dto.getGovernmentId() != null)
			existing.setGovernmentId(dto.getGovernmentId());
		if (dto.getDateOfJoining() != null)
			existing.setDateOfJoining(dto.getDateOfJoining());
		if (dto.getDepartment() != null)
			existing.setDepartment(dto.getDepartment());
		if (dto.getBankAccountDetails() != null)
			existing.setBankAccountDetails(dto.getBankAccountDetails());
		if (dto.getAddress() != null)
			existing.setAddress(dto.getAddress());
		if (dto.getGender() != null)
			existing.setGender(dto.getGender());
		if (dto.getWorkExprience() != null)
			existing.setWorkExprience(dto.getWorkExprience());
		if (dto.getShiftTimingsOrAvailability() != null)
			existing.setShiftTimingsOrAvailability(dto.getShiftTimingsOrAvailability());
		if (dto.getEmergencyContact() != null)
			existing.setEmergencyContact(dto.getEmergencyContact());
		
		if (dto.getPermissions() != null)
			existing.setPermissions(dto.getPermissions());

		if (dto.getMedicalFitnessCertificate() != null)
			existing.setMedicalFitnessCertificate(WardBoyMapper.toEntity(dto).getMedicalFitnessCertificate());
		if (dto.getBasicHealthFirstAidTrainingCertificate() != null)
			existing.setBasicHealthFirstAidTrainingCertificate(
					WardBoyMapper.toEntity(dto).getBasicHealthFirstAidTrainingCertificate());
		if (dto.getPoliceVerification() != null)
			existing.setPoliceVerification(WardBoyMapper.toEntity(dto).getPoliceVerification());

		if (dto.getEmailId() != null)
			existing.setEmailId(dto.getEmailId());
		if (dto.getPreviousEmploymentHistory() != null)
			existing.setPreviousEmploymentHistory(dto.getPreviousEmploymentHistory());

		if (dto.getBasicHealthFirstAidTrainingCertificate() != null)
			existing.setBasicHealthFirstAidTrainingCertificate(
					WardBoyMapper.toEntity(dto).getBasicHealthFirstAidTrainingCertificate());
		if (dto.getPoliceVerificationCertificate() != null)
			existing.setPoliceVerificationCertificate(WardBoyMapper.toEntity(dto).getPoliceVerificationCertificate());

		if (dto.getBasicHealthFirstAidTrainingCertificate() != null)
			existing.setProfilePicture(WardBoyMapper.toEntity(dto).getProfilePicture());

		WardBoy saved = wardBoyRepository.save(existing);
		WardBoyDTO responseDto = WardBoyMapper.toDTO(saved);

		return ResponseStructure.buildResponse(responseDto, "WardBoy updated successfully", HttpStatus.OK,
				HttpStatus.OK.value());
	}

	@Override
	public ResponseStructure<Void> deleteWardBoy(String id) {
	    try {
	        // ✅ Step 1: Check if WardBoy exists
	        if (!wardBoyRepository.existsById(id)) {
	            return ResponseStructure.buildResponse(
	                null,
	                "WardBoy not found with ID: " + id,
	                HttpStatus.NOT_FOUND,
	                HttpStatus.NOT_FOUND.value()
	            );
	        }

	        // ✅ Step 2: Delete WardBoy record
	        wardBoyRepository.deleteById(id);

	        // ✅ Step 3: Delete corresponding login credentials (if exist)
	        Optional<DoctorLoginCredentials> credentials = credentialsRepository.findByStaffId(id);
	        if (credentials.isPresent()) {
	            credentialsRepository.deleteById(credentials.get().getId());
	        }

	        // ✅ Step 4: Return success response
	        return ResponseStructure.buildResponse(
	            null,
	            "WardBoy and credentials deleted successfully",
	            HttpStatus.OK,
	            HttpStatus.OK.value()
	        );

	    } catch (Exception e) {
	        return ResponseStructure.buildResponse(
	            null,
	            "Error deleting WardBoy: " + e.getMessage(),
	            HttpStatus.INTERNAL_SERVER_ERROR,
	            HttpStatus.INTERNAL_SERVER_ERROR.value()
	        );
	    }
	}


	@Override
	public ResponseStructure<List<WardBoyDTO>> getWardBoysByClinicId(String clinicId) {
		List<WardBoyDTO> wardBoys = wardBoyRepository.findAllByClinicId(clinicId).stream().map(WardBoyMapper::toDTO)
				.collect(Collectors.toList());

		return ResponseStructure.buildResponse(wardBoys, "WardBoys fetched successfully for clinicId: " + clinicId,
				HttpStatus.OK, HttpStatus.OK.value());
	}

	@Override
	public ResponseStructure<WardBoyDTO> getWardBoyByIdAndClinicId(String wardBoyId, String clinicId) {
		WardBoy wardBoy = wardBoyRepository.findByWardBoyIdAndClinicId(wardBoyId, clinicId).orElseThrow(
				() -> new RuntimeException("WardBoy not found with ID: " + wardBoyId + " for clinicId: " + clinicId));

		WardBoyDTO dto = WardBoyMapper.toDTO(wardBoy);
		return ResponseStructure.buildResponse(dto, "WardBoy fetched successfully", HttpStatus.OK,
				HttpStatus.OK.value());
	}

	// -------------- Generate password--------------------------
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
	public ResponseStructure<List<WardBoyDTO>> getWardBoysByClinicIdAndBranchId(String clinicId, String branchId) {
	    // Fetch all ward boys for the given clinicId and branchId
	    List<WardBoyDTO> wardBoys = wardBoyRepository
	            .findAllByClinicIdAndBranchId(clinicId, branchId) // Repository method
	            .stream()
	            .map(WardBoyMapper::toDTO) // Convert Entity → DTO
	            .collect(Collectors.toList());

	    // Return response
	    if (wardBoys.isEmpty()) {
	        return ResponseStructure.buildResponse(
	                null,
	                "No WardBoys found for clinicId: " + clinicId + " and branchId: " + branchId,
	                HttpStatus.NOT_FOUND,
	                HttpStatus.NOT_FOUND.value()
	        );
	    }

	    return ResponseStructure.buildResponse(
	            wardBoys,
	            "WardBoys fetched successfully for clinicId: " + clinicId + " and branchId: " + branchId,
	            HttpStatus.OK,
	            HttpStatus.OK.value()
	    );
	}

}