package com.AdminService.service;

import com.AdminService.dto.WardBoyDTO;
import com.AdminService.feign.ClinicAdminFeign;
import com.AdminService.util.ResponseStructure;
import com.fasterxml.jackson.databind.ObjectMapper;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WardBoyServiceImpl implements WardBoyService {

    private final ClinicAdminFeign clinicAdminFeign;

    @Override
    public ResponseEntity<ResponseStructure<WardBoyDTO>> addWardBoy(WardBoyDTO dto) {
        try {
            ResponseStructure<WardBoyDTO> response = clinicAdminFeign.addWardBoy(dto);
            return ResponseEntity.status(response.getHttpStatus()).body(response);
        } catch (FeignException ex) {
            return mapFeignException(ex);
        }
    }

    @Override
    public ResponseEntity<ResponseStructure<WardBoyDTO>> updateWardBoy(String id, WardBoyDTO dto) {
        try {
            ResponseStructure<WardBoyDTO> response = clinicAdminFeign.updateWardBoy(id, dto);
            return ResponseEntity.status(response.getHttpStatus()).body(response);
        } catch (FeignException ex) {
            return mapFeignException(ex);
        }
    }

    @Override
    public ResponseEntity<ResponseStructure<WardBoyDTO>> getWardBoyById(String id) {
        try {
            ResponseStructure<WardBoyDTO> response = clinicAdminFeign.getWardBoyById(id);
            return ResponseEntity.status(response.getHttpStatus()).body(response);
        } catch (FeignException ex) {
            return mapFeignException(ex);
        }
    }

    @Override
    public ResponseEntity<ResponseStructure<List<WardBoyDTO>>> getAllWardBoys() {
        try {
            ResponseStructure<List<WardBoyDTO>> response = clinicAdminFeign.getAllWardBoys();
            return ResponseEntity.status(response.getHttpStatus()).body(response);
        } catch (FeignException ex) {
            return mapFeignException(ex);
        }
    }

    @Override
    public ResponseEntity<ResponseStructure<List<WardBoyDTO>>> getWardBoysByClinicId(String clinicId) {
        try {
            ResponseStructure<List<WardBoyDTO>> response = clinicAdminFeign.getWardBoysByClinicId(clinicId);
            return ResponseEntity.status(response.getHttpStatus()).body(response);
        } catch (FeignException ex) {
            return mapFeignException(ex);
        }
    }

    @Override
    public ResponseEntity<ResponseStructure<WardBoyDTO>> getWardBoyByIdAndClinicId(String wardBoyId, String clinicId) {
        try {
            ResponseStructure<WardBoyDTO> response = clinicAdminFeign.getWardBoyByIdAndClinicId(wardBoyId, clinicId);
            return ResponseEntity.status(response.getHttpStatus()).body(response);
        } catch (FeignException ex) {
            return mapFeignException(ex);
        }
    }

    @Override
    public ResponseEntity<ResponseStructure<Void>> deleteWardBoy(String id) {
        try {
            ResponseStructure<Void> response = clinicAdminFeign.deleteWardBoy(id);
            return ResponseEntity.status(response.getHttpStatus()).body(response);
        } catch (FeignException ex) {
            return mapFeignException(ex);
        }
    }

    @Override
    public ResponseEntity<ResponseStructure<List<WardBoyDTO>>> getWardBoysByClinicIdAndBranchId(String clinicId, String branchId) {
        try {
            ResponseStructure<List<WardBoyDTO>> response = clinicAdminFeign.getWardBoysByClinicIdAndBranchId(clinicId, branchId);
            return ResponseEntity.status(response.getHttpStatus()).body(response);
        } catch (FeignException ex) {
            return mapFeignException(ex);
        }
    }

    // ------------------- Map FeignException -------------------
    @SuppressWarnings("unchecked")
    private <T> ResponseEntity<ResponseStructure<T>> mapFeignException(FeignException ex) {
        try {
            if (ex.responseBody().isPresent()) {
                String body = new String(ex.responseBody().get().array(), StandardCharsets.UTF_8);
                ResponseStructure<T> clinicResponse = new ObjectMapper().readValue(body, ResponseStructure.class);
                return ResponseEntity.status(clinicResponse.getHttpStatus()).body(clinicResponse);
            }
        } catch (Exception ignored) {}

        ResponseStructure<T> fallback = ResponseStructure.buildResponse(
                null,
                "Unable to connect to Clinic Admin Service",
                null,
                500
        );
        return ResponseEntity.status(500).body(fallback);
    }
}
