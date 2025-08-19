import axios from 'axios'
import { BASE_URL, PatientConsentForm, UpdateConsentForm } from '../../baseUrl'

export const ConsentFormData = async (bookingId, patientId, mobileNumber) => {
  console.log('Calling API:', `${BASE_URL}/${PatientConsentForm}/${bookingId}/${patientId}/${mobileNumber}`);
  try {
    const response = await axios.get(`${BASE_URL}/${PatientConsentForm}/${bookingId}/${patientId}/${mobileNumber}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching service data:', error.message);
    if (error.response) {
      console.error('Error Response Data:', error.response.data);
      console.error('Error Response Status:', error.response.status);
    }
    throw error;
  }
};


export const updateConsentFormData = async (consentFormId, payload) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/${UpdateConsentForm}/${consentFormId}`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

