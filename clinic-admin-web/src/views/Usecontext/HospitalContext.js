import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { http } from '../../Utils/Interceptors'
import { GetSubServices_ByClinicId } from '../ProcedureManagement/ProcedureManagementAPI'
import { getDoctorByClinicId } from '../../baseUrl'

const HospitalContext = createContext()

export const HospitalProvider = ({ children }) => {
  // Hydrate from localStorage
  const [selectedHospital, setSelectedHospital] = useState(() => {
    const stored = localStorage.getItem('selectedHospital')
    return stored ? JSON.parse(stored) : null
  })

  const [doctorData, setDoctorData] = useState(null)
  const [subServices, setSubServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [notificationCount, setNotificationCount] = useState('')
  const [role, setRole] = useState(localStorage.getItem('role'))
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hospitalUser')
    return saved ? JSON.parse(saved) : null
  })
  const [hospitalId, setHospitalId] = useState(localStorage.getItem('HospitalId'))
  const [hydrated, setHydrated] = useState(false) // Track data readiness

  // Persist user & hospital to localStorage
  useEffect(() => {
    if (user) localStorage.setItem('hospitalUser', JSON.stringify(user))
    else localStorage.removeItem('hospitalUser')
  }, [user])

  useEffect(() => {
    if (selectedHospital) localStorage.setItem('selectedHospital', JSON.stringify(selectedHospital))
    else localStorage.removeItem('selectedHospital')
  }, [selectedHospital])

  // Fetch hospital & doctor data
  const fetchAllData = useCallback(
    async (id = hospitalId) => {
      if (!id) return
      setLoading(true)
      try {
        // Fetch hospital
        const hospitalRes = await http.get(`/getClinic/${id}`)
        if (hospitalRes.status === 200 && hospitalRes.data) setSelectedHospital(hospitalRes.data)

        // Fetch doctors
        const branchId = localStorage.getItem('branchId')
        const doctorRes = await http.get(`${getDoctorByClinicId}/${id}/${branchId}`)
        if (doctorRes.status === 200 && doctorRes.data) setDoctorData(doctorRes.data)

        // Fetch subservices
        const subRes = await GetSubServices_ByClinicId(id)
        const list = Array.isArray(subRes?.data) ? subRes.data : []
        setSubServices(list.filter((s) => s.hospitalId === id))
      } catch (err) {
        console.error(err)
        setErrorMessage('Error fetching hospital data.')
      } finally {
        setLoading(false)
        setHydrated(true)
      }
    },
    [hospitalId],
  )

  // Auto-fetch on hospitalId change
  useEffect(() => {
    if (hospitalId) fetchAllData()
    else setHydrated(true)
  }, [hospitalId, fetchAllData])

  return (
    <HospitalContext.Provider
      value={{
        selectedHospital,
        doctorData,
        subServices,
        loading,
        errorMessage,
        hydrated,
        user,
        role,
        notificationCount,
        hospitalId,
        setSelectedHospital,
        setDoctorData,
        setSubServices,
        setUser,
        setRole,
        setHospitalId,
        setNotificationCount,
        fetchAllData, // expose for manual calls (like after login)
      }}
    >
      {children}
    </HospitalContext.Provider>
  )
}

export const useHospital = () => useContext(HospitalContext)
