import axios from 'axios'
import { BASE_URL } from '../../baseUrl'

export const getClinicTimings = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/admin/getAllClinicTimings`)
    return response.data
  } catch (error) {
    console.error('Error fetching clinic timings:', error)
    return { success: false, message: 'API Error', data: [] }
  }
}
