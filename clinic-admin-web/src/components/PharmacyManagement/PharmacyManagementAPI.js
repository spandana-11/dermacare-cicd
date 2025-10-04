import axios from "axios";
import { BASE_URL } from "../../baseUrl"; // Make sure this includes protocol: http:// or https://



export const addMedicineType = async (newType) => {
  const clinicId = localStorage.getItem("HospitalId")
  if (!clinicId) return newType

  try {
    const url = `${BASE_URL}/search-or-add`
    const response = await axios.post(url, {
      clinicId,
      medicineType: [newType],
    })

    return response.data?.data?.addedType || newType
  } catch (error) {
    console.error(error)
    return newType
  }
}


// Fetch all medicine types
export const getMedicineTypes = async (clinicId) => {
  if (!BASE_URL) return []

  try {
    const url = `${BASE_URL}/getMedicineTypes/${clinicId}`
    const response = await axios.get(url)
    console.log("🔍 Medicine Types Response:", response.data)

    // adjust depending on backend shape
    return response.data?.data?.medicineTypes || response.data?.data || []
  } catch (error) {
    console.error("❌ Error fetching medicine types:", error)
    return []
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
        nameAndAddressOfTheManufacturer: formData.manufacturer,
        batchNumber: formData.batchNumber,
        dateOfManufacturing: formData.dateOfManufacturing,
        dateOfExpriy: formData.dateOfExpiry,
        manufacturingLicenseNumber: formData.licenseNumber,
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