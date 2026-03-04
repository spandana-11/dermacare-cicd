package com.pharmacyManagement.dto;

import lombok.Data;

@Data
public class Summary {
	private double totalQuantity;
	private double totalFreeQuantity;
	private double totalTaxableAmount;
	private double totalGSTAmount;
	private double grandTotal;
}
