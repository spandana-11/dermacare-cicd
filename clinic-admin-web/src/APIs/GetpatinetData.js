import { BASE_URL, wifiUrl } from '../baseUrl'
import { http } from '../Utils/Interceptors'

export const getBookingsByPatientId = (patientId) => {
  return http.get(`${wifiUrl}/api/customer/bookings/byInput/${patientId}`)
}
