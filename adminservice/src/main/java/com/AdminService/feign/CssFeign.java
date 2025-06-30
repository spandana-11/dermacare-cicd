package com.AdminService.feign;

import java.util.List;
import org.bson.types.ObjectId;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.AdminService.dto.CategoryDto;
import com.AdminService.dto.ServicesDto;
import com.AdminService.dto.SubServicesInfoDto;
import com.AdminService.util.Response;
import com.AdminService.util.ResponseStructure;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;


@FeignClient(name = "category-services")
public interface CssFeign {
		
	@CircuitBreaker(name = "circuitBreaker", fallbackMethod = "addNewCategoryFallBack")
    @PostMapping("/api/v1/category/addCategory")
    ResponseEntity<ResponseStructure<CategoryDto>> addNewCategory(@RequestBody CategoryDto dto);
	
    @GetMapping("/api/v1/category/getCategories")
    @CircuitBreaker(name = "circuitBreaker", fallbackMethod = "getAllCategoryFallBack")
    ResponseEntity<ResponseStructure<List<CategoryDto>>> getAllCategory();
	
    @GetMapping("/api/v1/category/getCategory/{categoryId}")
    @CircuitBreaker(name = "circuitBreaker", fallbackMethod = "getCategoryByIdFallBack")
	public ResponseEntity<ResponseStructure<CategoryDto>> 
    getCategoryById(@PathVariable("categoryId") String categoryId) ;
	
    @DeleteMapping("/api/v1/category/deleteCategory/{categoryId}")
    @CircuitBreaker(name = "circuitBreaker", fallbackMethod = "deleteCategoryFallBack")
    public ResponseEntity<ResponseStructure<String>> deleteCategory(@PathVariable ObjectId categoryId);  // Use string for compatibility
	
    @PutMapping("/api/v1/category/updateCategory/{categoryId}")
    @CircuitBreaker(name = "circuitBreaker", fallbackMethod = "updateCategoryFallBack")
    ResponseEntity<ResponseStructure<CategoryDto>> updateCategory(
            @PathVariable("categoryId") ObjectId categoryId,
            @RequestBody CategoryDto updatedCategory);
    
    
    //SERVICES
    
    @PostMapping("/api/v1/services/addService")
    @CircuitBreaker(name = "circuitBreaker", fallbackMethod = "addServiceFallBack")
	public ResponseEntity<ResponseStructure<ServicesDto>> addService(@RequestBody ServicesDto dto);
	
	@GetMapping("/api/v1/services/getServices/{categoryId}")
	 @CircuitBreaker(name = "circuitBreaker", fallbackMethod = "getServiceByIdFallBack")
	public ResponseEntity<ResponseStructure<List<ServicesDto>>> getServiceById(@PathVariable String categoryId);

	@GetMapping("/api/v1/services/getService/{serviceId}")
	 @CircuitBreaker(name = "circuitBreaker", fallbackMethod = "getServiceByServiceIdFallBack")
	public ResponseEntity<ResponseStructure<ServicesDto>> getServiceByServiceId(@PathVariable String serviceId);
	
	@DeleteMapping("/api/v1/services/deleteService/{serviceId}")
	@CircuitBreaker(name = "circuitBreaker", fallbackMethod = "deleteServiceFallBack")
	public ResponseEntity<ResponseStructure<String>> deleteService(@PathVariable String serviceId);	

	@PutMapping("/api/v1/services/updateService/{serviceId}")
	 @CircuitBreaker(name = "circuitBreaker", fallbackMethod = "updateByServiceIdFallBack")
	public ResponseEntity<ResponseStructure<ServicesDto>> updateByServiceId(@PathVariable String serviceId,
			@RequestBody ServicesDto domainServices);
	
	@GetMapping("/api/v1/services/getAllServices")
	 @CircuitBreaker(name = "circuitBreaker", fallbackMethod = "getAllServicesFallBack")
	public ResponseEntity<ResponseStructure<List<ServicesDto>>> getAllServices();
	
	
	// SUBSERVICES
	
	@PostMapping("/api/v1/SubServicesInfo/addSubService")
	 @CircuitBreaker(name = "circuitBreaker", fallbackMethod = "addSubServiceFallBack")
	public ResponseEntity<Response> addSubService(@RequestBody SubServicesInfoDto dto);
	
	@GetMapping("/api/v1/SubServicesInfo/getSubServiceByIdCategory/{categoryId}")
	 @CircuitBreaker(name = "circuitBreaker", fallbackMethod = "getSubServiceByIdCategoryFallBack")
	public ResponseEntity<Response> getSubServiceByIdCategory(@PathVariable String categoryId);
	
	@GetMapping("/api/v1/SubServicesInfo/getSubServicesByServiceId/{serviceId}")
	 @CircuitBreaker(name = "circuitBreaker", fallbackMethod = "getSubServicesByServiceIdFallBack")
	public ResponseEntity<Response> getSubServicesByServiceId(@PathVariable String serviceId);
	
	@GetMapping("/api/v1/SubServicesInfo/getSubServiceBySubServiceId/{subServiceId}")
	 @CircuitBreaker(name = "circuitBreaker", fallbackMethod = "getSubServiceBySubServiceIdFallBack")
	public ResponseEntity<Response> getSubServiceBySubServiceId(@PathVariable String subServiceId);
	
	@GetMapping("/api/v1/SubServicesInfo/getAllSubServices")
	 @CircuitBreaker(name = "circuitBreaker", fallbackMethod = "getAllSubServicesFallBack")
	public ResponseEntity<Response> getAllSubServices();
	
