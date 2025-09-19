package com.clinicadmin.utils;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import com.clinicadmin.dto.WardBoyDTO;
import com.clinicadmin.entity.WardBoy;

public class WardBoyMapper {

	private static String encodeIfNotBase64(String input) {
		if (input == null || input.isBlank())
			return input;
		String base64Pattern = "^[A-Za-z0-9+/]*={0,2}$";
		if (input.matches(base64Pattern) && input.length() % 4 == 0) {
			try {
				Base64.getDecoder().decode(input);
				return input; // Already Base64
			} catch (IllegalArgumentException e) {
				// not valid Base64, so encode it
			}
		}
		return Base64.getEncoder().encodeToString(input.getBytes(StandardCharsets.UTF_8));
	}

	// ✅ Proper decode: return decoded String (can be Base64 bytes for image/pdf)
	private static String decodeIfBase64(String input) {
		if (input == null || input.isBlank())
			return input;

		try {
			byte[] decodedBytes = Base64.getDecoder().decode(input);
			// Return decoded string if it's text, otherwise re-encode safely for frontend
			// usage
			return new String(decodedBytes, StandardCharsets.UTF_8);
		} catch (IllegalArgumentException e) {
			return input; // Not Base64, return as is
		}
	}

	// ✅ If frontend expects Base64 directly for images/PDF display, keep this
	// helper
	private static String safeReturnAsBase64(String input) {
		if (input == null)
			return null;
		try {
			Base64.getDecoder().decode(input); // already Base64
			return input;
		} catch (Exception e) {
			return Base64.getEncoder().encodeToString(input.getBytes(StandardCharsets.UTF_8));
		}
	}

	public static WardBoy toEntity(WardBoyDTO dto) {
		if (dto == null)
			return null;

		WardBoy wardBoy = new WardBoy();
		wardBoy.setWardBoyId(dto.getWardBoyId());
		wardBoy.setClinicId(dto.getClinicId());
		wardBoy.setHospitalName(dto.getHospitalName());
		wardBoy.setBranchId(dto.getBranchId());
		wardBoy.setRole(dto.getRole());

		wardBoy.setFullName(dto.getFullName());
		wardBoy.setDateOfBirth(dto.getDateOfBirth());
		wardBoy.setContactNumber(dto.getContactNumber());
		wardBoy.setGovernmentId(dto.getGovernmentId());
		wardBoy.setDateOfJoining(dto.getDateOfJoining());
		wardBoy.setDepartment(dto.getDepartment());
		wardBoy.setBankAccountDetails(dto.getBankAccountDetails());
		wardBoy.setAddress(dto.getAddress());
		wardBoy.setGender(dto.getGender());
		wardBoy.setWorkExprience(dto.getWorkExprience());
		wardBoy.setShiftTimingOrAvailability(dto.getShiftTimingOrAvailability());
		wardBoy.setEmergencyContact(dto.getEmergencyContact());
		wardBoy.setProfilePicture(encodeIfNotBase64(dto.getProfilePicture()));
//        wardBoy.setUsername(dto.getUserName());
//        wardBoy.setPassword(dto.getPassword());

		// ✅ Encode before saving to DB
	
		wardBoy.setMedicalFitnessCertificate(encodeIfNotBase64(dto.getMedicalFitnessCertificate()));
		wardBoy.setBasicHealthFirstAidTrainingCertificate(
				encodeIfNotBase64(dto.getBasicHealthFirstAidTrainingCertificate()));
		wardBoy.setPoliceVerification(encodeIfNotBase64(dto.getPoliceVerification()));

		wardBoy.setEmailId(dto.getEmailId());
		wardBoy.setPreviousEmploymentHistory(dto.getPreviousEmploymentHistory());
		wardBoy.setPermissions(dto.getPermissions());

		return wardBoy;
	}

	public static WardBoyDTO toDTO(WardBoy entity) {
		if (entity == null)
			return null;

		WardBoyDTO dto = new WardBoyDTO();
		dto.setWardBoyId(entity.getWardBoyId());
		dto.setFullName(entity.getFullName());
		dto.setGender(entity.getGender());
		dto.setClinicId(entity.getClinicId());
		dto.setHospitalName(entity.getHospitalName());
		dto.setBranchId(entity.getBranchId());
		dto.setRole(entity.getRole());
		dto.setDateOfBirth(entity.getDateOfBirth());
		dto.setContactNumber(entity.getContactNumber());
		dto.setGovernmentId(entity.getGovernmentId());
		dto.setDateOfJoining(entity.getDateOfJoining());
		dto.setDepartment(entity.getDepartment());
		dto.setShiftTimingOrAvailability(entity.getShiftTimingOrAvailability());
		dto.setAddress(entity.getAddress());
		dto.setEmergencyContact(entity.getEmergencyContact());
		dto.setWorkExprience(entity.getWorkExprience());
		dto.setBankAccountDetails(entity.getBankAccountDetails());
//        dto.setUserName(entity.getUsername());
//        dto.setPassword(entity.getPassword());

		// ✅ Return as Base64 so frontend can directly show/download image/pdf
		dto.setMedicalFitnessCertificate(safeReturnAsBase64(entity.getMedicalFitnessCertificate()));
		dto.setProfilePicture(safeReturnAsBase64(entity.getProfilePicture()));
		dto.setBasicHealthFirstAidTrainingCertificate(
				safeReturnAsBase64(entity.getBasicHealthFirstAidTrainingCertificate()));
		dto.setPoliceVerification(safeReturnAsBase64(entity.getPoliceVerification()));

		dto.setEmailId(entity.getEmailId());
		dto.setPreviousEmploymentHistory(entity.getPreviousEmploymentHistory());
		dto.setPermissions(entity.getPermissions());

		return dto;
	}
}