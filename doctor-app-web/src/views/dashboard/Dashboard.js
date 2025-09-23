import React, { useEffect, useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import {
  CCard,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react'

import Button from '../../components/CustomButton/CustomButton'
import TooltipButton from '../../components/CustomButton/TooltipButton'

import { COLORS, SIZES } from '../../Themes'
import { useDoctorContext } from '../../Context/DoctorContext'
import { getTodayAppointments, getBookedSlots } from '../../Auth/Auth'
import CalendarModal from '../../utils/CalenderModal'
import { useNavigate } from 'react-router-dom'

// Helper function
const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1)

const Dashboard = () => {
  const {
    setPatientData,
    setTodayAppointments,
    todayAppointments,
    doctorDetails,
  } = useDoctorContext()

  const [selectedType, setSelectedType] = useState(null)
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const [branches, setBranches] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [bookedSlots, setBookedSlots] = useState([])

  const allBranches = doctorDetails?.branches || []
  const navigate = useNavigate()

  // Filtered patients based on type and branch
  const filteredPatients = todayAppointments.filter((item) => {
    let typeMatch = selectedType ? item.consultationType === selectedType : true
    let branchMatch = selectedBranch
      ? item.branchId === selectedBranch.branchId
      : true
    return typeMatch && branchMatch
  })

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage)
  const currentPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Count consultations for filter buttons
  const consultationCounts = todayAppointments.reduce((acc, item) => {
    acc[item.consultationType] = (acc[item.consultationType] || 0) + 1
    return acc
  }, {})

  // ✅ Fetch today's appointments (auto-refresh every 15s)
  useEffect(() => {
    const fetchAppointments = async () => {
      const response = await getTodayAppointments()
      if (response.statusCode === 200) {
        setTodayAppointments(response.data)
        setBranches(allBranches) // keep doctor’s branches
      }
    }

    fetchAppointments()
    const interval = setInterval(fetchAppointments, 15000)
    return () => clearInterval(interval)
  }, [setTodayAppointments, allBranches])

  // ✅ Fetch booked slots (for calendar modal)
  const fetchBookedSlots = async () => {
    const doctorId = localStorage.getItem('doctorId')
    if (!doctorId) return console.error('No doctorId found')

    const response = await getBookedSlots(doctorId)
    if (Array.isArray(response)) {
      setBookedSlots(response)
    } else {
      console.warn('Unexpected API response:', response)
      setBookedSlots([])
    }
  }

  useEffect(() => {
    fetchBookedSlots()
  }, [])

  // ✅ Handle click inside calendar (navigate to patient page)
  const handleClick = (appointment) => {
    if (!appointment) return
    setPatientData(appointment)

    if (appointment.status === 'Confirmed') {
      navigate(`/tab-content/${appointment.patientId}`, {
        state: { patient: appointment, fromTab: 'Confirmed' },
      })
    } else if (appointment.status === 'In-Progress') {
      navigate(`/tab-inProgress/${appointment.patientId}`, {
        state: { patient: appointment, fromTab: 'In-Progress' },
      })
    } else if (appointment.status === 'Completed') {
      navigate(`/tab-completed-content/${appointment.patientId}`, {
        state: { patient: appointment, fromTab: 'Completed' },
      })
    }
  }

  return (
    <div className="container-fluid mt-3">
      <h5 className="mb-4" style={{ fontSize: SIZES.medium, color: COLORS.black }}>
        Today Appointments
      </h5>

      <div className="d-flex flex-wrap flex-md-nowrap gap-3">
        {/* LEFT SIDE */}
        <div className="flex-grow-1" style={{ flexBasis: '60%' }}>
          {/* Filters */}
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
            <div className="d-flex gap-2 flex-wrap">
              <Button
                variant={selectedType === null ? 'primary' : 'outline'}
                customColor={COLORS.bgcolor}
                color={COLORS.black}
                onClick={() => {
                  setSelectedType(null)
                  setSelectedBranch(null)
                }}
                size="small"
              >
                All ({todayAppointments.length})
              </Button>
              {Object.entries(consultationCounts).map(([type, count]) => (
                <Button
                  key={type}
                  variant="outline"
                  customColor={COLORS.bgcolor}
                  color={COLORS.black}
                  size="small"
                  onClick={() => setSelectedType(type)}
                >
                  {type} ({count})
                </Button>
              ))}
            </div>

            <div className="d-flex gap-2">
              {/* Branch Dropdown */}
              <CDropdown>
                <CDropdownToggle
                  style={{
                    backgroundColor: COLORS.bgcolor,
                    color: COLORS.black,
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                    textAlign: 'left',
                  }}
                >
                  {selectedBranch ? selectedBranch.branchName : 'All Branches'}
                </CDropdownToggle>

                <CDropdownMenu>
                  <CDropdownItem onClick={() => setSelectedBranch(null)}>
                    All Branches
                  </CDropdownItem>
                  {branches.length > 0 ? (
                    branches.map((branch) => (
                      <CDropdownItem
                        key={branch.branchId}
                        onClick={() => setSelectedBranch(branch)}
                      >
                        {branch.branchName}
                      </CDropdownItem>
                    ))
                  ) : (
                    <CDropdownItem disabled>No branches available</CDropdownItem>
                  )}
                </CDropdownMenu>
              </CDropdown>

              <Button
                variant="outline"
                customColor={COLORS.bgcolor}
                color={COLORS.black}
                size="small"
                onClick={() => setShowCalendar(true)}
              >
                My Calendar
              </Button>
            </div>
          </div>

          {/* Appointments Table */}
          <div
            style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto', borderRadius: '8px' }}
          >
            <CTable className="border">
              <CTableHead>
                <CTableRow>
                  {['S.No', 'Patient ID', 'Name', 'Mobile', 'Date', 'Time', 'Consultation', 'Action'].map(
                    (header, i) => (
                      <CTableHeaderCell
                        key={i}
                        className={header === 'Action' ? 'text-center' : ''}
                        style={{ backgroundColor: COLORS.bgcolor, color: COLORS.black }}
                      >
                        {header}
                      </CTableHeaderCell>
                    )
                  )}
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {currentPatients.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan="8" className="text-center py-4 text-muted">
                      No Appointments Available
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  currentPatients.map((item, idx) => (
                    <CTableRow key={idx}>
                      <CTableDataCell>{idx + 1}</CTableDataCell>
                      <CTableDataCell>{item.patientId}</CTableDataCell>
                      <CTableDataCell>{capitalizeFirst(item.name)}</CTableDataCell>
                      <CTableDataCell>{item.mobileNumber}</CTableDataCell>
                      <CTableDataCell>{item.serviceDate}</CTableDataCell>
                      <CTableDataCell>{item.servicetime}</CTableDataCell>
                      <CTableDataCell>{item.consultationType}</CTableDataCell>
                      <CTableDataCell className="text-center">
                        <TooltipButton patient={item} tab={item.status} />
                      </CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>

            {/* Pagination */}
            <div className="d-flex justify-content-end align-items-center mt-2 gap-2">
              <Button
                size="small"
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Prev
              </Button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                size="small"
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Ad */}
        <div
          className="d-flex align-items-start justify-content-start bg-dark"
          style={{ height: '60vh', width: '200px', overflow: 'hidden', borderRadius: '10px' }}
        >
          <CCard
            className="w-100 h-100 d-flex justify-content-center align-items-center"
            style={{ backgroundColor: COLORS.bgcolor }}
          >
            <span style={{ color: COLORS.black, fontWeight: 'bold', textAlign: 'center' }}>
              Ad Space
            </span>
          </CCard>
        </div>
      </div>

      {/* Calendar Modal */}
      {showCalendar && (
        <CalendarModal
          visible={showCalendar}
          onClose={() => setShowCalendar(false)}
          todayAppointments={
            selectedBranch
              ? todayAppointments.filter((a) => a.branchId === selectedBranch.branchId)
              : todayAppointments
          }
          defaultBookedSlots={bookedSlots}
          handleClick={handleClick}
          fetchAppointments={getTodayAppointments}
        />
      )}
    </div>
  )
}

export default Dashboard
