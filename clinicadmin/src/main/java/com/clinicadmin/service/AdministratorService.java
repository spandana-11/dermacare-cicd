package com.clinicadmin.service;

import com.clinicadmin.dto.AdministratorDTO;
import com.clinicadmin.dto.Response;

public interface AdministratorService {

 	Response administratorOnboarding(AdministratorDTO dto);

	Response getAllAdministratorsByClinic(String clinicId);

	Response getAdministratorById(String clinicId, String adminId);

	Response updateAdministrator(String clinicId, String adminId, AdministratorDTO dto);
	
	Response deleteAdministrator(String clinicId, String adminId);

}
