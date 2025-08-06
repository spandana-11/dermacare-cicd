// DoctorPrescriptionService.java
package com.dermacare.doctorservice.service;

import com.dermacare.doctorservice.dto.Response;
import com.dermacare.doctorservice.dto.DoctorPrescriptionDTO;

public interface DoctorPrescriptionService {
    Response createPrescription(DoctorPrescriptionDTO dto);
    Response getAllPrescriptions();
    Response getPrescriptionById(String id);
    Response getMedicineById(String medicineId);
    Response deletePrescription(String id);
    Response searchMedicinesByName(String keyword);
    Response deleteMedicineById(String medicineId);
}
