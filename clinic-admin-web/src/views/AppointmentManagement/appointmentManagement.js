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
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormCheck,
  CRow,
  CCol,
  CCard,
  CCardBody,
} from '@coreui/react'
import { CBadge } from '@coreui/react'
import { AppointmentData } from './appointmentAPI'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { GetBookingByClinicIdData } from './appointmentAPI'
import { GetBookingBy_ClinicId } from '../../baseUrl'

const appointmentManagement = () => {
  const [viewService, setViewService] = useState(null)
  const [selectedServiceTypes, setSelectedServiceTypes] = useState([])
  const [selectedConsultationTypes, setSelectedConsultationTypes] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [availableServiceTypes, setAvailableServiceTypes] = useState([])
  const [availableConsultationTypes, setAvailableConsultationTypes] = useState([])
  const consultationTypeLabels = {
    'In-clinic': 'In-clinic',
    Online: 'Video Consultation',
  }
  const [bookings, setBookings] = useState([])
  const [filterTypes, setFilterTypes] = useState([])
  const [statusFilters, setStatusFilters] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const itemsPerPage = 7
  const navigate = useNavigate()

  const fetchAppointments = async () => {
    try {
      const hospitalId = localStorage.getItem('HospitalId')
      console.log('Hospital ID from localStorage:', hospitalId)

      if (!hospitalId) {
        setBookings([])
        setLoading(false) // ✅ stop loading even if no hospitalId
        return
      }

      const filteredDataResponse = await GetBookingByClinicIdData(hospitalId)
      console.log('Appointments for this Hospital:', filteredDataResponse)

      if (filteredDataResponse?.data) {
        setBookings(filteredDataResponse.data)
      } else {
        console.warn('No data returned for Hospital ID:', hospitalId)
        setBookings([])
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
      setBookings([])
    } finally {
      setLoading(false) // ✅ stop loading after fetch completes
    }
  }
  //Status color logics
  const getStatusColor = (status) => {
    console.log(status)
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success'
      case 'Rejected':
        return 'danger'
      case 'pending':
        return 'warning'
      case 'confirmed':
        return 'info'
      case 'in progress':
        return 'primary'
      case 'rescheduled':
        return 'secondary'
      default:
        return 'dark'
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  //filtering
  useEffect(() => {
    let filtered = [...bookings]
    console.log('Initial bookings:', filtered)

    const normalize = (val) => val?.toLowerCase().trim()

    // Map your filter buttons to actual data values:
    const consultationTypeMap = {
      'Service & Treatment': 'services & treatments',
      'Video Consultation': 'video consultation',
      'In-clinic': 'in-clinic consultation',
    }

    // Filter by status (use 'status', not 'bookedStatus')
    if (statusFilters.length > 0) {
      filtered = filtered.filter((item) =>
        statusFilters.some((status) => normalize(status) === normalize(item.status)),
      )
      console.log('After status filter:', filtered)
    }

    // Filter by consultation type (only one at a time)
    if (filterTypes.length === 1) {
      const selectedType = filterTypes[0]

      if (selectedType === 'Video Consultation') {
        filtered = filtered.filter(
          (item) =>
            normalize(item.consultationType) === 'video consultation' ||
            normalize(item.consultationType) === 'online consultation',
        )
        console.log(`After ${selectedType} filter:`, filtered)
      } else {
        const mappedType = consultationTypeMap[selectedType]
        if (mappedType) {
          filtered = filtered.filter((item) => normalize(item.consultationType) === mappedType)
          console.log(`After ${selectedType} filter:`, filtered)
        }
      }
    }

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [bookings, filterTypes, statusFilters])

  useEffect(() => {
    const serviceTypes = [...new Set(bookings.map((item) => item.subServiceName).filter(Boolean))]
    const consultationTypes = [
      ...new Set(bookings.map((item) => item.consultationType).filter(Boolean)),
    ]
    setAvailableServiceTypes(serviceTypes)
    setAvailableConsultationTypes(consultationTypes)
    console.log('Available Consultation Types:', consultationTypes)
  }, [bookings])
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [currentPage])

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  //to view appointments
  const ViewService = (row) => {
    setViewService(row)
  }
  const normalize = (value) => value?.toLowerCase().trim()

  //filtering for  service&treatment,in-clinic,video-consultaion
  const toggleFilter = (type) => {
    if (filterTypes.includes(type)) {
      // setFilterTypes(filterTypes.filter((t) => t !== type))// multiple selections.
      setFilterTypes([]) //one selection at a time
    } else {
      setFilterTypes([type]) //one selection at a time
      // setFilterTypes([...filterTypes, type])// multiple selections.
    }
  }

  //filtering for pending,completed ,in-progress - one selection at a time
  const handleStatusChange = (e) => {
    const value = e.target.value

    if (statusFilters.includes(value)) {
      setStatusFilters([]) // Deselect if the same one is clicked
    } else {
      setStatusFilters([value]) // Allow only one selection
    }
  }

  return (
    <div style={{ overflow: 'hidden' }}>
      <div className="container mt-4">
        <h5>Appointments</h5>
        <div className="d-flex gap-2 mb-3">
          <button
            onClick={() => toggleFilter('Service & Treatment')}
            className={`btn ${
              filterTypes.includes('Service & Treatment') ? 'btn-dark' : 'btn-outline-dark'
            }`}
          >
            Service & Treatment
          </button>
          <button
            onClick={() => toggleFilter('In-clinic')}
            className={`btn ${filterTypes.includes('In-clinic') ? 'btn-dark' : 'btn-outline-dark'}`}
          >
            In-Clinic Consultation
          </button>
          <button
            onClick={() => toggleFilter('Video Consultation')}
            className={`btn ${
              filterTypes.includes('Video Consultation') ? 'btn-dark' : 'btn-outline-dark'
            }`}
          >
            Video Consultation
          </button>
        </div>

        <div className="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="d-flex gap-2 flex-wrap">
            <CFormCheck
              label="Pending"
              value="Pending"
              onChange={handleStatusChange}
              checked={statusFilters.includes('Pending')}
            />
            <CFormCheck
              label="In-Progress"
              value="In-Progress"
              onChange={handleStatusChange}
              checked={statusFilters.includes('In-Progress')}
            />

            <CFormCheck
              label="Completed"
              value="Completed"
              onChange={handleStatusChange}
              checked={statusFilters.includes('Completed')}
            />
            <CFormCheck
              label="Confirmed"
              value="Confirmed"
              onChange={handleStatusChange}
              checked={statusFilters.includes('Confirmed')}
            />
            <CFormCheck
              label="Rejected"
              value="Rejected"
              onChange={handleStatusChange}
              checked={statusFilters.includes('Rejected')}
            />
          </div>
          <CButton
            color="secondary"
            onClick={() => {
              setSelectedServiceTypes([])
              setSelectedConsultationTypes([])
              setFilterTypes([])
              setStatusFilters([])
            }}
          >
            Reset Filters
          </CButton>
        </div>

        <CTable striped hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>S.No</CTableHeaderCell>
              <CTableHeaderCell>H_ID</CTableHeaderCell>
              <CTableHeaderCell>Name</CTableHeaderCell>
              <CTableHeaderCell>Service Name</CTableHeaderCell>
              <CTableHeaderCell>Consultation Type</CTableHeaderCell>
              <CTableHeaderCell>Date</CTableHeaderCell>
              <CTableHeaderCell>Time</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
              <CTableHeaderCell>Action</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {loading ? (
              // ✅ Show loading row while fetching
              <CTableRow>
                <CTableDataCell colSpan="9" className="text-center text-primary fw-bold">
                  Loading appointments...
                </CTableDataCell>
              </CTableRow>
            ) : Array.isArray(filteredData) && filteredData.length > 0 ? (
              paginatedData.map((item, index) => (
                <CTableRow key={`${item.id}-${index}`}>
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell>{item.clinicId}</CTableDataCell>
                  <CTableDataCell>{item.name}</CTableDataCell>
                  <CTableDataCell>{item.subServiceName}</CTableDataCell>
                  <CTableDataCell>{item.consultationType}</CTableDataCell>
                  <CTableDataCell>
                    {item.sele ? `${item.sele} ` : ''}
                    {item.serviceDate}
                  </CTableDataCell>
                  <CTableDataCell>{item.slot || item.servicetime}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={getStatusColor(item.status)}>
                      {item.status
                        ?.split(' ')
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(' ')}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CButton
                      color="primary"
                      size="sm"
                      onClick={() =>
                        navigate(`/appointmentDetails/${item.bookingId}`, {
                          state: { appointment: item },
                        })
                      }
                    >
                      View
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))
            ) : (
              // ✅ Show only when loading is false and no data
              <CTableRow>
                <CTableDataCell colSpan="9" className="text-center text-danger fw-bold">
                  No appointments found.
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          {Array.from({ length: Math.ceil(filteredData.length / itemsPerPage) }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              style={{
                margin: '0 5px',
                padding: '5px 10px',
                backgroundColor: currentPage === index + 1 ? '#007bff' : '#fff',
                color: currentPage === index + 1 ? '#fff' : '#000',
                border: '1px solid #ccc',
                borderRadius: '5px',
              }}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default appointmentManagement
