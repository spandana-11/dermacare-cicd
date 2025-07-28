import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
} from '@coreui/react'
import { DoctorAllData } from '../../baseUrl'

import { CLINIC_ADMIN_URL } from '../../baseUrl'
import classNames from 'classnames'
import axios from 'axios'
import { BASE_URL, UpdateClinic, DeleteClinic } from '../../baseUrl'
import capitalizeWords from '../../Utils/capitalizeWords'
import { toast } from 'react-toastify'

const ClinicDetails = () => {
  const { hospitalId } = useParams()
  const navigate = useNavigate()
  const [formErrors, setFormErrors] = useState({})
  const [clinicData, setClinicData] = useState(null)
  const [editableClinicData, setEditableClinicData] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showDoctorModal, setShowDoctorModal] = useState(false)
  const [allDoctors, setAllDoctors] = useState([])
  const [isEditingAdditional, setIsEditingAdditional] = useState(false)
  const tabList = ['Basic Details', 'Additional Details', 'Doctors', 'Appointments']
  const documentFields = [
    ['Drug License Certificate', 'drugLicenseCertificate'],
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

    if (!editableClinicData.emailAddress || !editableClinicData.emailAddress.includes('@')) {
      errors.emailAddress = 'Email must contain "@"'
    }

    if (!editableClinicData.city) {
      errors.city = 'City is required'
    }
    if (!editableClinicData.website) {
      errors.website = 'Website is required'
    }
    if (!editableClinicData.issuingAuthority) {
      errors.issuingAuthority = 'Issuing Authority is required'
    }
    if (!editableClinicData.openingTime) {
      errors.openingTime = 'Opening time is required'
    }
    if (!editableClinicData.closingTime) {
      errors.closingTime = 'Closing time is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }
  const timeSlots = [
    '08:00 AM',
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
    '06:00 PM',
    '07:00 PM',
  ]

  const fetchClinicDetails = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${BASE_URL}/admin/getClinicById/${hospitalId}`)
      console.log('Clinic Response:', response.data)
      setClinicData(response.data.data)
      setEditableClinicData(response.data.data)
    } catch (error) {
      console.error('Error fetching clinic details:', error)
    }
    setLoading(false)
  }
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

  const updateClinicData = async (id, data) => {
    await axios.put(`${BASE_URL}/${UpdateClinic}/${id}`, data)
  }

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
      <CCardHeader>
        <div className="d-flex justify-content-between align-items-center">
          <CButton color="secondary" onClick={() => navigate(-1)}>
            Back
          </CButton>
          <h4 className="mb-0">Clinic Details</h4>
          {/* <CButton color="primary me-5" onClick={() => navigate('/add-doctor')}>
            Add Doctor
          </CButton> */}

          <div></div>
        </div>
      </CCardHeader>

      <CCardBody>
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <>
            <CNav variant="tabs" role="tablist">
              {tabList.map((tabName, idx) => (
                <CNavItem key={idx}>
                  <CNavLink
                    className={classNames({ active: activeTab === idx })}
                    onClick={() => setActiveTab(idx)}
                  >
                    {tabName}
                  </CNavLink>
                </CNavItem>
              ))}
            </CNav>

            <CTabContent className="mt-3">
              {/* Tab 1: Basic Details */}
              <CTabPane visible={activeTab === 0}>
                <CForm className="p-3 border rounded shadow-sm bg-white">
                  {/* Clinic Logo Section */}
                  <CRow className="mb-4 align-items-start">
                    <CCol md={6}>
                      <CFormLabel>Clinic Name</CFormLabel>
                      <CFormInput
                        type="text"
                        value={editableClinicData.name || ''}
                        disabled={!isEditing}
                        onChange={(e) => {
                          const value = e.target.value
                          const regex = /^[A-Za-z\s]*$/

                          if (!regex.test(value)) {
                            setFormErrors((prev) => ({
                              ...prev,
                              name: 'Only alphabets and spaces allowed',
                            }))
                          } else {
                            setFormErrors((prev) => ({ ...prev, name: '' }))
                          }

                          setEditableClinicData((prev) => ({ ...prev, name: value }))
                        }}
                      />
                      {formErrors.name && <div className="text-danger mt-1">{formErrors.name}</div>}
                    </CCol>
                  </CRow>

                  {/* Contact & Location Section */}
                  <CRow className="mb-3">
                    <CCol md={6}>
                      <CFormLabel>Contact Number</CFormLabel>
                      <CFormInput
                        type="text"
                        maxLength={10}
                        value={editableClinicData.contactNumber || ''}
                        disabled={!isEditing}
                        onChange={(e) => {
                          const value = e.target.value
                          const regex = /^[6-9][0-9]{0,9}$/

                          if (!/^\d*$/.test(value)) {
                            setFormErrors((prev) => ({
                              ...prev,
                              contactNumber: 'Only numeric values allowed',
                            }))
                          } else if (value.length > 0 && !regex.test(value)) {
                            setFormErrors((prev) => ({
                              ...prev,
                              contactNumber: 'Must start with 6-9 and be 10 digits',
                            }))
                          } else {
                            setFormErrors((prev) => ({ ...prev, contactNumber: '' }))
                          }

                          setEditableClinicData((prev) => ({ ...prev, contactNumber: value }))
                        }}
                      />
                      {formErrors.contactNumber && (
                        <div className="text-danger mt-1">{formErrors.contactNumber}</div>
                      )}
                    </CCol>

                    <CCol md={6}>
                      <CFormLabel>Location</CFormLabel>
                      <CFormInput
                        type="text"
                        value={editableClinicData.city || ''}
                        disabled={!isEditing}
                        onChange={(e) =>
                          setEditableClinicData({ ...editableClinicData, city: e.target.value })
                        }
                      />
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

                  <CButton
                    color="primary"
                    className="me-2"
                    onClick={async () => {
                      if (isEditing) {
                        try {
                          await updateClinicData(hospitalId, editableClinicData)
                          await fetchClinicDetails()
                          setIsEditing(false)
                        } catch (error) {
                          console.error('Error updating clinic:', error)
                        }
                      } else {
                        setIsEditing(true)
                      }
                    }}
                  >
                    {isEditing ? 'Save' : 'Edit'}
                  </CButton>

                  <CButton
                    color="danger"
                    style={{ color: 'white' }}
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Delete Clinic
                  </CButton>
                </CForm>
              </CTabPane>

              {/* Tab 2: Additional Details */}
              <CTabPane visible={activeTab === 1}>
                <CForm>
                  <CRow className="mb-3">
                    <CCol md={6}>
                      <CFormLabel>Email</CFormLabel>
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
                      <CFormLabel>City</CFormLabel>
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
                      <CFormLabel>Website</CFormLabel>
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
                      <CFormLabel>Issuing Authority</CFormLabel>
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
                      <CFormLabel>Opening Time</CFormLabel>
                      <CFormSelect
                        value={editableClinicData.openingTime || ''}
                        disabled={!isEditingAdditional}
                        onChange={(e) => {
                          setEditableClinicData({
                            ...editableClinicData,
                            openingTime: e.target.value,
                          })
                          setFormErrors((prev) => ({ ...prev, openingTime: '' }))
                        }}
                      >
                        <option value="">Select Opening Time</option>
                        {timeSlots.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </CFormSelect>
                      {formErrors.openingTime && (
                        <div className="text-danger">{formErrors.openingTime}</div>
                      )}
                    </CCol>

                    <CCol md={6}>
                      <CFormLabel>Closing Time</CFormLabel>
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
                        {timeSlots.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </CFormSelect>
                      {formErrors.closingTime && (
                        <div className="text-danger">{formErrors.closingTime}</div>
                      )}
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>Hospital Documents</CFormLabel>

                      {Array.isArray(editableClinicData.hospitalDocuments) &&
                      editableClinicData.hospitalDocuments.length > 0 ? (
                        editableClinicData.hospitalDocuments.map((base64Data, index) => {
                          const prefix = base64Data.substring(0, 20)

                          let mime = 'application/octet-stream'
                          let ext = 'bin'
                          let isPreviewable = false

                          if (prefix.startsWith('JVBERi0')) {
                            mime = 'application/pdf'
                            ext = 'pdf'
                            isPreviewable = true
                          } else if (prefix.startsWith('UEsDB')) {
                            mime =
                              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                            ext = 'docx' // choose docx as default for Office ZIP
                          }

                          const fileName = `${editableClinicData.name}_Doc_${index + 1}.${ext}`
                          const fileDataUrl = `data:${mime};base64,${base64Data}`

                          return (
                            <div key={index} className="mb-3 border rounded p-2 bg-light">
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted">{fileName}</span>
                                <div className="d-flex gap-2">
                                  {isPreviewable && (
                                    <CButton
                                      size="sm"
                                      color="info"
                                      variant="outline"
                                      // onClick={() => window.open(fileDataUrl, '_blank')}
                                      onClick={() => openPdfPreview(base64Data)}
                                    >
                                      Preview
                                    </CButton>
                                  )}
                                  <CButton
                                    size="sm"
                                    color="primary"
                                    variant="outline"
                                    onClick={() => downloadBase64File(fileDataUrl, fileName)}
                                  >
                                    Download
                                  </CButton>
                                </div>
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="text-muted">No documents available.</div>
                      )}
                    </CCol>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>Hospital Contract Documents</CFormLabel>

                      {Array.isArray(editableClinicData.contractorDocuments) &&
                      editableClinicData.contractorDocuments.length > 0 ? (
                        editableClinicData.contractorDocuments.map((base64Data, index) => {
                          const prefix = base64Data.substring(0, 20)
                          console.log(
                            '🔍 Contract Documents:',
                            editableClinicData.contractorDocuments,
                          )

                          let mime = 'application/octet-stream'
                          let ext = 'bin'
                          let isPreviewable = false

                          if (prefix.startsWith('JVBERi0')) {
                            mime = 'application/pdf'
                            ext = 'pdf'
                            isPreviewable = true
                          } else if (prefix.startsWith('UEsDB')) {
                            mime =
                              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                            ext = 'docx' // choose docx as default for Office ZIP
                          }

                          const fileName = `${editableClinicData.name}_Contract_Doc_${index + 1}.${ext}`
                          const fileDataUrl = `data:${mime};base64,${base64Data}`

                          return (
                            <div key={index} className="mb-3 border rounded p-2 bg-light">
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted">{fileName}</span>
                                <div className="d-flex gap-2">
                                  {isPreviewable && (
                                    <CButton
                                      size="sm"
                                      color="info"
                                      variant="outline"
                                      // onClick={() => window.open(fileDataUrl, '_blank')}
                                      onClick={() => openPdfPreview(base64Data)}
                                    >
                                      Preview
                                    </CButton>
                                  )}
                                  <CButton
                                    size="sm"
                                    color="primary"
                                    variant="outline"
                                    onClick={() => downloadBase64File(fileDataUrl, fileName)}
                                  >
                                    Download
                                  </CButton>
                                </div>
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="text-muted">No documents available.</div>
                      )}
                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>Business Registration Certificate</CFormLabel>

                      {editableClinicData.businessRegistrationCertificate ? (
                        (() => {
                          const base64Data = editableClinicData.businessRegistrationCertificate
                          const prefix = base64Data.substring(0, 20)

                          let mime = 'application/octet-stream'
                          let ext = 'bin'
                          let isPreviewable = false

                          if (prefix.startsWith('JVBERi0')) {
                            mime = 'application/pdf'
                            ext = 'pdf'
                            isPreviewable = true
                          } else if (prefix.startsWith('UEsDB')) {
                            mime =
                              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                            ext = 'docx'
                          }

                          const fileName = `${editableClinicData.name || 'Clinic'}_BusinessRegistration.${ext}`
                          const fileDataUrl = `data:${mime};base64,${base64Data}`

                          return (
                            <div className="mb-3 border rounded p-2 bg-light">
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted">{fileName}</span>
                                <div className="d-flex gap-2">
                                  {isPreviewable && (
                                    <CButton
                                      size="sm"
                                      color="info"
                                      variant="outline"
                                      onClick={() => openPdfPreview(base64Data)}
                                    >
                                      Preview
                                    </CButton>
                                  )}
                                  <CButton
                                    size="sm"
                                    color="primary"
                                    variant="outline"
                                    onClick={() => downloadBase64File(fileDataUrl, fileName)}
                                  >
                                    Download
                                  </CButton>
                                </div>
                              </div>
                            </div>
                          )
                        })()
                      ) : (
                        <div className="text-muted">
                          No business registration certificate available.
                        </div>
                      )}
                    </CCol>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>Biomedical Waste Management Auth</CFormLabel>

                      {editableClinicData.biomedicalWasteManagementAuth ? (
                        (() => {
                          const base64Data = editableClinicData.biomedicalWasteManagementAuth
                          const prefix = base64Data.substring(0, 20)

                          let mime = 'application/octet-stream'
                          let ext = 'bin'
                          let isPreviewable = false

                          if (prefix.startsWith('JVBERi0')) {
                            mime = 'application/pdf'
                            ext = 'pdf'
                            isPreviewable = true
                          } else if (prefix.startsWith('UEsDB')) {
                            mime =
                              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                            ext = 'docx'
                          }

                          const fileName = `${editableClinicData.name || 'Clinic'}_BiomedicalWasteAuth.${ext}`
                          const fileDataUrl = `data:${mime};base64,${base64Data}`

                          return (
                            <div className="mb-3 border rounded p-2 bg-light">
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted">{fileName}</span>
                                <div className="d-flex gap-2">
                                  {isPreviewable && (
                                    <CButton
                                      size="sm"
                                      color="info"
                                      variant="outline"
                                      onClick={() => openPdfPreview(base64Data)}
                                    >
                                      Preview
                                    </CButton>
                                  )}
                                  <CButton
                                    size="sm"
                                    color="primary"
                                    variant="outline"
                                    onClick={() => downloadBase64File(fileDataUrl, fileName)}
                                  >
                                    Download
                                  </CButton>
                                </div>
                              </div>
                            </div>
                          )
                        })()
                      ) : (
                        <div className="text-muted">
                          No biomedical waste management auth available.
                        </div>
                      )}
                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>Trade License</CFormLabel>

                      {editableClinicData.tradeLicense ? (
                        (() => {
                          const base64Data = editableClinicData.tradeLicense
                          const prefix = base64Data.substring(0, 20)

                          let mime = 'application/octet-stream'
                          let ext = 'bin'
                          let isPreviewable = false

                          if (prefix.startsWith('JVBERi0')) {
                            mime = 'application/pdf'
                            ext = 'pdf'
                            isPreviewable = true
                          } else if (prefix.startsWith('UEsDB')) {
                            mime =
                              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                            ext = 'docx'
                          }

                          const fileName = `${editableClinicData.name || 'Clinic'}_TradeLicense.${ext}`
                          const fileDataUrl = `data:${mime};base64,${base64Data}`

                          return (
                            <div className="mb-3 border rounded p-2 bg-light">
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted">{fileName}</span>
                                <div className="d-flex gap-2">
                                  {isPreviewable && (
                                    <CButton
                                      size="sm"
                                      color="info"
                                      variant="outline"
                                      onClick={() => openPdfPreview(base64Data)}
                                    >
                                      Preview
                                    </CButton>
                                  )}
                                  <CButton
                                    size="sm"
                                    color="primary"
                                    variant="outline"
                                    onClick={() => downloadBase64File(fileDataUrl, fileName)}
                                  >
                                    Download
                                  </CButton>
                                </div>
                              </div>
                            </div>
                          )
                        })()
                      ) : (
                        <div className="text-muted">No trade license available.</div>
                      )}
                    </CCol>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>Fire Safety Certificate</CFormLabel>

                      {editableClinicData.fireSafetyCertificate ? (
                        (() => {
                          const base64Data = editableClinicData.fireSafetyCertificate
                          const prefix = base64Data.substring(0, 20)

                          let mime = 'application/octet-stream'
                          let ext = 'bin'
                          let isPreviewable = false

                          if (prefix.startsWith('JVBERi0')) {
                            mime = 'application/pdf'
                            ext = 'pdf'
                            isPreviewable = true
                          } else if (prefix.startsWith('UEsDB')) {
                            mime =
                              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                            ext = 'docx'
                          }

                          const fileName = `${editableClinicData.name || 'Clinic'}_FireSafety.${ext}`
                          const fileDataUrl = `data:${mime};base64,${base64Data}`

                          return (
                            <div className="mb-3 border rounded p-2 bg-light">
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted">{fileName}</span>
                                <div className="d-flex gap-2">
                                  {isPreviewable && (
                                    <CButton
                                      size="sm"
                                      color="info"
                                      variant="outline"
                                      onClick={() => openPdfPreview(base64Data)}
                                    >
                                      Preview
                                    </CButton>
                                  )}
                                  <CButton
                                    size="sm"
                                    color="primary"
                                    variant="outline"
                                    onClick={() => downloadBase64File(fileDataUrl, fileName)}
                                  >
                                    Download
                                  </CButton>
                                </div>
                              </div>
                            </div>
                          )
                        })()
                      ) : (
                        <div className="text-muted">No fire safety certificate available.</div>
                      )}
                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>Professional Indemnity Insurance</CFormLabel>

                      {editableClinicData.professionalIndemnityInsurance ? (
                        (() => {
                          const base64Data = editableClinicData.professionalIndemnityInsurance
                          const prefix = base64Data.substring(0, 20)

                          let mime = 'application/octet-stream'
                          let ext = 'bin'
                          let isPreviewable = false

                          if (prefix.startsWith('JVBERi0')) {
                            mime = 'application/pdf'
                            ext = 'pdf'
                            isPreviewable = true
                          } else if (prefix.startsWith('UEsDB')) {
                            mime =
                              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                            ext = 'docx'
                          }

                          const fileName = `${editableClinicData.name || 'Clinic'}_IndemnityInsurance.${ext}`
                          const fileDataUrl = `data:${mime};base64,${base64Data}`

                          return (
                            <div className="mb-3 border rounded p-2 bg-light">
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted">{fileName}</span>
                                <div className="d-flex gap-2">
                                  {isPreviewable && (
                                    <CButton
                                      size="sm"
                                      color="info"
                                      variant="outline"
                                      onClick={() => openPdfPreview(base64Data)}
                                    >
                                      Preview
                                    </CButton>
                                  )}
                                  <CButton
                                    size="sm"
                                    color="primary"
                                    variant="outline"
                                    onClick={() => downloadBase64File(fileDataUrl, fileName)}
                                  >
                                    Download
                                  </CButton>
                                </div>
                              </div>
                            </div>
                          )
                        })()
                      ) : (
                        <div className="text-muted">
                          No professional indemnity insurance available.
                        </div>
                      )}
                    </CCol>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>Other Documents</CFormLabel>

                      {editableClinicData.others ? (
                        (() => {
                          const base64Data = editableClinicData.others
                          const prefix = base64Data.substring(0, 20)

                          let mime = 'application/octet-stream'
                          let ext = 'bin'
                          let isPreviewable = false

                          if (prefix.startsWith('JVBERi0')) {
                            mime = 'application/pdf'
                            ext = 'pdf'
                            isPreviewable = true
                          } else if (prefix.startsWith('UEsDB')) {
                            mime =
                              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                            ext = 'docx'
                          }

                          const fileName = `${editableClinicData.name || 'Clinic'}_OtherDocument.${ext}`
                          const fileDataUrl = `data:${mime};base64,${base64Data}`

                          return (
                            <div className="mb-3 border rounded p-2 bg-light">
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted">{fileName}</span>
                                <div className="d-flex gap-2">
                                  {isPreviewable && (
                                    <CButton
                                      size="sm"
                                      color="info"
                                      variant="outline"
                                      onClick={() => openPdfPreview(base64Data)}
                                    >
                                      Preview
                                    </CButton>
                                  )}
                                  <CButton
                                    size="sm"
                                    color="primary"
                                    variant="outline"
                                    onClick={() => downloadBase64File(fileDataUrl, fileName)}
                                  >
                                    Download
                                  </CButton>
                                </div>
                              </div>
                            </div>
                          )
                        })()
                      ) : (
                        <div className="text-muted">No other documents available.</div>
                      )}
                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>Drug License Certificate</CFormLabel>

                      {editableClinicData.drugLicenseCertificate ? (
                        (() => {
                          const base64Data = editableClinicData.drugLicenseCertificate
                          const prefix = base64Data.substring(0, 20)

                          let mime = 'application/octet-stream'
                          let ext = 'bin'
                          let isPreviewable = false

                          if (prefix.startsWith('JVBERi0')) {
                            mime = 'application/pdf'
                            ext = 'pdf'
                            isPreviewable = true
                          } else if (prefix.startsWith('UEsDB')) {
                            mime =
                              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                            ext = 'docx'
                          }

                          const fileName = `${editableClinicData.name || 'Clinic'}_DrugLicense.${ext}`
                          const fileDataUrl = `data:${mime};base64,${base64Data}`

                          return (
                            <div className="mb-3 border rounded p-2 bg-light">
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted">{fileName}</span>
                                <div className="d-flex gap-2">
                                  {isPreviewable && (
                                    <CButton
                                      size="sm"
                                      color="info"
                                      variant="outline"
                                      onClick={() => openPdfPreview(base64Data)}
                                    >
                                      Preview
                                    </CButton>
                                  )}
                                  <CButton
                                    size="sm"
                                    color="primary"
                                    variant="outline"
                                    onClick={() => downloadBase64File(fileDataUrl, fileName)}
                                  >
                                    Download
                                  </CButton>
                                </div>
                              </div>
                            </div>
                          )
                        })()
                      ) : (
                        <div className="text-muted">No drug license certificate available.</div>
                      )}
                    </CCol>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>Drug License Form Type</CFormLabel>

                      {editableClinicData.drugLicenseFormType ? (
                        (() => {
                          const base64Data = editableClinicData.drugLicenseFormType
                          const prefix = base64Data.substring(0, 20)

                          let mime = 'application/octet-stream'
                          let ext = 'bin'
                          let isPreviewable = false

                          if (prefix.startsWith('JVBERi0')) {
                            mime = 'application/pdf'
                            ext = 'pdf'
                            isPreviewable = true
                          } else if (prefix.startsWith('UEsDB')) {
                            mime =
                              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                            ext = 'docx'
                          }

                          const fileName = `${editableClinicData.name || 'Clinic'}_DrugLicenseForm.${ext}`
                          const fileDataUrl = `data:${mime};base64,${base64Data}`

                          return (
                            <div className="mb-3 border rounded p-2 bg-light">
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted">{fileName}</span>
                                <div className="d-flex gap-2">
                                  {isPreviewable && (
                                    <CButton
                                      size="sm"
                                      color="info"
                                      variant="outline"
                                      onClick={() => openPdfPreview(base64Data)}
                                    >
                                      Preview
                                    </CButton>
                                  )}
                                  <CButton
                                    size="sm"
                                    color="primary"
                                    variant="outline"
                                    onClick={() => downloadBase64File(fileDataUrl, fileName)}
                                  >
                                    Download
                                  </CButton>
                                </div>
                              </div>
                            </div>
                          )
                        })()
                      ) : (
                        <div className="text-muted">No drug license form type available.</div>
                      )}
                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>Pharmacist Certificate</CFormLabel>

                      {editableClinicData.pharmacistCertificate ? (
                        (() => {
                          const base64Data = editableClinicData.pharmacistCertificate
                          const prefix = base64Data.substring(0, 20)

                          let mime = 'application/octet-stream'
                          let ext = 'bin'
                          let isPreviewable = false

                          if (prefix.startsWith('JVBERi0')) {
                            mime = 'application/pdf'
                            ext = 'pdf'
                            isPreviewable = true
                          } else if (prefix.startsWith('UEsDB')) {
                            mime =
                              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                            ext = 'docx'
                          }

                          const fileName = `${editableClinicData.name || 'Clinic'}_PharmacistCertificate.${ext}`
                          const fileDataUrl = `data:${mime};base64,${base64Data}`

                          return (
                            <div className="mb-3 border rounded p-2 bg-light">
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted">{fileName}</span>
                                <div className="d-flex gap-2">
                                  {isPreviewable && (
                                    <CButton
                                      size="sm"
                                      color="info"
                                      variant="outline"
                                      onClick={() => openPdfPreview(base64Data)}
                                    >
                                      Preview
                                    </CButton>
                                  )}
                                  <CButton
                                    size="sm"
                                    color="primary"
                                    variant="outline"
                                    onClick={() => downloadBase64File(fileDataUrl, fileName)}
                                  >
                                    Download
                                  </CButton>
                                </div>
                              </div>
                            </div>
                          )
                        })()
                      ) : (
                        <div className="text-muted">No pharmacist certificate available.</div>
                      )}
                    </CCol>
                    <CCol md={6} className="mt-3">
                      <CFormLabel>Clinical Establishment Certificate</CFormLabel>

                      {editableClinicData.clinicalEstablishmentCertificate ? (
                        (() => {
                          const base64Data = editableClinicData.clinicalEstablishmentCertificate
                          const prefix = base64Data.substring(0, 20)

                          let mime = 'application/octet-stream'
                          let ext = 'bin'
                          let isPreviewable = false

                          if (prefix.startsWith('JVBERi0')) {
                            mime = 'application/pdf'
                            ext = 'pdf'
                            isPreviewable = true
                          } else if (prefix.startsWith('UEsDB')) {
                            mime =
                              'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                            ext = 'docx'
                          }

                          const fileName = `${editableClinicData.name || 'Clinic'}_ClinicalCertificate.${ext}`
                          const fileDataUrl = `data:${mime};base64,${base64Data}`

                          return (
                            <div className="mb-3 border rounded p-2 bg-light">
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted">{fileName}</span>
                                <div className="d-flex gap-2">
                                  {isPreviewable && (
                                    <CButton
                                      size="sm"
                                      color="info"
                                      variant="outline"
                                      onClick={() => openPdfPreview(base64Data)}
                                    >
                                      Preview
                                    </CButton>
                                  )}
                                  <CButton
                                    size="sm"
                                    color="primary"
                                    variant="outline"
                                    onClick={() => downloadBase64File(fileDataUrl, fileName)}
                                  >
                                    Download
                                  </CButton>
                                </div>
                              </div>
                            </div>
                          )
                        })()
                      ) : (
                        <div className="text-muted">
                          No clinical establishment certificate available.
                        </div>
                      )}
                    </CCol>
                  </CRow>
                  <CButton
                    color="primary"
                    className="me-2"
                    onClick={async () => {
                      if (isEditingAdditional) {
                        try {
                          await updateClinicData(hospitalId, editableClinicData)
                          await fetchClinicDetails()
                          setIsEditingAdditional(false)
                        } catch (error) {
                          console.error('Error updating additional details:', error)
                        }
                      } else {
                        setIsEditingAdditional(true)
                      }
                    }}
                  >
                    {isEditingAdditional ? 'Update' : 'Edit'}
                  </CButton>
                </CForm>
              </CTabPane>

              {/* Tab 3: Doctors */}
              <CTabPane visible={activeTab === 2}>
                <table className="table">
                  <thead>
                    <tr>
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
                      allDoctors.map((doc, idx) => (
                        <tr key={idx}>
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
                              className="btn btn-primary"
                              size="sm"
                              onClick={() => {
                                setSelectedDoctor(doc)
                                setShowDoctorModal(true)
                              }}
                            >
                              View
                            </CButton>
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
              </CTabPane>

              {/* Tab 4: Appointments */}
              <CTabPane visible={activeTab === 3}>
                {['Past', 'Active', 'Upcoming'].map((group) => (
                  <div key={group} className="mb-4">
                    <h5>{group} Appointments</h5>
                    <ul>
                      {clinicData?.appointments
                        ?.filter((a) => a.status === group)
                        ?.map((appt, idx) => (
                          <li key={idx}>
                            {appt.date} - {appt.patientName} with {appt.doctorName}
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </CTabPane>
            </CTabContent>

            <CModal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
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
          </>
        )}
      </CCardBody>
    </CCard>
  )
}

export default ClinicDetails
