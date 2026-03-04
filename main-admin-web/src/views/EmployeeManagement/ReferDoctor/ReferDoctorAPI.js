import { ClinicBase_url } from '../../../baseUrl'
import { http } from '../../../Utils/Interceptors'

// ✅ All names match your imports in ReferDoctorManagement.js now

export const getAllReferDoctors = (clinicId) => {
  return http.get(`${ClinicBase_url}/getReferralDoctorsByClinicId/${clinicId}`,)
}

export const addReferDoctor = (data) => {
  return http.post(`${ClinicBase_url}/addReferralDoctor`, data)
}

export const updateReferDoctor = (id, data) => {
  return http.put(`${ClinicBase_url}/updateReferralDoctorById/${id}`, data)
}

export const deleteReferDoctor = (id) => {
  return http.delete(`${ClinicBase_url}/deleteReferralDoctorById/${id}`)
}