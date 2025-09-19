import axios from 'axios'
import {
  BASE_URL,
  AddCustomer,
  UpdateCustomer,
  DeleteCustomer,
  GetCustomerByMobileNo,
  GetAllCustomers,
  Booking_sevice,
} from '../../baseUrl'
import { http } from '../../Utils/Interceptors'

// Fetch all customers
export const CustomerData = async () => {
  try {
    const url = `${BASE_URL}/${GetAllCustomers}`
    const response = await axios.get(url) //TODO:chnage when apigetway call axios to http
    // Assuming backend wraps list in response.data.data
    return Array.isArray(response.data.data) ? response.data.data : [response.data.data]
  } catch (error) {
    console.error('Failed to fetch customers:', error)
    throw error
  }
}

// **Add a new customer
export const addCustomer = async (customerDTO) => {
  try {
    const url = `${BASE_URL}/${AddCustomer}` //TODO:chnage when apigetway call axios to http
    const response = await axios.post(url, customerDTO, {
      headers: { 'Content-Type': 'application/json' },
    })
    return response.data
  } catch (error) {
    console.error('Failed to add customer:', error)
    throw error
  }
}

// Get one customer by mobile number
export const getCustomerByMobile = async (mobileNumber) => {
  try {
    // Using the endpoint from your baseUrl configuration
    const url = `${Booking_sevice}/${GetCustomerByMobileNo}/${mobileNumber}`
    const response = await axios.get(url) //TODO:chnage when apigetway call axios to http
    return response.data
  } catch (error) {
    if (error.response) {
      // Server responded with a status code outside 2xx
      console.error('Server responded with error:', error.response.status)
      console.error('Response data:', error.response.data)
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request)
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message)
    }
    throw error
  }
}

// Update existing customer
export const updateCustomerData = async (mobileNumber, customerDTO) => {
  try {
    const url = `${Booking_sevice}/${UpdateCustomer}/${mobileNumber}`
    const response = await axios.put(url, customerDTO, { //TODO:chnage when apigetway call axios to http
      headers: { 'Content-Type': 'application/json' },
    })
    return response.data
  } catch (error) {
    console.error('Failed to update customer:', error)
    throw error
  }
}

// Delete a customer
export const deleteCustomerData = async (mobileNumber) => {
  try {
    const url = `${Booking_sevice}/${DeleteCustomer}/${mobileNumber}`
    const response = await axios.delete(url) //TODO:chnage when apigetway call axios to http
    return response.data
  } catch (error) {
    console.error('Failed to delete customer:', error)
    throw error
  }
}
