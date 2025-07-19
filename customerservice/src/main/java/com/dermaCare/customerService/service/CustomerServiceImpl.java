package com.dermaCare.customerService.service;

import org.springframework.http.HttpStatus;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import com.dermaCare.customerService.dto.BookingRequset;
import com.dermaCare.customerService.dto.BookingResponse;
import com.dermaCare.customerService.dto.CategoryDto;
import com.dermaCare.customerService.dto.ClinicAndDoctorsResponse;
import com.dermaCare.customerService.dto.ClinicDTO;
import com.dermaCare.customerService.dto.ConsultationDTO;
import com.dermaCare.customerService.dto.CustomerDTO;
import com.dermaCare.customerService.dto.CustomerRatingDomain;
import com.dermaCare.customerService.dto.DoctorsDTO;
import com.dermaCare.customerService.dto.FavouriteDoctorsDTO;
import com.dermaCare.customerService.dto.LoginDTO;
import com.dermaCare.customerService.dto.NotificationToCustomer;
import com.dermaCare.customerService.dto.ServicesDto;
import com.dermaCare.customerService.dto.SubServicesDetailsDto;
import com.dermaCare.customerService.dto.SubServicesDto;
import com.dermaCare.customerService.entity.ConsultationEntity;
import com.dermaCare.customerService.entity.Customer;
import com.dermaCare.customerService.entity.CustomerRating;
import com.dermaCare.customerService.entity.FavouriteDoctorsEntity;
import com.dermaCare.customerService.feignClient.AdminFeign;
import com.dermaCare.customerService.feignClient.BookingFeign;
import com.dermaCare.customerService.feignClient.CategoryServicesFeign;
import com.dermaCare.customerService.feignClient.ClinicAdminFeign;
import com.dermaCare.customerService.feignClient.NotificationFeign;
import com.dermaCare.customerService.repository.ConsultationRep;
import com.dermaCare.customerService.repository.CustomerFavouriteDoctors;
import com.dermaCare.customerService.repository.CustomerRatingRepository;
import com.dermaCare.customerService.repository.CustomerRepository;
import com.dermaCare.customerService.util.ExtractFeignMessage;
import com.dermaCare.customerService.util.HelperForConversion;
import com.dermaCare.customerService.util.ResBody;
import com.dermaCare.customerService.util.Response;
import com.dermaCare.customerService.util.ResponseStructure;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import feign.FeignException;



@Service
public class CustomerServiceImpl implements CustomerService {

    @Autowired
    public CustomerRepository customerRepository;

    @Autowired 
    private CustomerRatingRepository customerRatingRepository; 
    
    @Autowired
	private ConsultationRep consultationRep;
    
    @Autowired
    private BookingFeign bookingFeign;
    
    @Autowired
    private ClinicAdminFeign clinicAdminFeign;
    
    @Autowired
    private  CustomerFavouriteDoctors customerFavouriteDoctors;
    
    @Autowired 
    private CategoryServicesFeign categoryServicesFeign;
    
    @Autowired 
    private AdminFeign adminFeign;
    
    @Autowired
    private FirebaseMessagingService firebaseMessagingService;
    
    @Autowired
    private NotificationFeign notificationFeign;
    
    
    private Map<String, String> generatedOtps = new HashMap<>();
    private Map<String, Long> session = new HashMap<>();
    private static final long OTP_EXPIRY_MILLIS = 1 * 60 * 1000;
   

   @Override
    public ResponseEntity<Response> verifyUserCredentialsAndGenerateAndSendOtp(LoginDTO loginDTO) {
	   Response response = new Response();
     try {
    	 if(!isIndianMobileNumber(loginDTO.getMobileNumber())) {
    		 response.setMessage("Please Enter Valid MobileNumber");
 	    	response.setStatus(400);
 	    	response.setSuccess(false);}
   	    Optional<Customer> custmer = customerRepository.findByMobileNumber(loginDTO.getMobileNumber());
	    if(custmer.isPresent()) {
	    	custmer.get().setDeviceId(loginDTO.getDeviceId());
	    	customerRepository.save(custmer.get());}
	    	String otp = randomNumber();
	    	if(loginDTO.getDeviceId() != null) {
	    		firebaseMessagingService.sendPushNotification(
	    			    loginDTO.getDeviceId(),
	    			    "🔐 Hello,Here’s your OTP!",
	    			    "Use " + otp + " to verify your login. Expires in 1 minute.",
	    			    "OTP",
	    			    "OTPVerificationScreen",
	    			    "default"
	    			);
	    	generatedOtps.put(loginDTO.getMobileNumber(),otp);
	    	session.put(loginDTO.getMobileNumber(),System.currentTimeMillis());
	    	response.setMessage("OTP Sent Successfully");
	    	response.setStatus(200);
	    	response.setSuccess(true);}
	    	else {
	    		response.setMessage("Please Provide DeviceId");
		    	response.setStatus(400);
		    	response.setSuccess(false);}
	    }catch(Exception e) {
	    	response.setMessage(e.getMessage());
	    	response.setStatus(500);
	    	response.setSuccess(false);}
     return ResponseEntity.status(response.getStatus()).body(response);
}
   
   
     
    private boolean isIndianMobileNumber(String mobileNumber) {
        mobileNumber = mobileNumber.replaceAll("[\\s\\-()]", "");
        String regex = "^(\\+91|91|0)?[6-9]\\d{9}$";
        return mobileNumber.matches(regex);
    }
 
