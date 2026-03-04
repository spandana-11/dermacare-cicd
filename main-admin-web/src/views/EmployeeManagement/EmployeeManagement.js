import React from 'react'
import { CContainer, CRow, CCol, CCard, CCardBody } from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUserDoctor,
  faUserNurse,
  faPills,
  faVials,
  faUserAlt,
  faShieldHalved,
  faUsers,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons'

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
    // { title: 'Doctors', type: 'doctor', path: '/employee-management/doctors' },
    { title: 'Nurses', type: 'nurse', path: '/employee-management/nurse' },
    { title: 'Pharmacist', type: 'pharmacist', path: '/employee-management/pharmacist' },
    { title: 'Lab Technician', type: 'laboratory', path: '/employee-management/lab-technician' },
    { title: 'FrontDesk', type: 'frontDesk', path: '/employee-management/frontdesk' },
    { title: 'Security', type: 'security', path: '/employee-management/security' },
    { title: 'OtherStaff', type: 'otherStaff', path: '/employee-management/otherstaff' },
    { title: 'Administrator', type: 'admin', path: '/employee-management/admin' },
  ]

  return (
    <CContainer>
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
                  icon={iconMap[emp.type]}
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
