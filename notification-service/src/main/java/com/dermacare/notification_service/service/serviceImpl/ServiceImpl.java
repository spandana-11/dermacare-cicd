package com.dermacare.notification_service.service.serviceImpl;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import com.dermacare.notification_service.dto.BookingResponse;
import com.dermacare.notification_service.dto.ExtractFeignMessage;
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
	    sendNotification(bookingDTO);}}
		
		
	public String sendNotification(BookingResponse booking) {
		String title=buildTitle(booking);
		String body =buildBody(booking);
		return appNotification.sendPushAppNotification(booking.getDoctorDeviceId(),title,body);
	}
	
	
	private void convertToNotification(BookingResponse booking) {	
			NotificationEntity notificationEntity = new NotificationEntity();
			notificationEntity.setMessage("You have a new service appointment: " + booking.getSubServiceName());
			DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
			String currentDate = LocalDate.now().format(dateFormatter);	
			notificationEntity.setDate(currentDate);
			LocalTime currentTime = LocalTime.now();
		    String time = String.valueOf(currentTime);
		    notificationEntity.setTime(time);
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
	
	
	
	public ResBody<List<NotificationDTO>> notificationtodoctorandclinic( String hospitalId,
			 String doctorId){
		ResBody<List<NotificationDTO>> res = new ResBody<List<NotificationDTO>>();
		List<NotificationDTO> eligibleNotifications = new ArrayList<>();
		try {
		List<NotificationEntity> entity = repository.findByDataClinicIdAndDataDoctorId(hospitalId, doctorId);
		List<NotificationDTO> dto = new ObjectMapper().convertValue(entity, new TypeReference<List<NotificationDTO>>() {});
		for(NotificationDTO d : dto){
			d.getData().setCustomerDeviceId(null);}
		if(dto != null) {
		for(NotificationDTO n : dto) {					
			if(n.getData().getStatus().equalsIgnoreCase("Pending")) {
				eligibleNotifications.add(n);}}}
		if(eligibleNotifications!=null && !eligibleNotifications.isEmpty() ) {
		res = new ResBody<List<NotificationDTO>>("Notification sent Successfully",200,eligibleNotifications);
		}else {
			res = new ResBody<List<NotificationDTO>>("NotificationInfo Not Found",200,null);
			}}catch(Exception e) {
		res = new ResBody<List<NotificationDTO>>(e.getMessage(),500,null);
	}
		return res;
		}
				

	
	public ResBody<List<NotificationDTO>> sendNotificationToAdmin() {
		ResBody<List<NotificationDTO>> r = new ResBody<List<NotificationDTO>>();
		List<NotificationDTO> list = new ArrayList<>();
		try {
			List<NotificationEntity> entity = repository.findAll();
			List<NotificationDTO> dto = new ObjectMapper().convertValue(entity, new TypeReference<List<NotificationDTO>>() {});
			for(NotificationDTO d : dto){
				d.getData().setCustomerDeviceId(null);}			
			if(dto != null) {
			for(NotificationDTO n : dto) {												
				if(n.getData().getStatus().equalsIgnoreCase("Pending") && timeDifference(n.getTime())) {					
					list.add(n);}}}
		    if( list != null && ! list.isEmpty()) {
		    	r = new ResBody<List<NotificationDTO>>("Notifications Are sent to the admin",200,list);
		    }else {
		    r = new ResBody<List<NotificationDTO>>("Notifications Are Not Found",404,null); }  
		}catch(Exception e) {
			r = new ResBody<List<NotificationDTO>>(e.getMessage(),500,null);
		}
		return r;	
	}
	
	
	
	 private boolean timeDifference(String time1) {			
		   try {
		       LocalTime currentTime = LocalTime.now();
		       String time2 = String.valueOf(currentTime);

		       // to parse time in the format HH:MM:SS
		       SimpleDateFormat simpleDateFormat
		           = new SimpleDateFormat("HH:mm");

		       // Parsing the Time Period
		       Date date1 = simpleDateFormat.parse(time1);
		       Date date2 = simpleDateFormat.parse(time2);

		       // Calculating the difference in milliseconds
		       long differenceInMilliSeconds
		           = Math.abs(date2.getTime() - date1.getTime());     
		       
		       // Calculating the difference in Minutes
		       long differenceInMinutes
		           = (differenceInMilliSeconds / (60 * 1000)) % 60;
		      
		       if(differenceInMinutes!=0.0) {
		    	   if(differenceInMinutes >=1) {
		    		   return true;
		    	   }else {
		    		   return false;
		    	   }}else{return false;}
		   }catch(ParseException e) {
			   return false;}
		   }
	
	

	public ResBody<NotificationDTO> notificationResponse(NotificationResponse notificationResponse){
		try {
			ResponseEntity<ResponseStructure<BookingResponse>> res =  bookServiceFeign.getBookedService(notificationResponse.getAppointmentId());
			BookingResponse b = res.getBody().getData();
			if(b.getDoctorId().equalsIgnoreCase(notificationResponse.getDoctorId())&&b.getClinicId().
			equalsIgnoreCase(notificationResponse.getHospitalId())&&b.getBookingId().equalsIgnoreCase(notificationResponse.getAppointmentId())
			&&b.getSubServiceId().equalsIgnoreCase(notificationResponse.getSubServiceId())) {	
				switch(notificationResponse.getStatus()) {
				case "Accepted": b.setStatus("Confirmed");
				cllinicFeign.updateDoctorSlotWhileBooking(b.getDoctorId(),b.getServiceDate() ,b.getServicetime());
				NotificationEntity notificationEntity = repository.findById(notificationResponse.getNotificationId()).orElseThrow(()->
				new RuntimeException("Notification Not Found With Given Id"));
				if(notificationEntity!=null) {
				notificationEntity.getData().setStatus("Confirmed");
				repository.save(notificationEntity);
				if(b.getCustomerDeviceId() != null) {
				appNotification.sendPushAppNotification(b.getCustomerDeviceId()," Hello "+b.getName(),b.
				getDoctorName()+" Accepted Your Appointment For "+b.getSubServiceName()+ " on "+b.getServiceDate()+" at "+b.getServicetime());}
				}else {
					return new ResBody<NotificationDTO>("Notification Not Found With Given Id",404,null);
				}
				break;
				
				case "Rejected": b.setStatus("Rejected");
				 b.setReasonForCancel(notificationResponse.getReasonForCancel());
				 cllinicFeign.makingFalseDoctorSlot(b.getDoctorId(),b.getServiceDate() ,b.getServicetime());
				 Optional<NotificationEntity> obj = repository.findById(notificationResponse.getNotificationId());
				 if(obj.get()!=null) {
					NotificationEntity c = obj.get();
					c.getData().setStatus("Rejected");
					repository.save(c);}
				 if(b.getCustomerDeviceId() != null) {
				 appNotification.sendPushAppNotification(b.getCustomerDeviceId()," Hello "+b.getName(),b.
				 getDoctorName()+" Rejected Your Appointment For "+b.getSubServiceName()+ " on "+b.getServiceDate()+" at "+b.getServicetime());}
				 else {
						return new ResBody<NotificationDTO>("Notification Not Found With Given Id",404,null);
					}
				break;
				
				default:b.setStatus("Pending");
				}	
				removeCompletedNotifications();
		    	ResponseEntity<?> book = bookServiceFeign.updateAppointment(b);
		    	if(book != null) {
		    		return new ResBody<NotificationDTO>("Appointment Status updated",200,null);
		    	}else {
		    	return new ResBody<NotificationDTO>("Appointment Status Not updated",404,null);}
		    	}else {
		    	return new ResBody<NotificationDTO>("Appointment Not updated",404,null);
		    }						
		}catch(FeignException e) {
			return new ResBody<NotificationDTO>(ExtractFeignMessage.clearMessage(e),500,null);
		}}
	
	
	
	private void removeCompletedNotifications() {
   	List<NotificationEntity> entity = repository.findAll();
   	if(entity!=null && !entity.isEmpty()) {
   		for(NotificationEntity e : entity) {
   			if(e.getData().getStatus().equals("Completed")) {
   				if(bookings.contains(e.getId())) {
   					bookings.remove(e.getId());}
   			repository.delete(e);	    			
   		}}}}

	
	
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
	public ResponseEntity<ResBody<List<NotificationToCustomer>>> notificationToCustomer( String customerName,
			 String customerMobileNumber){
		ResBody<List<NotificationToCustomer>> res = new ResBody<List<NotificationToCustomer>>();
		List<NotificationToCustomer> eligibleNotifications = new ArrayList<>();
		try {
		List<NotificationEntity> entity = repository.findByDataNameAndDataMobileNumber(customerName,customerMobileNumber );
		List<NotificationDTO> dto = new ObjectMapper().convertValue(entity, new TypeReference<List<NotificationDTO>>() {});
		if(dto != null) {
		for(NotificationDTO n : dto) {					
			if(n.getData().getStatus().equalsIgnoreCase("Confirmed")) {
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
			res = new ResBody<List<NotificationToCustomer>>("NotificationInfo Not Found",404,null);
			}}catch(FeignException e) {
		res = new ResBody<List<NotificationToCustomer>>(e.getMessage(),500,null);
	}
		return ResponseEntity.status(res.getStatus()).body(res);
		}	
		
}