     private String randomNumber() {
         Random random = new Random();    
         int sixDigitNumber = 100000 + random.nextInt(900000); // Generates number from 100000 to 999999
         return String.valueOf(sixDigitNumber);
     }
     
     
    
   public ResponseEntity<Response> verifyOtp(LoginDTO loginDTO){
	   Response response = new Response();
	   try {
		   String otp = generatedOtps.get(loginDTO.getMobileNumber());
		   long createdTime = session.get(loginDTO.getMobileNumber());
		   if(!isExpired(createdTime)) {
			   if(loginDTO.getOtp().equals(otp)) {
			   response.setMessage("OTP Successfully Verified");
			   response.setStatus(200);
				response.setSuccess(true);
			   return ResponseEntity.status(response.getStatus()).body(response);
			   }else {
				   response.setMessage("Invalid OTP Please Enter Correct OTP");
				   response.setStatus(400);
				   return ResponseEntity.status(response.getStatus()).body(response);}
		   }else {
			   response.setMessage("OTP Expired Please Click On Resend OTP");
			   response.setStatus(410);
			   return ResponseEntity.status(response.getStatus()).body(response);
		   }}catch(Exception e) {
			   response.setMessage(e.getMessage());
			   response.setStatus(500);
			   return ResponseEntity.status(response.getStatus()).body(response);}
  }

   
   private boolean isExpired(long createdAt) {
       return System.currentTimeMillis() - createdAt > OTP_EXPIRY_MILLIS;
   }
   
 
   
   public  ResponseEntity<Response> resendOtp(LoginDTO loginDTO){
	   Response response = new Response();
	   try {
		   if(!isIndianMobileNumber(loginDTO.getMobileNumber())) {
	    		response.setMessage("Please Enter Valid MobileNumber");
	 	    	response.setStatus(400);
	 	    	response.setSuccess(false);
	 	    	return ResponseEntity.status(response.getStatus()).body(response);}		   
		    String otp = randomNumber();
		    if(loginDTO.getDeviceId() != null) {
		    	firebaseMessagingService.sendPushNotification(
	    			    loginDTO.getDeviceId(),
	    			    "🔐 Hello,Here’s your ResendOTP!",
	    			    "Use " + otp + " to verify your login. Expires in 1 minute.",
	    			    "OTP",
	    			    "OTPVerificationScreen",
	    			    "default"
	    			);
	    	generatedOtps.put(loginDTO.getMobileNumber(),otp);
	    	session.put(loginDTO.getMobileNumber(),System.currentTimeMillis());
	    	response.setMessage("OTP Sent Successfully");
			response.setStatus(200);
			response.setSuccess(true);
	    	}else{
		    	response.setMessage("Please Provide DeviceId");
				response.setStatus(400);}
	        }catch(Exception e) {
		    response.setMessage(e.getMessage());
		    response.setStatus(500);}
	        return ResponseEntity.status(response.getStatus()).body(response);
   }
   
   

   public Response saveCustomerBasicDetails(CustomerDTO customerDTO) {
	   Response  response =  new Response();
	   try {
	   if(customerDTO != null) {
		Optional<Customer> cstmr = customerRepository.findByMobileNumber(customerDTO.getMobileNumber());
		Optional<Customer> cstmrEmail = customerRepository.findByEmailId(customerDTO.getEmailId());
		   if(cstmr.isPresent()) {
			   response.setMessage("MobileNumber Already Exist");
			   response.setStatus(409);
			   response.setSuccess(false);
			   return response;}
		   
		   if(cstmrEmail.isPresent()) {
			   response.setMessage("EmailId Already Exist");
			   response.setStatus(409);
			   response.setSuccess(false);
			   return response;}
		   	   
		   if(!isValidDate(customerDTO.getDateOfBirth())) {
			   response.setMessage("DateOfBirth Should Be In DD-MM-YYYY Format");
			   response.setStatus(400);
			   response.setSuccess(false);
			   return response;}
	   }
		   Customer customer = HelperForConversion.convertToEntity(customerDTO);
		   customer.setCustomerId(generateCustomerId());
		   Customer cusmr = customerRepository.save(customer);
		   if(cusmr != null) {
			   CustomerDTO ctmrDTO = HelperForConversion.convertToDTO(customer);
			   response.setData(ctmrDTO);
			   response.setMessage("Details saved successfullly");
			   response.setStatus(200);
			   response.setSuccess(true);
			   return response;
		   }
		   else {
			   response.setMessage("Unable to save details");
			   response.setStatus(404);
			   response.setSuccess(false);
			   return response;
		   }}catch(Exception e) {
			   response.setMessage(e.getMessage());
			   response.setStatus(500);
			   response.setSuccess(false);
			  }
	   return response;
	   }
   
