package com.dermaCare.customerService.feignClient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

import com.dermaCare.customerService.dto.DoctorLoginDTO;
import com.dermaCare.customerService.util.Response;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;



@FeignClient(value = "clinicadmin")
//@CircuitBreaker(name = "circuitBreaker", fallbackMethod = "clinicAdminServiceFallBack")
public interface ClinicAdminFeign {

	@GetMapping("/clinic-admin/getDoctorByServiceId/{hospitalId}/{service}")
	public ResponseEntity<Response> getDoctorByService(@PathVariable String hospitalId, @PathVariable String service);
	
	@GetMapping("/clinic-admin/doctors/hospital/{hospitalId}/subServiceId/{subServiceId}")
	public ResponseEntity<Response> getDoctorsBySubServiceId(@PathVariable String hospitalId, @PathVariable String subServiceId);
	
	@GetMapping("/clinic-admin/getDoctorslots/{hospitalId}/{doctorId}")
	public ResponseEntity<Response> getDoctorSlot(@PathVariable String hospitalId,@PathVariable String doctorId);
	
	@GetMapping("/clinic-admin/doctor/{id}")
	public ResponseEntity<Response> getDoctorById(@PathVariable String id);
	
	@GetMapping("/clinic-admin/getHospitalAndDoctorUsingSubServiceId/{subServiceId}")
	public ResponseEntity<Response> getHospitalAndDoctorUsingSubServiceId(@PathVariable String subServiceId);
	
	@GetMapping("/clinic-admin/getAllDoctorsBySubServiceId/{subServiceId}")
	public ResponseEntity<Response> getAllDoctorsBySubServiceId(@PathVariable String subServiceId);
	
	@GetMapping("/clinic-admin/averageRatings/{hospitalId}/{doctorId}")
	public ResponseEntity<Response> getAverageRatings(@PathVariable String hospitalId, @PathVariable String doctorId);

	
	
//	//FALLBACK METHODS
//	
//		default ResponseEntity<?> clinicAdminServiceFallBack(Exception e){		 
//		return ResponseEntity.status(503).body(new Response("CLINIC ADMIN SERVICE NOT AVAILABLE",503,false,null));}
}
