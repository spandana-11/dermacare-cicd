package com.pharmacyManagement.dto;

import lombok.Data;

@Data
public class InventoryResponseDTO {

    private String medicineId;
    private String medicineName;

    private String batchNo;
    private String mfgDate;
    private String expiryDate;
    private long daysLeft;

    private double availableQty;
    private double minStock;

    private double purchaseRate;
    private double mrp;
    private double gstPercent;

    private String supplier;
    private String status;
}