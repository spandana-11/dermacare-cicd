package com.pharmacyManagement.service.impl;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.pharmacyManagement.dto.Response;
import com.pharmacyManagement.dto.StockDTO;
import com.pharmacyManagement.entity.PurchaseItem;
import com.pharmacyManagement.entity.Stock;
import com.pharmacyManagement.entity.StockLedger;
import com.pharmacyManagement.repository.StockLedgerRepository;
import com.pharmacyManagement.repository.StockRepository;
import com.pharmacyManagement.service.StockLedgerService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StockLedgerServiceImpl implements StockLedgerService {

    private final StockRepository stockRepo;
    private final StockLedgerRepository ledgerRepo;

    // -------------------------------------------------------------------------
    // ADD PURCHASE STOCK
    // -------------------------------------------------------------------------
    @Override
    public synchronized Response addPurchaseStock(StockDTO dto, String purchaseBillNo) {
        try {
            int totalQty = dto.getQty() + dto.getFreeQty();

            Optional<Stock> existingStockOpt =
                    stockRepo.findByProductIdAndBatchNo(dto.getProductId(), dto.getBatchNo());

            Stock stock;

            if (existingStockOpt.isPresent()) {
                stock = existingStockOpt.get();
                stock.setOpeningStock(stock.getClosingStock());
                stock.setStockIn(stock.getStockIn() + totalQty);
            } else {
                stock = new Stock();
                stock.setProductId(dto.getProductId());
                stock.setProductName(dto.getProductName());
                stock.setBatchNo(dto.getBatchNo());
                stock.setExpiryDate(dto.getExpiryDate());

                stock.setOpeningStock(0);
                stock.setStockIn(totalQty);
                stock.setStockOut(0);
                stock.setDamageStock(0);
            }

            // Update common fields
            stock.setLastPurchaseDate(dto.getPurchaseDate());
            stock.setCostPrice(dto.getCostPrice());
            stock.setMrp(dto.getMrp());
            stock.setGstPercent(dto.getGstPercent());
            stock.setSupplierId(dto.getSupplierId());
            stock.setSupplierName(dto.getSupplierName());

            // Recalculate closing
            stock.setClosingStock(
                    stock.getOpeningStock() + stock.getStockIn() - stock.getStockOut() - stock.getDamageStock()
            );

            stockRepo.save(stock);

            StockLedger ledger = saveLedger(stock, "PURCHASE", purchaseBillNo, totalQty, 0,
                    "Purchase - Bill: " + purchaseBillNo);

            Map<String, Object> map = new HashMap<>();
            map.put("stock", stock);
            map.put("ledger", ledger);

            return new Response(true, map, "Purchase stock added successfully", 200);

        } catch (Exception e) {
            return new Response(false, null, "Error: " + e.getMessage(), 500);
        }
    }

    // -------------------------------------------------------------------------
    // REVERSE PURCHASE FOR SINGLE ITEM
    // -------------------------------------------------------------------------
    @Override
    public synchronized Response reversePurchaseItem(String productId, String batchNo, int qtyToReverse,
                                                     String purchaseBillNo) {
        try {
            Optional<Stock> stockOpt = stockRepo.findByProductIdAndBatchNo(productId, batchNo);

            if (stockOpt.isEmpty()) {
                return new Response(false, null, "Stock not found to reverse", 404);
            }

            Stock stock = stockOpt.get();
            stock.setOpeningStock(stock.getClosingStock());

            int adjustedStockIn = Math.max(0, stock.getStockIn() - qtyToReverse);
            stock.setStockIn(adjustedStockIn);

            stock.setClosingStock(
                    stock.getOpeningStock() + stock.getStockIn() - stock.getStockOut() - stock.getDamageStock()
            );

            stockRepo.save(stock);

            StockLedger ledger = saveLedger(stock, "PURCHASE_REVERSAL", purchaseBillNo,
                    0, qtyToReverse,
                    "Purchase Reversal - Bill: " + purchaseBillNo);

            Map<String, Object> map = new HashMap<>();
            map.put("stock", stock);
            map.put("ledger", ledger);

            return new Response(true, map, "Purchase reversed for item", 200);

        } catch (Exception e) {
            return new Response(false, null, "Error: " + e.getMessage(), 500);
        }
    }

    // -------------------------------------------------------------------------
    // REVERSE PURCHASE FOR FULL BILL
    // -------------------------------------------------------------------------
    @Override
    public Response reversePurchaseByBill(String purchaseBillNo, List<PurchaseItem> items) {
        if (items == null || items.isEmpty()) {
            return new Response(false, null, "No items available to reverse", 400);
        }

        for (PurchaseItem item : items) {
            int totalQty = item.getQuantity() + item.getFreeQty();
            reversePurchaseItem(item.getProductId(), item.getBatchNo(), totalQty, purchaseBillNo);
        }

        return new Response(true, null, "Purchase reversed for entire bill", 200);
    }

    // -------------------------------------------------------------------------
    // RECORD SALE
    // -------------------------------------------------------------------------
    @Override
    public synchronized Response recordSale(String productId, String batchNo, int qty, String saleId) {
        try {
            Optional<Stock> stockOpt = stockRepo.findByProductIdAndBatchNo(productId, batchNo);

            if (stockOpt.isEmpty()) {
                return new Response(false, null, "Stock not found", 404);
            }

            Stock stock = stockOpt.get();

            if (stock.getClosingStock() < qty) {
                return new Response(false, null, "Insufficient stock for sale", 400);
            }

            stock.setOpeningStock(stock.getClosingStock());
            stock.setStockOut(stock.getStockOut() + qty);

            stock.setClosingStock(
                    stock.getOpeningStock() + stock.getStockIn() - stock.getStockOut() - stock.getDamageStock()
            );

            stockRepo.save(stock);

            StockLedger ledger = saveLedger(stock, "SALE", saleId, 0, qty, "Sale Entry");

            Map<String, Object> map = new HashMap<>();
            map.put("stock", stock);
            map.put("ledger", ledger);

            return new Response(true, map, "Sale recorded successfully", 200);

        } catch (Exception e) {
            return new Response(false, null, "Error: " + e.getMessage(), 500);
        }
    }

    // -------------------------------------------------------------------------
    // RECORD DAMAGE
    // -------------------------------------------------------------------------
    @Override
    public synchronized Response recordDamage(String productId, String batchNo, int qty, String reason) {
        try {
            Optional<Stock> stockOpt = stockRepo.findByProductIdAndBatchNo(productId, batchNo);

            if (stockOpt.isEmpty()) {
                return new Response(false, null, "Stock not found", 404);
            }

            Stock stock = stockOpt.get();

            if (stock.getClosingStock() < qty) {
                return new Response(false, null, "Insufficient stock for damage", 400);
            }

            stock.setOpeningStock(stock.getClosingStock());
            stock.setDamageStock(stock.getDamageStock() + qty);

            stock.setClosingStock(
                    stock.getOpeningStock() + stock.getStockIn() - stock.getStockOut() - stock.getDamageStock()
            );

            stockRepo.save(stock);

            StockLedger ledger = saveLedger(stock, "DAMAGE", null, 0, qty, "Damage: " + reason);

            Map<String, Object> map = new HashMap<>();
            map.put("stock", stock);
            map.put("ledger", ledger);

            return new Response(true, map, "Damage recorded successfully", 200);

        } catch (Exception e) {
            return new Response(false, null, "Error: " + e.getMessage(), 500);
        }
    }

    // -------------------------------------------------------------------------
    // LEDGER ENTRY CREATION (returns ledger)
    // -------------------------------------------------------------------------
    private StockLedger saveLedger(Stock stock, String type, String txnId,
                                   int qtyIn, int qtyOut, String remarks) {

        StockLedger ledger = new StockLedger();

        ledger.setProductId(stock.getProductId());
        ledger.setProductName(stock.getProductName());
        ledger.setBatchNo(stock.getBatchNo());
        ledger.setExpiryDate(stock.getExpiryDate());

        ledger.setTransactionType(type);
        ledger.setTransactionId(txnId);
        ledger.setQtyIn(qtyIn);
        ledger.setQtyOut(qtyOut);

        ledger.setClosingStock(stock.getClosingStock());
        ledger.setCostPrice(stock.getCostPrice());
        ledger.setMrp(stock.getMrp());

        ledger.setDate(LocalDate.now().toString());
        ledger.setTime(LocalTime.now().toString());
        ledger.setRemarks(remarks);

        return ledgerRepo.save(ledger);
    }
}
