package com.dermacare.category_services.service.Impl;

import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import com.dermacare.category_services.dto.CategoryServiceandSubserviceDto;
import com.dermacare.category_services.dto.SubServiceDTO;
import com.dermacare.category_services.dto.SubServicesDto;
import com.dermacare.category_services.entity.Services;
import com.dermacare.category_services.entity.SubServiceInfoEntity;
import com.dermacare.category_services.entity.SubServices;
import com.dermacare.category_services.entity.SubServicesInfoEntity;
import com.dermacare.category_services.repository.CategoryRepository;
import com.dermacare.category_services.repository.ServicesRepository;
import com.dermacare.category_services.repository.SubServiceRepository;
import com.dermacare.category_services.repository.SubServicesInfoRepository;
import com.dermacare.category_services.service.SubServicesService;
import com.dermacare.category_services.util.HelperForConversion;
import com.dermacare.category_services.util.ResponseStructure;

@Service
public class SubServicesServiceImpl implements SubServicesService {

	@Autowired
	public SubServiceRepository subServiceRepository;
	
	@Autowired
	public ServicesRepository serviceRepository;
	
	@Autowired
	public CategoryRepository categoryRepository;
	
	@Autowired
	private SubServicesInfoRepository subServicesInfoRepository;
	
	

	private double CalculateDiscountAmount(byte discountpercentage, double price) {

		if (discountpercentage <= 0 || price <= 0) {
			return 0;
		}
		return price * (discountpercentage / 100.0);
	}

	private double CalculateTaxAmount(byte taxPercentage, double price) {
		if (taxPercentage <= 0 || price <= 0) {
			return 0;
		}
		return (taxPercentage / 100.0) * price;
	}

	private double calcualatePlatfomFee(byte  platformFeePercentage , double price) {
		
		if ( platformFeePercentage <= 0 || price <= 0) {
			return 0;
		}
		return ( platformFeePercentage / 100.0) * price;

	}
	
	public void  calculateAmounts(SubServices entity) {
		double discountAmount=CalculateDiscountAmount(entity.getDiscountPercentage(), entity.getPrice());
		double taxAmount=CalculateTaxAmount(entity.getTaxPercentage(),entity.getPrice());
		double platfromFee=calcualatePlatfomFee(entity.getPlatformFeePercentage(),entity.getPrice());
		entity.setDiscountAmount(discountAmount);
		entity.setTaxAmount(taxAmount);
		entity.setPlatformFee(platfromFee);
		entity.setDiscountedCost(entity.getPrice()-discountAmount);
		entity.setClinicPay(entity.getPrice()-platfromFee);
		entity.setFinalCost(entity.getPrice()-discountAmount+taxAmount);
	}

		
	public  ResponseEntity<ResponseStructure<SubServicesDto>> addSubService(String subServiceId,SubServicesDto dto) {
		try {
		SubServices optionalService = subServiceRepository.findByHospitalIdAndSubServiceIdAndSubServiceNameIgnoreCase(dto.getHospitalId(),new ObjectId(subServiceId),dto.getSubServiceName());
		if (optionalService == null) {
		SubServicesInfoEntity sub = subServicesInfoRepository.findBySubServicesSubServiceId(subServiceId);
		dto.setCategoryId(sub.getCategoryId());
		dto.setCategoryName(sub.getCategoryName());
		for(SubServiceInfoEntity e :sub.getSubServices()) {
			if(e.getSubServiceId().equals( subServiceId)) {
		dto.setServiceId(e.getServiceId());
		dto.setServiceName(e.getServiceName());}}
		dto.setSubServiceId(subServiceId);
	    SubServices subService = HelperForConversion.toEntity(dto);
	    calculateAmounts(subService);
	    SubServices savedSubService = subServiceRepository.save(subService);
	    return new  ResponseEntity<ResponseStructure<SubServicesDto>>(ResponseStructure.buildResponse(HelperForConversion.toDto(savedSubService), "Service Created  successfully.",
				HttpStatus.CREATED, HttpStatus.CREATED.value()), HttpStatus.CREATED);
		}else {
	    	 return new  ResponseEntity<ResponseStructure<SubServicesDto>>(ResponseStructure.buildResponse(null, "SubService Already Exist.",
	 				HttpStatus.CONFLICT, HttpStatus.CONFLICT.value()), HttpStatus.CONFLICT);
	    }
	}catch(Exception e) {
		 return new  ResponseEntity<ResponseStructure<SubServicesDto>>(ResponseStructure.buildResponse(null, e.getMessage(),
					HttpStatus.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR.value()), HttpStatus.INTERNAL_SERVER_ERROR);
	}}
	
	
	public List<SubServicesDto> getSubServicesByServiceId(String serviceId) {

		List<SubServices> listOfSubService = subServiceRepository.findByServiceId(new ObjectId(serviceId));

		if (listOfSubService.isEmpty()) {
			return null;
		}
		return HelperForConversion.toDtos(listOfSubService);
	}

