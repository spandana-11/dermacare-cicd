import axios from 'axios'
import { showCustomToast } from '../../Utils/Toaster'
import {  BASE_URL_API } from '../../baseUrl'

export const getpackagePricingByClinicId = async (clinicId) => {
  try {
    const res = await axios.get(`${BASE_URL_API}/packages/clinic/${clinicId}`)
    return res.data
  } catch (err) {
    console.error('API Error:', err)
    throw err
  }
}

export const addPackageData = async (packageData) => {
  try {
    console.log('Sending data to API:', packageData)

    const response = await axios.post(`${BASE_URL_API}/packages/create`, packageData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response
  } catch (error) {
    console.error('Error response:', error.response)
    showCustomToast(`${error.response.data.message || error.response.statusText}`, 'error')
  }
}

export const updatePackageData = async (packageId, clinicId, packageData) => {
  console.log('API Call Params:', packageId, clinicId) //Check values
  console.log('Payload:', packageData)

  try {
    const response = await axios.put(
      `${BASE_URL_API}/packages/update/${packageId}/clinic/${clinicId}`, //use 'id' here
      packageData,
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

export const deletePackageData = async (packageId, clinicId) => {
  try {
    console.log('Service name:', packageId)
    const response = await axios.delete(`${BASE_URL_API}/packages/delete/${packageId}/clinic/${clinicId}`)

    console.log('Service deleted successfully:', response.data)
    return response.data
  } catch (error) {
    throw error
  }
}
