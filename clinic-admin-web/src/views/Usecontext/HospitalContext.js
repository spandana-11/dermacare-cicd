import React, { createContext, useContext, useState, useEffect } from 'react'
import { http } from '../../Utils/Interceptors'
import { GetSubServices_ByClinicId } from '../ProcedureManagement/ProcedureManagementAPI'
import { roleMenu } from '../../Constant/roleMenu'
import { getDoctorByClinicId } from '../../baseUrl'

const HospitalContext = createContext()

export const HospitalProvider = ({ children }) => {
  const [selectedHospital, setSelectedHospital] = useState(null)
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

  // Set user permissions based on role
  // useEffect(() => {
  //   setUser({
  //     name: 'John Doe',
  //     role: role,
  //     permissions: roleMenu[role] || [],
  //   })
  // }, [role])

  useEffect(() => {
    if (user) {
      localStorage.setItem('hospitalUser', JSON.stringify(user))
    } else {
      localStorage.removeItem('hospitalUser')
    }
  }, [user])

  // Fetch all data on mount

  useEffect(() => {
    const storedId = localStorage.getItem('HospitalId')
    if (storedId && storedId !== hospitalId) {
      setHospitalId(storedId)
    }
  }, []) // run once
  useEffect(() => {
    console.log(hospitalId)

    if (!hospitalId) return

    const fetchAllData = async () => {
      setLoading(true)
      try {
        // Fetch hospital details

        if (hospitalId != undefined) {
          const hospitalRes = await http.get(`/getClinic/${hospitalId}`)
          if (hospitalRes.status === 200 && hospitalRes.data) {
            setSelectedHospital(hospitalRes.data)
          } else {
            setErrorMessage('Failed to fetch hospital details.')
          }
        }
        const branchId = localStorage.getItem('branchId')
        // Fetch doctor details
        const doctorRes = await http.get(`${getDoctorByClinicId}/${hospitalId}/${branchId}`)
        if (doctorRes.status === 200 && doctorRes.data) {
          setDoctorData(doctorRes.data)
        } else {
          setErrorMessage('Failed to fetch doctor details.')
        }

        // Fetch subservices
        const subRes = await GetSubServices_ByClinicId(hospitalId)
        const list = Array.isArray(subRes?.data) ? subRes.data : []
        setSubServices(list.filter((s) => s.hospitalId === hospitalId))
      } catch (err) {
        console.error(err)
        setErrorMessage('Error fetching hospital data.')
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [hospitalId]) // run once on mount

  return (
    <HospitalContext.Provider
      value={{
        selectedHospital,
        doctorData,
        subServices,
        loading,
        errorMessage,
        setSelectedHospital,
        setDoctorData,
        notificationCount,
        setNotificationCount,
        user,
        setRole,
        setUser,
        setHospitalId,
      }}
    >
      {children}
    </HospitalContext.Provider>
  )
}

export const useHospital = () => useContext(HospitalContext)
