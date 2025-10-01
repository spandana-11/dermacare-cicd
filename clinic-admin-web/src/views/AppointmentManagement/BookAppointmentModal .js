import React, { useState, useEffect } from 'react'
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
} from '@coreui/react'
import { BASE_URL, Category, getservice, subservice, wifiUrl } from '../../baseUrl'

const BookAppointmentModal = ({ visible, onClose }) => {
  const [visitType, setVisitType] = useState('first')
  const [appointmentType, setAppointmentType] = useState('services')
  const [loading, setLoading] = useState([])
  const [allSlots, setAllSlots] = useState([])
  const [subServices, setSubServices] = useState([])

  const [categories, setCategories] = useState([])
  const [services, setServices] = useState([])
  const [procedures, setProcedures] = useState([])
  const [branches, setBranches] = useState([])
  const [doctors, setDoctors] = useState([])

  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [selectedProcedure, setSelectedProcedure] = useState('')

  const [bookingDetails, setBookingDetails] = useState({
    branchId: localStorage.getItem('branchId'),
    clinicId: localStorage.getItem('HospitalId'),

    bookingFor: 'Self',
    name: '',
    relation: '',
    patientMobileNumber: '',
    visitType: 'first',
    freeFollowUpsLeft: '',
    freeFollowUps: '',
    patientAddress: '',
    age: '',
    gender: '',
    mobileNumber: '',
    consultationExpiration: '',
    problem: '',
    symptomsDuration: '',
    clinicName: '',
    branchname: '',
    doctorName: '',
    subServiceName: '',
    serviceDate: '',
    servicetime: '',
    consultationType: '',
    consultationFee: '',
    visitCount: '',
    reasonForCancel: '',
    notes: '',
    BookedAt: '',
    status: '',
    totalFee: '',
    attachments: [],
    consentFormPdf: '',
    prescriptionPdf: [],
    doctorRefCode: '',
    paymentType: '',
  })

  const [errors, setErrors] = useState({})

  // Fetch categories
  useEffect(() => {
    if (visible) {
      fetch(`${BASE_URL}/${Category}`)
        .then((res) => res.json())
        .then((data) => setCategories(Array.isArray(data.data) ? data.data : []))
        .catch(() => setCategories([]))
    }
  }, [visible])

  // Fetch services when category changes
  useEffect(() => {
    if (!selectedCategory) {
      setServices([])
      setSelectedService('')
      setProcedures([])
      setSelectedProcedure('')
      return
    }

    fetch(`${BASE_URL}/${getservice}/${selectedCategory}`)
      .then((res) => res.json())
      .then((data) => {
        const servicesData = Array.isArray(data.data) ? data.data : []
        setServices(servicesData)
        setSelectedService('')
        setProcedures([])
        setSelectedProcedure('')
      })
      .catch((err) => console.error('Error fetching services:', err))
  }, [selectedCategory])

  // Fetch procedures (sub-services) when service changes
  useEffect(() => {
    if (!selectedService) {
      setProcedures([])
      setSelectedProcedure('')
      setBookingDetails((prev) => ({ ...prev, subServiceName: '' }))
      return
    }

    // Correct URL: use selectedService, not selectedProcedure
    fetch(`${wifiUrl}/api/customer/getSubServiceInfo/${selectedService}`)
      .then((res) => res.json())
      .then((data) => {
        console.log('Sub-services for service', selectedService, data)

        const subServices = Array.isArray(data.data) ? data.data : []
        setProcedures(subServices)

        // Reset selectedProcedure only if there are no sub-services
        if (subServices.length === 0) {
          setSelectedProcedure('')
          setBookingDetails((prev) => ({ ...prev, subServiceName: '' }))
        }
      })
      .catch((err) => console.error('Error fetching sub-services:', err))
  }, [selectedService])

  // Fetch branches
  useEffect(() => {
    if (!visible) return // only fetch when modal is visible

    const fetchBranches = async () => {
      try {
        const clinicId = localStorage.getItem('HospitalId')
        const response = await GetClinicBranches(clinicId) // ✅ call your API helper

        const branchList = Array.isArray(response.data) ? response.data : []

        const formattedBranches = branchList.map((b) => ({
          branchId: b.branchId || b.id || b.name,
          branchName: b.branchName || b.name,
        }))

        setBranches(formattedBranches)
      } catch (err) {
        console.error('Error fetching branches:', err)
        setBranches([])
      }
    }

    fetchBranches()
  }, [visible])

  // Fetch available slots for a doctor

  const handleBookingChange = (e) => {
    const { name, value } = e.target
    setBookingDetails((prev) => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    const newErrors = {}

    // Name
    if (!bookingDetails.name.trim()) newErrors.name = 'Name is required.'
    else if (!/^[A-Za-z\s]+$/.test(bookingDetails.name))
      newErrors.name = 'Name must contain only letters.'
    else if (bookingDetails.name.length < 3 || bookingDetails.name.length > 50)
      newErrors.name = 'Name must be 3-50 characters.'

    // Address
    if (!bookingDetails.patientAddress.trim()) newErrors.patientAddress = 'Address is required.'

    // Mobile Number
    if (!bookingDetails.patientMobileNumber.trim())
      newErrors.patientMobileNumber = 'Mobile number is required.'
    else if (!/^[6-9]\d{9}$/.test(bookingDetails.patientMobileNumber))
      newErrors.patientMobileNumber = 'Enter a valid 10-digit mobile number starting with 6-9.'

    // Age
    if (!bookingDetails.age) newErrors.age = 'Age is required.'
    else if (bookingDetails.age < 0 || bookingDetails.age > 120)
      newErrors.age = 'Age must be between 0 and 120.'

    // Gender
    if (!bookingDetails.gender) newErrors.gender = 'Gender is required.'

    // Clinic Name
    if (!bookingDetails.clinicName.trim()) newErrors.clinicName = 'Clinic name is required.'

    // Branch
    if (!bookingDetails.branchname) newErrors.branchname = 'Branch selection is required.'

    // Doctor Name
    if (!bookingDetails.doctorName.trim()) newErrors.doctorName = 'Doctor name is required.'

    // Sub-Service Name
    if (!bookingDetails.subServiceName.trim())
      newErrors.subServiceName = 'Sub-service name is required.'

    // Service Date & Time
    if (!bookingDetails.serviceDate) newErrors.serviceDate = 'Service date is required.'
    if (!bookingDetails.servicetime) newErrors.servicetime = 'Service time is required.'

    // Consultation Type
    if (!bookingDetails.consultationType.trim())
      newErrors.consultationType = 'Consultation type is required.'

    // Status & Payment Type
    if (!bookingDetails.status) newErrors.status = 'Status is required.'
    if (!bookingDetails.paymentType) newErrors.paymentType = 'Payment type is required.'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      console.log('Booking details valid:', bookingDetails)
      // Submit to API
    }
  }

  return (
    <COffcanvas
      placement="end" // 👈 opens from right side
      visible={visible}
      onHide={onClose}
      className="w-50" // optional: control width
    >
      <COffcanvasHeader>
        <COffcanvasTitle>Book Appointment</COffcanvasTitle>
        <button className="btn-close" onClick={onClose}></button>
      </COffcanvasHeader>
      <COffcanvasBody>
        {/* Visit Type */}
        <CRow className="mb-3">
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
              }}
            />
          </CCol>
        </CRow>

        {/* Appointment Type */}
        <CRow className="mb-3">
          <CCol md={4}>
            <CFormCheck
              type="radio"
              label="Services & Treatment"
              name="appointmentTypeRadio"
              value="services"
              checked={appointmentType === 'services'}
              onChange={() => setAppointmentType('services')}
            />
          </CCol>
          <CCol md={4}>
            <CFormCheck
              type="radio"
              label="In-Clinic"
              name="appointmentTypeRadio"
              value="inclinic"
              checked={appointmentType === 'inclinic'}
              onChange={() => setAppointmentType('inclinic')}
            />
          </CCol>
          <CCol md={4}>
            <CFormCheck
              type="radio"
              label="Online"
              name="appointmentTypeRadio"
              value="online"
              checked={appointmentType === 'online'}
              onChange={() => setAppointmentType('online')}
            />
          </CCol>
        </CRow>

        {/* Category / Service / Procedure */}
        {appointmentType === 'services' && (
          <CRow className="mb-3">
            <CCol md={4}>
              <CFormLabel>Category</CFormLabel>
              <CFormSelect
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.categoryName}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            <CCol md={4}>
              <CFormLabel>Service</CFormLabel>
              <CFormSelect
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                disabled={!selectedCategory}
              >
                <option value="">Select Service</option>
                {services.map((service) => (
                  <option key={service._id} value={service.serviceName}>
                    {service.serviceName}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            <CCol md={4}>
              <CFormLabel>Sub-Service</CFormLabel>
              <CFormSelect
                value={selectedProcedure}
                onChange={(e) => setSelectedProcedure(e.target.value)}
                disabled={!selectedService}
              >
                <option value="">Select Sub-Service</option>
                {procedures.map((proc) => (
                  <option key={proc.id} value={proc.name}>
                    {proc.name}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
          </CRow>
        )}

        {/* Basic Details */}
        <CRow className="mb-3">
          <CCol md={4}>
            <CFormLabel>Branch Name</CFormLabel>
            <CFormSelect
              name="branchname"
              value={bookingDetails.branchname}
              onChange={handleBookingChange}
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
          </CCol>

          <CCol md={4}>
            <CFormLabel>Doctor Name</CFormLabel>
            <CFormSelect
              name="doctorName"
              value={bookingDetails.doctorName}
              onChange={handleBookingChange}
            >
              <option value="">Select Doctor</option>
              {doctors.map((doc) => (
                <option key={doc.doctorId} value={doc.doctorId}>
                  {doc.doctorName}
                </option>
              ))}
            </CFormSelect>
            {errors.doctorName && (
              <CFormText className="text-danger">{errors.doctorName}</CFormText>
            )}
          </CCol>

          <CCol md={12} className="mt-3">
            <CFormLabel>Available Slots</CFormLabel>
            {loading ? (
              <div>Loading slots...</div>
            ) : allSlots.length > 0 ? (
              <CRow className="g-2 flex-nowrap" style={{ overflowX: 'auto' }}>
                {allSlots.map((slot, index) => (
                  <CCol xs="auto" key={index}>
                    <CButton
                      color={bookingDetails.slot === slot ? 'primary' : 'outline-primary'}
                      onClick={() => setBookingDetails((prev) => ({ ...prev, slot }))}
                    >
                      {slot}
                    </CButton>
                  </CCol>
                ))}
              </CRow>
            ) : (
              <div>No slots available</div>
            )}
            {errors.slot && <CFormText className="text-danger">{errors.slot}</CFormText>}
          </CCol>

          <CRow className="mb-3">
            <CCol md={4}>
              <CFormLabel>Booking For</CFormLabel>
              <CFormSelect
                name="bookingFor"
                value={bookingDetails.bookingFor}
                onChange={handleBookingChange}
                disabled
              >
                <option value="Self">Self</option>
              </CFormSelect>
            </CCol>
            <CCol md={4}>
              <CFormLabel>Patient ID</CFormLabel>
              <CFormInput
                name="patientId"
                value={bookingDetails.patientId}
                readOnly // ✅ prevents editing
              />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Name</CFormLabel>
              <CFormInput
                name="name"
                value={bookingDetails.name}
                onChange={(e) => {
                  const value = e.target.value

                  // Allow only letters and spaces while typing
                  if (/^[A-Za-z\s]*$/.test(value)) {
                    setBookingDetails((prev) => ({ ...prev, name: value }))

                    // Live validation: remove error if valid
                    if (value.trim().length >= 3 && value.trim().length <= 50) {
                      setErrors((prev) => ({ ...prev, name: '' }))
                    } else {
                      setErrors((prev) => ({ ...prev, name: 'Name must be 3-50 letters.' }))
                    }
                  }
                }}
              />
              {errors.name && <CFormText className="text-danger">{errors.name}</CFormText>}
            </CCol>

            <CCol md={4}>
              <CFormLabel>Address</CFormLabel>
              <CFormInput
                name="patientAddress"
                value={bookingDetails.patientAddress}
                onChange={(e) => {
                  const value = e.target.value

                  // Update the booking details state
                  setBookingDetails((prev) => ({ ...prev, patientAddress: value }))

                  // Live validation
                  setErrors((prev) => {
                    const newErrors = { ...prev }
                    if (!value.trim()) {
                      newErrors.patientAddress = 'Address is required.'
                    } else if (value.length < 5 || value.length > 100) {
                      newErrors.patientAddress = 'Address must be 5-100 characters.'
                    } else {
                      delete newErrors.patientAddress // remove error when valid
                    }
                    return newErrors
                  })
                }}
              />
              {errors.patientAddress && (
                <CFormText className="text-danger">{errors.patientAddress}</CFormText>
              )}
            </CCol>
          </CRow>
        </CRow>

        {/* Mobile / Age / Gender */}
        <CRow className="mb-3">
          <CCol md={4}>
            <CFormLabel>Mobile Number</CFormLabel>
            <CFormInput
              name="patientMobileNumber"
              value={bookingDetails.patientMobileNumber}
              maxLength={10} // restrict to 10 digits
              onChange={(e) => {
                const value = e.target.value

                // Allow only digits
                if (!/^\d*$/.test(value)) return

                // Update state
                setBookingDetails((prev) => ({ ...prev, patientMobileNumber: value }))

                // Live validation
                setErrors((prev) => {
                  const newErrors = { ...prev }
                  if (!value.trim()) {
                    newErrors.patientMobileNumber = 'Mobile number is required.'
                  } else if (!/^[6-9]\d{9}$/.test(value)) {
                    newErrors.patientMobileNumber =
                      'Enter a valid 10-digit mobile number starting with 6-9.'
                  } else {
                    delete newErrors.patientMobileNumber // remove error when valid
                  }
                  return newErrors
                })
              }}
            />
            {errors.patientMobileNumber && (
              <CFormText className="text-danger">{errors.patientMobileNumber}</CFormText>
            )}
          </CCol>

          <CCol md={4}>
            <CFormLabel>Age</CFormLabel>
            <CFormInput
              type="number"
              name="age"
              value={bookingDetails.age}
              onChange={(e) => {
                let value = e.target.value

                // Allow only digits and max 2 characters
                if (!/^\d*$/.test(value)) return
                if (value.length > 2) value = value.slice(0, 2)

                // Update state
                setBookingDetails((prev) => ({ ...prev, age: value }))

                // Live validation
                setErrors((prev) => {
                  const newErrors = { ...prev }
                  if (!value) {
                    newErrors.age = 'Age is required.'
                  } else if (value < 0 || value > 99) {
                    newErrors.age = 'Age must be between 0 and 99.'
                  } else {
                    delete newErrors.age // remove error when valid
                  }
                  return newErrors
                })
              }}
            />
            {errors.age && <CFormText className="text-danger">{errors.age}</CFormText>}
          </CCol>

          <CCol md={4}>
            <CFormLabel>Gender</CFormLabel>
            <CFormSelect name="gender" value={bookingDetails.gender} onChange={handleBookingChange}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </CFormSelect>
            {errors.gender && <CFormText className="text-danger">{errors.gender}</CFormText>}
          </CCol>
        </CRow>

        {/* Problem / Symptoms / Notes */}
        <CRow className="mb-3">
          <CCol md={4}>
            <CFormLabel>Problem Description</CFormLabel>
            <CFormTextarea
              name="problem"
              value={bookingDetails.problem}
              onChange={(e) => {
                let value = e.target.value

                // Limit to 200 characters
                if (value.length > 200) value = value.slice(0, 200)

                // Update state
                setBookingDetails((prev) => ({ ...prev, problem: value }))

                // Live validation
                setErrors((prev) => {
                  const newErrors = { ...prev }
                  if (!value.trim()) {
                    newErrors.problem = 'Problem is required.'
                  } else if (value.length > 200) {
                    newErrors.problem = 'Problem cannot exceed 200 characters.'
                  } else {
                    delete newErrors.problem // remove error when valid
                  }
                  return newErrors
                })
              }}
            />
            {errors.problem && <CFormText className="text-danger">{errors.problem}</CFormText>}
          </CCol>
          <CCol md={2}>
            <CFormLabel>Symptoms Duration</CFormLabel>
            <CFormInput
              type="number"
              name="symptomsDurationValue"
              value={bookingDetails.symptomsDurationValue || ''}
              min={1}
              onChange={(e) => {
                const value = e.target.value
                setBookingDetails((prev) => ({ ...prev, symptomsDurationValue: value }))

                // Live validation
                setErrors((prev) => {
                  const newErrors = { ...prev }
                  if (!value) {
                    newErrors.symptomsDurationValue = 'Duration value is required.'
                  } else if (value <= 0) {
                    newErrors.symptomsDurationValue = 'Duration must be greater than 0.'
                  } else {
                    delete newErrors.symptomsDurationValue
                  }
                  return newErrors
                })
              }}
            />
            {errors.symptomsDurationValue && (
              <CFormText className="text-danger">{errors.symptomsDurationValue}</CFormText>
            )}
          </CCol>

          <CCol md={3}>
            <CFormLabel>&nbsp;</CFormLabel>
            <CFormSelect
              name="symptomsDurationUnit"
              value={bookingDetails.symptomsDurationUnit || ''}
              onChange={(e) => {
                const value = e.target.value
                setBookingDetails((prev) => ({ ...prev, symptomsDurationUnit: value }))

                // Live validation
                setErrors((prev) => {
                  const newErrors = { ...prev }
                  if (!value) {
                    newErrors.symptomsDurationUnit = 'Unit is required.'
                  } else {
                    delete newErrors.symptomsDurationUnit
                  }
                  return newErrors
                })
              }}
            >
              <option value="">Select Duration Unit</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
              <option value="years">Years</option>
            </CFormSelect>
            {errors.symptomsDurationUnit && (
              <CFormText className="text-danger">{errors.symptomsDurationUnit}</CFormText>
            )}
          </CCol>
          <CRow className="mb-3"></CRow>

          {/* <CCol md={4}>
            <CFormLabel>Notes</CFormLabel>
           <CFormTextarea
  name="notes"
  value={bookingDetails.notes}
  onChange={(e) => {
    let value = e.target.value;

    // Limit to 200 characters
    if (value.length > 200) value = value.slice(0, 200);

    // Update state
    setBookingDetails((prev) => ({ ...prev, notes: value }));

    // Live validation
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (!value.trim()) {
        newErrors.notes = 'Notes are required.';
      } else if (value.length > 200) {
        newErrors.notes = 'Notes cannot exceed 200 characters.';
      } else {
        delete newErrors.notes; // remove error when valid
      }
      return newErrors;
    });
  }}
/>
{errors.notes && <CFormText className="text-danger">{errors.notes}</CFormText>} */}

          {/* </CCol> */}
        </CRow>

        {/* Clinic / Branch / Doctor */}
        <CRow className="mb-3">
          {/* <CFormLabel>Clinic Name</CFormLabel> */}
          {/* <CFormInput
  name="clinicName"
  value={bookingDetails.clinicName}
  onChange={(e) => {
    let value = e.target.value;

    // Allow only letters & spaces
    if (!/^[A-Za-z\s]*$/.test(value)) return;

    // Update state
    setBookingDetails((prev) => ({ ...prev, clinicName: value }));

    // Live validation
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (!value.trim()) {
        newErrors.clinicName = 'Clinic name is required.';
      } else if (value.length < 2 || value.length > 50) {
        newErrors.clinicName = 'Clinic name must be 2-50 characters.';
      } else {
        delete newErrors.clinicName; // remove error when valid
      }
      return newErrors;
    });
  }}
/>
{errors.clinicName && (
  <CFormText className="text-danger">{errors.clinicName}</CFormText>
)} */}
        </CRow>

        {/* SubService / Date / Time */}
        <CRow className="mb-3">
          {/* <CCol md={4}>
            <CFormLabel>Service Date</CFormLabel>
            <CFormInput type="date" name="serviceDate" value={bookingDetails.serviceDate} onChange={handleBookingChange} />
            {errors.serviceDate && <CFormText className="text-danger">{errors.serviceDate}</CFormText>}
          </CCol>
          <CCol md={4}>
            <CFormLabel>Service Time</CFormLabel>
            <CFormInput type="time" name="servicetime" value={bookingDetails.servicetime} onChange={handleBookingChange} />
            {errors.servicetime && <CFormText className="text-danger">{errors.servicetime}</CFormText>}
          </CCol> */}
        </CRow>

        {/* Consultation / Fee / Visit Count */}
        <CRow className="mb-3">
          {/* <CCol md={4}>
            <CFormLabel>Consultation Type</CFormLabel>
            <CFormInput name="consultationType" value={bookingDetails.consultationType} onChange={handleBookingChange} />
            {errors.consultationType && <CFormText className="text-danger">{errors.consultationType}</CFormText>}
          </CCol> */}
          <CCol md={4}>
            <CFormLabel>Consultation Fee</CFormLabel>
            <CFormInput
              type="number"
              name="consultationFee"
              value={bookingDetails.consultationFee}
              onChange={handleBookingChange}
            />
            {errors.consultationFee && (
              <CFormText className="text-danger">{errors.consultationFee}</CFormText>
            )}
          </CCol>
          <CCol md={4}>
            <CFormLabel>Visit Count</CFormLabel>
            <CFormInput
              type="number"
              name="visitCount"
              value={bookingDetails.visitCount}
              onChange={handleBookingChange}
            />
            {errors.visitCount && (
              <CFormText className="text-danger">{errors.visitCount}</CFormText>
            )}
          </CCol>
          <CCol md={4}>
            <CFormLabel>Attachments</CFormLabel>
            <CFormInput
              type="file"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files)
                setBookingDetails((prev) => ({ ...prev, attachments: files }))
              }}
            />
          </CCol>
          {/* Free Follow Ups */}
          {/* <CRow className="mb-3">
  <CCol md={4}>
    <CFormLabel>Free Follow Ups Left</CFormLabel>
    <CFormInput
      type="number"
      name="freeFollowUpsLeft"
      value={bookingDetails.freeFollowUpsLeft}
      onChange={(e) => {
        let value = e.target.value

        // only digits
        if (!/^\d*$/.test(value)) return
        if (value.length > 2) value = value.slice(0, 2) // max 2 digits

        setBookingDetails((prev) => ({ ...prev, freeFollowUpsLeft: value }))

        // live validation
        setErrors((prev) => {
          const newErrors = { ...prev }
          if (value === '') {
            newErrors.freeFollowUpsLeft = 'Free follow ups left is required.'
          } else if (parseInt(value) < 0 || parseInt(value) > 50) {
            newErrors.freeFollowUpsLeft = 'Value must be between 0 and 50.'
          } else {
            delete newErrors.freeFollowUpsLeft
          }
          return newErrors
        })
      }}
    />
    {errors.freeFollowUpsLeft && (
      <CFormText className="text-danger">{errors.freeFollowUpsLeft}</CFormText>
    )}
  </CCol>

  <CCol md={4}>
    <CFormLabel>Total Free Follow Ups</CFormLabel>
    <CFormInput
      type="number"
      name="freeFollowUps"
      value={bookingDetails.freeFollowUps}
      onChange={(e) => {
        let value = e.target.value

        // only digits
        if (!/^\d*$/.test(value)) return
        if (value.length > 2) value = value.slice(0, 2) // max 2 digits

        setBookingDetails((prev) => ({ ...prev, freeFollowUps: value }))

        // live validation
        setErrors((prev) => {
          const newErrors = { ...prev }
          if (value === '') {
            newErrors.freeFollowUps = 'Total free follow ups is required.'
          } else if (parseInt(value) < 0 || parseInt(value) > 50) {
            newErrors.freeFollowUps = 'Value must be between 0 and 50.'
          } else {
            delete newErrors.freeFollowUps
          }
          return newErrors
        })
      }}
    />
    {errors.freeFollowUps && (
      <CFormText className="text-danger">{errors.freeFollowUps}</CFormText>
    )}
  </CCol>
</CRow> */}
        </CRow>
        <CRow className="mb-3">
          {/* Consent Form PDF */}
          {/* <CCol md={4}>
            <CFormLabel>Consent Form PDF</CFormLabel>
            <CFormInput
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const file = e.target.files[0]
                setBookingDetails(prev => ({ ...prev, consentFormPdf: file || '' }))
              }}
            />
          </CCol> */}

          {/* Prescription PDFs */}
          {/* <CCol md={4}>
            <CFormLabel>Prescription PDFs</CFormLabel>
            <CFormInput
              type="file"
              multiple  
              accept=".pdf"
              onChange={(e) => {
                const files = Array.from(e.target.files)
                setBookingDetails(prev => ({ ...prev, prescriptionPdf: files }))
              }}
            />
          </CCol> */}
        </CRow>

        {/* Status / Payment Type */}
        <CRow className="mb-3">
          {/* <CCol md={6}>
            <CFormLabel>Status</CFormLabel>
            <CFormSelect name="status" value={bookingDetails.status} onChange={handleBookingChange}>
              <option value="">Select Status</option>
              <option value="Completed">Completed</option>
              <option value="In-Progress">In-Progress</option>

              <option value="Cancelled">Cancelled</option>
            </CFormSelect>
            {errors.status && <CFormText className="text-danger">{errors.status}</CFormText>}
          </CCol> */}

          <CCol md={4}>
            <CFormLabel>Payment Type</CFormLabel>
            <CFormSelect
              name="paymentType"
              value={bookingDetails.paymentType}
              onChange={handleBookingChange}
            >
              <option value="">Select Payment Type</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
            </CFormSelect>
            {errors.paymentType && (
              <CFormText className="text-danger">{errors.paymentType}</CFormText>
            )}
          </CCol>
          <CCol md={4}>
            <CFormLabel>Doctor Referral Code</CFormLabel>
            <CFormInput
              name="doctorReferralCode"
              value={bookingDetails.doctorRefCode || ''}
              onChange={handleBookingChange}
            />
          </CCol>
        </CRow>

        <div className="mt-3 text-end">
          <button className="btn btn-primary" onClick={handleSubmit}>
            Submit
          </button>
        </div>
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
