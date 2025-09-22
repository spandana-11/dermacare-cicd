package com.clinicadmin.utils;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import com.clinicadmin.dto.ReceptionistRequestDTO;
import com.clinicadmin.entity.ReceptionistEntity;
public class ReceptionistMapper {

    // ----------------- Base64 Helper -----------------
    public static String encodeIfNotBase64(String input) {
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

    public static String safeReturnAsBase64(String input) {
        if (input == null) return null;
        try {
            Base64.getDecoder().decode(input);
            return input;
        } catch (Exception e) {
            return Base64.getEncoder().encodeToString(input.getBytes(StandardCharsets.UTF_8));
        }
    }

    // ----------------- DTO → Entity -----------------
    public static ReceptionistEntity toEntity(ReceptionistRequestDTO dto) {
        if (dto == null) return null;

        ReceptionistEntity entity = new ReceptionistEntity();
        applyDtoToEntity(dto, entity);

        // Encode files
        entity.setGraduationCertificate(encodeIfNotBase64(dto.getGraduationCertificate()));
        entity.setComputerSkillsProof(encodeIfNotBase64(dto.getComputerSkillsProof()));
        entity.setProfilePicture(encodeIfNotBase64(dto.getProfilePicture()));

        return entity;
    }

    // ----------------- Entity → DTO -----------------
    public static ReceptionistRequestDTO toDTO(ReceptionistEntity entity) {
        if (entity == null) return null;

        ReceptionistRequestDTO dto = new ReceptionistRequestDTO();
        dto.setId(entity.getId());
        dto.setClinicId(entity.getClinicId());
        dto.setHospitalName(entity.getHospitalName());
        dto.setBranchId(entity.getBranchId());
        dto.setRole(entity.getRole());
        dto.setAddress(entity.getAddress());
        dto.setEmergencyContact(entity.getEmergencyContact());
//        dto.setUserName(entity.getUserName());
//        dto.setPassword(entity.getPassword());
        dto.setFullName(entity.getFullName());
        dto.setDateOfBirth(entity.getDateOfBirth());
        dto.setContactNumber(entity.getContactNumber());
        dto.setQualification(entity.getQualification());
        dto.setGovernmentId(entity.getGovernmentId());
        dto.setDateOfJoining(entity.getDateOfJoining());
        dto.setDepartment(entity.getDepartment());
        dto.setBankAccountDetails(entity.getBankAccountDetails());
        dto.setEmailId(entity.getEmailId());
        dto.setPermissions(entity.getPermissions());
        dto.setGender(entity.getGender());
        dto.setYearOfExperience(entity.getYearOfExperience());
        dto.setVaccinationStatus(entity.getVaccinationStatus());
        

        // Decode files safely
        dto.setGraduationCertificate(safeReturnAsBase64(entity.getGraduationCertificate()));
        dto.setComputerSkillsProof(safeReturnAsBase64(entity.getComputerSkillsProof()));
        dto.setProfilePicture(safeReturnAsBase64(entity.getProfilePicture()));
        dto.setPreviousEmploymentHistory(entity.getPreviousEmploymentHistory());
        dto.setPermissions(entity.getPermissions());

        return dto;
    }

    // ----------------- Update Existing Entity -----------------
    public static void updateEntityFromDto(ReceptionistRequestDTO dto, ReceptionistEntity entity) {
        if (dto == null || entity == null) return;

        if (dto.getClinicId() != null) entity.setClinicId(dto.getClinicId());
        if (dto.getHospitalName() != null) entity.setHospitalName(dto.getHospitalName());
        if (dto.getBranchId() != null) entity.setBranchId(dto.getBranchId());
        if (dto.getRole() != null) entity.setRole(dto.getRole());
        if (dto.getPermissions() != null) entity.setPermissions(dto.getPermissions());
        if (dto.getAddress() != null) entity.setAddress(dto.getAddress());
//        if (dto.getEmergencyContact() != null) entity.setEmergencyContact(dto.getEmergencyContact());
//        if (dto.getUserName() != null) entity.setUserName(dto.getUserName());
//        if (dto.getPassword() != null) entity.setPassword(dto.getPassword());
        if (dto.getFullName() != null) entity.setFullName(dto.getFullName());
        if (dto.getDateOfBirth() != null) entity.setDateOfBirth(dto.getDateOfBirth());
        if (dto.getContactNumber() != null) entity.setContactNumber(dto.getContactNumber());
        if (dto.getQualification() != null) entity.setQualification(dto.getQualification());
        if (dto.getGovernmentId() != null) entity.setGovernmentId(dto.getGovernmentId());
        if (dto.getDateOfJoining() != null) entity.setDateOfJoining(dto.getDateOfJoining());
        if (dto.getDepartment() != null) entity.setDepartment(dto.getDepartment());
        if (dto.getBankAccountDetails() != null) entity.setBankAccountDetails(dto.getBankAccountDetails());
        if (dto.getEmailId() != null) entity.setEmailId(dto.getEmailId());
        if (dto.getGender() != null) entity.setGender(dto.getGender());
        if (dto.getYearOfExperience() != null) entity.setYearOfExperience(dto.getYearOfExperience());
        if (dto.getVaccinationStatus() != null) entity.setVaccinationStatus(dto.getVaccinationStatus());

        // Encode files if provided
        if (dto.getGraduationCertificate() != null)
            entity.setGraduationCertificate(encodeIfNotBase64(dto.getGraduationCertificate()));
        if (dto.getComputerSkillsProof() != null)
            entity.setComputerSkillsProof(encodeIfNotBase64(dto.getComputerSkillsProof()));

        if (dto.getPreviousEmploymentHistory() != null)
            entity.setPreviousEmploymentHistory(dto.getPreviousEmploymentHistory());
    }

    // ----------------- Helper for Create -----------------
    private static void applyDtoToEntity(ReceptionistRequestDTO dto, ReceptionistEntity entity) {
        entity.setId(dto.getId());
        entity.setClinicId(dto.getClinicId());
        entity.setHospitalName(dto.getHospitalName());
        entity.setBranchId(dto.getBranchId());
        entity.setRole(dto.getRole());
        entity.setAddress(dto.getAddress());
        entity.setEmergencyContact(dto.getEmergencyContact());
//        entity.setUserName(dto.getUserName() != null ? dto.getUserName() : dto.getContactNumber());
//        entity.setPassword(dto.getPassword());
        entity.setFullName(dto.getFullName());
        entity.setDateOfBirth(dto.getDateOfBirth());
        entity.setContactNumber(dto.getContactNumber());
        entity.setQualification(dto.getQualification());
        entity.setGovernmentId(dto.getGovernmentId());
        entity.setDateOfJoining(dto.getDateOfJoining());
        entity.setDepartment(dto.getDepartment());
        entity.setBankAccountDetails(dto.getBankAccountDetails());
        entity.setEmailId(dto.getEmailId());
        entity.setGraduationCertificate(encodeIfNotBase64(dto.getGraduationCertificate()));
        entity.setComputerSkillsProof(encodeIfNotBase64(dto.getComputerSkillsProof()));
        entity.setPreviousEmploymentHistory(dto.getPreviousEmploymentHistory());
        entity.setPermissions(dto.getPermissions());
        entity.setGender(dto.getGender());
        entity.setYearOfExperience(dto.getYearOfExperience());
        entity.setVaccinationStatus(dto.getVaccinationStatus());
    }
}
