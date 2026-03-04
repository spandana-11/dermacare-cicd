package com.pharmacyManagement.repository;

import java.util.Optional;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.pharmacyManagement.entity.Stock;

@Repository
public interface StockRepository extends MongoRepository<Stock, String> {

    Optional<Stock> findByProductIdAndBatchNo(String productId, String batchNo);

    List<Stock> findByProductId(String productId);

    List<Stock> findByStatus(String status);
}
