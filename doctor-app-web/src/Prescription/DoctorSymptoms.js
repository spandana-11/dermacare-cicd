import React, { useEffect, useMemo, useState,useCallback  } from 'react'
import {
    CRow,
    CCol,
    CCard,
    CCardBody,
    CForm,
    CFormLabel,
    CFormTextarea,
    CFormInput,
    CImage,
    CSpinner,
    CCarousel,
    CCarouselItem,
} from '@coreui/react'
import './SymptomsDiseases.css'
import FileUploader from './FileUploader'
import Button from '../components/CustomButton/CustomButton'
import temp from '../assets/images/temp.webp'
import Snackbar from '../components/Snackbar'
import { COLORS } from '../Themes'
import GradientTextCard from '../components/GradintColorText'
import { useToast } from '../utils/Toaster'
import { getDoctorSaveDetails, getAllDiseases, addDisease } from '../Auth/Auth' // <-- ensure this exists
import Select from 'react-select'
import { useDoctorContext } from '../Context/DoctorContext'

const DoctorSymptoms = ({ seed = {}, onNext, sidebarWidth = 0, patientData, setFormData }) => {
  const [symptomDetails, setSymptomDetails] = useState(
    seed.symptomDetails ?? patientData?.problem ?? ''
  )
  const { setUpdateTemplate } = useDoctorContext()

  const [doctorObs, setDoctorObs] = useState(seed.doctorObs ?? '')
  const [diagnosis, setDiagnosis] = useState(seed.diagnosis ?? '')
  const [duration, setDuration] = useState(patientData?.symptomsDuration ?? '')
  const [attachments, setAttachments] = useState(
    Array.isArray(seed.attachments)
      ? seed.attachments
      : Array.isArray(patientData?.attachments)
      ? patientData.attachments
      : []
  )

  const [diseases, setDiseases] = useState([])
  const [snackbar, setSnackbar] = useState({ show: false, message: '', type: '' })
  const [tplLoading, setTplLoading] = useState(false)
  const [templateData, setTemplateData] = useState({
    symptoms: '',
    tests: {},
    prescription: {},
    treatments: {},
    followUp: {},
    summary: {},
  })

  const [inputValue, setInputValue] = useState('')
  const [adding, setAdding] = useState(false)
  const [hasTemplate, setHasTemplate] = useState(false)

  const { success, error, info } = useToast()

  // ✅ Memoized mapping function
  const mapTemplateToFormData = useMemo(
    () => (t = {}, dx) => {
      const symptomStr = typeof t.symptoms === 'string' ? t.symptoms : ''

      const selectedTests = Array.isArray(t?.tests?.selectedTests) ? t.tests.selectedTests : []
      const testReason = t?.tests?.testReason ?? ''

      const medicines = Array.isArray(t?.prescription?.medicines)
        ? t.prescription.medicines.map((m) => ({
            id: m?.id ?? `tmp-${Date.now()}-${Math.random()}`,
            name: m?.name ?? '',
            dose: m?.dose ?? '',
            duration: m?.duration ?? '',
            remindWhen: m?.food ?? m?.remindWhen ?? '',
            note: m?.note ?? '',
            times: m?.times ?? m?.time ?? '',
          }))
        : []

      const generatedData = t?.treatments?.generatedData ?? {}
      const selectedTestTreatments =
        t?.treatments?.selectedTestTreatments ?? t?.treatments?.selectedTreatment ?? []
      const treatmentReason = t?.treatments?.reason ?? ''

      const followUp = {
        durationValue: t?.followUp?.durationValue ?? '',
        durationUnit: t?.followUp?.durationUnit ?? '',
        nextFollowUpDate: t?.followUp?.nextFollowUpDate ?? '',
        followUpNote: t?.followUp?.followUpnote ?? t?.followUp?.followUpNote ?? '',
      }

      return {
        symptoms: {
          symptomDetails: symptomStr,
          doctorObs,
          diagnosis: dx,
          duration,
          attachments,
        },
        tests: {
          selectedTests,
          testReason,
        },
        prescription: {
          medicines,
        },
        treatments: {
          generatedData,
          selectedTestTreatments,
          treatmentReason,
        },
        followUp,
        summary: { diagnosis: dx },
      }
    },
    [doctorObs, duration, attachments]
  )

  // ✅ Fetch diseases on mount
  useEffect(() => {
    const fetchDiseases = async () => {
      const data = await getAllDiseases()
      setDiseases(data || [])
    }
    fetchDiseases()
  }, [])

  // ✅ Fetch template for a diagnosis
  const fetchTemplate = useCallback(async (dx) => {
    if (!dx) return
    setTplLoading(true)
    try {
      const res = await getDoctorSaveDetails(dx)
      const raw = res?.data ?? res
      const item = Array.isArray(raw) ? raw[0] : raw
      setTemplateData(item || {})
      setHasTemplate(!!item)
    } catch (e) {
      console.error(e)
      setHasTemplate(false)
    } finally {
      setTplLoading(false)
    }
  }, [])

  // when diagnosis changes → fetch template
  useEffect(() => {
    if (diagnosis && !hasTemplate) {
      fetchTemplate(diagnosis)
    }
  }, [diagnosis, hasTemplate, fetchTemplate])

  // handle diagnosis select
  const handleDiagnosisChange = async (selected) => {
    const selectedValue = selected?.value ?? ''
    setDiagnosis(selectedValue)
    if (!selectedValue) {
      setHasTemplate(false)
      return
    }
    await fetchTemplate(selectedValue)
  }

  // ✅ Apply template (no onNext call here!)
  const applyTemplate = (dx) => {
    const merged = mapTemplateToFormData(templateData, dx)

    setFormData((prev) => ({
      ...prev,
      ...merged,
      __templateApplied: { dx, at: Date.now() },
    }))
    setUpdateTemplate(true)
    success('Template applied successfully!', { title: 'Success' })
  }

  // react-select options
  const options = useMemo(
    () =>
      Array.isArray(diseases)
        ? diseases.map((d) => ({ label: d.disease, value: d.disease }))
        : [],
    [diseases]
  )

  const canShowAdd =
    inputValue.trim() &&
    !options.some((opt) => opt.value.toLowerCase() === inputValue.trim().toLowerCase())

  const handleAddClick = async () => {
    const name = inputValue.trim()
    if (!name || adding) return
    try {
      setAdding(true)
      const created = await addDisease(name)
      if (created) {
        setDiseases((prev) => [
          ...prev,
          { id: created?.id ?? `tmp-${Date.now()}`, disease: name },
        ])
        setInputValue('')
        success?.(`Saved "${name}" to diagnoses`, { title: 'Success' })
      } else {
        info?.(`${created.message}`, { title: 'Info' })
      }
    } catch (e) {
      console.error(e)
      error?.('Could not add disease. Please try again.')
    } finally {
      setAdding(false)
    }
  }

  // ✅ Next button handler
  const handleNext = () => {
    const payload = { symptomDetails, doctorObs, diagnosis, duration, attachments }
    onNext?.(payload)
  }

   

    return (
        <CCard className="border-1 bg-white mb-5" style={{ backgroundColor: 'transparent' }}>
            <CForm className="w-100 " style={{ borderRadius: '10px' }}>
                <CRow className="gx-0">
                    {/* LEFT */}
                    <CCol lg={6}>
                        <CCardBody>
                            <div className="mb-0">
                                <GradientTextCard text="Probable Diagnosis / Disease" />

                                {/* Field + right-side Add button */}
                                <div className="mt-2 d-flex align-items-start gap-2">
                                    <div className="flex-grow-1">
                                        <Select
                                            value={diagnosis ? { label: diagnosis, value: diagnosis } : null}
                                            onChange={handleDiagnosisChange}
                                            // IMPORTANT: control the input
                                            inputValue={inputValue}
                                            onInputChange={(val, meta) => {
                                                if (meta.action === 'input-change') setInputValue(val) // ignore blur/menu-close resets
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && canShowAdd && !adding) {
                                                    e.preventDefault()
                                                    handleAddClick()
                                                }
                                            }}
                                            options={options}
                                            isSearchable
                                            placeholder="Select diagnosis..."
                                            menuPlacement="bottom"
                                            noOptionsMessage={() =>
                                                inputValue
                                                    ? `No matches. Select Add to create "${inputValue}" as a diagnosis`
                                                    : 'Type to search...'
                                            }
                                        />
                                    </div>

                                    <div className="pt-1">
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-primary"
                                            disabled={!canShowAdd || adding}
                                            // run BEFORE blur clears the input
                                            onMouseDown={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                handleAddClick()
                                            }}
                                            title={canShowAdd ? 'Add' : 'Type a new disease name'}
                                        >
                                            {adding ? 'Adding…' : 'Add'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </CCardBody>
                    </CCol>

                </CRow>
            </CForm>

            {/* Fixed bottom-right action */}
            <div
                className="position-fixed bottom-0 p-2"
                style={{
                    right: 0,
                    left: sidebarWidth || 'auto',
                    zIndex: 1000,
                    backgroundColor: COLORS.theme,
                    display: 'flex',
                    justifyContent: 'flex-end',
                }}
            >
                <Button onClick={handleNext} customColor={COLORS.bgcolor} // background color of button
                    color={COLORS.black}>Next</Button>
            </div>

            {snackbar.show && <Snackbar message={snackbar.message} type={snackbar.type} />}
        </CCard>
    )
}

export default DoctorSymptoms
