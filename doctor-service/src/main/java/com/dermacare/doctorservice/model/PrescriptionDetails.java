package com.dermacare.doctorservice.model;




import lombok.*;

import java.util.List;
import java.util.UUID;



@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionDetails {

    private List<Medicines> medicines;
    
  }

