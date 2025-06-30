package com.dermacare.bookingService.dto;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@JsonIgnoreProperties({"doctorDeviceId"})
public class BookingResponse {
	
	private String bookingId;
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
	private String subServiceId;
	private String subServiceName;
	private String serviceDate;
	private String servicetime;
	private String consultationType;
	private double consultationFee;
	private String channelId;
	private String reasonForCancel;
	private String notes;
	private ReportsDtoList reports;
	private String BookedAt;
	private String status;
	private double totalFee;

}
