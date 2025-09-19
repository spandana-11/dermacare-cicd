package com.dermacare.doctorservice.dto;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class BookingResponse {
	
	private String bookingId;
	private String bookingFor;
	private String name;
	private String relation;
	private String patientMobileNumber;
	private String patientId;
	private String visitType;
	private Integer freeFollowUpsLeft;
	private Integer freeFollowUps;
	private String patientAddress;
	private String age;
	private String gender;
	private String mobileNumber;
	private String consultationExpiration;
	private String customerDeviceId;
	private String problem;
	private String symptomsDuration;
	private String clinicId;
	private String clinicDeviceId;
	private String clinicName;
	private String doctorId;
	private String doctorName;
	private String doctorMobileDeviceId;
	private String doctorWebDeviceId;
	private String subServiceId;
	private String subServiceName;
	private String serviceDate;
	private String servicetime;
	private String consultationType;
	private double consultationFee;
	private Integer visitCount;
	private String channelId;
	private String reasonForCancel;
	private String notes;
	private ReportsDtoList reports;
	private String BookedAt;
	private String status;
	private double totalFee;
	private List<String> attachments;
	private String consentFormPdf;
	private String paymentType;

}