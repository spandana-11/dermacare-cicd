import React from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { CButton, CCard, CCardBody, CModalFooter, CModalHeader, CModalTitle, CCardHeader, CBadge, CRow, CCol } from '@coreui/react'

import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { deleteBookingData } from './AppointmentAPI' // adjust this path as per your project
import { getBookingBy_DoctorId } from './AppointmentAPI'

const AppointmentDetails = () => {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [isDeleting, setIsDeleting] = useState(false)
  const [doctor, setDoctor] = useState([])

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
          const res = await getBookingBy_DoctorId(appointment.doctorId)
          console.log(res)
          setDoctor(res)
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

  console.log(doctor?.availableDays)
  console.log(doctor)
  return (
    <div className="container mt-4">
      {/* Header Section with blue background */}
      <div className="bg-info text-white p-3 d-flex justify-content-between align-items-center rounded">
        {/* Left section: Booking ID and Status */}
        <div>
          <h5 className="mb-1 text" style={{ color: "white" }}>Booking ID: {appointment.bookingId}</h5>
        </div>

        <div className="d-flex gap-2">
          <CButton
            size="sm"
            style={{
              background: '#fff',
              color: '#00838F',
              border: 'none',
              fontWeight: '600',
              borderRadius: '8px',
              padding: '6px 14px',
            }}
            onClick={() => navigate(-1)}
          >
            Back
          </CButton>
          {/* Optional Delete */}
          {/* <CButton color="danger" size="sm" onClick={handleConfirmDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </CButton> */}
        </div>
      </div>
      {/* Appointment Details */}
      <CCard className="mt-4 shadow border-0 rounded-4">
        <CCardHeader
          className="border-0 py-3 d-flex justify-content-between align-items-center rounded-top-4"
          style={{ backgroundColor: '#D9F3F2' }}
        >
          <h5 className="fw-bold mb-0" style={{ color: '#7e3a93' }}>
            Patient Details
          </h5>
          <CBadge color={getStatusColor(appointment.status)} className="px-3 py-2 text-uppercase fs-6">
            {appointment.status}
          </CBadge>
        </CCardHeader>

        <CCardBody className="px-4 py-4" style={{ backgroundColor: '#FFFFFF' }}>
          <CRow className="mb-3">
            <CCol md={4}><strong>Patient Name:</strong> <span className="text-dark">{appointment?.name}</span></CCol>
            <CCol md={4}><strong>Mobile Number:</strong> {appointment?.mobileNumber}</CCol>
            <CCol md={4}><strong>Booking For:</strong> {appointment?.bookingFor}</CCol>
            <CCol md={4}><strong>Age:</strong> {appointment?.age} Yrs</CCol>
            <CCol md={4}><strong>Gender:</strong> {appointment?.gender}</CCol>
            <CCol md={12}><strong>Problem:</strong>{appointment?.problem || 'N/A'}</CCol>
          </CRow>

          <hr className="my-4" />

          {/* Slot & Payment */}
          <h6 className="fw-bold mb-3" style={{ color: '#00838F' }}>
            Slot & Payment Details
          </h6>
          <CRow className="mb-3">
            <CCol md={4}><strong>Date:</strong> {appointment?.serviceDate}</CCol>
            <CCol md={4}><strong>Time:</strong> {appointment?.servicetime}</CCol>
            <CCol md={4}><strong>Paid Amount:</strong> ₹{appointment?.totalFee}</CCol>
            <CCol md={4}><strong>Consultation Fee:</strong> ₹{appointment?.consultationFee}</CCol>
          </CRow>

          <hr className="my-4" />

          {/* Doctor & Service */}
          <h6 className="fw-bold mb-3" style={{ color: '#00838F' }}>
            Doctor & Service Details
          </h6>
          <CRow>
            <CCol md={4}><strong>Doctor ID:</strong> {appointment?.doctorId}</CCol>
            <CCol md={4}><strong>Consultation Type:</strong> {appointment?.consultationType}</CCol>
            <CCol md={4}><strong>Service Name:</strong> {appointment?.subServiceName}</CCol>
            <CCol md={4}><strong>Service ID:</strong> {appointment?.subServiceId}</CCol>
            <CCol md={4}><strong>Clinic Name:</strong> {appointment?.clinicName || 'N/A'}</CCol>
          </CRow>
        </CCardBody>
      </CCard>


      {/* Doctor Section */}
      {(appointment?.status.toLowerCase() === 'confirmed' ||
        appointment?.status.toLowerCase() === 'completed') && doctor && (
          <CCard className="mt-4 shadow border-0 rounded-4">
            <CCardHeader
              className="border-0 py-3 rounded-top-4"
              style={{ backgroundColor: '#D9F3F2' }}
            >
              <h5 className="fw-bold mb-0" style={{ color: '#7e3a93' }}>
                Doctor Details
              </h5>
            </CCardHeader>
            <CCardBody className="px-4 py-4 d-flex align-items-center gap-4" style={{ backgroundColor: '#FFFFFF' }}>
              <img
                src={getDoctorImage(doctor.doctorPicture)}
                alt={doctor.doctorName}
                width={90}
                height={90}
                className="rounded-circle border shadow-sm"
                style={{ borderColor: '#00ACC1' }}
              />
              <div>
                <h6 className="fw-bold mb-2" style={{ color: '#006666' }}>
                  {doctor.doctorName}
                </h6>
                <p className="mb-1"><strong>Specialization:</strong> {doctor.specialization}</p>
                <p className="mb-1"><strong>Experience:</strong> {doctor.experience} years</p>
                <p className="mb-1"><strong>Qualification:</strong> {doctor.qualification}</p>
                <p className="mb-0"><strong>Languages:</strong> {doctor.languages?.join(', ')}</p>
              </div>
            </CCardBody>
          </CCard>
        )}
    </div>
  )
}

export default AppointmentDetails
