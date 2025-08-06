import React, { useRef, useState } from 'react'
import Button from '../components/CustomButton/CustomButton'
import './Tests.css'
import { COLORS } from '../Themes'
import html2pdf from 'html2pdf.js' // <-- add this import
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CRow,
  CContainer,
} from '@coreui/react'
import GradientTextCard from '../components/GradintColorText'
const availableTests = [
  'KOH Mount',
  'CBC',
  'TSH',
  'ANA Test',
  'Vitamin D',
  'Thyroid Profile',
  'Liver Function Test',
]

/**
 * Props:
 * - onNext?: (payload) => void
 * - sidebarWidth?: number
 * - patientName?: string
 * - doctor?: { name?: string, regNo?: string, clinic?: string, phone?: string }
 */
const Tests = ({ seed = {}, onNext, sidebarWidth = 0 }) => {
  const [selectedTests, setSelectedTests] = useState(seed.selectedTests ?? [])
  const [testReason, setTestReason] = useState(seed.testReason ?? '')
  const [selectedTestOption, setSelectedTestOption] = useState('')
  const [snackbar, setSnackbar] = useState({ show: false, message: '', type: '' })
  const [isGenerating, setIsGenerating] = useState(false)
  // print container ref
  const printRef = useRef(null)

  const showSnackbar = (message, type) => {
    setSnackbar({ show: true, message, type })
    setTimeout(() => setSnackbar({ show: false, message: '', type: '' }), 3000)
  }

  const handleAddTest = (e) => {
    const value = e.target.value
    if (!value) return

    if (selectedTests.includes(value)) {
      showSnackbar('Test already added', 'warning')
    } else {
      setSelectedTests((prev) => [...prev, value])
    }

    setSelectedTestOption('') // reset dropdown to "NA"
  }

  const handleRemoveTest = (item) => {
    setSelectedTests((prev) => prev.filter((t) => t !== item))
  }

  const handleNext = () => {
    const payload = { selectedTests, testReason }
    onNext?.(payload)
  }
  const patientName = 'Vaishnavi'
  const doctorInfo = {
    name: 'Dr. Haanvika',
    regNo: 'TS/MD/2024/12345',
    clinic: 'Derma Care Hospital',
    address: '123 Health Street, Wellness City, India',
    phone: '+91 9876543210',
  }
  const optionsToShow = availableTests.filter((t) => !selectedTests.includes(t))
  const handlePrint = () => {
    const today = new Date()
    const dateStr = today.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

    const testsHtml = selectedTests.length
      ? `<ul class="test-list">${selectedTests.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>`
      : `<p class="muted">No tests selected.</p>`

    const reasonHtml = testReason?.trim()
      ? `<div class="section">
         <h3 class="section-title">Reason for Recommendation</h3>
         <p>${escapeHtml(testReason)}</p>
       </div>`
      : ''

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Test Report – ${escapeHtml(patientName)}</title>
  <style>
    :root {
      --border: #d1d5db;
      --text: #111827;
      --muted: #6b7280;
      --heading: #1f2937;
      --accent: #3b82f6;
    }
    * { box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', sans-serif;
      padding: 32px;
      font-size: 16px;
      color: var(--text);
      line-height: 1.6;
    }

    header {
      display: flex;
      align-items: center;
      border-bottom: 2px solid var(--border);
      padding-bottom: 16px;
      margin-bottom: 24px;
    }

    .logo {
      font-weight: bold;
      font-size: 28px;
      color: var(--accent);
      background: #e0f2fe;
      padding: 12px;
      border-radius: 10px;
      margin-right: 16px;
    }

    .clinic-info {
      display: flex;
      flex-direction: column;
    }

    .clinic-name {
      font-size: 20px;
      font-weight: bold;
      color: var(--heading);
    }

    .clinic-address {
      font-size: 14px;
      color: var(--muted);
    }

    .row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .label {
      font-size: 13px;
      color: var(--muted);
    }

    .value {
      font-weight: 600;
    }

    .section {
      margin-top: 24px;
    }

    .section-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 8px;
      color: var(--heading);
    }

    .test-list {
      padding-left: 20px;
      margin: 0;
    }

    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: var(--muted);
    }

    @media print {
      .no-print {
        display: none;
      }
      body {
        padding: 10mm;
      }
    }
  </style>
</head>
<body>
  <header>
    <div class="logo">DC</div>
    <div class="clinic-info">
      <div class="clinic-name">${escapeHtml(doctorInfo.clinic)}</div>
      <div class="clinic-address">${escapeHtml(doctorInfo.address)} | ${escapeHtml(doctorInfo.phone)}</div>
    </div>
  </header>

  <div class="row">
    <div>
      <div class="label">Patient Name</div>
      <div class="value">${escapeHtml(patientName)}</div>
    </div>
    <div>
      <div class="label">Date</div>
      <div class="value">${escapeHtml(dateStr)}</div>
    </div>
  </div>

  <div class="row">
    <div>
      <div class="label">Doctor</div>
      <div class="value">${escapeHtml(doctorInfo.name)}</div>
    </div>
    <div>
      <div class="label">Reg. No</div>
      <div class="value">${escapeHtml(doctorInfo.regNo)}</div>
    </div>
  </div>

  <div class="section">
    <h3 class="section-title">Recommended Tests</h3>
    ${testsHtml}
  </div>

  ${reasonHtml}

  <div class="footer">
    <div>Generated on ${escapeHtml(dateStr)}</div>
    <div>${escapeHtml(doctorInfo.clinic)}</div>
  </div>

  <div class="no-print" style="margin-top: 16px;">
    <button onclick="window.print()">Print</button>
  </div>
