import axios from 'axios'

import {
  BASE_URL,
  Procedure_URL,
  service,
  Category,
  AddSubService,
  updateService,
  deleteService,
  MainAdmin_URL,
  // subService_URL,
  subservice,
  getadminSubServicesbyserviceId,
  getService_ByClinicId,
  CategoryAllData,
  addProcedureDetails,
  updateProcedureDetails,
  deleteProcedureDetails,
  getSubServiceBySubServiceId
} from '../../baseUrl'
import { toast } from 'react-toastify'

export const subServiceData = async (serviceId) => {
  console.log('Serviceid response:', serviceId)
  try {
    // const response = await axios.get(`${BASE_URL}/serviceId/${serviceId}`)
    const response = await axios.get(
      `${BASE_URL}/${getadminSubServicesbyserviceId}/${serviceId}`,
    )

    console.log('Service response:', response.data)
    return response.data
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('Service response:', error.response.data) // Log structured response instead of treating it as an error
      return error.response.data // Return response instead of throwing an error
    } else {
      console.error('Unexpected error:', error.message || error)
      throw error
    }
  }
}
export const serviceData = async () => {
  console.log('Serviceid response:')
  try {
    const response = await axios.get(`${BASE_URL}/${service}`)

    console.log('Service response:', response.data)
    return response.data
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('Service response:', error.response.data) // Log structured response instead of treating it as an error
      return error.response.data // Return response instead of throwing an error
    } else {
      console.error('Unexpected error:', error.message || error)
      throw error
    }
  }
}

export const getSubServiceById = async (hospitalId, subServiceId) => {
    console.log('Serviceid response:', subServiceId)

  try {
    const response = await axios.get(`${BASE_URL}/${getSubServiceBySubServiceId}/${subServiceId}`)
    return response.data?.data // return only the useful data part
  } catch (error) {
    console.error('Error fetching sub-service data:', error)
    return null
  }
}
export const GetSubServices_ByClinicId = async (clinicId) => {
  // console.log('GetSubServices_ByClinicId value is',subServiceId)
  try {
    const response = await axios.get(`${BASE_URL}/${getService_ByClinicId}/${clinicId}`)
    console.log("Hello", response)
      return response.data?.data
  } catch (error) {
    console.error('Error fetching sub-service data:', error)
    return null
  }
}

export const CategoryData = async () => {
  console.log('service data:, response.data')

  try {
    const response = await axios.get(`${BASE_URL}/${CategoryAllData}`)
    console.log('service data:', response.data)

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

export const postServiceData = async (serviceData, id) => {
  console.log('Sending data to id:', id)

  try {
    console.log('Sending data to API:', serviceData)

    const response = await axios.post(`${Procedure_URL}/${addProcedureDetails}/${id}`, serviceData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    console.log(response)

    return response
  } catch (error) {
    console.error('Error response:', error.response)
    toast.error(`${error.response.data.message || error.response.statusText}`)
  }
}

export const updateServiceData = async (subServiceId, hospitalId, serviceData) => {
  console.log('API Call Params:', subServiceId, hospitalId) //Check values
  console.log('Payload:', serviceData)

  try {
    const response = await axios.put(
      `${Procedure_URL}/${updateProcedureDetails}/${hospitalId}/${subServiceId}`, //use 'id' here
      serviceData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    console.log('Service updated successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('Error updating service:', error)
    throw error
  }
}

export const deleteServiceData = async (subServiceId, clinicId) => {
  try {
    console.log(' deleteServiceData Service name:', subServiceId)
    const response = await axios.delete(`${BASE_URL}/${deleteProcedureDetails}/${clinicId}/${subServiceId}`)

    console.log('Service deleted successfully:', response.data)
    return response.data
  } catch (error) {
    throw error
  }
}