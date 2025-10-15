package com.clinicadmin.utils;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import com.clinicadmin.dto.SecurityStaffDTO;
import com.clinicadmin.entity.SecurityStaff;

public class SecurityStaffMapper {

    // Encode to Base64 (used when saving images/PDFs to DB)
    private static String encodeIfNotBase64(String input) {
        if (input == null || input.isBlank()) return input;

        // Check if already Base64
        String base64Pattern = "^[A-Za-z0-9+/]*={0,2}$";
        if (input.matches(base64Pattern) && input.length() % 4 == 0) {
            try {
                Base64.getDecoder().decode(input); // valid Base64
                return input; // already Base64, return as is
            } catch (IllegalArgumentException e) {
                // not Base64, so encode
            }
        }
        return Base64.getEncoder().encodeToString(input.getBytes(StandardCharsets.UTF_8));
    }

    // Always return safe Base64 for frontend (for <img> or <embed>)
    private static String safeReturnAsBase64(String input) {
        if (input == null) return null;
        try {
            Base64.getDecoder().decode(input); // valid Base64
            return input; // already Base64
        } catch (Exception e) {
            // encode if not Base64
            return Base64.getEncoder().encodeToString(input.getBytes(StandardCharsets.UTF_8));
        }
    }

    // DTO → Entity (encode before saving)
    public static SecurityStaff toEntity(SecurityStaffDTO dto) {
        if (dto == null) return null;

        SecurityStaff staff = new SecurityStaff();

        staff.setSecurityStaffId(dto.getSecurityStaffId());
        staff.setClinicId(dto.getClinicId());
        staff.setHospitalName(dto.getHospitalName());
        staff.setBranchId(dto.getBranchId());
        staff.setRole(dto.getRole());
        staff.setBranchName(dto.getBranchName());
        staff.setPermissions(dto.getPermissions());
        staff.setFullName(dto.getFullName());
        staff.setDateOfBirth(dto.getDateOfBirth());
        staff.setGender(dto.getGender());
        staff.setContactNumber(dto.getContactNumber());
        staff.setGovermentId(dto.getGovermentId());
        staff.setDateOfJoining(dto.getDateOfJoining());
        staff.setDepartment(dto.getDepartment());
        staff.setAddress(dto.getAddress());
        staff.setBankAccountDetails(dto.getBankAccountDetails());
        staff.setShiftTimingsOrAvailability(dto.getShiftTimingsOrAvailability());

        // Encode certificates
        staff.setPoliceVerification(encodeIfNotBase64(dto.getPoliceVerification()));
        staff.setPoliceVerificationCertificate(encodeIfNotBase64(dto.getPoliceVerificationCertificate()));
        staff.setMedicalFitnessCertificate(encodeIfNotBase64(dto.getMedicalFitnessCertificate()));
        staff.setProfilePicture(encodeIfNotBase64(dto.getProfilePicture()));

        staff.setEmailId(dto.getEmailId());
        staff.setTraningOrGuardLicense(dto.getTraningOrGuardLicense());
        staff.setPreviousEmployeeHistory(dto.getPreviousEmployeeHistory());

        return staff;
    }

    // Entity → DTO (return Base64 so frontend can render/download)
    public static SecurityStaffDTO toDTO(SecurityStaff staff) {
        if (staff == null) return null;

        SecurityStaffDTO dto = new SecurityStaffDTO();

        dto.setSecurityStaffId(staff.getSecurityStaffId());
        dto.setClinicId(staff.getClinicId());
        dto.setHospitalName(staff.getHospitalName());
        dto.setBranchId(staff.getBranchId());
        dto.setBranchName(staff.getBranchName());
        dto.setRole(staff.getRole());
        dto.setFullName(staff.getFullName());
        dto.setDateOfBirth(staff.getDateOfBirth());
        dto.setGender(staff.getGender());
        dto.setContactNumber(staff.getContactNumber());
        dto.setGovermentId(staff.getGovermentId());
        dto.setDateOfJoining(staff.getDateOfJoining());
        dto.setDepartment(staff.getDepartment());
        dto.setShiftTimingsOrAvailability(staff.getShiftTimingsOrAvailability());
        dto.setAddress(staff.getAddress());
        dto.setBankAccountDetails(staff.getBankAccountDetails());
        dto.setPoliceVerificationCertificate(safeReturnAsBase64(staff.getPoliceVerificationCertificate()));
        dto.setPoliceVerification(safeReturnAsBase64(staff.getPoliceVerification()));
        dto.setMedicalFitnessCertificate(safeReturnAsBase64(staff.getMedicalFitnessCertificate()));
        dto.setProfilePicture(safeReturnAsBase64(staff.getProfilePicture()));

        dto.setEmailId(staff.getEmailId());
        dto.setTraningOrGuardLicense(staff.getTraningOrGuardLicense());
        dto.setPreviousEmployeeHistory(staff.getPreviousEmployeeHistory());
        dto.setPermissions(staff.getPermissions());

        return dto;
    }
}