</body>
</html>
  `

    const win = window.open('', '_blank', 'width=900,height=700')
    if (!win) {
      alert('Please allow pop-ups to print.')
      return
    }
    win.document.open()
    win.document.write(html)
    win.document.close()
    win.onload = () => {
      win.focus()
      win.print()
    }
  }

  // Escapes HTML entities
  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }
  const clearAllTests = () => {
    // if you need confirmation:
    // if (!window.confirm('Remove all selected tests?')) return;
    setSelectedTests([]) // or your state updater
  }

  return (
    <div className="tests-wrapper pb-5">
      {/* Snackbar */}
      {snackbar.show && (
        <CAlert
          color={snackbar.type === 'error' ? 'danger' : snackbar.type || 'info'}
          className="mb-2"
        >
          {snackbar.message}
        </CAlert>
      )}

      <CContainer fluid className="p-0">
        <CRow className="g-3">
          {/* Left: Form area */}
          <CCol xs={12} lg={12}>
            <CCard className="h-100">
              <CCardBody>
                <CForm>
                  {/* Row: Recommended Test (left) + Selected Tests (right) */}
                  <CRow className="g-3">
                    {/* Recommended Test */}
                    <CCol xs={12} md={6}>
                      <CFormLabel className="label">
                        <GradientTextCard text={'Recommended Test (Optional)'} />
                      </CFormLabel>
                      <CFormSelect value={selectedTestOption} onChange={handleAddTest}>
                        <option value="dfkdsjf">NA</option>
                        {optionsToShow.map((test) => (
                          <option key={test} value={test}>
                            {test}
                          </option>
                        ))}
                      </CFormSelect>
                      {/* <div className="text-body-secondary small mt-1">
                        Choose from common tests; duplicates are ignored.
                      </div> */}
                    </CCol>

                    {/* Selected tests chips */}
                    <CCol xs={12} md={5}>
                      <div className="d-flex align-items-center justify-content-between mb-1 p-0">
                        <GradientTextCard text={'Selected Tests'} />
                        {/* Clear all button (hidden when empty) */}
                        {selectedTests.length > 0 && (
                          <Button
                            customColor={COLORS.orange}
                            size="small"
                            variant="outline"
                            onClick={clearAllTests}
                            title="Remove all selected tests"
                          >
                            Clear all
                          </Button>
                        )}
                      </div>

                      {selectedTests.length === 0 ? (
                        <div className="text-body-secondary small">No tests selected yet.</div>
                      ) : (
                        <div className="d-flex flex-wrap gap-2">
                          {selectedTests.map((test) => (
                            <div
                              key={test}
                              className="d-inline-flex align-items-center px-2 py-1 border rounded bg-body-secondary"
                              style={{ lineHeight: 1 }}
                            >
                              {/* Chip text */}
                              <span className="me-2">{test}</span>

                              {/* Close (remove) button with keyboard support */}
                              <button
                                type="button"
                                aria-label={`Remove ${test}`}
                                className="btn btn-sm   p-0 text-body"
                                onClick={() => handleRemoveTest(test)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    handleRemoveTest(test)
                                  }
                                }}
                                title={`Remove ${test}`}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CCol>
                  </CRow>

                  {/* Reason (full width) */}
                  <CRow className="g-3 mt-1">
                    <CCol xs={12}>
                      <GradientTextCard text={'Reason for Recommendation (Optional)'} />

                      <CFormTextarea
                        className="mt-2"
                        rows={5}
                        value={testReason}
                        onChange={(e) => setTestReason(e.target.value)}
                        placeholder="Explain why these tests are recommended…"
                      />
                    </CCol>
                  </CRow>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>

        </CRow>
      </CContainer>

      {/* Off-screen printable block (kept as-is for fidelity) */}
      <div
        ref={printRef}
        id="tests-print"
        style={{
          position: 'absolute',
          left: '-99999px',
          top: 0,
          width: '794px',
          background: '#fff',
          padding: '16px',
        }}
      >
        <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: 8, marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{doctorInfo?.clinic || 'Clinic'}</div>
          <div style={{ fontSize: 13 }}>
            {doctorInfo?.name || ''} • Reg. No: {doctorInfo?.regNo || ''}
          </div>
          <div style={{ fontSize: 13 }}>{doctorInfo?.phone || ''}</div>
        </div>

        <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <strong>Patient:</strong> {doctorInfo?.patientName || '-'}
          </div>
          <div>
            <strong>Date:</strong>{' '}
            {new Date().toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Recommended Tests</div>
          {selectedTests?.length ? (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {selectedTests.map((t) => (
                <li key={t} style={{ marginBottom: 4, fontSize: 14 }}>
                  {t}
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ fontSize: 14, color: '#6b7280' }}>No tests selected.</div>
          )}
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Reason</div>
          <div style={{ whiteSpace: 'pre-wrap', fontSize: 14 }}>{testReason || '—'}</div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="position-fixed bottom-0"
        style={{
          left: 0,
          right: 0,

          backgroundColor: '#F3f3f7',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 16,
          padding: 8,
        }}
      >
        <div className="d-flex gap-3">
          <Button customColor={COLORS.success} onClick={handlePrint} disabled={isGenerating}>
            {isGenerating ? 'Printing…' : 'Print'}
          </Button>
          <Button color="primary" onClick={handleNext}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Tests
