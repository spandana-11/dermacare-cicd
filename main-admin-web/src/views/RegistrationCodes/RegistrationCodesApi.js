import axios from "axios";
import { REGISTRATION_CODE_GET_ALL_URL, REGISTRATION_CODE_GET_ALL_URL_DEV } from "../../baseUrl";

export const getAllRegistrationCodes = async () => {
  try {
    const res = await axios.get(`${REGISTRATION_CODE_GET_ALL_URL}`);
    return res.data?.data || [];
  } catch (error) {
    console.error("Get Registration Codes Error:", error);
    return [];
  }
};
export const getAllRegistrationCodes_Dev= async () => {
  try {
    const res = await axios.get(`${REGISTRATION_CODE_GET_ALL_URL_DEV}`);
    return res.data?.data || [];
  } catch (error) {
    console.error("Get Registration Codes Error:", error);
    return [];
  }
};
