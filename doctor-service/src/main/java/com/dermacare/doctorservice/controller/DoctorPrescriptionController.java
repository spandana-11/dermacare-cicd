package com.dermacare.doctorservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.dermacare.doctorservice.dto.DoctorPrescriptionDTO;
import com.dermacare.doctorservice.dto.Response;
import com.dermacare.doctorservice.service.DoctorPrescriptionService;

@RestController
@RequestMapping("/doctors")
// @CrossOrigin(origins = "*")

public class DoctorPrescriptionController {

    @Autowired
    private DoctorPrescriptionService service;

    @PostMapping("/createPrescription")
    public ResponseEntity<Response> createPrescription(@RequestBody DoctorPrescriptionDTO dto) {
        Response res = service.createPrescription(dto);
        return ResponseEntity.status(res.getStatus()).body(res);
    }

    @GetMapping("/getAllPrescriptions")
    public ResponseEntity<Response> getAllPrescriptions() {
        Response res = service.getAllPrescriptions();
        return ResponseEntity.status(res.getStatus()).body(res);
    }

    @GetMapping("/getPrescriptionById/{id}")
    public ResponseEntity<Response> getPrescriptionById(@PathVariable String id) {
        Response res = service.getPrescriptionById(id);
        return ResponseEntity.status(res.getStatus()).body(res);
    }

    @GetMapping("/getMedicineById/{medicineId}")
    public ResponseEntity<Response> getMedicineById(@PathVariable String medicineId) {
        Response res = service.getMedicineById(medicineId);
        return ResponseEntity.status(res.getStatus()).body(res);
    }
    
 // DoctorPrescriptionController.java
    
    @GetMapping("/searchMedicines/{keyword}")
    public ResponseEntity<Response> searchMedicines(@PathVariable String keyword) {
        Response response = service.searchMedicinesByName(keyword);
        return ResponseEntity.status(response.getStatus()).body(response);
    }



    @DeleteMapping("/deletePrescription/{id}")
    public ResponseEntity<Response> deletePrescription(@PathVariable String id) {
        Response res = service.deletePrescription(id);
        return ResponseEntity.status(res.getStatus()).body(res);
    }
    
    @DeleteMapping("/deleteMedicine/{medicineId}")
    public ResponseEntity<Response> deleteMedicine(@PathVariable String medicineId) {
        Response res = service.deleteMedicineById(medicineId);
        return ResponseEntity.status(res.getStatus()).body(res);
    }

}
