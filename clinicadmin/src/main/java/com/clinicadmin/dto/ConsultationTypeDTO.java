package com.clinicadmin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConsultationTypeDTO {
	private int inClinic;
	private int videoOrOnline;
	private int serviceAndTreatments;
	

}