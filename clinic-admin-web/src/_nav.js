import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilCalendar,
  cilChartPie,
  cilClipboard,
  cilCursor,
  cilDescription,
  cilDrop,
  cilHealing,
  cilLightbulb,
  cilMedicalCross,
  cilNoteAdd,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSettings,
  cilSpeedometer,
  cilStar,
  cilUser,
  cilWallet,
  cilWarning,
  // cilHelpCircle ,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'
import appointmentIcon from './assets/images/avatars/calendar.png'
import { roleMenu } from './Constant/roleMenu'
import { NavLink } from 'react-router-dom'

const allNav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    as: NavLink,
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Appointments',
    to: '/Appointment-Management',
    as: NavLink,
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    to: '/Employee-management',
    name: 'Employee management',
    as: NavLink,
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    to: '/Disease',
    name: 'Disease-Management',
    as: NavLink,
    icon: <CIcon icon={cilWarning} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    to: '/Tests',
    name: 'Tests',
    as: NavLink,
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    to: '/Treatments',
    name: 'Treatments',
    as: NavLink,
    icon: <CIcon icon={cilHealing} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    to: '/Procedure-Management',
    name: 'Procedure Management',
    as: NavLink,
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    to: '/reportManagement',
    name: 'Reports',
    as: NavLink,
    icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Customer Management',
    to: '/customer-management',
    as: NavLink,
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    to: '/consentForms',
    name: 'ConsentForms',
    as: NavLink,
    icon: <CIcon icon={cilNoteAdd} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    to: '/refDoctor',
    name: 'Reffer Doctor',
    as: NavLink,
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    to: '/payouts',
    name: 'Payouts',
    as: NavLink,
    icon: <CIcon icon={cilWallet} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    to: '/help',
    name: 'Help',
    as: NavLink,
    icon: <CIcon icon={cilLightbulb} customClassName="nav-icon" />,
  },
  // {
  //   component: CNavItem,
  //   to: '/logout',
  //   name: 'Logout',
  //   // icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,

  // },
]
// Get role from login
const role = localStorage.getItem('role')
const permissions = JSON.parse(localStorage.getItem('permissions') || '{}')

// const role = user?.role || 'receptionist'

// Only keep menus that exist in roleMenu for that role
const _nav = allNav.filter((item) => {
  return permissions[item.name] !== undefined
})

export default _nav
