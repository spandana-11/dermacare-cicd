import React from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { CButton, CCard, CCardBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react'
import jsPDF from 'jspdf'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { deleteBookingData } from './appointmentAPI' // adjust this path as per your project
import { GetdoctorsByClinicIdData } from './appointmentAPI'
import { FaEye, FaDownload } from 'react-icons/fa'
const AppointmentDetails = () => {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [isDeleting, setIsDeleting] = useState(false)
  const [doctor, setDoctor] = useState(null)

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

  const handleGenerateConsentForm = () => {
    navigate('/consent-form', { state: { appointment } })
  }

  const handleDownloadConsentForm = () => {
    const doc = new jsPDF()

    doc.setFontSize(16)
    doc.text('Patient Consent Form', 14, 20)

    doc.setFontSize(12)
    doc.text(`Booking ID: ${appointment.bookingId}`, 14, 30)
    doc.text(`Patient Name: ${appointment.name}`, 14, 40)
    doc.text(`Mobile Number: ${appointment.mobileNumber}`, 14, 50)
    doc.text(`Procedure: ${appointment.subServiceName}`, 14, 60)
    doc.text(`Doctor Name: ${doctor?.doctorName || ''}`, 14, 70)
    doc.text(`Service Date: ${appointment.serviceDate}`, 14, 80)
    doc.text(`Time: ${appointment.servicetime}`, 14, 90)

    // If you want to dump all details as JSON:
    // doc.text(JSON.stringify(appointment, null, 2), 14, 100)

    doc.save(`ConsentForm_${appointment.bookingId}.pdf`)
  }
  // useEffect(() => {
  //   const fetchDoctorDetails = async () => {
  //     if (
  //       appointment?.status?.toLowerCase() === 'confirmed' ||
  //       (appointment?.status?.toLowerCase() === 'completed' && appointment?.doctorId)
  //     ) {
  //       try {
  //         const res = await GetdoctorsByClinicIdData(appointment.doctorId)
  //         setDoctor(res.data.data)
  //       } catch (error) {
  //         console.error('Failed to fetch doctor details:', error)
  //       }
  //     }
  //   }
  //   fetchDoctorDetails()
  // }, [appointment])
  useEffect(() => {
    const fetchDoctorDetails = async () => {
      if (
        ['confirmed', 'completed', 'active'].includes(appointment?.status?.toLowerCase()) &&
        appointment?.doctorId
      ) {
        try {
          const res = await GetdoctorsByClinicIdData(appointment.doctorId)
          setDoctor(res.data.data)
        } catch (error) {
          console.error('Failed to fetch doctor details:', error)
        }
      }
    }
    fetchDoctorDetails()
  }, [appointment])

  const getDoctorImage = (picture) => {
    if (!picture) return '/default-doctor.png'
    return picture.startsWith('data:image') ? picture : `data:image/jpeg;base64,${picture}`
  }

  // const getStatusColor = (status) => {
  //   switch (status?.toLowerCase()) {
  //     case 'completed':
  //       return 'success'
  //     case 'rejected':
  //       return 'danger'
  //     case 'pending':
  //       return 'warning'
  //     case 'confirmed':
  //       return 'info'
  //     case 'in progress':
  //       return 'primary'
  //     case 'rescheduled':
  //       return 'secondary'
  //     default:
  //       return 'dark'
  //   }
  // }

  // const showConfirmedOrCompleted =
  //   appointment?.status?.toLowerCase() === 'confirmed' ||
  //   appointment?.status?.toLowerCase() === 'completed' ||
  //   appointment?.status?.toLowerCase() === 'active'
  const showConfirmedOrCompleted = ['confirmed', 'completed', 'active'].includes(
    appointment?.status?.toLowerCase(),
  )

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="bg-info text-white p-3 d-flex justify-content-between align-items-center rounded">
        <h5 className="mb-0">Patient File Name: {appointment.patientId}</h5>
        <div className="d-flex gap-2">
          <CButton color="secondary" size="sm" onClick={() => navigate(-1)}>
            Back
          </CButton>
        </div>
      </div>

      <div className="mt-4 p-4 border rounded shadow-sm bg-white">
        {/* Patient Details */}
        <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
          <h5 className="fw-bold text-info mb-0">Patient Details</h5>
          <span
            className={`badge bg-info text-uppercase px-3 py-2`}
          >
            {appointment.status}
          </span>
        </div>

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
            <strong>Problem:</strong> <span className="text-muted">{appointment?.problem}</span>
          </div>
        </div>

        <hr />

        {/* Slot & Payment */}
        <h6 className="fw-bold text-secondary mb-3">Slot & Payment Details</h6>
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
        <h6 className="fw-bold text-secondary mb-3">Doctor & Service Details</h6>
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

        {/* Show Consent Form + Doctor Details only if confirmed/completed */}
        {showConfirmedOrCompleted && (
          <>
            <div className="mt-4 d-flex justify-content-end gap-2">
              <CButton color="info" onClick={handleGenerateConsentForm}>
        
                <FaEye color="white"/>
              </CButton>
              <CButton color="info" onClick={handleDownloadConsentForm}>
                <FaDownload color="white"/>
              </CButton>
            </div>

            {doctor && (
              <>
                <h6 className="fw-bold mt-4">Doctor Details</h6>
                <div className="d-flex align-items-center gap-3 border rounded p-3 shadow-sm">
                  <img
                    src={getDoctorImage(doctor.doctorPicture)}
                    alt={doctor.doctorName}
                    width={80}
                    height={80}
                    className="rounded-circle border"
                  />
                  <div>
                    <h6 className="text-info fw-bold mb-1">{doctor.doctorName}</h6>
                    <p className="mb-1">
                      <strong>Specialization:</strong> {doctor.specialization}
                    </p>
                    <p className="mb-1">
                      <strong>Experience:</strong> {doctor.experience} years
                    </p>
                    <p className="mb-1">
                      <strong>Qualification:</strong> {doctor.qualification}
                    </p>
                    <p className="mb-0">
                      <strong>Languages:</strong> {doctor.languages?.join(', ')}
                    </p>
                  </div>
                  <div className="ms-auto">
                    <CButton
                      color="info"
                      size="sm"
                      className="px-3 text-white"
                      onClick={() => navigate(`/doctor/${doctor.doctorId}`, { state: { doctor } })}
                    >
                      View Details
                    </CButton>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AppointmentDetails
