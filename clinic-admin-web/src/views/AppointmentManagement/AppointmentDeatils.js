import React from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { CButton, CCard, CCardBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react'

import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { deleteBookingData } from './appointmentAPI' // adjust this path as per your project
import { GetdoctorsByClinicIdData } from './appointmentAPI'

const AppointmentDetails = () => {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [isDeleting, setIsDeleting] = useState(false)
  const [doctor, setDoctor] = useState(null)

  const appointment = location.state?.appointment

  if (!appointment) {
    return (
      <div>
        <h3>No Appointment Data Found for ID: {id}</h3>
        <CButton color="primary" onClick={() => navigate(-1)}>
          Back
        </CButton>
      </div>
    )
  }

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      if (
        appointment?.status.toLowerCase() === 'confirmed' ||
        (appointment?.status.toLowerCase() === 'completed' && appointment?.doctorId)
      ) {
        try {
          const res = await GetdoctorsByClinicIdData(appointment.doctorId)
          console.log(res.data.data)
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
  const getStatusColor = (status) => {
    console.log(status)
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success'
      case 'Rejected':
        return 'danger'
      case 'pending':
        return 'warning'
      case 'confirmed':
        return 'info'
      case 'in progress':
        return 'primary'
      case 'rescheduled':
        return 'secondary'
      default:
        return 'dark'
    }
  }
  return (
    <div className="container mt-4">
      {/* Header Section with blue background */}
      <div className="bg-info text-white p-3 d-flex justify-content-between align-items-center rounded">
        {/* Left section: Booking ID and Status */}
        <div>
          <h5 className="mb-1 text">Booking ID: {appointment.bookingId}</h5>
        </div>

        <div className="d-flex gap-2">
          {/* <h5 className={`mb-1 text-${getStatusColor(appointment.status)}`}>
            {appointment.status}
          </h5> */}

          <CButton color="secondary" size="sm" onClick={() => navigate(-1)}>
            Back
          </CButton>
          {/* <CButton
            color="danger"
            size="sm"
            className="text-white"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </CButton> */}
        </div>
      </div>
      <div className="mt-4 p-3 border rounded shadow-sm bg-white">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
          <h5 className="fw-bold mb-0 text-primary">Patient Details</h5>
          <span
            className={`badge bg-${getStatusColor(appointment.status)} text-uppercase px-3 py-2`}
          >
            {appointment.status}
          </span>
        </div>

        {/* Patient Details */}
        <div className="row mb-3">
          <div className="col-md-4 mb-2">
            <strong>Patient Name:</strong> <span className="ms-1">{appointment?.name}</span>
          </div>
          <div className="col-md-4 mb-2">
            <strong>Mobile Number:</strong>{' '}
            <span className="ms-1">{appointment?.mobileNumber}</span>
          </div>
          <div className="col-md-4 mb-2">
            <strong>Booking For:</strong> <span className="ms-1">{appointment?.bookingFor}</span>
          </div>
          <div className="col-md-4 mb-2">
            <strong>Age:</strong> <span className="ms-1">{appointment?.age} Yrs</span>
          </div>
          <div className="col-md-4 mb-2">
            <strong>Gender:</strong> <span className="ms-1">{appointment?.gender}</span>
          </div>
          <div className="col-12">
            <strong>Problem:</strong>
            <div className="text-muted ms-1">{appointment?.problem}</div>
          </div>
        </div>

        {/* Slot & Payment */}
        <div className="border-top pt-3 mb-3">
          <h6 className="fw-bold text-secondary mb-2">Slot & Payment Details</h6>
          <div className="row">
            <div className="col-md-4 mb-2">
              <strong>Date:</strong> <span className="ms-1">{appointment?.serviceDate}</span>
            </div>
            <div className="col-md-4 mb-2">
              <strong>Time:</strong> <span className="ms-1">{appointment?.servicetime}</span>
            </div>
            <div className="col-md-4 mb-2">
              <strong>Paid Amount:</strong> <span className="ms-1">₹{appointment?.totalFee}</span>
            </div>
            <div className="col-md-4 mb-2">
              <strong>Consultation Fee:</strong>{' '}
              <span className="ms-1">₹{appointment?.consultationFee}</span>
            </div>
          </div>
        </div>

        {/* Doctor & Service Details */}
        <div className="border-top pt-3">
          <h6 className="fw-bold text-secondary mb-2">Doctor & Service Details</h6>
          <div className="row">
            <div className="col-md-4 mb-2">
              <strong>Doctor ID:</strong> <span className="ms-1">{appointment?.doctorId}</span>
            </div>
            <div className="col-md-4 mb-2">
              <strong>Consultation Type:</strong>{' '}
              <span className="ms-1">{appointment?.consultationType}</span>
            </div>
            <div className="col-md-4 mb-2">
              <strong>Service Name:</strong>{' '}
              <span className="ms-1">{appointment?.subServiceName}</span>
            </div>
            <div className="col-md-4 mb-2">
              <strong>Service ID:</strong> <span className="ms-1">{appointment?.subServiceId}</span>
            </div>
          </div>
        </div>
      </div>

      {(appointment?.status.toLowerCase() === 'confirmed' ||
        appointment?.status.toLowerCase() === 'completed') &&
        doctor && (
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
                <h6 className="text-primary fw-bold mb-1">{doctor.doctorName}</h6>
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
                  color="primary"
                  size="sm"
                  className="px-3"
                  onClick={() => navigate(`/doctor/${doctor.doctorId}`, { state: { doctor } })}
                >
                  View Details
                </CButton>
              </div>
            </div>
          </>
        )}
    </div>
  )
}

export default AppointmentDetails
