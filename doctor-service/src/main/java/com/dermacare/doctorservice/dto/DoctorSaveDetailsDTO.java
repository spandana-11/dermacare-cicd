package com.dermacare.doctorservice.dto;


import java.time.LocalDateTime;

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
    private TreatmentDetailsDTO treatments;
    private FollowUpDetailsDTO followUp;
    private PrescriptionDetailsDTO prescription;
}

