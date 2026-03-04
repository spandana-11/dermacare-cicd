package com.pharmacyManagement.service;

import java.util.List;

import com.pharmacyManagement.dto.Response;
import com.pharmacyManagement.dto.StockDTO;
import com.pharmacyManagement.entity.PurchaseItem;

public interface StockLedgerService {

	Response addPurchaseStock(StockDTO dto, String purchaseBillNo);

	Response reversePurchaseItem(String productId, String batchNo, int qtyToReverse, String purchaseBillNo);

	Response reversePurchaseByBill(String purchaseBillNo, List<PurchaseItem> items);

	Response recordSale(String productId, String batchNo, int qty, String saleId);

	Response recordDamage(String productId, String batchNo, int qty, String reason);

 
}
