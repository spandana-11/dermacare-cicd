package com.dermaCare.customerService.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubServicesDetailsDto {
	
	private String hospitalId;
	private String hospitalName;
	private String hospitalLogo;
	private boolean recommanded;
	private String serviceName;
	private String subServiceName;
	private double subServicePrice;

}
