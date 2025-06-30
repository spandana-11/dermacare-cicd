import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDrop,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilStar,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'
import appointmentIcon from './assets/images/avatars/calendar.png'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    // icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Appointments',
    to: '/appointment-management',
    // icon: <img src={appointmentIcon} alt="Appointment" style={{ width: '24px', height: '24px' }} />,

    //
  },

  {
    component: CNavItem,
    to: '/doctor',
    name: 'Doctors',
    // icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
  },
  {
    // {
    component: CNavItem,
    to: '/service-Management',
    name: 'Sub-Service Management',
    // icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
  },
  // {
  //   component: CNavItem,
  //   to: '/patients',
  //   name: 'Patients',
  //   // icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,

  // },
  {
    component: CNavItem,
    to: '/payouts',
    name: 'Payouts',
    // icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    to: '/reportManagement',
    name: 'Reports',
  },
  {
    component: CNavItem,
    to: '/help',
    name: 'Help',
    // icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
  },
  // {
  //   component: CNavItem,
  //   to: '/logout',
  //   name: 'Logout',
  //   // icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,

  // },
]

export default _nav
