// import axios from 'axios'

// import {
//   Booking_service_Url,
//   DeleteBookings,
//   BASE_URL,
//   getAllBookedServices,
//   GetBookingBy_ClinicId,
// } from '../../baseUrl'

// export const AppointmentData = async () => {
//   console.log('appointdata calling')
//   try {
//     const response = await axios.get(`${Booking_service_Url}/${getAllBookedServices}`)
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

// export const deleteBookingData = async (id) => {
//   try {
//     const response = await axios.delete(`${Booking_service_Url}/${DeleteBookings}/${id}`, {
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     })

//     console.log('Category deleted successfully:', response.data)
//     return response.data
//   } catch (error) {
//     console.error('Error deleting booking:', error.response?.data || error)
//     throw error
//   }
// }

// export const GetdoctorsByClinicIdData = async (doctorId) => {
//   try {
//     const response = await axios.get(`${BASE_URL}/doctor/${doctorId}`)
//     console.log(`appointdata calling ${response.data}`)
//     return response
//   } catch (error) {
//     console.error('Error fetching doctor by ID:', error)
//     throw error
//   }
// }

// export const GetBookingByClinicIdData = async (id) => {
//   console.log('GetBookingByClinicId calling for clinicId:', id)
//   // const url = `${Booking_service_Url}/${GetBookingBy_ClinicId}/${id}`
//   // console.log(url)
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

import axios from 'axios'
import {
  Booking_service_Url,
  DeleteBookings,
  BASE_URL,
  getAllBookedServices,
  GetBookingBy_ClinicId,
} from '../../baseUrl'
import { http } from '../../Utils/Interceptors'

export const AppointmentData = async () => {
  try {
    const response = await axios.get(`${Booking_service_Url}/${getAllBookedServices}`) //TODO:chnage when apigetway call axios to http
    return response.data
  } catch (error) {
    console.error('Error fetching service data:', error.message)
    throw error
  }
}

export const deleteBookingData = async (id) => {
  try {
    const response = await axios.delete(`${Booking_service_Url}/${DeleteBookings}/${id}`, {
      //TODO:chnage when apigetway call axios to http
      headers: { 'Content-Type': 'application/json' },
    })
    return response.data
  } catch (error) {
    console.error('Error deleting booking:', error.response?.data || error)
    throw error
  }
}

export const GetdoctorsByClinicIdData = async (doctorId) => {
  try {
    const response = await http.get(`${BASE_URL}/doctor/${doctorId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching doctor by ID:', error)
    throw error
  }
}

export const GetBookingByClinicIdData = async (id) => {
  console.log(id)
  try {
    const response = await axios.get(
      `${Booking_service_Url}/customer/getAllBookedServicesByClinicId/${id}`,
    ) //TODO:chnage when apigetway call axios to http
    return response.data
  } catch (error) {
    console.error('Error fetching booking by clinicId:', error.message)
    throw error
  }
}
