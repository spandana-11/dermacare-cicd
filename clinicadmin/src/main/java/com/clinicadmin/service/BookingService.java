package com.clinicadmin.service;

import com.clinicadmin.dto.Response;

public interface BookingService {
	public Response deleteBookedService(String id);

	Response getAllBookedServicesDetailsByBranchId(String branchId);

	Response getBookedServicesDetailsByClinicIdWithBranchId(String clinicId, String branchId);
}
