package com.dermacare.bookingService.service.Impl;


import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import com.dermacare.bookingService.dto.BookingRequset;
import com.dermacare.bookingService.dto.BookingResponse;
import com.dermacare.bookingService.entity.Booking;
import com.dermacare.bookingService.entity.ReportsList;
import com.dermacare.bookingService.producer.KafkaProducer;
import com.dermacare.bookingService.repository.BookingServiceRepository;
import com.dermacare.bookingService.service.BookingService_Service;
import com.dermacare.bookingService.util.ResponseStructure;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class BookingService_ServiceImpl implements BookingService_Service {


	@Autowired
	private BookingServiceRepository repository;
	
	@Autowired
	private KafkaProducer kafkaProducer;

	@Override
	public BookingResponse addService(BookingRequset request) {
		Booking entity = toEntity(request);
		entity.setStatus("Pending");
		Booking res = repository.save(entity);
		res.setReports(null);
		res.setNotes(null);
		res.setAttachments(null);
		try {
			kafkaProducer.publishBooking(res);
			}catch (Exception e) {
				throw new RuntimeException("Unable to book service");
			}
		return toResponse(entity);
	}

	private Booking toEntity(BookingRequset request) {
		Booking entity = new ObjectMapper().convertValue(request,Booking.class );
		//entity.setMobileNumber(Long.parseLong(request.getMobileNumber()));
		ZonedDateTime istTime = ZonedDateTime.now(ZoneId.of("Asia/Kolkata"));
	    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a");
	    String formattedTime = istTime.format(formatter);
		entity.setBookedAt(formattedTime);
		if(request.getConsultationType().equalsIgnoreCase("video consultation") || request.getConsultationType().equalsIgnoreCase("online consultation") ) {
			entity.setChannelId(randomNumber());
		}else {
			entity.setChannelId(null) ;
		}
		List<Booking> existingBooking = repository.findByRelationIgnoreCaseAndMobileNumber(request.getRelation(),request.getMobileNumber());
		if(existingBooking != null && !existingBooking.isEmpty()) {
		for(Booking b : existingBooking) {
		if(b != null) {
			entity.setPatientId(b.getPatientId());
		}}}
		else {
			entity.setPatientId(generatePatientId());}
		return entity;
	}
	
	
	private static BookingResponse toResponse(Booking entity) {
		BookingResponse response = new ObjectMapper().convertValue(entity,BookingResponse.class );
		response.setBookingId(String.valueOf(entity.getBookingId()));
		return response;
	}
	
	
	  private static String generatePatientId() {	       
	        String uuid = UUID.randomUUID().toString();
	        String randomPart = uuid.replaceAll("-", "").substring(0, 8).toUpperCase();
	        return "PA" + randomPart;
	    }
	
	
	private static String randomNumber() {
        Random random = new Random();    
        int sixDigitNumber = 100000 + random.nextInt(900000); // Generates number from 100000 to 999999
        return String.valueOf(sixDigitNumber);
    }

	private List<BookingResponse> toResponses(List<Booking> bookings) {
		return bookings.stream().map(BookingService_ServiceImpl::toResponse).toList();
	}
	
	
	public ResponseEntity<?> getAppointsByPatientId(String patientId) {
		ResponseStructure<List<BookingResponse>> res = new ResponseStructure<List<BookingResponse>>();
		    try {
			List<Booking> existingBooking = repository.findByPatientId(patientId);
			if(existingBooking != null && !existingBooking.isEmpty() ) {
			List<BookingResponse> respnse = new ObjectMapper().convertValue(existingBooking, new TypeReference<List<BookingResponse>>() {});
			res.setStatusCode(200);
			res.setData(respnse);
			res.setMessage("Appointments Are Found");
			return ResponseEntity.status(200).body(res); 
			}
			else{
				res.setStatusCode(200);
				res.setMessage("Appointments Are Not Found");
				return ResponseEntity.status(200).body(res);}
		    }catch(Exception e) {
			res.setStatusCode(500);
			res.setMessage(e.getMessage());
			return ResponseEntity.status(500).body(res);
		}
	}

	
	
	public ResponseEntity<?> getAppointsByInput(String input) {
		ResponseStructure<List<BookingResponse>> res = new ResponseStructure<List<BookingResponse>>();
		try {
			List<Booking> existingBooking = repository.findByNameIgnoreCaseOrBookingIdOrPatientId(input);
			if(existingBooking != null && !existingBooking.isEmpty() ) {
			List<BookingResponse> respnse = new ObjectMapper().convertValue(existingBooking, new TypeReference<List<BookingResponse>>() {});
			res.setStatusCode(200);
			res.setData(respnse);
			res.setMessage("Appointments Are Found");
			return ResponseEntity.status(200).body(res); 
			}
			else {
				res.setStatusCode(200);
				res.setMessage("Appointments Are Not Found");
				return ResponseEntity.status(200).body(res);
			}
		}catch(Exception e) {
			res.setStatusCode(500);
			res.setMessage(e.getMessage());
			return ResponseEntity.status(500).body(res);
		}
	}
	
	
	public ResponseEntity<?> getTodayDoctorAppointmentsByDoctorId(String hospitalId,String doctorId) {
		ResponseStructure<List<BookingResponse>> res = new ResponseStructure<List<BookingResponse>>();
		try {
			List<Booking> existingBooking = repository.findByClinicIdAndDoctorId(hospitalId, doctorId);
			List<BookingResponse> respnse = new ArrayList<>();
			if(existingBooking != null && !existingBooking.isEmpty()) {
			for(Booking b : existingBooking) {
			DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
			String currentDate = LocalDate.now().format(dateFormatter);	
			if(b.getServiceDate().equals(currentDate)) {
			respnse.add(toResponse(b));}}
			if(respnse != null && !respnse.isEmpty()){
			res.setStatusCode(200);
			res.setData(respnse);
			res.setMessage("Appointments Are Found");}
			else {
				res.setStatusCode(200);
				res.setData(respnse);
				res.setMessage("Appointments With Today Date Are Not Found");}
			}else {
				res.setStatusCode(200);
				res.setData(respnse);
				res.setMessage("Appointments Are Not Found");}
		}catch(Exception e) {
			res.setStatusCode(500);
			res.setMessage(e.getMessage());}
		return ResponseEntity.status(res.getStatusCode()).body(res);
	}
	
	
	
	public ResponseEntity<?> filterDoctorAppointmentsByDoctorId(String hospitalId,String doctorId,String number) {
		ResponseStructure<List<BookingResponse>> res = new ResponseStructure<List<BookingResponse>>();
		List<BookingResponse> resnse = new ArrayList<>();
		try {
			List<Booking> existingBooking = repository.findByClinicIdAndDoctorId(hospitalId, doctorId);
			if(existingBooking != null && !existingBooking.isEmpty()) {
			for(Booking b : existingBooking) {
			switch(number) {
			case "1" :if(b.getConsultationType().equalsIgnoreCase("Services & Treatments") || b.getConsultationType().equalsIgnoreCase("In-Clinic Consultation")){
				if(b.getStatus().equalsIgnoreCase("Confirmed")) {
					resnse.add(toResponse(b));
					if(resnse != null && !resnse.isEmpty()) {
						res.setStatusCode(200);
						res.setData(resnse);
						res.setMessage("Appointments Are Found");}
					}else{
						res.setStatusCode(200);
						res.setData(resnse);
						res.setMessage("Appointments Are Not Found");	
						}}else{
							res.setStatusCode(200);
							res.setData(resnse);
							res.setMessage("Appointments Are Not Found");}
			           break;
			
				case "2":if(b.getConsultationType().equalsIgnoreCase("Online Consultation")) {
					if(b.getStatus().equalsIgnoreCase("Confirmed")) {
						resnse.add(toResponse(b));
						res.setStatusCode(200);
						res.setData(resnse);
						res.setMessage("Appointments Are Found");
						}else {
							res.setStatusCode(200);
							res.setData(resnse);
							res.setMessage("Appointments Are Not Found");
						}}else{
							res.setStatusCode(200);
							res.setData(resnse);
							res.setMessage("Appointments Are Not Found");}
				            break;
				       
				case "3":if(b.getStatus().equalsIgnoreCase("Completed")) {
					resnse.add(toResponse(b));
					res.setStatusCode(200);
					res.setData(resnse);
					res.setMessage("Appointments Are Found");
				}else{
					res.setStatusCode(200);
					res.setData(resnse);
					res.setMessage("Appointments Are Not Found");}
				    break;
				
			    default:
					    resnse = null;
				        res.setStatusCode(200);
				        res.setData(resnse);
				        res.setMessage("Appointments Are Not Found");}
			}}}catch(Exception e) {
			      resnse = null;
			      res.setStatusCode(500);
			      res.setData(resnse);
			      res.setMessage("Appointments Are Not Found");}
	      return ResponseEntity.status(res.getStatusCode()).body(res);}
							

		
	public ResponseEntity<?> getCompletedApntsByDoctorId(String hospitalId,String doctorId) {
		    Map<String,Object> m = new LinkedHashMap<>();
		try {
			List<Booking> existingBooking = repository.findByClinicIdAndDoctorId(hospitalId, doctorId);
			List<BookingResponse> res = new ArrayList<>();
			if(existingBooking != null) {
			for(Booking b : existingBooking) {
			if(b.getStatus().equalsIgnoreCase("Completed")) {
			res.add(toResponse(b));}}
			 m.put("completedAppointmentsCount",res.size());
			 m.put("status",200);
			 return ResponseEntity.status(200).body(m);
			}else {
				 m.put("Message","No Appointsments Found");
				 m.put("status",200);
				return ResponseEntity.status(200).body(m);
			}
		}catch(Exception e) {
			 m.put("Message",e.getMessage());
			 m.put("status",500);
			return ResponseEntity.status(500).body(m);}
	}
	
	
	public ResponseEntity<?> getSizeOfConsultationTypesByDoctorId(String hospitalId,String doctorId) {
	    Map<String,Object> m = new LinkedHashMap<>();
	try {
		List<Booking> existingBooking = repository.findByClinicIdAndDoctorId(hospitalId, doctorId);
		List<BookingResponse> servicesAndConsul = new ArrayList<>();
		List<BookingResponse> inClinic = new ArrayList<>();
		List<BookingResponse> online = new ArrayList<>();
		if(existingBooking != null) {
		for(Booking b : existingBooking) {
		if(b.getStatus().equalsIgnoreCase("Completed")) {
		if(b.getConsultationType().equalsIgnoreCase("Services & Treatments")) {
		servicesAndConsul.add(toResponse(b));}
		if(b.getConsultationType().equalsIgnoreCase("In-Clinic Consultation")){
			inClinic.add(toResponse(b));}
		if(b.getConsultationType().equalsIgnoreCase("Online Consultation")){
			online.add(toResponse(b));}
		}}
		 m.put("services & Treatments",servicesAndConsul.size());
		 m.put("in-Clinic Consultation",inClinic.size());
		 m.put("online Consultation",online.size());
		 m.put("status",200);
		 return ResponseEntity.status(200).body(m);
		}else {
			 m.put("Message","No Appointsments Found");
			 m.put("status",200);
			return ResponseEntity.status(200).body(m);}
	}catch(Exception e) {
		 m.put("Message",e.getMessage());
		 m.put("status",500);
		return ResponseEntity.status(500).body(m);}
}
	
	
		
	public BookingResponse getBookedService(String id) {
		Booking entity = repository.findByBookingId(id)
				.orElseThrow(() -> new RuntimeException("Invalid Booking Id Please provide Valid Id"));
		return toResponse(entity);
	}

	@Override
	public BookingResponse deleteService(String id) {
		Booking entity = repository.findByBookingId(id)
				.orElseThrow(() -> new RuntimeException("Invalid Booking Id Please provide Valid Id"));
		repository.deleteById(id);
		return toResponse(entity);
	}

	@Override
	public List<BookingResponse> getBookedServices(String mobileNumber) {
		List<Booking> bookings = repository.findByMobileNumber(mobileNumber);
		List<Booking> reversedBookings = new ArrayList<>();
		for(int i = bookings.size()-1; i >= 0; i--) {
			reversedBookings.add(bookings.get(i));
		}
		if (bookings == null  || bookings.isEmpty()) {
			return null;
		}
		return toResponses(reversedBookings);
	}
	
	@Override
	public List<BookingResponse> getAllBookedServices() {
		List<Booking> bookings = repository.findAll();
		List<Booking> reversedBookings = new ArrayList<>();
		for(int i = bookings.size()-1; i >= 0; i--) {
			reversedBookings.add(bookings.get(i));
		}
		if (bookings == null  || bookings.isEmpty()) {
			return null;
		}
		return toResponses(reversedBookings);
	}

	@Override
	public List<BookingResponse> bookingByDoctorId(String doctorId) {
		List<Booking> bookings = repository.findByDoctorId(doctorId);
		List<Booking> reversedBookings = new ArrayList<>();
		for(int i = bookings.size()-1; i >= 0; i--) {
			reversedBookings.add(bookings.get(i));
		}
		if (bookings == null  || bookings.isEmpty()) {
			return null;
		}
		return toResponses(reversedBookings);
	}

	@Override
	public List<BookingResponse> bookingByServiceId(String serviceId) {
		List<Booking> bookings = repository.findBySubServiceId(serviceId);
		List<Booking> reversedBookings = new ArrayList<>();
		for(int i = bookings.size()-1; i >= 0; i--) {
			reversedBookings.add(bookings.get(i));
		}
		if (bookings == null  || bookings.isEmpty()) {
			return null;
		}
		return toResponses(reversedBookings);
	}
	

	@Override
	public List<BookingResponse> bookingByClinicId(String clinicId) {
		List<Booking> bookings = repository.findByClinicId(clinicId);
		List<Booking> reversedBookings = new ArrayList<>();
		for(int i = bookings.size()-1; i >= 0; i--) {
			reversedBookings.add(bookings.get(i));
		}
		if(bookings==null || bookings.isEmpty()) {
		 return null;
		}
		return toResponses(bookings);
	}
	
	
	public ResponseEntity<?> updateAppointment(BookingResponse bookingResponse){
		try {
		Booking entity = repository.findByBookingId(bookingResponse.getBookingId())
	.orElseThrow(() -> new RuntimeException("Invalid Booking Id Please provide Valid Id"));
		if (bookingResponse.getAge() != null) entity.setAge(bookingResponse.getAge());
		if (bookingResponse.getBookedAt() != null) entity.setBookedAt(bookingResponse.getBookedAt());
		if (bookingResponse.getBookingFor() != null) entity.setBookingFor(bookingResponse.getBookingFor());
		if (bookingResponse.getClinicId() != null) entity.setClinicId(bookingResponse.getClinicId());
		if (bookingResponse.getConsultationFee() != 0) entity.setConsultationFee(bookingResponse.getConsultationFee());
		if (bookingResponse.getConsultationType() != null) entity.setConsultationType(bookingResponse.getConsultationType());
		if (bookingResponse.getDoctorId() != null) entity.setDoctorId(bookingResponse.getDoctorId());
		if (bookingResponse.getGender() != null) entity.setGender(bookingResponse.getGender());
		if (bookingResponse.getMobileNumber() != null) entity.setMobileNumber(bookingResponse.getMobileNumber());
		if (bookingResponse.getName() != null) entity.setName(bookingResponse.getName());
		if (bookingResponse.getProblem() != null) entity.setProblem(bookingResponse.getProblem());
		if (bookingResponse.getServiceDate() != null) entity.setServiceDate(bookingResponse.getServiceDate());
		if (bookingResponse.getServicetime() != null) entity.setServicetime(bookingResponse.getServicetime());
		if (bookingResponse.getStatus() != null) entity.setStatus(bookingResponse.getStatus());
		if (bookingResponse.getNotes() != null) entity.setNotes(bookingResponse.getNotes());
		if (bookingResponse.getReports() != null)
		    entity.setReports(new ObjectMapper().convertValue(bookingResponse.getReports(), ReportsList.class));
		if (bookingResponse.getSubServiceId() != null) entity.setSubServiceId(bookingResponse.getSubServiceId());
		if (bookingResponse.getSubServiceName() != null) entity.setSubServiceName(bookingResponse.getSubServiceName());
		if (bookingResponse.getReasonForCancel() != null) entity.setReasonForCancel(bookingResponse.getReasonForCancel());
		if (bookingResponse.getTotalFee() != 0) entity.setTotalFee(bookingResponse.getTotalFee());
		Booking e = repository.save(entity);			
		if(e != null) {	
		return new ResponseEntity<>(ResponseStructure.buildResponse(e,
				"Booking updated sucessfully",HttpStatus.OK, HttpStatus.OK.value()),
				HttpStatus.OK);			
		}else {
			return new ResponseEntity<>(ResponseStructure.buildResponse(null,
					"Booking Not Updated", HttpStatus.NOT_FOUND, HttpStatus.NOT_FOUND.value()),
					HttpStatus.NOT_FOUND);
		}}catch(Exception e) {
			return new ResponseEntity<>(ResponseStructure.buildResponse(null,
					e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR.value()),
					HttpStatus.INTERNAL_SERVER_ERROR);
		}}
}