	public List<SubServicesDto> getSubServicesByCategoryId(String categoryId) {

		List<SubServices> listOfSubService = subServiceRepository.findByCategoryId(new ObjectId(categoryId));

		if (listOfSubService.isEmpty()) {
			return null;
		}
		return HelperForConversion.toDtos(listOfSubService);
	}
	

	public SubServicesDto getSubServiceById(String hospitalId, String subServiceId) {
		SubServices optionalService = subServiceRepository.findByHospitalIdAndSubServiceId(hospitalId,new ObjectId(subServiceId));
		if (optionalService == null) {
			return null;
		}
		return HelperForConversion.toDto(optionalService);
	}
	

	public void deleteSubServiceById(String hospitalId, String subServiceId) {
		subServiceRepository.deleteByHospitalIdAndSubServiceId(hospitalId,new ObjectId(subServiceId));
	}
	
	
	public SubServicesDto updateSubService(String hospitalId,String subServiceId,SubServicesDto domainService) {
		SubServices optionalSubService = subServiceRepository.findByHospitalIdAndSubServiceId(hospitalId,new ObjectId(subServiceId));
		
		if (optionalSubService == null) {
			throw new RuntimeException("SubService not found with ID: " + subServiceId);
		}
		if(domainService.getCategoryId() != null) {
			optionalSubService.setCategoryId(new ObjectId(domainService.getCategoryId()));
		}
		if(domainService.getCategoryName() != null) {
			optionalSubService.setCategoryName(domainService.getCategoryName());
		}
		if(domainService.getDescriptionQA() != null) {
			optionalSubService.setDescriptionQA(domainService.getDescriptionQA());
		}
		if(domainService.getDiscountAmount() != 0.0) {
			optionalSubService.setDiscountAmount(domainService.getDiscountAmount());
		}
		if(domainService.getDiscountedCost()!= 0.0) {
			optionalSubService.setDiscountedCost(domainService.getDiscountedCost());
		}
		if(domainService.getDiscountPercentage()!= 0.0) {
			optionalSubService.setDiscountPercentage(domainService.getDiscountPercentage());
		}
		if(domainService.getFinalCost()!= 0.0) {
			optionalSubService.setFinalCost(domainService.getFinalCost());
		}
		if(domainService.getHospitalId()!= null) {
			optionalSubService.setHospitalId(domainService.getHospitalId());
		}
		if(domainService.getMinTime()!= null) {
			optionalSubService.setMinTime(domainService.getMinTime());
		}
		if(domainService.getPlatformFee()!= 0.0) {
			optionalSubService.setPlatformFee(domainService.getPlatformFee());
		}		
		if(domainService.getPlatformFeePercentage()!= 0.0) {
			optionalSubService.setPlatformFeePercentage(domainService.getPlatformFeePercentage());
		}
		if(domainService.getPrice()!= 0.0) {
			optionalSubService.setPrice(domainService.getPrice());
		}
		if(domainService.getServiceId()!= null) {
			optionalSubService.setServiceId(new ObjectId(domainService.getServiceId()));
		}
		if(domainService.getServiceName()!= null) {
			optionalSubService.setServiceName(domainService.getServiceName());
		}
		if(domainService.getSubServiceImage()!= null) {
			optionalSubService.setSubServiceImage(Base64.getDecoder().decode(domainService.getSubServiceImage()));
		}
		if(domainService.getTaxAmount()!= 0.0) {
			optionalSubService.setTaxAmount(domainService.getTaxAmount());
		}
		if(domainService.getTaxPercentage()!= 0.0) {
			optionalSubService.setTaxPercentage(domainService.getTaxPercentage());
		}
		if(domainService.getViewDescription()!= null) {
			optionalSubService.setViewDescription(domainService.getViewDescription());
		}
		if(domainService.getSubServiceName()!= null) {
			optionalSubService.setSubServiceName(domainService.getSubServiceName());
		}
		if(domainService.getSubServiceId()!= null) {
			optionalSubService.setSubServiceId(new ObjectId(domainService.getSubServiceId()));
		}
	SubServices subServices = subServiceRepository.save(optionalSubService);
	return HelperForConversion.toDto(subServices);
	}
	
	
	public void deleteSubServicesByCategoryId(ObjectId objectId) {
		List<SubServices> listOfSubServices = subServiceRepository.findByCategoryId(objectId);
		if (!listOfSubServices.isEmpty()) {
			subServiceRepository.deleteByCategoryId(objectId);
		}
	}

