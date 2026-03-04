import { ClinicBase_url } from '../../../baseUrl'
import { http } from '../../../Utils/Interceptors'

export const getAllAdmins = (clinicId) => {
  return http.get(`${ClinicBase_url}/getAllAdministrators/${clinicId}`)
}
export const addAdmin = (data) => {
  return http.post(`${ClinicBase_url}/add`, data)
}
export const UpdateAdmin = (clinicId, adminId, data) => {
  return http.put(`${ClinicBase_url}/updateAdministratorByClinicIdAdminId/${clinicId}/${adminId}`, data)
}
export const DeleteAdmin = (clinicId, adminId) => {
  return http.delete(`${ClinicBase_url}/deleteAdministratorByClinicIdAdminId/${clinicId}/${adminId}`)
}
