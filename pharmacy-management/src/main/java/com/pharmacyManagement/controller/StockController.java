package com.pharmacyManagement.controller;

import org.springframework.web.bind.annotation.*;

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
	public Response addStock(@RequestBody Stock stock) {
		return stockService.addStock(stock);
	}

	@PutMapping("/update/{id}")
	public Response updateStock(@PathVariable("id") String id, @RequestBody Stock stock) {
		return stockService.updateStock(id, stock);
	}

	@GetMapping("/{id}")
	public Response getStockById(@PathVariable("id") String id) {
		return stockService.getStockById(id);
	}

	@GetMapping("/product/{productId}")
	public Response getStockByProductId(@PathVariable("productId") String productId) {
		return stockService.getStockByProductId(productId);
	}

	@GetMapping("/all")
	public Response getAllStock() {
		return stockService.getAllStock();
	}

	@DeleteMapping("/delete/{id}")
	public Response deleteStock(@PathVariable("id") String id) {
		return stockService.deleteStock(id);
	}

	@PutMapping("/status/{id}/{status}")
	public Response changeStatus(@PathVariable("id") String id, @PathVariable("status") String status) {
		return stockService.changeStatus(id, status);
	}
}
