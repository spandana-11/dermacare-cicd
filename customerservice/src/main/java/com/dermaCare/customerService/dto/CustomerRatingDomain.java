package com.dermaCare.customerService.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRatingDomain {
	    
	private double doctorRating;
    private double hospitalRating;
    private String feedback;
    private String hospitalId;
    private String doctorId; 
    private String customerMobileNumber;
    private String appointmentId;
    private boolean rated;
    private String dateAndTimeAtRating;
	   
}
