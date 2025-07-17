import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { BASE_URL } from '../../baseUrl'
import { GetSubServices_ByClinicId } from '../serviceManagement/ServiceManagementAPI'

const HospitalContext = createContext()

export const HospitalProvider = ({ children }) => {
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [doctorData, setDoctorData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [notificationCount, setNotificationCount] = useState('')
const [subServices, setSubServices] = useState([]) // optional: store subservices

  useEffect(() => {
    const hospitalId = localStorage.getItem('HospitalId')

    if (hospitalId) {
      fetchHospitalDetails(hospitalId)
      fetchDoctorDetails(hospitalId)
    fetchSubServices(hospitalId)
      }
  }, [])

  // Fetch Clinic Details
  const fetchHospitalDetails = async (id) => {
    setLoading(true)
    try {
      const url = `${BASE_URL}/getClinic/${id}`
      const response = await axios.get(url)
      console.log(url)
      console.log(response)
      if (response.status === 200 && response.data) {
        setSelectedHospital(response.data)
      } else {
        setErrorMessage('Failed to fetch clinic details.')
      }
    } catch (err) {
      console.error('Fetch clinic error:', err)
      setErrorMessage('Error fetching clinic details.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch Doctor Details
  const fetchDoctorDetails = async (clinicId) => {
    setLoading(true)
    try {
      const url = `${BASE_URL}/doctors/hospitalById/${clinicId}`
      const response = await axios.get(url)
      console.log(response.data)
      if (response.status === 200 && response.data) {
        console.log(response.data)
        setDoctorData(response.data)
      } else {
        setErrorMessage('Failed to fetch doctor details.')
      }
    } catch (err) {
      console.error('Fetch doctor error:', err)
      setErrorMessage('Error fetching doctor details.')
    } finally {
      setLoading(false)
    }
  }
 const fetchSubServices = async (clinicId) => {
  try {
    const res = await GetSubServices_ByClinicId(clinicId)
    const list = Array.isArray(res?.data) ? res.data : []

    // ✅ Ensure only this hospital’s data is set
    const filtered = list.filter((s) => s.hospitalId === clinicId)

    setSubServices(filtered)
  } catch (err) {
    console.error('Fetch subservices error:', err)
    setSubServices([]) // clear previous data on error
  }
}


  return (
    <HospitalContext.Provider
      value={{
        selectedHospital,
        doctorData,
         subServices, 
        loading,
        errorMessage,
        fetchHospitalDetails,
        fetchDoctorDetails,
        setSelectedHospital,
        setDoctorData,
        notificationCount,
        setNotificationCount,
      }}
    >
      {children}
    </HospitalContext.Provider>
  )
}

export const useHospital = () => useContext(HospitalContext)
