package com.clinicadmin.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clinicadmin.dto.ProbableDiagnosisDTO;
import com.clinicadmin.dto.Response;
import com.clinicadmin.service.ProbableDiagnosisService;

@RestController
@RequestMapping("/clinic-admin")
//Origin(origins = { "http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:5500" })
public class ProbableDiagnosisController {
	@Autowired
	private ProbableDiagnosisService probableDiagnosisService;
	
	@PostMapping("/addDisease")
	public ResponseEntity<Response> addDiseases(@RequestBody ProbableDiagnosisDTO dto){
		Response response = probableDiagnosisService.addDisease(dto);
		return ResponseEntity.status(response.getStatus()).body(response);
	}
	
	@GetMapping("/get-all-diseases")
	public ResponseEntity<Response> getAllDiseases(){
	Response response =	probableDiagnosisService.getAllDiseases();
	return ResponseEntity.status(response.getStatus()).body(response);
	}
	
	@GetMapping("getDisease/{id}/{hospitalId}")
	public ResponseEntity<Response> getDiseaseByDiseaseId(@PathVariable String id, @PathVariable String hospitalId){
		Response response=probableDiagnosisService.getDiseaseById(id,hospitalId);
		return ResponseEntity.status(response.getStatus()).body(response);
	}
	
	@DeleteMapping("deleteDisease/{id}/{hospitalId}")
	public ResponseEntity<Response> deleteDiseaseByDiseaseId(@PathVariable String id,@PathVariable String hospitalId){
		Response response =probableDiagnosisService.deleteDiseaseById(id,hospitalId);
		return ResponseEntity.status(response.getStatus()).body(response);
	}
	
	@PutMapping("updateDisease/{id}/{hospitalId}")
	public ResponseEntity<Response> updateDiseaseByDiseaseId(@PathVariable String id, @PathVariable String hospitalId, @RequestBody ProbableDiagnosisDTO dto){
		Response response = probableDiagnosisService.updateDiseaseById(id,hospitalId, dto);
		return ResponseEntity.status(response.getStatus()).body(response);
	
	}
	@GetMapping("/diseases/{hospitalId}")
	public ResponseEntity<Response> getDiseasesByHospitalId(@PathVariable String hospitalId) {
		Response response = probableDiagnosisService.getAllDiseasesByHospitalId(hospitalId);
		return ResponseEntity.status(response.getStatus()).body(response);
	    
	}
}
