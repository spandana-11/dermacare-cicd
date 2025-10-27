package com.dermacare.bookingService.dto;

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
public class TreatmentResponseDTO {
    private List<String> selectedTestTreatment;
    private Map<String, TreatmentDetailsDTO> generatedData; // dynamic treatment names
    private String followupStatus;
    private Integer totalSittings;
    private Integer pendingSittings;
    private Integer takenSittings;
    private Integer currentSitting;
}
