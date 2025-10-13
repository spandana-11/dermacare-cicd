import React, { useState, useEffect, useCallback } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CFormCheck,
  CRow,
  CCol,
  CFormLabel,
  CFormSelect,
  CFormInput,
  CFormTextarea,
  CFormText,
  COffcanvas,
  COffcanvasHeader,
  COffcanvasTitle,
  COffcanvasBody,
  CButton,
  CCard,
  CCardBody,
  CListGroup,
  CListGroupItem,
} from '@coreui/react'

import { GetClinicBranches } from '../Doctors/DoctorAPI'
import { useNavigate } from 'react-router-dom'

// import fetchHospital from '../Usecontext/HospitalContext'

import {
  CategoryData,
  serviceData,
  subServiceData,
  getSubServiceById,
} from '../ProcedureManagement/ProcedureManagementAPI'
import { BASE_URL, wifiUrl } from '../../baseUrl'
import axios from 'axios'
import { useHospital } from '../Usecontext/HospitalContext'
// import { getInProgressBookings, getInProgressfollowupBookings } from '../../APIs/GetFollowUpApi'
import { toast } from 'react-toastify'
import BookingSearch from '../widgets/BookingSearch '
import LoadingIndicator from '../../Utils/loader'
import { postBooking } from '../../APIs/BookServiceAPi'

import { DoctorData } from '../Doctors/DoctorAPI'

const BookAppointmentModal = ({ visible, onClose }) => {
  const [visitType, setVisitType] = useState('first')
  const [appointmentType, setAppointmentType] = useState('services') // services / inclinic / online
  const [patientSearch, setPatientSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [doctorData, setDoctorData] = useState([]) // initialize as empty array
  const [slotsForSelectedDate, setSlotsForSelectedDate] = useState([])
  const [selectedSlots, setSelectedSlots] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [sloading, setSLoading] = useState(false)
  const [bookingData, setBookingData] = useState(null)
  const [loadingFee, setLoadingFee] = useState(false)
  const navigate = useNavigate()
  const [slots, setSlots] = useState([]);



  const [selectedBooking, setSelectedBooking] = useState(null)
  const [mvisible, setMVisible] = useState(false)

  const [showAllSlots, setShowAllSlots] = useState(false)
 const [subServiceInfo, setSubServiceInfo] = useState(null);
  const [selectedSubServiceInfo, setSelectedSubServiceInfo] = useState(null)

  const { fetchHospital, selectedHospital } = useHospital()

  // dropdown lists
  const [categories, setCategories] = useState([])
  const [selectedProcedure, setSelectedProcedure] = useState('')
  const [procedures, setProcedures] = useState([]) // for sub-services
  const [loading, setLoading] = useState([])

  const [services, setServices] = useState([])
  const [subServices, setSubServices] = useState([])
  const [branches, setBranches] = useState([])
  const [doctors, setDoctors] = useState([])
  const [allSlots, setAllSlots] = useState([]) // initialize as empty array
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  // selected values
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [selectedSubService, setSelectedSubService] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [consuationFee, setConsuationFee] = useState(0)
  const [servicesConsultation, setServicesConsultation] = useState(0)
  
  const type = appointmentType.trim().toLowerCase()

  const initialBookingDetails = {
  branchId: localStorage.getItem('branchId') || '',
  branchname: localStorage.getItem('branchName') || '',
  clinicId: localStorage.getItem('HospitalId') || '',
  clinicName: localStorage.getItem('HospitalName') || '',
  clinicAddress: selectedHospital.data.address,

  categoryName: '',
  categoryId: '',
  servicename: '',
  serviceId: '',
  subServiceName: '',
  subServiceId: '',

  doctorId: '',
  doctorName: '',
  doctorDeviceId: '',
  doctorRefCode: '',

  consultationType: 'Services & Treatments',
  consultationFee: '',
  consultationExpiration: selectedHospital.data.consultationExpiration,
  paymentType: '',
  visitType: 'first',
  servicecost: '',

  bookingFor: 'Self',
  name: '',
  patientAddress: '',
  patientMobileNumber: '',
  mobileNumber: '',
  age: '',
  gender: '',
  symptomsDuration: '',
  problem: '',
  

  attachments: [],
  freeFollowUps: selectedHospital.data.freeFollowUps,
  consentFormPdf: '',
  customerId: '',
  customerDeviceId: '',

  serviceDate: '',
  servicetime: '',

  address: {
    houseNo: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  },
}
const [bookingDetails, setBookingDetails] = useState(initialBookingDetails)

  const [errors, setErrors] = useState({})

  // const handlePatientFollowupSearch = async () => {
  //   if (!patientSearch.trim()) {
  //     toast.error('Please enter a valid Patient ID / Name / Mobile')
  //     alert('Please enter a valid Patient ID / Name / Mobile')
  //     return
  //   }

  //   setSLoading(true)
  //   try {
  //     const res = await getInProgressfollowupBookings(patientSearch)
  //     console.log(patientSearch)
  //     setBookingData(res.data.data || [])
  //     console.log(res.data.data)
  //   } catch (err) {
  //     console.error('Error fetching bookings:', err)
  //     setBookingData([])
  //   } finally {
  //     setSLoading(false)
  //   }
  // }

  //   const handlePatientSearch = async () => {
  //   if (!patientSearch.trim()) {
  //     toast.error('Please enter a valid Patient ID / Name / Mobile')
  //     alert('Please enter a valid Patient ID / Name / Mobile')
  //     return
  //   }

  //   setSLoading(true)
  //   try {
  //     const res = await getBookingsByPatientId(patientSearch)
  //     console.log(patientSearch)
  //     setBookingData(res.data.data || [])
  //     console.log(res.data.data)
  //   } catch (err) {
  //     console.error('Error fetching bookings:', err)
  //     setBookingData([])
  //   } finally {
  //     setSLoading(false)
  //   }
  // }

  // const handleSelectBooking = (booking) => {
  //   setSelectedBooking(booking)
  //   setMVisible(true)
  // }

  const formatDate = (date) => {
    if (!date) return null
    const d = new Date(date)
    if (isNaN(d)) return null
    return d.toISOString().split('T')[0] // 'yyyy-mm-dd'
  }
  // 'yyyy-mm-dd'

  // useEffect(() => {
  //   if (!patientSearch) return

  //   getInProgressBookings(patientSearch)
  //     .then((res) => {
  //       setBookingData(res.data.data) // ✅ because response structure has { data: [...] }
  //     })
  //     .catch((err) => {
  //       console.error('Error fetching bookings:', err)
  //     })
  //     .finally(() => setLoading(false))
  // }, [patientSearch])

  // ✅ Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await CategoryData()
        console.log('Categories API response:', res.data)

        const categoriesList = Array.isArray(res.data) ? res.data : []
        setCategories(categoriesList)
      } catch (err) {
        console.error('Error fetching categories:', err)
        setCategories([])
      }
    }

    fetchCategories()
  }, []) // fetch once on mount

  // ✅ Fetch Services when Category changes
  useEffect(() => {
    if (!selectedCategory) {
      setServices([])
      setSelectedService('')
      setSubServices([])
      setSelectedSubService('')
      return
    }

    const fetchServices = async () => {
      try {
        const res = await serviceData(selectedCategory)
        console.log('Services API response for category:', selectedCategory, res.data)

        const servicesList = Array.isArray(res.data) ? res.data : []
        setServices(servicesList)

        // Reset downstream selections
        setSelectedService('')
        setSubServices([])
        setSelectedSubService('')
      } catch (err) {
        console.error('Error fetching services:', err)
        setServices([])
        setSubServices([])
        setSelectedService('')
        setSelectedSubService('')
      }
    }

    fetchServices()
  }, [selectedCategory])
  // ✅ Fetch SubServices when Service changes




   useEffect(() => {
    console.log('useEffect triggered with service ID:', selectedService)

    if (!selectedService) {
      setSubServices([])
      setSelectedSubService('')
      return
    }

    const fetchSubServices = async () => {
      try {
        const res = await subServiceData(selectedService)
        console.log('API response for service ID:', selectedService, res.data)

        const blocks = Array.isArray(res.data) ? res.data : []
        const allSubServices = blocks.flatMap((block) => block.subServices || [])

        setSubServices(allSubServices)
        setSelectedSubService('')
      } catch (err) {
        console.error('Error fetching sub-services:', err)
        setSubServices([])
        setSelectedSubService('')
      }
    }

    fetchSubServices()
  }, [selectedService])

  useEffect(() => {
    if (!selectedSubService) {
      setSubServices([])
      setBookingDetails((prev) => ({
        ...prev,
        // consultationFee: 0,
        discountAmount: 0,
        discountPercentage: 0,
        totalAmount: 0,
      }))
      return
    }

    const fetchSubServiceInfo = async () => {
      try {
        const clinicId = localStorage.getItem('HospitalId')

        const url = `${BASE_URL}/getSubService/${clinicId}/${selectedSubService}`
        console.log('Fetching sub-service info from URL:', url)

        const res = await axios.get(url)
        console.log('Sub-service API response:', res.data)

        // ✅ Extract first object from array
        const subServiceInfo = res.data?.data || {}
        // setSubServices(subServiceInfo)  
        setServicesConsultation(subServiceInfo.price)
        // ✅ Update booking details from API fields
        if (bookingDetails.consultationType.toLowerCase().includes('service')) {
          setBookingDetails((prev) => ({
            ...prev,
             subServiceId: subServiceInfo.subServiceId,
        subServiceName: subServiceInfo.subServiceName,
            consultationFee: subServiceInfo.consultationFee || 0,
            servicecost: subServiceInfo.price,
            discountAmount: subServiceInfo.discountedCost || 0,
            discountPercentage: subServiceInfo.discountPercentage || 0,
            totalAmount: subServiceInfo.finalCost,
          }))
        }
        // setBookingDetails((prev) => ({
        //   ...prev,
        //   servicecost: subServiceInfo.price,
        //   discountAmount: subServiceInfo.discountedCost || 0,
        //   discountPercentage: subServiceInfo.discountPercentage || 0,
        //   totalAmount: subServiceInfo.finalCost, // Adjust formula as needed
        // }))

        // Optional: store the subservice info
      } catch (err) {
        console.error('Error fetching sub-service info:', err)
        setSubServices([])
        setBookingDetails((prev) => ({
          ...prev,
          consultationFee:'',
          servicecost: '',
          discountAmount: '',
          discountPercentage: '',
          totalAmount: '',
        }))
      }
    }

    fetchSubServiceInfo()
  }, [selectedSubService], )
 

