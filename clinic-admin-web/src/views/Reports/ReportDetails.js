import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import {
  CButton,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CModal,
  CModalHeader,
  CModalBody,
  CModalTitle,
  CForm,
  CFormLabel,
  CFormInput,
  CModalFooter,
} from '@coreui/react'
import { ReportsData } from './reportAPI'
import { FaEye, FaDownload } from 'react-icons/fa' // Font Awesome Icons
import { SaveReportsData } from './reportAPI'

const ReportDetails = () => {
  const { id } = useParams()
  const location = useLocation()
  const appointmentInfo = location.state?.appointmentInfo

  const navigate = useNavigate()
  const [report, setReport] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const [uploadModal, setUploadModal] = useState(false)
  const [newReport, setNewReport] = useState({
    reportName: '',
    reportDate: '',
    reportStatus: '',
    reportType: '',
    reportFile: null,
    bookingId: appointmentInfo.bookingId,
  })
  const reports = location.state?.report
  const isPdf = report.reportFile?.[0]?.startsWith('JVBER')
  const mimeType = isPdf ? 'application/pdf' : 'image/jpeg'
  const fileExt = isPdf ? 'pdf' : 'jpg'
  const fileUrl = `data:${mimeType};base64,${report.reportFile?.[0]}`

  const getMimeType = (base64) => {
    if (base64.startsWith('JVBER')) return 'application/pdf'
    if (base64.startsWith('/9j/')) return 'image/jpeg'
    if (base64.startsWith('iVBOR')) return 'image/png'
    return 'application/octet-stream'
  }

  // const mimeType = null
  const fileName = ` 'report'}.${mimeType === 'application/pdf' ? 'pdf' : 'jpg'}`
  const dataUrl = `data:${mimeType};base64,`

  if (!report) {
    return (
      <div className="text-center mt-4">
        <h5 className="text-danger">No report details found!</h5>
        <CButton color="primary" onClick={() => navigate(-1)} className="mt-2">
          Go Back
        </CButton>
      </div>
    )
  }
  const fetchReportDetails = async () => {
    try {
      const res = await ReportsData()
      const rawData = res
      console.log(rawData)
      // Check if array and flatten
      if (Array.isArray(rawData)) {
        const allReports = rawData.flatMap((item) => item.reportsList || [])
        console.log('Flattened Reports:', allReports)
        setReport(allReports)
      } else {
        console.warn('Unexpected response format:', rawData)
        setReport([])
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
      setReport([])
    }
  }

  useEffect(() => {
    fetchReportDetails()
  }, [])
  console.log(report)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1] // remove prefix
      setNewReport((prev) => ({
        ...prev,
        reportFile: base64String,
      }))
    }
    if (file) reader.readAsDataURL(file)
  }
  const handleUploadSubmit = async () => {
    // ✅ Validate before submit
    if (
      !newReport.reportName ||
      !newReport.reportDate ||
      !newReport.reportStatus ||
      !newReport.reportType ||
      !newReport.reportFile
    ) {
      alert('Please fill all required fields and upload a file.')
      return
    }

    try {
      const payload = {
        reportsList: [
          {
            ...newReport,
            reportFile: [newReport.reportFile], // Make sure it's an array
          },
        ],
      }

      const response = await SaveReportsData(payload)
      console.log('Report uploaded:', response)
      setUploadModal(false)
      alert('Report uploaded successfully!')
      fetchReportDetails()
    } catch (err) {
      console.error('Error uploading report:', err)
      alert('Upload failed')
    }
  }

  return (
    <div className="container mt-4">
      {appointmentInfo && (
        <div className="container bg-light p-4 rounded shadow-sm mb-4">
          <div className="row">
            {/* Left Side: Patient Info */}
            <div className="col-md-6 border-end">
              <p>
                <strong>Name:</strong> {appointmentInfo.name}
              </p>
              <p>
                <strong>Age:</strong> {appointmentInfo.age}
              </p>
              <p>
                <strong>Gender:</strong> {appointmentInfo.gender}
              </p>
              <p>
                <strong>Problem:</strong> {appointmentInfo.problem}
              </p>
            </div>

            {/* Right Side: Doctor and Hospital Info */}
            <div className="col-md-6 ps-md-4">
              <p>
                <strong>Doctor ID:</strong> {appointmentInfo.item.doctorId}
              </p>
              <p>
                <strong>Hospital ID:</strong> {appointmentInfo.item.clinicId}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-info text-white p-3 d-flex justify-content-between align-items-center rounded">
        <h5 className="mb-0">Report Details</h5>
        <div className="d-flex gap-2">
          <CButton color="secondary" size="sm" onClick={() => navigate(-1)}>
            Back
          </CButton>
          <CButton
            color="success"
            size="sm"
            onClick={() => setUploadModal(true)}
            style={{ color: 'white' }}
          >
            Upload Report
          </CButton>
        </div>
      </div>

      {/* Table */}

      <div className="mt-4">
        <CTable bordered responsive>
          <CTableHead color="light">
            <CTableRow>
              <CTableHeaderCell>S.No</CTableHeaderCell>
              {/* <CTableHeaderCell>Report ID</CTableHeaderCell> */}
              <CTableHeaderCell>Booking ID</CTableHeaderCell>
              <CTableHeaderCell>Report Name</CTableHeaderCell>
              <CTableHeaderCell>Date</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
              <CTableHeaderCell>Type</CTableHeaderCell>
              <CTableHeaderCell>Action</CTableHeaderCell>
              {/* <CTableHeaderCell>Download</CTableHeaderCell> */}
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {Array.isArray(report) && report.length > 0 ? (
              report.map((report, index) => {
                console.log('Rendering report:', report)
                const isPdf = report.reportFile?.includes('JVBER')
                const mimeType = isPdf ? 'application/pdf' : 'image/jpeg'
                const fileExt = isPdf ? 'pdf' : 'jpg'
                const fileUrl = `data:${mimeType};base64,${report.reportFile}`

                return (
                  <CTableRow key={index}>
                    {/* <CTableDataCell>{report.id}</CTableDataCell> */}
                    <CTableDataCell>{index + 1}</CTableDataCell>
                    <CTableDataCell>{report.bookingId}</CTableDataCell>
                    <CTableDataCell>{report.reportName}</CTableDataCell>
                    <CTableDataCell>{report.reportDate}</CTableDataCell>
                    <CTableDataCell>{report.reportStatus}</CTableDataCell>
                    <CTableDataCell>{report.reportType}</CTableDataCell>

                    {/* Actions: Preview + Download */}
                    <CTableDataCell>
                      {report.reportFile ? (
                        <div className="d-flex gap-2">
                          {/* 👁️ Preview */}
                          <CButton
                            className="bg-info text-white border-0"
                            size="sm"
                            onClick={() => {
                              if (isPdf) {
                                window.open(fileUrl, '_blank')
                              } else {
                                setPreviewImage(fileUrl)
                                setShowModal(true)
                              }
                            }}
                          >
                            <FaEye />
                          </CButton>

                          {/* ⬇️ Download */}
                          <a
                            href={fileUrl}
                            download={`${report.reportName || 'report'}_${index + 1}.${fileExt}`}
                            className="btn btn-sm btn-outline-success"
                            title="Download"
                          >
                            <FaDownload />
                          </a>
                        </div>
                      ) : (
                        'No File'
                      )}
                    </CTableDataCell>
                  </CTableRow>
                )
              })
            ) : (
              <CTableRow>
                <CTableDataCell colSpan="8" className="text-center">
                  No Reports Found
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>
      </div>
      <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg">
        <CModalHeader onClose={() => setShowModal(false)}>
          <strong>Image Preview</strong>
        </CModalHeader>
        <CModalBody className="text-center">
          <img
            src={previewImage}
            alt="Preview"
            style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px' }}
          />
        </CModalBody>
      </CModal>
      <CModal visible={uploadModal} onClose={() => setUploadModal(false)}>
        <CModalHeader>
          <CModalTitle  >Upload Report</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-2">
              <CFormLabel>Report Name</CFormLabel>
              <CFormInput
                value={newReport.reportName}
                onChange={(e) => setNewReport({ ...newReport, reportName: e.target.value })}
              />
            </div>
            <div className="mb-2">
              <CFormLabel>Booking Id</CFormLabel>
              <CFormInput
                value={newReport.bookingId}
                onChange={(e) => setNewReport({ ...newReport, bookingId: e.target.value })}
              />
            </div>
            <div className="mb-2">
              <CFormLabel>Report Date</CFormLabel>
              <CFormInput
                type="date"
                value={newReport.reportDate}
                onChange={(e) => setNewReport({ ...newReport, reportDate: e.target.value })}
              />
            </div>
            <div className="mb-2">
              <CFormLabel>Report Status</CFormLabel>
              <CFormInput
                value={newReport.reportStatus}
                onChange={(e) => setNewReport({ ...newReport, reportStatus: e.target.value })}
              />
            </div>
            <div className="mb-2">
              <CFormLabel>Report Type</CFormLabel>
              <CFormInput
                value={newReport.reportType}
                onChange={(e) => setNewReport({ ...newReport, reportType: e.target.value })}
              />
            </div>
            <div className="mb-2">
              <CFormLabel>Upload File (PDF or Image)</CFormLabel>
              <CFormInput
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
              />
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setUploadModal(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleUploadSubmit}>
            Submit
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default ReportDetails
