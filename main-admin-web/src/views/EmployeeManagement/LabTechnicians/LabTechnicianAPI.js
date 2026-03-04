import { ClinicBase_url } from '../../../baseUrl'
import { http } from '../../../Utils/Interceptors'

// If not using interceptor, you can manually attach token

export const getAllLabTechnicians = (clinicID, branchId) => {
  return http.get(`${ClinicBase_url}/getLabTechniciansByClinicIdAndBranchId/${clinicID}/${branchId}`)
}

export const addLabTechnician = (data) => {
  return http.post(`${ClinicBase_url}/addLabTechnician`, data)
}

export const updateLabTechnician = (id, data) => {
  return http.put(`${ClinicBase_url}/updateById/${id}`, data)
}

export const deleteLabTechnician = (id) => {
  return http.delete(`${ClinicBase_url}/deleteById/${id}`)
}
