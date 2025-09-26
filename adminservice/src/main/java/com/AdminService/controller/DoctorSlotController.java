package com.AdminService.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import com.AdminService.dto.DoctorSlotDTO;
import com.AdminService.service.DoctorSlotService;
import com.AdminService.util.Response;

@RestController
@RequestMapping("/admin")
//@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class DoctorSlotController {

    @Autowired
    private DoctorSlotService doctorSlotService;

    // ---------------------- Doctor Slot APIs ---------------------- //
    @PostMapping("/addDoctorSlots/{hospitalId}/{branchId}/{doctorId}")
    public ResponseEntity<Response> addDoctorSlot(@PathVariable("hospitalId") String hospitalId,
                                                  @PathVariable("branchId") String branchId,
                                                  @PathVariable("doctorId") String doctorId,
                                                  @RequestBody DoctorSlotDTO slotDto) {
        Response response = doctorSlotService.addDoctorSlot(hospitalId, branchId, doctorId, slotDto);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/getDoctorSlots/{hospitalId}/{branchId}/{doctorId}")
    public ResponseEntity<Response> getDoctorSlots(@PathVariable("hospitalId") String hospitalId,
                                                   @PathVariable("branchId") String branchId,
                                                   @PathVariable("doctorId") String doctorId) {
        Response response = doctorSlotService.getDoctorSlots(hospitalId, branchId, doctorId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
