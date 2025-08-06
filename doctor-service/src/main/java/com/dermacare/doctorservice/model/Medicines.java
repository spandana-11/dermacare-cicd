package com.dermacare.doctorservice.model;




import lombok.*;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medicines {
    private UUID id = UUID.randomUUID();
    private String name;
    private String dose;
    private String duration;
    private String food;
    
    private String note;
    private String remindWhen;
    private List<String> times;
}

