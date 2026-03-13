package com.pharmacyManagement.dto;

import com.pharmacyManagement.entity.PaymentEntry;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpSalesResponse {

    @NotBlank(message = "ID is required")
    private String id;

    @NotBlank(message = "Bill number is required")
    private String billNo;

    @NotBlank(message = "Bill date is required")
    @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "Bill date must be in YYYY-MM-DD format")
    private String billDate;

    @NotBlank(message = "Bill time is required")
    @Pattern(regexp = "\\d{2}:\\d{2} (AM|PM)", message = "Bill time must be in HH:MM AM/PM format")
    private String billTime;

    private String visitType;

    private String opNo;

    private String payCategory;

    @NotBlank(message = "Patient name is required")
    @Size(min = 2, max = 100, message = "Patient name must be between 2 and 100 characters")
    private String patientName;

    @Pattern(regexp = "\\d{10}", message = "Mobile number must be exactly 10 digits")
    private String mobile;

    @Min(value = 0, message = "Age must be 0 or above")
    @Max(value = 150, message = "Age must be 150 or below")
    private Integer age;

    private String sex;

    private String consultingDoctor;

    private Boolean includeReturns;

    @NotEmpty(message = "At least one medicine is required")
    @Valid
    private List<OpMedicineDTO> medicines;

    // ── Summary fields ────────────────────────────────────────────────────────

    @NotNull(message = "Total amount is required")
    @DecimalMin(value = "0.0", message = "Total amount must be 0 or above")
    @Digits(integer = 10, fraction = 2, message = "Total amount must have at most 2 decimal places")
    private Double totalAmt;

    @DecimalMin(value = "0.0", message = "Average discount percent must be 0 or above")
    @DecimalMax(value = "100.0", message = "Average discount percent must be 100 or below")
    @Digits(integer = 3, fraction = 2, message = "Average discount percent must have at most 2 decimal places")
    private Double avgDiscPercent;

    @DecimalMin(value = "0.0", message = "Total discount amount must be 0 or above")
    @Digits(integer = 10, fraction = 2, message = "Total discount amount must have at most 2 decimal places")
    private Double totalDiscAmt;

    @DecimalMin(value = "0.0", message = "Total GST amount must be 0 or above")
    @Digits(integer = 10, fraction = 2, message = "Total GST amount must have at most 2 decimal places")
    private Double totalGstAmount;

    @DecimalMin(value = "0.0", message = "Net amount must be 0 or above")
    @Digits(integer = 10, fraction = 2, message = "Net amount must have at most 2 decimal places")
    private Double netAmount;

    @NotNull(message = "Amount paid is required")
    @DecimalMin(value = "0.0", message = "Amount paid must be 0 or above")
    @Digits(integer = 10, fraction = 2, message = "Amount paid must have at most 2 decimal places")
    private Double amountPaid;             // cumulative paid so far

    @Valid
    private List<PaymentEntry> amountToBePaid;   // payment history list

    @NotNull(message = "Due amount is required")
    @DecimalMin(value = "0.0", message = "Due amount must be 0 or above")
    @Digits(integer = 10, fraction = 2, message = "Due amount must have at most 2 decimal places")
    private Double dueAmount;              // current outstanding balance

    @NotNull(message = "Final total is required")
    @DecimalMin(value = "0.0", message = "Final total must be 0 or above")
    @Digits(integer = 10, fraction = 2, message = "Final total must have at most 2 decimal places")
    private Double finalTotal;

    // ── Identifiers ───────────────────────────────────────────────────────────

    @NotBlank(message = "Clinic ID is required")
    private String clinicId;

    @NotBlank(message = "Branch ID is required")
    private String branchId;

    @NotNull(message = "Created date is required")
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}