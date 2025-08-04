package com.dermacare.doctorservice.model;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Medicine {
    private String id = UUID.randomUUID().toString(); 
    private String name;
    private String dose;
    private String duration;
    private String note;
    private String remindWhen;
    private List<String> times;
}
