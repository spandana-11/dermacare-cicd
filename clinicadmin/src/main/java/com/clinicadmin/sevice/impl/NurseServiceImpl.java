package com.clinicadmin.sevice.impl;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.clinicadmin.dto.Branch;
import com.clinicadmin.dto.NurseDTO;
import com.clinicadmin.dto.Response;
import com.clinicadmin.entity.DoctorLoginCredentials;
import com.clinicadmin.entity.Nurse;
import com.clinicadmin.feignclient.AdminServiceClient;
import com.clinicadmin.repository.DoctorLoginCredentialsRepository;
import com.clinicadmin.repository.NurseRepository;
import com.clinicadmin.service.NurseService;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class NurseServiceImpl implements NurseService {
	@Autowired
	NurseRepository nurseRepository;

	@Autowired
	DoctorLoginCredentialsRepository credentialsRepository;

	@Autowired
	PasswordEncoder passwordEncoder;
	
	@Autowired
	AdminServiceClient adminServiceClient;
	
	@Autowired
	ObjectMapper objectMapper;
		
	@Override
	public Response nureseOnboarding(NurseDTO dto) {
		Response response = new Response();
		dto.trimNurseFields();
		if (nurseRepository.existsByNurseContactNumber(dto.getNurseContactNumber())) {
			response.setSuccess(false);
			response.setData(null);
			response.setMessage("Nurese with this mobile number already exists");
			response.setStatus(HttpStatus.BAD_REQUEST.value());
			return response;
		}
		ResponseEntity <Response> res=adminServiceClient.getBranchById(dto.getBranchId());
		Branch br =objectMapper.convertValue(res.getBody().getData(), Branch.class);
		Nurse nurse = mapNurseDtoTONurseEntity(dto);
		nurse.setBranchName(br.getBranchName());
		
		String nurseId = generateNurseId();
		nurse.setNurseId(nurseId);
		String username = dto.getNurseContactNumber();
		String rawPassword = generateStructuredPassword();
		String encodedPassword = passwordEncoder.encode(rawPassword);

		Nurse savedNurse = nurseRepository.save(nurse);

		DoctorLoginCredentials credentials = DoctorLoginCredentials.builder()
				.staffId(savedNurse.getNurseId())
				.staffName(savedNurse.getFullName())
				.hospitalId(savedNurse.getHospitalId())
				.hospitalName(savedNurse.getHospitalName())
				.branchId(savedNurse.getBranchId())
				.branchName(savedNurse.getBranchName())
				.username(username)
				.password(encodedPassword)
				.role(dto.getRole())
				.permissions(savedNurse.getPermissions())
				.build();
		credentialsRepository.save(credentials);

		NurseDTO savedNurseDTO = mapNurseEntityToNurseDTO(savedNurse);
		savedNurseDTO.setUserName(username);
		savedNurseDTO.setPassword(rawPassword);

		response.setSuccess(true);
		response.setData(savedNurseDTO);
		response.setMessage("Nurse added successfully ");
		response.setStatus(HttpStatus.CREATED.value());

		return response;
	}

	@Override
	public Response getAllNursesByHospital(String hospitalId) {
		Response response = new Response();

		if (hospitalId == null || hospitalId.isBlank()) {
			response.setSuccess(false);
			response.setData(null);
			response.setMessage("Hospital ID must not be empty");
			response.setStatus(HttpStatus.BAD_REQUEST.value());
			return response;
		}

		List<Nurse> nurses = nurseRepository.findByHospitalId(hospitalId);
		if (nurses.isEmpty()) {
			response.setSuccess(true);
			response.setData(List.of());
			response.setMessage("No nurses found for this hospital");
			response.setStatus(HttpStatus.OK.value());
			return response;
		}

		List<NurseDTO> nurseDTOs = nurses.stream().map(this::mapNurseEntityToNurseDTO).toList();
		response.setSuccess(true);
		response.setData(nurseDTOs);
		response.setMessage("Nurses fetched successfully");
		response.setStatus(HttpStatus.OK.value());
		return response;
	}

	@Override
	public Response getNurseByHospitalAndNurseId(String hospitalId, String nurseId) {
		Response response = new Response();

		if (hospitalId == null || hospitalId.isBlank() || nurseId == null || nurseId.isBlank()) {
			response.setSuccess(false);
			response.setData(null);
			response.setMessage("Hospital ID and Nurse ID must not be empty");
			response.setStatus(HttpStatus.BAD_REQUEST.value());
			return response;
		}

		return nurseRepository.findByHospitalIdAndNurseId(hospitalId, nurseId).map(nurse -> {
			NurseDTO dto = mapNurseEntityToNurseDTO(nurse);
			response.setSuccess(true);
			response.setData(dto);
			response.setMessage("Nurse found");
			response.setStatus(HttpStatus.OK.value());
			return response;
		}).orElseGet(() -> {
			response.setSuccess(false);
			response.setData(null);
			response.setMessage("Nurse not found");
			response.setStatus(HttpStatus.NOT_FOUND.value());
			return response;
		});
	}

	@Override
	public Response updateNurse(String hospitalId, String nurseId, NurseDTO dto) {
		Response response = new Response();

		// 🔹 Validate hospitalId & nurseId
		if (hospitalId == null || hospitalId.isBlank() || nurseId == null || nurseId.isBlank()) {
			response.setSuccess(false);
			response.setData(null);
			response.setMessage("Hospital ID and Nurse ID must not be empty");
			response.setStatus(HttpStatus.BAD_REQUEST.value());
			return response;
		}

		// 🔹 Validate DTO mandatory fields (only if provided)
		if (dto.getFullName() != null && dto.getFullName().isBlank()) {
			response.setSuccess(false);
			response.setData(null);
			response.setMessage("Full name must not be blank");
			response.setStatus(HttpStatus.BAD_REQUEST.value());
			return response;
		}
		if (dto.getNurseContactNumber() != null && !dto.getNurseContactNumber().matches("\\d{10}")) {
			response.setSuccess(false);
			response.setData(null);
			response.setMessage("Valid 10-digit contact number is required");
			response.setStatus(HttpStatus.BAD_REQUEST.value());
			return response;
		}
		if (dto.getEmailId() != null && !dto.getEmailId().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
			response.setSuccess(false);
			response.setData(null);
			response.setMessage("Invalid email format");
			response.setStatus(HttpStatus.BAD_REQUEST.value());
			return response;
		}

		return nurseRepository.findByHospitalIdAndNurseId(hospitalId, nurseId).map(existingNurse -> {
			// update fields from DTO only if not null
			if (dto.getHospitalName() != null)
				existingNurse.setHospitalName(dto.getHospitalName());
			if (dto.getHospitalId() != null)
				existingNurse.setHospitalId(dto.getHospitalId());
			if (dto.getRole() != null)
				existingNurse.setRole(dto.getRole());
			if (dto.getFullName() != null)
				existingNurse.setFullName(dto.getFullName());

			if (dto.getDateOfBirth() != null)
				existingNurse.setDateOfBirth(dto.getDateOfBirth());

			if (dto.getDepartment() != null)
				existingNurse.setDepartment(dto.getDepartment());

			if (dto.getEmailId() != null)
				existingNurse.setEmailId(dto.getEmailId());

			if (dto.getNurseContactNumber() != null)
				existingNurse.setNurseContactNumber(dto.getNurseContactNumber());

			if (dto.getGovernmentId() != null)
				existingNurse.setGovernmentId(dto.getGovernmentId());

			if (dto.getBankAccountDetails() != null)
				existingNurse.setBankAccountDetails(dto.getBankAccountDetails());

			if (dto.getInsuranceOrESIdetails() != null)
				existingNurse.setInsuranceOrESIdetails(dto.getInsuranceOrESIdetails());

			// boolean -> only update if explicitly provided
			existingNurse.setVaccinationStatus(dto.getVaccinationStatus());

			if (dto.getPreviousEmploymentHistory() != null)
				existingNurse.setPreviousEmploymentHistory(dto.getPreviousEmploymentHistory());

			if (dto.getAddress() != null)
				existingNurse.setAddress(dto.getAddress());
			if (dto.getGender() != null)
				existingNurse.setGender(dto.getGender());
			if (dto.getEmergencyContactNumber() != null)
				existingNurse.setEmergencyContactNumber(dto.getEmergencyContactNumber());
			if (dto.getYearsOfExperience() != null)
				existingNurse.setYearsOfExperience(dto.getYearsOfExperience());
			if (dto.getQualifications() != null)
				existingNurse.setQualifications(dto.getQualifications());
			if (dto.getQualifications() != null)
				existingNurse.setQualifications(dto.getQualifications());
			if (dto.getShiftTimingOrAvailability() != null)
				existingNurse.setShiftTimingOrAvailability(dto.getShiftTimingOrAvailability());
			// ⚡ Profile Picture (Base64 encode/decode)
			if (dto.getProfilePicture() != null && !dto.getProfilePicture().isBlank()) {
				// Ensure string is valid Base64
				try {
					byte[] decodedBytes = Base64.getDecoder().decode(dto.getProfilePicture());
					String encodedString = Base64.getEncoder().encodeToString(decodedBytes);
					existingNurse.setProfilePicture(encodedString); // store as Base64
				} catch (IllegalArgumentException e) {
					response.setSuccess(false);
					response.setData(null);
					response.setMessage("Invalid Base64 format for profile picture");
					response.setStatus(HttpStatus.BAD_REQUEST.value());
					return response;
				}
			}
			if (dto.getPermissions() != null)
				existingNurse.setPermissions(dto.getPermissions());

			Nurse updated = nurseRepository.save(existingNurse);
			NurseDTO updatedDTO = mapNurseEntityToNurseDTO(updated);

			response.setSuccess(true);
			response.setData(updatedDTO);
			response.setMessage("Nurse updated successfully");
			response.setStatus(HttpStatus.OK.value());
			return response;
		}).orElseGet(() -> {
			response.setSuccess(false);
			response.setData(null);
			response.setMessage("Nurse not found for update");
			response.setStatus(HttpStatus.NOT_FOUND.value());
			return response;
		});
	}

	@Override
	public Response deleteNurse(String hospitalId, String nurseId) {
		Response response = new Response();

		if (hospitalId == null || hospitalId.isBlank() || nurseId == null || nurseId.isBlank()) {
			response.setSuccess(false);
			response.setData(null);
			response.setMessage("Hospital ID and Nurse ID must not be empty");
			response.setStatus(HttpStatus.BAD_REQUEST.value());
			return response;
		}

		if (nurseRepository.findByHospitalIdAndNurseId(hospitalId, nurseId).isPresent()) {
			nurseRepository.deleteByHospitalIdAndNurseId(hospitalId, nurseId);
			response.setSuccess(true);
			response.setData(null);
			response.setMessage("Nurse deleted successfully");
			response.setStatus(HttpStatus.NO_CONTENT.value());
		} else {
			response.setSuccess(false);
			response.setData(null);
			response.setMessage("Nurse not found");
			response.setStatus(HttpStatus.NOT_FOUND.value());
		}
		return response;
	}

//---------------------------Mapper Methods-------------------------------------------------------------------------------- 
	private Nurse mapNurseDtoTONurseEntity(NurseDTO dto) {
		Nurse nurse = new Nurse();
//		nurse.setNurseId(dto.getNurseId());
		nurse.setHospitalId(dto.getHospitalId());
		nurse.setHospitalName(dto.getHospitalName());
		nurse.setBranchId(dto.getBranchId());
		nurse.setRole(dto.getRole());
		nurse.setFullName(dto.getFullName());
		nurse.setDateOfBirth(dto.getDateOfBirth());
		nurse.setNurseContactNumber(dto.getNurseContactNumber());
		nurse.setGovernmentId(dto.getGovernmentId());
		nurse.setNursingLicense(encodeIfNotBase64(dto.getNursingLicense()));
		nurse.setNursingCouncilRegistration(encodeIfNotBase64(dto.getNursingCouncilRegistration()));
		nurse.setNursingDegreeOrDiplomaCertificate(
				encodeIfNotBase64(dto.getNursingDegreeOrDiplomaCertificate()));
		nurse.setDateOfJoining(dto.getDateOfJoining());
		nurse.setDepartment(dto.getDepartment());
		nurse.setBankAccountDetails(dto.getBankAccountDetails());
		nurse.setMedicalFitnessCertificate(encodeIfNotBase64(dto.getMedicalFitnessCertificate()));
		nurse.setEmailId(dto.getEmailId());
		nurse.setPreviousEmploymentHistory(dto.getPreviousEmploymentHistory());
		nurse.setExperienceCertificates(encodeIfNotBase64(dto.getExperienceCertificates()));
		nurse.setProfilePicture(encodeIfNotBase64(dto.getProfilePicture()));
		nurse.setVaccinationStatus(dto.getVaccinationStatus());
		nurse.setInsuranceOrESIdetails(dto.getInsuranceOrESIdetails());

		nurse.setAddress(dto.getAddress());
		nurse.setGender(dto.getGender());
		nurse.setQualifications(dto.getQualifications());
		nurse.setShiftTimingOrAvailability(dto.getShiftTimingOrAvailability());
		nurse.setYearsOfExperience(dto.getYearsOfExperience());
		nurse.setEmergencyContactNumber(dto.getEmergencyContactNumber());
		nurse.setPermissions(dto.getPermissions());

		return nurse;
	}

	private NurseDTO mapNurseEntityToNurseDTO(Nurse nurse) {
		NurseDTO dto = new NurseDTO();
		dto.setId(nurse.getId().toString());
		dto.setNurseId(nurse.getNurseId());
		dto.setHospitalId(nurse.getHospitalId());
		dto.setHospitalName(nurse.getHospitalName());
		dto.setBranchId(nurse.getBranchId());
		dto.setRole(nurse.getRole());
		dto.setFullName(nurse.getFullName());
		dto.setDateOfBirth(nurse.getDateOfBirth());
		dto.setNurseContactNumber(nurse.getNurseContactNumber());
		dto.setGovernmentId(nurse.getGovernmentId());
		dto.setNursingLicense(safeReturnAsBase64(nurse.getNursingLicense()));
		dto.setNursingDegreeOrDiplomaCertificate(
				safeReturnAsBase64(nurse.getNursingDegreeOrDiplomaCertificate()));
		dto.setNursingCouncilRegistration(
				safeReturnAsBase64(nurse.getNursingCouncilRegistration()));
		dto.setDateOfJoining(nurse.getDateOfJoining());
		dto.setDepartment(nurse.getDepartment());
		dto.setBankAccountDetails(nurse.getBankAccountDetails());
		dto.setMedicalFitnessCertificate(safeReturnAsBase64(nurse.getMedicalFitnessCertificate()));
		dto.setEmailId(nurse.getEmailId());
		dto.setPreviousEmploymentHistory(safeReturnAsBase64(nurse.getPreviousEmploymentHistory()));
		dto.setVaccinationStatus(nurse.getVaccinationStatus());
		dto.setInsuranceOrESIdetails(nurse.getInsuranceOrESIdetails());
		dto.setExperienceCertificates(safeReturnAsBase64(nurse.getExperienceCertificates()));
		dto.setProfilePicture(safeReturnAsBase64(nurse.getProfilePicture()));

		dto.setAddress(nurse.getAddress());

		dto.setGender(nurse.getGender());
		dto.setQualifications(nurse.getQualifications());
		dto.setShiftTimingOrAvailability(nurse.getShiftTimingOrAvailability());
		dto.setEmergencyContactNumber(nurse.getEmergencyContactNumber());
		dto.setYearsOfExperience(nurse.getYearsOfExperience());
		dto.setPermissions(nurse.getPermissions());

		return dto;
	}
	// ----------------- Helper Methods ------------------------

	private String generateNurseId() {
		String nurseId = "NR_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
		return nurseId;
	}

	private String generateStructuredPassword() {
		String[] words = { "Nurse" };
		String specialChars = "@#$%&*!?";
		String digits = "0123456789";
		SecureRandom random = new SecureRandom();
		// Choose a random word and capitalize the first letter
		String word = words[random.nextInt(words.length)];
		String capitalizedWord = word.substring(0, 1).toUpperCase() + word.substring(1);

		// Choose one special character
		char specialChar = specialChars.charAt(random.nextInt(specialChars.length()));

		// Generate a 3-digit number
		StringBuilder numberPart = new StringBuilder();
		for (int i = 0; i < 3; i++) {
			numberPart.append(digits.charAt(random.nextInt(digits.length())));
		}

		// Combine all parts to form the password
		return capitalizedWord + specialChar + numberPart;
	}

	

    // Encode to Base64
    private static String encodeIfNotBase64(String input) {
        if (input == null || input.isBlank()) return input;

        String base64Pattern = "^[A-Za-z0-9+/]*={0,2}$";
        if (input.matches(base64Pattern) && input.length() % 4 == 0) {
            try {
                Base64.getDecoder().decode(input);
                return input; // already Base64
            } catch (IllegalArgumentException e) {
                // not valid, so encode
            }
        }
        return Base64.getEncoder().encodeToString(input.getBytes(StandardCharsets.UTF_8));
    }

    // Ensure Base64 for returning
    private static String safeReturnAsBase64(String input) {
        if (input == null) return null;
        try {
            Base64.getDecoder().decode(input);
            return input;
        } catch (Exception e) {
            return Base64.getEncoder().encodeToString(input.getBytes(StandardCharsets.UTF_8));
        }
    }


	
//---------------------------------------------------------------------------------------------------
//--------------------------------- NurseLogin-------------------------------------------------------
//---------------------------------------------------------------------------------------------------

//	------------------Nurse login---------------------------------------------------------
//	@Override
//	public Response nurseLogin(NurseLoginDTO loginDTO) {
//		Response response = new Response();
//		Optional<Nurse> nurseFromDB = nurseRepository.findByUserName(loginDTO.getUserName());
//
//		if (nurseFromDB.isPresent()) {
//			Nurse nurse = nurseFromDB.get();
//
//			// Compare passwords
//			if (nurse.getPassword().equals(loginDTO.getPassword())) {
//				response.setSuccess(true);
//				response.setMessage("Login Successful");
//				response.setStatus(HttpStatus.OK.value());
//			} else {
//				response.setSuccess(false);
//				response.setMessage("Invalid password");
//				response.setStatus(HttpStatus.UNAUTHORIZED.value()); // 401 is better than 409
//			}
//		} else {
//			response.setSuccess(false);
//			response.setMessage("Invalid Username");
//			response.setStatus(HttpStatus.NOT_FOUND.value()); // 404 is better than 409
//		}
//
//		return response;
//	}

//-----------------------reset nurse login password-------------------------------------------
//	@Override
//	public Response resetLoginPassword(ResetNurseLoginPasswordDTO dto) {
//		Response response = new Response();
//		Optional<Nurse> nurseFromDB = nurseRepository.findByUserName(dto.getUserName());
//		if(nurseFromDB.isPresent()) {
//		Nurse nurse = nurseFromDB.get();
//			if(nurse.getPassword().equals(dto.getCurrentPassword())) {
//				if(dto.getNewPassword().equals(dto.getConfirmPassword())) {
//					nurse.setPassword(dto.getNewPassword());
//					nurseRepository.save(nurse);
//					response.setSuccess(true);
//					response.setMessage("Password updated Successfully");
//					response.setStatus(HttpStatus.OK.value());
//
//					
//				}
//				else {
//					response.setSuccess(false);
//					response.setMessage("New password and confirm password are not matched");
//					response.setStatus(HttpStatus.UNAUTHORIZED.value()); // 401 is better
//				}
//				
//			}
//			else {
//				response.setSuccess(false);
//				response.setMessage("Invalid password");
//				response.setStatus(HttpStatus.UNAUTHORIZED.value()); // 401 is better than 409
//			}
//		}
//		else {
//			response.setSuccess(false);
//			response.setMessage("Invalid Username");
//			response.setStatus(HttpStatus.NOT_FOUND.value()); // 404 is better than 409
//		}
//		return response;
//	}

}
