package com.clinicadmin.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RatingsDTO {
	private String doctorId;;
	private String hospitalId;
	private double overallDoctorRating;
	private double overallHospitalRating;
	private List<CustomerRatingDomain> comments;
}
