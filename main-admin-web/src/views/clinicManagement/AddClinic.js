import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CFormLabel,
  CFormInput,
  CFormFeedback,
  CFormSelect,
  CButton,
  CRow,
  CCol,
  CTooltip,
  CFormCheck,
} from '@coreui/react'
import { BASE_URL, subService_URL, getService } from '../../baseUrl'
import { CategoryData } from '../categoryManagement/CategoryAPI'
import Select from 'react-select'
import sendDermaCareOnboardingEmail from '../../Utils/Emailjs'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import FileInputWithRemove from './FileInputWithRemove'

const AddClinic = () => {
  const navigate = useNavigate()
  const [errors, setErrors] = useState({})
  const [backendErrors, setBackendErrors] = ''
  const [categories, setCategories] = useState([])
  const [serviceOptions, setServiceOptions] = useState([])
  const [selectedOption, setSelectedOption] = useState('')
  const [selectedPharmacistOption, setSelectedPharmacistOption] = useState('')
  const [clinicTypeOption, setClinicTypeOption] = useState('')

  // setSelectedPharmacistOption
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    contactNumber: '',
    // hospitalRegistrations: '',
    openingTime: '',
    closingTime: '',
    hospitalLogo: null,
    emailAddress: '',
    website: '',
    licenseNumber: '',
    issuingAuthority: '',
    recommended: false,
    hospitalDocuments: [],
    // hospitalcategory: [],
    hospitalContract: [],

    clinicalEstablishmentCertificate: null,
    businessRegistrationCertificate: null,
    clinicType: '',
    medicinesSoldOnSite: '',
    drugLicenseCertificate: null,
    drugLicenseFormType: null,
    hasPharmacist: '',
    pharmacistCertificate: null,
    biomedicalWasteManagementAuth: null,
    tradeLicense: null,
    fireSafetyCertificate: null,
    professionalIndemnityInsurance: null,
    gstRegistrationCertificate: null,
    others: null,
    instagramHandle: '',
    twitterHandle: '',
    facebookHandle: '',
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await CategoryData()

        if (response?.data) {
          setCategories(response.data)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

  const preventNumberInput = (e) => {
    const isNumber = /[0-9]/.test(e.key)
    if (isNumber) {
      e.preventDefault()
    }
  }
  const handleWebsiteBlur = () => {
    const website = formData.website.trim()

    if (!website) {
      setErrors((prev) => ({ ...prev, website: 'Website is required' }))
    } else if (!/^https?:\/\//i.test(website)) {
      setErrors((prev) => ({
        ...prev,
        website: 'Website must start with http:// or https://',
      }))
    } else if (!websiteRegex.test(website)) {
      setErrors((prev) => ({
        ...prev,
        website: 'Enter a valid website URL',
      }))
    } else {
      setErrors((prev) => ({ ...prev, website: '' }))
    }
  }
  const websiteRegex = /^(https?:\/\/)[\w\-]+(\.[\w\-]+)+[/#?]?.*$/
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
  const validateForm = () => {
    const newErrors = {}

    // Hospital Name
    if (!formData.name.trim()) {
      newErrors.name = 'Clinic name is required'
    } else if (!/^[a-zA-Z\s]{2,50}$/.test(formData.name)) {
      newErrors.name = 'Clinic name must contain only letters'
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }

    // City validation
    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    } else if (!/^[a-zA-Z\s]{2,30}$/.test(formData.city)) {
      newErrors.city = 'City name must contain only letters'
    }
    // Email validation
    if (!formData.emailAddress.trim()) {
      newErrors.emailAddress = 'Email is required'
    } else if (!emailRegex.test(formData.emailAddress.trim())) {
      newErrors.emailAddress = 'Email must contain "@" and "." in a valid format'
    }
    // Contact Number
    const phoneRegex = /^[5-9]\d{9}$/ // This regex checks if the number starts with 5-9 and is followed by 9 digits

    if (!formData.contactNumber) {
      newErrors.contactNumber = 'Contact number is required'
    } else {
      const contactNumber = formData.contactNumber.trim()
      if (contactNumber.length !== 10) {
        newErrors.contactNumber = 'Contact number must be exactly 10 digits long'
      } else if (!phoneRegex.test(contactNumber)) {
        newErrors.contactNumber = 'Contact number must start with a digit between 5 and 9'
      }
    }

    // Time validation
    if (!formData.openingTime) {
      newErrors.openingTime = 'Opening time is required'
    }

    if (!formData.closingTime) {
      newErrors.closingTime = 'Closing time is required'
    } else if (formData.openingTime && formData.closingTime <= formData.openingTime) {
      newErrors.closingTime = 'Closing time must be after opening time'
    }

    // License Number
    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required'
    }

    // Issuing Authority
    if (!formData.issuingAuthority.trim()) {
      newErrors.issuingAuthority = 'Issuing Authority is required'
    }

    // Hospital Logo
    if (!formData.hospitalLogo) {
      newErrors.hospitalLogo = 'Hospital logo is required'
    }

    // Hospital Documents
    if (!formData.hospitalDocuments || formData.hospitalDocuments.length === 0) {
      newErrors.hospitalDocuments = 'Please upload at least one document'
    }
    if (!formData.hospitalContract || formData.hospitalContract.length === 0) {
      newErrors.hospitalContract = 'Please upload at least one document'
    }
    if (!formData.clinicalEstablishmentCertificate) {
      newErrors.clinicalEstablishmentCertificate = 'Please upload at least one document'
    }
    if (!formData.businessRegistrationCertificate) {
      newErrors.businessRegistrationCertificate = 'Please upload at least one document'
    }
    if (!formData.drugLicenseCertificate && selectedOption === 'Yes') {
      newErrors.drugLicenseCertificate = 'Please upload at least one document'
    }
    if (!formData.drugLicenseFormType && selectedOption === 'Yes') {
      newErrors.drugLicenseFormType = 'Please upload at least one document'
    }
    if (!formData.pharmacistCertificate && selectedOption === 'Yes') {
      newErrors.pharmacistCertificate = 'Please upload at least one document'
    }
    if (!formData.biomedicalWasteManagementAuth) {
      newErrors.biomedicalWasteManagementAuth = 'Please upload at least one document'
    }
    if (!formData.tradeLicense) {
      newErrors.tradeLicense = 'Please upload at least one document'
    }
    if (!formData.fireSafetyCertificate) {
      newErrors.fireSafetyCertificate = 'Please upload at least one document'
    }
    if (!formData.professionalIndemnityInsurance) {
      newErrors.professionalIndemnityInsurance = 'Please upload at least one document'
    }
    if (!formData.gstRegistrationCertificate) {
      newErrors.gstRegistrationCertificate = 'Please upload at least one document'
    }
    if (!formData.others) {
      newErrors.others = 'Please upload at least one document'
    }
    if (!clinicTypeOption || clinicTypeOption.trim() === '') {
      newErrors.clinicType = 'Please select a clinic Type.'
    }
    if (!selectedOption || selectedOption.trim() === '') {
      newErrors.medicinesSoldOnSite = 'Please select  atleast one option'
    }
    if (!selectedPharmacistOption || selectedPharmacistOption.trim() === '') {
      newErrors.hasPharmacist = 'Please select  atleast one option'
    }

    if (!formData.website.trim()) {
      newErrors.website = 'Website is required.'
    } else if (!websiteRegex.test(normalizeWebsite(formData.website.trim()))) {
      newErrors.website = 'Website must start with http:// or https:// and be a valid URL'
    }

    // No `else { newErrors.website = '' }`

    console.log('Validation errors:', newErrors)
    setErrors(newErrors)
    return Object.keys(newErrors).length == 0
  }

  const downloadFile = (base64, filename, mime = 'application/pdf') => {
    const link = document.createElement('a')
    link.href = `data:${mime};base64,${base64}`
    link.download = filename
    link.click()
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear the error once the field is updated
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }))
  }

  const handleFileChange = async (e) => {
    const { name, files } = e.target
    const file = files[0]

    if (!file) return

    // Save the file object for displaying name in UI
    setFormData((prev) => ({
      ...prev,
      [name]: file, // keep original file for UI
    }))
    setErrors((prev) => ({ ...prev, [name]: '' }))

    const stripBase64Prefix = (base64) => base64.split(',')[1]

    const convertToBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = (error) => reject(error)
      })
    }

    try {
      const base64File = await convertToBase64(file)
      const cleanBase64 = stripBase64Prefix(base64File)

      // Save base64 under a different key for submission
      setFormData((prev) => ({
        ...prev,
        [`${name}Base64`]: cleanBase64,
      }))
    } catch (error) {
      console.error('File conversion error:', error)
      setErrors((prev) => ({
        ...prev,
        [name]: 'File conversion failed',
      }))
    }
  }

  const handleEmailBlur = () => {
    const email = formData.emailAddress.trim()
    if (!email.includes('@')) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        emailAddress: 'Email must contain "@" symbol',
      }))
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        emailAddress: '',
      }))
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    // Remove error while typing
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }
  const normalizeWebsite = (url) => {
    // If starts with www. or does not have protocol, prepend https://
    if (!/^https?:\/\//i.test(url)) {
      return 'https://' + url
    }
    return url
  }
  console.log('submit button clicked')

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const base64String = reader.result.split(',')[1] // remove metadata
        resolve(base64String)
      }
      reader.onerror = (error) => reject(error)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const isValid = validateForm()
    if (!isValid) return

    try {
      const convertIfExists = async (file) => (file ? await convertFileToBase64(file) : '')

      const convertMultipleIfExists = async (files) =>
        Array.isArray(files)
          ? await Promise.all(files.map((file) => convertFileToBase64(file)))
          : []

      // Convert Files
      const hospitalLogoBase64 = await convertIfExists(formData.hospitalLogo)
      // First convert
      const hospitalDocumentsBase64 = await Promise.all(
        Array.isArray(formData.hospitalDocuments)
          ? formData.hospitalDocuments.map((file) => convertFileToBase64(file))
          : [],
      )

      // Then check the result of that conversion
      if (hospitalDocumentsBase64.some((doc) => typeof doc !== 'string' || !doc.length)) {
        toast.error('One or more hospital documents failed to convert to base64.', {
          position: 'top-right',
        })
        return
      }

      const hospitalContractBase64 = await convertMultipleIfExists(formData.hospitalContract)
      const clinicalEstablishmentCertificateBase64 = await convertIfExists(
        formData.clinicalEstablishmentCertificate,
      )
      const businessRegistrationCertificateBase64 = await convertIfExists(
        formData.businessRegistrationCertificate,
      )
      const drugLicenseCertificateBase64 = await convertIfExists(formData.drugLicenseCertificate)
      const drugLicenseFormTypeBase64 = await convertIfExists(formData.drugLicenseFormType)
      const pharmacistCertificateBase64 = await convertIfExists(formData.pharmacistCertificate)
      const biomedicalWasteManagementAuthBase64 = await convertIfExists(
        formData.biomedicalWasteManagementAuth,
      )
      const tradeLicenseBase64 = await convertIfExists(formData.tradeLicense)
      const fireSafetyCertificateBase64 = await convertIfExists(formData.fireSafetyCertificate)
      const professionalIndemnityInsuranceBase64 = await convertIfExists(
        formData.professionalIndemnityInsurance,
      )
      const gstRegistrationCertificateBase64 = await convertIfExists(
        formData.gstRegistrationCertificate,
      )
      const othersBase64 = await convertIfExists(formData.others)

      const formatToAMPM = (time24) => {
        const [hourStr, minuteStr] = time24.split(':')
        let hour = parseInt(hourStr, 10)
        const ampm = hour >= 12 ? 'PM' : 'AM'
        hour = hour % 12 || 12
        return `${hour.toString().padStart(2, '0')}:${minuteStr} ${ampm}`
      }

      const clinicData = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        contactNumber: formData.contactNumber,
        openingTime: formatToAMPM(formData.openingTime),
        closingTime: formatToAMPM(formData.closingTime),
        hospitalLogo: hospitalLogoBase64,
        emailAddress: formData.emailAddress,
        website: normalizeWebsite(formData.website.trim()),
        licenseNumber: formData.licenseNumber,
        issuingAuthority: formData.issuingAuthority,
        hospitalDocuments: hospitalDocumentsBase64,
        contractorDocuments: hospitalContractBase64,
        clinicalEstablishmentCertificate: clinicalEstablishmentCertificateBase64,
        businessRegistrationCertificate: businessRegistrationCertificateBase64,
        clinicType: clinicTypeOption,
        medicinesSoldOnSite: selectedOption,
        drugLicenseCertificate: drugLicenseCertificateBase64,
        drugLicenseFormType: drugLicenseFormTypeBase64,
        hasPharmacist: selectedPharmacistOption,
        pharmacistCertificate: pharmacistCertificateBase64,
        biomedicalWasteManagementAuth: biomedicalWasteManagementAuthBase64,
        tradeLicense: tradeLicenseBase64,
        fireSafetyCertificate: fireSafetyCertificateBase64,
        professionalIndemnityInsurance: professionalIndemnityInsuranceBase64,
        gstRegistrationCertificate: gstRegistrationCertificateBase64,
        others: othersBase64,
        instagramHandle: formData.instagramHandle,
        twitterHandle: formData.twitterHandle,
        facebookHandle: formData.facebookHandle,
        recommended: !!formData.recommended,
      }

      // API Submission
      const response = await axios.post(`${BASE_URL}/admin/CreateClinic`, clinicData)
      const savedClinicData = response.data

      if (savedClinicData.success) {
        toast.success(response.message, { position: 'top-right' })

        sendDermaCareOnboardingEmail({
          name: formData.name,
          email: formData.emailAddress,
          password: savedClinicData.data.clinicTemporaryPassword,
          userID: savedClinicData.data.clinicUsername,
        })

        navigate('/clinic-management', {
          state: {
            refresh: true,
            newClinic: savedClinicData,
          },
        })
      } else {
        toast.error(response.message || 'Something went wrong', { position: 'top-right' })
      }
    } catch (error) {
      console.error('Error submitting clinic data:', error)
      toast.error(error.message || 'Something went wrong', { position: 'top-right' })
    }
  }

  return (
    <div className="container mt-4">
      <ToastContainer />
      <CCard>
        <CCardHeader>
          <h3 className="mb-0">Add New Clinic</h3>
        </CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSubmit}>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>
                  Clinic Name
                  <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onKeyDown={preventNumberInput}
                  invalid={!!errors.name}
                />
                {errors.name && <CFormFeedback invalid>{errors.name}</CFormFeedback>}
              </CCol>
              <CCol md={6}>
                <CFormLabel>
                  Email Address<span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="email"
                  name="emailAddress"
                  value={formData.emailAddress}
                  onChange={handleInputChange}
                  invalid={!!errors.emailAddress}
                  // feedbackInvalid={errors.emailAddress}
                />

                {errors.emailAddress && (
                  <CFormFeedback invalid>{errors.emailAddress}</CFormFeedback>
                )}
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>
                  Contact Number<span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  maxLength="10"
                  invalid={!!errors.contactNumber}
                />
                {errors.contactNumber && (
                  <CFormFeedback invalid>{errors.contactNumber}</CFormFeedback>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel>
                  Website<span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  onBlur={handleWebsiteBlur}
                  invalid={!!errors.website}
                />
                {errors.website && (
                  <div style={{ color: 'red', fontSize: '0.9rem' }}>{errors.website}</div>
                )}
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>
                  Opening Time<span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="time"
                  name="openingTime"
                  value={formData.openingTime}
                  onChange={handleInputChange}
                  invalid={!!errors.openingTime}
                />
                {errors.openingTime && <CFormFeedback invalid>{errors.openingTime}</CFormFeedback>}
              </CCol>
              <CCol md={6}>
                <CFormLabel>
                  Closing Time<span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="time"
                  name="closingTime"
                  value={formData.closingTime}
                  onChange={handleInputChange}
                  invalid={!!errors.closingTime}
                />
                {errors.closingTime && <CFormFeedback invalid>{errors.closingTime}</CFormFeedback>}
              </CCol>
            </CRow>
            <CRow>
              <CCol md={6}>
                <CFormLabel>
                  License Number<span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="number"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  invalid={!!errors.licenseNumber}
                />
                {errors.licenseNumber && (
                  <CFormFeedback invalid>{errors.licenseNumber}</CFormFeedback>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel>
                  Issuing Authority<span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="issuingAuthority"
                  value={formData.issuingAuthority}
                  onChange={handleInputChange}
                  onKeyDown={preventNumberInput}
                  invalid={!!errors.issuingAuthority}
                />
                {errors.issuingAuthority && (
                  <CFormFeedback invalid>{errors.issuingAuthority}</CFormFeedback>
                )}
              </CCol>
              {/* <CCol md={4}>
                <CFormLabel>
                  Hospital Registration<span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="hospitalRegistrations"
                  value={formData.hospitalRegistrations}
                  onChange={handleInputChange}
                  invalid={!!errors.hospitalRegistrations}
                />
                {errors.hospitalRegistrations && (
                  <CFormFeedback invalid>{errors.hospitalRegistrations}</CFormFeedback>
                )}
              </CCol> */}
            </CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>
                  Address<span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  invalid={!!errors.address}
                />
                {errors.address && <CFormFeedback invalid>{errors.address}</CFormFeedback>}
              </CCol>
              <CCol md={6}>
                <CFormLabel>
                  Recommendation Status
                  {/* <span className="text-danger">*</span> */}
                </CFormLabel>
                <CFormSelect
                  name="recommended"
                  value={formData.recommended}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      recommended: e.target.value === 'true',
                    }))
                  }
                >
                  <option value="true">Yes, Recommend</option>
                  <option value="false">No, Don't Recommend</option>
                </CFormSelect>
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>
                  City<span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  onKeyDown={preventNumberInput}
                  invalid={!!errors.city}
                />
                {errors.city && <CFormFeedback invalid>{errors.city}</CFormFeedback>}
              </CCol>
              <CCol md={6}>
                <CFormLabel>
                  Hospital Contract<span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="file"
                  name="hospitalContract"
                  onChange={(e) =>
                    setFormData({ ...formData, hospitalContract: Array.from(e.target.files) })
                  }
                  multiple
                  accept=".pdf,.doc,.docx,.jpeg,.png"
                  invalid={!!errors.hospitalContract}
                />
                {errors.hospitalContract && (
                  <CFormFeedback invalid>{errors.hospitalContract}</CFormFeedback>
                )}
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>
                  Hospital Logo<span className="text-danger">*</span>
                </CFormLabel>
                <FileInputWithRemove
                  name="hospitalLogo"
                  file={formData.hospitalLogo}
                  error={errors.hospitalLogo}
                  onChange={(e) => setFormData({ ...formData, hospitalLogo: e.target.files[0] })}
                  onRemove={(name) => {
                    setFormData((prev) => ({ ...prev, [name]: '' })) // OR null
                    setErrors((prev) => ({ ...prev, [name]: '' }))
                  }}
                  accept="image/*"
                  invalid={!!errors.hospitalLogo}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>
                  Hospital Documents<span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="file"
                  name="hospitalDocuments"
                  multiple
                    accept=".pdf,.doc,.docx,.jpeg,.png"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hospitalDocuments: Array.from(e.target.files), // MUST use Array.from
                    })
                  }
                  invalid={!!errors.hospitalDocuments}
                />

                {errors.hospitalDocuments && (
                  <CFormFeedback invalid>{errors.hospitalDocuments}</CFormFeedback>
                )}
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={6} className="mb-2">
                <CTooltip content="Issued by Registrar of Companies or local municipal body">
                  <CFormLabel>
                    Clinical Establishment Registration Certificate
                    <span className="text-danger">*</span>
                  </CFormLabel>
                </CTooltip>
                <CFormInput
                  type="file"
                  name="clinicalEstablishmentCertificate"
                  id="clinicalReg"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      clinicalEstablishmentCertificate: e.target.files[0],
                    })
                  }
                  // multiple
                  accept=".pdf,.doc,.docx,.jpeg,.png"
                  invalid={!!errors.clinicalEstablishmentCertificate}
                />
                {errors.clinicalEstablishmentCertificate && (
                  <CFormFeedback invalid>{errors.clinicalEstablishmentCertificate}</CFormFeedback>
                )}
              </CCol>
              <CCol md={6}>
                <CTooltip content="Issued by Registrar of Companies or local municipal body">
                  <CFormLabel>
                    Business Registration Certificate <span className="text-danger">*</span>
                  </CFormLabel>
                </CTooltip>
                <CFormInput
                  type="file"
                  id="businessReg"
                  name="businessRegistrationCertificate"
                  onChange={(e) =>
                    setFormData({ ...formData, businessRegistrationCertificate: e.target.files[0] })
                  }
                  // multiple
                 accept=".pdf,.doc,.docx,.jpeg,.png"
                  invalid={!!errors.businessRegistrationCertificate}
                />
                {errors.businessRegistrationCertificate && (
                  <CFormFeedback invalid>{errors.businessRegistrationCertificate}</CFormFeedback>
                )}
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>
                  Clinic Type <span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect
                  className="form-select"
                  value={clinicTypeOption}
                  onChange={(e) => {
                    setClinicTypeOption(e.target.value)
                    setErrors((prev) => ({ ...prev, clinicType: '' })) // clear error on change
                  }}
                  invalid={!!errors.clinicType} // this is critical!
                >
                  <option value="">Select Type</option>
                  <option value="Proprietorship">Proprietorship</option>
                  <option value="Partnership">Partnership</option>
                  <option value="LLP">LLP</option>
                  <option value="Private Limited">Private Limited</option>
                </CFormSelect>

                {errors.clinicType && <CFormFeedback invalid>{errors.clinicType}</CFormFeedback>}
              </CCol>

              <CCol>
                <CTooltip content="Issued by Insurance Companies">
                  <CFormLabel>
                    Professional Indemnity Insurance
                    <span className="text-danger">*</span>
                  </CFormLabel>
                </CTooltip>
                <CFormInput
                  type="file"
                  id="indemnity"
                  name="professionalIndemnityInsurance"
                  onChange={(e) =>
                    setFormData({ ...formData, professionalIndemnityInsurance: e.target.files[0] })
                  }
                  multiple
                     accept=".pdf,.doc,.docx,.jpeg,.png"
                  invalid={!!errors.professionalIndemnityInsurance}
                />
                {errors.professionalIndemnityInsurance && (
                  <CFormFeedback invalid>{errors.professionalIndemnityInsurance}</CFormFeedback>
                )}
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>
                  Medicines sold on-site
                  <span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect
                  className="form-select"
                  value={selectedOption}
                  onChange={(e) => {
                    setSelectedOption(e.target.value)
                    setErrors((prev) => ({ ...prev, medicinesSoldOnSite: '' })) // clear error on change
                  }}
                  invalid={!!errors.medicinesSoldOnSite}
                >
                  <option value="">Select an option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </CFormSelect>
                {errors.medicinesSoldOnSite && (
                  <CFormFeedback invalid>{errors.medicinesSoldOnSite}</CFormFeedback>
                )}
              </CCol>
              <CCol md={6}>
                <CTooltip content="Issued by State Pollution Control Board (SPCB)">
                  <CFormLabel>
                    Biomedical Waste Management Authorization
                    <span className="text-danger">*</span>
                  </CFormLabel>
                </CTooltip>
                <CFormInput
                  type="file"
                  id="biomedicalWaste"
                  name="biomedicalWasteManagementAuth"
                  onChange={(e) =>
                    setFormData({ ...formData, biomedicalWasteManagementAuth: e.target.files[0] })
                  }
                  // multiple
                    accept=".pdf,.doc,.docx,.jpeg,.png"
                  invalid={!!errors.biomedicalWasteManagementAuth}
                />
                {errors.biomedicalWasteManagementAuth && (
                  <CFormFeedback invalid>{errors.biomedicalWasteManagementAuth}</CFormFeedback>
                )}
              </CCol>
            </CRow>

            {selectedOption === 'Yes' && (
              <CRow className="mb-3">
                <CCol md={6}>
                  <CTooltip content="Issued by State Drug Control Department">
                    <CFormLabel>Drug License Certificate</CFormLabel>
                  </CTooltip>
                  <CFormInput
                    type="file"
                    id="drugLicenseCertificate"
                    name="drugLicenseCertificate"
                    onChange={(e) =>
                      setFormData({ ...formData, drugLicenseCertificate: e.target.files[0] })
                    }
                    invalid={!!errors.drugLicenseCertificate}
                  />
                  {errors.drugLicenseCertificate && (
                    <CFormFeedback invalid>{errors.drugLicenseCertificate}</CFormFeedback>
                  )}
                </CCol>
                <CCol md={6}>
                  <CTooltip content="Issued by State Drug Control Department">
                    <CFormLabel>DrugLicenseFormType 20/21</CFormLabel>
                  </CTooltip>
                  <CFormInput
                    type="file"
                    id="Form20/21"
                    name="drugLicenseFormType"
                    onChange={(e) =>
                      setFormData({ ...formData, drugLicenseFormType: e.target.files[0] })
                    }
                    // multiple
                      accept=".pdf,.doc,.docx,.jpeg,.png"
                    invalid={!!errors.drugLicenseFormType}
                  />
                  {errors.drugLicenseFormType && (
                    <CFormFeedback invalid>{errors.drugLicenseFormType}</CFormFeedback>
                  )}
                </CCol>
              </CRow>
            )}
            <CRow className="mb-3">
              <CCol md={6}>
                <CTooltip content="Issued by Local Municipality">
                  <CFormLabel>
                    Trade License / Shop & Establishment License
                    <span className="text-danger">*</span>
                  </CFormLabel>
                </CTooltip>
                <CFormInput
                  type="file"
                  name="tradeLicense"
                  onChange={(e) => setFormData({ ...formData, tradeLicense: e.target.files[0] })}
                  // multiple
                    accept=".pdf,.doc,.docx,.jpeg,.png"
                  invalid={!!errors.tradeLicense}
                />
                {errors.tradeLicense && (
                  <CFormFeedback invalid>{errors.tradeLicense}</CFormFeedback>
                )}
              </CCol>
              <CCol md={6}>
                <CTooltip content="Issued by Local Fire Department">
                  <CFormLabel>
                    Fire Safety Certificate
                    <span className="text-danger">*</span>
                  </CFormLabel>
                </CTooltip>
                <CFormInput
                  type="file"
                  id="fireSafety"
                  name="fireSafetyCertificate"
                  onChange={(e) =>
                    setFormData({ ...formData, fireSafetyCertificate: e.target.files[0] })
                  }
                  // multiple
               accept=".pdf,.doc,.docx,.jpeg,.png"
                  invalid={!!errors.fireSafetyCertificate}
                />
                {errors.fireSafetyCertificate && (
                  <CFormFeedback invalid>{errors.fireSafetyCertificate}</CFormFeedback>
                )}
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <CTooltip content="Issued by GST Department">
                  <CFormLabel>
                    GST Registration Certificate
                    <span className="text-danger">*</span>
                  </CFormLabel>
                </CTooltip>
                <CFormInput
                  type="file"
                  id="gstCert"
                  name="gstRegistrationCertificate"
                  onChange={(e) =>
                    setFormData({ ...formData, gstRegistrationCertificate: e.target.files[0] })
                  }
                  // multiple
                    accept=".pdf,.doc,.docx,.jpeg,.png"
                  invalid={!!errors.gstRegistrationCertificate}
                />
                {errors.gstRegistrationCertificate && (
                  <CFormFeedback invalid>{errors.gstRegistrationCertificate}</CFormFeedback>
                )}
              </CCol>

              <CCol md={6}>
                <CTooltip content="NABH Accreditation / Aesthetic Procedure Training Certificate">
                  <CFormLabel>
                    Others (NABH / Aesthetic Training)
                    <span className="text-danger">*</span>
                  </CFormLabel>
                </CTooltip>
                <CFormInput
                  type="file"
                  name="others"
                  onChange={(e) => setFormData({ ...formData, others: e.target.files[0] })}
                  // multiple
                   accept=".pdf,.doc,.docx,.jpeg,.png,.zip"
                  invalid={!!errors.others}
                />
                {errors.others && <CFormFeedback invalid>{errors.others}</CFormFeedback>}
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel>Instagram</CFormLabel>
                <CFormInput
                  type="text"
                  id="instagram"
                  placeholder="@clinic_handle"
                  name="instagramHandle"
                  value={formData.instagramHandle}
                  onChange={handleInputChange}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Facebook</CFormLabel>
                <CFormInput
                  type="text"
                  id="facebook"
                  placeholder="facebook.com/clinic"
                  name="facebookHandle"
                  value={formData.facebookHandle}
                  onChange={handleInputChange}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Twitter</CFormLabel>
                <CFormInput
                  type="text"
                  id="twitter"
                  placeholder="@clinic_tweet"
                  name="twitterHandle"
                  value={formData.twitterHandle}
                  onChange={handleInputChange}
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>
                  Clinic has a valid pharmacist
                  <span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect
                  className="form-select"
                  value={selectedPharmacistOption}
                  onChange={(e) => {
                    setSelectedPharmacistOption(e.target.value)
                    setErrors((prev) => ({ ...prev, hasPharmacist: '' })) // clear error on change
                  }}
                  invalid={!!errors.hasPharmacist}
                >
                  <option value="">Select an option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  {/* <option value="n/a">N/A</option> */}
                </CFormSelect>
                {errors.hasPharmacist && (
                  <CFormFeedback invalid>{errors.hasPharmacist}</CFormFeedback>
                )}
              </CCol>
              {selectedPharmacistOption === 'Yes' && (
                <CCol md={6}>
                  <CTooltip content="Valid Pharmacist Registration Certificate">
                    <CFormLabel>Pharmacist Certificate</CFormLabel>
                  </CTooltip>
                  <CFormInput
                    type="file"
                    id="pharmacistCert"
                    name="pharmacistCertificate"
                    onChange={(e) =>
                      setFormData({ ...formData, pharmacistCertificate: e.target.files[0] })
                    }
                    // multiple
                      accept=".pdf,.doc,.docx,.jpeg,.png"
                    invalid={!!errors.pharmacistCertificate}
                  />
                  {errors.pharmacistCertificate && (
                    <CFormFeedback invalid>{errors.pharmacistCertificate}</CFormFeedback>
                  )}
                </CCol>
              )}
            </CRow>

            {errors.submit && <div className="alert alert-danger">{errors.submit}</div>}

            <div className="d-flex justify-content-end gap-2 mt-4">
              <CButton color="secondary" onClick={() => navigate('/clinic-management')}>
                Cancel
              </CButton>
              <CButton color="primary" type="submit">
                Save Clinic
              </CButton>
            </div>
          </CForm>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default AddClinic
