package com.dermacare.doctorservice.model;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreatmentDetails {
    private List<String> selectedTreatments;  
    private String treatmentReason;             
}
