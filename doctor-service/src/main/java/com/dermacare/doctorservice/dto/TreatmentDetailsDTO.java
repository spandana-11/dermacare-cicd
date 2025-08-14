package com.dermacare.doctorservice.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreatmentDetailsDTO {
    private List<DatesDTO> dates;
    private String reason;
    private String frequency;
    private int sittings;
    private String startDate;
}
