package com.clinicadmin.sevice.impl;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.clinicadmin.dto.ChangeDoctorPasswordDTO;
import com.clinicadmin.dto.ClinicDTO;
import com.clinicadmin.dto.ClinicWithDoctorsDTO;
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

	private final DoctorsRepository doctorsRepository;
	private final DoctorLoginCredentialsRepository credentialsRepository;
	private final PasswordEncoder passwordEncoder;
	private final DoctorSlotRepository slotRepository;
	private final ServiceFeignClient serviceFeignClient;
	
	@Autowired
	AdminServiceClient adminServiceClient;
	
	@Autowired
	private NotificationFeign notificationFeign;

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

			if (doctorsRepository.existsByDoctorMobileNumber(dto.getDoctorMobileNumber())) {
				response.setSuccess(false);
				response.setData(null);
				response.setMessage("Doctor with this mobile number already exists");
				response.setStatus(HttpStatus.BAD_REQUEST.value());
				return response;
			}
			for (DoctorCategoryDTO DoctorCatDTO : dto.getCategory()) {
				if (!serviceFeignClient.isCategoryExists(DoctorCatDTO.getCategoryId())) {
					response.setSuccess(false);
					response.setData(null);
					response.setMessage("Category is not exists");
					response.setStatus(HttpStatus.NOT_FOUND.value());
					return response;
				}
			}
			for (DoctorServicesDTO DoctorSerDTO : dto.getService()) {
				if (!serviceFeignClient.isServiceExists(DoctorSerDTO.getServiceId())) {
					response.setSuccess(false);
					response.setData(null);
					response.setMessage("Service is not exists");
					response.setStatus(HttpStatus.NOT_FOUND.value());
					return response;
				}
			}
			for (DoctorSubServiceDTO DoctorSubSerDTO : dto.getSubServices()) {
				if (!serviceFeignClient.isSubServiceExists(DoctorSubSerDTO.getSubServiceId())) {
					response.setSuccess(false);
					response.setData(null);
					response.setMessage("SubService is not exists");
					response.setStatus(HttpStatus.NOT_FOUND.value());
					return response;
				}
			}

			// Generate custom doctorId like DC_1, DC_2, etc.
			String doctorId = generateDoctorId();

			// Set the custom doctorId in the DTO
			dto.setDoctorId(doctorId);

			// Map DTO to Doctor Entity and ensure doctorId is assigned
			Doctors doctor = DoctorMapper.mapDoctorDTOtoDoctorEntity(dto);
			doctor.setDoctorId(doctorId); // Ensure that doctorId is set in the entity

			if (doctor != null) {
				Doctors savedDoctor = doctorsRepository.save(doctor);

				String username = savedDoctor.getDoctorMobileNumber();
				String rawPassword = generateStructuredPassword();
				String encodedPassword = passwordEncoder.encode(rawPassword);

				DoctorLoginCredentials credentials = DoctorLoginCredentials.builder()
						.doctorId(savedDoctor.getDoctorId()).username(username).password(encodedPassword)
						.hospitalId(savedDoctor.getHospitalId()).build();

				credentialsRepository.save(credentials);

				Map<String, Object> data = new HashMap<>();
				data.put("doctor", savedDoctor);
				data.put("username", username);
				data.put("temporaryPassword", rawPassword);

				response.setSuccess(true);
				response.setData(data);
				response.setMessage("Doctor added successfully with login credentials");
				response.setStatus(HttpStatus.CREATED.value());
			} else {
				response.setSuccess(false);
				response.setData(null);
				response.setMessage("Doctor data is invalid or could not be saved");
				response.setStatus(HttpStatus.BAD_REQUEST.value());
			}

		} catch (Exception e) {
			response.setSuccess(false);
			response.setData(null);
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
	        if (dto.getDoctorFees() != null)
	            doctor.setDoctorFees(DoctorMapper.mapDoctorFeeDTOtoEntity(dto.getDoctorFees()));

	        // Booleans (we assume default false if not set, so be cautious)
	        doctor.setDoctorAvailabilityStatus(dto.isDoctorAvailabilityStatus());
	        doctor.setRecommendation(dto.isRecommendation());

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

				Optional<DoctorLoginCredentials> optionalCredentials = credentialsRepository.findByDoctorId(doctorId);
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

	
	
	// -------------------------------DOCTOR
		// LOGIN-------------------------------------------------------------
		@Override
		public Response login(DoctorLoginDTO loginDTO) {
			Response responseDTO = new Response();

			Optional<DoctorLoginCredentials> credentialsOptional = credentialsRepository
					.findByUsername(loginDTO.getUsername());

			if (credentialsOptional.isPresent()) {
				DoctorLoginCredentials credentials = credentialsOptional.get();

				boolean matches = passwordEncoder.matches(loginDTO.getPassword(), credentials.getPassword());

				if (matches) {
					Optional<Doctors> doctors=doctorsRepository.findByDoctorId(credentials.getDoctorId());
					if(doctors.isPresent()) {
						Doctors doctor=doctors.get();
						doctor.setDeviceId(loginDTO.getDeviceId());
						Doctors savedDoctor =doctorsRepository.save(doctor);
						DoctorsDTO savedDTO=DoctorMapper.mapDoctorEntityToDoctorDTO(savedDoctor);
					}
			
					DoctorLoginDTO dto = new DoctorLoginDTO();
					dto.setUsername(credentials.getUsername());
					dto.setPassword(credentials.getPassword());
					dto.setDeviceId(loginDTO.getDeviceId());
					dto.setDoctorId(credentials.getDoctorId());
					dto.setHospitalId(credentials.getHospitalId());

					responseDTO.setData(dto);
					responseDTO.setStatus(HttpStatus.OK.value());
					responseDTO.setMessage("Login successful");
					responseDTO.setSuccess(true);
				} else {
					responseDTO.setData(null);
					responseDTO.setStatus(HttpStatus.UNAUTHORIZED.value());
					responseDTO.setMessage("Invalid password");
					responseDTO.setSuccess(false);
				}
			} else {
				responseDTO.setData(null);
				responseDTO.setStatus(HttpStatus.NOT_FOUND.value());
				responseDTO.setMessage("Doctor not found");
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
			response.setStatus(500); // Internal server error
		}
		return response;
	}

	// ----------------- Helper Methods ------------------------

	private String generateDoctorId() {
		String doctorId = "DC_" + UUID.randomUUID().toString().substring(0, 8);
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

//-------------------------------------Adding Slots---------------------------------------------------------------------------------------
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
				return response;}

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

//	-------------------------Get Slots by Doctors -------------------------------------------
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

//--------------------------- detele slot by time and date using doctorId-----------------------------------------
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
				return response;}

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

			DoctorSlotDTO dto = new DoctorSlotDTO(doctorSlot.getDoctorId(), doctorSlot.getHospitalId(),
					doctorSlot.getDate(), updatedSlots);
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
				return response;}
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

	public Response deleteDoctorSlotbyDate(String doctorId, String date) {
		DoctorSlot doctorSlot = slotRepository.findByDoctorIdAndDate(doctorId, date);

		if (doctorSlot == null) {
			Response response = new Response();
			response.setSuccess(false);
			response.setData(null);
			response.setMessage("No slots found for doctor on this date");
			response.setStatus(HttpStatus.NOT_FOUND.value());
			return response;}
		
		slotRepository.delete(doctorSlot);
		Response response = new Response();
		response.setSuccess(true);
		response.setData(null);
		response.setMessage("All slots deleted successfully for date " + date);
		response.setStatus(HttpStatus.OK.value());
		return response;

	}

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

	
	public boolean updateSlot(String doctorId, String date, String time) {
		try {
			DoctorSlot doctorSlots = slotRepository.findByDoctorIdAndDate(doctorId, date);			
			for (DoctorAvailableSlotDTO slot : doctorSlots.getAvailableSlots()) {
				if (slot.getSlot().equalsIgnoreCase(time)) {
					slot.setSlotbooked(true);
					slotRepository.save(doctorSlots);
					return true;}}
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
					return true;}}
			return false;
		} catch (NullPointerException e) {
			return false;
		}
	}
	
	

