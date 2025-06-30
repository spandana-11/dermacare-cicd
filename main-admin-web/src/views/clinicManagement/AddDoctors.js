import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CButton,
  CRow,
  CCol,
} from '@coreui/react'
import { CLINIC_ADMIN_URL, AddDoctor } from '../../baseUrl'
import { toast } from 'react-toastify'

const AddDoctors = () => {
  const navigate = useNavigate()
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    doctorName: '',
    doctorPicture: '',
    doctorMobileNumber: '',
    doctorLicence: '',
    service: [],
    subSerives: [],
    gender: '',
    experience: '',
    qualification: '',
    specialization: '',
    availableDays: '',
    availableTimes: '',
    profileDescription: '',
    focusAreas: [],
    languages: [],
    careerPath: [],
    highlights: [],
    doctorFees: {
      serviceAndTreatmentFee: '',
      inClinicFee: '',
      vedioConsultationFee: '',
    },
  })

  const validateForm = () => {
    const newErrors = {}

    if (!formData.doctorName.trim()) {
      newErrors.doctorName = 'Doctor name is required'
    }

    const phoneRegex = /^(?:\+91)?[6-9]\d{9}$/
    if (!formData.doctorMobileNumber) {
      newErrors.doctorMobileNumber = 'Contact number is required'
    } else if (!phoneRegex.test(formData.doctorMobileNumber)) {
      newErrors.doctorMobileNumber = 'Please enter a valid 10-digit mobile number'
    }

    if (!formData.specialization.trim()) {
      newErrors.specialization = 'Specialization is required'
    }

    if (!formData.doctorLicence.trim()) {
      newErrors.doctorLicence = 'License number is required'
    }

    if (!formData.experience.trim()) {
      newErrors.experience = 'Experience is required'
    } else if (isNaN(formData.experience) || Number(formData.experience) < 0) {
      newErrors.experience = 'Experience must be a non-negative number'
    }

    if (!formData.doctorPicture) {
      newErrors.doctorPicture = 'Profile picture is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    console.log(`Input Changed: ${name} = ${value}`)

    if (name.includes('doctorFees.')) {
      const feeKey = name.split('.')[1]
      setFormData((prevData) => ({
        ...prevData,
        doctorFees: {
          ...prevData.doctorFees,
          [feeKey]: value,
        },
      }))
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }))
    }
  }

  const handleArrayChange = (e, field) => {
    const values = e.target.value.split(',').map((item) => item.trim())
    console.log(`${field} updated to:`, values)
    setFormData((prevData) => ({ ...prevData, [field]: values }))
  }

  const handleFileChange = async (e) => {
    const { name, files } = e.target
    try {
      const base64 = await convertToBase64(files[0])
      const stripBase64Prefix = (base64) => base64.split(',')[1]
      setFormData((prev) => ({
        ...prev,
        [name]: stripBase64Prefix(base64),
      }))
    } catch (error) {
      console.error('File conversion error:', error)
      setErrors((prev) => ({
        ...prev,
        [name]: 'File conversion failed',
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('Final Form Data:', formData)
    if (!validateForm()) {
      return
    }

    const doctorData = {
      doctorName: formData.doctorName,
      doctorPicture: formData.doctorPicture,
      doctorMobileNumber: formData.doctorMobileNumber,
      doctorLicence: formData.doctorLicence,

      specialization: formData.specialization,
      experience: Number(formData.experience),
    }

    try {
      const response = await axios.post(`${CLINIC_ADMIN_URL}/${AddDoctor}`, doctorData)
      console.log('succes')
      toast.success('Doctor added successfully!')
      navigate('/clinic-management', {
        state: {
          refresh: true,
          newDoctor: response.data,
        },
      })
    } catch (error) {
      console.error('Error submitting doctor data:', error)
      toast.error('Failed to add doctor. Please try again.')
    }
  }

  return (
    <div className="container mt-4">
      <CCard>
        <CCardHeader>
          <h3 className="mb-0">Add New Doctor</h3>
        </CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSubmit}>
            <CFormLabel>Doctor Name</CFormLabel>
            <CFormInput
              name="doctorName"
              value={formData.doctorName}
              onChange={handleInputChange}
            />

            <CFormLabel>Doctor Mobile Number</CFormLabel>
            <CFormInput
              name="doctorMobileNumber"
              value={formData.doctorMobileNumber}
              onChange={handleInputChange}
            />

            <CFormLabel>Doctor Licence</CFormLabel>
            <CFormInput
              name="doctorLicence"
              value={formData.doctorLicence}
              onChange={handleInputChange}
            />

            <CFormLabel>Specialization</CFormLabel>
            <CFormInput
              name="specialization"
              value={formData.specialization}
              onChange={handleInputChange}
            />

            <CFormLabel>Gender</CFormLabel>
            <CFormInput name="gender" value={formData.gender} onChange={handleInputChange} />

            <CFormLabel>Experience (years)</CFormLabel>
            <CFormInput
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
            />

            <CFormLabel>Qualification</CFormLabel>
            <CFormInput
              name="qualification"
              value={formData.qualification}
              onChange={handleInputChange}
            />

            <CFormLabel>Available Days</CFormLabel>
            <CFormInput
              name="availableDays"
              value={formData.availableDays}
              onChange={handleInputChange}
            />

            <CFormLabel>Available Time</CFormLabel>
            <CFormInput
              name="availableTimes"
              value={formData.availableTimes}
              onChange={handleInputChange}
            />

            <CFormLabel>Profile Description</CFormLabel>
            <CFormTextarea
              name="profileDescription"
              value={formData.profileDescription}
              onChange={handleInputChange}
            />

            <CFormLabel>Focus Areas (comma separated)</CFormLabel>
            <CFormInput
              value={formData.focusAreas.join(', ')}
              onChange={(e) => handleArrayChange(e, 'focusAreas')}
            />

            <CFormLabel>Languages (comma separated)</CFormLabel>
            <CFormInput
              value={formData.languages.join(', ')}
              onChange={(e) => handleArrayChange(e, 'languages')}
            />

            <CFormLabel>Career Path (comma separated)</CFormLabel>
            <CFormInput
              value={formData.careerPath.join(', ')}
              onChange={(e) => handleArrayChange(e, 'careerPath')}
            />

            <CFormLabel>Highlights (comma separated)</CFormLabel>
            <CFormInput
              value={formData.highlights.join(', ')}
              onChange={(e) => handleArrayChange(e, 'highlights')}
            />

            <CFormLabel>Service</CFormLabel>
            <CFormInput
              placeholder="ServiceId:ServiceName (e.g., GM121:General Medicine)"
              onChange={(e) => {
                const [id, name] = e.target.value.split(':')
                const serviceArray =
                  id && name ? [{ serviceId: id.trim(), serviceName: name.trim() }] : []
                console.log('Service:', serviceArray)
                setFormData({ ...formData, service: serviceArray })
              }}
            />

            <CFormLabel>Sub Services</CFormLabel>
            <CFormInput
              placeholder="SubServiceId:SubServiceName (e.g., FT001:Fever Treatment)"
              onChange={(e) => {
                const [id, name] = e.target.value.split(':')
                const subArray =
                  id && name ? [{ subServiceId: id.trim(), subServiceName: name.trim() }] : []
                console.log('SubServices:', subArray)
                setFormData({ ...formData, subSerives: subArray })
              }}
            />

            <CFormLabel>Service & Treatment Fee</CFormLabel>
            <CFormInput
              name="doctorFees.serviceAndTreatmentFee"
              value={formData.doctorFees.serviceAndTreatmentFee}
              onChange={handleInputChange}
            />

            <CFormLabel>In Clinic Fee</CFormLabel>
            <CFormInput
              name="doctorFees.inClinicFee"
              value={formData.doctorFees.inClinicFee}
              onChange={handleInputChange}
            />

            <CFormLabel>Video Consultation Fee</CFormLabel>
            <CFormInput
              name="doctorFees.vedioConsultationFee"
              value={formData.doctorFees.videoConsultationFee}
              onChange={handleInputChange}
            />

            <div className="d-flex justify-content-end gap-2 mt-4">
              <CButton color="secondary" onClick={() => navigate('/clinic-management')}>
                Cancel
              </CButton>
              <CButton color="primary" type="submit">
                Save 
              </CButton>
            </div>
          </CForm>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default AddDoctors
