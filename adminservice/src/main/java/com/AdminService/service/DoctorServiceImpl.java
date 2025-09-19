package com.AdminService.service;

import java.nio.charset.StandardCharsets;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.AdminService.dto.DoctorsDTO;
import com.AdminService.feign.ClinicAdminFeign;
import com.AdminService.util.Response;
import com.fasterxml.jackson.databind.ObjectMapper;

import feign.FeignException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final ClinicAdminFeign clinicAdminFeign;
    private final ObjectMapper objectMapper = new ObjectMapper(); 

    //--------------------------------- Add Doctor --------------------------------------------
    @Override
    public ResponseEntity<Response> addDoctor(DoctorsDTO dto) {
        try {
            return clinicAdminFeign.addDoctor(dto);
        } catch (FeignException ex) {
            return handleFeignException(ex);
        }
    }

    // ---------------- Get All Doctors ----------------
    @Override
    public ResponseEntity<Response> getAllDoctors() {
        try {
            return clinicAdminFeign.getAllDoctors();
        } catch (FeignException ex) {
            return handleFeignException(ex);
        }
    }

    // ---------------- Get Doctor By Id ----------------
    @Override
    public ResponseEntity<Response> getDoctorById(String id) {
        try {
            return clinicAdminFeign.getDoctorById(id);
        } catch (FeignException ex) {
            return handleFeignException(ex);
        }
    }

    // ---------------- Update Doctor By Id ----------------
    @Override
    public ResponseEntity<Response> updateDoctorById(String doctorId, DoctorsDTO dto) {
        try {
            return clinicAdminFeign.updateDoctorById(doctorId, dto);
        } catch (FeignException ex) {
            return handleFeignException(ex);
        }
    }

    // ---------------- Delete Doctor By Id ----------------
    @Override
    public ResponseEntity<Response> deleteDoctorById(String doctorId) {
        try {
            return clinicAdminFeign.deleteDoctorById(doctorId);
        } catch (FeignException ex) {
            return handleFeignException(ex);
        }
    }

    // ---------------- Delete Doctors By Clinic ----------------
    @Override
    public ResponseEntity<Response> deleteDoctorsByClinic(String clinicId) {
        try {
            return clinicAdminFeign.deleteDoctorsByClinic(clinicId);
        } catch (FeignException ex) {
            return handleFeignException(ex);
        }
    }

    // ---------------- Common Feign Exception Handler ----------------
    private ResponseEntity<Response> handleFeignException(FeignException ex) {
        try {
            if (ex.responseBody().isPresent()) {
                byte[] bodyBytes = ex.responseBody().get().array();
                String body = new String(bodyBytes, StandardCharsets.UTF_8);

                Response response = objectMapper.readValue(body, Response.class);
                return ResponseEntity.status(ex.status()).body(response);
            }
        } catch (Exception innerEx) {
            innerEx.printStackTrace();
        }

        
        Response fallback = new Response(false, null, ex.getMessage(), ex.status(), null, null, null, null, null);
        return ResponseEntity.status(ex.status()).body(fallback);
    }
}