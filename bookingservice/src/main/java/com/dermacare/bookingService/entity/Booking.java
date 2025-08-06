package com.dermacare.bookingService.entity;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "Appointments")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Booking  {
	@Id
	private String bookingId;
	private String bookingFor;
	private String relation;
	private String patientMobileNumber;
	private String patientId;
	private String visitType;
	private String name;
	private String age;
	private String gender;
	private String mobileNumber;
	private String customerDeviceId;
	private String problem;
	private String symptomsDuration;
	private String clinicId;
	private String clinicName;
	private String clinicDeviceId;
	private String doctorId;
	private String doctorName;
	private String doctorDeviceId;
	private String doctorWebDeviceId;
	private String subServiceId;
	private String subServiceName;
	private String serviceDate;
	private String servicetime;
	private String consultationType;
	private double consultationFee;
	private String reasonForCancel;
	private String notes;
	private ReportsList reports;
	private String channelId;
	private String BookedAt;
	private String status;
	private int clinicVisitCount;
	private List<byte[]> attachments;
	private double totalFee;
	private String consultationExpiration;
}
