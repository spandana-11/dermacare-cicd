package com.dermacare.doctorservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.dermacare.doctorservice.dto.Response;
import com.dermacare.doctorservice.dto.VitalsDTO;
import com.dermacare.doctorservice.service.DoctorVitalsService;

@RestController
@RequestMapping("/doctors")
//@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class DoctorVitalsController {

    @Autowired
    private DoctorVitalsService doctorVitalsService;

    @PostMapping("/addVitals/{patientId}")
    public ResponseEntity<Response> addVitals(@PathVariable String patientId,
                                              @RequestBody VitalsDTO dto) {
        return doctorVitalsService.addVitals(patientId, dto);
    }

    @GetMapping("getVitalsBypatientId/{patientId}")
    public ResponseEntity<Response> getVitals(@PathVariable String patientId) {
        return doctorVitalsService.getVitals(patientId);
    }

    @DeleteMapping("deleteVitalsBypatientId/{patientId}")
    public ResponseEntity<Response> deleteVitals(@PathVariable String patientId) {
        return doctorVitalsService.deleteVitals(patientId);
    }

    @PutMapping("updateVitalsBypatientId/{patientId}")
    public ResponseEntity<Response> updateVitals(@PathVariable String patientId,
                                                 @RequestBody VitalsDTO dto) {
        return doctorVitalsService.updateVitals(patientId, dto);
    }
}
