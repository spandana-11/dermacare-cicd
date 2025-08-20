import axios from 'axios'
import { AddTest, AllTest, BASE_URL, DeleteTest, GetTestByHId, UpdateTest } from '../../baseUrl'

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
export const TestDataById = async (hospitalId) => {
  try {
    const response = await axios.get(`${BASE_URL}/${GetTestByHId}/${hospitalId}`)
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
