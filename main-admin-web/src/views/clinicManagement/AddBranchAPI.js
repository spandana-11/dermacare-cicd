import axios from 'axios'
import { BASE_URL, createBranch, deleteBranch, getBranchByClinicId, getAllBranches, updateBranches,getBranchById } from '../../baseUrl'


// Fetch all branches
export const fetchAllBranches = async () => {
  console.log('Fetching all branches...')
  try {
    const response = await axios.get(`${BASE_URL}/${getAllBranches}`)
    console.log('Branches response:', response.data)
    return response.data
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('Branches response:', error.response.data)
      return error.response.data
    } else {
      console.error('Unexpected error:', error.message || error)
      throw error
    }
  }
}
export const fetchBranchByBranchId=async(branchId)=>{
  console.log("fetchBranchByBranchId",branchId);
  try{
    const response=await axios.get(`${BASE_URL}/${getBranchById}/${branchId}`)
    return response.data
  }catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('Branches response:', error.response.data)
      return error.response.data
    } else {
      console.error('Unexpected error:', error.message || error)
      throw error
    }
  }
}

// Fetch branch by ID
export const fetchBranchById = async (clinicId) => {
  console.log('Fetching branch by ID:', clinicId)
  try {
    const response = await axios.get(`${BASE_URL}/${getBranchByClinicId}/${clinicId}`)
    console.log('Branch response:', response.data)
    return response.data
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('Branch response:', error.response.data)
      return error.response.data
    } else {
      console.error('Unexpected error:', error.message || error)
      throw error
    }
  }
}

// Create a new branch
export const createNewBranch = async (branchData) => {
  console.log('Creating branch:', branchData)
  try {
    const response = await axios.post(`${BASE_URL}/${createBranch}`, branchData)
    console.log('Create branch response:', response.data)
    return response.data
  } catch (error) {
    console.error('Error creating branch:', error.message || error)
    throw error
  }
}

// Update a branch
export const updateBranchData = async (branchId, branchData) => {
  console.log('Updating branch:', branchId, branchData)
  try {
    const response = await axios.put(`${BASE_URL}/${updateBranches}/${branchId}`, branchData)
    console.log("Frontend URL:", `${BASE_URL}/${updateBranches}/${branchId}`);

    console.log('Update branch response:', response.data)
    return response.data
  } catch (error) {
    console.error('Error updating branch:', error.message || error)
    throw error
  }
}

// Delete a branch
export const deleteBranchById = async (branchId) => {
  console.log('Deleting branch:', branchId)
  try {
    const response = await axios.delete(`${BASE_URL}/${deleteBranch}/${branchId}`)
    console.log('Delete branch response:', response.data)
    return response.data
  } catch (error) {
    console.error('Error deleting branch:', error.message || error)
    throw error
  }
}
