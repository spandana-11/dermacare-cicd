import React, { useRef, useState } from 'react'
import Button from '../components/CustomButton/CustomButton'
import { COLORS } from '../Themes'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CForm,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CRow,
  CContainer,
} from '@coreui/react'
import GradientTextCard from '../components/GradintColorText'

const availableTestTreatments = [
  'NA',
  'Chemical Peel',
  'Microdermabrasion',
  'Laser Hair Reduction',
  'PRP Therapy',
  'Microneedling',
  'HydraFacial',
  'Skin Rejuvenation',
]

/**
 * Props:
 * - onNext?: (payload) => void
 * - sidebarWidth?: number
 */
const TestTreatments = ({ seed = {}, onNext, sidebarWidth = 0 }) => {
  const [selectedTestTreatments, setSelectedTestTreatments] = useState(
    seed.selectedTestTreatments ?? [],
  )
  const [treatmentReason, setTreatmentReason] = useState(seed.treatmentReason ?? '')
  const [selectedTreatmentOption, setSelectedTreatmentOption] = useState('')
  const [snackbar, setSnackbar] = useState({ show: false, message: '', type: '' })
  const [isGenerating, setIsGenerating] = useState(false)

  // (Optional) printable ref; currently using a new window like in your Tests
  const printRef = useRef(null)

  const showSnackbar = (message, type) => {
    setSnackbar({ show: true, message, type })
    setTimeout(() => setSnackbar({ show: false, message: '', type: '' }), 3000)
  }

  const handleAddTreatment = (e) => {
    const value = e.target.value
    setSelectedTreatmentOption(value)
    if (!value) return
    if (selectedTestTreatments.includes(value)) {
      showSnackbar('Treatment already added', 'warning')
    } else {
      setSelectedTestTreatments((prev) => [...prev, value])
    }
    setSelectedTreatmentOption('')
  }

  const handleRemoveTreatment = (item) => {
    setSelectedTestTreatments((prev) => prev.filter((t) => t !== item))
  }

  const clearAllTestTreatments = () => {
    setSelectedTestTreatments([])
  }

  const handleNext = () => {
    const payload = { selectedTestTreatments, treatmentReason }
    console.log(payload)
    onNext?.(payload)
  }

  const optionsToShow = availableTestTreatments.filter((t) => !selectedTestTreatments.includes(t))

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
          <CCol xs={12}>
            <CCard className="h-100">
              <CCardBody>
                <CForm>
                  <CRow className="g-3">
                    {/* Dropdown */}
                    <CCol xs={12} md={6}>
                      <CFormLabel className="label">
                        <GradientTextCard text="Recommended Treatments (Optional)" />
                      </CFormLabel>
                      <CFormSelect value={selectedTreatmentOption} onChange={handleAddTreatment}>
                        <option value="">Select Treatments...</option>
                        {optionsToShow.map((treatment) => (
                          <option key={treatment} value={treatment}>
                            {treatment}
                          </option>
                        ))}
                      </CFormSelect>
                      {/* <div className="text-body-secondary small mt-1">Choose from common Testtreatments. Duplicates are ignored.</div> */}
                    </CCol>

                    {/* Selected chips */}
                    <CCol xs={12} md={5}>
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <GradientTextCard text="Selected Treatments" />
                        {selectedTestTreatments.length > 0 && (
                          <Button
                            customColor={COLORS.orange}
                            size="small"
                            onClick={clearAllTestTreatments}
                            title="Remove all"
                          >
                            Clear all
                          </Button>
                        )}
                      </div>

                      {selectedTestTreatments.length === 0 ? (
                        <div className="text-body-secondary small">
                          No Testtreatments selected yet.
                        </div>
                      ) : (
                        <div className="d-flex flex-wrap gap-2">
                          {selectedTestTreatments.map((t) => (
                            <div
                              key={t}
                              className="d-inline-flex align-items-center px-2 py-1 border rounded bg-body-secondary"
                              style={{ lineHeight: 1 }}
                            >
                              <span className="me-2">{t}</span>
                              <button
                                type="button"
                                className="btn btn-sm p-0 text-body"
                                aria-label={`Remove ${t}`}
                                onClick={() => handleRemoveTreatment(t)}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CCol>
                  </CRow>

                  {/* Reason */}
                  <CRow className="g-3 mt-1">
                    <CCol xs={12}>
                      <GradientTextCard text="Reason for Recommendation (Optional)" />
                      <CFormTextarea
                        className="mt-2"
                        rows={5}
                        value={treatmentReason}
                        onChange={(e) => setTreatmentReason(e.target.value)}
                        placeholder="Explain why these Treatments are recommended…"
                      />
                    </CCol>
                  </CRow>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>

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
          <Button color="primary" onClick={handleNext}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TestTreatments