	@PutMapping("/api/v1/SubServicesInfo/updateBySubServiceId/{subServiceId}")
	 @CircuitBreaker(name = "circuitBreaker", fallbackMethod = "updateBySubServiceIdFallBack")
	public ResponseEntity<Response> updateBySubServiceId(@PathVariable String subServiceId,
			@RequestBody SubServicesInfoDto domainServices);
	
	@DeleteMapping("/api/v1/SubServicesInfo/deleteSubService/{subServiceId}")
	 @CircuitBreaker(name = "circuitBreaker", fallbackMethod = " deleteSubServiceFallBack")
	public ResponseEntity<Response> deleteSubService(@PathVariable String subServiceId);
	
	
	
	//CATEGORY FALLBACK METHODS
	
	default ResponseEntity<?> addNewCategoryFallBack(Throwable e){		 
		return ResponseEntity.status(503).body(new ResponseStructure<CategoryDto>(null,"Category-Service Not Available",HttpStatus.SERVICE_UNAVAILABLE,503));
		}
	
	
	default ResponseEntity<?> getAllCategoryFallBack(Exception e){		 
		return ResponseEntity.status(503).body(new ResponseStructure<List<CategoryDto>>(null,"Category-Service Not Available",HttpStatus.SERVICE_UNAVAILABLE,503));
		}
	
	default ResponseEntity<?> getCategoryByIdFallBack(Exception e){		 
		return ResponseEntity.status(503).body(new ResponseStructure<CategoryDto>(null,"Category-Service Not Available",HttpStatus.SERVICE_UNAVAILABLE,503));
		}
	
	default ResponseEntity<?> deleteCategoryFallBack(Exception e){		 
		return ResponseEntity.status(503).body(new ResponseStructure<CategoryDto>(null,"Category-Service Not Available",HttpStatus.SERVICE_UNAVAILABLE,503));
		}
	
	default ResponseEntity<?> updateCategoryFallBack(Exception e){		 
		return ResponseEntity.status(503).body(new ResponseStructure<CategoryDto>(null,"Category-Service Not Available",HttpStatus.SERVICE_UNAVAILABLE,503));
		}
	
	///SERVICE FALLBACK METHODS
	
	default ResponseEntity<?> addServiceFallBack(Exception e){		 
		return ResponseEntity.status(503).body(new ResponseStructure<CategoryDto>(null,"Category-Service Not Available",HttpStatus.SERVICE_UNAVAILABLE,503));
		}
	
	default ResponseEntity<?> getServiceByIdFallBack(Exception e){		 
		return ResponseEntity.status(503).body(new ResponseStructure<List<ServicesDto>>(null,"Category-Service Not Available",HttpStatus.SERVICE_UNAVAILABLE,503));
		}
	
	default ResponseEntity<?> getServiceByServiceIdFallBack(Exception e){		 
		return ResponseEntity.status(503).body(new ResponseStructure<CategoryDto>(null,"Category-Service Not Available",HttpStatus.SERVICE_UNAVAILABLE,503));
		}
	
	default ResponseEntity<?> deleteServiceFallBack(Exception e){		 
		return ResponseEntity.status(503).body(new ResponseStructure<CategoryDto>(null,"Category-Service Not Available",HttpStatus.SERVICE_UNAVAILABLE,503));
		}
	
	default ResponseEntity<?> updateByServiceIdFallBack(Exception e){		 
		return ResponseEntity.status(503).body(new ResponseStructure<CategoryDto>(null,"Category-Service Not Available",HttpStatus.SERVICE_UNAVAILABLE,503));
		}
	
	default ResponseEntity<?> getAllServicesFallBack(Exception e){		 
		return ResponseEntity.status(503).body(new ResponseStructure<List<ServicesDto>>(null,"Category-Service Not Available",HttpStatus.SERVICE_UNAVAILABLE,503));
		}
	
	
	/// SUBSERVICE FALLBACK METHODS
	
	default ResponseEntity<?> addSubServiceFallBack(Exception e){		 
		return ResponseEntity.status(503).body(new Response(false,null,"Category-Service Not Available",503,null,null));}
	
	default ResponseEntity<?> getSubServiceByIdCategoryFallBack(Exception e){		 
		return ResponseEntity.status(503).body(new Response(false,null,"Category-Service Not Available",503,null,null));}
	
	default ResponseEntity<?> getSubServicesByServiceIdFallBack(Exception e){		 
		return ResponseEntity.status(503).body(new Response(false,null,"Category-Service Not Available",503,null,null));}
	
	default ResponseEntity<?> getSubServiceBySubServiceIdFallBack(Exception e){		 
		return ResponseEntity.status(503).body(new Response(false,null,"Category-Service Not Available",503,null,null));}
	
	default ResponseEntity<?> getAllSubServicesFallBack(Exception e){		 
		return ResponseEntity.status(503).body(new Response(false,null,"Category-Service Not Available",503,null,null));}
	
	default ResponseEntity<?> updateBySubServiceIdFallBack(Exception e){		 
		return ResponseEntity.status(503).body(new Response(false,null,"Category-Service Not Available",503,null,null));}
	
	default ResponseEntity<?> deleteSubServiceFallBack(Exception e){		 
		return ResponseEntity.status(503).body(new Response(false,null,"Category-Service Not Available",503,null,null));}
	
    
}
