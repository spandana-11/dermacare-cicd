package com.dermacare.doctorservice.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import com.dermacare.doctorservice.dto.BookingResponse;
import com.dermacare.doctorservice.dto.ResponseStructure;


@FeignClient(name = "bookingservice")
public interface  BookingFeignClient {
	
	@GetMapping("/api/v1/getBookedServiceById/{id}")
	public ResponseEntity<ResponseStructure<BookingResponse>> getBookedService(@PathVariable String id);
	
	
	@PutMapping("/api/v1/updateAppointment")
	public ResponseEntity<?> updateAppointment(@RequestBody BookingResponse bookingResponse );
	


}
