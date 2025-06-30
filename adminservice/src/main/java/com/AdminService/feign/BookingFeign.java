package com.AdminService.feign;

import java.util.List;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import com.AdminService.dto.BookingResponse;
import com.AdminService.util.ResponseStructure;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

@FeignClient(value = "bookingservice")
@CircuitBreaker(name = "circuitBreaker", fallbackMethod = "bookServiceFallBack")
public interface BookingFeign {
	
	@GetMapping("/api/v1/getAllBookedServices")
	public ResponseEntity<ResponseStructure<List<BookingResponse>>> getAllBookedService();
	
	@DeleteMapping("/api/v1/deleteService/{id}")
	public ResponseEntity<ResponseStructure<BookingResponse>> deleteBookedService(@PathVariable String id);
	
	@GetMapping("/api/v1/getAllBookedServices/{doctorId}")
	public ResponseEntity<ResponseStructure<List<BookingResponse>>> getBookingByDoctorId(@PathVariable String doctorId);

	
	///FALLBACK METHOD
	
	default ResponseEntity<?> bookServiceFallBack(Exception e){		 
		return ResponseEntity.status(503).body( new ResponseStructure<BookingResponse>(null,"Booking Service Not Available",HttpStatus.SERVICE_UNAVAILABLE,503));
		}
}
