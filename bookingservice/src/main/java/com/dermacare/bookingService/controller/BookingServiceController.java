package com.dermacare.bookingService.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dermacare.bookingService.dto.BookingRequset;
import com.dermacare.bookingService.dto.BookingResponse;
import com.dermacare.bookingService.service.BookingService_Service;
import com.dermacare.bookingService.util.ResponseStructure;

@RestController
@RequestMapping("/v1")
public class BookingServiceController {


	@Autowired
	private BookingService_Service service;


	@PostMapping("/bookService")
	public ResponseEntity<ResponseStructure<BookingResponse>> bookService(@RequestBody BookingRequset req) {
		BookingResponse response = service.addService(req);
		if(response != null) {
		return new ResponseEntity<>(ResponseStructure.buildResponse(response, "Service Booked Sucessfully",
				HttpStatus.CREATED, HttpStatus.CREATED.value()), HttpStatus.CREATED);}
		else {
			return new ResponseEntity<>(ResponseStructure.buildResponse(null, "Incorrect Json Body",
					HttpStatus.BAD_REQUEST, HttpStatus.BAD_REQUEST.value()), HttpStatus.BAD_REQUEST);}}
	

	@DeleteMapping("/deleteService/{id}")
	public ResponseEntity<ResponseStructure<BookingResponse>> deleteBookedService(@PathVariable String id) {
		BookingResponse response = service.deleteService(id);
		if(response != null) {
			return new ResponseEntity<>(ResponseStructure.buildResponse(response, "Booked Service Fetched Sucessfully",
					HttpStatus.OK, HttpStatus.OK.value()), HttpStatus.OK);}
			else {
				return new ResponseEntity<>(ResponseStructure.buildResponse(null, "Booked Service Not Found",
						HttpStatus.OK, HttpStatus.OK.value()), HttpStatus.OK);}}
	
	

	@GetMapping("/getBookedServiceById/{id}")
	public ResponseEntity<ResponseStructure<BookingResponse>> getBookedService(@PathVariable String id) {
		BookingResponse response = service.getBookedService(id);
		if(response != null) {
		return new ResponseEntity<>(ResponseStructure.buildResponse(response, "Booked Service Fetched Sucessfully",
				HttpStatus.OK, HttpStatus.OK.value()), HttpStatus.OK);}
		else {
			return new ResponseEntity<>(ResponseStructure.buildResponse(null, "Booked Service Not Found",
					HttpStatus.OK, HttpStatus.OK.value()), HttpStatus.OK);}
	}

	
	@GetMapping("/getBookedServicesByMobileNumber/{mobileNumber}")
	public ResponseEntity<ResponseStructure<List<BookingResponse>>> getCustomerBookedServices(
			@PathVariable String mobileNumber) {
		List<BookingResponse> response = service.getBookedServices(mobileNumber);
		if (response == null || response.isEmpty()) {
			return new ResponseEntity<>(ResponseStructure.buildResponse(null, "Customer does not have any booking",
					HttpStatus.OK, HttpStatus.OK.value()), HttpStatus.OK);
		}
		return new ResponseEntity<>(ResponseStructure.buildResponse(response, "Booked Service Fetched Sucessfully",
				HttpStatus.OK, HttpStatus.OK.value()), HttpStatus.OK);
	}

	
	@GetMapping("/getAllBookedServices")
	public ResponseEntity<ResponseStructure<List<BookingResponse>>> getAllBookedService() {
	    List<BookingResponse> response = service.getAllBookedServices();

	    if (response.isEmpty()) {
	        return new ResponseEntity<>(
	                ResponseStructure.buildResponse(null,
	                        "Customer does not have any booking",
	                        HttpStatus.OK,
	                        HttpStatus.OK.value()),
	                HttpStatus.OK);
	    }

	    return new ResponseEntity<>(
	            ResponseStructure.buildResponse(response,
	                    "Booked Service Fetched Successfully",
	                    HttpStatus.OK,
	                    HttpStatus.OK.value()),
	            HttpStatus.OK);
	}

	@GetMapping("/getAllBookedServices/{doctorId}")
	public ResponseEntity<ResponseStructure<List<BookingResponse>>> getBookingByDoctorId(@PathVariable String doctorId) {

		List<BookingResponse> response = service.bookingByDoctorId(doctorId);
		if (response == null || response.isEmpty()) {
			return new ResponseEntity<>(ResponseStructure.buildResponse(null,
					"Docotor Does not involved in any Booking yet ", HttpStatus.OK, HttpStatus.OK.value()),
					HttpStatus.OK);
		}
		return new ResponseEntity<>(ResponseStructure.buildResponse(response,
				"Booked Service Fetched Sucessfully on DoctorId" + doctorId, HttpStatus.OK, HttpStatus.OK.value()),
				HttpStatus.OK);

	}

	@GetMapping("/getBookedServicesByServiceId/{serviceId}")
	public ResponseEntity<ResponseStructure<List<BookingResponse>>> getBookingByServiceId(@PathVariable String serviceId) {

		List<BookingResponse> response = service.bookingByServiceId(serviceId);
		if (response == null || response.isEmpty()) {
			return new ResponseEntity<>(ResponseStructure.buildResponse(null,
					"Service Does not Booked by AnyOne" + serviceId, HttpStatus.OK, HttpStatus.OK.value()),
					HttpStatus.OK);
		}
		return new ResponseEntity<>(ResponseStructure.buildResponse(response,
				"Booking fetched sucessfully on ServiceId" + serviceId, HttpStatus.OK, HttpStatus.OK.value()),
				HttpStatus.OK);

	}
	
	
	@GetMapping("/getBookedServicesByClinicId/{clinicId}")
	public ResponseEntity<ResponseStructure<List<BookingResponse>>> getBookingByClinicId(@PathVariable String clinicId) {

		List<BookingResponse> response = service.bookingByClinicId(clinicId);
		if (response == null || response.isEmpty()) {
			return new ResponseEntity<>(ResponseStructure.buildResponse(null,
					"Clinic  Does not have any booking yet" + clinicId, HttpStatus.OK, HttpStatus.OK.value()),
					HttpStatus.OK);
		}
		return new ResponseEntity<>(ResponseStructure.buildResponse(response,
				"Booking fetched sucessfully on clinicId" + clinicId, HttpStatus.OK, HttpStatus.OK.value()),
				HttpStatus.OK);

	}

	
	@PutMapping("/updateAppointment")
	public ResponseEntity<?> updateAppointment(@RequestBody BookingResponse bookingResponse ){
		return service.updateAppointment(bookingResponse);
	
	}
	
	

}
