import axios from "axios"
const ipUrl = '52.66.144.177:9090'
export const BASE_URL = `http://${ipUrl}`
export const CLINIC_ADMIN_URL = `http://${ipUrl}`
export const MainAdmin_URL = `${BASE_URL}/admin`
export const Procedure_URL = `http://${ipUrl}`
export const ClinicBase_url = `${BASE_URL}/admin`
export const Booking_service_Url = `http://${ipUrl}/api`
export const SERVICE_URL = `admin/updateByServiceId`
export const subService_URL = `http://${ipUrl}/admin`
export const ADD_SERVICE = 'addService'
export const GET_ALL_SERVICES = 'getAllServices'
export const DELETE_SERVICE_URL = `deleteService`
export const getService = 'getServiceById'
export const Category = 'category/getServices'
export const endPoint = 'admin/adminLogin'
export const CategoryAllData = 'admin/getCategories'
export const AddCategory = 'admin/addCategory'
export const UpdateCategory = 'admin/updateCategory'
export const deleteCategory = 'admin/deleteCategory'
export const ClinicAllData = 'admin/getAllClinics'
export const AddClinic = 'admin/CreateClinic'
export const UpdateClinic = 'admin/updateClinic'
export const DeleteClinic = 'admin/deleteClinic'
export const DoctorAllData = '/clinic-admin/doctors/hospitalById'
export const AddDoctor = 'clinic-admin/addDoctor'
export const UpdateDoctor = 'admin/updateDoctor'
export const deleteDoctor = 'admin/deleteDoctor'
export const GetBranches_ByClinicId = 'admin/getBranchByClinicId'
export const getDoctorsByHospitalIdAndBranchId = 'admin/getDoctorsByHospitalIdAndBranchId'
export const AddCustomer = 'admin/saveBasicDetails'
export const updateCustomer = 'admin/updateCustomerBasicDetails'
export const getSubservices = 'admin/getAllSubServices'
export const addSubservices = 'admin/addSubService'
export const deleteSubservices = 'admin/deleteSubService'
export const updateSubservices = 'admin/updateBySubServiceId'
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
export const getData = 'admin/NotificationToAdminForProviderReassign'
export const postData = 'admin/providerReassign'
export const GetBy_DoctorId = 'admin/getDoctorById'
export const getAllBookedServices = 'admin/getAllBookedServices'
export const DeleteBookings = 'admin/deleteServiceByBookedId'
export const getServiceByCategory = 'admin/getServiceById'
export const getAllCategoryAdvertisement = 'admin/categoryAdvertisement/getAll'
export const AddCategoryAdvertisement = 'admin/categoryAdvertisement/add'
export const deleteCategoryAdvertisement = 'admin/categoryAdvertisement/deleteByCarouselId'
export const getAllServiceAdvertisement = 'admin/ServiceAdvertisement/getAll'
export const AddServiceAdvertisement = 'admin/ServiceAdvertisement/add'
export const deleteServiceAdvertisement = 'admin/ServiceAdvertisement/deleteByCarouselId'
export const doctorAvailableUrl = 'doctorId'
export const getAllDoctors = `doctors`
export const getDoctorByClinicId = 'doctors/hospitalById'
export const subservice = 'getSubServicesByServiceId'
export const getSubServicesbyserviceId = 'serviceId'
export const getadminSubServicesbyserviceId = `admin/getSubServicesByServiceId`
export const getSubServiceBySubServiceId = `admin/getSubServiceBySubServiceId`
export const getservice = 'admin/getServiceById'
export const addDoctorUrl = `admin/addDoctor`
export const getService_ByClinicId = 'admin/getSubServiceByHospitalId'
export const service = 'admin/getAllSubServices'
export const deleteSubService = 'admin/deleteSubService'
export const createBranch = 'admin/createBranch'
export const deleteBranch = 'admin/deleteBranch'
export const getBranchByClinicId = 'admin/getBranchByClinicId'
export const getBranchById = 'admin/getBranchById'
export const getAllBranches = 'admin/getAllBranches'
export const updateBranches = 'admin/updateBranch'
export const addProcedureDetails = 'admin/addSubService'
export const deleteProcedureDetails = 'admin/deleteSubService'
export const updateProcedureDetails = 'admin/updateSubService'
export const getSubService = 'admin/getSubService'




// GlowKart API's
export const BASE_URL_API = "https://glowkartapi.ashokfruit.shop/admin";
export const Production_URL_API = "https://api.ngkderma.com/admin";

export const NGkRegistrationBaseUrl='https://glowkartapi.ashokfruit.shop'
// Clinic
export const CLINIC_REGISTRATION_URL = `${BASE_URL_API}/clinics/register`;
// UPDATE CLINIC
export const updateClinic = (clinicId, payload) => {
  return axios.put(
    `${BASE_URL_API}/clinics/${clinicId}`,
    payload
  );
};

// DELETE CLINIC
export const deleteClinic = (clinicId) => {
  return axios.delete(
    `${BASE_URL_API}/clinics/${clinicId}`
  );
};

// Procedure Endpoints
export const PROCEDURE_CREATE_URL = `${BASE_URL_API}/procedures/create`;
export const PROCEDURE_GET_ALL_URL = `${BASE_URL_API}/procedures/all`;
export const PROCEDURE_GET_BY_ID_URL = (id) => `${BASE_URL_API}/procedures/get/${id}`;
export const PROCEDURE_UPDATE_URL = (id) => `${BASE_URL_API}/procedures/update/${id}`;
export const PROCEDURE_DELETE_URL = (id) => `${BASE_URL_API}/procedures/delete/${id}`;



export const AllClinicData = `${BASE_URL_API}/clinics`

export const statusapi = {
    startClinic: (id) => axios.put(`${AllClinicData}/${id}/start-verification`),
    verifyClinic: (id) => axios.put(`${AllClinicData}/${id}/verify`),
    rejectClinic: (id, reason) =>
        axios.put(`${AllClinicData}/${id}/reject`, { reason }),
};

export const NGkRegistrationLink = `${NGkRegistrationBaseUrl}/onboard/request-link`
export const getAllQuestions = '/clinicQuestions/getAll'
export const postAllQuestionsAndAnswers = '/clinicQA/postQuestionsAndAnswer'
export const REGISTRATION_CODE_GET_ALL_URL_DEV=`${BASE_URL_API}/registration/all`
export const REGISTRATION_CODE_GET_ALL_URL=`https://api.ngkderma.com/admin/api/registration/all`


export const getBasicDetails = 'customers'
export const CustomerAllData = 'customers/all'
export const deleteService = 'procedure-pricing/delete'
export const updateService = 'pricing/update'
export const AddSubService = 'pricing/create'



export const PushNotificationBaseUrl=""