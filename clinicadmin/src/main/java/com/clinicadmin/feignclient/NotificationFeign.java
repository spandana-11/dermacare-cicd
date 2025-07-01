package com.clinicadmin.feignclient;

import java.util.List;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import com.clinicadmin.dto.NotificationDTO;
import com.clinicadmin.dto.ResBody;


@FeignClient(value = "notification-service")
public interface NotificationFeign {
	
	
	@GetMapping("/api/notificationservice/notificationtodoctorandclinic/{hospitalId}/{doctorId}")	
	public ResponseEntity<ResBody<List<NotificationDTO>>> notificationtodoctorandclinic(@PathVariable String hospitalId,
			@PathVariable String doctorId);
	
	
	
	
}
