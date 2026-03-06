package com.pharmacyManagement.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "inventory")
public class Inventory {

    @Id
    private String inventoryId;

    private String productId;
    private String productName;

    private String batchNo;
    private String expiryDate;
    private String mfgDate;

    private double availableQty;
    private double minStock;

    private double purchaseRate;
    private double mrp;
    private double gstPercent;

    private String supplierId;
    private String clinicId;
    private String branchId;
    
}