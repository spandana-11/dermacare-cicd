package com.dermacare.doctorservice.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DoctorPrescriptionDTO {
	
   
    private String id; 
    private String clinicId;
    private List<MedicineDTO> medicines;  
}
