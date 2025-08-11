package com.dermacare.doctorservice.controller;

import com.dermacare.doctorservice.dto.DoctorSaveDetailsDTO;
import com.dermacare.doctorservice.dto.Response;
import com.dermacare.doctorservice.service.DoctorSaveDetailsService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/doctors")
// @CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})

public class DoctorSaveDetailsController {

    @Autowired
    private DoctorSaveDetailsService service;

    @PostMapping("/createDoctorSaveDetails")
    public ResponseEntity<Response> createDoctorSaveDetails(@RequestBody DoctorSaveDetailsDTO dto) {
        Response response = service.saveDoctorDetails(dto);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("getDoctorSaveDetailsById/{id}")
    public ResponseEntity<Response> getDoctorSaveDetailsById(@PathVariable String id) {
        Response response = service.getDoctorDetailsById(id);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PutMapping("updateDoctorSaveDetailsById/{id}")
    public ResponseEntity<Response> updateDoctorSaveDetails(@PathVariable String id, @RequestBody DoctorSaveDetailsDTO dto) {
        Response response = service.updateDoctorDetails(id, dto);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @DeleteMapping("/deleteDoctorsaveDetailsById/{id}")
    public ResponseEntity<Response> deleteDoctorsaveDetails(@PathVariable String id) {
        Response response = service.deleteDoctorDetails(id);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/getAllDoctorSaveDetails")
    public ResponseEntity<Response> getAllDoctorSaveDetails() {
        Response response = service.getAllDoctorDetails();
        return ResponseEntity.status(response.getStatus()).body(response);
    }
    @GetMapping("/visitHistory/{patientId}/{bookingId}")
    public ResponseEntity<Response> getVisitHistory(
            @PathVariable String patientId,
            @PathVariable String bookingId) {
        Response response = service.getVisitHistoryByPatientAndBooking(patientId, bookingId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
    @GetMapping("/visitHistory/{patientId}")
    public ResponseEntity<Response> getVisitHistoryByPatient(@PathVariable String patientId) {
        Response response = service.getVisitHistoryByPatient(patientId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
    @GetMapping("/getVisitHistoryByPatientIdAndDoctorId/{patientId}/{doctorId}")
    public ResponseEntity<Response> getVisitHistoryByPatientAndDoctor(
            @PathVariable String patientId,
            @PathVariable String doctorId) {
        if ("null".equalsIgnoreCase(doctorId) || "none".equalsIgnoreCase(doctorId) || doctorId.isBlank()) {
            doctorId = null;
        }

        Response response = service.getVisitHistoryByPatientAndDoctor(patientId, doctorId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }


}
