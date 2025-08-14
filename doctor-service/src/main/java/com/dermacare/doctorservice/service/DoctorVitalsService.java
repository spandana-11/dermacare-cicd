package com.dermacare.doctorservice.service;

import org.springframework.http.ResponseEntity;
import com.dermacare.doctorservice.dto.Response;
import com.dermacare.doctorservice.dto.VitalsDTO;

public interface DoctorVitalsService {

    ResponseEntity<Response> addVitals(String patientId, VitalsDTO dto);

    ResponseEntity<Response> getVitals(String patientId);

    ResponseEntity<Response> deleteVitals(String patientId);

    ResponseEntity<Response> updateVitals(String patientId, VitalsDTO dto);
}