//-------------------------Get Hopitals and Doctors using SubserviceId------------------------------------------------
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
	                .filter(doc -> doc.getHospitalId() != null)
	                .collect(Collectors.groupingBy(Doctors::getHospitalId));

	        List<ClinicWithDoctorsDTO> resultList = new ArrayList<>();
	        ObjectMapper mapper = new ObjectMapper();

	        for (Map.Entry<String, List<Doctors>> entry : doctorsGroupedByHospital.entrySet()) {
	            String hospitalId = entry.getKey();
	            List<Doctors> doctorList = entry.getValue();

	            try {
	                log.info("Fetching clinic for hospitalId: {}", hospitalId);
	                ResponseEntity<Response> hospitalRes = adminServiceClient.getClinicById(hospitalId);

	                if (hospitalRes.getStatusCode().is2xxSuccessful() && hospitalRes.getBody() != null) {
	                    Object data = hospitalRes.getBody().getData();
	                    ClinicDTO clinic = mapper.convertValue(data, ClinicDTO.class);

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
	            response.setSuccess(true); // ✅ Not an error
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


//-------------------Mapper for clinic admin----------------------------------------------

	private ClinicWithDoctorsDTO mapToClinicWithDoctorsDTO(ClinicDTO clinic, List<Doctors> doctorList) {
		ClinicWithDoctorsDTO dto = new ClinicWithDoctorsDTO();
		dto.setHospitalId(clinic.getHospitalId());
		dto.setName(clinic.getName());
		dto.setAddress(clinic.getAddress());
		dto.setCity(clinic.getCity());
		dto.setContactNumber(clinic.getContactNumber());
		dto.setHospitalOverallRating(clinic.getHospitalOverallRating());
		dto.setHospitalRegistrations(clinic.getHospitalRegistrations());
		dto.setOpeningTime(clinic.getOpeningTime());
		dto.setClosingTime(clinic.getClosingTime());
		dto.setHospitalLogo(clinic.getHospitalLogo());
		dto.setEmailAddress(clinic.getEmailAddress());
		dto.setWebsite(clinic.getWebsite());
		dto.setLicenseNumber(clinic.getLicenseNumber());
		dto.setIssuingAuthority(clinic.getIssuingAuthority());
		dto.setHospitalDocuments(clinic.getHospitalDocuments());
		dto.setContractorDocuments(clinic.getContractorDocuments());
		dto.setRecommended(clinic.isRecommended());
		List<DoctorsDTO> maptoDTO = doctorList.stream().map(DoctorMapper::mapDoctorEntityToDoctorDTO)
				.collect(Collectors.toList());
		dto.setDoctors(maptoDTO);
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
	
	
	///NOTIFICATIONOFDOCTOR
	
	public ResponseEntity<?> notificationToClinic(String hospitalId){
		try {
		return notificationFeign.sendNotificationToClinic(hospitalId);
		}catch(FeignException e) {
			ResBody<List<String>> res = new ResBody<List<String>>(ExtractFeignMessage.clearMessage(e),e.status(),null);
			return ResponseEntity.status(e.status()).body(res);}
		}

}