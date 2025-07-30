import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilCalendar,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDrop,
  cilHealing,
  cilLightbulb,
  cilMedicalCross,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSettings,
  cilSpeedometer,
  cilStar,
  cilWallet,
  // cilHelpCircle ,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'
import appointmentIcon from './assets/images/avatars/calendar.png'

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
    to: '/appointment-management',
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    to: '/doctor',
    name: 'Doctors',
    icon: <CIcon icon={cilMedicalCross} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    to: '/doctor-notifications',
    name: 'Doctor Notifications',
    icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    to: '/disease',
    name: 'Disease-Management',
    icon: <CIcon icon={cilHealing} customClassName="nav-icon" />,
  },

  {
    // {
    component: CNavItem,
    to: '/service-Management',
    name: 'Sub-Service Management',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
  },
  // {
  //   component: CNavItem,
  //   to: '/patients',
  //   name: 'Patients',
  //   // icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,

  // },
  {
    component: CNavItem,
    to: '/reportManagement',
    name: 'Reports',
    icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    to: '/payouts',
    name: 'Payouts',
    icon: <CIcon icon={cilWallet} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    to: '/help',
    name: 'Help',
    icon: <CIcon icon={cilLightbulb} customClassName="nav-icon" />,
  },
  // {
  //   component: CNavItem,
  //   to: '/logout',
  //   name: 'Logout',
  //   // icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,

  // },
]

export default _nav
