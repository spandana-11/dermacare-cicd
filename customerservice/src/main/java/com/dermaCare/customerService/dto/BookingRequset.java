package com.dermaCare.customerService.dto;

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
	private String customerDeviceId;
	private String problem;
	private String clinicId;
	private String clinicName;
	private String doctorId;
	private String doctorName;
	private String doctorDeviceId;
	private String subServiceId;
	private String subServiceName;
	private String serviceDate;
	private String servicetime;
	private String consultationType;
	private double consultationFee;
	private double totalFee;
	private String paymentType;
	private String bookedAt;

}
