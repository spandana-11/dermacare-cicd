// ---------- PurchaseBillServiceImpl.java ----------
package com.pharmacyManagement.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.pharmacyManagement.dto.PaymentDetails;
import com.pharmacyManagement.dto.PurchaseBillDTO;
import com.pharmacyManagement.dto.Response;
import com.pharmacyManagement.dto.Summary;
import com.pharmacyManagement.entity.Inventory;
import com.pharmacyManagement.entity.PurchaseBill;
import com.pharmacyManagement.entity.PurchaseItem;
import com.pharmacyManagement.repository.InventoryRepository;
import com.pharmacyManagement.repository.PurchaseBillRepository;
import com.pharmacyManagement.service.PurchaseBillService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PurchaseBillServiceImpl implements PurchaseBillService {

	@Autowired
	private PurchaseBillRepository purchaseRepository;

	@Autowired
	private InventoryRepository inventoryRepository;

	@Override
	public Response createPurchase(PurchaseBillDTO dto) {

	    log.info("Creating purchase for Bill No: {}", dto.getPurchaseBillNo());

	    Response res = new Response();

	    try {

	        PurchaseBill purchase = new PurchaseBill();

	        purchase.setPurchaseBillNo(dto.getPurchaseBillNo());
	        purchase.setOrderId(dto.getOrderId());
	        purchase.setInvoiceNo(dto.getInvoiceNo());
	        purchase.setFinancialYear(dto.getFinancialYear());
	        purchase.setDates(dto.getDates());
	        purchase.setTaxDetails(dto.getTaxDetails());
	        purchase.setSupplierDetails(dto.getSupplierDetails());
	        purchase.setPaymentDetails(dto.getPaymentDetails());
	        purchase.setItems(dto.getItems());
	        

	        purchase.setStatus("CREATED");
	        purchase.setCreatedAt(LocalDateTime.now().toString());

	        // calculate bill amounts
	        calculateAmounts(purchase);

	        // update inventory
	        updateInventory(purchase);

	        // save purchase
	        PurchaseBill savedPurchase = purchaseRepository.save(purchase);

	        log.info("Purchase created successfully with ID: {}", savedPurchase.getPurchaseId());

	        res.setSuccess(true);
	        res.setData(savedPurchase);
	        res.setMessage("Purchase created successfully");
	        res.setStatus(HttpStatus.OK.value());

	    } catch (Exception e) {

	        log.error("Error while creating purchase", e);

	        res.setSuccess(false);
	        res.setMessage("Exception occurred while creating purchase");
	        res.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
	    }

	    return res;
	}

	private void calculateAmounts(PurchaseBill purchase) {

		log.info("Calculating purchase amounts...");

		double totalQty = 0;
		double totalGST = 0;
		double grandTotal = 0;

		for (PurchaseItem item : purchase.getItems()) {

			double base = item.getQuantity() * item.getCostPrice();
			double discount = base * item.getDiscountPercent() / 100;

			item.setDiscountAmount(discount);

			double taxable = base - discount;
			double gst = taxable * item.getGstPercent() / 100; // have doubt gst calculate on after discount before dis

			item.setGstAmount(gst);
			item.setCgstAmount(gst / 2);
			item.setSgstAmount(gst / 2);

			double net = taxable + gst;
			item.setNetAmount(net);

			totalQty += item.getQuantity();
			totalGST += gst;
			grandTotal += net;
		}

		Summary summary = new Summary();
		summary.setTotalQuantity(totalQty);
		summary.setTotalGSTAmount(totalGST);
		summary.setGrandTotal(grandTotal);

		purchase.setSummary(summary);

		PaymentDetails payment = purchase.getPaymentDetails();
		double due = grandTotal - payment.getPaidAmount();
		payment.setDueAmount(due);

		log.info("Purchase calculation completed. Grand Total: {}", grandTotal);
	}

	private void updateInventory(PurchaseBill purchase) {

		log.info("Updating inventory for purchase: {}", purchase.getPurchaseBillNo());

		for (PurchaseItem item : purchase.getItems()) {

			Inventory inventory = inventoryRepository.findByProductIdAndBatchNo(item.getProductId(), item.getBatchNo());

			if (inventory != null) {

				log.info("Existing stock found for product {} batch {}", item.getProductId(), item.getBatchNo());

				inventory.setAvailableQty(inventory.getAvailableQty() + item.getQuantity() + item.getFreeQuantity());
			} else {

				log.info("Creating new inventory entry for product {}", item.getProductId());

				inventory = new Inventory();
				inventory.setProductId(item.getProductId());
				inventory.setProductName(item.getProductName());
				inventory.setBatchNo(item.getBatchNo());
				inventory.setExpiryDate(item.getExpiryDate());
				inventory.setAvailableQty(item.getQuantity() + item.getFreeQuantity());
				inventory.setPurchaseRate(item.getCostPrice());
				inventory.setMrp(item.getMrp());
				inventory.setGstPercent(item.getGstPercent());
				inventory.setSupplierId(purchase.getSupplierDetails().getSupplierId());
			}

			inventoryRepository.save(inventory);
		}

		log.info("Inventory update completed.");
	}
	@Override
	public Response getPuchaseByPurchasedId(String purchaseId) {
		Response res= new Response();
		try {
			Optional<PurchaseBill> purchaseBill=purchaseRepository.findById(purchaseId);
			if(purchaseBill.isPresent()) {
				PurchaseBill dbData=purchaseBill.get();
				res.setSuccess(true);
				res.setData(dbData);
				res.setMessage("Puchased data fetched successfully");
				res.setStatus(HttpStatus.OK.value());
			}
			else {
				res.setSuccess(false);
				res.setMessage("Puchased data not found with this Id: "+purchaseId);
				res.setStatus(HttpStatus.OK.value());	
			}
		}
		catch(Exception e) {
			res.setSuccess(false);
			res.setMessage("Exception occured while fitching puchased data ");
			res.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());	
		}
		return res;
	}

	public Response getAll() {
		log.info("Fetching all purchases");
		List<PurchaseBill> purchasedData = purchaseRepository.findAll();
		Response res = new Response();
		res.setSuccess(true);
		res.setData(purchasedData);
		res.setMessage("Fetched Purchased data");
		res.setStatus(HttpStatus.OK.value());
		return res;

	}
	@Override
	public Response updatePurchase(String purchaseId, PurchaseBillDTO dto) {

		log.info("Updating purchase with ID: {}", purchaseId);

		Response res = new Response();

		Optional<PurchaseBill> optional = purchaseRepository.findById(purchaseId);

		if (optional.isEmpty()) {

			res.setSuccess(false);
			res.setMessage("Purchase not found with id: " + purchaseId);
			res.setStatus(HttpStatus.NOT_FOUND.value());
			return res;
		}

		PurchaseBill purchase = optional.get();

		purchase.setPurchaseBillNo(dto.getPurchaseBillNo());
        purchase.setOrderId(dto.getOrderId());
		purchase.setInvoiceNo(dto.getInvoiceNo());
		purchase.setFinancialYear(dto.getFinancialYear());
		purchase.setDates(dto.getDates());
		purchase.setTaxDetails(dto.getTaxDetails());
		purchase.setSupplierDetails(dto.getSupplierDetails());
		purchase.setPaymentDetails(dto.getPaymentDetails());
		purchase.setItems(dto.getItems());
		purchase.setUpdatedAt(LocalDateTime.now().toString());

		calculateAmounts(purchase);
		updateInventory(purchase);

		PurchaseBill updated = purchaseRepository.save(purchase);

		res.setSuccess(true);
		res.setData(updated);
		res.setMessage("Purchase updated successfully");
		res.setStatus(HttpStatus.OK.value());

		return res;
	}

	@Override
	public Response deletePurchase(String purchaseId) {

		log.info("Deleting purchase with ID: {}", purchaseId);

		Response res = new Response();

		Optional<PurchaseBill> optional = purchaseRepository.findById(purchaseId);

		if (optional.isEmpty()) {

			res.setSuccess(false);
			res.setMessage("Purchase not found with id: " + purchaseId);
			res.setStatus(HttpStatus.NOT_FOUND.value());
			return res;
		}

		purchaseRepository.deleteById(purchaseId);

		res.setSuccess(true);
		res.setMessage("Purchase deleted successfully");
		res.setStatus(HttpStatus.OK.value());

		return res;
	}
}