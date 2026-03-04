import axios from 'axios'

import { BASE_URL_API, PROCEDURE_GET_ALL_URL } from '../../baseUrl'

export const getAllProcedures = async () => {
  try {
    const response = await axios.get(`${PROCEDURE_GET_ALL_URL}`)
    if (response.data?.success) {
      return response.data.data // returns array of procedures
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching procedures:', error)
    return []
  }
}

export const getProcedurePricingByClinicId = async (clinicId) => {
  try {
    const res = await axios.get(`${BASE_URL_API}/pricing/clinic/${clinicId}`)
    return res.data
  } catch (err) {
    console.error('API Error:', err)
    throw err
  }
}
