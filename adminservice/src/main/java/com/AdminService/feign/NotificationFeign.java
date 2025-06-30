package com.AdminService.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(value = "notification-service")
public interface NotificationFeign {
	
	@GetMapping("/api/notificationservice/notificationtoadmin")
	public ResponseEntity<?> notificationToAdmin();

}
