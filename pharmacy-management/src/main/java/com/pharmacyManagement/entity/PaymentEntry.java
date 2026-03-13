package com.pharmacyManagement.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Represents a single payment installment.
 * Stored as an embedded object inside OpSales.amountToBePaid list.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentEntry {

    /** Amount paid in this installment */
    private Double amountPaid;

    /** Remaining due after this installment */
    private Double dueAmount;

    /** Timestamp when this payment was recorded */
    private LocalDateTime paidAt;
}