package com.pharmacyManagement.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pharmacyManagement.dto.InventoryResponseDTO;
import com.pharmacyManagement.dto.Response;
import com.pharmacyManagement.service.InventoryService;

import lombok.extern.slf4j.Slf4j;
@RestController
@RequestMapping("/inventory")
@Slf4j
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<Response> getAllInventory() {

        Response res = inventoryService.getAllInventory();
        return ResponseEntity.status(res.getStatus()).body(res);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Response> getInventoryById(@PathVariable String id) {

        Response res = inventoryService.getInventoryById(id);
        return ResponseEntity.status(res.getStatus()).body(res);
    }

    @PostMapping
    public ResponseEntity<Response> createInventory(@RequestBody InventoryResponseDTO dto) {

        Response res = inventoryService.createInventory(dto);
        return ResponseEntity.status(res.getStatus()).body(res);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Response> updateInventory(
            @PathVariable String id,
            @RequestBody InventoryResponseDTO dto) {

        Response res = inventoryService.updateInventory(id, dto);
        return ResponseEntity.status(res.getStatus()).body(res);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Response> deleteInventory(@PathVariable String id) {

        Response res = inventoryService.deleteInventory(id);
        return ResponseEntity.status(res.getStatus()).body(res);
    }
    
    @DeleteMapping("/{medicineId}/{batchNo}")
    public ResponseEntity<Response> deleteInventory(
            @PathVariable String medicineId,
            @PathVariable String batchNo) {

        log.info("API Call: Delete Inventory");

        Response res = inventoryService.deleteInventory(medicineId, batchNo);

        return ResponseEntity.status(res.getStatus()).body(res);
    }
}
