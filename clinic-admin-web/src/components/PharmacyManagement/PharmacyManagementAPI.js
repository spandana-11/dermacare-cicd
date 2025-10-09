import axios from "axios";
import { BASE_URL } from "../../baseUrl"; // Make sure this includes protocol: http:// or https://


// ✅ Fetch all medicine types for a clinic
export const getMedicineTypes = async (clinicId) => {
  if (!clinicId) return []

  try {
    const response = await axios.get(`${BASE_URL}/getMedicineTypes/${clinicId}`)
    console.log('🔍 Medicine Types Response:', response.data)
    return response.data?.data?.medicineTypes || []
  } catch (error) {
    console.error('❌ Error fetching medicine types:', error)
    return []
  }
}

// ✅ Add a new medicine type (or multiple)
export const addMedicineType = async ({ clinicId, typeName }) => {
  if (!clinicId || !typeName) return null

  try {
    const response = await axios.post(`${BASE_URL}/search-or-add`, {
      clinicId,
      medicineTypes: [typeName], // only send the new type
    })
    console.log('➕ Add Medicine Type Response:', response.data)
    return response.data?.data?.medicineTypes || []
  } catch (error) {
    console.error('❌ Error adding medicine type:', error)
    return null
  }
}


// ✅ Fetch medicine templates by clinicId
// ✅ Save prescription API (with multiple medicines)
export const saveMedicineTemplate = async (formData) => {
  const clinicId = localStorage.getItem("HospitalId");

  if (!clinicId) {
    console.error("❌ No HospitalId found in localStorage");
    return null;
  }

  // 👇 Prepare request body
  const payload = {
    clinicId: clinicId,
    medicines: [
      {
        name: formData.name,
        dose: formData.dose,
        duration: formData.duration,
        durationUnit: formData.durationUnit,
        note: formData.note,
        food: formData.food,
        medicineType: formData.medicineType,
        remindWhen: formData.remindWhen,
        times: formData.times,
        others: formData.others || "",
        serialNumber: formData.serialNumber,
        genericName: formData.genericName || formData.name,
        brandName: formData.brandName,
        nameAndAddressOfTheManufacturer: formData.nameAndAddressOfTheManufacturer,
        batchNumber: formData.batchNumber,
        dateOfManufacturing: formData.dateOfManufacturing,
        dateOfExpriy: formData.dateOfExpriy,
        manufacturingLicenseNumber: formData.manufacturingLicenseNumber,
        stock:formData.stock,
      },
    ],
  };

  try {
    const response = await axios.post(
      `${BASE_URL}/createPrescription`, // ✅ Your backend endpoint
      payload
    );

    if (response?.data?.success) {
      console.log("✅ Prescription saved:", response.data.data);
      getPrescriptionsByClinicId();
      return response.data.data;
    } else {
      console.warn("⚠️ Failed to save prescription:", response?.data);
      return null;
    }
  } catch (error) {
    console.error("❌ Error saving prescription:", error);
    return null;
  }
};
// ✅ Fetch prescriptions by clinicId
// ✅ Fetch all prescriptions for clinicId
export const getPrescriptionsByClinicId = async () => {
  const clinicId = localStorage.getItem("HospitalId");

  if (!clinicId) {
    console.error("❌ No HospitalId found in localStorage");
    return [];
  }

  try {
    const response = await axios.get(`${BASE_URL}/getPrescriptionsByClinicId/${clinicId}`);
    if (response?.data?.success) {
      return response.data.data;
    } else {
      console.warn("⚠️ No prescriptions found:", response?.data);
      return [];
    }
  } catch (error) {
    console.error("❌ Error fetching prescriptions:", error);
    return [];
  }
};

// PharmacyManagementAPI.js
export const deletePrescriptionById = async (medicineId) => {
  if (!medicineId) return false

  try {
    const response = await axios.delete(`${BASE_URL}/deleteMedicine/${medicineId}`)
    getPrescriptionsByClinicId()
    return response?.data?.success || false
  } catch (error) {
    console.error('❌ Error deleting medicine:', error.response?.data || error)
    return false
  }
}


// Update medicine API
export const updateMedicine = async (medicineId, medicineData) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/updateMedicine/${medicineId}`,
      medicineData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    getPrescriptionsByClinicId()
    return response.data

  } catch (error) {
    console.error('Error updating medicine:', error)
    throw error
  }
}