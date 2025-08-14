import React, { useState, useEffect } from 'react'
import './VisitHistory.css'
import GradientTextCard from '../components/GradintColorText'
import FileUploader from './FileUploader'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CImage,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { getVisitHistoryByPatientIdAndDoctorId } from '../Auth/Auth'

// Accordion component stays same
const AccordionItem = ({ id, title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="vh-acc-item">
      <button
        className="vh-acc-header"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        id={`${id}-button`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="vh-acc-title">{title}</span>
        <span className="vh-acc-icon">{open ? '−' : '+'}</span>
      </button>
      <div
        className={`vh-acc-panel ${open ? 'open' : ''}`}
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-button`}
      >
        {children}
      </div>
    </div>
  )
}

// Helper to transform API visit to expected shape
// Helper: normalize anything to an array of strings
const normalizeAttachments = (raw) => {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.filter(Boolean)
  if (typeof raw === 'string') {
    // some APIs send comma-separated names/paths/base64
    return raw
      .split(',')
      .map((s) => s && s.trim())
      .filter(Boolean)
  }
  return []
}
const freqLabel = (f) => {
  switch ((f || '').toLowerCase()) {
    case 'day':
      return 'Daily'
    case 'week':
      return 'Weekly'
    case 'month':
      return 'Monthly'
    default:
      return f ? f[0].toUpperCase() + f.slice(1) : '—'
  }
}

const transformVisit = (visit) => {
  // --- symptoms -> strings ---
  const symptomsArr = []
  if (visit.symptoms) {
    if (visit.symptoms.symptomDetails) symptomsArr.push(visit.symptoms.symptomDetails)
    if (visit.symptoms.doctorObs)
      symptomsArr.push(`Doctor's Observation: ${visit.symptoms.doctorObs}`)
    if (visit.symptoms.diagnosis) symptomsArr.push(`Diagnosis: ${visit.symptoms.diagnosis}`)
    if (visit.symptoms.duration) symptomsArr.push(`Duration: ${visit.symptoms.duration}`)
  }

  // --- tests ---
  const testsArr = (visit.tests?.selectedTests || []).map((testName) => ({
    name: testName,
  }))
  const testsReason = visit.tests?.testReason || ''
  const prescriptionPdf = visit.prescriptionPdf || []

  // --- treatments (your current API shows selectedTreatment/generateData,
  // keep existing mapping; if nothing, this will be empty which is fine) ---
  // --- treatments: derive names from selectedTestTreatments or from generatedData keys ---
  const rawSchedules = visit.treatments?.generatedData || {}
  const selectedTreatments =
    visit.treatments?.selectedTestTreatments ||
    visit.treatments?.selectedTreatments ||
    Object.keys(rawSchedules) ||
    []

  // normalize schedules to a consistent shape
  const treatmentSchedules = Object.fromEntries(
    Object.entries(rawSchedules).map(([name, meta]) => [
      name,
      {
        reason: meta?.reason || '',
        frequency: meta?.frequency || '',
        sittings: Number(meta?.sittings) || 0,
        startDate: meta?.startDate || '',
        dates: Array.isArray(meta?.dates) ? meta.dates : [],
      },
    ]),
  )

  // treatments list for the bullet list (reason optional)
  const treatmentsArr = selectedTreatments.filter(Boolean).map((name) => ({
    name,
    reason: treatmentSchedules?.[name]?.reason || '', // keep if you want per-treatment reason
  }))

  // --- prescription ---
  const prescriptionArr = (visit.prescription?.medicines || []).map((med) => ({
    medicine: med.name,
    dose: med.dose,
    frequency: med.remindWhen || '',
    food: med.food,
    duration: med.duration,
    notes: med.note,
    times: med.times,
  }))

  // --- attachments (THIS is the important part) ---
  // Your data shows: visit.symptoms.attachments = [ "�PNG...", "�PNG..." ]
  const attachmentsFromSymptoms = normalizeAttachments(visit.symptoms?.attachments)

  // also include symptoms.reports if your backend uses that for a single base64 image
  const attachmentsFromReports = visit.symptoms?.reports
    ? [visit.symptoms.reports] // let FileUploader detect type/base64/binary
    : []

  // date / title
  const d = new Date(visit.visitDateTime)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const visitNumTitle = `${visit.visitType?.replace('_', ' ') || 'VISIT'} (${day}–${month}–${year})`

  return {
    id: visit.id,
    title: visitNumTitle,
    symptoms: symptomsArr,
    diagnosis: visit.symptoms?.diagnosis || '',
    tests: testsArr,
    testsReason,
    treatments: treatmentsArr,
    treatmentSchedules,
    prescription: prescriptionArr,
    prescriptionPdf: prescriptionPdf,
    // expose attachments for the UI
    attachments: [...attachmentsFromSymptoms, ...attachmentsFromReports],
  }
}

// Helper for reports date formatting (dd-mm-yyyy)
const transformDateForReport = (dateString) => {
  if (!dateString) return ''
  const d = new Date(dateString)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}-${mm}-${yyyy}`
}

const VisitHistory = ({ patientId, doctorId }) => {
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!patientId || !doctorId) return

    const fetchData = async () => {
      setLoading(true)
      console.log('callingsahdjs')
      try {
        const response = await getVisitHistoryByPatientIdAndDoctorId(patientId, doctorId)
        if (response.status == 200) {
          const transformedVisits = (response.data.visitHistory || []).map(transformVisit)
          setVisits(transformedVisits)
          setLoading(false)
        }
      } catch (e) {
        console.log(e)

        setError(e.message || 'Failed to fetch visit history')
        setVisits([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [patientId, doctorId])

  if (loading) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: '60vh' }}
      >
        <CSpinner className="me-2" size="sm" />
        <span>Loading visit history...</span>
      </div>
    )
  }

  if (error) return <div>{error}</div>
  if (!visits.length) return <div>No visit history available</div>
  const toInitials = (input, sep = ', ') => {
    if (!input) return ''

    let tokens = []
    if (Array.isArray(input)) {
      tokens = input
    } else {
      const s = String(input).trim()
      if (s.includes(',') || s.includes('|') || /\s/.test(s)) {
        tokens = s.split(/[,|\s]+/)
      } else {
        tokens = s.match(/morning|afternoon|evening|night/gi) || [s]
      }
    }

    const map = {
      morning: 'M',
      m: 'M',
      afternoon: 'A',
      a: 'A',
      evening: 'E',
      e: 'E',
      night: 'N',
      n: 'N',
    }

    return tokens
      .map((t) => map[t.toLowerCase()] ?? (t[0]?.toUpperCase() || ''))
      .filter(Boolean)
      .join(sep)
  }

  return (
    <div className="visit-history">
      <h4 className="visit-title">Visit History</h4>

      <div className="vh-accordion pb-5">
        {visits.map((v, idx) => (
          <AccordionItem key={v.id} id={v.id} title={v.title} defaultOpen={idx === 0}>
            {/* Symptoms */}
            <h6 className="section-title">Patient-Provided Symptoms</h6>
            <p className="symptoms-text">
              {v.symptoms.map((s, i) => (
                <span key={i}>
                  {s}
                  {i < v.symptoms.length - 1 && (
                    <>
                      <br />
                    </>
                  )}
                </span>
              ))}
            </p>

            {/* Diagnosis */}
            <div className="section">
              <h6 className="section-title">Probable Diagnosis / Disease</h6>
              <p className="diagnosis">{v.diagnosis}</p>
            </div>

            {/* Nested accordion: Tests, Treatments, Reports, Prescription */}
            <div className="vh-accordion" style={{ marginTop: 10 }}>
              <AccordionItem
                id={`${v.id}-tests`}
                title="Tests Recommended (With Reasons)"
                defaultOpen
              >
                {v.tests?.length ? (
                  <>
                    <ul className="item-list">
                      {v.tests.map((t, i) => (
                        <li key={i}>
                          <span style={{ fontWeight: 600 }}>{t.name}</span>
                        </li>
                      ))}
                    </ul>

                    {v.testsReason && (
                      <div className="mt-2">
                        <strong>Reason:</strong> {v.testsReason}
                      </div>
                    )}
                  </>
                ) : (
                  <p>No tests recommended</p>
                )}
              </AccordionItem>

              <AccordionItem
                id={`${v.id}-treatments`}
                title="Treatments (With Reasons)"
                defaultOpen={false}
              >
                {v.treatments?.length ? (
                  <>
                    <ul className="item-list">
                      {v.treatments.map((t, i) => (
                        <li key={i}>
                          <span style={{ fontWeight: 600 }}>{t.name}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Schedule block inside the same accordion */}
                    {v.treatmentSchedules && Object.keys(v.treatmentSchedules).length > 0 && (
                      <div className="mt-3">
                        {Object.entries(v.treatmentSchedules).map(([name, meta]) => (
                          <CCard key={name} className="mb-3 p-2">
                            <div style={{ fontWeight: 'bold' }}>
                              {name} — {freqLabel(meta?.frequency)} ({meta?.sittings ?? 0} sittings
                              from {meta?.startDate || '—'})
                            </div>

                            <div className="mt-2 table-responsive">
                              <table className="table table-sm mb-0">
                                <thead className="table-light">
                                  <tr>
                                    <th style={{ width: '8%' }}>#</th>
                                    <th style={{ width: '46%' }}>Date</th>
                                    <th style={{ width: '46%' }}>Sitting</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(meta?.dates || []).map((d, i) => (
                                    <tr key={`${name}-row-${i}`}>
                                      <td>{i + 1}</td>
                                      <td>{d?.date ?? '—'}</td>
                                      <td>{d?.sitting ?? '—'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {meta?.reason ? (
                              <div className="mt-2">
                                <strong>Reason:</strong> {meta.reason}
                              </div>
                            ) : null}
                          </CCard>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p>No treatments available</p>
                )}
              </AccordionItem>

              <AccordionItem id={`${v.id}-prescription`} title="Prescription" defaultOpen={false}>
                {v.prescription.length > 0 && (
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
                            {/* <CTableHeaderCell className="text-end">Action</CTableHeaderCell> */}
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {v.prescription.map((item, idx) => {
                            const timings = toInitials(item?.times, ', ')

                            return (
                              <CTableRow key={item.id ?? idx}>
                                <CTableDataCell>{idx + 1}</CTableDataCell>
                                <CTableDataCell>{item.medicine || '—'}</CTableDataCell>
                                <CTableDataCell>{item.dose || '—'}</CTableDataCell>
                                <CTableDataCell>{item.frequency || '—'}</CTableDataCell>
                                <CTableDataCell>
                                  <div className="text-truncate" style={{ maxWidth: 220 }}>
                                    {item.notes || '—'}
                                  </div>
                                </CTableDataCell>
                                <CTableDataCell>
                                  {item.duration ? `${item.duration} Days` : '—'}
                                </CTableDataCell>
                                <CTableDataCell>{timings || '—'}</CTableDataCell>
                              </CTableRow>
                            )
                          })}
                        </CTableBody>
                      </CTable>
                    </CCardBody>
                  </CCard>
                )}
              </AccordionItem>
              <AccordionItem
                id={`${v.id}-reports`}
                title="Reports & Prescription"
                defaultOpen={false}
                className="mb-5 pb-5"
              >
                <div style={{ marginTop: 10 }}>
                  {Array.isArray(v.attachments) && v.attachments.length ? (
                    <FileUploader label="Past Reports" attachments={v.attachments} />
                  ) : (
                    <p>No reports available</p>
                  )}
                </div>
                <div style={{ marginTop: 10 }}>
                  {Array.isArray(v.prescriptionPdf) && v.prescriptionPdf.length && (
                    <FileUploader label="Prescription" attachments={v.prescriptionPdf} />
                  )}
                </div>
              </AccordionItem>
            </div>
          </AccordionItem>
        ))}
      </div>
    </div>
  )
}

export default VisitHistory
