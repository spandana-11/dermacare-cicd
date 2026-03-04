import axios from 'axios'

import {
  BASE_URL,
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
  deleteSubService,
  getSubservices, 
  addSubservices, 
  deleteSubservices,
  getSubService,
  getSubServiceBySubServiceId
} from '../../baseUrl'
import { toast } from 'react-toastify'
// export default postSubService
export const postSubService = async (payload) => {
  console.log('📦 Sending payload to backend:', payload)
  try {
    const res = await axios.post(`${BASE_URL}/${addSubservices}`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    console.log('✅ SubService added:', res.data)
    return res
  } catch (error) {
    console.error('❌ Error adding sub-services:', error.response?.data || error.message)
    throw error
  }
}
export const getAllSubServices = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/${getSubservices}`)
    return response.data?.data || [] // returns only the actual array
  } catch (error) {
    console.error('❌ Error fetching subservices:', error)
    return []
  }
}
// export const deleteSubServiceData = async (subserviceID) => {
//   console.log(subserviceID)
//   try {
//     const response = await axios.delete(`${BASE_URL}/${deleteSubservices}/${subserviceID}`, {
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     })

//     console.log('Category deleted successfully:', response.data)
//     return response
//   } catch (error) {
//     console.error('Error deleting category:', error.response ? error.response.data : error)
//     throw error
//   }
// }
// export const GetSubServices_ByClinicId = async (hospitalId) => {
//   try {
//     const response = await axios.get(`${BASE_URL}/${getService_ByClinicId}/${hospitalId}`)
//     return response.data?.data
//   } catch (error) {
//     console.error('Error fetching sub-service data:', error)
//     return null
//   }
// }












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
  try {
    const response = await axios.get(`${BASE_URL}/${getSubService}/${hospitalId}/${subServiceId}`)
    return response.data?.data // return only the useful data part
  } catch (error) {
    console.error('Error fetching sub-service data:', error)
    return null
  }
}
export const GetSubServices_ByClinicId = async (hospitalId) => {
  try {
    const response = await axios.get(`${BASE_URL}/${getService_ByClinicId}/${hospitalId}`)
    return response.data?.data
  } catch (error) {
    console.error('Error fetching sub-service data:', error)
    return null
  }
}

export const CategoryData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/${Category}`)

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

    const response = await axios.post(`${BASE_URL}/${AddSubService}/${id}`, serviceData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

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
      `${BASE_URL}/${updateService}/${hospitalId}/${subServiceId}`, //use 'id' here
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

export const deleteServiceData = async (serviceId, id) => {
  try {
    console.log('Service name:', serviceId)
    const response = await axios.delete(`${BASE_URL}/${deleteService}/${id}/${serviceId}`)

    console.log('Service deleted successfully:', response.data)
    return response.data
  } catch (error) {
    throw error
  }
}



// API function (only needs subServiceId)
export const deleteSubServiceData = async (subServiceId) => {
  try {
    console.log('🗑️ Deleting SubService:', subServiceId)

    const response = await axios.delete(
      `${BASE_URL}/${deleteSubservices}/${subServiceId}`
    )

    console.log('✅ SubService deleted successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Error deleting SubService:', error.response?.data || error.message || error)
    throw error
  }
}



export const getSubservicesData = async () => {
  console.log('Fetching Subservices...')
  try {
    const response = await axios.get(`${BASE_URL}/${getSubservices}`)

    console.log('Subservices response:', response.data)
    return response.data
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('Subservices response:', error.response.data) // handle structured response
      return error.response.data
    } else {
      console.error('Unexpected error fetching subservices:', error.message || error)
      throw error
    }
  }
}
export const getSubServiceId = async (subServiceId) => {
  try {
    const url = `${BASE_URL}/${getSubServiceBySubServiceId}/${subServiceId}`
    console.log(`${BASE_URL}/${getSubServiceBySubServiceId}/${subServiceId}`)

    const response = await axios.get(url)

    console.log('🔎 Full API Response:', response.data?.data)

    return response.data
  } catch (error) {
    console.error('❌ Error fetching sub-service data:', error)
    throw error
  }
}

// export const getServiceById = async (categoryId) => {
//   console.log("📡 Fetching Service by Category ID:", categoryId)
//   try {
//     const response = await axios.get(`${BASE_URL}/${getService}/${categoryId}`)

//     console.log("✅ Service response:", response.data)
//     return response.data
//   } catch (error) {
//     if (error.response && error.response.status === 404) {
//       console.log("⚠️ Service response (404):", error.response.data)
//       return error.response.data
//     } else {
//       console.error("❌ Unexpected error:", error.message || error)
//       throw error
//     }
//   }
// }
