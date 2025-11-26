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
public class TreatmentDetailsDTO {

    private List<DatesDTO> dates;
    private String reason;
    private String frequency;
    private Integer sittings;
    private String startDate;
    private Integer totalSittings;
    private Integer takenSittings;
    private Integer pendingSittings;
    private Integer currentSitting;
    private String status;

    private String subServiceId;   // ✅ REQUIRED FOR PRICING
}
