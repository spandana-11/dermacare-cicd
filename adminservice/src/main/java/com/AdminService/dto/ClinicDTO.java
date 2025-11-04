package com.AdminService.dto;

import java.util.List;
import java.util.Map;

import com.AdminService.entity.Branch;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClinicDTO {

	private String hospitalId;

	@NotBlank(message = "Hospital name is required")
	private String name;

	@NotBlank(message = "Address is required")
	private String address;

	@NotBlank(message = "City is required")
	private String city;

	private double hospitalOverallRating;

	@NotBlank(message = "Contact number is required")
	@Pattern(regexp = "^[0-9]{10}$", message = "Contact number must be 10 digits")
	private String contactNumber;

	@NotBlank(message = "Opening time is required")
	private String openingTime;

	@NotBlank(message = "Closing time is required")
	private String closingTime;

	@NotBlank(message = "Hospital logo (Base64) is required")
	@Size(max = 250, message = "Hospital logo must not exceed 250 characters")
	private String hospitalLogo;

	@NotBlank(message = "Email is required")
	@Email(message = "Invalid email format")
	private String emailAddress;

	private String website;

	@NotBlank(message = "License number is required")
	@Size(max = 250, message = "License number must not exceed 250 characters")
	private String licenseNumber;

	@NotBlank(message = "Issuing authority is required")
	@Size(max = 250, message = "Issuing authority must not exceed 250 characters")
	private String issuingAuthority;

	@NotNull(message = "Contractor documents must not be null")
	@Size(max = 250, message = "Contractor documents must not exceed 250 characters")
	private String contractorDocuments;

	@NotNull(message = "Hospital documents must not be null")
	@Size(max = 250, message = "Hospital documents must not exceed 250 characters")
	private String hospitalDocuments;

	private boolean recommended;

	@Size(max = 250, message = "Clinical establishment certificate must not exceed 250 characters")
	private String clinicalEstablishmentCertificate;

	@Size(max = 250, message = "Business registration certificate must not exceed 250 characters")
	private String businessRegistrationCertificate;

	@NotBlank(message = "Clinic type is required")
	private String clinicType; // Proprietorship, Partnership, LLP, Pvt Ltd

	@Size(max = 250, message = "Medicines sold on site must not exceed 250 characters")
	private String medicinesSoldOnSite;

	@Size(max = 250, message = "Drug license certificate must not exceed 250 characters")
	private String drugLicenseCertificate;

	@Size(max = 250, message = "Drug license form type must not exceed 250 characters")
	private String drugLicenseFormType;

	@Size(max = 250, message = "Pharmacist status must not exceed 250 characters")
	private String hasPharmacist;

	@Size(max = 250, message = "Pharmacist certificate must not exceed 250 characters")
	private String pharmacistCertificate;

	@Size(max = 250, message = "Biomedical waste management authorization must not exceed 250 characters")
	private String biomedicalWasteManagementAuth;

	@Size(max = 250, message = "Trade license must not exceed 250 characters")
	private String tradeLicense;

	@Size(max = 250, message = "Fire safety certificate must not exceed 250 characters")
	private String fireSafetyCertificate;

	@Size(max = 250, message = "Professional indemnity insurance must not exceed 250 characters")
	private String professionalIndemnityInsurance;

	@Size(max = 250, message = "GST registration certificate must not exceed 250 characters")
	private String gstRegistrationCertificate;

	@NotBlank(message = "Consultation expiration is required")
	private String consultationExpiration;

	private String subscription;

	@NotNull(message = "'Others' documents must not be null")
	private List<@Size(max = 250, message = "Each 'other' document must not exceed 250 characters") String> others;

	@Min(value = 0, message = "freeFollowUps must be zero or positive")
	private int freeFollowUps = 0;

	private double latitude;
	private double longitude;
	private int nabhScore;
	private String branch;

	@Size(max = 250, message = "Walkthrough URL must not exceed 250 characters")
	private String walkthrough;

	private List<Branch> branches;

	private String role;  
	private Map<String, List<String>> permissions;

	@Size(max = 250, message = "Instagram handle must not exceed 250 characters")
	private String instagramHandle;

	@Size(max = 250, message = "Twitter handle must not exceed 250 characters")
	private String twitterHandle;

	@Size(max = 250, message = "Facebook handle must not exceed 250 characters")
	private String facebookHandle;
}