   public boolean isValidDate(String date) {
       boolean check;
       String date1 = "^(0?[1-9]|[12][0-9]|3[01])-(0?[1-9]|1[012])-([12][0-9]{3})$";
       check = date.matches(date1);
       return check;
   }
   
   
   public String generateCustomerId() {
	    // Fetch the last customer document ordered by ID in descending order
	    Customer lastCustomer = customerRepository.findFirstByOrderByIdDesc();

	    // If no customer exists in the database, return the first customer ID "CR_1"
	    if (lastCustomer == null) {
	        return "CR_1";
	    }
	    // Get the last customer ID
	    String lastCustomerId = lastCustomer.getCustomerId();

	    // Define the regex pattern to match "CR_" followed by a number (e.g., CR_123)
	    Pattern pattern = Pattern.compile("CR_(\\d+)");
	    Matcher matcher = pattern.matcher(lastCustomerId);

	    // If the last ID is in the expected format (CR_1, CR_2, etc.)
	    if (matcher.matches()) {
	        // Extract the numeric part
	        int currentNumber = Integer.parseInt(matcher.group(1));

	        // Generate the next number
	        int nextNumber = currentNumber + 1;

	        // Return the new ID
	        return "CR_" + nextNumber;
	    } else {
	        // If the ID format is invalid, start from CR_1
	        return "CR_1";
	    }
	}

   
   public Response getCustomerByMobileNumber(String mblnumber) {
	   Response  response =  new Response();
	   try {
		   Optional<Customer> cusmr = customerRepository.findByMobileNumber(mblnumber);
		   if(cusmr.isPresent()) {
			   Customer c = cusmr.get();
			   CustomerDTO ctmrDTO = HelperForConversion.convertToDTO(c);
			   response.setData(ctmrDTO);
			   response.setMessage("Details Fetched Successfullly");
			   response.setStatus(200);
			   response.setSuccess(true);
			   return response;
		   }
		   else {
			   response.setMessage("No Customer Found With Given MobileNumber");
			   response.setStatus(200);
			   response.setSuccess(true);
			   return response;
		   }}catch(Exception e) {
			   response.setMessage(e.getMessage());
			   response.setStatus(500);
			   response.setSuccess(false);
			   return response;
			  }
	  }
	   
	
  public Response getAllCustomers() {
	 Response  response =  new Response();
	   try {
		   List<Customer> cusmr = customerRepository.findAll();
		   List< CustomerDTO> dto = new ArrayList<>();
		   if(cusmr != null && !cusmr.isEmpty()) {
			   for(Customer c : cusmr) {
			   CustomerDTO ctmrDTO = HelperForConversion.convertToDTO(c);
			   dto.add(ctmrDTO);}
			   response.setData(dto);
			   response.setMessage("details fetched successfullly");
			   response.setStatus(200);
			   response.setSuccess(true);
			   return response; }
		   else {
			   response.setMessage("details not fetched successfullly");
			   response.setStatus(200);
			   response.setSuccess(true);
			   return response;
		   } }catch(Exception e) {
			   response.setMessage(e.getMessage());
			   response.setStatus(500);
			   response.setSuccess(false);
			   return response;
			  }
	  }

    
public Response updateCustomerBasicDetails( CustomerDTO customerDTO ,String mobileNumber) {
	   Response  response =  new Response();
	   try {
		   Optional<Customer> cusmr = customerRepository.findByMobileNumber(mobileNumber);
		   if(cusmr.isPresent()) {
			   Customer c = cusmr.get();
			   c.setDateOfBirth(customerDTO.getDateOfBirth());
			   c.setEmailId(customerDTO.getEmailId());
			   c.setFullName(customerDTO.getFullName());
			   c.setGender(customerDTO.getGender());
			   c.setMobileNumber(customerDTO.getMobileNumber());
			   Customer obj = customerRepository.save(c);
			   if(obj != null) {
			   CustomerDTO ctmrDTO = HelperForConversion.convertToDTO(obj);
			   response.setData(ctmrDTO);
			   response.setMessage("details updated successfullly");
			   response.setStatus(200);
			   response.setSuccess(true);
			   return response;
		   }}
		   else {
			   response.setMessage("customer not found with given mobileNumber");
			   response.setStatus(404);
			   response.setSuccess(false);
			   return response;
		   }}catch(Exception e) {
			   response.setMessage(e.getMessage());
			   response.setStatus(500);
			   response.setSuccess(false);
			  }
	   return response;
	   }
	   
   
   public Response deleteCustomerByMobileNumber(String mobileNumber) {
	   Response  response =  new Response();
	   try {
		   Optional<Customer> c = customerRepository.findByMobileNumber(mobileNumber);
		   if(c.isPresent()){
		   Customer obj = customerRepository.deleteByMobileNumber(mobileNumber);
		   if(obj != null) {
		   response.setData(null);
		   response.setMessage("data deleted successfullly");
		   response.setStatus(200);
		   response.setSuccess(true);
		   return response;
	   }else{
		   response.setMessage("No customer found with given mobileNumber");
		   response.setStatus(404);
		   response.setSuccess(false);
		   return response;
		   }  
	   }else{
			   response.setMessage("No customer found with given mobileNumber");
			   response.setStatus(404);
			   response.setSuccess(false);
			   return response;
	   }}catch(Exception e) {
		   response.setMessage(e.getMessage());
		   response.setStatus(500);
		   response.setSuccess(false);
		  }
   return response;
   }
   
	   
	@Override
	public CustomerDTO getCustomerDetailsByMobileNumber(String mobileNumber) {

	    // Retrieve customer from repository
	    Optional<Customer> customerOptional = customerRepository.findByMobileNumber(mobileNumber);

	    // Check if customer is present, return null or handle accordingly if not found
	    if (customerOptional.isEmpty()) {
	        System.out.println("Customer not found for mobile number: " + mobileNumber);
	        return null; // Or throw a custom exception based on your requirement
	    }

	    Customer customerObject = customerOptional.get();
	    // Create and return CustomerDTO with null-safe handling
	    CustomerDTO customerDTO = new CustomerDTO(Optional.ofNullable(customerObject.getCustomerId()).orElse(null),  
	            Optional.ofNullable(customerObject.getFullName()).orElse(null),           // Full name
	            String.valueOf(customerObject.getMobileNumber()), null,                      // Mobile number
	            Optional.ofNullable(customerObject.getGender()).orElse(null),            // Gender         // Age
	            Optional.ofNullable(customerObject.getEmailId()).orElse(null),           // Email ID
	             null,
	             Optional.ofNullable(customerObject.getDateOfBirth()).orElse(null)
	    );

	    return customerDTO;
	}


