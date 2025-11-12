package com.clinicadmin.sevice.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.clinicadmin.dto.Response;
import com.clinicadmin.feignclient.DoctorServiceFeign;
import com.clinicadmin.service.DoctorSaveDetailsFeignImplService;

@Service
public class DoctorSaveDetailsFeignImplServiceImpl implements DoctorSaveDetailsFeignImplService {
	@Autowired
	DoctorServiceFeign doctorServiceFeign;

	@Override
	public ResponseEntity<Response> getVisitHistoryByPatientId(String patientId) {
		ResponseEntity<Response> response = doctorServiceFeign.getVisitHistoryByPatientId(patientId);
		return response;
	}

}
