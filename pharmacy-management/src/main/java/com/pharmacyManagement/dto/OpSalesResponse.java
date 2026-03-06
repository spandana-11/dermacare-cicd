package com.pharmacyManagement.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
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
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OpSalesResponse {

    // ── Identity ─────────────────────────────────────────────────────────

    @NotBlank(message = "ID must not be blank")
    private String id;

    @NotBlank(message = "Bill number is required")
    @Size(max = 50, message = "Bill number must not exceed 50 characters")
    private String billNo;

    @NotBlank(message = "Bill date is required")
    @Pattern(
        regexp = "^\\d{4}-\\d{2}-\\d{2}$",
        message = "Bill date must be in format YYYY-MM-DD"
    )
    private String billDate;

    @NotBlank(message = "Bill time is required")
    @Pattern(
        regexp = "^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$",
        message = "Bill time must be in format HH:MM AM/PM (e.g. 02:22 PM)"
    )
    private String billTime;

    @NotBlank(message = "Visit type is required")
    @Pattern(
        regexp = "^Out Patient \\(Manual\\)$",
        message = "Visit type must be 'Out Patient (Manual)'"
    )
    private String visitType;

    // ── Patient Info ──────────────────────────────────────────────────────

    @Size(max = 30, message = "OP number must not exceed 30 characters")
    private String opNo;

    @NotBlank(message = "Pay category is required")
    @Size(max = 50, message = "Pay category must not exceed 50 characters")
    private String payCategory;

    @NotBlank(message = "Patient name is required")
    @Size(min = 2, max = 100, message = "Patient name must be between 2 and 100 characters")
    @Pattern(
        regexp = "^[a-zA-Z\\s.'-]+$",
        message = "Patient name must contain only letters, spaces, dots, apostrophes or hyphens"
    )
    private String patientName;

    @NotBlank(message = "Mobile number is required")
    @Pattern(
        regexp = "^[6-9]\\d{9}$",
        message = "Mobile number must be a valid 10-digit Indian mobile number starting with 6-9"
    )
    private String mobile;

    @NotNull(message = "Age is required")
    @Min(value = 0,   message = "Age must be 0 or greater")
    @Max(value = 150, message = "Age must be 150 or less")
    private Integer age;

    @NotBlank(message = "Sex is required")
    @Pattern(
        regexp = "^(Male|Female|Other)$",
        message = "Sex must be Male, Female, or Other"
    )
    private String sex;

    @Size(max = 100, message = "Consulting doctor name must not exceed 100 characters")
    private String consultingDoctor;

    @NotNull(message = "includeReturns flag is required")
    private Boolean includeReturns;

    // ── Medicines ─────────────────────────────────────────────────────────

    @NotNull(message = "Medicines list is required")
    @Size(min = 1, message = "At least one medicine is required")
    @Valid  // triggers validation on each OpMedicineDTO inside the list
    private List<OpMedicineDTO> medicines;

    // ── Computed Financial Summary ────────────────────────────────────────

    @NotNull(message = "Total amount is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Total amount must be 0 or greater")
    @Digits(integer = 10, fraction = 2, message = "Total amount must have at most 2 decimal places")
    private Double totalAmt;           // Sum of all medicine totalA

    @NotNull(message = "Average discount percent is required")
    @DecimalMin(value = "0.0",   inclusive = true, message = "Avg discount percent must be 0 or greater")
    @DecimalMax(value = "100.0", inclusive = true, message = "Avg discount percent must not exceed 100")
    @Digits(integer = 5, fraction = 2, message = "Avg discount percent must have at most 2 decimal places")
    private Double avgDiscPercent;     // Average discount % across all medicines

    @NotNull(message = "Total discount amount is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Total discount amount must be 0 or greater")
    @Digits(integer = 10, fraction = 2, message = "Total discount amount must have at most 2 decimal places")
    private Double totalDiscAmt;       // Sum of all discAmtB (absolute)

    @NotNull(message = "Total GST amount is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Total GST amount must be 0 or greater")
    @Digits(integer = 10, fraction = 2, message = "Total GST amount must have at most 2 decimal places")
    private Double totalGstAmount;     // Sum of all gstAmtC

    @NotNull(message = "Net amount is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Net amount must be 0 or greater")
    @Digits(integer = 10, fraction = 2, message = "Net amount must have at most 2 decimal places")
    private Double netAmount;          // totalAmt - totalDiscAmt

    @NotNull(message = "Amount paid is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Amount paid must be 0 or greater")
    @Digits(integer = 10, fraction = 2, message = "Amount paid must have at most 2 decimal places")
    private Double amountPaid;         // Paid by patient

    @NotNull(message = "Amount to be paid is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Amount to be paid must be 0 or greater")
    @Digits(integer = 10, fraction = 2, message = "Amount to be paid must have at most 2 decimal places")
    private Double amountToBePaid;     // 0 if fully paid

    @NotNull(message = "Due amount is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Due amount must be 0 or greater")
    @Digits(integer = 10, fraction = 2, message = "Due amount must have at most 2 decimal places")
    private Double dueAmount;          // 0 if fully paid

    @NotNull(message = "Final total is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Final total must be 0 or greater")
    @Digits(integer = 10, fraction = 2, message = "Final total must have at most 2 decimal places")
    private Double finalTotal;         // Sum of all finalAmountABC

    // ── Clinic Info ───────────────────────────────────────────────────────

    @NotBlank(message = "Clinic ID is required")
    @Size(max = 50, message = "Clinic ID must not exceed 50 characters")
    private String clinicId;

    @NotBlank(message = "Branch ID is required")
    @Size(max = 50, message = "Branch ID must not exceed 50 characters")
    private String branchId;

    // ── Audit Timestamps ──────────────────────────────────────────────────

    @NotNull(message = "Created date is required")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;   // null on first create — hidden by @JsonInclude(NON_NULL)
}
