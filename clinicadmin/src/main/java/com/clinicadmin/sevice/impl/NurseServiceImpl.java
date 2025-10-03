package com.clinicadmin.sevice.impl;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Consumer;

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

    // ------------------- Onboarding ----------------------

    @Override
    public Response nureseOnboarding(NurseDTO dto) {
        Response response = new Response();
        dto.trimNurseFields();

        if (nurseRepository.existsByNurseContactNumber(dto.getNurseContactNumber())) {
            response.setSuccess(false);
            response.setMessage("Nurse with this mobile number already exists");
            response.setStatus(HttpStatus.BAD_REQUEST.value());
            return response;
        }

        if (credentialsRepository.existsByUsername(dto.getNurseContactNumber())) {
            response.setSuccess(false);
            response.setMessage("Login credentials already exist for this mobile number");
            response.setStatus(HttpStatus.BAD_REQUEST.value());
            return response;
        }

        ResponseEntity<Response> res = adminServiceClient.getBranchById(dto.getBranchId());
        Branch br = objectMapper.convertValue(res.getBody().getData(), Branch.class);

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
        response.setMessage("Nurse added successfully");
        response.setStatus(HttpStatus.CREATED.value());

        return response;
    }

    // ------------------- Fetch Nurses ----------------------

    @Override
    public Response getAllNursesByHospital(String hospitalId) {
        Response response = new Response();

        if (hospitalId == null || hospitalId.isBlank()) {
            response.setSuccess(false);
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
            response.setMessage("Nurse not found");
            response.setStatus(HttpStatus.NOT_FOUND.value());
            return response;
        });
    }

    // ------------------- Update Nurse ----------------------

    @Override
    public Response updateNurse(String hospitalId, String nurseId, NurseDTO dto) {
        Response response = new Response();

        if (hospitalId == null || hospitalId.isBlank() || nurseId == null || nurseId.isBlank()) {
            response.setSuccess(false);
            response.setMessage("Hospital ID and Nurse ID must not be empty");
            response.setStatus(HttpStatus.BAD_REQUEST.value());
            return response;
        }

        return nurseRepository.findByHospitalIdAndNurseId(hospitalId, nurseId).map(existingNurse -> {

            Optional.ofNullable(dto.getHospitalId()).ifPresent(existingNurse::setHospitalId);
            Optional.ofNullable(dto.getHospitalName()).ifPresent(existingNurse::setHospitalName);
            Optional.ofNullable(dto.getBranchId()).ifPresent(existingNurse::setBranchId);
            Optional.ofNullable(dto.getRole()).ifPresent(existingNurse::setRole);
            Optional.ofNullable(dto.getFullName()).ifPresent(existingNurse::setFullName);
            Optional.ofNullable(dto.getDateOfBirth()).ifPresent(existingNurse::setDateOfBirth);
            Optional.ofNullable(dto.getDepartment()).ifPresent(existingNurse::setDepartment);
            Optional.ofNullable(dto.getEmailId()).ifPresent(existingNurse::setEmailId);
            Optional.ofNullable(dto.getNurseContactNumber()).ifPresent(existingNurse::setNurseContactNumber);
            Optional.ofNullable(dto.getGovernmentId()).ifPresent(existingNurse::setGovernmentId);
            Optional.ofNullable(dto.getBankAccountDetails()).ifPresent(existingNurse::setBankAccountDetails);
            Optional.ofNullable(dto.getInsuranceOrESIdetails()).ifPresent(existingNurse::setInsuranceOrESIdetails);
            Optional.ofNullable(dto.getPreviousEmploymentHistory()).ifPresent(existingNurse::setPreviousEmploymentHistory);
            Optional.ofNullable(dto.getAddress()).ifPresent(existingNurse::setAddress);
            Optional.ofNullable(dto.getGender()).ifPresent(existingNurse::setGender);
            Optional.ofNullable(dto.getEmergencyContactNumber()).ifPresent(existingNurse::setEmergencyContactNumber);
            Optional.ofNullable(dto.getYearsOfExperience()).ifPresent(existingNurse::setYearsOfExperience);
            Optional.ofNullable(dto.getQualifications()).ifPresent(existingNurse::setQualifications);
            Optional.ofNullable(dto.getShiftTimingOrAvailability()).ifPresent(existingNurse::setShiftTimingOrAvailability);
            Optional.ofNullable(dto.getPermissions()).ifPresent(existingNurse::setPermissions);

            if (dto.getVaccinationStatus() != null) {
                existingNurse.setVaccinationStatus(dto.getVaccinationStatus());
            }

            // Base64 file fields
            updateBase64Field(dto.getNursingLicense(), existingNurse::setNursingLicense);
            updateBase64Field(dto.getNursingCouncilRegistration(), existingNurse::setNursingCouncilRegistration);
            updateBase64Field(dto.getNursingDegreeOrDiplomaCertificate(), existingNurse::setNursingDegreeOrDiplomaCertificate);
            updateBase64Field(dto.getMedicalFitnessCertificate(), existingNurse::setMedicalFitnessCertificate);
            updateBase64Field(dto.getExperienceCertificates(), existingNurse::setExperienceCertificates);
            updateBase64Field(dto.getProfilePicture(), existingNurse::setProfilePicture);

            Nurse updated = nurseRepository.save(existingNurse);
            NurseDTO updatedDTO = mapNurseEntityToNurseDTO(updated);

            Response successResponse = new Response();
            successResponse.setSuccess(true);
            successResponse.setData(updatedDTO);
            successResponse.setMessage("Nurse updated successfully");
            successResponse.setStatus(HttpStatus.OK.value());
            return successResponse;

        }).orElseGet(() -> {
            Response notFoundResponse = new Response();
            notFoundResponse.setSuccess(false);
            notFoundResponse.setMessage("Nurse not found for update");
            notFoundResponse.setStatus(HttpStatus.NOT_FOUND.value());
            return notFoundResponse;
        });
    }

    // ------------------- Delete ----------------------

    @Override
    public Response deleteNurse(String hospitalId, String nurseId) {
        Response response = new Response();

        if (hospitalId == null || hospitalId.isBlank() || nurseId == null || nurseId.isBlank()) {
            response.setSuccess(false);
            response.setMessage("Hospital ID and Nurse ID must not be empty");
            response.setStatus(HttpStatus.BAD_REQUEST.value());
            return response;
        }

        if (nurseRepository.findByHospitalIdAndNurseId(hospitalId, nurseId).isPresent()) {
            nurseRepository.deleteByHospitalIdAndNurseId(hospitalId, nurseId);
            response.setSuccess(true);
            response.setMessage("Nurse deleted successfully");
            response.setStatus(HttpStatus.NO_CONTENT.value());
        } else {
            response.setSuccess(false);
            response.setMessage("Nurse not found");
            response.setStatus(HttpStatus.NOT_FOUND.value());
        }
        return response;
    }

    // ------------------- Mapper Methods ----------------------

    private Nurse mapNurseDtoTONurseEntity(NurseDTO dto) {
        Nurse nurse = new Nurse();
        nurse.setHospitalId(dto.getHospitalId());
        nurse.setHospitalName(dto.getHospitalName());
        nurse.setBranchId(dto.getBranchId());
        nurse.setRole(dto.getRole());
        nurse.setFullName(dto.getFullName());
        nurse.setDateOfBirth(dto.getDateOfBirth());
        nurse.setNurseContactNumber(dto.getNurseContactNumber());
        nurse.setGovernmentId(dto.getGovernmentId());

        nurse.setNursingLicense(dto.getNursingLicense());
        nurse.setNursingCouncilRegistration(dto.getNursingCouncilRegistration());
        nurse.setNursingDegreeOrDiplomaCertificate(dto.getNursingDegreeOrDiplomaCertificate());
        nurse.setDateOfJoining(dto.getDateOfJoining());
        nurse.setDepartment(dto.getDepartment());
        nurse.setBankAccountDetails(dto.getBankAccountDetails());
        nurse.setMedicalFitnessCertificate(dto.getMedicalFitnessCertificate());
        nurse.setEmailId(dto.getEmailId());
        nurse.setPreviousEmploymentHistory(dto.getPreviousEmploymentHistory());
        nurse.setExperienceCertificates(dto.getExperienceCertificates());
        nurse.setProfilePicture(dto.getProfilePicture());
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

        dto.setNursingLicense(nurse.getNursingLicense());
        dto.setNursingDegreeOrDiplomaCertificate(nurse.getNursingDegreeOrDiplomaCertificate());
        dto.setNursingCouncilRegistration(nurse.getNursingCouncilRegistration());
        dto.setDateOfJoining(nurse.getDateOfJoining());
        dto.setDepartment(nurse.getDepartment());
        dto.setBankAccountDetails(nurse.getBankAccountDetails());
        dto.setMedicalFitnessCertificate(nurse.getMedicalFitnessCertificate());
        dto.setEmailId(nurse.getEmailId());
        dto.setPreviousEmploymentHistory(nurse.getPreviousEmploymentHistory());
        dto.setVaccinationStatus(nurse.getVaccinationStatus());
        dto.setInsuranceOrESIdetails(nurse.getInsuranceOrESIdetails());
        dto.setExperienceCertificates(nurse.getExperienceCertificates());
        dto.setProfilePicture(nurse.getProfilePicture());

        dto.setAddress(nurse.getAddress());
        dto.setGender(nurse.getGender());
        dto.setQualifications(nurse.getQualifications());
        dto.setShiftTimingOrAvailability(nurse.getShiftTimingOrAvailability());
        dto.setEmergencyContactNumber(nurse.getEmergencyContactNumber());
        dto.setYearsOfExperience(nurse.getYearsOfExperience());
        dto.setPermissions(nurse.getPermissions());

        return dto;
    }

    // ------------------- Helper Methods ----------------------

    private void updateBase64Field(String field, Consumer<String> setter) {
        if (field != null && !field.isBlank()) {
            try {
                // validate if Base64
                Base64.getDecoder().decode(field);
                setter.accept(field);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid Base64 format for file field");
            }
        }
    }

    private String generateNurseId() {
        return "NR_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String generateStructuredPassword() {
        String[] words = {"Nurse"};
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

    // Encode/Decode helpers if you ever need raw bytes
    public static String encodeBytesToBase64(byte[] bytes) {
        if (bytes == null || bytes.length == 0) return null;
        return Base64.getEncoder().encodeToString(bytes);
    }

    public static byte[] decodeBase64ToBytes(String base64) {
        if (base64 == null || base64.isBlank()) return null;
        return Base64.getDecoder().decode(base64);
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
