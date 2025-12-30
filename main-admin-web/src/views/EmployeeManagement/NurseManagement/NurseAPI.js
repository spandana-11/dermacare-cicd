import { ClinicBase_url } from '../../../baseUrl'
import { http } from '../../../Utils/Interceptors'

// ------------------- Add Nurse -------------------
export const addNurse = (data) => {
  return http.post(`${ClinicBase_url}/addNurse`, data)
}

// ------------------- Get All Nurses by Hospital -------------------
export const getAllNurses = (hospitalId,branchId) => {
  return http.get(`${ClinicBase_url}/getAllNursesByBranch/${hospitalId}/${branchId}`)
}

// ------------------- Get Single Nurse -------------------
export const getNurse = (hospitalId, nurseId) => {
  return http.get(`${ClinicBase_url}/getNurse/${hospitalId}/${nurseId}`)
}

// ------------------- Update Nurse -------------------

export const updateNurse = (hospitalId, nurseId, data) => {
  return http.put(`${ClinicBase_url}/updateNurse/${nurseId}`, data, {})
}

// ------------------- Delete Nurse -------------------
export const deleteNurse = (hospitalId, nurseId) => {
  return http.delete(`${ClinicBase_url}/deleteNurse/${hospitalId}/${nurseId}`)
}

// ------------------- Nurse Login -------------------
export const nurseLogin = (data) => {
  return http.post(`${ClinicBase_url}/nurseLogin`, data)
}

// ------------------- Reset Nurse Login Password -------------------
export const resetNurseLogin = (data) => {
  return http.post(`${ClinicBase_url}/resetNurseLogin`, data)
}
