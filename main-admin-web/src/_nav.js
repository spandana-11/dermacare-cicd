import React from 'react'
import CIcon from '@coreui/icons-react'
// import {
//   cilBell,
//   cilDescription,
//   cilUser,
//   cilNotes,
//   cilPencil,
//   cilPuzzle,
//   cilApps,
//   cilLayers,
//   cilStar,
//   cilHospital,
//   cilShieldAlt,
//   cilCash,
//   cilChartLine,
//   cilSpeaker,
//   cilSettings,
// } from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'
import appointmentIcon from './assets/images/avatars/calendar.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilCalendar,
  cilUser,
  cilHospital,
  cilSettings,
  cilApps,
  cilList,
  cilTag,
  cilBell,
  // cilWalletva,
  cilWallet,
  cilChartLine,
} from '@coreui/icons'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilChartLine} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'Appointment Management',
    to: '/appointment-management',
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Customer Management',
    to: '/customer-management',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'Clinic Management ',
    to: '/clinic-Management',
    icon: <CIcon icon={cilHospital} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Category Management',
    to: '/category-management',

    icon: <CIcon icon={cilApps} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Service Management',
    to: '/service-management',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Sub Service Management',
    to: '/sub-service-management',
    icon: <CIcon icon={cilList} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    to: '/ads-management',
    name: 'Category Ads Management',
    icon: <CIcon icon={cilTag} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    to: '/ads-service-management',
    name: 'Service Ads Management',
    icon: <CIcon icon={cilTag} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    to: '/push-Notifications',
    name: 'Push Notifications',
    icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    to: '/payouts',
    name: 'Payouts',
    icon: <CIcon icon={cilWallet} customClassName="nav-icon" />,
  },
  // {
  //   component: CNavItem,
  //   to: '/Doctors-Management',
  //   name: 'Doctors Management',
  //   icon: <CIcon icon={cilPencil} customClassName="nav-icon" />,

  // },

  // {
  //   component: CNavItem,
  //   name: 'Reports',
  //   to: '/reports',
  //   icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
  // },
]

export default _nav