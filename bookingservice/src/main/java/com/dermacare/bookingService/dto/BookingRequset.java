package com.dermacare.bookingService.dto;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class BookingRequset {
	
	private String bookingId;
	private String bookingFor;
	private String relation;
	private String patientMobileNumber;
	private String visitType;
	private Integer freeFollowUps;
	private String patientAddress;
	private String patientId;
	private String name;
	private String age;
	private String gender;
	private String mobileNumber;
	private String customerId;
	private String consultationExpiration;
	private String customerDeviceId;
	private String problem;
	private String symptomsDuration;
	private String clinicId;
	private String clinicName;
	private String branchId;
	private String branchname;
	private String clinicDeviceId;
	private String doctorId;
	private String doctorName;
	private String doctorMobileDeviceId;
	private String doctorWebDeviceId;
	private String subServiceId;
	private String subServiceName;
	private String serviceDate;
	private String toatalSittings;
	private String followupDate;
	private String servicetime;
	private String consultationType;
	private double consultationFee;
	private double totalFee;
	private String paymentType;
	private List<String> attachments;
	private String consentFormPdf;
	private String doctorRefCode;
	private String bookedAt;

}
