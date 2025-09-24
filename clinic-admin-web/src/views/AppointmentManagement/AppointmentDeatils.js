import React from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CModalFooter,
  CModalHeader,
  CModal,
  CModalTitle,
  CModalBody,
  CForm,
  CFormInput,
  CAccordionItem,
  CAccordion,
  CAccordionHeader,
  CAccordionBody,
} from '@coreui/react'

import jsPDF from 'jspdf'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { deleteBookingData } from './appointmentAPI' // adjust this path as per your project
import { GetdoctorsByClinicIdData } from './appointmentAPI'
import { FaEye, FaDownload } from 'react-icons/fa'
import { deleteVitalsData, postVitalsData, updateVitalsData, VitalsDataById } from './VitalsAPI'
const AppointmentDetails = () => {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [isDeleting, setIsDeleting] = useState(false)
  const [doctor, setDoctor] = useState(null)
  const [vitals, setVitals] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    bloodPressure: '',
    temperature: '',
    bmi: '',
  })
  const appointment = location.state?.appointment

  if (!appointment) {
    return (
      <div className="text-center mt-4">
        <h3 className="mb-3">No Appointment Data Found for ID: {id}</h3>
        <CButton color="primary" onClick={() => navigate(-1)}>
          Back
        </CButton>
      </div>
    )
  }
  const appointmentStatus = appointment?.status?.trim()?.toLowerCase()
  // Normalize status and map "in-progress" to "active"
  const normalizedStatus = (() => {
    const status = appointment?.status?.trim()?.toLowerCase()
    if (status === 'in-progress') return 'active'
    return status
  })()
  const showConfirmed = normalizedStatus === 'confirmed'
  const showCompletedOrActive = ['completed', 'active'].includes(normalizedStatus)
  const showVitalsCard = ['completed', 'active', 'confirmed'].includes(normalizedStatus) && vitals
  const showConfirmedOrCompleted = ['confirmed', 'completed', 'active'].includes(normalizedStatus)
  const [validationErrors, setValidationErrors] = useState({})

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      if (
        ['confirmed', 'completed', 'active'].includes(normalizedStatus) &&
        appointment?.doctorId
      ) {
        try {
          const res = await GetdoctorsByClinicIdData(appointment.doctorId)
          setDoctor(res.data || {})
        } catch (error) {
          console.error('Failed to fetch doctor details:', error)
        }
      }
    }
    fetchDoctorDetails()
  }, [normalizedStatus, appointment?.doctorId])

  useEffect(() => {
    if (['confirmed','active', 'completed' ].includes(normalizedStatus)) {
      fetchVitals()
    }
  }, [appointment?.bookingId, appointment?.patientId, normalizedStatus])

  const getDoctorImage = (picture) => {
    if (!picture) return '/default-doctor.png'
    return picture.startsWith('data:image') ? picture : `data:image/jpeg;base64,${picture}`
  }

  // useEffect(() => {
  //   if (
  //     appointment?.status &&
  //     ['completed', 'in-progress', 'confirmed'].includes(appointment.status.toLowerCase())
  //   ) {
  //     fetchVitals()
  //   }
  // }, [appointment?.bookingId, appointment?.patientId, appointment?.status])

  const fetchVitals = async () => {
    try {
      const data = await VitalsDataById(appointment.bookingId, appointment.patientId)
      if (Array.isArray(data) && data.length === 0) {
        setVitals(null)
      } else {
        setVitals(data)
      }
    } catch (error) {
      console.error('Error fetching vitals:', error)
    }
  }

  // Handle vitals form input
  const handleChange = (e) => {
    const { name, value } = e.target

    // update form data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // validate this specific field immediately
    let error = ''

    if (!regexRules[name].test(value)) {
      switch (name) {
        case 'height':
          error = 'Height must be a number between 10 and 999 cm'
          break
        case 'weight':
          error = 'Weight must be a number between 1 and 999 kg'
          break
        case 'bloodPressure':
          error = 'Blood Pressure must be in format: 120/80'
          break
        case 'temperature':
          error = 'Temperature must be a valid number (e.g., 98.6)'
          break
        case 'bmi':
          error = 'BMI must be a valid number (e.g., 24.5)'
          break
        default:
          error = ''
      }
    }

    // update validation errors state dynamically
    setValidationErrors((prev) => ({
      ...prev,
      [name]: error,
    }))
  }

  const handleSubmitVitals = async () => {
    if (!validateVitals()) {
      toast.error('Please fix validation errors before submitting.')
      return
    }
    console.log('Submitting vitals data:', formData)
    try {
      await postVitalsData({ ...formData, patientId: appointment.patientId }, appointment.bookingId)
      toast.success('Vitals added successfully!')
      setShowModal(false)
      setFormData({ height: '', weight: '', bloodPressure: '', temperature: '', bmi: '' })
      fetchVitals()
    } catch (error) {
      toast.error('Failed to add vitals')
    }
  }
  const handleUpdateVitals = async () => {
    try {
      await updateVitalsData(formData, appointment.bookingId, appointment.patientId)
      toast.success('Vitals updated successfully!')
      setShowModal(false)
      fetchVitals()
    } catch (error) {
      toast.error('Failed to update vitals')
    }
  }
  const handleDeleteVitals = async () => {
    try {
      await deleteVitalsData(appointment.bookingId, appointment.patientId)
      toast.success('Vitals deleted successfully!')
      setVitals(null)
    } catch (error) {
      toast.error('Failed to delete vitals')
    }
  }
  const regexRules = {
    height: /^(?:[1-9][0-9]{1,2})$/, // 10 - 999 cm
    weight: /^(?:[1-9][0-9]{0,2})$/, // 1 - 999 kg
    bloodPressure: /^\d{2,3}\/\d{2,3}$/, // format: 120/80
    temperature: /^(?:\d{2,3})(?:\.\d{1,2})?$/, // 2-3 digits with optional decimals
    bmi: /^\d{1,2}(?:\.\d{1,2})?$/, // 0-99 with optional decimals
  }
  const validateVitals = () => {
    let errors = {}
    Object.keys(formData).forEach((field) => {
      if (!regexRules[field].test(formData[field])) {
        switch (field) {
          case 'height':
            errors.height = 'Height must be a number between 10 and 999 cm'
            break
          case 'weight':
            errors.weight = 'Weight must be a number between 1 and 999 kg'
            break
          case 'bloodPressure':
            errors.bloodPressure = 'Blood Pressure must be in format: 120/80'
            break
          case 'temperature':
            errors.temperature = 'Temperature must be a valid number (e.g., 98.6)'
            break
          case 'bmi':
            errors.bmi = 'BMI must be a valid number (e.g., 24.5)'
            break
          default:
            break
        }
      }
    })

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const base64toBlob = (base64, mimeType) => {
    try {
      const byteCharacters = atob(base64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      return new Blob([byteArray], { type: mimeType })
    } catch (e) {
      console.error('Base64 decoding failed:', e)
      // You can use a more user-friendly alert here
      alert('Failed to decode file data. It may be corrupted or in an invalid format.')
      return null
    }
  }
  const getMimeTypeFromBase64 = (base64String) => {
    if (base64String.startsWith('JVBERi0')) {
      return 'application/pdf' // PDF
    }
    if (base64String.startsWith('/9j/')) {
      return 'image/jpeg' // JPEG
    }
    if (base64String.startsWith('iVBORw0KGgo')) {
      return 'image/png' // PNG
    }
    if (base64String.startsWith('data:')) {
      // If it's already a data URL, extract the MIME type
      const mimeMatch = base64String.match(/^data:(.*?);base64/)
      return mimeMatch ? mimeMatch[1] : 'application/octet-stream'
    }
    // Default to a generic binary type if the type cannot be determined
    return 'application/octet-stream'
  }
  const handlePreview = (base64String) => {
    if (!base64String) {
      alert('No file data available for preview.')
      return
    }

    const mimeType = getMimeTypeFromBase64(base64String)
    const blob = base64toBlob(base64String, mimeType)

    if (blob) {
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    }
  }

  const handleDownload = (base64String, fileName) => {
    if (!base64String) {
      alert('No file data available for download.')
      return
    }

    const mimeType = getMimeTypeFromBase64(base64String)
    const blob = base64toBlob(base64String, mimeType)

    if (blob) {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }
  const showAccordion = ['confirmed', 'active', 'completed'].includes(normalizedStatus)
  const showPrescription = ['active', 'completed'].includes(normalizedStatus)

  return (
    <div className="container mt-4">
      {/* Header */}
      <div
        className="p-3 d-flex justify-content-between align-items-center rounded"
        style={{ backgroundColor: 'var(--color-bgcolor)' }}
      >
        <h5 className="mb-0">Patient File Name: {appointment.patientId}</h5>
        <div className="d-flex gap-2">
          {showConfirmed && !vitals && (
            <CButton
              style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
              onClick={() => {
                setFormData({ height: '', weight: '', bloodPressure: '', temperature: '', bmi: '' })
                setShowModal(true)
              }}
            >
              Add Vitals
            </CButton>
          )}
          <CButton
            color="secondary"
            size="sm"
            onClick={() => navigate(-1)}
            style={{ backgroundColor: 'var(--color-black)' }}
          >
            Back
          </CButton>
        </div>
      </div>

      <div
        className="mt-4 p-4 border rounded shadow-sm bg-white"
        style={{ color: 'var(--color-black)' }}
      >
        <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
          <h5 className="fw-bold mb-0" style={{ color: 'var(--color-black)' }}>
            Patient Details
          </h5>
          <div className="d-flex align-items-center gap-2">
            <span
              className="badge text-uppercase px-3 py-2"
              style={{ backgroundColor: 'var(--color-black)' }}
            >
              {normalizedStatus}
            </span>
          </div>
        </div>

        {/* Patient Vitals handled only in Modal now */}

        <CModal visible={showModal} onClose={() => setShowModal(false)} backdrop="static">
          <CModalHeader>
            <CModalTitle>Add Vitals</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm style={{ color: 'var(--color-black)' }}>
              <CFormInput
                label="Height"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className="mb-2"
                invalid={!!validationErrors.height}
              />
              {validationErrors.height && (
                <small className="text-danger">{validationErrors.height}</small>
              )}
              <CFormInput
                label="Weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="mb-2"
                invalid={!!validationErrors.weight}
              />
              {validationErrors.weight && (
                <small className="text-danger">{validationErrors.weight}</small>
              )}
              <CFormInput
                label="Blood Pressure"
                name="bloodPressure"
                value={formData.bloodPressure}
                onChange={handleChange}
                className="mb-2"
                invalid={!!validationErrors.bloodPressure}
              />
              {validationErrors.bloodPressure && (
                <small className="text-danger">{validationErrors.bloodPressure}</small>
              )}
              <CFormInput
                label="Temperature"
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
                className="mb-2"
                invalid={!!validationErrors.temperature}
              />
              {validationErrors.temperature && (
                <small className="text-danger">{validationErrors.temperature}</small>
              )}
              <CFormInput
                label="BMI"
                name="bmi"
                value={formData.bmi}
                onChange={handleChange}
                className="mb-2"
                invalid={!!validationErrors.bmi}
              />
              {validationErrors.bmi && (
                <small className="text-danger">{validationErrors.bmi}</small>
              )}
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowModal(false)}>
              Close
            </CButton>
            <CButton
              style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
              onClick={handleSubmitVitals}
            >
              Save
            </CButton>
          </CModalFooter>
        </CModal>

        {/* Patient Info */}
        <div className="row mb-3">
          <div className="col-md-4">
            <strong>Patient Name:</strong> {appointment?.name}
          </div>
          <div className="col-md-4">
            <strong>Mobile Number:</strong> {appointment?.mobileNumber}
          </div>
          <div className="col-md-4">
            <strong>Booking For:</strong> {appointment?.bookingFor}
          </div>
          <div className="col-md-4">
            <strong>Age:</strong> {appointment?.age} Yrs
          </div>
          <div className="col-md-4">
            <strong>Gender:</strong> {appointment?.gender}
          </div>
          <div className="col-12">
            <strong>Problem:</strong>{' '}
            <p style={{ color: 'var(--color-black)' }}>{appointment?.problem}</p>
          </div>
        </div>

        <hr />

        {/* Slot & Payment */}
        <h6 className="fw-bold mb-3" style={{ color: 'var(--color-black)' }}>
          Slot & Payment Details
        </h6>
        <div className="row">
          <div className="col-md-4">
            <strong>Date:</strong> {appointment?.serviceDate}
          </div>
          <div className="col-md-4">
            <strong>Time:</strong> {appointment?.servicetime}
          </div>
          <div className="col-md-4">
            <strong>Paid Amount:</strong> ₹{appointment?.totalFee}
          </div>
          <div className="col-md-4">
            <strong>Consultation Fee:</strong> ₹{appointment?.consultationFee}
          </div>
        </div>

        <hr />

        {/* Doctor & Service Details */}
        <h6 className="fw-bold mb-3" style={{ color: 'var(--color-black)' }}>
          Doctor & Service Details
        </h6>
        <div className="row">
          <div className="col-md-4">
            <strong>Doctor ID:</strong> {appointment?.doctorId}
          </div>
          <div className="col-md-4">
            <strong>Consultation Type:</strong> {appointment?.consultationType}
          </div>
          <div className="col-md-4">
            <strong>Service Name:</strong> {appointment?.subServiceName}
          </div>
          <div className="col-md-4">
            <strong>Service ID:</strong> {appointment?.subServiceId}
          </div>
        </div>

        {/* vitals */}
        {vitals && (
          <div className="card shadow-sm p-3 mb-3 mt-4" style={{ color: 'var(--color-black)' }}>
            <div className="d-flex justify-content-between align-items-center">
              <h5>Vitals Card</h5>
              
            </div>
            <div className="row mt-3">
              <div className="col-md-4">
                <strong>Height:</strong> {vitals.height} cm
              </div>
              <div className="col-md-4">
                <strong>Weight:</strong> {vitals.weight} kg
              </div>
              <div className="col-md-4">
                <strong>Blood Pressure:</strong> {vitals.bloodPressure}
              </div>
              <div className="col-md-4">
                <strong>Temperature:</strong> {vitals.temperature} °C
              </div>
              <div className="col-md-4">
                <strong>BMI:</strong> {vitals.bmi}
              </div>
            </div>
          </div>
        )}

        {showConfirmedOrCompleted && doctor && (
          <>
            <div className="mt-4">
            <CAccordion activeItemKey={1}>
  {/* Consent Form Accordion */}
  <CAccordionItem itemKey={1}>
    <CAccordionHeader>Consent Form</CAccordionHeader>
    <CAccordionBody>
      <div className="d-flex gap-2">
        <CButton color="primary" onClick={() => handlePreview(appointment?.consentFormPdf, 'consent_form.pdf')}>
          Preview
        </CButton>
        <CButton color="success" onClick={() => handleDownload(appointment?.consentFormPdf, 'consent_form.pdf')}>
          Download
        </CButton>
      </div>
    </CAccordionBody>
  </CAccordionItem>

  {/* Past Reports Accordion */}
  <CAccordionItem itemKey={2}>
    <CAccordionHeader>Past Reports</CAccordionHeader>
    <CAccordionBody>
      {appointment?.attachments && appointment.attachments.length > 0 ? (
        appointment.attachments.map((attachment, index) => (
          <div key={index} className="d-flex gap-2 mb-2">
            <span>Attachment {index + 1}</span>
            <CButton color="primary" onClick={() => handlePreview(attachment, `attachment_${index + 1}.pdf`)}>
              Preview
            </CButton>
            <CButton color="success" onClick={() => handleDownload(attachment, `attachment_${index + 1}.pdf`)}>
              Download
            </CButton>
          </div>
        ))
      ) : (
        <p>No past reports available.</p>
      )}
    </CAccordionBody>
  </CAccordionItem>

  {/* Prescription Accordion - only for in-progress and completed */}
  {showPrescription && (
    <CAccordionItem itemKey={3}>
      <CAccordionHeader>Prescription</CAccordionHeader>
      <CAccordionBody>
        <div className="d-flex gap-2">
          <CButton color="primary" onClick={() => handlePreview(appointment?.prescriptionPdf, 'prescription.pdf')}>
            Preview
          </CButton>
          <CButton color="success" onClick={() => handleDownload(appointment?.prescriptionPdf, 'prescription.pdf')}>
            Download
          </CButton>
        </div>
      </CAccordionBody>
    </CAccordionItem>
  )}
</CAccordion>

            </div>
            <h6 className="fw-bold mt-4">Doctor Details</h6>{' '}
            <div className="d-flex align-items-center gap-3 border rounded p-3 shadow-sm">
              {' '}
              <img
                src={getDoctorImage(doctor.doctorPicture)}
                alt={doctor.doctorName}
                width={80}
                height={80}
                className="rounded-circle border"
              />
                     {' '}
              <div>
                          <h6 className="  fw-bold mb-1">{doctor.doctorName}</h6>         {' '}
                <p className="mb-1">
                              <strong>Specialization:</strong> {doctor.specialization}         {' '}
                </p>
                         {' '}
                <p className="mb-1">
                              <strong>Experience:</strong> {doctor.experience} years          {' '}
                </p>
                         {' '}
                <p className="mb-1">
                              <strong>Qualification:</strong> {doctor.qualification}         {' '}
                </p>
                         {' '}
                <p className="mb-0">
                              <strong>Languages:</strong> {doctor.languages?.join(', ')}         {' '}
                </p>
                       {' '}
              </div>
                     {' '}
              <div className="ms-auto">
                         {' '}
                <CButton
                  style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
                  size="sm"
                  className="px-3 text-white"
                  onClick={() =>
                    navigate(`/Doctor/${doctor.doctorId}`, {
                      state: { doctor },
                    })
                  }
                >
                              View Details          {' '}
                </CButton>
                       {' '}
              </div>
                   {' '}
            </div>
                   {' '}
          </>
        )}
      </div>
    </div>
  )
}

export default AppointmentDetails
