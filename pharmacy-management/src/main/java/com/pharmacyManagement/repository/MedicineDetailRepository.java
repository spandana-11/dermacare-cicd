package com.pharmacyManagement.repository;


import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.pharmacyManagement.entity.MedicineDetail;

@Repository
public interface MedicineDetailRepository extends MongoRepository<MedicineDetail, String> {

	MedicineDetail findByProductName(String productName);

}

