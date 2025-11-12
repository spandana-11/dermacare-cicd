package com.clinicadmin.service;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;

import com.clinicadmin.dto.Response;

public interface DoctorSaveDetailsFeignImplService {
	public ResponseEntity<Response> getVisitHistoryByPatientId(@PathVariable String patientId);
}
