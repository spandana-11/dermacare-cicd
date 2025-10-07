package com.AdminService.dto;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class BranchDTO {
	private String clinicId;
	private String hospitalName;
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
