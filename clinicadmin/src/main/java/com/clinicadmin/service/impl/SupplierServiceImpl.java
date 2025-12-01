package com.clinicadmin.service.impl;

import org.springframework.stereotype.Service;

import com.clinicadmin.dto.SupplierDTO;
import com.clinicadmin.dto.Response;
import com.clinicadmin.feignclient.PharmacyManagementFeignClient;
import com.clinicadmin.service.SupplierService;
import com.fasterxml.jackson.databind.ObjectMapper;

import feign.FeignException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final PharmacyManagementFeignClient pharmacyFeignClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Response addSupplier(SupplierDTO dto) {
        try {
            return pharmacyFeignClient.addSupplier(dto);
        } catch (FeignException ex) {
            return extractFeignError(ex);
        }
    }

    @Override
    public Response updateSupplier(String supplierId, SupplierDTO dto) {
        try {
            return pharmacyFeignClient.updateSupplier(supplierId, dto);
        } catch (FeignException ex) {
            return extractFeignError(ex);
        }
    }

    @Override
    public Response getSupplierById(String supplierId) {
        try {
            return pharmacyFeignClient.getSupplierById(supplierId);
        } catch (FeignException ex) {
            return extractFeignError(ex);
        }
    }

    @Override
    public Response getAllSuppliers() {
        try {
            return pharmacyFeignClient.getAllSuppliers();
        } catch (FeignException ex) {
            return extractFeignError(ex);
        }
    }

    @Override
    public Response deleteSupplier(String supplierId) {
        try {
            return pharmacyFeignClient.deleteSupplier(supplierId);
        } catch (FeignException ex) {
            return extractFeignError(ex);
        }
    }

    // ⭐ Same Feign Error Handler used in PurchaseBillServiceImpl
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
