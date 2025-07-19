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
import { Get_ReportsByBookingIdData, SaveReportsData } from './reportAPI' // Assuming reportAPI.js is in the same directory
import { FaEye, FaDownload } from 'react-icons/fa'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

const ReportDetails = () => {
  const { id } = useParams()
  const location = useLocation()
  const appointmentInfo = location.state?.appointmentInfo

  const navigate = useNavigate()

  // Helper function to format date as YYYY-MM-DD
  const getISODate = (date) => date.toISOString().split('T')[0]

  // Calculate today's date for minimum date restriction in the form
  const today = new Date()
  const todayISO = getISODate(today)

  const [report, setReport] = useState([])
  const [showModal, setShowModal] = useState(false)

  // State for previewing both images and PDFs
  const [previewFileUrl, setPreviewFileUrl] = useState(null)
  const [isPreviewPdf, setIsPreviewPdf] = useState(false)

  // State specific for PDF viewing
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)

  const [uploadModal, setUploadModal] = useState(false)

  // Initial state for new report, with reportDate not prefilled
  const [newReport, setNewReport] = useState({
    reportName: '',
    reportDate: '', // No prefill for date
    reportStatus: '',
    reportType: '',
    reportFile: null,
    bookingId: appointmentInfo?.bookingId || '', // Ensure bookingId is safe to access
  })

  // ✅ This correctly sets the PDF worker for Vite
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url,
  ).href

  // const base64File = Array.isArray(reportItem.reportFile)
  //   ? reportItem.reportFile[0]
  //   : reportItem.reportFile

  // Display error and go back if appointmentInfo is missing
  if (!appointmentInfo) {
    return (
      <div className="text-center mt-4">
        <h5 className="text-danger">Appointment details not found!</h5>
        <CButton color="primary" onClick={() => navigate(-1)} className="mt-2">
          Go Back
        </CButton>
      </div>
    )
  }

  // Determine MIME type for base64 data for display/download purposes
  const getMimeType = (base64) => {
    if (!base64) return 'application/octet-stream'
    if (base64.startsWith('JVBER')) return 'application/pdf' // PDF magic number
    if (base64.startsWith('/9j/')) return 'image/jpeg' // JPEG magic number
    if (base64.startsWith('iVBOR')) return 'image/png' // PNG magic number
    return 'application/octet-stream'
  }

  // Callback for react-pdf when a document loads successfully
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
    setPageNumber(1) // Reset to page 1 when a new PDF is loaded
  }

  // Handle modal close logic, resetting PDF view state
  const handleCloseModal = () => {
    setShowModal(false)
    setPreviewFileUrl(null)
    setIsPreviewPdf(false)
    setNumPages(null)
    setPageNumber(1)
  }

  // Function to fetch report details from the API
  const fetchReportDetails = async () => {
    try {
      const res = await Get_ReportsByBookingIdData(appointmentInfo.bookingId)
      const rawData = res

      if (Array.isArray(rawData)) {
        const allReports = rawData.flatMap((item) => item.reportsList || [])
        setReport(allReports)
      } else {
        console.warn('Unexpected response format for reports:', rawData)
        setReport([])
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
      setReport([])
    }
  }
 const handlePreview = (base64File) => {
  if (!base64File) return;
  const mimeType = getMimeType(base64File);
  const isPdfFile = mimeType === 'application/pdf';
  const fileUrl = `data:${mimeType};base64,${base64File}`;

  setIsPreviewPdf(isPdfFile);
  setPreviewFileUrl(fileUrl);
  setShowModal(true);
};


  // Effect hook to fetch reports when appointmentInfo.bookingId changes
  useEffect(() => {
    if (appointmentInfo?.bookingId) {
      fetchReportDetails()
    }
  }, [appointmentInfo?.bookingId])

  // Handle file input change and convert to Base64
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1] // Get base64 part
      setNewReport((prev) => ({
        ...prev,
        reportFile: base64String,
      }))
    }
    if (file) reader.readAsDataURL(file)
  }

  // Handle report upload submission
  const handleUploadSubmit = async () => {
    // Validate all required fields
    if (
      !newReport.reportName ||
      !newReport.reportDate ||
      !newReport.reportStatus ||
      !newReport.reportType ||
      !newReport.reportFile
    ) {
      toast.error('Please fill all required fields and upload a file.')
      return
    }

    try {
      const payload = {
        reportsList: [
          {
            ...newReport,
            reportFile: [newReport.reportFile], // API expects an array of base64 strings
          },
        ],
      }

      const response = await SaveReportsData(payload)
      console.log('Report uploaded:', response)

      setUploadModal(false) // Close the upload modal
      toast.success('Report uploaded successfully!')
      fetchReportDetails() // Refresh the report list

      // Reset the form state after successful upload (clears fields)
      setNewReport({
        reportName: '',
        reportDate: '',
        reportStatus: '',
        reportType: '',
        reportFile: null,
        bookingId: appointmentInfo?.bookingId || '',
      })
    } catch (err) {
      console.error('Error uploading report:', err)
      toast.error('Upload failed')
    }
  }

  return (
    <div className="container mt-4">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Appointment Info Section */}
      <div className="container bg-light p-4 rounded shadow-sm mb-4">
        <div className="row">
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
          <div className="col-md-6 ps-md-4">
            <p>
              <strong>Doctor ID:</strong> {appointmentInfo.item?.doctorId || 'N/A'}
            </p>
            <p>
              <strong>Hospital ID:</strong> {appointmentInfo.item?.clinicId || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Header and Upload Button */}
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

      {/* Reports Table */}
      <div className="mt-4">
        <CTable bordered responsive>
          <CTableHead color="light">
            <CTableRow>
              <CTableHeaderCell>S.No</CTableHeaderCell>
              <CTableHeaderCell>Booking ID</CTableHeaderCell>
              <CTableHeaderCell>Report Name</CTableHeaderCell>
              <CTableHeaderCell>Date</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
              <CTableHeaderCell>Type</CTableHeaderCell>
              <CTableHeaderCell>Action</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {Array.isArray(report) && report.length > 0 ? (
              report.map((reportItem, index) => {
                // Ensure we get the Base64 string correctly (assuming it might be wrapped in an array)
                const base64File = Array.isArray(reportItem.reportFile)
                  ? reportItem.reportFile[0]
                  : reportItem.reportFile

                const mimeType = getMimeType(base64File)
                const isPdf = mimeType === 'application/pdf'
                const fileExt = isPdf
                  ? 'pdf'
                  : mimeType.includes('image/')
                    ? mimeType.split('/')[1]
                    : 'dat'
                const fileUrl = `data:${mimeType};base64,${base64File}`

                return (
                  <CTableRow key={index}>
                    <CTableDataCell>{index + 1}</CTableDataCell>
                    <CTableDataCell>{reportItem.bookingId}</CTableDataCell>
                    <CTableDataCell>{reportItem.reportName}</CTableDataCell>
                    <CTableDataCell>{reportItem.reportDate}</CTableDataCell>
                    <CTableDataCell>{reportItem.reportStatus}</CTableDataCell>
                    <CTableDataCell>{reportItem.reportType}</CTableDataCell>

                    {/* Actions: Preview + Download */}
                    <CTableDataCell>
                      {base64File ? (
                        <div className="d-flex gap-2">
                          {/* 👁️ Preview Button */}
                          <CButton
                            className="bg-info text-white border-0"
                            size="sm"
                            onClick={() => {
                              // Set state for modal preview
                              setIsPreviewPdf(isPdf)
                              setPreviewFileUrl(fileUrl)
                              setShowModal(true)
                            }}
                          >
                            <FaEye />
                          </CButton>

                          {/* ⬇️ Download Button */}
                          <a
                            href={fileUrl}
                            download={`${reportItem.reportName || 'report'}_${index + 1}.${fileExt}`}
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
                <CTableDataCell colSpan="7" className="text-center">
                  No Reports Found
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>
      </div>

      {/* Image/PDF Preview Modal */}
      <CModal visible={showModal} onClose={handleCloseModal} size="xl">
        <CModalHeader onClose={handleCloseModal}>
          <strong>{isPreviewPdf ? 'PDF Preview' : 'Image Preview'}</strong>
        </CModalHeader>
        <CModalBody className="text-center">
          {isPreviewPdf ? (
            <iframe
              src={previewFileUrl}
              title="PDF Preview"
              style={{
                width: '100%',
                height: '80vh',
                border: 'none',
              }}
            ></iframe>
          ) : (
            <img
              src={previewFileUrl}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                borderRadius: '8px',
              }}
            />
          )}
        </CModalBody>
      </CModal>

      {/* Upload Report Modal */}
      <CModal visible={uploadModal} onClose={() => setUploadModal(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Upload Report</CModalTitle>
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
                disabled
              />
            </div>
            <div className="mb-2">
              <CFormLabel>Report Date</CFormLabel>
              <CFormInput
                type="date"
                value={newReport.reportDate}
                onChange={(e) => setNewReport({ ...newReport, reportDate: e.target.value })}
                // Ensures only today or future dates can be selected
                min={todayISO}
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
