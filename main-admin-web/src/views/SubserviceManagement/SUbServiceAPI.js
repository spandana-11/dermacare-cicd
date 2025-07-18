import axios from 'axios'
import { BASE_URL, getSubservices, addSubservices, deleteSubservices } from '../../baseUrl'

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
export const deleteSubServiceData = async (subserviceID) => {
  console.log(subserviceID)
  try {
    const response = await axios.delete(`${BASE_URL}/${deleteSubservices}/${subserviceID}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Category deleted successfully:', response.data)
    return response
  } catch (error) {
    console.error('Error deleting category:', error.response ? error.response.data : error)
    throw error
  }
}
