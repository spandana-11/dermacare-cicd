import { ClinicBase_url } from '../../../baseUrl'
import { http } from '../../../Utils/Interceptors'

// If not using interceptor, you can manually attach token

export const getAllFrontDeskAPI = (clinicID,branchId) => {
  return http.get(`clinic-admin/getReceptionistsByClinicIdAndBranchId/${clinicID}/${branchId}`)
}

export const addFrontDeskAPI = (data) => {
  return http.post(`clinic-admin/createReceptionist`, data)
}

export const updateFrontDeskAPI = (id, data) => {
  return http.put(`clinic-admin/updateReceptionist/${id}`, data)
}

export const deleteFrontDeskAPI = (id) => {
  return http.delete(`clinic-admin/deleteReceptionist/${id}`)
}
