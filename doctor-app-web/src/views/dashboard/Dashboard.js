import React, { useEffect, useState } from 'react'
import classNames from 'classnames'
import 'bootstrap/dist/css/bootstrap.min.css'

import {
  CAvatar,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCardImage,
  CCol,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { Carousel } from 'react-bootstrap'
import Button from '../../components/CustomButton/CustomButton'
import { COLORS, SIZES } from '../../Themes'
import TooltipButton from '../../components/CustomButton/TooltipButton'
import avatar8 from './../../assets/images/12.png'
// import { patientData } from '../../Prescription/patientData.json'
import { useDoctorContext } from '../../Context/DoctorContext'
import { getAdImages, getTodayAppointments } from '../../Auth/Auth'
// import { patientData } from '../../Prescription/patientData.json'
const Dashboard = () => {
  const { setPatientData, doctorId, setTodayAppointments, todayAppointments } = useDoctorContext() // this calls the persisted helper if you set it up

  const consultationCounts = todayAppointments.reduce((acc, item) => {
    const key = item.consultationType
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const [selectedType, setSelectedType] = useState(null)

  const filteredPatients = selectedType
    ? todayAppointments.filter((item) => item.consultationType === selectedType)
    : todayAppointments
  const [adMediaList, setAdMediaList] = useState([])  // null = not yet loaded

  useEffect(() => {
    const fetchAds = async () => {
      const mediaUrls = await getAdImages()
      if (mediaUrls.length > 0) {
        setAdMediaList(mediaUrls)
      }
    }
    fetchAds()
  }, [])


  useEffect(() => {
    // clear context + localStorage so sidebar shows doctor data
    setPatientData(null)
  }, [])

  useEffect(() => {
    // clear context + localStorage so sidebar shows doctor data
    appointmentDetails()
  }, [])

  const appointmentDetails = async () => {
    const response = await getTodayAppointments()
    console.log(response)

    if (response.statusCode == 200) {
      console.log(response.data)
      setTodayAppointments(response.data)
    }
  }

  return (
    <div className="container-fluid " style={{ marginTop: '2%' }}>
      <h5 className="mb-4" style={{ fontSize: SIZES.medium }}>
        Today Appointments
      </h5>

      <div className="d-flex flex-wrap flex-md-nowrap gap-3">
        {/* LEFT SIDE - Appointments and Filters (60%) */}
        <div className="flex-grow-1" style={{ flexBasis: '60%' }}>
          {/* Filter Buttons */}
          <div className="mb-3 d-flex gap-2 flex-wrap">
            <Button
              variant={selectedType === null ? 'primary' : 'outline'}
              customColor={COLORS.gray}
              onClick={() => setSelectedType(null)}
              size="small"
            >
              All ({todayAppointments.length})
            </Button>
            {Object.entries(consultationCounts).map(([type, count]) => (
              <Button
                key={type}
                variant={selectedType === type ? 'primary' : 'outline'}
                customColor={selectedType === type ? COLORS.primary : COLORS.gray}
                onClick={() => setSelectedType(type)}
                size="small"
              >
                {type} ({count})
              </Button>
            ))}
          </div>

          {/* Table Section with Scroll */}
          <div
            style={{
              maxHeight: 'calc(100vh - 250px)',
              overflowY: 'auto',
              borderRadius: '8px',

              overflow: 'hidden',
            }}
          >
            <CTable className=" border">
              <CTableHead>
                <CTableRow
                  style={{
                    fontSize: '0.875rem',
                    backgroundColor: '#d6d8db',
                  }}
                >
                  {[
                    'S.No',
                    'Patient ID',
                    'Name',
                    'Mobile Number',
                    'Time',
                    'Consultation',
                    'Action',
                  ].map((header, i) => (
                    <CTableHeaderCell
                      key={i}
                      style={{
                        fontWeight: 'bold',
                        color: '#000',
                        backgroundColor: '#dee2e6',
                      }}
                      className={header === 'Action' ? 'text-center' : ''}
                    >
                      {header}
                    </CTableHeaderCell>
                  ))}
                </CTableRow>
              </CTableHead>

              <CTableBody>
                {filteredPatients.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan="7" className="text-center py-4 text-muted">
                      No Appointments Available
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  filteredPatients.map((item, index) => (
                    <CTableRow key={index} style={{ fontSize: '0.875rem' }}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{item.patientId}</CTableDataCell>
                      <CTableDataCell>{item.name}</CTableDataCell>
                      <CTableDataCell>{item.mobileNumber}</CTableDataCell>
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
          </div>
        </div>

        {/* RIGHT SIDE - Ads (40%) */}
        <div
          className="d-flex align-items-start justify-content-start bg-dark"
          style={{
            height: '60vh',
            width: '200px',
            overflow: 'hidden',
            borderRadius: '10px',
          }}
        >
          <CCard style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            {adMediaList.length > 0 ? (
              <Carousel controls indicators interval={3000} fade>
                {adMediaList.map((media, index) => (
                  <Carousel.Item
                    key={index}
                    // If it's video → disable auto-slide until finished
                    interval={media.endsWith('.mp4') ? null : 3000}
                  >
                    {media.endsWith('.mp4') ? (
                      <video
                        src={media}
                        controls
                        autoPlay
                        loop={false}   // play once before carousel moves
                        muted
                        style={{ width: '100%', height: '60vh', objectFit: 'cover' }}
                        onEnded={(e) => {
                          // manually move to next slide when video ends
                          const carousel = e.target.closest('.carousel');
                          if (carousel) {
                            const nextBtn = carousel.querySelector('.carousel-control-next');
                            if (nextBtn) nextBtn.click();
                          }
                        }}
                      />
                    ) : (
                      <CCardImage
                        src={media}
                        alt={`Ad ${index}`}
                        style={{ width: '100%', height: '60vh', objectFit: 'contain' }}
                      />
                    )}
                  </Carousel.Item>
                ))}
              </Carousel>
            ) : (
              <div
                style={{
                  height: '100%',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  color: '#888',
                }}
              >
                Loading Ads...
              </div>
            )}
          </CCard>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
