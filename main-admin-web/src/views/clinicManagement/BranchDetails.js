import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import axios from 'axios'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CButton,
  CTableBody,
  CSpinner,
  CRow,
  CCol,
  CFormSelect,
  CPagination,
  CPaginationItem,
  CModal,
  CModalHeader,
  CModalBody,
  CModalTitle,
  CModalFooter
} from '@coreui/react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { BASE_URL } from '../../baseUrl'
import { fetchBranchByBranchId } from './AddBranchAPI'
import AddDoctors from '../Doctors/AddDoctors'
// import EditDoctor from '../Doctors/EditDoctor'
import { getDoctorsByHospitalAndBranchId } from '../Doctors/DoctorAPI'
import { DoctorAllData } from '../../baseUrl'
import DoctorCard from '../Doctors/DoctorCard'
import { ToastContainer } from 'react-toastify'
import AppointmentManagement from '../AppointmentManagement/AppointmentManagement'
import 'react-toastify/dist/ReactToastify.css'
import DoctorDetailsPage from '../Doctors/DoctorDetailsPage'
import EmployeeManagement from '../EmployeeManagement/EmployeeManagement'


const BranchDetails = () => {

  const { branchId, clinicId } = useParams()

  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [formErrors, setFormErrors] = useState({})
  const tabFromUrl = parseInt(searchParams.get('tab')) || 0

  const [activeTab, setActiveTab] = useState(tabFromUrl)
  const [branchData, setBranchData] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [allDoctors, setAllDoctors] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showDoctorModal, setShowDoctorModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editDoctorModal, setEditDoctorModal] = useState(false)
  // const currentItems = allDoctors.slice(indexOfFirstItem, indexOfLastItem)

  const fetchAllDoctors = async (clinicId, branchId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/admin/getDoctorsByHospitalIdAndBranchId/${clinicId}/${branchId}`
      )
      console.log('Doctors array for branch:', `${BASE_URL}/admin/getDoctorsByHospitalIdAndBranchId/${clinicId}/${branchId}`)
      setAllDoctors(response.data?.data || [])
      setCurrentPage(1)
    } catch (error) {
      console.error('Error fetching doctors for branch:', error.response?.data || error.message)
    }
  }
  useEffect(() => {
    const tab = parseInt(searchParams.get('tab')) || 0
    setActiveTab(tab)
  }, [searchParams])
  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex)
    setSearchParams({ tab: tabIndex })
  }
  const capitalizeWords = (str) =>
    str?.replace(/\b\w/g, (char) => char.toUpperCase()) || ''
  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        setLoading(true)
        const branch = await fetchBranchByBranchId(branchId)
        setBranchData(branch.data)

        if (branch.data?.clinicId) {
          console.log("✅ clinicId from branch data:", branch.data.clinicId)
          await fetchAllDoctors(branch.data.clinicId, branchId)
        } else {
          console.warn("⚠️ clinicId is missing in branch data")
        }

        // const appointmentsRes = await axios.get(
        //   `${BASE_URL}/appointments?branchID=${branchId}`
        // )
        // setAppointments(appointmentsRes.data)
      } catch (error) {
        console.error('Error fetching branch details:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchBranchData()
  }, [branchId])
  const handleUpdateDoctor = async (updatedDoctor) => {
    try {
      const doctorId = updatedDoctor.doctorId
      const response = await axios.put(`${BASE_URL}/admin/updateDoctor/${doctorId}`, updatedDoctor)

      if (response.data?.success) {
        toast.success(`Dr. ${selectedDoctor.doctorName} deleted successfully!`)
        // Update doctors list locally
        setAllDoctors((prev) =>
          prev.map((doc) => (doc.doctorId === doctorId ? updatedDoctor : doc))
        )
        setShowDoctorModal(false)
      } else {
        toast.error('Failed to update doctor')
      }
    } catch (error) {
      console.error('Error updating doctor:', error)
      toast.error('Error updating doctor')
    }
  }
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = allDoctors.slice(indexOfFirstItem, indexOfLastItem)

  const totalPages = Math.ceil(allDoctors.length / itemsPerPage)
  const openDeleteModal = (doctor) => {
    setSelectedDoctor(doctor)
    setShowDeleteModal(true)
  }
  const handleDeleteDoctor = async () => {
    if (!selectedDoctor) return

    try {
      const response = await axios.delete(`${BASE_URL}/admin/deleteDoctor/${selectedDoctor.doctorId}`)

      if (response.data?.success) {
        toast.success(`Dr. ${selectedDoctor.doctorName} deleted successfully!`)
        setAllDoctors(allDoctors.filter((doc) => doc.doctorId !== selectedDoctor.doctorId))
      } else {
        toast.error(response.data?.message || 'Failed to delete doctor')
      }
    } catch (error) {
      console.error('Error deleting doctor:', error.response?.data || error.message)
      toast.error('Error deleting doctor')
    } finally {
      setShowDeleteModal(false)
      setSelectedDoctor(null)
    }
  }
  return (
    <CCard className="mt-4">
      <ToastContainer />
      {/* Header */}
      <div className="bg-info text-white p-3 d-flex justify-content-between align-items-center rounded">
        {/* Left section: Booking ID and Status */}
        <div>
          <h5 className="mb-1 text" style={{ color: "white" }}>Branch Details</h5>
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

        </div>
      </div>

      <CCardBody>
        {/* Navigation Tabs */}
        <CNav variant="tabs">
          <CNavItem>
            <CNavLink active={activeTab === 0} onClick={() => handleTabChange(0)}>
              Branch Details
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={activeTab === 1} onClick={() => handleTabChange(1)}>
              Doctors
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={activeTab === 2} onClick={() => handleTabChange(2)}>
              Appointments
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={activeTab === 3} onClick={() => handleTabChange(3)}>
              Employee Management
            </CNavLink>
          </CNavItem>
        </CNav>

        <CModal
          visible={showDoctorModal}
          onClose={() => setShowDoctorModal(false)}
          size="lg"
          backdrop="static" className='custom-modal'
        >
          <CModalHeader>
            <CModalTitle>Doctor Profile</CModalTitle>
          </CModalHeader>
          <CModalBody>
            {selectedDoctor && (
              <div className="container-fluid">
                {/* Personal Info */}
                <h6 className="text-primary border-bottom pb-2 mb-4">Personal Information</h6>
                <CRow className="gy-4 align-items-start">
                  {/* Doctor Image */}
                  <CCol md={3} className="text-center">
                    <img
                      src={selectedDoctor.doctorPicture}
                      alt="Doctor"
                      className="img-thumbnail"
                      style={{ width: '100%', maxWidth: '180px', borderRadius: '10px' }}
                    />
                  </CCol>

                  {/* Doctor Info */}
                  <CCol md={9}>
                    <CRow className="gy-3">
                      <CCol md={6}>
                        <strong>Name:</strong>
                        <div className="text-muted">{selectedDoctor.doctorName}</div>
                      </CCol>
                      <CCol md={6}>
                        <strong>Contact:</strong>
                        <div className="text-muted">{selectedDoctor.doctorMobileNumber}</div>
                      </CCol>
                      <CCol md={6}>
                        <strong>Qualification:</strong>
                        <div className="text-muted">{selectedDoctor.qualification}</div>
                      </CCol>
                      <CCol md={6}>
                        <strong>Specialization:</strong>
                        <div className="text-muted">{selectedDoctor.specialization}</div>
                      </CCol>
                      <CCol md={6}>
                        <strong>Experience:</strong>
                        <div className="text-muted">{selectedDoctor.experience} years</div>
                      </CCol>
                    </CRow>
                  </CCol>
                </CRow>

                {/* Availability */}
                <h6 className="text-primary border-bottom pb-2 mt-4 mb-3">Availability</h6>
                <CRow className="gy-3">
                  <CCol md={6}>
                    <strong>Available Days:</strong>
                    <div className="text-muted">{selectedDoctor.availableDays}</div>
                  </CCol>
                  <CCol md={6}>
                    <strong>Available Times:</strong>
                    <div className="text-muted">{selectedDoctor.availableTimes}</div>
                  </CCol>
                </CRow>

                {/* Languages & Areas */}
                <h6 className="text-primary border-bottom pb-2 mt-4 mb-3">Expertise</h6>
                <CRow className="gy-3">
                  <CCol md={6}>
                    <strong>Languages:</strong>
                    <div className="text-muted">
                      {selectedDoctor.languages?.join(', ') || '-'}
                    </div>
                  </CCol>
                  <CCol md={6}>
                    <strong>Focus Areas:</strong>
                    <div className="text-muted">
                      {selectedDoctor.focusAreas?.join(', ') || '-'}
                    </div>
                  </CCol>
                  <CCol md={12}>
                    <strong>Highlights:</strong>
                    <div className="text-muted">
                      {selectedDoctor.highlights?.join(', ') || '-'}
                    </div>
                  </CCol>
                </CRow>

                {/* Services */}
                <h6 className="text-primary border-bottom pb-2 mt-4 mb-3">Services Offered</h6>
                <CRow className="gy-3">
                  {/* Services List */}
                  <CCol md={12}>
                    <strong>Services:</strong>
                    {selectedDoctor.service && selectedDoctor.service.length > 0 ? (
                      <ul className="mt-2">
                        {selectedDoctor.service.map((s) => (
                          <li key={s.serviceId} className="text-muted">
                            {s.serviceName}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted">-</p>
                    )}
                  </CCol>

                  {/* Sub Services List */}
                  <CCol md={12}>
                    <strong>Sub Services:</strong>
                    {selectedDoctor.subServices && selectedDoctor.subServices.length > 0 ? (
                      <ul className="mt-2">
                        {selectedDoctor.subServices.map((s) => (
                          <li key={s.subServiceId} className="text-muted">
                            {s.subServiceName}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted">-</p>
                    )}
                  </CCol>
                </CRow>

                {/* Fees */}
                <h6 className="text-primary border-bottom pb-2 mt-4 mb-3">Consultation Fees</h6>
                <CRow className="gy-3">
                  <CCol md={6}>
                    <strong>In-Clinic:</strong>
                    <div className="text-muted">
                      ₹{selectedDoctor.doctorFees?.inClinicFee || 0}
                    </div>
                  </CCol>
                  <CCol md={6}>
                    <strong>Video:</strong>
                    <div className="text-muted">
                      ₹{selectedDoctor.doctorFees?.vedioConsultationFee || 0}
                    </div>
                  </CCol>
                </CRow>

                {/* Profile Description */}
                <h6 className="text-primary border-bottom pb-2 mt-4 mb-3">Profile Summary</h6>
                <div className="border rounded p-3 bg-light text-muted">
                  {selectedDoctor.profileDescription || 'No description available.'}
                </div>
              </div>
            )}
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowDoctorModal(false)}>
              Close
            </CButton>
            {/* <CButton color="primary">Edit</CButton> */}
          </CModalFooter>
        </CModal>

        {/* Tab Content */}
        <CTabContent className="mt-3">
          {/* Branch Details Tab */}
          <CTabPane visible={activeTab === 0}>
            {loading ? (
              <CSpinner />
            ) : branchData ? (
              <CRow>
                <CCol xs={12}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '150px 1fr', // Label column fixed, value column flexible
                      rowGap: '10px',
                      columnGap: '20px',
                    }}
                  >
                    <strong>Branch Name:</strong>
                    <span>{branchData.branchName}</span>

                    <strong>Clinic ID:</strong>
                    <span>{branchData.clinicId}</span>

                    <strong>Address:</strong>
                    <span>{branchData.address}</span>

                    <strong>City:</strong>
                    <span>{branchData.city}</span>

                    <strong>Contact Number:</strong>
                    <span>{branchData.contactNumber}</span>

                    <strong>Email:</strong>
                    <span>{branchData.email}</span>

                    <strong>Coordinates:</strong>
                    <span>{branchData.latitude}, {branchData.longitude}</span>

                    <strong>Virtual Tour:</strong>
                    <span>{branchData.virtualClinicTour || 'N/A'}</span>
                  </div>
                </CCol>
              </CRow>


            ) : (
              <p>No branch details available.</p>
            )}
          </CTabPane>
          <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
            <CModalHeader>
              <CModalTitle>Confirm Delete</CModalTitle>
            </CModalHeader>
            <CModalBody>
              Are you sure you want to delete Dr. {selectedDoctor?.doctorName}? This action cannot be undone.
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </CButton>
              <CButton color="danger" onClick={handleDeleteDoctor}>
                Delete
              </CButton>
            </CModalFooter>
          </CModal>
          {/* Doctors Tab */}
          <CTabPane visible={activeTab === 1}>
            <CCardHeader>
              <div className="d-flex justify-content-between align-items-center mb-3 w-100">
                {/* <CButton color="secondary" onClick={() => navigate(-1)}>
        Back
      </CButton> */}

                <h4 className="mb-0 text-center flex-grow-1">Doctor Details</h4>

                <button
                  className="btn btn-info text-white d-flex align-items-center gap-2 shadow-sm rounded-pill px-4 py-2"
                  onClick={() => {
                    setFormErrors({})
                    setModalVisible(true)
                  }}
                  style={{
                    background: 'linear-gradient(90deg, #0072CE 0%, #00AEEF 100%)',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '16px',
                  }}
                >
                  <span>Add Doctor</span>
                </button>
              </div>
            </CCardHeader>

            {/* Add Doctor Modal */}
            {branchData?.clinicId && (
              <AddDoctors
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                clinicId={branchData.clinicId}  // hospitalId
                branchId={branchData.branchId}   // branchId
                closeForm={() => setModalVisible(false)}
                fetchAllDoctors={() => fetchAllDoctors(branchData.clinicId, branchId)}
              />
            )}

            {/* Doctor Cards */}
            {currentItems.length > 0 ? (
              <div className="doctor-card-container">
                {currentItems.map(doc => (
                  <DoctorCard
                    key={doc.doctorId}
                    doctor={doc}
                    branchId={branchData.branchId} // ✅ pass branchId here
                    onEdit={() => {
                      setSelectedDoctor(doc)
                      setEditDoctorModal(true)
                    }}
                    onDelete={() => openDeleteModal(doc)}
                    onView={() => {
                      setSelectedDoctor(doc)
                      setShowDoctorModal(true)
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center">No Doctors Available</p>
            )}

            <style>{`
  .doctor-card-container {
    display: flex;
    flex-direction: column; /* stack vertically */
    gap: 20px; /* spacing between cards */
  }

  .doctor-card {
    width: 100%; /* full width */
  }
`}</style>

          </CTabPane>
          <CTabPane visible={activeTab === 2}>
            <AppointmentManagement branchId={branchId} clinicId={branchData?.clinicId} />
          </CTabPane>
          <CTabPane visible={activeTab === 3}>
            <EmployeeManagement branchId={branchId} clinicId={branchData?.clinicId} />
          </CTabPane>
        </CTabContent>
      </CCardBody>
    </CCard>
  )
}

export default BranchDetails
