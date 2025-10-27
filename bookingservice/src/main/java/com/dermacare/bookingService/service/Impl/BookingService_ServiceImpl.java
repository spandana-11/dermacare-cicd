package com.dermacare.bookingService.service.Impl;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.dermacare.bookingService.dto.BookingInfoByInput;
import com.dermacare.bookingService.dto.BookingRequset;
import com.dermacare.bookingService.dto.BookingResponse;
import com.dermacare.bookingService.dto.CustomerOnbordingDTO;
import com.dermacare.bookingService.dto.DatesDTO;
import com.dermacare.bookingService.dto.DoctorSaveDetailsDTO;
import com.dermacare.bookingService.dto.RelationInfoDTO;
import com.dermacare.bookingService.dto.TreatmentDetailsDTO;
import com.dermacare.bookingService.dto.TreatmentResponseDTO;
import com.dermacare.bookingService.entity.Booking;
import com.dermacare.bookingService.entity.ReportsList;
import com.dermacare.bookingService.feign.ClinicAdminFeign;
import com.dermacare.bookingService.feign.DoctorFeign;
import com.dermacare.bookingService.producer.KafkaProducer;
import com.dermacare.bookingService.repository.BookingServiceRepository;
import com.dermacare.bookingService.service.BookingService_Service;
import com.dermacare.bookingService.util.Response;
import com.dermacare.bookingService.util.ResponseStructure;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@Service
public class BookingService_ServiceImpl implements BookingService_Service {


	@Autowired
	private BookingServiceRepository repository;
	
	@Autowired
	private KafkaProducer kafkaProducer;
	
	//@Autowired
	//private NotificationFeign notificationFeign;
	
	@Autowired
	private DoctorFeign doctorFeign;
	
	@Autowired
	private ClinicAdminFeign clinicAdminFeign;
	
	public DoctorSaveDetailsDTO saveDetails = new DoctorSaveDetailsDTO();
	public DoctorSaveDetailsDTO sDetails = new DoctorSaveDetailsDTO();
	public DoctorSaveDetailsDTO sd = new DoctorSaveDetailsDTO();
	 LocalDate exp = null;

//	@Override
//	public ResponseEntity<?> addService(BookingRequset request) {
//	    ResponseStructure<BookingResponse> response = new ResponseStructure<>();
//	    Booking entity = toEntity(request);
//
//	    if (request.getVisitType().equalsIgnoreCase("follow-up")) {
//	        Booking b = repository.findByMobileNumberAndPatientIdAndBookingId(
//	                request.getMobileNumber(), request.getPatientId(), request.getBookingId());
//	        if (b != null) {
//	            if (b.getStatus().equalsIgnoreCase("In-Progress")) {
//	                DateTimeFormatter date = DateTimeFormatter.ofPattern("yyyy-MM-dd");
//	                LocalDate previousServiceDate = LocalDate.parse(b.getServiceDate(), date);
//
//	                // ✅ Safer expiration parsing
//	                int days = Integer.parseInt(b.getConsultationExpiration().split(" ")[0]);
//	                LocalDate plusDays = previousServiceDate.plusDays(days);
//
//	                LocalDate currentAppointmentServiceDate = LocalDate.parse(request.getServiceDate(), date);
//
//	                boolean isEligible = false;
//	                if (!currentAppointmentServiceDate.isBefore(previousServiceDate)
//	                        && !currentAppointmentServiceDate.isAfter(plusDays)
//	                        && b.getFreeFollowUpsLeft() > 0) {
//	                    isEligible = true;
//	                }
//
//	                if (isEligible) {
//	                    b.setStatus("Confirmed");
//	                    b.setServicetime(request.getServicetime());
//	                    b.setFollowupDate(request.getServiceDate());
//	                    b.setVisitType(request.getVisitType());
//
//	                    // Decrement free follow-ups left
//	                    //b.setFreeFollowUpsLeft(b.getFreeFollowUpsLeft() - 1);
//
//	                    Booking ety = repository.save(b);
//	                    ety.setReports(null);
//	                    ety.setNotes(null);
//	                    ety.setAttachments(null);
//	                    ety.setConsentFormPdf(null);
//	                    ety.setPrescriptionPdf(null);
//
//	                    try {
//	                        kafkaProducer.publishBooking(ety);
//	                    } catch (Exception e) {
//	                        throw new RuntimeException("Unable to book service");
//	                    }
//
//	                    BookingResponse res = new ObjectMapper().convertValue(ety, BookingResponse.class);
//	                    response = ResponseStructure.buildResponse(res, "Service Booked Successfully",
//	                            HttpStatus.OK, HttpStatus.OK.value());
//
//	                } else {
//	                    response = ResponseStructure.buildResponse(null,
//	                            "Unable to proceed with booking. Please check the service date and your available free follow-ups.",
//	                            HttpStatus.PAYMENT_REQUIRED, HttpStatus.PAYMENT_REQUIRED.value());
//	                }
//	            } else {
//	                response = ResponseStructure.buildResponse(null,
//	                        "No In Progress Appointments Found With Provided AppointmentId.",
//	                        HttpStatus.NOT_FOUND, HttpStatus.NOT_FOUND.value());
//	            }
//	        } else {
//	            response = ResponseStructure.buildResponse(null,
//	                    "No Appointment Found.",
//	                    HttpStatus.NOT_FOUND, HttpStatus.NOT_FOUND.value());
//	        }
//	    } else {
//	        entity.setStatus("Confirmed");
//	        Booking res = repository.save(entity);
//	        res.setReports(null);
//	        res.setNotes(null);
//	        res.setAttachments(null);
//	        res.setConsentFormPdf(null);
//	        res.setPrescriptionPdf(null);
//
//	        try {
//	            kafkaProducer.publishBooking(res);
//	        } catch (Exception e) {
//	            throw new RuntimeException("Unable to book service");
//	        }
//
//	        BookingResponse bRes = new ObjectMapper().convertValue(res, BookingResponse.class);
//	        response = ResponseStructure.buildResponse(bRes, "Service Booked Successfully",
//	                HttpStatus.CREATED, HttpStatus.CREATED.value());
//	    }
//
//	    return ResponseEntity.status(response.getStatusCode()).body(response);
//	}

	 @Override
	 public ResponseEntity<?> addService(BookingRequset request) {
	     ResponseStructure<BookingResponse> response = new ResponseStructure<>();
	     Booking entity = toEntity(request);

	     try {
	         // 🧩 Handle null or empty visitType safely
	         if (request.getVisitType() == null) {
	             response = ResponseStructure.buildResponse(null,
	                     "Visit type is required.",
	                     HttpStatus.BAD_REQUEST,
	                     HttpStatus.BAD_REQUEST.value());
	             return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
	         }

	         // 🩺 FOLLOW-UP CASE
	         if (request.getVisitType().equalsIgnoreCase("follow-up")) {
	             Booking b = repository.findByMobileNumberAndPatientIdAndBookingId(
	                     request.getMobileNumber(), request.getPatientId(), request.getBookingId());

	             if (b == null) {
	                 response = ResponseStructure.buildResponse(null,
	                         "No Appointment Found.",
	                         HttpStatus.NOT_FOUND,
	                         HttpStatus.NOT_FOUND.value());
	                 return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
	             }

	             if (!"In-Progress".equalsIgnoreCase(b.getStatus())) {
	                 response = ResponseStructure.buildResponse(null,
	                         "No In-Progress Appointments Found With Provided AppointmentId.",
	                         HttpStatus.NOT_FOUND,
	                         HttpStatus.NOT_FOUND.value());
	                 return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
	             }

	             DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

	             // 🧠 Safe date parsing
	             LocalDate previousServiceDate;
	             try {
	                 previousServiceDate = LocalDate.parse(b.getServiceDate(), dateFormatter);
	             } catch (Exception e) {
	                 return ResponseEntity.status(HttpStatus.BAD_REQUEST)
	                         .body(ResponseStructure.buildResponse(null,
	                                 "Invalid previous service date format for bookingId: " + b.getBookingId(),
	                                 HttpStatus.BAD_REQUEST,
	                                 HttpStatus.BAD_REQUEST.value()));
	             }

	             // 🧠 Safe consultation expiration parsing
	             int days = 7; // default fallback
	             try {
	                 String exp = b.getConsultationExpiration();
	                 if (exp != null && exp.matches("\\d+.*")) {
	                     days = Integer.parseInt(exp.split(" ")[0]);
	                 }
	             } catch (Exception e) {
	                 // fallback already handled
	             }

	             LocalDate plusDays = previousServiceDate.plusDays(days);

	             // 🧠 Safe current service date parsing
	             LocalDate currentAppointmentServiceDate;
	             try {
	                 currentAppointmentServiceDate = LocalDate.parse(request.getServiceDate(), dateFormatter);
	             } catch (Exception e) {
	                 return ResponseEntity.status(HttpStatus.BAD_REQUEST)
	                         .body(ResponseStructure.buildResponse(null,
	                                 "Invalid service date format in request: " + request.getServiceDate(),
	                                 HttpStatus.BAD_REQUEST,
	                                 HttpStatus.BAD_REQUEST.value()));
	             }

	             boolean isEligible = !currentAppointmentServiceDate.isBefore(previousServiceDate)
	                     && !currentAppointmentServiceDate.isAfter(plusDays)
	                     && (b.getFreeFollowUpsLeft() != null && b.getFreeFollowUpsLeft() > 0);

	             if (!isEligible) {
	                 response = ResponseStructure.buildResponse(null,
	                         "Unable to proceed with booking. Please check service date and free follow-ups.",
	                         HttpStatus.PAYMENT_REQUIRED,
	                         HttpStatus.PAYMENT_REQUIRED.value());
	                 return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(response);
	             }

	             // 🧩 Update booking
	             b.setStatus("Confirmed");
	             b.setServicetime(request.getServicetime());
	             b.setFollowupDate(request.getServiceDate());
	             b.setVisitType(request.getVisitType());
	             // optionally decrement follow-ups left if needed
	             // b.setFreeFollowUpsLeft(b.getFreeFollowUpsLeft() - 1);

	             Booking updatedBooking = repository.save(b);
	             nullifyLargeFields(updatedBooking);

	             try {
	                 kafkaProducer.publishBooking(updatedBooking);
	             } catch (Exception e) {
	                 // Don’t throw 500 — just log and continue
	                 e.printStackTrace();
	                 System.err.println("⚠️ Kafka publish failed: " + e.getMessage());
	             }

	             BookingResponse res = new ObjectMapper().convertValue(updatedBooking, BookingResponse.class);
	             response = ResponseStructure.buildResponse(res,
	                     "Service Booked Successfully",
	                     HttpStatus.OK,
	                     HttpStatus.OK.value());
	             return ResponseEntity.status(HttpStatus.OK).body(response);
	         }

	         // 🩺 NEW BOOKING (non-follow-up)
	         entity.setStatus("Confirmed");
	         Booking savedBooking = repository.save(entity);
	         nullifyLargeFields(savedBooking);

	         try {
	             kafkaProducer.publishBooking(savedBooking);
	         } catch (Exception e) {
	             e.printStackTrace();
	             System.err.println("⚠️ Kafka publish failed: " + e.getMessage());
	         }

	         BookingResponse bRes = new ObjectMapper().convertValue(savedBooking, BookingResponse.class);
	         response = ResponseStructure.buildResponse(bRes,
	                 "Service Booked Successfully",
	                 HttpStatus.CREATED,
	                 HttpStatus.CREATED.value());
	         return ResponseEntity.status(HttpStatus.CREATED).body(response);

	     } catch (Exception e) {
	         // ✅ Never leak stack traces to Feign
	         e.printStackTrace();
	         response = ResponseStructure.buildResponse(null,
	                 "Internal Server Error: " + e.getMessage(),
	                 HttpStatus.INTERNAL_SERVER_ERROR,
	                 HttpStatus.INTERNAL_SERVER_ERROR.value());
	         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
	     }
	 }

