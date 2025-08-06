import axios from 'axios'
import { AddTest, AllTest, BASE_URL, DeleteTest, UpdateTest } from '../../baseUrl'

export const TestData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/${AllTest}`)
    console.log('test data:', response.data)

    return response.data
  } catch (error) {
    console.error('Error fetching test data:', error.message)

    if (error.response) {
      console.error('Error Response Data:', error.response.data)
      console.error('Error Response Status:', error.response.status)
    }
    throw error
  }
}

// --- 1. Modified postCategoryData function ---
export const postTestData = async (testData) => {
  try {
    const requestData = {
      testName: testData.testName || '',
      hospitalId: testData.hospitalId || '',
    }

    const response = await axios.post(`${BASE_URL}/${AddTest}`, requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    console.log(response)
    return response.data
  } catch (error) {
    console.error('Error response from API:', error.response)
    throw error // Re-throw the error to be caught by the caller
  }
}

// --- 2. Modified handleAddCategory function ---
const handleAddTest = async () => {
  if (!validateForm()) return

  try {
    const payload = {
      testName: newTest.testName,
    }

    const response = await postTestData(payload)

    // Only show success toast if postCategoryData completes without throwing an error
    toast.success('Test added successfully!', { position: 'top-right' })
    fetchData() // Assuming this refreshes your data
    setModalVisible(false) // Assuming this closes a modal
  } catch (error) {
    console.error('Error adding test:', error)

    // Check for specific error messages or status codes for duplicates
    const errorMessage =
      error.response?.data?.message || error.response?.statusText || 'An unexpected error occurred.'
    const statusCode = error.response?.status

    if (statusCode === 409 || errorMessage.toLowerCase().includes('duplicate')) {
      // Example: 409 Conflict for duplicates
      toast.error(`Error: Duplicate test name - ${newTest.testName} already exists!`, {
        position: 'top-right',
      })
    } else {
      // For any other error
      toast.error(`Error adding tet: ${errorMessage}`, { position: 'top-right' })
    }
  }
}
export const updateTestData = async (updatedTest, testId, hospitalId) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/${UpdateTest}/${testId}/${hospitalId}`,
      updatedTest,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    return response.data
  } catch (error) {
    console.error('Error updating tet:', error)
    throw error
  }
}

export const deleteTestData = async (testId, hospitalId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/${DeleteTest}/${testId}/${hospitalId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Test deleted successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('Error deleting tet:', error.response ? error.response.data : error)
    throw error
  }
}
