package com.clinicadmin.sevice.impl;

import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import com.clinicadmin.dto.BookingResponse;
import com.clinicadmin.dto.BookingResponseDTO;
import com.clinicadmin.dto.Response;
import com.clinicadmin.dto.ResponseStructure;
import com.clinicadmin.feignclient.BookingFeign;
import com.clinicadmin.service.BookingService;
import com.clinicadmin.utils.ExtractFeignMessage;

import feign.FeignException;

@Service
public class BookingServiceImpl implements BookingService {
	@Autowired
	BookingFeign bookingFeign;

	@Override
	public Response deleteBookedService(String id) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Response getAllBookedServicesDetailsByBranchId(String branchId) {
		Response response = new Response();
		try {
			ResponseEntity<ResponseStructure<List<BookingResponse>>> res = bookingFeign
					.getAllBookedServicesByBranchId(branchId);

			if (res == null || !res.hasBody() || res.getBody().getData() == null || res.getBody().getData().isEmpty()) {
				response.setStatus(200);
				response.setMessage("Bookings Not Found");
				response.setSuccess(true);
				response.setData(Collections.emptyList());
				return response;
			}

			// ✅ Convert ResponseStructure to Response
			ResponseStructure<List<BookingResponse>> body = res.getBody();
			response.setStatus(body.getStatusCode());
			response.setMessage(body.getMessage());
			response.setSuccess(body.getHttpStatus().is2xxSuccessful());
			response.setData(body.getData());

			return response;

		} catch (FeignException e) {
			response.setStatus(e.status());
			response.setMessage(ExtractFeignMessage.clearMessage(e));
			response.setSuccess(false);
			response.setData(null);
			return response;
		}
	}
	
	@Override
	public ResponseEntity<ResponseStructure<List<BookingResponseDTO>>> getBookingsByClinicIdWithBranchId(String clinicId, String branchId) {
	    ResponseStructure<List<BookingResponseDTO>> res = new ResponseStructure<>();
	    try {
	        return bookingFeign.getBookedServicesByClinicIdWithBranchId(clinicId, branchId);
	    } catch (FeignException e) {
	        res = new ResponseStructure<>(null, ExtractFeignMessage.clearMessage(e), HttpStatus.INTERNAL_SERVER_ERROR, e.status());
	        return ResponseEntity.status(res.getStatusCode()).body(res);
	    }
	}
	
	@Override
	public ResponseEntity<?> retrieveTodayAndTomorrowAndDayAfterTomorrowAppointments(String clinicId, String branchId) {
	    ResponseStructure<List<BookingResponse>> res = new ResponseStructure<>();
	    try {
	        return bookingFeign.retrieveTodayAndTomorrowAndDayAfterTomorrowAppointments(clinicId, branchId);
	    } catch (FeignException e) {
	        res = new ResponseStructure<>(null, ExtractFeignMessage.clearMessage(e),null, e.status());
	        return ResponseEntity.status(res.getStatusCode()).body(res);
	    }
	}

	
	@Override
	public ResponseEntity<?> retrieveAppointnmentsByServiceDate(String clinicId, String branchId,String date) {
	    ResponseStructure<List<BookingResponse>> res = new ResponseStructure<>();
	    try {
	        return bookingFeign.retrieveAppointnmentsByServiceDate(clinicId,branchId,date);
	    } catch (FeignException e) {
	        res = new ResponseStructure<>(null, ExtractFeignMessage.clearMessage(e), HttpStatus.INTERNAL_SERVER_ERROR, e.status());
	        return ResponseEntity.status(res.getStatusCode()).body(res);
	    }
	}
	
	@Override
	public ResponseEntity<?> updateAppointmentBasedOnBookingId(BookingResponse bookingResponse) {
	    ResponseStructure<List<BookingResponse>> res = new ResponseStructure<>();
	    try {
	        return bookingFeign.updateAppointment(bookingResponse);
	    } catch (FeignException e) {
	        res = new ResponseStructure<>(null, ExtractFeignMessage.clearMessage(e), HttpStatus.INTERNAL_SERVER_ERROR, e.status());
	        return ResponseEntity.status(res.getStatusCode()).body(res);
	    }
	}
}
