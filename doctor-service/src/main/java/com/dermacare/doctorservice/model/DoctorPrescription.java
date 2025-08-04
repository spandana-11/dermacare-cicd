package com.dermacare.doctorservice.model;


import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "DoctorPrescription")
public class DoctorPrescription {

    @Id
    private String prescriptionId;

    private List<Medicine> medicines;  
}
