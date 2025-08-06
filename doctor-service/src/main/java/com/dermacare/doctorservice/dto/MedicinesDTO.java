package com.dermacare.doctorservice.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicinesDTO {
    private String id;
    private String name;
    private String dose;
    private String duration;
    private String food;
    private String note;
    private String remindWhen;
    private List<String> times;
}
