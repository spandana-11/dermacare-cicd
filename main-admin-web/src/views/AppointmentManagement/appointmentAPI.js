import axios from 'axios'

import {
  BASE_URL,
  Booking_service_Url,
  DeleteBookings,
  getAllBookedServices,
  // GetBookingBy_ClinicId,
  // GetBookingBy_DoctorId,
  // DOCTOR_URL,
  CLINIC_ADMIN_URL,
  GetBy_DoctorId,
} from '../../baseUrl'
import { CListGroup } from '@coreui/react'

export const AppointmentData = async () => {
  console.log('appointdata calling')
  try {
    const response = await axios.get(`${BASE_URL}/${getAllBookedServices}`)
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

export const deleteBookingData = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/${DeleteBookings}/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Category deleted successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('Error deleting booking:', error.response?.data || error)
    throw error
  }
}

export const getBookingBy_DoctorId = async (doctorId) => {
  console.log(doctorId)
  console.log(GetBy_DoctorId)
  const res = await axios.get(`${CLINIC_ADMIN_URL}/${GetBy_DoctorId}/${doctorId}`)

  console.log('hi', res.data.data)
  return res.data.data
}
// export const getBookingBy_DoctorId = async (doctorId) => {
//   console.log(doctorId)
//   console.log(GetBookingBy_DoctorId)
//   const res = await axios.get(`${BASE_URL}/${GetBookingBy_DoctorId}/${doctorId}`)

//   console.log('hi hello there', res.data.data)
//   return res.data.data
// }

// export const GetBookingByClinicId = async (id) => {
//   console.log('GetBookingByClinicId calling for clinicId:', id)
//   try {
//     const response = await axios.get(`${Booking_service_Url}/${GetBookingBy_ClinicId}/${id}`)
//     console.log('GetBookingByClinicId response:', response.data)
//     return response.data
//   } catch (error) {
//     console.error('Error fetching booking by clinicId:', error.message)
//     if (error.response) {
//       console.error('Error Response Data:', error.response.data)
//       console.error('Error Response Status:', error.response.status)
//     }
//     throw error
//   }
// }

//get appoinement by clinic id
// appointmentAPI.js

export const getBookingBy_ClinicId = async (clinicId) => {
  try {
    const response = await axios.get(
      `${Booking_service_Url}/customer/getAllBookedServicesByClinicId/${clinicId}`,
    )
    return response
  } catch (error) {
    throw error
  }
}
