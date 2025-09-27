import React, { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"
import { BASE_URL, GetBy_DoctorId } from "../baseUrl"
import { GetSubServices_ByClinicId } from "../views/ProcedureManagement/ProcedureAPI"

const HospitalContext = createContext()

export const HospitalProvider = ({ children }) => {
  const [hospitals, setHospitals] = useState([])          // ✅ all hospitals
  const [selectedHospital, setSelectedHospital] = useState(null) // ✅ current selected hospital
  const [doctorData, setDoctorData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [notificationCount, setNotificationCount] = useState("")
  const [subServices, setSubServices] = useState([])

  useEffect(() => {
    // Load hospitals + selected hospital from localStorage
    const storedHospitals = JSON.parse(localStorage.getItem("Hospitals")) || []
    const storedSelectedId = localStorage.getItem("SelectedHospitalId")

    if (storedHospitals.length) {
      setHospitals(storedHospitals)
    }

    if (storedSelectedId) {
      fetchHospitalDetails(storedSelectedId)
      fetchDoctorDetails(storedSelectedId)
      fetchSubServices(storedSelectedId)
    }
  }, [])

  // Fetch ALL hospitals
  const fetchAllHospitals = async () => {
    setLoading(true)
    try {
      const url = `${BASE_URL}/admin/getAllClinics`
      const res = await axios.get(url)
      if (res.status === 200 && res.data?.data) {
        setHospitals(res.data.data)

        // store in localStorage
        localStorage.setItem("Hospitals", JSON.stringify(res.data.data))
      }
    } catch (err) {
      console.error("Error fetching all hospitals", err)
      setErrorMessage("Failed to fetch hospitals")
    } finally {
      setLoading(false)
    }
  }

  // Select a hospital
  const selectHospital = (hospitalId) => {
    localStorage.setItem("SelectedHospitalId", hospitalId)
    fetchHospitalDetails(hospitalId)
    fetchDoctorDetails(hospitalId)
    fetchSubServices(hospitalId)
  }

  // Fetch one hospital’s details
  const fetchHospitalDetails = async (id) => {
    setLoading(true)
    try {
      const url = `${BASE_URL}/admin/getClinicById/${id}`
      const response = await axios.get(url)
      if (response.status === 200 && response.data) {
        setSelectedHospital(response.data)
      }
    } catch (err) {
      console.error("Fetch clinic error:", err)
      setErrorMessage("Error fetching clinic details.")
    } finally {
      setLoading(false)
    }
  }

  // Fetch doctor details
  const fetchDoctorDetails = async (clinicId) => {
    setLoading(true)
    try {
      const url = `${BASE_URL}/${GetBy_DoctorId}/${clinicId}`
      const response = await axios.get(url)
      if (response.status === 200 && response.data) {
        setDoctorData(response.data)
      }
    } catch (err) {
      console.error("Fetch doctor error:", err)
      setErrorMessage("Error fetching doctor details.")
    } finally {
      setLoading(false)
    }
  }

  const fetchSubServices = async (clinicId) => {
    try {
      const res = await GetSubServices_ByClinicId(clinicId)
      const list = Array.isArray(res?.data) ? res.data : []
      const filtered = list.filter((s) => s.hospitalId === clinicId)
      setSubServices(filtered)
    } catch (err) {
      console.error("Fetch subservices error:", err)
      setSubServices([])
    }
  }

  return (
    <HospitalContext.Provider
      value={{
        hospitals,             // ✅ all hospitals
        selectedHospital,      // ✅ selected one
        doctorData,
        setDoctorData,         // ✅ expose this so components can update doctor list
        subServices,
        loading,
        errorMessage,
        notificationCount,
        setNotificationCount,
        fetchAllHospitals,
        selectHospital, 
        fetchHospitalDetails,
        fetchDoctorDetails,    
        fetchSubServices,
      }}
    >
      {children}
    </HospitalContext.Provider>
  )
}

export const useHospital = () => useContext(HospitalContext)
