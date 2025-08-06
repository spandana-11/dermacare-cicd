package com.clinicadmin.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clinicadmin.dto.Response;
import com.clinicadmin.service.PatientConsentFormService;

@RestController
@RequestMapping("/clinic-admin")
//@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001" })
public class PatientConsentFormController {
	@Autowired
	PatientConsentFormService patientConsentFormService;
	
	@GetMapping("/getpatientConsentForm/{bookingId}/{patientId}/{mobileNumber}")
	public ResponseEntity<Response> getpatientConsentForm(@PathVariable String bookingId,@PathVariable String patientId,@PathVariable String mobileNumber){
		Response response =patientConsentFormService.getPatientDetailsForFormUsingBooking(bookingId, patientId, mobileNumber);
		return ResponseEntity.status(response.getStatus()).body(response);
	}
}
