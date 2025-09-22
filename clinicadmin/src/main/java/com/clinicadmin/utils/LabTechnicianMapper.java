package com.clinicadmin.utils;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import com.clinicadmin.dto.LabTechnicianRequestDTO;
import com.clinicadmin.entity.LabTechnicianEntity;

public class LabTechnicianMapper {

	// Encode to Base64
	private static String encodeIfNotBase64(String input) {
		if (input == null || input.isBlank())
			return input;

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
		if (input == null)
			return null;
		try {
			Base64.getDecoder().decode(input);
			return input;
		} catch (Exception e) {
			return Base64.getEncoder().encodeToString(input.getBytes(StandardCharsets.UTF_8));
		}
	}

	// DTO → Entity
	public static LabTechnicianEntity toEntity(LabTechnicianRequestDTO dto) {
		if (dto == null)
			return null;

		LabTechnicianEntity entity = new LabTechnicianEntity();

		entity.setId(dto.getId());
		entity.setClinicId(dto.getClinicId());
		entity.setHospitalName(dto.getHospitalName());
		entity.setBranchId(dto.getBranchId());
		entity.setFullName(dto.getFullName());
		entity.setGender(dto.getGender());
		entity.setDateOfBirth(dto.getDateOfBirth());
		entity.setContactNumber(dto.getContactNumber());
		entity.setGovernmentId(dto.getGovernmentId());
		entity.setQualificationOrCertifications(dto.getQualificationOrCertifications());
		entity.setDateOfJoining(dto.getDateOfJoining());
		entity.setDepartmentOrAssignedLab(dto.getDepartmentOrAssignedLab());
		entity.setYearOfExperience(dto.getYearOfExperience());
		entity.setSpecialization(dto.getSpecialization());
		entity.setShiftTimingsOrAvailability(dto.getShiftTimingsOrAvailability());
		entity.setAddress(dto.getAddress());
		entity.setEmergencyContact(dto.getEmergencyContact());
		entity.setBankAccountDetails(dto.getBankAccountDetails());

		// Certificates (Base64)
		entity.setMedicalFitnessCertificate(encodeIfNotBase64(dto.getMedicalFitnessCertificate()));
		entity.setLabLicenseOrRegistration(encodeIfNotBase64(dto.getLabLicenseOrRegistration()));
		entity.setProfilePicture(encodeIfNotBase64(dto.getProfilePicture()));

		entity.setEmailId(dto.getEmailId());
//        entity.setUserName(dto.getUserName());
//        entity.setPassword(dto.getPassword());
		entity.setRole(dto.getRole());
		entity.setVaccinationStatus(dto.getVaccinationStatus());
		entity.setPreviousEmploymentHistory(dto.getPreviousEmploymentHistory());

		// ✅ Permissions
		entity.setPermissions(dto.getPermissions());

		return entity;
	}

	// Entity → DTO
	public static LabTechnicianRequestDTO toDTO(LabTechnicianEntity entity) {
		if (entity == null)
			return null;

		LabTechnicianRequestDTO dto = new LabTechnicianRequestDTO();

		dto.setId(entity.getId());
		dto.setClinicId(entity.getClinicId());
		dto.setHospitalName(entity.getHospitalName());
		dto.setBranchId(dto.getBranchId());
		dto.setFullName(entity.getFullName());
		dto.setGender(entity.getGender());
		dto.setDateOfBirth(entity.getDateOfBirth());
		dto.setContactNumber(entity.getContactNumber());
		dto.setGovernmentId(entity.getGovernmentId());
		dto.setQualificationOrCertifications(entity.getQualificationOrCertifications());
		dto.setDateOfJoining(entity.getDateOfJoining());
		dto.setDepartmentOrAssignedLab(entity.getDepartmentOrAssignedLab());
		dto.setYearOfExperience(entity.getYearOfExperience());
		dto.setSpecialization(entity.getSpecialization());
		dto.setShiftTimingsOrAvailability(entity.getShiftTimingsOrAvailability());
		dto.setAddress(entity.getAddress());
		dto.setEmergencyContact(entity.getEmergencyContact());
		dto.setBankAccountDetails(entity.getBankAccountDetails());

		dto.setMedicalFitnessCertificate(safeReturnAsBase64(entity.getMedicalFitnessCertificate()));
		dto.setLabLicenseOrRegistration(safeReturnAsBase64(entity.getLabLicenseOrRegistration()));
		dto.setProfilePicture(safeReturnAsBase64(entity.getProfilePicture()));

		dto.setEmailId(entity.getEmailId());
//        dto.setUserName(entity.getUserName());
//        dto.setPassword(entity.getPassword());
		dto.setRole(entity.getRole());
		dto.setVaccinationStatus(entity.getVaccinationStatus());
		dto.setPreviousEmploymentHistory(entity.getPreviousEmploymentHistory());

		// ✅ Permissions
		dto.setPermissions(entity.getPermissions());

		return dto;
	}
}
