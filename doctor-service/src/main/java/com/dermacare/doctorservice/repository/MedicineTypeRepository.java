package com.dermacare.doctorservice.repository;

import java.util.Optional;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.dermacare.doctorservice.model.MedicineType;

public interface MedicineTypeRepository extends MongoRepository<MedicineType, String> {
    Optional<MedicineType> findByClinicId(String clinicId);

}
