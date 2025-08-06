import React, { createContext, useContext, useEffect, useState } from 'react'

// Create Context
const DoctorContext = createContext()

export const DoctorProvider = ({ children }) => {
  const [state, setState] = useState(null) // keep if you use this elsewhere
  const [patientData, setPatientData] = useState(null)
  const [isPatientLoading, setIsPatientLoading] = useState(true)
  const [doctorId, setDoctorId] = useState(null);
  const [hospitalId, setHospitalId] = useState(null);
  const [doctorDetails, setDoctorDetails] = useState([]);
  const [clinicDetails, setClinicDetails] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  // Hydrate on first mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem('patientData')
      if (cached) {
        setPatientData(JSON.parse(cached))
      }
    } catch (e) {
      // ignore bad JSON
      console.warn('Failed to parse cached patientData', e)
    } finally {
      setIsPatientLoading(false)
    }
  }, [])

  // Helper that keeps localStorage in sync
  const updatePatient = (p) => {
    setPatientData(p)
    try {
      if (p) localStorage.setItem('patientData', JSON.stringify(p))
      else localStorage.removeItem('patientData')
    } catch (e) {
      console.warn('Failed to persist patientData', e)
    }
  }

  const value = {
    state,
    setState,
    patientData,
    setPatientData: updatePatient, // keep the same name if you already use it
    updatePatient, // and also expose explicit helper
    isPatientLoading, doctorId,
    setDoctorId,
    hospitalId,
    setHospitalId,
    doctorDetails,
    setDoctorDetails,
    clinicDetails,
    setClinicDetails, setTodayAppointments, todayAppointments
  }

  return <DoctorContext.Provider value={value}>{children}</DoctorContext.Provider>
}

// Hook for easy access
export const useDoctorContext = () => useContext(DoctorContext)
