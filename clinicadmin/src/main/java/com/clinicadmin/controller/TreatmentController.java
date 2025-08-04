package com.clinicadmin.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.clinicadmin.dto.Response;
import com.clinicadmin.dto.TreatmentDTO;
import com.clinicadmin.service.TreatmentService;

@RestController
@RequestMapping("/clinic-admin")
public class TreatmentController {

    @Autowired
    private TreatmentService treatmentService;

    @PostMapping("/treatment/addTreatment")
    public ResponseEntity<Response> addTreatment(@RequestBody TreatmentDTO dto) {
        Response response = treatmentService.addTreatment(dto);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/treatment/getAllTreatments")
    public ResponseEntity<Response> getAllTreatments() {
        Response response = treatmentService.getAllTreatments();
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/treatment/getTreatmentById/{id}/{hospitalId}")
    public ResponseEntity<Response> getTreatmentById(@PathVariable String id , @PathVariable String hospitalId) {
        Response response = treatmentService.getTreatmentById(id,hospitalId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @DeleteMapping("/treatment/deleteTreatmentById/{id}/{hospitalId}")
    public ResponseEntity<Response> deleteTreatmentById(@PathVariable String id, @PathVariable String hospitalId) {
        Response response = treatmentService.deleteTreatmentById(id,hospitalId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PutMapping("/treatment/updateTreatmentById/{id}/{hospitalId}")
    public ResponseEntity<Response> updateTreatmentById(@PathVariable String id, @PathVariable String hospitalId, @RequestBody TreatmentDTO dto) {
        Response response = treatmentService.updateTreatmentById(id,hospitalId, dto);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
