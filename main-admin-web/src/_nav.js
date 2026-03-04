import React from 'react'
import CIcon from '@coreui/icons-react'
import { CNavItem } from '@coreui/react'
import {
  cilUser,
  cilHospital,
  cilList,
  cilSpa,
  cilGroup,
  cilBell,
  cilWallet,
  cilTask,
  cibGoogleAds,
  cilCalendar, cilSettings
} from '@coreui/icons'

const _nav = [
  {
    component: CNavItem,
    name: 'Clinic Management',
    to: '/Clinic-Management',
    icon: <CIcon icon={cilHospital} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Customer Management',
    to: '/Customer-Management',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Appointments',
    to: '/Verified-Clinics',
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Procedure Management',
    to: '/Procedure-Management',
    icon: <CIcon icon={cilTask} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Procedures & Packages',
    to: '/Packages-Procedures',
    icon: <CIcon icon={cilSpa} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Membership Management',
    to: '/Membership-Management',
    icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Registration Codes',
    to: '/Registration-Codes-dev',
    icon: <CIcon icon={cilList} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Ads Management',
    to: '/Ads-Management',
    icon: <CIcon icon={cibGoogleAds} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Payouts',
    to: '/Payouts',
    icon: <CIcon icon={cilWallet} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Push Notifications',
    to: '/Push-Notifications',
    icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Help',
    to: '/Help',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
  },
]

export default _nav
