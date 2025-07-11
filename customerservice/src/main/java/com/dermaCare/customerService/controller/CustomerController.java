package com.dermaCare.customerService.controller;



import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.dermaCare.customerService.dto.BookingRequset;
import com.dermaCare.customerService.dto.BookingResponse;
import com.dermaCare.customerService.dto.ConsultationDTO;
import com.dermaCare.customerService.dto.CustomerDTO;
import com.dermaCare.customerService.dto.CustomerRatingDomain;
import com.dermaCare.customerService.dto.FavouriteDoctorsDTO;
import com.dermaCare.customerService.dto.LoginDTO;
import com.dermaCare.customerService.dto.NotificationToCustomer;
import com.dermaCare.customerService.service.CustomerService;
import com.dermaCare.customerService.util.OtpUtil;
import com.dermaCare.customerService.util.ResBody;
import com.dermaCare.customerService.util.Response;
import com.dermaCare.customerService.util.ResponseStructure;
import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;


@RestController
@RequestMapping("/customer")
// @CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class CustomerController {

	@Autowired(required = true)
	private CustomerService customerService;
		
	
	@PostMapping("/VerifyUserCredentialsAndGenerateAndSendOtp")
	public ResponseEntity<Response> verifyUserCredentialsAndGenerateAndSendOtp(@RequestBody LoginDTO loginDTO) {
		return customerService.verifyUserCredentialsAndGenerateAndSendOtp(loginDTO);
	}

	
	@PostMapping("/verifyOtp")
	public ResponseEntity<Response> verifyOtp(@RequestBody LoginDTO loginDTO) {
		return customerService.verifyOtp(loginDTO);
	}

	
	@PostMapping("/resendOtp")
	public ResponseEntity<Response> resendOtp(@RequestBody LoginDTO loginDTO) {
		return customerService.resendOtp(loginDTO);
	}

	
	//CUSTOMER CRUD APIS
	
	@PostMapping("/saveBasicDetails")
	public ResponseEntity<Response> saveCustomerBasicDetails(@RequestBody @Valid CustomerDTO customerDTO ){
		Response response =  customerService.saveCustomerBasicDetails(customerDTO);
		if(response != null && response.getStatus() != 0) {
			 return ResponseEntity.status(response.getStatus()).body(response);
		 }else {
				return null;
		}
	}
	
	@GetMapping("/getBasicDetails/{mobileNumber}")
	public ResponseEntity<Response> getCustomerBasicDetails(@PathVariable String mobileNumber ){
		Response response =  customerService.getCustomerByMobileNumber(mobileNumber);
		if(response != null && response.getStatus() != 0) {
			 return ResponseEntity.status(response.getStatus()).body(response);
		 }else {
				return null;
		}
	}
	
	@GetMapping("/getAllCustomers")
	public ResponseEntity<Response> getAllCustomers(){
		Response response =  customerService.getAllCustomers();
		if(response != null && response.getStatus() != 0) {
			 return ResponseEntity.status(response.getStatus()).body(response);
		 }else {
				return null;
		}
	}
	
	@PutMapping("/updateCustomerBasicDetails/{mobileNumber}")
	public ResponseEntity<Response> updateCustomerBasicDetails(@RequestBody CustomerDTO 
		customerDTO,@PathVariable String mobileNumber ){
		Response response =  customerService.updateCustomerBasicDetails(customerDTO, mobileNumber);
		if(response != null && response.getStatus() != 0) {
			 return ResponseEntity.status(response.getStatus()).body(response);
		 }else {
				return null;
		}
	}
	
	
	@DeleteMapping("/deleteCustomerBasicDetails/{mobileNumber}")
	public ResponseEntity<Response> deleteCustomerBasicDetails(@PathVariable String mobileNumber ){
		Response response =  customerService.deleteCustomerByMobileNumber(mobileNumber);
		if(response != null && response.getStatus() != 0) {
			 return ResponseEntity.status(response.getStatus()).body(response);
		 }else {
				return null;
		}
	}
	
  	@GetMapping("/getCustomerByInput/{input}")
  	public ResponseEntity<?> getCustomerByUsernameMobileEmail(@PathVariable String input) {
  		if (input == null || input.equals("") || input.equals(" ")) {
  			return new ResponseEntity<String>("Please Enter a valid input ", HttpStatus.BAD_REQUEST);
  		} else {
  			if (OtpUtil.isMobileNumber(input)) {
  				String mobilenumber;
  				try {
  					mobilenumber = input; 
  				} catch (Exception e) {
  					return new ResponseEntity<String>("Please Enter a MobileNumber in Range ", HttpStatus.BAD_REQUEST);
  				}
  				CustomerDTO optCustomer =  customerService.getCustomerDetailsByMobileNumber(mobilenumber);
  				if (optCustomer != null) {
  					return new ResponseEntity<CustomerDTO>(optCustomer, HttpStatus.OK);
  				} else {
  					return new ResponseEntity<String>("Customer Data not found", HttpStatus.OK);
  				}
  			} else {
  				if (OtpUtil.isEmail(input)) {
  					CustomerDTO optCustomer =  customerService.getCustomerDetailsByEmail(input);
  					if (optCustomer != null) {
  					
  						return new ResponseEntity<CustomerDTO>(optCustomer, HttpStatus.OK);
  					} else {
  						return new ResponseEntity<String>("Customer Data not found Please enter a valid email",
  								HttpStatus.OK);
  					}
  				} else {
  					List<CustomerDTO> listCustomers =  customerService.getCustomerByfullName(input);
  					if (listCustomers.isEmpty()) {
  						return new ResponseEntity<String>("Customers Data Not found", HttpStatus.OK);
  					} else {
  						return new ResponseEntity<List<CustomerDTO>>(listCustomers, HttpStatus.OK);
  					}
  				}
  			}
  		}
  	}

  	
  	//consultation
  	
  	 // POST: Create a new consultation
    @PostMapping("/createConsultation")
    public ResponseEntity<Response> createConsultation(@RequestBody ConsultationDTO entity) {
        Response response = customerService.saveConsultation(entity);
        if(response != null && response.getStatus() != 0) {
   		 return ResponseEntity.status(response.getStatus()).body(response);
   	 }else {
   			return null;
		}
    }
   

    // GET: Retrieve all consultations
    @GetMapping("/getAllConsultations")
    public ResponseEntity<Response> getAllConsultations() {
        Response response = customerService.getAllConsultations();
        if(response != null && response.getStatus() != 0) {
   		 return ResponseEntity.status(response.getStatus()).body(response);
   	 }else {
   			return null;
		}
}
    
    //  DOCTOR APIS
    
   @GetMapping("/getDoctorsByServiceId/{hospitalid}/{serviceId}")
    public ResponseEntity<Response> getDoctorsByServiceId(@PathVariable String hospitalid, @PathVariable String serviceId){
    	Response response = customerService.getDoctors(hospitalid, serviceId);
    	if(response != null && response.getStatus() != 0) {
   		 return ResponseEntity.status(response.getStatus()).body(response);
   	 }else {
   			return null;
		}
    	
    }
    
   @PostMapping("/saveFavouriteDoctor")
    public ResponseEntity<Response> saveFavouriteDoctor(@RequestBody FavouriteDoctorsDTO favouriteDoctorsDTO){
    	ResponseEntity<Response> response = customerService.saveFavouriteDoctors(favouriteDoctorsDTO);
    	if(response.hasBody()) {
   		 return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
   	 }else {
   			return null;
		}
    }
   
   @GetMapping("/getAllSavedFavouriteDoctors")
   public ResponseEntity<Response> getAllSavedFavouriteDoctors(){
   	Response response = customerService.getAllSavedFavouriteDoctors();
   	if(response != null && response.getStatus() != 0) {
  		 return ResponseEntity.status(response.getStatus()).body(response);
  	 }else {
  			return null;
		}
   	
   }
   
   @GetMapping("/getDoctorSlots/{hospitalId}/{doctorId}")
   public ResponseEntity<Response> getDoctorSlots(@PathVariable String hospitalId,@PathVariable String doctorId){
   	Response response = customerService.getDoctorsSlots(hospitalId,doctorId);
   	if(response != null && response.getStatus() != 0) {
  		 return ResponseEntity.status(response.getStatus()).body(response);
  	 }else {
  			return null;
		}}
   	
   	
    
