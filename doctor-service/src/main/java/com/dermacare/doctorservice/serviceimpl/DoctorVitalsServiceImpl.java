package com.dermacare.doctorservice.serviceimpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.dermacare.doctorservice.dto.Response;
import com.dermacare.doctorservice.dto.VitalsDTO;
import com.dermacare.doctorservice.feignclient.ClinicAdminServiceClient;
import com.dermacare.doctorservice.service.DoctorVitalsService;

@Service
public class DoctorVitalsServiceImpl implements DoctorVitalsService {

    @Autowired
    private ClinicAdminServiceClient clinicAdminServiceClient;

    @Override
    public ResponseEntity<Response> addVitals(String patientId, VitalsDTO dto) {
        return extractErrorResponse(clinicAdminServiceClient.addVitals(patientId, dto));
    }

    @Override
    public ResponseEntity<Response> getVitals(String patientId) {
        return extractErrorResponse(clinicAdminServiceClient.getVitals(patientId));
    }

    @Override
    public ResponseEntity<Response> deleteVitals(String patientId) {
        return extractErrorResponse(clinicAdminServiceClient.delVitals(patientId));
    }

    @Override
    public ResponseEntity<Response> updateVitals(String patientId, VitalsDTO dto) {
        return extractErrorResponse(clinicAdminServiceClient.updateVitals(patientId, dto));
    }

    /**
     * Only return the response if it's an error (non-2xx status).
     * Otherwise return null or your own success response.
     */
    private ResponseEntity<Response> extractErrorResponse(ResponseEntity<Response> responseEntity) {
        if (!responseEntity.getStatusCode().is2xxSuccessful()) {
            // Return only the error body & status
            return ResponseEntity
                    .status(responseEntity.getStatusCode())
                    .body(responseEntity.getBody());
        }
        return null; // no error
    }
}
