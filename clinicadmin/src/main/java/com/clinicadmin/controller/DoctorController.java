package com.clinicadmin.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.clinicadmin.dto.ChangeDoctorPasswordDTO;
import com.clinicadmin.dto.DoctorAvailabilityStatusDTO;
import com.clinicadmin.dto.DoctorLoginDTO;
import com.clinicadmin.dto.DoctorSlotDTO;
import com.clinicadmin.dto.DoctorsDTO;
import com.clinicadmin.dto.Response;
import com.clinicadmin.dto.UpdateSlotRequestDTO;
import com.clinicadmin.service.DoctorNoteService;
import com.clinicadmin.service.DoctorService;
import com.clinicadmin.validations.FormatChecks;
import com.clinicadmin.validations.RequiredChecks;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Valid;
import jakarta.validation.Validator;

@RestController
@RequestMapping("/clinic-admin")
//Origin(origins = { "http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:5500" })
public class DoctorController {

	@Autowired
	private DoctorService doctorService;
	
	@Autowired
	private DoctorNoteService doctorNoteService;
	
	@Autowired
	private Validator validator;

	// ------------------------------Doctor APIs
	// ------------------------------------------------------------------------
	@PostMapping("/addDoctor")
	public ResponseEntity<Response> addDoctor(@RequestBody DoctorsDTO dto) {
		Response response = new Response();

		// Step 1: Validate required fields
		Set<ConstraintViolation<DoctorsDTO>> requiredViolations = validator.validate(dto, RequiredChecks.class);

		if (!requiredViolations.isEmpty()) {
			Map<String, String> errors = new HashMap<>();
			StringBuilder errorMessages = new StringBuilder();

			for (ConstraintViolation<DoctorsDTO> violation : requiredViolations) {
				String field = violation.getPropertyPath().toString();
				String message = violation.getMessage();
				errors.put(field, message);
				errorMessages.append(message).append("; ");
			}

			response.setSuccess(false);
			response.setStatus(HttpStatus.BAD_REQUEST.value());
			response.setMessage(errorMessages.toString());
//	        response.setData(errors);

			return ResponseEntity.badRequest().body(response);
		}

		// Step 2: Validate format/other rules

		Set<ConstraintViolation<DoctorsDTO>> formatViolations = validator.validate(dto, FormatChecks.class);

		if (!formatViolations.isEmpty()) {
			Map<String, String> errors = new HashMap<>();
			StringBuilder errorMessages = new StringBuilder();

			for (ConstraintViolation<DoctorsDTO> violation : formatViolations) {
				String field = violation.getPropertyPath().toString();
				String message = violation.getMessage();
				errors.put(field, message);
				errorMessages.append(message).append("; ");
			}

			response.setSuccess(false);
			response.setStatus(HttpStatus.BAD_REQUEST.value());
			response.setMessage(errorMessages.toString());
//	        response.setData(errors);

			return ResponseEntity.badRequest().body(response);
		}

		dto.trimAllDoctorFields();
		response = doctorService.addDoctor(dto);
		return ResponseEntity.status(response.getStatus()).body(response);
	}

	/**
	 * Get all doctors.
	 * 
	 * @return List of all doctors
	 */
	@GetMapping("/doctors")
	public ResponseEntity<Response> getAllDoctors() {
		Response response = doctorService.getAllDoctors();
		return ResponseEntity.status(response.getStatus()).body(response);
	}

	/**
	 * Update doctor details by ID.
	 * 
	 * @param id  Doctor ID
	 * @param dto Updated doctor data
	 * @return Updated doctor response
	 */
	@PutMapping("/updateDoctor/{doctorId}")
	public ResponseEntity<Response> updateDoctorById(@PathVariable String doctorId,
			@Validated(RequiredChecks.class) @RequestBody DoctorsDTO dto) {
		dto.trimAllDoctorFields();
		Response response = doctorService.upDateDoctorById(doctorId, dto);
		return ResponseEntity.status(response.getStatus()).body(response);
	}

