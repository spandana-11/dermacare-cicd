package com.dermacare.doctorservice.model;

import java.util.List;



import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TreatmentDetails {
	 private List<Dates> dates;
	    private String reason;
	    private String frequency;
	    private Integer sittings;
	    private String startDate;
	    private Integer totalSittings;
}
