import axios from 'axios'
import {
  BASE_URL,
  AddCategory,
  CategoryAllData,
  UpdateCategory,
  deleteCategory,
} from '../../baseUrl'
import { toast } from 'react-toastify'
export const CategoryData = async () => {
  console.log('service data:, response.data')

  try {
    const response = await axios.get(`${BASE_URL}/${CategoryAllData}`)
    console.log('service data:', response.data)

    return response.data
  } catch (error) {
    console.error('Error fetching service data:', error.message)

    if (error.response) {
      console.error('Error Response Data:', error.response.data)
      console.error('Error Response Status:', error.response.status)
    }
    throw error
  }
}

// --- 1. Modified postCategoryData function ---
export const postCategoryData = async (categoryData) => {
  try {
    const requestData = {
      categoryName: categoryData.categoryName || '',
      categoryImage: categoryData.categoryImage || '',
      // description: categoryData.description || '',
    };

    const response = await axios.post(`${BASE_URL}/${AddCategory}`, requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log(response);
    return response.data;
  } catch (error) {
    // DO NOT show a toast here. Just re-throw the error
    // so handleAddCategory can catch and handle it.
    console.error('Error response from API:', error.response);
    throw error; // Re-throw the error to be caught by the caller
  }
};

// --- 2. Modified handleAddCategory function ---
const handleAddCategory = async () => {
  if (!validateForm()) return;

  try {
    const payload = {
      categoryName: newCategory.categoryName,
      categoryImage: newCategory.categoryImage,
      // description: newCategory.description,
    };

    const response = await postCategoryData(payload);

    // Only show success toast if postCategoryData completes without throwing an error
    toast.success('Category added successfully!', { position: 'top-right' });
    fetchData(); // Assuming this refreshes your data
    setModalVisible(false); // Assuming this closes a modal

  } catch (error) {
    console.error('Error adding category:', error);

    // Check for specific error messages or status codes for duplicates
    const errorMessage = error.response?.data?.message || error.response?.statusText || 'An unexpected error occurred.';
    const statusCode = error.response?.status;

    if (statusCode === 409 || errorMessage.toLowerCase().includes('duplicate')) { // Example: 409 Conflict for duplicates
      toast.error(`Error: Duplicate category name - ${newCategory.categoryName} already exists!`, { position: 'top-right' });
    } else {
      // For any other error
      toast.error(`Error adding category: ${errorMessage}`, { position: 'top-right' });
    }
  }
};
export const updateCategoryData = async (updatedCategory, categoryId) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/${UpdateCategory}/${categoryId}`,
      updatedCategory,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    return response.data
  } catch (error) {
    console.error('Error updating category:', error)
    throw error
  }
}

export const deleteCategoryData = async (categoryId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/${deleteCategory}/${categoryId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Category deleted successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('Error deleting category:', error.response ? error.response.data : error)
    throw error
  }
}
