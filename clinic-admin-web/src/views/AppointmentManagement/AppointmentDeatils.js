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

  const handleConfirmDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return

    try {
      setIsDeleting(true)
      await deleteBookingData(appointment.bookingId)
      toast.success('Booking deleted successfully!', { position: 'top-right' })
      navigate('/appointment-management') // redirect to appointment list
    } catch (error) {
      toast.error('Failed to delete booking.', { position: 'top-right' })
    } finally {
      setIsDeleting(false)
    }
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

  return (
    <div className="container mt-4">
      {/* Header Section with blue background */}
      <div className="bg-info text-white p-3 d-flex justify-content-between align-items-center rounded">
        {/* Left section: Booking ID and Status */}
        <div>
          <h5 className="mb-1">Booking ID: {appointment.bookingId}</h5>
        </div>

        <div className="d-flex gap-2">
          <h5 className="mb-1 text-warning">{appointment.status}</h5>
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

      <div className="mt-4">
        <h6 className="fw-bold">Patient Details</h6>
        <p>
          <strong>Patient Name:</strong> {appointment?.name} &nbsp;&nbsp;
          <strong>Patient Number:</strong> {appointment?.mobileNumber} &nbsp;&nbsp;
          <strong>Booking For:</strong> {appointment?.bookingFor}
        </p>
        <p>
          <strong>Patient Age:</strong> {appointment?.age} Yrs &nbsp;&nbsp;
          <strong>Gender:</strong> {appointment?.gender}
        </p>
        <p className="mb-3">
          <strong>Problem:</strong>
          <br />
          {appointment?.problem}
        </p>

        <h6 className="fw-bold">Slot & Payment Details</h6>
        <p>
          <strong>Date:</strong> {appointment?.serviceDate} &nbsp;&nbsp;
          <strong>Time:</strong> {appointment?.servicetime} &nbsp;&nbsp;
        </p>
        <p>
          <strong>Paid Amount:</strong> ₹ {appointment?.totalFee} &nbsp;&nbsp;
          <strong>Consultation Fee:</strong> ₹ {appointment?.consultationFee} &nbsp;&nbsp;
        </p>

        <h6 className="fw-bold">Doctor Details</h6>
        <p>
          <strong>Doctor ID:</strong> {appointment?.doctorId} &nbsp;&nbsp;
          <strong>Consultation Type:</strong> {appointment?.consultationType}
        </p>
        <p>
          <strong>Service Name:</strong> {appointment?.servicename} &nbsp;&nbsp;
          <strong>Service ID:</strong> {appointment?.serviceId}
        </p>
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
    <p className="mb-1"><strong>Specialization:</strong> {doctor.specialization}</p>
    <p className="mb-1"><strong>Experience:</strong> {doctor.experience} years</p>
    <p className="mb-1"><strong>Qualification:</strong> {doctor.qualification}</p>
    <p className="mb-0"><strong>Languages:</strong> {doctor.languages?.join(', ')}</p>
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