	@Override
	public CustomerDTO getCustomerDetailsByEmail(String email) {

	    // Retrieve customer from repository
	    Optional<Customer> customerOptional = customerRepository.findByEmailId(email);

	    // Check if customer is present, return null or handle accordingly if not found
	    if (customerOptional.isEmpty()) {
	        System.out.println("Customer not found for email: " + email);
	        return null; // Or throw a custom exception if preferred
	    }

	    Customer customerObject = customerOptional.get();
	    // Create and return CustomerDTO with null-safe handling
	    CustomerDTO customerDTO = new CustomerDTO(Optional.ofNullable(customerObject.getCustomerId()).orElse(null), 
	            Optional.ofNullable(customerObject.getFullName()).orElse(null),           // Full name
	            String.valueOf(customerObject.getMobileNumber()), null,                      // Mobile number
	            Optional.ofNullable(customerObject.getGender()).orElse(null),            // Gender         // Age
	            Optional.ofNullable(customerObject.getEmailId()).orElse(null),           // Email ID
	             null,
	             Optional.ofNullable(customerObject.getDateOfBirth()).orElse(null)
	    );

	    return customerDTO;
	}

	@Override
	public List<CustomerDTO> getCustomerByfullName(String fullName) {
	    // Retrieve customers by full name
	    List<Customer> customers = customerRepository.findByfullName(fullName);
	    List<CustomerDTO> customerDTOs = new ArrayList<>();

	    // Process each customer
	    for (Customer customerObject : customers) {
	   // Create CustomerDTO with null-safe handling
	        CustomerDTO customerDTO = new CustomerDTO(Optional.ofNullable(customerObject.getCustomerId()).orElse(null),
	                Optional.ofNullable(customerObject.getFullName()).orElse(null),           // Full name
	                String.valueOf(customerObject.getMobileNumber()), null,                       // Mobile number
	                Optional.ofNullable(customerObject.getGender()).orElse(null),            // Gender
	                Optional.ofNullable(customerObject.getEmailId()).orElse(null), 
	                null,
	                Optional.ofNullable(customerObject.getDateOfBirth()).orElse(null));

	        customerDTOs.add(customerDTO);
	    }

	    return customerDTOs;
	}

	
	//consultation
	
