package com.dermaCare.customerService.service;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.dermaCare.customerService.dto.BookingRequset;
import com.dermaCare.customerService.dto.BookingResponse;
import com.dermaCare.customerService.dto.BranchDTO;
import com.dermaCare.customerService.dto.BranchInfo;
import com.dermaCare.customerService.dto.CategoryDto;
import com.dermaCare.customerService.dto.ClinicAndDoctorsResponse;
import com.dermaCare.customerService.dto.ClinicDTO;
import com.dermaCare.customerService.dto.ConsultationDTO;
import com.dermaCare.customerService.dto.CustomerDTO;
import com.dermaCare.customerService.dto.CustomerLoginDTO;
import com.dermaCare.customerService.dto.CustomerRatingDomain;
import com.dermaCare.customerService.dto.DoctorSaveDetailsDTO;
import com.dermaCare.customerService.dto.DoctorsDTO;
import com.dermaCare.customerService.dto.FavouriteDoctorsDTO;
import com.dermaCare.customerService.dto.LoginDTO;
import com.dermaCare.customerService.dto.NotificationToCustomer;
import com.dermaCare.customerService.dto.ReportsAndDoctorSaveDetailsDto;
import com.dermaCare.customerService.dto.ReportsDtoList;
import com.dermaCare.customerService.dto.ServicesDto;
import com.dermaCare.customerService.dto.SubServicesDetailsDto;
import com.dermaCare.customerService.dto.SubServicesDto;
import com.dermaCare.customerService.dto.TempBlockingSlot;
import com.dermaCare.customerService.entity.ConsultationEntity;
import com.dermaCare.customerService.entity.Customer;
import com.dermaCare.customerService.entity.CustomerRating;
import com.dermaCare.customerService.entity.FavouriteDoctorsEntity;
import com.dermaCare.customerService.feignClient.AdminFeign;
import com.dermaCare.customerService.feignClient.BookingFeign;
import com.dermaCare.customerService.feignClient.CategoryServicesFeign;
import com.dermaCare.customerService.feignClient.ClinicAdminFeign;
import com.dermaCare.customerService.feignClient.DoctorServiceFeign;
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
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

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
    
    @Autowired
    private DoctorServiceFeign doctorServiceFeign;
    
    
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
	   Response response =  new Response();
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
			   response.setStatus(400);
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
	

public Response getDoctorsSlots(String hid,String branchId,String doctorId) {
	Response response = new Response();
    	try {
    	ResponseEntity<Response> res = clinicAdminFeign.getDoctorSlot(hid,branchId,doctorId);
		return res.getBody();
	}catch(FeignException e) {
		response.setStatus(e.status());
		response.setMessage(ExtractFeignMessage.clearMessage(e));
		response.setSuccess(false);
		return response;
	}}

