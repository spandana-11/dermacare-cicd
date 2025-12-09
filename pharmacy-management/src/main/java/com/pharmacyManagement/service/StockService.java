package com.pharmacyManagement.service;

import com.pharmacyManagement.dto.Response;
import com.pharmacyManagement.entity.Stock;

public interface StockService {

    Response addStock(Stock stock);

    Response updateStock(String id, Stock stock);

    Response getStockById(String id);

    Response getStockByProductId(String productId);

    Response getAllStock();

    Response deleteStock(String id);

    Response changeStatus(String id, String status);

	Response deleteStockById(String id);
}
