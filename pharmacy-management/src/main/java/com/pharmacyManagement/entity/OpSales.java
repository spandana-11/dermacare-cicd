package com.pharmacyManagement.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "op_sales")
public class OpSales {

    @Id
    private String id;

    @Indexed(unique = true)
    private String billNo;

    private String billDate;      // stored as "YYYY-MM-DD"
    private String billTime;      // stored as "HH:MM AM/PM"
    private String visitType;
    private String opNo;
    private String payCategory;
    private String patientName;
    private String mobile;
    private Integer age;
    private String sex;
    private String consultingDoctor;
    private Boolean includeReturns;

    private List<OpMedicine> medicines;

    // Computed summary fields
    private Double totalAmt;
    private Double avgDiscPercent;
    private Double totalDiscAmt;
    private Double totalGstAmount;
    private Double netAmount;
    private Double amountPaid;
    private Double amountToBePaid;
    private Double dueAmount;
    private Double finalTotal;

    private String clinicId;
    private String branchId;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}