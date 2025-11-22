package com.pharmacyManagement.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.pharmacyManagement.entity.PurchaseBill;

public interface PurchaseBillRepository extends MongoRepository<PurchaseBill, String> {

    boolean existsByPurchaseBillNo(String purchaseBillNo);
}
