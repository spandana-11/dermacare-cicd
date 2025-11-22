package com.pharmacyManagement.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.pharmacyManagement.entity.Supplier;

public interface SupplierRepository extends MongoRepository<Supplier, String> {

	boolean existsByContactNumber(String contactNumber);

	boolean existsBySupplierNameIgnoreCase(String supplierName);

}
