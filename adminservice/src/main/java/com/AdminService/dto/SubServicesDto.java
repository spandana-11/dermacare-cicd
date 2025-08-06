package com.AdminService.dto;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubServicesDto {

	private String hospitalId;

	private String subServiceId;

	private String subServiceName;

	private String serviceID;

	private String serviceName;

	private String categoryName;

	private String categoryId;

	private String viewDescription;

	private String subServiceImage;

	private String status;

	private String minTime;

	private List<Map<String, List<String>>> descriptionQA;

	private double price;

	private byte discountPercentage;

	private byte taxPercentage;

	private byte platformFeePercentage;

	private double discountAmount;

	private double taxAmount;

	private double platformFee;

	private double discountedCost; // price - discount Amount

	private double clinicPay; // Price - platformFee

	private double finalCost; // taxAmount + discounedCost
}
