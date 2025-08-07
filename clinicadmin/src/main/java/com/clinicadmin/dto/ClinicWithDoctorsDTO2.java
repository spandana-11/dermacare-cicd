package com.clinicadmin.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ClinicWithDoctorsDTO2 {

	private String hospitalId; // MongoDB uses String as the default ID type
	private String name;
	private String address;
	private String city;
	private String contactNumber;
	private double hospitalOverallRating;
//	private String hospitalRegistrations;
	private String openingTime;
	private String closingTime;
	private String hospitalLogo;
	private String emailAddress;
	private String website;
	private String licenseNumber;
	private String issuingAuthority;
	private String hospitalDocuments;
	private String contractorDocuments;
	private boolean recommended;
	private DoctorsDTO doctors;

}
