package com.dermacare.bookingService.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.dermacare.bookingService.entity.Booking;

@Repository
public interface BookingServiceRepository extends MongoRepository<Booking,String> {

	 public  List<Booking> findByMobileNumber(String mobileNumber);
	 public  List<Booking> findByDoctorId(String doctorId);
	 public  List<Booking> findBySubServiceId(String subServiceId);
	 public  List<Booking> findByClinicId(String clinicId);
	public Optional<Booking> findByBookingId(String bookingId);
	 
}
