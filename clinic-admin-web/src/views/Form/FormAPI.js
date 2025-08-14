import axios from 'axios'
import {
  Add_PostProcedureForm,
  Add_PreProcedureForm,
  Add_ProcedureForm,
  All_PostProceudreFormData,
  All_PreProceudreFormData,
  All_ProcedureFormData,
  BASE_URL,
  Delete_PostProcedureForm,
  Delete_PreProcedureFormForm,
  Delete_ProcedureForm,
  GetPostProcedureForm_ByHospitalIdAndProcedureId,
  GetPreProcedureForm_ByHospitalIdAndPreProcedureId,
  GetProcedureForm_ByHospitalIdAndProcedureId,
  update_PostProcedureForm,
  update_PreProcedureFormForm,
  update_ProcedureForm,
} from '../../baseUrl'

export const AllProcedureForms = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/${All_ProcedureFormData}`)
    console.log('ProcedureForm data:', response.data)

    return response.data
  } catch (error) {
    console.error('Error ProcedureForm data:', error.message)

    if (error.response) {
      console.error('Error Response Data:', error.response.data)
      console.error('Error Response Status:', error.response.status)
    }
    throw error
  }
}
export const Procedure_ByHospitalIdProcedureId = async (hospitalId, procedureId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/${GetProcedureForm_ByHospitalIdAndProcedureId}/${hospitalId}/${procedureId}`,
    )
    console.log('ProcedureForm_ByHospitalIdAndProcedureId data:', response.data)

    return response.data
  } catch (error) {
    console.error('Error ProcedureForm_ByHospitalIdAndProcedureId data:', error.message)

    if (error.response) {
      console.error('Error Response Data:', error.response.data)
      console.error('Error Response Status:', error.response.status)
    }
    throw error
  }
}
export const AllPreProcedureForms = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/${All_PreProceudreFormData}`)
    console.log('PreProcedureForm data:', response.data)

    return response.data
  } catch (error) {
    console.error('Error PreProcedureForm data:', error.message)

    if (error.response) {
      console.error('Error Response Data:', error.response.data)
      console.error('Error Response Status:', error.response.status)
    }
    throw error
  }
}
export const PreProcedure_ByHospitalIdProcedureId = async (hospitalId, preProcedureId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/${GetPreProcedureForm_ByHospitalIdAndPreProcedureId}/${hospitalId}/${preProcedureId}`,
    )
    console.log('PreProcedureForm_ByHospitalIdAndPreProcedureId data:', response.data)

    return response.data
  } catch (error) {
    console.error('Error PreProcedureForm_ByHospitalIdAndPreProcedureId data:', error.message)

    if (error.response) {
      console.error('Error Response Data:', error.response.data)
      console.error('Error Response Status:', error.response.status)
    }
    throw error
  }
}
export const AllPostProcedureForms = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/${All_PostProceudreFormData}`)
    console.log('PostProcedureForm data:', response.data)

    return response.data
  } catch (error) {
    console.error('Error PostProcedureForm data:', error.message)

    if (error.response) {
      console.error('Error Response Data:', error.response.data)
      console.error('Error Response Status:', error.response.status)
    }
    throw error
  }
}
export const PostProcedure_ByHospitalIdProcedureId = async (hospitalId, postProcedureId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/${GetPostProcedureForm_ByHospitalIdAndProcedureId}/${hospitalId}/${postProcedureId}`,
    )
    console.log('PostProcedureForm_ByHospitalIdAndPostProcedureId data:', response.data)

    return response.data
  } catch (error) {
    console.error('Error PostProcedureForm_ByHospitalIdAndPostProcedureId data:', error.message)

    if (error.response) {
      console.error('Error Response Data:', error.response.data)
      console.error('Error Response Status:', error.response.status)
    }
    throw error
  }
}

export const AddProcedureData = async (procedureData, hospitalId, subServiceId) => {
  try {
    const requestData = {
      procedureName: procedureData.procedureName || '',
      totalDuration: procedureData.totalDuration || '',
      procedureDetails: procedureData.procedureDetails || '',
    }

    const response = await axios.post(
      `${BASE_URL}/${Add_ProcedureForm}/${hospitalId}/${subServiceId}`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    console.log(response)
    return response.data
  } catch (error) {
    console.error('Error response from API:', error.response)
    throw error
  }
}
export const AddPreProcedureData = async (preProcedureData, hospitalId, subServiceId) => {
  try {
    const requestData = {
      preProcedureName: preProcedureData.preProcedureName || '',
      totalDuration: preProcedureData.totalDuration || '',
      preProcedureDetails: preProcedureData.preProcedureDetails || '',
    }

    const response = await axios.post(
      `${BASE_URL}/${Add_PreProcedureForm}/${hospitalId}/${subServiceId}`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    console.log(response)
    return response.data
  } catch (error) {
    console.error('Error response from API:', error.response)
    throw error
  }
}
export const AddPostProcedureData = async (postProcedureData, hospitalId, subServiceId) => {
  try {
    const requestData = {
      postProcedureName: postProcedureData.postProcedureName || '',
      totalDuration: postProcedureData.totalDuration || '',
      postProcedureDetails: postProcedureData.postProcedureDetails || '',
    }

    const response = await axios.post(
      `${BASE_URL}/${Add_PostProcedureForm}/${hospitalId}/${subServiceId}`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    console.log(response)
    return response.data
  } catch (error) {
    console.error('Error response from API:', error.response)
    throw error
  }
}

export const updateProcedureData = async (updatedProcedure, hospitalId, procedureId) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/${update_ProcedureForm}/${hospitalId}/${procedureId}`,
      updatedProcedure,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    return response.data
  } catch (error) {
    console.error('Error updating tet:', error)
    throw error
  }
}
export const updatePreProcedureData = async (
  updatedPreProcedure,
  hospitalId,
  preProcedureFormId,
) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/${update_PreProcedureFormForm}/${hospitalId}/${preProcedureFormId}`,
      updatedPreProcedure,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    return response.data
  } catch (error) {
    console.error('Error updating tet:', error)
    throw error
  }
}
export const updatePostProcedureData = async (
  updatedPostProcedure,
  hospitalId,
  postProcedureFormId,
) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/${update_PostProcedureForm}/${hospitalId}/${postProcedureFormId}`,
      updatedPostProcedure,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    return response.data
  } catch (error) {
    console.error('Error updating tet:', error)
    throw error
  }
}

export const deleteProcedureData = async (hospitalId, procedureId) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/${Delete_ProcedureForm}/${hospitalId}/${procedureId}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    console.log('ProcedureForm deleted successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('Error deleting ProcedureForm:', error.response ? error.response.data : error)
    throw error
  }
}
export const deletePreProcedureData = async (hospitalId, preProcedureFormId) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/${Delete_PreProcedureFormForm}/${hospitalId}/${preProcedureFormId}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    console.log('PreProcedureForm deleted successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('Error deleting PreProcedureForm:', error.response ? error.response.data : error)
    throw error
  }
}
export const deletePostProcedureData = async (hospitalId, postProcedureFormId) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/${Delete_PostProcedureForm}/${hospitalId}/${postProcedureFormId}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    console.log('PostProcedureForm deleted successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('Error deleting PostProcedureForm:', error.response ? error.response.data : error)
    throw error
  }
}
