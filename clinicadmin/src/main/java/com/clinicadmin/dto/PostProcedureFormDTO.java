package com.clinicadmin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class PostProcedureFormDTO {

    private String id;
    private String hospitalId;
    private String subServiceId;
    private String subServiceName;
    private String serviceId;
    private String serviceName;
    private String categoryId;
    private String categoryName;
    private String procedureName;
    private String totalDuration;
    private String description;
}
