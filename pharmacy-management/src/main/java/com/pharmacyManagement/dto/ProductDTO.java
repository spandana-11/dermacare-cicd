package com.pharmacyManagement.dto;

import lombok.Data;

@Data
public class ProductDTO {

    private String productId;
    private String productName;
    private String hsnCode;
    private String packSize;
    private int quantityRequested;
}