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
    private Integer sittings;        // remaining sittings
    private String startDate;
    private Integer totalSittings;   // total planned sittings

    // ✅ Sitting summary-fields
    private Integer pendingSittings; // totalSittings - completed
    private Integer takenSittings;   // completed sittings
    private Integer currentSitting;  // last completed sitting number

    // ✅ New fields for enrichment (sub-service details)
    private Double price;            // base cost of treatment
    private Double gst;              // GST percentage or amount
    private Double discountedCost;   // discounted cost (after offers)
    private String description;      // treatment/service description
    private String consentFormType;  // 0 = none, 1 = consent form required, etc.
}
