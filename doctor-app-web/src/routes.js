import React from 'react'
// import Login from './views/pages/login/Login'
const DoctorProfile=React.lazy(()=>import('./views/Profile/DoctorProfile'))
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Appointments = React.lazy(() => import('./Screens/Appointments/Appointments'))
const Settings= React.lazy(()=>import('./Prescription/Settings'))
const Login = React.lazy(() => import('./views/pages/login/Login'))

const routes = [
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/appointments', name: 'Appointments', element: Appointments },
 { path:'/doctorprofile', name:'DoctorProfile', element:DoctorProfile},
// { path: '/settings', name: 'Settings', element: Settings }
]

export default routes
