// export const BASE_URL = 'http://alb-dev-sc-197990416.ap-south-1.elb.amazonaws.com/api'
export let wifiUrl = '13.233.9.23:9090'
// export let wifiUrl = '192.168.1.5'

export const BASE_URL = `http://${wifiUrl}/clinic-admin`
export const MainAdmin_URL = `http://${wifiUrl}/admin`
export const subService_URL = `http://${wifiUrl}/api/v1`
// END POINTS
// login
export const endPoint = '/clinicLogin'
//reports
export const AllReports = `getallreports`
export const SavingReports = `savereports`
export const Get_ReportsByBookingId = `getReportByBookingId`
//appointments
// export const allBooking_sevices = getAllBookedServices
export const DeleteBookings = `customer/deleteService`
export const GetBookingBy_ClinicId = `customer/getAllBookedServicesByClinicId`
export const GetBookingBy_DoctorId = `customer/getBookingByDoctorId`
//appointments
export const Booking_sevice = `http://${wifiUrl}/api`
export const allBooking_sevices = `getAllBookedServices`

// Appointment Management
export const getAllBookingDetails = 'admin/getAllBookingDetails'

//Doctors
export const getDoctorByClinicId = 'doctors/hospitalById'

export const getAllBookedServices = `customer/getAllBookedServices`
export const Booking_service_Url = `http://${wifiUrl}/api`
export const deleteBookings = `customer/deleteService`
export const geteBookingBy_ClinicId = `customer/getAllBookedServicesByClinicId`

export const GetBy_DoctorId = 'clinic-admin/doctor'

//Doctor Notifications
export const Doctor_Url = `http://${wifiUrl}/api`
export const getAllDCtrNotifications = 'doctors/notificationToDoctor'
export const getDoctorIdAndNotifications='doctors/hospitalById'

//notifiction Reponse
export const NoficationResponse='doctors/notificationResponse'

//Advertisement
export const addCustomerAdvertisement = 'categoryAdvertisement/add'
export const AllCustomerAdvertisements = 'categoryAdvertisement/getAll'

export const getAllDoctors = `doctors`

// Customer Management
export const CustomerAllData = 'admin/getAllCustomerDetails'
export const CustomerDataByID = 'customer/getBasicDetails'

export const updateCustomer = 'admin/updateCustomerBasicDetails'

export const CustomerAddress = 'admin/getCustomerAddresses'

export const AddAddress = 'customers/save-address'

export const UpdateAddress = 'admin/updateAddresses'

export const DeleteAddress = 'admin/deleteAddresses'

export const bookServices = 'customers/bookServices'

export const deleteAppointments = 'customers/deleteService'

// Provider Management

export const ProviderAllData = 'admin/getAllProviderDetails'

export const BasicDetails = 'admin/getCaregiverDetails'

export const updateBasic = 'admin/updateCaregiver'

export const BasicProfile = 'admin/getProviderBasicProfile'

export const UpdateBasicProfile = 'admin/updateBasicProfile'

export const qualification = 'admin/getQualificationDetails'

export const updateQualification = 'admin/updateQualification'

export const Experience = 'admin/getExperienceDetails'

export const updateExperience = 'admin/updateExperienceDetails'

export const AddExperience = 'providers/addExperienceDetails'

export const DeleteExperience = 'admin/deleteExperience'

export const courseCertification = 'admin/getCourseCertificationDetails'

export const updateCourse = 'admin/updateCourseCertification'

export const deleteCourse = 'admin/deleteCourseCertification'

export const Bank = 'admin/getBankAccountDetails'

export const updateBank = 'admin/updateBankAccount'

export const Verification = 'admin/getVerficationDetails'

export const updateVerification = 'admin/verfiyProvider'

export const getAppointments = 'admin/appointments'

//sub Service management
export const service = 'subService/getAllSubServies'
export const getservice = 'getServiceByCategoryId'
export const getService_ByClinicId = 'getSubServiceByHospitalId'

export const Category = 'getAllCategories'
//main
export const AddSubService = 'addSubService'
export const updateService = 'updateSubService'
export const deleteService = 'deleteSubService'

//opt  SUb Service
export const subservice = 'getSubServicesByServiceId'
export const getSubServicesbyserviceId = 'serviceId'
export const getadminSubServicesbyserviceId = `getSubServicesByServiceId`

// Category Management

export const CategoryAllData = 'category/getCategories'

export const AddCategory = 'category/addCategory'

export const UpdateCategory = 'category/updateCategory'

export const deleteCategory = 'category/deleteCategory'

// Reassign Appointment

export const getData = 'admin/NotificationToAdminForProviderReassign'

export const postData = 'admin/providerReassign'

// Clinic Registration

export const ClinicAllData = 'v1/clinic/getAllClinics'

export const clinicPost = 'v1/clinic/addClinic'

//payouts
export const Customer_Url = `http://${wifiUrl}/api`
export const getAllPayouts = 'payments/getallpayments'
export const addPayouts = 'payments/addpayment'
