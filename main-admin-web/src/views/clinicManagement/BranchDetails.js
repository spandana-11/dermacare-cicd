import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
import {getDoctorsByHospitalAndBranchId} from '../Doctors/DoctorAPI'
import { DoctorAllData } from '../../baseUrl'
import DoctorCard from '../Doctors/DoctorCard'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const BranchDetails = () => {
  <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />
  const { branchId } = useParams()
  const { clinicId } = useParams()
  
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState(0)
  const [branchData, setBranchData] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [allDoctors, setAllDoctors] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
const [selectedDoctor, setSelectedDoctor] = useState(null)
const [showDoctorModal, setShowDoctorModal] = useState(false)
 const [showDeleteModal, setShowDeleteModal] = useState(false)

const fetchAllDoctors = async (clinicId, branchId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/admin/getDoctorsByHospitalIdAndBranchId/${clinicId}/${branchId}`
    )
    console.log('Doctors array for branch:', response.data)
    setAllDoctors(response.data?.data || [])
    setCurrentPage(1)
  } catch (error) {
    console.error('Error fetching doctors for branch:', error.response?.data || error.message)
  }
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
       <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />
      {/* Header */}
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h3 className="mb-0">Branch Details</h3>
        <CButton color="secondary" onClick={() => navigate(-1)}>
          Back
        </CButton>
      </CCardHeader>

      <CCardBody>
        {/* Navigation Tabs */}
        <CNav variant="tabs">
          <CNavItem>
            <CNavLink active={activeTab === 0} onClick={() => setActiveTab(0)}>
              Branch Details
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={activeTab === 1} onClick={() => setActiveTab(1)}>
              Doctors
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={activeTab === 2} onClick={() => setActiveTab(2)}>
              Appointments
            </CNavLink>
          </CNavItem>
        </CNav>

            <CModal
                      visible={showDoctorModal}
                      onClose={() => setShowDoctorModal(false)}
                      size="lg"
                      backdrop="static"
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
                <CCol md={6}>
                  <p><strong>Branch Name:</strong> {branchData.branchName}</p>
                  <p><strong>Clinic ID:</strong> {branchData.clinicId}</p>
                  <p><strong>Address:</strong> {branchData.address}</p>
                  <p><strong>City:</strong> {branchData.city}</p>
                </CCol>
                <CCol md={6}>
                  <p><strong>Contact Number:</strong> {branchData.contactNumber}</p>
                  <p><strong>Email:</strong> {branchData.email}</p>
                  <p><strong>Coordinates:</strong> {branchData.latitude}, {branchData.longitude}</p>
                  <p><strong>Virtual Tour:</strong> {branchData.virtualClinicTour || 'N/A'}</p>
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
                         <table className="table">
                           <thead>
                             <tr>
                               <th>S.No</th>
                               <th>Doctor Name</th>
                               <th>Contact</th>
                               <th>Specialization</th>
                               <th>Sub Services</th> {/* 👈 Added */}
                               <th>Status</th>
                               <th>Actions</th>
                             </tr>
                           </thead>
                           <tbody>
                             {allDoctors.length > 0 ? (
         currentItems.map((doc, idx) => (
                                   <tr key={idx}>
                                   <td>{indexOfFirstItem +idx + 1}</td> 
                                   <td>{capitalizeWords(doc.doctorName)}</td>
                                   <td>{doc.doctorMobileNumber}</td>
                                   <td>{doc.specialization}</td>
                                   <td>
                                     {doc.subServices && doc.subServices.length > 0
                                       ? doc.subServices.map((sub) => sub.subServiceName).join(', ')
                                       : 'No Sub Services'}
                                   </td>
                                   <td>{doc.status || 'Active'}</td>
                                   <td>
                                     <CButton
                                       className="btn btn-primary me-2"
                                       size="sm"
                                       onClick={() => {
                                        // DoctorCard(doc)
                                         setSelectedDoctor(doc)
                                         setShowDoctorModal(true)
                                       }}
                                     >
                                       View
                                     </CButton>
                                      <CButton
                                       className="btn btn-warning me-2"
                                       size="sm"
                                       onClick={() => {
                                        // 
                                         setSelectedDoctor(doc)
                                         setShowDoctorModal(true)
                                       }}
                                     >
                                       Edit
                                     </CButton>
                                     {allDoctors.map((doc) => (
        <CButton
          color="danger"
          size="sm"
          key={doc.doctorId}
          onClick={() => openDeleteModal(doc)}
        >
          Delete
        </CButton>
      ))}
                                   </td>
                                 </tr>
                               ))
                             ) : (
                               <tr>
                                 <td colSpan="6" className="text-center">
                                   No Doctors Available
                                 </td>
                               </tr>
                             )}
                           </tbody>
                         </table>
         
                         {allDoctors.length>0 &&(
                           <div className="d-flex justify-content-between align-items-center mt-3">
                             <div className="d-flex align-items-center">
                               <span className="me-2">Rows per page:</span>
                               <CFormSelect
                               value={itemsPerPage}
                               onChange={(e)=>{
                                 setItemsPerPage(Number(e.target.value))
                                 setCurrentPage(1)
                               }}
                               style={{width:'auto'}}
                               >
                                 <option value={5}>5</option>
                                 <option value={10}>10</option>
                                 <option value={15}>25</option>
                               </CFormSelect>
                             </div>
                             <CPagination className="mb-0">
                               <CPaginationItem
                               disabled={currentPage===1}
                               onClick={()=>setCurrentPage(currentPage-1)}
                               >
                                 Previous
                               </CPaginationItem>
                              {Array.from({ length: totalPages }, (_, index) => (
  <CPaginationItem
    key={index}
    active={currentPage === index + 1}
    onClick={() => setCurrentPage(index + 1)}
  >
    {index + 1}
  </CPaginationItem>
))}
                               <CPaginationItem  
                               disabled={currentPage===totalPages}
                               onClick={()=>setCurrentPage(currentPage+1)}
                               >
                                 Next
                               </CPaginationItem>
                             </CPagination>
                           </div>
                         )}
                       </CTabPane>

          {/* Appointments Tab */}
          <CTabPane visible={activeTab === 2}>
            {appointments.length > 0 ? (
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>#</CTableHeaderCell>
                    <CTableHeaderCell>Patient</CTableHeaderCell>
                    <CTableHeaderCell>Date</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {appointments.map((apt, idx) => (
                    <CTableRow key={idx}>
                      <CTableDataCell>{idx + 1}</CTableDataCell>
                      <CTableDataCell>{apt.patientName}</CTableDataCell>
                      <CTableDataCell>{apt.date}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            ) : (
              <p>No appointments found for this branch.</p>
            )}
          </CTabPane>
        </CTabContent>
      </CCardBody>
    </CCard>
  )
}

export default BranchDetails
