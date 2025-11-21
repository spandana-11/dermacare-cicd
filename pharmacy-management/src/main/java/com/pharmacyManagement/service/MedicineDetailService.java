package com.pharmacyManagement.service;

import com.pharmacyManagement.dto.MedicineDetailDTO;
import com.pharmacyManagement.dto.Response;

public interface MedicineDetailService {

    Response saveMedicine(MedicineDetailDTO dto);

    Response getMedicineById(String id);

    Response getAllMedicine();

    Response updateMedicine(String id, MedicineDetailDTO dto);

    Response deleteMedicine(String id);
}
