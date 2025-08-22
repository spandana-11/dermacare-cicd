import React from 'react'
import { CContainer, CRow, CCol, CCard, CCardBody } from '@coreui/react'
import { useNavigate } from 'react-router-dom'

// Import your custom vector images (make sure these files exist in assets/images)
import doctorIcon from '../../assets/images/avatars/Doctors.png'
import nurseIcon from '../../assets/images/avatars/Nurse.png'
import laboratoryIcon from '../../assets/images/avatars/Laboratory.png'
import pharmacistIcon from '../../assets/images/avatars/Pharmacist.png'
import receptionistIcon from '../../assets/images/avatars/Receptionist.png'
import AdminIcon from '../../assets/images/avatars/Admin.png'
import FrontDeskIcon from '../../assets/images/avatars/Front_Desk.png'
import securityIcon from '../../assets/images/avatars/Security.png'
import otherStaffIcon from '../../assets/images/avatars/other_Staff.png'


const EmployeeManagement = () => {
  
  const navigate = useNavigate()

  const employees = [
    { title: 'Doctors', icon: doctorIcon, path: '/doctor' },
    { title: 'Nurses', icon: nurseIcon, path: '/nurse' },
    { title: 'Pharmacist', icon: pharmacistIcon, path: '/Pharmacist' },
    { title: 'Laboratory', icon: laboratoryIcon, path: '/Laboratory' },
    { title: 'Admin', icon: AdminIcon, path: '/Admin' },
    { title: 'Receptionists', icon: receptionistIcon, path: '/receptionist' },
    { title: 'FrontDesk', icon: FrontDeskIcon, path: '/frontDesk' },
    { title: 'Receptionists', icon: receptionistIcon, path: '/receptionist' },
    { title: 'Security', icon: securityIcon, path: '/security' },
    { title: 'OtherStaff', icon: otherStaffIcon, path: '/otherStaff' },

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
              className="text-center shadow-lg p-4 card-zoom"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(emp.path)}
            >
              <CCardBody>
                {/* Custom image instead of CoreUI icon */}
                <img
                  src={emp.icon}
                  alt={emp.title}
                  style={{ width: '100px', height: '100px', objectFit: 'contain' }}
                  className="mb-3 "
                />
                <h5>{emp.title}</h5>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>
    </CContainer>
    
  )
  
}

export default EmployeeManagement