import React, { useEffect, useState } from 'react'
import {
  CButton,
  CModal,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CModalBody,
  CFormCheck,
} from '@coreui/react'

import { AppointmentData } from '../AppointmentManagement/appointmentAPI'
import { useNavigate } from 'react-router-dom'
const ReportsManagement = () => {
  // const [viewService, setViewService] = useState(null)
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState([])
  const [viewService, setViewService] = useState([])
  const navigate = useNavigate()
  const [filterTypes, setFilterTypes] = useState([])
  const [statusFilters, setStatusFilters] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 7
  const [availableServiceTypes, setAvailableServiceTypes] = useState([])
  const [availableConsultationTypes, setAvailableConsultationTypes] = useState([])
  const [selectedServiceTypes, setSelectedServiceTypes] = useState([])
  const [selectedConsultationTypes, setSelectedConsultationTypes] = useState([])
  const [clinicId, setClinicId] = useState(null)
  
  const consultationTypeMap = {
    'Service & Treatment': 'services & treatments',
    'Video Consultation': 'online consultation',
    'In-clinic': 'in-clinic consultation',
  }

const fetchAppointments = async (hospitalId) => { // Added hospitalId parameter
    try {
      const data = await AppointmentData()
      if (data && data.data) {
        // Filter initial bookings by clinicId here if it exists
        const relevantBookings = hospitalId
          ? data.data.filter(
              (booking) => normalize(booking.clinicId) === normalize(hospitalId),
            )
          : data.data
        setBookings(relevantBookings || [])
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
      setBookings([]) // Ensure bookings is an empty array on error
      setLoading(false);
    }
  }


 useEffect(() => {
    const hospitalId = localStorage.getItem('HospitalId')
    if (hospitalId) {
      setClinicId(hospitalId) // Store clinicId in state
      fetchAppointments(hospitalId) // Pass hospitalId to fetch function
    } else {
      console.warn('No HospitalId found in localStorage. Displaying all relevant appointments.')
      // If no HospitalId, you might still want to fetch all appointments
      // or handle this case based on your application's requirements.
      fetchAppointments(null); // Fetch all if no specific clinicId
    }
  }, [])

  const handleStatusChange = (e) => {
    const value = e.target.value

    if (statusFilters.includes(value)) {
      setStatusFilters([]) // Deselect if the same one is clicked
    } else {
      setStatusFilters([value]) // Allow only one selection
    }
  }

 useEffect(() => {
    // 1. Filter by "Completed" status
    let currentFiltered = bookings.filter(
      (booking) => normalize(booking.status) === 'completed',
    )

    // 2. Apply consultation type filter if selected
    if (filterTypes.length === 1) {
      const selectedType = filterTypes[0]
      const mappedType = consultationTypeMap[selectedType]
      if (mappedType) {
        currentFiltered = currentFiltered.filter(
          (item) => normalize(item.consultationType) === mappedType,
        )
      }
    }

    // No need for a separate clinicId filter here if you filtered it during fetchAppointments
    // If you prefer to filter here, uncomment and adjust:
    /*
    if (clinicId) {
      currentFiltered = currentFiltered.filter(
        (item) => normalize(item.clinicId) === normalize(clinicId),
      )
    }
    */

    setFilteredData(currentFiltered)
  }, [bookings, filterTypes, clinicId]) // Added clinicId to dependencies

  useEffect(() => {
    const serviceTypes = [...new Set(bookings.map((item) => item.servicename).filter(Boolean))]
    const consultationTypes = [
      ...new Set(bookings.map((item) => item.consultationType).filter(Boolean)),
    ]
    setAvailableServiceTypes(serviceTypes)
    setAvailableConsultationTypes(consultationTypes)
    console.log('Available Consultation Types:', consultationTypes)
  }, [bookings])

  const toggleFilter = (type) => {
    if (filterTypes.includes(type)) {
      // setFilterTypes(filterTypes.filter((t) => t !== type))// multiple selections.
      setFilterTypes([]) //one selection at a time
    } else {
      setFilterTypes([type]) //one selection at a time
      // setFilterTypes([...filterTypes, type])// multiple selections.
    }
  }

  const selectedStatus = 'Completed' // or 'confirmed', etc.
  // 🔁 Filter when bookings or status changes
  // useEffect(() => {
  //   const filtered = bookings.filter(
  //     (booking) => booking.status?.toLowerCase().trim() === selectedStatus.toLowerCase().trim(),
  //   )
  //   setFilteredData(filtered)
  // }, [bookings, selectedStatus]) // dependencies: run whenever these change
useEffect(() => {
  let currentFiltered = bookings

  // 1. Filter by status (Completed only)
  currentFiltered = currentFiltered.filter(
    (booking) => normalize(booking.status) === 'completed'
  )

  // 2. Apply consultation type filter
  if (filterTypes.length === 1) {
    const selectedType = filterTypes[0]

    if (selectedType === 'Video Consultation') {
      currentFiltered = currentFiltered.filter(
        (item) =>
          normalize(item.consultationType) === 'video consultation' ||
          normalize(item.consultationType) === 'online consultation'
      )
    } else {
      const mappedType = consultationTypeMap[selectedType]
      if (mappedType) {
        currentFiltered = currentFiltered.filter(
          (item) => normalize(item.consultationType) === mappedType
        )
      }
    }
  }

  setFilteredData(currentFiltered)
}, [bookings, filterTypes])

  useEffect(() => {
    const hospitalId = localStorage.getItem('HospitalId')
    if (hospitalId) {
      fetchAppointments(hospitalId)
    } else {
      console.warn('No HospitalId in localStorage')
    }
  }, [])

  const normalize = (value) => value?.toLowerCase().trim()

  return (
    <div style={{ overflowX: 'auto' }}>
      <div className="container mt-4">
        <h5 className="mb-3">Appointments</h5>
        <div className="d-flex gap-2 mb-3">
          {['Service & Treatment', 'In-clinic', 'Video Consultation'].map((label) => (
            <button
              key={label}
              onClick={() => toggleFilter(label)}
              className={`btn ${filterTypes.includes(label) ? 'btn-dark' : 'btn-outline-dark'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mb-3">
          <CButton color="secondary" onClick={() => setFilterTypes([])}>
            Reset Filters
          </CButton>
        </div>

        <CTable striped hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>S.No</CTableHeaderCell>
              <CTableHeaderCell>Name</CTableHeaderCell>
              {/* <CTableHeaderCell>Service</CTableHeaderCell> */}
              <CTableHeaderCell>Consultation Type</CTableHeaderCell>
              <CTableHeaderCell>Date</CTableHeaderCell>
              <CTableHeaderCell>Time</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
              <CTableHeaderCell>Action</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

       <CTableBody>
  {loading ? (
    // ✅ Show loading while data is being fetched
    <CTableRow>
      <CTableDataCell colSpan="8" className="text-center text-primary fw-bold">
        Loading reports...
      </CTableDataCell>
    </CTableRow>
  ) : filteredData.length > 0 ? (
    filteredData.map((item, index) => (
      <CTableRow key={`${item.bookingId}-${index}`}>
        <CTableDataCell>{index + 1}</CTableDataCell>
        <CTableDataCell>{item.name}</CTableDataCell>
        <CTableDataCell>{item.consultationType}</CTableDataCell>
        <CTableDataCell>{item.serviceDate}</CTableDataCell>
        <CTableDataCell>{item.slot || item.servicetime}</CTableDataCell>
        <CTableDataCell>{item.status}</CTableDataCell>
        <CTableDataCell>
          <CButton
            color="primary"
            size="sm"
            onClick={() =>
              navigate(`/reportDetails/${item.bookingId}`, {
                state: {
                  report: item,
                  appointmentInfo: {
                    name: item.name,
                    age: item.age,
                    gender: item.gender,
                    problem: item.problem,
                    bookingId: item.bookingId,
                    item: item,
                  },
                },
              })
            }
          >
            View
          </CButton>
        </CTableDataCell>
      </CTableRow>
    ))
  ) : (
    // ✅ Show only after loading is done and no data
    <CTableRow>
      <CTableDataCell colSpan="8" className="text-center text-danger fw-bold">
        No completed appointments found.
      </CTableDataCell>
    </CTableRow>
  )}
</CTableBody>

        </CTable>
      </div>
      {/* {viewService && (
       
      )} */}
    </div>
  )
}

export default ReportsManagement