	public List<SubServicesDto> getAllSubService() {
		
		List<SubServices> listOfSubServices = subServiceRepository.findAll();
		if (listOfSubServices.isEmpty()) {
			 return new ArrayList<>(); 
		}
		return HelperForConversion.toDtos(listOfSubServices);
	}


	public boolean checkSubServiceExistsAlready(String categoryId, String subServiceName) {
		Optional<Services> optional = subServiceRepository
				.findByServiceIdAndSubServiceNameIgnoreCase(new ObjectId(categoryId), subServiceName);
		if (optional.isPresent()) {
			return true;
		}
		return false;
	}

	public List<SubServicesDto> getAllSubServices() {
		List<SubServices> list = subServiceRepository.findAll();
		if(list.isEmpty() || list == null) {
			return null;
		}
		return HelperForConversion.toDtos(list);
	}
	
	public boolean checkServiceExistsOrNot(String serviceId) {
		Optional<Services> optional = serviceRepository
				.findByServiceId(serviceId);
		if (optional.isPresent()) {
			return true;
		}
		return false;
		
	}
	
	@Override
	public List<CategoryServiceandSubserviceDto> getGroupedSubServices() {
	    List<SubServices> allSubServices = subServiceRepository.findAll();

	    Map<String, CategoryServiceandSubserviceDto> groupedMap = new LinkedHashMap<>();

	    for (SubServices sub : allSubServices) {
	        String key = sub.getCategoryId().toString() + "-" + sub.getServiceId().toString();

	        CategoryServiceandSubserviceDto dto = groupedMap.get(key);
	        if (dto == null) {
	            dto = new CategoryServiceandSubserviceDto();
	            dto.setCategoryId(sub.getCategoryId().toString());
	            dto.setCategoryName(sub.getCategoryName());
	            dto.setServiceId(sub.getServiceId().toString());
	            dto.setServiceName(sub.getServiceName());
	            dto.setSubServices(new ArrayList<>());
	            groupedMap.put(key, dto);
	        }

	        SubServiceDTO subDto = new SubServiceDTO();
	        subDto.setSubServiceId(sub.getSubServiceId().toString());
	        subDto.setSubServiceName(sub.getSubServiceName());

	        dto.getSubServices().add(subDto);
	    }

	    return new ArrayList<>(groupedMap.values());
	}
	