	@DeleteMapping("/delete-doctor/{doctorId}")
	public ResponseEntity<Response> deleteDoctorById(@PathVariable String doctorId) {
		Response response = doctorService.deleteDoctorById(doctorId);
		return ResponseEntity.status(response.getStatus()).body(response);

	}

	// ----------------------------Doctor
	// Login----------------------------------------------------------
	@PostMapping("/doctorLogin")
	public ResponseEntity<?> updateDoctorById(@Valid @RequestBody DoctorLoginDTO loginDTO) {
		Response response = doctorService.login(loginDTO);
		return ResponseEntity.status(response.getStatus()).body(response);
	}

	// -------------------------Change
	// Password----------------------------------------------------------
	@PutMapping("/update-password/{username}")
	public ResponseEntity<Response> updatePassword(@PathVariable String username,
			@RequestBody ChangeDoctorPasswordDTO updatePasswordDTO) {

		updatePasswordDTO.setUsername(username); // set the path variable into the DTO
		Response response = doctorService.changePassword(updatePasswordDTO);
		return new ResponseEntity<>(response, HttpStatus.valueOf(response.getStatus()));
	}
	// ----------Get doctor by ID. @PathVariable id Doctor ID @return Doctor
	// details----------------

	@GetMapping("/doctor/{id}")
	public ResponseEntity<Response> getDoctorById(@PathVariable String id) {
		Response response = doctorService.getDoctorById(id);
		return ResponseEntity.status(response.getStatus()).body(response);
	}

//		--------------------Get Doctors by ClinicID and DoctorId---------------------
	@GetMapping("/clinic/{clinicId}/doctor/{doctorId}")
	public ResponseEntity<Response> getDoctorByClinicAndDoctorId(@PathVariable String clinicId,
			@PathVariable String doctorId) {

		Response response = doctorService.getDoctorsByClinicIdAndDoctorId(clinicId, doctorId);
		return ResponseEntity.status(response.getStatus()).body(response);
	}

	// ----------------Get Doctors by their Clinic
	// ids--------------------------------------------------
	@GetMapping("doctors/hospitalById/{hospitalId}")
	public ResponseEntity<Response> getDoctorsByHospitalById(@PathVariable String hospitalId) {
		Response response = doctorService.getDoctorsByClinicId(hospitalId);
		return ResponseEntity.status(response.getStatus()).body(response);
	}

//		------------------Doctor Availability----------------------------------------------------------------------------------------
	@PostMapping("/doctorId/{doctorId}/availability")
	public ResponseEntity<Response> doctorAvailabilityStatus(@PathVariable String doctorId,
			@RequestBody DoctorAvailabilityStatusDTO status) {
		Response response = doctorService.availabilityStatus(doctorId, status);
		return ResponseEntity.status(response.getStatus()).body(response);
	}

//		------------------Get Doctors by hopital id and subServiceId----------------------------------------------------------------------------------------
	@GetMapping("/doctors/hospital/{hospitalId}/subServiceId/{subServiceId}")
	public ResponseEntity<Response> getDoctorsBySubServiceId(@PathVariable String hospitalId,
			@PathVariable String subServiceId) {
		Response response = doctorService.getDoctorsBySubserviceId(hospitalId, subServiceId);
		return ResponseEntity.status(response.getStatus()).body(response);
	}

	/*
	 * -----------------------------------------------------------------------------
	 * -------------------------------------------------
	 * ---------------------------------- Docots
	 * Slots------------------------------------------------------------------------
	 * ---
	 * -----------------------------------------------------------------------------
	 * -------------------------------------------------
	 */

	@PostMapping("/addDoctorSlots/{hospitalId}/{doctorId}")
	public ResponseEntity<Response> addDoctorSlot(@PathVariable String hospitalId, @PathVariable String doctorId,
			@RequestBody DoctorSlotDTO slotDto) {

		Response response = doctorService.saveDoctorSlot(hospitalId, doctorId, slotDto);
		return ResponseEntity.status(response.getStatus()).body(response);
	}

