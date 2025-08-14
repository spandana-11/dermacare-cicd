package com.dermacare.doctorservice.model;


import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreatmentResponse {
    private List<String> selectedTestTreatment;
    private Map<String, TreatmentDetails> generatedData; 
}