	public CategoryServiceandSubserviceDto saveGroupedSubServices(CategoryServiceandSubserviceDto requestDto) {
	    List<SubServiceDTO> savedSubServices = new ArrayList<>();

	    for (SubServiceDTO subDto : requestDto.getSubServices()) {
	        SubServices sub = new SubServices();
	        sub.setCategoryId(new ObjectId(requestDto.getCategoryId()));
	        sub.setCategoryName(requestDto.getCategoryName());
	        sub.setServiceId(new ObjectId(requestDto.getServiceId()));
	        sub.setServiceName(requestDto.getServiceName());
	        sub.setSubServiceName(subDto.getSubServiceName());
	        SubServices saved = subServiceRepository.save(sub);
	        SubServiceDTO savedDto = new SubServiceDTO();
	        savedDto.setSubServiceId(saved.getSubServiceId().toString());
	        savedDto.setSubServiceName(saved.getSubServiceName());
	        savedSubServices.add(savedDto);
	    }

	    CategoryServiceandSubserviceDto response = new CategoryServiceandSubserviceDto();
	    response.setCategoryId(requestDto.getCategoryId());
	    response.setCategoryName(requestDto.getCategoryName());
	    response.setServiceId(requestDto.getServiceId());
	    response.setServiceName(requestDto.getServiceName());
	    response.setSubServices(savedSubServices);

	    return response;
	}
	
	
	
//	-------------------------------------- Get Subservice by hospitalId---------------------------
	@Override
	public List<SubServicesDto> getSubServiceByHospitalId(String hospitalId) {
	    List<SubServices> subServices = subServiceRepository.findByHospitalId(hospitalId);

	    if (subServices == null || subServices.isEmpty()) {
	        return Collections.emptyList();
	    }

	    List<SubServicesDto> dtoList = new ArrayList<>();

	    for (SubServices service : subServices) {
	        SubServicesDto dto = new SubServicesDto();

	        // Handle nested object
	        if (service.getSubServiceId() != null) {
	            dto.setSubServiceId(service.getSubServiceId().toString());
	        }
	        dto.setHospitalId(service.getHospitalId());
	        dto.setSubServiceName(service.getSubServiceName());
	        dto.setServiceId(service.getServiceId().toString());
	        dto.setServiceName(service.getServiceName());
	        dto.setCategoryName(service.getCategoryName());
	        dto.setCategoryId(service.getCategoryId().toString());
	        dto.setViewDescription(service.getViewDescription());
	        if (service.getSubServiceImage() != null) {
	           String image = Base64.getEncoder().encodeToString(service.getSubServiceImage());
	           dto.setSubServiceImage(image);}
	        dto.setStatus(service.getStatus());
	        dto.setMinTime(service.getMinTime());
	        dto.setDescriptionQA(service.getDescriptionQA());
	        dto.setPrice(service.getPrice());
	        dto.setDiscountPercentage(service.getDiscountPercentage());
	        dto.setTaxPercentage(service.getTaxPercentage());
	        dto.setPlatformFeePercentage(service.getPlatformFeePercentage());
	        dto.setDiscountAmount(service.getDiscountAmount());
	        dto.setTaxAmount(service.getTaxAmount());
	        dto.setPlatformFee(service.getPlatformFee());
	        dto.setDiscountedCost(service.getDiscountedCost());
	        dto.setClinicPay(service.getClinicPay());
	        dto.setFinalCost(service.getFinalCost());

	        dtoList.add(dto);
	    }

	    return dtoList;
	}
	
	
	public boolean checkSubserviceNameExistOrNot(String hospitalId,String subServiceId,SubServicesDto domainService) {
		try {
		SubServices optionalService = subServiceRepository.findByHospitalIdAndSubServiceIdAndSubServiceNameIgnoreCase(hospitalId,
				new ObjectId(subServiceId),domainService.getSubServiceName());
		if(optionalService != null) {
			return true;}
		else {
			return false;
		}}catch(Exception e) {
			return false;
		}
	
}
}
