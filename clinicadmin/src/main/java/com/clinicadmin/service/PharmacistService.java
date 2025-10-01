package com.clinicadmin.service;

import org.springframework.http.ResponseEntity;

import com.clinicadmin.dto.DoctorPrescriptionDTO;
import com.clinicadmin.dto.PharmacistDTO;
import com.clinicadmin.dto.Response;
import com.clinicadmin.dto.PharmacistLoginDTO;
import com.clinicadmin.dto.ResetPharmacistLoginPasswordDTO;

public interface PharmacistService {
    Response pharmacistOnboarding(PharmacistDTO dto);
    Response getPharmacistById(String pharmacistId);
    Response updatePharmacist(String pharmacistId, PharmacistDTO dto);
    Response deletePharmacist(String pharmacistId);
//    Response pharmacistLogin(PharmacistLoginDTO loginDTO);
//    Response resetLoginPassword(ResetPharmacistLoginPasswordDTO dto);
	Response getAllPharmacistsByHospitalId(String hospitalId);
	ResponseEntity<Response> getPrescriptionsByClinicId(String clinicId);
	ResponseEntity<Response> deleteMedicine(String medicineId);
	ResponseEntity<Response> deletePrescription(String id);
	ResponseEntity<Response> searchMedicines(String keyword);
	ResponseEntity<Response> getMedicineById(String medicineId);
	ResponseEntity<Response> getPrescriptionById(String id);
	ResponseEntity<Response> getAllPrescriptions();
	ResponseEntity<Response> createPrescription(DoctorPrescriptionDTO dto);
}