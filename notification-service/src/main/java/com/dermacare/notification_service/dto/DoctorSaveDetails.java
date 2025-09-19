package com.dermacare.notification_service.dto;


import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonFormat;
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
public class DoctorSaveDetails {

    private String id;
    private String patientId;
    private String doctorId;
    private String doctorName;
    private String clinicId;
    private String clinicName;
    private String bookingId;
    private LocalDateTime visitDateTime;
    private String visitType; // "FIRST_VISIT" or "REVISIT"
    private PrescriptionDetails prescription;
    private List<String> prescriptionPdf;
    
}
