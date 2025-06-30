package com.AdminService.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.AdminService.entity.Clinic;


@Repository
public interface ClinicRep extends MongoRepository<Clinic, String> {

	Clinic findByHospitalId(String id);
	Clinic findByContactNumber(String customerNumber);
	Clinic findFirstByOrderByHospitalIdDesc();
	void deleteByHospitalId(String id);
		
}
