// src/services/stockService.js
import axios from 'axios'
import { BASE_URL, wifiUrl } from '../../baseUrl'

// Fetch stock with filters
export const fetchStockAPI = async (filters = {}) => {
  const response = await axios.get(
    `${wifiUrl}/api/pharmacy/stockMaster/all`,
    { params: filters }
  )
  return response.data?.data || []
}

export const deleteInventoryData = async (id) => {
  try {
    const response = await axios.delete(
      `${wifiUrl}/api/pharmacy/stockMaster/delete/${id}`
    )
    return response.data
  } catch (error) {
    console.error("Error deleting inventory:", error.response?.data || error)
    throw error
  }
}
