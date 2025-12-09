package com.clinicadmin.service.impl;

import org.springframework.stereotype.Service;

import com.clinicadmin.dto.Response;
import com.clinicadmin.dto.StockDTO;
import com.clinicadmin.feignclient.PharmacyManagementFeignClient;
import com.clinicadmin.service.StockLedgerService;
import com.fasterxml.jackson.databind.ObjectMapper;

import feign.FeignException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StockLedgerServiceImpl implements StockLedgerService {

    private final PharmacyManagementFeignClient pharmacyFeignClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // --------------------------------------------------------------------------
    // PURCHASE STOCK
    // --------------------------------------------------------------------------
    @Override
    public Response addPurchase(String purchaseBillNo, StockDTO dto) {
        try {
            return pharmacyFeignClient.addPurchase(purchaseBillNo, dto);
        } catch (FeignException ex) {
            return extractFeignError(ex);
        }
    }

    // --------------------------------------------------------------------------
    // SALE STOCK
    // --------------------------------------------------------------------------
    @Override
    public Response addSale(String productId, String batchNo, int qty, String saleId) {
        try {
            return pharmacyFeignClient.addSale(productId, batchNo, qty, saleId);
        } catch (FeignException ex) {
            return extractFeignError(ex);
        }
    }

    // --------------------------------------------------------------------------
    // DAMAGE STOCK
    // --------------------------------------------------------------------------
    @Override
    public Response addDamage(String productId, String batchNo, int qty, String reason) {
        try {
            return pharmacyFeignClient.addDamage(productId, batchNo, qty, reason);
        } catch (FeignException ex) {
            return extractFeignError(ex);
        }
    }

    // --------------------------------------------------------------------------
    // COMMON FEIGN ERROR HANDLER (Same as your SupplierServiceImpl)
    // --------------------------------------------------------------------------
    private Response extractFeignError(FeignException ex) {
        try {
            return objectMapper.readValue(ex.contentUTF8(), Response.class);
        } catch (Exception parseEx) {
            Response fallback = new Response();
            fallback.setStatus(500);
            fallback.setMessage("Unexpected error from pharmacy service: " + ex.getMessage());
            fallback.setData(null);
            return fallback;
        }
    }
}
