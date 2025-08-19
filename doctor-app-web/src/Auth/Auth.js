import api from './axiosInterceptor'
import {
  appointmentsbaseUrl,
  appointmentsCountbaseUrl,
  clinicbaseUrl,
  doctorbaseUrl,
  updateLoginEndpoint,
  testsbaseUrl,
  diseasesbaseUrl,
  treatmentsbaseUrl,
  ratingsbaseUrl,
  savePrescriptionbaseUrl,
  todayappointmentsbaseUrl,
  addDiseaseUrl,getVisitHistoryByPatientIdAndDoctorIdEndpoint,
  // visitHistoryEndpoint,
  getdoctorSaveDetailsEndpoint,
  Get_ReportsByBookingId,
  reportbaseUrl,
  AllReports,getDoctorSlotsEndpoint,
  adminBaseUrl
} from './BaseUrl'

export const postLogin = async (payload, endpoint) => {
  try {
    const response = await api.post(`${endpoint}`, payload)
    console.log('Login Success:', response.data)
    return response.data
  } catch (error) {
    console.error('Login Failed:', error)
    throw error
  }
}
// export const postLogin = async (payload,endpoint) => {
//   try {

//     const response = await api.post(`${endpoint}`, payload);
//     console.log('Login Success:', response.data);
//     return response.data;
//   } catch (error) {
//     console.error('Login Failed:', error);
//     throw error;
//   }
// };

export const getDoctorDetails = async () => {
  const doctorId = localStorage.getItem('doctorId')
  try {
    const response = await api.get(`${doctorbaseUrl}/${doctorId}`)

    const doctorData = response.data.data

    console.log('✅ Doctor Details:', doctorData) // <-- Console log added here

    return doctorData // return only doctor data
  } catch (error) {
    console.error('❌ Error fetching doctor details:', error)
    throw error
  }
}

export const getClinicDetails = async () => {
  const hospitalId = localStorage.getItem('hospitalId')
  try {
    const response = await api.get(`${clinicbaseUrl}/${hospitalId}`, {})
    console.log(response.data.data)
    return response.data.data
  } catch (error) {
    console.error('❌ Error fetching clinic details:', error)
    throw error
  }
}

export const getTodayAppointments = async () => {
  const doctorId = localStorage.getItem('doctorId')
  const hospitalId = localStorage.getItem('hospitalId')
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
  const doctorId = localStorage.getItem('doctorId')
  const hospitalId = localStorage.getItem('hospitalId')

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
  const doctorId = localStorage.getItem('doctorId')
  const hospitalId = localStorage.getItem('hospitalId')

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
      prescriptionData,
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
      throw new Error('Expected a single object, but received an array.')
    }

    const response = await api.post(
      `${savePrescriptionbaseUrl}/createDoctorTemplate`,
      prescriptionData,
    )

    const result = response?.data
    console.log(result)
    return result ? result : null
  } catch (error) {
    console.error('❌ Error saving prescription:', error)
    return null
  }
}
//createDoctorSaveDetails

export const createDoctorSaveDetails = async (prescriptionData) => {
  try {
    // ✅ Ensure it's a plain object
    if (Array.isArray(prescriptionData)) {
      throw new Error('Expected a single object, but received an array.')
    }

    const response = await api.post(
      `${savePrescriptionbaseUrl}/createDoctorSaveDetails`,
      prescriptionData,
    )

    const result = response?.data
    return result?.success ? result.data : null
  } catch (error) {
    console.error('❌ Error saving prescription:', error)
    return null
  }
}

//gettemplate
// {{baseUrlDoctor}}/api/doctors/searchTemplate/Atopic Dermatitis

export const getDoctorSaveDetails = async (disease) => {
  console.log(disease)
  const hospitalId = localStorage.getItem('hospitalId')
  try {
    const response = await api.get(
      `${savePrescriptionbaseUrl}/getTemplatesByClinicIdAndTitle/${hospitalId}/${disease}`,
    )
    console.log(response?.data)
    const result = response?.data
    if (response.status == 200) {
      return result ? result.data : null
    }
  } catch (error) {
    console.error('❌ Error getting prescription:', error)
    return null
  }
}

