package com.dermacare.doctorservice.service;

import com.dermacare.doctorservice.dto.ChangeDoctorPasswordDTO;
import com.dermacare.doctorservice.dto.DoctorAvailabilityStatusDTO;
import com.dermacare.doctorservice.dto.DoctorLoginDTO;
import com.dermacare.doctorservice.dto.Response;

public interface DoctorService {
   
    Response login(DoctorLoginDTO loginDTO);
//	Response registerDoctor(DoctorDTO doctorDTO);
//	Response changePassword(ChangeDoctorPasswordDTO updateDTO);
	Response changePassword(String username, ChangeDoctorPasswordDTO updateDTO);
	Response updateDoctorAvailability(String doctorId ,DoctorAvailabilityStatusDTO availabilityDTO);
}
