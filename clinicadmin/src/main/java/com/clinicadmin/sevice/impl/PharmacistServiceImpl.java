package com.clinicadmin.sevice.impl;

import java.security.SecureRandom;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.clinicadmin.dto.PharmacistDTO;
import com.clinicadmin.dto.Response;
import com.clinicadmin.entity.DoctorLoginCredentials;
import com.clinicadmin.entity.Pharmacist;
import com.clinicadmin.repository.DoctorLoginCredentialsRepository;
import com.clinicadmin.repository.PharmacistRepository;
import com.clinicadmin.service.PharmacistService;
import com.clinicadmin.utils.Base64CompressionUtil;

@Service
public class PharmacistServiceImpl implements PharmacistService {

	@Autowired
	private PharmacistRepository pharmacistRepository;

	@Autowired
	PasswordEncoder passwordEncoder;

	@Autowired
	DoctorLoginCredentialsRepository credentialsRepository;

	@Override
	public Response pharmacistOnboarding(PharmacistDTO dto) {
		Response response = new Response();

		if (pharmacistRepository.existsByContactNumber(dto.getContactNumber())) {
			response.setSuccess(false);
			response.setMessage("Pharmacist with this mobile number already exists");
			response.setStatus(HttpStatus.BAD_REQUEST.value());
			return response;
		}

		Pharmacist pharmacist = mapDtoToEntity(dto);
		String pharmacistId = generatePharmacistId();
		pharmacist.setPharmacistId(pharmacistId);

		// username = contact number

		String username = dto.getContactNumber();
		String rawPassword = generateStructuredPassword();
		String encodedPassword = passwordEncoder.encode(rawPassword);

		Pharmacist saved = pharmacistRepository.save(pharmacist);

		DoctorLoginCredentials credentials = DoctorLoginCredentials.builder()
				.staffId(saved.getPharmacistId())
				.staffName(saved.getFullName())
				.hospitalId(saved.getHospitalId())
				.hospitalName(saved.getHospitalName())
				.branchId(saved.getBranchId())
				.username(username)
				.password(encodedPassword)
				.role(dto.getRole())
				.permissions(saved.getPermissions())
				.build();
		credentialsRepository.save(credentials);

		PharmacistDTO savedDTO = mapEntityToDto(saved);
		savedDTO.setUserName(username);
		savedDTO.setPassword(rawPassword);

		response.setSuccess(true);
		response.setData(savedDTO);
		response.setMessage("Pharmacist added successfully");
		response.setStatus(HttpStatus.CREATED.value());
		return response;
	}

	@Override
	public Response getAllPharmacistsByHospitalId(String hospitalId) {
		Response response = new Response();
		List<Pharmacist> list = pharmacistRepository.findByHospitalId(hospitalId);

		response.setSuccess(true);
		response.setData(list.stream().map(this::mapEntityToDto).toList());
		response.setMessage(list.isEmpty() ? "No Pharmacists found" : "Pharmacists fetched successfully");
		response.setStatus(HttpStatus.OK.value());
		return response;
	}

	@Override
	public Response getPharmacistById(String pharmacistId) {
		Response response = new Response();
		return pharmacistRepository.findByPharmacistId(pharmacistId).map(pharmacist -> {
			response.setSuccess(true);
			response.setData(mapEntityToDto(pharmacist));
			response.setMessage("Pharmacist found");
			response.setStatus(HttpStatus.OK.value());
			return response;
		}).orElseGet(() -> {
			response.setSuccess(false);
			response.setMessage("Pharmacist not found");
			response.setStatus(HttpStatus.NOT_FOUND.value());
			return response;
		});
	}

