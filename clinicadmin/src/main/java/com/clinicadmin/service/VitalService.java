
package com.clinicadmin.service;

import com.clinicadmin.dto.Response;
import com.clinicadmin.dto.VitalsDTO;

public interface VitalService {

	public Response postVitalsById(String patientId, VitalsDTO dto);

	public Response updateVitals(String patientId, VitalsDTO dto);

	public Response getVitalsByPatientId(String patientId);

	public Response deleteVitals(String patiendId);

}