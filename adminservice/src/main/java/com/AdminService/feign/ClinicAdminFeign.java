package com.AdminService.feign;

import java.util.List;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.AdminService.dto.SubServicesDto;
import com.AdminService.util.Response;
import com.AdminService.util.ResponseStructure;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;



@FeignClient(name = "clinicadmin")
@CircuitBreaker(name = "circuitBreaker", fallbackMethod = "clinicAdminServiceFallBack")
public interface ClinicAdminFeign {
	
	@GetMapping("/clinic-admin/subService/getAllSubServies")
    public ResponseEntity<ResponseStructure<List<SubServicesDto>>> getAllSubServices();
	
	@GetMapping("/clinic-admin/doctor/{id}")
	public ResponseEntity<Response> getDoctorById(@PathVariable String id);
		
	
	///FALLBACK METHODS
	
	default ResponseEntity<?> clinicAdminServiceFallBack(Exception e){		 
		return ResponseEntity.status(503).body(new Response(false,null,"CLINIC ADMIN SERVICE NOT AVAILABLE",503,null,null));}

}

