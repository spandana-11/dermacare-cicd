package com.dermacare.notification_service.service.serviceImpl;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.TimeZone;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import com.dermacare.notification_service.dto.BookingResponse;
import com.dermacare.notification_service.dto.NotificationDTO;
import com.dermacare.notification_service.dto.NotificationResponse;
import com.dermacare.notification_service.dto.NotificationToCustomer;
import com.dermacare.notification_service.dto.ResBody;
import com.dermacare.notification_service.dto.ResponseStructure;
import com.dermacare.notification_service.entity.Booking;
import com.dermacare.notification_service.entity.NotificationEntity;
import com.dermacare.notification_service.feign.BookServiceFeign;
import com.dermacare.notification_service.feign.CllinicFeign;
import com.dermacare.notification_service.notificationFactory.SendAppNotification;
import com.dermacare.notification_service.repository.NotificationRepository;
import com.dermacare.notification_service.service.ServiceInterface;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import feign.FeignException;


@Service
public class ServiceImpl implements ServiceInterface{

	@Autowired
    private NotificationRepository repository;
	
	@Autowired
	private SendAppNotification appNotification;
	
	@Autowired
	private  BookServiceFeign  bookServiceFeign;	
	
	@Autowired
	private CllinicFeign cllinicFeign;
	

	Set<String> bookings = new LinkedHashSet<>();
	
	@Override
	public void createNotification(BookingResponse bookingDTO) {
		if(!bookings.contains(bookingDTO.getBookingId())) {
		bookings.add(bookingDTO.getBookingId());
		convertToNotification(bookingDTO);
	    sendNotification(bookingDTO);}
	}
		
		
	public void sendNotification(BookingResponse booking) {
		String title=buildTitle(booking);
		String body =buildBody(booking);
		appNotification.sendPushNotification(booking.getDoctorDeviceId(),title,body, "BOOKING",
			    "BookingScreen","default");
	}
	
	
	private void convertToNotification(BookingResponse booking) {	
			NotificationEntity notificationEntity = new NotificationEntity();
			notificationEntity.setMessage("You have a new service appointment: " + booking.getSubServiceName());
			DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
			String currentDate = LocalDate.now().format(dateFormatter);	
			notificationEntity.setDate(currentDate);
			ZonedDateTime istTime = ZonedDateTime.now(ZoneId.of("Asia/Kolkata"));
		    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a");
		    String formattedTime = istTime.format(formatter);
		    notificationEntity.setTime(formattedTime);
		    notificationEntity.setData(new ObjectMapper().convertValue(booking,Booking.class));
			notificationEntity.setActions(new String[]{"Accept", "Reject"});
			repository.save(notificationEntity);}
	
	
	private String buildBody(BookingResponse booking) {
		String body=booking.getBookingFor() + " booked a "+booking.getSubServiceName()+" on "
				+booking.getName()+" at "+booking.getServicetime();
		return body;
	}
	
	private String buildTitle(BookingResponse booking) {
		String title="Hello "+booking.getDoctorName();;
		return title;
	} 
	
	
	
	public ResBody<List<NotificationDTO>> notificationtodoctor( String hospitalId,
			 String doctorId){
		ResBody<List<NotificationDTO>> res = new ResBody<List<NotificationDTO>>();
		List<NotificationDTO> eligibleNotifications = new ArrayList<>();
		List<NotificationDTO> reversedEligibleNotifications = new ArrayList<>();
		try {
		List<NotificationEntity> entity = repository.findByDataClinicIdAndDataDoctorId(hospitalId, doctorId);
		List<NotificationDTO> dto = new ObjectMapper().convertValue(entity, new TypeReference<List<NotificationDTO>>() {});
		DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
		String currentDate = LocalDate.now().format(dateFormatter);
		if(dto != null) {
		for(NotificationDTO n : dto) {	
			if(n.getData().getStatus().equalsIgnoreCase("Pending") && n.getDate().equals(currentDate)){
				eligibleNotifications.add(n);}}}
		for(int i=eligibleNotifications.size()-1;i>=0;i--) {
			reversedEligibleNotifications.add(eligibleNotifications.get(i));
		}
		if(eligibleNotifications!=null && !eligibleNotifications.isEmpty() ) {
		res = new ResBody<List<NotificationDTO>>("Notification sent Successfully",200,reversedEligibleNotifications);	
		
		}else {
			res = new ResBody<List<NotificationDTO>>("NotificationInfo Not Found",200,null);
			}}catch(Exception e) {
		res = new ResBody<List<NotificationDTO>>(e.getMessage(),500,null);
	}
		return res;
	}
				

	
	public ResBody<List<NotificationDTO>> sendNotificationToClinic(String clinicId) {
		ResBody<List<NotificationDTO>> r = new ResBody<List<NotificationDTO>>();
		List<NotificationDTO> list = new ArrayList<>();
		try {
			List<NotificationEntity> entity = repository.findAll();
			List<NotificationDTO> dto = new ObjectMapper().convertValue(entity, new TypeReference<List<NotificationDTO>>() {});	
			DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
			String currentDate = LocalDate.now().format(dateFormatter);	
			if(dto != null) {
			for(NotificationDTO n : dto) {												
				if(n.getData().getStatus().equalsIgnoreCase("Pending") && timeDifference(n.getTime()) && 
				n.getData().getClinicId().equals(clinicId) && n.getDate().equals(currentDate)){					
					list.add(n);}}}
		    if( list != null && ! list.isEmpty()) {
		    	r = new ResBody<List<NotificationDTO>>("Notifications Are sent to the admin",200,list);
		    }else {
		    r = new ResBody<List<NotificationDTO>>("Notifications Are Not Found",200,null); }  
		}catch(Exception e) {
			r = new ResBody<List<NotificationDTO>>(e.getMessage(),500,null);
		}
		return r;	
	}
	
	
	
