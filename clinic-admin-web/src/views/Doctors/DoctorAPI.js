// doctorUtils.js

import axios from 'axios'
import { BASE_URL, getAllDoctors, getDoctorByClinicId, doctorAvailableUrl, GetBranches_ByClinicId } from '../../baseUrl'
import { toast } from 'react-toastify'
import { http } from '../../Utils/Interceptors'

// 🆕 Update Doctor Availability (true/false)
export const updateDoctorAvailability = async (doctorId, isAvailable) => {
  try {
    const url = `/${doctorAvailableUrl}/${doctorId}/availability`
    console.log('Updating availability:', doctorId, isAvailable)

    const response = await http.post(
      url,
      { doctorAvailabilityStatus: isAvailable },
      { headers: { 'Content-Type': 'application/json' } },
    )

    console.log('Update response:', response.data)

    // You can check either axios status or your API success field
    return response.status === 200 && response.data.success === true
  } catch (error) {
    toast.error(`${error.message}` || 'Failed to update doctor availability')
    console.error('❌ Error updating availability:', error)
    return false
  }
}


export const handleDeleteToggle = async (doctorID) => {
  console.log(doctorID)
  try {
    const response = await http.delete(`/delete-doctor/${doctorID}`)
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
    const response = await http.get(`/${getAllDoctors}`)
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
// getDoctorsByHospitalIdAndBranchId
export const getDoctorByClinicIdData = async (clinicId,branchId) => {
  console.log('appointdata calling')
  try {
    const response = await http.get(`/${getDoctorByClinicId}/${clinicId}/${branchId}`)
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
// export const getDoctorByClinicIdData = async (clinicId) => {
//   console.log('appointdata calling')
//   try {
//     const response = await http.get(`/${getDoctorByClinicId}/${clinicId}`)
//     console.log(`appointdata calling ${response.data}`)

//     console.log(response.data)

//     return response.data
//   } catch (error) {
//     console.error('Error fetching service data:', error.message)
//     if (error.response) {
//       console.error('Error Response Data:', error.response.data)
//       console.error('Error Response Status:', error.response.status)
//     }
//     throw error
//   }
// }
export const getDoctorDetailsById = async (doctorId) => {
  console.log('doctorData calling')
  try {
    const response = await http.get(`/${GetBy_DoctorId}/${doctorId}`)
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
export const GetClinicBranches = async (clinicId) => {
  console.log('appointdata calling')
  try {
    const response = await http.get(`/${GetBranches_ByClinicId}/${clinicId}`)
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