package com.clinicadmin.feignclient;


import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(value = "notification-service")
public interface NotificationFeign {
	
	
	@GetMapping("/api/notificationservice/sendNotificationToClinic/{clinicId}")
	public ResponseEntity<?> sendNotificationToClinic(@PathVariable String clinicId );
	
	
	
	
}
