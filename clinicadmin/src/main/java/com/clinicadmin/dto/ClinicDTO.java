package com.clinicadmin.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ClinicDTO {

	private String hospitalId; // MongoDB uses String as the default ID type
	private String name;
	private String address;
	private String city;
	private String contactNumber;
	private double hospitalOverallRating;
	private String hospitalRegistrations;
	private String openingTime;
	private String closingTime;
	private String hospitalLogo;
	private String emailAddress;
	private String website;
	private String licenseNumber;
	private String issuingAuthority;
	private List<String> hospitalDocuments;
	private List<String> contractorDocuments;
	 private boolean recommended;
	

}
