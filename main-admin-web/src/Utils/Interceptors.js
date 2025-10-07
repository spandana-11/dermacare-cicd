
import axios from 'axios'
import { toast } from 'react-toastify'
import { BASE_URL } from '../baseUrl'

/* --------------------- Axios instances --------------------- */
export const http = axios.create({
  baseURL: BASE_URL, // 🔒 Secured APIs
  timeout: 20000,
})

export const httpPublic = axios.create({
  baseURL: BASE_URL, // 🌐 Public APIs
  timeout: 20000,
})

/* --------------------- Interceptors --------------------- */
export function attachInterceptors(getAuthToken) {
  // ✅ Request interceptor → attach token automatically
  const reqInterceptor = http.interceptors.request.use(
    (config) => {
      // const token = getAuthToken?.() || localStorage.getItem('token')
      // if (token) {
      //   config.headers.Authorization = `Bearer ${token}`
      // }
      return config
    },
    (error) => Promise.reject(error),
  )

  // ✅ Response interceptor → handle errors
  const resInterceptor = http.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.')
        // optional: log out user
        // localStorage.removeItem('token')
        // window.location.href = '/login'
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Request failed.')
      }
      return Promise.reject(error)
    },
  )

  // Return a function to eject interceptors if needed
  return () => {
    http.interceptors.request.eject(reqInterceptor)
    http.interceptors.response.eject(resInterceptor)
  }
}