	 private boolean timeDifference(String notificationTime) {			
		   try {
			 
			   SimpleDateFormat inputFormat = new SimpleDateFormat("hh:mm a"); 
			   
			   ZonedDateTime istTime = ZonedDateTime.now(ZoneId.of("Asia/Kolkata"));
		        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a");
		        String formattedTimeByZone = istTime.format(formatter);			   
		        Date formattedCurrentTime = inputFormat.parse(formattedTimeByZone);		        
		       SimpleDateFormat simpleDateFormat = new SimpleDateFormat("HH:mm");
		       String modifiedcurrentTime = simpleDateFormat.format(formattedCurrentTime);
		       		      
		      Date date = inputFormat.parse(notificationTime);		      
		      SimpleDateFormat simpleDateFormatForNotificationTime = new SimpleDateFormat("HH:mm");
		      String modifiednotificationTime = simpleDateFormatForNotificationTime.format(date);
		      
		       Date nTime = simpleDateFormat.parse(modifiednotificationTime);
		       Date cTime = simpleDateFormat.parse(modifiedcurrentTime);
		       
		       System.out.println(nTime);
		       System.out.println(cTime);
		       
		       long differenceInMilliSeconds
		           = cTime.getTime() - nTime.getTime();     
		           		      
		       long differenceInMinutes
		           = differenceInMilliSeconds / (60 * 1000);///it wont ignores hours 
		       
		       System.out.println(differenceInMinutes);
		       if(differenceInMinutes != 0 && differenceInMinutes >= 5 ) {
		    	   return true;
		    	 }else{
		    	    return false;}
		   }catch(ParseException e) {
			   return false;}
		   }
	
	

