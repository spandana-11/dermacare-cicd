import React from 'react'
import { CContainer, CRow, CCol, CCard, CCardBody } from '@coreui/react'
import { useNavigate } from 'react-router-dom'

// Import your custom vector images (make sure these files exist in assets/images)
import doctorIcon from '../../assets/images/avatars/Doctors.png'
import nurseIcon from '../../assets/images/avatars/nurse.png'
import laboratoryIcon from '../../assets/images/avatars/Laboratory.png'
import pharmacistIcon from '../../assets/images/avatars/Pharmacist.png'
// import receptionistIcon from '../../assets/images/avatars/Receptionist.png'
import AdminIcon from '../../assets/images/avatars/Admin.png'
import FrontDeskIcon from '../../assets/images/avatars/Front_Desk.png'
import securityIcon from '../../assets/images/avatars/Security.png'
import otherStaffIcon from '../../assets/images/avatars/Other_Staff.png'
import { COLORS } from '../../Constant/Themes'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUserDoctor,
  faUserNurse,
  faPills,
  faVials,
  faUserTie,
  faConciergeBell,
  faShieldHalved,
  faUsers,
  faUserAlt,
} from '@fortawesome/free-solid-svg-icons'
import { FaUserTie } from 'react-icons/fa'

const EmployeeManagement = () => {
  const navigate = useNavigate()

  const iconMap = {
    doctor: faUserDoctor,
    nurse: faUserNurse,
    pharmacist: faPills,
    laboratory: faVials,
    admin: faUserAlt,
    frontDesk: faUserTie,
    security: faShieldHalved,
    otherStaff: faUsers,
  }

  const employees = [
    { title: 'Doctor', type: 'doctor', path: '/Doctor' },
    { title: 'Nurse', type: 'nurse', path: '/Nurse' },
    { title: 'Pharmacist', type: 'pharmacist', path: '/Pharmacist' },
    { title: 'Lab Technician', type: 'laboratory', path: '/Lab-Technician' },
    { title: 'Administrator', type: 'admin', path: '/Admin' },
    { title: 'FrontDesk', type: 'frontDesk', path: '/FrontDesk' },
    { title: 'Security', type: 'security', path: '/Security' },
    { title: 'OtherStaff', type: 'otherStaff', path: '/OtherStaff' },
  ]

  return (
    <CContainer className="mt-5">
      <style>
        {`
        
          .card-zoom {
            transition: transform 0.3s ease-in-out;
          }
          .card-zoom:hover {
            transform: scale(1.05);
          }
        `}
      </style>
      <h2 className="text-center mb-4">Employee Management</h2>

      <CRow className="g-4 justify-content-start">
        {employees.map((emp, index) => (
          <CCol xs={12} sm={6} md={3} key={index}>
            <CCard
              className="text-center shadow-lg p-3 card-zoom"
              style={{ cursor: 'pointer', backgroundColor: 'var(--color-bgcolor)' }}
              onClick={() => navigate(emp.path)}
            >
              <CCardBody>
                <FontAwesomeIcon
                  icon={iconMap[emp.type]} // dynamically pick icon
                  style={{ fontSize: '70px', color: 'var(--color-black)' }}
                  className="mb-3"
                />
                <h5 style={{ color: 'var(--color-black)' }}>{emp.title}</h5>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>
    </CContainer>
  )
}

export default EmployeeManagement
