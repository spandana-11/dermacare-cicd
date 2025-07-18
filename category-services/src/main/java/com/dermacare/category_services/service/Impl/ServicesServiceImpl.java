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
	        // Validate serviceName
	        if (dto.getServiceName() == null || dto.getServiceName().trim().isEmpty()) {
	            return ResponseStructure.buildResponse(null,
	                "Service name must not be null or empty.",
	                HttpStatus.BAD_REQUEST, HttpStatus.BAD_REQUEST.value());
	        }

	        // Validate categoryId
	        if (dto.getCategoryId() == null || dto.getCategoryId().trim().isEmpty()) {
	            return ResponseStructure.buildResponse(null,
	                "Category ID must not be null or empty.",
	                HttpStatus.BAD_REQUEST, HttpStatus.BAD_REQUEST.value());
	        }

	        // Optional validation: you can also check if image and description are empty strings
	        if (dto.getServiceImage() != null && dto.getServiceImage().trim().isEmpty()) {
	            return ResponseStructure.buildResponse(null,
	                "Service image is provided but empty.",
	                HttpStatus.BAD_REQUEST, HttpStatus.BAD_REQUEST.value());
	        }

	        Optional<Category> optionalCategory = categoryRepository.findById(new ObjectId(dto.getCategoryId()));
	        if (optionalCategory.isEmpty()) {
	            return ResponseStructure.buildResponse(null,
	                "Invalid categoryId: " + dto.getCategoryId(),
	                HttpStatus.BAD_REQUEST, HttpStatus.BAD_REQUEST.value());
	        }

	        Category category = optionalCategory.get();
	        dto.setCategoryName(category.getCategoryName());

	        Services service = HelperForConversion.toEntity(dto);
	        Services savedService = servicesRepository.save(service);

	        return ResponseStructure.buildResponse(HelperForConversion.toDto(savedService),
	            "Service Created Successfully", HttpStatus.CREATED, HttpStatus.CREATED.value());

	    } catch (Exception e) {
	        return ResponseStructure.buildResponse(null,
	            "An unexpected error occurred: " + e.getMessage(),
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

	
	public ResponseStructure<ServicesDto> updateService(String serviceId, ServicesDto dto) {
	    try {
	        Optional<Services> optionalService = servicesRepository.findById(new ObjectId(serviceId));
	        if (optionalService.isEmpty()) {
	            return ResponseStructure.buildResponse(null, 
	                "Service not found with ID: " + serviceId,
	                HttpStatus.NOT_FOUND, HttpStatus.NOT_FOUND.value());
	        }

	        if (dto.getServiceName() == null || dto.getServiceName().trim().isEmpty()) {
	            return ResponseStructure.buildResponse(null, 
	                "Service name must not be null or empty.",
	                HttpStatus.BAD_REQUEST, HttpStatus.BAD_REQUEST.value());
	        }

	        // Check for duplicate service name
	        Optional<Services> duplicateNameService = servicesRepository.findByServiceName(dto.getServiceName().trim());
	        if (duplicateNameService.isPresent() && 
	            !duplicateNameService.get().getServiceId().toString().equals(serviceId)) {
	            return ResponseStructure.buildResponse(null, 
	                "Service name already exists: " + dto.getServiceName(),
	                HttpStatus.CONFLICT, HttpStatus.CONFLICT.value());
	        }

	        Optional<Category> optionalCategory = categoryRepository.findById(new ObjectId(dto.getCategoryId()));
	        if (optionalCategory.isEmpty()) {
	            return ResponseStructure.buildResponse(null, 
	                "Invalid categoryId: " + dto.getCategoryId(),
	                HttpStatus.BAD_REQUEST, HttpStatus.BAD_REQUEST.value());
	        }

	        Category category = optionalCategory.get();
	        dto.setCategoryName(category.getCategoryName());

	        Services existingService = optionalService.get();

	        // Update fields only if they are provided
	        if (dto.getCategoryId() != null) {
	            existingService.setCategoryId(new ObjectId(dto.getCategoryId()));
	        }
	        if (dto.getCategoryName() != null) {
	            existingService.setCategoryName(dto.getCategoryName());
	        }
	        if (dto.getServiceId() != null) {
	            existingService.setServiceId(new ObjectId(dto.getServiceId()));
	        }

	        existingService.setServiceName(dto.getServiceName().trim()); // Already validated
	        if (dto.getServiceImage() != null) {
	            existingService.setServiceImage(Base64.getDecoder().decode(dto.getServiceImage()));
	        }
	        if (dto.getDescription() != null) {
	            existingService.setDescription(dto.getDescription());
	        }

	        Services updatedService = servicesRepository.save(existingService);

	        // Update related sub-services
	        List<SubServices> relatedSubServices = subServiceRepository.findByServiceName(updatedService.getServiceName());
	        for (SubServices sub : relatedSubServices) {
	            sub.setServiceName(dto.getServiceName());
	        }
	        subServiceRepository.saveAll(relatedSubServices);

	        return ResponseStructure.buildResponse(
	            HelperForConversion.toDto(updatedService),
	            "Service updated successfully", 
	            HttpStatus.OK, HttpStatus.OK.value()
	        );

	    } catch (Exception e) {
	        return ResponseStructure.buildResponse(null, 
	            "An unexpected error occurred: " + e.getMessage(),
	            HttpStatus.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR.value());
	    }
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