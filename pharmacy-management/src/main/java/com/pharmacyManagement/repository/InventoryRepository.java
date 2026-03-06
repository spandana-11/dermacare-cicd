package com.pharmacyManagement.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.pharmacyManagement.entity.Inventory;

public interface InventoryRepository extends MongoRepository<Inventory, String> {

	void deleteByProductIdAndBatchNo(String productId, String batchNo);

	Inventory findByProductIdAndBatchNo(String productId, String batchNo);
    List<Inventory> findByClinicIdAndBranchId(String clinicId, String branchId);


}