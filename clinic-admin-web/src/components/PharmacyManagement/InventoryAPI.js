// src/services/stockService.js
import axios from 'axios'
import { BASE_URL } from '../../baseUrl'

  // 🔹 Replace with your backend URL

// Fetch stock with filters
export const fetchStockAPI = async (filters = {}) => {
  const response = await axios.post(`${BASE_URL}/inventory/stock-report`, filters)
  return response.data?.data || []
}
