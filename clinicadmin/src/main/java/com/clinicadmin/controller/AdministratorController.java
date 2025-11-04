package com.clinicadmin.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.clinicadmin.dto.AdministratorDTO;
import com.clinicadmin.dto.Response;
import com.clinicadmin.service.AdministratorService;
import com.clinicadmin.validations.RequiredChecks;

@RestController
@RequestMapping("/clinic-admin")
//@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class AdministratorController {

    @Autowired
    private AdministratorService administratorService;

    // ------------------- Add Administrator -------------------
    @PostMapping("/addAdministrator")
    public ResponseEntity<Response> addAdministrator(
            @Validated(RequiredChecks.class) @RequestBody AdministratorDTO dto) {
        Response response = administratorService.administratorOnboarding(dto);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    // ------------------- Get All Administrators by Clinic -------------------
    @GetMapping("/getAllAdministrators/{clinicId}")
    public ResponseEntity<Response> getAllAdministratorsByClinic(@PathVariable String clinicId) {
        Response response = administratorService.getAllAdministratorsByClinic(clinicId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    // ------------------- Get Single Administrator -------------------
    @GetMapping("/getAdministrator/{clinicId}/{adminId}")
    public ResponseEntity<Response> getAdministratorById(
            @PathVariable String clinicId,
            @PathVariable String adminId) {
        Response response = administratorService.getAdministratorById(clinicId, adminId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    // ------------------- Update Administrator -------------------
    @PutMapping("/updateAdministrator/{clinicId}/{adminId}")
    public ResponseEntity<Response> updateAdministrator(
            @PathVariable String clinicId,
            @PathVariable String adminId,
            @RequestBody AdministratorDTO dto) {
        Response response = administratorService.updateAdministrator(clinicId, adminId, dto);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    // ------------------- Delete Administrator -------------------
    @DeleteMapping("/deleteAdministrator/{clinicId}/{adminId}")
    public ResponseEntity<Response> deleteAdministrator(
            @PathVariable String clinicId,
            @PathVariable String adminId) {
        Response response = administratorService.deleteAdministrator(clinicId, adminId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}

