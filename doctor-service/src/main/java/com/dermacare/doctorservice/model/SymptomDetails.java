package com.dermacare.doctorservice.model;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SymptomDetails {
    private String symptomDetails;
    private String doctorObs;
    private String diagnosis;
    private String duration;
    private String  reports;
}

