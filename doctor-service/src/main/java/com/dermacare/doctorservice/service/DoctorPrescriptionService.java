package com.dermacare.doctorservice.service;

import com.dermacare.doctorservice.dto.Response;

public interface DoctorPrescriptionService {
    Response createPrescription(com.dermacare.doctorservice.dto.DoctorPrescriptionDTO dto);
    Response getAllPrescriptions();
    Response getPrescriptionById(String id);
    Response getMedicineById(String medicineId);
    Response deletePrescription(String id);
	Response deleteMedicineById(String medicineId);
	Response searchMedicinesByName(String keyword);
}
