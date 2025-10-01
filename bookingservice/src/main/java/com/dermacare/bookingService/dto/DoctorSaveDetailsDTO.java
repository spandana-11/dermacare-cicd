package com.dermacare.bookingService.dto;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class DoctorSaveDetailsDTO {

	private TreatmentResponseDTO treatments;
	private FollowUpDetailsDTO followUp;
    private List<String> prescriptionPdf;
}