	 /**
	  * Helper to nullify heavy fields before returning the booking
	  */
	 private void nullifyLargeFields(Booking booking) {
	     booking.setReports(null);
	     booking.setNotes(null);
	     booking.setAttachments(null);
	     booking.setConsentFormPdf(null);
	     booking.setPrescriptionPdf(null);
	 }

		
	 private Booking toEntity(BookingRequset request) {
		    Booking entity = new ObjectMapper().convertValue(request, Booking.class);
		    // Set booking timestamp in IST
		    ZonedDateTime istTime = ZonedDateTime.now(ZoneId.of("Asia/Kolkata"));
		    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy hh:mm a");
		    String formattedTime = istTime.format(formatter);
		    entity.setBookedAt(formattedTime);
		    // Set follow-up count
		    entity.setFreeFollowUpsLeft(request.getFreeFollowUps());
		    // Set channel ID for online/video consultations
		    if (request.getConsultationType() != null) {
		        if (request.getConsultationType().equalsIgnoreCase("video consultation") ||
		            request.getConsultationType().equalsIgnoreCase("online consultation")) {
		            entity.setChannelId(randomNumber());
		        } else {
		            entity.setChannelId(null);
		        }}
		    // Handle patient ID logic
		    if(request.getBookingFor() != null) {
		    if (request.getBookingFor().equalsIgnoreCase("Someone")) {
		        if (request.getRelation() != null &&
		            (request.getPatientId() == null || request.getPatientId().trim().isEmpty())) {

		            List<Booking> existingBooking = repository.findByRelationIgnoreCaseAndCustomerIdAndNameIgnoreCase(
		                request.getRelation(), request.getCustomerId(), request.getName());

		            if (existingBooking != null && !existingBooking.isEmpty()) {
		                for (Booking b : existingBooking) {
		                    if (b != null) {
		                        entity.setPatientId(b.getPatientId()); // Reuse existing patient ID
		                        break;
		                    }}}else{
		                entity.setPatientId(generatePatientId(request)); // Generate new patient ID
		            }
		        } else {
		            entity.setPatientId(request.getPatientId()); // Use provided patient ID
		        }
		    } else {
		        if (request.getPatientId() == null || request.getPatientId().trim().isEmpty()) {
		            entity.setPatientId(generatePatientId(request)); // Generate new patient ID
		        } else {
		            entity.setPatientId(request.getPatientId()); // Use provided patient ID
		        }
		    }}

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
	
	
	  private static String generatePatientId(BookingRequset request) {	       
	        String uuid = UUID.randomUUID().toString();
	        String randomPart = uuid.replaceAll("-", "").substring(0, 6).toUpperCase();
	        return request.getBranchId()+"_"+"PT_" + randomPart;
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
	
	
//	public ResponseEntity<?> getTodayDoctorAppointmentsByDoctorId(String hospitalId,String doctorId) {
//		ResponseStructure<List<BookingResponse>> res = new ResponseStructure<List<BookingResponse>>();
//		try {
//			List<Booking> existingBooking = repository.findByClinicIdAndDoctorId(hospitalId, doctorId);
//			List<BookingResponse> respnse = new ArrayList<>();
//			if(existingBooking != null && !existingBooking.isEmpty()) {
//			for(Booking b : existingBooking) {
//			DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
//			String currentDate = LocalDate.now().format(dateFormatter);	
//			if(b.getServiceDate().equals(currentDate) && !b.getStatus().equalsIgnoreCase("Completed") && !b.getStatus().equalsIgnoreCase("Pending") 
//			&& !b.getStatus().equalsIgnoreCase("In-Progress")){
//			respnse.add(toResponse(b));}}
//			if(respnse != null && !respnse.isEmpty()){
//			res.setStatusCode(200);
//			res.setHttpStatus(HttpStatus.OK);
//			res.setData(respnse);
//			res.setMessage("Appointments Are Found");}
//			else {
//				res.setStatusCode(200);
//				res.setHttpStatus(HttpStatus.OK);
//				res.setData(respnse);
//				res.setMessage("Appointments With Today Date Are Not Found");}
//			}else {
//				res.setStatusCode(200);
//				res.setData(respnse);
//				res.setMessage("Appointments Are Not Found");}
//		}catch(Exception e) {
//			res.setStatusCode(500);
//			res.setMessage(e.getMessage());}
//		return ResponseEntity.status(res.getStatusCode()).body(res);
//	}
//	
	
	public ResponseEntity<?> getTodayDoctorAppointmentsByDoctorId(String hospitalId, String doctorId) {
	    ResponseStructure<List<BookingResponse>> res = new ResponseStructure<>();
	    List<BookingResponse> responseList = new ArrayList<>();

	    try {
	        List<Booking> existingBookings = repository.findByClinicIdAndDoctorId(hospitalId, doctorId);

	        if (existingBookings != null && !existingBookings.isEmpty()) {
	            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
	            
	            // ✅ Force IST time zone
	            LocalDate currentDate = LocalDate.now(ZoneId.of("Asia/Kolkata"));

	            for (Booking booking : existingBookings) {
	                try {
	                    LocalDate bookingDate = LocalDate.parse(booking.getServiceDate(), dateFormatter);

	                    if (bookingDate.equals(currentDate) &&
	                        !booking.getStatus().equalsIgnoreCase("Completed") &&
	                        !booking.getStatus().equalsIgnoreCase("Pending") &&
	                        !booking.getStatus().equalsIgnoreCase("In-Progress")) {

	                        responseList.add(toResponse(booking));
	                    }
	                } catch (DateTimeParseException e) {
	                    // Log or handle invalid date format in booking.getServiceDate()
	                    System.err.println("Invalid date format for booking ID: " + booking.getBookingId());
	                }
	            }

	            if (!responseList.isEmpty()) {
	                res.setStatusCode(200);
	                res.setHttpStatus(HttpStatus.OK);
	                res.setData(responseList);
	                res.setMessage("Appointments Are Found");
	            } else {
	                res.setStatusCode(200);
	                res.setHttpStatus(HttpStatus.OK);
	                res.setData(responseList);
	                res.setMessage("Appointments With Today Date Are Not Found");
	            }
	        } else {
	            res.setStatusCode(200);
	            res.setHttpStatus(HttpStatus.OK);
	            res.setData(responseList);
	            res.setMessage("Appointments Are Not Found");
	        }
	    } catch (Exception e) {
	        res.setStatusCode(500);
	        res.setHttpStatus(HttpStatus.INTERNAL_SERVER_ERROR);
	        res.setMessage("Error occurred: " + e.getMessage());
	    }

	    return ResponseEntity.status(res.getStatusCode()).body(res);
	}


	public ResponseEntity<?> filterDoctorAppointmentsByDoctorId(String hospitalId, String doctorId, String number) {
	    ResponseStructure<List<BookingResponse>> res = new ResponseStructure<>();
	    List<BookingResponse> resnse = new ArrayList<>();
	    try {
	        List<Booking> existingBooking = repository.findByClinicIdAndDoctorId(hospitalId, doctorId);
	        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

	        // ✅ Force IST timezone
	        String currentDate = LocalDate.now(ZoneId.of("Asia/Kolkata")).format(dateFormatter);

	        if (existingBooking != null && !existingBooking.isEmpty()) {
	            for (Booking b : existingBooking) {
	                switch (number) {
	                    case "1":
	                        if (b.getConsultationType().equalsIgnoreCase("Services & Treatments")
	                                || b.getConsultationType().equalsIgnoreCase("In-Clinic Consultation")
	                                || b.getConsultationType().equalsIgnoreCase("Online Consultation")) {
	                            if (b.getStatus().equalsIgnoreCase("Confirmed") && !b.getServiceDate().equals(currentDate)) {
	                                resnse.add(toResponse(b));
	                            }
	                        }
	                        break;

	                    case "2":
	                        if (b.getConsultationType().equalsIgnoreCase("Online Consultation")) {
	                            if (b.getStatus().equalsIgnoreCase("Confirmed") && !b.getServiceDate().equals(currentDate)) {
	                                resnse.add(toResponse(b));
	                            }
	                        }
	                        break;

	                    case "3":
	                        if (b.getStatus().equalsIgnoreCase("Completed")) {
	                            resnse.add(toResponse(b));
	                        }
	                        break;

	                    case "4":
	                        if (b.getStatus().equalsIgnoreCase("In-Progress")) {
	                            resnse.add(toResponse(b));
	                        }
	                        break;

	                    default:
	                        break;
	                }
	            }

	            if (!resnse.isEmpty()) {
	                res.setStatusCode(200);
	                res.setData(resnse);
	                res.setMessage("Appointments Are Found");
	            } else {
	                res.setStatusCode(200);
	                res.setData(resnse);
	                res.setMessage("Appointments Are Not Found");
	            }
	        } else {
	            res.setStatusCode(200);
	            res.setData(resnse);
	            res.setMessage("Appointments Are Not Found");
	        }
	    } catch (Exception e) {
	        resnse = null;
	        res.setStatusCode(500);
	        res.setData(resnse);
	        res.setMessage(e.getMessage());
	    }
	    return ResponseEntity.status(res.getStatusCode()).body(res);
	}

		
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
	public List<BookingResponse> bookingByCustomerId(String customerId) {
		List<Booking> bookings = repository.findByCustomerId(customerId);
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
	public List<BookingResponse> bookingByPatientId(String patientId) {
		List<Booking> bookings = repository.findByPatientId(patientId);
		List<Booking> reversedBookings = new ArrayList<>();
		for(int i = bookings.size()-1; i >= 0; i--) {
			if(bookings.get(i).getStatus().equalsIgnoreCase("In-Progress")) {
			reversedBookings.add(bookings.get(i));
		}}
		if (bookings == null  || bookings.isEmpty()) {
			return null;
		}
		return toResponses(reversedBookings);
	}
		
	@Override
	public List<BookingInfoByInput> bookingByInput(String input,String clinicId) {
		   List<BookingInfoByInput> outpt = new ArrayList<>();
	       try {
	    	 List<Booking> bookings = repository.findByMobileNumberAndClinicId(input,clinicId);
		        // If still not found, try customerId
	    	// System.out.println(bookings);
		    	 if(bookings == null || bookings.isEmpty()) {
		            bookings = repository.findByCustomerIdAndClinicId(input,clinicId);
		            //System.out.println(bookings);
		    	} 
	        	 if(bookings == null || bookings.isEmpty()) {
		            bookings = repository.findByNameIgnoreCaseAndClinicId(input,clinicId);
		          // System.out.println(bookings);
		        }
	        	if(bookings != null && !bookings.isEmpty()) {
		        for(Booking b : bookings) {
		        	//System.out.println(b);
		        BookingInfoByInput bkng = new BookingInfoByInput() ;	
		        bkng.setAge(b.getAge());
		        bkng.setClinicId(b.getClinicId());
		        bkng.setCustomerId(b.getCustomerId());
		        bkng.setGender(b.getGender());
		        bkng.setMobileNumber(b.getMobileNumber());
		        bkng.setName(b.getName());
		        bkng.setPatientAddress(b.getPatientAddress());
		        bkng.setPatientId(b.getPatientId());
		        bkng.setPatientMobileNumber(b.getPatientMobileNumber());
		        bkng.setRelation(b.getRelation());
		        outpt.add(bkng);}}
	        if(input.contains("_")){
		    List<Booking> bookgs = repository.findByPatientIdAndClinicId(input,clinicId);
	    	if( bookgs != null && !bookgs.isEmpty()) {
		        Booking b = bookgs.get(bookgs.size()-1);	
		        BookingInfoByInput bkng = new BookingInfoByInput() ;	
		        bkng.setAge(b.getAge());
		        bkng.setClinicId(b.getClinicId());
		        bkng.setCustomerId(b.getCustomerId());
		        bkng.setGender(b.getGender());
		        bkng.setMobileNumber(b.getMobileNumber());
		        bkng.setName(b.getName());
		        bkng.setPatientAddress(b.getPatientAddress());
		        bkng.setPatientId(b.getPatientId());
		        bkng.setPatientMobileNumber(b.getPatientMobileNumber());
		        bkng.setRelation(b.getRelation());
		        outpt.add(bkng); 
		        }else{
		      Response res = clinicAdminFeign.getCustomerByPatientId(input).getBody();
		     // System.out.println(res);
		      CustomerOnbordingDTO bg = new ObjectMapper().convertValue(res.getData(), CustomerOnbordingDTO.class);
		      //System.out.println(bg);
		      BookingInfoByInput bkng = new BookingInfoByInput() ;	
		        bkng.setAge(bg.getAge());
		        bkng.setClinicId(null);
		        bkng.setCustomerId(bg.getCustomerId());
		        bkng.setGender(bg.getGender());
		        bkng.setMobileNumber(bg.getMobileNumber());
		        bkng.setName(bg.getFullName());
		        bkng.setPatientAddress(bg.getAddress().toString());
		        bkng.setPatientId(bg.getPatientId());
		        bkng.setPatientMobileNumber(bg.getMobileNumber());
		        bkng.setRelation(null);
		        outpt.add(bkng);}} 
	       }catch (Exception e) {
	        //System.err.println("Error fetching bookings: " + e.getMessage());
	        System.out.println(e.getMessage());; // safe fallback
	    }
	    return outpt;
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
	
	
//	public ResponseEntity<?> updateAppointment(BookingResponse bookingResponse){
//		try {
//		Booking entity = repository.findByBookingId(bookingResponse.getBookingId())
//	.orElseThrow(() -> new RuntimeException("Invalid Booking Id Please provide Valid Id"));
//		if (bookingResponse.getAge() != null) entity.setAge(bookingResponse.getAge());
//		if (bookingResponse.getBookedAt() != null) entity.setBookedAt(bookingResponse.getBookedAt());
//		if (bookingResponse.getBookingFor() != null) entity.setBookingFor(bookingResponse.getBookingFor());
//		if (bookingResponse.getClinicId() != null) entity.setClinicId(bookingResponse.getClinicId());
//		if (bookingResponse.getConsultationFee() != 0) entity.setConsultationFee(bookingResponse.getConsultationFee());
//		if (bookingResponse.getConsultationType() != null) entity.setConsultationType(bookingResponse.getConsultationType());
//		if (bookingResponse.getDoctorId() != null) entity.setDoctorId(bookingResponse.getDoctorId());
//		if (bookingResponse.getGender() != null) entity.setGender(bookingResponse.getGender());
//		if (bookingResponse.getMobileNumber() != null) entity.setMobileNumber(bookingResponse.getMobileNumber());
//		if (bookingResponse.getName() != null) entity.setName(bookingResponse.getName());
//		if (bookingResponse.getProblem() != null) entity.setProblem(bookingResponse.getProblem());
//		if (bookingResponse.getServiceDate() != null) entity.setServiceDate(bookingResponse.getServiceDate());
//		if (bookingResponse.getServicetime() != null) entity.setServicetime(bookingResponse.getServicetime());
//		if (bookingResponse.getStatus() != null) entity.setStatus(bookingResponse.getStatus());
//		if (bookingResponse.getNotes() != null) entity.setNotes(bookingResponse.getNotes());
//		if (bookingResponse.getReports() != null)
//		    entity.setReports(new ObjectMapper().convertValue(bookingResponse.getReports(),new TypeReference<List<ReportsList>>(){}));
//		if (bookingResponse.getSubServiceId() != null) entity.setSubServiceId(bookingResponse.getSubServiceId());
//		if (bookingResponse.getSubServiceName() != null) entity.setSubServiceName(bookingResponse.getSubServiceName());
//		if (bookingResponse.getReasonForCancel() != null) entity.setReasonForCancel(bookingResponse.getReasonForCancel());
//		if (bookingResponse.getTotalFee() != 0) entity.setTotalFee(bookingResponse.getTotalFee());
//		if (bookingResponse.getFreeFollowUpsLeft() != null) entity.setFreeFollowUpsLeft(bookingResponse.getFreeFollowUpsLeft());
//		
//		Booking e = repository.save(entity);			
//		if(e != null){	
//		return new ResponseEntity<>(ResponseStructure.buildResponse(e,
//				"Booking updated sucessfully",HttpStatus.OK, HttpStatus.OK.value()),
//				HttpStatus.OK);			
//		}else {
//			return new ResponseEntity<>(ResponseStructure.buildResponse(null,
//					"Booking Not Updated", HttpStatus.NOT_FOUND, HttpStatus.NOT_FOUND.value()),
//					HttpStatus.NOT_FOUND);
//		}}catch(Exception e) {
//			return new ResponseEntity<>(ResponseStructure.buildResponse(null,
//					e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR.value()),
//					HttpStatus.INTERNAL_SERVER_ERROR);
//		}}
	

//	public ResponseEntity<?> updateAppointment(BookingResponse bookingResponse) {
//	    try {
//	        Booking entity = repository.findByBookingId(bookingResponse.getBookingId())
//	            .orElseThrow(() -> new RuntimeException("Invalid Booking Id Please provide Valid Id"));
//
//	        if (bookingResponse.getAge() != null) entity.setAge(bookingResponse.getAge());
//	        if (bookingResponse.getBookedAt() != null) entity.setBookedAt(bookingResponse.getBookedAt());
//	        if (bookingResponse.getBookingFor() != null) entity.setBookingFor(bookingResponse.getBookingFor());
//	        if (bookingResponse.getClinicId() != null) entity.setClinicId(bookingResponse.getClinicId());
//	        if (bookingResponse.getConsultationFee() != 0) entity.setConsultationFee(bookingResponse.getConsultationFee());
//	        if (bookingResponse.getConsultationType() != null) entity.setConsultationType(bookingResponse.getConsultationType());
//	        if (bookingResponse.getDoctorId() != null) entity.setDoctorId(bookingResponse.getDoctorId());
//	        if (bookingResponse.getGender() != null) entity.setGender(bookingResponse.getGender());
//	        if (bookingResponse.getMobileNumber() != null) entity.setMobileNumber(bookingResponse.getMobileNumber());
//	        if (bookingResponse.getName() != null) entity.setName(bookingResponse.getName());
//	        if (bookingResponse.getProblem() != null) entity.setProblem(bookingResponse.getProblem());
//	        if (bookingResponse.getServiceDate() != null) entity.setServiceDate(bookingResponse.getServiceDate());
//	        if (bookingResponse.getServicetime() != null) entity.setServicetime(bookingResponse.getServicetime());
//	        if (bookingResponse.getStatus() != null) entity.setStatus(bookingResponse.getStatus());
//	        if (bookingResponse.getNotes() != null) entity.setNotes(bookingResponse.getNotes());
//	        if (bookingResponse.getReports() != null)
//	            entity.setReports(new ObjectMapper().convertValue(bookingResponse.getReports(),
//	                new TypeReference<List<ReportsList>>(){}));
//	        if (bookingResponse.getSubServiceId() != null) entity.setSubServiceId(bookingResponse.getSubServiceId());
//	        if (bookingResponse.getSubServiceName() != null) entity.setSubServiceName(bookingResponse.getSubServiceName());
//	        if (bookingResponse.getReasonForCancel() != null) entity.setReasonForCancel(bookingResponse.getReasonForCancel());
//	        if (bookingResponse.getTotalFee() != 0) entity.setTotalFee(bookingResponse.getTotalFee());
//	        if (bookingResponse.getFreeFollowUpsLeft() != null) entity.setFreeFollowUpsLeft(bookingResponse.getFreeFollowUpsLeft());
//	        if (bookingResponse.getFreeFollowUps() != null) entity.setFreeFollowUps(bookingResponse.getFreeFollowUps());
//	        if (bookingResponse.getVisitCount() != null) entity.setVisitCount(bookingResponse.getVisitCount());
//	        if (bookingResponse.getFollowupStatus() != null) entity.setFollowupStatus(bookingResponse.getFollowupStatus());
//	        if (bookingResponse.getFollowupDate() != null) entity.setFollowupDate(bookingResponse.getFollowupDate());
//
//	        // ✅ Add Sitting Summary updates
//	        if (bookingResponse.getTotalSittings() != null) entity.setTotalSittings(bookingResponse.getTotalSittings());
//	        if (bookingResponse.getTakenSittings() != null) entity.setTakenSittings(bookingResponse.getTakenSittings());
//	        if (bookingResponse.getPendingSittings() != null) entity.setPendingSittings(bookingResponse.getPendingSittings());
//	        if (bookingResponse.getCurrentSitting() != null) entity.setCurrentSitting(bookingResponse.getCurrentSitting());
//
//	        Booking e = repository.save(entity);            
//	        if (e != null) {    
//	            return new ResponseEntity<>(ResponseStructure.buildResponse(e,
//	                    "Booking updated successfully", HttpStatus.OK, HttpStatus.OK.value()),
//	                    HttpStatus.OK);            
//	        } else {
//	            return new ResponseEntity<>(ResponseStructure.buildResponse(null,
//	                    "Booking Not Updated", HttpStatus.NOT_FOUND, HttpStatus.NOT_FOUND.value()),
//	                    HttpStatus.NOT_FOUND);
//	        }
//	    } catch (Exception e) {
//	        return new ResponseEntity<>(ResponseStructure.buildResponse(null,
//	                e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR.value()),
//	                HttpStatus.INTERNAL_SERVER_ERROR);
//	    }
//	}

//
//	@Override
//	public ResponseEntity<?> updateAppointment(BookingResponse bookingResponse) {
//	    try {
//	        Booking entity = repository.findByBookingId(bookingResponse.getBookingId())
//	                .orElseThrow(() -> new RuntimeException("Invalid Booking Id. Please provide a valid Id."));
//
//	        // ✅ Update basic details if provided
//	        if (bookingResponse.getAge() != null) entity.setAge(bookingResponse.getAge());
//	        if (bookingResponse.getBookedAt() != null) entity.setBookedAt(bookingResponse.getBookedAt());
//	        if (bookingResponse.getBookingFor() != null) entity.setBookingFor(bookingResponse.getBookingFor());
//	        if (bookingResponse.getClinicId() != null) entity.setClinicId(bookingResponse.getClinicId());
//	        if (bookingResponse.getConsultationFee() != 0) entity.setConsultationFee(bookingResponse.getConsultationFee());
//	        if (bookingResponse.getConsultationType() != null) entity.setConsultationType(bookingResponse.getConsultationType());
//	        if (bookingResponse.getDoctorId() != null) entity.setDoctorId(bookingResponse.getDoctorId());
//	        if (bookingResponse.getGender() != null) entity.setGender(bookingResponse.getGender());
//	        if (bookingResponse.getMobileNumber() != null) entity.setMobileNumber(bookingResponse.getMobileNumber());
//	        if (bookingResponse.getName() != null) entity.setName(bookingResponse.getName());
//	        if (bookingResponse.getProblem() != null) entity.setProblem(bookingResponse.getProblem());
//	        if (bookingResponse.getServiceDate() != null) entity.setServiceDate(bookingResponse.getServiceDate());
//	        if (bookingResponse.getServicetime() != null) entity.setServicetime(bookingResponse.getServicetime());
//	        if (bookingResponse.getStatus() != null) entity.setStatus(bookingResponse.getStatus());
//	        if (bookingResponse.getNotes() != null) entity.setNotes(bookingResponse.getNotes());
//	        if (bookingResponse.getReports() != null) {
//	            entity.setReports(new ObjectMapper().convertValue(
//	                    bookingResponse.getReports(),
//	                    new TypeReference<List<ReportsList>>() {}));
//	        }
//	        if (bookingResponse.getSubServiceId() != null) entity.setSubServiceId(bookingResponse.getSubServiceId());
//	        if (bookingResponse.getSubServiceName() != null) entity.setSubServiceName(bookingResponse.getSubServiceName());
//	        if (bookingResponse.getReasonForCancel() != null) entity.setReasonForCancel(bookingResponse.getReasonForCancel());
//	        if (bookingResponse.getTotalFee() != 0) entity.setTotalFee(bookingResponse.getTotalFee());
//	        if (bookingResponse.getFreeFollowUpsLeft() != null) entity.setFreeFollowUpsLeft(bookingResponse.getFreeFollowUpsLeft());
//	        if (bookingResponse.getFreeFollowUps() != null) entity.setFreeFollowUps(bookingResponse.getFreeFollowUps());
//	        if (bookingResponse.getVisitCount() != null) entity.setVisitCount(bookingResponse.getVisitCount());
//	        if (bookingResponse.getFollowupStatus() != null) entity.setFollowupStatus(bookingResponse.getFollowupStatus());
//	        if (bookingResponse.getFollowupDate() != null) entity.setFollowupDate(bookingResponse.getFollowupDate());
//
//	        // ✅ Total sittings from request
//	        if (bookingResponse.getTotalSittings() != null) {
//	            entity.setTotalSittings(bookingResponse.getTotalSittings());
//	        }
//
//	        // ✅ Update Treatment Dates & Auto Sitting Summary
//	        if (bookingResponse.getTreatmentDates() != null && !bookingResponse.getTreatmentDates().isEmpty()) {
//	            List<LocalDate> existingDates = entity.getTreatmentDates() != null ? entity.getTreatmentDates() : new ArrayList<>();
//	            for (LocalDate newDate : bookingResponse.getTreatmentDates()) {
//	                if (!existingDates.contains(newDate)) {
//	                    existingDates.add(newDate);
//	                }
//	            }
//	            entity.setTreatmentDates(existingDates);
//
//	            // Auto calculate sitting summary
//	            int takenSittings = existingDates.size();
//	            int totalSittings = entity.getTotalSittings() != null ? entity.getTotalSittings() : 0;
//	            int pendingSittings = Math.max(totalSittings - takenSittings, 0);
//	            int currentSitting = (pendingSittings > 0) ? (takenSittings + 1) : takenSittings;
//
//	            entity.setTakenSittings(takenSittings);
//	            entity.setPendingSittings(pendingSittings);
//	            entity.setCurrentSitting(currentSitting);
//
//	            // ✅ Auto update status when sittings are completed
//	            if (pendingSittings == 0 && totalSittings > 0) {
//	                entity.setStatus("Completed");
//	            }
//	        }
//
//	        // ✅ Save updated booking
//	        Booking updatedBooking = repository.save(entity);
//
//	        return new ResponseEntity<>(
//	                ResponseStructure.buildResponse(
//	                        updatedBooking,
//	                        "Booking updated successfully",
//	                        HttpStatus.OK,
//	                        HttpStatus.OK.value()
//	                ),
//	                HttpStatus.OK
//	        );
//
//	    } catch (Exception e) {
//	        return new ResponseEntity<>(
//	                ResponseStructure.buildResponse(
//	                        null,
//	                        e.getMessage(),
//	                        HttpStatus.INTERNAL_SERVER_ERROR,
//	                        HttpStatus.INTERNAL_SERVER_ERROR.value()
//	                ),
//	                HttpStatus.INTERNAL_SERVER_ERROR
//	        );
//	    }
//	}

//	@Override
//	public ResponseEntity<?> updateAppointment(BookingResponse bookingResponse) {
//	    try {
//	        Booking entity = repository.findByBookingId(bookingResponse.getBookingId())
//	                .orElseThrow(() -> new RuntimeException("Invalid Booking Id. Please provide a valid Id."));
//
//	        // --------------------- Update basic fields ---------------------
//	        if (bookingResponse.getAge() != null) entity.setAge(bookingResponse.getAge());
//	        if (bookingResponse.getBookedAt() != null) entity.setBookedAt(bookingResponse.getBookedAt());
//	        if (bookingResponse.getBookingFor() != null) entity.setBookingFor(bookingResponse.getBookingFor());
//	        if (bookingResponse.getClinicId() != null) entity.setClinicId(bookingResponse.getClinicId());
//	        if (bookingResponse.getConsultationFee() != 0) entity.setConsultationFee(bookingResponse.getConsultationFee());
//	        if (bookingResponse.getConsultationType() != null) entity.setConsultationType(bookingResponse.getConsultationType());
//	        if (bookingResponse.getDoctorId() != null) entity.setDoctorId(bookingResponse.getDoctorId());
//	        if (bookingResponse.getGender() != null) entity.setGender(bookingResponse.getGender());
//	        if (bookingResponse.getMobileNumber() != null) entity.setMobileNumber(bookingResponse.getMobileNumber());
//	        if (bookingResponse.getName() != null) entity.setName(bookingResponse.getName());
//	        if (bookingResponse.getProblem() != null) entity.setProblem(bookingResponse.getProblem());
//	        if (bookingResponse.getServiceDate() != null) entity.setServiceDate(bookingResponse.getServiceDate());
//	        if (bookingResponse.getServicetime() != null) entity.setServicetime(bookingResponse.getServicetime());
//	        if (bookingResponse.getStatus() != null) entity.setStatus(bookingResponse.getStatus());
//	        if (bookingResponse.getNotes() != null) entity.setNotes(bookingResponse.getNotes());
//	        if (bookingResponse.getReports() != null) {
//	            entity.setReports(new ObjectMapper().convertValue(
//	                    bookingResponse.getReports(),
//	                    new TypeReference<List<ReportsList>>() {}));
//	        }
//	        if (bookingResponse.getSubServiceId() != null) entity.setSubServiceId(bookingResponse.getSubServiceId());
//	        if (bookingResponse.getSubServiceName() != null) entity.setSubServiceName(bookingResponse.getSubServiceName());
//	        if (bookingResponse.getReasonForCancel() != null) entity.setReasonForCancel(bookingResponse.getReasonForCancel());
//	        if (bookingResponse.getTotalFee() != 0) entity.setTotalFee(bookingResponse.getTotalFee());
//	        if (bookingResponse.getFreeFollowUpsLeft() != null) entity.setFreeFollowUpsLeft(bookingResponse.getFreeFollowUpsLeft());
//	        if (bookingResponse.getFreeFollowUps() != null) entity.setFreeFollowUps(bookingResponse.getFreeFollowUps());
//	        if (bookingResponse.getVisitCount() != null) entity.setVisitCount(bookingResponse.getVisitCount());
//	        if (bookingResponse.getFollowupStatus() != null) entity.setFollowupStatus(bookingResponse.getFollowupStatus());
//	        if (bookingResponse.getFollowupDate() != null) entity.setFollowupDate(bookingResponse.getFollowupDate());
//	        if (bookingResponse.getTotalSittings() != null) entity.setTotalSittings(bookingResponse.getTotalSittings());
//
//	        // --------------------- Update treatment sittings ---------------------
//	        if (bookingResponse.getTreatments() != null && bookingResponse.getTreatments().getGeneratedData() != null) {
//	            int totalSittings = 0;
//	            int takenSittings = 0;
//	            int pendingSittings = 0;
//	            int currentSitting = 0;
//
//	            for (Map.Entry<String, TreatmentDetailsDTO> entry : bookingResponse.getTreatments().getGeneratedData().entrySet()) {
//	                TreatmentDetailsDTO treatment = entry.getValue();
//	                if (treatment != null) {
//	                    int treatmentTotalSittings = treatment.getTotalSittings() != null ? treatment.getTotalSittings() : 0;
//	                    int treatmentTakenSittings = treatment.getDates() != null ? treatment.getDates().size() : 0;
//	                    int treatmentPending = Math.max(treatmentTotalSittings - treatmentTakenSittings, 0);
//	                    int treatmentCurrent = treatmentPending > 0 ? treatmentTakenSittings + 1 : treatmentTakenSittings;
//
//	                    // Update treatment object
//	                    treatment.setTakenSittings(treatmentTakenSittings);
//	                    treatment.setPendingSittings(treatmentPending);
//	                    treatment.setCurrentSitting(treatmentCurrent);
//
//	                    // Accumulate for booking summary
//	                    totalSittings += treatmentTotalSittings;
//	                    takenSittings += treatmentTakenSittings;
//	                    pendingSittings += treatmentPending;
//	                    currentSitting = Math.max(currentSitting, treatmentCurrent);
//	                }
//	            }
//
//	            // Update booking-level sitting summary
//	            entity.setTotalSittings(totalSittings);
//	            entity.setTakenSittings(takenSittings);
//	            entity.setPendingSittings(pendingSittings);
//	            entity.setCurrentSitting(currentSitting);
//
//	            // Auto update status
//	            if (pendingSittings == 0 && totalSittings > 0) entity.setStatus("Completed");
//	            else if (takenSittings > 0) entity.setStatus("In Progress");
//	            else entity.setStatus("Booked");
//	        }
//
//	        // --------------------- Save ---------------------
//	        Booking updatedBooking = repository.save(entity);
//	        return new ResponseEntity<>(
//	                ResponseStructure.buildResponse(
//	                        updatedBooking,
//	                        "Booking updated successfully",
//	                        HttpStatus.OK,
//	                        HttpStatus.OK.value()
//	                ),
//	                HttpStatus.OK
//	        );
//
//	    } catch (Exception e) {
//	        return new ResponseEntity<>(
//	                ResponseStructure.buildResponse(
//	                        null,
//	                        e.getMessage(),
//	                        HttpStatus.INTERNAL_SERVER_ERROR,
//	                        HttpStatus.INTERNAL_SERVER_ERROR.value()
//	                ),
//	                HttpStatus.INTERNAL_SERVER_ERROR
//	        );
//	    }
//	}
	
//	@Override
//	public ResponseEntity<?> updateAppointment(BookingResponse bookingResponse) {
//	    try {
//	        Booking entity = repository.findByBookingId(bookingResponse.getBookingId())
//	                .orElseThrow(() -> new RuntimeException("Invalid Booking Id. Please provide a valid Id."));
//
//	        // --------------------- Update basic fields ---------------------
//	        if (bookingResponse.getAge() != null) entity.setAge(bookingResponse.getAge());
//	        if (bookingResponse.getBookedAt() != null) entity.setBookedAt(bookingResponse.getBookedAt());
//	        if (bookingResponse.getBookingFor() != null) entity.setBookingFor(bookingResponse.getBookingFor());
//	        if (bookingResponse.getClinicId() != null) entity.setClinicId(bookingResponse.getClinicId());
//	        if (bookingResponse.getConsultationFee() != 0) entity.setConsultationFee(bookingResponse.getConsultationFee());
//	        if (bookingResponse.getConsultationType() != null) entity.setConsultationType(bookingResponse.getConsultationType());
//	        if (bookingResponse.getDoctorId() != null) entity.setDoctorId(bookingResponse.getDoctorId());
//	        if (bookingResponse.getGender() != null) entity.setGender(bookingResponse.getGender());
//	        if (bookingResponse.getMobileNumber() != null) entity.setMobileNumber(bookingResponse.getMobileNumber());
//	        if (bookingResponse.getName() != null) entity.setName(bookingResponse.getName());
//	        if (bookingResponse.getProblem() != null) entity.setProblem(bookingResponse.getProblem());
//	        if (bookingResponse.getServiceDate() != null) entity.setServiceDate(bookingResponse.getServiceDate());
//	        if (bookingResponse.getServicetime() != null) entity.setServicetime(bookingResponse.getServicetime());
//	        if (bookingResponse.getStatus() != null) entity.setStatus(bookingResponse.getStatus());
//	        if (bookingResponse.getNotes() != null) entity.setNotes(bookingResponse.getNotes());
//	        if (bookingResponse.getReports() != null) {
//	            entity.setReports(new ObjectMapper().convertValue(
//	                    bookingResponse.getReports(),
//	                    new TypeReference<List<ReportsList>>() {}));
//	        }
//	        if (bookingResponse.getSubServiceId() != null) entity.setSubServiceId(bookingResponse.getSubServiceId());
//	        if (bookingResponse.getSubServiceName() != null) entity.setSubServiceName(bookingResponse.getSubServiceName());
//	        if (bookingResponse.getReasonForCancel() != null) entity.setReasonForCancel(bookingResponse.getReasonForCancel());
//	        if (bookingResponse.getTotalFee() != 0) entity.setTotalFee(bookingResponse.getTotalFee());
//	        if (bookingResponse.getFreeFollowUpsLeft() != null) entity.setFreeFollowUpsLeft(bookingResponse.getFreeFollowUpsLeft());
//	        if (bookingResponse.getFreeFollowUps() != null) entity.setFreeFollowUps(bookingResponse.getFreeFollowUps());
//	        if (bookingResponse.getVisitCount() != null) entity.setVisitCount(bookingResponse.getVisitCount());
//	        if (bookingResponse.getFollowupStatus() != null) entity.setFollowupStatus(bookingResponse.getFollowupStatus());
//	        if (bookingResponse.getFollowupDate() != null) entity.setFollowupDate(bookingResponse.getFollowupDate());
//	        if (bookingResponse.getTotalSittings() != null) entity.setTotalSittings(bookingResponse.getTotalSittings());
//
//	        // --------------------- Update Treatments & Dates ---------------------
//	        if (bookingResponse.getTreatments() != null && bookingResponse.getTreatments().getGeneratedData() != null) {
//	            Map<String, TreatmentDetailsDTO> updatedTreatments = entity.getTreatments() != null
//	                    ? entity.getTreatments()
//	                    : new HashMap<>();
//
//	            for (Map.Entry<String, TreatmentDetailsDTO> entry : bookingResponse.getTreatments().getGeneratedData().entrySet()) {
//	                String treatmentName = entry.getKey();
//	                TreatmentDetailsDTO incoming = entry.getValue();
//
//	                TreatmentDetailsDTO existing = updatedTreatments.getOrDefault(treatmentName, new TreatmentDetailsDTO());
//	                List<DatesDTO> existingDates = existing.getDates() != null ? existing.getDates() : new ArrayList<>();
//
//	                if (incoming.getDates() != null) {
//	                    for (DatesDTO dateDTO : incoming.getDates()) {
//	                        if (!existingDates.contains(dateDTO)) existingDates.add(dateDTO);
//	                    }
//	                }
//
//	                existing.setDates(existingDates);
//	                existing.setTotalSittings(incoming.getTotalSittings());
//	                existing.setTakenSittings(existingDates.size());
//	                existing.setPendingSittings(Math.max(existing.getTotalSittings() - existing.getTakenSittings(), 0));
//	                existing.setCurrentSitting(existing.getPendingSittings() > 0 ? existing.getTakenSittings() + 1 : existing.getTakenSittings());
//	                existing.setReason(incoming.getReason());
//	                existing.setFrequency(incoming.getFrequency());
//
//	                updatedTreatments.put(treatmentName, existing);
//	            }
//
//	            entity.setTreatments(updatedTreatments);
//
//	            // --------------------- Update Booking Summary ---------------------
//	            int totalSittings = updatedTreatments.values().stream().mapToInt(t -> t.getTotalSittings() != null ? t.getTotalSittings() : 0).sum();
//	            int takenSittings = updatedTreatments.values().stream().mapToInt(t -> t.getTakenSittings() != null ? t.getTakenSittings() : 0).sum();
//	            int pendingSittings = updatedTreatments.values().stream().mapToInt(t -> t.getPendingSittings() != null ? t.getPendingSittings() : 0).sum();
//	            int currentSitting = updatedTreatments.values().stream().mapToInt(t -> t.getCurrentSitting() != null ? t.getCurrentSitting() : 0).max().orElse(0);
//
//	            entity.setTotalSittings(totalSittings);
//	            entity.setTakenSittings(takenSittings);
//	            entity.setPendingSittings(pendingSittings);
//	            entity.setCurrentSitting(currentSitting);
//
//	            if (pendingSittings == 0 && totalSittings > 0) entity.setStatus("Completed");
//	            else if (takenSittings > 0) entity.setStatus("In-Progress");
//	            else entity.setStatus("Booked");
//	        }
//
//	        // --------------------- Save ---------------------
//	        Booking updatedBooking = repository.save(entity);
//
//	        return new ResponseEntity<>(
//	                ResponseStructure.buildResponse(
//	                        updatedBooking,
//	                        "Booking updated successfully",
//	                        HttpStatus.OK,
//	                        HttpStatus.OK.value()
//	                ),
//	                HttpStatus.OK
//	        );
//
//	    } catch (Exception e) {
//	        return new ResponseEntity<>(
//	                ResponseStructure.buildResponse(
//	                        null,
//	                        e.getMessage(),
//	                        HttpStatus.INTERNAL_SERVER_ERROR,
//	                        HttpStatus.INTERNAL_SERVER_ERROR.value()
//	                ),
//	                HttpStatus.INTERNAL_SERVER_ERROR
//	        );
//	    }
//	}

//	@Override
//	public ResponseEntity<?> updateAppointment(BookingResponse bookingResponse) {
//	    try {
//	        Booking entity = repository.findByBookingId(bookingResponse.getBookingId())
//	                .orElseThrow(() -> new RuntimeException("Invalid Booking Id. Please provide a valid Id."));
//
//	        // --- Update fields from bookingResponse to entity ---
//	        if (bookingResponse.getAge() != null) entity.setAge(bookingResponse.getAge());
//	        if (bookingResponse.getBookedAt() != null) entity.setBookedAt(bookingResponse.getBookedAt());
//	        if (bookingResponse.getBookingFor() != null) entity.setBookingFor(bookingResponse.getBookingFor());
//	        if (bookingResponse.getClinicId() != null) entity.setClinicId(bookingResponse.getClinicId());
//	        if (bookingResponse.getConsultationFee() != 0) entity.setConsultationFee(bookingResponse.getConsultationFee());
//	        if (bookingResponse.getConsultationType() != null) entity.setConsultationType(bookingResponse.getConsultationType());
//	        if (bookingResponse.getDoctorId() != null) entity.setDoctorId(bookingResponse.getDoctorId());
//	        if (bookingResponse.getGender() != null) entity.setGender(bookingResponse.getGender());
//	        if (bookingResponse.getMobileNumber() != null) entity.setMobileNumber(bookingResponse.getMobileNumber());
//	        if (bookingResponse.getName() != null) entity.setName(bookingResponse.getName());
//	        if (bookingResponse.getProblem() != null) entity.setProblem(bookingResponse.getProblem());
//	        if (bookingResponse.getServiceDate() != null) entity.setServiceDate(bookingResponse.getServiceDate());
//	        if (bookingResponse.getServicetime() != null) entity.setServicetime(bookingResponse.getServicetime());
//	        if (bookingResponse.getStatus() != null) entity.setStatus(bookingResponse.getStatus());
//	        if (bookingResponse.getNotes() != null) entity.setNotes(bookingResponse.getNotes());
//	        if (bookingResponse.getReports() != null) {
//	            entity.setReports(new ObjectMapper().convertValue(
//	                    bookingResponse.getReports(),
//	                    new TypeReference<List<ReportsList>>() {}));
//	        }
//	        if (bookingResponse.getSubServiceId() != null) entity.setSubServiceId(bookingResponse.getSubServiceId());
//	        if (bookingResponse.getSubServiceName() != null) entity.setSubServiceName(bookingResponse.getSubServiceName());
//	        if (bookingResponse.getReasonForCancel() != null) entity.setReasonForCancel(bookingResponse.getReasonForCancel());
//	        if (bookingResponse.getTotalFee() != 0) entity.setTotalFee(bookingResponse.getTotalFee());
//	        if (bookingResponse.getFreeFollowUpsLeft() != null) entity.setFreeFollowUpsLeft(bookingResponse.getFreeFollowUpsLeft());
//	        if (bookingResponse.getFreeFollowUps() != null) entity.setFreeFollowUps(bookingResponse.getFreeFollowUps());
//	        if (bookingResponse.getVisitCount() != null) entity.setVisitCount(bookingResponse.getVisitCount());
//	        if (bookingResponse.getFollowupStatus() != null) entity.setFollowupStatus(bookingResponse.getFollowupStatus());
//	        if (bookingResponse.getFollowupDate() != null) entity.setFollowupDate(bookingResponse.getFollowupDate());
//
//	        // --- Total sittings ---
//	        if (bookingResponse.getTotalSittings() != null) entity.setTotalSittings(bookingResponse.getTotalSittings());
//
//	        // --- Update treatment dates & sittings summary ---
//	        if (bookingResponse.getTreatments() != null) {
//	            entity.setTreatments(bookingResponse.getTreatments()); // copy treatments info from DTO
//	        }
//
//	        // --- Save entity ---
//	        Booking updatedBooking = repository.save(entity);
//
//	        // --- Map entity to BookingResponse to return ---
//	        BookingResponse responseDTO = new BookingResponse();
//	        responseDTO.setBookingId(updatedBooking.getBookingId());
//	        responseDTO.setBookingFor(updatedBooking.getBookingFor());
//	        responseDTO.setName(updatedBooking.getName());
//	        responseDTO.setRelation(updatedBooking.getRelation());
//	        responseDTO.setPatientMobileNumber(updatedBooking.getPatientMobileNumber());
//	        responseDTO.setPatientId(updatedBooking.getPatientId());
//	        responseDTO.setVisitType(updatedBooking.getVisitType());
//	        responseDTO.setFreeFollowUpsLeft(updatedBooking.getFreeFollowUpsLeft());
//	        responseDTO.setFreeFollowUps(updatedBooking.getFreeFollowUps());
//	        responseDTO.setPatientAddress(updatedBooking.getPatientAddress());
//	        responseDTO.setAge(updatedBooking.getAge());
//	        responseDTO.setGender(updatedBooking.getGender());
//	        responseDTO.setMobileNumber(updatedBooking.getMobileNumber());
//	        responseDTO.setCustomerId(updatedBooking.getCustomerId());
//	        responseDTO.setConsultationExpiration(updatedBooking.getConsultationExpiration());
//	        responseDTO.setCustomerDeviceId(updatedBooking.getCustomerDeviceId());
//	        responseDTO.setProblem(updatedBooking.getProblem());
//	        responseDTO.setSymptomsDuration(updatedBooking.getSymptomsDuration());
//	        responseDTO.setClinicId(updatedBooking.getClinicId());
//	        responseDTO.setClinicName(updatedBooking.getClinicName());
//	        responseDTO.setBranchId(updatedBooking.getBranchId());
//	        responseDTO.setBranchname(updatedBooking.getBranchname());
//	        responseDTO.setDoctorId(updatedBooking.getDoctorId());
//	        responseDTO.setDoctorName(updatedBooking.getDoctorName());
//	        responseDTO.setSubServiceId(updatedBooking.getSubServiceId());
//	        responseDTO.setSubServiceName(updatedBooking.getSubServiceName());
//	        responseDTO.setServiceDate(updatedBooking.getServiceDate());
//	        responseDTO.setServicetime(updatedBooking.getServicetime());
//	        responseDTO.setConsultationType(updatedBooking.getConsultationType());
//	        responseDTO.setConsultationFee(updatedBooking.getConsultationFee());
//	        responseDTO.setStatus(updatedBooking.getStatus());
//	        responseDTO.setTotalFee(updatedBooking.getTotalFee());
//	        responseDTO.setTotalSittings(updatedBooking.getTotalSittings());
//	        responseDTO.setPendingSittings(updatedBooking.getPendingSittings());
//	        responseDTO.setTakenSittings(updatedBooking.getTakenSittings());
//	        responseDTO.setCurrentSitting(updatedBooking.getCurrentSitting());
//	        responseDTO.setBookedAt(updatedBooking.getBookedAt());
//	        responseDTO.setTreatments(updatedBooking.getTreatments()); // ✅ include treatments
//
//	        // --- Return wrapped response ---
//	        return new ResponseEntity<>(
//	                ResponseStructure.buildResponse(
//	                        responseDTO,
//	                        "Booking updated successfully",
//	                        HttpStatus.OK,
//	                        HttpStatus.OK.value()
//	                ),
//	                HttpStatus.OK
//	        );
//
//	    } catch (Exception e) {
//	        return new ResponseEntity<>(
//	                ResponseStructure.buildResponse(
//	                        null,
//	                        e.getMessage(),
//	                        HttpStatus.INTERNAL_SERVER_ERROR,
//	                        HttpStatus.INTERNAL_SERVER_ERROR.value()
//	                ),
//	                HttpStatus.INTERNAL_SERVER_ERROR
//	        );
//	    }
//	}

	@Override
	public ResponseEntity<?> updateAppointment(BookingResponse bookingResponse) {
	    try {
	        // --- Fetch booking from DB ---
	        Booking entity = repository.findByBookingId(bookingResponse.getBookingId())
	                .orElseThrow(() -> new RuntimeException("Invalid Booking Id. Please provide a valid Id."));

	        // --- Update fields from bookingResponse to entity ---
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
	        if (bookingResponse.getReports() != null) {
	            entity.setReports(new ObjectMapper().convertValue(
	                    bookingResponse.getReports(),
	                    new TypeReference<List<ReportsList>>() {}));
	        }
	        if (bookingResponse.getSubServiceId() != null) entity.setSubServiceId(bookingResponse.getSubServiceId());
	        if (bookingResponse.getSubServiceName() != null) entity.setSubServiceName(bookingResponse.getSubServiceName());
	        if (bookingResponse.getReasonForCancel() != null) entity.setReasonForCancel(bookingResponse.getReasonForCancel());
	        if (bookingResponse.getTotalFee() != 0) entity.setTotalFee(bookingResponse.getTotalFee());
	        if (bookingResponse.getFreeFollowUpsLeft() != null) entity.setFreeFollowUpsLeft(bookingResponse.getFreeFollowUpsLeft());
	        if (bookingResponse.getFreeFollowUps() != null) entity.setFreeFollowUps(bookingResponse.getFreeFollowUps());
	        if (bookingResponse.getVisitCount() != null) entity.setVisitCount(bookingResponse.getVisitCount());
	        if (bookingResponse.getFollowupDate() != null) entity.setFollowupDate(bookingResponse.getFollowupDate());

	        // --- Update sitting summary ---
	        if (bookingResponse.getTotalSittings() != null) entity.setTotalSittings(bookingResponse.getTotalSittings());
	        if (bookingResponse.getTakenSittings() != null) entity.setTakenSittings(bookingResponse.getTakenSittings());
	        if (bookingResponse.getPendingSittings() != null) entity.setPendingSittings(bookingResponse.getPendingSittings());
	        if (bookingResponse.getCurrentSitting() != null) entity.setCurrentSitting(bookingResponse.getCurrentSitting());

	        // --- Update treatments (map + sitting summary inside) ---
	        if (bookingResponse.getTreatments() != null) {
	            entity.setTreatments(bookingResponse.getTreatments());
	        }

	        // --- Save updated booking ---
	        Booking updatedBooking = repository.save(entity);

	        // --- Build response DTO ---
	        BookingResponse responseDTO = new BookingResponse();
	        responseDTO.setBookingId(updatedBooking.getBookingId());
	        responseDTO.setBookingFor(updatedBooking.getBookingFor());
	        responseDTO.setName(updatedBooking.getName());
	        responseDTO.setRelation(updatedBooking.getRelation());
	        responseDTO.setPatientMobileNumber(updatedBooking.getPatientMobileNumber());
	        responseDTO.setPatientId(updatedBooking.getPatientId());
	        responseDTO.setVisitType(updatedBooking.getVisitType());
	        responseDTO.setFreeFollowUpsLeft(updatedBooking.getFreeFollowUpsLeft());
	        responseDTO.setFreeFollowUps(updatedBooking.getFreeFollowUps());
	        responseDTO.setPatientAddress(updatedBooking.getPatientAddress());
	        responseDTO.setAge(updatedBooking.getAge());
	        responseDTO.setGender(updatedBooking.getGender());
	        responseDTO.setMobileNumber(updatedBooking.getMobileNumber());
	        responseDTO.setCustomerId(updatedBooking.getCustomerId());
	        responseDTO.setConsultationExpiration(updatedBooking.getConsultationExpiration());
	        responseDTO.setCustomerDeviceId(updatedBooking.getCustomerDeviceId());
	        responseDTO.setProblem(updatedBooking.getProblem());
	        responseDTO.setSymptomsDuration(updatedBooking.getSymptomsDuration());
	        responseDTO.setClinicId(updatedBooking.getClinicId());
	        responseDTO.setClinicName(updatedBooking.getClinicName());
	        responseDTO.setBranchId(updatedBooking.getBranchId());
	        responseDTO.setBranchname(updatedBooking.getBranchname());
	        responseDTO.setDoctorId(updatedBooking.getDoctorId());
	        responseDTO.setDoctorName(updatedBooking.getDoctorName());
	        responseDTO.setSubServiceId(updatedBooking.getSubServiceId());
	        responseDTO.setSubServiceName(updatedBooking.getSubServiceName());
	        responseDTO.setServiceDate(updatedBooking.getServiceDate());
	        responseDTO.setServicetime(updatedBooking.getServicetime());
	        responseDTO.setConsultationType(updatedBooking.getConsultationType());
	        responseDTO.setConsultationFee(updatedBooking.getConsultationFee());
	        responseDTO.setStatus(updatedBooking.getStatus());
	        responseDTO.setTotalFee(updatedBooking.getTotalFee());

	        // ✅ Sitting summary
	        responseDTO.setTotalSittings(updatedBooking.getTotalSittings());
	        responseDTO.setPendingSittings(updatedBooking.getPendingSittings());
	        responseDTO.setTakenSittings(updatedBooking.getTakenSittings());
	        responseDTO.setCurrentSitting(updatedBooking.getCurrentSitting());

	        responseDTO.setBookedAt(updatedBooking.getBookedAt());

	        // ✅ Treatments (with dates, sittings, status)
	        responseDTO.setTreatments(updatedBooking.getTreatments());

	        // --- Return wrapped response ---
	        return new ResponseEntity<>(
	                ResponseStructure.buildResponse(
	                        responseDTO,
	                        "Booking updated successfully",
	                        HttpStatus.OK,
	                        HttpStatus.OK.value()
	                ),
	                HttpStatus.OK
	        );

	    } catch (Exception e) {
	        return new ResponseEntity<>(
	                ResponseStructure.buildResponse(
	                        null,
	                        e.getMessage(),
	                        HttpStatus.INTERNAL_SERVER_ERROR,
	                        HttpStatus.INTERNAL_SERVER_ERROR.value()
	                ),
	                HttpStatus.INTERNAL_SERVER_ERROR
	        );
	    }
	}

	
//	@Scheduled(cron = "0 01 0 * * ?")
//	////@Scheduled(fixedRate = 20000)
//	private void changingStatusFromConfirmedToCompleted() {
//	    try {
//	        List<Booking> bookings = repository.findAll();
//	        for (Booking b : bookings) {
//	            if (b.getStatus().equalsIgnoreCase("In-Progress")) {
//	            	
//	                DateTimeFormatter inputFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy hh:mm a");
//	                LocalDateTime bookedDateTime = LocalDateTime.parse(b.getBookedAt(), inputFormatter);
//                   // System.out.println(bookedDateTime);
//                    
//	                ZonedDateTime istTime = ZonedDateTime.now(ZoneId.of("Asia/Kolkata"));
//	                LocalDate todayDate = istTime.toLocalDate(); // only date part
//	                LocalDate bookedDate = bookedDateTime.toLocalDate(); // only date part
//                   // System.out.println(bookedDate);
//	                long gap = ChronoUnit.DAYS.between(bookedDate, todayDate);
//                   // System.out.println(gap);	               
//	                int expirationDays = Integer.parseInt(Character.toString(b.getConsultationExpiration().charAt(0)) + 
//	            			Character.toString(b.getConsultationExpiration().charAt(1)));
//                   // System.out.println(expirationDays);
//	               
//	                if (gap > expirationDays) {
//	                    b.setStatus("Completed");
//	                    repository.save(b);
//
//	                    NotificationDTO n = notificationFeign.getNotificationByBookingId(b.getBookingId());
//	                    n.getData().setStatus("Completed");
//	                    notificationFeign.updateNotification(n);
//	                    //System.out.println("Updated to Completed for bookingId: " + b.getBookingId());
//	                    }}}}catch (Exception e) {}}
//
//	
//	
//	@Scheduled(cron = "0 30 0 * * ?")
//	////@Scheduled(fixedRate = 20000)
//	private void secondTimeChangingStatusFromConfirmedToCompleted() {
//	    try {
//	        List<Booking> bookings = repository.findAll();
//	        for (Booking b : bookings) {
//	            if (b.getStatus().equalsIgnoreCase("In-Progress")) {
//	              
//	                DateTimeFormatter inputFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy hh:mm a");
//	                LocalDateTime bookedDateTime = LocalDateTime.parse(b.getBookedAt(), inputFormatter);
//	               // System.out.println(bookedDateTime);
//	                ZonedDateTime istTime = ZonedDateTime.now(ZoneId.of("Asia/Kolkata"));
//	                LocalDate todayDate = istTime.toLocalDate(); // only date part
//	                LocalDate bookedDate = bookedDateTime.toLocalDate(); // only date part
//	               // System.out.println(bookedDate);
//	                long gap = ChronoUnit.DAYS.between(bookedDate, todayDate);
//	                int expirationDays = Integer.parseInt(Character.toString(b.getConsultationExpiration().charAt(0)) + 
//	            			Character.toString(b.getConsultationExpiration().charAt(1)));
//	                //System.out.println(gap);
//	               // System.out.println(expirationDays);
//	                if (gap > expirationDays) {
//	                    b.setStatus("Completed");
//	                    repository.save(b);
//
//	                    NotificationDTO n = notificationFeign.getNotificationByBookingId(b.getBookingId());
//	                    n.getData().setStatus("Completed");
//	                    notificationFeign.updateNotification(n);
//
//	                    //System.out.println("Updated to Completed for bookingId: " + b.getBookingId());
//	                }}}}catch (Exception e) {}}
//
//	
	
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
		
		
		 
//		public ResponseEntity<?> getInProgressAppointmentsByCustomerId(String customerId) {
//		    ResponseStructure<List<BookingResponse>> res = new ResponseStructure<>();
//		    List<BookingResponse> finalList = new ArrayList<>();
//		    Response response = new Response();
//		    try {
//		        List<Booking> booked = repository.findByCustomerId(customerId);
//		        if (booked == null || booked.isEmpty()) {
//		            res.setStatusCode(200);
//		            res.setHttpStatus(HttpStatus.OK);
//		            res.setMessage("No bookings found for customer");
//		            res.setData(finalList);
//		            return ResponseEntity.ok(res);
//		        }
//		        LocalDate today = LocalDate.now();
//		        LocalDate sixthDate = today.plusDays(6);       
//		        DateTimeFormatter isoFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
//		        for (Booking booking : booked) {
//		            if (!"In-Progress".equalsIgnoreCase(booking.getStatus())) {
//		                continue;
//		            }
//		            // ✅ Include any In-Progress booking with serviceDate between today and sixthDate
//		            LocalDate ld = null;
//		            if(booking.getFollowupDate() != null) {
//		            	ld = LocalDate.parse(booking.getFollowupDate(), isoFormatter);
//		            }else {
//		            	if(booking.getServiceDate() != null) {
//			            	ld = LocalDate.parse(booking.getServiceDate(), isoFormatter);
//			            }	
//		            }
//		            if(!ld.isAfter(sixthDate)) {
//		            // Fetch doctor save details
//		            try {
//		                response = doctorFeign.getDoctorSaveDetailsByBookingId(booking.getBookingId()).getBody();
//		               // System.out.println(response);
//		            } catch (Exception e) {
//		                System.out.println(e.getMessage());
//		            }
//
//		            if (response != null && response.getData() != null) {
//		                saveDetails = new ObjectMapper().convertValue(response.getData(), DoctorSaveDetailsDTO.class);
//		               // System.out.println(saveDetails);
//		            } else {}
//		            // ✅ Stream-based Treatments + Sittings + Next Follow-Up
//		            if (saveDetails.getTreatments() != null &&
//		                saveDetails.getTreatments().getGeneratedData() != null &&
//		                !saveDetails.getTreatments().getGeneratedData().isEmpty()) {
//
//		                // Flatten all treatment dates into sorted list
//		                List<LocalDate> allDates = saveDetails.getTreatments().getGeneratedData().values().stream()
//		                        .filter(Objects::nonNull)
//		                        .flatMap(details -> details.getDates() != null
//		                                ? details.getDates().stream()
//		                                    .map(d -> LocalDate.parse(d.getDate(), isoFormatter))
//		                                : Stream.empty())
//		                        .sorted()
//		                        .toList();
//                            //System.out.println(allDates);
//		                // Calculate totalSittings and pendingSittings
//		                int totalSittingsSum = saveDetails.getTreatments().getGeneratedData().values().stream()
//		                        .filter(Objects::nonNull)
//		                        .mapToInt(d -> d.getTotalSittings() != null ? d.getTotalSittings() : 0)
//		                        .sum();
//		               // System.out.println(totalSittingsSum);
//		                int pendingSittingsSum = saveDetails.getTreatments().getGeneratedData().values().stream()
//		                        .filter(Objects::nonNull)
//		                        .mapToInt(d -> d.getSittings() != null ? d.getSittings() : 0)
//		                        .sum();
//		                //System.out.println(pendingSittingsSum);
//		                AtomicInteger takenSittingsCount = new AtomicInteger(0);
//
//		                // Determine next follow-up date according to your rules
//		                Optional<LocalDate> nextFollowupOpt = allDates.stream()
//		                        .map(sittingDate -> {
//		                            boolean sittingBooked = false;
//		                            try {
//		                                Booking resp =
//		                                		repository.findByPatientIdAndFollowupDate(
//		                                                saveDetails.getPatientId(),
//		                                                sittingDate.format(isoFormatter));
//
//		                                if (resp != null) {
//		                                    sittingBooked = true;
//		                                    takenSittingsCount.incrementAndGet();
//		                                }
//		                            } catch (Exception ex) {
//		                                System.err.println("Error checking booking for date "
//		                                        + sittingDate + ": " + ex.getMessage());
//		                            }
//                                    if(booking.getFollowupDate() != null) {
//		                            if (LocalDate.parse(booking.getFollowupDate(), isoFormatter).isBefore(today)) {
//		                                // Past date → pick first future date if available
//		                                return allDates.stream()
//		                                        .filter(f -> f.isAfter(today))
//		                                        .findFirst()
//		                                        .orElse(null);
//		                            } else if (LocalDate.parse(booking.getFollowupDate(), isoFormatter).isEqual(today)) {
//		                                if (sittingBooked) {
//		                                    // Today booked → pick first future date if available
//		                                    return allDates.stream()
//		                                            .filter(f -> f.isAfter(today))
//		                                            .findFirst()
//		                                            .orElse(null);
//		                                } else {
//		                                    // Today not booked → keep today
//		                                    return sittingDate;
//		                                }
//		                            } else {
//		                                // Future dates → do not modify follow-up
//		                                return null;
//		                            }
//		                        }else{
//		                        	 return allDates.stream()                                        
//		                                        .findFirst()
//		                                        .orElse(null);
//		                        }})
//		                        .filter(Objects::nonNull)
//		                        .findFirst();
//		                LocalDate lstSitting = allDates.get(allDates.size()-1);
//		                if(lstSitting.equals(LocalDate.now()) || lstSitting.isAfter(LocalDate.now())) {
//		                	exp = lstSitting.plusDays(Integer.parseInt(booking.getConsultationExpiration().replaceAll("\\D+", "")));
//		                	finalList = inprogressAppointmentsByConsultationExpiration(exp, booking,saveDetails); 
//		                }
//		                // Update booking object
//		                booking.setTotalSittings(totalSittingsSum);
//		                booking.setPendingSittings(pendingSittingsSum);
//		                booking.setTakenSittings(takenSittingsCount.get());
//		                booking.setCurrentSitting(pendingSittingsSum);
//		                nextFollowupOpt.ifPresent(d -> booking.setFollowupDate(d.format(isoFormatter)));
//		                finalList.add(toResponse(booking));
//		                //System.out.println(nextFollowupOpt);
//		                //System.out.println(finalList);
//		            }
//		            // ✅ Existing Follow-Up section
//		            else if (saveDetails.getFollowUp() != null &&
//		                saveDetails.getFollowUp().getNextFollowUpDate() != null) {
//		                try {
//		                	 int days = 0;
//			                	if(exp == null ){
//			                    days = Integer.parseInt(booking.getConsultationExpiration().replaceAll("\\D+", ""));
//			                    //System.out.println(days);
//			                    LocalDate serviceDate  = LocalDate.parse(booking.getServiceDate(), isoFormatter);
//			                    exp = serviceDate.plusDays(days);}
//		                    LocalDate followDate = LocalDate.parse(saveDetails.getFollowUp().getNextFollowUpDate(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);
//		                    if (!followDate.isBefore(today) && !followDate.isAfter(sixthDate) && !followDate.isAfter(exp)) {
//		                        Booking bkng = new Booking(booking);
//		                        bkng.setFollowupDate(followDate.format(isoFormatter));
//		                        bkng.setStatus("In-Progress");
//		                            finalList.add(toResponse(bkng));		                        
//		                    }
//		                } catch (Exception e) {
//		                    System.out.println(e.getMessage());
//		                }
//		            }else {        
//		            // ✅ Consultation expiration fallback
//		            if (booking.getConsultationExpiration() != null) {
//		                try {
//		                	  int days = 0;
//		                	if(exp == null ){
//		                    days = Integer.parseInt(booking.getConsultationExpiration().replaceAll("\\D+", ""));
//		                   // System.out.println(days);
//		                    LocalDate serviceDate  = LocalDate.parse(booking.getServiceDate(), isoFormatter);
//		                    exp = serviceDate.plusDays(days);}
//		                   // System.out.println(expDate);
//		                    for (int i = 0; i <= 6; i++) {
//		                        LocalDate date = today.plusDays(i);
//		                        //System.out.println(date);
//		                       // System.out.println(sixthDate);
//		                        if ((!date.isAfter(sixthDate)) && (date.isBefore(exp) || date.equals(exp))) {
//		                            //System.out.println("hii");
//		                        	Booking bkng = new Booking(booking);
//		                        	//bkng.setConsentFormPdf(null);
//		                        	//bkng.setAttachments(null);
//		                        	//bkng.setReports(null);
//		                           // System.out.println(bkng);
//		                            bkng.setFollowupDate(date.format(isoFormatter));
//		                            bkng.setStatus("In-Progress");	                            
//		                            finalList.add(toResponse(bkng));
//		                        }
//		                    }
//		                } catch (Exception e) {
//		                	 System.out.println(e.getMessage());
//		                }}
//		            }}
//		        }
//		        res.setStatusCode(200);
//		        res.setHttpStatus(HttpStatus.OK);
//		        res.setMessage(finalList.isEmpty()
//		                ? "No In-Progress or Today appointments found"
//		                : "In-Progress appointments found");
//		        res.setData(finalList);
//
//		    } catch (Exception e) {
//		        res.setStatusCode(500);
//		        res.setHttpStatus(HttpStatus.INTERNAL_SERVER_ERROR);
//		        res.setMessage("Error: " + e.getMessage());
//		    }
//
//		    return ResponseEntity.status(res.getStatusCode()).body(res);
//		}

		
//		@Override
//		public ResponseEntity<?> getInProgressAppointmentsByCustomerId(String customerId) {
//		    ResponseStructure<List<BookingResponse>> res = new ResponseStructure<>();
//		    List<BookingResponse> finalList = new ArrayList<>();
//		    Response response = new Response();
//		    DoctorSaveDetailsDTO saveDetails = new DoctorSaveDetailsDTO();
//
//		    try {
//		        List<Booking> booked = repository.findByCustomerId(customerId);
//		        if (booked == null || booked.isEmpty()) {
//		            res.setStatusCode(200);
//		            res.setHttpStatus(HttpStatus.OK);
//		            res.setMessage("No bookings found for customer");
//		            res.setData(finalList);
//		            return ResponseEntity.ok(res);
//		        }
//
//		        LocalDate today = LocalDate.now();
//		        DateTimeFormatter isoFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
//
//		        for (Booking booking : booked) {
//		            if (!"In-Progress".equalsIgnoreCase(booking.getStatus())) {
//		                continue;
//		            }
//
//		            // ✅ Get Doctor Save Details
//		            try {
//		                response = doctorFeign.getDoctorSaveDetailsByBookingId(booking.getBookingId()).getBody();
//		            } catch (Exception e) {
//		                System.out.println("DoctorFeign error: " + e.getMessage());
//		            }
//
//		            if (response != null && response.getData() != null) {
//		                saveDetails = new ObjectMapper().convertValue(response.getData(), DoctorSaveDetailsDTO.class);
//		            }
//
//		            // ✅ CASE 1: Treatments (Services & Treatments bookings with sittings)
//		            if (saveDetails.getTreatments() != null &&
//		                saveDetails.getTreatments().getGeneratedData() != null &&
//		                !saveDetails.getTreatments().getGeneratedData().isEmpty()) {
//
//		                List<LocalDate> allDates = saveDetails.getTreatments().getGeneratedData().values().stream()
//		                        .filter(Objects::nonNull)
//		                        .flatMap(details -> details.getDates() != null
//		                                ? details.getDates().stream().map(d -> LocalDate.parse(d.getDate(), isoFormatter))
//		                                : Stream.empty())
//		                        .filter(Objects::nonNull)
//		                        .sorted()
//		                        .toList();
//
//		                int totalSittingsSum = saveDetails.getTreatments().getGeneratedData().values().stream()
//		                        .mapToInt(d -> d.getTotalSittings() != null ? d.getTotalSittings() : 0)
//		                        .sum();
//
//		                int pendingSittingsSum = saveDetails.getTreatments().getGeneratedData().values().stream()
//		                        .mapToInt(d -> d.getSittings() != null ? d.getSittings() : 0)
//		                        .sum();
//
//		                AtomicInteger takenSittingsCount = new AtomicInteger(0);
//
//		                // Count sittings already booked
//		                for (LocalDate sittingDate : allDates) {
//		                    try {
//		                        Booking resp = repository.findByPatientIdAndFollowupDate(
//		                                booking.getPatientId(),
//		                                sittingDate.format(isoFormatter));
//		                        if (resp != null) {
//		                            takenSittingsCount.incrementAndGet();
//		                        }
//		                    } catch (Exception ignored) {}
//		                }
//
//		                // Consultation Expiration based on last sitting
//		                LocalDate lastSitting = allDates.get(allDates.size() - 1);
//		                LocalDate exp = lastSitting.plusDays(
//		                        Integer.parseInt(booking.getConsultationExpiration().replaceAll("\\D+", ""))
//		                );
//
//		                booking.setTotalSittings(totalSittingsSum);
//		                booking.setPendingSittings(pendingSittingsSum);
//		                booking.setTakenSittings(takenSittingsCount.get());
//		                booking.setCurrentSitting(pendingSittingsSum);
//
//		                // ✅ Always include Treatment booking if not expired
//		                if (!exp.isBefore(today)) {
//		                    finalList.add(toResponse(booking));
//		                }
//		            }
//
//		            // ✅ CASE 2: Consultation with Follow-Up
//		            else if (saveDetails.getFollowUp() != null &&
//		                     saveDetails.getFollowUp().getNextFollowUpDate() != null) {
//		                try {
//		                    LocalDate followDate = LocalDate.parse(
//		                            saveDetails.getFollowUp().getNextFollowUpDate(),
//		                            DateTimeFormatter.ISO_LOCAL_DATE_TIME
//		                    );
//
//		                    int days = Integer.parseInt(booking.getConsultationExpiration().replaceAll("\\D+", ""));
//		                    LocalDate exp = LocalDate.parse(booking.getServiceDate(), isoFormatter).plusDays(days);
//
//		                    if (!followDate.isBefore(today) && !followDate.isAfter(exp)) {
//		                        Booking bkng = new Booking(booking);
//		                        bkng.setFollowupDate(followDate.format(isoFormatter));
//		                        finalList.add(toResponse(bkng));
//		                    }
//		                } catch (Exception e) {
//		                    System.out.println("Followup parse error: " + e.getMessage());
//		                }
//		            }
//
//		            // ✅ CASE 3: Normal Consultation (no treatments, no follow-up → use consultationExpiration)
//		            else {
//		                try {
//		                    int days = Integer.parseInt(booking.getConsultationExpiration().replaceAll("\\D+", ""));
//		                    LocalDate exp = LocalDate.parse(booking.getServiceDate(), isoFormatter).plusDays(days);
//
//		                    if (!exp.isBefore(today)) {
//		                        finalList.add(toResponse(booking));
//		                    }
//		                } catch (Exception e) {
//		                    System.out.println("Consultation parse error: " + e.getMessage());
//		                }
//		            }
//		        }
//
//		        res.setStatusCode(200);
//		        res.setHttpStatus(HttpStatus.OK);
//		        res.setMessage(finalList.isEmpty()
//		                ? "No In-Progress appointments found"
//		                : "In-Progress appointments found");
//		        res.setData(finalList);
//
//		    } catch (Exception e) {
//		        res.setStatusCode(500);
//		        res.setHttpStatus(HttpStatus.INTERNAL_SERVER_ERROR);
//		        res.setMessage("Error: " + e.getMessage());
//		    }
//
//		    return ResponseEntity.status(res.getStatusCode()).body(res);
//		}

//		@Override
//		public ResponseEntity<?> getInProgressAppointmentsByCustomerId(String customerId) {
//		    ResponseStructure<List<BookingResponse>> res = new ResponseStructure<>();
//		    List<BookingResponse> finalList = new ArrayList<>();
//		    Response response = new Response();
//		    DoctorSaveDetailsDTO saveDetails = new DoctorSaveDetailsDTO();
//
//		    try {
//		        List<Booking> booked = repository.findByCustomerId(customerId);
//		        if (booked == null || booked.isEmpty()) {
//		            res.setStatusCode(200);
//		            res.setHttpStatus(HttpStatus.OK);
//		            res.setMessage("No bookings found for customer");
//		            res.setData(finalList);
//		            return ResponseEntity.ok(res);
//		        }
//
//		        LocalDate today = LocalDate.now();
//		        DateTimeFormatter isoFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
//
//		        for (Booking booking : booked) {
//		            if (!"In-Progress".equalsIgnoreCase(booking.getStatus())) {
//		                continue;
//		            }
//
//		            // ✅ Include only relevant consultation types
//		            if (!"In-Clinic Consultation".equalsIgnoreCase(booking.getConsultationType()) &&
//		                !"Services & Treatments".equalsIgnoreCase(booking.getConsultationType()) &&
//		                !"Online Consultation".equalsIgnoreCase(booking.getConsultationType())) {
//		                continue;
//		            }
//
//		            // ✅ Get Doctor Save Details
//		            try {
//		                response = doctorFeign.getDoctorSaveDetailsByBookingId(booking.getBookingId()).getBody();
//		            } catch (Exception e) {
//		                System.out.println("DoctorFeign error: " + e.getMessage());
//		            }
//
//		            if (response != null && response.getData() != null) {
//		                saveDetails = new ObjectMapper().convertValue(response.getData(), DoctorSaveDetailsDTO.class);
//		            }
//
//		            // CASE 1: Treatments (Services & Treatments bookings with sittings)
//		            if (saveDetails.getTreatments() != null &&
//		                saveDetails.getTreatments().getGeneratedData() != null &&
//		                !saveDetails.getTreatments().getGeneratedData().isEmpty()) {
//
//		                List<LocalDate> allDates = saveDetails.getTreatments().getGeneratedData().values().stream()
//		                        .filter(Objects::nonNull)
//		                        .flatMap(details -> details.getDates() != null
//		                                ? details.getDates().stream().map(d -> LocalDate.parse(d.getDate(), isoFormatter))
//		                                : Stream.empty())
//		                        .filter(Objects::nonNull)
//		                        .sorted()
//		                        .toList();
//
//		                int totalSittingsSum = saveDetails.getTreatments().getGeneratedData().values().stream()
//		                        .mapToInt(d -> d.getTotalSittings() != null ? d.getTotalSittings() : 0)
//		                        .sum();
//
//		                int pendingSittingsSum = saveDetails.getTreatments().getGeneratedData().values().stream()
//		                        .mapToInt(d -> d.getSittings() != null ? d.getSittings() : 0)
//		                        .sum();
//
//		                AtomicInteger takenSittingsCount = new AtomicInteger(0);
//
//		                // Count sittings already booked
//		                for (LocalDate sittingDate : allDates) {
//		                    try {
//		                        Booking resp = repository.findByPatientIdAndFollowupDate(
//		                                booking.getPatientId(),
//		                                sittingDate.format(isoFormatter));
//		                        if (resp != null) {
//		                            takenSittingsCount.incrementAndGet();
//		                        }
//		                    } catch (Exception ignored) {}
//		                }
//
//		                // Consultation Expiration based on last sitting
//		                LocalDate lastSitting = allDates.get(allDates.size() - 1);
//		                LocalDate exp = lastSitting.plusDays(
//		                        Integer.parseInt(booking.getConsultationExpiration().replaceAll("\\D+", ""))
//		                );
//
//		                booking.setTotalSittings(totalSittingsSum);
//		                booking.setPendingSittings(pendingSittingsSum);
//		                booking.setTakenSittings(takenSittingsCount.get());
//		                booking.setCurrentSitting(pendingSittingsSum);
//
//		                // Always include Treatment booking if not expired
//		                if (!exp.isBefore(today)) {
//		                    finalList.add(toResponse(booking));
//		                }
//		            }
//
//		            // CASE 2: Consultation with Follow-Up
//		            else if (saveDetails.getFollowUp() != null &&
//		                     saveDetails.getFollowUp().getNextFollowUpDate() != null) {
//		                try {
//		                    LocalDate followDate = LocalDate.parse(
//		                            saveDetails.getFollowUp().getNextFollowUpDate(),
//		                            DateTimeFormatter.ISO_LOCAL_DATE_TIME
//		                    );
//
//		                    int days = Integer.parseInt(booking.getConsultationExpiration().replaceAll("\\D+", ""));
//		                    LocalDate exp = LocalDate.parse(booking.getServiceDate(), isoFormatter).plusDays(days);
//
//		                    if (!followDate.isBefore(today) && !followDate.isAfter(exp)) {
//		                        Booking bkng = new Booking(booking);
//		                        bkng.setFollowupDate(followDate.format(isoFormatter));
//		                        finalList.add(toResponse(bkng));
//		                    }
//		                } catch (Exception e) {
//		                    System.out.println("Followup parse error: " + e.getMessage());
//		                }
//		            }
//
//		            // CASE 3: Normal Consultation (no treatments, no follow-up → use consultationExpiration)
//		            else {
//		                try {
//		                    int days = Integer.parseInt(booking.getConsultationExpiration().replaceAll("\\D+", ""));
//		                    LocalDate exp = LocalDate.parse(booking.getServiceDate(), isoFormatter).plusDays(days);
//
//		                    if (!exp.isBefore(today)) {
//		                        finalList.add(toResponse(booking));
//		                    }
//		                } catch (Exception e) {
//		                    System.out.println("Consultation parse error: " + e.getMessage());
//		                }
//		            }
//		        }
//
//		        res.setStatusCode(200);
//		        res.setHttpStatus(HttpStatus.OK);
//		        res.setMessage(finalList.isEmpty()
//		                ? "No In-Progress appointments found"
//		                : "In-Progress appointments found");
//		        res.setData(finalList);
//
//		    } catch (Exception e) {
//		        res.setStatusCode(500);
//		        res.setHttpStatus(HttpStatus.INTERNAL_SERVER_ERROR);
//		        res.setMessage("Error: " + e.getMessage());
//		    }
//
//		    return ResponseEntity.status(res.getStatusCode()).body(res);
//		}

		@Override
		public ResponseEntity<?> getInProgressAppointmentsByCustomerId(String customerId) {
		    ResponseStructure<List<BookingResponse>> res = new ResponseStructure<>();
		    List<BookingResponse> finalList = new ArrayList<>();
		    Response response;
		    DoctorSaveDetailsDTO saveDetails;

		    try {
		        List<Booking> booked = repository.findByCustomerId(customerId);
		        if (booked == null || booked.isEmpty()) {
		            res.setStatusCode(200);
		            res.setHttpStatus(HttpStatus.OK);
		            res.setMessage("No bookings found for customer");
		            res.setData(finalList);
		            return ResponseEntity.ok(res);
		        }

		        LocalDate today = LocalDate.now();
		        DateTimeFormatter isoFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

		        for (Booking booking : booked) {

		            // ✅ Include only In-Progress bookings
		            if (!"In-Progress".equalsIgnoreCase(booking.getStatus())) continue;

		            // ✅ Include only relevant consultation types
		            String type = booking.getConsultationType() != null ? booking.getConsultationType().trim() : "";
		            if (!type.equalsIgnoreCase("In-Clinic Consultation") &&
		                !type.equalsIgnoreCase("Services & Treatments") &&
		                !type.equalsIgnoreCase("Online Consultation")) {
		                continue;
		            }

		            // ✅ Get Doctor Save Details
		            saveDetails = new DoctorSaveDetailsDTO();
		            try {
		                response = doctorFeign.getDoctorSaveDetailsByBookingId(booking.getBookingId()).getBody();
		                if (response != null && response.getData() != null) {
		                    saveDetails = new ObjectMapper().convertValue(response.getData(), DoctorSaveDetailsDTO.class);
		                }
		            } catch (Exception e) {
		                System.out.println("DoctorFeign error: " + e.getMessage());
		            }

		            boolean bookingAdded = false;

		            // CASE 1: Treatments (Services & Treatments bookings)
		            if (saveDetails.getTreatments() != null && saveDetails.getTreatments().getGeneratedData() != null
		                && !saveDetails.getTreatments().getGeneratedData().isEmpty()) {

		                List<LocalDate> allDates = saveDetails.getTreatments().getGeneratedData().values().stream()
		                        .filter(Objects::nonNull)
		                        .flatMap(details -> details.getDates() != null
		                                ? details.getDates().stream().map(d -> LocalDate.parse(d.getDate(), isoFormatter))
		                                : Stream.empty())
		                        .sorted()
		                        .toList();

		                int totalSittingsSum = saveDetails.getTreatments().getGeneratedData().values().stream()
		                        .mapToInt(d -> d.getTotalSittings() != null ? d.getTotalSittings() : 0)
		                        .sum();

		                int pendingSittingsSum = saveDetails.getTreatments().getGeneratedData().values().stream()
		                        .mapToInt(d -> d.getSittings() != null ? d.getSittings() : 0)
		                        .sum();

		                AtomicInteger takenSittingsCount = new AtomicInteger(0);

		                // Count sittings already booked
		                for (LocalDate sittingDate : allDates) {
		                    try {
		                        Booking resp = repository.findByPatientIdAndFollowupDate(
		                                booking.getPatientId(),
		                                sittingDate.format(isoFormatter));
		                        if (resp != null) takenSittingsCount.incrementAndGet();
		                    } catch (Exception ignored) {}
		                }

		                LocalDate lastSitting = allDates.get(allDates.size() - 1);
		                LocalDate exp = lastSitting.plusDays(Integer.parseInt(
		                        booking.getConsultationExpiration().replaceAll("\\D+", "")));

		                booking.setTotalSittings(totalSittingsSum);
		                booking.setPendingSittings(pendingSittingsSum);
		                booking.setTakenSittings(takenSittingsCount.get());
		                booking.setCurrentSitting(pendingSittingsSum);

		                if (!exp.isBefore(today)) {
		                    finalList.add(toResponse(booking));
		                    bookingAdded = true;
		                }
		            }

		            // CASE 2: Consultation with Follow-Up
		            if (!bookingAdded && saveDetails.getFollowUp() != null &&
		                saveDetails.getFollowUp().getNextFollowUpDate() != null) {

		                try {
		                    LocalDate followDate = LocalDate.parse(
		                            saveDetails.getFollowUp().getNextFollowUpDate(),
		                            DateTimeFormatter.ISO_LOCAL_DATE_TIME
		                    );
		                    LocalDate exp = LocalDate.parse(booking.getServiceDate(), isoFormatter)
		                            .plusDays(Integer.parseInt(booking.getConsultationExpiration().replaceAll("\\D+", "")));

		                    if (!followDate.isBefore(today) && !followDate.isAfter(exp)) {
		                        Booking bkng = new Booking(booking);
		                        bkng.setFollowupDate(followDate.format(isoFormatter));
		                        finalList.add(toResponse(bkng));
		                        bookingAdded = true;
		                    }
		                } catch (Exception e) {
		                    System.out.println("Followup parse error: " + e.getMessage());
		                }
		            }

		            // CASE 3: Normal Consultation (including Online Consultation)
		            if (!bookingAdded) {
		                try {
		                    LocalDate exp = LocalDate.parse(booking.getServiceDate(), isoFormatter)
		                            .plusDays(Integer.parseInt(booking.getConsultationExpiration().replaceAll("\\D+", "")));
		                    if (!exp.isBefore(today)) {
		                        finalList.add(toResponse(booking));
		                    }
		                } catch (Exception e) {
		                    System.out.println("Consultation parse error: " + e.getMessage());
		                }
		            }
		        }

		        res.setStatusCode(200);
		        res.setHttpStatus(HttpStatus.OK);
		        res.setMessage(finalList.isEmpty()
		                ? "No In-Progress appointments found"
		                : "In-Progress appointments found");
		        res.setData(finalList);

		    } catch (Exception e) {
		        res.setStatusCode(500);
		        res.setHttpStatus(HttpStatus.INTERNAL_SERVER_ERROR);
		        res.setMessage("Error: " + e.getMessage());
		    }

		    return ResponseEntity.status(res.getStatusCode()).body(res);
		}

	
//		public ResponseEntity<?> getInProgressAppointmentsByPatientId(String patientId) {
//		    ResponseStructure<List<BookingResponse>> res = new ResponseStructure<>();
//		    List<BookingResponse> finalList = new ArrayList<>();
//		    Response response = new Response();
//		    DoctorSaveDetailsDTO saveDetails = new DoctorSaveDetailsDTO();
//		    try {
//		        List<Booking> booked = repository.findByPatientId(patientId);
//		        if (booked == null || booked.isEmpty()) {
//		            res.setStatusCode(200);
//		            res.setHttpStatus(HttpStatus.OK);
//		            res.setMessage("No bookings found for patient");
//		            res.setData(finalList);
//		            return ResponseEntity.ok(res);
//		        }
//		        LocalDate today = LocalDate.now();
//		        LocalDate sixthDate = today.plusDays(6);
//		        LocalDate exp = null;
//		        DateTimeFormatter isoFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
//		        for (Booking booking : booked) {
//		            if (!"In-Progress".equalsIgnoreCase(booking.getStatus())) {
//		                continue;
//		            }
//		            // ✅ Include any In-Progress booking with serviceDate between today and sixthDate
//		            LocalDate ld = null;
//		            if(booking.getFollowupDate() != null) {
//		            	ld = LocalDate.parse(booking.getFollowupDate(), isoFormatter);
//		            }else {
//		            	if(booking.getServiceDate() != null) {
//			            	ld = LocalDate.parse(booking.getServiceDate(), isoFormatter);
//			            }	
//		            }
//		            if(!ld.isAfter(sixthDate)) {
//		            // Fetch doctor save details
//		            try {
//		                response = doctorFeign.getDoctorSaveDetailsByBookingId(booking.getBookingId()).getBody();
//		               // System.out.println(response);
//		            } catch (Exception e) {
//		                System.out.println(e.getMessage());
//		            }
//
//		            if (response != null && response.getData() != null) {
//		                saveDetails = new ObjectMapper().convertValue(response.getData(), DoctorSaveDetailsDTO.class);
//		               // System.out.println(saveDetails);
//		            } else {}
//		            // ✅ Stream-based Treatments + Sittings + Next Follow-Up
//		            if (saveDetails.getTreatments() != null &&
//		                saveDetails.getTreatments().getGeneratedData() != null &&
//		                !saveDetails.getTreatments().getGeneratedData().isEmpty()) {
//
//		                // Flatten all treatment dates into sorted list
//		                List<LocalDate> allDates = saveDetails.getTreatments().getGeneratedData().values().stream()
//		                        .filter(Objects::nonNull)
//		                        .flatMap(details -> details.getDates() != null
//		                                ? details.getDates().stream()
//		                                    .map(d -> LocalDate.parse(d.getDate(), isoFormatter))
//		                                : Stream.empty())
//		                        .sorted()
//		                        .toList();
//                            //System.out.println(allDates);
//		                // Calculate totalSittings and pendingSittings
//		                int totalSittingsSum = saveDetails.getTreatments().getGeneratedData().values().stream()
//		                        .filter(Objects::nonNull)
//		                        .mapToInt(d -> d.getTotalSittings() != null ? d.getTotalSittings() : 0)
//		                        .sum();
//		               // System.out.println(totalSittingsSum);
//		                int pendingSittingsSum = saveDetails.getTreatments().getGeneratedData().values().stream()
//		                        .filter(Objects::nonNull)
//		                        .mapToInt(d -> d.getSittings() != null ? d.getSittings() : 0)
//		                        .sum();
//		                //System.out.println(pendingSittingsSum);
//		                AtomicInteger takenSittingsCount = new AtomicInteger(0);
//
//		                // Determine next follow-up date according to your rules
//		                Optional<LocalDate> nextFollowupOpt = allDates.stream()
//		                        .map(sittingDate -> {
//		                            boolean sittingBooked = false;
//		                            try {
//		                                Booking resp =
//		                                		repository.findByPatientIdAndFollowupDate(
//		                                				sDetails.getPatientId(),
//		                                                sittingDate.format(isoFormatter));
//
//		                                if (resp != null) {
//		                                    sittingBooked = true;
//		                                    takenSittingsCount.incrementAndGet();
//		                                }
//		                            } catch (Exception ex) {
//		                                System.err.println("Error checking booking for date "
//		                                        + sittingDate + ": " + ex.getMessage());
//		                            }
//                                    if(booking.getFollowupDate() != null) {
//		                            if (LocalDate.parse(booking.getFollowupDate(), isoFormatter).isBefore(today)) {
//		                                // Past date → pick first future date if available
//		                                return allDates.stream()
//		                                        .filter(f -> f.isAfter(today))
//		                                        .findFirst()
//		                                        .orElse(null);
//		                            } else if (LocalDate.parse(booking.getFollowupDate(), isoFormatter).isEqual(today)) {
//		                                if (sittingBooked) {
//		                                    // Today booked → pick first future date if available
//		                                    return allDates.stream()
//		                                            .filter(f -> f.isAfter(today))
//		                                            .findFirst()
//		                                            .orElse(null);
//		                                } else {
//		                                    // Today not booked → keep today
//		                                    return sittingDate;
//		                                }
//		                            } else {
//		                                // Future dates → do not modify follow-up
//		                                return null;
//		                            }
//		                        }else{
//		                        	 return allDates.stream()                                        
//		                                        .findFirst()
//		                                        .orElse(null);
//		                        }})
//		                        .filter(Objects::nonNull)
//		                        .findFirst();
//		                LocalDate lstSitting = allDates.get(allDates.size()-1);
//		                if(lstSitting.equals(LocalDate.now()) || lstSitting.isAfter(LocalDate.now()))  {
//		                	exp = lstSitting.plusDays(Integer.parseInt(booking.getConsultationExpiration().replaceAll("\\D+", "")));
//		                	finalList =	inprogressAppointmentsByConsultationExpiration(exp, booking,saveDetails); 
//		                }
//		                // Update booking object
//		                booking.setTotalSittings(totalSittingsSum);
//		                booking.setPendingSittings(pendingSittingsSum);
//		                booking.setTakenSittings(takenSittingsCount.get());
//		                booking.setCurrentSitting(pendingSittingsSum);
//		                nextFollowupOpt.ifPresent(d -> booking.setFollowupDate(d.format(isoFormatter)));
//		                finalList.add(toResponse(booking));
//		                //System.out.println(nextFollowupOpt);
//		                //System.out.println(finalList);
//		            }
//		            // ✅ Existing Follow-Up section
//		            else if (saveDetails.getFollowUp() != null &&
//		                saveDetails.getFollowUp().getNextFollowUpDate() != null) {
//		                try {
//		                	 int days = 0;
//			                	if(exp == null ){
//			                    days = Integer.parseInt(booking.getConsultationExpiration().replaceAll("\\D+", ""));
//			                    //System.out.println(days);
//			                    LocalDate serviceDate  = LocalDate.parse(booking.getServiceDate(), isoFormatter);
//			                    exp = serviceDate.plusDays(days);}
//		                    LocalDate followDate = LocalDate.parse(saveDetails.getFollowUp().getNextFollowUpDate(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);
//		                    if (!followDate.isBefore(today) && !followDate.isAfter(sixthDate) && !followDate.isAfter(exp)) {
//		                        Booking bkng = new Booking(booking);
//		                        bkng.setFollowupDate(followDate.format(isoFormatter));
//		                        bkng.setStatus("In-Progress");
//		                            finalList.add(toResponse(bkng));		                        
//		                    }
//		                } catch (Exception e) {
//		                    System.out.println(e.getMessage());
//		                }
//		            }else {        
//		            // ✅ Consultation expiration fallback
//		            if (booking.getConsultationExpiration() != null) {
//		                try {
//		                	  int days = 0;
//		                	if(exp == null ){
//		                    days = Integer.parseInt(booking.getConsultationExpiration().replaceAll("\\D+", ""));
//		                   // System.out.println(days);
//		                    LocalDate serviceDate  = LocalDate.parse(booking.getServiceDate(), isoFormatter);
//		                    exp = serviceDate.plusDays(days);}
//		                   // System.out.println(expDate);
//		                    for (int i = 0; i <= 6; i++) {
//		                        LocalDate date = today.plusDays(i);
//		                        //System.out.println(date);
//		                       // System.out.println(sixthDate);
//		                        if ((!date.isAfter(sixthDate)) && (date.isBefore(exp) || date.equals(exp))) {
//		                            //System.out.println("hii");
//		                        	Booking bkng = new Booking(booking);
//		                        	//bkng.setConsentFormPdf(null);
//		                        	//bkng.setAttachments(null);
//		                        	//bkng.setReports(null);
//		                           // System.out.println(bkng);
//		                            bkng.setFollowupDate(date.format(isoFormatter));
//		                            bkng.setStatus("In-Progress");	                            
//		                            finalList.add(toResponse(bkng));
//		                        }
//		                    }
//		                } catch (Exception e) {
//		                	 System.out.println(e.getMessage());
//		                }}
//		            }}
//		        }
//		        res.setStatusCode(200);
//		        res.setHttpStatus(HttpStatus.OK);
//		        res.setMessage(finalList.isEmpty()
//		                ? "No In-Progress or Today appointments found"
//		                : "In-Progress appointments found");
//		        res.setData(finalList);
//
//		    } catch (Exception e) {
//		        res.setStatusCode(500);
//		        res.setHttpStatus(HttpStatus.INTERNAL_SERVER_ERROR);
//		        res.setMessage("Error: " + e.getMessage());
//		    }
//
//		    return ResponseEntity.status(res.getStatusCode()).body(res);
//		}

		@Override
		public ResponseEntity<?> getInProgressAppointmentsByPatientId(String patientId) {
		    ResponseStructure<List<BookingResponse>> res = new ResponseStructure<>();
		    List<BookingResponse> finalList = new ArrayList<>();
		    Response response = new Response();
		    DoctorSaveDetailsDTO saveDetails = new DoctorSaveDetailsDTO();

		    try {
		        List<Booking> booked = repository.findByPatientId(patientId);
		        if (booked == null || booked.isEmpty()) {
		            res.setStatusCode(200);
		            res.setHttpStatus(HttpStatus.OK);
		            res.setMessage("No bookings found for patient");
		            res.setData(finalList);
		            return ResponseEntity.ok(res);
		        }

		        LocalDate today = LocalDate.now();
		        LocalDate sixthDate = today.plusDays(6);
		        LocalDate exp = null;

		        for (Booking booking : booked) {
		            if (!"In-Progress".equalsIgnoreCase(booking.getStatus())) {
		                continue;
		            }

		            // Always determine booking type
		            boolean isTreatment = booking.getSubServiceId() != null && !"NA".equalsIgnoreCase(booking.getSubServiceId());
		            boolean isConsultation = "In-Clinic Consultation".equalsIgnoreCase(booking.getConsultationType());

		            // ✅ Fetch doctor save details
		            try {
		                response = doctorFeign.getDoctorSaveDetailsByBookingId(booking.getBookingId()).getBody();
		            } catch (Exception e) {
		                System.out.println("DoctorFeign error: " + e.getMessage());
		            }

		            if (response != null && response.getData() != null) {
		                saveDetails = new ObjectMapper().convertValue(response.getData(), DoctorSaveDetailsDTO.class);
		            }

		            // ✅ Treatments case
		            if (isTreatment && saveDetails.getTreatments() != null &&
		                saveDetails.getTreatments().getGeneratedData() != null &&
		                !saveDetails.getTreatments().getGeneratedData().isEmpty()) {

		                // Flatten all treatment dates
		                List<LocalDate> allDates = saveDetails.getTreatments().getGeneratedData().values().stream()
		                        .filter(Objects::nonNull)
		                        .flatMap(details -> details.getDates() != null
		                                ? details.getDates().stream().map(d -> parseDate(d.getDate()))
		                                : Stream.empty())
		                        .filter(Objects::nonNull)
		                        .sorted()
		                        .toList();

		                int totalSittingsSum = saveDetails.getTreatments().getGeneratedData().values().stream()
		                        .filter(Objects::nonNull)
		                        .mapToInt(d -> d.getTotalSittings() != null ? d.getTotalSittings() : 0)
		                        .sum();

		                int pendingSittingsSum = saveDetails.getTreatments().getGeneratedData().values().stream()
		                        .filter(Objects::nonNull)
		                        .mapToInt(d -> d.getSittings() != null ? d.getSittings() : 0)
		                        .sum();

		                AtomicInteger takenSittingsCount = new AtomicInteger(0);

		                // Determine next follow-up date
		                Optional<LocalDate> nextFollowupOpt = allDates.stream()
		                        .map(sittingDate -> {
		                            try {
		                                Booking resp = repository.findByPatientIdAndFollowupDate(
		                                        booking.getPatientId(),
		                                        sittingDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))
		                                );
		                                if (resp != null) {
		                                    takenSittingsCount.incrementAndGet();
		                                }
		                            } catch (Exception ex) {
		                                System.err.println("Error checking booking for date " + sittingDate + ": " + ex.getMessage());
		                            }
		                            return sittingDate;
		                        })
		                        .filter(Objects::nonNull)
		                        .findFirst();

		                // Set consultation expiration
		                LocalDate lastSitting = allDates.get(allDates.size() - 1);
		                if (lastSitting != null) {
		                    exp = lastSitting.plusDays(Integer.parseInt(booking.getConsultationExpiration().replaceAll("\\D+", "")));
		                }

		                booking.setTotalSittings(totalSittingsSum);
		                booking.setPendingSittings(pendingSittingsSum);
		                booking.setTakenSittings(takenSittingsCount.get());
		                booking.setCurrentSitting(pendingSittingsSum);
		                nextFollowupOpt.ifPresent(d -> booking.setFollowupDate(d.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))));

		                finalList.add(toResponse(booking));
		            }
		            // ✅ Consultations or Fallback case
		            else {
		                // If consultation expiration is available
		                if (booking.getConsultationExpiration() != null) {
		                    try {
		                        int days = Integer.parseInt(booking.getConsultationExpiration().replaceAll("\\D+", ""));
		                        LocalDate serviceDate = parseDate(booking.getServiceDate());
		                        if (serviceDate != null) {
		                            exp = serviceDate.plusDays(days);
		                        }
		                    } catch (Exception e) {
		                        System.out.println("Expiration parse error: " + e.getMessage());
		                    }
		                }
		                // Always include consultations
		                finalList.add(toResponse(booking));
		            }
		        }

		        res.setStatusCode(200);
		        res.setHttpStatus(HttpStatus.OK);
		        res.setMessage(finalList.isEmpty()
		                ? "No In-Progress appointments found"
		                : "In-Progress appointments found");
		        res.setData(finalList);

		    } catch (Exception e) {
		        res.setStatusCode(500);
		        res.setHttpStatus(HttpStatus.INTERNAL_SERVER_ERROR);
		        res.setMessage("Error: " + e.getMessage());
		    }

		    return ResponseEntity.status(res.getStatusCode()).body(res);
		}

