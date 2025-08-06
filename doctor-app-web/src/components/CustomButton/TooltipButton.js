import React, { useEffect } from 'react'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Popover from 'react-bootstrap/Popover'
import Button from './CustomButton'
import './TooltipStyles.css'
import { COLORS } from '../../Themes'
import { useNavigate } from 'react-router-dom'
import { useDoctorContext } from '../../Context/DoctorContext'

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
  const popover = (
    <Popover id={`popover-${patient.id}`} className="custom-popover">
      {generateContent(patient)}
    </Popover>
  )

  const handleClick = () => {
    setPatientData(patient)
    // localStorage.setItem('selected_patient', JSON.stringify(patient))
    navigate(`/tab-content/${patient.patientId}`, { state: { patient } })

    if (onSelect) onSelect() // ✅ call this to close dropdown + clear input
  }
 

  return (
    <OverlayTrigger trigger={['hover', 'focus']} placement="left" overlay={popover}>
      <span>
        <Button size="small" customColor={COLORS.secondary} onClick={handleClick}>
          View
        </Button>
      </span>
    </OverlayTrigger>
  )
}

export default TooltipButton