	 public ResBody<NotificationDTO> notificationResponse(NotificationResponse notificationResponse) {
		    try {		        
		        ResponseEntity<ResponseStructure<BookingResponse>> res = bookServiceFeign.getBookedService(notificationResponse.getAppointmentId());
		        BookingResponse b = res.getBody().getData();		     
		        NotificationEntity notificationEntity = repository.findByNotificationId(notificationResponse.getNotificationId());		      
		        if (b == null) {
		            return new ResBody<>("Booking not found for given appointment ID", 404, null);
		        }
		        if (notificationEntity == null) {
		            return new ResBody<>("Notification not found for given notification ID", 404, null);
		        }		       
		        if (b.getDoctorId().equalsIgnoreCase(notificationResponse.getDoctorId()) &&
		            b.getClinicId().equalsIgnoreCase(notificationResponse.getHospitalId()) &&
		            b.getBookingId().equalsIgnoreCase(notificationResponse.getAppointmentId()) &&
		            b.getSubServiceId().equalsIgnoreCase(notificationResponse.getSubServiceId())) {		          
		            String status = notificationResponse.getStatus();
		            switch (status) {
		                case "Accepted":
		                    b.setStatus("Confirmed");
		                    notificationEntity.getData().setStatus("Confirmed");
		                    repository.save(notificationEntity);
		                    try {
		                        if (b.getCustomerDeviceId() != null) {
		                            appNotification.sendPushNotification(
		                                b.getCustomerDeviceId(),
		                                " Hello " + b.getName(),
		                                b.getDoctorName() + " Accepted Your Appointment For " +
		                                b.getSubServiceName() + " on " + b.getServiceDate() + " at " + b.getServicetime(),
		                                "BOOKING SUCCESS",
		                			    "BookingVerificationScreen","default" );
		                        }
		                    } catch (Exception ex) {}
		                    break;

		                case "Rejected":
		                    b.setStatus("Rejected");
		                    b.setReasonForCancel(notificationResponse.getReasonForCancel());
		                    cllinicFeign.makingFalseDoctorSlot(b.getDoctorId(), b.getServiceDate(), b.getServicetime());
		                    notificationEntity.getData().setStatus("Rejected");
		                    repository.save(notificationEntity);
		                    try {
		                        if (b.getCustomerDeviceId() != null) {
		                            appNotification.sendPushNotification(
		                                b.getCustomerDeviceId(),
		                                " Hello " + b.getName(),
		                                b.getDoctorName() + " Rejected Your Appointment For " +
		                                b.getSubServiceName() + " on " + b.getServiceDate() + " at " + b.getServicetime(),
		                                "BOOKING REJECT",
		                			    "BookingVerificationScreen","default"
		                            );
		                        }
		                    } catch (Exception ex) {}		                
		                    break;
		                default:		                  
		                    b.setStatus("Pending");
		                    notificationEntity.getData().setStatus("Pending");
		                    repository.save(notificationEntity);
		                    break;}		           
		            ResponseEntity<?> book = bookServiceFeign.updateAppointment(b);
		            if (book != null) {
		                return new ResBody<>("Appointment And Notification Status updated", 200, null);		                
		            } else {
		                return new ResBody<>("Appointment Status Not updated", 200, null);
		            }

		        } else {
		            return new ResBody<>("Status Not updated, please check provided details", 200, null);
		        }

		    } catch (FeignException e) {
		        return new ResBody<>(e.getMessage(), 500, null);
		    }
		}

	
	
	
//	private void removeCompletedNotifications() {
//   	List<NotificationEntity> entity = repository.findAll();
//   	if(entity!=null && !entity.isEmpty()) {
//   		for(NotificationEntity e : entity) {
//   			if(e.getData().getStatus().equals("Completed")) {
//   				if(bookings.contains(e.getId())) {
//   					bookings.remove(e.getId());}
//   			repository.delete(e);	    			
//   		}}}}

	
	 @Scheduled(fixedRate = 1 * 60 * 1000)
	 public void sendAlertNotifications() {		 
		 try {
			 System.out.println("sendAlertNotifications method invoked");
			 List<NotificationEntity> notifications = repository.findAll();
			 DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
				String currentDate = LocalDate.now().format(dateFormatter);
		        for (NotificationEntity notification : notifications) {
		            if ("Confirmed".equalsIgnoreCase(notification.getData().getStatus()) && notification.isAlerted() == false 
		             && notification.getData().getServiceDate().equals(currentDate) && calculateTimeDifferenceForAlertNotification(notification.getData().getServicetime())) {
		            if(notification.getData().getConsultationType().equalsIgnoreCase("online consultation") ||
		            notification.getData().getConsultationType().equalsIgnoreCase("video consultation")) {
		            sendAlertPushNotification(notification.getData().getBookingId());
		            notification.setAlerted(true);
		            repository.save(notification);}}}
		 }catch(Exception e) {}
 }
	
	 
	 