// BOOKING APIS

@PostMapping("/bookService")
public ResponseEntity<Object> bookService(@RequestBody BookingRequset req)throws JsonProcessingException  {
	Response response = customerService.bookService(req);
	if(response != null && response.getData() == null) {
		 return ResponseEntity.status(response.getStatus()).body(response);
	 }else if(response != null && response.getData() != null) {
		 return ResponseEntity.status(response.getStatus()).body(response.getData());}
		 else {
			 return null;
		 }
	}

@DeleteMapping("/deleteService/{id}")
public ResponseEntity<Object> deleteBookedService(@PathVariable String id){
	Response response = customerService.deleteBookedService(id);
	if(response != null && response.getData() == null) {
		 return ResponseEntity.status(response.getStatus()).body(response);
	 }else if(response != null && response.getData() != null) {
		 return ResponseEntity.status(response.getStatus()).body(response.getData());}
		 else {
			 return null;
		 }
}


@GetMapping("/getBookedService/{id}")
public ResponseEntity<Object> getBookedService(@PathVariable String id){
	Response response = customerService.getBookedService(id);
	if(response != null && response.getData() == null) {
		 return ResponseEntity.status(response.getStatus()).body(response);
	 }else if(response != null && response.getData() != null) {
		 return ResponseEntity.status(response.getStatus()).body(response.getData());}
		 else {
			 return null;
		 }
}

