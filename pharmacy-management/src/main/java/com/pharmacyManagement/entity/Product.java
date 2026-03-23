package com.pharmacyManagement.entity;

import lombok.Data;

@Data
public class Product {

    private String productId;
    private String productName;
    private String hsnCode;
    private String packSize;
    private int quantityRequested;
}