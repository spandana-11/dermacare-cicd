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
import UserPermissionModal from '../UserPermissionModal'
import { validateField } from '../../../Utils/Validators'


const PharmacistForm = ({
  visible,
  onClose,
  onSave,
  editData,
  initialData,
  viewMode,
  pharmacists,
  fetchTechs,
}) => {
  const emptyPermissions = {
    viewPatients: false,
    manageInventory: false,
    accessReports: false,
  } // ✅ no feature is selected by default

  const emptyForm = {
    hospitalId: localStorage.getItem('HospitalId'),
    branchId: localStorage.getItem('branchId'),
    hospitalName: localStorage.getItem('HospitalName'),
    fullName: '',
    gender: '',
    dateOfBirth: '',
    contactNumber: '',
    emailID: '',
    governmentId: '',
    dPharmaOrBPharmaCertificate: '',
    experienceCertificates: '',
    statePharmacyCouncilRegistration: '',
    dateOfJoining: '',
    department: '',
    qualification: '',
    specialization: '',
    role: 'pharmacist',
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
    profilePicture: '',
    pharmacyLicense: '',
    previousEmploymentHistory: '',
    permissions: emptyPermissions,
  }

  // 🔹 State
  const [formData, setFormData] = useState(emptyForm)
  const [hospitalId, setHospitalId] = useState(localStorage.getItem('HospitalId'))

  const [showModal, setShowModal] = useState(false)
  const [showPModal, setShowPModal] = useState(false)
  const [previewFileUrl, setPreviewFileUrl] = useState(null)
  const [isPreviewPdf, setIsPreviewPdf] = useState(false)
  const [pharmacist, setPharmacist] = useState([]) // ✅ correct name
  const [errors, setErrors] = useState({});



  // Mandatory fields
  const mandatoryFields = [
    'fullName',
    'gender',
    'dateOfBirth',
    'contactNumber',
    'emailID',
    'governmentId',
    'dateOfJoining',
    'department',
    'hospitalId',
    'profilePicture',
    'role',
    'specialization',
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
      reader.readAsDataURL(file) // ✅ Converts file to base64 with data:image/... prefix
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        address: { ...emptyForm.address, ...(initialData.address || {}) },
        bankAccountDetails: {
          ...emptyForm.bankAccountDetails,
          ...(initialData.bankAccountDetails || {}),
        },
        permissions: { ...emptyPermissions, ...(initialData.permissions || {}) },
      }))
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

    // Age validation
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - dob.getFullYear()
      const isBeforeBirthday =
        today.getMonth() < dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
      const actualAge = isBeforeBirthday ? age - 1 : age
      if (actualAge < 18) {
        toast.error('Technician must be at least 18 years old.')
        return
      }
    }

    // Mobile validation
    const mobileRegex = /^[6-9]\d{9}$/
    if (!mobileRegex.test(formData.contactNumber)) {
      toast.error('Contact number must be 10 digits and start with 6-9.')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.emailID)) {
      toast.error('Please enter a valid email address.')
      return
    }

    // Duplicate checks
    const duplicateContact = pharmacists?.some(
      (t) => t.contactNumber === formData.contactNumber && t.pharmacistId !== formData.pharmacistId,
    )
    if (duplicateContact) {
      toast.error('Contact number already exists!')
      return
    }

    const duplicateEmail = pharmacist.some(
      (t) => t.emailID === formData.emailID && t.pharmacistId !== formData.pharmacistId,
    )
    if (duplicateEmail) {
      toast.error('Email already exists!')
      return
    }
    // Permissions check
    // Permissions check (Mandatory only for Add, optional for Edit)
    if (!formData.pharmacistId) {
      const hasAtLeastOnePermission = Object.values(formData.permissions || {}).some((value) => {
        if (Array.isArray(value)) return value.length > 0
        return Boolean(value)
      })

      if (!hasAtLeastOnePermission) {
        toast.error('Please assign at least one user permission before saving.')
        return
      }
    }

    // Save
    console.log('Saving pharmacist data:', formData)
    onSave(formData)
    if (!formData.pharmacistId) setFormData(emptyForm)
    onClose()
  }

  const handleUserPermission = () => {
    const missing = validateMandatoryFields(formData, mandatoryFields)

    if (missing.length > 0) {
      toast.error(`Please fill required fields: ${missing.join(', ')}`)
      return
    }

    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - dob.getFullYear()
      const isBeforeBirthday =
        today.getMonth() < dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())

      const actualAge = isBeforeBirthday ? age - 1 : age

      if (actualAge < 18) {
        toast.error('Technician must be at least 18 years old.')
        return
      }
    }

    const mobileRegex = /^[6-9]\d{9}$/
    if (!mobileRegex.test(formData.contactNumber)) {
      toast.error('Contact number must be 10 digits and start with 6-9.')
      return
    }

    // ✅ Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.emailID)) {
      toast.error('Please enter a valid email address.')
      return
    }

    const duplicateContact = pharmacists?.some(
      (t) => t.contactNumber === formData.contactNumber && t.pharmacistId !== formData.pharmacistId,
    )
    if (duplicateContact) {
      toast.error('Contact number already exists!')
      return
    }

    const duplicateEmail = pharmacists?.some(
      (t) => t.emailID === formData.emailID && t.pharmacistId !== formData.pharmacistId,
    )
    if (duplicateEmail) {
      toast.error('Email already exists!')
      return
    }
    console.log(formData)
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
  const previewPdf = (base64String) => {
    if (!base64String) return
    const pdfData = `data:application/pdf;base64,${base64String.split(',')[1] || base64String}`
    setPreviewFileUrl(pdfData)
    setIsPreviewPdf(true)
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

  const FilePreview = ({ label, type, data }) => {
    if (!data) return <p>{label} </p>

    const isImage = type?.startsWith('image/')
    const fileUrl = data.startsWith('data:') ? data : `data:${type};base64,${data}`

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
          <CModalTitle>{viewMode ? 'Personal Information' : 'Add / Edit Pharmacist '}</CModalTitle>
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
                    <span className="fw-bold ">Email : </span>
                    <span>{formData.emailID}</span>
                  </div>

                  <div>
                    <span className="fw-bold">Contact : </span>
                    <span>{formData.contactNumber}</span>
                  </div>
                </div>

                {/* Right Side: Image + ID */}
                <div className="text-center">
                  {formData.profilePicture ? (
                    <img
                      src={formData.profilePicture || '/assets/images/default-avatar.png'}
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
                    ID: {formData.pharmacistId}
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
                    <Row label="Email" value={formData.emailID} />
                  </div>
                  <div className="col-md-4">
                    <Row label="Contact" value={formData.contactNumber} />
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
                      <Row label="Specialization" value={formData.specialization} />
                    </div>

                    <div className="col-md-4">
                      <Row label="Emergency Contact" value={formData.emergencyContactNumber} />
                    </div>
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
                    {formData.dPharmaOrBPharmaCertificate != '' ? (
                      <div className="col-md-6">
                        <FilePreview
                          label="dPharmaOrBPharmaCertificate"
                          type={formData.dPharmaOrBPharmaCertificateType || 'application/pdf'}
                          data={formData.dPharmaOrBPharmaCertificate}
                        />
                      </div>
                    ) : (
                      <p className="col-md-6">Not Provided dPharmaOrBPharmaCertificate</p>
                    )}
                    {formData.statePharmacyCouncilRegistration != '' ? (
                      <div className="col-md-6">
                        <FilePreview
                          label="statePharmacyCouncilRegistration"
                          type={formData.statePharmacyCouncilRegistrationType || 'application/pdf'}
                          data={formData.statePharmacyCouncilRegistration}
                        />
                      </div>
                    ) : (
                      <p className="col-md-6">Not Provided statePharmacyCouncilRegistration</p>
                    )}
                    {formData.experienceCertificates != '' ? (
                      <div className="col-md-6">
                        <FilePreview
                          label="experienceCertificates"
                          type={formData.experienceCertificatesType || 'application/pdf'}
                          data={formData.experienceCertificates}
                        />
                      </div>
                    ) : (
                      <p className="col-md-6">Not Provided experienceCertificates</p>
                    )}
                  </div>
                </Section>
                <div className="mt-4"></div>
                {/* Other Info */}
                <Section title="Other Information ">
                  <div className="row mb-2">
                    <div className="col-md-4">
                      <Row label="Pharmacy License" value={formData.pharmacyLicense} />
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
                        value={hospitalId}
                        disabled
                        onChange={(e) => handleChange('hospitalId', e.target.value)}
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
                    value={formData.contactNumber}
                    onChange={(e) => {
                      const value = e.target.value;

                      // Allow only digits
                      if (/^\d*$/.test(value)) {
                        handleChange('contactNumber', value);

                        // Live validation using your existing function
                        const err = validateField('contactNumber', value);
                        setErrors((prev) => ({ ...prev, contactNumber: err }));
                      }
                    }}
                  />
                  {errors.contactNumber && (
                    <div className="text-danger mt-1">{errors.contactNumber}</div>
                  )}
                </div>
                <div className="col-md-4">
                  <CFormLabel>
                    Email <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="email"
                    value={formData.emailID}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleChange('emailID', value);

                      // Run live validation
                      const err = validateField('emailID', value);
                      setErrors((prev) => ({ ...prev, emailID: err }));
                    }}
                  />
                  {errors.emailID && (
                    <div className="text-danger mt-1">{errors.emailID}</div>
                  )}
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
                      // ✅ Only numbers allowed, max 12
                      if (/^\d*$/.test(value)) {
                        handleChange('governmentId', value);

                        // Run live validation
                        const err = validateField('governmentId', value);
                        setErrors((prev) => ({ ...prev, governmentId: err }));
                      }
                    }}
                  />
                  {errors.governmentId && (
                    <div className="text-danger mt-1">{errors.governmentId}</div>
                  )}

                </div>
                <div className="col-md-4">
                  <CFormLabel>Pharmacy License</CFormLabel>
                  <CFormInput
                    type="text"
                    value={formData.pharmacyLicense}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleChange('pharmacyLicense', value);

                      // ✅ Inline validation
                      const error = validateField('pharmacyLicense', value);
                      setErrors((prev) => ({ ...prev, pharmacyLicense: error })); // store error in state
                    }}
                  />
                  {errors.pharmacyLicense && (
                    <div className="text-danger mt-1">{errors.pharmacyLicense}</div>
                  )}


                </div>

                <div className="col-md-4">
                  <CFormLabel>
                    Date of Joining <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="date"
                    value={formData.dateOfJoining}
                    onChange={(e) => handleChange('dateOfJoining', e.target.value)}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  {' '}
                  <CFormLabel>Department<span style={{ color: 'red' }}>*</span></CFormLabel>
                  <CFormInput
                    value={capitalizeWords(formData.department)}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleChange('department', value);

                      // ✅ Validate using validators.js
                      const error = validateField('department', value);
                      setErrors((prev) => ({ ...prev, department: error }));
                    }}
                  />
                  {errors.department && (
                    <div className="text-danger mt-1">{errors.department}</div>
                  )}

                </div>

                <div className="col-md-4">
                  {' '}
                  <CFormLabel>Specialization<span style={{ color: 'red' }}>*</span></CFormLabel>
                  <CFormInput
                    value={capitalizeWords(formData.specialization)}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleChange('specialization', value);

                      // ✅ Validate using validators.js
                      const error = validateField('specialization', value);
                      setErrors((prev) => ({ ...prev, specialization: error }));
                    }}
                  />
                  {errors.specialization && (
                    <div className="text-danger mt-1">{errors.specialization}</div>
                  )}

                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <CFormLabel>Emergency Contact<span style={{ color: 'red' }}>*</span></CFormLabel>

                  <CFormInput
                    type="text"
                    maxLength={10}
                    value={formData.emergencyContactNumber}
                    onChange={(e) => {
                      const value = e.target.value
                      // Allow only digits
                      if (/^\d*$/.test(value)) {
                        handleChange('emergencyContactNumber', value)
                      }
                      // Validate on change
                      const error = validateField('emergencyContactNumber', value)
                      setErrors(prev => ({ ...prev, emergencyContactNumber: error }))
                    }}
                  />
                  {errors.emergencyContactNumber && (
                    <small className="text-danger">{errors.emergencyContactNumber}</small>
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
                {/* Profile Picture */}
                <div className="col-md-4">
                  <CFormLabel>
                    Profile Picture
                    <span className="text-danger">*</span>
                  </CFormLabel>
                  {formData.profilePicture && (
                    <div className="mb-2">
                      <img
                        src={formData.profilePicture}
                        alt="Profile"
                        width="80"
                        height="80"
                        style={{
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '1px solid var(--color-black)',
                        }}
                      />
                      <br />
                      <a
                        href={formData.profilePicture}
                        download="profile-picture"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download
                      </a>
                    </div>
                  )}
                  <CFormInput
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0]
                      if (file) {
                        const base64 = await toBase64(file)
                        handleChange('profilePicture', base64) // update state
                      }
                    }}
                  />
                </div>

                {/* State Pharmacy Council Registration */}
                <div className="col-md-4">
                  <CFormLabel>dPharma/BPharma Certificate</CFormLabel>
                  <CFormInput
                    type="file"
                    onChange={(e) => handleFileUpload(e, 'dPharmaOrBPharmaCertificate')}
                  />
                </div>
                <div className="col-md-4">
                  <CFormLabel>statePharmacyCouncilRegistration</CFormLabel>
                  <CFormInput
                    type="file"
                    onChange={(e) => handleFileUpload(e, 'statePharmacyCouncilRegistration')}
                  />
                </div>
                <div className="col-md-4">
                  <CFormLabel>Experience Certificate</CFormLabel>
                  <CFormInput
                    type="file"
                    onChange={(e) => handleFileUpload(e, 'experienceCertificates')}
                  />
                </div>

                {/* D Pharma / B Pharma Certificate */}
              </div>

              <CFormLabel>Previous Employment History</CFormLabel>
              <CFormTextarea
                rows={3} // you can adjust height
                value={formData.previousEmploymentHistory}
                onChange={(e) => handleChange('previousEmploymentHistory', e.target.value)}
                placeholder="Enter previous employment history"
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

export default PharmacistForm
