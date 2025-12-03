package com.pharmacyManagement.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Data
@Document(collection = "purchase_bills")
public class PurchaseBill {

    @Id
    private String id;
    private String date;
    private String time;
    private String purchaseBillNo;
    private String invoiceNo;
    private String supplierName;
    private String invoiceDate;
    private String receivingDate;
    

    private String taxType; // IGST / CGST-SGST

    private List<PurchaseItem> medicineDetails;

    private double totalAmount;
    private double discountPercentage;
    private double discountAmountTotal;
    private double netAmount;

    private double totalIGST;
    private double totalCGST;
    private double totalSGST;

    private double totalTax;
    private double finalTotal;

    private double paidAmount;
    private double balanceAmount;

    private double previousAdjustment;
    private double postDiscount;
    private double netPayable;
    
    private String paymentMode;
    private String billDueDate;
    private String creditDays;
    private String duePaidBillNo;
    private String department;
    private String financialYear;
}
