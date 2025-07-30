import React, { useEffect, useState, useMemo } from 'react'
import DoctorCard from './Doctorcard'
import CIcon from '@coreui/icons-react'
import { cilUser } from '@coreui/icons'
import axios from 'axios'
import { useHospital } from '../Usecontext/HospitalContext'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import sendDermaCareOnboardingEmail from '../../Utils/Emailjs'

import {
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CButton,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CRow,
  CCol,
  CFormLabel,
  CFormCheck,
} from '@coreui/react'
import Select from 'react-select'
import {
  BASE_URL,
  // subService_URL,
  MainAdmin_URL,
  getSubServicesbyserviceId,
  getadminSubServicesbyserviceId,
  getservice,
} from '../../baseUrl'
import {
  serviceData,
  CategoryData,
  subServiceData,
  getSubServiceById,
} from '../../views/serviceManagement/ServiceManagementAPI'

const DoctorManagement = () => {
  const { doctorData, errorMessage, setDoctorData, fetchHospitalDetails, fetchDoctorDetails } =
    useHospital()

  // const [doctors, setDoctors] = useState([]);

  const [modalVisible, setModalVisible] = useState(false)
  const [newService, setNewService] = useState({
    serviceName: '',
    serviceId: '',
  })
  const [selectedServices, setSelectedServices] = useState([])
  const clearFieldError = (field) => {
    setFormErrors((prev) => {
      const updated = { ...prev }
      delete updated[field]
      return updated
    })
  }
  const [enabledTypes, setEnabledTypes] = useState({
    inClinic: false,
    online: false,
    serviceTreatment: false,
  })

  const toggleType = (key) => {
    setEnabledTypes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }
  const [form, setForm] = useState({
    doctorPicture: null, // file input or image URL
    doctorLicence: '',
    doctorMobileNumber: '',
    doctorEmail: '',
    doctorName: '',
    service: [],
    subServices: [], // Note: 'subSerives' in Java, but 'subServices' is more consistent in JS
    specialization: '',
    gender: 'Female',
    experience: '',
    qualification: '',
    availableDays: '', // array of selected days
    availableTimes: '', // array of selected time slots
    profileDescription: '',
    doctorFees: {
      inClinicFee: '',
      vedioConsultationFee: '',
    },
    focusAreas: [], // array of objects like [{label: '', value: ''}]
    languages: [],
    highlights: [],
  })

  console.log(doctorData.data)

  const [startDay, setStartDay] = useState('')
  const [endDay, setEndDay] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [category, setCategory] = useState([])
  const [service, setService] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [filteredServices, setFilteredServices] = useState([])
  const [serviceOptions, setServiceOptions] = useState([])
  const [subServiceOptions, setSubServiceOptions] = useState([]) // ✅ ARRAY

  const [selectedSubServices, setSelectedSubServices] = useState([])
  const [selectedSubService, setSelectedSubService] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showErrorMessage, setShowErrorMessage] = useState('')

  const [serviceOptionsFormatted, setServiceOptionsFormatted] = useState([]) // ✅ Add this
  const [isSubServiceComplete, setIsSubServiceComplete] = useState(true)
  const [errors, setErrors] = useState({})

  const availableDays = (value, type) => {
    if (type === 'start') {
      setStartDay(value)
      const updated = `${value} - ${endDay || ''}`.trim()
      setForm((prev) => ({ ...prev, availableDays: updated }))
    } else if (type === 'end') {
      setEndDay(value)
      const updated = `${startDay || ''} - ${value}`.trim()
      setForm((prev) => ({ ...prev, availableDays: updated }))
    }
  }

  // const serviceOptionsFormatted = serviceOptions.map((s) => ({
  //   value: s.serviceId,
  //   label: s.serviceName,
  // }))

  const handleTimeChange = (value, type) => {
    if (type === 'start') {
      setStartTime(value)
      const updated = `${value} - ${endTime || ''}`.trim()
      setForm((prev) => ({ ...prev, availableTimes: updated }))
    } else if (type === 'end') {
      setEndTime(value)
      const updated = `${startTime || ''} - ${value}`.trim()
      setForm((prev) => ({ ...prev, availableTimes: updated }))
    }
  }

  const fetchSubServices = async (serviceIds) => {
    if (!Array.isArray(serviceIds) || serviceIds.length === 0) return

    try {
      const allResponses = await Promise.all(
        serviceIds.map(async (id) => {
          const res = await subServiceData(id)
          console.log(res.data)
          return res.data || [] // Extract the "data" array directly
        }),
      )

      // Flatten all subServices from each category block
      const allSubServices = allResponses
        .flat() // flatten the top-level array
        .flatMap((block) => block.subServices || []) // extract subServices from each category

      setSubServiceOptions(allSubServices)
    } catch (error) {
      console.error('Failed to fetch subservices:', error)
      setSubServiceOptions([])
    }
  }

  const handleChanges = async (e) => {
    const { name, value } = e.target

    if (name === 'categoryId') {
      setNewService((prev) => ({
        ...prev,
        categoryId: value,
        serviceId: [],
        serviceName: [],
      }))

      try {
        const allServices = await Promise.all(
          value.map(async (catId) => {
            const res = await axios.get(`${BASE_URL}/${getservice}/${catId}`)
            return res.data?.data || []
          }),
        )

        const merged = allServices.flat()

        // Save the raw service list
        setServiceOptions(merged)

        // Save formatted list for dropdowns or selects
        const formatted = merged.map((s) => ({
          label: s.serviceName,
          value: s.serviceId,
        }))

        setServiceOptionsFormatted(formatted)
      } catch (err) {
        console.error('❌ Failed to fetch services:', err)
        setServiceOptions([])
        setServiceOptionsFormatted([])
      }
    }
  }

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const times = [
    '07:00 AM',
    '08:00 AM',
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
    '06:00 PM',
    '07:00 PM',
    '08:00 PM',
    '09:00 PM',
    '10:00 PM',
  ]

  const fetchData = async () => {
    try {
      const categoryResponse = await CategoryData()
      if (categoryResponse.data && Array.isArray(categoryResponse.data)) {
        setCategory(categoryResponse.data)
      } else {
        throw new Error('Invalid category data format')
      }

      const serviceResponse = await serviceData()
      console.log(serviceResponse.data)
      setService(serviceResponse.data)
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to fetch data. Please try again later.')
    } finally {
    }
  }
  const hospitalId = localStorage.getItem('HospitalId')

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true) // ✅ set loading true before fetch

        await fetchData()
        await serviceData()

        const data = await fetchHospitalDetails(hospitalId)

        if (data) {
          setDoctorData(data)
          setShowErrorMessage('')
        } else {
          setShowErrorMessage('Hospital data not found')
        }
      } catch (err) {
        console.error(err)
        setShowErrorMessage('Failed to fetch hospital details')
      } finally {
        setLoading(false) // ✅ always set to false at the end
      }
    }

    fetchAllData()
  }, [])

  useEffect(() => {
    const clnicId = localStorage.getItem('HospitalId')
    // fetchHospitalDetails(clnicId)

    fetchDoctorDetails(clnicId)
  }, [])

  const validateDoctorForm = () => {
    const errors = {}
    let isValid = true
    const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    if (!newService.categoryId || newService.categoryId.length === 0) {
      errors.categoryId = 'Please select at least one category.'
      isValid = false
    }

    if (!selectedServices || selectedServices.length === 0) {
      errors.serviceId = 'Please select at least one service.'
      isValid = false
    }

    if (!selectedSubService || selectedSubService.length === 0) {
      errors.subServiceName = 'Please select at least one sub service.'
      isValid = false
    }

    if (!form.doctorName.trim()) {
      errors.doctorName = 'Doctor name is required'
      isValid = false
    }

    if (!form.doctorLicence.trim()) {
      errors.doctorLicence = 'License number is required'
      isValid = false
    }

    if (!form.doctorMobileNumber || !/^[789]\d{9}$/.test(form.doctorMobileNumber)) {
      errors.doctorMobileNumber = 'Enter a valid 10-digit mobile number starting with 7, 8, or 9'
      isValid = false
    }
    if (
      !form.doctorEmail ||
      !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(form.doctorEmail)
    ) {
      errors.doctorEmail = 'Please enter a valid Email'
      isValid = false
    }

    if (!form.experience || isNaN(form.experience) || form.experience < 0) {
      errors.experience = 'Enter valid experience'
      isValid = false
    }

    if (!form.qualification.trim()) {
      errors.qualification = 'Qualification is required'
      isValid = false
    }

    if (!form.specialization.trim()) {
      errors.specialization = 'Specialization is required'
      isValid = false
    }

    if (!form.profileDescription.trim()) {
      errors.profileDescription = 'Profile description is required'
      isValid = false
    }

    if (!form.doctorFees.inClinicFee || isNaN(form.doctorFees.inClinicFee)) {
      errors.inClinicFee = 'Enter valid in-clinic fee'
      isValid = false
    }

    if (!form.doctorFees.vedioConsultationFee || isNaN(form.doctorFees.vedioConsultationFee)) {
      errors.vedioConsultationFee = 'Enter valid video consultation fee'
      isValid = false
    }

    if (!form.doctorPicture) {
      errors.doctorPicture = 'Profile picture is required'
      isValid = false
    }

    if (!form.languages || form.languages.length === 0) {
      errors.languages = 'Please add at least one language.'
      isValid = false
    }

    if (!startDay || !endDay) {
      errors.availableDays = 'Start and end days are required'
      isValid = false
    } else if (dayOrder.indexOf(startDay) > dayOrder.indexOf(endDay)) {
      errors.availableDays = 'Start day cannot be after end day'
      isValid = false
    }

    const convertTo24Hrs = (time) => {
      const [rawTime, modifier] = time.split(' ')
      let [hours, minutes] = rawTime.split(':').map(Number)
      if (modifier === 'PM' && hours !== 12) hours += 12
      if (modifier === 'AM' && hours === 12) hours = 0
      return hours * 60 + minutes
    }

    if (!startTime || !endTime) {
      errors.availableTimes = 'Start and end times are required'
      isValid = false
    } else if (convertTo24Hrs(startTime) >= convertTo24Hrs(endTime)) {
      errors.availableTimes = 'Start time must be before end time'
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  const categoryOptions = category.map((cat) => ({
    value: cat.categoryId,
    label: cat.categoryName,
  }))

  //select

  const handleSubmit = async () => {
    const isValid = validateDoctorForm()
    if (!isValid) return

    try {
      const hospitalId = localStorage.getItem('HospitalId')
      const hospitalName = localStorage.getItem('HospitalName')
      const allValidSubServiceIds = (subServiceOptions || []).map((ss) => ss.subServiceId)

      const selectedSubServiceObjects = (subServiceOptions || [])
        .filter(
          (sub) =>
            selectedSubService.includes(sub.subServiceId) &&
            allValidSubServiceIds.includes(sub.subServiceId),
        )
        .map((sub) => ({
          subServiceId: sub.subServiceId,
          subServiceName: sub.subServiceName,
        }))

      //    if (!Array.isArray(doctorData.data)) {
      //   console.error('Doctor data not loaded properly.')
      //   return
      // }
      // console.log(emailAddress)
      // console.log(contactNumber)

      // const isEmailDuplicate = doctorData.data.some(
      //   (doc) => doc.doctorMobileNumber?.toLowerCase() === form.doctorMobileNumber,
      // )
      // const isMobileDuplicate = doctorData.data.some((doc) => doc.doctorEmail === form.doctorEmail)

      // if (isEmailDuplicate || isMobileDuplicate) {
      //   setIsSubmitting(false)
      //   const newErrors = {}
      //   if (isEmailDuplicate) newErrors.emailAddress = 'Email already exists'
      //   if (isMobileDuplicate) newErrors.contactNumber = 'Mobile number already exists'
      //   setErrors((prev) => ({ ...prev, ...newErrors }))
      //   return
      // }

      // 🔍 2. Check if any doctor already has the same mobile or email
      const mobileExists = doctorData.data?.some(
        (doc) => doc.doctorMobileNumber === form.doctorMobileNumber,
      )
      const emailExists = doctorData.data?.some((doc) => doc.doctorEmail === form.doctorEmail)

      if (mobileExists) {
        toast.error('A doctor with this mobile number already exists')
        return
      }

      if (emailExists) {
        toast.error('A doctor with this email already exists')
        return
      }

      const payload = {
        hospitalId,
        doctorPicture: form.doctorPicture,
        doctorName: form.doctorName,
        doctorMobileNumber: form.doctorMobileNumber,
        doctorEmail: form.doctorEmail,
        doctorLicence: form.doctorLicence,
        category: categoryOptions
          .filter((cat) => newService.categoryId.includes(cat.value))
          .map((cat) => ({
            categoryId: cat.value,
            categoryName: cat.label,
          })),
        service: selectedServices.map((s) => ({
          serviceId: s.serviceId,
          serviceName: s.serviceName,
        })),
        subServices: selectedSubServiceObjects,
        gender: form.gender,
        experience: form.experience,
        qualification: form.qualification,
        specialization: form.specialization,
        availableDays: form.availableDays,
        availableTimes: form.availableTimes,
        profileDescription: form.profileDescription,
        focusAreas: form.focusAreas,
        languages: form.languages,
        highlights: form.highlights,
        doctorFees: {
          inClinicFee: form.doctorFees.inClinicFee,
          vedioConsultationFee: form.doctorFees.vedioConsultationFee,
        },
      }

      const response = await axios.post(`${BASE_URL}/addDoctor`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      console.log(response)

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || 'Failed to add doctor')
      } else if (response.data.status === 400 && errorMessage.includes('mobile number')) {
        toast.error(errorMessage, {
          position: 'top-right',
        })
      }
      const newDoctor = response.data.doctor ?? payload

      await fetchDoctorDetails(hospitalId)
      // ✅ Send onboarding email
      await sendDermaCareOnboardingEmail({
        name: form.doctorName,
        email: form.doctorEmail,
        password: response.data.data.temporaryPassword,
        userID: response.data.data.username,
        clinicName: hospitalName,
      })

      // ✅ Properly update doctorData state (ensures it shows without refresh)
      // setDoctorData((prev) => ({
      //   ...prev,
      //   data: [...(prev?.data ?? []), newDoctor],
      // }))

      toast.success(response.data.message || 'Doctor added successfully', {
        position: 'top-right',
      })

      // ✅ Reset form
      setForm({
        doctorPicture: null,
        doctorLicence: '',
        doctorMobileNumber: '',
        doctorEmail: '',
        doctorName: '',
        gender: '',
        experience: '',
        qualification: '',
        specialization: '',
        availableDays: '',
        availableTimes: '',
        profileDescription: '',
        focusAreas: [],
        languages: [],
        highlights: [],
        doctorFees: {
          inClinicFee: '',
          vedioConsultationFee: '',
        },
      })

      setNewService({
        serviceId: '',
        serviceName: '',
        categoryId: '',
        categoryName: '',
      })

      setSelectedSubServices([])
      setServiceOptions([])
      setSubServiceOptions([])
      setStartDay('')
      setEndDay('')
      setStartTime('')
      setEndTime('')
      setModalVisible(false)
    } catch (error) {
      const status = error?.response?.status
      const errorMessage = error?.response?.data?.message || 'Something went wrong'

      if (status === 400 && errorMessage.includes('mobile number')) {
        toast.error(errorMessage, {
          position: 'top-right',
        })
        setErrors((prev) => ({
          ...prev,
          doctorMobileNumber: errorMessage,
        }))
        setModalVisible(true) // ❌ Keep modal open so user can fix input
      } else if (status === 400 && errorMessage.includes('email')) {
        toast.error(errorMessage, {
          position: 'top-right',
        })
        setErrors((prev) => ({
          ...prev,
          doctorEmail: errorMessage,
        }))
        setModalVisible(true)
      } else {
        toast.error(errorMessage, {
          position: 'top-right',
        })
        setModalVisible(false) // ✅ Optional: Close modal on other errors
      }
    }
  }

  const ChipSection = ({ label, items, onAdd }) => {
    const [input, setInput] = useState('')

    const handleAdd = () => {
      const trimmed = input.trim()
      if (trimmed && !items.includes(trimmed)) {
        onAdd([...items, trimmed])
        setInput('')
      }
    }

    const handleRemove = (indexToRemove) => {
      const updated = items.filter((_, index) => index !== indexToRemove)
      onAdd(updated)
    }

    return (
      <div className="mb-3">
        <label className="form-label fw-semibold">{label}</label>
        <div className="d-flex mb-2">
          <input
            type="text"
            className="form-control me-2"
            placeholder={`Add ${label}`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button className="btn btn-primary" onClick={handleAdd}>
            Add
          </button>
        </div>
        <div className="d-flex flex-wrap gap-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="badge d-flex align-items-center"
              style={{ padding: '8px 12px', borderRadius: '20px' }}
            >
              <span className="me-2">{item}</span>
              <span
                style={{ cursor: 'pointer', fontSize: '10px' }}
                onClick={() => handleRemove(index)}
              >
                ❌
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  // console.log(selectedHospital)
  const checkSubServiceDetails = async (ids) => {
    let incomplete = false
    const hospitalId = localStorage.getItem('HospitalId')
    for (const id of ids) {
      const data = await getSubServiceById(hospitalId, id) // Use actual hospitalId
      if (!data || !data.price || !data.finalCost) {
        incomplete = true
        break
      }
    }

    setIsSubServiceComplete(!incomplete)
  }

  const [enableFees, setEnableFees] = useState({
    inClinic: true,
    videoConsultation: true,
  })

  return (
    <div>
      <ToastContainer />
      <div className="d-flex justify-content-end mb-3">
        <button
          className="btn btn-primary d-flex align-items-center gap-2 shadow-sm rounded-pill px-4 py-2"
          onClick={() => {
            setFormErrors({})
            setModalVisible(true)
          }}
          style={{
            background: 'linear-gradient(90deg, #0072CE 0%, #00AEEF 100%)',
            border: 'none',
            fontWeight: '600',
            fontSize: '16px',
          }}
        >
          <CIcon icon={cilUser} size="lg" />
          <span>Add Doctor</span>
        </button>
      </div>

      {loading ? (
        <div className="centered-message">
          <p>Loading doctors...</p>
        </div>
      ) : errorMessage ? (
        <div className="centered-message">
          <p>{errorMessage}</p>
        </div>
      ) : !doctorData || !doctorData.data ? null : doctorData.data.length === 0 ? ( // ✅ DON’T show "Page not found" here — just return null or loading
        <div className="centered-message">
          <span>No doctors found for this hospital.</span>{' '}
          <span
            onClick={() => {
              setFormErrors({})
              setModalVisible(true)
            }}
            style={{ fontWeight: 'bold', color: 'blue', cursor: 'pointer' }}
          >
            + Add Doctor
          </span>
        </div>
      ) : (
        doctorData.data.map((doctor, index) => <DoctorCard key={index} doctor={doctor} />)
      )}

      <CModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        size="lg"
        backdrop="static"
      >
        <CModalHeader>
          <strong>Add Doctor</strong>
        </CModalHeader>
        <CModalBody>
          <CRow className="g-4 mb-4">
            <CCol md={6}>
              <h6>
                Category Name <span className="text-danger">*</span>
              </h6>
              <Select
                isMulti
                name="categoryId"
                value={categoryOptions.filter((opt) => newService.categoryId?.includes(opt.value))}
                onChange={(selected) => {
                  handleChanges({
                    target: {
                      name: 'categoryId',
                      value: selected.map((opt) => opt.value),
                    },
                  })

                  if (selected.length > 0) {
                    setFormErrors((prev) => ({ ...prev, categoryId: '' }))
                  }
                }}
                options={categoryOptions}
                placeholder="Select Category"
              />
              {formErrors.categoryId && (
                <div className="text-danger mt-1">{formErrors.categoryId}</div>
              )}
            </CCol>

            <CCol md={6}>
              <h6>
                Service Name <span className="text-danger">*</span>
              </h6>
              <Select
                isMulti
                name="serviceId"
                value={serviceOptionsFormatted.filter((opt) =>
                  selectedServices.some((s) => s.serviceId === opt.value),
                )}
                onChange={(selected) => {
                  const selectedServiceObjects = serviceOptions.filter((s) =>
                    selected.some((sel) => sel.value === s.serviceId),
                  )
                  setSelectedServices(selectedServiceObjects)
                  fetchSubServices(selectedServiceObjects.map((s) => s.serviceId))

                  // Clear error
                  if (selectedServiceObjects.length > 0) {
                    setFormErrors((prev) => ({ ...prev, serviceId: '' }))
                  }
                }}
                options={serviceOptionsFormatted}
                placeholder="Select Services"
              />
              {formErrors.serviceId && (
                <div className="text-danger mt-1">{formErrors.serviceId}</div>
              )}
            </CCol>

            <CCol md={12}>
              <h6>
                Sub Services <span className="text-danger">*</span>
              </h6>

              <Select
                isMulti
                name="subServiceName"
                placeholder="Select Sub Services"
                options={(subServiceOptions || []).map((sub) => ({
                  label: sub.subServiceName,
                  value: sub.subServiceId,
                }))}
                value={(subServiceOptions || [])
                  .filter((opt) => selectedSubService.includes(opt.subServiceId))
                  .map((opt) => ({
                    label: opt.subServiceName,
                    value: opt.subServiceId,
                  }))}
                onChange={(selected) => {
                  setSelectedSubService(selected.map((opt) => opt.value))
                  const ids = selected.map((opt) => opt.value)
                  setSelectedSubService(ids)

                  if (selected.length > 0) {
                    setFormErrors((prev) => ({ ...prev, subServiceName: '' }))
                  }

                  // ✅ Check if selected sub-services have complete data
                  checkSubServiceDetails(ids)

                  // Clear validation error on selection
                  // if (selected.length > 0) {
                  //   setFormErrors((prev) => ({ ...prev, subServiceName: '' }))
                  // }
                }}
              />
              {!isSubServiceComplete && (
                <div className="text-danger mt-2">
                  Some selected sub-services are missing details like price or final cost.
                  <br />
                  <a href="/service-Management" className="text-primary">
                    Please add sub-service details
                  </a>
                </div>
              )}

              {formErrors.subServiceName && (
                <div className="text-danger mt-1">{formErrors.subServiceName}</div>
              )}
            </CCol>
          </CRow>

          <hr />

          <h5 className="mb-3">Doctor Details</h5>
          <CRow className="g-4 mb-4">
            <CCol md={6}>
              <CFormLabel>
                License Number
                <span className="text-danger">*</span>
              </CFormLabel>
              <CFormInput
                value={form.doctorLicence}
                onChange={(e) => {
                  const value = e.target.value
                  setForm((prev) => ({ ...prev, doctorLicence: value }))

                  if (value.trim()) {
                    setFormErrors((prev) => {
                      const updated = { ...prev }
                      delete updated.doctorLicence
                      return updated
                    })
                  }
                }}
                invalid={!!formErrors?.doctorLicence} // CoreUI validation styling
              />
              {formErrors?.doctorLicence && (
                <small className="text-danger">{formErrors.doctorLicence}</small>
              )}
            </CCol>
            <CCol md={6}>
              <CFormLabel>
                Doctor Name
                <span className="text-danger">*</span>
              </CFormLabel>
              <div className="input-group">
                <CFormInput
                  value={form.doctorName}
                  onChange={(e) => {
                    let name = e.target.value
                    // Remove digits
                    name = name.replace(/[0-9]/g, '')
                    const withPrefix = name.startsWith('Dr.') ? name : `Dr. ${name}`
                    setForm((prev) => ({ ...prev, doctorName: withPrefix }))
                    //Clear error if valid
                    if (withPrefix.length > 3) {
                      setFormErrors((prev) => ({ ...prev, doctorName: '' }))
                    }
                  }}
                  invalid={!!formErrors.doctorName}
                />
              </div>
              {formErrors.doctorName && (
                <div className="text-danger mt-1">{formErrors.doctorName}</div>
              )}
            </CCol>
            <CCol md={6}>
              <CFormLabel>Gender</CFormLabel>
              <CFormSelect
                value={form.gender}
                onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
              >
                <option value="">Select Gender</option> {/* Add this line */}
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </CFormSelect>
            </CCol>
            <CCol md={6}>
              <CFormLabel>
                Experience (years)
                <span className="text-danger">*</span>
              </CFormLabel>
              <CFormInput
                type="number"
                value={form.experience}
                onChange={(e) => {
                  const value = e.target.value
                  setForm((p) => ({ ...p, experience: value }))

                  // Clear error if value is a valid number >= 0
                  if (!isNaN(value) && Number(value) >= 0) {
                    setFormErrors((prev) => ({ ...prev, experience: '' }))
                  }
                }}
                invalid={!!formErrors.experience}
              />
              {formErrors.experience && (
                <div className="text-danger mt-1">{formErrors.experience}</div>
              )}
            </CCol>
            <CCol md={6}>
              <CFormLabel>
                Qualification
                <span className="text-danger">*</span>
              </CFormLabel>
              <CFormInput
                value={form.qualification}
                onChange={(e) => {
                  const value = e.target.value.replace(/[0-9]/g, '') // remove numbers
                  setForm((p) => ({ ...p, qualification: value }))
                  setFormErrors((prev) => ({
                    ...prev,
                    qualification: value.trim() ? '' : 'Qualification is required',
                  }))
                }}
                invalid={!!formErrors.qualification}
              />

              {formErrors.qualification && (
                <div className="text-danger mt-1">{formErrors.qualification}</div>
              )}
            </CCol>
            <CCol md={6}>
              <CFormLabel>
                Specialization
                <span className="text-danger">*</span>
              </CFormLabel>
              <CFormInput
                value={form.specialization}
                onChange={(e) => {
                  const value = e.target.value.replace(/[0-9]/g, '') // remove numbers
                  setForm((p) => ({ ...p, specialization: value }))
                  setFormErrors((prev) => ({
                    ...prev,
                    specialization: value.trim() ? '' : 'Specialization is required',
                  }))
                }}
                invalid={!!formErrors.specialization}
              />

              {formErrors.specialization && (
                <div className="text-danger mt-1">{formErrors.specialization}</div>
              )}
            </CCol>
            <CCol md={6}>
              <CFormLabel>
                Profile Description
                <span className="text-danger">*</span>
              </CFormLabel>
              <CFormTextarea
                value={form.profileDescription}
                onChange={(e) => {
                  const value = e.target.value.replace(/[0-9]/g, '') // remove numbers
                  setForm((p) => ({ ...p, profileDescription: value }))
                  setFormErrors((prev) => ({
                    ...prev,
                    profileDescription: value.trim() ? '' : 'Profile description is required',
                  }))
                }}
                invalid={!!formErrors.profileDescription}
                rows={4}
              />

              {formErrors.profileDescription && (
                <div className="text-danger mt-1">{formErrors.profileDescription}</div>
              )}
            </CCol>
            <CCol md={6}>
              <CFormLabel>
                Profile Picture
                <span className="text-danger">*</span>
              </CFormLabel>
              <CFormInput
                type="file"
                accept="image/jpeg, image/png"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) {
                    // ✅ Only allow JPEG and PNG
                    const validTypes = ['image/jpeg', 'image/png']
                    if (!validTypes.includes(file.type)) {
                      setFormErrors((prev) => ({
                        ...prev,
                        doctorPicture: 'Only JPG and PNG images are allowed',
                      }))
                      return
                    }

                    const reader = new FileReader()
                    reader.onloadend = () => {
                      setForm((p) => ({ ...p, doctorPicture: reader.result }))
                      setFormErrors((prev) => ({
                        ...prev,
                        doctorPicture: '', // clear error
                      }))
                    }
                    reader.readAsDataURL(file)
                  } else {
                    setFormErrors((prev) => ({
                      ...prev,
                      doctorPicture: 'Profile picture is required',
                    }))
                  }
                }}
                invalid={!!formErrors.doctorPicture}
              />
              {formErrors.doctorPicture && (
                <div className="text-danger mt-1">{formErrors.doctorPicture}</div>
              )}
            </CCol>
          </CRow>

          <hr />

          <h5 className="mb-3">Working Schedule</h5>
          <CRow className="g-4 mb-4">
            <CCol md={6}>
              <CFormLabel>
                Start Day
                <span className="text-danger">*</span>
              </CFormLabel>
              <CFormSelect
                value={startDay}
                onChange={(e) => {
                  setStartDay(e.target.value)
                  availableDays(e.target.value, 'start')
                  setFormErrors((prev) => ({ ...prev, availableDays: '' })) // ✅ clear error
                }}
              >
                <option value="">Select</option>
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={6}>
              <CFormLabel>
                End Day
                <span className="text-danger">*</span>
              </CFormLabel>
              <CFormSelect
                value={endDay}
                onChange={(e) => {
                  setEndDay(e.target.value)
                  availableDays(e.target.value, 'end')
                  setFormErrors((prev) => ({ ...prev, availableDays: '' }))
                }}
              >
                <option value="">Select</option>
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </CFormSelect>
              {formErrors.availableDays && (
                <div className="text-danger">{formErrors.availableDays}</div>
              )}
            </CCol>
            <CCol md={6}>
              <CFormLabel>
                Start Time
                <span className="text-danger">*</span>
              </CFormLabel>
              <CFormSelect
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value)
                  handleTimeChange(e.target.value, 'start')
                  setFormErrors((prev) => ({ ...prev, availableTimes: '' }))
                }}
              >
                <option value="">Select</option>
                {times.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={6}>
              <CFormLabel>
                End Time
                <span className="text-danger">*</span>
              </CFormLabel>
              <CFormSelect
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value)
                  handleTimeChange(e.target.value, 'end')
                  setFormErrors((prev) => ({ ...prev, availableTimes: '' }))
                }}
              >
                <option value="">Select</option>
                {times.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            {formErrors.availableTimes && (
              <div className="text-danger">{formErrors.availableTimes}</div>
            )}
          </CRow>

          <hr />

          <CRow className="g-4 mb-4">
            <CCol xs={12}>
              <h5 className="mb-3">Consultations & Contact</h5>
            </CCol>

            {/* Row: Consultation Type (Checkboxes) */}
            <CCol xs={12}>
              <div className="d-flex align-items-center flex-wrap gap-4">
                <strong>Consultation Type:</strong>

                <CFormCheck
                  type="checkbox"
                  label="Services & Treatments"
                  checked={enabledTypes.serviceTreatment}
                  onChange={() => toggleType('serviceTreatment')}
                />
                <CFormCheck
                  type="checkbox"
                  label="In-Clinic"
                  checked={enabledTypes.inClinic}
                  onChange={() => toggleType('inClinic')}
                />
                <CFormCheck
                  type="checkbox"
                  label="Video/Online"
                  checked={enabledTypes.online}
                  onChange={() => toggleType('online')}
                />
              </div>
            </CCol>

            {/* Row: Input fields side-by-side, label below */}
            <CCol xs={12}>
              <div className="d-flex gap-4 flex-wrap">
                {/* In-Clinic Fee Input */}
                <div style={{ flex: 1 }}>
                  <CFormLabel>
                    In-Clinic Fee
                    <span className="text-danger">*</span>
                  </CFormLabel>
                  <CFormInput
                    type="number"
                    placeholder="In-Clinic Fee"
                    disabled={!enabledTypes.inClinic}
                    value={form.doctorFees.inClinicFee}
                    onChange={(e) => {
                      const value = e.target.value
                      setForm((prev) => ({
                        ...prev,
                        doctorFees: { ...prev.doctorFees, inClinicFee: value },
                      }))
                      if (value && !isNaN(value) && Number(value) > 0) {
                        setFormErrors((prev) => ({ ...prev, inClinicFee: '' }))
                      }
                    }}
                  />

                  {formErrors.inClinicFee && (
                    <div className="text-danger">{formErrors.inClinicFee}</div>
                  )}
                </div>

                {/* Video/Online Fee Input */}
                <div style={{ flex: 1 }}>
                  <CFormLabel>
                    Online Fee
                    <span className="text-danger">*</span>
                  </CFormLabel>
                  <CFormInput
                    type="number"
                    placeholder="Video/Online Fee"
                    disabled={!enabledTypes.online}
                    value={form.doctorFees.vedioConsultationFee}
                    onChange={(e) => {
                      const value = e.target.value
                      setForm((prev) => ({
                        ...prev,
                        doctorFees: {
                          ...prev.doctorFees,
                          vedioConsultationFee: value,
                        },
                      }))
                      if (value && !isNaN(value) && Number(value) > 0) {
                        setFormErrors((prev) => ({
                          ...prev,
                          vedioConsultationFee: '',
                        }))
                      }
                    }}
                  />
                  {formErrors.vedioConsultationFee && (
                    <div className="text-danger">{formErrors.vedioConsultationFee}</div>
                  )}
                </div>
              </div>
            </CCol>

            {/* Mobile Number */}
            <CCol md={6}>
              <CFormLabel>
                Contact Number
                <span className="text-danger">*</span>
              </CFormLabel>
              <CFormInput
                type="tel"
                maxLength={10}
                value={form.doctorMobileNumber}
                onChange={(e) => {
                  const value = e.target.value
                  if (/^\d{0,10}$/.test(value)) {
                    setForm((prev) => ({ ...prev, doctorMobileNumber: value }))
                    if (/^\d{10}$/.test(value)) {
                      setFormErrors((prev) => ({ ...prev, doctorMobileNumber: '' }))
                    }
                  }
                }}
                placeholder="Enter 10-digit number"
              />
              {formErrors.doctorMobileNumber && (
                <div className="text-danger">{formErrors.doctorMobileNumber}</div>
              )}
            </CCol>
            <CCol md={6}>
              <CFormLabel>
                Email Address
                <span className="text-danger">*</span>
              </CFormLabel>
              <CFormInput
                type="email"
                value={form.doctorEmail}
                onChange={(e) => {
                  const value = e.target.value
                  setForm((prev) => ({ ...prev, doctorEmail: value }))

                  // Email validation
                  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                  if (emailPattern.test(value)) {
                    setFormErrors((prev) => ({ ...prev, doctorEmail: '' }))
                  } else {
                    setFormErrors((prev) => ({
                      ...prev,
                      doctorEmail: 'Enter a valid email address',
                    }))
                  }
                }}
                placeholder="Enter doctor email"
                invalid={!!formErrors.doctorEmail}
              />
              {formErrors.doctorEmail && (
                <div className="text-danger">{formErrors.doctorEmail}</div>
              )}
            </CCol>
          </CRow>

          <hr />

          <h5 className="mb-3">Additional Details</h5>
          <ChipSection
            label="Area of Expertise"
            items={form.focusAreas}
            onAdd={(items) => setForm((prev) => ({ ...prev, focusAreas: items }))}
          />
          <div className="mb-3">
            <label className="form-label label-required">Languages Known</label>
            <ChipSection
              items={form.languages}
              onAdd={(items) => {
                setForm((prev) => ({ ...prev, languages: items }))
                if (items.length > 0) {
                  setFormErrors((prev) => ({ ...prev, languages: '' }))
                }
              }}
            />

            {formErrors.languages && <div className="text-danger mt-1">{formErrors.languages}</div>}
          </div>

          <ChipSection
            label="Achievements / Awards"
            items={form.highlights}
            onAdd={(items) => setForm((prev) => ({ ...prev, highlights: items }))}
          />
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleSubmit}>
            Submit
          </CButton>
        </CModalFooter>
      </CModal>

      <style>{`
        .add-doctor-wrapper {
          position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
        }

        .add-doctor-btn {
          display: flex;
          align-items: center;
          background-color: #fff;
          border: 1px solid #00aaff;
          border-radius: 8px;
          padding: 8px 16px;
          color: #00aaff;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .add-doctor-btn:hover {
          background-color: #e0f7ff;
        }

        .add-icon-circle {
          width: 40px;
          height: 40px;
          min-width: 40px;
          min-height: 40px;
          background-color: #e6f7ff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 10px;
          border: 1px solid #00aaff;
        }

        .add-doctor-text {
          color: #00aaff;
        }
          .badge {
  background-color: #e2e3e5;
  color: #000;
}
  .centered-message {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh; // Adjust based on your layout
  text-align: center;
  font-size: 1.2rem;
  color:"blue"
}
.label-required::after {
    content:"*";
    color: red;
   
  }

      `}</style>
    </div>
  )
}

export default DoctorManagement
