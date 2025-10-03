package com.clinicadmin.sevice.impl;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.clinicadmin.dto.Branch;
import com.clinicadmin.dto.ChangeDoctorPasswordDTO;
import com.clinicadmin.dto.ClinicDTO;
import com.clinicadmin.dto.ClinicWithDoctorsDTO;
import com.clinicadmin.dto.ClinicWithDoctorsDTO2;
import com.clinicadmin.dto.ConsultationTypeDTO;
import com.clinicadmin.dto.DoctorAvailabilityStatusDTO;
import com.clinicadmin.dto.DoctorAvailableSlotDTO;
import com.clinicadmin.dto.DoctorCategoryDTO;
import com.clinicadmin.dto.DoctorLoginDTO;
import com.clinicadmin.dto.DoctorServicesDTO;
import com.clinicadmin.dto.DoctorSlotDTO;
import com.clinicadmin.dto.DoctorSubServiceDTO;
import com.clinicadmin.dto.DoctorsDTO;
import com.clinicadmin.dto.ResBody;
import com.clinicadmin.dto.Response;
import com.clinicadmin.entity.ConsultationType;
import com.clinicadmin.entity.DoctorCounter;
import com.clinicadmin.entity.DoctorLoginCredentials;
import com.clinicadmin.entity.DoctorSlot;
import com.clinicadmin.entity.Doctors;
import com.clinicadmin.feignclient.AdminServiceClient;
import com.clinicadmin.feignclient.NotificationFeign;
import com.clinicadmin.feignclient.ServiceFeignClient;
import com.clinicadmin.repository.DoctorLoginCredentialsRepository;
import com.clinicadmin.repository.DoctorSlotRepository;
import com.clinicadmin.repository.DoctorsRepository;
import com.clinicadmin.service.DoctorService;
import com.clinicadmin.utils.Base64CompressionUtil;
import com.clinicadmin.utils.DoctorMapper;
import com.clinicadmin.utils.DoctorSlotMapper;
import com.clinicadmin.utils.ExtractFeignMessage;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import feign.FeignException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class DoctorServiceImpl implements DoctorService {
	@Autowired
	private DoctorsRepository doctorsRepository;

	@Autowired
	private DoctorLoginCredentialsRepository credentialsRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private DoctorSlotRepository slotRepository;

	@Autowired
	private ServiceFeignClient serviceFeignClient;

	@Autowired
	AdminServiceClient adminServiceClient;

	@Autowired
	private NotificationFeign notificationFeign;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private MongoOperations mongoOperations;

	public DoctorServiceImpl(DoctorsRepository doctorsRepository,
			DoctorLoginCredentialsRepository credentialsRepository, PasswordEncoder passwordEncoder,
			DoctorSlotRepository slotRepository, ServiceFeignClient serviceFeignClient) {
		this.doctorsRepository = doctorsRepository;
		this.credentialsRepository = credentialsRepository;
		this.passwordEncoder = passwordEncoder;
		this.slotRepository = slotRepository;
		this.serviceFeignClient = serviceFeignClient;

	}

	@Override
	public Response addDoctor(DoctorsDTO dto) {
		Response response = new Response();
		try {
			dto.trimAllDoctorFields();

			// -------------------- Check duplicate mobile --------------------
			if (doctorsRepository.existsByDoctorMobileNumber(dto.getDoctorMobileNumber())) {
				response.setSuccess(false);
				response.setMessage("Doctor with this mobile number already exists");
				response.setStatus(HttpStatus.BAD_REQUEST.value());
				return response;
			}
			if (credentialsRepository.existsByUsername(dto.getDoctorMobileNumber())) {
				response.setSuccess(false);
				response.setMessage("Login credentials already exist for this mobile number");
				response.setStatus(HttpStatus.BAD_REQUEST.value());
				return response;
			}

			// -------------------- Validate clinic --------------------
			ResponseEntity<Response> clinicRes;
			try {
				clinicRes = adminServiceClient.getClinicById(dto.getHospitalId());
			} catch (FeignException fe) {
				response.setSuccess(false);
				response.setMessage("Clinic not found with ID: " + dto.getHospitalId());
				response.setStatus(HttpStatus.NOT_FOUND.value());
				return response;
			}

			if (clinicRes.getBody() == null || !clinicRes.getBody().isSuccess()) {
				response.setSuccess(false);
				response.setMessage("Clinic not found with ID: " + dto.getHospitalId());
				response.setStatus(HttpStatus.NOT_FOUND.value());
				return response;
			}

			ClinicDTO clinicDTO = objectMapper.convertValue(clinicRes.getBody().getData(), ClinicDTO.class);

			// -------------------- Validate branch --------------------
			if (dto.getBranchId() == null || dto.getBranchId().isBlank()) {
				response.setSuccess(false);
				response.setMessage("Branch ID is required");
				response.setStatus(HttpStatus.BAD_REQUEST.value());
				return response;
			}

			ResponseEntity<Response> branchRes;
			try {
				branchRes = adminServiceClient.getBranchByClinicAndBranchId(dto.getHospitalId(), dto.getBranchId());
			} catch (FeignException fe) {
				response.setSuccess(false);
				response.setMessage("Branch not found for clinicId: " + dto.getHospitalId() + " and branchId: "
						+ dto.getBranchId());
				response.setStatus(HttpStatus.NOT_FOUND.value());
				return response;
			}

			if (branchRes.getBody() == null || !branchRes.getBody().isSuccess()) {
				response.setSuccess(false);
				response.setMessage("Branch not found for clinicId: " + dto.getHospitalId() + " and branchId: "
						+ dto.getBranchId());
				response.setStatus(HttpStatus.NOT_FOUND.value());
				return response;
			}

			Branch branchDTO = objectMapper.convertValue(branchRes.getBody().getData(), Branch.class);

			// -------------------- Generate doctorId --------------------
			String clinicSeq = String.format("%04d", Integer.parseInt(dto.getHospitalId()));
			String branchSeq = branchDTO.getBranchId().substring(clinicSeq.length());

			String counterKey = "doctor_" + dto.getHospitalId() + "_" + branchDTO.getBranchId();
			Query query = Query.query(Criteria.where("_id").is(counterKey));
			Update update = new Update().inc("seq", 1);
			FindAndModifyOptions options = FindAndModifyOptions.options().upsert(true).returnNew(true);

			DoctorCounter counter = mongoOperations.findAndModify(query, update, options, DoctorCounter.class);
			long nextDoctorSeq = (counter != null) ? counter.getSeq() : 1L;
			String doctorSeq = String.format("%02d", nextDoctorSeq);

			String doctorId = clinicSeq + branchSeq + doctorSeq;
			dto.setDoctorId(doctorId);

			// -------------------- Map DTO -> Entity --------------------
			Doctors doctor = DoctorMapper.mapDoctorDTOtoDoctorEntity(dto);

			doctor.setDoctorId(doctorId);
			doctor.setHospitalName(clinicDTO.getName());

			// ⚡ Strict branch assignment: Only use the branch provided in payload
			doctor.setBranchId(dto.getBranchId());

			// -------------------- Save doctor --------------------
			Doctors savedDoctor = doctorsRepository.save(doctor);

			// -------------------- Create login credentials --------------------
			String username = savedDoctor.getDoctorMobileNumber();
			String rawPassword = generateStructuredPassword();
			String encodedPassword = passwordEncoder.encode(rawPassword);

			DoctorLoginCredentials credentials = DoctorLoginCredentials.builder().staffId(savedDoctor.getDoctorId())
					.staffName(savedDoctor.getDoctorName()).hospitalId(savedDoctor.getHospitalId())
					.hospitalName(savedDoctor.getHospitalName()).branchId(savedDoctor.getBranchId()).username(username)
					.password(encodedPassword).role(dto.getRole()).permissions(savedDoctor.getPermissions()).build();

			credentialsRepository.save(credentials);

			Map<String, Object> data = new HashMap<>();
			data.put("doctor", savedDoctor);
			data.put("username", username);
			data.put("temporaryPassword", rawPassword);
			data.put("generatedDoctorId", doctorId);

			response.setSuccess(true);
			response.setData(data);
			response.setMessage("Doctor added successfully with login credentials");
			response.setStatus(HttpStatus.CREATED.value());

		} catch (Exception e) {
			response.setSuccess(false);
			response.setMessage("Error occurred while adding doctor: " + e.getMessage());
			response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
		}

		return response;
	}

	@Override
	public Response getAllDoctors() {
		Response response = new Response();
		try {
			List<Doctors> doctors = doctorsRepository.findAll();

			if (doctors.isEmpty()) {
				response.setSuccess(true);
				response.setData(Collections.emptyList());
				response.setMessage("No doctor data available");
				response.setStatus(HttpStatus.OK.value());
			} else {
				response.setSuccess(true);
				response.setData(doctors);
				response.setMessage("Doctor data retrieved successfully");
				response.setStatus(HttpStatus.OK.value());
			}

		} catch (Exception e) {
			response.setSuccess(false);
			response.setData(null);
			response.setMessage("Error while fetching doctors: " + e.getMessage());
			response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
		}
		return response;
	}

	@Override
	public Response getDoctorsByClinicId(String hospitalId) {
		Response response = new Response();
		try {
			List<Doctors> doctorList = doctorsRepository.findByHospitalId(hospitalId);
			if (!doctorList.isEmpty()) {
				List<DoctorsDTO> dtos = doctorList.stream().map(DoctorMapper::mapDoctorEntityToDoctorDTO)
						.collect(Collectors.toList());
				response.setSuccess(true);
				response.setData(dtos);
				response.setMessage("Doctors fetched successfully");
				response.setStatus(200);
			} else {
				response.setSuccess(true);
				response.setData(Collections.emptyList()); // Return an empty list
				response.setMessage("No doctors found for hospitalId: " + hospitalId);
				response.setStatus(200);

			}
		} catch (Exception e) {
			response.setSuccess(false);
			response.setMessage("An error occurred while fetching doctors for hospitalId: " + hospitalId);
			response.setStatus(500);
		}
		return response;
	}

	@Override
	public Response getDoctorById(String id) {
		Response response = new Response();
		try {
			Optional<Doctors> doctorOptional = doctorsRepository.findByDoctorId(id);
			;
			if (doctorOptional.isPresent()) {
				response.setSuccess(true);
				response.setData(doctorOptional.get());
				response.setMessage("Doctor found");
				response.setStatus(HttpStatus.OK.value());
			} else {
				response.setSuccess(false);
				response.setData(null);
				response.setMessage("Doctor not found with ID: " + id);
				response.setStatus(HttpStatus.NOT_FOUND.value());
			}
		} catch (Exception e) {
			response.setSuccess(false);
			response.setData(null);
			response.setMessage("Error fetching doctor by ID: " + e.getMessage());
			response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
		}
		return response;
	}

	@Override
	public Response upDateDoctorById(String doctorId, DoctorsDTO dto) {
		Response response = new Response();
		try {
			Optional<Doctors> doctorOptional = doctorsRepository.findByDoctorId(doctorId);

			if (doctorOptional.isEmpty()) {
				response.setSuccess(false);
				response.setData(null);
				response.setMessage("Doctor not found with ID: " + doctorId);
				response.setStatus(HttpStatus.NOT_FOUND.value());
				return response;
			}

			// Validate categories
			if (dto.getCategory() != null) {
				for (DoctorCategoryDTO DoctorCatDTO : dto.getCategory()) {
					if (!serviceFeignClient.isCategoryExists(DoctorCatDTO.getCategoryId())) {
						response.setSuccess(false);
						response.setMessage("Category does not exist: " + DoctorCatDTO.getCategoryId());
						response.setStatus(HttpStatus.NOT_FOUND.value());
						return response;
					}
				}
			}

			// Validate services
			if (dto.getService() != null) {
				for (DoctorServicesDTO DoctorSerDTO : dto.getService()) {
					if (!serviceFeignClient.isServiceExists(DoctorSerDTO.getServiceId())) {
						response.setSuccess(false);
						response.setMessage("Service does not exist: " + DoctorSerDTO.getServiceId());
						response.setStatus(HttpStatus.NOT_FOUND.value());
						return response;
					}
				}
			}

			// Validate sub-services
			if (dto.getSubServices() != null) {
				for (DoctorSubServiceDTO DoctorSubSerDTO : dto.getSubServices()) {
					if (!serviceFeignClient.isSubServiceExists(DoctorSubSerDTO.getSubServiceId())) {
						response.setSuccess(false);
						response.setMessage("SubService does not exist: " + DoctorSubSerDTO.getSubServiceId());
						response.setStatus(HttpStatus.NOT_FOUND.value());
						return response;
					}
				}
			}

			Doctors doctor = doctorOptional.get();

			// Update non-null fields only
			if (dto.getDoctorPicture() != null)
				doctor.setDoctorPicture(Base64CompressionUtil.compressBase64(dto.getDoctorPicture()));
			if (dto.getHospitalId() != null)
				doctor.setHospitalId(dto.getHospitalId());
			if (dto.getDoctorEmail() != null)
				doctor.setDoctorEmail(dto.getDoctorEmail());
			if (dto.getDoctorLicence() != null)
				doctor.setDoctorLicence(dto.getDoctorLicence());
			if (dto.getDoctorMobileNumber() != null)
				doctor.setDoctorMobileNumber(dto.getDoctorMobileNumber());
			if (dto.getDoctorName() != null)
				doctor.setDoctorName(dto.getDoctorName());
			if (dto.getCategory() != null)
				doctor.setCategory(dto.getCategory());
			if (dto.getService() != null)
				doctor.setService(dto.getService());
			if (dto.getSubServices() != null)
				doctor.setSubServices(dto.getSubServices());
			if (dto.getSpecialization() != null)
				doctor.setSpecialization(dto.getSpecialization());
			if (dto.getGender() != null)
				doctor.setGender(dto.getGender());
			if (dto.getExperience() != null)
				doctor.setExperience(dto.getExperience());
			if (dto.getQualification() != null)
				doctor.setQualification(dto.getQualification());
			if (dto.getAvailableDays() != null)
				doctor.setAvailableDays(dto.getAvailableDays());
			if (dto.getAvailableTimes() != null)
				doctor.setAvailableTimes(dto.getAvailableTimes());
			if (dto.getProfileDescription() != null)
				doctor.setProfileDescription(dto.getProfileDescription());
			if (dto.getFocusAreas() != null)
				doctor.setFocusAreas(dto.getFocusAreas());
			if (dto.getDoctorAverageRating() != 0.0)
				doctor.setDoctorAverageRating(dto.getDoctorAverageRating());
			if (dto.getLanguages() != null)
				doctor.setLanguages(dto.getLanguages());
			if (dto.getHighlights() != null)
				doctor.setHighlights(dto.getHighlights());
			if (dto.getDoctorSignature() != null)
				doctor.setDoctorSignature(Base64CompressionUtil.compressBase64(dto.getDoctorSignature()));
			if (dto.getDoctorFees() != null)
				doctor.setDoctorFees(DoctorMapper.mapDoctorFeeDTOtoEntity(dto.getDoctorFees()));

			// Booleans (we assume default false if not set, so be cautious)
			doctor.setDoctorAvailabilityStatus(dto.isDoctorAvailabilityStatus());
			doctor.setRecommendation(dto.isRecommendation());
			doctor.setAssociatedWithIADVC(dto.isAssociatedWithIADVC());
			doctor.setAssociationsOrMemberships(dto.getAssociationsOrMemberships());
			doctor.setBranches(dto.getBranches());

			Doctors updatedDoctor = doctorsRepository.save(doctor);

			response.setSuccess(true);
			response.setData(updatedDoctor);
			response.setMessage("Doctor updated successfully");
			response.setStatus(HttpStatus.OK.value());

		} catch (Exception e) {
			response.setSuccess(false);
			response.setData(null);
			response.setMessage("Error updating doctor: " + e.getMessage());
			response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
		}
		return response;
	}

	@Override
	public Response getDoctorsByClinicIdAndDoctorId(String clinicId, String doctorId) {
		Response response = new Response();

		try {
			// Validate inputs
			if (clinicId == null || clinicId.trim().isEmpty()) {
				response.setSuccess(false);
				response.setData(Collections.emptyList());
				response.setMessage("Clinic ID (hospitalId) is required.");
				response.setStatus(HttpStatus.BAD_REQUEST.value());
				return response;
			}

			if (doctorId == null || doctorId.trim().isEmpty()) {
				response.setSuccess(false);
				response.setData(Collections.emptyList());
				response.setMessage("Doctor ID is required.");
				response.setStatus(HttpStatus.BAD_REQUEST.value());
				return response;
			}

			// Fetch doctor by clinicId and doctorId
			Optional<Doctors> doctorOptional = doctorsRepository.findByHospitalIdAndDoctorId(clinicId, doctorId);

			if (doctorOptional.isPresent()) {
				response.setSuccess(true);
				response.setData(doctorOptional.get());
				response.setMessage("Doctor found");
				response.setStatus(HttpStatus.OK.value());
			} else {
				response.setSuccess(false);
				response.setData(Collections.emptyList());
				response.setMessage("Doctor not found with ID: " + doctorId + " in Clinic: " + clinicId);
				response.setStatus(HttpStatus.NOT_FOUND.value());
			}

		} catch (Exception e) {
			response.setSuccess(false);
			response.setData(Collections.emptyList());
			response.setMessage("Error fetching doctor: " + e.getMessage());
			response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
		}

		return response;
	}

	@Override
	public Response deleteDoctorById(String doctorId) {
		Response response = new Response();
		try {
			Optional<Doctors> optionalDoctor = doctorsRepository.findByDoctorId(doctorId);

			if (optionalDoctor.isPresent()) {

				doctorsRepository.deleteById(optionalDoctor.get().getId());

				Optional<DoctorLoginCredentials> optionalCredentials = credentialsRepository.findByStaffId(doctorId);
				optionalCredentials.ifPresent(credentialsRepository::delete);

				response.setSuccess(true);
				response.setStatus(HttpStatus.OK.value());
				response.setMessage("Doctor and credentials deleted successfully.");
			} else {
				response.setSuccess(false);
				response.setStatus(HttpStatus.NOT_FOUND.value());
				response.setMessage("Doctor not found with ID: " + doctorId);
			}
		} catch (Exception e) {
			response.setSuccess(false);
			response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
			response.setMessage("Error deleting doctor: " + e.getMessage());
		}
		return response;
	}

	@Override

	public Response deleteDoctorFromBranch(String doctorId, String branchId) {

		Response response = new Response();

		Optional<Doctors> optionalDoctor = doctorsRepository.findByDoctorId(doctorId);

		if (optionalDoctor.isEmpty()) {

			response.setSuccess(false);

			response.setStatus(HttpStatus.NOT_FOUND.value());

			response.setMessage("Doctor not found with ID: " + doctorId);

			return response;

		}

		Doctors doctor = optionalDoctor.get();

		if (doctor.getBranches() == null || doctor.getBranches().isEmpty()) {

			response.setSuccess(false);

			response.setStatus(HttpStatus.BAD_REQUEST.value());

			response.setMessage("Doctor has no branches assigned");

			return response;

		}

		// Remove the branch

		Boolean removed = doctor.getBranches().removeIf(b -> b.getBranchId().equals(branchId));

		if (!removed) {

			response.setSuccess(false);

			response.setStatus(HttpStatus.NOT_FOUND.value());

			response.setMessage("Doctor not assigned to branch: " + branchId);

			return response;

		}

		if (doctor.getBranches().isEmpty()) {

			// No branches left, delete the doctor and credentials

			doctorsRepository.deleteById(doctor.getId());

			Optional<DoctorLoginCredentials> optionalCredentials = credentialsRepository.findByStaffId(doctorId);

			optionalCredentials.ifPresent(credentialsRepository::delete);

			response.setSuccess(true);

			response.setStatus(HttpStatus.OK.value());

			response.setMessage("Doctor deleted entirely as no branches left");

		} else {

			// Update doctor with remaining branches

			doctorsRepository.save(doctor);

			response.setSuccess(true);

			response.setStatus(HttpStatus.OK.value());

			response.setMessage("Doctor removed from branch successfully");

		}

		return response;

	}

	@Override
	public Response deleteDoctorsByClinic(String hospitalId) {
		Response response = new Response();
		try {
			List<Doctors> doctors = doctorsRepository.findByHospitalId(hospitalId);

			if (!doctors.isEmpty()) {
				for (Doctors doctor : doctors) {
					// Delete login credentials first
					Optional<DoctorLoginCredentials> optionalCredentials = credentialsRepository
							.findByStaffId(doctor.getDoctorId());
					optionalCredentials.ifPresent(credentialsRepository::delete);

					// Then delete the doctor record
					doctorsRepository.deleteById(doctor.getId());
				}
				response.setSuccess(true);
				response.setStatus(HttpStatus.OK.value());
				response.setMessage(
						"All doctors and their credentials linked to clinic ID " + hospitalId + " have been deleted.");
			} else {
				response.setSuccess(false);
				response.setStatus(HttpStatus.NOT_FOUND.value());
				response.setMessage("No doctors found for clinic ID: " + hospitalId);
			}
		} catch (Exception e) {
			response.setSuccess(false);
			response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
			response.setMessage("Error deleting doctors linked to clinic ID " + hospitalId + ": " + e.getMessage());
		}

		return response;
	}

	// -------------------------------DOCTOR
	// LOGIN-------------------------------------------------------------
	@Override
	public Response login(DoctorLoginDTO loginDTO) {
		Response responseDTO = new Response();
		System.out.println(loginDTO);
		Optional<DoctorLoginCredentials> credentialsOptional = credentialsRepository
				.findByUsername(loginDTO.getUserName());

		if (credentialsOptional.isPresent()) {
			DoctorLoginCredentials credentials = credentialsOptional.get();
			System.out.println(credentials);
			boolean matches = passwordEncoder.matches(loginDTO.getPassword(), credentials.getPassword());

			if (matches) {
				Optional<Doctors> doctors = doctorsRepository.findByDoctorId(credentials.getStaffId());
				if (doctors.isPresent()) {
					Doctors doctor = doctors.get();
					doctor.setDeviceId(loginDTO.getDeviceId());
					Doctors savedDoctor = doctorsRepository.save(doctor);
					DoctorsDTO savedDTO = DoctorMapper.mapDoctorEntityToDoctorDTO(savedDoctor);
				}

				DoctorLoginDTO dto = new DoctorLoginDTO();
				dto.setUserName(credentials.getUsername());
				dto.setDeviceId(loginDTO.getDeviceId());
				dto.setStaffId(credentials.getStaffId());
				dto.setHospitalId(credentials.getHospitalId());

				responseDTO.setData(dto);
				responseDTO.setStatus(HttpStatus.OK.value());
				responseDTO.setMessage("Login successful");
				responseDTO.setSuccess(true);
			} else {
				responseDTO.setData(null);
				responseDTO.setStatus(HttpStatus.NOT_FOUND.value());
				responseDTO.setMessage("Invalid password");
				responseDTO.setSuccess(false);
			}
		} else {
			// Check if any user exists with the given password (to differentiate case 4)
			List<DoctorLoginCredentials> allCredentials = credentialsRepository.findAll();
			boolean passwordExists = allCredentials.stream()
					.anyMatch(cred -> passwordEncoder.matches(loginDTO.getPassword(), cred.getPassword()));

			responseDTO.setData(null);
			responseDTO.setStatus(HttpStatus.NOT_FOUND.value());
			responseDTO.setMessage(passwordExists ? "Invalid username" : "Invalid username and password");
			responseDTO.setSuccess(false);
		}

		return responseDTO;
	}

	// -------------------------------DOCTOR can Change
	// password-------------------------------------------------------------
	@Override
	public Response changePassword(ChangeDoctorPasswordDTO updateDTO) {
		Response responseDTO = new Response();

		if (!updateDTO.getNewPassword().equals(updateDTO.getConfirmPassword())) {
			responseDTO.setSuccess(false);
			responseDTO.setStatus(HttpStatus.BAD_REQUEST.value());
			responseDTO.setMessage("New password and confirm password do not match");
			responseDTO.setData(null);
			return responseDTO;
		}

		Optional<DoctorLoginCredentials> optionalCredentials = credentialsRepository
				.findByUsername(updateDTO.getUserName());

		if (optionalCredentials.isPresent()) {
			DoctorLoginCredentials credentials = optionalCredentials.get();

			if (passwordEncoder.matches(updateDTO.getCurrentPassword(), credentials.getPassword())) {
				credentials.setPassword(passwordEncoder.encode(updateDTO.getNewPassword()));
				credentialsRepository.save(credentials);

				responseDTO.setSuccess(true);
				responseDTO.setStatus(HttpStatus.OK.value());
				responseDTO.setMessage("Password updated successfully");
				responseDTO.setData(null);
			} else {
				responseDTO.setSuccess(false);
				responseDTO.setStatus(HttpStatus.UNAUTHORIZED.value());
				responseDTO.setMessage("Old password is incorrect");
				responseDTO.setData(null);
			}
		} else {
			responseDTO.setSuccess(false);
			responseDTO.setStatus(HttpStatus.NOT_FOUND.value());
			responseDTO.setMessage("Doctor not found");
			responseDTO.setData(null);
		}

		return responseDTO;
	}

//    ---------------------Get DoctorsAll By hospitalId---------------------------------------
	@Override
	public Response getDoctorsByClinicIdAndBranchId(String hospitalId, String branchId) {
		Response response = new Response();
		try {
			List<Doctors> doctorList = doctorsRepository.findByHospitalIdAndBranchId(hospitalId, branchId);

			if (!doctorList.isEmpty()) {
				List<DoctorsDTO> dtos = doctorList.stream().map(DoctorMapper::mapDoctorEntityToDoctorDTO)
						.collect(Collectors.toList());

				response.setSuccess(true);
				response.setData(dtos);
				response.setMessage("Doctors fetched successfully");
				response.setStatus(200);
			} else {
				response.setSuccess(true);
				response.setData(Collections.emptyList());
				response.setMessage("No doctors found for hospitalId: " + hospitalId + " and branchId: " + branchId);
				response.setStatus(200);
			}
		} catch (Exception e) {
			response.setSuccess(false);
			response.setMessage("An error occurred while fetching doctors for hospitalId: " + hospitalId
					+ " and branchId: " + branchId);
			response.setStatus(500);
		}
		return response;
	}

	// ----------------- Helper Methods ------------------------

	private String generateDoctorId() {
		String doctorId = "DC_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
		// Get the current count of doctors
		return doctorId;
	}

	private String generateStructuredPassword() {
		String[] words = { "doctor" };
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

//-------------------------------Doctor AvailabilityStatus--------------------------------------------------------------------------------
	@Override
	public Response availabilityStatus(String doctorId, DoctorAvailabilityStatusDTO status) {
		Response response = new Response();
		Optional<Doctors> doctor = doctorsRepository.findByDoctorId(doctorId);
		if (doctor.isPresent()) {
			Doctors getDoctor = doctor.get();
			getDoctor.setDoctorAvailabilityStatus(status.isDoctorAvailabilityStatus());
			doctorsRepository.save(getDoctor);
			response.setSuccess(true);
//			response.setData(getDoctor);
			String message = status.isDoctorAvailabilityStatus() ? "Doctor is now available"
					: "Doctor is now unavailable";
			response.setMessage(message);
			response.setStatus(HttpStatus.OK.value());
		} else {
			response.setSuccess(false);
			response.setMessage("Doctor Not found with this id :" + doctorId);
			response.setStatus(HttpStatus.NOT_FOUND.value());
		}
		return response;
	}

	// -------------------------------------Adding
	// Slots---------------------------------------------------------------------------------------
	@Override
	public Response saveDoctorSlot(String hospitalId, String doctorId, DoctorSlotDTO dto) {
		Response response = new Response();

		try {
			if (dto == null || dto.getAvailableSlots() == null || dto.getAvailableSlots().isEmpty()) {
				throw new IllegalArgumentException("Invalid slot details provided");
			}

			Optional<Doctors> getDoctor = doctorsRepository.findByDoctorId(doctorId);
			if (getDoctor.isEmpty()) {
				response.setSuccess(false);
				response.setMessage("Doctor not found with ID: " + doctorId);
				response.setStatus(HttpStatus.NOT_FOUND.value());
				return response;
			}

			// Corrected line: assuming repository returns Optional<DoctorSlot>
			DoctorSlot existingSlot = slotRepository.findByDoctorIdAndDate(doctorId, dto.getDate());
			DoctorSlot savedSlot;
			if (existingSlot != null) {
				List<DoctorAvailableSlotDTO> currentSlots = existingSlot.getAvailableSlots();

				// Filter incoming slots to avoid duplicates
				List<DoctorAvailableSlotDTO> newUniqueSlots = dto.getAvailableSlots().stream()
						.filter(incoming -> currentSlots.stream()
								.noneMatch(existing -> existing.getSlot().equals(incoming.getSlot())))
						.toList();

				currentSlots.addAll(newUniqueSlots); // Add only new unique slots
				existingSlot.setAvailableSlots(currentSlots);

				savedSlot = slotRepository.save(existingSlot);
			} else {
				DoctorSlot newSlot = DoctorSlotMapper.doctorSlotDTOtoEntity(dto);
				newSlot.setDoctorId(doctorId);
				newSlot.setHospitalId(hospitalId);
				savedSlot = slotRepository.save(newSlot);
			}

			response.setSuccess(true);
			response.setData(savedSlot);
			response.setMessage("Slot(s) saved successfully");
			response.setStatus(HttpStatus.CREATED.value());

		} catch (IllegalArgumentException e) {
			response.setSuccess(false);
			response.setMessage("Validation Error: " + e.getMessage());
			response.setStatus(HttpStatus.BAD_REQUEST.value());

		} catch (Exception e) {
			response.setSuccess(false);
			response.setMessage("An error occurred while saving slots: " + e.getMessage());
			response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
		}

		return response;
	}

//		-------------------------Get Slots by Doctors -------------------------------------------
	@Override
	public Response getDoctorSlots(String hospitalId, String doctorId) {
		List<DoctorSlot> slots = slotRepository.findByHospitalIdAndDoctorId(hospitalId, doctorId);

		if (slots == null || slots.isEmpty()) {
			Response response = new Response();
			response.setSuccess(true);
			response.setData(null);
			response.setMessage("Slots Not Found");
			response.setStatus(HttpStatus.OK.value());
			return response;
		}

		Response response = new Response();
		response.setSuccess(true);
		response.setData(slots);
		response.setMessage("Slots fetched successfully");
		response.setStatus(HttpStatus.OK.value());
		return response;
	}

	// --------------------------- detele slot by time and date using
	// doctorId-----------------------------------------
	@Override
	public Response deleteDoctorSlot(String doctorId, String date, String slotToDelete) {
		Response response = new Response();
		try {
			DoctorSlot doctorSlot = slotRepository.findByDoctorIdAndDate(doctorId, date);

			if (doctorSlot == null) {
				response.setSuccess(false);
				response.setData(null);
				response.setMessage("No slot found for the doctor on the given date");
				response.setStatus(HttpStatus.NOT_FOUND.value());
				return response;
			}

			boolean slotExists = doctorSlot.getAvailableSlots().stream()
					.anyMatch(s -> slotToDelete.equals(s.getSlot()) && !s.isSlotbooked());

			if (!slotExists) {
				response.setSuccess(false);
				response.setData(null);
				response.setMessage("Slot not found or already booked");
				response.setStatus(HttpStatus.BAD_REQUEST.value());
				return response;
			}

			List<DoctorAvailableSlotDTO> updatedSlots = doctorSlot.getAvailableSlots().stream()
					.filter(s -> !(slotToDelete.equals(s.getSlot()) && !s.isSlotbooked())).collect(Collectors.toList());

			doctorSlot.setAvailableSlots(updatedSlots);
			slotRepository.save(doctorSlot);

			DoctorSlotDTO dto = new DoctorSlotDTO();
			dto.setDoctorId(doctorSlot.getDoctorId());
			dto.setHospitalId(doctorSlot.getHospitalId());
			dto.setBranchId(doctorSlot.getBranchId());
			dto.setBranchName(doctorSlot.getBranchName());
			dto.setDate(doctorSlot.getDate());
			dto.setAvailableSlots(updatedSlots);

			response.setSuccess(true);
			response.setData(dto);
			response.setMessage("Slot deleted successfully");
			response.setStatus(HttpStatus.OK.value());
		} catch (Exception e) {
			response.setSuccess(false);
			response.setData(null);
			response.setMessage("Internal server error occurred: " + e.getMessage());
			response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
		}
		return response;
	}

	// -----------------------------update
	// Slot---------------------------------------------------------------------------
	@Override
	public Response updateDoctorSlot(String doctorId, String date, String oldSlot, String newSlot) {
		try {
			DoctorSlot doctorSlot = slotRepository.findByDoctorIdAndDate(doctorId, date);
			if (doctorSlot == null) {
				Response response = new Response();
				response.setSuccess(false);
				response.setData(null);
				response.setMessage("No slot found for the doctor on the given date");
				response.setStatus(HttpStatus.NOT_FOUND.value());
				return response;
			}
			List<DoctorAvailableSlotDTO> slots = doctorSlot.getAvailableSlots();

			boolean slotUpdated = false;

			for (DoctorAvailableSlotDTO slot : slots) {
				if (slot.getSlot().equals(oldSlot) && !slot.isSlotbooked()) {
					slot.setSlot(newSlot);
					slotUpdated = true;
					break;
				}
			}

			if (!slotUpdated) {
				Response response = new Response();
				response.setSuccess(false);
				response.setData(null);
				response.setMessage("Old slot not found or already booked");
				response.setStatus(HttpStatus.BAD_REQUEST.value());
				return response;

			}

			doctorSlot.setAvailableSlots(slots);
			slotRepository.save(doctorSlot);
			Response response = new Response();
			response.setSuccess(true);
			response.setData(doctorSlot);
			response.setMessage("Slot updated successfully");
			response.setStatus(HttpStatus.OK.value());
			return response;

		} catch (Exception e) {
			Response response = new Response();
			response.setSuccess(false);
			response.setData(null);
			response.setMessage("An error occurred: " + e.getMessage());
			response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
			return response;

		}
	}

	@Override
	public Response deleteDoctorSlotbyDate(String doctorId, String date) {
		DoctorSlot doctorSlot = slotRepository.findByDoctorIdAndDate(doctorId, date);

		if (doctorSlot == null) {
			Response response = new Response();
			response.setSuccess(false);
			response.setData(null);
			response.setMessage("No slots found for doctor on this date");
			response.setStatus(HttpStatus.NOT_FOUND.value());
			return response;
		}

		slotRepository.delete(doctorSlot);
		Response response = new Response();
		response.setSuccess(true);
		response.setData(null);
		response.setMessage("All slots deleted successfully for date " + date);
		response.setStatus(HttpStatus.OK.value());
		return response;

	}

	public boolean updateSlot(String doctorId, String date, String time) {
		try {
			DoctorSlot doctorSlots = slotRepository.findByDoctorIdAndDate(doctorId, date);
			for (DoctorAvailableSlotDTO slot : doctorSlots.getAvailableSlots()) {
				if (slot.getSlot().equalsIgnoreCase(time)) {
					slot.setSlotbooked(true);
					slotRepository.save(doctorSlots);
					return true;
				}
			}
			return false;
		} catch (NullPointerException e) {
			return false;
		}
	}

	public boolean makingFalseDoctorSlot(String doctorId, String date, String time) {
		try {
			DoctorSlot doctorSlots = slotRepository.findByDoctorIdAndDate(doctorId, date);
			for (DoctorAvailableSlotDTO slot : doctorSlots.getAvailableSlots()) {
				if (slot.getSlot().equalsIgnoreCase(time)) {
					slot.setSlotbooked(false);
					slotRepository.save(doctorSlots);
					return true;
				}
			}
			return false;
		} catch (NullPointerException e) {
			return false;
		}
	}
	// ---------------------------------------------Slots using
	// branchId----------------------------------------------

	// -------------------------------------Adding
	// Slots--------------------------------------------------------------
//	@Override
//	public Response saveDoctorSlot(String hospitalId, String branchId, String doctorId, DoctorSlotDTO dto) {
//
//		Response response = new Response();
//		try {
//			if (dto == null || dto.getAvailableSlots() == null || dto.getAvailableSlots().isEmpty()) {
//				throw new IllegalArgumentException("Invalid slot details provided");
//			}
//
//			Optional<Doctors> getDoctor = doctorsRepository.findByDoctorId(doctorId);
//			if (getDoctor.isEmpty()) {
//				response.setSuccess(false);
//				response.setMessage("Doctor not found with ID: " + doctorId);
//				response.setStatus(HttpStatus.NOT_FOUND.value());
//				return response;
//			}
//
//			DoctorSlot existingSlot = slotRepository.findByDoctorIdAndBranchIdAndDate(doctorId, branchId,
//					dto.getDate());
//			DoctorSlot savedSlot;
//
//			if (existingSlot != null) {
//				List<DoctorAvailableSlotDTO> currentSlots = existingSlot.getAvailableSlots();
//				List<DoctorAvailableSlotDTO> newUniqueSlots = dto.getAvailableSlots().stream()
//						.filter(incoming -> currentSlots.stream()
//								.noneMatch(existing -> existing.getSlot().equals(incoming.getSlot())))
//						.toList();
//
//				currentSlots.addAll(newUniqueSlots);
//				existingSlot.setAvailableSlots(currentSlots);
//				savedSlot = slotRepository.save(existingSlot);
//			} else {
//				DoctorSlot newSlot = DoctorSlotMapper.doctorSlotDTOtoEntity(dto);
//				newSlot.setDoctorId(doctorId);
//				newSlot.setHospitalId(hospitalId);
//				newSlot.setBranchId(branchId);
//				savedSlot = slotRepository.save(newSlot);
//			}
//
//			response.setSuccess(true);
//			response.setData(savedSlot);
//			response.setMessage("Slot(s) saved successfully");
//			response.setStatus(HttpStatus.CREATED.value());
//
//		} catch (IllegalArgumentException e) {
//			response.setSuccess(false);
//			response.setMessage("Validation Error: " + e.getMessage());
//			response.setStatus(HttpStatus.BAD_REQUEST.value());
//
//		} catch (Exception e) {
//			response.setSuccess(false);
//			response.setMessage("An error occurred while saving slots: " + e.getMessage());
//			response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
//		}
//
//		return response;
//	}
//	

	// ------------------------------Save doctor slots
	// dynamically-----------------------------------------------
//		@Override
//		public Response saveDoctorSlot(String hospitalId, String branchId, String doctorId, DoctorSlotDTO dto) {
//			Response response = new Response();
//
//			try {
//				// Validate input
//				if (dto == null || dto.getDate() == null || dto.getDate().isBlank() || dto.getSlotInterval() <= 0
//						|| dto.getOpeningTime() == null || dto.getClosingTime() == null) {
//					throw new IllegalArgumentException(
//							"Invalid slot details. Date, interval, openingTime, closingTime are required.");
//				}
//
//				Optional<Doctors> getDoctor = doctorsRepository.findByDoctorId(doctorId);
//				if (getDoctor.isEmpty()) {
//					response.setSuccess(false);
//					response.setMessage("Doctor not found with ID: " + doctorId);
//					response.setStatus(HttpStatus.NOT_FOUND.value());
//					return response;
//				}
//
//				// Generate all slots dynamically
//				List<DoctorAvailableSlotDTO> generatedSlots = generateSlots(dto.getOpeningTime(), dto.getClosingTime(),
//						dto.getSlotInterval());
//
//				// Fetch all slots of doctor for same date (all branches)
//				List<DoctorSlot> doctorSlotsOnDate = slotRepository.findAllByDoctorIdAndDate(doctorId, dto.getDate());
//
//				// Check conflicts and attach branch info using Feign client
//				generatedSlots.forEach(slot -> {
//					doctorSlotsOnDate.forEach(existingSlot -> {
//						if (existingSlot.getAvailableSlots() != null && isOverlapping(slot.getSlot(), dto.getSlotInterval(),
//								existingSlot.getAvailableSlots(), dto.getSlotInterval())) {
//
//							slot.setAvailable(false);
//
//							// Fetch branch name from Feign client if not present
//							String existingBranchName = existingSlot.getBranchName();
//							if (existingBranchName == null || existingBranchName.isBlank()) {
//								ResponseEntity<Response> branchResp = adminServiceClient
//										.getBranchById(existingSlot.getBranchId());
//								Branch branchDetails = objectMapper.convertValue(branchResp.getBody().getData(),
//										Branch.class);
//								existingBranchName = branchDetails != null ? branchDetails.getBranchName()
//										: "Unknown Branch";
//							}
//
//							slot.setReason("Already exists in " + existingBranchName);
//						}
//					});
//				});
//
//				// Save only selected slots from frontend
//				List<DoctorAvailableSlotDTO> slotsToSave = dto.getAvailableSlots();
//
//				if (slotsToSave != null && !slotsToSave.isEmpty()) {
//					DoctorSlot existingSlot = slotRepository.findByDoctorIdAndBranchIdAndDate(doctorId, branchId,
//							dto.getDate());
//
//					if (existingSlot != null) {
//						List<DoctorAvailableSlotDTO> currentSlots = existingSlot.getAvailableSlots();
//						List<DoctorAvailableSlotDTO> newUniqueSlots = slotsToSave.stream().filter(incoming -> currentSlots
//								.stream().noneMatch(existing -> existing.getSlot().equals(incoming.getSlot()))).toList();
//
//						currentSlots.addAll(newUniqueSlots);
//						existingSlot.setAvailableSlots(currentSlots);
//						slotRepository.save(existingSlot);
//					} else {
//						DoctorSlot newSlot = new DoctorSlot();
//						newSlot.setDoctorId(doctorId);
//						newSlot.setHospitalId(hospitalId);
//						newSlot.setBranchId(branchId);
//						newSlot.setDate(dto.getDate());
//
//						// Fetch branch name
//						ResponseEntity<Response> branchResponse = adminServiceClient.getBranchById(branchId);
//						Branch branchDetails = objectMapper.convertValue(branchResponse.getBody().getData(), Branch.class);
//						if (branchDetails != null) {
//							newSlot.setBranchName(branchDetails.getBranchName());
//						}
//
//						newSlot.setAvailableSlots(slotsToSave);
//						slotRepository.save(newSlot);
//					}
//				}
//
//				response.setSuccess(true);
//				response.setData(generatedSlots);
//				response.setMessage("Slots generated successfully. Selected slots saved with branch info.");
//				response.setStatus(HttpStatus.OK.value());
//
//			} catch (IllegalArgumentException e) {
//				response.setSuccess(false);
//				response.setMessage("Validation Error: " + e.getMessage());
//				response.setStatus(HttpStatus.BAD_REQUEST.value());
//			} catch (Exception e) {
//				response.setSuccess(false);
//				response.setMessage("An error occurred while saving slots: " + e.getMessage());
//				response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
//			}
//
//			return response;
//		}
//
	@Override
	public Response saveDoctorSlot(String hospitalId, String branchId, String doctorId, DoctorSlotDTO dto) {
		Response response = new Response();

		try {
			if (dto == null || dto.getAvailableSlots() == null || dto.getAvailableSlots().isEmpty()) {
				throw new IllegalArgumentException("Invalid slot details provided");
			}

			Optional<Doctors> getDoctor = doctorsRepository.findByDoctorId(doctorId);
			if (getDoctor.isEmpty()) {
				response.setSuccess(false);
				response.setMessage("Doctor not found with ID: " + doctorId);
				response.setStatus(HttpStatus.NOT_FOUND.value());
				return response;
			}

			// ✅ Fetch ALL slots of doctor on the same date (across all branches)
			List<DoctorSlot> doctorSlotsOnDate = slotRepository.findAllByDoctorIdAndDate(doctorId, dto.getDate());

			// ✅ Prepare slots with availability info
			List<DoctorAvailableSlotDTO> slotsWithAvailability = dto.getAvailableSlots().stream().map(incomingSlot -> {
				// Check if slot already exists in another branch
				Optional<DoctorSlot> conflictingSlot = doctorSlotsOnDate.stream().filter(slot -> slot
						.getAvailableSlots().stream().anyMatch(s -> s.getSlot().equals(incomingSlot.getSlot())))
						.findFirst();

				if (conflictingSlot.isPresent()) {
					String existingBranchId = conflictingSlot.get().getBranchId();
					String existingBranchName = conflictingSlot.get().getBranchName(); // ✅ Already stored in DB

					incomingSlot.setAvailable(false);
					incomingSlot.setReason("Already exists in " + existingBranchName + " Branch");
				} else {
					incomingSlot.setAvailable(true);
					incomingSlot.setReason(null);
				}

				return incomingSlot;
			}).toList();

			// ✅ Filter only slots that are available to save in this branch
			List<DoctorAvailableSlotDTO> slotsToSave = slotsWithAvailability.stream()
					.filter(DoctorAvailableSlotDTO::isAvailable).toList();

			DoctorSlot savedSlot = null;

			if (!slotsToSave.isEmpty()) {
				// Check if doctor already has slots in this branch for the same date
				DoctorSlot existingSlot = slotRepository.findByDoctorIdAndBranchIdAndDate(doctorId, branchId,
						dto.getDate());
				if (existingSlot != null) {
					List<DoctorAvailableSlotDTO> currentSlots = existingSlot.getAvailableSlots();

					// Add only new unique slots
					List<DoctorAvailableSlotDTO> newUniqueSlots = slotsToSave.stream().filter(incoming -> currentSlots
							.stream().noneMatch(existing -> existing.getSlot().equals(incoming.getSlot()))).toList();

					currentSlots.addAll(newUniqueSlots);
					existingSlot.setAvailableSlots(currentSlots);
					savedSlot = slotRepository.save(existingSlot);
				} else {
					DoctorSlot newSlot = DoctorSlotMapper.doctorSlotDTOtoEntity(dto);

					// ✅ Fetch branch details for saving (only once)
					ResponseEntity<Response> branchResponse = adminServiceClient.getBranchById(branchId);
					Branch branchDetails = objectMapper.convertValue(branchResponse.getBody().getData(), Branch.class);

					newSlot.setDoctorId(doctorId);
					newSlot.setHospitalId(hospitalId);
					newSlot.setBranchId(branchId);
					if (branchDetails != null) {
						newSlot.setBranchName(branchDetails.getBranchName()); // ✅ Store branch name in DB
					}
					newSlot.setAvailableSlots(slotsToSave);
					savedSlot = slotRepository.save(newSlot);
				}
			}

			response.setSuccess(true);
			response.setData(slotsWithAvailability);
			response.setMessage("Slots processed successfully. Unavailable slots are flagged with branch info.");
			response.setStatus(HttpStatus.OK.value());

		} catch (IllegalArgumentException e) {
			response.setSuccess(false);
			response.setMessage("Validation Error: " + e.getMessage());
			response.setStatus(HttpStatus.BAD_REQUEST.value());

		} catch (Exception e) {
			response.setSuccess(false);
			response.setMessage("An error occurred while saving slots: " + e.getMessage());
			response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
		}

		return response;
	}

	@Override
	public Response generateDoctorSlots(String doctorId, String branchId, String date, int intervalMinutes,
			String openingTime, String closingTime) {
		Response response = new Response();
		try {
			// ✅ Normalize input times
			openingTime = normalizeTime(URLDecoder.decode(openingTime, StandardCharsets.UTF_8));
			closingTime = normalizeTime(URLDecoder.decode(closingTime, StandardCharsets.UTF_8));

			// ✅ Generate all possible slots
			List<DoctorAvailableSlotDTO> generatedSlots = generateSlots(openingTime, closingTime, intervalMinutes);

			// ✅ Fetch all existing slots of the doctor on the same date (all branches)
			List<DoctorSlot> doctorSlotsOnDate = slotRepository.findAllByDoctorIdAndDate(doctorId, date);

			// Flatten all existing slots from DB for faster comparison
			List<DoctorAvailableSlotDTO> existingSlots = doctorSlotsOnDate.stream()
					.flatMap(ds -> ds.getAvailableSlots().stream().map(s -> {
						DoctorAvailableSlotDTO dto = new DoctorAvailableSlotDTO();
						dto.setSlot(normalizeTime(s.getSlot()));
						dto.setAvailable(s.isAvailable());
						dto.setReason(ds.getBranchName());
						return dto;
					})).toList();

			// ✅ Compare generated slots with DB slots
			generatedSlots.forEach(slot -> {
				Optional<DoctorAvailableSlotDTO> conflict = existingSlots.stream()
						.filter(es -> normalizeTime(es.getSlot()).equals(normalizeTime(slot.getSlot()))).findFirst();

				if (conflict.isPresent()) {
					slot.setAvailable(false);
					String branchName = conflict.get().getReason();
					slot.setReason("Already exists in " + (branchName != null ? branchName : "another branch"));
				} else {
					slot.setAvailable(true);
					slot.setReason(null);
				}
			});

			// ✅ Log final slot states
			System.out.println("Final generated slots:");
			generatedSlots.forEach(s -> System.out
					.println(s.getSlot() + " | Available: " + s.isAvailable() + " | Reason: " + s.getReason()));

			// ✅ Add summary to response message
			long unavailableCount = generatedSlots.stream().filter(s -> !s.isAvailable()).count();
			response.setSuccess(true);
			response.setData(generatedSlots);
			response.setMessage("Slots generated successfully. " + unavailableCount
					+ " slot(s) are unavailable due to branch conflicts.");
			response.setStatus(200);

		} catch (Exception e) {
			response.setSuccess(false);
			response.setMessage("Error generating slots: " + e.getMessage());
			response.setStatus(500);
		}

		return response;
	}

	private List<DoctorAvailableSlotDTO> generateSlots(String openingTime, String closingTime, int intervalMinutes) {
		DateTimeFormatter formatter = new DateTimeFormatterBuilder().parseCaseInsensitive().appendPattern("h:mm a")
				.toFormatter(Locale.ENGLISH);

		System.out.println("OpeningTime: '" + openingTime + "'");
		System.out.println("ClosingTime: '" + closingTime + "'");

		LocalTime start;
		LocalTime end;

		try {
			start = LocalTime.parse(openingTime, formatter);
			end = LocalTime.parse(closingTime, formatter);
		} catch (DateTimeParseException e) {
			throw new RuntimeException("Failed to parse time: " + e.getParsedString(), e);
		}

		List<DoctorAvailableSlotDTO> slots = new ArrayList<>();
		while (!start.isAfter(end.minusMinutes(intervalMinutes))) {
			DoctorAvailableSlotDTO slot = new DoctorAvailableSlotDTO();
			slot.setSlot(start.format(formatter));
			slot.setAvailable(true);
			slots.add(slot);
			start = start.plusMinutes(intervalMinutes);
		}
		return slots;
	}

	private String normalizeTime(String time) {
		time = time.trim().replaceAll("\\s+", " ").toUpperCase();
		time = time.replaceAll("(?<=\\d)(AM|PM)", " $1");
		return time;
	}

	private boolean isOverlapping(String newSlot, int newInterval, List<DoctorAvailableSlotDTO> existingSlots,
			int existingInterval) {
		DateTimeFormatter formatter = new DateTimeFormatterBuilder().parseCaseInsensitive().appendPattern("h:mm a")
				.toFormatter(Locale.ENGLISH);

		newSlot = normalizeTime(newSlot);
		LocalTime newStart = LocalTime.parse(newSlot, formatter);

		for (DoctorAvailableSlotDTO existing : existingSlots) {
			if (existing.getSlot() == null)
				continue;

			String existingSlotStr = normalizeTime(existing.getSlot());
			LocalTime existStart = LocalTime.parse(existingSlotStr, formatter);

// ✅ Only block if slot times are exactly same
			if (newStart.equals(existStart)) {
				return true;
			}
		}
		return false;
	}

	// -------------------------Get Slots by Doctors
	// -------------------------------------------
	@Override
	public Response getDoctorSlots(String hospitalId, String branchId, String doctorId) {
		List<DoctorSlot> slots = slotRepository.findByHospitalIdAndBranchIdAndDoctorId(hospitalId, branchId, doctorId);

		Response response = new Response();
		if (slots == null || slots.isEmpty()) {
			response.setSuccess(true);
			response.setData(null);
			response.setMessage("Slots Not Found");
			response.setStatus(HttpStatus.OK.value());
			return response;
		}

		response.setSuccess(true);
		response.setData(slots);
		response.setMessage("Slots fetched successfully");
		response.setStatus(HttpStatus.OK.value());
		return response;
	}

//	-----------------------------slots end------------------------------------------------------------------

	@Override
	public Response getDoctorsBySubserviceId(String hospitalId, String subServiceId) {
		Response response = new Response();

		try {
			// Validate hospitalId
			if (hospitalId == null || hospitalId.trim().isEmpty()) {
				response.setSuccess(false);
				response.setMessage("Hospital ID must not be null or empty.");
				response.setStatus(400); // Bad Request
				return response;
			}

			// Validate subServiceId
			if (subServiceId == null || subServiceId.trim().isEmpty()) {
				response.setSuccess(false);
				response.setMessage("SubService ID must not be null or empty.");
				response.setStatus(400); // Bad Request
				return response;
			}

			// Fetch doctors by hospitalId and subServiceId
			List<Doctors> doctors = doctorsRepository.findByHospitalIdAndSubServicesSubServiceId(hospitalId,
					subServiceId);

			if (doctors.isEmpty()) {
				response.setSuccess(true); // ✅ success true
				response.setData(Collections.emptyList());
				response.setStatus(HttpStatus.OK.value()); // ✅ 200
				response.setMessage(
						"No doctors found for subservice ID: " + subServiceId + " in hospital ID: " + hospitalId);
			} else {
				response.setSuccess(true);
				response.setData(doctors);
				response.setMessage("Doctors fetched successfully.");
				response.setStatus(200);
			}

		} catch (Exception e) {
			response.setSuccess(false);
			response.setMessage("Internal server error: " + e.getMessage());
			response.setStatus(500); // Internal Server Error
		}

		return response;
	}

	@Override
	public Response getDoctorsByHospitalIdAndBranchIdSubserviceId(String hospitalId, String branchId,
			String subServiceId) {
		Response response = new Response();

		try {
			// Validate hospitalId
			if (hospitalId == null || hospitalId.trim().isEmpty()) {
				response.setSuccess(false);
				response.setMessage("Hospital ID must not be null or empty.");
				response.setStatus(HttpStatus.BAD_REQUEST.value());
				return response;
			}

			// Validate branchId
			if (branchId == null || branchId.trim().isEmpty()) {
				response.setSuccess(false);
				response.setMessage("Branch ID must not be null or empty.");
				response.setStatus(HttpStatus.BAD_REQUEST.value());
				return response;
			}

			// Validate subServiceId
			if (subServiceId == null || subServiceId.trim().isEmpty()) {
				response.setSuccess(false);
				response.setMessage("SubService ID must not be null or empty.");
				response.setStatus(HttpStatus.BAD_REQUEST.value());
				return response;
			}

			// Fetch doctors by hospitalId, branchId, and subServiceId
			List<Doctors> doctors = doctorsRepository
					.findByHospitalIdAndBranchesBranchIdAndSubServicesSubServiceId(hospitalId, branchId, subServiceId);

			List<DoctorsDTO> doctorDTOs = doctors.stream().map(DoctorMapper::mapDoctorEntityToDoctorDTO)
					.collect(Collectors.toList());

			if (doctorDTOs.isEmpty()) {
				response.setSuccess(true);
				response.setData(Collections.emptyList());
				response.setStatus(HttpStatus.OK.value());
				response.setMessage("No doctors found for hospitalId: " + hospitalId + ", branchId: " + branchId
						+ ", subServiceId: " + subServiceId);
			} else {
				response.setSuccess(true);
				response.setData(doctorDTOs); // ✅ Use DTOs here
				response.setMessage("Doctors fetched successfully.");
				response.setStatus(HttpStatus.OK.value());
			}

		} catch (Exception e) {
			response.setSuccess(false);
			response.setMessage("Internal server error occurred.");
			response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
		}

		return response;
	}

	// -------------------------Get Hospitals and Doctors using
	// SubserviceId------------------------------------------------
	@Override
	public Response getHospitalAndDoctorsUsingSubserviceId(String subServiceId) {
		Response response = new Response();

		try {
			List<Doctors> doctors = doctorsRepository.findBySubServiceById(subServiceId);
			log.info("Total doctors found for subServiceId {}: {}", subServiceId, doctors.size());

			if (doctors.isEmpty()) {
				response.setSuccess(true);
				response.setStatus(HttpStatus.OK.value());
				response.setData(Collections.emptyList());
				response.setMessage("No doctors found for the given subServiceId");
				return response;
			}

			// Group by hospitalId
			Map<String, List<Doctors>> doctorsGroupedByHospital = doctors.stream()
					.filter(doc -> doc.getHospitalId() != null).collect(Collectors.groupingBy(Doctors::getHospitalId));

			List<ClinicWithDoctorsDTO> resultList = new ArrayList<>();

			for (Map.Entry<String, List<Doctors>> entry : doctorsGroupedByHospital.entrySet()) {
				String hospitalId = entry.getKey();
				List<Doctors> doctorList = entry.getValue();

				try {
					log.info("Fetching clinic for hospitalId: {}", hospitalId);
					ResponseEntity<Response> hospitalRes = adminServiceClient.getClinicById(hospitalId);

					if (hospitalRes.getStatusCode().is2xxSuccessful() && hospitalRes.getBody() != null) {
						Object data = hospitalRes.getBody().getData();
						ClinicDTO clinic = objectMapper.convertValue(data, ClinicDTO.class);

						// ✅ Use simplified mapper
						ClinicWithDoctorsDTO dto = mapToClinicWithDoctorsDTO(clinic, doctorList);
						resultList.add(dto);
					} else {
						log.warn("Invalid response from clinic API for hospitalId: {}", hospitalId);
					}
				} catch (Exception e) {
					log.error("Error while fetching clinic for hospitalId {}: {}", hospitalId, e.getMessage());
				}
			}

			if (resultList.isEmpty()) {
				response.setSuccess(true);
				response.setStatus(HttpStatus.OK.value());
				response.setData(Collections.emptyList());
				response.setMessage("No clinics with matching doctors found for the given subServiceId");
				return response;
			}

			response.setSuccess(true);
			response.setStatus(HttpStatus.OK.value());
			response.setData(resultList);
			response.setMessage("Fetched successfully");
			return response;

		} catch (Exception ex) {
			log.error("Exception in getHospitalAndDoctorsUsingSubserviceId: {}", ex.getMessage(), ex);
			response.setSuccess(false);
			response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
			response.setMessage("Internal error: " + ex.getMessage());
			return response;
		}
	}

	// -------------------Simplified
	// Mapper----------------------------------------------
	private ClinicWithDoctorsDTO mapToClinicWithDoctorsDTO(ClinicDTO clinic, List<Doctors> doctorList) {
		// ✅ Directly copy clinic fields
		ClinicWithDoctorsDTO dto = objectMapper.convertValue(clinic, ClinicWithDoctorsDTO.class);

		// ✅ Convert doctors with consultation mapping
		List<DoctorsDTO> doctorDTOs = doctorList.stream().map(doc -> {
			DoctorsDTO doctorDTO = DoctorMapper.mapDoctorEntityToDoctorDTO(doc);

			if (doc.getConsultation() != null) {
				ConsultationType consultation = doc.getConsultation();
				ConsultationTypeDTO consultationDTO = new ConsultationTypeDTO();
				consultationDTO.setServiceAndTreatments(consultation.getServiceAndTreatments());
				consultationDTO.setInClinic(consultation.getInClinic());
				consultationDTO.setVideoOrOnline(consultation.getVideoOrOnline());
				doctorDTO.setConsultation(consultationDTO);
			} else {
				doctorDTO.setConsultation(null);
			}

			return doctorDTO;
		}).collect(Collectors.toList());

		dto.setDoctors(doctorDTOs);
		return dto;
	}

//----------------------------------Get Doctors By SubserviceId----------------------------------------------------------------
	@Override
	public Response getAllDoctorsBySubserviceId(String subServiceId) {
		Response response = new Response();
		try {
			List<Doctors> doctors = doctorsRepository.findBySubServiceById(subServiceId);
			if (doctors.isEmpty()) {
				response.setSuccess(false);
				response.setData(Collections.emptyList());
				response.setStatus(200);
				response.setMessage("No doctors found for subservice ID: " + subServiceId);
			} else {
				response.setSuccess(true);
				response.setData(new ObjectMapper().convertValue(doctors, new TypeReference<List<DoctorsDTO>>() {
				}));
				response.setMessage("Doctors fetched successfully.");
				response.setStatus(200);
			}

		} catch (Exception e) {
			response.setSuccess(false);
			response.setMessage("Internal server error: " + e.getMessage());
			response.setStatus(500); // Internal Server Error
		}

		return response;
	}

	/// NOTIFICATIONOFDOCTOR

	public ResponseEntity<?> notificationToClinic(String hospitalId) {
		try {
			return notificationFeign.sendNotificationToClinic(hospitalId);
		} catch (FeignException e) {
			ResBody<List<String>> res = new ResBody<List<String>>(ExtractFeignMessage.clearMessage(e), e.status(),
					null);
			return ResponseEntity.status(e.status()).body(res);
		}
	}

	// -----------------------------GET CLINICS AND DOCTORS BY RECOMMENDATION ==
	// TRUE---------------------------------
	@Override
	public Response getRecommendedClinicsAndDoctors() {
		Response finalResponse = new Response();

		try {
			ResponseEntity<Response> responseEntity = adminServiceClient.getHospitalUsingRecommendentaion();
			Response responseBody = responseEntity.getBody();

			List<ClinicWithDoctorsDTO> result = new ArrayList<>();

			if (responseBody != null && responseBody.isSuccess()) {
				Object rawData = responseBody.getData();

				// Convert raw JSON -> List<ClinicDTO>
				List<ClinicDTO> clinics = objectMapper.convertValue(rawData, new TypeReference<List<ClinicDTO>>() {
				});

				for (ClinicDTO clinicDTO : clinics) {
					// Map ClinicDTO -> ClinicWithDoctorsDTO
					ClinicWithDoctorsDTO clinic = objectMapper.convertValue(clinicDTO, ClinicWithDoctorsDTO.class);

					// Fetch doctors from DB
					List<Doctors> doctorEntities = doctorsRepository.findByHospitalId(clinic.getHospitalId());

					// Convert doctors
					List<DoctorsDTO> doctors = doctorEntities.stream().map(doc -> {
						DoctorsDTO dto = DoctorMapper.mapDoctorEntityToDoctorDTO(doc);

						// doctorFees mapping
						if (doc.getDoctorFees() != null) {
							dto.setDoctorFees(DoctorMapper.mapDoctorFeeEntityToDTO(doc.getDoctorFees()));
						}

						// doctorSignature decompress
						if (doc.getDoctorSignature() != null) {
							dto.setDoctorSignature(Base64CompressionUtil.decompressBase64(doc.getDoctorSignature()));
						}

						return dto;
					}).collect(Collectors.toList());

					clinic.setDoctors(doctors);
					result.add(clinic);
				}
			}

			finalResponse.setSuccess(true);
			finalResponse.setStatus(HttpStatus.OK.value());
			finalResponse.setMessage("Recommended clinics with doctors retrieved successfully.");
			finalResponse.setData(result);

		} catch (Exception e) {
			log.error("Error fetching recommended clinics and doctors: {}", e.getMessage(), e);
			finalResponse.setSuccess(false);
			finalResponse.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
			finalResponse.setMessage("Internal error: " + e.getMessage());
		}

		return finalResponse;
	}

	private double getDouble1(Object obj) {
		try {
			return obj != null ? Double.parseDouble(obj.toString()) : 0.0;
		} catch (Exception e) {
			return 0.0;
		}
	}

	@Override
	public Response getBestDoctorBySubService(String subServiceId) {
		List<Doctors> doctors = doctorsRepository.findBySubServiceById(subServiceId);

		Doctors bestDoctor = null;
		double highestScore = -1.0;
		ClinicDTO selectedClinic = null;

		for (Doctors doctor : doctors) {
			if (!doctor.isDoctorAvailabilityStatus())
				continue;

			// Call main admin service to get clinic by hospitalId
			ResponseEntity<Response> clinicResponse = adminServiceClient.getClinicById(doctor.getHospitalId());

			if (clinicResponse == null || clinicResponse.getBody() == null
					|| clinicResponse.getBody().getData() == null)
				continue;

			// Convert Object to ClinicDTO safely using ObjectMapper
			ClinicDTO clinic;
			try {
				Object data = clinicResponse.getBody().getData();
				clinic = objectMapper.convertValue(data, ClinicDTO.class);
			} catch (Exception e) {
				continue; // skip if conversion fails
			}

			boolean isGoodClinic = clinic.isRecommended() || clinic.getHospitalOverallRating() >= 4.0;
			if (!isGoodClinic)
				continue;

			// Calculate doctor score
			double score = 0;
			if (doctor.isRecommendation())
				score += 3;
			score += doctor.getDoctorAverageRating();

			try {
				score += Double.parseDouble(doctor.getExperience()) * 0.2;
			} catch (Exception ignored) {
			}

			// Choose the doctor with the highest score
			if (score > highestScore) {
				highestScore = score;
				bestDoctor = doctor;
				selectedClinic = clinic;
			}
		}

		if (bestDoctor == null || selectedClinic == null) {
			return Response.builder().success(false).status(404)
					.message("No suitable doctor found for subService ID: " + subServiceId).build();
		}

		// Convert doctor to DoctorsDTO using your mapper
		DoctorsDTO doctorDTO = DoctorMapper.mapDoctorEntityToDoctorDTO(bestDoctor);

		// Build combined clinic + doctor response
		ClinicWithDoctorsDTO2 responseDTO = ClinicWithDoctorsDTO2.builder().hospitalId(selectedClinic.getHospitalId())
				.name(selectedClinic.getName()).address(selectedClinic.getAddress()).city(selectedClinic.getCity())
				.hospitalOverallRating(selectedClinic.getHospitalOverallRating())
				.contactNumber(selectedClinic.getContactNumber()).openingTime(selectedClinic.getOpeningTime())
				.closingTime(selectedClinic.getClosingTime()).hospitalLogo(selectedClinic.getHospitalLogo())
				.emailAddress(selectedClinic.getEmailAddress()).website(selectedClinic.getWebsite())
				.licenseNumber(selectedClinic.getLicenseNumber()).issuingAuthority(selectedClinic.getIssuingAuthority())
				.contractorDocuments(selectedClinic.getContractorDocuments())
				.hospitalDocuments(selectedClinic.getHospitalDocuments()).recommended(selectedClinic.isRecommended())
				.clinicalEstablishmentCertificate(selectedClinic.getClinicalEstablishmentCertificate())
				.businessRegistrationCertificate(selectedClinic.getBusinessRegistrationCertificate())
				.clinicType(selectedClinic.getClinicType()).medicinesSoldOnSite(selectedClinic.getMedicinesSoldOnSite())
				.drugLicenseCertificate(selectedClinic.getDrugLicenseCertificate())
				.drugLicenseFormType(selectedClinic.getDrugLicenseFormType())
				.hasPharmacist(selectedClinic.getHasPharmacist())
				.pharmacistCertificate(selectedClinic.getPharmacistCertificate())
				.biomedicalWasteManagementAuth(selectedClinic.getBiomedicalWasteManagementAuth())
				.tradeLicense(selectedClinic.getTradeLicense())
				.fireSafetyCertificate(selectedClinic.getFireSafetyCertificate())
				.professionalIndemnityInsurance(selectedClinic.getProfessionalIndemnityInsurance())
				.gstRegistrationCertificate(selectedClinic.getGstRegistrationCertificate())
				.consultationExpiration(selectedClinic.getConsultationExpiration())
				.subscription(selectedClinic.getSubscription()).others(selectedClinic.getOthers())
				.freeFollowUps(selectedClinic.getFreeFollowUps()).latitude(selectedClinic.getLatitude())
				.longitude(selectedClinic.getLongitude()).nabhScore(selectedClinic.getNabhScore())
				.branch(selectedClinic.getBranch()).walkthrough(selectedClinic.getWalkthrough())
				.instagramHandle(selectedClinic.getInstagramHandle()).twitterHandle(selectedClinic.getTwitterHandle())
				.facebookHandle(selectedClinic.getFacebookHandle()).branches(selectedClinic.getBranches()) // ✅ if
																											// available
				.role(selectedClinic.getRole()) // ✅ optional
				.permissions(selectedClinic.getPermissions()) // ✅ optional
				.doctors(doctorDTO).build();

		return Response.builder().success(true).status(200).message("Best doctor with clinic retrieved successfully")
				.data(responseDTO).build();
	}

//	@Override
//	public Response getRecommendedClinicsAndDoctors(List<String> keyPointsFromUser) {
//	    Logger log = LoggerFactory.getLogger(getClass());
//
//	    // Step 1: Call Feign client to get clinics
//	    ResponseEntity<Response> responseEntity = adminServiceClient.getHospitalUsingRecommendentaion();
//	    Response responseBody = responseEntity.getBody();
//
//	    List<ClinicWithDoctorsDTO> result = new ArrayList<>();
//
//	    if (responseBody != null && responseBody.isSuccess()) {
//	        Object rawData = responseBody.getData();
//	        log.info("Raw clinic data from Feign: {}", rawData);
//
//	        List<ClinicWithDoctorsDTO> clinics = new ObjectMapper().convertValue(
//	            rawData, new TypeReference<List<ClinicWithDoctorsDTO>>() {}
//	        );
//
//	        log.info("Converted clinic list size: {}", clinics.size());
//
//	        for (ClinicWithDoctorsDTO clinic : clinics) {
//	            log.info("Processing clinic: {} | ID: {}", clinic.getName(), clinic.getHospitalId());
//
//	            if (clinic.getHospitalId() == null) {
//	                log.warn("Clinic missing hospitalId, skipping...");
//	                continue;
//	            }
//
//	            // Step 2: Fetch doctors for clinic
//	            List<Doctors> doctorEntities = doctorsRepository.findByHospitalId(clinic.getHospitalId());
//	            log.info("Doctors found for clinic {}: {}", clinic.getHospitalId(), doctorEntities.size());
//
//	            List<DoctorsDTO> matchedDoctors = new ArrayList<>();
//
//	            for (Doctors doctor : doctorEntities) {
//	                DoctorsDTO dto = DoctorMapper.mapDoctorEntityToDoctorDTO(doctor);
//	                log.info("Doctor: {} ", dto);
//
//	                boolean relevant = isDoctorRelevant(dto, keyPointsFromUser);
//	                log.info("Doctor: {} | Relevant: {}", dto.getDoctorName(), relevant);
//
//	                if (relevant) {
//	                    matchedDoctors.add(dto);
//	                }
//	            }
//
//	            if (!matchedDoctors.isEmpty()) {
//	                clinic.setDoctors(matchedDoctors);
//	                result.add(clinic);
//	            }
//	        }
//	    } else {
//	        log.warn("Feign response unsuccessful or null");
//	    }
//
//	    Response response = new Response();
//	    response.setSuccess(true);
//	    response.setData(result);
//	    response.setMessage("Matched doctors and clinics");
//	    response.setStatus(HttpStatus.OK.value());
//
//	    log.info("Final matched clinics count: {}", result.size());
//	    return response;
//	}
	@Override
	public Response getRecommendedClinicsAndOneDoctors(List<String> keyPointsFromUser) {
		Logger log = LoggerFactory.getLogger(getClass());

		ResponseEntity<Response> responseEntity = adminServiceClient.getHospitalUsingRecommendentaion();
		Response responseBody = responseEntity.getBody();

		List<ClinicWithDoctorsDTO> result = new ArrayList<>();
		boolean anyDoctorMatched = false;

		if (responseBody != null && responseBody.isSuccess()) {
			Object rawData = responseBody.getData();
			log.info("Raw clinic data from Feign: {}", rawData);

			List<ClinicWithDoctorsDTO> clinics = new ObjectMapper().convertValue(rawData,
					new TypeReference<List<ClinicWithDoctorsDTO>>() {
					});

			log.info("Converted clinic list size: {}", clinics.size());

			for (ClinicWithDoctorsDTO clinic : clinics) {
				log.info("Processing clinic: {} | ID: {}", clinic.getName(), clinic.getHospitalId());

				if (clinic.getHospitalId() == null) {
					log.warn("Clinic missing hospitalId, skipping...");
					continue;
				}

				List<Doctors> doctorEntities = doctorsRepository.findByHospitalId(clinic.getHospitalId());
				log.info("Doctors found for clinic {}: {}", clinic.getHospitalId(), doctorEntities.size());

				List<DoctorsDTO> matchedDoctors = new ArrayList<>();

				for (Doctors doctor : doctorEntities) {
					DoctorsDTO dto = DoctorMapper.mapDoctorEntityToDoctorDTO(doctor);
					boolean relevant = isDoctorRelevant(dto, keyPointsFromUser);
					log.info("Doctor: {} | Relevant: {}", dto.getDoctorName(), relevant);

					if (relevant) {
						matchedDoctors.add(dto);
						anyDoctorMatched = true;
					}
				}

				clinic.setDoctors(matchedDoctors);
				result.add(clinic);
			}

			// Step 3: If no doctor matched, return all clinics with all doctors
			if (!anyDoctorMatched) {
				log.info("No doctor matched. Returning all clinics and doctors.");

				result.clear(); // Reset result

				for (ClinicWithDoctorsDTO clinic : clinics) {
					if (clinic.getHospitalId() == null)
						continue;

					List<Doctors> doctorEntities = doctorsRepository.findByHospitalId(clinic.getHospitalId());
					List<DoctorsDTO> allDoctors = doctorEntities.stream().map(DoctorMapper::mapDoctorEntityToDoctorDTO)
							.toList();

					clinic.setDoctors(allDoctors);
					result.add(clinic);
				}
			}

		} else {
			log.warn("Feign response unsuccessful or null");
		}

		return Response.builder().success(true).status(HttpStatus.OK.value()).data(result)
				.message("Matched clinics and doctors").build();
	}

	private boolean isDoctorRelevant(DoctorsDTO doctor, List<String> keyPoints) {
		Logger logger = LoggerFactory.getLogger(getClass());
		if (keyPoints == null || keyPoints.isEmpty())
			return false;

		for (String key : keyPoints) {
			String lowerKey = key.toLowerCase();

			// SubServices
			if (doctor.getSubServices() != null) {
				for (DoctorSubServiceDTO sub : doctor.getSubServices()) {
					if (sub != null && sub.getSubServiceName() != null
							&& sub.getSubServiceName().toLowerCase().contains(lowerKey)) {
						logger.debug("Matched subService: {} with keyword: {}", sub.getSubServiceName(), key);
						return true;
					}
				}
			}

			// Services
			if (doctor.getService() != null) {
				for (DoctorServicesDTO service : doctor.getService()) {
					if (service != null && service.getServiceName() != null
							&& service.getServiceName().toLowerCase().contains(lowerKey)) {
						logger.debug("Matched service: {} with keyword: {}", service.getServiceName(), key);
						return true;
					}
				}
			}

			// Category
			if (doctor.getCategory() != null) {
				for (DoctorCategoryDTO category : doctor.getCategory()) {
					if (category != null && category.getCategoryName() != null
							&& category.getCategoryName().toLowerCase().contains(lowerKey)) {
						logger.debug("Matched category: {} with keyword: {}", category.getCategoryName(), key);
						return true;
					}
				}
			}

			// Specialization
			if (doctor.getSpecialization() != null && doctor.getSpecialization().toLowerCase().contains(lowerKey)) {
				logger.debug("Matched specialization: {} with keyword: {}", doctor.getSpecialization(), key);
				return true;
			}
		}

		return true;
	}

//---------------- get All doctors with respective their clinics --------------------------
	@Override
	public Response getAllDoctorsWithRespectiveClinic() {
		Response response = new Response();

		try {
			// 1. Get list of clinics (recommended ones)
			ResponseEntity<Response> clinicsResponse = adminServiceClient.firstRecommendedTureClincs();
			Object clinicObj = clinicsResponse.getBody().getData();

			// Convert to list of ClinicDTO
			List<ClinicDTO> clinics = objectMapper.convertValue(clinicObj, new TypeReference<List<ClinicDTO>>() {
			});

			List<ClinicWithDoctorsDTO> clinicsWithDoctors = clinics.stream().map(clinicDTO -> {
				// Fetch doctors by hospitalId
				List<Doctors> doctorsDbData = doctorsRepository.findByHospitalId(clinicDTO.getHospitalId());

				List<DoctorsDTO> doctorDTOs = doctorsDbData.stream().map(DoctorMapper::mapDoctorEntityToDoctorDTO)
						.collect(Collectors.toList());

				// Map ClinicDTO -> ClinicWithDoctorsDTO
				ClinicWithDoctorsDTO clDTO = objectMapper.convertValue(clinicDTO, ClinicWithDoctorsDTO.class);

				// Set doctors list
				clDTO.setDoctors(doctorDTOs);

				return clDTO;
			}).collect(Collectors.toList());

			// 3. Wrap response
			response.setSuccess(true);
			response.setData(clinicsWithDoctors);
			response.setMessage("Fetched clinics with respective doctors");
			response.setStatus(HttpStatus.OK.value());

		} catch (Exception e) {
			response.setSuccess(false);
			response.setMessage("Error fetching clinics and doctors: " + e.getMessage());
			response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
		}

		return response;
	}

//	// ------------------------------Universal
//	// Login---------------------------------------------------
//	@Override
//	public Response loginUsingRoles(DoctorLoginDTO dto) {
//		Response response = new Response();
//		Optional<DoctorLoginCredentials> credentials = credentialsRepository.findByUsername(dto.getUserName());
//
//		if (!credentials.isPresent()) {
//			response.setSuccess(false);
//			response.setMessage("Invalid UserName");
//			response.setStatus(409);
//			return response;
//		}
//
//		DoctorLoginCredentials cr = credentials.get();
//
//		// Fix: dto.getPassword() should come first 
//		if (!passwordEncoder.matches(dto.getPassword(), cr.getPassword())) {
//			response.setSuccess(false);
//			response.setMessage("Invalid password");
//			response.setStatus(409);
//			return response;
//		}
//
//		// Here you compared role with password by mistake
//		// Fix: compare role with dto.getRole()
//		if (!cr.getRole().toUpperCase().equals(dto.getRole().toUpperCase())) {
//			response.setSuccess(false);
//			response.setMessage("Invalid Role");
//			response.setStatus(409);
//			return response;
//		}
//		DoctorLoginDTO resDto = new DoctorLoginDTO();
//		resDto.setUserName(cr.getUsername());
//		resDto.setRole(cr.getRole());
//		resDto.setDeviceId(dto.getDeviceId());
//		resDto.setStaffId(cr.getStaffId());
//		resDto.setStaffName(cr.getStaffName());
//		resDto.setHospitalId(cr.getHospitalId());
//		resDto.setHospitalName(cr.getHospitalName());
//		resDto.setBranchId(cr.getBranchId());
//		resDto.setPermissions(cr.getPermissions());
//
//		response.setSuccess(true);
//		response.setMessage("Login Successfully");
//		response.setData(resDto);
//		response.setStatus(200);
//
//		return response;
//	}
	@Override
	public Response loginUsingRoles(DoctorLoginDTO dto) {
		Response response = new Response();
		try {
			Optional<DoctorLoginCredentials> credentials = credentialsRepository.findByUsername(dto.getUserName());

			if (credentials.isEmpty()) {
				response.setSuccess(false);
				response.setMessage("Invalid UserName");
				response.setStatus(409);
				return response;
			}

			DoctorLoginCredentials cr = credentials.get();

			// Password check
			if (passwordEncoder == null || !passwordEncoder.matches(dto.getPassword(), cr.getPassword())) {
				response.setSuccess(false);
				response.setMessage("Invalid password");
				response.setStatus(409);
				return response;
			}

			// Role check (null-safe)
			if (dto.getRole() == null || !cr.getRole().equalsIgnoreCase(dto.getRole())) {
				response.setSuccess(false);
				response.setMessage("Invalid Role");
				response.setStatus(409);
				return response;
			}

			// Prepare response DTO
			DoctorLoginDTO resDto = new DoctorLoginDTO();
			resDto.setUserName(cr.getUsername());
			resDto.setRole(cr.getRole());
			resDto.setDeviceId(dto.getDeviceId());
			resDto.setStaffId(cr.getStaffId());
			resDto.setStaffName(cr.getStaffName());
			resDto.setHospitalId(cr.getHospitalId());
			resDto.setHospitalName(cr.getHospitalName());
			resDto.setBranchId(cr.getBranchId());
			resDto.setBranchName(cr.getBranchName());

			// ⚠️ Ensure permissions is safe for serialization
			resDto.setPermissions(cr.getPermissions());

			response.setSuccess(true);
			response.setMessage("Login Successfully");
			response.setData(resDto);
			response.setStatus(200);

		} catch (Exception e) {
			response.setSuccess(false);
			response.setMessage("Login error: " + e.getMessage());
			response.setStatus(500);
		}
		return response;
	}

//-----------------------best one doctor using key word-------------------------------------------
	@Override
	public Response getRecommendedClinicsAndDoctors(List<String> keyPointsFromUser) {
		Logger log = LoggerFactory.getLogger(getClass());

		ResponseEntity<Response> responseEntity = adminServiceClient.getHospitalUsingRecommendentaion();
		Response responseBody = responseEntity.getBody();

		ClinicWithDoctorsDTO bestClinic = null;
		DoctorsDTO bestDoctor = null;
		int bestScore = 0;

		if (responseBody != null && responseBody.isSuccess()) {
			Object rawData = responseBody.getData();
			List<ClinicWithDoctorsDTO> clinics = new ObjectMapper().convertValue(rawData,
					new TypeReference<List<ClinicWithDoctorsDTO>>() {
					});

			for (ClinicWithDoctorsDTO clinic : clinics) {
				if (clinic.getHospitalId() == null)
					continue;

				List<Doctors> doctorEntities = doctorsRepository.findByHospitalId(clinic.getHospitalId());

				for (Doctors doctor : doctorEntities) {
					DoctorsDTO dto = DoctorMapper.mapDoctorEntityToDoctorDTO(doctor);
					int score = calculateDoctorScore(dto, keyPointsFromUser);

					log.info("Doctor: {} | Score: {}", dto.getDoctorName(), score);

					if (score > bestScore) {
						bestScore = score;
						bestDoctor = dto;
						bestClinic = clinic;
					}
				}
			}
		}

		if (bestDoctor != null && bestClinic != null) {
			bestClinic.setDoctors(List.of(bestDoctor));
			return Response.builder().success(true).status(HttpStatus.OK.value()).data(bestClinic)
					.message("Best doctor recommendation based on keywords, ratings, experience, and qualifications")
					.build();
		}

		return Response.builder().success(false).status(HttpStatus.NOT_FOUND.value())
				.message("No matching doctor found").build();
	}

	private int calculateDoctorScore(DoctorsDTO doctor, List<String> keyPoints) {
		int score = 0;

		// 1️⃣ Keyword match score
		if (keyPoints != null && !keyPoints.isEmpty()) {
			for (String key : keyPoints) {
				String lowerKey = key.toLowerCase();

				if (doctor.getSubServices() != null) {
					for (DoctorSubServiceDTO sub : doctor.getSubServices()) {
						if (sub != null && sub.getSubServiceName() != null
								&& sub.getSubServiceName().toLowerCase().contains(lowerKey)) {
							score += 5; // weight for subService match
						}
					}
				}

				if (doctor.getService() != null) {
					for (DoctorServicesDTO service : doctor.getService()) {
						if (service != null && service.getServiceName() != null
								&& service.getServiceName().toLowerCase().contains(lowerKey)) {
							score += 4; // weight for service match
						}
					}
				}

				if (doctor.getCategory() != null) {
					for (DoctorCategoryDTO category : doctor.getCategory()) {
						if (category != null && category.getCategoryName() != null
								&& category.getCategoryName().toLowerCase().contains(lowerKey)) {
							score += 3; // weight for category match
						}
					}
				}

				if (doctor.getSpecialization() != null && doctor.getSpecialization().toLowerCase().contains(lowerKey)) {
					score += 6; // specialization match gets higher weight
				}
			}
		}

		// 2️⃣ Rating (scale 0–5 → multiply by weight)
		score += (int) (doctor.getDoctorAverageRating() * 10);

		// 3️⃣ Experience (convert years string to int if possible)
		try {
			int years = Integer.parseInt(doctor.getExperience().replaceAll("[^0-9]", ""));
			score += years * 2; // each year of experience adds 2 points
		} catch (Exception e) {
			// ignore if parsing fails
		}

		// 4️⃣ Qualification priority
		if (doctor.getQualification() != null) {
			String q = doctor.getQualification().toLowerCase();
			if (q.contains("dm"))
				score += 30;
			else if (q.contains("md"))
				score += 20;
			else if (q.contains("ms"))
				score += 15;
			else if (q.contains("mbbs"))
				score += 10;
		}

		return score;
	}

	@Override
	public Response getDoctorsByHospitalIdAndBranchId(String hospitalId, String branchId) {
		Response response = new Response();
		try {
			// ✅ Fetch doctors assigned to this branch in their branches list
			List<Doctors> doctorList = doctorsRepository.findByHospitalIdAndBranchIdIncludingBranches(hospitalId,
					branchId);

			// Filter out doctors that are not actually assigned to the branch
			doctorList = doctorList.stream().filter(doc -> doc.getBranches() != null
					&& doc.getBranches().stream().anyMatch(b -> branchId.equals(b.getBranchId()))).toList();

			if (!doctorList.isEmpty()) {
				List<DoctorsDTO> dtos = doctorList.stream().map(DoctorMapper::mapDoctorEntityToDoctorDTO).toList();

				response.setSuccess(true);
				response.setData(dtos);
				response.setMessage(
						"Doctors fetched successfully for hospitalId: " + hospitalId + " and branchId: " + branchId);
				response.setStatus(HttpStatus.OK.value());
			} else {
				response.setSuccess(true);
				response.setData(Collections.emptyList());
				response.setMessage("No doctors found for hospitalId: " + hospitalId + " and branchId: " + branchId);
				response.setStatus(HttpStatus.OK.value());
			}
		} catch (Exception e) {
			response.setSuccess(false);
			response.setMessage("Error fetching doctors: " + e.getMessage());
			response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
		}
		return response;
	}

}