package com.clinicadmin.dto;

import java.util.List;

import com.clinicadmin.entity.Doctors;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ClinicWithDoctorsDTO {
	
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
	private List<DoctorsDTO> doctors;
	

}
