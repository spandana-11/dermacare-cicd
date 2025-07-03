package com.dermaCare.customerService.feignClient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.dermaCare.customerService.dto.DoctorsDTO;
import com.dermaCare.customerService.util.Response;
import jakarta.validation.Valid;



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
	
	@PutMapping("/clinic-admin/updateDoctorSlotWhileBooking/{doctorId}/{date}/{time}")
	public Boolean updateDoctorSlotWhileBooking(@PathVariable String doctorId, @PathVariable String date,
			@PathVariable String time);
	
	@PutMapping("/clinic-admin/updateDoctor/{doctorId}")
	public ResponseEntity<Response> updateDoctorById(@PathVariable String doctorId,
			@Valid @RequestBody DoctorsDTO dto);
	
//	//FALLBACK METHODS
//	
//		default ResponseEntity<?> clinicAdminServiceFallBack(Exception e){		 
//		return ResponseEntity.status(503).body(new Response("CLINIC ADMIN SERVICE NOT AVAILABLE",503,false,null));}
}
