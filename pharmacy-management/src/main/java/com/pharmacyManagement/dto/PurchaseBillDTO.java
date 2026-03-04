package com.pharmacyManagement.dto;

import java.util.List;

import com.pharmacyManagement.entity.PurchaseItem;

import lombok.Data;

@Data
public class PurchaseBillDTO {

    private String purchaseBillNo;
    private String invoiceNo;
    private String financialYear;

    private Dates dates;
    private TaxDetails taxDetails;
    private SupplierDTO supplierDetails;
    private PaymentDetails paymentDetails;

    private List<PurchaseItem> items;
}