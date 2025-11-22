import axios from "axios";
import { BASE_URL } from "../../baseUrl";

// ------------------------------------------------------------------
// ✅ Fetch all opSales for a clinic
// ------------------------------------------------------------------
export const getAllOpSales = async () => {
  const clinicId = localStorage.getItem("HospitalId");

  if (!clinicId) {
    console.error("❌ No HospitalId found in localStorage");
    return [];
  }

  try {
    const response = await axios.get(`${BASE_URL}/getOpSales/${clinicId}`);
    console.log("📦 All OpSales Response:", response.data);

    return response?.data?.data?.opSales || [];
  } catch (error) {
    console.error("❌ Error fetching opSales:", error);
    return [];
  }
};

// ------------------------------------------------------------------
// ✅ Fetch opSale details by ID
// ------------------------------------------------------------------
export const getOpSaleById = async (opSaleId) => {
  if (!opSaleId) {
    console.error("⚠️ No OpSale ID provided");
    return null;
  }

  try {
    const response = await axios.get(`${BASE_URL}/getOpSaleById/${opSaleId}`);
    console.log("📄 OpSale By ID Response:", response.data);

    return response?.data?.data || null;
  } catch (error) {
    console.error("❌ Error fetching opSale by ID:", error);
    return null;
  }
};
