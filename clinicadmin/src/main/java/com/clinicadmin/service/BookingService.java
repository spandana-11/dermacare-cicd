package com.clinicadmin.service;

import java.util.List;

import org.springframework.http.ResponseEntity;
import com.clinicadmin.dto.BookingResponse;
import com.clinicadmin.dto.BookingResponseDTO;
import com.clinicadmin.dto.Response;
import com.clinicadmin.dto.ResponseStructure;

public interface BookingService {
	public Response deleteBookedService(String id);

	Response getAllBookedServicesDetailsByBranchId(String branchId);
	
	public ResponseEntity<ResponseStructure<List<BookingResponseDTO>>> getBookingsByClinicIdWithBranchId(String clinicId, String branchId);
	public ResponseEntity<?> retrieveTodayAndTomorrowAndDayAfterTomorrowAppointments(String clinicId, String branchId);

	public ResponseEntity<?> retrieveAppointnmentsByServiceDate(String clinicId, String branchId,String date);
	
	public ResponseEntity<?> updateAppointmentBasedOnBookingId(BookingResponseDTO bookingResponse);


}
