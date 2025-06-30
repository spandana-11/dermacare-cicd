package com.clinicadmin.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.clinicadmin.dto.DoctorNotesDTO;
import com.clinicadmin.dto.Response;

@FeignClient(name = "doctor-service")
public interface DoctorServiceFeign {
	@PostMapping("/api/doctor-notes/add-doctornotes")
	public ResponseEntity<Response> addNote(@RequestBody DoctorNotesDTO dto);

	@GetMapping("/api/doctor-notes/get-all-doctor-notes")
	public ResponseEntity<Response> getAllNotes();
}
