package com.AdminService.dto;

import java.util.List;

import org.hibernate.validator.constraints.URL;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
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
    private String hospitalLogo;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String emailAddress;

   // @URL(message = "Invalid website URL")
    private String website;

    @NotBlank(message = "License number is required")
    private String licenseNumber;

    @NotBlank(message = "Issuing authority is required")
    private String issuingAuthority;

    @NotNull(message = "Contractor documents must not be null")
    private List<String> contractorDocuments;

    @NotNull(message = "Hospital documents must not be null")
    private List<String> hospitalDocuments;

    private boolean recommended;

    // Registration Certificates
    private String clinicalEstablishmentCertificate;
    private String businessRegistrationCertificate;

    // Clinic Type Info
    @NotBlank(message = "Clinic type is required")
    private String clinicType; // Proprietorship, Partnership, LLP, Pvt Ltd

    // Medicines Handling
    private String medicinesSoldOnSite;
    private String drugLicenseCertificate; // Base64
    private String drugLicenseFormType; // Form 20 or 21

    // Pharmacist Info
    private String hasPharmacist; // Yes/No/NA
    private String pharmacistCertificate; // Base64

    // Other Licenses
    private String biomedicalWasteManagementAuth; // SPCB
    private String tradeLicense; // Municipality
    private String fireSafetyCertificate; // Fire Dept
    private String professionalIndemnityInsurance; // Insurance
    private String gstRegistrationCertificate;

    // Optional Certifications
    private String others; // NABH/Aesthetic procedure training (optional, can be a combined doc)

    // Social Media
    private String instagramHandle;
    private String twitterHandle;
    private String facebookHandle;
}