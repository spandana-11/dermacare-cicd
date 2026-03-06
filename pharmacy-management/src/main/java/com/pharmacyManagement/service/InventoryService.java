package com.pharmacyManagement.service;

import com.pharmacyManagement.dto.InventoryResponseDTO;
import com.pharmacyManagement.dto.Response;

public interface InventoryService {

	Response createInventory(InventoryResponseDTO dto);

	Response getInventoryById(String inventoryId);

	Response updateInventory(String inventoryId, InventoryResponseDTO dto);

	Response deleteInventory(String inventoryId);

	Response getAllInventory();

	Response deleteInventory(String medicineId, String batchNo);

	public Response getInventoryByClinicAndBranch(String clinicId, String branchId);
}