import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

const Doctors = React.lazy(() => import('./views/Doctors/DoctorManagement'))
const ConsentForms = React.lazy(() => import('./views/ConsentForms/ConsentForms'))
const Nurse = React.lazy(() => import('./views/EmployeeManagement/NurseManagement/Nurse'))
const Receptionist = React.lazy(() => import('./views/ReceptionistManagement/Receptionist'))
const EmployeeManagement = React.lazy(() => import('./views/EmployeeManagement/EmployeeManagement'))
const Disease = React.lazy(() => import('./views/DiseaseManagement/DiseaseManagement'))
const Tests = React.lazy(() => import('./views/TestsManagement/TestsManagement'))
const Treatments = React.lazy(() => import('./views/TreatmentsManagement/TreatmentsManagement'))
const DoctorNotofications = React.lazy(
  () => import('./views/DoctorNotifications/DoctorNotificationsManagement'),
)
const ConsentFormPage = React.lazy(() => import('./views/AppointmentManagement/ConsentForm'))

const Procedure = React.lazy(() => import('./views/ProcedureManagement/ProcedureManagement'))
// const Patients = React.lazy(() => import('./views/Patients/Patientmanagement'))
const Payouts = React.lazy(() => import('./views/Payouts/Payoutmanagement'))
const Help = React.lazy(() => import('./views/Help/Help'))
const Resetpassword = React.lazy(() => import('./views/Resetpassword'))
// const Logout = React.lazy(() => import('./views/Logout/Logout'))
const DoctorDetailspage = React.lazy(() => import('./views/Doctors/DoctorDetailspage'))

const AppointmentManagement = React.lazy(
  () => import('./views/AppointmentManagement/appointmentManagement'),
)
const AppointmentDetailsPage = React.lazy(
  () => import('./views/AppointmentManagement/AppointmentDeatils'),
)
const Reports = React.lazy(() => import('./views/Reports/reportManagement'))
const ReportsDetails = React.lazy(() => import('./views/Reports/ReportDetails'))

const CustomerViewDetails = React.lazy(
  () => import('./views/customerManagement/CustomerViewDetails'),
)
const CustomerManagement = React.lazy(() => import('./views/customerManagement/CustomerManagement'))
const LabTechnicianManagement = React.lazy(
  () => import('./views/EmployeeManagement/LabTechnicians/LabTechniciansManagement'),
)
const FrontDeskManagement = React.lazy(
  () => import('./views/EmployeeManagement/FrontDesk/FrontDeskManagement'),
)
const PharmacistManagement = React.lazy(
  () => import('./views/EmployeeManagement/Pharmacist/PharmacistManagement'),
)
const ProcedureManagement = React.lazy(
  () => import('./views/ProcedureManagement/ProcedureManagement'),
)

const RefferDoctorManagement = React.lazy(
  () => import('./views/EmployeeManagement/RefferDoctor/RefferDoctorManagement'),
)
const SecurityManagement = React.lazy(
  () => import('./views/EmployeeManagement/Security/SecurityManagement'),
)

const otherStaffManagement = React.lazy(
  () => import('./views/EmployeeManagement/OtherStaff/OtherStaffManagement'),
)

const routes = [
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  // { path: '/doctor-notifications', name: 'Doctor Notifications', element: DoctorNotofications },
  { path: '/Doctor', name: 'Doctors', element: Doctors },
  { path: '/ConsentForms', name: 'ConsentForms', element: ConsentForms },

  { path: '/Nurse', name: 'Nurse', element: Nurse },
  { path: '/refDoctor', name: 'Reffer Doctor', element: RefferDoctorManagement },
  { path: '/Security', name: 'Security', element: SecurityManagement },
  { path: '/OtherStaff', name: 'Other Staff', element: otherStaffManagement },
  { path: '/FrontDesk', name: 'Receptionist', element: FrontDeskManagement },
  {
    path: '/Lab-Technician',
    name: 'Lab Technician',
    element: LabTechnicianManagement,
  },

  {
    path: '/Pharmacist',
    name: 'pharmacist',
    element: PharmacistManagement,
  },

  { path: '/Receptionist', name: 'Receptionist', element: Receptionist },
  { path: '/Employee-management', name: 'Employee management', element: EmployeeManagement },
  { path: '/Disease', name: 'Disease-Management', element: Disease },
  { path: '/Tests', name: 'Tests', element: Tests },
  { path: '/Treatments', name: 'Treatments', element: Treatments },
  { path: '/Procedure-Management', name: 'Procedure Management', element: ProcedureManagement },
  // { path: '/patients', name: 'Patients', element: Patients },
  { path: '/payouts', name: 'Payouts', element: Payouts },
  { path: '/help', name: 'Help', element: Help },
  { path: '/reset-password', name: 'Reset-Password', element: Resetpassword },
  {
    path: '/Doctor/:id',
    name: 'DoctorDetailspage',
    element: DoctorDetailspage,
  },
  { path: '/consent-form', name: 'Consent Form', element: ConsentFormPage },

  { path: '/Appointment-Management', name: 'Appointments', element: AppointmentManagement },
  { path: '/appointmentDetails/:id', name: 'Appointment Details', element: AppointmentDetailsPage },
  { path: '/reportManagement', name: 'Reports', element: Reports },
  { path: '/reportDetails/:id', name: 'Report Details', element: ReportsDetails }, // { path: '/logout', name: 'Logout', element: Logout },
  {
    path: '/customer-management/:mobileNumber',
    name: 'Customer View Details',
    element: CustomerViewDetails,
  },
  { path: '/customer-management', name: 'Customer Management', element: CustomerManagement },
]

export default routes
