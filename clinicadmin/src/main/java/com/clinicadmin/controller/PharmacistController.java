package com.clinicadmin.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clinicadmin.dto.PharmacistDTO;
import com.clinicadmin.dto.PharmacistLoginDTO;
import com.clinicadmin.dto.ResetPharmacistLoginPasswordDTO;
import com.clinicadmin.dto.Response;
import com.clinicadmin.service.PharmacistService;
import com.clinicadmin.validations.RequiredChecks;

@RestController
@RequestMapping("/clinic-admin")
//@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class PharmacistController {

	@Autowired
	private PharmacistService pharmacistService;

	// ------------------- Add Pharmacist -------------------
	@PostMapping("/addPharmacist")
	public ResponseEntity<Response> pharmacistOnBoarding(
			@Validated(RequiredChecks.class) @RequestBody PharmacistDTO dto) {
		Response response = pharmacistService.pharmacistOnboarding(dto);
		return ResponseEntity.status(response.getStatus()).body(response);
	}

	// ------------------- Get All Pharmacists by Department -------------------
	@GetMapping("/getAllPharmacists/{hospitalId}")
	public ResponseEntity<Response> getAllByDepartment(@PathVariable String hospitalId) {
		Response response = pharmacistService.getAllPharmacistsByHospitalId(hospitalId);
		return ResponseEntity.status(response.getStatus()).body(response);
	}

	// ------------------- Get Single Pharmacist -------------------
	@GetMapping("/getPharmacist/{pharmacistId}")
	public ResponseEntity<Response> getPharmacist(@PathVariable String pharmacistId) {
		Response response = pharmacistService.getPharmacistById(pharmacistId);
		return ResponseEntity.status(response.getStatus()).body(response);
	}

	// ------------------- Update Pharmacist -------------------
	@PutMapping("/updatePharmacist/{pharmacistId}")
	public ResponseEntity<Response> updatePharmacist(@PathVariable String pharmacistId,
			@RequestBody PharmacistDTO dto) {
		Response response = pharmacistService.updatePharmacist(pharmacistId, dto);
		return ResponseEntity.status(response.getStatus()).body(response);
	}

	// ------------------- Delete Pharmacist -------------------
	@DeleteMapping("/deletePharmacist/{pharmacistId}")
	public ResponseEntity<Response> deletePharmacist(@PathVariable String pharmacistId) {
		Response response = pharmacistService.deletePharmacist(pharmacistId);
		return ResponseEntity.status(response.getStatus()).body(response);
	}

	// ---------------------------------------------------------------------------------------------------
	// --------------------------------- Pharmacist Login
	// ------------------------------------------------
	// ---------------------------------------------------------------------------------------------------

//	@PostMapping("/pharmacistLogin")
//	public ResponseEntity<Response> pharmacistLogin(@RequestBody PharmacistLoginDTO dto) {
//		Response response = pharmacistService.pharmacistLogin(dto);
//		return ResponseEntity.status(response.getStatus()).body(response);
//	}
//
//	@PostMapping("/resetPharmacistLogin")
//	public ResponseEntity<Response> resetPharmacistLogin(@RequestBody ResetPharmacistLoginPasswordDTO dto) {
//		Response response = pharmacistService.resetLoginPassword(dto);
//		return ResponseEntity.status(response.getStatus()).body(response);
//	}
}