// ✅ SUbServiceAPI.js
import axios from 'axios'
import { BASE_URL, getSubservices, addSubservices, deleteSubservices } from '../../baseUrl'
const postSubService = async (payload) => {
  try {
    const response = await axios.post(`${BASE_URL}/${addSubservices}`, payload)
    if (response.data.success) {
      console.log('✅ Sub-services added successfully:', response.data)
      // alert('Sub-services added successfully!')
      return response // ✅ add this
    } else {
      console.warn('⚠️ Failed to add sub-services:', response.data)
    }
  } catch (error) {
    console.error('❌ Error adding sub-services:', error)
    alert('Error adding sub-services!')
  }
}

// ✅ correct default export
export default postSubService

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
