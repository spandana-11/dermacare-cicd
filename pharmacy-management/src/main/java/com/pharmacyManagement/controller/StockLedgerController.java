package com.pharmacyManagement.controller;

import org.springframework.web.bind.annotation.*;

import com.pharmacyManagement.dto.Response;
import com.pharmacyManagement.dto.StockDTO;
import com.pharmacyManagement.service.StockLedgerService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/stock")
@RequiredArgsConstructor
public class StockLedgerController {

    private final StockLedgerService stockService;

    @PostMapping("/purchase")
    public Response addPurchase(@RequestBody StockDTO dto) {
        return stockService.addPurchaseStock(dto);
    }

    @PostMapping("/sale")
    public Response addSale(@RequestParam String productId,
                            @RequestParam String batchNo,
                            @RequestParam int qty,
                            @RequestParam String saleId) {
        return stockService.recordSale(productId, batchNo, qty, saleId);
    }

    @PostMapping("/damage")
    public Response addDamage(@RequestParam String productId,
                              @RequestParam String batchNo,
                              @RequestParam int qty,
                              @RequestParam String reason) {
        return stockService.recordDamage(productId, batchNo, qty, reason);
    }
}
