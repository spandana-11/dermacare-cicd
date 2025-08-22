export const ipUrl = 'http://13.235.239.208:9090'
export const baseUrl = `${ipUrl}/api/doctors`
//login
export const loginEndpoint = 'login'
export const adminBaseUrl = `${ipUrl}/admin`
export const doctorbaseUrl = `${ipUrl}/clinic-admin/doctor`
export const reportbaseUrl = `${ipUrl}/clinic-admin`
export const clinicbaseUrl = `${ipUrl}/admin/getClinicById`
export const todayappointmentsbaseUrl = `${ipUrl}/api/doctors/appointments/today`
export const appointmentsbaseUrl = `${ipUrl}/api/doctors/appointments/filter`
export const appointmentsCountbaseUrl = `${ipUrl}/api/doctors/appointments/completed`
export const savePrescriptionbaseUrl = `${ipUrl}/api/doctors`

export const testsbaseUrl = `${ipUrl}/clinic-admin/labtest/getAllLabTests`
export const labtestsbase = `${ipUrl}/clinic-admin/labtests`
export const diseasesbaseUrl = `${ipUrl}/clinic-admin/diseases`
export const treatmentsbaseUrl = `${ipUrl}/clinic-admin/treatment/getAllTreatments`
export const treatmentUrl=`${ipUrl}/clinic-admin/treatments`

export const ratingsbaseUrl = `${ipUrl}/clinic-admin/averageRatings`

export const updateLoginEndpoint = 'update-password'
export const addDiseaseUrl = `${ipUrl}/clinic-admin`
export const getdoctorSaveDetailsEndpoint = `${ipUrl}/api/doctors/getDoctorSaveDetailsById`
export const getVisitHistoryByPatientIdAndDoctorIdEndpoint = `${ipUrl}/api/doctors/getVisitHistoryByPatientIdAndDoctorId`

//reports
export const AllReports = `getallreports`
export const SavingReports = `savereports`
export const Get_ReportsByBookingId = `getReportByBookingId`
//doctor slots
export const getDoctorSlotsEndpoint = `${ipUrl}/clinic-admin/getDoctorslots`