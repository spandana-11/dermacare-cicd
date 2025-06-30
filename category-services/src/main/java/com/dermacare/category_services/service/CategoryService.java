package com.dermacare.category_services.service;

import java.util.List;

import org.bson.types.ObjectId;

import com.dermacare.category_services.dto.CategoryDto;

public interface CategoryService {

	public CategoryDto addCategory(CategoryDto categoryDomain);

	public boolean findByCategoryName(String categoryName);

	public List<CategoryDto> findAllCategories();

	public CategoryDto getCategorById(String categoryId);

	public CategoryDto updateCategoryById(ObjectId categoryId, CategoryDto updateDto);
	
	public boolean findByCategoryId(String categoryId);

	public void deleteCategoryById(ObjectId categoryId);

}
