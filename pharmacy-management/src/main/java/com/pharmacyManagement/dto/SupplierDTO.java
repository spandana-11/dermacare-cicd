package com.pharmacyManagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SupplierDTO {
	private String supplierId;
	private String supplierName;
	private String contactNumber;
	private String supplierLicenseNo;
	private String gstNumber; // GSTIN
	private String gstClassification; // Registered, Unregistered, Composition, etc.
	private String email;
	private String address;

	private boolean active;
}