	 public Response saveConsultation(ConsultationDTO dto) {
		 Response response = new  Response();
		 ConsultationEntity consultation = new  ConsultationEntity();
		 try{
	     consultation.setConsultationType(dto.getConsultationType());
		 consultation.setConsultationId(dto.getConsultationId());
		 ConsultationEntity consultationEntity = consultationRep.save( consultation);
		 if(consultationEntity != null ) {
	     ConsultationDTO dtoObj = new  ConsultationDTO();
		 dtoObj.setConsultationType(consultationEntity.getConsultationType());
		 dtoObj.setConsultationId(consultationEntity.getConsultationId());
		 response.setData( dtoObj);
			response.setStatus(200);
			response.setMessage("saved consultation successfully");
			response.setSuccess(true);
			return response;
	    }else {
			response.setStatus(404);
			response.setMessage("unable to save consultation");
			response.setSuccess(false);
			return response;
	    }}catch(Exception e) {
			response.setStatus(500);
			response.setMessage(e.getMessage());
			response.setSuccess(false);
			return response;
	    }
	 }
	 
	 
            public Response getAllConsultations() {
	    	 Response response = new  Response();
	    	List<ConsultationDTO> dto = new ArrayList<>();
	    	try {
	    		 List<ConsultationEntity> list = consultationRep.findAll();
	        if(!list.isEmpty()) {
	        	dto = list.stream().map(n->{ConsultationDTO consultationDTO = new ConsultationDTO();
	        			consultationDTO.setConsultationType(n.getConsultationType());
	        			consultationDTO.setConsultationId(n.getConsultationId());
	        			return consultationDTO;
	        	}).collect(Collectors.toList());
				response.setStatus(200);
				response.setData(dto);
				response.setMessage("retrieved consultations successfully");
				response.setSuccess(true);
				return response;
	        }else {
				response.setStatus(200);
				response.setMessage("consultations not found");
				response.setSuccess(true);
				return response;
	        }}catch(Exception e) {
				response.setStatus(500);
				response.setMessage(e.getMessage());
				response.setSuccess(false);
				return response;
	        }
	    }
	
	    
	    // USER SELECT FAVOURITE DOCTOR
	    
public Response getDoctors(String cid, String serviceId) {
	Response response = new Response();
    	try {
    		ResponseEntity<Response> res = clinicAdminFeign.getDoctorByService(cid, serviceId);
		if(res.getBody() != null ){
			response.setData(res.getBody());
			response.setStatus(200);
			response.setMessage("fetched doctors successfully");
			response.setSuccess(true);
			return response;
		}
		else {
			response.setStatus(200);
			response.setMessage("No doctors found");
			response.setSuccess(true);
			return response;
			}
	}catch(FeignException e) {
		response.setStatus(e.status());
		response.setMessage(ExtractFeignMessage.clearMessage(e));
		response.setSuccess(false);
		return response;
	}
   }
	    
   
public ResponseEntity<Response> saveFavouriteDoctors(FavouriteDoctorsDTO favouriteDoctorsDTO){
	 Response response = new  Response();
    	try {
    		FavouriteDoctorsEntity favouriteDoctorsEntity = new FavouriteDoctorsEntity();
    		favouriteDoctorsEntity.setDoctorId(favouriteDoctorsDTO.getDoctorId());
    		favouriteDoctorsEntity.setHospitalId(favouriteDoctorsDTO.getHospitalId());
    		favouriteDoctorsEntity.setFavourite(true);
    		FavouriteDoctorsEntity f = customerFavouriteDoctors.save(favouriteDoctorsEntity);
		if(f != null) {
			response.setData(f);
			response.setStatus(200);
			response.setMessage("saved favourite doctor successfully");
			response.setSuccess(true);
			return ResponseEntity.status(200).body(response);
		}
		else {
			response.setStatus(404);
			response.setMessage("Unable to Save Favourite Doctor");
			response.setSuccess(false);
			return ResponseEntity.status(404).body(response);
		}
	}catch(Exception e) {
		response.setStatus(500);
		response.setMessage(e.getMessage());
		response.setSuccess(false);
		return ResponseEntity.status(500).body(response);
	}
    }
	

public Response getAllSavedFavouriteDoctors(){
	 Response response = new  Response();
	 List<FavouriteDoctorsDTO> dto = new ArrayList<>();
   	try {
   		List<FavouriteDoctorsEntity> list = customerFavouriteDoctors.findAll();
		if(list != null) {
			for(FavouriteDoctorsEntity f : list) {
				FavouriteDoctorsDTO favouriteDoctors = new FavouriteDoctorsDTO();
	    		favouriteDoctors.setDoctorId(f.getDoctorId());
	    		favouriteDoctors.setHospitalId(f.getHospitalId());
	    		favouriteDoctors.setFavourite(f.isFavourite());
				dto.add(favouriteDoctors);}
			response.setData(dto);
			response.setStatus(200);
			response.setMessage("saved favourite doctor successfully");
			response.setSuccess(true);
			return response;}
		else {
			response.setStatus(200);
			response.setMessage("Unable to Save Favourite Doctor");
			response.setSuccess(true);
			return response;}
	}catch(Exception e) {
		response.setStatus(500);
		response.setMessage(e.getMessage());
		response.setSuccess(false);
		return response;
	}}
	

public Response getDoctorsSlots(String hospitalId,String doctorId) {
	Response response = new Response();
    	try {
    	ResponseEntity<Response> res = clinicAdminFeign.getDoctorSlot( hospitalId,doctorId);
		return res.getBody();
	}catch(FeignException e) {
		response.setStatus(e.status());
		response.setMessage(ExtractFeignMessage.clearMessage(e));
		response.setSuccess(false);
		return response;
	}}


// BOOKING MANAGEMENT
	    
	   public Response bookService(BookingRequset req) throws JsonProcessingException {
		   Response response = new  Response();
	    	try {
	    		  ResponseEntity<ResponseStructure<BookingResponse>> res = bookingFeign.bookService(req);
	    		  BookingResponse bookingResponse  = res.getBody().getData(); 
	    		  if(bookingResponse!=null) {
	    		  clinicAdminFeign.updateDoctorSlotWhileBooking(bookingResponse.getDoctorId(), 
	    		  bookingResponse.getServiceDate(),bookingResponse.getServicetime());
    			     response.setData(res.getBody());			
		    		 response.setStatus(res.getBody().getStatusCode());	 
	    		  }else{
	    			response.setStatus(res.getBody().getHttpStatus().value());
	    			response.setData(res.getBody());}  
	    		}catch(FeignException e) {
	    		response.setStatus(e.status());
	    		response.setMessage(e.getMessage());
	    		response.setSuccess(false);	
	    	}
	    	return response;
	    }

	   
	   
	    public Response deleteBookedService(String id){
	    	 Response response = new  Response();
	    	try {
	    		 ResponseEntity<ResponseStructure<BookingResponse>> res = bookingFeign.deleteBookedService(id);
	    		 ResponseStructure<BookingResponse> bookingResponse = res.getBody();
	    		if( bookingResponse != null ) {
	    			response.setData(res.getBody());
	    			response.setStatus(res.getBody().getStatusCode());
	    			return response;
	    		}
	    		else {
	    			response.setStatus(404);
	    			response.setMessage("Unable To Delete Bookedservice");
	    			response.setSuccess(false);
	    			return response;
	    		}
	    	}catch(FeignException e) {
	    		response.setStatus(e.status());
	    		response.setMessage(ExtractFeignMessage.clearMessage(e));
	    		response.setSuccess(false);
	    		return response;
	    	}
	    	
	    }
	    

