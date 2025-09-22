// // src/api/http.js
// import axios from 'axios'
// import { toast } from 'react-toastify'
// import { BASE_URL, SBASE_URL } from '../baseUrl'

// /* --------------------- Toast helpers --------------------- */
// const recentToasts = new Map()
// const DEDUPE_MS = 4000

// function toastOnce(key, msg, type = 'error') {
//   const now = Date.now()
//   const last = recentToasts.get(key) || 0
//   if (now - last > DEDUPE_MS) {
//     recentToasts.set(key, now)
//     const fn = {
//       info: toast.info,
//       success: toast.success,
//       warn: toast.warn,
//       error: toast.error,
//     }[type]
//     fn(msg, { toastId: key, autoClose: 4000 })
//   }
// }

// const TOAST_EXCLUDE = [/\/health$/, /\/metrics$/, '/telemetry']
// function shouldToast(config) {
//   if (!config?.url) return true
//   return !TOAST_EXCLUDE.some((p) =>
//     p instanceof RegExp ? p.test(config.url) : config.url.includes(p),
//   )
// }

// /* --------------------- Status messages --------------------- */
// function statusMessage(status) {
//   const map = {
//     400: 'Bad request. Please check your input.',
//     401: 'You’re not authorized. Please sign in again.',
//     403: 'Forbidden. You don’t have permission.',
//     404: 'Not found. The requested resource isn’t here.',
//     409: 'Conflict. The resource has changed.',
//     422: 'Validation error. Please fix the highlighted fields.',
//     429: 'Too many requests. Please slow down.',
//     500: 'Server error. Please try again later.',
//     502: 'Bad gateway. The server upstream failed.',
//     503: 'Service unavailable. Try again in a moment.',
//     504: 'Gateway timeout. Server took too long.',
//   }
//   return map[status] || `Unexpected error (status ${status}).`
// }

// /* --------------------- Extract server message --------------------- */
// function extractServerMessage(data) {
//   if (!data) return
//   if (typeof data === 'string') return data
//   if (data.message) return String(data.message)
//   if (data.error) return String(data.error)
//   if (Array.isArray(data.errors)) return data.errors.join(', ')
//   if (data.errors && typeof data.errors === 'object') {
//     const first = Object.values(data.errors)[0]
//     if (Array.isArray(first)) return first[0]
//   }
// }

// /* --------------------- Axios instances --------------------- */
// export const http = axios.create({
//   baseURL: BASE_URL, // 🔒 Secured APIs
//   timeout: 20000,
// })

// export const httpPublic = axios.create({
//   baseURL: SBASE_URL, // 🌐 Public APIs (login, signup, captcha, etc.)
//   timeout: 20000,
// })

// /* --------------------- Interceptors --------------------- */
// export function attachInterceptors(getAuthToken) {
//   // Secure API → attach token
//   const reqInterceptor = http.interceptors.response.use(
//     (response) => response,
//     (error) => {
//       if (error.response?.status === 401) {
//         toast.error('Session expired. Please login again.')
//         // localStorage.removeItem('token')
//         // window.location.href = '/login'
//       } else {
//         toast.error(error.response?.data?.message || 'Request failed.')
//       }
//       return Promise.reject(error)
//     },
//   )

//   // Response handler (both success + error)
//   const resInterceptor = http.interceptors.response.use(
//     (response) => response,
//     (error) => {
//       if (error.response?.status === 401) {
//         toast.error('Session expired. Please login again.')
//         // localStorage.removeItem('token')
//         // window.location.href = '/login'
//       }
//       return Promise.reject(error)
//     },
//   )

//   return () => {
//     http.interceptors.request.eject(reqInterceptor)
//     http.interceptors.response.eject(resInterceptor)
//   }
// }

import axios from 'axios'
import { toast } from 'react-toastify'
import { BASE_URL, SBASE_URL } from '../baseUrl'

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
