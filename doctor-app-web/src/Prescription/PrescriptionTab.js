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
  CButton,
  CFormInput,
  CFormSelect,
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
import { SavePrescription } from '../Auth/Auth'

const PrescriptionTab = ({ seed={},onNext, sidebarWidth = 0 }) => {
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [medicines, setMedicines] = useState(seed.medicines??[])
  const [templates, setTemplates] = useState([])
  const [recentSearches, setRecentSearches] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)

  const [editingIndex, setEditingIndex] = useState(null)

  //Toaster
  const { success, error, info, warning } = useToast()

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
    times: (m.times || []).map((t) => `${t}`).filter((t) => t)

    }))
  

  useEffect(() => {
    const storedTemplates = JSON.parse(localStorage.getItem('templates') || '[]')
    const recent = JSON.parse(localStorage.getItem('recent_searches') || '[]')
    setTemplates(storedTemplates)
    setRecentSearches(recent)
  }, [])

  useEffect(() => {
    if (search.length < 2) return
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(() => fetchSearchResults(search), 300)
  }, [search])

  const fetchSearchResults = async (query) => {
    try {
      setIsLoading(true)
      const { data } = await axios.get(
        `https://api.fda.gov/drug/label.json?search=openfda.generic_name:${query}*&limit=25`,
      )
      const results = data.results.map((item) => item.openfda?.generic_name?.[0]).filter(Boolean)
      setSearchResults([...new Set(results)])
    } catch (err) {
      console.error(err)
      setSearchResults([])
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

    // add medicine (you already have this)
    setMedicines([
      ...medicines,
      {
        name,
        dose: '',
        remindWhen: 'Thrice A Day',
        note: '',
        duration: '',
        food: '',
        times: ['', '', ''],
      },
    ])

    const canAdd = (m) =>
      (m?.name || '').trim() && (m?.dose || '').trim() && (m?.duration || '').trim()

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
     localStorage.setItem('templates', JSON.stringify(updated))
      setTemplates(updated)
      // console.log('💾 Saved to localStorage')

      // Prepare API data
      const prescriptionData = {
        
        medicines: medicines,
    
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

  const handleNext = () => {
    const payload = { medicines: sanitizeMedicines(medicines) }
    onNext?.(payload)
    console.log(payload)
    // alert('clicked') // keep if you still want the alert
  }

    const [showResults, setShowResults] = useState(true)
  const listRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (listRef.current && !listRef.current.contains(event.target)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])


  return (
    <div className="container pb-5">
      <div className="input-group mb-3 no-focus-ring">
        <CFormInput
          type="text"
          className="form-control"
          placeholder="Type at least 3 letters to search medicines..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button className="btn btn-primary" onClick={() => addMedicine(search)}>
          Add
        </Button>
      </div>

      {isLoading && <div>Loading...</div>}
      {!isLoading && search && searchResults.length === 0 && (
        <p>No matching results. You can add manually.</p>
      )}
      {search.length >= 2 && recentSearches.length > 0 && (
        <RecentChips recent={recentSearches} onSelect={addMedicine} />
      )}

      {showResults && (
        <ul className="list-group mt-2"  >
          {searchResults.map((res, idx) => (
            <li
              className="list-group-item d-flex justify-content-between"
              key={idx}
              style={{ cursor: 'pointer' }}
               
              onClick={() => addMedicine(res)}
            >
              {res}{' '}
              <button className="btn btn-sm btn-outline-success">Add</button>
            </li>
          ))}
        </ul>
      )}

      {medicines.length > 1 && (
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
              {medicines.slice(0, medicines.length - 1).map((med, index) => (
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
                        {(med.times || []).map((time, i) => (
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
                        ))}
                      </div>
                    ) : (
                      (med.times || []).filter(Boolean).join(', ') || 'NA'
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

      {medicines.length > 0 && (
        <div className="d-flex flex-wrap gap-3 pb-5">
          <div style={{ flex: '1 1 48%' }}>
            <MedicineCard
              index={medicines.length - 1}
              medicine={medicines[medicines.length - 1]}
              updateMedicine={(updated) => {
                const updatedList = [...medicines]
                updatedList[medicines.length - 1] = updated
                setMedicines(updatedList)
              }}
              removeMedicine={() => setMedicines(medicines.slice(0, medicines.length - 1))}
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
              <Button className="ms-2" size="medium" onClick={saveTemplate}>
                Save Medicine Template
              </Button>
              <Button
                className="ms-2"
                size="medium"
                customColor={COLORS.success}
                onClick={() => setShowTemplateModal(true)}
              >
                Load Medicine Template
              </Button>
            </div>
            <div>
              <Button size="medium" onClick={handleNext}>
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
