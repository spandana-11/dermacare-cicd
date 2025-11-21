package com.pharmacyManagement.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "supplier")
public class Supplier {
	@Id
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
