package com.pharmacyManagement.service;

import com.pharmacyManagement.dto.MedicineDto;
import com.pharmacyManagement.dto.Response;

public interface MedicineService {

    Response saveMedicine(MedicineDto dto);

    Response getMedicineById(String id);

    Response getAllMedicines();

    Response updateMedicine(String id, MedicineDto dto);

    Response deleteMedicine(String id);
}
