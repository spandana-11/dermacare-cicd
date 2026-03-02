package com.pharmacyManagement.service.impl;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.pharmacyManagement.dto.PurchaseBillDTO;
import com.pharmacyManagement.dto.PurchaseItemDTO;
import com.pharmacyManagement.dto.Response;
import com.pharmacyManagement.dto.StockDTO;
import com.pharmacyManagement.entity.PurchaseBill;
import com.pharmacyManagement.entity.PurchaseItem;
import com.pharmacyManagement.repository.PurchaseBillRepository;
import com.pharmacyManagement.repository.StockRepository;
import com.pharmacyManagement.service.PurchaseBillService;
import com.pharmacyManagement.service.StockLedgerService;
import com.pharmacyManagement.util.PurchaseCalcUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PurchaseBillServiceImpl implements PurchaseBillService {

    private final PurchaseBillRepository repository;
    private final StockLedgerService stockLedgerService;
    private final StockRepository stockRepo; // only for read operations if needed

    // ----------------- HELPER -----------------
    private Response buildResponse(boolean success, Object data, String message, int status) {
        Response r = new Response();
        r.setSuccess(success);
        r.setData(data);
        r.setMessage(message);
        r.setStatus(status);
        return r;
    }

    private double round(double val) {
        return Math.round(val * 100.0) / 100.0;
    }

    // ----------------- SAVE PURCHASE -----------------
    @Override
    public Response savePurchase(PurchaseBillDTO dto) {
        try {
            if (dto == null) {
                return buildResponse(false, null, "Purchase Bill cannot be null", HttpStatus.BAD_REQUEST.value());
            }

            log.info("Saving purchase bill: {}", dto);

            PurchaseBill bill = new PurchaseBill();
            if (dto.getId() != null && !dto.getId().trim().isEmpty()) {
                bill.setId(dto.getId());
            }

            bill.setDate(dto.getDate());
            bill.setTime(dto.getTime());
            bill.setPurchaseBillNo(dto.getPurchaseBillNo());
            bill.setInvoiceNo(dto.getInvoiceNo());
            bill.setSupplierName(dto.getSupplierName());
            bill.setInvoiceDate(dto.getInvoiceDate());
            bill.setReceivingDate(dto.getReceivingDate());
            bill.setTaxType(dto.getTaxType());
            bill.setPaymentMode(dto.getPaymentMode());
            bill.setBillDueDate(dto.getBillDueDate());
            bill.setCreditDays(dto.getCreditDays());
            bill.setDuePaidBillNo(dto.getDuePaidBillNo());
            bill.setDepartment(dto.getDepartment());
            bill.setFinancialYear(dto.getFinancialYear());

            // ITEM CALCULATIONS
            List<PurchaseItem> items = (dto.getMedicineDetails() == null || dto.getMedicineDetails().isEmpty())
                    ? Collections.emptyList()
                    : dto.getMedicineDetails().stream()
                            .map(i -> PurchaseCalcUtil.calculate(i, dto.getTaxType()))
                            .collect(Collectors.toList());
            bill.setMedicineDetails(items);

            // BASE TOTALS
            double totalAmount = round(items.stream().mapToDouble(PurchaseItem::getBaseAmount).sum());
            double totalDiscount = round(items.stream().mapToDouble(PurchaseItem::getDiscountAmount).sum());
            double netAmount = round(totalAmount - totalDiscount);
            double discountPercentage = totalAmount > 0 ? round((totalDiscount / totalAmount) * 100) : 0.0;
            bill.setDiscountPercentage(discountPercentage);

            // GST SUMMARY
            double totalIGST = 0.0, totalCGST = 0.0, totalSGST = 0.0;
            if ("IGST".equalsIgnoreCase(dto.getTaxType())) {
                totalIGST = round(items.stream().mapToDouble(PurchaseItem::getGstAmount).sum());
            } else {
                totalCGST = round(items.stream().mapToDouble(PurchaseItem::getCgstAmount).sum());
                totalSGST = round(items.stream().mapToDouble(PurchaseItem::getSgstAmount).sum());
            }

            double totalTax = round(totalIGST + totalCGST + totalSGST);
            double finalTotal = round(netAmount + totalTax);

            bill.setTotalIGST(totalIGST);
            bill.setTotalCGST(totalCGST);
            bill.setTotalSGST(totalSGST);
            bill.setTotalAmount(totalAmount);
            bill.setDiscountAmountTotal(totalDiscount);
            bill.setNetAmount(netAmount);
            bill.setTotalTax(totalTax);
            bill.setFinalTotal(finalTotal);

            // PAYMENT DETAILS
            double paid = dto.getPaidAmount() != null ? dto.getPaidAmount() : 0.0;
            double previousAdj = dto.getPreviousAdjustment() != null ? dto.getPreviousAdjustment() : 0.0;
            double postDiscount = dto.getPostDiscount() != null ? dto.getPostDiscount() : 0.0;

            bill.setPaidAmount(paid);
            bill.setPreviousAdjustment(previousAdj);
            bill.setPostDiscount(postDiscount);

            double balance = round(finalTotal - paid);
            bill.setBalanceAmount(balance);
            double netPayable = round(balance - previousAdj - postDiscount);
            bill.setNetPayable(netPayable);

            // SAVE BILL
            PurchaseBill saved = repository.save(bill);

            // STOCK UPDATES
            if (!items.isEmpty()) {
                for (PurchaseItem item : items) {
                    StockDTO stockDTO = new StockDTO();
                    stockDTO.setProductId(item.getProductId());
                    stockDTO.setProductName(item.getProductName());
                    stockDTO.setBatchNo(item.getBatchNo());
                    stockDTO.setExpiryDate(item.getExpiryDate());
                    stockDTO.setCategory(item.getCategory());
                    stockDTO.setQty(item.getQuantity());
                    stockDTO.setFreeQty(item.getFreeQty());
                    stockDTO.setCostPrice(item.getCostPrice());
                    stockDTO.setMrp(item.getMrp());
                    stockDTO.setGstPercent(item.getGstPercent());
                    stockDTO.setSupplierName(dto.getSupplierName());
                    stockDTO.setPurchaseDate(dto.getInvoiceDate());

                    stockLedgerService.addPurchaseStock(stockDTO, saved.getPurchaseBillNo());
                }
            }

            return buildResponse(true, saved, "Purchase Bill saved successfully and stock updated", HttpStatus.OK.value());

        } catch (Exception e) {
            log.error("Error saving purchase bill: {}", e.getMessage(), e);
            return buildResponse(false, null, "Failed to save purchase bill: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    // ----------------- UPDATE PURCHASE -----------------
    @Override
    public Response updatePurchase(String id, PurchaseBillDTO dto) {
        try {
            PurchaseBill existing = repository.findById(id).orElse(null);
            if (existing == null) {
                return buildResponse(false, null, "Purchase Bill not found: " + id, HttpStatus.NOT_FOUND.value());
            }

            // Reverse stock
            if (existing.getMedicineDetails() != null && !existing.getMedicineDetails().isEmpty()) {
                stockLedgerService.reversePurchaseByBill(existing.getPurchaseBillNo(), existing.getMedicineDetails());
            }

            dto.setId(id);
            return savePurchase(dto);

        } catch (Exception e) {
            return buildResponse(false, null, "Failed to update purchase bill: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    // ----------------- GET BY ID -----------------
    @Override
    public Response getPurchaseById(String id) {
        try {
            PurchaseBill bill = repository.findById(id).orElse(null);
            if (bill == null) {
                return buildResponse(false, null, "Purchase Bill not found with ID: " + id,
                        HttpStatus.NOT_FOUND.value());
            }
            return buildResponse(true, bill, "Purchase Bill fetched successfully", HttpStatus.OK.value());

        } catch (Exception e) {
            return buildResponse(false, null, "Error fetching purchase bill: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    // ----------------- GET BY BILL NO -----------------
    @Override
    public Response getPurchaseByPurchaseBillNo(String purchaseBillNo) {
        try {
            PurchaseBill bill = repository.findByPurchaseBillNo(purchaseBillNo).orElse(null);
            if (bill == null) {
                return buildResponse(false, null,
                        "Purchase Bill not found with this bill no: " + purchaseBillNo,
                        HttpStatus.NOT_FOUND.value());
            }
            return buildResponse(true, bill, "Purchase Bill fetched successfully", HttpStatus.OK.value());

        } catch (Exception e) {
            return buildResponse(false, null, "Error fetching purchase bill: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    // ----------------- GET ALL -----------------
    @Override
    public Response getAllPurchases() {
        try {
            List<PurchaseBill> list = repository.findAll();
            return buildResponse(true, list, "Purchase Bills fetched successfully", HttpStatus.OK.value());
        } catch (Exception e) {
            return buildResponse(false, null, "Error fetching purchase bills", HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    // ----------------- DELETE -----------------
    @Override
    public Response deletePurchase(String id) {
        try {
            PurchaseBill existing = repository.findById(id).orElse(null);
            if (existing == null) {
                return buildResponse(false, null, "Purchase Bill not found: " + id, HttpStatus.NOT_FOUND.value());
            }

            if (existing.getMedicineDetails() != null && !existing.getMedicineDetails().isEmpty()) {
                stockLedgerService.reversePurchaseByBill(existing.getPurchaseBillNo(), existing.getMedicineDetails());
            }

            repository.deleteById(id);
            return buildResponse(true, null, "Purchase Bill deleted successfully", HttpStatus.OK.value());
        } catch (Exception e) {
            return buildResponse(false, null, "Failed to delete purchase bill: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    // ----------------- GET BY DATE RANGE -----------------
    @Override
    public Response getPurchaseByDateRange(String fromDate, String toDate) {
        try {
            if (fromDate == null || toDate == null) {
                return buildResponse(false, null, "From-Date and To-Date are required", HttpStatus.BAD_REQUEST.value());
            }

            fromDate = fromDate.replace("-", "/");
            toDate = toDate.replace("-", "/");

            List<PurchaseBill> list = repository.findByDateRange(fromDate, toDate);
            if (list.isEmpty()) {
                return buildResponse(false, null, "No Purchase Bills found between given dates",
                        HttpStatus.NOT_FOUND.value());
            }

            return buildResponse(true, list, "Purchase Bills fetched successfully", HttpStatus.OK.value());

        } catch (Exception e) {
            return buildResponse(false, null, "Failed to fetch purchase bills: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }
}