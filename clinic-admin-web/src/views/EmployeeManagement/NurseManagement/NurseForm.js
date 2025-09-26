import React, { useEffect, useState } from 'react'
import {
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormTextarea,
  CFormSelect,
} from '@coreui/react'
import { toast } from 'react-toastify'
import { actions, features } from '../../../Constant/Features'
import capitalizeWords from '../../../Utils/capitalizeWords'
import { useHospital } from '../../Usecontext/HospitalContext'
import UserPermissionModal from '../UserPermissionModal'
import { validateField } from '../../../Utils/Validators'


const NurseForm = ({ visible, onClose, onSave, initialData, viewMode, nurses, fetchNurses }) => {
  const emptyPermissions = {} // ✅ no feature is selected by default

  const emptyForm = {
    hospitalId: localStorage.getItem('HospitalId'),
    branchId: localStorage.getItem('branchId'),
    hospitalName: localStorage.getItem('HospitalName'),
    fullName: '',
    gender: 'Female',
    dateOfBirth: '',
    nurseContactNumber: '',
    emailId: '',
    governmentId: '',
    qualifications: '',
    dateOfJoining: '',
    department: '',
    yearsOfExperience: '',
    specialization: '',
    shiftTimingOrAvailability: '',
    role: 'nurse',
    address: {
      houseNo: '',
      street: '',
      landmark: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
    },
    emergencyContactNumber: '',
    bankAccountDetails: {
      accountNumber: '',
      accountHolderName: '',
      ifscCode: '',
      bankName: '',
      branchName: '',
      panCardNumber: '',
    },
    medicalFitnessCertificate: '',
    profilePicture: '',
    nursingLicense: '',
    nursingDegreeOrDiplomaCertificate: '',
    nursingCouncilRegistration: '',
    nursePreviousEmploymentHistory: '',
    experienceCertificates: '',
    vaccinationStatus: true,
    insuranceOrESIdetails: {
      policyOrEsiNumber: '',
      providerName: '',
      type: '',
      status: '',
    },

    permissions: emptyPermissions,
  }

  // 🔹 State
  const [formData, setFormData] = useState(emptyForm)
  const [clinicId, setClinicID] = useState(localStorage.getItem('HospitalId'))

  const [showModal, setShowModal] = useState(false)
  const [showPModal, setShowPModal] = useState(false)
  const [previewFileUrl, setPreviewFileUrl] = useState(null)
  const [isPreviewPdf, setIsPreviewPdf] = useState(false)
          const [errors, setErrors] = useState({});
  
  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)
  //search
  // Mandatory fields
  const mandatoryFields = [
    'fullName',
    'gender',
    'dateOfBirth',
    'nurseContactNumber',
    'emailId',
    'governmentId',
    'dateOfJoining',
    'department',
    'yearsOfExperience',
    'hospitalId',
    'vaccinationStatus',
    'profilePicture',
    'role',
    'nursingLicense',
    'nursingCouncilRegistration',
    'nursingDegreeOrDiplomaCertificate',
    // address fields
    'address.houseNo',
    'address.street',
    'address.city',
    'address.state',
    'address.postalCode',
    'address.country',

    // bank details fields
    'bankAccountDetails.accountNumber',
    'bankAccountDetails.accountHolderName',
    'bankAccountDetails.bankName',
    'bankAccountDetails.branchName',
    'bankAccountDetails.ifscCode',
    'bankAccountDetails.panCardNumber',
  ]

  function validateMandatoryFields(formData, mandatoryFields) {
    const missingFields = []

    for (const field of mandatoryFields) {
      const keys = field.split('.')
      let value = formData

      for (const key of keys) {
        value = value?.[key]
      }

      if (!value || String(value).trim() === '') {
        missingFields.push(field)
      }
    }

    return missingFields
  }

  // Toggle feature
  const toggleFeature = (feature) => {
    setFormData((prev) => {
      const updated = { ...prev.permissions }

      if (updated[feature]) {
        delete updated[feature] // remove completely when unchecked
      } else {
        updated[feature] = [] // add with no actions when checked
      }

      return { ...prev, permissions: updated }
    })
  }

  // Toggle one action
  const togglePermission = (feature, action) => {
    setFormData((prev) => {
      const updated = { ...prev.permissions }
      if (!updated[feature]) updated[feature] = []

      if (updated[feature].includes(action)) {
        updated[feature] = updated[feature].filter((a) => a !== action)
      } else {
        updated[feature] = [...updated[feature], action]
      }

      return { ...prev, permissions: updated }
    })
  }

  // Select All actions
  const toggleAllActions = (feature) => {
    setFormData((prev) => {
      const updated = { ...prev.permissions }

      if (!updated[feature]) {
        updated[feature] = [...actions] // select all
      } else if (updated[feature].length === actions.length) {
        updated[feature] = [] // unselect all
      } else {
        updated[feature] = [...actions] // select all
      }

      return { ...prev, permissions: updated }
    })
  }

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      // Remove prefix before sending
      const result = reader.result
      const base64Data = result.split(',')[1]  // ✅ Only Base64
      resolve(base64Data)
    }
    reader.onerror = (error) => reject(error)
  })


  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      setFormData(emptyForm)
    }
  }, [initialData])

  // 🔹 Handle text inputs (top-level fields)
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // 🔹 Handle nested objects (address, bankAccountDetails)
  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }))
  }

  // 🔹 File upload → Base64
  const handleFileUpload = (e, field) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        [field]: reader.result, // ✅ Full Data URL (with type prefix)
        [`${field}Name`]: file.name,
        [`${field}Type`]: file.type, // ✅ Actual file MIME type (image/png, application/pdf, etc.)
      }))
    }
    reader.readAsDataURL(file)
  }

  // 🔹 Save handler
  const handleSubmit = () => {
    const missing = validateMandatoryFields(formData, mandatoryFields)

    if (missing.length > 0) {
      toast.error(`Please fill required fields: ${missing.join(', ')}`)
      return
    }

    // ✅ Age validation
    if (formData.dob) {
      const dob = new Date(formData.dob)
      const today = new Date()
      const age = today.getFullYear() - dob.getFullYear()
      const isBeforeBirthday =
        today.getMonth() < dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())

      const actualAge = isBeforeBirthday ? age - 1 : age

      if (actualAge < 18) {
        toast.error('Nurse must be at least 18 years old.')
        return
      }
    }

    // ✅ Mobile validation (10 digits, starting with 6-9)
    const mobileRegex = /^[6-9]\d{9}$/
    if (!mobileRegex.test(formData.nurseContactNumber)) {
      toast.error('Contact number must be 10 digits and start with 6-9.')
      return
    }

    // ✅ Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.emailId)) {
      toast.error('Please enter a valid email address.')
      return
    }

    // ✅ Check duplicate contact number
    const duplicateContact = nurses?.some(
      (t) => t.nurseContactNumber === formData.nurseContactNumber && t.id !== formData.id,
    )
    if (duplicateContact) {
      toast.error('Contact number already exists!')
      return
    }

    // ✅ Check duplicate email
    const duplicateEmail = nurses?.some((t) => t.email === formData.emailId && t.id !== formData.id)
    if (duplicateEmail) {
      toast.error('Email already exists!')
      return
    }

    if (Object.keys(formData.permissions).length === 0) {
      toast.error('Please assign at least one user permission before saving.')
      return
    }

    console.log('Saving nurse data:', formData)
    onSave(formData)
    setFormData(emptyForm)
    onClose()
  }

  const handleUserPermission = () => {
    const missing = validateMandatoryFields(formData, mandatoryFields)

    if (missing.length > 0) {
      toast.error(`Please fill required fields: ${missing.join(', ')}`)
      return
    }

    // ✅ Age validation
    if (formData.dob) {
      const dob = new Date(formData.dob)
      const today = new Date()
      const age = today.getFullYear() - dob.getFullYear()
      const isBeforeBirthday =
        today.getMonth() < dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())

      const actualAge = isBeforeBirthday ? age - 1 : age

      if (actualAge < 18) {
        toast.error('Nurse must be at least 18 years old.')
        return
      }
    }

    // ✅ Mobile validation
    const mobileRegex = /^[6-9]\d{9}$/
    if (!mobileRegex.test(formData.nurseContactNumber)) {
      toast.error('Contact number must be 10 digits and start with 6-9.')
      return
    }

    // ✅ Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.emailId)) {
      toast.error('Please enter a valid email address.')
      return
    }

    // ✅ Check duplicate contact number
    const duplicateContact = nurses?.some(
      (t) => t.nurseContactNumber === formData.nurseContactNumber && t.id !== formData.id,
    )
    if (duplicateContact) {
      toast.error('Contact number already exists!')
      return
    }

    // ✅ Check duplicate email
    const duplicateEmail = nurses?.some((t) => t.email === formData.emailId && t.id !== formData.id)
    if (duplicateEmail) {
      toast.error('Email already exists!')
      return
    }

    console.log('Nurse data ready for permissions:', formData)
    setShowPModal(true)
  }

  // 🔹 Close Preview Modal
  const handleCloseModal = () => {
    setShowModal(false)
    setPreviewFileUrl(null)
    setIsPreviewPdf(false)
  }

  const handlePreview = (fileUrl, type) => {
    setPreviewFileUrl(fileUrl)
    setIsPreviewPdf(type?.includes('pdf'))
    setShowModal(true)
  }

  //decode image
  const decodeImage = (data) => {
    try {
      // decode base64 string into normal string
      return atob(data)
    } catch {
      return null
    }
  }

  // 🔹 Small reusable info component
  const Section = ({ title, children }) => (
    <div>
      <h5 className="text-lg font-semibold border-b pb-2 mb-4">{title}</h5>
      <div className="grid grid-cols-3 gap-4">{children}</div>
    </div>
  )

  const Row = ({ label, value }) => (
    <div>
      <p className="text-sm font-medium text-gray-600 fw-bold">{label}</p>
      <p className="text-base text-gray-900 text-break">{value || 'N/A'}</p>
    </div>
  )

  const RowFull = ({ label, value }) => (
    <div className="col-span-3">
      {label && <p className="text-sm font-medium text-gray-600 fw-bold">{label}</p>}
      <p className="text-base text-gray-900 text-break">{value || 'N/A'}</p>
    </div>
  )
  const getFileUrl = (data, type = "image/png") => {
  if (!data) return null
  return data.startsWith("data:")
    ? data
    : `data:${type};base64,${data}`
}


  // 🔹 File Preview with modal trigger
  const FilePreview = ({ label, type, data }) => {
    if (!data) return <p>{label} </p>

    const isImage = type?.startsWith('image/')
   const fileUrl = data.startsWith('data:')
  ? data
  : `data:${type};base64,${data}`;




    return (
      <div className="bg-white p-3 rounded-md shadow-sm">
        <strong>{label}:</strong>
        <div className="mt-2">
          {isImage ? (
            <img
              src={fileUrl}
              alt={label}
              className="w-32 h-32 object-cover rounded-md border cursor-pointer"
              onClick={() => handlePreview(fileUrl, type)}
            />
          ) : (
            <button
              type="button "
              className=" btn text-blue-600 hover:underline block mx-2"
              onClick={() => handlePreview(fileUrl, type)}
              style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
            >
              Preview
            </button>
          )}
          <a
            href={fileUrl}
            download={label.replace(/\s+/g, '_')}
            className="text-green-600 hover:underline text-sm block  btn"
            style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
          >
            Download
          </a>
        </div>
      </div>
    )
  }

  return (
    <>
      <CModal
        visible={visible}
        onClose={onClose}
        size="lg"
        className="custom-modal"
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>{viewMode ? 'Personal Information' : 'Add / Edit  Nurse'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {viewMode ? (
            // ✅ VIEW MODE

            <div className="p-4 border rounded shadow-sm bg-white ">
              <div className="d-flex justify-content-between align-items-center">
                {/* Left Side: Details */}
                <div>
                  <div className="mb-1">
                    <span className="fw-bold ">Name : </span>
                    <span>{formData.fullName}</span>
                  </div>
                  <div className="mb-1">
                    <span className="fw-bold">Email : </span>
                    <span>{formData.emailId}</span>
                  </div>
                  <div>
                    <span className="fw-bold">Cantact : </span>
                    <span>{formData.nurseContactNumber}</span>
                  </div>
                </div>

                {/* Right Side: Image + ID */}
                <div className="text-center">
                  {formData.profilePicture ? (
                   <img
  src={getFileUrl(formData.profilePicture, formData.profilePictureType)}
  alt={formData.fullName}
  width="80"
  height="80"
  style={{
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1px solid var(--color-black)',
  }}
/>

                  ) : (
                    <img
                      src="/assets/images/default-avatar.png"
                      alt="No profile"
                      width="40"
                      height="40"
                      style={{
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1px solid var(--color-black)',
                      }}
                    />
                  )}
                  <div
                    style={{
                      color: 'var(--color-black)',
                      marginTop: '5px',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}
                  >
                    ID: {formData.id}
                  </div>
                </div>
              </div>
              <hr />

              <div className="space-y-5 mt-5">
                {/* Personal Info */}

                <div className="row mb-2">
                  <div className="col-md-4">
                    <Row label="Full Name" value={formData.fullName} />
                  </div>
                  <div className="col-md-4">
                    <Row label="Email" value={formData.emailId} />
                  </div>
                  <div className="col-md-4">
                    <Row label="Contact" value={formData.nurseContactNumber} />
                  </div>
                  <div className="col-md-4">
                    <Row label="Gender" value={formData.gender} />
                  </div>
                  <div className="col-md-4">
                    <Row label="Date of Birth" value={formData.dateOfBirth} />
                  </div>
                  <div className="col-md-4">
                    <Row label="Government ID" value={formData.governmentId} />
                  </div>
                </div>

                {/* Work Info */}
                <Section title="Work Information">
                  <div className="row mb-2">
                    <div className="col-md-4">
                      <Row label="Date of Joining" value={formData.dateOfJoining} />
                    </div>
                    <div className="col-md-4">
                      <Row label="Department" value={formData.department} />
                    </div>
                    <div className="col-md-4">
                      <Row label="Experience" value={formData.yearsOfExperience} />
                    </div>
                    <div className="col-md-4">
                      <Row label="Qualifications" value={formData.qualifications} />
                    </div>
                    <div className="col-md-4">
                      <Row label="Shift Timings" value={formData.shiftTimingOrAvailability} />
                    </div>
                    <div className="col-md-4">
                      <Row label="Emergency Contact" value={formData.emergencyContactNumber} />
                    </div>
                    {/* <div className="col-md-4">
                                            <Row label="Nursing License" value={formData.nursingLicense} />
                                        </div> */}
                  </div>
                </Section>

                {/* Address */}
                <Section title="Address">
               <RowFull
  value={`${formData.address.houseNo}, ${formData.address.street}, ${formData.address.city}, ${formData.address.state} - ${formData.address.postalCode}, ${formData.address.country}`}
/>

                </Section>

                {/* Bank Info */}
                <Section title="Bank Details">
                  <div className="row mb-2">
                    <div className="col-md-4">
                      <Row
                        label="Account Number"
                        value={formData.bankAccountDetails.accountNumber}
                      />
                    </div>
                    <div className="col-md-4">
                      <Row
                        label="Account Holder Name"
                        value={formData.bankAccountDetails.accountHolderName}
                      />
                    </div>
                    <div className="col-md-4">
                      <Row label="IFSC Code" value={formData.bankAccountDetails.ifscCode} />
                    </div>
                    <div className="col-md-4">
                      <Row label="Bank Name" value={formData.bankAccountDetails.bankName} />
                    </div>
                    <div className="col-md-4">
                      <Row label="Branch Name" value={formData.bankAccountDetails.branchName} />
                    </div>
                    <div className="col-md-4">
                      <Row label="PAN Card" value={formData.bankAccountDetails.panCardNumber} />
                    </div>
                  </div>
                </Section>

                {/* Documents */}
                <Section title="Documents">
                  <div className="row">
                    {formData.qualificationOrCertifications != '' ? (
                      <div className="col-md-6">
                        <FilePreview
                          label="Qualification / NursingDegreeOrDiplomaCertificate"
                          type={formData.nursingDegreeOrDiplomaCertificateType}
                          data={formData.nursingDegreeOrDiplomaCertificate}
                        />
                      </div>
                    ) : (
                      <p className="col-md-6">Not Provided qualification/Certifications</p>
                    )}
                    {formData.medicalFitnessCertificate != '' ? (
                      <div className="col-md-6">
                        <FilePreview
                          label="Medical Fitness Certificate"
                          type={formData.medicalFitnessCertificate || 'application/pdf'}
                          data={formData.medicalFitnessCertificate}
                        />
                      </div>
                    ) : (
                      <p className="col-md-6">Not Provided Medical Fitness Certificate</p>
                    )}
                    {formData.nursingCouncilRegistration != '' ? (
                      <div className="col-md-6">
                        <FilePreview
                          label="Nursing Council Registration"
                          type={formData.nursingCouncilRegistration || 'application/pdf'}
                          data={formData.nursingCouncilRegistration}
                        />
                      </div>
                    ) : (
                      <p className="col-md-6">Nursing Council Registration not provided</p>
                    )}
                  </div>
                </Section>

                <div className="mt-4"></div>

                {/* Other Info */}
                <Section title="Other Information">
                  <div className="row mb-2">
                    <div className="col-md-6">
                      <Row label="Vaccination Status" value={formData.vaccinationStatus} />
                    </div>
                    <div className="col-md-12">
                      <RowFull
                        label="Previous Employment"
                        value={formData.previousEmploymentHistory}
                      />
                    </div>
                  </div>
                </Section>
              </div>
            </div>
          ) : (
            // ✅ EDIT MODE
            <CForm>
              {/* 🔹 Basic Info */}
              <h5>Basic Information</h5>

              <div className="row mb-3">
                <div className="col-md-4">
                  <div className="row">
                    <div className="col-md-5">
                      <CFormLabel>
                        ClinicID <span style={{ color: 'red' }}>*</span>
                      </CFormLabel>
                      <CFormInput
                        value={clinicId}
                        disabled
                        onChange={(e) => handleChange('clinicId', e.target.value)}
                      />
                    </div>
                    <div className="col-md-7">
                      <CFormLabel>
                        Role <span style={{ color: 'red' }}>*</span>
                      </CFormLabel>
                      <CFormInput
                        value={formData.role}
                        disabled
                        onChange={(e) => handleChange('role', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <CFormLabel>
                    Full Name <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                                     value={formData.fullName}
                                     onChange={(e) => {
                                       const value = e.target.value;
                                   
                                       // Update the form value
                                       handleChange('fullName', value);
                                   
                                       // Run validation from your validators file
                                       const error = validateField('fullName', value);
                                   
                                       // Update errors state for live feedback
                                       setErrors((prev) => ({ ...prev, fullName: error }));
                                     }}
                                   />
                                   {errors.fullName && (
                                     <div className="text-danger mt-1">{errors.fullName}</div>
                                   )}
                </div>
                <div className="col-md-4">
                  <CFormLabel>
                    Gender <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormSelect
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </CFormSelect>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <CFormLabel>
                    Date of Birth <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="date"
                    value={formData.dateOfBirth}
                    max={
                      new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                        .toISOString()
                        .split('T')[0]
                    } // ✅ only allow DOB ≤ today-18yrs
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <CFormLabel>
                    Contact Number <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
               <CFormInput
  type="text"
  maxLength={10} // Restrict to 10 digits
  value={formData.nurseContactNumber}
  onChange={(e) => {
    const value = e.target.value
    // Allow only digits
    if (/^\d*$/.test(value)) {
      handleChange('nurseContactNumber', value)
    }
    // Validate on change
    const error = validateField('nurseContactNumber', value)
    setErrors(prev => ({ ...prev, nurseContactNumber: error }))
  }}
/>
{errors.nurseContactNumber && (
  <small className="text-danger">{errors.nurseContactNumber}</small>
)}

                </div>
                <div className="col-md-4">
                  <CFormLabel>
                    Email <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormInput
  type="email"
  value={formData.emailId}
  onChange={(e) => {
    const value = e.target.value;
    handleChange('emailId', value);

    // Validate on change
    const error = validateField('emailId', value);
    setErrors(prev => ({ ...prev, emailId: error }));
  }}
/>
{errors.emailId && <small className="text-danger">{errors.emailId}</small>}

                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <CFormLabel>
                    GovernmentID(AadharCard No) <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                 <CFormInput
  maxLength={12}
  value={formData.governmentId}
  onChange={(e) => {
    const value = e.target.value;
    // Allow only digits while typing
    if (/^\d*$/.test(value)) {
      handleChange('governmentId', value);

      // Validate on change
      const error = validateField('governmentId', value);
      setErrors(prev => ({ ...prev, governmentId: error }));
    }
  }}
/>
{errors.governmentId && <small className="text-danger">{errors.governmentId}</small>}

                </div>

                <div className="col-md-4">
                  <CFormLabel>
                    Nursing Council Registration<span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                 <CFormInput
  value={capitalizeWords(formData.nursingCouncilRegistration)}
  onChange={(e) => {
    const value = e.target.value;
    handleChange('nursingCouncilRegistration', value);

    // ✅ Validate using validators.js
    const error = validateField('nursingCouncilRegistration', value);
    setErrors((prev) => ({ ...prev, nursingCouncilRegistration: error }));
  }}
/>
{errors.nursingCouncilRegistration && (
  <div style={{ color: 'red', fontSize: '0.8rem' }}>
    {errors.nursingCouncilRegistration}
  </div>
)}

                </div>

                <div className="col-md-4">
                  <CFormLabel>
                    Date of Joining <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormInput
  type="date"
  value={formData.dateOfJoining}
  onChange={(e) => {
    const value = e.target.value;
    handleChange('dateOfJoining', value);

    // Validate using switch case
    const error = validateField('dateOfJoining', value);
    setErrors((prev) => ({ ...prev, dateOfJoining: error }));
  }}
/>
{errors.dateOfJoining && (
  <div style={{ color: 'red', fontSize: '0.8rem' }}>
    {errors.dateOfJoining}
  </div>
)}

                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <CFormLabel>
                    Department<span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                <CFormInput
  value={capitalizeWords(formData.department)}
  onChange={(e) => {
    const value = e.target.value;
    handleChange('department', value);

    // ✅ Validate using switch case
    const error = validateField('department', value);
    setErrors((prev) => ({ ...prev, department: error }));
  }}
/>
{errors.department && (
  <div style={{ color: 'red', fontSize: '0.8rem' }}>
    {errors.department}
  </div>
)}

                </div>
                <div className="col-md-4">
                  <CFormLabel>
                    Years of Experience <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                 <CFormInput
  type="number"
  value={formData.yearsOfExperience}
  onChange={(e) => {
    const value = e.target.value;
    handleChange('yearsOfExperience', value);

    // ✅ Validate using switch case
    const error = validateField('yearsOfExperience', value);
    setErrors((prev) => ({ ...prev, yearsOfExperience: error }));
  }}
/>
{errors.yearsOfExperience && (
  <div style={{ color: 'red', fontSize: '0.8rem' }}>
    {errors.yearsOfExperience}
  </div>
)}

                </div>
                <div className="col-md-4">
                  <CFormLabel>Qualifications</CFormLabel>
                 <CFormInput
  value={capitalizeWords(formData.qualifications)}
  onChange={(e) => {
    const value = e.target.value;
    handleChange('qualifications', value);

    const error = validateField('qualifications', value);
    setErrors((prev) => ({ ...prev, qualifications: error }));
  }}
/>
{errors.qualifications && (
  <div style={{ color: 'red', fontSize: '0.8rem' }}>
    {errors.qualifications}
  </div>
)}

                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <CFormLabel>
                    Shift Timings / Availability <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                <CFormSelect
  value={formData.shiftTimingOrAvailability}
  onChange={(e) => {
    const value = e.target.value;
    handleChange('shiftTimingOrAvailability', value);

    const error = validateField('shiftTimingOrAvailability', value);
    setErrors((prev) => ({ ...prev, shiftTimingOrAvailability: error }));
  }}
>
  <option value="">Select Shift</option>
  <option value="06:00-12:00">Morning (06:00 AM – 12:00 PM) – 6 hrs</option>
  <option value="12:00-18:00">Afternoon (12:00 PM – 06:00 PM) – 6 hrs</option>
  <option value="18:00-00:00">Evening (06:00 PM – 12:00 AM) – 6 hrs</option>
  <option value="00:00-06:00">Night (12:00 AM – 06:00 AM) – 6 hrs</option>
  <option value="06:00-15:00">Day Shift (06:00 AM – 03:00 PM) – 9 hrs</option>
  <option value="15:00-00:00">Evening Shift (03:00 PM – 12:00 AM) – 9 hrs</option>
  <option value="21:00-06:00">Night Shift (09:00 PM – 06:00 AM) – 9 hrs</option>
  <option value="06:00-18:00">Long Day (06:00 AM – 06:00 PM) – 12 hrs</option>
  <option value="18:00-06:00">Long Night (06:00 PM – 06:00 AM) – 12 hrs</option>
</CFormSelect>

{errors.shiftTimingOrAvailability && (
  <div style={{ color: 'red', fontSize: '0.8rem' }}>
    {errors.shiftTimingOrAvailability}
  </div>
)}

                </div>

                <div className="col-md-4">
                  <CFormLabel>Emergency Contact</CFormLabel>

                 <CFormInput
  type="text"
  maxLength={10}
  value={formData.emergencyContactNumber}
  onChange={(e) => {
    const value = e.target.value;
    // Allow only digits while typing
    if (/^\d*$/.test(value)) {
      handleChange('emergencyContactNumber', value);

      // Validate
      const error = validateField('emergencyContactNumber', value);
      setErrors((prev) => ({ ...prev, emergencyContactNumber: error }));
    }
  }}
/>
{errors.emergencyContactNumber && (
  <div style={{ color: 'red', fontSize: '0.8rem' }}>
    {errors.emergencyContactNumber}
  </div>
)}

                </div>
                <div className="col-md-4">
                  <CFormLabel>
                    Vaccination Status <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                 <CFormSelect
  value={formData.vaccinationStatus}
  onChange={(e) => {
    const value = e.target.value;
    handleChange('vaccinationStatus', value);

    const error = validateField('vaccinationStatus', value);
    setErrors((prev) => ({ ...prev, vaccinationStatus: error }));
  }}
>
  <option value="">Select Status</option>
  <option value="Not Vaccinated">Not Vaccinated</option>
  <option value="Partially Vaccinated">Partially Vaccinated</option>
  <option value="Fully Vaccinated">Fully Vaccinated</option>
</CFormSelect>

{errors.vaccinationStatus && (
  <div style={{ color: 'red', fontSize: '0.8rem' }}>
    {errors.vaccinationStatus}
  </div>
)}

                </div>
              </div>

              {/* 🔹 Address */}
               <h5 className="mt-3">Address</h5>
                                       
                                       {Object.keys(formData.address)
                                         .reduce((rows, field, index) => {
                                           if (index % 3 === 0) rows.push([]); // start new row every 3 fields
                                           rows[rows.length - 1].push(field);
                                           return rows;
                                         }, [])
                                         .map((rowFields, rowIndex) => (
                                           <div className="row mb-3" key={rowIndex}>
                                             {rowFields.map((field) => (
                                               <div className="col-md-4" key={field}>
                                                 <CFormLabel className="text-capitalize">
                                                   {field} <span style={{ color: 'red' }}>*</span>
                                                 </CFormLabel>
                                                 <CFormInput
                                                   type="text"
                                                   maxLength={field === 'postalCode' ? 6 : undefined}
                                                   value={capitalizeWords(formData.address[field])}
                                                   onChange={(e) => {
                                                     let value = e.target.value;
                                                     if (field === 'postalCode') {
                                                       // Only digits allowed
                                                       if (/^\d*$/.test(value)) {
                                                         handleNestedChange('address', field, value);
                                                         // Live validation
                                                         const err = validateField(field, value, formData);
                                                         setErrors((prev) => ({
                                                           ...prev,
                                                           address: { ...prev.address, [field]: err },
                                                         }));
                                                       }
                                                     } else {
                                                       handleNestedChange('address', field, value);
                                                       // Live validation
                                                       const err = validateField(field, value, formData);
                                                       setErrors((prev) => ({
                                                         ...prev,
                                                         address: { ...prev.address, [field]: err },
                                                       }));
                                                     }
                                                   }}
                                                 />
                                                 {errors.address?.[field] && (
                                                   <div className="text-danger mt-1">{errors.address[field]}</div>
                                                 )}
                                               </div>
                                             ))}
                                           </div>
                                         ))}

              {/* 🔹 Bank Details */}
             <h5 className="mt-3">Bank Account Details</h5>
                                    {Object.keys(formData.bankAccountDetails)
                                      .reduce((rows, field, index) => {
                                        if (index % 3 === 0) rows.push([]); // start new row every 3 fields
                                        rows[rows.length - 1].push(field);
                                        return rows;
                                      }, [])
                                      .map((rowFields, rowIndex) => (
                                        <div className="row mb-3" key={rowIndex}>
                                          {rowFields.map((field) => (
                                            <div className="col-md-4" key={field}>
                                              <CFormLabel className="text-capitalize">
                                                {field} <span style={{ color: 'red' }}>*</span>
                                              </CFormLabel>
                                              <CFormInput
                                                value={formData.bankAccountDetails[field]}
                                                maxLength={
                                                  field === 'accountNumber'
                                                    ? 20
                                                    : field === 'panCardNumber'
                                                      ? 10
                                                      : field === 'ifscCode'
                                                        ? 11
                                                        : undefined
                                                }
                                                onChange={async (e) => {
                                                  let value = e.target.value;
                                    
                                                  // Account Number → only digits
                                                  if (field === 'accountNumber') {
                                                    if (/^\d*$/.test(value)) handleNestedChange('bankAccountDetails', field, value);
                                                  }
                                                  // PAN → uppercase, specific format
                                                  else if (field === 'panCardNumber') {
                                                    value = value.toUpperCase();
                                                    if (/^[A-Z]{0,5}[0-9]{0,4}[A-Z]{0,1}$/.test(value))
                                                      handleNestedChange('bankAccountDetails', field, value);
                                                  }
                                                  // IFSC → uppercase, alphanumeric
                                                  else if (field === 'ifscCode') {
                                                    value = value.toUpperCase();
                                                    if (/^[A-Z0-9]*$/.test(value)) handleNestedChange('bankAccountDetails', field, value);
                                                  }
                                                  // Other fields
                                                  else {
                                                    handleNestedChange('bankAccountDetails', field, value);
                                                  }
                                    
                                                  // Live validation
                                                  const error = validateField(field, value, formData);
                                                  setErrors((prev) => ({
                                                    ...prev,
                                                    bankAccountDetails: {
                                                      ...prev.bankAccountDetails,
                                                      [field]: error,
                                                    },
                                                  }));
                                                }}
                                                onBlur={async () => {
                                                  const value = formData.bankAccountDetails[field];
                                                  const error = validateField(field, value, formData);
                                                  setErrors((prev) => ({
                                                    ...prev,
                                                    bankAccountDetails: {
                                                      ...prev.bankAccountDetails,
                                                      [field]: error,
                                                    },
                                                  }));
                                    
                                                  // Special handling for PAN
                                                  if (field === 'panCardNumber' && value.length === 10) {
                                                    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
                                                    if (!panRegex.test(value)) toast.error('Invalid PAN format (e.g., ABCDE1234F)');
                                                  }
                                    
                                                  // Special handling for IFSC
                                                  if (field === 'ifscCode' && value.length === 11) {
                                                    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
                                                    if (!ifscRegex.test(value)) {
                                                      toast.error('Invalid IFSC format (e.g., HDFC0001234)');
                                                      handleNestedChange('bankAccountDetails', 'bankName', '');
                                                      handleNestedChange('bankAccountDetails', 'branchName', '');
                                                    } else {
                                                      try {
                                                        const res = await fetch(`https://ifsc.razorpay.com/${value}`);
                                                        if (res.ok) {
                                                          const data = await res.json();
                                                          handleNestedChange('bankAccountDetails', 'bankName', data.BANK || '');
                                                          handleNestedChange('bankAccountDetails', 'branchName', data.BRANCH || '');
                                                        }
                                                      } catch (err) {
                                                        toast.error('Error fetching bank details');
                                                        handleNestedChange('bankAccountDetails', 'bankName', '');
                                                        handleNestedChange('bankAccountDetails', 'branchName', '');
                                                      }
                                                    }
                                                  }
                                                }}
                                              />
                                              {errors.bankAccountDetails?.[field] && (
                                                <div className="text-danger mt-1">{errors.bankAccountDetails[field]}</div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      ))}
                        

              {/* 🔹 Documents */}
              <h5 className="mt-3">Documents</h5>

              <div className="row mb-3">
                {/* Profile Image */}
                <div className="col-md-4 mb-3">
                  <CFormLabel>
                    Profile Image <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                <CFormInput
  type="file"
  accept="image/*"
  onChange={async (e) => {
    const file = e.target.files[0];

    if (file) {
      const base64 = await toBase64(file);
      handleChange('profilePicture', base64); // store in formData

      // ✅ Use validator from validators.js
      const error = validateField('profilePicture', base64);
      setErrors((prev) => ({ ...prev, profilePicture: error }));
    } else {
      // file cleared
      handleChange('profilePicture', '');
      setErrors((prev) => ({ ...prev, profilePicture: 'Profile Image is required.' }));
    }
  }}
/>

{/* Display error message */}
{errors.profilePicture && (
  <div style={{ color: 'red', fontSize: '0.8rem' }}>{errors.profilePicture}</div>
)}

                </div>

                {/* Nursing License */}
                <div className="col-md-4 mb-3">
                  <CFormLabel>
                    Nursing License <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormInput
  type="file"
  accept=".pdf,.jpg,.jpeg,.png"
  onChange={async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Convert file to Base64
    const base64 = await toBase64(file);
    handleChange('nursingLicense', base64);

    // Run existing validator
    const error = validateField('nursingLicense', base64);
    setErrors((prev) => ({ ...prev, nursingLicense: error }));
  }}
/>

{/* Display error */}
{errors.nursingLicense && (
  <div style={{ color: 'red', fontSize: '0.8rem' }}>
    {errors.nursingLicense}
  </div>
)}

                </div>

                {/* Medical Fitness Certificate */}
                <div className="col-md-4 mb-3">
                  <CFormLabel>Medical Fitness Certificate</CFormLabel>
                  <CFormInput
                    type="file"
                    onChange={(e) => handleFileUpload(e, 'medicalFitnessCertificate')}
                  />
                </div>

                {/* Qualification / Certifications */}
                <div className="col-md-4 mb-3">
                  <CFormLabel>Qualification/Nursing Certificate<span style={{ color: 'red' }}>*</span>

                  </CFormLabel>
                  <CFormInput
                    type="file"
                    onChange={(e) => handleFileUpload(e, 'nursingDegreeOrDiplomaCertificate')}
                  />
                </div>
              </div>

              <CFormLabel>Previous Employment History</CFormLabel>
              <CFormTextarea
                rows={3} // you can adjust height
                value={formData.nursePreviousEmploymentHistory} // updated field name
                onChange={(e) => handleChange('nursePreviousEmploymentHistory', e.target.value)}
              />

              <div
                className="mb-3 w-100 mt-4"
                style={{
                  display: 'flex',
                  justifyContent: 'end',
                  alignContent: 'end',
                  alignItems: 'end',
                }}
              >
                <CButton
                  style={{
                    color: 'var(--color-black)',
                    backgroundColor: 'var(--color-bgcolor)',
                  }}
                  onClick={handleUserPermission}
                >
                  User Permissions
                </CButton>
              </div>
              <UserPermissionModal
                show={showPModal}
                onClose={() => setShowPModal(false)}
                features={features}
                actions={actions}
                permissions={formData.permissions}
                toggleFeature={toggleFeature}
                toggleAllActions={toggleAllActions}
                togglePermission={togglePermission}
                onSave={() => {
                  console.log('Saved Permissions', formData.permissions)
                  setShowPModal(false)
                }}
              />

              <UserPermissionModal
                show={showPModal}
                onClose={() => setShowPModal(false)}
                features={features}
                actions={actions}
                permissions={formData.permissions}
                toggleFeature={toggleFeature}
                toggleAllActions={toggleAllActions}
                togglePermission={togglePermission}
                onSave={() => {
                  console.log('Saved Permissions', formData.permissions)
                  setShowPModal(false)
                }}
              />
            </CForm>
          )}
        </CModalBody>
        <CModalFooter>
          {viewMode ? (
            <CButton color="secondary" onClick={onClose}>
              Close
            </CButton>
          ) : (
            <>
              <CButton
                style={{ backgroundColor: 'var(--color-bgcolor)', color: 'var(--color-black)' }}
                onClick={() => setFormData(emptyForm)}
              >
                Clear
              </CButton>
              <CButton color="secondary" onClick={onClose}>
                Cancel
              </CButton>
              <CButton
                style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
                onClick={handleSubmit}
              >
                Save
              </CButton>
            </>
          )}
        </CModalFooter>
      </CModal>

      {/* 🔹 Preview Modal */}
      <CModal visible={showModal} onClose={handleCloseModal} size="xl">
        <CModalHeader onClose={handleCloseModal}>
          <strong>{isPreviewPdf ? 'PDF Preview' : 'Image Preview'}</strong>
        </CModalHeader>
        <CModalBody className="text-center">
          {isPreviewPdf ? (
            <iframe
              src={previewFileUrl}
              title="PDF Preview"
              style={{ width: '100%', height: '80vh', border: 'none' }}
            />
          ) : (
            <img
              src={previewFileUrl}
              alt="Preview"
              style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px' }}
            />
          )}
        </CModalBody>
      </CModal>

      {/* 🔹 Permissions */}
    </>
  )
}

export default NurseForm