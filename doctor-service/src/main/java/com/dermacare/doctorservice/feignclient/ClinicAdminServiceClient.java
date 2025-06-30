package com.dermacare.doctorservice.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
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


}
