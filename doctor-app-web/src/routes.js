import React from 'react'
// import Login from './views/pages/login/Login'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Appointments = React.lazy(() => import('./Screens/Appointments/Appointments'))

const Login = React.lazy(() => import('./views/pages/login/Login'))

const routes = [
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/appointments', name: 'Appointments', element: Appointments },
]

export default routes
