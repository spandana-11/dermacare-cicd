// doctorUtils.js

import axios from 'axios'
import { BASE_URL, getAllDoctors, getDoctorByClinicId, doctorAvailableUrl, addDoctorUrl, GetBranches_ByClinicId, getDoctorsByHospitalIdAndBranchId, UpdateDoctor } from '../../baseUrl'
import { toast } from 'react-toastify'

// 🆕 Update Doctor Availability (true/false)
export const updateDoctorAvailability = async (doctorId, isAvailable) => {
  try {
    const url = `${BASE_URL}/${doctorAvailableUrl}/${doctorId}/availability`
    console.log('Updating availability:', doctorId, isAvailable)

    const response = await axios.post(
      url,
      { doctorAvailabilityStatus: isAvailable },
      { headers: { 'Content-Type': 'application/json' } },
    )

    console.log('Update response:', response.data)

    // You can check either axios status or your API success field
    return response.status === 200 && response.data.success === true
  } catch (error) {
    toast.error(`${error.message}` || 'Failed to update doctor availability')
    console.error('❌ Error updating availability:', error)
    return false
  }
}


export const handleDeleteToggle = async (doctorID) => {
  console.log(doctorID)
  try {
    const response = await axios.delete(`${BASE_URL}/delete-doctor/${doctorID}`)
    console.log('Doctor deleted successfully:', response.data)
    // Optional: return true or response if needed
    return response
  } catch (error) {
    toast.error(`${error.message}` || 'Failed to delete doctor')
    console.error('Error occurred while deleting doctor:', error.response?.data || error.message)
    // Optional: return false or error if needed
    return false
  }
}

export const DoctorData = async () => {
  console.log('appointdata calling')
  try {
    const response = await axios.get(`${BASE_URL}/${getAllDoctors}`)
    console.log(`appointdata calling ${response.data}`)

    console.log(response.data)

    return response.data
  } catch (error) {
    console.error('Error fetching service data:', error.message)
    if (error.response) {
      console.error('Error Response Data:', error.response.data)
      console.error('Error Response Status:', error.response.status)
    }
    throw error
  }
}
export const getDoctorByClinicIdData = async (clinicId) => {
  console.log('appointdata calling')
  try {
    const response = await axios.get(`${BASE_URL}/${getDoctorByClinicId}/${clinicId}`)
    console.log(`appointdata calling ${response.data}`)

    console.log(response.data)

    return response.data
  } catch (error) {
    console.error('Error fetching service data:', error.message)
    if (error.response) {
      console.error('Error Response Data:', error.response.data)
      console.error('Error Response Status:', error.response.status)
    }
    throw error
  }
}
export const getDoctorDetailsById = async (doctorId) => {
  console.log('doctorData calling')
  try {
    const response = await axios.get(`${BASE_URL}/${GetBy_DoctorId}/${doctorId}`)
    console.log(`doctorData calling ${response.data}`)

    console.log(response.data)

    return response.data
  } catch (error) {
    console.error('Error fetching service data:', error.message)
    if (error.response) {
      console.error('Error Response Data:', error.response.data)
      console.error('Error Response Status:', error.response.status)
    }
    throw error
  }
}

export const AddDoctorByAdmin=async(doctorData)=>{
  try{
    const response= await axios.post(`${BASE_URL}/${addDoctorUrl}`, doctorData,{
      headers:{
        "Content-type":"application/json",
      },
    })
    return response.data;
  }catch(error){
    console.error("Error while adding Doctor:", error.response?.data || error.message);
    throw error;
  }
};
export const GetClinicBranches = async (clinicId) => {
  console.log('appointdata calling')
  try {
    const response = await axios.get(`${BASE_URL}/${GetBranches_ByClinicId}/${clinicId}`)
    console.log(`appointdata calling ${response.data}`)

    console.log(response.data)

    return response.data
  } catch (error) {
    console.error('Error fetching service data:', error.message)
    if (error.response) {
      console.error('Error Response Data:', error.response.data)
      console.error('Error Response Status:', error.response.status)
    }
    throw error
  }
}




//getBranchByClinicAndBranchId
export const getDoctorsByHospitalAndBranchId = async (clinicId, branchId) => {
  console.log('🔄 Fetching branch by clinicId and branchId...',clinicId, branchId)
  try {
    const response = await axios.get(
      `${BASE_URL}/${getDoctorsByHospitalIdAndBranchId}/${clinicId}/${branchId}`
    )
    console.log(`✅ API Response:`, response.data)
    return response.data
  } catch (error) {
    console.error('❌ Error fetching branch data:', error.message)
    if (error.response) {
      console.error('Error Response Data:', error.response.data)
      console.error('Error Response Status:', error.response.status)
    }
    throw error
  }
}

export const UpdateDoctorById = async (doctorId, doctorData) => {
  if (!doctorId) throw new Error("❌ Doctor ID is required");

  const url = `${BASE_URL}/${UpdateDoctor}/${doctorId}`;
  console.log("🔎 Update Doctor API URL:", url);
  console.log("📤 Payload being sent:", doctorData);
console.log("🔗 URL called:", `${BASE_URL}/${UpdateDoctor}/${doctorId}`);

  try {
    const response = await axios.put(url, doctorData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Update doctor API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating doctor data:", error.message);
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
    }
    throw error;
  }
};
