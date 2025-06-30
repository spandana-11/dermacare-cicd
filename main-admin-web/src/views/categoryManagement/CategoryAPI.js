import axios from 'axios'
import {  
  BASE_URL,
  AddCategory,
  CategoryAllData,
  UpdateCategory,
  deleteCategory,
} from '../../baseUrl'

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

export const postCategoryData = async (categoryData) => {
  try {
    const requestData = {
      categoryName: categoryData.categoryName || '',
      categoryImage: categoryData.categoryImage || '',
      // description: categoryData.description || '',
    }

    const response = await axios.post(`${BASE_URL}/${AddCategory}`, requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error) {
    console.error('Error response:', error.response)
    alert(
      `Error: ${error.response?.status} - ${error.response?.data?.message || error.response?.statusText}`,
    )
    throw error
  }
}
export const updateCategoryData = async (updatedCategory,categoryId) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/${UpdateCategory}/${categoryId}`,
      updatedCategory,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

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