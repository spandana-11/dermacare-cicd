import axios from 'axios'

import { BASE_URL, ClinicAllData, clinicPost,deleteClinic } from '../../baseUrl'

export const clinicData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/${ClinicAllData}`)
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

export const postClinicData = async (serviceData) => {
  try {
    console.log('Sending data to API:', serviceData)

    const response = await axios.post(`${BASE_URL}/${clinicPost}`, serviceData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error) {
    console.error('Error response:', error.response)
    alert(
      `Error: ${error.response.status} - ${error.response.data.message || error.response.statusText}`,
    )
  }
}

export const updateServiceData = async (serviceId, serviceData) => {
  console.log(serviceId, serviceData)
  try {
    const response = await axios.put(`${BASE_URL}/updateClinic/${serviceId}`, serviceData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Service updated successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('Error updating service:', error)
    throw error
  }
}

export const deleteServiceData = async (clinicId) => {
  try {
    console.log('Service name:', clinicId)
    const response = await axios.delete(`${BASE_URL}/${deleteClinic}/${clinicId}`)

    console.log('Service deleted successfully:', response.data)
    return response.data
  } catch (error) {
    throw error
  }
}