@GetMapping("/getBookedServices/{mobileNumber}")
public ResponseEntity<Object> getCustomerBookedServices(
		@PathVariable String mobileNumber){
	Response response = customerService.getCustomerBookedServices(mobileNumber);
	if(response != null && response.getData() == null) {
		 return ResponseEntity.status(response.getStatus()).body(response);
	 }else if(response != null && response.getData() != null) {
		 return ResponseEntity.status(response.getStatus()).body(response.getData());}
		 else {
			 return null;
		 }
}

@GetMapping("/getAllBookedServices")
public ResponseEntity<ResponseStructure<List<BookingResponse>>> getAllBookedServices() {
    ResponseStructure<List<BookingResponse>> response =
    		customerService.getAllBookedServices();
    if(response != null) {
		 return ResponseEntity.status(response.getHttpStatus().value()).body(response);}
	else {
	     return null;}
}

@GetMapping("/getBookingByDoctorId/{doctorId}")
public ResponseEntity<Object> getBookingByDoctorId(@PathVariable String doctorId){
	Response response = customerService.getBookingByDoctorId(doctorId);
	if(response != null && response.getData() == null) {
		 return ResponseEntity.status(response.getStatus()).body(response);
	 }else if(response != null && response.getData() != null) {
		 return ResponseEntity.status(response.getStatus()).body(response.getData());}
		 else {
			 return null;
		 }
}

@GetMapping("/getAllBookedServicesBySId/{serviceId}")
public ResponseEntity<Object> getBookingByServiceId(@PathVariable String serviceId){
	Response response = customerService.getBookingByServiceId(serviceId);
	if(response != null && response.getData() == null) {
		 return ResponseEntity.status(response.getStatus()).body(response);
	 }else if(response != null && response.getData() != null) {
		 return ResponseEntity.status(response.getStatus()).body(response.getData());}
		 else {
			 return null;
		 }}

@GetMapping("/getAllBookedServicesByClinicId/{clinicId}")
public ResponseEntity<Object> getBookingByClinicId(@PathVariable String clinicId){
	Response response = customerService.getBookingByClinicId(clinicId);
	if(response != null && response.getData() == null) {
		 return ResponseEntity.status(response.getStatus()).body(response);
	 }else if(response != null && response.getData() != null) {
		 return ResponseEntity.status(response.getStatus()).body(response.getData());}
		 else {
			 return null;
		 }}



//// RATINGS APIS

@PostMapping("/submitCustomerRating")
public ResponseEntity<Response> submitCustomerRating(@RequestBody CustomerRatingDomain ratingRequest) {
    Response response = customerService.submitCustomerRating(ratingRequest);
    if(response != null && response.getStatus() != 0) {
		 return ResponseEntity.status(response.getStatus()).body(response);
	 }else {
			return null;
}
}

