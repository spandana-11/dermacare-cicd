import { ClinicBase_url } from '../../../baseUrl'
import { http } from '../../../Utils/Interceptors'
import axios from 'axios'
// ✅ Get all pharmacists
export const getPharmacistsById = (hospitalId,branchid) => {
  return http.get(`${ClinicBase_url}/getPharmacistsByHospitalIdAndBranchId/${hospitalId}/${branchid}`)
}
export const getPharmacistsByDept = (pharmacistId) => {
  return http.get(`${ClinicBase_url}/getAllPharmacists/${pharmacistId}`)
}

// ✅ Add pharmacist (multipart/form-data)
// PharmacistAPI.js
export const addPharmacist = (payload) => {
  // return axios.post("http://localhost:8080/clinic-admin/addPharmacist", payload, {
  return axios.post(`${ClinicBase_url}/addPharmacist`, payload, {
    headers: { "Content-Type": "application/json" },
  })
}


// ✅ Update pharmacist
export const UpdatePharmacistById = (pharmacistId, formData) => {
  return http.put(`${ClinicBase_url}/updatePharmacist/${pharmacistId}`, formData, {
    headers: { 'Content-Type': 'application/json' },
  })
}

// ✅ Delete pharmacist
export const DeletePharmacistById = (pharmacistId) => {
  return http.delete(`${ClinicBase_url}/deletePharmacist/${pharmacistId}`)
}
