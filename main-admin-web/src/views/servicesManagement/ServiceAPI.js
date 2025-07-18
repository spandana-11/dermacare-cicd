import axios from 'axios'
import {
  SERVICE_URL,
  GET_ALL_SERVICES,
  ADD_SERVICE,
  subService_URL,
  BASE_URL,
  DELETE_SERVICE_URL,
  getService,
  updateService,
} from '../../baseUrl'

export const getAllServices = async () => {
  try {
    const response = await axios.get(`${subService_URL}/${GET_ALL_SERVICES}`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    console.log(response)

    return response
  } catch (error) {
    throw error
  }
}

// export const getServiceByCategoryId = async (categoryId) => {
//   try {
//     const response = await axios.get(`${subService_URL}/${getService}/${categoryId}`)
//     return response.data?.data || []
//   } catch (error) {
//     console.error('Error fetching services by category:', error)
//     return []
//   }
// }

export const getServiceByCategoryId = async (categoryId) => {
  try {
    const response = await axios.get(`${subService_URL}/${getService}/${categoryId}`, {
      validateStatus: (status) => status >= 200 && status <= 302, // Accept 302 as a valid response
    })

    // If the server redirects, follow the 'Location' header
    if (response.status === 302 && response.headers.location) {
      const redirectedResponse = await axios.get(response.headers.location)
      return redirectedResponse.data?.data || []
    }

    return response.data?.data || []
  } catch (error) {
    console.error('Error fetching services by category:', error)
    return []
  }
}

export const postServiceData = async (serviceData) => {
  try {
    const response = await axios.post(`${subService_URL}/${ADD_SERVICE}`, serviceData, {
      headers: { 'Content-Type': 'application/json' },
    })
    console.log('API success response:', response)
    return response // returns full axios response
  } catch (error) {
    // This runs for non-2xx or network error
    if (error.response) {
      // Server responded with an error status
      console.error('API error response:', error.response)
      // rethrow with error.response so caller can handle it
      throw error.response
    } else {
      console.error('Network/Unexpected error:', error)
      throw error
    }
  }
}

export const updateServiceData = async (updatedService, serviceId) => {
  //TODO:service api need
  console.log(updatedService)
  console.log(serviceId)
  try {
    const response = await axios.put(
      `${subService_URL}/${updateService}/${serviceId}`,
      updatedService,
      {
        headers: { 'Content-Type': 'application/json' },
      },
    )
    return response.data
  } catch (error) {
    console.error('Error updating service:', error)
    throw error
  }
}

export const deleteServiceData = async (serviceId) => {
  try {
    const response = await axios.delete(`${subService_URL}/${DELETE_SERVICE_URL}/${serviceId}`)
    return response.data
  } catch (error) {
    console.error('Error deleting service:', error)
    throw error
  }
}
