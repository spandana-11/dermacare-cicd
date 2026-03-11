package com.pharmacyManagement.dto;

import lombok.Data;

@Data
public class Summary {
	private double totalQuantity;
	private double totalTaxableAmount;
	private double totalDiscountedAmount;
	private double totalGSTAmount;
	private double totalCostPrice;
	private double grandTotal;
}
