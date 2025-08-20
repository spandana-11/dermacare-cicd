package com.dermaCare.customerService.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data 
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ClinicDTO {

    private String hospitalId;
    private String name;
    private String hospitalLogo;
    private boolean recommended;
    private double hospitalOverallRating;
    private String website;
    private String walkthrough;

}