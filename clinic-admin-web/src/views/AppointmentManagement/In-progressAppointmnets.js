import React, { useEffect, useState, useCallback } from 'react'
import {
  CTable,
  CTableBody,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CFormSelect,
  CButton,
  CSpinner,
  CModal,
  CModalHeader,
  CModalBody,
  CModalTitle,
  CCard,
  CCardBody,
  CFormInput,
} from '@coreui/react'
import { Save } from 'lucide-react'
import { format } from 'date-fns'
import { useDispatch } from 'react-redux'
import { GetBookingByClinicIdData } from './appointmentAPI'
import { http } from '../../Utils/Interceptors'
import axios from 'axios'
import { BASE_URL, Booking_sevice } from '../../baseUrl'
import { toast } from 'react-toastify'
import { useGlobalSearch } from '../Usecontext/GlobalSearchContext'
import LoadingIndicator from '../../Utils/loader'

const followOptions = [
  { label: 'Follow-up Required', value: 'followup' },
  { label: 'No Follow-up Needed', value: 'no-followup' },
  { label: 'Patient Not Responding', value: 'no-response' },
  { label: 'Reschedule Needed (Doctor Unavailable)', value: 'reschedule-doctor' },
  { label: 'Reschedule Needed (Patient Request)', value: 'reschedule-patient' },
  { label: 'Request to Book', value: 'request-to-book' },
  { label: 'Booked by Admin', value: 'booked-admin' },
  { label: 'we will book', value: 'patient-will book' },
  { label: 'Waiting for Patient Confirmation', value: 'waiting-patient-confirmation' },
  { label: 'Waiting for Doctor Confirmation', value: 'waiting-doctor-confirmation' },
]