public Response getReportsAndDoctorSaveDetails(String customerId) {
	Response response = new Response();
    	try {
        Response  res = clinicAdminFeign.getReportsBycustomerId(customerId).getBody();
       // System.out.println(res);
       List<ReportsDtoList> repots = new ObjectMapper().convertValue(res.getData(),new TypeReference<List<ReportsDtoList>>(){});
       Response  rs =  doctorServiceFeign.getDoctorSaveDetailsByCustomerId(customerId).getBody();
       //System.out.println(rs);
       ObjectMapper mapper = new ObjectMapper();
       mapper.registerModule(new JavaTimeModule());
       mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
       List<DoctorSaveDetailsDTO> doctorSaveDetailsDTO = mapper.convertValue(rs.getData(),new TypeReference<List<DoctorSaveDetailsDTO>>(){});
       ReportsAndDoctorSaveDetailsDto rd = new ReportsAndDoctorSaveDetailsDto();
       if(repots != null && !repots.isEmpty() ) {
       rd.setReportsDtoList(repots);}
       if(doctorSaveDetailsDTO != null  && !doctorSaveDetailsDTO.isEmpty()) {
       rd.setDoctorSaveDetailsDTO(doctorSaveDetailsDTO);}
       response.setStatus(200);;
		response.setMessage("Data fetched Successfully");
		response.setSuccess(true);
		response.setData(rd);
		return response;
	    }catch(FeignException e) {
		response.setStatus(e.status());;
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
	    	clinicAdminFeign.updateDoctorSlotWhileBooking(bookingResponse.getDoctorId(),bookingResponse.getBranchId(),
	  	    		  bookingResponse.getServiceDate(),bookingResponse.getServicetime());
    			     response.setData(res.getBody());			
		    		 response.setStatus(res.getBody().getStatusCode());	 
	    		  }else{
	    			response.setStatus(res.getBody().getHttpStatus().value());
	    			response.setData(res.getBody());}  
	    		}catch(FeignException e) {
	    		response.setStatus(e.status());
	    		response.setMessage(e.getMessage());
	    		response.setSuccess(false);}
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
			    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy hh:mm:ss a");
			    String formattedTime = istTime.format(formatter);
		    	try {
		    		CustomerRating customerRating =	customerRatingRepository.findByBranchIdAndDoctorIdAndAppointmentId(ratingRequest.getBranchId(), ratingRequest.getDoctorId() 
		    		,ratingRequest.getAppointmentId());
		    	if(customerRating == null) {
		    		CustomerRating cRating = new CustomerRating(
		 		        	null,ratingRequest.getDoctorRating(),ratingRequest.getBranchRating(),ratingRequest.getFeedback(),ratingRequest.getHospitalId(),ratingRequest.getBranchId(),ratingRequest.getDoctorId(),
		 		        	ratingRequest.getCustomerMobileNumber(),ratingRequest.getPatientId(),ratingRequest.getPatientName(),ratingRequest.getAppointmentId(),true,formattedTime
		 		        );
		        customerRatingRepository.save(cRating);
		        response.setStatus(200);
	            response.setMessage("Successfully Submitted Rating");
	            response.setSuccess(true);
		    	}else{
		    		 response.setStatus(409);
			            response.setMessage("Already Rated");
			            response.setSuccess(false);}
		        updateAvgRatingInClinicAndDoctorObject(ratingRequest.getBranchId(),ratingRequest.getDoctorId());
	            return response;
		       }catch(Exception e) {
		        	 response.setStatus(500);
		                response.setMessage(e.getMessage());
		                response.setSuccess(false);
		                return response;
		   }
		 }
	   
	   
	   public void updateAvgRatingInClinicAndDoctorObject(String bId,String doctorId) {
		   try {
			   List<CustomerRating> clinicRatings =  customerRatingRepository.findByBranchId(bId);
			   List<CustomerRating> doctorRatings =  customerRatingRepository.findByDoctorId(doctorId); 
			   double avgClinicRating = clinicRatings.stream()
			            .mapToDouble(CustomerRating::getBranchRating)
			            .average()
			            .orElse(0.0);
                //System.out.println(avgClinicRating);
			    double avgDoctorRating = doctorRatings.stream()
			            .mapToDouble(CustomerRating::getDoctorRating)
			            .average()
			            .orElse(0.0);
			   // System.out.println(avgDoctorRating);
			  Response res = adminFeign.getBranchById(bId).getBody();
			 // System.out.println(res);
			  BranchDTO dto = new ObjectMapper().convertValue(res.getData(),BranchDTO.class );
			  dto.setBranchOverallRating(avgClinicRating);
			 // System.out.println(dto);
			  adminFeign.updateBranch(bId, dto);
			 ResponseEntity<Response> doctorsDTO =  clinicAdminFeign.getDoctorById(doctorId);
			  DoctorsDTO dctDto = new ObjectMapper().convertValue(doctorsDTO.getBody().getData(),DoctorsDTO.class );
			  dctDto.setDoctorAverageRating(avgDoctorRating);
			 // System.out.println(dctDto);
		     clinicAdminFeign.updateDoctorById(doctorId, dctDto);
		    //System.out.println(r);
		   }catch(FeignException e) {}
	   }

	   

	   public Response getRatingForService(String bId, String doctorId) {
			Response response = new Response();
			try {
			    List<CustomerRatingDomain> listDto = new ArrayList<>();
				List<CustomerRating> ratings = customerRatingRepository.findByBranchIdAndDoctorId(bId, doctorId);
				if (ratings.isEmpty()) {
					response.setStatus(200);
					response.setMessage("Rating Not Found");
					response.setSuccess(true);
					return response;}
				for(CustomerRating rating : ratings){
				CustomerRatingDomain c = new CustomerRatingDomain(rating.getDoctorRating(), rating.getBranchRating(),
						rating.getFeedback(), rating.getHospitalId(),rating.getBranchId(), rating.getDoctorId(), rating.getCustomerMobileNumber(),rating.getPatientId(),
						rating.getPatientName(),rating.getAppointmentId(), rating.getRated(),rating.getDateAndTimeAtRating());
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
	   
	   
	   @Override
	   public Response getRatingForServiceBydoctorId( String doctorId) {
			Response response = new Response();
			try {
			    List<CustomerRatingDomain> listDto = new ArrayList<>();
				List<CustomerRating> ratings = customerRatingRepository.findByDoctorId(doctorId);
				System.out.println(ratings); 
				if (ratings.isEmpty()) {
					response.setStatus(200);
					response.setMessage("Rating Not Found");
					response.setSuccess(true);
					return response;}
				for(CustomerRating rating : ratings){
				CustomerRatingDomain c = new CustomerRatingDomain(rating.getDoctorRating(), rating.getBranchRating(),
						rating.getFeedback(), rating.getHospitalId(),rating.getBranchId(), rating.getDoctorId(), rating.getCustomerMobileNumber(),rating.getPatientId(),
						rating.getPatientName(),rating.getAppointmentId(), rating.getRated(),rating.getDateAndTimeAtRating());
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
	   
	   
	   	   
	   
	   public Response getAverageRating(String branchId, String doctorId) {
			Response response = new Response();
			try {
		ResponseEntity<Response> ratings = clinicAdminFeign.getAverageRatings(branchId, doctorId);
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
	   
	   @Override
	   public Response getAverageRatingByDoctorId( String doctorId) {
			Response response = new Response();
			try {
		ResponseEntity<Response> ratings = clinicAdminFeign.getAverageRatingsByDoctorId(doctorId);
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
		 ResponseEntity<ResponseStructure<List<SubServicesDto>>>  res = categoryServicesFeign.retrieveSubServicesBySubServiceId(subServiceId);
		//System.out.println(res);
		List<SubServicesDetailsDto> hospitalAndSubServiceInfo = new ArrayList<>();
		if(res.getBody().getData() != null && !res.getBody().getData().isEmpty()) {
			for(SubServicesDto subsrvice:res.getBody().getData()) {
			if(subsrvice.getSubServiceId().equals(subServiceId)){
			Response respnse = adminFeign.getClinicById(subsrvice.getHospitalId());
			ClinicDTO clncDto = new ObjectMapper().convertValue(respnse.getData(),ClinicDTO.class);
			if(clncDto != null) {
			SubServicesDetailsDto subServicesDetailsDto = new SubServicesDetailsDto();
			subServicesDetailsDto.setServiceName(subsrvice.getServiceName());
			subServicesDetailsDto.setSubServiceName(subsrvice.getSubServiceName());
			subServicesDetailsDto.setSubServicePrice(subsrvice.getFinalCost());
			subServicesDetailsDto.setDiscountedCost(subsrvice.getDiscountedCost());
			subServicesDetailsDto.setDiscountPercentage(subsrvice.getDiscountPercentage());
			subServicesDetailsDto.setPrice(subsrvice.getPrice());
			subServicesDetailsDto.setTaxAmount(subsrvice.getTaxAmount());
			subServicesDetailsDto.setConsultationFee(subsrvice.getConsultationFee());
            Response response = adminFeign.getClinicById(subsrvice.getHospitalId());
		    if(response.getData() != null) {
		     ClinicDTO clinicDto = new ObjectMapper().convertValue(response.getData(),ClinicDTO.class);
			 subServicesDetailsDto.setHospitalId(clinicDto.getHospitalId());
			 subServicesDetailsDto.setHospitalName(clinicDto.getName());
			 subServicesDetailsDto.setHospitalLogo(clinicDto.getHospitalLogo());
			 subServicesDetailsDto.setRecommanded(clinicDto.isRecommended());
			 subServicesDetailsDto.setHospitalOverallRating(clinicDto.getHospitalOverallRating());
			 subServicesDetailsDto.setWebsite(clinicDto.getWebsite());
			 subServicesDetailsDto.setWalkthrough(clinicDto.getWalkthrough());
			 subServicesDetailsDto.setCity(clinicDto.getCity());}
			 hospitalAndSubServiceInfo.add(subServicesDetailsDto);}}
			 if( hospitalAndSubServiceInfo != null && !hospitalAndSubServiceInfo.isEmpty()) {
				 responseObj.setData(hospitalAndSubServiceInfo);
				 responseObj.setStatus(200);
				 responseObj.setSuccess(true);
			 }else {
				 responseObj.setMessage("SubServices Data Not Found ");
				 responseObj.setStatus(200);
			 }}}else{
				 responseObj.setMessage("No SubService Data Found ");
				 responseObj.setStatus(200);}
	    }catch(FeignException e) {
			 responseObj.setMessage(ExtractFeignMessage.clearMessage(e));
			 responseObj.setStatus(e.status());
			 responseObj.setSuccess(false);
		}
	return responseObj;
  }



public Response getBranchesInfoBySubServiceId(String clinicId,String subServiceId,String latitude,String longtitude) throws JsonProcessingException {
	Response responseObj = new Response();
	try {
		 ResponseEntity<ResponseStructure<SubServicesDto>>  res = categoryServicesFeign.getSubServiceBySubServiceId(clinicId, subServiceId);
		//System.out.println(res);
		 BranchInfo hospitalAndSubServiceInfo = new BranchInfo();
		if(res.getBody().getData() != null) {
			SubServicesDto subsrvice = res.getBody().getData();
			 Response rs = adminFeign.getClinicById(subsrvice.getHospitalId());
			 ClinicDTO cDto = new ObjectMapper().convertValue(rs.getData(),ClinicDTO.class);
			 if(cDto != null) {
			//System.out.println(subsrvice);
			hospitalAndSubServiceInfo.setServiceName(subsrvice.getServiceName());
			hospitalAndSubServiceInfo.setSubServiceName(subsrvice.getSubServiceName());
			hospitalAndSubServiceInfo.setSubServicePrice(subsrvice.getFinalCost());
			hospitalAndSubServiceInfo.setDiscountedCost(subsrvice.getDiscountedCost());
			hospitalAndSubServiceInfo.setDiscountPercentage(subsrvice.getDiscountPercentage());
			hospitalAndSubServiceInfo.setPrice(subsrvice.getPrice());
			hospitalAndSubServiceInfo.setTaxAmount(subsrvice.getTaxAmount());
			hospitalAndSubServiceInfo.setConsultationFee(subsrvice.getConsultationFee());
            Response response = adminFeign.getBranchByClinicId(subsrvice.getHospitalId()).getBody();
            Response respnse = adminFeign.getClinicById(subsrvice.getHospitalId());
		    if(response.getData() != null) {
		    	 ClinicDTO clinicDto = new ObjectMapper().convertValue(respnse.getData(),ClinicDTO.class);
		    	 hospitalAndSubServiceInfo.setHospitalId(clinicDto.getHospitalId());
		    	 hospitalAndSubServiceInfo.setHospitalName(clinicDto.getName());
		    	 hospitalAndSubServiceInfo.setHospitalLogo(clinicDto.getHospitalLogo());
		    	 hospitalAndSubServiceInfo.setRecommanded(clinicDto.isRecommended());
		    	 hospitalAndSubServiceInfo.setHospitalOverallRating(clinicDto.getHospitalOverallRating());
		    	 hospitalAndSubServiceInfo.setWebsite(clinicDto.getWebsite());
		    	 hospitalAndSubServiceInfo.setWalkthrough(clinicDto.getWalkthrough());
		    	 hospitalAndSubServiceInfo.setCity(clinicDto.getCity());}
		    //System.out.println(response.getData());
		     List<BranchDTO> branchDto = new ObjectMapper().convertValue(response.getData(),new TypeReference<List<BranchDTO>>() {});	
		     List<BranchDTO> branchDtoWithKms = branchDto.stream().map(n->{double d = haversine(Double.valueOf(latitude),Double.valueOf(longtitude),Double.valueOf(n.getLatitude()),Double.valueOf(n.getLongitude()));
		     n.setDistance(d); n.setKms(String.format("%.1f", d)+" km");return n;}).toList();
		     List<BranchDTO> branchDtoWithKmsAsndng = branchDtoWithKms.stream().sorted(Comparator.comparingDouble(BranchDTO::getDistance)).toList();
			 hospitalAndSubServiceInfo.setBranches(branchDtoWithKmsAsndng);
			 }else {
				 responseObj.setMessage("Hospital Not Found ");
				 responseObj.setStatus(200); 
			 }
			 if(hospitalAndSubServiceInfo != null) {
				 responseObj.setData(hospitalAndSubServiceInfo);
				 responseObj.setStatus(200);
				 responseObj.setSuccess(true);
			 }else{
				 responseObj.setMessage("SubServices Not Found ");
				 responseObj.setStatus(200);
			 }}else{
				 responseObj.setMessage("No SubService Found ");
				 responseObj.setStatus(200);}
	    }catch(FeignException e) {
			 responseObj.setMessage(e.getMessage());
			 responseObj.setStatus(e.status());
			 responseObj.setSuccess(false);
		}
	return responseObj;
}



private static final double EARTH_RADIUS_KM = 6371.0;
private double haversine(double lat1, double lon1, double lat2, double lon2) {
    // Convert degrees to radians
    double dLat = Math.toRadians(lat2 - lat1);
    double dLon = Math.toRadians(lon2 - lon1);
    
    lat1 = Math.toRadians(lat1);
    lat2 = Math.toRadians(lat2);

    // Haversine formula
    double a = Math.pow(Math.sin(dLat / 2), 2)
             + Math.cos(lat1) * Math.cos(lat2)
             * Math.pow(Math.sin(dLon / 2), 2);

    double c = 2 * Math.asin(Math.sqrt(a));

    return EARTH_RADIUS_KM * c; // Distance in KM
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


public ResponseEntity<?> getInProgressAppointments( String mnumber){
try {		
	return bookingFeign.inProgressAppointments(mnumber);		
}catch(FeignException e) {		
	 ResBody<List<NotificationToCustomer>>  res = new  ResBody<List<NotificationToCustomer>>(ExtractFeignMessage.clearMessage(e),e.status(),null);		
	return ResponseEntity.status(e.status()).body(res);		
}}


public ResponseEntity<?> customerLogin(CustomerLoginDTO dto){
try {		
	return clinicAdminFeign.login(dto);		
}catch(FeignException e) {	
	Response res = new Response();
	res.setMessage(ExtractFeignMessage.clearMessage(e));
	res.setStatus(e.status());
	res.setSuccess(false);
	return ResponseEntity.status(e.status()).body(res);		
}}



@Override
public Response getDoctorsByHospitalBranchAndSubService( String hospitalId,
		String branchId,  String subServiceId)throws JsonProcessingException {
	Response response = new Response();
	try {
		Response hospitalResponse = adminFeign.getClinicById(hospitalId);
		if(hospitalResponse.getData()!= null ) {
		ResponseEntity<Response> doctorsResponse = clinicAdminFeign.getDoctorsByHospitalBranchAndSubService(hospitalId, branchId, subServiceId);
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
@Override
public Response getDoctorsByHospitalBranchAndSubService(
        String hospitalId,
        String branchId,
        String subServiceId,
        int consultationType) throws JsonProcessingException {

    Response response = new Response();

    try {
        // 1. Get hospital/clinic info
        Response hospitalResponse = adminFeign.getClinicById(hospitalId);

        if (hospitalResponse.getData() != null) {

            // 2. Get doctors by hospital, branch, and subService
            ResponseEntity<Response> doctorsResponse =
                    clinicAdminFeign.getDoctorsByHospitalBranchAndSubService(hospitalId, branchId, subServiceId);

            Object obj = doctorsResponse.getBody().getData();

            // 3. Convert to list of DoctorsDTO
            List<DoctorsDTO> doctors = new ObjectMapper().convertValue(obj, new TypeReference<List<DoctorsDTO>>() {});

            if (doctors != null && !doctors.isEmpty()) {

                // 4. Filter by consultation type
                List<DoctorsDTO> filteredDoctors = doctors.stream()
                        .filter(dto -> {
                            if (dto.getConsultation() == null) return false;
                            switch (consultationType) {
                                case 1:
                                    return dto.getConsultation().getInClinic() == 1;
                                case 2:
                                    return dto.getConsultation().getVideoOrOnline() == 2;
                                case 3:
                                    return dto.getConsultation().getServiceAndTreatments() == 3;
                                default:
                                    return false;
                            }
                        })
                        .collect(Collectors.toList());

                ClinicDTO hospital = new ObjectMapper().convertValue(hospitalResponse.getData(), ClinicDTO.class);

                ClinicAndDoctorsResponse combinedData = new ClinicAndDoctorsResponse(hospital, filteredDoctors);

                response.setSuccess(true);
                response.setData(combinedData);
                response.setMessage("Hospital and doctors fetched successfully");
                response.setStatus(HttpStatus.OK.value());

            } else {
                response.setData(doctorsResponse.getBody());
                response.setStatus(doctorsResponse.getBody().getStatus());
            }

        } else {
            response.setData(hospitalResponse);
            response.setStatus(hospitalResponse.getStatus());
        }

    } catch (FeignException e) {
        response.setSuccess(false);
        response.setMessage(ExtractFeignMessage.clearMessage(e));
        response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
    }

    return response;
}


public ResponseEntity<Response> getRecommendedClinicsAndOnDoctors(String keyPoints){
try {		
	return clinicAdminFeign.getRecommendedClinicsAndOnDoctors(keyPoints);		
}catch(FeignException e) {	
	Response res = new Response();
	res.setMessage(ExtractFeignMessage.clearMessage(e));
	res.setStatus(e.status());
	res.setSuccess(false);
	return ResponseEntity.status(e.status()).body(res);		
}}


public ResponseEntity<ResponseStructure<List<BookingResponse>>> getBookingsByBranchId(String branchId){
	ResponseStructure<List<BookingResponse>> res = new ResponseStructure<List<BookingResponse>>();
	try {		
	return bookingFeign.getAllBookedServicesByBranchId(branchId);		
}catch(FeignException e) {
	res = new ResponseStructure<List<BookingResponse>>(null,ExtractFeignMessage.clearMessage(e),HttpStatus.INTERNAL_SERVER_ERROR,e.status());
}
	return ResponseEntity.status(res.getStatusCode()).body(res);
}



@Override
public ResponseEntity<ResponseStructure<List<BookingResponse>>> getBookingsByClinicIdWithBranchId(String clinicId, String branchId) {
    ResponseStructure<List<BookingResponse>> res = new ResponseStructure<>();
    try {
        return bookingFeign.getBookedServicesByClinicIdWithBranchId(clinicId, branchId);
    } catch (FeignException e) {
        res = new ResponseStructure<>(null, ExtractFeignMessage.clearMessage(e), HttpStatus.INTERNAL_SERVER_ERROR, e.status());
        return ResponseEntity.status(res.getStatusCode()).body(res);
    }
}


@Override
public ResponseEntity<ResponseStructure<List<BookingResponse>>> getBookingsByCustomerId(String customerId) {
    ResponseStructure<List<BookingResponse>> res = new ResponseStructure<>();
    try {
        return bookingFeign.getBookingByCustomerId(customerId);
    } catch (FeignException e) {
        res = new ResponseStructure<>(null, ExtractFeignMessage.clearMessage(e), HttpStatus.INTERNAL_SERVER_ERROR, e.status());
        return ResponseEntity.status(res.getStatusCode()).body(res);
    }
}


@Override
public ResponseEntity<?> getInprogressBookingsByCustomerId(String customerId) {
    ResponseStructure<List<BookingResponse>> res = new ResponseStructure<>();
    try {
        return bookingFeign.getInprogressAppointmentsByCustomerId(customerId);
    } catch (FeignException e) {
        res = new ResponseStructure<>(null, ExtractFeignMessage.clearMessage(e), HttpStatus.INTERNAL_SERVER_ERROR, e.status());
        return ResponseEntity.status(res.getStatusCode()).body(res);
    }
}

@Override
public ResponseEntity<?> getInprogressBookingsByPatientId(String patientId,String clinicId) {
    ResponseStructure<List<BookingResponse>> res = new ResponseStructure<>();
    try {
        return bookingFeign.getInprogressAppointmentsByPatientId(patientId,clinicId);
    } catch (FeignException e) {
        res = new ResponseStructure<>(null, ExtractFeignMessage.clearMessage(e), HttpStatus.INTERNAL_SERVER_ERROR, e.status());
        return ResponseEntity.status(res.getStatusCode()).body(res);
    }
}

@Override
public ResponseEntity<?> retrieveAppointnmentsByRelation(String customerId) {
    ResponseStructure<List<BookingResponse>> res = new ResponseStructure<>();
    try {
        return bookingFeign.retrieveAppointnmentsByRelation(customerId);
    } catch (FeignException e) {
        res = new ResponseStructure<>(null, ExtractFeignMessage.clearMessage(e), HttpStatus.INTERNAL_SERVER_ERROR, e.status());
        return ResponseEntity.status(res.getStatusCode()).body(res);
    }
}


@Override
public ResponseEntity<?> retrieveAppointnmentsByPatientId(String patientId) {
    ResponseStructure<List<BookingResponse>> res = new ResponseStructure<>();
    try {
        return bookingFeign.getBookingByPatientId(patientId);
    } catch (FeignException e) {
        res = new ResponseStructure<>(null, ExtractFeignMessage.clearMessage(e), HttpStatus.INTERNAL_SERVER_ERROR, e.status());
        return ResponseEntity.status(res.getStatusCode()).body(res);
    }
}

@Override
public boolean blockSlot(TempBlockingSlot tempBlockingSlot) {
    try {
        return clinicAdminFeign.blockSlot(tempBlockingSlot);
    } catch (FeignException e) {
       return false;
    }
}


public CustomerDTO getCustomerByToken(String token){
try {	
	Customer cstmr = customerRepository.findByDeviceId(token);
	if(cstmr != null) {
	CustomerDTO cusmrdto = new ObjectMapper().convertValue(cstmr, CustomerDTO.class);
	return cusmrdto;}
	else {
		return null;
	}
}catch(FeignException e) {	
	return null;	
}}

}