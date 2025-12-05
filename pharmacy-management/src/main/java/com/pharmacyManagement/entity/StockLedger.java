package com.pharmacyManagement.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "stock_ledger")
public class StockLedger {

    @Id
    private String id;

    private String productId;
    private String productName;

    private String batchNo;
    private String expiryDate;
    private String category;

    private String transactionType; // PURCHASE, SALE, DAMAGE, ADJUSTMENT
    private String transactionId;   // invoiceId, saleId, damageId, etc.

    private int qtyIn;
    private int qtyOut;
    private int closingStock;

    private double costPrice;
    private double mrp;

    private String date; // yyyy-MM-dd
    private String time; // HH:mm:ss

    private String remarks;
}
