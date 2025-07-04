package com.dermacare.category_services.service.Impl;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import com.dermacare.category_services.dto.ServicesDto;
import com.dermacare.category_services.entity.Category;
import com.dermacare.category_services.entity.Services;
import com.dermacare.category_services.entity.SubServices;
import com.dermacare.category_services.repository.CategoryRepository;
import com.dermacare.category_services.repository.ServicesRepository;
import com.dermacare.category_services.repository.SubServiceRepository;
import com.dermacare.category_services.service.ServicesService;
import com.dermacare.category_services.util.HelperForConversion;
import com.dermacare.category_services.util.ResponseStructure;

@Service
public class ServicesServiceImpl implements ServicesService {

	@Autowired
	private ServicesRepository servicesRepository;

	@Autowired
	private CategoryRepository categoryRepository;
	
	@Autowired
	public SubServiceRepository subServiceRepository;
	
	public ResponseStructure<ServicesDto> addService(ServicesDto dto) {
	    try {
	        Optional<Category> optionalCategory = categoryRepository.findById(new ObjectId(dto.getCategoryId()));

	        if (optionalCategory.isEmpty()) {
	            return ResponseStructure.buildResponse(null, "Invalid categoryId: " + dto.getCategoryId(),
	                    HttpStatus.BAD_REQUEST, HttpStatus.BAD_REQUEST.value());
	        }

	        Category category = optionalCategory.get();
	        dto.setCategoryName(category.getCategoryName());

	        Services service = HelperForConversion.toEntity(dto);
	        Services savedService = servicesRepository.save(service);

	        return ResponseStructure.buildResponse(HelperForConversion.toDto(savedService), 
	                "Service Created Successfully", HttpStatus.CREATED, HttpStatus.CREATED.value());

	    } catch (Exception e) {
	        return ResponseStructure.buildResponse(null, "An unexpected error occurred: " + e.getMessage(),
	                HttpStatus.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR.value());
	    }
	}


	public List<ServicesDto> getServicesByCategoryId(String categoryId) {

		List<Services> listOfService = servicesRepository.findByCategoryId(new ObjectId(categoryId));

		if (listOfService.isEmpty()) {
			return null;
		}
		return HelperForConversion.toServiceDtos(listOfService);
	}

	public ServicesDto getServiceById(String serviceId) {
		Services service = servicesRepository.findById(new ObjectId(serviceId)).
				orElseThrow(()-> new RuntimeException("Service Not Found With ServiceId: "+serviceId));
		if (service == null) {
			return null;
		}
		return HelperForConversion.toDto(service);
	}

	
	public void deleteServiceById(String serviceId) {
		servicesRepository.deleteById(new ObjectId(serviceId));
	}

	
	public ServicesDto updateService(String serviceId, ServicesDto domainService) {
	   
	    Optional<Services> optionalService = servicesRepository.findById(new ObjectId(serviceId));
	    if (optionalService.isEmpty()) {
	        throw new RuntimeException("Service not found with ID: " + serviceId);
	    }
	    Services existingService = optionalService.get();   
	    Optional<Category> categoryOpt = categoryRepository.findById(new ObjectId(domainService.getCategoryId()));
	    if (categoryOpt.isEmpty()) {
	        throw new RuntimeException("Invalid categoryId: " + domainService.getCategoryId());
	    }
	   if(domainService.getCategoryId()!=null) {
		   existingService.setCategoryId(new ObjectId(domainService.getCategoryId()));
	   }
      if(domainService.getCategoryName()!=null) {
    	  existingService.setCategoryName(domainService.getCategoryName());  
	   }
      if(domainService.getServiceId()!=null) {
    	  existingService.setServiceId(new ObjectId(domainService.getServiceId()));
       }
      if(domainService.getServiceName()!=null) {
    	  existingService.setServiceName(domainService.getServiceName());
      }
      if(domainService.getServiceImage()!=null) {
    	  existingService.setServiceImage(Base64.getDecoder().decode(domainService.getServiceImage()));  
	   }
      if(domainService.getDescription()!=null) {
    	  existingService.setDescription(domainService.getDescription());  
	   }
	    Services updatedService = servicesRepository.save(existingService);

	  List<SubServices> relatedSubServices = subServiceRepository.findByServiceName(updatedService.getServiceName());
	    for (SubServices sub : relatedSubServices) {
	        sub.setServiceName(domainService.getServiceName());
	    }
	    subServiceRepository.saveAll(relatedSubServices);

	    return HelperForConversion.toDto(updatedService);
	}


	public void deleteService(String serviceId) {
	    // Step 1: Fetch the existing service to ensure it exists
	    Optional<Services> optionalService = servicesRepository.findById(new ObjectId(serviceId));
	    if (optionalService.isEmpty()) {
	        throw new RuntimeException("Service not found with ID: " + serviceId);
	    }

	    Services existingService = optionalService.get();
	    String serviceNameToDelete = existingService.getServiceName(); // Needed for related SubServices

	    // Step 2: Find and delete related subservices based on the serviceName
	    List<SubServices> relatedSubServices = subServiceRepository.findByServiceName(serviceNameToDelete);
	    for (SubServices subService : relatedSubServices) {
	        subServiceRepository.delete(subService);  // Delete each related subservice
	    }

	    // Step 3: Now delete the service itself
	    servicesRepository.delete(existingService);
	}

	public void deleteServicesByCategoryId(ObjectId objectId) {
		List<Services> listOfSubServices = servicesRepository.findByCategoryId(objectId);
		if (!listOfSubServices.isEmpty()) {
			servicesRepository.deleteAllByCategoryId(objectId);
		}
	}

	public List<ServicesDto> getAllServices() {

		List<Services> listOfServices = servicesRepository.findAll();
		if (listOfServices.isEmpty()) {
			return new ArrayList<>();
		}
		return HelperForConversion.toServiceDtos(listOfServices);
	}

	public boolean checkServiceExistsAlready(String categoryId, String serviceName) {
		Optional<Services> optional = servicesRepository
				.findByCategoryIdAndServiceNameIgnoreCase(new ObjectId(categoryId), serviceName);
		if (optional.isPresent()) {
			return true;
		}
	return false;
	}

}