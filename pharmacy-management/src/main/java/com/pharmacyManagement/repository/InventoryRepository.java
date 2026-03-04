package com.pharmacyManagement.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.pharmacyManagement.entity.Inventory;

public interface InventoryRepository extends MongoRepository<Inventory, String> {

	void deleteByProductIdAndBatchNo(String productId, String batchNo);

	Inventory findByProductIdAndBatchNo(String productId, String batchNo);

}