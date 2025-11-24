package com.pharmacyManagement.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.pharmacyManagement.dto.SupplierContactDetails;

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
