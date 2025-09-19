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
} from '@coreui/react'
import { COLORS, SIZES } from '../../Themes'
import Button from '../../components/CustomButton/CustomButton'
import TooltipButton from '../../components/CustomButton/TooltipButton'
import avatar8 from './../../assets/images/12.png'
import { useDoctorContext } from '../../Context/DoctorContext'
import { getTodayAppointments, getBookedSlots } from '../../Auth/Auth'
import { FaRegCalendarAlt } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import CalendarModal from '../../utils/CalenderModal'
import { capitalizeFirst } from '../../utils/CaptalZeWord'

const Dashboard = () => {
  const { setPatientData, setTodayAppointments, todayAppointments } = useDoctorContext()
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedType, setSelectedType] = useState(null)
  const [adImage, setAdImage] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [bookedSlots, setBookedSlots] = useState([]) // ✅ all booked slots for calendar
  const navigate = useNavigate()

  // Count consultation types
  const consultationCounts = todayAppointments.reduce((acc, item) => {
    const key = item.consultationType
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  // Filter by type
  const filteredPatients = selectedType
    ? todayAppointments.filter((item) => item.consultationType === selectedType)
    : todayAppointments

  // ✅ Sort by date descending
  const sortedPatients = [...filteredPatients].sort(
    (a, b) => new Date(b.serviceDate) - new Date(a.serviceDate)
  )

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentPatients = sortedPatients.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(sortedPatients.length / itemsPerPage)

  // Load ad image
  useEffect(() => {
    setTimeout(() => setAdImage(avatar8), 2000)
  }, [])

  // Reset patient data
  useEffect(() => {
    setPatientData(null)
  }, [])

  // Fetch today's appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      const response = await getTodayAppointments()
      if (response.statusCode === 200) setTodayAppointments(response.data)
    }
    fetchAppointments()
    const interval = setInterval(fetchAppointments, 15000)
    return () => clearInterval(interval)
  }, [setTodayAppointments])

  // Fetch booked slots (for calendar)
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

  // Handle click inside calendar
  const handleClick = (appointment) => {
    if (!appointment) return
    setPatientData(appointment)
    navigate(`appointments/tab-content/${appointment.patientId}`, {
      state: { patient: appointment },
    })
  }

  return (
    <div className="container-fluid mt-3">
      <h5 className="mb-4" style={{ fontSize: SIZES.medium, color: COLORS.black }}>
        Today Appointments
      </h5>

      <div className="d-flex flex-wrap flex-md-nowrap gap-3">
        {/* LEFT SIDE */}
        <div className="flex-grow-1" style={{ flexBasis: '60%' }}>
          {/* Filter Buttons */}
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
            <div className="d-flex gap-2 flex-wrap">
              <Button
                variant={selectedType === null ? 'primary' : 'outline'}
                customColor={COLORS.bgcolor}
                color={COLORS.black}
                onClick={() => setSelectedType(null)}
                size="small"
              >
                All ({todayAppointments.length})
              </Button>
              {Object.entries(consultationCounts).map(([type, count]) => (
                <Button
                  key={type}
                  variant={selectedType === type ? 'primary' : 'outline'}
                  customColor={selectedType === type ? COLORS.bgcolor : COLORS.black}
                  onClick={() => setSelectedType(type)}
                  size="small"
                >
                  {type} ({count})
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              customColor={COLORS.bgcolor}
              color={COLORS.black}
              size="small"
              onClick={() => setShowCalendar(true)}
              className="d-flex align-items-center gap-2"
            >
              <FaRegCalendarAlt /> My Calendar
            </Button>
          </div>

          {/* Table */}
          <div style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto', borderRadius: '8px' }}>
            <CTable className="border">
              <CTableHead>
                <CTableRow style={{ fontSize: '0.875rem' }}>
                  {[
                    'S.No',
                    'Patient ID',
                    'Name',
                    'Mobile Number',
                    'Date',
                    'Time',
                    'Consultation',
                    'Action',
                  ].map((header, i) => (
                    <CTableHeaderCell
                      key={i}
                      className={header === 'Action' ? 'text-center' : ''}
                      style={{
                        backgroundColor: COLORS.bgcolor,
                        color: COLORS.black,
                      }}
                    >
                      {header}
                    </CTableHeaderCell>
                  ))}
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
                  currentPatients.map((item, index) => (
                    <CTableRow key={index} style={{ fontSize: '0.875rem' }}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
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
            <span style={{ color: COLORS.black, fontWeight: 'bold', fontSize: '1rem', textAlign: 'center' }}>
              Ad Space
            </span>
          </CCard>
        </div>
      </div>

      {/* Calendar Modal */}
      <CalendarModal
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        todayAppointments={bookedSlots} // ✅ pass booked slots
        defaultBookedSlots={[]}
        handleClick={handleClick}
        fetchAppointments={fetchBookedSlots} // ✅ enable auto-refresh in modal
      />
    </div>
  )
}

export default Dashboard
