import axios from 'axios'

const ipUrl = '52.66.144.177:9090'
export const BASE_URL = `http://${ipUrl}`
export const CLINIC_ADMIN_URL = `http://${ipUrl}`
export const MainAdmin_URL = `${BASE_URL}/admin`
export const Procedure_URL = `http://${ipUrl}`
export const ClinicBase_url = `${BASE_URL}/admin`
export const Booking_service_Url = `http://${ipUrl}/api`
export const SERVICE_URL = `admin/updateByServiceId`

// ─── Axios Global Interceptor (adds auth token to every request) ───────────────
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') // adjust key if different
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response interceptor to log errors globally ──────────────────────────────
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      '[API ERROR]',
      error?.config?.url,
      error?.response?.status,
      error?.response?.data
    )
    return Promise.reject(error)
  }
)

// sub-service
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
export const getAllQuestions = 'admin/clinicQuestions/getAll'
export const postAllQuestionsAndAnswers = 'admin/clinicQA/postQuestionsAndAnswer'

// Doctor Management
export const DoctorAllData = '/clinic-admin/doctors/hospitalById'
export const AddDoctor = 'clinic-admin/addDoctor'
export const UpdateDoctor = 'admin/updateDoctor'
export const deleteDoctor = 'admin/deleteDoctor'
export const GetBranches_ByClinicId = 'admin/getBranchByClinicId'
export const getDoctorsByHospitalIdAndBranchId = 'admin/getDoctorsByHospitalIdAndBranchId'

// Customer Management
export const CustomerAllData = 'admin/getAllCustomers'
export const AddCustomer = 'admin/saveBasicDetails'
export const updateCustomer = 'admin/updateCustomerBasicDetails'
export const deleteCustomer = 'admin/deleteCustomerBasicDetails'
export const getBasicDetails = 'admin/getBasicDetails'

// Subservice
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
export const getData = 'admin/NotificationToAdminForProviderReassign'
export const postData = 'admin/providerReassign'
export const GetBy_DoctorId = 'admin/getDoctorById'
export const getAllBookedServices = 'admin/getAllBookedServices'
export const DeleteBookings = 'admin/deleteServiceByBookedId'

// Service management
export const getServiceByCategory = 'admin/getServiceById'
export const deleteService = 'admin/deleteService'

// Category Advertisement
export const getAllCategoryAdvertisement = 'admin/categoryAdvertisement/getAll'
export const AddCategoryAdvertisement = 'admin/categoryAdvertisement/add'
export const deleteCategoryAdvertisement = 'admin/categoryAdvertisement/deleteByCarouselId'

// Service Advertisement
export const getAllServiceAdvertisement = 'admin/ServiceAdvertisement/getAll'
export const AddServiceAdvertisement = 'admin/ServiceAdvertisement/add'
export const deleteServiceAdvertisement = 'admin/ServiceAdvertisement/deleteByCarouselId'

export const doctorAvailableUrl = 'doctorId'
export const getAllDoctors = `doctors`
export const getDoctorByClinicId = 'doctors/hospitalById'

// Opt Sub Service
export const subservice = 'getSubServicesByServiceId'
export const getSubServicesbyserviceId = 'serviceId'
export const getadminSubServicesbyserviceId = `admin/getSubServicesByServiceId`
export const getSubServiceBySubServiceId = `admin/getSubServiceBySubServiceId`
export const getservice = 'admin/getServiceById'
export const addDoctorUrl = `admin/addDoctor`
export const AddSubService = 'admin/addSubService'
export const getService_ByClinicId = 'admin/getSubServiceByHospitalId'
export const service = 'admin/getAllSubServices'
export const deleteSubService = 'admin/deleteSubService'

// Branch CRUD
export const createBranch = 'admin/createBranch'
export const deleteBranch = 'admin/deleteBranch'
export const getBranchByClinicId = 'admin/getBranchByClinicId'
export const getBranchById = 'admin/getBranchById'
export const getAllBranches = 'admin/getAllBranches'
export const updateBranches = 'admin/updateBranch'

// Procedure CRUD
export const addProcedureDetails = 'admin/addSubService'
export const deleteProcedureDetails = 'admin/deleteSubService'
export const updateProcedureDetails = 'admin/updateSubService'
export const getSubService = 'admin/getSubService'

// ─── Status API ───────────────────────────────────────────────────────────────
// These endpoints trigger backend email notifications on status change.
// If emails are not being received, the issue is in the backend email service
// (e.g. SMTP config, email template, or the endpoint not sending emails).
export const statusapi = {
  /**
   * Moves clinic to VERIFICATION_IN_PROGRESS.
   * Backend should send a "verification started" email to clinic's emailAddress.
   */
  startClinic: (id) =>
    axios.put(`${MainAdmin_URL}/start-verification/${id}`),

  /**
   * Moves clinic to VERIFIED.
   * Backend should send a "congratulations, you are verified" email.
   */
  verifyClinic: (id) =>
    axios.put(`${MainAdmin_URL}/verify/${id}`),

  /**
   * Moves clinic to REJECTED with a reason.
   * Backend should send a "your clinic was rejected" email with the reason.
   */
  rejectClinic: (id, reason) =>
    axios.put(`${MainAdmin_URL}/reject/${id}`, null, {
      params: { reason },
    }),
}