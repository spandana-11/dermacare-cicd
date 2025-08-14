package com.dermacare.doctorservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VitalsDTO {

	private String id;
	private String patientId;
	private String height;
	private double weight;
	private String bloodPressure;
	private String temperature;
	private String bmi;
}
