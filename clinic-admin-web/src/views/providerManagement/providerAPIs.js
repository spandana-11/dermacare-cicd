import axios from 'axios'
import {
  BASE_URL,
  ProviderAllData,
  BasicDetails,
  updateBasic,
  BasicProfile,
  UpdateBasicProfile,
  qualification,
  updateQualification,
  Experience,
  updateExperience,
  AddExperience,
  DeleteExperience,
  courseCertification,
  updateCourse,
  deleteCourse,
  Bank,
  updateBank,
  Verification,
  updateVerification,
} from '../../baseUrl'

export const providerData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/${ProviderAllData}`)
    console.log(response)
  

    return response.data.map((provider) => ({
      ...provider,
      emailId: provider.providerBasicProfile?.emailId || '',
    }))
  } catch (error) {
    console.error('Error fetching provider data:', error)
    throw new Error('Failed to fetch provider data')
  }
}

export const CustomerData = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/${BasicDetails}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customer data:', error);
    throw error;
  }
}

// providerAPIs.js

export const updateBasicData = async (id, providerData) => {
  try {
    const response = await axios.put(`${BASE_URL}/${updateBasic}/${id}`, providerData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating provider data:', error.response ? error.response.data : error.message);
    throw error;
  }
};



// basic profile

export const getBasicProfileByID = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/${BasicProfile}/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching basic profile data by ID:', error)
    throw error
  }
}

export const updateProviderData = async (id, providerData) => {
  try {
    const { id: removedId, ...dataWithoutId } = providerData; 

    console.log('Provider Data being sent (without id):', dataWithoutId);

    const response = await axios.put(`${BASE_URL}/${UpdateBasicProfile}/${id}`, dataWithoutId, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error updating provider data:', error.response ? error.response.data : error);
    throw error;
  }
};



// qualification details

export const getQualificationID = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/${qualification}/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching basic profile data by ID:', error)
    throw error
  }
}


export const updateQualificationData = async (id, providerData) => {
  try {
    const { id: removedId, ...dataWithoutId } = providerData; 
    const response = await axios.put(`${BASE_URL}/${updateQualification}/${id}`, dataWithoutId, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error updating Qualifications details:', error.response?.data || error.message);
    throw error; 
  }
};

// experience details

export const getExperienceID = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/${Experience}/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching basic profile data by ID:', error)
    throw error
  }
}

export const postExperienceData = async (id, providerData) => {
  try {
    const requestData = {
      experienceList: providerData.experienceList, 
    };
    console.log('Sending data to API:', id, requestData); 

    const response = await axios.post(`${BASE_URL}/${AddExperience}/${id}`, requestData, {
      headers: {
        'Content-Type': 'application/json', 
      },
    });

    return response.data; 
  } catch (error) {
    console.error('Error sending experience data to API:', error);

    if (error.response) {
      console.error('API response error:', error.response.data);
    }
    throw error;
  }
};


export const updateExperienceData = async (mobileNumber, index, experienceData) => {
  try {
    if (!experienceData || !experienceData.experienceList || experienceData.experienceList.length === 0) {
      throw new Error('No experience data provided');
    }

    console.log('Experience Data being sent:', experienceData);

    const response = await axios.put(
      `${BASE_URL}/${updateExperience}/${mobileNumber}/${index}`,
      experienceData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error updating experience data:', error.response?.data || error.message);
    throw new Error(`API Error: ${error.response?.data?.message || error.message}`);
  }
};




export const deleteExperienceData = async (mobileNumber, index) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/${DeleteExperience}/${mobileNumber}/${index}`
    );

    if (response.status === 200) {
      return { success: true, message: response.data };
    } else {
      return { success: false, message: response.data };
    }
  } catch (error) {
    console.error("Error deleting experience:", error);
    return { success: false, message: "Error deleting experience" };
  }
};


// Course Certification

export const getCourseCertification = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/${courseCertification}/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching basic profile data by ID:', error)
    throw error
  }
}

export const postCourseData = async (mobileNumber, providerData) => {
  try {
    if (!providerData || !providerData.courseList || providerData.courseList.length === 0) {
      throw new Error('No course data provided');
    }

    const requestData = {
      courseList: providerData.courseList,
    };

    console.log('Sending course data to API:', requestData);

    const response = await axios.post(
      `${BASE_URL}/providers/addCourseCertification/${mobileNumber}`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error sending course data to API:', error);

    if (error.response) {
      console.error('API response error:', error.response.data);
    }

    throw error;
  }
};

export const updateCourseData = async (mobileNumber, index, courseList) => {
  try {
    if (!courseList || !Array.isArray(courseList) || courseList.length === 0) {
      throw new Error('Course data is not provided or empty');
    }

    const requestData = { courseList };

    console.log('Final Course Data being sent to API:', JSON.stringify(requestData, null, 2));

    const response = await axios.put(
      `${BASE_URL}/updateCourseCertification/${mobileNumber}/${index}`, 
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error updating Course data:', error.response?.data || error.message);
    throw new Error(`API Error: ${error.response?.data?.message || error.message}`);
  }
};







export const deleteCourseData = async (mobileNumber, index) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/${deleteCourse}/${mobileNumber}/${index}`
    );

    if (response.status === 200) {
      return { success: true, message: response.data };
    } else {
      return { success: false, message: response.data };
    }
  } catch (error) {
    console.error('Error deleting course:', error);
    return { success: false, message: 'Error deleting course' };
  }
};




// bank details

export const getBankID = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/${Bank}/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching basic profile data by ID:', error)
    throw error
  }
}

export const updateBankData = async (id, providerData) => {
  try {
    const { id: removedId, ...dataWithoutId } = providerData; 

    // Sending the data as JSON
    const response = await axios.put(`${BASE_URL}/${updateBank}/${id}`, dataWithoutId, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error updating bank details:', error.response?.data || error.message);
    throw error; 
  }
};


// verification details

export const getVerificationID = async (mobileNumber) => {
  try {
    const response = await axios.get(`${BASE_URL}/${Verification}/${mobileNumber}`)
    return response.data
  } catch (error) {
    console.error('Error fetching verfiyProvider  data by ID:', error)
    throw error
  }
}

export const updateVerificationData = async (mobileNumber, providerData) => {
  const { id, data,message, ...dataWithoutId } = providerData;

  console.log('Sending data to API:', mobileNumber, dataWithoutId); 

  try {
    const response = await axios.put(
      `${BASE_URL}/${updateVerification}/${mobileNumber}`,
      dataWithoutId,
    );

    console.log('API Response:', response.data);

    return response.data;
  } catch (error) {
    // Log any errors
    console.error(
      'Error updating verification details:',
      error.response ? error.response.data : error,
    );
    throw error; // Rethrow the error to be handled by the calling function
  }
};


export const getProviderAppointment = async (mobileNumber) => {
  try {
    const response = await axios.get(`${BASE_URL}/providers/appointments/${mobileNumber}`)
    console.log(response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching verfiyProvider  data by ID:', error)
    throw error
  }
}
