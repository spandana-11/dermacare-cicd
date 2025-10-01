package com.clinicadmin.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clinicadmin.dto.BookingResponse;
import com.clinicadmin.dto.BookingResponseDTO;
import com.clinicadmin.dto.Response;
import com.clinicadmin.service.BookingService;

@RestController
@RequestMapping("/clinic-admin")
//@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class BookingServiceController {

	@Autowired
	BookingService bookingService; 
	
	@GetMapping("/getAllbookingsDetailsByBranchId/{branchId}")
	public ResponseEntity<Response> getAllbookingsDetailsByBranchId(@PathVariable String branchId) {
		Response response = bookingService.getAllBookedServicesDetailsByBranchId(branchId);
		return ResponseEntity.status(response.getStatus()).body(response);
	}
	
	@GetMapping("/getAllbookingsDetailsByClinicAndBranchId/{clinicId}/{branchId}")
	public ResponseEntity<?> getAllbookingsDetailsByClinicAndBranchId(@PathVariable String clinicId,@PathVariable String branchId) {
		return bookingService.getBookingsByClinicIdWithBranchId(clinicId,branchId);
		
	}
	
	
	@GetMapping("/appointments/byIds/{clinicId}/{branchId}")
	public ResponseEntity<?> retrieveTodayAndTomorrowAndDayAfterTomorrowAppointments(@PathVariable String clinicId,@PathVariable String branchId) {
		return bookingService.retrieveTodayAndTomorrowAndDayAfterTomorrowAppointments(clinicId, branchId);
	
	}
	
	
	@GetMapping("/appointments/byIdsAndDate/{clinicId}/{branchId}/{date}")
	public ResponseEntity<?> retrieveAppointnmentsByServiceDate(@PathVariable String clinicId,@PathVariable String branchId,@PathVariable String date) {
	return bookingService.retrieveAppointnmentsByServiceDate(clinicId, branchId, date);		
	}
	
	
	@PutMapping("/updateAppointmentBasedOnBookingId")
	public ResponseEntity<?> updateAppointmentBasedOnBookingId(@RequestBody BookingResponseDTO bookingResponse) {
		return bookingService.updateAppointmentBasedOnBookingId(bookingResponse);
		
	}
	
	
}
