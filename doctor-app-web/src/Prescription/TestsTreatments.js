import React, { useEffect, useState } from 'react'
import {
  CAlert,
  CAccordion,
  CAccordionBody,
  CAccordionHeader,
  CAccordionItem,
  CCol,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CRow,
  CContainer,
} from '@coreui/react'
import Select from 'react-select'
import GradientTextCard from '../components/GradintColorText'
import Button from '../components/CustomButton/CustomButton'
import { COLORS } from '../Themes'
import { getAllTreatments, getAllTreatmentsByHospital } from '../../src/Auth/Auth'
import CIcon from '@coreui/icons-react'
import { cilTrash } from '@coreui/icons'
import './TestsTreatments.css'
const DEFAULT_CFG = { frequency: 'day', sittings: 1, startDate: '', reason: '' }

const TestTreatments = ({ seed = {}, onNext }) => {
  const [selectedTestTreatments, setSelectedTestTreatments] = useState(
    seed.selectedTestTreatments ?? [],
  )
  const [snackbar, setSnackbar] = useState({ show: false, message: '', type: '' })
  // at the top of the component, before any return
  const [activeIdx, setActiveIdx] = React.useState(0) // open first by default
  const [selectedTreatmentOption, setSelectedTreatmentOption] = useState(null)

  // Per-treatment inputs (now includes reason)
  const [treatmentConfigs, setTreatmentConfigs] = useState(
    (seed.selectedTestTreatments || []).reduce((acc, t) => {
      acc[t] = { ...DEFAULT_CFG }
      return acc
    }, {}),
  )

  const [generatedData, setGeneratedData] = useState(
    seed.generatedData && typeof seed.generatedData === 'object' ? seed.generatedData : {},
  )
  const [treatmentReason, setTreatmentReason] = useState(seed.treatmentReason ?? '')

  // to avoid repeated re-init if parent recreates `seed` object every render
  const [initializedFromSeed, setInitializedFromSeed] = useState(false)

  const [availableTreatments, setAvailableTreatments] = useState([])
  const optionsToShow = availableTreatments
    .map((t) => t.treatmentName)
    .filter((name) => !selectedTestTreatments.includes(name))

  const showSnackbar = (message, type = 'info') => {
    setSnackbar({ show: true, message, type })
    setTimeout(() => setSnackbar({ show: false, message: '', type: '' }), 3000)
  }

  // Derived flags (DO NOT store as state)
  const hasPendingCards = selectedTestTreatments.some((t) => !generatedData[t])
  const hasAnyTable = Object.keys(generatedData).length > 0
  // If you want the stricter rule, use this instead on the button:
  // const nextDisabled = hasPendingCards || !hasAnyTable

  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        const treatments = await getAllTreatmentsByHospital()
        if (Array.isArray(treatments)) setAvailableTreatments(treatments)
      } catch (error) {
        console.error('Error fetching treatments:', error)
      }
    }
    fetchTreatments()
  }, [])

  // Initialize from seed ONCE (prevents loops when parent recreates objects)
  useEffect(() => {
    if (initializedFromSeed) return

    const fromSeedList = Array.isArray(seed.selectedTestTreatments)
      ? seed.selectedTestTreatments
      : []
    const fromTables =
      seed.generatedData && typeof seed.generatedData === 'object'
        ? Object.keys(seed.generatedData)
        : []

    const merged = Array.from(new Set([...fromSeedList, ...fromTables]))

    setSelectedTestTreatments(merged)
    setGeneratedData(
      seed.generatedData && typeof seed.generatedData === 'object' ? seed.generatedData : {},
    )

    setTreatmentConfigs((prev) => {
      const next = { ...prev }
      merged.forEach((name) => {
        if (!next[name]) next[name] = { ...DEFAULT_CFG }
      })
      return next
    })

    setTreatmentReason(seed.treatmentReason ?? '')
    setInitializedFromSeed(true)
  }, [seed, initializedFromSeed])

  const addTreatment = (value) => {
    if (!value) return
    if (selectedTestTreatments.includes(value)) {
      showSnackbar('Treatment already added', 'warning')
      return
    }
    setSelectedTestTreatments((prev) => [...prev, value])
    setTreatmentConfigs((prev) => ({ ...prev, [value]: { ...DEFAULT_CFG } }))
  }

  const handleAddTreatment = (eOrObj) => {
    const value = eOrObj?.target?.value
    addTreatment(value)
  }

  const removeTreatment = (t) => {
    setSelectedTestTreatments((prev) => prev.filter((x) => x !== t))
    setTreatmentConfigs((prev) => {
      const next = { ...prev }
      delete next[t]
      return next
    })
    setGeneratedData((prev) => {
      const next = { ...prev }
      delete next[t]
      return next
    })
    setSelectedTreatmentOption(null) // 🔑 clear the dropdown
  }


  const updateCfg = (t, field, value) => {
    setTreatmentConfigs((prev) => ({
      ...prev,
      [t]: {
        ...prev[t],
        [field]: field === 'sittings' ? Number(value || 0) : value,
      },
    }))
  }

  const editSchedule = (t) => {
    setGeneratedData((prev) => {
      const meta = prev[t]
      if (!meta) return prev

      // Derive sensible defaults from the existing table
      const firstDate = meta.startDate || (Array.isArray(meta.dates) && meta.dates[0]?.date) || ''
      const sittings =
        typeof meta.sittings === 'number'
          ? meta.sittings
          : Array.isArray(meta.dates)
            ? meta.dates.length
            : 1

      // Pre-fill the input card with the existing config
      setTreatmentConfigs((cfgPrev) => ({
        ...cfgPrev,
        [t]: {
          frequency: meta.frequency || 'day',
          sittings,
          startDate: firstDate,
          reason: meta.reason || '',
        },
      }))

      // Remove the table so the input card shows up again
      const next = { ...prev }
      delete next[t]
      return next
    })

    // Make sure the treatment appears in the selected list (just in case)
    setSelectedTestTreatments((list) => (list.includes(t) ? list : [...list, t]))
  }

  const generateForTreatment = (t) => {
    const cfg = treatmentConfigs[t] || DEFAULT_CFG
    const { frequency, sittings, startDate, reason } = cfg

    if (!startDate || !sittings || sittings < 1) {
      showSnackbar(`Fill start date and sittings for "${t}"`, 'danger')
      return
    }

    const start = new Date(startDate)
    const dates = []
    for (let i = 0; i < sittings; i++) {
      const next = new Date(start)
      if (frequency === 'day') next.setDate(start.getDate() + i)
      if (frequency === 'week') next.setDate(start.getDate() + i * 7)
      if (frequency === 'month') next.setMonth(start.getMonth() + i)
      dates.push({ date: next.toISOString().split('T')[0], sitting: i + 1 })
    }

    // Save only this treatment’s schedule
    setGeneratedData((prev) => ({
      ...prev,
      [t]: { frequency, sittings, startDate, reason, dates },
    }))

    // Clear inputs and hide the card (card is hidden because we conditionally render it when no table exists)
    setTreatmentConfigs((prev) => ({
      ...prev,
      [t]: { ...DEFAULT_CFG },
    }))
  }

  const deleteSchedule = (t) => {
    // remove table
    setGeneratedData((prev) => {
      const next = { ...prev }
      delete next[t]
      return next
    })

    // remove from selected list so no input card shows again
    setSelectedTestTreatments((prev) => prev.filter((x) => x !== t))

    // drop any stored config for that treatment
    setTreatmentConfigs((prev) => {
      const next = { ...prev }
      delete next[t]
      return next
    })

    showSnackbar(`Removed "${t}"`, 'info')
  }

  const handleNext = () => {
    const payload = {
      selectedTestTreatments: selectedTestTreatments,
      // treatmentReason,
      generatedData, // now includes per-treatment reason too
    }
    console.log(payload)
    onNext?.(payload)
  }

  return (
    <div className="pb-5 treatment-wrapper">
      {snackbar.show && (
        <CAlert color={snackbar.type === 'error' ? 'danger' : snackbar.type} className="mb-3">
          {snackbar.message}
        </CAlert>
      )}

      <CContainer fluid className='p-1'>
        <CRow className="g-3">
          {/* Add Treatments */}
          <CCol md={12} className="g-3" >
            <CFormLabel>
              <GradientTextCard text="Recommended Treatments" />
            </CFormLabel>
            <Select
              options={optionsToShow.map((name) => ({ label: name, value: name }))}
              placeholder="Select Treatments..."
              value={selectedTreatmentOption}
              onChange={(selected) => {
                if (selected) {
                  handleAddTreatment({ target: { value: selected.value } })
                  setSelectedTreatmentOption(null) // reset after adding
                } else {
                  setSelectedTreatmentOption(null)
                }
              }}
              isClearable
              isSearchable
            />

          </CCol>

          {/* Selected Treatments + Per-treatment inputs (hide card if table exists) */}
          <CCol md={12}>
            <CFormLabel>
              <GradientTextCard text="Selected Treatments" />
            </CFormLabel>

            {selectedTestTreatments.length === 0 ? (
              <div className="text-muted">No treatments selected.</div>
            ) : (
              <CCol xl={12} md={12} className="d-flex flex-column gap-3 w-100">
                {selectedTestTreatments.map((t) => {
                  // If a table exists for this treatment, don't show its input card
                  if (generatedData[t]) return null

                  const cfg = treatmentConfigs[t] || DEFAULT_CFG
                  return (
                    <div
                      key={t}
                      className="p-3 border rounded bg-light"
                      style={{ display: 'grid', gap: 12 }}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <strong>{t}</strong>
                        <button
                          className="btn btn-sm btn-link text-danger"
                          onClick={() => removeTreatment(t)}
                        >
                          <CIcon icon={cilTrash} />
                        </button>
                      </div>

                      <div className="row g-3">
                        <div className="col-md-3">
                          <GradientTextCard text="Frequency" />
                          <CFormSelect
                            value={cfg.frequency}
                            onChange={(e) => updateCfg(t, 'frequency', e.target.value)}
                          >
                            <option value="day">Daily</option>
                            <option value="week">Weekly</option>
                            <option value="month">Monthly</option>
                          </CFormSelect>
                        </div>

                        <div className="col-md-3">
                          <GradientTextCard text="Sittings" />
                          <input
                            type="number"
                            className="form-control"
                            min={1}
                            value={cfg.sittings}
                            onChange={(e) => updateCfg(t, 'sittings', e.target.value)}
                          />
                        </div>

                        <div className="col-md-3">
                          <GradientTextCard text="Start Date" />
                          <input
                            type="date"
                            className="form-control"
                            value={cfg.startDate}
                            min={new Date().toISOString().split("T")[0]}   // ✅ disables past dates
                            onChange={(e) => updateCfg(t, "startDate", e.target.value)}
                          />
                        </div>


                        <div className="col-md-12">
                          <GradientTextCard text="Reason (for this treatment)" />
                          <CFormTextarea
                            rows={2}
                            value={cfg.reason}
                            onChange={(e) => updateCfg(t, 'reason', e.target.value)}
                            placeholder={`Why is "${t}" recommended?`}
                          />
                        </div>
                      </div>

                      <div className="mt-2">
                        <Button
                          onClick={() => generateForTreatment(t)}
                          type="button"
                          size="small"
                          variant="outline"
                          sx={{
                            backgroundColor: COLORS.bgcolor,
                            color: COLORS.black,
                            border: "2px solid #000", // add border here

                          }}
                        >
                          Generate Table for {t}
                        </Button>

                      </div>
                    </div>
                  )
                })}
              </CCol>
            )}
          </CCol>

          {/* Generated tables */}
          {Object.keys(generatedData).length > 0 && (
            <CCol md={12} className="mt-4">
              <GradientTextCard text="Treatment Schedule" />

              <CAccordion activeItemKey={activeIdx}>
                {Object.entries(generatedData).map(([treatment, meta], idx) => (
                  <CAccordionItem itemKey={idx} key={treatment}>
                    <CAccordionHeader
                      onClick={(e) => {
                        // keep exactly one open; to allow closing the same one, use the toggle line below
                        e.preventDefault()
                        setActiveIdx(idx)

                        // If you want toggle behavior (clicking the open one closes it), use this instead:
                        // setActiveIdx(prev => (prev === idx ? -1 : idx));
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between w-100">
                        <span>
                          {treatment} —{' '}
                          {meta.frequency === 'day'
                            ? 'Daily'
                            : meta.frequency === 'week'
                              ? 'Weekly'
                              : 'Monthly'}
                        </span>

                        <div className="d-flex align-items-center">
                          <span
                            role="button"
                            tabIndex={0}
                            className="btn btn-sm btn-outline-secondary mx-2"
                            onClick={(e) => {
                              e.stopPropagation()
                              e.preventDefault()
                              editSchedule(treatment)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                e.stopPropagation()
                                editSchedule(treatment)
                              }
                            }}
                            aria-label="Edit this table"
                          >
                            Edit
                          </span>

                          <span
                            role="button"
                            tabIndex={0}
                            className="btn btn-sm btn-outline-danger mx-2"
                            onClick={(e) => {
                              e.stopPropagation()
                              e.preventDefault()
                              deleteSchedule(treatment)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                e.stopPropagation()
                                deleteSchedule(treatment)
                              }
                            }}
                            aria-label="Delete this table"
                          >
                            Delete
                          </span>
                        </div>
                      </div>
                    </CAccordionHeader>

                    <CAccordionBody>
                      {meta.reason && (
                        <div className="mb-3">
                          <strong>Reason:</strong> {meta.reason}
                        </div>
                      )}
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th>S.No</th>
                            <th>Date</th>
                            <th>Sitting</th>
                          </tr>
                        </thead>
                        <tbody>
                          {meta.dates.map(({ date, sitting }, i) => (
                            <tr key={i}>
                              <td>{i + 1}</td>
                              <td>{date}</td>
                              <td>{sitting}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CAccordionBody>
                  </CAccordionItem>
                ))}
              </CAccordion>
            </CCol>
          )}
        </CRow>
      </CContainer>

      <div
        className="position-fixed bottom-0"
        style={{
          left: 0,
          right: 0,
          backgroundColor: '#f3f4f7',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 16,
          padding: 8,
          zIndex: 999,
        }}
      >
        {/* {hasPendingCards && (
          <span className="me-auto ms-3 text-danger small">
            Please generate tables for all selected treatments before continuing.
          </span>
        )} */}

        <Button
          customColor={COLORS.bgcolor} // background color of button
          color={COLORS.black}
          disabled={hasPendingCards /* or use: nextDisabled for stricter gating */}
          onClick={handleNext}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default TestTreatments
