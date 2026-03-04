package com.pharmacyManagement.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.pharmacyManagement.entity.StockLedger;

@Repository
public interface StockLedgerRepository extends MongoRepository<StockLedger, String> {
}
