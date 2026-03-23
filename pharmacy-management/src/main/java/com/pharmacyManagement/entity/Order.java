package com.pharmacyManagement.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "orders")
public class Order {

    @Id
    private String id;

    private String orderId; // custom ID

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

    private List<Product> products;
}