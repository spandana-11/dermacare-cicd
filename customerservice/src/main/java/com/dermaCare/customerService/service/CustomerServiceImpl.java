package com.dermaCare.customerService.service;


import java.time.Instant;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
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
import com.dermaCare.customerService.dto.NotificationToCustomer;
import com.dermaCare.customerService.dto.ResponseDTO;
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
import com.dermaCare.customerService.util.OtpUtil;
import com.dermaCare.customerService.util.ResBody;
import com.dermaCare.customerService.util.Response;
import com.dermaCare.customerService.util.ResponseStructure;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import feign.FeignException;
import org.springframework.http.HttpMethod;
import jakarta.servlet.http.HttpSession;



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
    private NotificationFeign notificationFeign;
    
    
    
    
    @org.springframework.beans.factory.annotation.Value("${fast2sms.api.key}")
    private String fast2smsApiKey;

    private Map<String, Instant> otpLastSentTime = new ConcurrentHashMap<>();
    private Map<String, String> generatedOtps = new HashMap<>();
    private Map<String, CustomerDTO> temporaryCustomers = new HashMap<>();
    private static final int OTP_COOLDOWN_SECONDS = 60;

    @Override
    public ResponseDTO signInOrSignUp(String fullName, String mobileNumber, HttpSession session) {
        ResponseDTO response = new ResponseDTO();


        // Capitalize the first letter of the full name and make the rest lowercase
        fullName = capitalizeFullName(fullName);

        // Create and trim the CustomerDTO
        CustomerDTO customerDTO = new CustomerDTO();
        customerDTO.setFullName(fullName);
        customerDTO.setMobileNumber(mobileNumber);
        customerDTO.trimFields();

        // Validate input fields
        if (!isValidFullName(customerDTO.getFullName())) {
            return createErrorResponse(response, "Full name is required and must contain only letters and spaces.");
        }
        if (!isValidMobileNumber(customerDTO.getMobileNumber())) {
            return createErrorResponse(response, "A valid mobile number is required (10 digits only).");
        }

        // Convert mobileNumber from String to long
        long mobileNumberLong = Long.parseLong(customerDTO.getMobileNumber());

        Optional<Customer> existingCustomerOpt = customerRepository.findByMobileNumber(mobileNumberLong);
        if (existingCustomerOpt.isPresent()) {
            return handleExistingCustomer(existingCustomerOpt.get(), mobileNumberLong, session, response);
        } else {
            response.setMessage(requestOtp(customerDTO.getMobileNumber(), customerDTO.getFullName(), session).getMessage() +
                    " You need to complete your registration. Please verify your OTP.");
            response.setRegistrationCompleted(false);
            response.setStatus(HttpStatus.OK.value());
            response.setSuccess(true);
        }

        return response;
    }
    

 // Helper method to capitalize the full name
    private String capitalizeFullName(String fullName) {
        if (fullName == null || fullName.isEmpty()) {
            return fullName;
        }

        // Split the full name into words
        String[] words = fullName.split(" ");
        
        // Capitalize the first letter of each word and make the rest lowercase
        StringBuilder capitalizedFullName = new StringBuilder();
        for (String word : words) {
            if (!word.isEmpty()) {
                capitalizedFullName.append(word.substring(0, 1).toUpperCase())
                                   .append(word.substring(1).toLowerCase())
                                   .append(" ");
            }
        }

        // Trim the trailing space
        return capitalizedFullName.toString().trim();
    }


    private ResponseDTO handleExistingCustomer(Customer existingCustomer, long mobileNumber, HttpSession session, ResponseDTO response) {
        response.setMessage(requestOtp(String.valueOf(mobileNumber), existingCustomer.getFullName(), session).getMessage() +
                (existingCustomer.isRegistrationCompleted() ?
                        " You are already registered. Please verify your OTP to log in." :
                        " You have an incomplete registration. Please verify your OTP to continue."));
        response.setRegistrationCompleted(existingCustomer.isRegistrationCompleted());
        response.setStatus(HttpStatus.OK.value());
        response.setSuccess(existingCustomer.isRegistrationCompleted()); // Reflect registration status
        
        return response;
    }
    
    @Override
    public ResponseDTO requestOtp(String mobileNumber, String fullName, HttpSession session) {
        ResponseDTO response = new ResponseDTO();

        // Validate mobile number
        if (!isValidMobileNumber(mobileNumber)) {
            return createErrorResponse(response, "A valid mobile number is required.");
        }

        Instant now = Instant.now();
        Instant lastSentTime = otpLastSentTime.get(mobileNumber);

        // Check OTP cooldown
        if (lastSentTime != null && now.isBefore(lastSentTime.plusSeconds(OTP_COOLDOWN_SECONDS))) {
            long secondsLeft = OTP_COOLDOWN_SECONDS - (now.getEpochSecond() - lastSentTime.getEpochSecond());
            return createErrorResponse(response, "Please wait " + secondsLeft + " seconds before requesting a new OTP.");
        }

        // Generate and send OTP
        String otp = OtpUtil.generateOtp();
        boolean sentSuccessfully = sendOtpToMobile(mobileNumber, otp);
        if (!sentSuccessfully) {
            return createErrorResponse(response, "Failed to send OTP due to provider restrictions. Please wait and try again.");
        }

        generatedOtps.put(mobileNumber, otp);
        otpLastSentTime.put(mobileNumber, now);

        // Store temporary customer data
        CustomerDTO tempCustomer = new CustomerDTO();
        tempCustomer.setFullName(fullName);
        tempCustomer.setMobileNumber(mobileNumber);
        temporaryCustomers.put(mobileNumber, tempCustomer);

        session.setAttribute("mobileNumber", mobileNumber);
        response.setMessage("OTP sent successfully. Please verify your OTP.");
        response.setRegistrationCompleted(false);
        response.setStatus(HttpStatus.OK.value());
        response.setSuccess(true); // Registration not yet complete
        
        return response;
    }

    @Override
    public ResponseDTO verifyOtp(String enteredOtp, String mobileNumber, HttpSession session) {
        ResponseDTO response = new ResponseDTO();

        // Validate mobile number
        if (!isValidMobileNumber(mobileNumber)) {
            return createErrorResponse(response, "A valid mobile number is required.");
        }

        String generatedOtp = generatedOtps.get(mobileNumber);
        Instant otpSentTime = otpLastSentTime.get(mobileNumber);

        if (generatedOtp == null || otpSentTime == null) {
            return createErrorResponse(response, "No OTP found for this mobile number.");
        }

        Instant now = Instant.now();
        if (now.isAfter(otpSentTime.plusSeconds(OTP_COOLDOWN_SECONDS))) {
            generatedOtps.remove(mobileNumber);
            otpLastSentTime.remove(mobileNumber);
            return createErrorResponse(response, "OTP has expired. Please request a new OTP.");
        }

        if (enteredOtp.equals(generatedOtp)) {
            generatedOtps.remove(mobileNumber);
            otpLastSentTime.remove(mobileNumber);
            handleOtpSuccess(mobileNumber, response);
        } else {
            return createErrorResponse(response, "Invalid OTP.");
        }

        return response;
    }

    private void handleOtpSuccess(String mobileNumber, ResponseDTO response) {
        Optional<Customer> existingCustomerOpt = customerRepository.findByMobileNumber(Long.parseLong(mobileNumber));
        if (existingCustomerOpt.isPresent()) {
            Customer existingCustomer = existingCustomerOpt.get();
            response.setMessage("OTP verified successfully. " +
                    (existingCustomer.isRegistrationCompleted() ?
                            "You are now logged in." :
                            "You can now complete the remaining registration details."));
            response.setRegistrationCompleted(existingCustomer.isRegistrationCompleted());
            response.setStatus(HttpStatus.OK.value());
        } else {
            CustomerDTO tempCustomer = temporaryCustomers.get(mobileNumber);
            if (tempCustomer != null) {
                Customer customerEntity = new Customer();
                customerEntity.setFullName(tempCustomer.getFullName());
                customerEntity.setMobileNumber(tempCustomer.getMobileNumber());
                customerEntity.setRegistrationCompleted(false);
                customerRepository.save(customerEntity);
                temporaryCustomers.remove(mobileNumber);
                response.setMessage("OTP verification successful. You can now complete the remaining registration details.");
                response.setRegistrationCompleted(false);
                response.setStatus(HttpStatus.OK.value());
                response.setSuccess(true); 
            } else {
                response.setMessage("No registration in progress for this mobile number.");
                response.setRegistrationCompleted(false);
                response.setStatus(HttpStatus.BAD_REQUEST.value());
            }
        }
    }

    @Override
    public ResponseDTO resendOtp(String mobileNumber, HttpSession session) {
        ResponseDTO response = new ResponseDTO();

        // Validate mobile number
        if (!isValidMobileNumber(mobileNumber)) {
            return createErrorResponse(response, "A valid mobile number is required.");
        }

        CustomerDTO tempCustomer = temporaryCustomers.get(mobileNumber);
        if (tempCustomer == null) {
            return createErrorResponse(response, "No registration in progress for this mobile number.");
        }

        String otpResponseMessage = requestOtp(mobileNumber, tempCustomer.getFullName(), session).getMessage();
        response.setMessage(otpResponseMessage);
        response.setRegistrationCompleted(false);
        response.setStatus(HttpStatus.OK.value());
        response.setSuccess(true); 
        return response;
    }

    
    private boolean sendOtpToMobile(String mobileNumber, String otp) {
        String url = "https://www.fast2sms.com/dev/bulkV2";
        String message = "Your OTP is: " + otp;

        HttpHeaders headers = new HttpHeaders();
        headers.set("authorization", fast2smsApiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);;

        Map<String, Object> body = new HashMap<>();
        body.put("route", "v3");
        body.put("sender_id", "TXTIND");
        body.put("message", message);
        body.put("language", "english");
        body.put("flash", 0);
        body.put("numbers", String.valueOf(mobileNumber));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        RestTemplate restTemplate = new RestTemplate();

        try {
           ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                System.out.println("OTP sent successfully to mobile number: " + mobileNumber);
                return true;
            } else {
                System.out.println("Failed to send OTP. Response: " + response.getBody());
                return response.getBody().contains("Spamming detected");
            }
        } catch (Exception e) {
            System.out.println("Error sending OTP: " + e.getMessage());
            return false;
        }
    }

    
    private boolean isValidMobileNumber(String mobileNumber) {
        return mobileNumber.matches("^\\d{10}$");
    }

    private boolean isValidFullName(String fullName) {
        return fullName != null && !fullName.trim().isEmpty() && fullName.matches("^[A-Za-z\\s]+$");
    }


    private ResponseDTO createErrorResponse(ResponseDTO response, String message) {
        response.setMessage(message);
        response.setRegistrationCompleted(false);
        response.setStatus(HttpStatus.BAD_REQUEST.value());
        return response;
    }
    
   

   public Response saveCustomerBasicDetails(CustomerDTO customerDTO) {
	   Response  response =  new Response();
	   try {
	   if(customerDTO != null) {
		Optional<Customer> cstmr = customerRepository.findByMobileNumber(customerDTO.getMobileNumber());
		   if(cstmr.isPresent()) {
			   response.setMessage("MobileNumber Already Exist");
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
			 DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd hh:mm a", Locale.ENGLISH); 
			 String nowFormatted = LocalDateTime.now().format(formatter);
		    	try {
		        CustomerRating customerRating = new CustomerRating(
		        	null,ratingRequest.getDoctorRating(),ratingRequest.getHospitalRating(),ratingRequest.getFeedback(),ratingRequest.getHospitalId(),ratingRequest.getDoctorId(),
		        	ratingRequest.getCustomerMobileNumber(),ratingRequest.getAppointmentId(),true,nowFormatted
		        );
		        customerRatingRepository.save(customerRating);
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

public ResponseEntity<ResBody<List<NotificationToCustomer>>> notificationToCustomer(String customerName,
			 String customerMobileNumber){
	try {		
		return notificationFeign.customerNotification(customerName, customerMobileNumber);			
	}catch(FeignException e) {		
		 ResBody<List<NotificationToCustomer>>  res = new  ResBody<List<NotificationToCustomer>>(e.getMessage(),e.status(),null);		
		return ResponseEntity.status(e.status()).body(res);		
	}
}

}