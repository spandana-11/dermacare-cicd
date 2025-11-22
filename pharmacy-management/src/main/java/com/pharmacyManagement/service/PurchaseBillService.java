package com.pharmacyManagement.service;

import com.pharmacyManagement.dto.PurchaseBillDTO;
import com.pharmacyManagement.dto.Response;

public interface PurchaseBillService {

	Response savePurchase(PurchaseBillDTO dto);

}