//get medince template

export const medicineTemplate = async () => {
  const clinicId = localStorage.getItem('hospitalId')
  try {
    const response = await api.get(
      `${savePrescriptionbaseUrl}/getPrescriptionsByClinicId/${clinicId}`,
    )

    const result = response?.data
    return result?.success ? result.data : null
  } catch (error) {
    console.error('❌ Error saving prescription:', error)
    return null
  }
}

export const getAllLabTests = async () => {
  try {
    const response = await api.get(`${testsbaseUrl}`)
    if (response.data.success) {
      console.log('Lab tests:', response.data.data)
      return response.data.data
    } else {
      console.error('Failed to fetch lab tests:')
    }
  } catch (error) {}
}

// Get all diseases
export const getAllDiseases = async () => {
  try {
    const response = await api.get(`${diseasesbaseUrl}`)
    console.log('Diseases:', response)
    if (response.data.success) {
      console.log('Diseases:', response.data.data)
      return response.data.data // returns array of diseases
    } else {
      console.error('Failed to fetch diseases:', response.data.message)
      return []
    }
  } catch (error) {
    console.error('Error fetching diseases:', error)
    return []
  }
}

// Get all treatments
export const getAllTreatments = async () => {
  try {
    const response = await api.get(`${treatmentsbaseUrl}`)
    if (response.data.success) {
      console.log('Treatments:', response.data.data)
      return response.data.data // returns array of treatments
    } else {
      console.error('Failed to fetch treatments:', response.data.message)
      return []
    }
  } catch (error) {
    console.error('Error fetching treatments:', error)
    return []
  }
}

export const averageRatings = async (hospitalId, doctorId) => {
  try {
    const response = await api.get(`${ratingsbaseUrl}/${hospitalId}/${doctorId}`)

    if (response.data && response.data.success) {
      const { overallDoctorRating, overallHospitalRating, comments, ratingCategoryStats } =
        response.data

      return {
        doctorRating: overallDoctorRating,
        hospitalRating: overallHospitalRating,
        comments,
        ratingStats: ratingCategoryStats,
      }
    } else {
      throw new Error(response.data?.message || 'Failed to fetch ratings')
    }
  } catch (error) {
    console.error('Error fetching ratings:', error)
    return null
  }
}

export const updateLogin = async (payload, username) => {
  try {
    const response = await api.put(`/api/doctors/update-password/${username}`, payload)
    return response.data
  } catch (err) {
    console.error('Update login error:', err)
    throw err
  }
}

// http://localhost:8080/clinic-admin/addDisease

// {
//     "disease":"skin alergy",
//     "hospitalId":"H_1"
// }
export const addDisease = async (disease) => {
  const clinicId = localStorage.getItem('hospitalId')
  const payload = {
    disease: disease,
    hospitalId: clinicId,
  }
  try {
    const response = await api.post(`${addDiseaseUrl}/addDisease`, payload)
    return response.data
  } catch (err) {
    console.error('addDisease error:', err)
    throw err
  }
}






export const getVisitHistoryByPatientIdAndDoctorId = async (patientId, doctorId) => {
  console.log(patientId)
  console.log(doctorId)
  try {
    const url = `${getVisitHistoryByPatientIdAndDoctorIdEndpoint}/${patientId}/${doctorId}`;
    console.log(url)
    const response = await api.get(url);
    console.log("visithistory response", response.data);
    return response.data; // { success, data, message, status }
  } catch (error) {
    // Axios error object may contain response info
    if (error.response.status==404) {
      // Server responded with status code outside 2xx
      console.error('HTTP error:', error.response.status, error.response.data);
      throw new Error(`No visit history available`);
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
      throw new Error('No response received from server');
    } else {
      // Something else happened
      console.error('Error', error.message);
      throw error;
    }
  }
};