	// ---------------- UPDATE ----------------
	@Override
	public Response updatePharmacist(String pharmacistId, PharmacistDTO dto) {
		Response response = new Response();

		return pharmacistRepository.findByPharmacistId(pharmacistId).map(existing -> {

			if (dto.getHospitalId() != null)
				existing.setHospitalId(dto.getHospitalId());
			if (dto.getFullName() != null)
				existing.setFullName(dto.getFullName());
			if (dto.getGender() != null)
				existing.setGender(dto.getGender());
			if (dto.getQualification() != null)
				existing.setQualification(dto.getQualification());
			if (dto.getDateOfBirth() != null)
				existing.setDateOfBirth(dto.getDateOfBirth());
			if (dto.getContactNumber() != null)
				existing.setContactNumber(dto.getContactNumber());
			if (dto.getGovernmentId() != null)
				existing.setGovernmentId(dto.getGovernmentId());
			if (dto.getPharmacyLicense() != null)
				existing.setPharmacyLicense(dto.getPharmacyLicense());
			if (dto.getStatePharmacyCouncilRegistration() != null)
				existing.setStatePharmacyCouncilRegistration(dto.getStatePharmacyCouncilRegistration());
			if (dto.getDateOfJoining() != null)
				existing.setDateOfJoining(dto.getDateOfJoining());
			if (dto.getDepartment() != null)
				existing.setDepartment(dto.getDepartment());
			if (dto.getBankAccountDetails() != null)
				existing.setBankAccountDetails(dto.getBankAccountDetails());
			if (dto.getAddress() != null)
				existing.setAddress(dto.getAddress());
			if (dto.getEmailID() != null)
				existing.setEmailID(dto.getEmailID());
			if (dto.getPreviousEmploymentHistory() != null)
				existing.setPreviousEmploymentHistory(dto.getPreviousEmploymentHistory());
			if (dto.getExperienceCertificates() != null)
				existing.setExperienceCertificates(dto.getExperienceCertificates());
			if (dto.getEmergencyContactNumber() != null)
				existing.setEmergencyContactNumber(dto.getEmergencyContactNumber());
			if (dto.getDPharmaOrBPharmaCertificate() != null)
				existing.setDPharmaOrBPharmaCertificate(dto.getDPharmaOrBPharmaCertificate());

			Pharmacist updated = pharmacistRepository.save(existing);

			response.setSuccess(true);
			response.setData(mapEntityToDto(updated));
			response.setMessage("Pharmacist updated successfully");
			response.setStatus(HttpStatus.OK.value());
			return response;

		}).orElseGet(() -> {
			response.setSuccess(false);
			response.setMessage("Pharmacist not found");
			response.setStatus(HttpStatus.NOT_FOUND.value());
			return response;
		});
	}

	@Override
	public Response deletePharmacist(String pharmacistId) {
		Response response = new Response();
		Optional<Pharmacist> existing = pharmacistRepository.findByPharmacistId(pharmacistId);

		if (existing.isPresent()) {
			pharmacistRepository.deleteByPharmacistId(pharmacistId);
			response.setSuccess(true);
			response.setMessage("Pharmacist deleted successfully");
			response.setStatus(HttpStatus.NO_CONTENT.value());
		} else {
			response.setSuccess(false);
			response.setMessage("Pharmacist not found");
			response.setStatus(HttpStatus.NOT_FOUND.value());
		}
		return response;
	}

	// ---------------- LOGIN ----------------
//	@Override
//	public Response pharmacistLogin(PharmacistLoginDTO loginDTO) {
//		Response response = new Response();
//		Optional<Pharmacist> pharmacist = pharmacistRepository.findByUserName(loginDTO.getUserName());
//
//		if (pharmacist.isPresent()) {
//			if (pharmacist.get().getPassword().equals(loginDTO.getPassword())) {
//				response.setSuccess(true);
//				response.setMessage("Login Successful");
//				response.setStatus(HttpStatus.OK.value());
//			} else {
//				response.setSuccess(false);
//				response.setMessage("Invalid password");
//				response.setStatus(HttpStatus.UNAUTHORIZED.value());
//			}
//		} else {
//			response.setSuccess(false);
//			response.setMessage("Invalid Username");
//			response.setStatus(HttpStatus.NOT_FOUND.value());
//		}
//		return response;
//	}

	// ---------------- RESET PASSWORD ----------------
//	@Override
//	public Response resetLoginPassword(ResetPharmacistLoginPasswordDTO dto) {
//		Response response = new Response();
//		Optional<Pharmacist> pharmacistOpt = pharmacistRepository.findByUserName(dto.getUserName());
//
//		if (pharmacistOpt.isPresent()) {
//			Pharmacist pharmacist = pharmacistOpt.get();
//			if (pharmacist.getPassword().equals(dto.getCurrentPassword())) {
//				if (dto.getNewPassword().equals(dto.getConfirmPassword())) {
//					pharmacist.setPassword(dto.getNewPassword());
//					pharmacistRepository.save(pharmacist);
//					response.setSuccess(true);
//					response.setMessage("Password updated successfully");
//					response.setStatus(HttpStatus.OK.value());
//				} else {
//					response.setSuccess(false);
//					response.setMessage("New password and confirm password do not match");
//					response.setStatus(HttpStatus.BAD_REQUEST.value());
//				}
//			} else {
//				response.setSuccess(false);
//				response.setMessage("Invalid current password");
//				response.setStatus(HttpStatus.UNAUTHORIZED.value());
//			}
//		} else {
//			response.setSuccess(false);
//			response.setMessage("Invalid Username");
//			response.setStatus(HttpStatus.NOT_FOUND.value());
//		}
//		return response;
//	}