	// --------------------------------update the
	// slot-------------------------------------------
	@PutMapping("/doctor/update-slot")
	public ResponseEntity<Response> updateDoctorSlot(@RequestBody UpdateSlotRequestDTO request) {
		Response response = doctorService.updateDoctorSlot(request.getDoctorId(), request.getDate(),
				request.getOldSlot(), request.getNewSlot());
		return ResponseEntity.status(response.getStatus()).body(response);
	}

	// ----------------------------- Get doctor
	// slots----------------------------------------------------------------------------
	@GetMapping("/getDoctorslots/{hospitalId}/{doctorId}")
	public ResponseEntity<Response> getDoctorSlot(@PathVariable String hospitalId, @PathVariable String doctorId) {
		Response response = doctorService.getDoctorSlots(hospitalId, doctorId);
		return ResponseEntity.status(response.getStatus()).body(response);
	}

	// --------------------------delete slot by using time date
	// doctorId-----------------------------------------------------
	@DeleteMapping("/doctorId/{doctorId}/{date}/{slot}/slots")
	public Response deleteDoctorSlot(@PathVariable String doctorId, @PathVariable String date,
			@PathVariable String slot) {
		return doctorService.deleteDoctorSlot(doctorId, date, slot);
	}

	// ----------------------------------------delete doctor slot by
	// date-------------------------------------------------

	@DeleteMapping("/delete-by-date/{doctorId}/{date}")
	public ResponseEntity<Response> deleteDoctorSlotsByDate(@PathVariable String doctorId, @PathVariable String date) {
		Response response = doctorService.deleteDoctorSlotbyDate(doctorId, date);

		return new ResponseEntity<>(response, HttpStatus.valueOf(response.getStatus()));
	}

	@PutMapping("/updateDoctorSlotWhileBooking/{doctorId}/{date}/{time}")
	public Boolean updateDoctorSlotWhileBooking(@PathVariable String doctorId, @PathVariable String date,
			@PathVariable String time) {
		return doctorService.updateSlot(doctorId, date, time);
	}
	
	
	@PutMapping("/makingFalseDoctorSlot/{doctorId}/{date}/{time}")
	public Boolean makingFalseDoctorSlot(@PathVariable String doctorId, @PathVariable String date,
			@PathVariable String time) {
		return doctorService.makingFalseDoctorSlot(doctorId, date, time);
	}
//		---------------------------------------------------------------------------------------------------------------------------
//		---------------------------------------------------------------------------------------------------------------------------

// -------------------------Get Hopitals and Doctors using SubserviceId------------------------------------------------
	@GetMapping("/getHospitalAndDoctorUsingSubServiceId/{subServiceId}")
	public ResponseEntity<Response> getHospitalAndDoctorUsingSubServiceId(@PathVariable String subServiceId) {
		Response response = doctorService.getHospitalAndDoctorsUsingSubserviceId(subServiceId);
		return ResponseEntity.status(response.getStatus()).body(response);
	}
//--------------------------- Get ALl Doctors By SubServiceId ----------------------------------------------------------------
	
			@GetMapping("/getAllDoctorsBySubServiceId/{subServiceId}")
			public ResponseEntity<Response> getAllDoctorsBySubServiceId(@PathVariable String subServiceId) {
				Response response = doctorService.getAllDoctorsBySubserviceId(subServiceId);
				return ResponseEntity.status(response.getStatus()).body(response);
			}

	/* ---------------------------------------------------------------------------------------------------------------------------
       --------------------------------------------- Notes -----------------------------------------------------------------------
       ---------------------------------------------------------------------------------------------------------------------------*/

	// -------------------------getAllNotes-----------------------------------------------
	@GetMapping("/notes/getAllNotes")
	public ResponseEntity<Response> getAllNotes() {
		Response response = doctorNoteService.getAllNotes();
		return ResponseEntity.status(response.getStatus()).body(response);
	}
	
	
	//NOTIFICATION OF DOCTOR
	
	@GetMapping("/notificationToClinic/{hospitalId}")
	public  ResponseEntity<?> notificationTodoctor(@PathVariable String hospitalId){
		return doctorService.notificationToClinic(hospitalId);
	}
	
	
}