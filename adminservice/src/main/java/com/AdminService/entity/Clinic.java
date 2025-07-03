package com.AdminService.entity;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "clinics") // MongoDB collection

public class Clinic {
	@Id
	private String id;
	private String name;
	private String hospitalId;
	private String address;
	private String city;
	private String contactNumber;
	private String openingTime;
	private String closingTime;
	private byte[] hospitalLogo;
	private String emailAddress;
    private String website;
    private String licenseNumber;
    private String issuingAuthority;
    private List<byte[]> contracterDocuments;
	private List<byte[]> hospitalDocuments;
	private boolean recommended;
	private double hospitalOverallRating;
	// Basic Registration Certificates
    private byte[] clinicalEstablishmentCertificate;
    private byte[] businessRegistrationCertificate;
    // Clinic Type: Proprietorship, Partnership, LLP, Pvt Ltd
    private String clinicType;

    // Medicines Handling
    private String medicinesSoldOnSite;  // Yes / No
    private byte[] drugLicenseCertificate; // Only if medicinesSoldOnSite is true
  
    private byte[]  drugLicenseFormType; // Form 20 or 21

    // Pharmacist info
    private String hasPharmacist; // Yes / No / NA
    private byte[] pharmacistCertificate;
 // Other Licenses
    private byte[] biomedicalWasteManagementAuth; // SPCB
    private byte[] tradeLicense; // Municipality
    private byte[] fireSafetyCertificate; // Local Fire Department
    private byte[] professionalIndemnityInsurance; // Insurance company
    private byte[] gstRegistrationCertificate;
    
    private byte[] others;
    
 // Social Media Handles
    private String instagramHandle;
    private String twitterHandle;
    private String facebookHandle;
	
	}