import React, { useEffect, useState } from 'react'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'
import { AllClinicData, NGkRegistrationLink, statusapi } from '../../baseUrl'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CFormInput,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CPagination,
  CPaginationItem,
  CFormSelect, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter
} from '@coreui/react'
import { COLORS } from '../../Constant/Themes'
import LoadingIndicator from '../../Utils/loader'
import { toast } from 'react-toastify'
import capitalizeWords from '../../Utils/capitalizeWords'

// Backend → UI Status
const mapBackendStatusToUI = (status) => {
  switch (status) {
    case "PENDING": return "pending"
    case "VERIFICATION_IN_PROGRESS": return "start"
    case "VERIFIED": return "verified"
    case "REJECTED": return "rejected"
    default: return "pending"
  }
}

// UI → Backend Status
const mapUIStatusToBackend = (status) => {
  switch (status) {
    case "pending": return "PENDING"
    case "start": return "VERIFICATION_IN_PROGRESS"
    case "verified": return "VERIFIED"
    case "rejected": return "REJECTED"
    default: return "PENDING"
  }
}

const ClinicManagement = ({ service }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const [clinics, setClinics] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [linkInputValue, setLinkInputValue] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const [modalVisible, setModalVisible] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [selectedClinicId, setSelectedClinicId] = useState(null)

  const [previousStatus, setPreviousStatus] = useState("")   // <<<<< FIX

  const [isLink, setIsLink] = useState(false)
  const [loadingLink, setLoadingLink] = useState(false)
  // NEW: Name field states
  const [nameInput, setNameInput] = useState("")
  const [nameError, setNameError] = useState("")

  const [emailError, setEmailError] = useState("")
  // Validation for Name field
  const handleNameChange = (e) => {
    const value = e.target.value
    const regex = /^[A-Za-z\s]*$/ // letters & spaces only

    if (!regex.test(value)) {
      setNameError("Only alphabets are allowed")
      return
    }

    if (value.trim().length < 3 && value.length > 0) {
      setNameError("Name must be at least 3 characters")
    } else {
      setNameError("")
    }

    setNameInput(value)
  }
  const handleEmailChange = (e) => {
    const value = e.target.value
    setLinkInputValue(value)

    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    if (!value) {
      setEmailError("Email is required")
    } else if (!emailRegex.test(value)) {
      setEmailError("Enter a valid email address")
    } else {
      setEmailError("")
    }
  }
  useEffect(() => {
    fetchClinics()
    if (location.state?.newClinic) {
      setClinics(prev => [...prev, location.state.newClinic])
    }
  }, [location.state?.newClinic])

  const fetchClinics = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${AllClinicData}`)
      const clinicList = Array.isArray(response.data)
        ? response.data
        : response.data.hospitalCategory || response.data.data || []
      setClinics(clinicList)
    } catch {
      toast.error('Failed to load clinics')
    } finally {
      setLoading(false)
    }
  }

  // 🔥 FIXED STATUS HANDLER
  const handleStatusChange = async (newStatus, clinicId) => {
    const clinic = clinics.find(c => c.clinicId === clinicId)
    const oldStatus = clinic?.status
    const backendStatus = mapUIStatusToBackend(newStatus)

    setPreviousStatus(oldStatus)

    // --- IF REJECT IS CLICKED ---
    if (newStatus === "rejected") {
      setModalVisible(true)
      setSelectedClinicId(clinicId)

      // ❗ Revert UI dropdown to previous status immediately
      setClinics(prev =>
        prev.map(c =>
          c.clinicId === clinicId ? { ...c, status: oldStatus } : c
        )
      )
      return
    }

    try {
      if (newStatus === "pending") toast.warning("Status set to Pending")

      if (newStatus === "start") {
        await statusapi.startClinic(clinicId)
        toast.info("Verification started!")
      }

      if (newStatus === "verified") {
        await statusapi.verifyClinic(clinicId)
        toast.success("Clinic verified successfully!")
      }

      // Update UI
      setClinics(prev =>
        prev.map(c =>
          c.clinicId === clinicId ? { ...c, status: backendStatus } : c
        )
      )
    } catch (err) {
      console.error(err)
      toast.error("Failed to update status")
    }
  }

  // 🔥 FIXED REJECTION SUBMISSION
  const handleSubmitModal = async () => {
    try {
      await statusapi.rejectClinic(selectedClinicId, inputValue)

      // Update UI to show rejected
      setClinics(prev =>
        prev.map(c =>
          c.clinicId === selectedClinicId
            ? { ...c, status: "REJECTED" }
            : c
        )
      )

      toast.error("Clinic rejected successfully!")
    } catch (err) {
      toast.error("Failed to reject clinic")
    }

    setModalVisible(false)
    setInputValue("")
  }

  const filteredClinics = clinics.filter(
    clinic =>
      clinic.name?.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      clinic.contactNumber?.startsWith(searchTerm) ||
      clinic.email?.toLowerCase().startsWith(searchTerm.toLowerCase())
  )

  useEffect(() => { setCurrentPage(1) }, [searchTerm])
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredClinics.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredClinics.length / itemsPerPage)

const sendNGKRegistrationLink = async (email) => {
  if (nameError || emailError || !nameInput.trim() || !email.trim()) {
    toast.error("Please fix validation errors")
    return
  }

  setLoadingLink(true)

  try {
    const res = await fetch(NGkRegistrationLink, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name: nameInput.trim() })
    })

    const data = await res.json()

    if (!res.ok || !data.success) {
      toast.error(data?.message ?? "Failed to send link")
      return
    }

    toast.success(data?.message ?? "Link sent successfully!")

    // success case reset
    setIsLink(false)
    setLinkInputValue("")
    setNameInput("")
    setNameError("")
    setEmailError("")
    
  } catch (err) {
    toast.error("Something went wrong")
  } finally {
    setLoadingLink(false)
  }
}




  return (
    <div className="d-flex justify-content-center mt-4">
      <div style={{ width: '95%', maxWidth: '1200px' }}>

        <CCard>
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <h2 className="mb-0">{service?.categoryName} Clinics</h2>
              <CButton
                color="secondary"
                style={{ backgroundColor: 'var(--color-black)', color: COLORS.white }}
                onClick={() => setIsLink(true)}
              >
                Send Link
              </CButton>
            </div>
          </CCardHeader>

          <CCardBody>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="col-4 mx-2">
                <CFormInput
                  type="text"
                  autoComplete="off"
                  style={{ border: '1px solid var(--color-black)', }}
                  placeholder="Search by Clinic Name, Mobile, or Email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-2 text-end">
                No.of Clinics: {filteredClinics.length}
              </div>
            </div>

            {loading ? (
              <LoadingIndicator message="Fetching Clinic Details, please wait..." />
            ) : (
              <div>
                <CTable striped hover responsive>
                  <CTableHead className="pink-table">
                    <CTableRow className="text-center">
                      <CTableHeaderCell >S.No</CTableHeaderCell>
                      <CTableHeaderCell >Clinic Name</CTableHeaderCell>
                      <CTableHeaderCell >Contact Number</CTableHeaderCell>
                      <CTableHeaderCell >Email</CTableHeaderCell>
                      <CTableHeaderCell >City</CTableHeaderCell>
                      <CTableHeaderCell >Status</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                      
                    </CTableRow>
                  </CTableHead>

                  <CTableBody className='pink-table'>
                    {currentItems.length > 0 ? (
                      currentItems.map((clinic, index) => (
                        <CTableRow key={clinic?.clinicId || index} className="text-center align-middle">
                          <CTableDataCell>{indexOfFirstItem + index + 1}</CTableDataCell>
                          <CTableDataCell>{capitalizeWords(clinic?.name || "N/A")}</CTableDataCell>
                          <CTableDataCell>{clinic?.contactNumber}</CTableDataCell>
                          <CTableDataCell>{clinic?.email}</CTableDataCell>
                          <CTableDataCell>{capitalizeWords(clinic?.city || "N/A")}</CTableDataCell>
                           {/* FIXED STATUS DROPDOWN */}
                          <CTableDataCell>
                            <CFormSelect
                              value={mapBackendStatusToUI(clinic?.status)}
                              onChange={(e) => handleStatusChange(e.target.value, clinic.clinicId)}
                              style={{
                                ...statusStyles[mapBackendStatusToUI(clinic?.status)],
                                borderRadius: "6px",
                                padding: "6px",
                                border: "1px solid #ccc",
                              }}
                            >
                              <option value="pending">Pending</option>
                              <option value="start">Started</option>
                              <option value="verified">Verified</option>
                              <option value="rejected">Rejected</option>
                            </CFormSelect>

                          </CTableDataCell>
                          <CTableDataCell>
                            <button className="actionBtn" title="View" onClick={() =>
                              navigate(`/clinic-details/${clinic.clinicId}`, { state: clinic })
                            }>View</button>
                          </CTableDataCell>

                         
                        </CTableRow>
                      ))
                    ) : (
                      <CTableRow>
                        <CTableDataCell colSpan="7" className="text-center">
                          No clinics found
                        </CTableDataCell>
                      </CTableRow>
                    )}
                  </CTableBody>
                </CTable>
              </div>
            )}

            {/* PAGINATION */}
            {filteredClinics.length > 0 && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                  <label className="me-2">Rows per page:</label>
                  <CFormSelect
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    style={{ width: '80px', display: 'inline-block' }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </CFormSelect>
                </div>
                <div>
                  <div>
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredClinics.length)} of {filteredClinics.length} entries
                  </div>

                  <CPagination align="end" className="mt-2 themed-pagination">
                    <CPaginationItem
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                      Previous
                    </CPaginationItem>

                    {[...Array(totalPages)].map((_, idx) => (
                      <CPaginationItem
                        key={idx + 1}
                        active={currentPage === idx + 1}
                        onClick={() => setCurrentPage(idx + 1)}
                      >
                        {idx + 1}
                      </CPaginationItem>
                    ))}

                    <CPaginationItem
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                      Next
                    </CPaginationItem>
                  </CPagination>
                </div>
              </div>
            )}
          </CCardBody>
        </CCard>

        {/* REJECT MODAL */}
        <CModal visible={modalVisible} onClose={() => setModalVisible(false)} alignment="center">
          <CModalHeader>
            <CModalTitle>Reject Clinic</CModalTitle>
          </CModalHeader>

          <CModalBody>
            <CFormInput
              type="text"
              label="Reason"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter rejection reason..."
            />
          </CModalBody>

          <CModalFooter>
            <CButton color="secondary" onClick={() => setModalVisible(false)}>
              Cancel
            </CButton>
            <CButton color="primary" onClick={handleSubmitModal}>
              Submit
            </CButton>
          </CModalFooter>
        </CModal>

        {/* LINK MODAL */}
        <CModal visible={isLink} onClose={() => setIsLink(false)} alignment="center">
          <CModalHeader>
            <CModalTitle>Send Registration Link</CModalTitle>
          </CModalHeader>

          <CModalBody>

            {/* NEW NAME FIELD */}
            <CFormInput
              type="text"
              label="Name"
              value={nameInput}
              placeholder="Enter Name"
              onChange={handleNameChange}
            />

            {nameError && (
              <p style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                {nameError}
              </p>
            )}

            <br />

            {/* EMAIL / MOBILE FIELD */}
            <CFormInput
              type="text"
              autoComplete="email"
              label="Email Id"
              value={linkInputValue}
              onChange={handleEmailChange}
              placeholder="Enter Email Id"
            />

            {emailError && (
              <p style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                {emailError}
              </p>
            )}

          </CModalBody>

          <CModalFooter>
            <CButton
              color="secondary"
              onClick={() => {
                setIsLink(false)
                setNameInput("")
                setLinkInputValue("")
                setNameError("")
                setEmailError("")
              }}
            >
              Cancel
            </CButton>


            <CButton
              color="primary"
              disabled={
                loadingLink ||
                nameInput.trim() === "" ||
                linkInputValue.trim() === "" ||
                nameError ||
                emailError
              }

              onClick={() => {
                sendNGKRegistrationLink(linkInputValue)
              }}
            >
              {loadingLink ? "Sending..." : "Send"}
            </CButton>

          </CModalFooter>
        </CModal>
      </div>
    </div>
  )
}

export default ClinicManagement
// 🔥 STATUS BASED STYLES
const statusStyles = {
  pending: {
    backgroundColor: "#FFE4B5",
    color: "#8B4513",
    fontWeight: "600",
  },
  start: {
    backgroundColor: "#BEE3F8",
    color: "#0C4A6E",
    fontWeight: "600",
  },
  verified: {
    backgroundColor: "#C6F6D5",
    color: "#22543D",
    fontWeight: "600",
  },
  rejected: {
    backgroundColor: "#FED7D7",
    color: "#822727",
    fontWeight: "600",
  },
};

