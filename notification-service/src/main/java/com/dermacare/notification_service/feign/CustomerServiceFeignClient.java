package com.dermacare.notification_service.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import com.dermacare.notification_service.dto.CustomerDTO;
import com.dermacare.notification_service.dto.Response;


@FeignClient(name = "customerservice")
public interface CustomerServiceFeignClient {
	
	@GetMapping("/api/customer/getAllCustomers")
	public ResponseEntity<Response> getAllCustomers();
	
	 @GetMapping("/api/customer/gcmToken/{token}")
	   public CustomerDTO getCustomerByToken(
				 @PathVariable String token );
		 
		

}