package com.dermacare.doctorservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"notes","reports"})
@JsonInclude(JsonInclude.Include.NON_EMPTY)
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
	private String doctorDeviceId;
	private String subServiceId;
	private String subServiceName;
	private String serviceDate;
	private String servicetime;
	private String reasonForCancel;
	private String consultationType;
	private double consultationFee;
	private String notes;
	private String BookedAt;
	private String status;
	private double totalFee;

}
