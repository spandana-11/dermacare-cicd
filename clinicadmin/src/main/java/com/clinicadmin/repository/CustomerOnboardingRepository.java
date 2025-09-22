package com.clinicadmin.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.clinicadmin.entity.CustomerOnbording;

public interface CustomerOnboardingRepository extends MongoRepository<CustomerOnbording, String> {
	Optional<CustomerOnbording> findByCustomerId(String customerId); // ✅ works because field exists

	void deleteByCustomerId(String customerId);

	List<CustomerOnbording> findByHospitalId(String hospitalId);

	List<CustomerOnbording> findByBranchId(String branchId);

	List<CustomerOnbording> findByHospitalIdAndBranchId(String hospitalId, String branchId);
	
}
