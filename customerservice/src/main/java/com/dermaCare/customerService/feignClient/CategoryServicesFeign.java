package com.dermaCare.customerService.feignClient;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import com.dermaCare.customerService.dto.BookingResponse;
import com.dermaCare.customerService.dto.CategoryDto;
import com.dermaCare.customerService.dto.ServicesDto;
import com.dermaCare.customerService.dto.SubServicesDto;
import com.dermaCare.customerService.util.Response;
import com.dermaCare.customerService.util.ResponseStructure;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

@FeignClient(value = "category-services")
@CircuitBreaker(name = "circuitBreaker", fallbackMethod = "categoryServiceFallBack")
public interface CategoryServicesFeign {
	
	@GetMapping("/api/v1/subServices/getAllSubServices")
	public ResponseEntity<ResponseStructure<List<SubServicesDto>>> getAllSubServices();

	@GetMapping("/api/v1/subServices/getSubService/{hospitalId}/{subServiceId}")
	public ResponseEntity<ResponseStructure<SubServicesDto>> getSubServiceBySubServiceId(@PathVariable String hospitalId, @PathVariable String subServiceId);
	
	@GetMapping("/api/v1/services/getServices/{categoryId}")
	public ResponseEntity<ResponseStructure<List<ServicesDto>>> getServiceById(@PathVariable String categoryId);
	
	@GetMapping("/api/v1/SubServicesInfo/getSubServicesByServiceId/{serviceId}")
	public ResponseEntity<Response> getSubServicesByServiceId(@PathVariable String serviceId);
	
	@GetMapping("/api/v1/category/getCategories")
    ResponseEntity<ResponseStructure<List<CategoryDto>>> getAllCategory();
	
	//FALLBACK METHODS
	
	default ResponseEntity<?> categoryServiceFallBack(Exception e){		 
	return ResponseEntity.status(503).body(new ResponseStructure<BookingResponse>(null,"Category-Service Not Available",HttpStatus.SERVICE_UNAVAILABLE,503));}
	
}