@GetMapping("/getRatingInfo/{hospitalId}/{doctorId}")
public ResponseEntity<Response> getRatingInfo(@PathVariable String hospitalId, @PathVariable String doctorId) {
	 Response response = customerService.getRatingForService( hospitalId,doctorId);
	 if(response != null && response.getStatus() != 0) {
		 return ResponseEntity.status(response.getStatus()).body(response);
	 }else {
			return null;
		}
}


@GetMapping("/getAverageRating/{hospitalId}/{doctorId}")
public ResponseEntity<Response> getRatingAverageRating(@PathVariable String hospitalId, @PathVariable String doctorId) {
	 Response response = customerService.getAverageRating( hospitalId,doctorId);
	 if(response != null && response.getStatus() != 0) {
		 return ResponseEntity.status(response.getStatus()).body(response);
	 }else {
			return null;
		}
}

  
   //DOCTORSINFO
   
   @GetMapping("/getDoctorsAndClinicDetails/{hospitalId}/{subServiceId}")
   public ResponseEntity<Object> getDoctorsAndClinicDetails(@PathVariable String hospitalId,
                                                                 @PathVariable String subServiceId)throws JsonProcessingException{
	  Response response= customerService.getDoctorsandHospitalDetails(hospitalId, subServiceId);
	  if(response != null) {
			 return ResponseEntity.status(response.getStatus()).body(response.getData());}
			 else {
				 return null;
			 }
	   
   }
   
   //DOCTORANDHOSPITALDETAILSBYSUBSERVICEID
   
   @GetMapping("/getDoctorAndHospitalDetailsBySubServiceId/{subServiceId}")
   public ResponseEntity<Object> getDetailsBySubServiceIdAndConsultationType(@PathVariable String subServiceId){
	  Response response= customerService.getHospitalsAndDoctorsDetailsBySubServiceId(subServiceId);
	  if(response != null) {
			 return ResponseEntity.status(response.getStatus()).body(response.getData());}
			 else {
				 return null;
			 }
	    }
   
   
   //CATEGORYANDSERVICES
   
   @GetMapping("/getServiceById/{categoryId}")
   public ResponseEntity<Object> getServiceById(@PathVariable String categoryId) {
   	Response response = customerService.getServiceById(categoryId);
   	if(response != null && response.getData() == null) {
   		 return ResponseEntity.status(response.getStatus()).body(response);
   	 }else if(response != null && response.getData() != null ) {
   		 return ResponseEntity.status(response.getStatus()).body(response.getData());
   	 }
   	else {
   			return null;}
   }

   
   @GetMapping("/getSubServicesByServiceId/{serviceId}")
   public ResponseEntity<?> getSubServicesByServiceId(@PathVariable String serviceId){
   	Response response = customerService.getSubServicesByServiceId(serviceId);
   	 if(response != null && response.getStatus() != 0) {
   		 return ResponseEntity.status(response.getStatus()).body(response);
   	 }else {
   			return null;}
       }
  

   @GetMapping("/getSubServiceInfo/{subServiceId}")
   public ResponseEntity<Object> getSubServiceInfoBySubServiceId(@PathVariable String subServiceId)throws JsonProcessingException{
	   Response response = customerService.getSubServiceInfoBySubServiceId(subServiceId);
		if(response != null) {
			 return ResponseEntity.status(response.getStatus()).body(response);
			 }else{
				 return null;
			 }
   }
   
   @GetMapping("/getAllCategories")
  	public ResponseEntity<?> getAllCategory() {
      	Response response = customerService.getAllCategory();
      	if(response != null && response.getData() == null) {
  			 return ResponseEntity.status(response.getStatus()).body(response);
  		 }else if(response != null && response.getData() != null ) {
  			 return ResponseEntity.status(response.getStatus()).body(response.getData());
  		 }
  		else {
  				return null;}}
   
   
   //NOTIFICATION
   
   @GetMapping("/customerNotification/{customerMobileNumber}")
   public ResponseEntity<ResBody<List<NotificationToCustomer>>> notificationToCustomer(
			 @PathVariable String customerMobileNumber){
	   return customerService.notificationToCustomer(customerMobileNumber);
   }
   
   
}
