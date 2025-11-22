package com.pharmacyManagement.entity;

import lombok.Data;

@Data
public class PurchaseItem {

    private String productName;
    private String batchNo;
    private String expiryDate;

    private int quantity;
    private double costPrice;
    private double mrp;

    private double discountPercent;
    private double discountAmount;

    private double gstPercent;

    private double baseAmount;

    // Tax fields
    private double gstAmount;
    private double cgstAmount;
    private double sgstAmount;

    private double lineTotal;
}
