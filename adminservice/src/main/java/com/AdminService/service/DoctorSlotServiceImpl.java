package com.AdminService.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.AdminService.dto.DoctorSlotDTO;
import com.AdminService.feign.ClinicAdminFeign;
import com.AdminService.util.ExtractFeignMessage;
import com.AdminService.util.Response;

import feign.FeignException;

@Service
public class DoctorSlotServiceImpl implements DoctorSlotService {

    @Autowired
    private ClinicAdminFeign clinicAdminFeign;

    @Override
    public Response addDoctorSlot(String hospitalId, String branchId, String doctorId, DoctorSlotDTO slotDto) {
        Response response = new Response();
        try {
            response = clinicAdminFeign
                    .addDoctorSlot(hospitalId, branchId, doctorId, slotDto)
                    .getBody();
        } catch (FeignException e) {
            response.setSuccess(false);
            response.setMessage(ExtractFeignMessage.clearMessage(e));
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
        return response;
    }

    @Override
    public Response getDoctorSlots(String hospitalId, String branchId, String doctorId) {
        Response response = new Response();
        try {
            response = clinicAdminFeign
                    .getDoctorSlots(hospitalId, branchId, doctorId)
                    .getBody();
        } catch (FeignException e) {
            response.setSuccess(false);
            response.setMessage(ExtractFeignMessage.clearMessage(e));
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
        return response;
    }
}
