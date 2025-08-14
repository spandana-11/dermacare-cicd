package com.dermacare.bookingService.service;

import java.util.List;

import org.springframework.http.ResponseEntity;

import com.dermacare.bookingService.dto.BookingRequset;
import com.dermacare.bookingService.dto.BookingResponse;
import com.dermacare.bookingService.util.Response;

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
	
	public ResponseEntity<?> getAppointsByPatientId(String patientId);
	public ResponseEntity<?> getAppointsByInput(String input);
	public ResponseEntity<?> getTodayDoctorAppointmentsByDoctorId(String hospitalId,String doctorId);
	public ResponseEntity<?> filterDoctorAppointmentsByDoctorId(String hospitalId,String doctorId,String number);
	public ResponseEntity<?> getCompletedApntsByDoctorId(String hospitalId,String doctorId);
	public ResponseEntity<?> getSizeOfConsultationTypesByDoctorId(String hospitalId,String doctorId);
	public Response getPatientDetailsForConsetForm(String bookingId, String patientId, String mobileNumber);
	public ResponseEntity<?> getInProgressAppointments(String number,String patientId);
}
