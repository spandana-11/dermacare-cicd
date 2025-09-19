package com.dermacare.notification_service.dto;
import java.util.List;
import java.util.UUID;

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
public class Medicines {

    private String name;
    private String dose;
    private String duration;
    private String food;
    private String medicineType;
    private String note;
    private String remindWhen;
    private String others;
   
    private List<String> times;
}

