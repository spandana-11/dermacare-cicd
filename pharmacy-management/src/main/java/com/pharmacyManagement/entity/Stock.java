	package com.pharmacyManagement.entity;
	
	import org.springframework.data.annotation.Id;
	import org.springframework.data.mongodb.core.mapping.Document;
	
	import lombok.AllArgsConstructor;
	import lombok.Data;
	import lombok.NoArgsConstructor;
	
	@Data
	@AllArgsConstructor
	@NoArgsConstructor
	@Document(collection = "stock")
	public class Stock {
	
	    @Id
	    private String id;
	
	    private String productId;
	    private String productName;
	
	    private String batchNo;
	    private String expiryDate;
	    private String category;
	    private int openingStock;
	    private int stockIn;
	    private int stockOut;
	    private int damageStock;
	    private int closingStock;
	
	    private double costPrice;
	    private double mrp;
	    private double gstPercent;
	
	    private String lastPurchaseDate;
//	    private String supplierId;
	    private String supplierName;
	
	    private String status = "Active";
	}
