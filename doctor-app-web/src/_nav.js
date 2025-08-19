import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilAccountLogout,
  cilSpeedometer,
  cilCommentSquare,
  cilUser,
  cilCalendar,
  cilNotes,
} from '@coreui/icons'
import { CNavItem } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'Appointments',
    to: '/appointments',
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'Doctor Template',
    to: '/doctor-template',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Profile',
    to: '/doctorprofile',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Help Centre',
    to: '/helpCentre',
    icon: <CIcon icon={cilCommentSquare} customClassName="nav-icon" />,
  },

  
]

export default _nav
