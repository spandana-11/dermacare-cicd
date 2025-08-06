package com.dermacare.doctorservice.dto;


import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SymptomDetailsDTO {
	 private String symptomDetails;
	    private String doctorObs;
	    private String diagnosis;
	    private String duration;
}
