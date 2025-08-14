package com.dermacare.doctorservice.dto;


import java.time.LocalDateTime;
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
    private String bookingId;
    private LocalDateTime visitDateTime;
    private String visitType; 
    private SymptomDetailsDTO symptoms;
    private TestDetailsDTO tests;
    private TreatmentResponseDTO treatments;
    private FollowUpDetailsDTO followUp;
    private PrescriptionDetailsDTO prescription;
    private List<String> prescriptionPdf;
}

