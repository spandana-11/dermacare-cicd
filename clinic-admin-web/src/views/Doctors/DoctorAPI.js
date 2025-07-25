// doctorUtils.js

import axios from 'axios'
import { BASE_URL, getAllDoctors, getDoctorByClinicId } from '../../baseUrl'
import { toast } from 'react-toastify'

export const handleDeleteToggle = async (doctorID) => {
  console.log(doctorID)
  try {
    const response = await axios.delete(`${BASE_URL}/delete-doctor/${doctorID}`)
    console.log('Doctor deleted successfully:', response.data)
    // Optional: return true or response if needed
    return response
  } catch (error) {
    toast.error(`${error.message}` || 'Failed to delete doctor')
    console.error('Error occurred while deleting doctor:', error.response?.data || error.message)
    // Optional: return false or error if needed
    return false
  }
}

export const DoctorData = async () => {
  console.log('appointdata calling')
  try {
    const response = await axios.get(`${BASE_URL}/${getAllDoctors}`)
    console.log(`appointdata calling ${response.data}`)

    console.log(response.data)

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
export const getDoctorByClinicIdData = async (clinicId) => {
  console.log('appointdata calling')
  try {
    const response = await axios.get(`${BASE_URL}/${getDoctorByClinicId}/${clinicId}`)
    console.log(`appointdata calling ${response.data}`)

    console.log(response.data)

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
export const getDoctorDetailsById = async (doctorId) => {
  console.log('doctorData calling')
  try {
    const response = await axios.get(`${BASE_URL}/${GetBy_DoctorId}/${doctorId}`)
    console.log(`doctorData calling ${response.data}`)

    console.log(response.data)

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