const now = new Date() // current time

  // Filter slots for selected date and remove past slots for today
  const slotsToShow = (slotsForSelectedDate || [])
    .filter(
      (s) => new Date(s.day || s.date).toDateString() === new Date(selectedDate).toDateString(),
    )
    .flatMap((s) => s.availableSlots || []) // default to [] if undefined

    .filter((slotObj) => {
      const slotDate = new Date(selectedDate)
      const [time, meridian] = slotObj.slot.split(' ') // "09:30 AM"
      let [hours, minutes] = time.split(':').map(Number)
      if (meridian === 'PM' && hours !== 12) hours += 12
      if (meridian === 'AM' && hours === 12) hours = 0
      slotDate.setHours(hours, minutes, 0, 0)

      // Only remove past slots for today
      const isToday = new Date(selectedDate).toDateString() === now.toDateString()
      if (isToday) return slotDate > now
      return true
    })

  // Sort slots by time
  const sortedSlots = slotsToShow.sort((a, b) => {
    const parseTime = (slot) => {
      const [time, meridian] = slot.slot.split(' ')
      let [hours, minutes] = time.split(':').map(Number)
      if (meridian === 'PM' && hours !== 12) hours += 12
      if (meridian === 'AM' && hours === 12) hours = 0
      return hours * 60 + minutes
    }
    return parseTime(a) - parseTime(b)
  })

  // Only show first 12 slots unless "show all" is clicked
  const visibleSlots = showAllSlots ? sortedSlots : sortedSlots.slice(0, 12)

  // ✅ Fetch Branches (when modal opens)
  useEffect(() => {
    if (!visible) return

    const fetchBranches = async () => {
      try {
        const clinicId = localStorage.getItem('HospitalId')
        const response = await GetClinicBranches(clinicId)
        const branchList = Array.isArray(response.data) ? response.data : []
        const formattedBranches = branchList.map((b) => ({
          branchId: b.branchId || b.id,
          branchName: b.branchName || b.name,
        }))
        setBranches(formattedBranches)
      } catch {
        setBranches([])
      }
    }

    fetchBranches()
  }, [visible])

  // ✅ Example: Fetch Doctors when Branch & SubService are chosen
  // ✅ Fetch Doctors when Branch & SubService are chosen

  useEffect(() => {

    fetchDoctors()
  }, [appointmentType, bookingDetails.branchId, selectedSubService])

      const fetchDoctors = async () => {
      setLoadingDoctors(true)
      try {
        let doctorsList = []

        if (appointmentType !== 'services') {
          // Use the DoctorData function
          const response = await DoctorData()
          doctorsList = Array.isArray(response.data) ? response.data : []
        } else if (
          appointmentType === 'services' &&
          bookingDetails.branchId &&
          selectedSubService
        ) {
          const clinicId = localStorage.getItem('HospitalId')
          const branchId = bookingDetails.branchId
          const subServiceId = selectedSubService
          const url = `${BASE_URL}/doctors/${clinicId}/${branchId}/${subServiceId}`
          const response = await axios.get(url)
          doctorsList = Array.isArray(response.data.data) ? response.data.data : []
        }

        setDoctors(doctorsList)
      } catch (err) {
        console.error('Error fetching doctors:', err)
        setDoctors([])
      } finally {
        setLoadingDoctors(false)
      }
    }

  const fetchSlots = async (doctorId) => {
    try {
      const hospitalId = localStorage.getItem('HospitalId')
      // const branchId = localStorage.getItem('branchId')
      // const branchId = bookingDetails.branchId

      const response = await axios.get(
        `${BASE_URL}/getDoctorSlots/${hospitalId}/${bookingDetails.branchId}/${doctorId}`,
      )

      if (response.data.success) {
        console.log('Fetched Slots Data:', response.data.data) // ✅ Check console
        setSlotsForSelectedDate(response.data.data)
      } else {
        setSlotsForSelectedDate([])
      }
    } catch (error) {
      console.error('Error fetching slots:', error)
      setSlotsForSelectedDate([])
    } finally {
      setLoadingSlots(false)
    }
  }

  // Watch for appointmentType changes and reset related fields



  // Fetch available slots for a doctor

 const handleBookingChange = (e) => {
  const { name, value } = e.target

  setBookingDetails((prev) => {
    let updatedDetails = { ...prev, [name]: value }
      if (name === 'patientMobileNumber' && value.startsWith('0')) {
    return // ignore the input
  }

    // ✅ Sync mobileNumber when patientMobileNumber changes
    if (name === 'patientMobileNumber') {
      updatedDetails.mobileNumber = value
    }

    // ✅ DOB → Age
    if (name === 'dob' && value) {
      const today = new Date()
      const dob = new Date(value)
      let age = today.getFullYear() - dob.getFullYear()
      const m = today.getMonth() - dob.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
      updatedDetails.age = age >= 1 ? age : 0
    }

    // ✅ Age → DOB
    if (name === 'age' && value) {
      const today = new Date()
      const dob = new Date()
      dob.setFullYear(today.getFullYear() - parseInt(value))
      updatedDetails.dob = dob.toISOString().split('T')[0] // YYYY-MM-DD
    }
    //  if (name === 'slot') {
    //   if (!value) {
    //     updatedErrors.slot = 'Please select a slot'
    //   } else {
    //     delete updatedErrors.slot
    //   }
    // }

    // ✅ Combine symptoms duration and unit
    if (name === 'symptomsDuration' || name === 'unit') {
  updatedDetails[name] = value
}
if (name === 'name') {
  // Remove any digits from input
  const lettersOnly = value.replace(/[0-9]/g, '')
  updatedDetails[name] = lettersOnly
}




    return updatedDetails
  })

  // ✅ Real-time validation
  setErrors((prev) => {
    const updatedErrors = { ...prev }
     if (name === 'gender') {
      if (!value) {
        updatedErrors.gender = 'Please select gender'
      } else {
        delete updatedErrors.gender
      }
    }

    // Validation rules
    switch (name) {
      case 'name':
        if (!value || value.trim() === '') updatedErrors[name] = 'Name is required'
        else delete updatedErrors[name]
        break

      case 'patientMobileNumber':
        if (!value) updatedErrors[name] = 'Mobile number is required'
        else if (!/^[6-9]\d{9}$/.test(value))
          updatedErrors[name] = 'Enter a valid 10-digit mobile number starting with 6-9'
        else delete updatedErrors[name]
        break

      case 'appointmentType':
        if (!value || value.trim() === '') {
          updatedErrors[name] = 'Please select appointment type'
        } else {
          delete updatedErrors[name] // ✅ remove error as soon as valid
        }
        break

      case 'dob':
      case 'age':
        delete updatedErrors.dob
        delete updatedErrors.age
        break

      default:
        break
    }

    return updatedErrors
  })
}
useEffect(() => {
  setBookingDetails(prev => ({
    ...prev,
    slot: '',  // reset only slot
    // consultationFee stays as is
  }))
}, [bookingDetails.doctorId])


  const handleNestedChange = (section, field, value) => {
    // Update the bookingDetails
    setBookingDetails((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))

    // Real-time validation: remove error if value is valid
    setErrors((prev) => {
      const updatedErrors = { ...prev }

      if (section === 'address') {
        if (!updatedErrors.address) return prev

        // Check postalCode specific validation
        if (field === 'postalCode') {
          if (/^\d{6}$/.test(value)) {
            delete updatedErrors.address[field]
          }
        } else {
          if (value.trim() !== '') {
            delete updatedErrors.address[field]
          }
        }

        // Remove address key if empty
        if (Object.keys(updatedErrors.address).length === 0) {
          delete updatedErrors.address
        }
      }

      return updatedErrors
    })
  }

 const validate = () => {
  const newErrors = {}

  // Visit Type
  if (!visitType) newErrors.visitType = 'Please select visit type'

  // Appointment Type (required only for first visit)
  
    // if (appointmentType)
    //   newErrors.appointmentType = 'Please select appointment type'
  

  // Contact Info (only for new patients)
 if (!selectedBooking && visitType !== 'followup') {
  const name = bookingDetails.name?.trim() || ''

  if (!name) {
    newErrors.name = 'Name is required'
  } else if (name.length < 3) {
    newErrors.name = 'Name must be at least 3 characters'
  } else if (!/^[A-Za-z\s]+$/.test(name)) {
    // Only letters and spaces
    newErrors.name = 'Name can only contain letters'
  } else {
    delete newErrors.name
  }




    if (!bookingDetails.dob) newErrors.dob = 'Date of Birth is required'

    if (!bookingDetails.gender) {
    newErrors.gender = 'Please select gender'
  }

  setErrors(newErrors)


 if (!bookingDetails.patientMobileNumber) {
  newErrors.patientMobileNumber = 'Mobile number is required'
} else if (!/^[6-9]\d{9}$/.test(bookingDetails.patientMobileNumber)) {
  newErrors.patientMobileNumber =
    'Enter a valid 10-digit mobile number starting with 6-9'
} else {
  delete newErrors.patientMobileNumber
}
  if (!bookingDetails.problem?.trim()) {
    errors.problem = 'Symptoms/Problem is required.';
  } else if (bookingDetails.problem.trim().length < 5) {
    errors.problem = 'Symptoms/Problem must be at least 5 characters.';
  }

  if (!bookingDetails.symptomsDuration) {
    errors.symptomsDuration = 'Symptoms duration is required.';
  }

  if (!bookingDetails.unit) {
    errors.unit = 'Please select a duration unit.';
  }



    // Address validations
    const addressErrors = {}
const addressFields = bookingDetails.address || {}

for (let field in addressFields) {
  if (field === 'landmark') continue  // ✅ Landmark is optional

  if (!addressFields[field] || addressFields[field].trim() === '') {
    addressErrors[field] = `${field} is required`
  } else if (field === 'postalCode' && !/^\d{6}$/.test(addressFields[field])) {
    addressErrors[field] = 'Postal code must be 6 digits'
  }
}

if (Object.keys(addressErrors).length > 0) newErrors.address = addressErrors
  }
  // Services (if service appointment)
  if (visitType !== 'followup' && appointmentType?.includes('service')) {
    if (!selectedCategory) newErrors.selectedCategory = 'Select a category'
    if (!selectedService) newErrors.selectedService = 'Select a service'
    if (!selectedSubService) newErrors.selectedSubService = 'Select a procedure'
  }

  // Branch & Doctor
  if (visitType !== 'followup') {
    if (!bookingDetails.branchId) newErrors.branchname = 'Select a branch'
    if (!bookingDetails.doctorId) newErrors.doctorName = 'Select a doctor'
  }

  // Slots
  // if (visitType !== 'followup' && selectedSlots.length === 0)
  //   newErrors.slot = 'Please select a time slot'

  // Payment
  if (visitType !== 'followup' && !bookingDetails.paymentType)
    newErrors.paymentType = 'Select payment type'

  // Symptoms (optional)
  if (
    bookingDetails.problem &&
    (bookingDetails.problem.length < 5 || bookingDetails.problem.length > 300)
  )
    newErrors.problem = 'Problem description must be 5-300 characters'

  if (
    bookingDetails.symptomsDuration &&
    (bookingDetails.symptomsDuration < 1 || bookingDetails.symptomsDuration > 365)
  )
    newErrors.symptomsDuration = 'Duration must be between 1 and 365'
    

  // Doctor Referral Code (optional)
  if (
    bookingDetails.doctorRefCode &&
    (bookingDetails.doctorRefCode.length < 4 || bookingDetails.doctorRefCode.length > 10)
  )
    newErrors.doctorRefCode = 'Referral code must be 4-10 characters'
  if (appointmentType?.toLowerCase().trim() === 'inclinic') {
  // Symptoms/Problem
  if (!bookingDetails.problem?.trim()) {
    newErrors.problem = 'Symptoms/Problem is required';
  } else if (bookingDetails.problem.trim().length < 5) {
    newErrors.problem = 'Symptoms/Problem must be at least 5 characters';
  } else {
    delete newErrors.problem;
  }

  // Symptoms Duration
  if (!bookingDetails.symptomsDuration) {
    newErrors.symptomsDuration = 'Symptoms duration is required';
  } else if (
    bookingDetails.symptomsDuration < 1 ||
    bookingDetails.symptomsDuration > 365
  ) {
    newErrors.symptomsDuration = 'Duration must be between 1 and 365';
  } else {
    delete newErrors.symptomsDuration;
  }

  // Unit
  if (!bookingDetails.unit) {
    newErrors.unit = 'Please select a duration unit';
  } else {
    delete newErrors.unit;
  }
}


  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}


  const handleAppointmentTypeChange = (type) => {
    setBookingDetails((prev) => ({
      ...prev,
      consultationType: type,
      consultationFee: type.toLowerCase().includes('service')
        ? subServiceInfo.consultationFee || 0
        : consuationFee || 0, // doctor fee for other types
    }))
  }

  const handleSubmit = async () => {
  console.log('Validating bookingDetails...', bookingDetails);

  if (!validate()) {
    toast.error('Please fix the errors before submitting.');
    return;
  }

  try {
    const combinedSymptomsDuration = `${bookingDetails.symptomsDuration} ${bookingDetails.unit}`;

    // Build payload explicitly, excluding 'slot'
    const { unit, address, slot, doctorRefCode, ...rest } = bookingDetails;

const payloadToSend = {
  ...rest,
  patientAddress: `${address.houseNo}, ${address.street}, ${address.landmark}, ${address.city}, ${address.state}, ${address.postalCode}, ${address.country}`,
  attachments: bookingDetails.attachments.map(f => f.replace(/^data:image\/\w+;base64,/, '')),
};


    console.log('Payload without slot:', payloadToSend);

    const res = await postBooking(payloadToSend);

    console.log('Booking submitted successfully:', res.data);
    toast.success('Booking submitted successfully!');
    setBookingDetails(initialBookingDetails);

    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  } catch (err) {
    console.error('Error submitting booking:', err);
    if (err.response?.data?.message) toast.error(err.response.data.message);
    else if (err.message?.includes('timeout')) toast.error('Request timed out. Please try again.');
    else toast.error('Failed to submit booking. Please try again.');
  }
};


  const handleServicesSubmit = () => {
    if (validate()) {
      console.log('Submitting Services Appointment:', bookingDetails)
      // Call your API for services appointment
    }
  }

  const handleInClinicSubmit = () => {
    if (validate()) {
      console.log('Submitting In-Clinic Appointment:', bookingDetails)
      // Call your API for in-clinic appointment
    }
  }

  const handleFollowUpSubmit = async (followupData) => {
    if (!followupData) {
      toast.error('Please select a booking before submitting!')
      return
    }

    const payload = {
      bookingId: followupData.bookingId,
      doctorId: followupData.doctorId,
      visitType: 'follow-up',
      mobileNumber: followupData.mobileNumber,
      serviceDate: selectedDate,
      servicetime: bookingDetails.servicetime,
      patientId: followupData.patientId,
      bookingFor:followupData.bookingFor,

    }

    console.log('📦 Follow-up Payload:', payload)

    try {
      const res = await postBooking(payload)
      console.log('✅ Follow-up Response:', res)
      toast.success('Follow-up booking submitted successfully!')
      onClose() // optionally close modal
    } catch (err) {
      console.error('❌ Follow-up Error:', err)
      toast.error('Failed to submit follow-up booking')
    }
  }

  useEffect(() => {
    if (selectedBooking) {
      setBookingDetails((prev) => ({
        ...prev,
        name: selectedBooking.name || '',
        patientId: selectedBooking.patientId || '',
        dob: selectedBooking.dob || '',
        age: selectedBooking.age || '',
        gender: selectedBooking.gender || '',
        patientMobileNumber: selectedBooking.mobileNumber || '',
        // followupsLeft: selectedBooking.followupsLeft || '',
        // freeFollowupsLeft: selectedBooking.freeFollowupsLeft || '',
        address: selectedBooking.patientAddress,
      }))
    }
  }, [selectedBooking, setBookingDetails])

  console.log(`appointmenttype ${appointmentType}`)
  return (
    <COffcanvas
      placement="end"
      visible={visible}
      onHide={onClose}
      className="w-50"
      backdrop="static"
    >
      <COffcanvasHeader>
        <COffcanvasTitle>📅 Book Appointment</COffcanvasTitle>
        <button className="btn-close" onClick={onClose}></button>
      </COffcanvasHeader>

      <COffcanvasBody>
        {/* SECTION: Visit Type */}
        <h5 className="mb-3 border-bottom pb-2">Visit Type</h5>
        <CRow className="mb-4">
          <CCol md={6}>
            <CFormCheck
              type="radio"
              label="First Visit"
              name="visitTypeRadio"
              value="first"
              checked={visitType === 'first'}
              onChange={() => {
                setVisitType('first')
                setBookingDetails((prev) => ({ ...prev, visitType: 'first' }))
                setSlotsForSelectedDate([]) // reset date slots

                setSelectedDate('') // reset selected date
                setSelectedSlots([])
              }}
            />
          </CCol>
          <CCol md={6}>
            <CFormCheck
              type="radio"
              label="Follow-Up"
              name="visitTypeRadio"
              value="followup"
              checked={visitType === 'followup'}
              onChange={() => {
                setVisitType('followup')
                setBookingDetails((prev) => ({ ...prev, visitType: 'followup' }))
                setSlotsForSelectedDate([]) // reset date slots

                setSelectedDate('') // reset selected date
                setSelectedSlots([])
              }}
            />
          </CCol>
        </CRow>

        {/* SECTION: Appointment Type */}
        {visitType !== 'followup' && (
          <div>
            <h5 className="mb-3 border-bottom pb-2">Appointment Type</h5>
            <CRow className="mb-4">
              <CCol md={4}>
                <CFormCheck
                  type="radio"
                  label="Services & Treatment"
                  name="appointmentTypeRadio"
                  value="services"
                  checked={appointmentType === 'services'}
                  onChange={(e) => {
                    // handleAppointmentTypeChange(e.target.value)
                    setAppointmentType('services')
                    setBookingDetails((prev) => ({
                      ...prev,
                      consultationType: 'Services & Treatments',
                    }))
                  }}
                />
              </CCol>
              <CCol md={4}>
                <CFormCheck
                  type="radio"
                  label="In-Clinic"
                  name="appointmentTypeRadio"
                  value="inclinic"
                  checked={appointmentType === 'inclinic'}
                  onChange={(e) => {
                    fetchDoctors()
                    // handleAppointmentTypeChange(e.target.value)
                    setAppointmentType('inclinic')
                    setBookingDetails((prev) => ({
                      ...prev,
                      consultationType: 'In-Clinic Consultation',
                    }))
                  }}
                />
              </CCol>
              <CCol md={4}>
                <CFormCheck
                  type="radio"
                  label="Online"
                  name="appointmentTypeRadio"
                  value="online"
                  checked={appointmentType === 'Online Consultation'}
                  onChange={(e) => {
                    // handleAppointmentTypeChange(e.target.value)
                    setAppointmentType('online')
                    setBookingDetails((prev) => ({ ...prev, consultationType: 'online' }))
                  }}
                />
              </CCol>
            </CRow>
            {errors.appointmentType && (
  <div className="text-danger mb-3">{errors.appointmentType}</div>
)}
            
          </div>
        )}

        <BookingSearch
          visitType={visitType}
          fetchSlots={fetchSlots}
          onSelectBooking={(booking) => setSelectedBooking(booking)}
        />

        <div>
          {/* 🔹 Editable form only if no patient selected */}
          {!selectedBooking && visitType !== 'followup' && (
            <div>
              <h5 className="mb-3 border-bottom pb-2">Contact Information</h5>
              <CRow className="mb-4">
                {/* Name */}
                <CCol md={6} className="mb-3">
                  <h6>
                    Name <span className="text-danger">*</span>
                  </h6>
                  <CFormInput
                    name="name"
                    value={bookingDetails.name || ''}
                    onChange={handleBookingChange}
                    minLength={3}
                    maxLength={50}
                  />
                  {errors.name && <p className="text-danger">{errors.name}</p>}
                </CCol>

                {/* DOB */}
                <CCol md={6} className="mb-3">
                  <h6>
                    Date of Birth <span className="text-danger">*</span>
                  </h6>
                  <CFormInput
                    type="date"
                    name="dob"
                    value={bookingDetails.dob || ''}
                    onChange={handleBookingChange}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {errors.dob && <p className="text-danger">{errors.dob}</p>}
                </CCol>

                {/* Age */}
                <CCol md={2} className="mb-3">
                  <h6>Age</h6>
                  <CFormInput
                    type="number"
                    name="age"
                    value={bookingDetails.age || 0}
                    disabled
                    onChange={handleBookingChange}
                    min={0}
                    max={99}
                    readOnly
                  />
                  {errors.age && <p className="text-danger">{errors.age}</p>}
                </CCol>

                {/* Gender */}
                <CCol md={4} className="mb-3">
                  <h6>
                    Gender <span className="text-danger">*</span>
                  </h6>
                  <CFormSelect
                    name="gender"
                    value={bookingDetails.gender || ''}
                    onChange={handleBookingChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </CFormSelect>
                  {errors.gender && <p className="text-danger">{errors.gender}</p>}
                </CCol>

                {/* Mobile Number */}
                <CCol md={6} className="mb-3">
                  <h6>
                    Mobile Number <span className="text-danger">*</span>
                  </h6>
                  <CFormInput
                    type="tel"
                    name="patientMobileNumber"
                    value={bookingDetails.patientMobileNumber || ''}
                    onChange={handleBookingChange}
                     maxLength={10}
                  />
                  {errors.patientMobileNumber && (
                    <p className="text-danger">{errors.patientMobileNumber}</p>
                  )}
                </CCol>

                {/* Address */}
                <CCol md={12}>
                  <h5 className="mt-3">Address</h5>
                  {Object.keys(bookingDetails.address || {})
                    .reduce((rows, field, index) => {
                      if (index % 3 === 0) rows.push([])
                      rows[rows.length - 1].push(field)
                      return rows
                    }, [])
                    .map((rowFields, rowIndex) => (
                      <CRow className="mb-3" key={rowIndex}>
                        {rowFields.map((field) => (
                          <CCol md={4} key={field}>
                            <CFormLabel className="text-capitalize">
                                 {field} {field !== 'landmark' && <span className="text-danger">*</span>}
                            </CFormLabel>
                            <CFormInput
                              type="text"
                              maxLength={field === 'postalCode' ? 6 : undefined}
                              value={bookingDetails.address[field] || ''}
                              onChange={(e) => handleNestedChange('address', field, e.target.value)}
                                 required={field !== "landmark"} // optional only for landmark
                            />
                            {errors.address?.[field] && (
                              <div className="text-danger mt-1">{errors.address[field]}</div>
                            )}
                          </CCol>
                        ))}
                      </CRow>
                    ))}
                </CCol>
              </CRow>
            </div>
          )}

          {/* 🔹 Show read-only data if patient selected */}
          {/* {selectedBooking && (
            <div>
              <h5 className="mb-3 border-bottom pb-2">Patient Information</h5>
              <p>
                <strong>Name:</strong> {bookingDetails.name}
              </p>
              <p>
                <strong>Patient ID:</strong> {bookingDetails.patientId}
              </p>
              <p>
                <strong>DOB:</strong> {bookingDetails.dob}
              </p>
              <p>
                <strong>Age:</strong> {bookingDetails.age}
              </p>
              <p>
                <strong>Gender:</strong> {bookingDetails.gender}
              </p>
              <p>
                <strong>Mobile:</strong> {bookingDetails.patientMobileNumber}
              </p>
              <p>
                <strong>Address:</strong> {selectedBooking.patientAddress}
              </p>
            </div>
          )} */}
        </div>

        {/* SECTION: Services Selection */}
        {visitType !== 'followup' && appointmentType.includes('service') && (
          <>
            <h5 className="mb-3 border-bottom pb-2">Select Service</h5>
            <CRow className="mb-4">
              <CCol md={4}>
                <h6>
                  Category Name <span className="text-danger">*</span>
                </h6>
                <CFormSelect
                  value={selectedCategory}
                  onChange={(e) => {
                    const selectedId = e.target.value
                    const selectedObj = categories.find((cat) => cat.categoryId === selectedId)

                    setSelectedCategory(selectedId)

                    setBookingDetails((prev) => ({
                      ...prev,
                      categoryId: selectedObj?.categoryId || '',
                      categoryName: selectedObj?.categoryName || '',
                    }))

                    // Remove error when selected
                    setErrors((prev) => ({ ...prev, selectedCategory: '' }))
                  }}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryName}
                    </option>
                  ))}
                </CFormSelect>

                {errors.selectedCategory && (
                  <div className="text-danger mt-1">{errors.selectedCategory}</div>
                )}
              </CCol>

              <CCol md={4}>
                <h6>
                  Service <span className="text-danger">*</span>
                </h6>
                <CFormSelect
                  value={selectedService}
                  onChange={(e) => {
                    const selectedId = e.target.value
                    const selectedObj = services.find((service) => service.serviceId === selectedId)

                    console.log('Selected service:', selectedObj)

                    setSelectedService(selectedId)

                    // ✅ Update bookingDetails for backend
                    setBookingDetails((prev) => ({
                      ...prev,
                      serviceId: selectedObj?.serviceId || '',
                      servicename: selectedObj?.serviceName || '',
                    }))

                    // ✅ Optional: clear subservices when service changes
                    setSelectedSubService('')
                    setSubServices([])
                  }}
                >
                  <option value="">Select Service</option>
                  {services.map((service) => (
                    <option key={service.serviceId} value={service.serviceId}>
                      {service.serviceName}
                    </option>
                  ))}
                </CFormSelect>

                {errors.selectedService && (
                  <div className="text-danger mt-1">{errors.selectedService}</div>
                )}
              </CCol>

              <CCol md={4}>
                <h6>
                  Procedure Name <span className="text-danger">*</span>
                </h6>
                <CFormSelect
                  value={selectedSubService}
                  onChange={(e) => {
                    const selectedId = e.target.value
                    const selectedObj = subServices.find((sub) => sub.subServiceId === selectedId)

                    setSelectedSubService(selectedId)

                    // ✅ Update bookingDetails with sub-service info
                    setBookingDetails((prev) => ({
                      ...prev,
                      subServiceId: selectedObj?.subServiceId || '',
                      subServiceName: selectedObj?.subServiceName || '',
                    }))
                  }}
                  disabled={!selectedService || !subServices || subServices.length === 0}
                >
                  <option value="">Select Sub-Service</option>
                  {subServices && subServices.length > 0 ? (
                    subServices.map((sub) => (
                      <option key={sub.subServiceId} value={sub.subServiceId}>
                        {sub.subServiceName}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No sub-services available
                    </option>
                  )}
                </CFormSelect>
              </CCol>
            </CRow>
          </>
        )}

        {/* SECTION: Patient & Booking Details */}
        {visitType !== 'followup' && (
          <div>
            <h5 className="mb-3 border-bottom pb-2">Patient & Booking Details</h5>
            <CRow className="mb-4">
              <CCol md={4}>
                <h6>
                  Branch <span className="text-danger">*</span>
                </h6>
                <CFormSelect
                  name="branchId"
                  value={bookingDetails.branchId || ''}
                  onChange={(e) => {
                    const selectedBranch = branches.find(
                      (branch) => branch.branchId === e.target.value,
                    )
                    setBookingDetails((prev) => ({
                      ...prev,
                      branchId: selectedBranch?.branchId || '',
                      branchname: selectedBranch?.branchName || '',
                    }))
                  }}
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch.branchId} value={branch.branchId}>
                      {branch.branchName}
                    </option>
                  ))}
                </CFormSelect>

                {errors.branchname && (
                  <CFormText className="text-danger">{errors.branchname}</CFormText>
                )}

                {errors.branchname && <div className="text-danger">{errors.branchname}</div>}
              </CCol>

     <CCol md={4}>
  <h6>
    Doctor Name <span className="text-danger">*</span>
  </h6>

  {loadingDoctors ? (
    <div className="text-center py-2" style={{ color: 'var(--color-black)' }}>
      Loading doctors...
    </div>
  ) : (
   <CFormSelect
  name="doctorName"
  value={bookingDetails.doctorId || ''}
  onChange={async e => {
    const selectedDoctorId = e.target.value;
    const selectedDoctor = doctors.find(d => d.doctorId === selectedDoctorId);
    if (!selectedDoctor) return;

    // Update booking details
    setBookingDetails(prev => ({
      ...prev,
      doctorId: selectedDoctor.doctorId,
      doctorName: selectedDoctor.doctorName,
      doctorDeviceId: selectedDoctor.doctorDeviceId,
      // ⚠️ Do NOT reset consultationFee / subServiceId
    }));

    // Clear previous slots if needed
    setSlots([]); // optional

    // Fetch slots for selected doctor
    setLoadingFee(true); // show loader if you use one
    try {
      await fetchSlots(selectedDoctorId);
    } catch (err) {
      console.error('Error fetching slots:', err);
    } finally {
      setLoadingFee(false);
    }
  }}
  disabled={loadingDoctors || loadingFee}
  required
>
  <option value="">Select Doctor</option>
  {doctors.map((doc) => {
    // Determine the fee to display
    let fee;

    if (bookingDetails.consultationType?.toLowerCase().includes('service') && bookingDetails.subServiceId) {
      fee = bookingDetails.consultationFee || 0; // sub-service fee
    } else {
      fee = appointmentType?.toLowerCase() === 'inclinic'
        ? doc.doctorFees.inClinicFee
        : doc.doctorFees.vedioConsultationFee; // regular fee
    }

    return (
      <option
        key={doc.doctorId}
        value={doc.doctorId}
        disabled={!doc.doctorAvailabilityStatus}
        style={{ color: doc.doctorAvailabilityStatus ? 'inherit' : '#aaa' }}
      >
        {doc.doctorName} - ₹{fee}
        {!doc.doctorAvailabilityStatus ? ' (Not Available)' : ''}
      </option>
    );
  })}
</CFormSelect>

  )}

  {errors.doctorName && <div className="text-danger">{errors.doctorName}</div>}
