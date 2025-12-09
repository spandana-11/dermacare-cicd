package com.clinicadmin.service.impl;

import org.springframework.stereotype.Service;

import com.clinicadmin.dto.StockDTO;
import com.clinicadmin.dto.Response;
import com.clinicadmin.feignclient.PharmacyManagementFeignClient;
import com.clinicadmin.service.StockService;
import com.fasterxml.jackson.databind.ObjectMapper;

import feign.FeignException;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service

public class StockServiceImpl implements StockService {

    private final PharmacyManagementFeignClient pharmacyFeignClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Response addStock(StockDTO dto) {
        try {
            return pharmacyFeignClient.addStock(dto);
        } catch (FeignException ex) {
            return extractFeignError(ex);
        }
    }

    @Override
    public Response updateStock(String id, StockDTO dto) {
        try {
            return pharmacyFeignClient.updateStock(id, dto);
        } catch (FeignException ex) {
            return extractFeignError(ex);
        }
    }

    @Override
    public Response getStockById(String id) {
        try {
            return pharmacyFeignClient.getStockById(id);
        } catch (FeignException ex) {
            return extractFeignError(ex);
        }
    }

    @Override
    public Response getStockByProductId(String productId) {
        try {
            return pharmacyFeignClient.getStockByProductId(productId);
        } catch (FeignException ex) {
            return extractFeignError(ex);
        }
    }

    @Override
    public Response getAllStock() {
        try {
            return pharmacyFeignClient.getAllStock();
        } catch (FeignException ex) {
            return extractFeignError(ex);
        }
    }

    @Override
    public Response deleteStock(String id) {
        try {
            return pharmacyFeignClient.deleteStock(id);
        } catch (FeignException ex) {
            return extractFeignError(ex);
        }
    }

    /**
     * Same FeignException handler pattern used in SupplierServiceImpl
     */
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
