package com.clinicadmin.service;

import java.util.List;

import org.springframework.http.ResponseEntity;
import com.clinicadmin.dto.ChangeDoctorPasswordDTO;
import com.clinicadmin.dto.DoctorAvailabilityStatusDTO;
import com.clinicadmin.dto.DoctorLoginDTO;
import com.clinicadmin.dto.DoctorSlotDTO;
import com.clinicadmin.dto.DoctorsDTO;
import com.clinicadmin.dto.LoginBasedOnRoleDTO;
import com.clinicadmin.dto.Response;
import com.clinicadmin.dto.TempBlockingSlot;

public interface DoctorService {
	public Response addDoctor(DoctorsDTO dto);

	public Response getAllDoctors();

	public Response getDoctorById(String id);

	public Response upDateDoctorById(String doctorId, DoctorsDTO dto);

	public Response login(DoctorLoginDTO loginDTO);

	public Response changePassword(ChangeDoctorPasswordDTO updateDTO);

//	public Response getDoctorsByClinicId(String clinicId);

//	public Response saveDoctorSlot(String hospitalId, String branchId, String doctorId, DoctorSlotDTO dto);
//public Response getDoctorSlots(String doctorId);
	public Response availabilityStatus(String doctorId, DoctorAvailabilityStatusDTO status);

//	public Response deleteDoctorSlot(String doctorId, String date, String slotToDelete, String branchId);

//Response updateDoctorSlot(String doctorId, String date, String oldSlotTime, String newSlotTime);
	public Response updateDoctorSlot(String doctorId, String date, String oldSlot, String newSlot);

	public Response deleteDoctorSlot(String doctorId, String date, String slotToDelete);

	public Response deleteDoctorById(String doctorId);

	public Response getDoctorsBySubserviceId(String hospitalId, String subServiceId);

//	public Response getDoctorSlots(String hospitalId, String branchId, String doctorId) ;

	public Response getDoctorsByClinicIdAndDoctorId(String clinicId, String doctorId);

	public boolean updateSlot(String doctorId, String branchId,String date, String time);

	public Response getHospitalAndDoctorsUsingSubserviceId(String subServiceId);

	public Response getAllDoctorsBySubserviceId(String subServiceId);

	public boolean makingFalseDoctorSlot(String doctorId,String branchId, String date, String time);

	public ResponseEntity<?> notificationToClinic(String hospitalId);

	public Response getRecommendedClinicsAndDoctors();

	public Response getBestDoctorBySubService(String subServiceId);

	public Response getRecommendedClinicsAndDoctors(List<String> keyPointsFromUser);

	public Response deleteDoctorsByClinic(String hospitalId);

	public Response getAllDoctorsWithRespectiveClinic();

	public Response loginUsingRoles(DoctorLoginDTO dto);

	Response getDoctorsByHospitalIdAndBranchIdSubserviceId(String hospitalId, String branchId, String subServiceId);

	Response saveDoctorSlot(String hospitalId, String doctorId, DoctorSlotDTO dto);

	Response getDoctorSlots(String hospitalId, String doctorId);

	Response getDoctorsByClinicIdAndBranchId(String hospitalId, String branchId);

	Response getDoctorsByClinicId(String hospitalId);

	Response deleteDoctorSlotbyDate(String doctorId, String date);

//	---------------------------------------------Slots using branchId----------------------------------------------
	Response saveDoctorSlot(String hospitalId, String branchId, String doctorId, DoctorSlotDTO dto);

	Response getDoctorSlots(String hospitalId, String branchId, String doctorId);

	Response getRecommendedClinicsAndOneDoctors(List<String> keyPointsFromUser);

	Response getDoctorsByHospitalIdAndBranchId(String hospitalId, String branchId);

	public Response deleteDoctorFromBranch(String doctorId, String branchId);

	Response generateDoctorSlots(String doctorId, String branchId, String date, int intervalMinutes, String openingTime,
			String closingTime);
	
	public boolean blockingSlot(TempBlockingSlot tempBlockingSlot);

	Response deleteDoctorSlot(String doctorId, String branchId, String date, String slotToDelete);

	Response deleteDoctorSlotbyDate(String doctorId, String branchId, String date);

	Response getAllDoctorsWithRespectiveClinic(int consultationType);

	Response getRecommendedClinicsAndDoctors(List<String> keyPointsFromUser, int consultationType);

	Response getAllDoctorsWithRespectiveClinic(String hospitalId, int consultationType);

}
