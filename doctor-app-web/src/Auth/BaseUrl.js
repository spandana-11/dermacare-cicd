export const ipUrl = 'http://13.202.16.119:9090'
export const baseUrl = `${ipUrl}/api/doctors`
//login
export const loginEndpoint = 'login'

export const doctorbaseUrl = `${ipUrl}/clinic-admin/doctor`
export const clinicbaseUrl = `${ipUrl}/admin/getClinicById`
export const todayappointmentsbaseUrl = `${ipUrl}/api/doctors/appointments/today`
export const appointmentsbaseUrl = `${ipUrl}/api/doctors/appointments/filter`
export const appointmentsCountbaseUrl = `${ipUrl}/api/doctors/appointments/completed`
export const savePrescriptionbaseUrl = `${ipUrl}/api/doctors`

export const testsbaseUrl = `${ipUrl}/clinic-admin/labtest/getAllLabTests`
export const diseasesbaseUrl = `${ipUrl}/clinic-admin/get-all-diseases`
export const treatmentsbaseUrl = `${ipUrl}/clinic-admin/treatment/getAllTreatments`

export const ratingsbaseUrl = `${ipUrl}/clinic-admin/averageRatings`

export const updateLoginEndpoint = 'update-password'
export const addDiseaseUrl = `${ipUrl}/clinic-admin`
export const getdoctorSaveDetailsEndpoint = `${ipUrl}/api/doctors/getDoctorSaveDetailsById`
export const getVisitHistoryByPatientIdAndDoctorIdEndpoint = `${ipUrl}/api/doctors/getVisitHistoryByPatientIdAndDoctorId`