	 public Response getBookedService(String id){
	    	 Response response = new  Response();
	    	try {
	    		 ResponseEntity<ResponseStructure<BookingResponse>> res = bookingFeign.getBookedService(id);
	    		 ResponseStructure<BookingResponse> bookingResponse = res.getBody();
	    		  if(bookingResponse != null) {
	    			response.setData(res.getBody());
	    			response.setStatus(res.getBody().getStatusCode());	    			
	    			return response;
	    		}
	    		else {
	    			response.setStatus(200);
	    			response.setMessage("Unable Get Bookings");
	    			response.setSuccess(true);
	    			return response;
	    		}
	    	}catch(FeignException e) {
	    		response.setStatus(e.status());
	    		response.setMessage(ExtractFeignMessage.clearMessage(e));
	    		response.setSuccess(false);
	    		return response;
	    	}
	    }

	 
	    public Response getCustomerBookedServices(String mobileNumber){
	    	Response response = new  Response();
	    	try {
	    		ResponseEntity<ResponseStructure<List<BookingResponse>>> res = bookingFeign.getCustomerBookedServices(mobileNumber);
	    		ResponseStructure<List<BookingResponse>> respnse = res.getBody();
	    		   if(respnse != null) {
	    			response.setData(respnse);
	    			response.setStatus(res.getBody().getStatusCode());	    			
	    			return response;
	    		}
	    		else {
	    			response.setStatus(200);
	    			response.setMessage("Bookedservices Not Found ");
	    			response.setSuccess(true);
	    			return response;
	    		}
	    	}catch(FeignException e) {
	    		response.setStatus(e.status());
	    		response.setMessage(ExtractFeignMessage.clearMessage(e));
	    		response.setSuccess(false);
	    		return response;
	    	}
	    	
	    }
	    
	    public ResponseStructure<List<BookingResponse>> getAllBookedServices() {
	    	try {
	        ResponseEntity<ResponseStructure<List<BookingResponse>>> responseEntity =
	        		bookingFeign.getAllBookedService();
	        ResponseStructure<List<BookingResponse>> res = responseEntity.getBody();
	        if(res.getData()!=null && !res.getData().isEmpty() ) {
	        	return new ResponseStructure<List<BookingResponse>>(res.getData(),res.getMessage(),res.getHttpStatus(),res.getStatusCode());
	        }
	        else {
	        	return new ResponseStructure<List<BookingResponse>>(null,"Bookings Not Found",res.getHttpStatus(),res.getStatusCode());
	        }
	    	}catch(FeignException e) {
	    	return new ResponseStructure<List<BookingResponse>>(null,ExtractFeignMessage.clearMessage(e),HttpStatus.INTERNAL_SERVER_ERROR,e.status());
	    }}

	    
	    public Response getBookingByDoctorId(String doctorId) {
	        Response response = new Response();
	        try {
	         ResponseEntity<ResponseStructure<List<BookingResponse>>> res = bookingFeign.getBookingByDoctorId(doctorId);
	            		 
                        if (res.getBody() != null ) {
	                    response.setData(res.getBody());
	                    response.setStatus(res.getBody().getStatusCode());	                    
	                } else {                  
	                    response.setStatus(200);
	                    response.setMessage("No Bookedservices Found For This DoctorId");
	                    response.setSuccess(true);
	                }
	        } catch(FeignException e) {
	    		response.setStatus(e.status());
	    		response.setMessage(ExtractFeignMessage.clearMessage(e));
	    		response.setSuccess(false);
	    		return response;
	        }

	        return response;
	    }

	   
	    public Response getBookingByServiceId(String serviceId){
	    	Response response = new  Response();
	    	try {
	    		ResponseEntity<ResponseStructure<List<BookingResponse>>> res = bookingFeign.getBookingByServiceId(serviceId);	   
                    if(res.getBody() != null ) {
	    			response.setStatus(res.getBody().getStatusCode());	    			
	    			response.setData(res.getBody());
	    			return response;}
	    		else {
	    			response.setStatus(200);
	    			response.setMessage("Bookedservices Not Found");
	    			response.setSuccess(true);
	    			return response;
	    		}
            }catch(FeignException e) {
        		response.setStatus(e.status());
        		response.setMessage(ExtractFeignMessage.clearMessage(e));
        		response.setSuccess(false);
        		return response;
	    	}
	    }
	   
	   @Override 
	    public Response getBookingByClinicId(String clinicId){
	    	Response response = new  Response();
	    	try {
	    		ResponseEntity<ResponseStructure<List<BookingResponse>>> res = bookingFeign.getBookingByClinicId(clinicId);
	    
                    if (res.getBody() != null ) {
	    			response.setStatus(res.getBody().getStatusCode());	    			
	    			response.setData(res.getBody());
	    			return response;
	    		}
	    		else {
	    			response.setStatus(200);
	    			response.setMessage("Bookedservices Not Found");
	    			response.setSuccess(true);
	    			return response;
	    		}
            }catch(FeignException e) {
        		response.setStatus(e.status());
        		response.setMessage(ExtractFeignMessage.clearMessage(e));
        		response.setSuccess(false);
        		return response;
	    	}
	    }
	    

	    //RATING MANAGEMENT
	    
