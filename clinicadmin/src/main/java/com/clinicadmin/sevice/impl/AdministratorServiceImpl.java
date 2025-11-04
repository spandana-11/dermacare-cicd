package com.clinicadmin.sevice.impl;



import java.security.SecureRandom;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.clinicadmin.dto.AdministratorDTO;
import com.clinicadmin.dto.Branch;
import com.clinicadmin.dto.Response;
import com.clinicadmin.entity.Administrator;
import com.clinicadmin.entity.DoctorLoginCredentials;
import com.clinicadmin.feignclient.AdminServiceClient;
import com.clinicadmin.repository.AdministratorRepository;
import com.clinicadmin.repository.DoctorLoginCredentialsRepository;
import com.clinicadmin.service.AdministratorService;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class AdministratorServiceImpl implements AdministratorService {

    @Autowired
    private AdministratorRepository administratorRepository;

    @Autowired
    private DoctorLoginCredentialsRepository credentialsRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AdminServiceClient adminServiceClient;

    @Autowired
    private ObjectMapper objectMapper;

    // ------------------- Onboarding ----------------------

    @Override
    public Response administratorOnboarding(AdministratorDTO dto) {
        Response response = new Response();

        // Check if admin already exists by contact number or email
        if (administratorRepository.existsByContactNumber(dto.getContactNumber())) {
            response.setSuccess(false);
            response.setMessage("Administrator with this contact number already exists");
            response.setStatus(HttpStatus.BAD_REQUEST.value());
            return response;
        }

        if (credentialsRepository.existsByUsername(dto.getContactNumber())) {
            response.setSuccess(false);
            response.setMessage("Login credentials already exist for this contact number");
            response.setStatus(HttpStatus.BAD_REQUEST.value());
            return response;
        }

        // Get branch name via Feign
        ResponseEntity<Response> res = adminServiceClient.getBranchById(dto.getBranchId());
        Branch branch = objectMapper.convertValue(res.getBody().getData(), Branch.class);

        // Map DTO → Entity
        Administrator admin = mapDtoToEntity(dto);
        admin.setBranchName(branch.getBranchName());
        admin.setId(generateAdminId());

        // Generate login credentials
        String username = dto.getContactNumber();
        String rawPassword = generateStructuredPassword();
        String encodedPassword = passwordEncoder.encode(rawPassword);

        //  Save admin in DB
        Administrator savedAdmin = administratorRepository.save(admin);

        //  Create login credentials
        DoctorLoginCredentials credentials = DoctorLoginCredentials.builder()
                .staffId(savedAdmin.getId())
                .staffName(savedAdmin.getFullName())
                .hospitalId(savedAdmin.getClinicId())
                .hospitalName(savedAdmin.getHospitalName())
                .branchId(savedAdmin.getBranchId())
                .branchName(savedAdmin.getBranchName())
                .username(username)
                .password(encodedPassword)
                .role(dto.getRole())
                .permissions(savedAdmin.getPermissions())
                .build();
        credentialsRepository.save(credentials);

       
        dto.setUserName(username);
        dto.setPassword(rawPassword);

        response.setSuccess(true);
        response.setData(dto);
        response.setMessage("Administrator onboarded successfully");
        response.setStatus(HttpStatus.CREATED.value());
        return response;
    }

    // ------------------- Fetch All ----------------------

    @Override
    public Response getAllAdministratorsByClinic(String clinicId) {
        Response response = new Response();

        if (clinicId == null || clinicId.isBlank()) {
            response.setSuccess(false);
            response.setMessage("Clinic ID must not be empty");
            response.setStatus(HttpStatus.BAD_REQUEST.value());
            return response;
        }

        List<Administrator> admins = administratorRepository.findByClinicId(clinicId);
        if (admins.isEmpty()) {
            response.setSuccess(true);
            response.setData(List.of());
            response.setMessage("No administrators found");
            response.setStatus(HttpStatus.OK.value());
            return response;
        }

        List<AdministratorDTO> dtoList = admins.stream().map(this::mapEntityToDto).toList();
        response.setSuccess(true);
        response.setData(dtoList);
        response.setMessage("Administrators fetched successfully");
        response.setStatus(HttpStatus.OK.value());
        return response;
    }

    // ------------------- Fetch By ID ----------------------
    @Override
    public Response getAdministratorById(String clinicId, String adminId) {
        Response response = new Response();

      
        if (clinicId == null || clinicId.isBlank()) {
            response.setSuccess(false);
            response.setMessage("Clinic ID must not be empty");
            response.setStatus(HttpStatus.BAD_REQUEST.value());
            return response;
        }

        if (adminId == null || adminId.isBlank()) {
            response.setSuccess(false);
            response.setMessage("Administrator ID must not be empty");
            response.setStatus(HttpStatus.BAD_REQUEST.value());
            return response;
        }

        //  Repository call using both clinicId and adminId
        Optional<Administrator> adminOpt = administratorRepository.findByClinicIdAndId(clinicId, adminId);

        if (adminOpt.isPresent()) {
            response.setSuccess(true);
            response.setData(mapEntityToDto(adminOpt.get()));
            response.setMessage("Administrator found successfully");
            response.setStatus(HttpStatus.OK.value());
        } else {
            response.setSuccess(false);
            response.setMessage("Administrator not found for the given clinic");
            response.setStatus(HttpStatus.NOT_FOUND.value());
        }

        return response;
    }


    // ------------------- Update ----------------------

    @Override
    public Response updateAdministrator(String clinicId, String adminId, AdministratorDTO dto) {
        Response response = new Response();

        //  Validate required inputs
        if (clinicId == null) {
            response.setSuccess(false);
            response.setMessage("Clinic ID must not be null");
            response.setStatus(HttpStatus.BAD_REQUEST.value());
            return response;
        }

        if (adminId == null) {
            response.setSuccess(false);
            response.setMessage("Administrator ID must not be null");
            response.setStatus(HttpStatus.BAD_REQUEST.value());
            return response;
        }

        if (dto == null) {
            response.setSuccess(false);
            response.setMessage("Administrator data must not be null");
            response.setStatus(HttpStatus.BAD_REQUEST.value());
            return response;
        }

        //  Fetch admin by clinicId and adminId
        Optional<Administrator> existingOpt = administratorRepository.findByClinicIdAndId(clinicId, adminId);

        if (existingOpt.isEmpty()) {
            response.setSuccess(false);
            response.setMessage("Administrator not found for the given clinic and ID");
            response.setStatus(HttpStatus.NOT_FOUND.value());
            return response;
        }

        Administrator admin = existingOpt.get();

        //  Update non-null fields
        if (dto.getFullName() != null) admin.setFullName(dto.getFullName());
        if (dto.getEmailId() != null) admin.setEmailId(dto.getEmailId());
        if (dto.getDepartment() != null) admin.setDepartment(dto.getDepartment());
        if (dto.getContactNumber() != null) admin.setContactNumber(dto.getContactNumber());
        if (dto.getGender() != null) admin.setGender(dto.getGender());
        if (dto.getDateOfBirth() != null) admin.setDateOfBirth(dto.getDateOfBirth());
        if (dto.getAddress() != null) admin.setAddress(dto.getAddress());
        if (dto.getBankAccountDetails() != null) admin.setBankAccountDetails(dto.getBankAccountDetails());
        if (dto.getProfilePicture() != null) admin.setProfilePicture(dto.getProfilePicture());
        if (dto.getPermissions() != null) admin.setPermissions(dto.getPermissions());

        // Save updated admin
        Administrator updatedAdmin = administratorRepository.save(admin);

        //  Sync credentials (if present)
        credentialsRepository.findByStaffId(adminId).ifPresent(creds -> {
            creds.setStaffName(admin.getFullName());
            creds.setUsername(admin.getContactNumber());
            creds.setPermissions(admin.getPermissions());
            creds.setRole(admin.getRole());
            credentialsRepository.save(creds);
        });

        // ✅ Prepare response
        response.setSuccess(true);
        response.setData(mapEntityToDto(updatedAdmin));
        response.setMessage("Administrator updated successfully");
        response.setStatus(HttpStatus.OK.value());
        return response;
    }
    // ------------------- Delete ----------------------

    @Override
    public Response deleteAdministrator(String clinicId, String adminId) {
        Response response = new Response();

        if (clinicId == null) {
            response.setSuccess(false);
            response.setMessage("Clinic ID must not be null");
            response.setStatus(HttpStatus.BAD_REQUEST.value());
            return response;
        }

        if (adminId == null) {
            response.setSuccess(false);
            response.setMessage("Administrator ID must not be null");
            response.setStatus(HttpStatus.BAD_REQUEST.value());
            return response;
        }

        // Find admin by clinicId and adminId
        Optional<Administrator> existingOpt = administratorRepository.findByClinicIdAndId(clinicId, adminId);
        if (existingOpt.isEmpty()) {
            response.setSuccess(false);
            response.setMessage("Administrator not found for the given clinic and ID");
            response.setStatus(HttpStatus.NOT_FOUND.value());
            return response;
        }

        Administrator existingAdmin = existingOpt.get();

        //  Delete admin
        administratorRepository.deleteById(existingAdmin.getId());

        //  Delete associated credentials (if any)
        credentialsRepository.findByStaffId(adminId)
                .ifPresent(creds -> credentialsRepository.deleteById(creds.getId()));

     
        response.setSuccess(true);
        response.setMessage("Administrator and credentials deleted successfully");
        response.setStatus(HttpStatus.OK.value());
        return response;
    }


    // ------------------- Mapper Methods ----------------------

    private Administrator mapDtoToEntity(AdministratorDTO dto) {
        Administrator admin = new Administrator();
        admin.setClinicId(dto.getClinicId());
        admin.setBranchId(dto.getBranchId());
        admin.setBranchName(dto.getBranchName());
        admin.setHospitalName(dto.getHospitalName());
        admin.setFullName(dto.getFullName());
        admin.setGender(dto.getGender());
        admin.setDateOfBirth(dto.getDateOfBirth());
        admin.setContactNumber(dto.getContactNumber());
        admin.setEmailId(dto.getEmailId());
        admin.setGovernmentId(dto.getGovernmentId());
        admin.setQualificationOrCertifications(dto.getQualificationOrCertifications());
        admin.setDateOfJoining(dto.getDateOfJoining());
        admin.setDepartment(dto.getDepartment());
        admin.setYearOfExperience(dto.getYearOfExperience());
        admin.setRole(dto.getRole());
        admin.setAddress(dto.getAddress());
        admin.setEmergencyContact(dto.getEmergencyContact());
        admin.setProfilePicture(dto.getProfilePicture());
        admin.setBankAccountDetails(dto.getBankAccountDetails());
        admin.setPermissions(dto.getPermissions());
        return admin;
    }

    private AdministratorDTO mapEntityToDto(Administrator admin) {
        AdministratorDTO dto = new AdministratorDTO();
        dto.setId(admin.getId());
        dto.setClinicId(admin.getClinicId());
        dto.setBranchId(admin.getBranchId());
        dto.setBranchName(admin.getBranchName());
        dto.setHospitalName(admin.getHospitalName());
        dto.setFullName(admin.getFullName());
        dto.setGender(admin.getGender());
        dto.setDateOfBirth(admin.getDateOfBirth());
        dto.setContactNumber(admin.getContactNumber());
        dto.setEmailId(admin.getEmailId());
        dto.setGovernmentId(admin.getGovernmentId());
        dto.setQualificationOrCertifications(admin.getQualificationOrCertifications());
        dto.setDateOfJoining(admin.getDateOfJoining());
        dto.setDepartment(admin.getDepartment());
        dto.setYearOfExperience(admin.getYearOfExperience());
        dto.setRole(admin.getRole());
        dto.setAddress(admin.getAddress());
        dto.setEmergencyContact(admin.getEmergencyContact());
        dto.setProfilePicture(admin.getProfilePicture());
        dto.setBankAccountDetails(admin.getBankAccountDetails());
        dto.setPermissions(admin.getPermissions());
        return dto;
    }

    // ------------------- Helpers ----------------------

    private String generateAdminId() {
        return "AD_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String generateStructuredPassword() {
        String[] words = {"Admin"};
        String specialChars = "@#$%&*!?";
        String digits = "0123456789";
        SecureRandom random = new SecureRandom();

        String word = words[random.nextInt(words.length)];
        String capitalizedWord = word.substring(0, 1).toUpperCase() + word.substring(1);
        char specialChar = specialChars.charAt(random.nextInt(specialChars.length()));

        StringBuilder numberPart = new StringBuilder();
        for (int i = 0; i < 3; i++) {
            numberPart.append(digits.charAt(random.nextInt(digits.length())));
        }

        return capitalizedWord + specialChar + numberPart;
    }

}