const InProgressAppointmentsPage = () => {
  const [inprogressApt, setInprogressApt] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [followStatuses, setFollowStatuses] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalData, setModalData] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState(null)
  const [days, setDays] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [allSlots, setAllSlots] = useState([])
  const [slotsForSelectedDate, setSlotsForSelectedDate] = useState([])
  const [selectedSlots, setSelectedSlots] = useState([])
  const dispatch = useDispatch()
  const [selectedDateFilter, setSelectedDateFilter] = useState('today')
  const [allAppointments, setAllAppointments] = useState([])
  const { searchQuery, setSearchQuery } = useGlobalSearch()
  const [value, setValue] = useState('') // selected dropdown value
  const [custom, setCustom] = useState('')
  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    setError(null)
    const clinicId = localStorage.getItem('HospitalId')

    try {
      const response = await GetBookingByClinicIdData(clinicId)
      if (response && Array.isArray(response.data)) {
        const inprogreeAppointments = response.data.filter(
          (item) => item.status.toLowerCase() === 'in-progress',
        )

        setAllAppointments(inprogreeAppointments) // ✅ store unfiltered appointments
        // ✅ initially show only today's appointments
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const formattedToday = format(today, 'yyyy-MM-dd')
        // setInprogressApt(inprogreeAppointments.filter((apt) => apt.serviceDate === formattedToday))
        setInprogressApt(inprogreeAppointments)
      } else {
        setAllAppointments([])
        setInprogressApt([])
        setError('No appointments found.')
      }
    } catch (err) {
      console.error(err)
      setError('Failed to fetch appointments')
      setAllAppointments([])
      setInprogressApt([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    dispatch({ type: 'set', sidebarShow: false })
    fetchAppointments()
  }, [fetchAppointments, dispatch])

  const handleChange = (bookingId, newValue) => {
    // newValue can be a string or an object { value, customReason }
    setFollowStatuses((prev) => ({
      ...prev,
      [bookingId]: typeof newValue === 'string' ? { value: newValue } : newValue,
    }))
  }

  const [sortOrder, setSortOrder] = useState('asc')

  const toggleSort = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const handleSave = () => {
    // If user typed something, use it, else use dropdown value
    const status = custom.trim() ? custom : value
    console.log(status)
    // onSave(bookingId, status)
  }

  // Inside the modal body, after fetching slots and filtering for selectedDate
  const filteredSlots = slotsForSelectedDate.filter((slotObj) => {
    if (!slotObj.slot) return false
    const now = new Date()
    const slotTime = new Date(`${selectedDate} ${slotObj.slot}`)
    const isBooked = slotObj.slotbooked === true || slotObj.slotbooked === 'true'

    // show booked slots, but mark as disabled
    if (selectedDate === format(now, 'yyyy-MM-dd')) {
      return slotTime > now || isBooked
    }
    return true
  })

  // Slot click handler - only one slot allowed
  // const handleSlotClick = (slot) => {
  //   if (slot.slotbooked) return // booked slot not selectable
  //   setSelectedSlots([slot.slot]) // only one slot
  // }

  // Booking payload and API call
  const bookSlot = async () => {
    if (!modalData || selectedSlots.length === 0) return

    const payload = {
      bookingId: modalData.bookingId,
      doctorId: modalData.doctorId,
      patientId: modalData.patientId,
      visitType: 'Follow-Up',
      serviceDate: selectedDate,
      servicetime: selectedSlots[0],
      mobileNumber: modalData.mobileNumber,
    }

    try {
      const response = await axios.post(`${Booking_sevice}/customer/bookService`, payload) // replace with your API
      console.log('Booking response:', response.data)
      toast.success(response.data.message ?? 'Booking Successfull...!')
      await fetchAppointments()
      setModalVisible(false)
    } catch (error) {
      toast.error('Booking failed:', error)

      console.error('Booking failed:', error)
    }
  }

  const handleDateFilter = (filter) => {
    setSelectedDateFilter(filter)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let targetDate = new Date(today)
    if (filter === 'tomorrow') targetDate.setDate(today.getDate() + 1)
    if (filter === 'dayafter') targetDate.setDate(today.getDate() + 2)

    const formattedDate = format(targetDate, 'yyyy-MM-dd')
    const filteredAppointments = allAppointments.filter((apt) => apt.serviceDate === formattedDate)
    setInprogressApt(filteredAppointments)
  }

  useEffect(() => {
    const generateUpcomingDays = () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const dayList = []

      for (let i = 0; i < 15; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        dayList.push({
          date,
          dayLabel: format(date, 'EEE'), // use date here
          dateLabel: format(date, 'dd MMM'),
        })
      }

      setDays(dayList)
      setSelectedDate(format(today, 'yyyy-MM-dd'))
    }

    generateUpcomingDays()
  }, [])

  // Fetch slots for doctor
  // Fetch slots for doctor when modal opens
  const fetchSlots = async () => {
    if (!modalData) return
    try {
      setModalLoading(true)
      const hospitalId = localStorage.getItem('HospitalId')
      const branchId = localStorage.getItem('branchId')
      const response = await http.get(
        `/getDoctorSlots/${hospitalId}/${branchId}/${modalData.doctorId}`,
      )
      if (response.data.success && Array.isArray(response.data.data)) {
        setAllSlots(response.data.data) // store all slot objects (with date)
      }
    } catch (error) {
      console.error('Error fetching slots:', error)
      setModalError('Failed to load slots')
    } finally {
      setModalLoading(false)
    }
  }

  // Filter slots for selected date and doctor
  useEffect(() => {
    if (!allSlots.length || !modalData || !selectedDate) return

    // Filter slots for selected date ignoring branchId mismatch
    const doctorSlots = allSlots.find(
      (d) => d.doctorId === modalData.doctorId && d.date === selectedDate, // ignore branchId for now
    )

    if (doctorSlots && Array.isArray(doctorSlots.availableSlots)) {
      setSlotsForSelectedDate(doctorSlots.availableSlots)
      setSelectedSlots([]) // reset selection
    } else {
      setSlotsForSelectedDate([])
    }
  }, [allSlots, selectedDate, modalData])

  useEffect(() => {
    if (modalData) fetchSlots()
  }, [modalData])
  const handleSlotClick = (slotObj) => {
    if (slotObj.slotbooked) return // booked slot not selectable
    setSelectedSlots([slotObj.slot]) // only one slot
  }

  const openBookingModal = async (bookingId) => {
    setModalVisible(true)
    setModalLoading(true)
    setModalError(null)
    setModalData(bookingId)
  }

  const filteredData = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return inprogressApt
    return inprogressApt.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(q)),
    )
  }, [searchQuery, inprogressApt])

  const displayData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  const sortedAppointments = [...displayData].sort((a, b) => {
    const dateA = new Date(a.serviceDate)
    const dateB = new Date(b.serviceDate)
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
  })

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center">
        <LoadingIndicator message="Loading active appointmnets..." />
      </div>
    )

  if (error) return <p>{error}</p>

  return (
    <div className="container my-2">
      <div className="row d-flex w-100">
        <div className="col-6">
          <h4>In-Progress Appointments</h4>
        </div>
        {/* <div className="col-6 flex-column d-flex justify-content-center align-items-center align-content-center"> */}
        {/* 🔥 Filter Buttons */}
        {/* <div className="row my-2">
            <div className="col d-flex gap-2">
              {['today', 'tomorrow', 'dayafter'].map((filter) => {
                const isSelected = selectedDateFilter === filter
                const label =
                  filter === 'today'
                    ? 'Today'
                    : filter === 'tomorrow'
                      ? 'Tomorrow'
                      : 'Day After Tomorrow'

                return (
                  <CButton
                    key={filter}
                    onClick={() => handleDateFilter(filter)}
                    style={{
                      backgroundColor: isSelected ? 'var(--color-bgcolor)' : 'transparent',
                      color: isSelected ? 'var(--color-black)' : 'var(--color-black)',
                      border: `1px solid var(--color-bgcolor)`,
                      fontWeight: isSelected ? 'bold' : 'normal',
                    }}
                  >
                    {label}
                  </CButton>
                )
              })}
            </div>
          </div> */}

        {/* <div className="mb-4">
            <span>(Only Showing Active Appointments)</span>
          </div> */}
        {/* </div> */}
      </div>

      {/* Table Section */}
      {inprogressApt.length === 0 ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: '300px' }}
        >
          <h6 style={{ color: 'var(--color-black)', fontWeight: 'normal', textAlign: 'center' }}>
            {selectedDateFilter === 'today' && 'No appointments for Today'}
            {selectedDateFilter === 'tomorrow' && 'No appointments for Tomorrow'}
            {selectedDateFilter === 'dayafter' && 'No appointments for Day After Tomorrow'}
          </h6>
        </div>
      ) : (
        <CTable bordered hover responsive>
          <CTableHead>
            <CTableRow className="pink-table  w-auto">
              <CTableHeaderCell>Patient Id</CTableHeaderCell>
              <CTableHeaderCell>Patient Name</CTableHeaderCell>
              <CTableHeaderCell>Doctor</CTableHeaderCell>
              <CTableHeaderCell>Mobile Number</CTableHeaderCell>
              <CTableHeaderCell>Consultation</CTableHeaderCell>

              <CTableHeaderCell onClick={toggleSort} style={{ cursor: 'pointer' }}>
                Follow-Up Date {sortOrder === 'asc' ? '↑' : '↓'}
              </CTableHeaderCell>
              <CTableHeaderCell>Follow-Up Status</CTableHeaderCell>
              <CTableHeaderCell></CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody className="pink-table">
            {sortedAppointments.map((apt) => (
              <CTableRow key={apt.bookingId}>
                <CTableDataCell>{apt.patientId}</CTableDataCell>
                <CTableDataCell>{apt.name}</CTableDataCell>
                <CTableDataCell>{apt.doctorName}</CTableDataCell>
                <CTableDataCell>{apt.mobileNumber}</CTableDataCell>
                <CTableDataCell>{apt.consultationType}</CTableDataCell>

                <CTableDataCell>{apt.serviceDate}</CTableDataCell>

                <CTableDataCell>
                  <div className="d-flex align-items-center gap-2">
                    <div className="d-flex align-items-center gap-2">
                      <CFormSelect
                        size="sm"
                        value={followStatuses[apt.bookingId]?.value || ''}
                        onChange={(e) =>
                          setFollowStatuses((prev) => ({
                            ...prev,
                            [apt.bookingId]: { value: e.target.value, custom: '' },
                          }))
                        }
                      >
                        <option value="">Select</option>
                        {followOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                        <option value="other">Other</option>
                      </CFormSelect>

                      {followStatuses[apt.bookingId]?.value === 'other' && (
                        <CFormInput
                          size="sm"
                          placeholder="Type reason if needed"
                          value={followStatuses[apt.bookingId]?.custom || ''}
                          onChange={(e) =>
                            setFollowStatuses((prev) => ({
                              ...prev,
                              [apt.bookingId]: {
                                ...prev[apt.bookingId],
                                custom: e.target.value,
                              },
                            }))
                          }
                        />
                      )}

                      <CButton
                        size="sm"
                        onClick={() => {
                          const status =
                            followStatuses[apt.bookingId]?.value === 'other'
                              ? followStatuses[apt.bookingId]?.custom
                              : followStatuses[apt.bookingId]?.value
                          console.log('Saved status for', apt.bookingId, status)
                          // 🔥 Call API to save here
                        }}
                      >
                        <Save size={16} />
                      </CButton>
                    </div>
                  </div>
                </CTableDataCell>
                <CTableDataCell>
                  <CButton
                    style={{
                      backgroundColor: 'var(--color-bgcolor)',
                      color: 'var(--color-black)',
                    }}
                    onClick={() => openBookingModal(apt)}
                  >
                    BOOK
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      )}
      {!loading && (
        <div className="d-flex justify-content-end mt-3" style={{ marginRight: '40px' }}>
          {Array.from({ length: Math.ceil(filteredData.length / rowsPerPage) }, (_, index) => (
            <CButton
              key={index}
              style={{
                backgroundColor: currentPage === index + 1 ? 'var(--color-black)' : '#fff',
                color: currentPage === index + 1 ? '#fff' : 'var(--color-black)',
                border: '1px solid #ccc',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
              className="ms-2"
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </CButton>
          ))}
        </div>
      )}

      {/* Modal showing details without table */}
      {/* Modal for booking slots */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle>
            Book Slots for {modalData?.doctorName} ({modalData?.name})
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {/* Patient & Doctor Info */}
          {modalData && (
            <div className="mb-3" style={{ color: 'var(--color-black)' }}>
              <p>
                <strong>Patient:</strong> {modalData.name} <br />
                <strong>Doctor:</strong> {modalData.doctorName} <br />
                <strong>Clinic / Branch:</strong> {modalData.clinicName || modalData.branchName}{' '}
                <br />
                <strong>Consultation:</strong> {modalData.consultationType} <br />
                <strong>Status:</strong> {modalData.status}
              </p>
            </div>
          )}

          {/* Date selection */}
          <div className="d-flex gap-2 flex-wrap mb-3">
            {days.map((dayObj, idx) => {
              const isSelected = selectedDate === format(dayObj.date, 'yyyy-MM-dd')
              return (
                <CButton
                  key={idx}
                  onClick={() => setSelectedDate(format(dayObj.date, 'yyyy-MM-dd'))}
                  style={{
                    backgroundColor: isSelected ? 'var(--color-black)' : 'white',
                    color: isSelected ? 'white' : 'var(--color-black)',
                    border: '1px solid var(--color-black)',
                  }}
                >
                  <div style={{ fontSize: '14px' }}>{dayObj.dayLabel}</div>
                  <div style={{ fontSize: '12px' }}>{dayObj.dateLabel}</div>
                </CButton>
              )
            })}
          </div>

          {/* Slots for selected date */}
          <CCard>
            <CCardBody>
              {modalLoading ? (
                <CSpinner />
              ) : filteredSlots.length > 0 ? (
                <div className="d-flex flex-wrap gap-2">
                  {filteredSlots.map((slotObj, i) => {
                    const isSelected = selectedSlots[0] === slotObj.slot
                    const isBooked = slotObj.slotbooked === true || slotObj.slotbooked === 'true' // <-- convert string to boolean

                    return (
                      <div
                        key={i}
                        onClick={() => !isBooked && handleSlotClick(slotObj)} // prevent click if booked
                        style={{
                          cursor: isBooked ? 'not-allowed' : 'pointer',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          border: '1px solid var(--color-black)',
                          backgroundColor: isBooked
                            ? '#f44336' // red for booked
                            : isSelected
                              ? 'var(--color-black)' // selected slot
                              : 'lightgray', // default
                          color: isBooked ? 'white' : isSelected ? 'white' : 'black',
                          opacity: isBooked ? 0.6 : 1,
                        }}
                      >
                        {slotObj.slot}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p>No slots available for this date</p>
              )}
            </CCardBody>
          </CCard>

          {/* Book Slots Button */}
          <div className="mt-3 d-flex justify-content-end">
            <CButton
              style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
              disabled={selectedSlots.length === 0}
              onClick={bookSlot}
            >
              Book Selected Slot
            </CButton>
          </div>
        </CModalBody>
      </CModal>
    </div>
  )
}

export default InProgressAppointmentsPage
