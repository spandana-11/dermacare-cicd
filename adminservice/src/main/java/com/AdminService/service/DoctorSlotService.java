package com.AdminService.service;

import com.AdminService.dto.DoctorSlotDTO;
import com.AdminService.util.Response;

public interface DoctorSlotService {

    Response addDoctorSlot(String hospitalId, String branchId, String doctorId, DoctorSlotDTO slotDto);

    Response getDoctorSlots(String hospitalId, String branchId, String doctorId);
}
