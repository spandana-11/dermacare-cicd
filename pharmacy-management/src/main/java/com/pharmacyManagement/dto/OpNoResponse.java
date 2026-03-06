package com.pharmacyManagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpNoResponse {

    private String opNo;
    private String visitType;   // "existing" or "new"
    private String patientName;
    private String mobile;
    private Integer age;
    private String sex;
    private List<OpMedicineDTO> medicines;
    private String clinicId;
    private String branchId;
}