	 private boolean calculateTimeDifferenceForAlertNotification(String serviceTime) {	
		 
		   try {		   
             SimpleDateFormat inputFormat = new SimpleDateFormat("hh:mm a"); ////used for convert string to date object
			   
			   ZonedDateTime istTime = ZonedDateTime.now(ZoneId.of("Asia/Kolkata"));
		        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a");
		        String formattedTimeByZone = istTime.format(formatter);	////current asia time generated.present in form of string		   
		        Date formattedCurrentTime = inputFormat.parse(formattedTimeByZone);	////converting String to date object	        
		       SimpleDateFormat simpleDateFormat = new SimpleDateFormat("HH:mm");////converting form 12 hrs to 24 hrs
		       String modifiedcurrentTime = simpleDateFormat.format(formattedCurrentTime);
		       		      
		      Date serviceTimeStringToDteObject = inputFormat.parse(serviceTime);		      
		      SimpleDateFormat simpleDateFormatForNotificationTime = new SimpleDateFormat("HH:mm");
		      String modifiedServiceTime = simpleDateFormatForNotificationTime.format(serviceTimeStringToDteObject);
		      
		       Date sTime = simpleDateFormat.parse(modifiedServiceTime );
		       Date cTime = simpleDateFormat.parse(modifiedcurrentTime);
		       
		       System.out.println(sTime);
		       System.out.println(cTime);
		       long differenceInMilliSeconds
		           =  sTime.getTime() - cTime.getTime();     
		       		      
		       long differenceInMinutes
		           = differenceInMilliSeconds / (60 * 1000);///it wont ignores hours convert then into minutes
		       System.out.println(differenceInMinutes);
		       
		       if(differenceInMinutes != 0 && differenceInMinutes >= 1 &&  differenceInMinutes <= 5  ) {
		    	   return true;
		    	 }else{
		    	    return false;}
		   }catch(ParseException e) {
			   return false;}
		   }
	
		 
	 private void sendAlertPushNotification(String appointmentId) {
		 try {
			 ResponseEntity<ResponseStructure<BookingResponse>> res = bookServiceFeign.getBookedService(appointmentId);
		        BookingResponse b = res.getBody().getData();
		        System.out.println(b.getCustomerDeviceId());
		        System.out.println(b.getDoctorDeviceId());
		        if (b != null) {
		        	 try {
	                        if(b.getCustomerDeviceId() != null && b.getDoctorDeviceId() != null) {
	                            appNotification.sendPushNotification(
	                                b.getCustomerDeviceId(),
	                                " Hello " + b.getName()+ "," ,
	                                b.getDoctorName() + " Connect With You Through Video Call within 5 Minutes ", "Alert",
	                			    "AlertScreen","default");
	                      
	                            appNotification.sendPushNotification(
	                                b.getDoctorDeviceId(),
	                                " Hello " +b.getDoctorName()+ "," , " You Have a Video Consultation within 5 Minutes With " +
	                                b.getName(), "Alert",
	                			    "AlertScreen","default");
	                            
	                            System.out.println("Notification sent to doctor and customer");
	                    }}catch (Exception ex) {}
		        	 }
			 }catch(Exception e) {}
		  }
	 
	 
	
	@Override
	public NotificationDTO getNotificationByBookingId(String bookingId) {
		NotificationEntity notification = repository.findByDataBookingId(bookingId);
		 NotificationDTO dto = new ObjectMapper().convertValue(notification, NotificationDTO.class );
		 return dto;
	}
	

	@Override
	public NotificationDTO updateNotification( NotificationDTO  notificationDTO) {
		 NotificationEntity entity = new ObjectMapper().convertValue(notificationDTO, NotificationEntity.class );
		NotificationEntity notification = repository.save(entity);
		 NotificationDTO dto = new ObjectMapper().convertValue(notification, NotificationDTO.class );
		 return dto;
	}
	
	
	@Override
	public ResponseEntity<ResBody<List<NotificationToCustomer>>> notificationToCustomer(
			 String customerMobileNumber){
		ResBody<List<NotificationToCustomer>> res = new ResBody<List<NotificationToCustomer>>();
		List<NotificationToCustomer> eligibleNotifications = new ArrayList<>();
		try {
		List<NotificationEntity> entity = repository.findByDataMobileNumber(customerMobileNumber );
		List<NotificationDTO> dto = new ObjectMapper().convertValue(entity, new TypeReference<List<NotificationDTO>>() {});
		DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
		String currentDate = LocalDate.now().format(dateFormatter);	
		if(dto != null) {
		for(NotificationDTO n : dto) {					
			if(n.getData().getStatus().equalsIgnoreCase("Confirmed") && n.getDate().equals(currentDate)) {
				NotificationToCustomer notification = new NotificationToCustomer();
				notification.setMessage("Appointment Accepted For "+n.getData().getSubServiceName());
				notification.setHospitalName(n.getData().getClinicName());
				notification.setDoctorName(n.getData().getDoctorName());
				notification.setServiceName(n.getData().getSubServiceName());
				notification.setServiceDate(n.getData().getServiceDate());
				notification.setServiceTime(n.getData().getServicetime());
				notification.setServiceFee(n.getData().getTotalFee());
				notification.setConsultationType(n.getData().getConsultationType());
				notification.setConsultationFee(n.getData().getConsultationFee());
				eligibleNotifications.add(notification);}}}
		if(eligibleNotifications!=null && !eligibleNotifications.isEmpty() ) {
		res = new ResBody<List<NotificationToCustomer>>("Notification sent Successfully",200,eligibleNotifications);
		}else {
			res = new ResBody<List<NotificationToCustomer>>("Notifications Not Found",200,null);
			}}catch(FeignException e) {
		res = new ResBody<List<NotificationToCustomer>>(e.getMessage(),500,null);
	}
		return ResponseEntity.status(res.getStatus()).body(res);
		}	
		
}
