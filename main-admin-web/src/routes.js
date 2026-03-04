import { element } from 'prop-types'
import React from 'react'
import Payouts from './views/Payouts/Payout'

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
const ClinicManagementDetails = React.lazy(() => import('./views/clinicManagement/ClinicDetails'))
const Registration = React.lazy(() => import('./views/clinicManagement/ClinicAPI'))
const AddClinic = React.lazy(() => import('./views/clinicManagement/AddClinic'))
const categoryManagement = React.lazy(() => import('./views/categoryManagement/categoryManagement'))
const customerManagement = React.lazy(() => import('./views/customerManagement/CustomerManagement'))
const PatientManagement = React.lazy(() => import('./views/providerManagement/ProviderManagement'))
const PatientViewDetails = React.lazy(
  () => import('./views/providerManagement/ProviderViewDetails'),
)
const BranchManagement = React.lazy(() => import('./views/clinicManagement/AddBranchForm'))
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
const DoctorDetailsPage = React.lazy(() => import('./views/Doctors/DoctorDetailsPage'))

// ✅ Employee Management routes
const EmployeeManagement = React.lazy(() => import('./views/EmployeeManagement/EmployeeManagement'))
// const DoctorManagement = React.lazy(() => import('./views/EmployeeManagement/DoctorManagement'))
const NurseManagement = React.lazy(() => import('./views/EmployeeManagement/NurseManagement/Nurse'))
const PharmacistManagement = React.lazy(
  () => import('./views/EmployeeManagement/Pharmacist/PharmacistManagement'),
)
const LabTechnicianManagement = React.lazy(
  () => import('./views/EmployeeManagement/LabTechnicians/LabTechniciansManagement'),
)
const FrontDeskManagement = React.lazy(
  () => import('./views/EmployeeManagement/FrontDesk/FrontDeskManagement'),
)
const SecurityManagement = React.lazy(() => import('./views/EmployeeManagement/Security/SecurityManagement'))
const OtherStaffManagement = React.lazy(
  () => import('./views/EmployeeManagement/OtherStaff/OtherStaffManagement'),
)
const AdminManagement = React.lazy(() => import('./views/EmployeeManagement/Administrator/AdminManagement'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/login', name: 'Login', element: Login },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/category-management', name: 'Category Management', element: categoryManagement },
  { path: '/service-management', name: 'Service Management', element: serviceManagement },
  {
    path: '/customer-management/:mobileNumber',
    name: 'Customer View Details',
    element: CustomerViewDetails,
  },
  { path: '/customer-management', name: 'Customer Management', element: customerManagement },
  { path: '/procedure-management', name: 'Procedure Management', element: procedureManagement },
  { path: '/clinic-Management', name: 'Clinic Management', element: ClinicManagement },
  { path: '/add-clinic', name: 'Add Clinic', element: AddClinic },
  { path: '/doctor/:doctorId', name: 'Doctor Details', element: DoctorDetailsPage },
  { path: '/patients-management', name: 'Patient Management', element: PatientManagement },
  { path: '/appointment-management', name: 'Appointment Management', element: AppointmentManagement },
  { path: '/appointmentDetails/:id', name: 'Appointment Details', element: AppointmentDetails },
  { path: '/clinic-Management/:hospitalId', name: 'Clinic Details', element: ClinicManagementDetails },
  {
    path: '/branch-details/:branchId',
    name: 'Branch Details',
    element: React.lazy(() => import('./views/clinicManagement/BranchDetails')),
  },
  { path: '/reassign-Appointment', name: 'Reassign Appointment', element: ReassignAppointment },
  { path: '/ads-management', name: 'Ads Management', element: AdsManagement },
  { path: '/payouts', name: 'Payouts', element: Payouts },
  { path: '/ads-service-management', name: 'Ads Service Management', element: AdsServiceManagement },
  { path: '/provider-management/:id', name: 'Patient View Details', element: PatientViewDetails },
  { path: '/clinicDetails', name: 'ClinicDetails', element: ClinicManagementDetails },
  { path: '/branchManagement', name: 'BranchManagement', element: BranchManagement },

  // ✅ Employee Management Section
  { path: '/employee-management', name: 'Employee Management', element: EmployeeManagement },
  // { path: '/employee-management/doctor', name: 'Doctor Management', element: DoctorManagement },
  { path: '/employee-management/nurse', name: 'Nurse Management', element: NurseManagement },
  
  {
    path: '/employee-management/pharmacist',
    name: 'Pharmacist Management',
    element: PharmacistManagement,
  },
  {
    path: '/employee-management/lab-technician',
    name: 'Lab Technician Management',
    element: LabTechnicianManagement,
  },
  {
    path: '/employee-management/frontdesk',
    name: 'Front Desk Management',
    element: FrontDeskManagement,
  },
  { path: '/employee-management/security', name: 'Security Management', element: SecurityManagement },
  {
    path: '/employee-management/otherstaff',
    name: 'Other Staff Management',
    element: OtherStaffManagement,
  },
  { path: '/employee-management/admin', name: 'Administrator Management', element: AdminManagement },
]

export default routes
