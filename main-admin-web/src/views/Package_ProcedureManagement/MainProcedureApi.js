import axios from "axios";
import { BASE_URL_API } from "../../baseUrl";

// ⭐ GET ALL PROCEDURES
export const getAllProcedures = async () => {
  try {
    const res = await axios.get(`${BASE_URL_API}/clinic-admin/procedures`);
    return res.data?.data || [];
  } catch (error) {
    console.error("Get Procedures Error:", error);
    return [];
  }
};

