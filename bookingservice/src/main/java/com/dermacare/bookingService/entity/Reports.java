package com.dermacare.bookingService.entity;


import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Reports {

	private String bookingId;
	private String customerMobileNumber;
	private String reportName;
	private String reportDate;
	private String reportStatus;
	private String reportType;
	private List<byte[]> reportFile; 

}