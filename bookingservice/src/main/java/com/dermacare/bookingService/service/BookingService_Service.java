package com.dermacare.bookingService.service;

import java.util.List;

import org.springframework.http.ResponseEntity;

import com.dermacare.bookingService.dto.BookingRequset;
import com.dermacare.bookingService.dto.BookingResponse;

public interface BookingService_Service {

	public BookingResponse addService(BookingRequset req);
	public BookingResponse deleteService(String id);
	public BookingResponse getBookedService(String id);
	public List<BookingResponse> getBookedServices(String mobileNumber);
	public List<BookingResponse> getAllBookedServices();
	public List<BookingResponse> bookingByDoctorId(String doctorId);
	public List<BookingResponse> bookingByServiceId(String serviceId);
	public List<BookingResponse> bookingByClinicId(String clinicId);
	public ResponseEntity<?> updateAppointment(BookingResponse bookingResponse);

}
