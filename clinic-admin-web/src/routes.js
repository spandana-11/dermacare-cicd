import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

const Doctors = React.lazy(() => import('./views/Doctors/DoctorManagement'))
const Disease = React.lazy(() => import('./views/DiseaseManagement/DiseaseManagement'))
const DoctorNotofications = React.lazy(
  () => import('./views/DoctorNotifications/DoctorNotificationsManagement'),
)
const Service = React.lazy(() => import('./views/serviceManagement/ServiceManagement'))
// const Patients = React.lazy(() => import('./views/Patients/Patientmanagement'))
const Payouts = React.lazy(() => import('./views/Payouts/Payoutmanagement'))
const Help = React.lazy(() => import('./views/Help/Help'))
const Resetpassword = React.lazy(() => import('./views/Resetpassword'))
// const Logout = React.lazy(() => import('./views/Logout/Logout'))
const DoctorDetailspage = React.lazy(() => import('./views/Doctors/DoctorDetailspage'))
const ServiceManagement = React.lazy(() => import('./views/serviceManagement/ServiceManagement'))

const AppointmentManagement = React.lazy(
  () => import('./views/AppointmentManagement/appointmentManagement'),
)
const AppointmentDetailsPage = React.lazy(
  () => import('./views/AppointmentManagement/AppointmentDeatils'),
)
const Reports = React.lazy(() => import('./views/Reports/reportManagement'))
const ReportsDetails = React.lazy(() => import('./views/Reports/ReportDetails'))

const routes = [
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/doctor-notifications', name: 'Doctor Notifications', element: DoctorNotofications },
  { path: '/doctor', name: 'Doctors', element: Doctors },
  { path: '/disease', name: 'Disease-Management', element: Disease },
  { path: '/service-Management', name: 'SubService Management', element: ServiceManagement },
  // { path: '/patients', name: 'Patients', element: Patients },
  { path: '/payouts', name: 'Payouts', element: Payouts },
  { path: '/help', name: 'Help', element: Help },
  { path: '/reset-password', name: 'Reset-Password', element: Resetpassword },
  { path: '/doctor/:id', name: 'DoctorDetailspage', element: DoctorDetailspage },

  { path: '/appointment-management', name: 'Appointments', element: AppointmentManagement },
  { path: '/appointmentDetails/:id', name: 'Appointment Details', element: AppointmentDetailsPage },
  { path: '/reportManagement', name: 'Reports', element: Reports },
  { path: '/reportDetails/:id', name: 'Report Details', element: ReportsDetails }, // { path: '/logout', name: 'Logout', element: Logout },
]

export default routes
