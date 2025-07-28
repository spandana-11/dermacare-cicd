import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  CRow,
  CCol,
  CWidgetStatsA,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CCarousel,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CButton,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import Slider from 'react-slick'
import { getStyle } from '@coreui/utils'
import { CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilOptions } from '@coreui/icons'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import axios from 'axios'
import { MainAdmin_URL, AllCustomerAdvertisements, GetBy_DoctorId, servr_Url } from '../../baseUrl'
// import { appointments_Ref } from '../../baseUrl'
import { AppointmentData, GetBookingByClinicIdData } from '../AppointmentManagement/appointmentAPI'
import { DoctorData, getDoctorByClinicIdData } from '../Doctors/DoctorAPI'

const WidgetsDropdown = (props) => {
  const [slides, setSlides] = useState([])
  const sliderRef = useRef(null)
  const currentIndex = useRef(0)
  const intervalRef = useRef(null)
  const [bookings, setBookings] = useState([])
  const [activeCard, setActiveCard] = useState('') // state to keep track of which card is clicked eg:"appointments"
  const [len, setLen] = useState(0)
  const widgetChartRef1 = useRef(null)
  const widgetChartRef2 = useRef(null)
  const widgetChartRef3 = useRef(null)
  const [todayBookings, setTodayBookings] = useState([])
  const [totalAppointmentsCount, setTotalAppointmentsCount] = useState(0) // NEW: State to hold total appointments count
  const [totalDoctorsCount, setTotalDoctorsCount] = useState(0) // NEW: State to hold total appointments count
  const [totalPatientsCount, setTotalPatientsCount] = useState(0) // NEW: State to hold total appointments count
  const [loadingAppointments, setLoadingAppointments] = useState(true) // New state for loading indicator
  const [appointmentError, setAppointmentError] = useState(null) // New state for appointment fetch error
  const [loadingDoctors, setLoadingDoctors] = useState(true) // New state for loading indicator
  const [doctorError, setDoctorError] = useState(null) // New state for appointment fetch error
  const [doctors, setDoctors] = useState([])

  const navigate = useNavigate()

  // Helper function to convert date to YYYY-MM-DD format
  // This function is crucial for consistent date comparison.
  const convertToISODate = useCallback((dateString) => {
    if (!dateString) return ''

    let date
    // Check if dateString is already in YYYY-MM-DD format (preferred)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      date = new Date(dateString)
    } else if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
      // dd-MM-yyyy format
      const [day, month, year] = dateString.split('-')
      date = new Date(`${year}-${month}-${day}`)
    } else {
      // Attempt to parse other formats, though YYYY-MM-DD or dd-MM-yyyy are safer
      date = new Date(dateString)
    }

    if (isNaN(date.getTime())) {
      // Use getTime() for robust NaN check
      // console.warn('Invalid date string for conversion:', dateString)
      return ''
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }, [])

  // Get today's date in YYYY-MM-DD format, using a consistent method
  const todayISO = new Date().toISOString().split('T')[0]

  // Fetch Advertisements (unchanged)
  const fetchAdvertisements = async () => {
    try {
      const response = await axios.get(`${MainAdmin_URL}/${AllCustomerAdvertisements}`)
      console.log('✅ Advertisements Response:', response.data)
      if (Array.isArray(response.data)) {
        setSlides(response.data)
      } else {
        console.error('No advertisements found:', response.data)
      }
    } catch (error) {
      console.error('Error fetching advertisements:', error)
    }
  }

  // Use useCallback for fetchAppointments to stabilize the function reference
  const fetchAppointments = useCallback(
    async (clinicId) => {
      setLoadingAppointments(true)
      setAppointmentError(null)

      try {
        const response = await GetBookingByClinicIdData(clinicId)
        console.log('Raw Appointments Data:', response)

        if (response && Array.isArray(response.data)) {
          const allAppointments = response.data
          setTotalAppointmentsCount(allAppointments.length)

          const filteredAppointments = allAppointments.filter((item) => {
            const itemDate = item.serviceDate ? convertToISODate(item.serviceDate) : ''
            return itemDate === todayISO && item.clinicId === clinicId
          })

          setTodayBookings(filteredAppointments)
        } else {
          setTodayBookings([])
          setAppointmentError('No pending appointments for today.')
        }
      } catch (error) {
        console.error('Failed to fetch appointments:', error)
        setAppointmentError('No Appointment Found')
        setTodayBookings([])
      } finally {
        setLoadingAppointments(false)
      }
    },
    [todayISO, convertToISODate],
  )

  const fetchDoctors = useCallback(async (clinicId) => {
    setLoadingDoctors(true)
    setDoctorError(null)
    try {
      const response = await getDoctorByClinicIdData(clinicId)
      console.log('Raw Doctors Data:', response)

      // ✅ Access the inner data array
      const doctorArray = response?.data || []

      if (Array.isArray(doctorArray)) {
        setTotalDoctorsCount(doctorArray.length)
        setDoctors(doctorArray)
      } else {
        console.error('Invalid doctors response format:', response)
        setDoctorError('No doctors found.')
      }
    } catch (error) {
      console.error('Failed to fetch doctors:', error)
      setDoctorError('Failed to fetch doctors.')
    } finally {
      setLoadingDoctors(false)
    }
  }, [])

  useEffect(() => {
    fetchAdvertisements()
  }, [])

  useEffect(() => {
    const hospitalId = localStorage.getItem('HospitalId')
    console.log(hospitalId)
    if (hospitalId) {
      fetchAppointments(hospitalId)
      fetchDoctors(hospitalId)
      // Set up daily refresh:
      // 1. Calculate time until next midnight
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(now.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0) // Set to midnight of the next day

      const timeUntilMidnight = tomorrow.getTime() - now.getTime()

      // 2. Set a timeout to refresh exactly at midnight
      const midnightTimeout = setTimeout(() => {
        fetchAppointments(hospitalId) // Fetch date at midnight
        // After the first midnight fetch, set up an interval for daily fetches
        const dailyInterval = setInterval(() => fetchAppointments(hospitalId), 24 * 60 * 60 * 1000) // Fetch every 24 hours
        return () => clearInterval(dailyInterval) // Cleanup interval on unmount
      }, timeUntilMidnight)

      // Cleanup the initial midnight timeout if the component unmounts
      return () => clearTimeout(midnightTimeout)
    } else {
      // console.warn('No HospitalId in localStorage for fetching appointments')
      setAppointmentError('No appointments found for this Hospital Id')
      setLoadingAppointments(false)
    }
  }, [fetchAppointments, fetchDoctors]) // Depend on fetchAppointments

  // Pending appointments count for today
  const pendingTodayCount = todayBookings.filter(
    (item) => item.status?.toLowerCase() === 'pending',
  ).length

  // Slider settings for react-slick
  useEffect(() => {
    // Clear existing interval
    clearInterval(intervalRef.current)
    if (slides.length === 0 || !sliderRef.current) return

    const handleSlide = () => {
      const currentSlide = slides[currentIndex.current]
      const isVideo = currentSlide.mediaUrlOrImage?.toLowerCase().endsWith('.mp4')

      if (isVideo) {
        const video = document.getElementById(`video-${currentIndex.current}`)
        if (video) {
          video.onended = () => {
            currentIndex.current = (currentIndex.current + 1) % slides.length
            sliderRef.current.slickGoTo(currentIndex.current)
            handleSlide()
          }
        }
      } else {
        intervalRef.current = setTimeout(() => {
          currentIndex.current = (currentIndex.current + 1) % slides.length
          sliderRef.current.slickGoTo(currentIndex.current)
          handleSlide()
        }, 3000)
      }
    }

    handleSlide()

    return () => {
      clearInterval(intervalRef.current)
    }
  }, [slides])

  const getMediaSrc = (src) => {
    if (!src) return ''
    if (src.startsWith('data:') || src.startsWith('http') || src.startsWith('blob:')) return src
    if (src.toLowerCase().endsWith('.mp4')) return src // for external mp4 links
    return `data:image/png;base64,${src}` // adjust type if JPG or SVG
  }

  const sliderSettings = {
    dots: true,
    infinite: slides.length > 1, // Only enable loop when more than 1
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
  }

  // Auto-slide for images
  useEffect(() => {
    let imageTimer
    if (slides.length > 0) {
      // Watch current slide index
      const handleBeforeChange = (oldIndex, newIndex) => {
        // Clear previous timer
        clearTimeout(imageTimer)

        const current = slides[newIndex]
        const isVideo = isVideoFile(current.mediaUrlOrImage)

        if (!isVideo) {
          // For images: move to next after 3s
          imageTimer = setTimeout(() => {
            if (sliderRef.current) {
              sliderRef.current.slickNext()
            }
          }, 1000)
        }
      }

      // attach to slider events
      sliderRef.current?.innerSlider?.list.addEventListener('transitionend', () => {
        // optionally handle something after transition
      })

      // If using react-slick, you can get current index in afterChange
      sliderRef.current?.props?.afterChange && sliderRef.current.props.afterChange(0)

      return () => {
        clearTimeout(imageTimer)
      }
    }
  }, [slides])

  // After component mounts, attach ended listeners for each video
  useEffect(() => {
    slides.forEach((item, idx) => {
      const videoEl = document.getElementById(`video-${idx}`)
      if (videoEl) {
        // Clean up previous listener
        videoEl.onended = null
        videoEl.onended = () => {
          if (sliderRef.current) {
            sliderRef.current.slickNext()
          }
        }
      }
    })
  }, [slides])

  // Helper to check if it's video
  const isVideoFile = (src) => {
    if (!src) return false
    const lower = src.toLowerCase()
    return (
      lower.startsWith('data:video') ||
      lower.endsWith('.mp4') ||
      lower.endsWith('.webm') ||
      lower.endsWith('.ogg') ||
      lower.includes('video') // fallback if backend sends mime type
    )
  }
  return (
    <>
      {/*to display cards*/}
      <CRow className={props.className} xs={{ gutter: 4 }}>
        <CCol sm={6} xl={4}>
          <CWidgetStatsA
            color="primary"
            value={totalAppointmentsCount}
            title="Total Appointments"
            action={
              <CDropdown alignment="end">
                <CDropdownToggle color="transparent" caret={false} className="p-0">
                  <CIcon icon={cilOptions} className="text-high-emphasis-inverse" />
                </CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem onClick={() => navigate('/appointment-management')}>
                    View All Appointments
                  </CDropdownItem>{' '}
                  {/* Link to your appointments page */}
                  <CDropdownItem>Export</CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            }
            chart={
              <CChartLine
                ref={widgetChartRef1}
                className="mt-3 mx-3"
                style={{ height: '70px' }}
                data={{
                  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                  datasets: [
                    {
                      label: 'Appointments',
                      backgroundColor: 'transparent',
                      borderColor: 'rgba(255,255,255,.55)',
                      pointBackgroundColor: getStyle('--cui-primary'),
                      data: [30, 50, 40, 60, 55, 65, 70],
                    },
                  ],
                }}
                options={{
                  plugins: { legend: { display: false } },
                  maintainAspectRatio: false,
                  scales: { x: { display: false }, y: { display: false } },
                  elements: { line: { tension: 0.4 }, point: { radius: 0 } },
                }}
              />
            }
          />
        </CCol>

        <CCol sm={6} xl={4}>
          <CWidgetStatsA
            color="success"
            value={
              <>
                300{' '}
                {/* <span className="fs-6 fw-normal">
                (+2.8%) <CIcon icon={cilArrowTop} />
              </span> */}
              </>
            }
            title="Total Patients"
            action={
              <CDropdown alignment="end">
                <CDropdownToggle color="transparent" caret={false} className="p-0">
                  <CIcon icon={cilOptions} className="text-high-emphasis-inverse" />
                </CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem>View</CDropdownItem>
                  <CDropdownItem>Export</CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            }
            chart={
              <CChartLine
                ref={widgetChartRef2}
                className="mt-3 mx-3"
                style={{ height: '70px' }}
                data={{
                  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                  datasets: [
                    {
                      label: 'Patients',
                      backgroundColor: 'transparent',
                      borderColor: 'rgba(255,255,255,.55)',
                      pointBackgroundColor: getStyle('--cui-success'),
                      data: [100, 150, 130, 180, 170, 190, 200],
                    },
                  ],
                }}
                options={{
                  plugins: { legend: { display: false } },
                  maintainAspectRatio: false,
                  scales: { x: { display: false }, y: { display: false } },
                  elements: { line: { tension: 0.4 }, point: { radius: 0 } },
                }}
              />
            }
          />
        </CCol>

        <CCol sm={6} xl={4}>
          <CWidgetStatsA
            color="warning"
            value={totalDoctorsCount}
            title="Total Doctors"
            action={
              <CDropdown alignment="end">
                <CDropdownToggle color="transparent" caret={false} className="p-0">
                  <CIcon icon={cilOptions} className="text-high-emphasis-inverse" />
                </CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem onClick={() => navigate('/doctor')}>
                    View All Doctors
                  </CDropdownItem>{' '}
                  <CDropdownItem>Export</CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            }
            chart={
              <CChartLine
                ref={widgetChartRef3}
                className="mt-3 mx-3"
                style={{ height: '70px' }}
                data={{
                  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                  datasets: [
                    {
                      label: 'Doctors',
                      backgroundColor: 'transparent',
                      borderColor: 'rgba(255,255,255,.55)',
                      pointBackgroundColor: getStyle('--cui-warning'),
                      data: [10, 12, 13, 15, 14, 16, 17],
                    },
                  ],
                }}
                options={{
                  plugins: { legend: { display: false } },
                  maintainAspectRatio: false,
                  scales: { x: { display: false }, y: { display: false } },
                  elements: { line: { tension: 0.4 }, point: { radius: 0 } },
                }}
              />
            }
          />
        </CCol>
      </CRow>

      {/* Carousel Section */}
      <div style={{ marginTop: '2rem' }}>
        {slides.length > 0 ? (
          <Slider ref={sliderRef} {...sliderSettings}>
            {slides.map((item, idx) => {
              const mediaSrc = item.mediaUrlOrImage
              const isVideo = isVideoFile(mediaSrc)
              return (
                <div key={item.carouselId || idx}>
                  {isVideo ? (
                    <video
                      id={`video-${idx}`}
                      src={mediaSrc}
                      controls
                      autoPlay
                      muted
                      style={{
                        width: '100%',
                        maxHeight: '300px',
                        objectFit: 'contain',
                        borderRadius: '8px',
                      }}
                    />
                  ) : (
                    <img
                      src={mediaSrc}
                      alt={`Slide ${idx + 1}`}
                      style={{
                        width: '100%',
                        maxHeight: '300px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                      }}
                    />
                  )}
                </div>
              )
            })}
          </Slider>
        ) : (
          <p>No media found</p>
        )}
      </div>

      {/*to display appointmnt */}
      {/* Appointments Table */}
      <div className="container mt-4">
        <h5>Today's Pending Appointments</h5>
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
            {loadingAppointments ? (
              <CTableRow>
                <CTableDataCell colSpan="9" className="text-center">
                  Loading appointments...
                </CTableDataCell>
              </CTableRow>
            ) : appointmentError ? (
              <CTableRow>
                <CTableDataCell colSpan="9" className="text-center text-danger fw-bold">
                  {appointmentError}
                </CTableDataCell>
              </CTableRow>
            ) : todayBookings.filter((item) => item.status?.toLowerCase() === 'pending').length >
              0 ? (
              todayBookings
                .filter((item) => item.status?.toLowerCase() === 'pending')
                .map((item, index) => (
                  <CTableRow key={`${item.id}-${index}`}>
                    <CTableDataCell>{index + 1}</CTableDataCell>
                    <CTableDataCell>{item.clinicId}</CTableDataCell>
                    <CTableDataCell>{item.name}</CTableDataCell>
                    <CTableDataCell>{item.subServiceName}</CTableDataCell>
                    <CTableDataCell>{item.consultationType}</CTableDataCell>
                    <CTableDataCell>{item.serviceDate}</CTableDataCell>
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
                <CTableDataCell colSpan="9" className="text-center text-info fw-bold">
                  No pending appointments for today.
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>
      </div>
    </>
  )
}

export default WidgetsDropdown
