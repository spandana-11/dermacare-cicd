package com.AdminService.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.AdminService.dto.DoctorsDTO;
import com.AdminService.service.DoctorService;
import com.AdminService.util.Response;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
//@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class DoctorController {

    private final DoctorService doctorService;

    // ---------------- Add Doctor ----------------
    @PostMapping("/addDoctor")
    public ResponseEntity<Response> addDoctor(@RequestBody DoctorsDTO doctorDto) {
        return doctorService.addDoctor(doctorDto);
    }

    // ---------------- Get All Doctors ----------------
    @GetMapping("/getAllDoctors")
    public ResponseEntity<Response> getAllDoctors() {
        return doctorService.getAllDoctors();
    }

    // ---------------- Get Doctor by ID ----------------
    @GetMapping("/getDoctorById/{id}")
    public ResponseEntity<Response> getDoctorById(@PathVariable String id) {
        return doctorService.getDoctorById(id);
    }

    // ---------------- Update Doctor ----------------
    @PutMapping("/updateDoctor/{doctorId}")
    public ResponseEntity<Response> updateDoctorById(@PathVariable String doctorId,
                                                     @RequestBody DoctorsDTO doctorDto) {
        return doctorService.updateDoctorById(doctorId, doctorDto);
    }

    // ---------------- Delete Doctor by ID ----------------
    @DeleteMapping("/delete-doctor/{doctorId}")
    public ResponseEntity<Response> deleteDoctorById(@PathVariable String doctorId) {
        return doctorService.deleteDoctorById(doctorId);
    }

    // ---------------- Delete Doctors by Clinic ----------------
    @DeleteMapping("/delete-doctors-by-clinic/{clinicId}")
    public ResponseEntity<Response> deleteDoctorsByClinic(@PathVariable String clinicId) {
        return doctorService.deleteDoctorsByClinic(clinicId);
    }
}