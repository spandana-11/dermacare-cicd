package com.dermacare.doctorservice.dto;


import java.time.LocalDateTime;

import com.dermacare.doctorservice.model.FollowUpDetails;
import com.dermacare.doctorservice.model.PrescriptionDetails;
import com.dermacare.doctorservice.model.SymptomDetails;
import com.dermacare.doctorservice.model.TestDetails;
import com.dermacare.doctorservice.model.TreatmentDetails;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
    private SymptomDetails symptoms;
    private TestDetails tests;
    private TreatmentDetails treatments;
    private FollowUpDetails followUp;
    private PrescriptionDetails prescription;
}

