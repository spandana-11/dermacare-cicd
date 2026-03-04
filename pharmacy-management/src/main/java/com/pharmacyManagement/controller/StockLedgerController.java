package com.pharmacyManagement.controller;

import org.springframework.web.bind.annotation.*;

import com.pharmacyManagement.dto.Response;
import com.pharmacyManagement.dto.StockDTO;
import com.pharmacyManagement.service.StockLedgerService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/stock")
@RequiredArgsConstructor
public class StockLedgerController {

    private final StockLedgerService stockService;

    // -----------------------
    // PURCHASE STOCK
    // -----------------------
    @PostMapping("/purchase/{purchaseBillNo}")
    public Response addPurchase(@PathVariable String purchaseBillNo,
                                @RequestBody StockDTO dto) {
        return stockService.addPurchaseStock(dto, purchaseBillNo);
    }

    // -----------------------
    // SALE STOCK
    // -----------------------
    @PostMapping("/sale/{productId}/{batchNo}/{qty}/{saleId}")
    public Response addSale(@PathVariable String productId,
                            @PathVariable String batchNo,
                            @PathVariable int qty,
                            @PathVariable String saleId) {

        return stockService.recordSale(productId, batchNo, qty, saleId);
    }

    // -----------------------
    // DAMAGE STOCK
    // -----------------------
    @PostMapping("/damage/{productId}/{batchNo}/{qty}/{reason}")
    public Response addDamage(@PathVariable String productId,
                              @PathVariable String batchNo,
                              @PathVariable int qty,
                              @PathVariable String reason) {

        return stockService.recordDamage(productId, batchNo, qty, reason);
    }
}
