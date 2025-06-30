package com.dermacare.doctorservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.dermacare.doctorservice.dto.ChangeDoctorPasswordDTO;
import com.dermacare.doctorservice.dto.DoctorAvailabilityStatusDTO;
import com.dermacare.doctorservice.dto.DoctorLoginDTO;
import com.dermacare.doctorservice.dto.Response;
import com.dermacare.doctorservice.feignclient.ClinicAdminServiceClient;
import feign.FeignException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    @Autowired
    private final ClinicAdminServiceClient clinicAdminServiceClient;

    private Response validateChangePasswordRequest(String username, ChangeDoctorPasswordDTO updateDTO) {
        if (username == null || username.isBlank()) {
       return Response.builder().success(false).status(400).message("Username must not be empty").build();
        }

        if (updateDTO == null) {
        return Response.builder().success(false).status(400) .message("Request body is missing").build();
        }

        if (updateDTO.getCurrentPassword() == null || updateDTO.getCurrentPassword().isBlank()) {
            return Response.builder().success(false).status(400).message("Current password must not be empty").build();
        }

        if (updateDTO.getNewPassword() == null || updateDTO.getNewPassword().isBlank()) {
          return Response.builder().success(false).status(400).message("New password must not be empty").build();
        }

        if (updateDTO.getConfirmPassword() == null || updateDTO.getConfirmPassword().isBlank()) {
         return Response.builder().success(false).status(400).message("Confirm password must not be empty").build();
        }

        if (!updateDTO.getNewPassword().equals(updateDTO.getConfirmPassword())) {
         return Response.builder().success(false).status(400).message("New password and confirm password do not match").build();
        }

        if (updateDTO.getNewPassword().length() < 6) {
         return Response.builder().success(false).status(400).message("Password must be at least 6 characters").build();
        }

        return null; 
    }

    @Override
    public Response changePassword(String username, ChangeDoctorPasswordDTO updateDTO) {
        Response validationResponse = validateChangePasswordRequest(username, updateDTO);
        if (validationResponse != null) {
            return validationResponse;
        }

        try {
            
            return clinicAdminServiceClient.changePassword(username, updateDTO);

        } catch (Exception ex) {
   
            return Response.builder().success(false).status(500).message("Failed to change password " ).build();
        }
    }


    @Override
    public Response login(DoctorLoginDTO loginDTO) {
        if (loginDTO == null) {
            return Response.builder().success(false).status(400).message("Login data is missing").build();
        }

        if (loginDTO.getUsername() == null || loginDTO.getUsername().isBlank()) {
            return Response.builder().success(false).status(400).message("Username must not be empty").build();
        }

        if (loginDTO.getPassword() == null || loginDTO.getPassword().isBlank()) {
            return Response.builder().success(false).status(400).message("Password must not be empty").build();
        }

        try {
            return clinicAdminServiceClient.login(loginDTO);

        } catch (FeignException fe) {
            String errorMessage = "Login failed";
            int statusCode = fe.status();

            try {
                String body = fe.contentUTF8();
                int msgIndex = body.indexOf("\"message\":\"");
                if (msgIndex != -1) {
                    int start = msgIndex + 10;
                    int end = body.indexOf("\"", start);
                    if (end != -1) {
                        errorMessage = body.substring(start, end);
                    }
                }
            } catch (Exception e) {
                errorMessage = "Unable to read error from ClinicAdmin";
            }

            return Response.builder().success(false).status(statusCode).message(errorMessage).build();
        } catch (Exception ex) {
            return Response.builder().success(false).status(500).message("Internal server error during login").build();
        }
    }

	@Override
	public Response updateDoctorAvailability(String doctorId, DoctorAvailabilityStatusDTO availabilityDTO) {
	    if(doctorId==null || doctorId.isBlank()) {
	    	return Response.builder().success(false).status(400) .message("Doctor ID must not be empty").build();
	    }

    	if(availabilityDTO == null) {
    		return Response.builder().success(false).status(400).message("Availability status is missing").build();
    	}
    	try {
    		return clinicAdminServiceClient.updateDoctorAvailability(doctorId, availabilityDTO);
    	}
    	catch (Exception ex) {
			return Response.builder().success(false).status(500).message("Failed to update doctor availability status").build();
					
		}
    }
}

