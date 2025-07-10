import React, { useEffect, useState, useCallback } from 'react' // Added useCallback
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormLabel,
  CFormInput,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import { DoctorNotifyData, postNotifyData } from './DoctorNotificationsAPI'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'
import { useHospital } from '../Usecontext/HospitalContext'
import DoctorManagement from '../Doctors/DoctorManagement'

const DoctorNotifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  // const [notificationCount, setNotificationCount] = useState(0)
  const { setNotificationCount } = useHospital()

  const handleResponse = async (status, reason = '') => {
    const payload = {
      hospitalId: selectedNotification?.data?.clinicId,
      doctorId: selectedNotification?.data?.doctorId,
      notificationId: selectedNotification?.notificationId,
      appointmentId: selectedNotification?.data?.bookingId,
      subServiceId: selectedNotification?.data?.subServiceId,
      status: status,
      reasonForCancel: reason,
    }
    console.log(payload)
    try {
      const res = await postNotifyData(payload)
      console.log(res)
      if (res.status === 200) {
        toast.success(`Notification ${status} successfully`)
        setShowViewModal(false)
        setShowRejectModal(false)
        setRejectReason('')
        fetchNotifications()
      }
    } catch (err) {
      toast.error('Something went wrong!')
    }
  }

  const navigate = useNavigate()
  // const { doctorData } = useHospital(); // Uncomment if you're using a context for doctor data
  // const testDoctorFetch = async () => {
  //   const hospitalId = localStorage.getItem('HospitalId')
  //   console.log('🔍 Testing doctor fetch for hospital:', hospitalId)

  //   if (!hospitalId) {
  //     // console.warn('🚨 No HospitalId found in localStorage')
  //     return
  //   }

  //   // const apiUrl = `http://192.168.1.24:8080/clinic-admin/doctors/hospitalById/${hospitalId}`
  //   // console.log('🌐 API URL:', apiUrl)

  //   try {
  //     const response = await axios.get(apiUrl)
  //     console.log('✅ Doctor list fetched:', response.data)
  //   } catch (error) {
  //     console.error('❌ Failed doctor fetch:', error)

  //     if (error.response) {
  //       console.error('📛 Status:', error.response.status)
  //       console.error('📛 Data:', error.response.data)
  //     } else if (error.request) {
  //       console.error('📴 No response:', error.request)
  //     } else {
  //       console.error('❗ Error message:', error.message)
  //     }
  //   }
  // }

  // useEffect(() => {
  //   testDoctorFetch()
  // }, [])

  useEffect(() => {
    const fetchDoctorIdAndNotifications = async () => {
      const hospitalId = localStorage.getItem('HospitalId')
      console.log('🧪 HospitalId from localStorage:', hospitalId)

      if (!hospitalId) {
        toast.error('❌ Hospital ID missing in localStorage')
        return
      }

      try {
        console.log(
          '📡 Calling API:',
          `http://192.168.1.24:8080/clinic-admin/doctors/hospitalById/${hospitalId}`,
        )

        const response = await axios.get(
          `http://192.168.1.24:8080/clinic-admin/doctors/hospitalById/${hospitalId}`,
        )

        console.log('✅ Response:', response)

        if (
          response.status === 200 &&
          response.data &&
          Array.isArray(response.data.data) &&
          response.data.data.length > 0
        ) {
          const doctorId = response.data.data[0].doctorId
          localStorage.setItem('DoctorId', doctorId)
          fetchNotifications()
        }
        // else {
        //   toast.warning('No doctors found for this hospital.')
        // }
      } catch (error) {
        console.error('❌ Error fetching doctors:', error)

        if (error.response) {
          console.log('Status:', error.response.status)
          console.log('Error Data:', error.response.data)
        } else if (error.request) {
          console.log('🚫 No response received. Request:', error.request)
        } else {
          console.log('❗Other error:', error.message)
        }

        // toast.error('Error fetching doctor list.')
      }
    }

    fetchDoctorIdAndNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const hospitalId = localStorage.getItem('HospitalId')
      const doctorId = localStorage.getItem('DoctorId')

      console.log(
        'Fetch Notifications: Checking IDs -> HospitalId:',
        hospitalId,
        'DoctorId:',
        doctorId,
      )

      if (!hospitalId || !doctorId) {
        toast.error('Authentication Error: Missing Hospital or Doctor ID. Please log in again.', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'colored',
        })
        setNotifications([]) // clear any existing
        return
      }

      const response = await DoctorNotifyData(hospitalId, doctorId) // using your API wrapper

      if (response.status === 200 && Array.isArray(response.data.data)) {
        setNotificationCount(response.data.data.length)
        setNotifications(response.data.data)
        // toast.success('Notifications loaded successfully!', { autoClose: 1500 })
      } else {
        // toast.info(response.data.message || 'No notifications found for this doctor.', {
        //  position: 'top-right',
        //   autoClose: 3000,
        //   hideProgressBar: false,
        //   closeOnClick: true,
        //   pauseOnHover: true,
        //   draggable: true,
        //   progress: undefined,
        //   theme: 'light',
        // })
        setNotifications([])
      }
    } catch (error) {
      console.error('Error in fetchNotifications:', error)
      toast.error('Failed to fetch notifications. Please check your network or try again later.', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      })
      setNotifications([])
    }
  }

  useEffect(() => {
    const fetchDoctorIdAndNotifications = async () => {
      const hospitalId = localStorage.getItem('HospitalId')

      if (!hospitalId) {
        toast.error('Missing Hospital ID in localStorage')
        return
      }

      try {
        // Step 1: Get actual doctor list
        const response = await axios.get(
          `http://192.168.1.24:8080/clinic-admin/doctors/hospitalById/${hospitalId}`,
        )

        if (response.status === 200 && Array.isArray(response.data) && response.data.length > 0) {
          const doctorId = response.data[0].doctorId // Or whichever doctor logic you want
          localStorage.setItem('DoctorId', doctorId)

          console.log('Doctor ID set in localStorage:', doctorId)

          // Step 2: Now fetch notifications using correct DoctorId
          fetchNotifications()
        }
        //  else {
        //   toast.warning('No doctors found for this hospital.')
        // }
      } catch (error) {
        console.error('Error fetching doctors:', error)
        toast.error('Error fetching doctor list.')
      }
    }

    fetchDoctorIdAndNotifications()
  }, []) // Empty dependency to run only once on mount

  return (
    <div className="container mt-4">
      <ToastContainer />
      <h5>Doctor Notifications</h5>

      <CTable striped hover responsive>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>S.No</CTableHeaderCell>
            <CTableHeaderCell>Doctor Name</CTableHeaderCell>
            <CTableHeaderCell>Patient Name</CTableHeaderCell>
            <CTableHeaderCell>Mobile Number</CTableHeaderCell>
            <CTableHeaderCell>Consultation Type</CTableHeaderCell>
            <CTableHeaderCell>Date</CTableHeaderCell>
            <CTableHeaderCell>Time</CTableHeaderCell>

            <CTableHeaderCell>Action</CTableHeaderCell>
          </CTableRow>
        </CTableHead>

        <CTableBody>
          {notifications.length > 0 ? (
            notifications.map((item, index) => (
              <CTableRow key={item.notificationId || index}>
                {' '}
                {/* Added index as fallback key */}
                <CTableDataCell>{index + 1}</CTableDataCell>
                <CTableDataCell>{item.data?.doctorName || '-'}</CTableDataCell>
                <CTableDataCell>{item.data?.name || '-'}</CTableDataCell>
                <CTableDataCell>{item.data?.mobileNumber || '-'}</CTableDataCell>
                <CTableDataCell>{item.data?.consultationType || '-'}</CTableDataCell>
                <CTableDataCell>{item.data?.serviceDate || '-'}</CTableDataCell>
                <CTableDataCell>{item.data?.servicetime || '-'}</CTableDataCell>
                <CTableDataCell>
                  <CButton
                    color="primary"
                    size="sm"
                    onClick={() => {
                      setSelectedNotification(item)
                      setShowViewModal(true)
                    }}
                  >
                    View
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))
          ) : (
            <CTableRow>
              <CTableDataCell colSpan="9" className="text-center text-secondary fw-bold">
                {/* Changed text color to secondary as it's an info message, not an error */}
                No notifications available or data could not be loaded.
              </CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable>
      <CModal visible={showViewModal} onClose={() => setShowViewModal(false)}>
        <CModalHeader>
          <CModalTitle>Appointment Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedNotification && (
            <>
              <p>
                <strong>Doctor:</strong> {selectedNotification.data?.doctorName}
              </p>
              <p>
                <strong>Patient:</strong> {selectedNotification.data?.name}
              </p>
              <p>
                <strong>Age:</strong> {selectedNotification.data?.age}
              </p>
              <p>
                <strong>Gender:</strong> {selectedNotification.data?.gender}
              </p>
              <p>
                <strong>Mobile:</strong> {selectedNotification.data?.mobileNumber}
              </p>
              <p>
                <strong>Problem:</strong> {selectedNotification.data?.problem}
              </p>
              <p>
                <strong>Clinic:</strong> {selectedNotification.data?.clinicName}
              </p>
              <p>
                <strong>Service:</strong> {selectedNotification.data?.subServiceName}
              </p>
              <p>
                <strong>Date:</strong> {selectedNotification.data?.serviceDate}
              </p>
              <p>
                <strong>Time:</strong> {selectedNotification.data?.servicetime}
              </p>
              <p>
                <strong>Type:</strong> {selectedNotification.data?.consultationType}
              </p>
              <p>
                <strong>Fee:</strong> ₹{selectedNotification.data?.consultationFee}
              </p>
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="primary"
            size="sm"
            className="px-3"
            onClick={() => navigate(`/doctor`)}
            // onClick={() => navigate(`/doctor/${selectedNotification.data?.doctorId}`)}
          >
            Doctor Details
          </CButton>
          <CButton
            color="success"
            className="text-white"
            onClick={() => handleResponse('Accepted')}
          >
            Accept
          </CButton>
          <CButton
            color="danger"
            className="text-white"
            onClick={() => {
              setShowViewModal(false)
              setShowRejectModal(true)
            }}
          >
            Reject
          </CButton>
          <CButton color="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
      <CModal visible={showRejectModal} onClose={() => setShowRejectModal(false)}>
        <CModalHeader>
          <CModalTitle>Reject Appointment</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormLabel htmlFor="rejectReason">Reason for Rejection</CFormLabel>
          <CFormInput
            id="rejectReason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter reason here"
          />
        </CModalBody>
        <CModalFooter>
          <CButton
            color="danger"
            className="text-white"
            onClick={() => {
              if (!rejectReason.trim()) {
                toast.warning('Please provide a reason.')
                return
              }
              handleResponse('Rejected', rejectReason)
            }}
          >
            Submit
          </CButton>
          <CButton color="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default DoctorNotifications
