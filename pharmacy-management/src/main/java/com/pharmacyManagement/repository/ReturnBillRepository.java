package com.pharmacyManagement.repository;

import com.pharmacyManagement.entity.ReturnBill;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReturnBillRepository extends MongoRepository<ReturnBill, String> {

    List<ReturnBill> findByClinicIdAndBranchId(String clinicId, String branchId);
}