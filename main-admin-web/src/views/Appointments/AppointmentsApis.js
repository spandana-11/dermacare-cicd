import axios from "axios";
import { BASE_URL_API } from "../../baseUrl";

export const getAppointmentsByBookingId = async (bookingId) => {
  try {
    const res = await axios.get(`${BASE_URL_API}/bookings/${bookingId}`);

    return {
      success: res.data?.success,
      message: res.data?.message,
      data: res.data?.data || [],
    };

  } catch (error) {
    const err = error.response?.data;

    return {
      success: false,
      message:
        err?.message ||
        err?.error ||
        error.message ||
        "Something went wrong",
      status: err?.status || error.response?.status,
      path: err?.path,
      requestId: err?.requestId,
      timestamp: err?.timestamp,
      data: []
    };
  }
};


export const updateAppointmentStatus = async (bookingId, status) => {
  try {
    const res = await axios.put(`${BASE_URL_API}/bookings/update-status`, {
      bookingId,
      status
    });

    return {
      success: res.data?.success,
      message: res.data?.message
    };

  } catch (error) {
    const err = error.response?.data;

    return {
      success: false,
      message:
        err?.message ||
        err?.error ||
        error.message ||
        "Failed to update status",
      status: err?.status || error.response?.status,
      path: err?.path,
      requestId: err?.requestId,
      timestamp: err?.timestamp
    };
  }
};
