import axios from 'axios'

import {
  BASE_URL,
  CustomerAllData,
  CustomerDataByID,
  updateCustomer,
  AddAddress,
  UpdateAddress,
  DeleteAddress,
  bookServices,
  deleteAppointments,
  CategoryAllData,
  MainAdmin_URL,
  Booking_service_Url,
} from '../../baseUrl'

export const CustomerData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/${CustomerAllData}`)
    return response.data
  } catch (error) {
    console.error('Error fetching customer data:', error)
    throw error
  }
}

export const searchProviderData = async (query) => {
  try {
    const trimmedQuery = query.trim()

    // Basic validation for empty input
    if (!trimmedQuery) {
      throw new Error('Please provide a search query.')
    }

    // Check if the query is a valid email
    if (validateEmail(trimmedQuery)) {
      console.log('Searching by email...')
    }
    // Check if the query is a valid mobile number (at least 10 digits)
    else if (validateMobileNumber(trimmedQuery)) {
      console.log('Searching by mobile number...')
    }
    // Check if the query is a valid name (at least 2 characters, letters only)
    else if (validateFullName(trimmedQuery)) {
      console.log('Searching by full name...')
    } else {
      throw new Error('Please provide a valid email, full name, or mobile number.')
    }

    // API call with validated search query
    const response = await axios.get(`${BASE_URL}/admin/search`, {
      params: { query: trimmedQuery }, // Change 'searchQuery' to 'query' if needed
    })

    return response.data.data // Adjust based on the actual response structure
  } catch (error) {
    console.error('Error searching provider data:', error.response?.data || error.message)
    throw error
  }
}

const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

const validateMobileNumber = (number) => {
  const regex = /^\d{10,}$/ // At least 10 digits
  return regex.test(number)
}

const validateFullName = (name) => {
  const regex = /^[a-zA-Z\s]{2,}$/ // At least 2 characters, letters only
  return regex.test(name)
}

export const getCustomerDataByID = async (mobileNumber) => {
  try {
    const response = await axios.get(`${Booking_service_Url}/${CustomerDataByID}/${mobileNumber}`)
    console.log(response.data)
    return response.data
  } catch (error) {
    handleError(error)
  }
}

export const updateCustomerData = async (mobileNumber, customerData) => {
  const { id: removedId, ...dataWithoutId } = customerData

  try {
    const response = await axios.put(
      `${BASE_URL}/${updateCustomer}/${mobileNumber}`,
      dataWithoutId,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    return response.data
  } catch (error) {
    handleError(error)
  }
  console.log(customerData)
}

export const addAddressData = async (mobileNumber, customerData) => {
  try {
    if (customerData.longitude && isNaN(parseFloat(customerData.longitude))) {
      return
    }

    console.log('Sending data to API to add address...')
    const response = await axios.post(
      `${BASE_URL}/${AddAddress}?mobileNumber=${mobileNumber}`,
      customerData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    console.log('Address added successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('Error adding address:', error.response ? error.response.data : error.message)
    throw error
  }
}

export const updateAddressData = async (mobileNumber, index, addressData) => {
  try {
    console.log('Sending data to API for update:', mobileNumber, index, addressData)

    const response = await axios.put(
      `${BASE_URL}/${UpdateAddress}/${mobileNumber}/${index}`,
      addressData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    console.log('Address updated successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('Error updating address:', error.response ? error.response.data : error.message)
    throw error
  }
}

export const deleteAddressData = async (mobileNumber, index) => {
  try {
    const response = await axios.delete(`${BASE_URL}/${DeleteAddress}/${mobileNumber}/${index}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    console.log('Response from delete API:', response.data)
    return response.data
  } catch (error) {
    console.error('Error deleting address data:', error.response ? error.response.data : error)
    throw error
  }
}

export const AppointmentsData = async (mobileNumber) => {
  try {
    const response = await axios.get(`${BASE_URL}/customers/getBookedServices/${mobileNumber}`)
    return response.data
  } catch (error) {
    console.error('Error fetching customer data:', error)
    throw error
  }
}

export const bookAppointment = async (appointmentData) => {
  try {
    console.log('Sending data to API to add appointment...', appointmentData)

    const response = await axios.post(`${BASE_URL}/${bookServices}`, appointmentData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    console.log('Appointment booked successfully:', response.data)
    return response.data
  } catch (error) {
    console.error(
      'Error booking appointment:',
      error.response ? error.response.data : error.message,
    )
    throw error
  }
}

export const updateAppointmentAPI = async (appointmentId, updatedAppointment) => {
  const response = await fetch(`${BASE_URL}/customers/updateBookedService/${appointmentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedAppointment),
  })

  if (!response.ok) {
    throw new Error('Failed to update appointment')
  }

  return await response.json()
}

export const deleteAppointment = async (appointmentId, serviceId) => {
  try {
    console.log('Sending data to API to delete appointment...', appointmentId, serviceId)

    const response = await axios.delete(
      `${BASE_URL}/${deleteAppointments}/${appointmentId}/${serviceId}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    return response
  } catch (error) {
    console.error('Error deleting appointment:', error)
    throw error
  }
}

export const CategoryData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/${CategoryAllData}`)
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

const handleError = (error) => {
  if (error.response) {
    console.error('Error Response:', error.response.data)
    alert(`Error: ${error.response.data.message || 'Something went wrong'}`)
  } else if (error.request) {
    console.error('Error Request:', error.request)
    alert('No response from the server. Please try again later.')
  } else {
    console.error('Error', error.message)
    alert(`Error: ${error.message}`)
  }
}
