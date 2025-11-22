package com.pharmacyManagement.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pharmacyManagement.dto.PurchaseBillDTO;
import com.pharmacyManagement.dto.Response;
import com.pharmacyManagement.service.PurchaseBillService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/purchase")

@RequiredArgsConstructor
public class PurchaseBillController {


    private final PurchaseBillService purchaseBillService;

    // =============================
    //   SAVE PURCHASE BILL
    // =============================
    @PostMapping("/save")
    public ResponseEntity<Response> savePurchaseBill(@Valid @RequestBody PurchaseBillDTO dto) {
        Response response = purchaseBillService.savePurchase(dto);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

}
