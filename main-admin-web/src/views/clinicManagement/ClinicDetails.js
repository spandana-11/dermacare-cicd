import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
  CCol,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CFormSelect,
  CFormFeedback,
  CPaginationItem,
  CPagination,
} from '@coreui/react'
import { DoctorAllData } from '../../baseUrl'
import { getClinicTimings } from './AddClinicAPI'
import CIcon from '@coreui/icons-react'
import { cilUser } from '@coreui/icons'
import AddBranchForm from './AddBranchForm'
import ProcedureManagementDoctor from './ProcedureManagementDoctor'

import { CLINIC_ADMIN_URL } from '../../baseUrl'
import classNames from 'classnames'
import axios from 'axios'
import { BASE_URL, UpdateClinic, DeleteClinic } from '../../baseUrl'
import capitalizeWords from '../../Utils/capitalizeWords'
import { toast } from 'react-toastify'
import AddDoctors from '../Doctors/AddDoctors'
import DocumentField from './DocumentField'

import { useNavigate, useLocation } from "react-router-dom";
const ClinicDetails = () => {
  const { hospitalId } = useParams()

  const [formErrors, setFormErrors] = useState({})
  const [clinicData, setClinicData] = useState(null)
  const [editableClinicData, setEditableClinicData] = useState({
    consultationExpiration: '',
  })
  const [timings, setTimings] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);

  const [loading, setLoading] = useState(true)
  const [loadingTimings, setLoadingTimings] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showDoctorModal, setShowDoctorModal] = useState(false)
  const [allDoctors, setAllDoctors] = useState([])
  const [isEditingAdditional, setIsEditingAdditional] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [showBranchForm, setShowBranchForm] = useState(false)
  const tabList = ['Basic Details', 'ADrug License Certificatedditional Details', 'Branches', 'Procedures']
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const documentFields = [
    ['', 'drugLicenseCertificate'],
    ['Drug License Form Type', 'drugLicenseFormType'],
    ['Pharmacist Certificate', 'pharmacistCertificate'],
    ['Clinical Establishment Certificate', 'clinicalEstablishmentCertificate'],
    ['Business Registration Certificate', 'businessRegistrationCertificate'],
    ['Biomedical Waste Management Auth', 'biomedicalWasteManagementAuth'],
    ['Trade License', 'tradeLicense'],
    ['Fire Safety Certificate', 'fireSafetyCertificate'],
    ['Professional Indemnity Insurance', 'professionalIndemnityInsurance'],
    ['Others', 'others'],
  ]
  const validateForm = () => {
    const errors = {}

    if (activeTab === 0) {
      // Basic Details tab
      const name = editableClinicData.name?.trim() || ''
      if (!name) {
        errors.name = 'Clinic Name is required'
      } else if (name.length < 3) {
        errors.name = 'Clinic Name must be at least 3 characters'
      }

      const number = editableClinicData.contactNumber?.trim() || ''
      if (!number) {
        errors.contactNumber = 'Contact Number is required'
      } else if (!/^[6-9]\d{9}$/.test(number)) {
        errors.contactNumber = 'Must start with 6-9 and be exactly 10 digits'
      }

      const city = editableClinicData.city?.trim() || ''
      if (!city) {
        errors.city = 'City is required'
      }
    }

    if (activeTab === 1) {
      // Additional Details tab
      if (!editableClinicData.emailAddress || !editableClinicData.emailAddress.includes('@')) {
        errors.emailAddress = 'Email must contain "@"'
      }
      if (!editableClinicData.website?.trim()) {
        errors.website = 'Website is required'
      }
      if (!editableClinicData.issuingAuthority?.trim()) {
        errors.issuingAuthority = 'Issuing Authority is required'
      }
      if (!editableClinicData.openingTime) {
        errors.openingTime = 'Opening time is required'
      }
      if (!editableClinicData.closingTime) {
        errors.closingTime = 'Closing time is required'
      }
      if (!editableClinicData.subscription) {
        errors.subscription = 'Subscription is required'
      }
      if (!editableClinicData.consultationExpiration) {
        errors.consultationExpiration = 'Consultation Expiration is required'
      }
      if (!editableClinicData.latitude) {
        errors.latitude = "Latitude is required"
      }
      if (!editableClinicData.longitude) {
        errors.longitude = "Longitude is required"
      }
      if (!editableClinicData.walkthrough?.trim()) {
        errors.walkthrough = "Walkthrough URL is required"
      }
      if (!editableClinicData.branch?.trim()) {
        errors.branch = "Branch name is required"
      }
      if (!editableClinicData.address?.trim()) {
        errors.address = "Address is required"
      }
      if (!editableClinicData.freeFollowUps) {
        errors.freeFollowUps = "Free Follow Ups is required"
      } else if (isNaN(editableClinicData.freeFollowUps) || editableClinicData.freeFollowUps < 1) {
        errors.freeFollowUps = "Free Follow Ups must be a positive number"
      }
    }

    setFormErrors(errors)
    console.log('Form Errors:', errors)
    return Object.keys(errors).length === 0
  }


  // const timeSlots = [
  //   '08:00 AM',
  //   '09:00 AM',
  //   '10:00 AM',
  //   '11:00 AM',
  //   '12:00 PM',
  //   '01:00 PM',
  //   '02:00 PM',
  //   '03:00 PM',
  //   '04:00 PM',
  //   '05:00 PM',
  //   '06:00 PM',
  //   '07:00 PM',
  // ]
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    setActiveTab(tab ? Number(tab) : 0);
  }, [location.search]);
  const fetchClinicDetails = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${BASE_URL}/admin/getClinicById/${hospitalId}`)
      const fetchedData = response.data.data
      const localExpiration = localStorage.getItem(`clinic-${hospitalId}-consultation-expiration`)
      if (localExpiration) {
        fetchedData.consultationExpiration = localExpiration
      }

      setClinicData(fetchedData)
      setEditableClinicData(fetchedData)
    } catch (error) {
      console.error('Error fetching clinic details:', error)
    }
    setLoading(false)
  }
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = allDoctors.slice(indexOfFirstItem, indexOfLastItem)

  const totalPages = Math.ceil(allDoctors.length / itemsPerPage)

  const fetchAllDoctors = async () => {
    try {
      const response = await axios.get(`${CLINIC_ADMIN_URL}${DoctorAllData}/${hospitalId}`)
      console.log('Doctors data:', response.data)
      console.log('✅ Doctors array:', response.data.data)
      setAllDoctors(response.data.data)
    } catch (error) {
      console.error('Error fetching doctors data:', error.response?.data || error.message)
    }
  }
  const downloadBase64File = (base64Data, fileName) => {
    const link = document.createElement('a')
    link.href = base64Data
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const openPdfPreview = (base64) => {
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)
      .fill(0)
      .map((_, i) => byteCharacters.charCodeAt(i))
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'application/pdf' })
    const blobUrl = URL.createObjectURL(blob)
    window.open(blobUrl)
  }

  useEffect(() => {
    if (hospitalId) {
      fetchClinicDetails()
      fetchAllDoctors()
    }
  }, [hospitalId])
  useEffect(() => {
    const fetchTimings = async () => {
      setLoadingTimings(true)
      const result = await getClinicTimings()
      console.log("API Timings Result:", result);

      if (result.success) {
        setTimings(result.data)
      } else {
        toast.error(result.message || 'Failed to fetch clinic timings')
      }
      setLoadingTimings(false)
    }

    fetchTimings()
  }, [])
  const updateClinicData = async (id, data) => {
    await axios.put(`${BASE_URL}/${UpdateClinic}/${id}`, data)
  }
  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex);
    navigate(`/clinic-management/${hospitalId}?tab=${tabIndex}`);
  };
  const handleDeleteClinic = async () => {
    try {
      const res = await axios.delete(`${BASE_URL}/${DeleteClinic}/${hospitalId}`)
      if (res) {
        toast.success(`${res.data.message}`)
        setShowDeleteModal(false)
        navigate('/clinic-Management')
      } else {
        toast.error(`${res.data.message}`)
      }
      // navigate back after delete
    } catch (error) {
      toast.error(`${error.message}`)
      console.error('Failed to delete clinic:', error)
    }
  }

  return (
    <CCard className="mt-4">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h3 className="mb-0">Branch Details</h3>
        <CButton color="secondary" onClick={() => navigate(-1)}>
          Back
        </CButton>
      </CCardHeader>


      <CCardBody>
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <>
            <CNav variant="tabs">
              <CNavItem>
                <CNavLink active={activeTab === 0} onClick={() => handleTabChange(0)}>
                  Basic Details
                </CNavLink>
              </CNavItem>
              <CNavItem>

                <CNavLink active={activeTab === 1} onClick={() => handleTabChange(1)}>
                  Additional Details
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink active={activeTab === 2} onClick={() => handleTabChange(2)}>
                  Branch Details
                </CNavLink>
              </CNavItem>
              {/* <CNavItem>
     
          <CNavLink active={activeTab === 3} onClick={() => handleTabChange(4)}>
            Appointments
          </CNavLink>
        </CNavItem>  */}
              <CNavItem>
                <CNavLink active={activeTab === 3} onClick={() => handleTabChange(3)}>
                  Procedures
                </CNavLink>
              </CNavItem>
            </CNav>

            <CTabContent className="mt-3">
              {/* Tab 1: Basic Details */}
              <CTabPane visible={activeTab === 0}>
                <CForm className="p-3 border rounded shadow-sm bg-white">
                  {/* Clinic Logo Section */}
                  <CRow className="mb-4 align-items-start">
                    <CCol md={6}>
                      <CFormLabel>Clinic Name <span className="text-danger">*</span></CFormLabel>
                      <CFormInput
                        type="text"
                        value={editableClinicData.name || ''}
                        disabled={!isEditing}
                        onChange={(e) => {
                          const value = e.target.value
                          setEditableClinicData((prev) => ({ ...prev, name: value }))

                          // Validation
                          if (!value.trim()) {
                            setFormErrors((prev) => ({
                              ...prev,
                              name: "Clinic Name is required",
                            }))
                            return
                          }

                          if (value.trim().length < 3) {
                            setFormErrors((prev) => ({
                              ...prev,
                              name: "Clinic Name must be at least 3 characters",
                            }))
                            return
                          }

                          // ✅ Allow all characters, no regex restriction
                          setFormErrors((prev) => ({ ...prev, name: "" }))
                        }}


                      //   setEditableClinicData((prev) => ({ ...prev, name: value }))
                      // }}
                      />
                      {formErrors.name && <div className="text-danger mt-1">{formErrors.name}</div>}
                    </CCol>
                  </CRow>

                  {/* Contact & Location Section */}
                  <CRow className="mb-3">
                    <CCol md={6}>
                      <CFormLabel>
                        Contact Number <span className="text-danger">*</span>
                      </CFormLabel>
                      <CFormInput
                        type="text"
                        maxLength={10}
                        value={editableClinicData.contactNumber || ''}
                        disabled={!isEditing}
                        onChange={(e) => {
                          const value = e.target.value;

                          // Always update the state
                          setEditableClinicData((prev) => ({ ...prev, contactNumber: value }));

                          // Validation
                          if (!value.trim()) {
                            setFormErrors((prev) => ({
                              ...prev,
                              contactNumber: 'Contact Number is required',
                            }));
                            return;
                          }

                          if (!/^\d*$/.test(value)) {
                            setFormErrors((prev) => ({
                              ...prev,
                              contactNumber: 'Only numeric values allowed',
                            }));
                            return;
                          }

                          const regex = /^[6-9][0-9]{9}$/; // exactly 10 digits starting with 6-9
                          if (value.length === 10 && !regex.test(value)) {
                            setFormErrors((prev) => ({
                              ...prev,
                              contactNumber: 'Must start with 6-9 and be 10 digits',
                            }));
                          } else if (value.length < 10) {
                            setFormErrors((prev) => ({
                              ...prev,
                              contactNumber: 'Must be exactly 10 digits',
                            }));
                          } else {
                            setFormErrors((prev) => ({ ...prev, contactNumber: '' }));
                          }
                        }}
                      />
                      {formErrors.contactNumber && (
                        <div className="text-danger mt-1">{formErrors.contactNumber}</div>
                      )}
                    </CCol>


                    <CCol md={6}>
                      <CFormLabel>Location <span className="text-danger">*</span></CFormLabel>
                      <CFormInput
                        type="text"
                        value={editableClinicData.city || ''}
                        disabled={!isEditing}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEditableClinicData((prev) => ({ ...prev, city: value }))
                          if (!value.trim()) {
                            setFormErrors((prev) => ({
                              ...prev,
                              city: 'Location is required',
                            }))
                          } else if (value.trim().length < 3) {
                            setFormErrors((prev) => ({
                              ...prev,
                              city: 'Location must be at least 3 characters',
                            }))
                            return;
                          }
                          else {
                            setFormErrors((prev) => ({ ...prev, city: '' }))
                          }
                        }}
                      />
                      {formErrors.city && <div className="text-danger mt-1">{formErrors.city}</div>}
                    </CCol>
                    <CCol md={6} className="text-start mt-5">
                      {editableClinicData.hospitalLogo && (
                        <img
                          src={
                            editableClinicData.hospitalLogo.startsWith('data:')
                              ? editableClinicData.hospitalLogo
                              : `data:image/jpeg;base64,${editableClinicData.hospitalLogo}`
                          }
                          alt="Hospital Logo"
                          className="img-thumbnail mb-2"
                          style={{ maxWidth: '150px', height: 'auto' }}
                        />
                      )}

                      {isEditing && (
                        <CFormInput
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0]
                            const reader = new FileReader()

                            reader.onloadend = () => {
                              if (reader.result) {
                                const base64String = reader.result.split(',')[1]
                                setEditableClinicData({
                                  ...editableClinicData,
                                  hospitalLogo: base64String,
                                })
                              }
                            }

                            if (file) {
                              reader.readAsDataURL(file)
                            }
                          }}
                        />
                      )}
                    </CCol>
                  </CRow>

                  {isEditing ? (
                    <>
                      <CButton
                        color="success"
                        className="me-2"
                        onClick={async () => {

                          try {
                            // Validate form first
                            const isValid = validateForm();
                            console.log('Form valid?', isValid); // ✅ Check validation
                            if (!isValid) return; // stop if invalid


                            // Proceed to save
                            await updateClinicData(hospitalId, editableClinicData);
                            await fetchClinicDetails();
                            setIsEditing(false);
                          } catch (error) {
                            console.error('Error updating clinic:', error);
                          }
                        }}
                      >
                        Save
                      </CButton>

                      <CButton
                        color="secondary"
                        className="me-2"
                        onClick={() => {
                          setIsEditing(false)
                          setEditableClinicData(clinicData) // ✅ reset to original details
                        }}
                      >
                        Cancel
                      </CButton>
                    </>
                  ) : (
                    <>
                      <CButton
                        color="primary"
                        className="me-2"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit
                      </CButton>

                      {/* ✅ Only show Delete when not editing */}
                      <CButton
                        color="danger"
                        style={{ color: 'white' }}
                        onClick={() => setShowDeleteModal(true)}
                      >
                        Delete Clinic
                      </CButton>
                    </>
                  )}

                  {/* <CButton color="primary" style={{color:'white', float:'right'}} onClick={()=>setShowBranchForm(true)}>Add Branches</CButton> */}
                  {/* <AddBranchForm visible={showBranchForm} onClose={()=>setShowBranchForm(false)} /> */}
                </CForm>
              </CTabPane>

              {/* Tab 2: Additional Details */}
              <CTabPane visible={activeTab === 1}>
                <CForm>
                  <CRow className="mb-3">
                    <CCol md={6}>
                      <CFormLabel>Email <span className="text-danger">*</span></CFormLabel>
                      <CFormInput
                        type="email"
                        value={editableClinicData.emailAddress || ''}
                        disabled={!isEditingAdditional}
                        onChange={(e) => {
                          const value = e.target.value
                          setEditableClinicData((prev) => ({
                            ...prev,
                            emailAddress: value,
                          }))

                          // live validation
                          if (!value.includes('@')) {
                            setFormErrors((prev) => ({
                              ...prev,
                              emailAddress: 'Email must contain "@"',
                            }))
                          } else {
                            setFormErrors((prev) => ({
                              ...prev,
                              emailAddress: '',
                            }))
                          }
                        }}
                      />
                      {formErrors.emailAddress && (
                        <div className="text-danger mt-1">{formErrors.emailAddress}</div>
                      )}
                    </CCol>

                    <CCol md={6}>
                      <CFormLabel>City <span className="text-danger">*</span></CFormLabel>
                      <CFormInput
                        type="text"
                        value={editableClinicData.city || ''}
                        disabled={!isEditingAdditional}
                        onChange={(e) => {
                          setEditableClinicData({ ...editableClinicData, city: e.target.value })
                          setFormErrors((prev) => ({ ...prev, city: '' }))
                        }}
                      />
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol md={6}>
                      <CFormLabel>Website <span className="text-danger">*</span></CFormLabel>
                      <CFormInput
                        type="text"
                        value={editableClinicData.website || ''}
                        disabled={!isEditingAdditional}
                        onChange={(e) =>
                          setEditableClinicData({ ...editableClinicData, website: e.target.value })
                        }
                      />
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel>Issuing Authority <span className="text-danger">*</span></CFormLabel>
                      <CFormInput
                        type="text"
                        value={editableClinicData.issuingAuthority || ''}
                        disabled={!isEditingAdditional}
                        onChange={(e) => {
                          const value = e.target.value
                          const regex = /^[A-Za-z\s]*$/

                          if (!regex.test(value)) {
                            setFormErrors((prev) => ({
                              ...prev,
                              issuingAuthority: 'Only alphabets and spaces allowed',
                            }))
                          } else {
                            setFormErrors((prev) => ({ ...prev, issuingAuthority: '' }))
                          }

                          setEditableClinicData((prev) => ({
                            ...prev,
                            issuingAuthority: value,
                          }))
                        }}
                      />
                      {formErrors.issuingAuthority && (
                        <div className="text-danger mt-1">{formErrors.issuingAuthority}</div>
                      )}
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol md={6}>
                      <CFormLabel>Opening Time <span className="text-danger">*</span></CFormLabel>
                      <CFormSelect
                        value={editableClinicData.openingTime || ''}
                        disabled={!isEditingAdditional}
                        onChange={(e) => {
                          setEditableClinicData({
                            ...editableClinicData,
                            openingTime: e.target.value,
                          });
                          setFormErrors((prev) => ({ ...prev, openingTime: '' }));
                        }}
                      >
                        <option value="">Select Opening Time <span className="text-danger">*</span></option>
                        {timings.length > 0 &&
                          timings.map((slot, idx) => (
                            <option key={idx} value={slot.openingTime}>
                              {slot.openingTime}
                            </option>
                          ))}
                      </CFormSelect>

                      {formErrors.openingTime && (
                        <div className="text-danger">{formErrors.openingTime}</div>
                      )}
                    </CCol>


                    <CCol md={6}>
                      <CFormLabel>Closing Time <span className="text-danger">*</span></CFormLabel>
                      <CFormSelect
                        value={editableClinicData.closingTime || ''}
                        disabled={!isEditingAdditional}
                        onChange={(e) => {
                          setEditableClinicData({
                            ...editableClinicData,
                            closingTime: e.target.value,
                          })
                          setFormErrors((prev) => ({ ...prev, closingTime: '' }))
                        }}
                      >
                        <option value="">Select Closing Time</option>
                        {timings.map((slot, idx) => (
                          <option key={idx} value={slot.closingTime}>
                            {slot.closingTime}
                          </option>
                        ))}
                      </CFormSelect>
                      {formErrors.closingTime && (
                        <div className="text-danger">{formErrors.closingTime}</div>
                      )}
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol md={6}>
                      <CFormLabel>Consultation Expiration (in days) <span className="text-danger">*</span></CFormLabel>
                      <CFormInput
                        type="text"
                        placeholder="Enter number of days"
                        value={editableClinicData.consultationExpiration || ''}
                        disabled={!isEditingAdditional}
                        onChange={(e) =>
                          setEditableClinicData((prev) => ({
                            ...prev,
                            consultationExpiration: e.target.value, // ✅ just a string
                          }))
                        }
                      />
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel>Free Follow-Ups (count) <span className="text-danger">*</span></CFormLabel>
                      <CFormInput
                        type="number"
                        min={0}
                        placeholder="Enter number of follow-ups"
                        value={editableClinicData.freeFollowUps || ''}
                        disabled={!isEditingAdditional}
                        onChange={(e) => {
                          const value = e.target.value
                          const isValid = /^\d+$/.test(value) // only digits
                          if (!isValid) {
                            setFormErrors((prev) => ({
                              ...prev,
                              freeFollowUps: 'Only positive numbers allowed',
                            }))
                          } else {
                            setFormErrors((prev) => ({ ...prev, freeFollowUps: '' }))
                          }
                          setEditableClinicData((prev) => ({
                            ...prev,
                            freeFollowUps: value,
                          }))
                        }}
                      />
                      {formErrors.freeFollowUps && (
                        <div className="text-danger">{formErrors.freeFollowUps}</div>
                      )}
                    </CCol>

                  </CRow>

                  <CRow>
                    <CCol md={6}>
                      <CFormLabel>
                        Subscription<span className="text-danger">*</span>
                      </CFormLabel>
                      <CFormSelect
                        value={editableClinicData.subscription || ''}
                        disabled={!isEditingAdditional}
                        onChange={(e) => {
                          setEditableClinicData({
                            ...editableClinicData,
                            subscription: e.target.value,
                          })
                          setFormErrors((prev) => ({ ...prev, subscription: '' }))
                        }}
                      >
                        <option value="">Select Subscription</option>
                        <option value="Free">Free</option>
                        <option value="Basic">Basic</option>
                        <option value="Standard">Standard</option>
                        <option value="Premium">Premium</option>
                      </CFormSelect>

                      {formErrors.subscription && (
                        <div className="text-danger">{formErrors.subscription}</div>
                      )}
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel>License Number <span className="text-danger">*</span></CFormLabel>
                      <CFormInput
                        type="text"
                        value={editableClinicData.licenseNumber || ''}
                        disabled={!isEditingAdditional}
                        onChange={(e) =>
                          setEditableClinicData({ ...editableClinicData, licenseNumber: e.target.value })
                        }
                      />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>Hospital Documents <span className="text-danger">*</span></CFormLabel>

                      <DocumentField
                        label="HospitalDocuments"
                        base64Data={editableClinicData.hospitalDocuments}
                        clinicName={editableClinicData.name || 'Clinic'}
                        isEditing={isEditingAdditional} // show Upload button only when editing
                        openPdfPreview={openPdfPreview} // your existing function to preview PDFs
                        onFileChange={(newBase64) => {
                          // Update parent state when user uploads a new file
                          setEditableClinicData((prev) => ({
                            ...prev,
                            hospitalDocuments: newBase64,
                          }))
                        }}
                      />
                    </CCol>

                    <CCol md={6} className="mt-3">
                      <CFormLabel>Hospital Contract Documents <span className="text-danger">*</span></CFormLabel>
                      <DocumentField
                        label="ContractorDocuments"
                        base64Data={editableClinicData.contractorDocuments}
                        clinicName={editableClinicData.name || "Clinic"}
                        isEditing={isEditingAdditional}
                        openPdfPreview={openPdfPreview}
                        onFileChange={(newBase64) => {
                          setEditableClinicData((prev) => ({
                            ...prev,
                            contractorDocuments: newBase64,
                          }))
                        }}
                      />

                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>Business Registration Certificate <span className="text-danger">*</span></CFormLabel>
                      <DocumentField
                        label="BusinessRegistrationCertificate"
                        base64Data={editableClinicData.businessRegistrationCertificate}
                        clinicName={editableClinicData.name || "Clinic"}
                        isEditing={isEditingAdditional}
                        openPdfPreview={openPdfPreview}
                        onFileChange={(newBase64) => {
                          setEditableClinicData((prev) => ({
                            ...prev,
                            businessRegistrationCertificate: newBase64,
                          }))
                        }}
                      />
                    </CCol>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>Biomedical Waste Management Auth <span className="text-danger">*</span></CFormLabel>
                      <DocumentField
                        label="BioMedicalWasteManagementAuth"
                        base64Data={editableClinicData.biomedicalWasteManagementAuth}
                        clinicName={editableClinicData.name || "Clinic"}
                        isEditing={isEditingAdditional}
                        openPdfPreview={openPdfPreview}
                        onFileChange={(newBase64) => {
                          setEditableClinicData((prev) => ({
                            ...prev,
                            biomedicalWasteManagementAuth: newBase64,

                          }))
                        }}
                      />

                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>Trade License <span className="text-danger">*</span></CFormLabel>
                      <DocumentField
                        label="TradeLicense"
                        base64Data={editableClinicData.tradeLicense}
                        clinicName={editableClinicData.name || "Clinic"}
                        isEditing={isEditingAdditional}
                        openPdfPreview={openPdfPreview}
                        onFileChange={(newBase64) => {
                          setEditableClinicData((prev) => ({
                            ...prev,
                            tradeLicense: newBase64
                          }))
                        }}
                      />

                    </CCol>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>Fire Safety Certificate <span className="text-danger">*</span></CFormLabel>
                      <DocumentField
                        label="FireSafetyCertificate"
                        base64Data={editableClinicData.fireSafetyCertificate}
                        clinicName={editableClinicData.name || "Clinic"}
                        isEditing={isEditingAdditional}
                        openPdfPreview={openPdfPreview}
                        onFileChange={(newBase64) => {
                          setEditableClinicData((prev) => ({
                            ...prev,
                            fireSafetyCertificate: newBase64
                          }))
                        }}
                      />

                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>Professional Indemnity Insurance <span className="text-danger">*</span></CFormLabel>
                      <DocumentField
                        label="ProfessionalIndemnityInsurance"
                        base64Data={editableClinicData.professionalIndemnityInsurance}
                        clinciName={editableClinicData.name || "Clinic"}
                        isEditing={isEditingAdditional}
                        openPdfPreview={openPdfPreview}
                        onFileChange={(newBase64) => {
                          setEditableClinicData((prev) => ({
                            ...prev,
                            professionalIndemnityInsurance: newBase64
                          }))
                        }}
                      />

                    </CCol>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>
                        Other Documents <span className="text-danger">*</span>
                      </CFormLabel>
                      <DocumentField
                        label="OtherDocuments"
                        base64Data={editableClinicData.others}
                        clinicName={editableClinicData.name || 'Clinic'}
                        isEditing={isEditingAdditional}
                        uploadType="multiple"
                        openPdfPreview={openPdfPreview}
                        onFileChange={(files) =>
                          setEditableClinicData((prev) => ({
                            ...prev,
                            others: files, // ✅ keep as array
                          }))
                        }
                      />
                    </CCol>


                  </CRow>

                  <CRow>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>Drug License Certificate <span className="text-danger">*</span></CFormLabel>
                      <DocumentField
                        label="DrugLicenceCertificate"
                        base64Data={editableClinicData.drugLicenseCertificate}
                        clinicName={editableClinicData.name || "Clinic"}
                        isEditing={isEditingAdditional}
                        openPdfPreview={openPdfPreview}
                        onFileChange={(newBase64) => {
                          setEditableClinicData((prev) => ({
                            ...prev,
                            drugLicenseCertificate: newBase64
                          }))
                        }}
                      />

                    </CCol>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>Drug License Form Type <span className="text-danger">*</span></CFormLabel>
                      <DocumentField
                        label="DrugLicenceFormType"
                        base64Data={editableClinicData.drugLicenseFormType}
                        clinicName={editableClinicData.name || "Clinic"}
                        isEditing={isEditingAdditional}
                        openPdfPreview={openPdfPreview}
                        onFileChange={(newBase64) => {
                          setEditableClinicData((prev) => ({
                            ...prev,
                            drugLicenseFormType: newBase64
                          }))
                        }}
                      />

                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>Pharmacist Certificate <span className="text-danger">*</span></CFormLabel>
                      <DocumentField
                        label="pharmacistCertificate"
                        base64Data={editableClinicData.pharmacistCertificate}
                        clinicName={editableClinicData.name || "Clinic"}
                        isEditing={isEditingAdditional}
                        openPdfPreview={openPdfPreview}
                        onFileChange={(newBase64) => {
                          setEditableClinicData((prev) => ({
                            ...prev,
                            pharmacistCertificate: newBase64
                          }))
                        }}
                      />

                    </CCol>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>Clinical Establishment Certificate <span className="text-danger">*</span></CFormLabel>
                      <DocumentField
                        label="ClinicalEstablishmentCertificate"
                        base64Data={editableClinicData.clinicalEstablishmentCertificate}
                        clinicName={editableClinicData.name || "Clinic"}
                        isEditing={isEditingAdditional}
                        openPdfPreview={openPdfPreview}
                        onFileChange={(newBase64) => {
                          setEditableClinicData((prev) => ({
                            ...prev,
                            clinicalEstablishmentCertificate: newBase64
                          }))
                        }}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mt-3">
                    <CCol md={6}>
                      <CFormLabel>Latitude <span className="text-danger">*</span></CFormLabel>
                      <CFormInput
                        type="number"
                        step="any"
                        value={editableClinicData.latitude ?? ''}
                        disabled={!isEditingAdditional}
                        onChange={(e) => {
                          const value = e.target.value;
                          const numValue = value === '' ? null : parseFloat(value);
                          setEditableClinicData((prev) => ({
                            ...prev,
                            latitude: numValue,
                          }));

                          let error = ''
                          if (!value) {
                            error = "Latitude is required"
                          } else if (isNaN(numValue) || numValue < -90 || numValue > 90) {
                            error = "Latitude must be between -90 and 90";
                          }
                          setFormErrors((prev) => {
                            const newErrors = { ...prev };
                            if (error) {
                              newErrors.latitude = error;
                            } else {
                              delete newErrors.latitude;
                            }
                            return newErrors;
                          })
                        }}
                        invalid={!!formErrors.latitude}
                      // {formErrors.latitude && <CFormFeedback invalid>{form</CFormFeedback>}
                      />
                      {formErrors.latitude && (
                        <CFormFeedback invalid>{formErrors.latitude}</CFormFeedback>
                      )}
                    </CCol>

                    <CCol md={6}>
                      <CFormLabel>Longitude <span className="text-danger">*</span></CFormLabel>
                      <CFormInput
                        type="number"
                        step="any"
                        value={editableClinicData.longitude ?? ''}
                        disabled={!isEditingAdditional}
                        onChange={(e) => {
                          const value = e.target.value;
                          const numValue = value === '' ? null : parseFloat(value);
                          setEditableClinicData((prev) => ({
                            ...prev,
                            longitude: numValue,
                          }));
                          let error = '';
                          if (!value) {
                            error = "Longitude is required"
                          } else if (isNaN(numValue) || numValue < -180 || numValue > 180) {
                            error = "Longitude must between -180 and 180";
                          }
                          setFormErrors((prev) => {
                            const newErrors = { ...prev };
                            if (error) {
                              newErrors.longitude = error;
                            } else {
                              delete newErrors.longitude;
                            }
                            return newErrors;
                          })
                        }}
                        invalid={!!formErrors.longitude}
                      />
                      {formErrors.longitude && (
                        <CFormFeedback invalid>{formErrors.longitude}</CFormFeedback>
                      )}
                    </CCol>
                  </CRow>

                  <CRow className="mt-3">
                    <CCol md={6}>
                      <CFormLabel>Walkthrough</CFormLabel>
                      <CFormInput
                        type="text"
                        value={editableClinicData.walkthrough ?? ''}
                        disabled={!isEditingAdditional}
                        onChange={(e) => {
                          const value = e.target.value;

                          setEditableClinicData((prev) => ({
                            ...prev,
                            walkthrough: value,
                          }));

                          // ✅ Validation
                          let error = '';
                          if (!value.trim()) {
                            error = 'Walkthrough URL is required';
                          } else if (
                            !/^https?:\/\/[^\s]+$/.test(value) // basic URL check
                          ) {
                            error = 'Please enter a valid URL (must start with http:// or https://)';
                          }

                          setFormErrors((prev) => {
                            const newErrors = { ...prev };
                            if (error) {
                              newErrors.walkthrough = error;
                            } else {
                              delete newErrors.walkthrough;
                            }
                            return newErrors;
                          });
                        }}
                        invalid={!!formErrors.walkthrough}
                      />
                      {formErrors.walkthrough && (
                        <CFormFeedback invalid>{formErrors.walkthrough}</CFormFeedback>
                      )}

                      {!isEditingAdditional && editableClinicData.walkthrough && !formErrors.walkthrough && (
                        <a
                          href={editableClinicData.walkthrough}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary d-block mt-2"
                        >
                          Open Walkthrough
                        </a>
                      )}
                    </CCol>


                    <CCol md={6}>
                      <CFormLabel>NABH Score <span className="text-danger">*</span></CFormLabel>
                      <CFormInput
                        type="number"
                        value={editableClinicData.nabhScore ?? ''}
                        disabled
                        onChange={(e) => {
                          const value = e.target.value;
                          const intValue = value === '' ? null : parseInt(value, 10);
                          setEditableClinicData((prev) => ({
                            ...prev,
                            nabhScore: intValue,
                          }));
                        }}
                      />
                    </CCol>
                  </CRow>

                  <CRow className="mt-3">
                    <CCol md={6}>
                      <CFormLabel>Branch <span className="text-danger">*</span></CFormLabel>
                      <CFormInput
                        type="text"
                        value={editableClinicData.branch ?? ''}
                        disabled={!isEditingAdditional}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEditableClinicData((prev) => ({
                            ...prev,
                            branch: value,
                          }))
                          let error = '';
                          if (!value.trim()) {
                            error = "Branch Name is required"
                          }
                          setFormErrors((prev) => {
                            const newErrors = { ...prev };
                            if (error) {
                              newErrors.branch = error;
                            } else {
                              delete newErrors.branch;
                            }
                            return newErrors;   // ✅ must return
                          });
                        }}
                        invalid={!!formErrors.branch}
                      />
                      {formErrors.branch && (
                        <CFormFeedback invalid>{formErrors.branch}</CFormFeedback>
                      )}
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel>Address<span className="text-danger">*</span></CFormLabel>
                      <CFormInput
                        type="text"
                        value={editableClinicData.address ?? ''}
                        disabled={!isEditingAdditional}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEditableClinicData((prev) => ({
                            ...prev,
                            address: value,
                          }))
                          let error = '';
                          if (!value.trim()) {
                            error = "Address is required"
                          }
                          setFormErrors((prev) => {
                            const newErrors = { ...prev };
                            if (error) {
                              newErrors.address = error;
                            } else {
                              delete newErrors.address;
                            }
                            return newErrors;   // ✅ must return
                          });
                        }}
                        invalid={!!formErrors.address}
                      />
                      {formErrors.address && (
                        <CFormFeedback invalid>{formErrors.address}</CFormFeedback>
                      )}
                    </CCol>
                  </CRow>

                  {isEditingAdditional ? (
                    <>
                      <CButton
                        color="success"
                        className="me-2 mt-3"
                        onClick={async () => {
                          try {
                            const isValid = validateForm();
                            if (!isValid) {
                              toast.error("Please fix the errors before saving!");
                              return; // stop saving
                            }
                            localStorage.setItem(
                              `clinic-${hospitalId}-consultation-expiration`,
                              editableClinicData.consultationExpiration,
                            )
                            await updateClinicData(hospitalId, editableClinicData)
                            await fetchClinicDetails()
                            setIsEditingAdditional(false)
                          } catch (error) {
                            console.error('Error updating additional details:', error)
                          }
                        }}
                      >
                        Save
                      </CButton>

                      <CButton
                        color="secondary"
                        className="mt-3"
                        onClick={() => {
                          setIsEditingAdditional(false)
                          setEditableClinicData(clinicData) // ✅ reset to original values
                        }}
                      >
                        Cancel
                      </CButton>
                    </>
                  ) : (
                    <CButton
                      color="primary"
                      className="me-2 mt-3"
                      onClick={() => setIsEditingAdditional(true)}
                    >
                      Edit
                    </CButton>
                  )}
                </CForm>
              </CTabPane>


              <CTabPane visible={activeTab === 2}>
                <AddBranchForm clinicId={hospitalId} />
              </CTabPane>

              <CTabPane visible={activeTab === 3}>
                <ProcedureManagementDoctor clinicId={hospitalId} />
              </CTabPane>
            </CTabContent>

            <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)} className="custom-modal"
              backdrop="static">
              <CModalHeader>Delete Clinic</CModalHeader>
              <CModalBody>Are you sure you want to delete this clinic?</CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </CButton>
                <CButton color="danger" style={{ color: 'white' }} onClick={handleDeleteClinic}>
                  Confirm
                </CButton>
              </CModalFooter>
            </CModal>
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
          </>
        )}
      </CCardBody>
    </CCard>
  )
}

export default ClinicDetails
