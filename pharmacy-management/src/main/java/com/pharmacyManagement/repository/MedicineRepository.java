package com.pharmacyManagement.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.pharmacyManagement.entity.Medicine;

public interface MedicineRepository extends MongoRepository<Medicine, String> {

    boolean existsByMedicineNameIgnoreCase(String medicineName);
}
