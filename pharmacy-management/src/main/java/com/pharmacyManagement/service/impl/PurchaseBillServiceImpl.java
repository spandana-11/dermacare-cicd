// ---------- PurchaseBillServiceImpl.java ----------
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
import com.pharmacyManagement.entity.Stock;
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

            // preserve id if present (used by update flow)
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

            // ============================
            // ITEM CALCULATIONS
            // ============================
            List<PurchaseItem> items = (dto.getMedicineDetails() == null || dto.getMedicineDetails().isEmpty())
                    ? Collections.emptyList()
                    : dto.getMedicineDetails().stream().map(i -> PurchaseCalcUtil.calculate(i, dto.getTaxType()))
                            .collect(Collectors.toList());

            bill.setMedicineDetails(items);

            // ============================
            // BASE TOTALS
            // ============================
            double totalAmount = round(items.stream().mapToDouble(PurchaseItem::getBaseAmount).sum());
            double totalDiscount = round(items.stream().mapToDouble(PurchaseItem::getDiscountAmount).sum());
            double netAmount = round(totalAmount - totalDiscount);
            double discountPercentage = 0.0;
            if (totalAmount > 0) {
                discountPercentage = round((totalDiscount / totalAmount) * 100);
            }
            bill.setDiscountPercentage(discountPercentage);
            // ============================
            // GST SUMMARY (IGST / CGST+SGST)
            // ============================
            double totalIGST = 0.0;
            double totalCGST = 0.0;
            double totalSGST = 0.0;

            if (dto.getTaxType() != null && dto.getTaxType().equalsIgnoreCase("IGST")) {
                totalIGST = round(items.stream().mapToDouble(PurchaseItem::getGstAmount).sum());
            } else {
                totalCGST = round(items.stream().mapToDouble(PurchaseItem::getCgstAmount).sum());
                totalSGST = round(items.stream().mapToDouble(PurchaseItem::getSgstAmount).sum());
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

            // ---------------- SAVE BILL ----------------
            PurchaseBill saved = repository.save(bill);

            // ============================
            // APPLY STOCK UPDATES (centralized in StockLedgerService)
            // ============================
            // For each item create StockDTO and call stockLedgerService.addPurchaseStock
            if (!items.isEmpty()) {
                for (PurchaseItem item : items) {
                    StockDTO stockDTO = new StockDTO();
                    stockDTO.setProductId(item.getProductId());
                    stockDTO.setProductName(item.getProductName());
                    stockDTO.setBatchNo(item.getBatchNo());
                    stockDTO.setExpiryDate(item.getExpiryDate());
                    stockDTO.setQty(item.getQuantity());
                    stockDTO.setFreeQty(item.getFreeQty());
                    stockDTO.setCostPrice(item.getCostPrice());
                    stockDTO.setMrp(item.getMrp());
                    stockDTO.setGstPercent(item.getGstPercent());
                    stockDTO.setSupplierName(dto.getSupplierName());
                    stockDTO.setPurchaseDate(dto.getInvoiceDate());
                    // transaction id will be purchaseBillNo inside stock service

                    stockLedgerService.addPurchaseStock(stockDTO, saved.getPurchaseBillNo());
                }
            }

            response.setSuccess(true);
            response.setData(saved);
            response.setMessage("Purchase Bill saved successfully and stock updated");
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

    // -------- UPDATE PURCHASE --------
    @Override
    public Response updatePurchase(String id, PurchaseBillDTO dto) {

        Response response = new Response();

        try {
            PurchaseBill existing = repository.findById(id).orElse(null);

            if (existing == null) {
                response.setSuccess(false);
                response.setMessage("Purchase Bill not found: " + id);
                response.setStatus(HttpStatus.NOT_FOUND.value());
                return response;
            }

            // 1) Reverse stock effects of old purchase
            if (existing.getMedicineDetails() != null && !existing.getMedicineDetails().isEmpty()) {
                stockLedgerService.reversePurchaseByBill(existing.getPurchaseBillNo(), existing.getMedicineDetails());
            }

            // 2) Save new purchase (use same id)
            dto.setId(id);
            Response saveRes = savePurchase(dto);

            return saveRes;

        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("Failed to update purchase bill: " + e.getMessage());
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            return response;
        }
    }

    // -------- GET BY ID --------
    @Override
    public Response getPurchaseById(String id) {

        Response response = new Response();

        try {
            PurchaseBill bill = repository.findById(id).orElse(null);

            if (bill == null) {
                response.setSuccess(false);
                response.setMessage("Purchase Bill not found with ID: " + id);
                response.setStatus(HttpStatus.NOT_FOUND.value());
                return response;
            }

            response.setSuccess(true);
            response.setData(bill);
            response.setMessage("Purchase Bill fetched successfully");
            response.setStatus(HttpStatus.OK.value());

            return response;

        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("Error fetching purchase bill: " + e.getMessage());
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            return response;
        }
    }

    @Override
    public Response getPurchaseByPurchaseBillNo(String purchaseBillNo) {

        Response response = new Response();

        try {
            PurchaseBill bill = repository.findByPurchaseBillNo(purchaseBillNo).orElse(null);

            if (bill == null) {
                response.setSuccess(false);
                response.setMessage("Purchase Bill not found with this bill no: " + purchaseBillNo);
                response.setStatus(HttpStatus.NOT_FOUND.value());
                return response;
            }

            response.setSuccess(true);
            response.setData(bill);
            response.setMessage("Purchase Bill fetched successfully");
            response.setStatus(HttpStatus.OK.value());

            return response;

        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("Error fetching purchase bill: " + e.getMessage());
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            return response;
        }
    }

    // -------- GET ALL --------
    @Override
    public Response getAllPurchases() {

        Response response = new Response();

        try {
            List<PurchaseBill> list = repository.findAll();

            response.setSuccess(true);
            response.setData(list);
            response.setMessage("Purchase Bills fetched successfully");
            response.setStatus(HttpStatus.OK.value());

            return response;

        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("Error fetching purchase bills");
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            return response;
        }
    }

    // -------- DELETE --------
    @Override
    public Response deletePurchase(String id) {

        Response response = new Response();

        try {
            PurchaseBill existing = repository.findById(id).orElse(null);

            if (existing == null) {
                response.setSuccess(false);
                response.setMessage("Purchase Bill not found: " + id);
                response.setStatus(HttpStatus.NOT_FOUND.value());
                return response;
            }

            // reverse stock
            if (existing.getMedicineDetails() != null && !existing.getMedicineDetails().isEmpty()) {
                stockLedgerService.reversePurchaseByBill(existing.getPurchaseBillNo(), existing.getMedicineDetails());
            }

            repository.deleteById(id);

            response.setSuccess(true);
            response.setMessage("Purchase Bill deleted successfully");
            response.setStatus(HttpStatus.OK.value());

            return response;

        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("Failed to delete purchase bill: " + e.getMessage());
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            return response;
        }
    }

    @Override
    public Response getPurchaseByDateRange(String fromDate, String toDate) {

        Response response = new Response();

        try {
            if (fromDate == null || toDate == null) {
                response.setSuccess(false);
                response.setMessage("From-Date and To-Date are required");
                response.setStatus(HttpStatus.BAD_REQUEST.value());
                return response;
            }

            // Convert incoming dates: 20-11-2025 → 20/11/2025
            fromDate = fromDate.replace("-", "/");
            toDate = toDate.replace("-", "/");

            List<PurchaseBill> list = repository.findByDateRange(fromDate, toDate);

            if (list.isEmpty()) {
                response.setSuccess(false);
                response.setMessage("No Purchase Bills found between given dates");
                response.setStatus(HttpStatus.NOT_FOUND.value());
                return response;
            }

            response.setSuccess(true);
            response.setData(list);
            response.setMessage("Purchase Bills fetched successfully");
            response.setStatus(HttpStatus.OK.value());
            return response;

        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("Failed to fetch purchase bills: " + e.getMessage());
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            return response;
        }
    }

}