//reports

 
export const ReportsData = async () => {
  try {
    const response = await api.get(`${reportbaseUrl}/${AllReports}`)
    const reports = response.data.data
    console.log(reports)
    return reports
  } catch (error) {
    console.error('Error fetching report by ID:', error.message)
    return null
  }
}
export const Get_ReportsByBookingIdData = async (bookingId) => {
  try {
    const response = await api.get(`${reportbaseUrl}/${Get_ReportsByBookingId}/${bookingId}`)
    console.log(response)
    return response.data.data
  } catch (error) {
    console.error('Error fetching report by ID:', error.message)
    return null
  }
}


export const getAdImages = async () => {
  try {
    const response = await api.get(`${adminBaseUrl}/categoryAdvertisement/getAll`);

    if (Array.isArray(response?.data) && response.data.length > 0) {
      return response.data
        .filter(item => item?.mediaUrlOrImage) // keep only valid ones
        .map(item => item.mediaUrlOrImage);
    }

    console.warn("⚠ No ad media found in API response:", response.data);
    return [];
  } catch (error) {
    console.error("❌ Error fetching ad images:", error);
    return [];
  }
};

// Auth.js
export const getAdImagesView = async () => {
  try {
    const response = await api.get(`${adminBaseUrl}/doctorWebAds/getAll`);

    console.log("📌 API Raw Response:", response.data); // <-- log full response

    if (Array.isArray(response?.data) && response.data.length > 0) {
      return response.data
        .filter((item) => item?.mediaUrlOrImage)
        .map((item) => ({
          id: item.id,
          url: item.mediaUrlOrImage,
          type: item.type || (item.mediaUrlOrImage.endsWith(".mp4") ? "video" : "image"),
        }));
    }

    console.warn("⚠️ No ad media found in API response:", response.data);
    return [];
  } catch (error) {
    console.error("❌ Error fetching ads:", error);
    return [];
  }
};


// Save uploaded images
export const saveImagesToServer = async (files) => {
  try {
    console.log("📤 Sending files to server:", files.map(f => f.name));

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file, file.name);
    });

    const response = await api.post(`${adminBaseUrl}/images/save`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("✅ Save API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error saving images:", error);
    throw error;
  }
};

// Load images
export const loadImagesFromServer = async () => {
  try {
    console.log("📥 Requesting saved images...");

    const response = await api.get(`${adminBaseUrl}/images/getAll`);

    console.log("✅ Load API Response:", response.data);

    if (Array.isArray(response?.data) && response.data.length > 0) {
      return response.data.map((item) => ({
        id: item.id,
        url: item.url,
        type: item.type || (item.url.endsWith(".mp4") ? "video" : "image"),
        savedAt: item.savedAt || null,
      }));
    }

    console.warn("⚠️ No images found:", response.data);
    return [];
  } catch (error) {
    console.error("❌ Error loading images:", error);
    return [];
  }
};

// Clear all images
export const clearImagesOnServer = async () => {
  try {
    console.log("🗑️ Requesting server to clear all images...");

    const response = await api.delete(`${adminBaseUrl}/images/clearAll`);

    console.log("✅ Clear API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error clearing images:", error);
    throw error;
  }
};
//doctor slots
export const getAvailableSlots = async (hospitalId, doctorId) => {
  try {
    // Replace `slotsBaseUrl` with your actual API base URL
    const response = await api.get(`${getDoctorSlotsEndpoint}/${hospitalId}/${doctorId}`);
console.log(response.data.data)

    if (response.data && response.data.success) {
      // Assuming response.data.data is an array with one or more objects
      const slotsData = response.data.data.map(item => ({
        id: item.id,
        doctorId: item.doctorId,
        hospitalId: item.hospitalId,
        date: item.date,
        availableSlots: item.availableSlots, // array of { slot, slotbooked }
        createdAt: item.createdAt,
      }));

      return {
        slots: slotsData,
        message: response.data.message,
        status: response.data.status,
      };
    } else {
      throw new Error(response.data?.message || 'Failed to fetch slots');
    }
  } catch (error) {
    console.error('Error fetching slots:', error);
    return null;
  }
};