	   public Response submitCustomerRating(CustomerRatingDomain ratingRequest) {
			 Response response = new Response();
			 ZonedDateTime istTime = ZonedDateTime.now(ZoneId.of("Asia/Kolkata"));
			    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a");
			    String formattedTime = istTime.format(formatter);
		    	try {
		        CustomerRating customerRating = new CustomerRating(
		        	null,ratingRequest.getDoctorRating(),ratingRequest.getHospitalRating(),ratingRequest.getFeedback(),ratingRequest.getHospitalId(),ratingRequest.getDoctorId(),
		        	ratingRequest.getCustomerMobileNumber(),ratingRequest.getAppointmentId(),true,formattedTime
		        );
		        customerRatingRepository.save(customerRating);
		        updateAvgRatingInClinicAndDoctorObject(ratingRequest.getHospitalId(),ratingRequest.getDoctorId());
		        response.setStatus(200);
	            response.setMessage("Rating saved successfully");
	            response.setSuccess(true);
	            return response;
		       }catch(Exception e) {
		        	 response.setStatus(500);
		                response.setMessage(e.getMessage());
		                response.setSuccess(false);
		                return response;
		   }
		        }
	   
	   
	   public void updateAvgRatingInClinicAndDoctorObject(String clinicId,String doctorId) {
		   try {
			   List<CustomerRating> clinicRatings =  customerRatingRepository.findByHospitalId(clinicId);
			   List<CustomerRating> doctorRatings =  customerRatingRepository.findByDoctorId(doctorId); 
			   double avgClinicRating = clinicRatings.stream()
			            .mapToDouble(CustomerRating::getHospitalRating)
			            .average()
			            .orElse(0.0);

			    double avgDoctorRating = doctorRatings.stream()
			            .mapToDouble(CustomerRating::getDoctorRating)
			            .average()
			            .orElse(0.0);			    
			  Response res = adminFeign.getClinicById(clinicId);
			  ClinicDTO dto = new ObjectMapper().convertValue(res.getData(),ClinicDTO.class );
			  dto.setHospitalOverallRating(avgClinicRating);
			  adminFeign.updateClinic(clinicId, dto);
			 ResponseEntity<Response> doctorsDTO =  clinicAdminFeign.getDoctorById(doctorId);
			  DoctorsDTO dctDto = new ObjectMapper().convertValue(doctorsDTO.getBody().getData(),DoctorsDTO.class );
			  dctDto.setDoctorAverageRating(avgDoctorRating);
			  clinicAdminFeign.updateDoctorById(doctorId, dctDto);
		   }catch(FeignException e) {}
	   }

	   

	   public Response getRatingForService(String hospitalId, String doctorId) {
			Response response = new Response();
			try {
			    List<CustomerRatingDomain> listDto = new ArrayList<>();
				List<CustomerRating> ratings = customerRatingRepository.findByHospitalIdAndDoctorId(hospitalId, doctorId);
				if (ratings.isEmpty()) {
					response.setStatus(200);
					response.setMessage("Rating Not Found");
					response.setSuccess(true);
					return response;}
				for(CustomerRating rating : ratings){
				CustomerRatingDomain c = new CustomerRatingDomain(rating.getDoctorRating(), rating.getHospitalRating(),
						rating.getFeedback(), rating.getHospitalId(), rating.getDoctorId(), rating.getCustomerMobileNumber(),
						rating.getAppointmentId(), rating.isRated(),rating.getDateAndTimeAtRating());
				 listDto.add(c);}
				response.setStatus(200);
				response.setData(listDto);
				response.setMessage("Rating fetched successfully");
				response.setSuccess(true);
				return response;
			} catch (Exception e) {
				response.setStatus(500);
				response.setMessage(e.getMessage());
				response.setSuccess(false);
				return response;
			}
		}
	   
	   	   
	   
	   public Response getAverageRating(String hospitalId, String doctorId) {
			Response response = new Response();
			try {
		ResponseEntity<Response> ratings = clinicAdminFeign.getAverageRatings(hospitalId, doctorId);
				if (!ratings.hasBody()) {
					response.setStatus(200);
					response.setMessage("Rating Not Found");
					response.setSuccess(true);
					return response;}
				else {
					return ratings.getBody();}
			  }catch (FeignException e) {
				response.setStatus(e.status());
				response.setMessage(ExtractFeignMessage.clearMessage(e));
				response.setSuccess(false);
				return response;
			}
		}
	   

