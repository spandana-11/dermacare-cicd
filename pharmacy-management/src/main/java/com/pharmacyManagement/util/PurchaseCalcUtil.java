package com.pharmacyManagement.util;

import com.pharmacyManagement.dto.PurchaseItemDTO;
import com.pharmacyManagement.entity.PurchaseItem;

public class PurchaseCalcUtil {

    public static PurchaseItem calculate(PurchaseItemDTO dto, String taxType) {

        PurchaseItem item = new PurchaseItem();

        item.setProductName(dto.getProductName());
        item.setBatchNo(dto.getBatchNo());
        item.setExpiryDate(dto.getExpiryDate());
        item.setQuantity(dto.getQuantity());
        item.setCostPrice(dto.getCostPrice());
        item.setMrp(dto.getMrp());
        item.setDiscountPercent(dto.getDiscountPercent());
        item.setGstPercent(dto.getGstPercent());

        // Base Amount = quantity * cost price
        double base = dto.getQuantity() * dto.getCostPrice();
        item.setBaseAmount(base);

        // Discount amount
        double discountAmt = base * (dto.getDiscountPercent() / 100.0);
        item.setDiscountAmount(discountAmt);

        // Price after discount
        double afterDiscount = base - discountAmt;

        double gstPercent = dto.getGstPercent();

        // ===========================
        //      IGST Calculation
        // ===========================
        if (taxType.equalsIgnoreCase("IGST")) {

            double igst = afterDiscount * (gstPercent / 100.0);

            item.setGstAmount(igst);
            item.setCgstAmount(0.0);
            item.setSgstAmount(0.0);

            item.setLineTotal(round(afterDiscount + igst));

        } 
        // ===========================
        //   Local Supplier (CGST + SGST)
        // ===========================
        else {

            double totalGst = afterDiscount * (gstPercent / 100.0);

            double cgst = totalGst / 2.0;
            double sgst = totalGst / 2.0;

            item.setGstAmount(totalGst);
            item.setCgstAmount(cgst);
            item.setSgstAmount(sgst);

            item.setLineTotal(round(afterDiscount + cgst + sgst));
        }

        return item;
    }

    private static double round(double value) {
        return Math.round(value * 100.0) / 100.0; // 2 decimals
    }
}
