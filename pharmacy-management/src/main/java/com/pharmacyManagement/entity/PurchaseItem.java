package com.pharmacyManagement.entity;

import lombok.Data;

@Data
public class PurchaseItem {
	 private String productId;
	    private String productName;
	    private String batchNo;
	    private String expiryDate;

	    private String packSize;   

	    private int quantity;
	    private int freeQty;
	    private double costPrice;
	    private double mrp;

	    private double discountPercent;
	    private double discountAmount;

	    private double gstPercent;

	    private double baseAmount;

	    private double gstAmount;
	    private double cgstAmount;
	    private double sgstAmount;

	    private double lineTotal;
	
	

}
