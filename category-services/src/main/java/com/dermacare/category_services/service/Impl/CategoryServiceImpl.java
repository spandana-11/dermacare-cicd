package com.dermacare.category_services.service.Impl;

import java.util.Base64;
import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dermacare.category_services.dto.CategoryDto;
import com.dermacare.category_services.entity.Category;
import com.dermacare.category_services.entity.Services;
import com.dermacare.category_services.entity.SubServices;
import com.dermacare.category_services.entity.SubServicesInfoEntity;
import com.dermacare.category_services.repository.CategoryRepository;
import com.dermacare.category_services.repository.ServicesRepository;
import com.dermacare.category_services.repository.SubServiceRepository;
import com.dermacare.category_services.repository.SubServicesInfoRepository;
import com.dermacare.category_services.service.CategoryService;
import com.dermacare.category_services.service.ServicesService;
import com.dermacare.category_services.util.HelperForConversion;

@Service
public class CategoryServiceImpl implements CategoryService {

	@Autowired
	private CategoryRepository repository;

	@Autowired
	private ServicesRepository serviceManagmentRepository;

	@Autowired
	private ServicesService service;
	
	@Autowired
	public SubServiceRepository subServiceRepository;
	
	@Autowired
	private SubServicesServiceImpl subService;
	
	@Autowired
	private SubServicesInfoRepository subServicesInfoRepository;

	public CategoryDto addCategory(CategoryDto dto) {
		Category category = HelperForConversion.toEntity(dto);
		Category savedCategory = repository.save(category);
		return HelperForConversion.toDto(savedCategory);
	}

	public boolean existsByCategoryNameIgnoreCase(String categoryName) {
		Optional<Category> category = repository.existsByCategoryNameIgnoreCase(categoryName);
		return category.isPresent();
	}

	public List<CategoryDto> findAllCategories() {
		List<Category> listOfCategories = repository.findAll();
		if (listOfCategories.isEmpty()) {
			return null;
		}
		return HelperForConversion.converToDtos(listOfCategories);
	}

	public CategoryDto getCategorById(String categoryId) {
		Category category = repository.findById(new ObjectId(categoryId)).orElseThrow(
				()->new RuntimeException("Category Not found With : "+categoryId));
		return HelperForConversion.toDto(category);
	}

	public CategoryDto updateCategoryById(ObjectId categoryId, CategoryDto updateDto) {
	    // Fetch existing category
	    Category existing = repository.findById(categoryId)
	        .orElseThrow(() -> new RuntimeException("Category not found with ID: " + categoryId));

	    // Prevent duplicate name
	    Optional<Category> optional = repository.findByCategoryName(updateDto.getCategoryName());
	    if (optional.isPresent() && !optional.get().getCategoryId().equals(categoryId)) {
	        throw new RuntimeException("Duplicate category name found: " + updateDto.getCategoryName());
	    }

	    String oldCategoryName = existing.getCategoryName();

	    // Update image (if provided)
	    if (updateDto.getCategoryImage() != null) {
	        byte[] categoryImageBytes = Base64.getDecoder().decode(updateDto.getCategoryImage());
	        existing.setCategoryImage(categoryImageBytes);
	    }

	    // Update main fields
	    existing.setCategoryName(updateDto.getCategoryName());
	    existing.setDescription(updateDto.getDescription());
	    Category savedCategory = repository.save(existing);

	    // Update Services
	    List<Services> services = serviceManagmentRepository.findByCategoryName(oldCategoryName);
	    System.out.println("Found Services: " + services.size());
	    for (Services service : services) {
	        service.setCategoryName(updateDto.getCategoryName());
	    }
	    serviceManagmentRepository.saveAll(services);

	    // Update SubServices
	    List<SubServices> subServices = subServiceRepository.findByCategoryName(oldCategoryName);
	    System.out.println("Found SubServices: " + subServices.size());
	    for (SubServices subService : subServices) {
	        subService.setCategoryName(updateDto.getCategoryName());
	    }
	    subServiceRepository.saveAll(subServices);

	    // ✅ Update SubServicesInfoEntity
	    List<SubServicesInfoEntity> subServiceInfos = subServicesInfoRepository.findByCategoryName(oldCategoryName);
	    System.out.println("Found SubServiceInfos: " + subServiceInfos.size());
	    for (SubServicesInfoEntity info : subServiceInfos) {
	        info.setCategoryName(updateDto.getCategoryName());
	    }
	    subServicesInfoRepository.saveAll(subServiceInfos);

	    return HelperForConversion.toDto(savedCategory);
	}



	@Override
	public boolean findByCategoryId(String categoryId) {
		Optional<Category> optional = repository.findById(new ObjectId());
		return optional.isPresent();
	}

	

	public void deleteCategoryById(ObjectId categoryId) {
	    // Fetch the existing category
	    Category existingCategory = repository.findById(categoryId)
	        .orElseThrow(() -> new RuntimeException("Category not found with ID: " + categoryId));

	    String categoryName = existingCategory.getCategoryName();

	    // Delete related services
	    List<Services> services = serviceManagmentRepository.findByCategoryName(categoryName);
	    if (!services.isEmpty()) {
	        System.out.println("Found Services: " + services.size());
	        serviceManagmentRepository.deleteAll(services);
	    }

	    // Delete related subservices
	    List<SubServices> subServices = subServiceRepository.findByCategoryName(categoryName);
	    if (!subServices.isEmpty()) {
	        System.out.println("Found SubServices: " + subServices.size());
	        subServiceRepository.deleteAll(subServices);
	    }

	    // Delete related SubServiceInfo entities
	    List<SubServicesInfoEntity> subServiceInfos = subServicesInfoRepository.findByCategoryName(categoryName);
	    if (!subServiceInfos.isEmpty()) {
	        System.out.println("Found SubServiceInfos: " + subServiceInfos.size());
	        subServicesInfoRepository.deleteAll(subServiceInfos);
	    }

	    // Finally, delete the category
	    repository.deleteById(categoryId);
	}

}
