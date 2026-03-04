import { ClinicBase_url } from '../../../baseUrl'
import { http } from '../../../Utils/Interceptors'

// If not using interceptor, you can manually attach token

export const getAllSecuritys = (clinicID, branchId) => {
  return http.get(`${ClinicBase_url}/getSecurityStaffByClinicIdAndBranchId/${clinicID}/${branchId}`)
}

export const addSecurity = (data) => {
  return http.post(`${ClinicBase_url}/addSecurityStaff`, data)
}

export const updateSecurity = (id, data) => {
  return http.put(`${ClinicBase_url}/updateSecurityStaffById/${id}`, data)
}

export const deleteSecurity = (id) => {
  return http.delete(`${ClinicBase_url}/deleteSecurityStaffById/${id}`)
}
