package com.pharmacyManagement.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pharmacyManagement.dto.Response;
import com.pharmacyManagement.entity.Stock;
import com.pharmacyManagement.service.StockService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/stockMaster")
@RequiredArgsConstructor
public class StockController {

	private final StockService stockService;

	@PostMapping("/add")
	public ResponseEntity<Response> addStock(@RequestBody Stock stock) {
		Response resonse = stockService.addStock(stock);
		return ResponseEntity.status(resonse.getStatus()).body(resonse);
	}

	@PutMapping("/update/{id}")
	public ResponseEntity<Response> updateStock(@PathVariable("id") String id, @RequestBody Stock stock) {
		Response resonse = stockService.updateStock(id, stock);
		return ResponseEntity.status(resonse.getStatus()).body(resonse);
	}

	@GetMapping("/{id}")
	public ResponseEntity<Response> getStockById(@PathVariable("id") String id) {
		Response resonse = stockService.getStockById(id);
		return ResponseEntity.status(resonse.getStatus()).body(resonse);
	}

	@GetMapping("/product/{productId}")
	public ResponseEntity<Response> getStockByProductId(@PathVariable("productId") String productId) {
		Response resonse = stockService.getStockByProductId(productId);
		return ResponseEntity.status(resonse.getStatus()).body(resonse);
	}

	@GetMapping("/all")
	public ResponseEntity<Response> getAllStock() {
		Response resonse = stockService.getAllStock();
		return ResponseEntity.status(resonse.getStatus()).body(resonse);
	}

	@DeleteMapping("/delete/{id}")
	public ResponseEntity<Response> deleteStock(@PathVariable("id") String id) {
		Response resonse = stockService.deleteStock(id);
		return ResponseEntity.status(resonse.getStatus()).body(resonse);
	}

	@PutMapping("/status/{id}/{status}")
	public ResponseEntity<Response> changeStatus(@PathVariable("id") String id, @PathVariable("status") String status) {
		Response resonse = stockService.changeStatus(id, status);
		return ResponseEntity.status(resonse.getStatus()).body(resonse);
	}
	@DeleteMapping("/deleteStock/{id}")
	public ResponseEntity<Response> deleteStockById(@PathVariable("id") String id) {
		Response resonse = stockService.deleteStockById(id);
		return ResponseEntity.status(resonse.getStatus()).body(resonse);
	}
}
