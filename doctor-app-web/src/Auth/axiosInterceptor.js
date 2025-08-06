// src/api/axiosInterceptor.js
import axios from 'axios'
import { baseUrl } from './BaseUrl'


const api = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // Avoid sending token for login API
    if (!config.url.includes('/auth/login')) {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized. Clearing token.')
      localStorage.removeItem('token')
    }
    return Promise.reject(error)
  }
)

export default api
