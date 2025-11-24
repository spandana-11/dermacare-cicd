package com.pharmacyManagement.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.pharmacyManagement.entity.Supplier;

public interface SupplierRepository extends MongoRepository<Supplier, String> {

	
	boolean existsBySupplierNameIgnoreCase(String supplierName);

	boolean existsByContactDetailsMobileNumber1(String mobileNumber1);

	boolean existsByContactDetailsEmail(String email);

}
