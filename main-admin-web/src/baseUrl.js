// export const BASE_URL = 'http://alb-dev-sc-197990416.ap-south-1.elb.amazonaws.com/api'
const ipUrl = ' 13.233.9.23:9090'
//const ipUrl = '13.127.106.17'

export const BASE_URL = `http://${ipUrl}`
export const CLINIC_ADMIN_URL = `http://${ipUrl}`
// export const CUSTOMER_SERVICE_URL = `http://${ipUrl}:8083/api`
export const Booking_service_Url = `http://${ipUrl}/api`

// export const BOOKING_SERVICE_URL = `http://${ipUrl}:8087/api/v1`
// export const BASE_URLS = `http://${ipUrl}:8080/api/v1`
// export const CLINIC_URL = `http://${ipUrl}:8081`
export const SERVICE_URL = `admin/updateByServiceId`

//sub-service
export const subService_URL = `http://${ipUrl}/admin`
export const ADD_SERVICE = 'addService'
export const GET_ALL_SERVICES = 'getAllServices'
export const DELETE_SERVICE_URL = `deleteService`
export const updateService = 'updateByServiceId'

export const getService = 'getServiceById'
export const Category = 'category/getServices'

// login
export const endPoint = 'admin/adminLogin'

// Category Management
export const CategoryAllData = 'admin/getCategories'

export const AddCategory = 'admin/addCategory'

export const UpdateCategory = 'admin/updateCategory'

export const deleteCategory = 'admin/deleteCategory'

// Clinic Management
export const ClinicAllData = 'admin/getAllClinics'

export const AddClinic = 'admin/CreateClinic'

export const UpdateClinic = 'admin/updateClinic'

export const DeleteClinic = 'admin/deleteClinic'

// Doctor Management
export const DoctorAllData = '/clinic-admin/doctors/hospitalById'
export const AddDoctor = 'clinic-admin/addDoctor'

export const UpdateDoctor = 'clinic-admin/updateClinic'

export const deleteDoctor = 'clinic-admin/deleteClinic'

// Customer Management
export const CustomerAllData = 'admin/getAllCustomers'

export const AddCustomer = 'admin/saveBasicDetails'

export const updateCustomer = 'admin/updateCustomerBasicDetails'

export const deleteCustomer = 'admin/deleteCustomerBasicDetails'

export const getBasicDetails = 'admin/getBasicDetails'
// export const bookServices ='customers/bookServices'
// export const deleteAppointments ='customers/deleteService'

// Service management
// export const AddService = 'services/addService'
// export const updateService = 'services/updateService'
// export const deleteService = 'services/deleteByServiceID'

//Subservice
export const getSubservices = 'admin/getAllSubServices'
export const addSubservices = 'admin/addSubService'
export const deleteSubservices = 'admin/deleteSubService'
export const updateSubservices = 'admin/updateBySubServiceId'

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

// Appointment Management
// export const getAllBookingDetails = 'admin/getAllBookingDetails'
// Reassign Appointment
export const getData = 'admin/NotificationToAdminForProviderReassign'

export const postData = 'admin/providerReassign'

// export const allBooking_sevices = getAllBookedServices
// export const GetBookingBy_ClinicId = 'customer/getAllBookedServicesByClinicId'
// export const GetBookingBy_DoctorId = 'admin/getBookingByDoctorId'
//appointments
export const GetBy_DoctorId = 'clinic-admin/doctor'
export const getAllBookedServices = 'admin/getAllBookedServices'
export const DeleteBookings = 'admin/deleteServiceByBookedId'

// Service management
// export const getService = 'admin/getAllServices'
export const getServiceByCategory = 'admin/getServiceById'
export const deleteService = 'admin/deleteService'

//categoryAdvertisement
export const getAllCategoryAdvertisement = 'admin/categoryAdvertisement/getAll'
export const AddCategoryAdvertisement = 'admin/categoryAdvertisement/add'
export const deleteCategoryAdvertisement = 'admin/categoryAdvertisement/deleteByCarouselId'

//ads service

//serviceAdvertisement
export const getAllServiceAdvertisement = 'admin/ServiceAdvertisement/getAll'
export const AddServiceAdvertisement = 'admin/ServiceAdvertisement/add'
export const deleteServiceAdvertisement = 'admin/ServiceAdvertisement/deleteByCarouselId'
