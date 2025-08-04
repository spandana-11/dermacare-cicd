package com.dermacare.doctorservice.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.dermacare.doctorservice.dto.ChangeDoctorPasswordDTO;
import com.dermacare.doctorservice.dto.DoctorAvailabilityStatusDTO;
import com.dermacare.doctorservice.dto.DoctorLoginDTO;
import com.dermacare.doctorservice.dto.Response;

@FeignClient(name = "clinicadmin")
public interface ClinicAdminServiceClient {
	
	@PostMapping("/clinic-admin/doctorLogin")
	public Response login(DoctorLoginDTO loginDTO);

	 @PutMapping("/clinic-admin/update-password/{username}")
	    Response changePassword(@PathVariable("username") String username, @RequestBody ChangeDoctorPasswordDTO updateDTO);
	 
	 @PostMapping("/clinic-admin/doctorId/{doctorId}/availability")
	 Response updateDoctorAvailability(@PathVariable("doctorId") String doctorId,
	                                   @RequestBody DoctorAvailabilityStatusDTO availabilityDTO);
	 
	 
	 @GetMapping("/clinic-admin/doctors")
	 public ResponseEntity<Response> getAllDoctors();
	 
	 @GetMapping("/clinic-admin/doctor/{id}")
	 public ResponseEntity<Response> getDoctorById(@PathVariable String id);
	 
	 @GetMapping("/clinic-admin/clinic/{clinicId}/doctor/{doctorId}")
		public ResponseEntity<Response> getDoctorByClinicAndDoctorId(@PathVariable String clinicId,
				@PathVariable String doctorId);
	 
	 @GetMapping("/clinic-admin/doctors/hospitalById/{hospitalId}")
		public ResponseEntity<Response> getDoctorsByHospitalById(@PathVariable String hospitalId);
	 
	 @GetMapping("/clinic-admin/doctors/hospital/{hospitalId}/subServiceId/{subServiceId}")
		public ResponseEntity<Response> getDoctorsBySubServiceId(@PathVariable String hospitalId,
				@PathVariable String subServiceId);
	 
	 
	 @GetMapping("/clinic-admin/getAllDoctorsBySubServiceId/{subServiceId}")
		public ResponseEntity<Response> getAllDoctorsBySubServiceId(@PathVariable String subServiceId);
		
}
