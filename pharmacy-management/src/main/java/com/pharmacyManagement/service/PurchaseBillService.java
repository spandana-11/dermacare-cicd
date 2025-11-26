package com.pharmacyManagement.service;

import com.pharmacyManagement.dto.PurchaseBillDTO;
import com.pharmacyManagement.dto.Response;

public interface PurchaseBillService {

	Response savePurchase(PurchaseBillDTO dto);

	Response getPurchaseById(String id);

	Response getAllPurchases();

	Response deletePurchase(String id);

	Response updatePurchase(String id, PurchaseBillDTO dto);

	Response getPurchaseByPurchaseBillNo(String purchaseBillNo);

	Response getPurchaseByDateRange(String fromDate, String toDate);

}
