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
import CIcon from '@coreui/icons-react'
import {
  cibCcAmex,
  cibCcApplePay,
  cibCcMastercard,
  cibCcPaypal,
  cibCcStripe,
  cibCcVisa,
  cibGoogle,
  cibFacebook,
  cibLinkedin,
  cifBr,
  cifEs,
  cifFr,
  cifIn,
  cifPl,
  cifUs,
  cibTwitter,
  cilCloudDownload,
  cilPeople,
  cilUser,
  cilUserFemale,
} from '@coreui/icons'

import avatar1 from 'src/assets/images/avatars/1.jpg'
import avatar2 from 'src/assets/images/avatars/2.jpg'
import avatar3 from 'src/assets/images/avatars/3.jpg'
import avatar4 from 'src/assets/images/avatars/4.jpg'
import avatar5 from 'src/assets/images/avatars/5.jpg'
import avatar6 from 'src/assets/images/avatars/6.jpg'

import WidgetsBrand from '../widgets/WidgetsBrand'
import WidgetsDropdown from '../widgets/WidgetsDropdown'
import MainChart from './MainChart'
import Button from '../../components/CustomButton/CustomButton'
import { COLORS, SIZES } from '../../Themes'
import TooltipButton from '../../components/CustomButton/TooltipButton'
import avatar8 from './../../assets/images/12.png'
// import { patientData } from '../../Prescription/patientData.json'
import { useDoctorContext } from '../../Context/DoctorContext'
import {  getTodayAppointments } from '../../Auth/Auth'

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
  const [adImage, setAdImage] = useState(null) // null = not yet loaded
  
  useEffect(() => {
    // Simulate backend fetch delay
    setTimeout(() => {
      // Replace with actual fetch later
      setAdImage(avatar8) // or set to a backend URL
    }, 2000) // 2 seconds delay
  }, [])


  useEffect(() => {
    // clear context + localStorage so sidebar shows doctor data
    setPatientData(null)
  }, [])

  useEffect(() => {
    // clear context + localStorage so sidebar shows doctor data
    appointmentDetails();
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
              boxShadow: '0 2px 2px rgba(13, 110, 253, 0.3)',

              overflow: 'hidden',
            }}
          >
            <CTable className="mb-5 border">
              <CTableHead>
                <CTableRow
                  style={{
                    fontSize: '0.875rem',
                    backgroundColor: '#d6d8db',
                  }}
                >
                  {['S.No', 'Patient ID', 'Name', 'Mobile Number', 'Time', 'Consultation', 'Action'].map(
                    (header, i) => (
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
                    )
                  )}
                </CTableRow>
              </CTableHead>

              <CTableBody >
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
                        <TooltipButton patient={item} />
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
            position: 'relative', // or 'fixed' if you want it to stay on screen always
            borderRadius: '10px',
          }}
        >
          <CCard style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            {adImage ? (
              <CCardImage
                src={adImage}
                alt="Profile Ad"
                style={{
                  objectFit: 'fit', // or 'contain' if you want full image inside without cropping
                  height: '100%',
                  width: '100%',
                }}
              />
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
                Loading Ad...
              </div>
            )}
          </CCard>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