	// ---------------- Helper Methods ----------------
	private Pharmacist mapDtoToEntity(PharmacistDTO dto) {
		Pharmacist pharmacist = new Pharmacist();
		pharmacist.setHospitalId(dto.getHospitalId());
		pharmacist.setHospitalName(dto.getHospitalName());
		pharmacist.setBranchId(dto.getBranchId());
		pharmacist.setRole(dto.getRole());
		pharmacist.setPermissions(dto.getPermissions());		
		pharmacist.setFullName(dto.getFullName());
		pharmacist.setGender(dto.getGender());
		pharmacist.setQualification(dto.getQualification());
		pharmacist.setDateOfBirth(dto.getDateOfBirth());
		pharmacist.setContactNumber(dto.getContactNumber());
		pharmacist.setGovernmentId(dto.getGovernmentId());
		pharmacist.setPharmacyLicense(dto.getPharmacyLicense());
		pharmacist.setDateOfJoining(dto.getDateOfJoining());
		pharmacist.setDepartment(dto.getDepartment());
		pharmacist.setBankAccountDetails(dto.getBankAccountDetails());
		pharmacist.setAddress(dto.getAddress());
		pharmacist.setEmailID(dto.getEmailID());
		pharmacist.setEmergencyContactNumber(dto.getEmergencyContactNumber());
		pharmacist.setPreviousEmploymentHistory(dto.getPreviousEmploymentHistory());
		pharmacist.setProfilePicture(Base64CompressionUtil.compressBase64(dto.getProfilePicture()));
		pharmacist.setStatePharmacyCouncilRegistration(
				Base64CompressionUtil.compressBase64(dto.getStatePharmacyCouncilRegistration()));
		pharmacist.setExperienceCertificates(Base64CompressionUtil.compressBase64(dto.getExperienceCertificates()));
		pharmacist.setDPharmaOrBPharmaCertificate(
				Base64CompressionUtil.compressBase64(dto.getDPharmaOrBPharmaCertificate()));
		return pharmacist;
	}

	private PharmacistDTO mapEntityToDto(Pharmacist pharmacist) {
		PharmacistDTO dto = new PharmacistDTO();
		dto.setId(pharmacist.getId().toString());
		dto.setPharmacistId(pharmacist.getPharmacistId());
		dto.setHospitalId(pharmacist.getHospitalId());
		dto.setHospitalName(pharmacist.getHospitalName());
		dto.setBranchId(pharmacist.getBranchId());
		dto.setRole(pharmacist.getRole());
		dto.setFullName(pharmacist.getFullName());
		dto.setGender(pharmacist.getGender());
		dto.setQualification(pharmacist.getQualification());
		dto.setDateOfBirth(pharmacist.getDateOfBirth());
		dto.setContactNumber(pharmacist.getContactNumber());
		dto.setGovernmentId(pharmacist.getGovernmentId());
		dto.setPharmacyLicense(pharmacist.getPharmacyLicense());
		dto.setDateOfJoining(pharmacist.getDateOfJoining());
		dto.setDepartment(pharmacist.getDepartment());
		dto.setBankAccountDetails(pharmacist.getBankAccountDetails());
		dto.setAddress(pharmacist.getAddress());
		dto.setEmailID(pharmacist.getEmailID());
		dto.setPreviousEmploymentHistory(pharmacist.getPreviousEmploymentHistory());
		dto.setEmergencyContactNumber(pharmacist.getEmergencyContactNumber());
		dto.setProfilePicture(Base64CompressionUtil.decompressBase64(pharmacist.getProfilePicture()));
		dto.setDPharmaOrBPharmaCertificate(
				Base64CompressionUtil.decompressBase64(pharmacist.getDPharmaOrBPharmaCertificate()));
		dto.setExperienceCertificates(Base64CompressionUtil.decompressBase64(pharmacist.getExperienceCertificates()));
		dto.setStatePharmacyCouncilRegistration(
				Base64CompressionUtil.decompressBase64(pharmacist.getStatePharmacyCouncilRegistration()));
		dto.setPermissions(pharmacist.getPermissions());
		return dto;
	}

	private String generatePharmacistId() {
		return "PH_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
	}

	private String generateStructuredPassword() {
		String[] words = { "Pharma" };
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