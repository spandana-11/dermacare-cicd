package com.pharmacyManagement.repository;


import org.springframework.data.mongodb.repository.MongoRepository;
import com.pharmacyManagement.entity.MedicineDetail;

public interface MedicineDetailRepository extends MongoRepository<MedicineDetail, String> {

	MedicineDetail findByProductName(String productName);

}

