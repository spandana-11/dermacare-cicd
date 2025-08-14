import axios from 'axios'
import { AddDisease, AllDiseases, BASE_URL, DeleteDisease, UpdateDisease } from '../../baseUrl'

export const DiseaseData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/${AllDiseases}`)
    console.log('Disease data:', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching disease data:', error.message)
    if (error.response) {
      console.error('Error Response Data:', error.response.data)
      console.error('Error Response Status:', error.response.status)
    }
    throw error
  }
}

// ✅ 2. Add a new disease
export const postDiseaseData = async (diseaseData) => {
  try {
    const requestData = {
      disease: diseaseData.disease|| '', 
      hospitalId: diseaseData.hospitalId || '',
    }

    const response = await axios.post(`${BASE_URL}/${AddDisease}`, requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    console.log('Add Disease Response:', response)
    return response.data
  } catch (error) {
    console.error('Error adding disease:', error.response?.data || error)
    throw error
  }
}

// --- 2. Modified handleAddCategory function ---
const handleAddDisease = async () => {
  if (!validateForm()) return

  try {
    const payload = {
      disease: newDisease.disease,
    }

    const response = await postDiseaseData(payload)

    // Only show success toast if postCategoryData completes without throwing an error
    toast.success('Disease added successfully!', { position: 'top-right' })
    fetchData() // Assuming this refreshes your data
    setModalVisible(false) // Assuming this closes a modal
  } catch (error) {
    console.error('Error adding disease:', error)

    // Check for specific error messages or status codes for duplicates
    const errorMessage =
      error.response?.data?.message || error.response?.statusText || 'An unexpected error occurred.'
    const statusCode = error.response?.status

    if (statusCode === 409 || errorMessage.toLowerCase().includes('duplicate')) {
      // Example: 409 Conflict for duplicates
      toast.error(`Error: Duplicate disease name - ${newDisease.disease} already exists!`, {
        position: 'top-right',
      })
    } else {
      // For any other error
      toast.error(`Error adding disease: ${errorMessage}`, { position: 'top-right' })
    }
  }
}
export const updateDiseaseData = async (updatedDisease, diseaseId, hospitalId) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/${UpdateDisease}/${diseaseId}/${hospitalId}`,
      updatedDisease,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    return response.data
  } catch (error) {
    console.error('Error updating disease:', error.response?.data || error)
    throw error
  }
}

// ✅ 4. Delete disease
export const deleteDiseaseData = async (diseaseId, hospitalId) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/${DeleteDisease}/${diseaseId}/${hospitalId}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    console.log('Disease deleted successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('Error deleting disease:', error.response?.data || error)
    throw error
  }
}

