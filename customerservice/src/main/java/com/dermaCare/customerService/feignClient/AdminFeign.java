package com.dermaCare.customerService.feignClient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.dermaCare.customerService.dto.ClinicDTO;
import com.dermaCare.customerService.util.Response;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

@FeignClient(value = "adminservice" )
@CircuitBreaker(name = "circuitBreaker", fallbackMethod = "adminServiceFallBack")
public interface AdminFeign {
	 @GetMapping("/admin/getClinicById/{clinicId}")
	    public Response getClinicById(@PathVariable String clinicId) ;
	 
	 @PutMapping("/admin/updateClinic/{clinicId}")
	    public Response updateClinic(@PathVariable String clinicId, @RequestBody ClinicDTO clinic);
	 
	 
//	//FALLBACK METHODS		
		default Response adminServiceFallBack(Exception e){		 
		return new Response("ADMIN SERVICE NOT AVAILABLE",503,false,null);
			}
				

}
