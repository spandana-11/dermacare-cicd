package com.clinicadmin.service;

import org.springframework.http.ResponseEntity;
import com.clinicadmin.dto.ChangeDoctorPasswordDTO;
import com.clinicadmin.dto.DoctorAvailabilityStatusDTO;
import com.clinicadmin.dto.DoctorLoginDTO;
import com.clinicadmin.dto.DoctorSlotDTO;
import com.clinicadmin.dto.DoctorsDTO;
import com.clinicadmin.dto.Response;



public interface DoctorService {
public Response addDoctor(DoctorsDTO dto);
public Response getAllDoctors();
public Response getDoctorById(String id);
public Response upDateDoctorById(String doctorId,DoctorsDTO dto);
public Response login(DoctorLoginDTO loginDTO);
public Response changePassword(ChangeDoctorPasswordDTO updateDTO);
public Response getDoctorsByClinicId(String clinicId);
public Response saveDoctorSlot(String hospitalId, String doctorId, DoctorSlotDTO dto);
//public Response getDoctorSlots(String doctorId);
public Response availabilityStatus(String doctorId, DoctorAvailabilityStatusDTO status);
Response deleteDoctorSlot(String doctorId, String date, String slotToDelete);
//Response updateDoctorSlot(String doctorId, String date, String oldSlotTime, String newSlotTime);
Response updateDoctorSlot(String doctorId, String date, String oldSlot, String newSlot);
public Response deleteDoctorSlotbyDate(String doctorId,String date);
public Response deleteDoctorById(String doctorId);
public Response getDoctorsBySubserviceId(String hospitalId, String subServiceId);
Response getDoctorSlots(String hospitalId, String doctorId);
Response getDoctorsByClinicIdAndDoctorId(String clinicId, String doctorId);
public boolean updateSlot(String doctorId, String date,
		String time);
Response getHospitalAndDoctorsUsingSubserviceId(String subServiceId);

Response getAllDoctorsBySubserviceId(String subServiceId);
public boolean makingFalseDoctorSlot(String doctorId, String date, String time);

public ResponseEntity<?> notificationToClinic(String hospitalId);

}
