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

	private String id;
	private String patientId;
	private String doctorId;
	private String doctorName;
	private String clinicId;
	private String clinicName;
	private String customerId;
	private String bookingId;
	private String subServiceId;
	//private LocalDateTime visitDateTime;
	private String visitType;
	private int visitCount; 
	private TreatmentResponseDTO treatments;
	private FollowUpDetailsDTO followUp;
	private List<String> prescriptionPdf;
//	private LocalDateTime consultationStartDate;
//    private LocalDateTime consultationExpiryDate;
//  private int visitNumber;
}
