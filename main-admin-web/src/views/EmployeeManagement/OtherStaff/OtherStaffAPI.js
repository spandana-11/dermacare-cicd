import { ClinicBase_url } from '../../../baseUrl'
import { http } from '../../../Utils/Interceptors'

// If not using interceptor, you can manually attach token

export const getAllOtherStaffs = (clinicID,branchId) => {
  return http.get(`${ClinicBase_url}/getWardBoysByClinicIdAndBranchId/${clinicID}/${branchId}`)
}

export const addOtherStaff = (data) => {
  return http.post(`${ClinicBase_url}/addWardBoy`, data)
}

export const updateOtherStaff = (id, data) => {
  return http.put(`${ClinicBase_url}/updateWardBoy/${id}`, data)
}

export const deleteOtherStaff = (id) => {
  return http.delete(`${ClinicBase_url}/deleteWardBoy/${id}`)
}
