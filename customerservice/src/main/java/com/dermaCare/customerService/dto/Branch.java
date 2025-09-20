package com.dermaCare.customerService.dto;

import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.google.gson.annotations.JsonAdapter;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class Branch {
	private String clinicId;
	private String branchId;	
	private String branchName;
	private String address;
	private String city;
	private String contactNumber;
	private String email;
	private String latitude;
	private String longitude;
	private String virtualClinicTour;
	private String role; 
	private double branchOverallRating;
	private Map<String, List<String>> permissions;
}