</CCol>





            </CRow>
          </div>
        )}

        {/* SECTION: Consultation & Payment */}
        {visitType !== 'followup' && appointmentType.includes('service') && (
          <>
            <h5 className="mb-3 border-bottom pb-2">Consultation & Payment</h5>
            <CRow className="mb-4 g-3">
              {/* Consultation Fee */}
              <CCol md={4}>   
                <h6>Consultation Fee</h6>
                <CFormInput type="number" value={bookingDetails.consultationFee  || 0} disabled />
              </CCol>
              <CCol md={4}>
                <h6>Service & Treatment Cost</h6>
                <CFormInput type="number" value={bookingDetails.servicecost || 0} disabled />
              </CCol>

              <CCol md={4}>
                <h6>Discount Amount</h6>
                <CFormInput type="number" value={bookingDetails.discountAmount || 0} disabled />
              </CCol>

              <CCol md={4}>
                <h6>Discount(%)</h6>
                <CFormInput type="number" value={bookingDetails.discountPercentage || 0} disabled />
              </CCol>

              <CCol md={4}>
                <h6>Total Amount</h6>
                <CFormInput type="number" value={bookingDetails.totalAmount || 0} disabled />
              </CCol>

            
            </CRow>
          </>
        )}

        {/* ==================== Available Slots ==================== */}
        <h5 className="mb-3 border-bottom pb-2">Available Slots</h5>
  <CCol md={12}>
          <div>
            {/* Date Buttons */}
            <div className="d-flex gap-2 flex-wrap mb-3">
              {(slotsForSelectedDate || [])
                .map((s) => s.day || s.date)
                .filter((d) => {
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  const dateObj = new Date(d)
                  dateObj.setHours(0, 0, 0, 0)
                  return dateObj >= today // remove past dates
                })
                .sort((a, b) => new Date(a) - new Date(b))
                .map((dateValue, idx) => {
                  const dateObj = new Date(dateValue)
                  const isSelected =
                    new Date(selectedDate).toDateString() === dateObj.toDateString()
                  const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short' })
                  const dateLabel = dateObj.toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                  })

                  return (
                    <CButton
                      key={idx}
                      onClick={() => {
                        const formattedDate = dateObj.toISOString().split('T')[0] // "YYYY-MM-DD"

                        setSelectedDate(formattedDate) // optional: keep selectedDate in same format
                        setSelectedSlots([]) // clear previous slots
                        setBookingDetails((prev) => ({
                          ...prev,
                          serviceDate: formattedDate,
                          servicetime: '',
                        }))
                      }}
                      style={{
                        backgroundColor: isSelected ? 'var(--color-black)' : '#fff',
                        color: isSelected ? '#fff' : 'var(--color-black)',
                        border: '1px solid var(--color-black)',
                        minWidth: '80px',
                      }}
                    >
                      <div style={{ fontSize: '14px' }}>{dayLabel}</div>
                      <div style={{ fontSize: '12px' }}>{dateLabel}</div>
                    </CButton>
                  )
                })}
            </div>

            {/* Time Slots */}
            <div className="slot-grid mt-3">
              <CCard className="mb-4">
                <CCardBody>
                  {slotsToShow.length === 0 ? (
                    <p className="text-center" style={{ color: 'var(--color-black)' }}>
                      No available slots for this date
                    </p>
                  ) : (
                    <>
                      <div
                        className="slots-container"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(6, 1fr)',
                          gap: '5px',
                        }}
                      >
                        {visibleSlots.map((slotObj, i) => {
                          const slotLabel = slotObj.slot
                          const isBooked = slotObj.slotbooked
                          const isSelectedSlot = selectedSlots.includes(slotLabel)

                          return (
                            <div
                              key={i}
                              style={{ cursor: 'pointer' }}
                              className={`slot-item text-center border rounded px-2 py-1 transition-all duration-200
    ${isBooked ? 'bg-secondary text-white cursor-not-allowed opacity-60' : ''}
    ${isSelectedSlot && !isBooked ? 'bg-primary text-white' : ''}
    ${!isSelectedSlot && !isBooked ? 'bg-light text-dark hover:bg-gray-200 cursor-pointer' : ''}
  `}
                              onClick={() => {
                                if (isBooked) return

                                // Single selection: replace selectedSlots with only this slot
                                setSelectedSlots([slotLabel])

                                // Update backend-ready value
                                setBookingDetails((prev) => ({
                                  ...prev,
                                  servicetime: slotLabel,
                                }))
                              }}
                            >
                              {slotLabel}
                            </div>
                          )
                        })}
                      </div>

                      {/* Show More / Less */}
                      {slotsToShow.length > 12 && (
                        <div className="text-center mt-2">
                          <CButton
                            color="secondary"
                            size="sm"
                            onClick={() => setShowAllSlots(!showAllSlots)}
                          >
                            {showAllSlots ? 'Show Less' : 'Show More'}
                          </CButton>
                        </div>
                      )}
                    </>
                  )}
                </CCardBody>
              </CCard>
            </div>
          </div>

          {/* Error message */}
          {errors.slot && <div className="text-danger mt-2">{errors.slot}</div>}
        </CCol>


        {/* SECTION: Symptoms */}
        {/* ==================== Symptoms & Attachment Sections ==================== */}
        {visitType !== 'followup' && (
          <>
            {/* SECTION: Symptoms */}
          <h5 className="mb-3 border-bottom pb-2">
  Symptoms 
</h5>

            <CRow className="mb-4">
              <CCol md={5}>
              <h6>
  Symptoms/Problem
  {appointmentType?.toLowerCase().trim() !== 'services' && (
  <span className="text-danger">*</span>
)}
</h6>

                <CFormTextarea
  name="problem"
  value={bookingDetails.problem}
  onChange={handleBookingChange}
  minLength={5}
  maxLength={300}
 required={appointmentType?.toLowerCase().trim() !== 'services'}

/>
{errors.problem && <p className="text-danger small">{errors.problem}</p>}
              </CCol>

              <CCol md={4}>
             <h6>
  Symptoms/Duration
 {appointmentType?.toLowerCase().trim() !== 'services' && (
  <span className="text-danger">*</span>
)}

</h6>

             <CFormInput
  type="text" // change from number to text to fully control input
  name="symptomsDuration"
  value={bookingDetails.symptomsDuration}
  onChange={(e) => {
    // Allow only digits
    const value = e.target.value.replace(/\D/g, '')
    setBookingDetails((prev) => ({ ...prev, symptomsDuration: value }))
  }}
 
  min={1}
  max={365}
  required={appointmentType?.toLowerCase().trim() !== 'services'}
/>

{errors.symptomsDuration && (
  <p className="text-danger small">{errors.symptomsDuration}</p>
)}

</CCol>

              <CCol md={3}>
               <h6>
 Unit
 {appointmentType?.toLowerCase().trim() !== 'services' && (
  <span className="text-danger">*</span>
)}

</h6>

                <CFormSelect
  name="unit"
  value={bookingDetails.unit || ''}
  onChange={handleBookingChange}
 required={appointmentType?.toLowerCase().trim() !== 'services'}

>
  <option value="">Select Unit</option>
  <option value="Day">Day</option>
  <option value="Week">Week</option>
  <option value="Month">Month</option>
  <option value="Year">Year</option>
</CFormSelect>
{errors.unit && <p className="text-danger small">{errors.unit}</p>}
              </CCol>
            </CRow>

            {/* SECTION: Attachment */}
            
            <CCol md={6}>
              <h6>Attachment</h6> 
              <CFormInput
                type="file"
                name="attachments"
                multiple
                accept=".jpg,.png,.pdf"
                onChange={async (e) => {
                  const newFiles = Array.from(e.target.files)
                  // const maxSize = 250 * 1024 // 250 KB

                  // Check individual file sizes
                  // const oversizedFile = newFiles.find((file) => file.size > maxSize)
                  // if (oversizedFile) {
                  //   toast.error(`"${oversizedFile.name}" exceeds 250 KB limit.`)
                  //   e.target.value = ''
                  //   return
                  // }

                  // Limit to 6 files total
                  if (newFiles.length + (bookingDetails.attachments?.length || 0) > 6) {
                    toast.error('You can upload a maximum of 6 files.')
                    e.target.value = ''
                    return
                  }

                  // Convert file to Base64 string
                  const toBase64 = (file) =>
                    new Promise((resolve, reject) => {
                      const reader = new FileReader()
                      reader.readAsDataURL(file)
                      reader.onload = () => resolve(reader.result) // only Base64 string
                      reader.onerror = (error) => reject(error)
                    })

                  try {
                    // Convert all new files to Base64 strings
                    const base64Files = await Promise.all(newFiles.map((file) => toBase64(file)))

                    // Update state
                    setBookingDetails((prev) => ({
                      ...prev,
                      attachments: [...(prev.attachments || []), ...base64Files], // array of strings
                    }))
                  } catch (error) {
                    console.error('Failed to convert files to Base64:', error)
                    toast.error('Failed to process attachments.')
                  }
                }}
              />

              {/* Display uploaded file names */}
              {bookingDetails.attachments && bookingDetails.attachments.length > 0 && (
                <div className="mt-2">
                  {bookingDetails.attachments.map((base64, index) => {
                    // Extract file name from Base64 if needed (optional)
                    const name = `File ${index + 1}`
                    return (
                      <div key={index} className="d-flex align-items-center mb-1">
                        <span>{name}</span>
                        <button
                          type="button"
                          style={{
                            marginLeft: '10px',
                            color: 'red',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            setBookingDetails((prev) => ({
                              ...prev,
                              attachments: prev.attachments.filter((_, i) => i !== index),
                            }))
                          }}
                        >
                          &times;
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </CCol>
          </>
        )}
      {visitType !== 'followup' && (
  <>
  <h5 className="mb-3 border-bottom pb-2 mt-4">
  Payment Details
</h5>

<CRow className="mb-4 g-3"> {/* g-3 adds horizontal & vertical gap */}
  {/* Payment Type */}
  <CCol md={5}>
    <h6>
      Payment Type <span className="text-danger">*</span>
    </h6>
    <CFormSelect
      name="paymentType"
      value={bookingDetails.paymentType}
      onChange={(e) =>
        setBookingDetails((prev) => ({
          ...prev,
          paymentType: e.target.value,
        }))
      }
    >
      <option value="">Select Payment Type</option>
      <option value="Cash">Cash</option>
      <option value="Card">Card</option>
      <option value="UPI">UPI</option>
    </CFormSelect>
    {errors.paymentType && (
      <div className="text-danger mt-1">{errors.paymentType}</div>
    )}
  </CCol>

  {/* Doctor Referral Code */}
  <CCol md={4}>
    <h6>Doctor Referral Code</h6>
    <CFormInput
      type="text"
      name="doctorRefCode"
      value={bookingDetails.doctorRefCode || ''}
      onChange={handleBookingChange}
      minLength={4}
      maxLength={10}
    />
    {errors.doctorRefCode && (
      <div className="text-danger mt-1">{errors.doctorRefCode}</div>
    )}
  </CCol>
</CRow>

  </>
)}

        {/* Buttons */}
        <div className="mt-4 text-end d-flex justify-content-end gap-2">
          <CButton color="secondary" onClick={onClose}>
            Cancel
          </CButton>

          {visitType === 'followup' ? (
            <CButton
              onClick={() => handleFollowUpSubmit(selectedBooking)} // ✅ call follow-up function
              style={{ backgroundColor: 'var(--color-bgcolor)', color: 'var(--color-black)' }}
            >
              Submit
            </CButton>
          ) : (
            <CButton
              onClick={handleSubmit} // ✅ call normal booking function
              style={{ backgroundColor: 'var(--color-bgcolor)', color: 'var(--color-black)' }}
            >
              Submit
            </CButton>
          )}
        </div>

        {/* SECTION: Submit */}
      </COffcanvasBody>
    </COffcanvas>
  )

  // return (
  //   <CModal alignment="center" visible={visible} onClose={onClose} size="xl">
  //     <CModalHeader>
  //       <CModalTitle>Book Appointment</CModalTitle>
  //     </CModalHeader>
  //     <CModalBody>

  //     </CModalBody>
  //   </CModal>
  // )
}

export default BookAppointmentModal
