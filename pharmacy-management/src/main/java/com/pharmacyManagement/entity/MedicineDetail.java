package com.pharmacyManagement.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "medicine_details")
public class MedicineDetail {

    @Id
    private String id;

    private String productName;
    private String batchNo;
    private String expDate;

    private int quantity;
    private int packSize;
    private int free;

    private double gstPercent;
    private double cgstPercent;
    private double sgstPercent;
    private double costPrice;
    private double mrp;
    private double discPercent;
}
