import axios from "axios";
import { BASE_URL } from "../../baseUrl";

// ------------------------------------------------------------------
// ✅ Fetch all purchases for a clinic
// ------------------------------------------------------------------
export const getAllPurchases = async () => {
  const clinicId = localStorage.getItem("HospitalId");

  if (!clinicId) {
    console.error("❌ No HospitalId found in localStorage");
    return [];
  }

  try {
    const response = await axios.get(`${BASE_URL}/getPurchases/${clinicId}`);
    console.log("📦 All Purchases Response:", response.data);

    return response?.data?.data?.purchases || [];
  } catch (error) {
    console.error("❌ Error fetching purchases:", error);
    return [];
  }
};

// ------------------------------------------------------------------
// ✅ Fetch purchase details by ID
// ------------------------------------------------------------------
export const getPurchaseById = async (purchaseId) => {
  if (!purchaseId) {
    console.error("⚠️ No Purchase ID provided");
    return null;
  }

  try {
    const response = await axios.get(`${BASE_URL}/getPurchaseById/${purchaseId}`);
    console.log("📄 Purchase By ID Response:", response.data);

    return response?.data?.data || null;
  } catch (error) {
    console.error("❌ Error fetching purchase by ID:", error);
    return null;
  }
};
