package com.pharmacyManagement.dto;

import org.springframework.data.annotation.Id;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SupplierDTO {
	@Id
	private String supplierId;
	private String supplierName;
	private String gstNumber; // GSTIN
	private String registrationNumber;
	private String cstNumber;
	String form20B;
	String form21B;
	String address;
	String city;
	String area;
	private boolean nonLocalSupplier;
	private boolean active;
	private SupplierContactDetails contactDetails;
}
