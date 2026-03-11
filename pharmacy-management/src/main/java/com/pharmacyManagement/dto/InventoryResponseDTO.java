package com.pharmacyManagement.dto;

import lombok.Data;

@Data
public class InventoryResponseDTO {

	private String inventoryId;

	private String medicineId;
	private String medicineName;

	private String brand;
	private String productType;
	private String pack;

	private String batchNo;
	private String mfgDate;
	private String expiryDate;

	private double daysLeft;

	private double availableQty;
	private double minStock;

	private double purchaseRate;
	private double mrp;
	private double gstPercent;

	private String supplierId;
	private String supplier;

	private String status;

	// ✅ Multi tenant
	private String clinicId;
	private String branchId;

}