    //GETDOCTORSBYSUBSERVICEID

@Override
public Response getDoctorsandHospitalDetails(String hospitalId, String subServiceId)throws JsonProcessingException {
	Response response = new Response();
	try {
		Response hospitalResponse = adminFeign.getClinicById(hospitalId);
		if(hospitalResponse.getData()!= null ) {
		ResponseEntity<Response> doctorsResponse = clinicAdminFeign.getDoctorsBySubServiceId(hospitalId,subServiceId);
		 Object obj = doctorsResponse.getBody().getData();
		List<DoctorsDTO> doctors =  new ObjectMapper().convertValue(obj, new TypeReference<List<DoctorsDTO>>() {});
		if(doctors!= null && !doctors.isEmpty()) {
			ClinicDTO hospital = new ObjectMapper().convertValue(hospitalResponse.getData(), ClinicDTO.class);
			ClinicAndDoctorsResponse combinedData = new ClinicAndDoctorsResponse(hospital, doctors);
			response.setSuccess(true);
			response.setData(combinedData);
			response.setMessage("Hospital and doctors fetched successfully");
			response.setStatus(200);
		}else {		
			response.setData( doctorsResponse.getBody());;
			response.setStatus( doctorsResponse.getBody().getStatus());
		}}else{        	
			response.setData(hospitalResponse);;
			response.setStatus(hospitalResponse.getStatus());
		}}catch (FeignException e) {
		response.setSuccess(false);
		response.setMessage(ExtractFeignMessage.clearMessage(e));
		response.setStatus(500);
	}
	return response;
}


// GETHOSPITALANDDOCTORINFORMSTION

@Override
public Response getHospitalsAndDoctorsDetailsBySubServiceId(String subServiceId) {
	Response response = new Response();
	try {
		ResponseEntity<Response> doctorsResponse = clinicAdminFeign.getHospitalAndDoctorUsingSubServiceId(subServiceId);
		Response res = doctorsResponse.getBody();
		if(res!= null) {
			response.setData(res);			
			response.setStatus(res.getStatus());
		}else {
			response.setSuccess(true);
			response.setMessage("Details Not Found");
			response.setStatus(200);		
		}}catch (FeignException e) {
		response.setSuccess(false);
		response.setMessage(ExtractFeignMessage.clearMessage(e));
		response.setStatus(500);
	}
	return response;
}


///CATEGORYANDSERVICES


@Override                                
public Response getAllCategory() {
          Response response = new  Response();
 	     try {
 		 ResponseEntity<ResponseStructure<List<CategoryDto>>> res =  categoryServicesFeign.getAllCategory();
 		  if(res.hasBody()) {
 			  ResponseStructure<List<CategoryDto>> rs = res.getBody();
	    			response.setData(rs);
	    			response.setStatus(rs.getHttpStatus().value());
                 }
	    		}catch(FeignException e) {
 	            response.setStatus(e.status());
	    			response.setMessage(ExtractFeignMessage.clearMessage(e));
	    			response.setSuccess(false);
 	        }
                 return response;
 	    } 



@Override
	public Response getServiceById( String categoryId){
		 Response response = new  Response();
	    	try {
	    		 ResponseEntity<ResponseStructure<List<ServicesDto>>>  res =  categoryServicesFeign.getServiceById(categoryId);
	    		  if(res.getBody()!=null) {
	    			  ResponseStructure<List<ServicesDto>> rs = res.getBody();
		    			response.setData(rs);
		    			response.setStatus(rs.getHttpStatus().value());
	                    }
		    		}catch(FeignException e) {
	    	            response.setStatus(e.status());
		    			response.setMessage(ExtractFeignMessage.clearMessage(e));
		    			response.setSuccess(false);
	    	        }
	                    return response;
	    	    } 	 
	

@Override
	public Response getSubServicesByServiceId(String serviceId){
		Response response = new Response();
  	try {
  		ResponseEntity<Response> res = categoryServicesFeign.getSubServicesByServiceId(serviceId);
  		return res.getBody();
  	 
	    		}catch(FeignException e) {
  	            response.setStatus(500);
	    			response.setMessage(ExtractFeignMessage.clearMessage(e));
	    			response.setSuccess(false);
	    			return response;
  	        }
                  
	    	    } 	



public Response getSubServiceInfoBySubServiceId(String subServiceId) throws JsonProcessingException {
	Response responseObj = new Response();
	try {
		ResponseEntity<ResponseStructure<List<SubServicesDto>>>  res = categoryServicesFeign.getAllSubServices();
		List<SubServicesDetailsDto> hospitalAndSubServiceInfo = new ArrayList<>();
		if(res.getBody().getData() != null && !res.getBody().getData().isEmpty()) {
			for(SubServicesDto subsrvice:res.getBody().getData()) {
			if(subsrvice.getSubServiceId().equals(subServiceId)){
			SubServicesDetailsDto subServicesDetailsDto = new SubServicesDetailsDto();
			subServicesDetailsDto.setServiceName(subsrvice.getServiceName());
			subServicesDetailsDto.setSubServiceName(subsrvice.getSubServiceName());
			subServicesDetailsDto.setSubServicePrice(subsrvice.getFinalCost());
		    Response response = adminFeign.getClinicById(subsrvice.getHospitalId());
		    if(response.getData() != null) {
		     ClinicDTO clinicDto = new ObjectMapper().convertValue(response.getData(),ClinicDTO.class);
			 subServicesDetailsDto.setHospitalId(clinicDto.getHospitalId());
			 subServicesDetailsDto.setHospitalName(clinicDto.getName());
			 subServicesDetailsDto.setHospitalLogo(clinicDto.getHospitalLogo());
			 subServicesDetailsDto.setRecommanded(clinicDto.isRecommended());}
			 hospitalAndSubServiceInfo.add(subServicesDetailsDto);}
			 if( hospitalAndSubServiceInfo != null && !hospitalAndSubServiceInfo.isEmpty()) {
				 responseObj.setData(hospitalAndSubServiceInfo);
				 responseObj.setStatus(200);
			 }else {
				 responseObj.setMessage("SubServices Not Found ");
				 responseObj.setStatus(200);
			 }}}else {
				 responseObj.setMessage("No SubService Found ");
				 responseObj.setStatus(200);}
	    }catch(FeignException e) {
			 responseObj.setMessage(ExtractFeignMessage.clearMessage(e));
			 responseObj.setStatus(e.status());
			 responseObj.setSuccess(false);
		}
	return responseObj;
}




//CUSTOMERNOTIFICATION

public ResponseEntity<ResBody<List<NotificationToCustomer>>> notificationToCustomer(
			 String customerMobileNumber){
	try {		
		return notificationFeign.customerNotification(customerMobileNumber);			
	}catch(FeignException e) {		
		 ResBody<List<NotificationToCustomer>>  res = new  ResBody<List<NotificationToCustomer>>(ExtractFeignMessage.clearMessage(e),e.status(),null);		
		return ResponseEntity.status(e.status()).body(res);		
	}
}

}