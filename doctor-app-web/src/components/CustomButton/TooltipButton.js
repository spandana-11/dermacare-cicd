import React, { useEffect, useState } from 'react'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Popover from 'react-bootstrap/Popover'
import Button from './CustomButton'
import './TooltipStyles.css'
import { COLORS } from '../../Themes'
import { useNavigate } from 'react-router-dom'
import { useDoctorContext } from '../../Context/DoctorContext'
import { flushSync } from 'react-dom'
import { CSpinner } from '@coreui/react'
const generateContent = (patient) => (
  <div className="tooltip-body">
    <div>
      <strong>Name:</strong> {patient.name}
    </div>
    <div>
      <strong>Age:</strong> {patient.age}
    </div>
    <div>
      <strong>Gender:</strong> {patient.gender}
    </div>
    <div>
      <strong>Problem:</strong> {patient.problem}
    </div>
    {patient.subService && (
      <div>
        <strong>Subservice:</strong> {patient.subService}
      </div>
    )}
    {patient.duration && (
      <div>
        <strong>Duration:</strong> {patient.duration}
      </div>
    )}
  </div>
)

const TooltipButton = ({ patient, onSelect }) => {
  const navigate = useNavigate() // ✅ hook inside component
  const { setPatientData } = useDoctorContext()
  const [navLoading, setNavLoading] = useState(false)

  const popover = (
    <Popover id={`popover-${patient.id}`} className="custom-popover">
      {generateContent(patient)}
    </Popover>
  )

  // const handleClick = () => {
  //   setPatientData(patient)
  //   // localStorage.setItem('selected_patient', JSON.stringify(patient))
  //   navigate(`/tab-content/${patient.patientId}`, { state: { patient } })

  //   if (onSelect) onSelect() // ✅ call this to close dropdown + clear input
  // }

  const handleClick = () => {
    // paint the overlay immediately
    flushSync(() => setNavLoading(true))

    setPatientData(patient)
    onSelect?.()

    // navigate after we’ve shown the overlay
    navigate(`/tab-content/${patient.patientId}`, { state: { patient } })
    // no need to setNavLoading(false); this component will unmount after navigation
  }

  return (
    <>
      <OverlayTrigger trigger={['hover', 'focus']} placement="left" overlay={popover}>
        <span>
          <Button
            size="small"
            customColor={COLORS.secondary}
            onClick={handleClick}
            disabled={navLoading}
          >
            View
          </Button>
        </span>
      </OverlayTrigger>
      {navLoading && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-25"
          style={{ zIndex: 2000 }}
        >
          <div className="d-flex align-items-center">
            <CSpinner className="me-2" />
            <span>Opening patient…</span>
          </div>
        </div>
      )}
    </>
  )
}

export default TooltipButton
