package com.pharmacyManagement.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderDTO {

    private String clinicId;
    private String clinicName;

    private String branchId;
    private String branchName;

    private String supplierId;
    private String supplierName;
    private String supplierEmail;
    private String status;
    private int expectedDeliveryDays;
    private String expectedDeliveryDate;

    private List<ProductDTO> products;
}