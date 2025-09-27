package com.dermacare.bookingService.service.Impl;


import java.lang.annotation.Annotation;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.Set;
import java.util.UUID;

import javax.lang.model.element.AnnotationMirror;
import javax.lang.model.type.ReferenceType;
import javax.lang.model.type.TypeKind;
import javax.lang.model.type.TypeVisitor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import com.dermacare.bookingService.dto.BookingRequset;
import com.dermacare.bookingService.dto.BookingResponse;
import com.dermacare.bookingService.dto.DoctorSaveDetailsDTO;
import com.dermacare.bookingService.dto.NotificationDTO;
import com.dermacare.bookingService.entity.Booking;
import com.dermacare.bookingService.entity.ReportsList;
import com.dermacare.bookingService.feign.DoctorFeign;
import com.dermacare.bookingService.feign.NotificationFeign;
import com.dermacare.bookingService.producer.KafkaProducer;
import com.dermacare.bookingService.repository.BookingServiceRepository;
import com.dermacare.bookingService.service.BookingService_Service;
import com.dermacare.bookingService.util.Response;
import com.dermacare.bookingService.util.ResponseStructure;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class BookingService_ServiceImpl implements BookingService_Service {


	@Autowired
	private BookingServiceRepository repository;
	
	@Autowired
	private KafkaProducer kafkaProducer;
	
	@Autowired
	private NotificationFeign notificationFeign;
	
	@Autowired
	private DoctorFeign doctorFeign;

	@Override
	public ResponseEntity<?> addService(BookingRequset request) {
		ResponseStructure<BookingResponse> response = new ResponseStructure<BookingResponse>();
		Booking entity = toEntity(request);
		if(request.getVisitType().equalsIgnoreCase("follow-up")){
		if(repository.findByMobileNumberAndPatientIdAndBookingId(request.getMobileNumber(),request.getPatientId(),request.getBookingId()) != null){
		Booking b = repository.findByMobileNumberAndPatientIdAndBookingId(request.getMobileNumber(),request.getPatientId(),request.getBookingId());
			if(b.getStatus().equalsIgnoreCase("In-Progress")){
			DateTimeFormatter date = DateTimeFormatter.ofPattern("yyyy-MM-dd");
			LocalDate previousServiceDate = LocalDate.parse(b.getServiceDate(), date);
			LocalDate plusDays = previousServiceDate.plusDays(Integer.parseInt(Character.toString(b.getConsultationExpiration().charAt(0)) + 
			Character.toString(b.getConsultationExpiration().charAt(1))));
			//System.out.println(plusDays);
			LocalDate currentAppoitnmentServiceDate = LocalDate.parse(request.getServiceDate(), date);
			//System.out.println(currentAppoitnmentServiceDate);
			boolean isEligible = false;
			if(!currentAppoitnmentServiceDate.isBefore(previousServiceDate) && !currentAppoitnmentServiceDate.isAfter(plusDays) && b.getFreeFollowUpsLeft() <= b.getFreeFollowUps()){
				isEligible = true;}	
			if(isEligible){
				b.setStatus("Confirmed");
				b.setServicetime(request.getServicetime());
				b.setServiceDate(request.getServiceDate());
				b.setVisitType(request.getVisitType());
				Booking ety = repository.save(b);
				ety.setReports(null);
				ety.setNotes(null);
				ety.setAttachments(null);
				ety.setConsentFormPdf(null);
				ety.setPrescriptionPdf(null);
				try {
					kafkaProducer.publishBooking(ety);
					}catch (Exception e) {
						throw new RuntimeException("Unable to book service");}
				BookingResponse res = new ObjectMapper().convertValue(ety, BookingResponse.class);
				response = ResponseStructure.buildResponse(res, "Service Booked Sucessfully",
				HttpStatus.OK, HttpStatus.OK.value());			
			}else{
			response = ResponseStructure.buildResponse(null, "Unable to proceed with booking. Please check the service date and your available free follow-ups.",
			HttpStatus.PAYMENT_REQUIRED, HttpStatus.PAYMENT_REQUIRED.value());}	
		}else {
			response = ResponseStructure.buildResponse(null, "No In Progress Appointments Found With Priovided AppointmentId.",
					HttpStatus.NOT_FOUND, HttpStatus.NOT_FOUND.value());}	
		}else {
			response = ResponseStructure.buildResponse(null, "No Appointment Found.",
					HttpStatus.NOT_FOUND, HttpStatus.NOT_FOUND.value());}	
		}else{	
		entity.setStatus("Confirmed");
		Booking res = repository.save(entity);
		res.setReports(null);
		res.setNotes(null);
		res.setAttachments(null);
		res.setConsentFormPdf(null);
		res.setPrescriptionPdf(null);
		try {
			kafkaProducer.publishBooking(res);
			}catch (Exception e) {
				throw new RuntimeException("Unable to book service");
			}
		BookingResponse bRes = new ObjectMapper().convertValue(res, BookingResponse.class);
		response = ResponseStructure.buildResponse(bRes,"Service Booked Sucessfully",
				HttpStatus.CREATED, HttpStatus.CREATED.value());}
		return ResponseEntity.status(response.getStatusCode()).body(response);
	}
		
	
	private Booking toEntity(BookingRequset request) {
		Booking entity = new ObjectMapper().convertValue(request,Booking.class );
		//entity.setMobileNumber(Long.parseLong(request.getMobileNumber()));
		ZonedDateTime istTime = ZonedDateTime.now(ZoneId.of("Asia/Kolkata"));
	    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy hh:mm a");
	    String formattedTime = istTime.format(formatter);
		entity.setBookedAt(formattedTime);
		entity.setFreeFollowUpsLeft(request.getFreeFollowUps());
		//entity.setPrescriptionPdf(new ObjectMapper().convertValue(request.getPrescriptionPdf(),new TypeReference<List<byte[]>>(){}));
		if(request.getConsultationType() != null){
		if(request.getConsultationType().equalsIgnoreCase("video consultation") || request.getConsultationType().equalsIgnoreCase("online consultation") ) {
			entity.setChannelId(randomNumber());
		}else {
			entity.setChannelId(null) ;
		}}
		if(request.getRelation() != null) {
		List<Booking> existingBooking = repository.findByRelationIgnoreCaseAndMobileNumber(request.getRelation(),request.getMobileNumber());
		if(existingBooking != null && !existingBooking.isEmpty()) {
		for(Booking b : existingBooking) {
		if(b != null) {
			entity.setPatientId(b.getPatientId());
		}}}
		else {
			entity.setPatientId(generatePatientId());}
		}else{
			entity.setPatientId(generatePatientId());	
		}
		return entity;		
	}
	
	
	private BookingResponse toResponse(Booking entity) {		
		BookingResponse response = new ObjectMapper().convertValue(entity,BookingResponse.class );
		DoctorSaveDetailsDTO dto = getPrescriptionpdf(response.getBookingId());
		if(dto != null ) {
		response.setPrescriptionPdf(dto.getPrescriptionPdf());}
		response.setBookingId(String.valueOf(entity.getBookingId()));
		return response; }
	
	
	private DoctorSaveDetailsDTO getPrescriptionpdf(String bid) {
		try {
		Response res =  doctorFeign.getDoctorSaveDetailsByBookingId(bid).getBody();
		return new ObjectMapper().convertValue(res.getData(),DoctorSaveDetailsDTO.class);
	}catch(Exception e) {
		System.out.println(e.getMessage());
		return null;
	}}
	
	
	  private static String generatePatientId() {	       
	        String uuid = UUID.randomUUID().toString();
	        String randomPart = uuid.replaceAll("-", "").substring(0, 6).toUpperCase();
	        return "PT_" + randomPart;
	    }
	
	
	private static String randomNumber() {
        Random random = new Random();    
        int sixDigitNumber = 100000 + random.nextInt(900000); // Generates number from 100000 to 999999
        return String.valueOf(sixDigitNumber);
    }

	private List<BookingResponse> toResponses(List<Booking> bookings) {
		
		
		
		List<BookingResponse> res = new ObjectMapper().convertValue(bookings,new TypeReference<List<BookingResponse>>(){});
		for(BookingResponse bres : res) {
			//System.out.println(bres.getBookingId());
			DoctorSaveDetailsDTO dto = getPrescriptionpdf(bres.getBookingId());
			//System.out.println(dto);
			if(dto != null ) {
			bres.setPrescriptionPdf(dto.getPrescriptionPdf());}}
		return res;
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
			}else{
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
			}else {
				res.setStatusCode(200);
				res.setMessage("Appointments Are Not Found");
				return ResponseEntity.status(200).body(res);
			}}catch(Exception e) {
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
			if(b.getServiceDate().equals(currentDate) && !b.getStatus().equalsIgnoreCase("Completed") && !b.getStatus().equalsIgnoreCase("Pending") 
			&& !b.getStatus().equalsIgnoreCase("In-Progress")){
			respnse.add(toResponse(b));}}
			if(respnse != null && !respnse.isEmpty()){
			res.setStatusCode(200);
			res.setHttpStatus(HttpStatus.OK);
			res.setData(respnse);
			res.setMessage("Appointments Are Found");}
			else {
				res.setStatusCode(200);
				res.setHttpStatus(HttpStatus.OK);
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
			DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
			String currentDate = LocalDate.now().format(dateFormatter);	
			if(existingBooking != null && !existingBooking.isEmpty()) {
			for(Booking b : existingBooking) {
			switch(number) {
			case "1" :if(b.getConsultationType().equalsIgnoreCase("Services & Treatments") || b.getConsultationType().equalsIgnoreCase("In-Clinic Consultation") || b.getConsultationType().equalsIgnoreCase("Online Consultation")){
				if(b.getStatus().equalsIgnoreCase("Confirmed") && !b.getServiceDate().equals(currentDate)) {
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
					if(b.getStatus().equalsIgnoreCase("Confirmed") && !b.getServiceDate().equals(currentDate)) {
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
				    	    
				case "4":if(b.getStatus().equalsIgnoreCase("In-Progress")) {
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
			    }}else{
				    res.setStatusCode(200);
			        res.setData(resnse);
			        res.setMessage("Appointments Are Not Found");}
				}catch(Exception e) {
			      resnse = null;
			      res.setStatusCode(500);
			      res.setData(resnse);
			      res.setMessage(e.getMessage());}
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
		    entity.setReports(new ObjectMapper().convertValue(bookingResponse.getReports(),new TypeReference<List<ReportsList>>(){}));
		if (bookingResponse.getSubServiceId() != null) entity.setSubServiceId(bookingResponse.getSubServiceId());
		if (bookingResponse.getSubServiceName() != null) entity.setSubServiceName(bookingResponse.getSubServiceName());
		if (bookingResponse.getReasonForCancel() != null) entity.setReasonForCancel(bookingResponse.getReasonForCancel());
		if (bookingResponse.getTotalFee() != 0) entity.setTotalFee(bookingResponse.getTotalFee());
		if (bookingResponse.getFreeFollowUpsLeft() != null) entity.setFreeFollowUpsLeft(bookingResponse.getFreeFollowUpsLeft());
		
		Booking e = repository.save(entity);			
		if(e != null){	
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
	

	
	@Scheduled(cron = "0 01 0 * * ?")
	////@Scheduled(fixedRate = 20000)
	private void changingStatusFromConfirmedToCompleted() {
	    try {
	        List<Booking> bookings = repository.findAll();
	        for (Booking b : bookings) {
	            if (b.getStatus().equalsIgnoreCase("Confirmed")) {
	            	
	                DateTimeFormatter inputFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy hh:mm a");
	                LocalDateTime bookedDateTime = LocalDateTime.parse(b.getBookedAt(), inputFormatter);
                   // System.out.println(bookedDateTime);
                    
	                ZonedDateTime istTime = ZonedDateTime.now(ZoneId.of("Asia/Kolkata"));
	                LocalDate todayDate = istTime.toLocalDate(); // only date part
	                LocalDate bookedDate = bookedDateTime.toLocalDate(); // only date part
                   // System.out.println(bookedDate);
	                long gap = ChronoUnit.DAYS.between(bookedDate, todayDate);
                   // System.out.println(gap);	               
	                int expirationDays = Integer.parseInt(Character.toString(b.getConsultationExpiration().charAt(0)) + 
	            			Character.toString(b.getConsultationExpiration().charAt(1)));
                   // System.out.println(expirationDays);
	               
	                if (gap > expirationDays) {
	                    b.setStatus("Completed");
	                    repository.save(b);

	                    NotificationDTO n = notificationFeign.getNotificationByBookingId(b.getBookingId());
	                    n.getData().setStatus("Completed");
	                    notificationFeign.updateNotification(n);
	                    //System.out.println("Updated to Completed for bookingId: " + b.getBookingId());
	                    }}}}catch (Exception e) {}}

	
	
	@Scheduled(cron = "0 30 0 * * ?")
	////@Scheduled(fixedRate = 20000)
	private void changingStatusFromConfirmedToCompletedByUsingSecondTime() {
	    try {
	        List<Booking> bookings = repository.findAll();
	        for (Booking b : bookings) {
	            if (b.getStatus().equalsIgnoreCase("Confirmed")) {
	              
	                DateTimeFormatter inputFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy hh:mm a");
	                LocalDateTime bookedDateTime = LocalDateTime.parse(b.getBookedAt(), inputFormatter);
	               // System.out.println(bookedDateTime);
	                ZonedDateTime istTime = ZonedDateTime.now(ZoneId.of("Asia/Kolkata"));
	                LocalDate todayDate = istTime.toLocalDate(); // only date part
	                LocalDate bookedDate = bookedDateTime.toLocalDate(); // only date part
	               // System.out.println(bookedDate);
	                long gap = ChronoUnit.DAYS.between(bookedDate, todayDate);
	                int expirationDays = Integer.parseInt(Character.toString(b.getConsultationExpiration().charAt(0)) + 
	            			Character.toString(b.getConsultationExpiration().charAt(1)));
	                //System.out.println(gap);
	               // System.out.println(expirationDays);
	                if (gap > expirationDays) {
	                    b.setStatus("Completed");
	                    repository.save(b);

	                    NotificationDTO n = notificationFeign.getNotificationByBookingId(b.getBookingId());
	                    n.getData().setStatus("Completed");
	                    notificationFeign.updateNotification(n);

	                    //System.out.println("Updated to Completed for bookingId: " + b.getBookingId());
	                }}}}catch (Exception e) {}}

	
	
	@Scheduled(fixedRate = 60 * 60 * 1000)
	public void autoCalculatePatientCompletedAppointments() { 
		Map<String,Integer> map = new LinkedHashMap<>();
		Set<String> ids = new LinkedHashSet<>();
		    try {
			List<Booking> existingBooking = repository.findAll();
			//System.out.println("existingBooking");
			if(existingBooking != null && !existingBooking.isEmpty()){
				//System.out.println("not null");
			for(Booking b:existingBooking) {
			if(b.getStatus().equalsIgnoreCase("Completed")) {
				//System.out.println("find complted");
				if(!ids.contains(b.getPatientId())){
			List<Booking> bookings = repository.findByPatientId(b.getPatientId());
			ids.add(b.getPatientId());
			//System.out.println("got obj by patient id");
			for(Booking c:bookings) {
			if(c.getStatus().equalsIgnoreCase("Completed")) {
				//System.out.println("patient id with cmplted");
			if(map.containsKey(b.getPatientId())){
				//System.out.println("adding to map");
				Integer value = map.get(b.getPatientId());
				int vlue = value.intValue();
				vlue += 1;
				value = Integer.valueOf(vlue);
			map.put(b.getPatientId(),value);
			}else{
				map.put(b.getPatientId(),1);
			}
			for(String key : map.keySet()) {
				List<Booking> bkings = repository.findByPatientId(key);
				//System.out.println("got obj with key in map");
				for(Booking bkng : bkings ) {
					bkng.setVisitCount(map.get(key));
					repository.save(bkng);}
			}}}}}}}}catch(Exception e) {}
	   }
	
	
	
	//---------------------------to get patientdetails by bookingId,pateintId,mobileNumber---------------------------
		@Override
		public Response getPatientDetailsForConsetForm(String bookingId, String patientId, String mobileNumber) {
		    try {
			Optional<Booking> optionalBooking = repository.findByBookingIdAndPatientIdAndMobileNumber(bookingId, patientId, mobileNumber);
		    if (optionalBooking.isPresent()) {
		        Booking booking = optionalBooking.get();
		        if(booking.getStatus().equalsIgnoreCase("Confirmed") || booking.getStatus().equalsIgnoreCase("Completed")){
		        BookingResponse response = new ObjectMapper().convertValue(booking, BookingResponse.class);
		        return Response.builder()
		                .success(true)
		                .status(200)
		                .message("Booking details fetched successfully.")
		                .data(response)
		                .build();
		         }else{
		    	 return Response.builder()
			                .success(false)
			                .status(404)
			                .message("No booking found with the given details.")
			                .build();	
		        }}else{
		        return Response.builder()
		                .success(false)
		                .status(404)
		                .message("No booking found with the given details.")
		                .build();}
		        }catch(Exception e){
			    return Response.builder()
	                .success(false)
	                .status(500)
	                .message(e.getMessage())
	                .build();}}	    


		public ResponseEntity<?> getInProgressAppointments(String number){
			ResponseStructure<List<BookingResponse>> res = new ResponseStructure<List<BookingResponse>>();
			   try{
				List<Booking> booked=repository.findByMobileNumber(number);
				List<BookingResponse> response=new ArrayList<>();
				if(booked!=null && !booked.isEmpty()){
					for(Booking b:booked){
						if(b.getStatus().equalsIgnoreCase("In-Progress")){
							response.add(toResponse(b));}}
					if(response!=null && !response.isEmpty()){
						res.setStatusCode(200);
						res.setHttpStatus(HttpStatus.OK);
						res.setData(response);
						res.setMessage("In-Progress appointments found");
					}else{
						res.setStatusCode(200);
						res.setHttpStatus(HttpStatus.OK);
						res.setData(response);
						res.setMessage("In-Progress appointments not found");}}}
			catch(Exception e){
				res.setStatusCode(500);
				res.setMessage(e.getMessage());}
			return ResponseEntity.status(res.getStatusCode()).body(res);
		}
		
		
		
		public ResponseEntity<?> getDoctorFutureAppointments(String doctorId){
			ResponseStructure<List<BookingResponse>> res = new ResponseStructure<List<BookingResponse>>();
			   try{
				List<Booking> booked=repository.findByDoctorId(doctorId);
				List<BookingResponse> response=new ArrayList<>();
				if(booked!=null && !booked.isEmpty()){
					for(Booking b:booked){
					DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
					LocalDate serviceDate = LocalDate.parse(b.getServiceDate(), formatter);
					LocalDate currentDate = LocalDate.now();
					LocalDate plus = currentDate.plusDays(15);
						if(!serviceDate.isBefore(currentDate) && !serviceDate.isAfter(plus)){
							response.add(toResponse(b));}}
					if(response!=null && !response.isEmpty()){
						res.setStatusCode(200);
						res.setHttpStatus(HttpStatus.OK);
						res.setData(response);
						res.setMessage("appointments found");
					}else{
						res.setStatusCode(200);
						res.setHttpStatus(HttpStatus.OK);
						res.setData(response);
						res.setMessage("appointments not found");}}}
			catch(Exception e){
				res.setStatusCode(500);
				res.setMessage(e.getMessage());}
			return ResponseEntity.status(res.getStatusCode()).body(res);
		}
		
		
		
		@Override
		public List<BookingResponse> bookingByBranchId(String branchId) {
			List<Booking> bookings = repository.findByBranchId(branchId);
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
		public List<BookingResponse> getBookedServicesByClinicIdWithBranchId(String clinicId, String branchId) {
		    List<Booking> bookings = repository.findByClinicIdAndBranchId(clinicId, branchId);
		    List<Booking> reversedBookings = new ArrayList<>();
		    for (int i = bookings.size() - 1; i >= 0; i--) {
		        reversedBookings.add(bookings.get(i));
		    }
		    if (bookings == null || bookings.isEmpty()) {
		        return null;
		    }
		    return toResponses(reversedBookings);
		}

		
}