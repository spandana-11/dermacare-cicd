package com.pharmacyManagement.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.pharmacyManagement.dto.MedicineDto;
import com.pharmacyManagement.dto.Response;
import com.pharmacyManagement.service.MedicineService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/medicineManagement")
@RequiredArgsConstructor
public class MedicineController {

	@Autowired
    private  MedicineService service;

    @PostMapping("/addMedicine")
    public ResponseEntity<Response> c(@RequestBody MedicineDto dto) {
        Response response = service.saveMedicine(dto);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PutMapping("/updateMedicineById/{id}")
    public ResponseEntity<Response> updateMedicineById(@PathVariable String id, @RequestBody MedicineDto dto) {
        Response response = service.updateMedicine(id, dto);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/getMedicineById/{id}")
    public ResponseEntity<Response> getMedicineById(@PathVariable String id) {
        Response response = service.getMedicineById(id);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/getAllMedicine")
    public ResponseEntity<Response> getAllMedicine() {
        Response response = service.getAllMedicines();
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @DeleteMapping("/deleteMedicineById/{id}")
    public ResponseEntity<Response> deleteMedicineById(@PathVariable String id) {
        Response response = service.deleteMedicine(id);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
