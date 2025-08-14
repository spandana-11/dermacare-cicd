// PrescriptionTab.jsx
import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import html2pdf from 'html2pdf.js'
import { format } from 'date-fns'
import MedicineCard from '../components/MedicineCard'
import TemplateModal from '../components/TemplateModal'
import RecentChips from '../components/RecentChips'

import { FaTrash, FaEdit, FaCheck } from 'react-icons/fa'
import Button from '../components/CustomButton/CustomButton'
import { COLORS } from '../Themes'
import {
  CAlert,
  CButton,
  CCol,
  CFormInput,
  CFormSelect,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCheck, cilPencil, cilTrash } from '@coreui/icons'
import GradientTextCard from '../components/GradintColorText'
import { useToast } from '../utils/Toaster'
import { medicineTemplate, SavePrescription } from '../Auth/Auth'
import Select from 'react-select'
import api from '../Auth/axiosInterceptor'
import AsyncSelect from 'react-select/async'

const PrescriptionTab = ({ seed = {}, onNext, sidebarWidth = 0, formData }) => {
  const [search, setSearch] = useState('')
  const [localsearch, setLocalsearch] = useState('')

  const [searchResults, setSearchResults] = useState([])

  const [templates, setTemplates] = useState([])
  const [recentSearches, setRecentSearches] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)

  const [activeMedicine, setActiveMedicine] = useState(null) // ← ADD THIS

  const [editingIndex, setEditingIndex] = useState(null)
  const [prescriptions, setPrescriptions] = useState([])

  const [filteredPrescriptions, setFilteredPrescriptions] = useState([])
  const [selectedPrescriptionMedicines, setSelectedPrescriptionMedicines] = useState([])
  const [isSelectLoading, setIsSelectLoading] = useState(false)
  const [medicines, setMedicines] = useState(Array.isArray(seed.medicines) ? seed.medicines : [])
  const [note, setNote] = useState(seed.note ?? '')
  //Toaster
  const { success, error, info, warning } = useToast()
  // --- add near other state/derived values ---
  const hasPendingCards = Boolean(activeMedicine) || selectedPrescriptionMedicines.length > 0

  const debounce = useRef(null)
  // optional: sanitize before sending (fill blanks with 'NA')
  const sanitizeMedicines = (list) =>
    list.map((m) => ({
      ...m,
      dose: m.dose?.trim() || 'NA',
      note: m.note?.trim() || 'NA',
      food: m.food?.trim() || 'NA',
      duration: m.duration?.trim() || 'NA',
      remindWhen: m.remindWhen?.trim() || 'NA',
      times: Array.isArray(m.times)
        ? m.times.map((t) => `${t}`.trim()).filter(Boolean)
        : typeof m.times === 'string'
          ? m.times
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
    }))

  useEffect(() => {
    const storedTemplates = JSON.parse(localStorage.getItem('templates') || '[]')
    const recent = JSON.parse(localStorage.getItem('recent_searches') || '[]')
    setTemplates(storedTemplates)
    setRecentSearches(recent)
  }, [])

  useEffect(() => {
    setMedicines(Array.isArray(seed.medicines) ? seed.medicines : [])
    setNote(seed.note ?? '')
  }, [seed])
  const handleDelete = (id) => setMedicines((prev) => prev.filter((m) => (m.id ?? m.name) !== id))

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const res = await medicineTemplate()
        if (res) {
          console.log(res)
          setPrescriptions(res)
        }
        // ✅ Use data array directly
      } catch (err) {
        console.error('Error fetching prescriptions:', err)
      }
    }

    fetchPrescriptions()
  }, [])

  const options = Array.isArray(prescriptions)
    ? prescriptions.map((presc) => ({
        label: presc.medicines?.[0]?.name || `Prescription #${presc.prescriptionId}`,
        value: presc.prescriptionId,
        data: presc,
      }))
    : []

  const handlePrescriptionSelect = (selectedOption) => {
    const selected = selectedOption?.data
    if (selected?.medicines?.length > 0) {
      setSelectedPrescriptionMedicines(selected.medicines)
      // or show all if needed
    }
  }

  useEffect(() => {
    if (search.length < 2) return
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(() => fetchSearchResults(search), 300)
  }, [search])

  const fetchSearchResults = async (query) => {
    setIsLoading(true)
    try {
      const { data } = await axios.get(
        `https://api.fda.gov/drug/label.json?search=openfda.generic_name:${query}*&limit=25`,
      )
      const results = data.results.map((item) => item.openfda?.generic_name?.[0]).filter(Boolean)
      setSearchResults([...new Set(results)])
      setShowList(true)
    } catch (err) {
      console.error(err)
      setSearchResults([])
      setShowList(false)
    } finally {
      setIsLoading(false)
    }
  }

  const addMedicine = (name) => {
    const exists = medicines.some((med) => med.name.toLowerCase() === name.toLowerCase())

    if (exists) {
      warning('Medicine already added', { title: 'Warning' })
      return
    }

    setActiveMedicine({
      name,
      dose: '',
      remindWhen: 'Thrice A Day',
      note: '',
      duration: '',
      food: '',
      times: ['', '', ''],
    })

    setSearch('')
    setSearchResults([])

    const updatedRecent = [name, ...recentSearches.filter((item) => item !== name)].slice(0, 10)
    setRecentSearches(updatedRecent)
    localStorage.setItem('recent_searches', JSON.stringify(updatedRecent))
  }

  const saveTemplate = async () => {
    const newTemplate = JSON.stringify(medicines)
    console.log('🆕 New Template:', newTemplate)

    // Check if template already exists
    if (!templates.includes(newTemplate)) {
      const updated = [...templates, newTemplate]
      console.log('📦 Updated Local Templates Array:', updated)

      // Save to localStorage
      // localStorage.setItem('templates', JSON.stringify(updated))
      setTemplates(updated)
      // console.log('💾 Saved to localStorage')

      const clinicId = localStorage.getItem('hospitalId')

      // Prepare API data
      const prescriptionData = {
        medicines: medicines,
        clinicId: clinicId,
      }

      console.log('📤 Sending to API (createPrescription):', prescriptionData)

      // Send to backend
      const result = await SavePrescription(prescriptionData)

      if (result) {
        console.log('✅ API response:', result)
        success('Template saved successfully to server!', { title: 'Success' })
      } else {
        console.warn('⚠️ Failed to save on server')
        info('Saved locally, but failed to save on server.', { title: 'Partial Save' })
      }
    } else {
      console.log('ℹ️ Template already exists in localStorage')
      info('Template already exists!', { title: 'Info' })
    }
  }

  const loadTemplate = (templateStr) => {
    try {
      const parsed = JSON.parse(templateStr)
      setMedicines(parsed)
    } catch (e) {
      console.error('Invalid template')
    }
  }

  const generatePDF = () => {
    setIsGenerating(true)
    setTimeout(() => {
      const element = document.getElementById('pdf-content')
      html2pdf()
        .from(element)
        .set({ margin: 1, filename: `Prescription_${Date.now()}.pdf`, html2canvas: {}, jsPDF: {} })
        .save()
        .finally(() => setIsGenerating(false))
    }, 100)
  }

  const handleUpdate = (index, field, value) => {
    const updated = [...medicines]
    updated[index][field] = value
    setMedicines(updated)
  }

  // const handleNext = () => onNext?.({ medicines, note })
  const handleNext = () => {
    // stop if there are cards not added to the table yet
    if (hasPendingCards) {
      warning('Please add the medicine card(s) to the table before continuing.', {
        title: 'Pending medicines',
      })
      return
    }

    const payload = { medicines: sanitizeMedicines(medicines), note }
    onNext?.(payload)
    console.log(payload)
  }

  const [showList, setShowList] = useState(false)

  const listRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (listRef.current && !listRef.current.contains(event.target)) {
        setShowList(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  // PrescriptionTab.jsx (only the changed/added bits inside the component)
  const isDuplicateName = (name) => {
    const n = String(name || '')
      .trim()
      .toLowerCase()
    return medicines.some(
      (m) =>
        String(m?.name || '')
          .trim()
          .toLowerCase() === n,
    )
  }

  return (
    <div className="container pb-5">
      <CRow className="mb-4">
        {/* Local Medicine Finder */}
        <CCol xs={12} style={{ flex: '0 0 45%', minWidth: '300px' }}>
          <GradientTextCard text={'🏥 Local Medicine Finder'} />
          <div className="input-group no-focus-ring">
            <div className="mb-4" style={{ width: '100%' }}>
              <AsyncSelect
                cacheOptions
                loadOptions={(inputValue, callback) => {
                  if (!inputValue || inputValue.length < 2) return callback([])

                  const filtered = prescriptions
                    .filter((presc) =>
                      presc.medicines?.some((m) =>
                        m.name?.toLowerCase().includes(inputValue.toLowerCase()),
                      ),
                    )
                    .map((presc) => ({
                      label: presc.medicines?.[0]?.name || `Prescription #${presc.prescriptionId}`,
                      value: presc.prescriptionId,
                      data: presc,
                    }))

                  callback(filtered)
                }}
                defaultOptions={false}
                placeholder="Search prescription medicine..."
                onChange={(selectedOption) => {
                  const selected = selectedOption?.data
                  if (selected?.medicines?.length > 0) {
                    setSelectedPrescriptionMedicines(selected.medicines)
                  }
                }}
                noOptionsMessage={() => 'Start typing to search...'}
                styles={{
                  container: (base) => ({
                    ...base,
                    width: '100%',
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
              />
            </div>
          </div>
        </CCol>

        {/* 🌐 Global Medicine Finder */}
        <CCol xs={12} md={6}>
          <GradientTextCard text={'🌐 Global Medicine Finder'} />

          <div className="input-group position-relative">
            {/* Search input */}
            <CFormInput
              type="text"
              className="form-control pe-5"
              placeholder="Search global medicines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* Clear (×) button */}
            {search && (
              <button
                type="button"
                className="btn position-absolute end-0 top-50 translate-middle-y me-5 p-0 text-muted"
                style={{ zIndex: 5 }}
                onClick={() => setSearch('')}
                aria-label="Clear"
              >
                &times;
              </button>
            )}

            {/* Add Button (hide while loading) */}
            {!isLoading && (
              <Button
                className="btn btn-primary"
                onClick={() => addMedicine(search)}
                style={{ zIndex: 1 }}
              >
                Add
              </Button>
            )}

            {/* Loading spinner */}
            {isLoading && (
              <div
                className="spinner-border text-primary position-absolute end-0 top-50 translate-middle-y me-2"
                role="status"
                style={{ width: '1.2rem', height: '1.2rem', zIndex: 10 }}
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            )}
          </div>

          {/* Optional: show loader text below */}
          {isLoading && (
            <div className="mt-2 text-muted small d-flex align-items-center gap-2">
              <div className="spinner-border spinner-border-sm text-primary" role="status" />
              <span>Searching global medicines...</span>
            </div>
          )}
        </CCol>
      </CRow>

      {/* {isLoading && <div>Loading...</div>} */}
      {!isLoading && search && searchResults.length === 0 && (
        <p>No matching results. You can add manually.</p>
      )}
      {search.length >= 2 && recentSearches.length > 0 && (
        <RecentChips recent={recentSearches} onSelect={addMedicine} />
      )}

      <ul
        className="list-group mt-2"
        ref={listRef}
        style={{ display: showList ? 'block' : 'none' }}
      >
        {searchResults.map((res, idx) => (
          <li
            className="list-group-item d-flex justify-content-between"
            key={idx}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              addMedicine(res)
              setShowList(false) // hide after selection
            }}
          >
            {res}
            <button className="btn btn-sm btn-outline-success">Add</button>
          </li>
        ))}
      </ul>

      {medicines.length > 0 && (
        <div className="mb-4">
          <GradientTextCard text={'Prescription Table'} />

          <CTable striped hover responsive className="align-middle">
            <CTableHead>
              <CTableRow className="bg-info  fst-normal">
                <CTableHeaderCell scope="col">#</CTableHeaderCell>
                <CTableHeaderCell scope="col">Medicine</CTableHeaderCell>
                <CTableHeaderCell scope="col">Dosage</CTableHeaderCell>
                <CTableHeaderCell scope="col">Remind</CTableHeaderCell>
                <CTableHeaderCell scope="col">Duration</CTableHeaderCell>
                <CTableHeaderCell scope="col">Food</CTableHeaderCell>
                <CTableHeaderCell scope="col">Note</CTableHeaderCell>
                <CTableHeaderCell scope="col">Timings</CTableHeaderCell>
                <CTableHeaderCell scope="col" className="text-end">
                  Action
                </CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {medicines.map((med, index) => (
                <CTableRow key={index}>
                  <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>

                  {/* Medicine */}
                  <CTableDataCell>
                    {editingIndex === index ? (
                      <CFormInput
                        size="sm"
                        value={med.name}
                        onChange={(e) => handleUpdate(index, 'name', e.target.value)}
                      />
                    ) : (
                      med.name || 'NA'
                    )}
                  </CTableDataCell>

                  {/* Dose */}
                  <CTableDataCell>
                    {editingIndex === index ? (
                      <CFormInput
                        size="sm"
                        value={med.dose}
                        onChange={(e) => handleUpdate(index, 'dose', e.target.value)}
                      />
                    ) : (
                      med.dose || 'NA'
                    )}
                  </CTableDataCell>

                  {/* Remind */}
                  <CTableDataCell>
                    {editingIndex === index ? (
                      <CFormSelect
                        size="sm"
                        value={med.remindWhen}
                        onChange={(e) => handleUpdate(index, 'remindWhen', e.target.value)}
                      >
                        <option>Once A Day</option>
                        <option>Twice A Day</option>
                        <option>Thrice A Day</option>
                      </CFormSelect>
                    ) : (
                      med.remindWhen || 'NA'
                    )}
                  </CTableDataCell>

                  {/* Duration */}
                  <CTableDataCell>
                    {editingIndex === index ? (
                      <CFormInput
                        size="sm"
                        value={med.duration}
                        onChange={(e) => handleUpdate(index, 'duration', e.target.value)}
                      />
                    ) : (
                      med.duration || 'NA'
                    )}
                  </CTableDataCell>

                  <CTableDataCell>
                    {editingIndex === index ? (
                      <CFormInput
                        size="sm"
                        value={med.food}
                        onChange={(e) => handleUpdate(index, 'duration', e.target.value)}
                      />
                    ) : (
                      med.food || 'NA'
                    )}
                  </CTableDataCell>

                  {/* Note */}
                  <CTableDataCell style={{ maxWidth: 200 }}>
                    {editingIndex === index ? (
                      <CFormInput
                        size="sm"
                        value={med.note}
                        onChange={(e) => handleUpdate(index, 'note', e.target.value)}
                      />
                    ) : (
                      // Ellipsis + tooltip
                      <CTooltip content={med.note || 'NA'}>
                        <div
                          style={{
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={med.note} // fallback tooltip
                        >
                          {med.note || 'NA'}
                        </div>
                      </CTooltip>
                    )}
                  </CTableDataCell>

                  {/* Timings */}
                  <CTableDataCell style={{ minWidth: 180 }}>
                    {editingIndex === index ? (
                      <div className="d-flex flex-column gap-1">
                        {Array.isArray(med.times)
                          ? med.times.map((time, i) => (
                              <CFormInput
                                key={i}
                                size="sm"
                                value={time}
                                onChange={(e) => {
                                  const updated = [...med.times]
                                  updated[i] = e.target.value
                                  handleUpdate(index, 'times', updated)
                                }}
                              />
                            ))
                          : null}
                      </div>
                    ) : Array.isArray(med.times) ? (
                      med.times
                        .filter((t) => t && t.trim())
                        .map((t) => t.trim().charAt(0).toUpperCase()) // M, A, E
                        .join(', ')
                    ) : typeof med.times === 'string' ? (
                      med.times
                        .split(',')
                        .map((t) => t.trim().charAt(0).toUpperCase())
                        .join(', ')
                    ) : (
                      'NA'
                    )}
                  </CTableDataCell>

                  {/* Action */}
                  <CTableDataCell className="text-end" style={{ whiteSpace: 'nowrap' }}>
                    {editingIndex === index ? (
                      <CButton
                        color="success"
                        size="sm"
                        className="me-1"
                        onClick={() => setEditingIndex(null)}
                      >
                        <CIcon icon={cilCheck} />
                      </CButton>
                    ) : (
                      <CButton
                        color="primary"
                        variant="outline"
                        size="sm"
                        className="me-1"
                        onClick={() => setEditingIndex(index)}
                      >
                        <CIcon icon={cilPencil} />
                      </CButton>
                    )}
                    <CButton
                      color="danger"
                      variant="outline"
                      size="sm"
                      onClick={() => setMedicines(medicines.filter((_, i) => i !== index))}
                    >
                      <CIcon icon={cilTrash} />
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </div>
      )}
   
          {selectedPrescriptionMedicines.length > 0 && (
            <div className="d-flex flex-wrap gap-3 pb-5">
              {selectedPrescriptionMedicines.map((med, idx) => (
                <div key={med.id || idx} style={{ flex: '1 1 48%' }}>
                  <MedicineCard
                    index={idx}
                    medicine={med}
                    isDuplicateName={isDuplicateName}
                    updateMedicine={(updated) => {
                      const updatedList = [...selectedPrescriptionMedicines]
                      updatedList[idx] = updated
                      setSelectedPrescriptionMedicines(updatedList)
                    }}
                    removeMedicine={() => {
                      const updatedList = selectedPrescriptionMedicines.filter((_, i) => i !== idx)
                      setSelectedPrescriptionMedicines(updatedList)
                    }}
                    onAdd={(m) => {
                      if (isDuplicateName(m?.name)) {
                        info('Medicine already added', { title: 'Duplicate' })
                        return
                      }
                      setMedicines([...medicines, m])
                      setSelectedPrescriptionMedicines(
                        selectedPrescriptionMedicines.filter((_, i) => i !== idx),
                      )
                    }}
                  />
                </div>
              ))}
            </div>
          )}
   
      {activeMedicine && (
        <div className="d-flex flex-wrap gap-3 pb-5">
          <div style={{ flex: '1 1 48%' }}>
            <MedicineCard
              index={medicines.length}
              medicine={activeMedicine}
              updateMedicine={(updated) => setActiveMedicine(updated)}
              removeMedicine={() => setActiveMedicine(null)}
              isDuplicateName={isDuplicateName}
              onAdd={(m) => {
                if (isDuplicateName(m?.name)) {
                  info('Medicine already added', { title: 'Duplicate' })
                  return
                }
                setMedicines([...medicines, m])
                setActiveMedicine(null)
              }}
            />
          </div>
        </div>
      )}

      {!search && (
        <div
          className="position-fixed bottom-0 rigth-0 p-3  "
          style={{ zIndex: 1000, width: '75%', backgroundColor: '#F3f3f7' }}
        >
          <div className="d-flex justify-content-between align-items-end w-100  ">
            <div className="d-flex gap-4">
              <Button
                customColor={COLORS.secondary}
                className="ms-2"
                size="medium"
                onClick={saveTemplate}
              >
                Save Medicine Template
              </Button>
              {/* <Button
                className="ms-2"
                size="medium"
                customColor={COLORS.success}
                onClick={() => setShowTemplateModal(true)}
              >
                Load Medicine Template
              </Button> */}
            </div>
            <div>
              <Button
                size="medium"
                onClick={handleNext}
                disabled={hasPendingCards}
                title={hasPendingCards ? 'Add pending medicine card(s) first' : undefined}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {showTemplateModal && (
        <TemplateModal
          templates={templates}
          onClose={() => setShowTemplateModal(false)}
          onSelect={loadTemplate}
        />
      )}
    </div>
  )
}

export default PrescriptionTab
