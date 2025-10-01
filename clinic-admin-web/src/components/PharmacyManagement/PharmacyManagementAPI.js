import axios from "axios";
import { baseUrlmedicine } from "../../baseUrl"; // Make sure this includes protocol: http:// or https://

// Fetch all medicine types
export const getMedicineTypes = async (clinicId) => {
  if (!baseUrlmedicine) {
    console.error("❌ Base URL is missing");
    return [];
  }

  try {
    const url = `${baseUrlmedicine}/getMedicineTypes/${clinicId}`;
    console.log("Fetching from URL:", url);

    const response = await axios.get(url);
    console.log("Fetched MedicineTypes:", response.data);

    return response.data?.data?.medicineTypes || [];
  } catch (error) {
    console.error("Failed to fetch medicine types:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error(error.message);
    }
    return [];
  }
};


// Add a new medicine type (return just the new type)
export const addMedicineType = async (newType) => {
  const clinicId = localStorage.getItem("HospitalId");

  if (!baseUrlmedicine) {
    console.error("❌ Base URL is missing");
    return newType;
  }

  if (!clinicId) {
    console.error("❌ Clinic ID not found in localStorage");
    return newType;
  }

  try {
    const url = `${baseUrlmedicine}/search-or-add`;
    console.log("Posting to URL:", url, "with newType:", newType);

    const response = await axios.post(url, {
      clinicId,
      medicineTypes: [newType], // must be array
    });

    console.log("✅ Add MedicineType Response:", response.data);

    // Return only the newly added type
    return newType;
  } catch (error) {
    console.error("❌ Failed to add medicine type:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error(error.message);
    }

    return newType; // fallback
  }
};



// ✅ Fetch medicine templates by clinicId
export const saveMedicineTemplate = async () => {
  const clinicId = localStorage.getItem("HospitalId");

  if (!clinicId) {
    console.error("❌ No HospitalId found in localStorage");
    return null;
  }

  try {
    const response = await axios.get(
      `${baseUrlmedicine}/getPrescriptionsByClinicId/${clinicId}`
    );

    if (response?.data?.success) {
      console.log("✅ Medicine templates fetched:", response.data.data);
      return response.data.data;
    } else {
      console.warn("⚠️ No data or request failed:", response?.data);
      return null;
    }
  } catch (error) {
    console.error("❌ Error fetching prescriptions:", error);
    return null;
  }
};
