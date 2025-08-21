package com.AdminService.service;

import com.AdminService.dto.StoreUpdatedQAInClinicsDTO;
import com.AdminService.util.Response;

public interface StoreUpdatedQAInClinicsService {
	
	public Response saveQaAndAnswers(String id);

	Response updateQaAndAnswers(String storeUpdatedQAInClinicsDTO, StoreUpdatedQAInClinicsDTO dto);

	Response getById(String id);

	Response getAll();

	Response deleteById(String id);

}
