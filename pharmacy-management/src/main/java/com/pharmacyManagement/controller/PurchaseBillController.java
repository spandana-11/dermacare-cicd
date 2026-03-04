package com.pharmacyManagement.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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
    @PutMapping("/update/{id}")
    public ResponseEntity<Response> updatePurchaseBill(
            @PathVariable String id,
            @Valid @RequestBody PurchaseBillDTO dto) {

        Response response = purchaseBillService.updatePurchase(id, dto);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<Response> getPurchaseBillById(@PathVariable String id) {
        Response response = purchaseBillService.getPurchaseById(id);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
    @GetMapping("/getByBillNo/{billNo}")
    public ResponseEntity<Response> getPurchaseBillByBillNo(@PathVariable String billNo) {
        Response response = purchaseBillService.getPurchaseByPurchaseBillNo(billNo);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/all")
    public ResponseEntity<Response> getAllPurchaseBills() {
        Response response = purchaseBillService.getAllPurchases();
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Response> deletePurchaseBill(@PathVariable String id) {
        Response response = purchaseBillService.deletePurchase(id);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
    
    @GetMapping("/search/date/{fromDate}/{toDate}")
    public ResponseEntity<Response> getByDateRange(
            @PathVariable String fromDate,
            @PathVariable String toDate) {

        Response res = purchaseBillService.getPurchaseByDateRange(fromDate, toDate);
        return ResponseEntity.status(res.getStatus()).body(res);
    }


}
