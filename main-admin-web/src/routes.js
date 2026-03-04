import { element } from 'prop-types'
import React from 'react'
import Package_ProcedureManagement_Tabs from './views/Package_ProcedureManagement/Package_ProcedureManagement_Tabs'
import VerifiedClinic_getDetails from './views/Appointments/VerifiedClinic_getDetails'
import Appointments_Tabs from './views/Appointments/Appointments_Tabs'
import AppointmentDetails from './views/Appointments/AppointmentDetails'

// Lazy-loaded components
const Login = React.lazy(() => import('./views/pages/login/Login'))
const serviceManagement = React.lazy(() => import('./views/servicesManagement/serviceManagement'))
const CustomerViewDetails = React.lazy(() => import('./views/customerManagement/CustomerViewDetails'))
const ClinicManagement = React.lazy(() => import('./views/clinicManagement/GlowKartClinics'))
const procedureManagement = React.lazy(() => import('./views/ProcedureManagement/ProcedureManagement'))
// const ClinicManagementDetails = React.lazy(() => import('./views/clinicManagement/ClinicDetails'))
// const AddClinic = React.lazy(() => import('./views/clinicManagement/AddClinic'))
const ClinicRegistration = React.lazy(() => import('./views/clinicManagement/GlowKartClinicRegistration'))
const categoryManagement = React.lazy(() => import('./views/categoryManagement/categoryManagement'))
const customerManagement = React.lazy(() => import('./views/customerManagement/CustomerManagement'))
const PatientManagement = React.lazy(() => import('./views/providerManagement/ProviderManagement'))
const PatientViewDetails = React.lazy(() => import('./views/providerManagement/ProviderViewDetails'))
// const BranchManagement = React.lazy(() => import('./views/clinicManagement/AddBranchForm'))
const AdsManagement = React.lazy(() => import('./views/AdsManagement/AdsManagement'))

const MembershipTable = React.lazy(() => import('./views/MembershipManagement/ReferralDashboard'))
const Clinic_getDetails = React.lazy(() => import('./views/Package_ProcedureManagement/Clinic_getDetails'))
const PayoutManagement = React.lazy(() => import('./views/Payouts/Payoutmanagement'))
const FCMNotification = React.lazy(() => import('./views/PushNotification/PushNotificationScreen'))
const RegistrationCodeManagement = React.lazy(() => import('./views/RegistrationCodes/RegistrationCodes'))
const RegistrationCodeManagementDev = React.lazy(() => import('./views/RegistrationCodes/RegistrationCodesDev'))
// const CustomerViewDetailsProd=React.lazy(()=>import('./views/customerManagement/CustomerViewDetailsProd'))


const ClinicManagementDetails = React.lazy(() => import('./views/clinicManagement/GlowKartClinicDetails'))
const Help = React.lazy(() => import('./views/Help/Help'))
const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/Login', name: 'Login', element: Login },
  { path: '/Category-Management', name: 'Category Management', element: categoryManagement },
  { path: '/Service-Management', name: 'Service Management', element: serviceManagement },
  { path: '/Customer-Management/:mobileNumber', name: 'Customer View Details', element: CustomerViewDetails },
  { path: '/Customer-Management', name: 'Customer Management', element: customerManagement },
  // { path: '/Customer-ManagementProd/:mobileNumber', name: 'Customer View Details Prod', element: CustomerViewDetailsProd },


  { path: '/Procedure-Management', name: 'Procedure Management', element: procedureManagement },
  { path: '/Clinic-Management', name: 'Clinic Management', element: ClinicManagement },
  // { path: '/add-clinic', name: 'Add Clinic', element: AddClinic },
  { path: '/Clinic-Registration', name: 'Clinic Registration', element: ClinicRegistration }, // updated route
  { path: '/Clinic-Registration/:clinicId', element: ClinicRegistration },   // EDIT
  { path: '/Patients-Management', name: 'Patient Management', element: PatientManagement },
  // { path: '/clinic-management/:hospitalId', name: 'Clinic Details', element: ClinicManagementDetails },
  // { path: '/branch-details/:branchId', name: 'Branch Details', element: BranchDetails },
  { path: '/Ads-Management', name: 'Ads Management', element: AdsManagement },
  { path: '/Payouts', name: 'Payouts', element: PayoutManagement },
  { path: '/Provider-Management/:id', name: 'Patient View Details', element: PatientViewDetails },
  // { path: '/clinicDetails', name: 'ClinicDetails', element: ClinicManagementDetails },
  { path: '/Push-Notifications', name: 'FCMNotification', element: FCMNotification },
  { path: '/Membership-Management', name: 'Membership Management', element: MembershipTable },
  { path: '/Packages-Procedures', name: 'Procedures & Package Management', element: Clinic_getDetails },
  { path: '/Registration-Codes-dev', name: 'Registration Codes ', element: RegistrationCodeManagementDev },
  { path: '/Registration-Codes', name: 'Registration Codes ', element: RegistrationCodeManagement },
  { path: '/Clinic-Details/:clinicId', name: 'Clinic Details', element: ClinicManagementDetails },
  { path: "/Package_ProcedureManagement_Tabs/:clinicId", name: 'Package_ProcedureManagement_Tabs', element: Package_ProcedureManagement_Tabs },
  { path: '/Verified-Clinics', name: 'Verified Clinics', element: VerifiedClinic_getDetails },
  { path: "/Appointments_Tabs/:bookingId", name: 'Appointments_Tabs_Tabs', element: Appointments_Tabs },
  { path: "/appointment-details/:id", element: AppointmentDetails },
  { path: '/Help', name: 'Help', element: Help },
]

export default routes
