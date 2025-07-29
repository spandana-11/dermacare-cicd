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
import { BASE_URL, ClinicAllData } from '../../baseUrl'
import { AppointmentData, getBookingBy_ClinicId } from './appointmentAPI'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { getBookingBy_DoctorId } from './appointmentAPI'

const appointmentManagement = () => {
  const [viewService, setViewService] = useState(null)
  const [selectedServiceTypes, setSelectedServiceTypes] = useState([])
  const [selectedConsultationTypes, setSelectedConsultationTypes] = useState([])
  const [selectedHospitalId, setSelectedHospitalId] = useState('')
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(true)

  const [availableServiceTypes, setAvailableServiceTypes] = useState([])
  const [availableConsultationTypes, setAvailableConsultationTypes] = useState([])
  const consultationTypeLabels = {
    'In-clinic': 'In-clinic',
    Online: 'Video Consultation',
  }
  const [hospitals, setHospitals] = useState([])
  const [selectedClinicId, setSelectedClinicId] = useState('') // Rename for clarity

  const [bookings, setBookings] = useState([])
  const [filterTypes, setFilterTypes] = useState([])
  const [statusFilters, setStatusFilters] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 7

  const navigate = useNavigate()

  const fetchAppointments = async (clinicId = '') => {
    setLoading(true) // start loading
    try {
      let response

      if (clinicId) {
        response = await getBookingBy_ClinicId(clinicId)
        console.log('📦 Clinic-specific Appointments:', response)
      } else {
        response = await AppointmentData() // <-- Get all bookings
        console.log('📦 All Appointments:', response)
      }

      const appointments = Array.isArray(response.data) ? response.data : response.data?.data || []

      setBookings(appointments)
      setLoading(false) // ✅ stop loading
    } catch (error) {
      console.error('❌ Failed to fetch appointments:', error)
      setBookings([])
      setFilteredData([])
      setLoading(false) // ✅ stop loading even on error
    }
  }

  const fetchHospitals = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/${ClinicAllData}`)
      console.log('fetch Hospitals', response)
      if (response.data.success) {
        setHospitals(response.data.data) // Assuming array of clinics
      } else {
        console.warn('No hospitals found')
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error)
    }
  }

  useEffect(() => {
    fetchAppointments()
    fetchHospitals()
  }, [])

  //filtering
  useEffect(() => {
    let filtered = [...bookings]
    console.log('Initial bookings:', filtered)

    const normalize = (val) => val?.toLowerCase().trim()

    // Map your filter buttons to actual data values:
    const consultationTypeMap = {
      'Service & Treatment': 'services & treatments',
      'video Consultation': 'online consultation',
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
    // const serviceTypes = [...new Set(bookings.map((item) => item.servicename).filter(Boolean))]
    const consultationTypes = [
      ...new Set(bookings.map((item) => item.consultationType).filter(Boolean)),
    ]
    // setAvailableServiceTypes(serviceTypes)
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

  useEffect(() => {
    fetchHospitals()
  }, [])

  // useEffect(() => {
  //   if (hospitals.length > 0) {
  //     const firstClinicId = hospitals.hospitalId
  //     setSelectedHospitalId(firstClinicId)
  //     fetchAppointments(firstClinicId)
  //   }
  // }, [hospitals])

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
            In-Clinic
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

        <div
          className="mb-3"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '1rem',
            alignItems: 'center',
            gridAutoRows: 'auto',
          }}
        >
          {/* Left: checkboxes container */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem 1rem',
              gridColumn: '1 / 2',
              gridRow: '1 / 2',
            }}
          >
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

          {/* Right: dropdown + button container */}
          <div
            className="right-controls"
            style={{
              display: 'inline-grid',
              gridAutoFlow: 'column',
              columnGap: '0.5rem',
              justifyContent: 'end',
              minWidth: '250px',
              width: '100%',
              gridColumn: '2 / 3',
              gridRow: '1 / 2',
            }}
          >
            <select
              className="form-select"
              style={{ minWidth: '180px', flexShrink: 0 }}
              value={selectedHospitalId}
              onChange={(e) => {
                const clinicId = e.target.value
                setSelectedHospitalId(clinicId)
                fetchAppointments(clinicId) // ✅ Now works based on API
              }}
            >
                <option value="">Select Hospital</option>
              {Array.isArray(hospitals) && hospitals.length > 0 ? (
                hospitals.map((hospital) => (
                  <option key={hospital.hospitalId} value={hospital.hospitalId}>
                    {hospital.name}
                  </option>
                ))
              ) : (
                <option disabled>No hospitals available</option>
              )}
            </select>

            <CButton
              color="secondary"
              style={{ flexShrink: 0 }}
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

          <style>{`
      @media (max-width: 768px) {
        .mb-3 {
          grid-template-columns: 1fr;
          grid-template-rows: auto auto;
        }
        .right-controls {
          grid-column: 1 / 2 !important;
          grid-row: 2 / 3 !important;
          justify-content: flex-end;
          margin-top: 0.5rem;
        }
      }
    `}</style>
        </div>

        <CTable striped hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>S.No</CTableHeaderCell>
              <CTableHeaderCell>H_ID</CTableHeaderCell>
              <CTableHeaderCell>Name</CTableHeaderCell>
              {/* <CTableHeaderCell>Service Name</CTableHeaderCell> */}
              <CTableHeaderCell>Consultation Type</CTableHeaderCell>
              <CTableHeaderCell>Date</CTableHeaderCell>
              <CTableHeaderCell>Time</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
              <CTableHeaderCell>Action</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {loading ? (
              <CTableRow>
                <CTableDataCell colSpan="8" className="text-center fw-bold text-primary">
                  Loading appointments...
                </CTableDataCell>
              </CTableRow>
            ) : Array.isArray(filteredData) && filteredData.length > 0 ? (
              paginatedData.map((item, index) => (
                <CTableRow key={`${item.id}-${index}`}>
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell>{item.clinicId}</CTableDataCell>
                  <CTableDataCell>{item.name}</CTableDataCell>
                  <CTableDataCell>{item.consultationType}</CTableDataCell>
                  <CTableDataCell>
                    {item.sele ? `${item.sele} ` : ''}
                    {item.serviceDate}
                  </CTableDataCell>
                  <CTableDataCell>{item.slot || item.servicetime}</CTableDataCell>
                  <CTableDataCell>{item.status}</CTableDataCell>
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
              <CTableRow>
                <CTableDataCell colSpan="8" className="text-center fw-bold">
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
