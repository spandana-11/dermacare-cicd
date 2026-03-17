package com.pharmacyManagement.controller;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.pharmacyManagement.dto.Response;
import com.pharmacyManagement.dto.ReturnBillDTO;
import com.pharmacyManagement.service.ReturnBillService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/return-bill")
@RequiredArgsConstructor
public class ReturnBillController {

	@Autowired
    private  ReturnBillService service;

    // =========================
    // ✅ CREATE
    // =========================
    @PostMapping("/createReturnBill")
    public ResponseEntity<Response> createReturnBill(@RequestBody ReturnBillDTO dto) {

        Response res = service.createReturnBill(dto);

        return ResponseEntity.status(res.getStatus()).body(res);
    }

    // =========================
    // ✅ GET BY RECEIPT NO
    // =========================
    @GetMapping("getByreceiptNo/{receiptNo}")
    public ResponseEntity<Response> getByreceiptNo(@PathVariable String receiptNo) {

        Response res = service.getByreceiptNo(receiptNo);

        return ResponseEntity.status(res.getStatus()).body(res);
    }

    // =========================
    // ✅ GET BY CLINIC + BRANCH
    // =========================
    @GetMapping("/getByClinicIdAndBranchId/{clinicId}/{branchId}")
    public ResponseEntity<Response> getByClinicIdAndBranchId(
            @PathVariable String clinicId,
            @PathVariable String branchId) {

        Response res = service.getByClinicIdAndBranchId(clinicId, branchId);

        return ResponseEntity.status(res.getStatus()).body(res);
    }

    // =========================
    // ✅ DELETE
    // =========================
    @DeleteMapping("/deleteByreceiptNo/{receiptNo}")
    public ResponseEntity<Response> deleteByreceiptNo(@PathVariable String receiptNo) {

        Response res = service.deleteByreceiptNo(receiptNo);

        return ResponseEntity.status(res.getStatus()).body(res);
    }
}
