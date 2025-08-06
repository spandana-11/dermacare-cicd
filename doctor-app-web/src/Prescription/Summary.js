import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
} from '@coreui/react'
import Button from '../components/CustomButton/CustomButton'
import Snackbar from '../components/Snackbar'
import { COLORS } from '../Themes'
import './Summary.css'
import { useToast } from '../utils/Toaster'
import FileUploader from './FileUploader'
import { createDoctorSaveDetails, getClinicDetails, getDoctorDetails } from '../Auth/Auth'
import { useDoctorContext } from '../Context/DoctorContext'
import { PDFDownloadLink } from '@react-pdf/renderer'
import PrescriptionPDF from '../utils/PdfGenerator'

/**
 * Props:
 * - patientData
 * - formData: {
 *    symptoms: { symptomDetails, doctorObs, diagnosis, duration }
 *    tests: { selectedTests: [{name, reason?}] }
 *    prescription: { medicines: [{ id, medicine, dose, remind, note, duration, time }] }
 *    treatments: { selectedTreatments: [{name, reason?}] }
 *    followUp: { duration, date, note }
 *   }
 */
const Summary = ({ onNext, sidebarWidth = 0, onSaveTemplate, patientData, formData = {} }) => {
  const sampleFiles = [
    { name: 'javascript.pdf', type: 'application/pdf', path: '/files/ReactJS- PWA.pdf' },
    { name: 'mounika.png', type: 'image/png', path: '/files/mounika.png' },
    { name: 'Hospital.png', type: 'image/png', path: '/files/Hospital.png' },
  ]
  const { doctorId, hospitalId, doctorDetails, setDoctorDetails, setClinicDetails, clinicDetails, } = useDoctorContext()
  const [snackbar, setSnackbar] = useState({ show: false, message: '', type: '' })
  const navigate = useNavigate()
  const navigatingRef = useRef(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)

  const { success, error, info, warning } = useToast()

  // map safely
  const symptomsDetails = formData?.symptoms?.symptomDetails ?? formData?.symptoms?.doctorObs ?? '—'
  const symptomsDuration = formData?.symptoms?.duration ?? patientData?.duration ?? '—'
  const doctorObs = formData?.symptoms?.doctorObs ?? patientData?.doctorObs ?? '—'
  const attachments = formData?.symptoms?.attachments ?? patientData?.attachments ?? '—'
  // const reports = Array.isArray(formData.symptoms.reports) ? patientData?.reports : []

  const diagnosis = formData?.symptoms?.diagnosis ?? formData?.summary?.diagnosis ?? ''

  const tests = Array.isArray(formData?.tests?.selectedTests) ? formData.tests.selectedTests : []
  const testsReason = formData?.tests?.testReason ? formData.tests.testReason : ''
  const treatmentReason = formData?.treatments?.treatmentReason
    ? formData.treatments.treatmentReason
    : ''
  const treatments = Array.isArray(formData?.treatments?.selectedTestTreatments)
    ? formData.treatments.selectedTestTreatments
    : []
  const medicines = Array.isArray(formData?.prescription?.medicines)
    ? formData.prescription.medicines
    : []

  const followUp = {
    durationValue: formData.followUp.durationValue || 'NA',
    durationUnit: formData.followUp.durationUnit || 'NA',
    date: formData.followUp.nextFollowUpDate || 'NA',
    note: formData.followUp.followUpNote || 'NA',
  }

  const ACTIONS = { SAVE: 'save', SAVE_PRINT: 'savePrint' }

  const handleDelete = (id) => {
    // to actually delete, lift state to parent and update formData.prescription.medicines
    console.log('Delete prescription with ID:', id)
  }



  const handlePrint = async () => {
    const container = document.getElementById('print-area')
    if (!container) return

    const printContents = container.innerHTML
    const printWindow = window.open('', '', 'height=800,width=600')
    if (!printWindow) return alert('Please allow pop-ups to print.')

    printWindow.document.open()
    printWindow.document.write(`
      <html>
        <head>
          <title>Patient Summary</title>
          <style>
            body { margin: 20px; color: #000; font-family: Segoe UI, Arial, sans-serif; }
            h3, h4, h5 { margin-top: 16px; font-size: 18px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 14px; }
            .summary-section { margin-bottom: 18px; }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `)
    printWindow.document.close()

    await new Promise((resolve) => {
      const done = () => resolve()
      if (printWindow.document.readyState === 'complete') setTimeout(done, 50)
      else printWindow.addEventListener('load', () => setTimeout(done, 50))
    })

    await new Promise((resolve) => {
      let resolved = false
      const cleanup = () => {
        if (resolved) return
        resolved = true
        try {
          printWindow.close()
        } catch { }
        resolve()
      }
      try {
        printWindow.focus()
        printWindow.onafterprint = cleanup
        printWindow.print()
        setTimeout(cleanup, 1500)
      } catch {
        cleanup()
      }
    })
  }
  useEffect(() => {
    const fetchDetails = async () => {
      const doctor = await getDoctorDetails();
      const clinic = await getClinicDetails();

      if (doctor) setDoctorDetails(doctor);
      if (clinic) setClinicDetails(clinic);
    };

    fetchDetails();
  }, []);

  const onClickSave = () => {
    setPendingAction(ACTIONS.SAVE)
    setShowTemplateModal(true)
  }
  const onClickSavePrint = () => {
    setPendingAction(ACTIONS.SAVE_PRINT)
    setShowTemplateModal(true)
  }

  console.log(clinicDetails)

  const confirmSaveAsTemplate = async () => {
    const action = pendingAction;
   
    setShowTemplateModal(false)
    try {
      await onSaveTemplate?.()
 

      // ✅ Call API after saving template
      const payload = {
        bookingId: patientData.bookingId,
        doctorName: doctorDetails.doctorName,
        clinicName: clinicDetails.name,
        clinicId: clinicDetails.hospitalId,
        patientId: patientData.patientId,
        doctorId: doctorDetails.doctorId,
        symptoms: formData.symptoms,
        tests: formData.tests,
        treatments: formData?.treatments,
        followUp: formData.followUp,
        prescription: formData.prescription
      }
      console.log(payload)
      const response = await createDoctorSaveDetails(payload);
      console.log(response);
      if (response) {
        success('Prescription Data Saved Successfully...!', { title: 'Success' })
      }

      if (action === ACTIONS.SAVE_PRINT) {
        await handlePrint()
      }
      navigate('/dashboard', { replace: true })
    } finally {
      setPendingAction(null)
    }
  }

  const skipTemplate = async () => {
    setShowTemplateModal(false)
    setPendingAction(null)
    // ✅ Call API after saving template
    const payload = {
      bookingId: patientData.bookingId,
      doctorName: doctorDetails.doctorName,
      clinicName: clinicDetails.name,
      clinicId: clinicDetails.hospitalId,
      patientId: patientData.patientId,
      doctorId: doctorDetails.doctorId,
      symptoms: formData.symptoms,
      tests: formData.tests,
      treatments: formData?.treatments,
      followUp: formData.followUp,
      prescription: formData.prescription
    }
    console.log(payload)
    const response = await createDoctorSaveDetails(payload);
    console.log(response);
    if (response) {
      success('Prescription Data Saved Successfully...!', { title: 'Success' })
    }

    navigate('/dashboard', { replace: true })
  }
  console.log('durationValue:', followUp.durationValue)

  return (
    <div className="pb-5" style={{ backgroundColor: COLORS.theme }}>
      <CContainer fluid className="p-0" id="print-area">
        {/* Patient Info */}
        <CCard className="shadow-sm mb-3">
          <CCardHeader className="py-2">
            <strong>Patient Information</strong>
          </CCardHeader>
          <CCardBody>
            <CRow className="g-3">
              <CCol xs={12} md={4}>
                <div>
                  <span className="fw-semibold">Name:</span> {patientData?.name || '—'}
                </div>
              </CCol>
              <CCol xs={12} md={3}>
                <div>
                  <span className="fw-semibold">Age/Sex:</span>{' '}
                  {patientData?.age ? `${patientData.age} Years` : '—'}
                  {patientData?.gender ? ` / ${patientData.gender}` : ''}
                </div>
              </CCol>
              <CCol xs={12} md={4}>
                <div>
                  <span className="fw-semibold">Mobile Number:</span>{' '}
                  {patientData?.mobileNumber || '—'}
                </div>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>

        {/* Symptoms & Duration */}
        {(symptomsDetails !== '—' || symptomsDuration !== '—') && (
          <CCard className="shadow-sm mb-3">
            <CCardHeader className="py-2">
              <strong>Symptoms & Duration</strong>
            </CCardHeader>
            <CCardBody>
              <CRow className="g-3">
                <CCol xs={12} md={8}>
                  <h6 className="mb-2">Patient-Provided Symptom</h6>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{symptomsDetails}</div>
                  <h6 className="mb-2 mt-2">
                    Doctor Observations <span className="text-body-secondary">(if any)</span>
                  </h6>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{doctorObs}</div>
                </CCol>
                <CCol xs={12} md={4}>
                  <h6 className="mb-2">Duration of Symptoms</h6>
                  <CBadge color="info" className="px-3 py-2">
                    {symptomsDuration}
                  </CBadge>
                </CCol>
              </CRow>
              <h6 className="mb-2 mt-4">Previous Reports & Prescriptions</h6>
              <FileUploader attachments={attachments} accept=".pdf,image/*" />
            </CCardBody>
          </CCard>
        )}

        {/* Diagnosis */}
        {diagnosis && (
          <CCard className="shadow-sm mb-3">
            <CCardHeader className="py-2">
              <strong>Probable Diagnosis / Disease</strong>
            </CCardHeader>
            <CCardBody>
              <div className="fs-6">{diagnosis}</div>
            </CCardBody>
          </CCard>
        )}

        {/* Tests */}
        {tests.length > 0 && (
          <CCard className="shadow-sm mb-3">
            <CCardHeader className="py-2">
              <strong>
                Tests Recommended <span className="text-body-secondary">(with reasons)</span>
              </strong>
            </CCardHeader>
            <CCardBody>
              <ul className="mb-0">
                {tests.map((t, i) => (
                  <li key={`${t || 'test'}-${i}`}>
                    <span className="fw-semibold">{t || '—'}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 mb-2">
                <strong>Reasons</strong>
                <p>{testsReason}</p>
              </div>
            </CCardBody>
          </CCard>
        )}

        {/* Treatments */}
        {treatments.length > 0 && (
          <CCard className="shadow-sm mb-3">
            <CCardHeader className="py-2">
              <strong>
                Treatments <span className="text-body-secondary">(with reasons)</span>
              </strong>
            </CCardHeader>
            <CCardBody>
              <ul className="mb-0">
                {treatments.map((t, i) => (
                  <li key={`${t.name || 'tx'}-${i}`}>
                    <span className="fw-semibold">{t || '—'}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 mb-2">
                <strong>Reasons</strong>
                <p>{treatmentReason}</p>
              </div>
            </CCardBody>
          </CCard>
        )}

        {/* Prescription Table */}
        {medicines.length > 0 && (
          <CCard className="shadow-sm mb-3">
            <CCardHeader className="py-2">
              <strong>Prescription Details</strong>
            </CCardHeader>
            <CCardBody>
              <CTable striped hover responsive className="align-middle">
                <CTableHead>
                  <CTableRow className="bg-primary text-white">
                    <CTableHeaderCell>S.No</CTableHeaderCell>
                    <CTableHeaderCell>Medicine</CTableHeaderCell>
                    <CTableHeaderCell>Dose</CTableHeaderCell>
                    <CTableHeaderCell>Remind When</CTableHeaderCell>
                    <CTableHeaderCell>Note</CTableHeaderCell>
                    <CTableHeaderCell>Duration</CTableHeaderCell>
                    <CTableHeaderCell>Time</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {medicines.map((item, idx) => (
                    <CTableRow key={item.id ?? idx}>
                      <CTableDataCell>{idx + 1}</CTableDataCell>
                      <CTableDataCell>{item.name || '—'}</CTableDataCell>
                      <CTableDataCell>{item.dose || '—'}</CTableDataCell>
                      <CTableDataCell>{item.remindWhen || '—'}</CTableDataCell>
                      <CTableDataCell>
                        <div className="text-truncate" style={{ maxWidth: 220 }}>
                          {item.note || '—'}
                        </div>
                      </CTableDataCell>
                      <CTableDataCell>{item.duration || '—'}Days</CTableDataCell>
                      <CTableDataCell>{item.times || '—'} </CTableDataCell>
                      <CTableDataCell className="text-end">
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </button>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        )}

        {/* Follow-up Plan */}
        {followUp.durationValue != 'NA' && (
          <CCard className="shadow-sm mb-4">
            <CCardHeader className="py-2">
              <strong>Follow-up Plan</strong>
            </CCardHeader>
            <CCardBody>
              <CCol xs={12} md={6}>
                <div>
                  <span className="fw-semibold">Next Follow Up :</span>{' '}
                  {followUp.durationValue !== 0 ? (
                    <>
                      After{' '}
                      <span>
                        {followUp.durationValue} {followUp.durationUnit}
                      </span>
                    </>
                  ) : (
                    '—'
                  )}
                  {followUp.date !== '—' ? <> ({followUp.date})</> : null}
                </div>
              </CCol>
              <CCol xs={12}>
                <div>
                  <span className="fw-semibold">Follow Up Note:</span>{' '}
                  <span style={{ whiteSpace: 'pre-wrap' }}>{followUp.note}</span>
                </div>
              </CCol>
            </CCardBody>
          </CCard>
        )}
      </CContainer>

      {/* Sticky Bottom Bar */}
      <div
        className="position-fixed bottom-0"
        style={{
          left: sidebarWidth ? `${sidebarWidth}px` : 0,
          width: sidebarWidth ? `calc(100vw - ${sidebarWidth}px)` : '100vw',
          backgroundColor: '#F3f3f7',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 16,
          padding: 12,
        }}
      >
        <div className="d-flex gap-2 mx-4 justify-content-between w-75">
          <Button customColor={COLORS.secondary} onClick={onSaveTemplate}>
            Save Prescription Template
          </Button>
          <div className="d-flex gap-2">
            <Button
              onClick={() => {
                setPendingAction(ACTIONS.SAVE)
                setShowTemplateModal(true)
              }}
            >
              Save
            </Button>
            <Button
              customColor={COLORS.success}
              onClick={() => {
                setPendingAction(ACTIONS.SAVE_PRINT)
                setShowTemplateModal(true)
              }}
            >
              Save & Print
            </Button>
            <PDFDownloadLink
  document={<PrescriptionPDF doctorData={doctorDetails} clicniData={clinicDetails} formData={formData}  patientData={patientData}/>}
  fileName="prescription.pdf"
>
  {({ blob, url, loading, error }) =>
    loading ? 'Generating PDF...' : 'Download PDF'
  }
</PDFDownloadLink>
          </div>

          {showTemplateModal && (
            <div
              className="vh-modal-backdrop"
              role="dialog"
              aria-modal="true"
              aria-label="Save as template?"
            >
              <div className="vh-modal">
                <h6 className="mb-2">Save this as a template?</h6>
                <p className="muted mb-3">
                  You can reuse this prescription layout later for faster entry.
                </p>
                <div className="d-flex gap-2 justify-content-end">
                  <Button onClick={skipTemplate}>No, just continue</Button>
                  <Button customColor={COLORS.secondary} onClick={confirmSaveAsTemplate}>
                    Yes, save as template
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {snackbar.show && <Snackbar message={snackbar.message} type={snackbar.type} />}
    </div>
  )
}

export default Summary
