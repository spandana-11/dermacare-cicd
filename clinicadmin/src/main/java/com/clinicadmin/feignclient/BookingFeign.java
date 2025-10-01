package com.clinicadmin.feignclient;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.clinicadmin.dto.BookingResponse;
import com.clinicadmin.dto.BookingResponseDTO;
import com.clinicadmin.dto.Response;
import com.clinicadmin.dto.ResponseStructure;

@FeignClient(value = "bookingservice")
public interface BookingFeign {

	@GetMapping("/api/v1/getBookedServiceById/{id}")
	public ResponseEntity<ResponseStructure<BookingResponseDTO>> getBookedService(@PathVariable String id);
	
	
	@GetMapping("/api/v1/getAppointmentByPatientId/{patientId}")
	public ResponseEntity<?> getAppointmentByPatientId(@PathVariable String patientId);
	
	@PutMapping("/api/v1/updateAppointment")
	public ResponseEntity<?> updateAppointment(@RequestBody BookingResponseDTO res );
	
	//---------------------------to get patientdetails by bookingId,pateintId,mobileNumber---------------------------
	@GetMapping("/api/v1/getPatientDetailsForConsetForm/{bookingId}/{patientId}/{mobileNumber}")
	public ResponseEntity<Response> getPatientDetailsForConsentForm(@PathVariable String bookingId,@PathVariable String patientId,@PathVariable String mobileNumber);

	
	
	@PutMapping("/api/v1/updateAppointment")
	public ResponseEntity<?> updateAppointment(@RequestBody BookingResponse bookingResponse );
	
//	@PostMapping("/api/v1/bookService")
//	public ResponseEntity<ResponseStructure<BookingResponse>> bookService(@RequestBody BookingRequset req);
	
	@DeleteMapping("/api/v1/deleteService/{id}")
	//@CircuitBreaker(name = "circuitBreaker", fallbackMethod = "deleteBookedServiceFallBack")
	public ResponseEntity<ResponseStructure<BookingResponse>> deleteBookedService(@PathVariable String id);
	
	@GetMapping("/api/v1/getBookedServicesByMobileNumber/{mobileNumber}")
	public ResponseEntity<ResponseStructure<List<BookingResponse>>> getCustomerBookedServices(
			@PathVariable String mobileNumber);
	
	@GetMapping("/api/v1/getAllBookedServices")
	public ResponseEntity<ResponseStructure<List<BookingResponse>>> getAllBookedService();
	
	@GetMapping("/api/v1/getAllBookedServices/{doctorId}")
	public ResponseEntity<ResponseStructure<List<BookingResponse>>> getBookingByDoctorId(@PathVariable String doctorId);

	@GetMapping("/api/v1/getBookedServicesByServiceId/{serviceId}")
	public ResponseEntity<ResponseStructure<List<BookingResponse>>> getBookingByServiceId(@PathVariable String serviceId);
	
	@GetMapping("/api/v1/getBookedServicesByClinicId/{clinicId}")
	public ResponseEntity<ResponseStructure<List<BookingResponse>>> getBookingByClinicId(@PathVariable String clinicId);

	
	@GetMapping("/api/v1/getInProgressAppointments/{mobilenumber}")
	public ResponseEntity<?> inProgressAppointments(@PathVariable String mobilenumber);
	
	@GetMapping("/api/v1/getAllBookedServicesByBranchId/{branchId}")
	public ResponseEntity<ResponseStructure<List<BookingResponse>>> getAllBookedServicesByBranchId(@PathVariable String branchId);
	
	@GetMapping("/api/v1/getBookedServicesByClinicIdWithBranchId/{clinicId}/{branchId}")
	public ResponseEntity<ResponseStructure<List<BookingResponseDTO>>> getBookedServicesByClinicIdWithBranchId(
	        @PathVariable String clinicId,
	        @PathVariable String branchId);
	
	@GetMapping("/api/v1/appointments/byIds/{clinicId}/{branchId}")
	public ResponseEntity<?> retrieveTodayAndTomorrowAndDayAfterTomorrowAppointments(@PathVariable String clinicId,@PathVariable String branchId);
	
	@GetMapping("/api/v1/appointments/byIdsAndDate/{clinicId}/{branchId}/{date}")
	public ResponseEntity<?> retrieveAppointnmentsByServiceDate(@PathVariable String clinicId,@PathVariable String branchId,@PathVariable String date);
	
	@PutMapping("/api/v1/updateAppointmentBasedOnBookingId")
	public ResponseEntity<?> updateAppointmentBasedOnBookingId(@RequestBody BookingResponse bookingResponse );
	
}