import axios from 'axios'
import { BASE_URL ,getData,postData} from '../../baseUrl'

export const getReassign = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/${getData}`)
    console.log(response.data)
    return response.data
  } catch (error) {
    if (error.response) {
      console.error('Error Response Data:', error.response.data)
      console.error('Error Response Status:', error.response.status)
    }
    throw error
  }
}

export const postReassign = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}/${postData}`,data)
    console.log(response.data)
    return response.data
  } catch (error) {
    if (error.response) {
      console.error('Error Response Data:', error.response.data)
      console.error('Error Response Status:', error.response.status)
    }
    throw error
  }
}
