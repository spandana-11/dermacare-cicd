import { element } from 'prop-types'
import React from 'react'
// import AddDoctors from './views/clinicManagement/AddDoctors'

const Login = React.lazy(() => import('./views/pages/login/Login'))
const serviceManagement = React.lazy(() => import('./views/servicesManagement/serviceManagement'))
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const CustomerViewDetails = React.lazy(
  () => import('./views/customerManagement/CustomerViewDetails'),
)
const ClinicManagement = React.lazy(() => import('./views/clinicManagement/ClinicManagement'))
const procedureManagement = React.lazy(
  () => import('./views/ProcedureManagement/ProcedureManagement'),
)

//  ProcedureManagement
const ClinicManagementDetails = React.lazy(() => import('./views/clinicManagement/ClinicDetails'))
const Registration = React.lazy(() => import('./views/clinicManagement/ClinicAPI'))
const AddClinic = React.lazy(() => import('./views/clinicManagement/AddClinic'))

const categoryManagement = React.lazy(() => import('./views/categoryManagement/categoryManagement'))
const customerManagement = React.lazy(() => import('./views/customerManagement/CustomerManagement'))

const PatientManagement = React.lazy(() => import('./views/providerManagement/ProviderManagement'))
const PatientViewDetails = React.lazy(
  () => import('./views/providerManagement/ProviderViewDetails'),
)

const AddDoctor = React.lazy(() => import('./views/clinicManagement/AddDoctors'))
const BranchManagement=React.lazy(()=>import('./views/clinicManagement/AddBranchForm'))
const AppointmentManagement = React.lazy(
  () => import('./views/AppointmentManagement/AppointmentManagement'),
)
const AppointmentDetails = React.lazy(
  () => import('./views/AppointmentManagement/AppointmnetDetails'),
)

const ReassignAppointment = React.lazy(
  () => import('./views/ReassignAppointmnet/reassginAppointemnt'),
)
const AdsManagement = React.lazy(() => import('./views/AdsManagement/AdsManagement'))
const AdsServiceManagement = React.lazy(
  () => import('./views/AdsServiceManagement/AdsServiceManagement'),
)

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/login', name: 'Login', element: Login },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/category-management', name: 'Category Management', element: categoryManagement },
  {
    path: '/service-management',
    name: 'Service Management',
    element: serviceManagement,
  },
  {
    path: '/customer-management/:mobileNumber',
    name: 'Customer View Details',
    element: CustomerViewDetails,
  },
  { path: '/customer-management', name: 'Customer Management', element: customerManagement },
  { path: '/service-management', name: 'Service Management', element: serviceManagement },
  { path: '/procedure-management', name: 'Procedure Management', element: procedureManagement },

  { path: '/clinic-Management', name: 'Clinic Management ', element: ClinicManagement },
  { path: '/add-clinic', name: 'Add Clinic', element: AddClinic },
  {
    path: '/clinic-Management/:hospitalId',
    name: 'Clinic Details',
    element: ClinicManagementDetails,
  },

  // { path: '/add-doctor', name: 'Add Doctor', element: AddDoctors },

  { path: '/patients-management', name: 'Patient Management', element: PatientManagement },
  // { path: '/Doctors-Management', name: 'Doctor Management', element: DoctorManagement },
  {
    path: '/appointment-management',
    name: 'Appointment Management',
    element: AppointmentManagement,
  },
  {
    path: '/appointmentDetails/:id',
    name: 'Appointment Details',
    element: AppointmentDetails,
  },
  {
  path: '/branch-details/:branchId',
  name: 'Branch Details',
  element: React.lazy(() => import('./views/clinicManagement/BranchDetails')),
},
  // AppointmentDetails
  { path: '/reassign-Appointment', name: 'Reassign Appointment', element: ReassignAppointment },

  { path: '/ads-management', name: 'Ads Management', element: AdsManagement },
  { path: '/ads-service-management', name: 'Ads Management', element: AdsServiceManagement },
  { path: '/provider-management/:id', name: 'Patient View Details', element: PatientViewDetails },

  {path:'/addDoctor', name:'AddDoctor', element:AddDoctor},
  {path:'/clinicDetails', name:'ClinicDetails', element:ClinicManagementDetails},
  {path:'/branchManagement', name:'BranchManagement', element:BranchManagement},
]

export default routes
