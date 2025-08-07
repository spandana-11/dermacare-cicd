package com.clinicadmin.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clinicadmin.dto.Response;
import com.clinicadmin.dto.VitalsDTO;
import com.clinicadmin.service.VitalService;

@RestController
@RequestMapping("/clinic-admin")

public class VitalsController {
	@Autowired
	VitalService vitalService;
	@PostMapping("/{patientId}/addingVitals")
	public ResponseEntity<Response> addVitals(@PathVariable String patiendId, VitalsDTO dto) {

		Response response = vitalService.postVitalsById(patiendId, dto);
		return ResponseEntity.status(response.getStatus()).body(response);

	}
	
	@GetMapping("/getVitals/{patientId}")
	public ResponseEntity<Response> getVitals(@PathVariable String patientId)
	{
		Response response=vitalService.getVitalsByPatientId(patientId);
		return ResponseEntity.status(response.getStatus()).body(response);
	}
	
	@DeleteMapping("/deleteVitals/{patientId}")
	public ResponseEntity<Response> delVitals(@PathVariable String patientId)
	{
		Response response=vitalService.deleteVitals(patientId);
		return ResponseEntity.status(response.getStatus()).body(response);
	}
	
	@PutMapping("/updateVitals/{patientId}")
	public ResponseEntity<Response> delVitals(@PathVariable String patientId, VitalsDTO dto)
	{
		Response response=vitalService.updateVitals(patientId,dto);
		return ResponseEntity.status(response.getStatus()).body(response);
	}

}
