package com.pharmacyManagement.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.pharmacyManagement.entity.Inventory;

public interface InventoryRepository extends MongoRepository<Inventory, String> {


	Inventory findByMedicineIdAndBatchNoAndClinicIdAndBranchId(String medicineId, String batchNo, String clinicId,
			String branchId);
	Inventory findByProductIdAndBatchNo(String productId, String batchNo);
    List<Inventory> findByClinicIdAndBranchId(String clinicId, String branchId);
	Inventory findByMedicineIdAndBatchNo(String medicineId, String batchNo);
}