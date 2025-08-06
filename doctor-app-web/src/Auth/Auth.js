import api from "./axiosInterceptor";
import {  appointmentsbaseUrl, appointmentsCountbaseUrl, clinicbaseUrl,doctorbaseUrl, savePrescriptionbaseUrl, todayappointmentsbaseUrl } from "./BaseUrl";

export const postLogin = async (payload,endpoint) => {
  try {

    const response = await api.post(`${endpoint}`, payload);
    console.log('Login Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('Login Failed:', error);
    throw error;
  }
};
 
export const getDoctorDetails = async () => {
  const doctorId = localStorage.getItem("doctorId");
  try {
    const response = await api.get(`${doctorbaseUrl}/${doctorId}`);

    const doctorData = response.data.data;

    console.log('✅ Doctor Details:', doctorData); // <-- Console log added here

    return doctorData; // return only doctor data
  } catch (error) {
    console.error('❌ Error fetching doctor details:', error);
    throw error;
  }
};


export const getClinicDetails = async () => {
   const hospitalId= localStorage.getItem("hospitalId");
  try {
  
    const response = await api.get(`${clinicbaseUrl}/${hospitalId}`, {
      
    })
    return response.data.data
  } catch (error) {
    console.error('❌ Error fetching clinic details:', error)
    throw error
  }
}


export const getTodayAppointments = async () => {
   const doctorId= localStorage.getItem("doctorId");
    const hospitalId= localStorage.getItem("hospitalId");
  try {
    const response = await api.get(`${todayappointmentsbaseUrl}/${hospitalId}/${doctorId}`)
    console.log(response.data)
    return response.data || [] // ✅ Safely return patientData array
  } catch (error) {
    console.error('❌ Error fetching appointment details:', error)
    return [] // Fallback to empty array on failure
  }
}

export const getAppointments = async (number) => {
  const doctorId = localStorage.getItem("doctorId")
  const hospitalId = localStorage.getItem("hospitalId")

  try {
    const response = await api.get(`${appointmentsbaseUrl}/${hospitalId}/${doctorId}/${number}`)
    
    // response.data might be { success: true, data: [...] }
    const appointments = response?.data?.data
    return Array.isArray(appointments) ? appointments : []
  } catch (error) {
    console.error('❌ Error fetching appointment details:', error)
    return []
  }
}


export const getAppointmentsCount = async (number) => {
  const doctorId = localStorage.getItem("doctorId")
  const hospitalId = localStorage.getItem("hospitalId")

  try {
    const response = await api.get(`${appointmentsCountbaseUrl}/${hospitalId}/${doctorId}`)
    
    return response?.data ?? { completedAppointmentsCount: 0 }
  } catch (error) {
    console.error('Error fetching completed appointments count:', error)
    return { completedAppointmentsCount: 0 }
  }
}


export const SavePrescription = async (prescriptionData) => {
  try {
    const response = await api.post(
      `${savePrescriptionbaseUrl}/createPrescription`,
      prescriptionData
    )

    const result = response?.data
    return result?.success ? result.data : null
  } catch (error) {
    console.error('❌ Error saving prescription:', error)
    return null
  }
}

export const SearchPrescription = async () => {
  try {
    const response = await api.get(`${savePrescriptionbaseUrl}/searchMedicines`)

    const result = response?.data
    return result?.success ? result.data : []
  } catch (error) {
    console.error('❌ Error fetching prescriptions:', error)
    return []
  }
}


//presrcption template

export const SavePatientPrescription = async (prescriptionData) => {
  try {
    // ✅ Ensure it's a plain object
    if (Array.isArray(prescriptionData)) {
      throw new Error("Expected a single object, but received an array.");
    }

    const response = await api.post(
      `${savePrescriptionbaseUrl}/createDoctorTemplate`,
      prescriptionData
    );

    const result = response?.data;
    return result?.success ? result.data : null;
  } catch (error) {
    console.error('❌ Error saving prescription:', error);
    return null;
  }
};
//createDoctorSaveDetails

export const createDoctorSaveDetails = async (prescriptionData) => {
  try {
    // ✅ Ensure it's a plain object
    if (Array.isArray(prescriptionData)) {
      throw new Error("Expected a single object, but received an array.");
    }

    const response = await api.post(
      `${savePrescriptionbaseUrl}/createDoctorSaveDetails`,
      prescriptionData
    );

    const result = response?.data;
    return result?.success ? result.data : null;
  } catch (error) {
    console.error('❌ Error saving prescription:', error);
    return null;
  }
};