		/**
		 * ✅ Utility: Parse both yyyy-MM-dd and dd-MM-yyyy formats
		 */
		private LocalDate parseDate(String dateStr) {
		    if (dateStr == null) return null;
		    List<DateTimeFormatter> formatters = Arrays.asList(
		            DateTimeFormatter.ofPattern("yyyy-MM-dd"),
		            DateTimeFormatter.ofPattern("dd-MM-yyyy")
		    );
		    for (DateTimeFormatter fmt : formatters) {
		        try {
		            return LocalDate.parse(dateStr, fmt);
		        } catch (Exception ignored) {}
		    }
		    return null;
		}

		
		public List<BookingResponse> inprogressAppointmentsByConsultationExpiration(LocalDate exp,Booking booking, DoctorSaveDetailsDTO saveDetails ) {
			List<BookingResponse> finalList = new ArrayList<>();
			try {
				LocalDate today = LocalDate.now();
 		        LocalDate sixthDate = today.plusDays(6);
 		        DateTimeFormatter isoFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
 		     	 if(saveDetails.getFollowUp() != null &&
	                saveDetails.getFollowUp().getNextFollowUpDate() != null) {
	                  try{
	                	 int days = 0;
		                	if(exp == null ){
		                    days = Integer.parseInt(booking.getConsultationExpiration().replaceAll("\\D+", ""));
		                    //System.out.println(days);
		                    LocalDate serviceDate  = LocalDate.parse(booking.getServiceDate(), isoFormatter);
		                    exp = serviceDate.plusDays(days);}
	                    LocalDate followDate = LocalDate.parse(saveDetails.getFollowUp().getNextFollowUpDate(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);
	                    if (!followDate.isBefore(today) && !followDate.isAfter(sixthDate) && !followDate.isAfter(exp)) {
	                        Booking bkng = new Booking(booking);
	                        bkng.setFollowupDate(followDate.format(isoFormatter));
	                        bkng.setStatus("In-Progress");
	                           finalList.add(toResponse(bkng));		                        
	                    }
	                } catch (Exception e) {
	                    System.out.println(e.getMessage());
	                }
	            }else {        
	            // ✅ Consultation expiration fallback
	            if (booking.getConsultationExpiration() != null) {
	                    try {
	                	  int days = 0;
	                	if(exp == null ){
	                    days = Integer.parseInt(booking.getConsultationExpiration().replaceAll("\\D+", ""));
	                   // System.out.println(days);
	                    LocalDate serviceDate  = LocalDate.parse(booking.getServiceDate(), isoFormatter);
	                    exp = serviceDate.plusDays(days);}
	                   // System.out.println(expDate);
	                    for (int i = 0; i <= 6; i++) {
	                        LocalDate date = today.plusDays(i);
	                        //System.out.println(date);
	                       // System.out.println(sixthDate);
	                        if ((!date.isAfter(sixthDate)) && (date.isBefore(exp) || date.equals(exp))) {
	                            //System.out.println("hii");
	                        	Booking bkng = new Booking(booking);
	                        	//bkng.setConsentFormPdf(null);
	                        	//bkng.setAttachments(null);
	                        	//bkng.setReports(null);
	                           // System.out.println(bkng);
	                            bkng.setFollowupDate(date.format(isoFormatter));
	                            bkng.setStatus("In-Progress");	                            
	                            finalList.add(toResponse(bkng));
	                        }}	                   
	                }catch (Exception e){
	                	 System.out.println(e.getMessage());
	               }}}}catch(Exception e) {
	            	System.out.println(e.getMessage());
	            	return null;
	            }
			return finalList;
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

		
		
//		@Scheduled(cron = "0 02 00 * * ?")
//		////@Scheduled(fixedRate = 20000)
//		private void changingStatusFromInprogressToCompletedForSittings() {
//			 try {
//		        List<Booking> bookings = repository.findAll();
//			        for (Booking b : bookings) {
//			            if (b.getStatus().equalsIgnoreCase("In-Progress")) {
//			            	Response res = doctorFeign.getDoctorSaveDetailsByBookingId(b.getBookingId()).getBody();
//			            	//System.out.println(b.getBookingId());
//			            	DoctorSaveDetailsDTO dto = new ObjectMapper().convertValue(res.getData(),DoctorSaveDetailsDTO.class);
//			            	//System.out.println(dto);
//			            	if(dto != null) {
//			            	if(dto.getTreatments() != null) {
//			            	for(Map.Entry<String,TreatmentDetailsDTO> mp : dto.getTreatments().getGeneratedData().entrySet()){
//			            	TreatmentDetailsDTO treatments = mp.getValue();
//			            	//System.out.println(treatments);
//			            	if(treatments != null) {
//			            	 List<DatesDTO> dates =	treatments.getDates();
//			            	 //System.out.println(dates.size());
//			            	 int lastIndex = dates.size()-1;
//			            	 DatesDTO datesDTO = dates.get(lastIndex);
//			            	// System.out.println("last index"+datesDTO );
//			            	 String date = datesDTO.getDate();
//			            	 //System.out.println(date);
//			                DateTimeFormatter inputFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
//			                LocalDate lastSitting = LocalDate.parse(date, inputFormatter);
//		                    //System.out.println(lastSitting);	                    
//			                LocalDate todayDate = LocalDate.now(); 
//		                  // System.out.println(todayDate);
//		                   // System.out.println(gap);	               
//			                int expirationDays = Integer.parseInt(Character.toString(b.getConsultationExpiration().charAt(0)) + 
//			            			Character.toString(b.getConsultationExpiration().charAt(1)));
//		                    //System.out.println(expirationDays);
//			                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
//			                LocalDate serviceDate = LocalDate.parse(b.getServiceDate(),formatter);
//			                LocalDate plusedTime = serviceDate.plusDays(expirationDays);
//			                if(!lastSitting.isBefore(plusedTime)) {  /// if it is before plustime they its status should be in inprogress
//			                	  if(!lastSitting.isBefore(serviceDate) && lastSitting.isBefore(todayDate)) {
//			                		b.setStatus("Completed");
//			                		//System.out.println("status changed");
//			                		  repository.save(b);
//			                		  try {
//			                		  NotificationDTO n = notificationFeign.getNotificationByBookingId(b.getBookingId());
//					                    n.getData().setStatus("Completed");
//					                    notificationFeign.updateNotification(n);
//			                		  }catch(Exception e) {
//			                			  System.out.println(e.getMessage());
//			                		  }
//			                	}}else{
//			                		if(todayDate.isAfter(plusedTime)) {
//				                		b.setStatus("Completed");
//				                		//System.out.println("status changed");
//				                		  repository.save(b);
//				                		  try {
//					                		  NotificationDTO n = notificationFeign.getNotificationByBookingId(b.getBookingId());
//							                    n.getData().setStatus("Completed");
//							                    notificationFeign.updateNotification(n);
//					                		  }catch(Exception e) {
//					                			  System.out.println(e.getMessage());
//					                		  }}}}}}else{
//				                	DateTimeFormatter inputFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
//						            LocalDate followUpDate = LocalDate.parse(dto.getFollowUp().getNextFollowUpDate(), inputFormatter);
//					                    //System.out.println(followUpDate);
//						             DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
//						             LocalDate serviceDate = LocalDate.parse(b.getServiceDate(),formatter);
//						             LocalDate todayDate = LocalDate.now();
//						             if(!followUpDate.isBefore(serviceDate) && followUpDate.isBefore(todayDate)) {
//						                	b.setStatus("Completed");
//						                	//System.out.println("status changed");
//					                		  repository.save(b);
//					                		  NotificationDTO n = notificationFeign.getNotificationByBookingId(b.getBookingId());
//							                    n.getData().setStatus("Completed");
//							                    notificationFeign.updateNotification(n);
//						               }}}}}}catch (Exception e) {
//						            	   System.out.println(e.getMessage());
//						               }}
//		
//		
//		
//		
//		@Scheduled(cron = "0 30 00 * * ?")
//		private void SecondTimeChangingStatusFromInprogressToCompletedForSittings() {
//		    try {
//		        List<Booking> bookings = repository.findAll();
//		        for (Booking b : bookings) {
//		            if (b.getStatus().equalsIgnoreCase("In-Progress")) {
//		            	Response res = doctorFeign.getDoctorSaveDetailsByBookingId(b.getBookingId()).getBody();
//		            	//System.out.println(b.getBookingId());
//		            	DoctorSaveDetailsDTO dto = new ObjectMapper().convertValue(res.getData(),DoctorSaveDetailsDTO.class);
//		            	//System.out.println(dto);
//		            	if(dto != null) {
//		            	if(dto.getTreatments() != null) {
//		            	for(Map.Entry<String,TreatmentDetailsDTO> mp : dto.getTreatments().getGeneratedData().entrySet()){
//		            	TreatmentDetailsDTO treatments = mp.getValue();
//		            	//System.out.println(treatments);
//		            	if(treatments != null) {
//		            	 List<DatesDTO> dates =	treatments.getDates();
//		            	 //System.out.println(dates.size());
//		            	 int lastIndex = dates.size()-1;
//		            	 DatesDTO datesDTO = dates.get(lastIndex);
//		            	// System.out.println("last index"+datesDTO );
//		            	 String date = datesDTO.getDate();
//		            	 //System.out.println(date);
//		                DateTimeFormatter inputFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
//		                LocalDate lastSitting = LocalDate.parse(date, inputFormatter);
//	                    //System.out.println(lastSitting);	                    
//		                LocalDate todayDate = LocalDate.now(); 
//	                  // System.out.println(todayDate);
//	                   // System.out.println(gap);	               
//		                int expirationDays = Integer.parseInt(Character.toString(b.getConsultationExpiration().charAt(0)) + 
//		            			Character.toString(b.getConsultationExpiration().charAt(1)));
//	                    //System.out.println(expirationDays);
//		                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
//		                LocalDate serviceDate = LocalDate.parse(b.getServiceDate(),formatter);
//		                LocalDate plusedTime = serviceDate.plusDays(expirationDays);
//		                if(!lastSitting.isBefore(plusedTime)) {  /// if it is before plustime they its status should be in inprogress
//		                	  if(!lastSitting.isBefore(serviceDate) && lastSitting.isBefore(todayDate)) {
//		                		b.setStatus("Completed");
//		                		//System.out.println("status changed");
//		                		  repository.save(b);
//		                		  try {
//		                		  NotificationDTO n = notificationFeign.getNotificationByBookingId(b.getBookingId());
//				                    n.getData().setStatus("Completed");
//				                    notificationFeign.updateNotification(n);
//		                		  }catch(Exception e) {
//		                			  System.out.println(e.getMessage());
//		                		  }
//		                	}}else{
//		                		if(todayDate.isAfter(plusedTime)) {
//			                		b.setStatus("Completed");
//			                		//System.out.println("status changed");
//			                		  repository.save(b);
//			                		  try {
//				                		  NotificationDTO n = notificationFeign.getNotificationByBookingId(b.getBookingId());
//						                    n.getData().setStatus("Completed");
//						                    notificationFeign.updateNotification(n);
//				                		  }catch(Exception e) {
//				                			  System.out.println(e.getMessage());
//				                		  }}}}}}else{
//			                	DateTimeFormatter inputFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
//					            LocalDate followUpDate = LocalDate.parse(dto.getFollowUp().getNextFollowUpDate(), inputFormatter);
//				                    //System.out.println(followUpDate);
//					             DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
//					             LocalDate serviceDate = LocalDate.parse(b.getServiceDate(),formatter);
//					             LocalDate todayDate = LocalDate.now();
//					             if(!followUpDate.isBefore(serviceDate) && followUpDate.isBefore(todayDate)) {
//					                	b.setStatus("Completed");
//					                	//System.out.println("status changed");
//				                		  repository.save(b);
//				                		  NotificationDTO n = notificationFeign.getNotificationByBookingId(b.getBookingId());
//						                    n.getData().setStatus("Completed");
//						                    notificationFeign.updateNotification(n);
//					               }}}}}}catch (Exception e) {
//					            	   System.out.println(e.getMessage());
//					               }}
//		
		
//    public ResponseEntity<?> retrieveOneWeekAppointments(String cinicId,String branchId){						
//		ResponseStructure<List<BookingResponse>> res = new ResponseStructure<>();
//	    List<BookingResponse> finalList = new ArrayList<>();
//	   Response response = new Response();
//	    DoctorSaveDetailsDTO saveDetails = new DoctorSaveDetailsDTO();
//	    try {
//	        List<Booking> booked = repository.findByClinicIdAndBranchId(cinicId, branchId);
//	        if (booked == null || booked.isEmpty()) {
//	            res.setStatusCode(200);
//	            res.setHttpStatus(HttpStatus.OK);
//	            res.setMessage("No bookings found for customer");
//	            res.setData(finalList);
//	            return ResponseEntity.ok(res);
//	        }
//	        LocalDate today = LocalDate.now();
//	        LocalDate sixthDate = today.plusDays(6);
//	        LocalDate exp = null;
//	        DateTimeFormatter isoFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
//	        for (Booking booking : booked) {
//	            if (!"In-Progress".equalsIgnoreCase(booking.getStatus())) {
//	                continue;
//	            }
//	            // ✅ Include any In-Progress booking with serviceDate between today and sixthDate
//	            LocalDate ld = null;
//	            if(booking.getFollowupDate() != null) {
//	            	ld = LocalDate.parse(booking.getFollowupDate(), isoFormatter);
//	            }else {
//	            	if(booking.getServiceDate() != null) {
//		            	ld = LocalDate.parse(booking.getServiceDate(), isoFormatter);
//		            }	
//	            }
//	            if(!ld.isAfter(sixthDate)) {
//	            // Fetch doctor save details
//	            try {
//	                response = doctorFeign.getDoctorSaveDetailsByBookingId(booking.getBookingId()).getBody();
//	               // System.out.println(response);
//	            } catch (Exception e) {
//	                System.out.println(e.getMessage());
//	            }
//
//	            if (response != null && response.getData() != null) {
//	                saveDetails = new ObjectMapper().convertValue(response.getData(), DoctorSaveDetailsDTO.class);
//	               // System.out.println(saveDetails);
//	            } else {}
//	            // ✅ Stream-based Treatments + Sittings + Next Follow-Up
//	            if (saveDetails.getTreatments() != null &&
//	                saveDetails.getTreatments().getGeneratedData() != null &&
//	                !saveDetails.getTreatments().getGeneratedData().isEmpty()) {
//
//	                // Flatten all treatment dates into sorted list
//	                List<LocalDate> allDates = saveDetails.getTreatments().getGeneratedData().values().stream()
//	                        .filter(Objects::nonNull)
//	                        .flatMap(details -> details.getDates() != null
//	                                ? details.getDates().stream()
//	                                    .map(d -> LocalDate.parse(d.getDate(), isoFormatter))
//	                                : Stream.empty())
//	                        .sorted()
//	                        .toList();
//                        //System.out.println(allDates);
//	                // Calculate totalSittings and pendingSittings
//	                int totalSittingsSum = saveDetails.getTreatments().getGeneratedData().values().stream()
//	                        .filter(Objects::nonNull)
//	                        .mapToInt(d -> d.getTotalSittings() != null ? d.getTotalSittings() : 0)
//	                        .sum();
//	               // System.out.println(totalSittingsSum);
//	                int pendingSittingsSum = saveDetails.getTreatments().getGeneratedData().values().stream()
//	                        .filter(Objects::nonNull)
//	                        .mapToInt(d -> d.getSittings() != null ? d.getSittings() : 0)
//	                        .sum();
//	                //System.out.println(pendingSittingsSum);
//	                AtomicInteger takenSittingsCount = new AtomicInteger(0);
//
//	                // Determine next follow-up date according to your rules
//	                Optional<LocalDate> nextFollowupOpt = allDates.stream()
//	                        .map(sittingDate -> {
//	                            boolean sittingBooked = false;
//	                            try {
//	                                Booking resp =
//	                                		repository.findByPatientIdAndFollowupDate(
//	                                				sd.getPatientId(),
//	                                                sittingDate.format(isoFormatter));
//
//	                                if (resp != null) {
//	                                    sittingBooked = true;
//	                                    takenSittingsCount.incrementAndGet();
//	                                }
//	                            } catch (Exception ex) {
//	                                System.err.println("Error checking booking for date "
//	                                        + sittingDate + ": " + ex.getMessage());
//	                            }
//                                if(booking.getFollowupDate() != null) {
//	                            if (LocalDate.parse(booking.getFollowupDate(), isoFormatter).isBefore(today)) {
//	                                // Past date → pick first future date if available
//	                                return allDates.stream()
//	                                        .filter(f -> f.isAfter(today))
//	                                        .findFirst()
//	                                        .orElse(null);
//	                            } else if (LocalDate.parse(booking.getFollowupDate(), isoFormatter).isEqual(today)) {
//	                                if (sittingBooked) {
//	                                    // Today booked → pick first future date if available
//	                                    return allDates.stream()
//	                                            .filter(f -> f.isAfter(today))
//	                                            .findFirst()
//	                                            .orElse(null);
//	                                } else {
//	                                    // Today not booked → keep today
//	                                    return sittingDate;
//	                                }
//	                            } else {
//	                                // Future dates → do not modify follow-up
//	                                return null;
//	                            }
//	                        }else{
//	                        	 return allDates.stream()                                        
//	                                        .findFirst()
//	                                        .orElse(null);
//	                        }})
//	                        .filter(Objects::nonNull)
//	                        .findFirst();
//	                LocalDate lstSitting = allDates.get(allDates.size()-1);
//	                if(lstSitting.equals(LocalDate.now()) || lstSitting.isAfter(LocalDate.now())) {
//	                	exp = lstSitting.plusDays(Integer.parseInt(booking.getConsultationExpiration().replaceAll("\\D+", "")));
//	                	finalList = inprogressAppointmentsByConsultationExpiration(exp, booking,saveDetails); 
//	                }
//	                // Update booking object
//	                booking.setTotalSittings(totalSittingsSum);
//	                booking.setPendingSittings(pendingSittingsSum);
//	                booking.setTakenSittings(takenSittingsCount.get());
//	                booking.setCurrentSitting(pendingSittingsSum);
//	                nextFollowupOpt.ifPresent(d -> booking.setFollowupDate(d.format(isoFormatter)));
//	                finalList.add(toResponse(booking));
//	                //System.out.println(nextFollowupOpt);
//	                //System.out.println(finalList);
//	            }
//	            // ✅ Existing Follow-Up section
//	            else if (saveDetails.getFollowUp() != null &&
//	                saveDetails.getFollowUp().getNextFollowUpDate() != null) {
//	                try {
//	                	 int days = 0;
//		                	if(exp == null ){
//		                    days = Integer.parseInt(booking.getConsultationExpiration().replaceAll("\\D+", ""));
//		                    //System.out.println(days);
//		                    LocalDate serviceDate  = LocalDate.parse(booking.getServiceDate(), isoFormatter);
//		                    exp = serviceDate.plusDays(days);}
//	                    LocalDate followDate = LocalDate.parse(saveDetails.getFollowUp().getNextFollowUpDate(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);
//	                    if (!followDate.isBefore(today) && !followDate.isAfter(sixthDate) && !followDate.isAfter(exp)) {
//	                        Booking bkng = new Booking(booking);
//	                        bkng.setFollowupDate(followDate.format(isoFormatter));
//	                        bkng.setStatus("In-Progress");
//	                            finalList.add(toResponse(bkng));		                        
//	                    }
//	                } catch (Exception e) {
//	                    System.out.println(e.getMessage());
//	                }
//	            }}
//	        }
//	        res.setStatusCode(200);
//	        res.setHttpStatus(HttpStatus.OK);
//	        res.setMessage(finalList.isEmpty()
//	                ? "No In-Progress or Today appointments found"
//	                : "In-Progress appointments found");
//	        res.setData(finalList);
//
//	    } catch (Exception e) {
//	        res.setStatusCode(500);
//	        res.setHttpStatus(HttpStatus.INTERNAL_SERVER_ERROR);
//	        res.setMessage("Error: " + e.getMessage());
//	    }
//
//	    return ResponseEntity.status(res.getStatusCode()).body(res);
//	}
//

//		public ResponseEntity<?> retrieveOneWeekAppointments(String clinicId, String branchId) {
//		    ResponseStructure<List<BookingResponse>> res = new ResponseStructure<>();
//		    List<BookingResponse> finalList = new ArrayList<>();
//		    Response response = new Response();
//		    DoctorSaveDetailsDTO saveDetails = new DoctorSaveDetailsDTO();
//
//		    try {
//		        List<Booking> booked = repository.findByClinicIdAndBranchId(clinicId, branchId);
//		        if (booked == null || booked.isEmpty()) {
//		            res.setStatusCode(200);
//		            res.setHttpStatus(HttpStatus.OK);
//		            res.setMessage("No bookings found for customer");
//		            res.setData(finalList);
//		            return ResponseEntity.ok(res);
//		        }
//
//		        LocalDate today = LocalDate.now();
//		        LocalDate sixthDate = today.plusDays(6);
//		        DateTimeFormatter isoFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
//
//		        for (Booking booking : booked) {
//		            // Include only In-Progress bookings
//		            if (!"In-Progress".equalsIgnoreCase(booking.getStatus())) {
//		                continue;
//		            }
//
//		            // Include both In-Clinic & Online Consultations
//		            if (!"In-Clinic Consultation".equalsIgnoreCase(booking.getConsultationType()) &&
//		                !"Services & Treatments".equalsIgnoreCase(booking.getConsultationType()) &&
//		                !"Online Consultation".equalsIgnoreCase(booking.getConsultationType())) {
//		                continue;
//		            }
//
//		            LocalDate ld = null;
//		            if (booking.getFollowupDate() != null) {
//		                ld = LocalDate.parse(booking.getFollowupDate(), isoFormatter);
//		            } else if (booking.getServiceDate() != null) {
//		                ld = LocalDate.parse(booking.getServiceDate(), isoFormatter);
//		            }
//
//		            if (ld == null || ld.isAfter(sixthDate)) {
//		                continue;
//		            }
//
//		            // fetch doctor details
//		            try {
//		                response = doctorFeign.getDoctorSaveDetailsByBookingId(booking.getBookingId()).getBody();
//		            } catch (Exception e) {
//		                System.out.println("Feign error: " + e.getMessage());
//		            }
//
//		            if (response != null && response.getData() != null) {
//		                saveDetails = new ObjectMapper().convertValue(response.getData(), DoctorSaveDetailsDTO.class);
//		            }
//
//		            // Case 1: Treatment Data
//		            if (saveDetails.getTreatments() != null &&
//		                    saveDetails.getTreatments().getGeneratedData() != null &&
//		                    !saveDetails.getTreatments().getGeneratedData().isEmpty()) {
//
//		                List<LocalDate> allDates = saveDetails.getTreatments().getGeneratedData().values().stream()
//		                        .filter(Objects::nonNull)
//		                        .flatMap(details -> details.getDates() != null
//		                                ? details.getDates().stream()
//		                                .map(d -> LocalDate.parse(d.getDate(), isoFormatter))
//		                                : Stream.empty())
//		                        .sorted()
//		                        .toList();
//
//		                int totalSittingsSum = saveDetails.getTreatments().getGeneratedData().values().stream()
//		                        .filter(Objects::nonNull)
//		                        .mapToInt(d -> d.getTotalSittings() != null ? d.getTotalSittings() : 0)
//		                        .sum();
//
//		                int pendingSittingsSum = saveDetails.getTreatments().getGeneratedData().values().stream()
//		                        .filter(Objects::nonNull)
//		                        .mapToInt(d -> d.getSittings() != null ? d.getSittings() : 0)
//		                        .sum();
//
//		                AtomicInteger takenSittingsCount = new AtomicInteger(0);
//
//		                Optional<LocalDate> nextFollowupOpt = allDates.stream().findFirst();
//
//		                LocalDate lstSitting = allDates.get(allDates.size() - 1);
//		                LocalDate exp = lstSitting.plusDays(Integer.parseInt(booking.getConsultationExpiration().replaceAll("\\D+", "")));
//
//		                booking.setTotalSittings(totalSittingsSum);
//		                booking.setPendingSittings(pendingSittingsSum);
//		                booking.setTakenSittings(takenSittingsCount.get());
//		                booking.setCurrentSitting(pendingSittingsSum);
//		                nextFollowupOpt.ifPresent(d -> booking.setFollowupDate(d.format(isoFormatter)));
//
//		                finalList.add(toResponse(booking));
//		            }
//
//		            // Case 2: FollowUp Data
//		            else if (saveDetails.getFollowUp() != null &&
//		                    saveDetails.getFollowUp().getNextFollowUpDate() != null) {
//
//		                try {
//		                    int days = Integer.parseInt(booking.getConsultationExpiration().replaceAll("\\D+", ""));
//		                    LocalDate exp = LocalDate.parse(booking.getServiceDate(), isoFormatter).plusDays(days);
//
//		                    LocalDate followDate = LocalDate.parse(saveDetails.getFollowUp().getNextFollowUpDate(),
//		                            DateTimeFormatter.ISO_LOCAL_DATE_TIME);
//
//		                    if (!followDate.isBefore(today) && !followDate.isAfter(sixthDate) && !followDate.isAfter(exp)) {
//		                        Booking bkng = new Booking(booking);
//		                        bkng.setFollowupDate(followDate.format(isoFormatter));
//		                        bkng.setStatus("In-Progress");
//		                        finalList.add(toResponse(bkng));
//		                    }
//		                } catch (Exception e) {
//		                    System.out.println("Followup error: " + e.getMessage());
//		                }
//		            }
//
//		            // Case 3: Plain In-Clinic or Online Consultation (No Treatments/Followup)
//		            else {
//		                if (ld != null && !ld.isBefore(today) && !ld.isAfter(sixthDate)) {
//		                    finalList.add(toResponse(booking));
//		                }
//		            }
//		        }
//
//		        res.setStatusCode(200);
//		        res.setHttpStatus(HttpStatus.OK);
//		        res.setMessage(finalList.isEmpty()
//		                ? "No In-Progress or Today appointments found"
//		                : "In-Progress appointments found");
//		        res.setData(finalList);
//
//		    } catch (Exception e) {
//		        res.setStatusCode(500);
//		        res.setHttpStatus(HttpStatus.INTERNAL_SERVER_ERROR);
//		        res.setMessage("Error: " + e.getMessage());
//		    }
//
//		    return ResponseEntity.status(res.getStatusCode()).body(res);
//		}


		@Override
		public ResponseEntity<?> retrieveOneWeekAppointments(String clinicId, String branchId) {
		    ResponseStructure<List<BookingResponse>> res = new ResponseStructure<>();
		    List<BookingResponse> finalList = new ArrayList<>();
		    Response response;
		    DoctorSaveDetailsDTO saveDetails;

		    try {
		        List<Booking> booked = repository.findByClinicIdAndBranchId(clinicId, branchId);
		        if (booked == null || booked.isEmpty()) {
		            res.setStatusCode(200);
		            res.setHttpStatus(HttpStatus.OK);
		            res.setMessage("No bookings found for customer");
		            res.setData(finalList);
		            return ResponseEntity.ok(res);
		        }

		        LocalDate today = LocalDate.now();
		        LocalDate sixthDate = today.plusDays(6);
		        DateTimeFormatter isoFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

		        for (Booking booking : booked) {
		            // Include only In-Progress bookings
		            if (!"In-Progress".equalsIgnoreCase(booking.getStatus())) continue;

		            // Include relevant consultation types
		            String type = booking.getConsultationType() != null ? booking.getConsultationType().trim() : "";
		            if (!type.equalsIgnoreCase("In-Clinic Consultation") &&
		                !type.equalsIgnoreCase("Services & Treatments") &&
		                !type.equalsIgnoreCase("Online Consultation")) {
		                continue;
		            }

		            LocalDate ld = null;
		            if (booking.getFollowupDate() != null) {
		                ld = LocalDate.parse(booking.getFollowupDate(), isoFormatter);
		            } else if (booking.getServiceDate() != null) {
		                ld = LocalDate.parse(booking.getServiceDate(), isoFormatter);
		            }

		            if (ld == null || ld.isAfter(sixthDate)) continue;

		            // fetch doctor details
		            saveDetails = new DoctorSaveDetailsDTO();
		            try {
		                response = doctorFeign.getDoctorSaveDetailsByBookingId(booking.getBookingId()).getBody();
		                if (response != null && response.getData() != null) {
		                    saveDetails = new ObjectMapper().convertValue(response.getData(), DoctorSaveDetailsDTO.class);
		                }
		            } catch (Exception e) {
		                System.out.println("Feign error: " + e.getMessage());
		            }

		            boolean bookingAdded = false;

		            // Case 1: Treatment Data
		            if (saveDetails.getTreatments() != null &&
		                saveDetails.getTreatments().getGeneratedData() != null &&
		                !saveDetails.getTreatments().getGeneratedData().isEmpty()) {

		                List<LocalDate> allDates = saveDetails.getTreatments().getGeneratedData().values().stream()
		                        .filter(Objects::nonNull)
		                        .flatMap(details -> details.getDates() != null
		                                ? details.getDates().stream().map(d -> LocalDate.parse(d.getDate(), isoFormatter))
		                                : Stream.empty())
		                        .sorted()
		                        .toList();

		                int totalSittingsSum = saveDetails.getTreatments().getGeneratedData().values().stream()
		                        .mapToInt(d -> d.getTotalSittings() != null ? d.getTotalSittings() : 0)
		                        .sum();

		                int pendingSittingsSum = saveDetails.getTreatments().getGeneratedData().values().stream()
		                        .mapToInt(d -> d.getSittings() != null ? d.getSittings() : 0)
		                        .sum();

		                AtomicInteger takenSittingsCount = new AtomicInteger(0);

		                LocalDate lastSitting = allDates.get(allDates.size() - 1);
		                LocalDate exp = lastSitting.plusDays(Integer.parseInt(booking.getConsultationExpiration().replaceAll("\\D+", "")));

		                booking.setTotalSittings(totalSittingsSum);
		                booking.setPendingSittings(pendingSittingsSum);
		                booking.setTakenSittings(takenSittingsCount.get());
		                booking.setCurrentSitting(pendingSittingsSum);
		                booking.setFollowupDate(allDates.get(0).format(isoFormatter));

		                if (!exp.isBefore(today)) {
		                    finalList.add(toResponse(booking));
		                    bookingAdded = true;
		                }
		            }

		            // Case 2: FollowUp Data
		            if (!bookingAdded && saveDetails.getFollowUp() != null &&
		                saveDetails.getFollowUp().getNextFollowUpDate() != null) {
		                try {
		                    LocalDate followDate = LocalDate.parse(
		                            saveDetails.getFollowUp().getNextFollowUpDate(),
		                            DateTimeFormatter.ISO_LOCAL_DATE_TIME
		                    );

		                    LocalDate exp = LocalDate.parse(booking.getServiceDate(), isoFormatter)
		                            .plusDays(Integer.parseInt(booking.getConsultationExpiration().replaceAll("\\D+", "")));

		                    if (!followDate.isBefore(today) && !followDate.isAfter(sixthDate) && !followDate.isAfter(exp)) {
		                        Booking bkng = new Booking(booking);
		                        bkng.setFollowupDate(followDate.format(isoFormatter));
		                        bkng.setStatus("In-Progress");
		                        finalList.add(toResponse(bkng));
		                        bookingAdded = true;
		                    }
		                } catch (Exception e) {
		                    System.out.println("Followup error: " + e.getMessage());
		                }
		            }

		            // Case 3: Plain In-Clinic or Online Consultation (No Treatments/Followup)
		            if (!bookingAdded) {
		                if (ld != null && !ld.isBefore(today) && !ld.isAfter(sixthDate)) {
		                    finalList.add(toResponse(booking));
		                }
		            }
		        }

		        res.setStatusCode(200);
		        res.setHttpStatus(HttpStatus.OK);
		        res.setMessage(finalList.isEmpty()
		                ? "No In-Progress or Today appointments found"
		                : "In-Progress appointments found");
		        res.setData(finalList);

		    } catch (Exception e) {
		        res.setStatusCode(500);
		        res.setHttpStatus(HttpStatus.INTERNAL_SERVER_ERROR);
		        res.setMessage("Error: " + e.getMessage());
		    }

		    return ResponseEntity.status(res.getStatusCode()).body(res);
		}

		
		public ResponseEntity<?> retrieveAppointments(String cinicId,String branchId,String date){			
			ResponseStructure< List<BookingResponse>> res = new ResponseStructure< List<BookingResponse>>();		  
			try {	
				 List<Booking> bookings = repository.findByClinicIdAndBranchIdAndServiceDateOrderByServicetimeAsc(cinicId, branchId, date);
				// System.out.println(todayBookings);
				 bookings = bookings.stream().filter(n->n.getStatus().equalsIgnoreCase("In-Progress")).toList();
				 List<BookingResponse> todayBookingsDto = toResponses(bookings);
				 if(todayBookingsDto!= null && !todayBookingsDto.isEmpty()) {
				 res.setStatusCode(200);
					res.setHttpStatus(HttpStatus.OK);
					res.setData(todayBookingsDto);
					res.setMessage("appointments found");
				 }else {
					 res.setStatusCode(404);
						res.setHttpStatus(HttpStatus.NOT_FOUND);
						res.setMessage("appointments Not found with date");}
			}catch(Exception e) {
				res.setStatusCode(500);
				res.setMessage(e.getMessage());
			}			
			return ResponseEntity.status(res.getStatusCode()).body(res);	
}
		
		
		public ResponseEntity<?> updateAppointmentBasedOnBookingId(BookingResponse dto){
			try {
				//System.out.println(dto);
				Booking entity = repository.findByBookingId(dto.getBookingId())
						.orElseThrow(() -> new RuntimeException("Invalid Booking Id Please provide Valid Id"));
                //System.out.println(entity);
			    if (dto.getBookingId() != null && !dto.getBookingId().isEmpty()) {
			        entity.setBookingId(dto.getBookingId());
			    }

			    if (dto.getBookingFor() != null && !dto.getBookingFor().isEmpty()) {
			        entity.setBookingFor(dto.getBookingFor());
			    }

			    if (dto.getRelation() != null && !dto.getRelation().isEmpty()) {
			        entity.setRelation(dto.getRelation());
			    }

			    if (dto.getPatientMobileNumber() != null && !dto.getPatientMobileNumber().isEmpty()) {
			        entity.setPatientMobileNumber(dto.getPatientMobileNumber());
			    }

			    if (dto.getPatientAddress() != null && !dto.getPatientAddress().isEmpty()) {
			        entity.setPatientAddress(dto.getPatientAddress());
			    }

			    if (dto.getPatientId() != null && !dto.getPatientId().isEmpty()) {
			        entity.setPatientId(dto.getPatientId());
			    }

			    if (dto.getFreeFollowUpsLeft() != null) {
			        entity.setFreeFollowUpsLeft(dto.getFreeFollowUpsLeft());
			    }

			    if (dto.getFreeFollowUps() != null) {
			        entity.setFreeFollowUps(dto.getFreeFollowUps());
			    }

			    if (dto.getVisitType() != null && !dto.getVisitType().isEmpty()) {
			        entity.setVisitType(dto.getVisitType());
			    }

			    if (dto.getName() != null && !dto.getName().isEmpty()) {
			        entity.setName(dto.getName());
			    }

			    if (dto.getAge() != null && !dto.getAge().isEmpty()) {
			        entity.setAge(dto.getAge());
			    }

			    if (dto.getGender() != null && !dto.getGender().isEmpty()) {
			        entity.setGender(dto.getGender());
			    }

			    if (dto.getMobileNumber() != null && !dto.getMobileNumber().isEmpty()) {
			        entity.setMobileNumber(dto.getMobileNumber());
			    }

			    if (dto.getCustomerId() != null && !dto.getCustomerId().isEmpty()) {
			        entity.setCustomerId(dto.getCustomerId());
			    }

			    if (dto.getCustomerDeviceId() != null && !dto.getCustomerDeviceId().isEmpty()) {
			        entity.setCustomerDeviceId(dto.getCustomerDeviceId());
			    }

			    if (dto.getProblem() != null && !dto.getProblem().isEmpty()) {
			        entity.setProblem(dto.getProblem());
			    }

			    if (dto.getSymptomsDuration() != null && !dto.getSymptomsDuration().isEmpty()) {
			        entity.setSymptomsDuration(dto.getSymptomsDuration());
			    }

			    if (dto.getClinicId() != null && !dto.getClinicId().isEmpty()) {
			        entity.setClinicId(dto.getClinicId());
			    }

			    if (dto.getClinicName() != null && !dto.getClinicName().isEmpty()) {
			        entity.setClinicName(dto.getClinicName());
			    }

			    if (dto.getBranchId() != null && !dto.getBranchId().isEmpty()) {
			        entity.setBranchId(dto.getBranchId());
			    }

			    if (dto.getBranchname() != null && !dto.getBranchname().isEmpty()) {
			        entity.setBranchname(dto.getBranchname());
			    }

			    if (dto.getClinicDeviceId() != null && !dto.getClinicDeviceId().isEmpty()) {
			        entity.setClinicDeviceId(dto.getClinicDeviceId());
			    }

			    if (dto.getDoctorId() != null && !dto.getDoctorId().isEmpty()) {
			        entity.setDoctorId(dto.getDoctorId());
			    }

			    if (dto.getDoctorName() != null && !dto.getDoctorName().isEmpty()) {
			        entity.setDoctorName(dto.getDoctorName());
			    }

			    // Mapping: doctorMobileDeviceId → doctorDeviceId (different field names)
			    if (dto.getDoctorMobileDeviceId() != null && !dto.getDoctorMobileDeviceId().isEmpty()) {
			        entity.setDoctorDeviceId(dto.getDoctorMobileDeviceId());
			    }

			    if (dto.getDoctorWebDeviceId() != null && !dto.getDoctorWebDeviceId().isEmpty()) {
			        entity.setDoctorWebDeviceId(dto.getDoctorWebDeviceId());
			    }

			    if (dto.getSubServiceId() != null && !dto.getSubServiceId().isEmpty()) {
			        entity.setSubServiceId(dto.getSubServiceId());
			    }

			    if (dto.getSubServiceName() != null && !dto.getSubServiceName().isEmpty()) {
			        entity.setSubServiceName(dto.getSubServiceName());
			    }

			    if (dto.getServiceDate() != null && !dto.getServiceDate().isEmpty()) {
			        entity.setServiceDate(dto.getServiceDate());
			    }

			    if (dto.getServicetime() != null && !dto.getServicetime().isEmpty()) {
			        entity.setServicetime(dto.getServicetime());
			    }

			    if (dto.getConsultationType() != null && !dto.getConsultationType().isEmpty()) {
			        entity.setConsultationType(dto.getConsultationType());
			    }

			    if (dto.getConsultationFee() > 0) {
			        entity.setConsultationFee(dto.getConsultationFee());
			    }

			    if (dto.getReasonForCancel() != null && !dto.getReasonForCancel().isEmpty()) {
			        entity.setReasonForCancel(dto.getReasonForCancel());
			    }

			    if (dto.getNotes() != null && !dto.getNotes().isEmpty()) {
			        entity.setNotes(dto.getNotes());
			    }

			    // reports DTO list → entity list (need manual conversion if types differ)
			    if (dto.getReports() != null && !dto.getReports().isEmpty()) {
			    	List<ReportsList> lst = new ObjectMapper().convertValue(dto.getReports(),new TypeReference<List<ReportsList>>(){});
			    	entity.setReports(lst);
			    }

			    if (dto.getChannelId() != null && !dto.getChannelId().isEmpty()) {
			        entity.setChannelId(dto.getChannelId());
			    }

			    if (dto.getBookedAt() != null && !dto.getBookedAt().isEmpty()) {
			        entity.setBookedAt(dto.getBookedAt());
			    }
				if(dto.getFollowupStatus() != null && dto.getFollowupStatus().equalsIgnoreCase("no-followup")) {
			        entity.setStatus("Completed");
			    }else {
			    	try {
			    		//System.out.println(dto);
			    		if(entity.getTreatments().getGeneratedData().containsKey(dto.getTreatmentName())) {
			    		TreatmentDetailsDTO	treatmentDetailsDTO = entity.getTreatments().getGeneratedData().get(dto.getTreatmentName());
			    		//System.out.println(treatmentDetailsDTO);
			    		if(treatmentDetailsDTO != null) {
			    			for(DatesDTO datesDTO : treatmentDetailsDTO.getDates()) {
			    				//System.out.println(datesDTO);
			    				if(datesDTO.getDate().equals(dto.getTreatmentDate())){
			    					datesDTO.setFollowupStatus(dto.getFollowupStatus());}
			    				TreatmentResponseDTO treatmentResponseDTO = entity.getTreatments();
			    				//System.out.println(treatmentResponseDTO);
			    					entity.setTreatments(treatmentResponseDTO);		
			    			}}}}catch(Exception e) {System.out.println(e.getMessage());}}
			    if (dto.getVisitCount() != null) {
			        entity.setVisitCount(dto.getVisitCount());
			    }
			    if (dto.getAttachments() != null && !dto.getAttachments().isEmpty()) {
			    	List<byte[]> bte = new ObjectMapper().convertValue(dto.getAttachments(), new TypeReference<List<byte[]>>(){});
			    	entity.setAttachments(bte);
			    }
			    if (dto.getConsentFormPdf() != null && !dto.getConsentFormPdf().isEmpty()) {
			        entity.setConsentFormPdf(Base64.getDecoder().decode(dto.getConsentFormPdf()));
			    }

			    if (dto.getPrescriptionPdf() != null && !dto.getPrescriptionPdf().isEmpty()) {
			    	List<byte[]> bte = new ObjectMapper().convertValue(dto.getPrescriptionPdf(), new TypeReference<List<byte[]>>(){});
			    	entity.setPrescriptionPdf(bte);
			    }

			    if (dto.getTotalFee() > 0) {
			        entity.setTotalFee(dto.getTotalFee());
			    }

			    if (dto.getDoctorRefCode() != null && !dto.getDoctorRefCode().isEmpty()) {
			        entity.setDoctorRefCode(dto.getDoctorRefCode());
			    }

			    if (dto.getConsultationExpiration() != null && !dto.getConsultationExpiration().isEmpty()) {
			        entity.setConsultationExpiration(dto.getConsultationExpiration());
			    }
			    
//			    if (dto.getFollowupStatus() != null) {
//			        entity.setFollowupStatus(dto.getFollowupStatus());
//			    }
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
			
		
		public ResponseEntity<?> getRelationsByCustomerId(String customerId) {
		    ResponseStructure<Map<String, List<RelationInfoDTO>>> res = new ResponseStructure<>();

		    try {
		        List<Booking> bookings = repository.findByCustomerId(customerId);

		        Map<String, List<RelationInfoDTO>> data = bookings.stream()
		                .collect(Collectors.groupingBy(
		                        Booking::getRelation,
		                        LinkedHashMap::new,
		                        Collectors.collectingAndThen(
		                                Collectors.mapping(n -> {
		                                    RelationInfoDTO dto = new RelationInfoDTO();
		                                    dto.setAddress(n.getPatientAddress());
		                                    dto.setAge(n.getAge());
		                                    dto.setFullname(n.getName());
		                                    dto.setMobileNumber(n.getMobileNumber());
		                                    dto.setRelation(n.getRelation());
		                                    dto.setGender(n.getGender());
		                                    dto.setCustomerId(n.getCustomerId());
		                                    dto.setPatientId(n.getPatientId());
		                                    return dto;
		                                }, Collectors.toList()),
		                                list -> list.stream().distinct().collect(Collectors.toList()) // remove duplicates
		                        )));
		        res.setStatusCode(200);
		        res.setHttpStatus(HttpStatus.OK);
		        res.setData(data);
		        res.setMessage("Relations found successfully");
		    } catch (Exception e) {
		        res.setStatusCode(500);
		        res.setHttpStatus(HttpStatus.INTERNAL_SERVER_ERROR);
		        res.setMessage("Error: " + e.getMessage());
		    }

		    return ResponseEntity.status(res.getStatusCode()).body(res);
		}
		
		
		@Override
		public BookingResponse checkBookingByDateAndTime(String date,String time,String doctorId) {
			Booking booking = repository.findByServiceDateAndServicetimeAndDoctorId(date, time, doctorId);
			if(booking != null) {
			return toResponse(booking);
			}else {
				return null;
			}
			
		}


}