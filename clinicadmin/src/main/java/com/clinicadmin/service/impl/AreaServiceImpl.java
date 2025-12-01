package com.clinicadmin.service.impl;

import com.clinicadmin.dto.AreaDTO;
import com.clinicadmin.dto.Response;
import com.clinicadmin.feignclient.PharmacyManagementFeignClient;
import com.clinicadmin.service.AreaService;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
public class AreaServiceImpl implements AreaService {

    private final PharmacyManagementFeignClient pharmacyClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Response saveArea(AreaDTO dto) {
        try {
            return pharmacyClient.saveArea(dto);
        } catch (FeignException ex) {
            return extractPharmacyError(ex);
        }
    }

    @Override
    public Response updateArea(String id, AreaDTO dto) {
        try {
            return pharmacyClient.updateArea(id, dto);
        } catch (FeignException ex) {
            return extractPharmacyError(ex);
        }
    }

    @Override
    public Response getAreaById(String id) {
        try {
            return pharmacyClient.getAreaById(id);
        } catch (FeignException ex) {
            return extractPharmacyError(ex);
        }
    }

    @Override
    public Response getAllAreas() {
        try {
            return pharmacyClient.getAllAreas();
        } catch (FeignException ex) {
            return extractPharmacyError(ex);
        }
    }

    @Override
    public Response deleteArea(String id) {
        try {
            return pharmacyClient.deleteArea(id);
        } catch (FeignException ex) {
            return extractPharmacyError(ex);
        }
    }

    @Override
    public Response getAreasByCity(String cityId) {
        try {
            return pharmacyClient.getAreasByCity(cityId);
        } catch (FeignException ex) {
            return extractPharmacyError(ex);
        }
    }

    // ⭐ MOST IMPORTANT — Extract SAME message returned by pharmacy service
    private Response extractPharmacyError(FeignException ex) {
        try {
            return objectMapper.readValue(ex.contentUTF8(), Response.class);
        } catch (Exception parseException) {

            // fallback if pharmacy didn’t return JSON
            Response fallback = new Response();
            fallback.setStatus(500);
            fallback.setMessage("Unexpected error: " + ex.getMessage());
            fallback.setData(null);
            return fallback;
        }
    }
}
