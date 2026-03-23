package com.pharmacyManagement.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.pharmacyManagement.entity.Order;

public interface OrderRepository extends MongoRepository<Order, String> {

	List<Order> findByClinicIdAndBranchId(String clinicId, String branchId);

	Optional<Order> findByClinicIdAndBranchIdAndOrderId(String clinicId, String branchId, String orderId);

	Optional<Order> findByOrderId(String orderId);

	void deleteByOrderId(String orderId);
}