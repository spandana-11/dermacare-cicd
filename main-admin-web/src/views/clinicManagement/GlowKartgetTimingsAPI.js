import axios from 'axios'
import { BASE_URL_API } from '../../baseUrl'

export const getClinicTimings = async () => {
  try {
    const response = await axios.get(`${BASE_URL_API}/getAllClinicTimings`)
    return response.data
  } catch (error) {
    console.error('Error fetching clinic timings:', error)
    return { success: false, message: 'API Error', data: [] }
  }
}
