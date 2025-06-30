package com.AdminService.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingRequset {
	
	private String bookingFor;
	private String name;
	private String age;
	private String gender;
	private String mobileNumber;
	private String problem;
	private String servicename;
	private String serviceId;
	private String doctorId;
	private String serviceDate;
	private String servicetime;
	private String consultationType;
	private double serviceCost;
	private double consultattionFee;

}
