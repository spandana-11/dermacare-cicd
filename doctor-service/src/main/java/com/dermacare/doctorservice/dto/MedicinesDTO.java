package com.dermacare.doctorservice.dto;

import java.util.ArrayList;
import java.util.List;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
