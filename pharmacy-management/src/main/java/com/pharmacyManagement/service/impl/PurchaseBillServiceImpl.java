package com.pharmacyManagement.service.impl;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.pharmacyManagement.dto.PurchaseBillDTO;
import com.pharmacyManagement.dto.Response;
import com.pharmacyManagement.entity.PurchaseBill;
import com.pharmacyManagement.entity.PurchaseItem;
import com.pharmacyManagement.repository.PurchaseBillRepository;
import com.pharmacyManagement.service.PurchaseBillService;
import com.pharmacyManagement.util.PurchaseCalcUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PurchaseBillServiceImpl implements PurchaseBillService {

    private final PurchaseBillRepository repository;

    @Override
    public Response savePurchase(PurchaseBillDTO dto) {

        Response response = new Response();

        try {
            if (dto == null) {
                response.setSuccess(false);
                response.setMessage("Purchase Bill cannot be null");
                response.setStatus(HttpStatus.BAD_REQUEST.value());
                return response;
            }

            log.info("Saving purchase bill: {}", dto);

            PurchaseBill bill = new PurchaseBill();

            bill.setPurchaseBillNo(dto.getPurchaseBillNo());
            bill.setInvoiceNo(dto.getInvoiceNo());
            bill.setSupplierName(dto.getSupplierName());
            bill.setInvoiceDate(dto.getInvoiceDate());
            bill.setReceivingDate(dto.getReceivingDate());
            bill.setTaxType(dto.getTaxType());

            // ============================
            // ITEM CALCULATIONS
            // ============================
            List<PurchaseItem> items =
                    (dto.getMedicineDetails() == null || dto.getMedicineDetails().isEmpty())
                            ? Collections.emptyList()
                            : dto.getMedicineDetails().stream()
                                .map(i -> PurchaseCalcUtil.calculate(i, dto.getTaxType()))
                                .collect(Collectors.toList());

            bill.setMedicineDetails(items);

            // ============================
            // BASE TOTALS
            // ============================
            double totalAmount = round(items.stream()
                    .mapToDouble(PurchaseItem::getBaseAmount)
                    .sum());

            double totalDiscount = round(items.stream()
                    .mapToDouble(PurchaseItem::getDiscountAmount)
                    .sum());

            double netAmount = round(totalAmount - totalDiscount);

            // ============================
            // GST SUMMARY (IGST / CGST+SGST)
            // ============================
            double totalIGST = 0.0;
            double totalCGST = 0.0;
            double totalSGST = 0.0;

            if (dto.getTaxType().equalsIgnoreCase("IGST")) {

                totalIGST = round(items.stream()
                        .mapToDouble(PurchaseItem::getGstAmount)
                        .sum());

            } else {

                totalCGST = round(items.stream()
                        .mapToDouble(PurchaseItem::getCgstAmount)
                        .sum());

                totalSGST = round(items.stream()
                        .mapToDouble(PurchaseItem::getSgstAmount)
                        .sum());
            }

            double totalTax = round(totalIGST + totalCGST + totalSGST);
            double finalTotal = round(netAmount + totalTax);

            // SET GST VALUES
            bill.setTotalIGST(totalIGST);
            bill.setTotalCGST(totalCGST);
            bill.setTotalSGST(totalSGST);

            bill.setTotalAmount(totalAmount);
            bill.setDiscountAmountTotal(totalDiscount);
            bill.setNetAmount(netAmount);
            bill.setTotalTax(totalTax);
            bill.setFinalTotal(finalTotal);

            // ============================
            // PAYMENT DETAILS
            // ============================
            double paid = dto.getPaidAmount() != null ? dto.getPaidAmount() : 0.0;
            bill.setPaidAmount(paid);

            double previousAdj = dto.getPreviousAdjustment() != null ? dto.getPreviousAdjustment() : 0.0;
            bill.setPreviousAdjustment(previousAdj);

            double postDiscount = dto.getPostDiscount() != null ? dto.getPostDiscount() : 0.0;
            bill.setPostDiscount(postDiscount);

            double balance = round(finalTotal - paid);
            bill.setBalanceAmount(balance);

            double netPayable = round(balance - previousAdj - postDiscount);
            bill.setNetPayable(netPayable);

            // SAVE BILL
            PurchaseBill saved = repository.save(bill);

            response.setSuccess(true);
            response.setData(saved);
            response.setMessage("Purchase Bill saved successfully");
            response.setStatus(HttpStatus.OK.value());

            return response;

        } catch (Exception e) {

            log.error("Error saving purchase bill: {}", e.getMessage(), e);

            response.setSuccess(false);
            response.setMessage("Failed to save purchase bill: " + e.getMessage());
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            return response;
        }
    }

    private double round(double val) {
        return Math.round(val * 100.0) / 100.0;
    }
}
