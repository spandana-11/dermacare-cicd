import axios from 'axios'
import {
  BASE_URL,
  AddCustomer,
  updateCustomer,
  CustomerAllData,
  getBasicDetails,
  BASE_URL_API,
  Production_URL_API,
} from '../../baseUrl'

// Fetch all customers
export const CustomerData = async () => {
  try {
    const url = `${BASE_URL_API}/${CustomerAllData}`
    const response = await axios.get(url)
    console.log('customer doing ', response)
    // Assuming backend wraps list in response.data.data
    return Array.isArray(response.data.data) ? response.data.data : [response.data.data]
  } catch (error) {
    console.error('Failed to fetch customers:', error)
    throw error
  }
}

// Add a new customer
export const addCustomer = async (customerDTO) => {
  try {
    const url = `${BASE_URL}/${AddCustomer}`
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
    const url = `${BASE_URL_API}/${getBasicDetails}/${mobileNumber}`
    const response = await axios.get(url)
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
    const url = `${BASE_URL}/${updateCustomer}/${mobileNumber}`
    const response = await axios.put(url, customerDTO, {
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
    const url = `${BASE_URL_API}/${getBasicDetails}/${mobileNumber}`
    const response = await axios.delete(url)
    return response.data
  } catch (error) {
    console.error('Failed to delete customer:', error)
    throw error
  }
}


//Production

// Fetch all customers
export const CustomerDataProd = async () => {
  try {
    const url = `${Production_URL_API}/${CustomerAllData}`
    const response = await axios.get(url)
    console.log('customer doing ', response)
    // Assuming backend wraps list in response.data.data
    return Array.isArray(response.data.data) ? response.data.data : [response.data.data]
  } catch (error) {
    console.error('Failed to fetch customers:', error)
    throw error
  }
}

// Add a new customer
export const addCustomerProd = async (customerDTO) => {
  try {
    const url = `${Production_URL_API}/${AddCustomer}`
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
export const getCustomerByMobileProd = async (mobileNumber) => {
  try {
    // Using the endpoint from your baseUrl configuration
    const url = `${Production_URL_API}/${getBasicDetails}/${mobileNumber}`
    const response = await axios.get(url)
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
export const updateCustomerDataProd = async (mobileNumber, customerDTO) => {
  try {
    const url = `${Production_URL_API}/${updateCustomer}/${mobileNumber}`
    const response = await axios.put(url, customerDTO, {
      headers: { 'Content-Type': 'application/json' },
    })
    return response.data
  } catch (error) {
    console.error('Failed to update customer:', error)
    throw error
  }
}

// Delete a customer
export const deleteCustomerDataProd = async (mobileNumber) => {
  try {
    const url = `${Production_URL_API}/${getBasicDetails}/${mobileNumber}`
    const response = await axios.delete(url)
    return response.data
  } catch (error) {
    console.error('Failed to delete customer:', error)
    throw error
  }
}