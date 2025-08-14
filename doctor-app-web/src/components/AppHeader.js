import React, { useEffect, useRef, useState } from 'react'

import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,
  useColorModes,
  CFormInput,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilMenu,
} from '@coreui/icons'
import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'
import './header/sidebar.css'
import { COLORS, SIZES } from '../Themes'
import { getDateParts } from '../utils/formatDateTime'
import Button from './CustomButton/CustomButton'
// import { patientData } from '../Prescription/patientData.json'
import TooltipButton from './CustomButton/TooltipButton'
import { getClinicDetails, getTodayAppointments } from '../Auth/Auth'
import { useDoctorContext } from '../Context/DoctorContext'

const AppHeader = () => {
  const { patientData ,setTodayAppointments,todayAppointments} = useDoctorContext()
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
 
  const headerRef = useRef()
  const [clinic, setClinic] = useState(null)
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)

  useEffect(() => {
    document.addEventListener('scroll', () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    })
  }, [])

  useEffect(() => {
    const fetchClinic = async () => {
      try {
        const res = await getClinicDetails();
        console.log('✅ Clinic loaded:', res);
        setClinic(res);
      } catch (err) {
        console.error('❌ Error fetching clinic:', err);
      }
    };

    fetchClinic();
  }, []);


  const { day, date, time } = getDateParts()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [visible, setVisible] = useState(false)

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    const filtered = todayAppointments.filter((p) => p.name.toLowerCase().includes(value.toLowerCase()))
    setSearchResults(filtered)
  }

  const handleView = (patient) => {
    setSelectedPatient(patient)
    setVisible(true)
  }

  return (
    <CHeader
      position="sticky"
      className="mb-0 p-0 app-header"
      // ref={headerRef}
      style={{ top: 0, insetInline: 0, zIndex: 1030, margin: -20, }}
    >
      <CContainer className="border-bottom px-4 header-row " fluid>
        <CHeaderToggler
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          style={{ marginInlineStart: '-14px' }}
          aria-label="Toggle sidebar"
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>

        {/* Search */}
        <div className="position-relative flex-grow-1 mx-3 search-wrap">
          <div className="position-relative">
            <CFormInput
              type="text"
              placeholder="Search patient by name..."
              value={searchTerm}
              onChange={handleSearch}
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('')
                  setSearchResults([])
                }}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  color: '#aaa',
                }}
              >
                ×
              </button>
            )}
          </div>

          {searchTerm && searchResults.length > 0 && (
            <div
              className="position-absolute w-100 mt-1 bg-white shadow rounded p-2 search-dropdown"
              style={{ maxHeight: 300, overflowY: 'auto' }}
            >
              {searchResults.map((patient, idx) => (
                <div
                  key={idx}
                  className="d-flex justify-content-between align-items-center border-bottom py-2 px-2"
                >
                  <div>
                    <strong>{patient.name}</strong>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{patient.mobileNumber}</div>
                  </div>

                  <TooltipButton
                    patient={patient}
                    onSelect={() => {
                      setSearchTerm('')
                      setSearchResults([])
                    }}
                  />
                </div>
              ))}
            </div>
          )}
          {searchTerm && searchResults.length === 0 && (
            <div className="position-absolute w-100 mt-1 bg-white shadow rounded p-2 text-center text-muted search-dropdown">
              No patient found
            </div>
          )}
        </div>

        <div className="d-flex flex-column text-end me-3 text-center px-2">
          <small style={{ fontWeight: 600, color: COLORS.gray }}>
            {date} ({day}), {time}
          </small>
        </div>

        <CHeaderNav className="ms-auto">
          <CNavItem>
            <CNavLink href="#">
              <CIcon icon={cilBell} size="lg" />
            </CNavLink>
          </CNavItem>
        </CHeaderNav>

        {/* Theme switch + profile */}
        <CHeaderNav className="gap-2 align-items-center">

          <div className="vr h-100 mx-2 text-body text-opacity-75 d-none d-md-block" />

          <div className="d-flex flex-column align-items-center justify-content-center text-center px-2">
            {clinic ? (
              <>
                <h5 className="fw-bold clinic-header" style={{ fontSize: SIZES.large }}>
                  {clinic.name || 'No name'}
                </h5>
                <h6 style={{ color: COLORS.secondary, fontSize: SIZES.small }}>
                  {clinic.city || 'No city'}
                </h6>
              </>
            ) : (
              <h6 className="text-muted">Loading...</h6>
            )}
          </div>

          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>

      <CContainer className="px-4" fluid>
        <AppBreadcrumb />
      </CContainer>

      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>Patient Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedPatient && (
            <div>
              <p>
                <strong>Name:</strong> {selectedPatient.name}
              </p>
              <p>
                <strong>Mobile:</strong> {selectedPatient.mobileNumber}
              </p>
              <p>
                <strong>Problem:</strong> {selectedPatient.problem}
              </p>
              <p>
                <strong>Doctor:</strong> {selectedPatient.doctorName}
              </p>
              <p>
                <strong>Consultation:</strong> {selectedPatient.consultationType}
              </p>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <Button color="secondary" onClick={() => setVisible(false)}>
            Close
          </Button>
        </CModalFooter>
      </CModal>
    </CHeader>
  )
}

export default AppHeader
