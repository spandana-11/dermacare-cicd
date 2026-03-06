package com.pharmacyManagement.service.impl;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.pharmacyManagement.dto.InventoryResponseDTO;
import com.pharmacyManagement.dto.Response;
import com.pharmacyManagement.entity.Inventory;
import com.pharmacyManagement.repository.InventoryRepository;
import com.pharmacyManagement.service.InventoryService;


import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class InventoryServiceImpl implements InventoryService {

	@Autowired
	private InventoryRepository inventoryRepository;

	@Override
	public Response createInventory(InventoryResponseDTO dto) {

	    log.info("Creating inventory for medicine {}", dto.getMedicineName());

	    Inventory inventory = new Inventory();

	    inventory.setProductId(dto.getMedicineId());
	    inventory.setProductName(dto.getMedicineName());
	    inventory.setBatchNo(dto.getBatchNo());
	    inventory.setMfgDate(dto.getMfgDate());
	    inventory.setExpiryDate(dto.getExpiryDate());
	    inventory.setAvailableQty(dto.getAvailableQty());
	    inventory.setMinStock(dto.getMinStock());
	    inventory.setPurchaseRate(dto.getPurchaseRate());
	    inventory.setMrp(dto.getMrp());
	    inventory.setGstPercent(dto.getGstPercent());
	    inventory.setSupplierId(dto.getSupplier());

	    Inventory saved = inventoryRepository.save(inventory);

	    Response res = new Response();
	    res.setSuccess(true);
	    res.setData(saved);
	    res.setMessage("Inventory created successfully");
	    res.setStatus(HttpStatus.OK.value());

	    return res;
	}
	@Override
	public Response getInventoryById(String inventoryId) {

	    Optional<Inventory> optional = inventoryRepository.findById(inventoryId);

	    Response res = new Response();

	    if (optional.isEmpty()) {

	        res.setSuccess(false);
	        res.setMessage("Inventory not found with id: " + inventoryId);
	        res.setStatus(HttpStatus.NOT_FOUND.value());
	        return res;
	    }

	    Inventory inv = optional.get();

	    InventoryResponseDTO dto = new InventoryResponseDTO();

	    dto.setMedicineId(inv.getProductId());
	    dto.setMedicineName(inv.getProductName());
	    dto.setBatchNo(inv.getBatchNo());
	    dto.setMfgDate(inv.getMfgDate());
	    dto.setExpiryDate(inv.getExpiryDate());
	    dto.setAvailableQty(inv.getAvailableQty());
	    dto.setMinStock(inv.getMinStock());
	    dto.setPurchaseRate(inv.getPurchaseRate());
	    dto.setMrp(inv.getMrp());
	    dto.setGstPercent(inv.getGstPercent());
	    dto.setSupplier(inv.getSupplierId());

	    try {

	        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");

	        LocalDate expiryDate = LocalDate.parse(inv.getExpiryDate(), formatter);

	        long daysLeft = ChronoUnit.DAYS.between(LocalDate.now(), expiryDate);

	        dto.setDaysLeft(daysLeft);

	        if (daysLeft <= 0) {
	            dto.setStatus("EXPIRED");
	        } else if (daysLeft <= 30) {
	            dto.setStatus("NEAR_EXPIRY");
	        } else {
	            dto.setStatus("ACTIVE");
	        }

	    } catch (Exception e) {

	        dto.setDaysLeft(0);
	        dto.setStatus("INVALID_DATE");
	    }

	    res.setSuccess(true);
	    res.setData(dto);
	    res.setMessage("Inventory fetched successfully");
	    res.setStatus(HttpStatus.OK.value());

	    return res;
	}
	@Override
	public Response updateInventory(String inventoryId, InventoryResponseDTO dto) {

	    Optional<Inventory> optional = inventoryRepository.findById(inventoryId);

	    Response res = new Response();

	    if (optional.isEmpty()) {

	        res.setSuccess(false);
	        res.setMessage("Inventory not found");
	        res.setStatus(HttpStatus.NOT_FOUND.value());
	        return res;
	    }

	    Inventory inv = optional.get();

	    inv.setProductName(dto.getMedicineName());
	    inv.setBatchNo(dto.getBatchNo());
	    inv.setMfgDate(dto.getMfgDate());
	    inv.setExpiryDate(dto.getExpiryDate());
	    inv.setAvailableQty(dto.getAvailableQty());
	    inv.setMinStock(dto.getMinStock());
	    inv.setPurchaseRate(dto.getPurchaseRate());
	    inv.setMrp(dto.getMrp());
	    inv.setGstPercent(dto.getGstPercent());
	    inv.setSupplierId(dto.getSupplier());

	    Inventory updated = inventoryRepository.save(inv);

	    res.setSuccess(true);
	    res.setData(updated);
	    res.setMessage("Inventory updated successfully");
	    res.setStatus(HttpStatus.OK.value());

	    return res;
	}
	@Override
	public Response deleteInventory(String inventoryId) {

	    Response res = new Response();

	    Optional<Inventory> optional = inventoryRepository.findById(inventoryId);

	    if (optional.isEmpty()) {

	        res.setSuccess(false);
	        res.setMessage("Inventory not found");
	        res.setStatus(HttpStatus.NOT_FOUND.value());
	        return res;
	    }

	    inventoryRepository.deleteById(inventoryId);

	    res.setSuccess(true);
	    res.setMessage("Inventory deleted successfully");
	    res.setStatus(HttpStatus.OK.value());

	    return res;
	}
	@Override
	public Response getAllInventory() {

	    log.info("Fetching inventory list");

	    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");

	    List<InventoryResponseDTO> inventoryList = inventoryRepository.findAll()
	            .stream()
	            .map(inv -> {

	                InventoryResponseDTO dto = new InventoryResponseDTO();

	                dto.setMedicineId(inv.getProductId());
	                dto.setMedicineName(inv.getProductName());
	                dto.setBatchNo(inv.getBatchNo());
	                dto.setMfgDate(inv.getMfgDate());
	                dto.setExpiryDate(inv.getExpiryDate());
	                dto.setAvailableQty(inv.getAvailableQty());
	                dto.setMinStock(inv.getMinStock());
	                dto.setPurchaseRate(inv.getPurchaseRate());
	                dto.setMrp(inv.getMrp());
	                dto.setGstPercent(inv.getGstPercent());
	                dto.setSupplier(inv.getSupplierId());

	                try {
	                    // Expiry Calculation
	                    LocalDate expiry = LocalDate.parse(inv.getExpiryDate(), formatter);
	                    long daysLeft = ChronoUnit.DAYS.between(LocalDate.now(), expiry);

	                    dto.setDaysLeft(daysLeft);

	                    if (daysLeft <= 0) {
	                        dto.setStatus("EXPIRED");
	                    } else if (daysLeft <= 30) {
	                        dto.setStatus("NEAR_EXPIRY");
	                    } else {
	                        dto.setStatus("ACTIVE");
	                    }

	                } catch (Exception e) {
	                    dto.setDaysLeft(0);
	                    dto.setStatus("INVALID_DATE");
	                }

	                return dto;

	            }).toList();

	    Response res = new Response();
	    res.setSuccess(true);
	    res.setData(inventoryList);
	    res.setMessage("Inventory fetched successfully");
	    res.setStatus(HttpStatus.OK.value());

	    return res;
	}
	@Override
	public Response deleteInventory(String medicineId, String batchNo) {

	    log.info("Deleting inventory for medicineId {} and batch {}", medicineId, batchNo);

	    Response res = new Response();

	    Inventory inventory = inventoryRepository.findByProductIdAndBatchNo(medicineId, batchNo);

	    if (inventory == null) {

	        res.setSuccess(false);
	        res.setMessage("Inventory not found for medicineId: " + medicineId + " and batchNo: " + batchNo);
	        res.setStatus(HttpStatus.NOT_FOUND.value());
	        return res;
	    }

	    inventoryRepository.deleteByProductIdAndBatchNo(medicineId, batchNo);

	    res.setSuccess(true);
	    res.setMessage("Inventory deleted successfully");
	    res.setStatus(HttpStatus.OK.value());

	    return res;
	}
}