package com.dermacare.doctorservice.controller;

import static com.dermacare.doctorservice.dermacaredoctorutils.DermaCareUtils.DOCTOR;
import static com.dermacare.doctorservice.dermacaredoctorutils.DermaCareUtils.LOGIN_DOCTOR;
import static com.dermacare.doctorservice.dermacaredoctorutils.DermaCareUtils.UPDATE_DOCTOR_AVAILABILITY;
import static com.dermacare.doctorservice.dermacaredoctorutils.DermaCareUtils.UPDATE_PASSWORD;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dermacare.doctorservice.dto.ChangeDoctorPasswordDTO;
import com.dermacare.doctorservice.dto.DoctorAvailabilityStatusDTO;
import com.dermacare.doctorservice.dto.DoctorLoginDTO;
import com.dermacare.doctorservice.dto.Response;
import com.dermacare.doctorservice.service.DoctorService;

@RestController
@RequestMapping(value=DOCTOR)
//Origin(origins = {"http://localhost:3000", "http://localhost:3001"})

public class DoctorController {
	@Autowired
    private final DoctorService doctorService;

    
    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }


    @PutMapping(value = UPDATE_PASSWORD)
    public Response updatePassword(@PathVariable String username,
            @RequestBody ChangeDoctorPasswordDTO updatePasswordDTO) {       
    	Response response = doctorService.changePassword(username, updatePasswordDTO);
    	System.out.println(response);
        return response;
   }
    @PostMapping(value=LOGIN_DOCTOR)
    public Response login( @RequestBody DoctorLoginDTO dto) {
        return doctorService.login(dto);
    }
    
    @PutMapping(value = UPDATE_DOCTOR_AVAILABILITY)
    
    public Response updateDoctorAvailability(@PathVariable String doctorId,@RequestBody  DoctorAvailabilityStatusDTO availabilityDTO) {
    	 
    	return doctorService.updateDoctorAvailability(doctorId, availabilityDTO);
    	
    }
}
