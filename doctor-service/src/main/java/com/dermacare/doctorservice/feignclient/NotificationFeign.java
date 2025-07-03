package com.dermacare.doctorservice.feignclient;

import java.util.List;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.dermacare.doctorservice.dto.NotificationDTO;
import com.dermacare.doctorservice.dto.NotificationResponse;
import com.dermacare.doctorservice.dto.ResBody;


@FeignClient(value = "notification-service")
public interface NotificationFeign {
	
	@GetMapping("/api/notificationservice/getNotificationByBookingId/{id}")
	public NotificationDTO getNotificationByBookingId(@PathVariable String id);

	@PutMapping("/api/notificationservice/updateNotification")
	public NotificationDTO updateNotification(@RequestBody NotificationDTO notificationDTO );
	
	@GetMapping("/api/notificationservice/notificationtodoctor/{hospitalId}/{doctorId}")	
	public ResponseEntity<ResBody<List<NotificationDTO>>> notificationtodoctor(@PathVariable String hospitalId,
			@PathVariable String doctorId);
	
	@PostMapping("/api/notificationservice/response")
	public ResponseEntity<?> response(@RequestBody NotificationResponse notificationResponse);
		
	
}
