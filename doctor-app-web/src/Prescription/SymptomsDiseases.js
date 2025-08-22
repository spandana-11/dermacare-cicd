import React, { useEffect, useMemo, useState } from 'react'
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
import { getDoctorSaveDetails, getAllDiseases, addDisease, getAdImagesView } from '../Auth/Auth' // <-- ensure this exists
import Select from 'react-select'
import { useDoctorContext } from '../Context/DoctorContext'

const SymptomsDiseases = ({ seed = {}, onNext, sidebarWidth = 0, patientData, setFormData }) => {
  const [symptomDetails, setSymptomDetails] = useState(
    seed.symptomDetails ?? patientData?.problem ?? '',
  )
  const { updateTemplate, setUpdateTemplate } = useDoctorContext()

  const [doctorObs, setDoctorObs] = useState(seed.doctorObs ?? '')
  const [diagnosis, setDiagnosis] = useState(seed.diagnosis ?? '')
  const [duration, setDuration] = useState(patientData?.symptomsDuration ?? '')
  const [attachments, setAttachments] = useState(
    Array.isArray(seed.attachments)
      ? seed.attachments
      : Array.isArray(patientData?.attachments)
        ? patientData.attachments
        : [],
  )
  const [template, setTemplate] = useState({})
  const [diseases, setDiseases] = useState([])
  const [snackbar, setSnackbar] = useState({ show: false, message: '', type: '' })
  const [tplLoading, setTplLoading] = useState(false)
  const [ads, setAds] = useState([]);        // ✅ new state
  const [loadingAds, setLoadingAds] = useState(false);
  const [templateData, setTemplateData] = useState({
    symptoms: '',
    tests: {},
    prescription: {},
    treatments: {},
    followUp: {},
    summary: {},
  })
  // NEW: local state for react-select typing + adding
  const [inputValue, setInputValue] = useState('')
  const [adding, setAdding] = useState(false)

  const [hasTemplate, setHasTemplate] = useState(false)

  const handleNext = () => {
    const payload = { symptomDetails, doctorObs, diagnosis, duration }
    console.log('🚀 Submitting payload:', payload)
    onNext?.(payload)
  }

  const { success, error, info, warning } = useToast()


  // ✅ Fetch Ads on mount
  useEffect(() => {
    const fetchAds = async () => {
      setLoadingAds(true);
      const data = await getAdImagesView();
      console.log("✅ Processed Ads:", data); // <-- check what comes back
      setAds(data);
      setLoadingAds(false);
    };
    fetchAds();
  }, []);
  // --- existing fetchDiseases useEffect...
  useEffect(() => {
    const fetchDiseases = async () => {
      const data = await getAllDiseases()
      console.log(data)
      setDiseases(data || [])
    }
    fetchDiseases()
  }, [])

  // put this near other hooks
  const fetchTemplate = async (dx) => {
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
  }

  // when user picks from Select
  const handleDiagnosisChange = async (selected) => {
    const selectedValue = selected?.value ?? ''
    setDiagnosis(selectedValue)
    if (!selectedValue) {
      setHasTemplate(false)
      return
    }
    await fetchTemplate(selectedValue)
  }

  // NEW: when you return to this tab, reload the template if diagnosis exists
  useEffect(() => {
    const dx = (seed?.diagnosis ?? diagnosis ?? '').trim()
    if (dx && !hasTemplate) {
      fetchTemplate(dx)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed?.diagnosis])

  console.log(templateData)
  const showSnackbar = (message, type) => {
    setSnackbar({ show: true, message, type })
    setTimeout(() => setSnackbar({ show: false, message: '', type: '' }), 3000)
  }

  // useEffect(() => {
  //   if (!diagnosis) return
  //   setTplLoading(true)
  //   const timer = setTimeout(() => setTplLoading(false), 800)
  //   return () => clearTimeout(timer)
  // }, [diagnosis])

  const applyTemplate = (dx) => {
    const merged = mapTemplateToFormData(templateData, dx)

    setFormData((prev) => ({
      ...prev,
      ...merged,
      __templateApplied: { dx, at: Date.now() },
    }))
    setUpdateTemplate(true)
    success('Template applied successfully!', { title: 'Success' })

    const payload = { symptomDetails, doctorObs, diagnosis: dx, duration, attachments }
    onNext?.(payload)
  }

  // NEW: options for react-select
  const options = useMemo(
    () =>
      Array.isArray(diseases) ? diseases.map((d) => ({ label: d.diseaseName, value: d.diseaseName })) : [],
    [diseases],
  )

  // NEW: add button visible only when user typed something that's not already an option
  const canShowAdd =
    inputValue.trim() &&
    !options.some((opt) => opt.value.toLowerCase() === inputValue.trim().toLowerCase())

  // NEW: Add-to-backend handler
  const handleAddClick = async () => {
    const name = inputValue.trim()
    if (!name || adding) return
    try {
      setAdding(true)
      const created = await addDisease(name) // make sure this function exists/imported
      const createdName = name
      console.log(created)
      if (created) {
        setDiseases((prev) => [
          ...prev,
          { id: created?.id ?? `tmp-${Date.now()}`, disease: createdName },
        ])

        setInputValue('')
        success?.(`Saved "${createdName}" to diagnoses"`, { title: 'Success' })
      } else {
        info?.(`"${created.message}"`, { title: 'Info' })
      }
    } catch (e) {
      console.error(e)
      error?.('Could not add disease. Please try again.')
    } finally {
      setAdding(false)
    }
  }

  // put this near the top of SymptomsDiseases.jsx
  // SymptomsDiseases.jsx
  const mapTemplateToFormData = (t = {}, dx) => {
    // ---- Symptoms (API has a string)
    const symptomStr = typeof t.symptoms === 'string' ? t.symptoms : ''

    // ---- Tests
    const selectedTests = Array.isArray(t?.tests?.selectedTests) ? t.tests.selectedTests : []
    const testReason = t?.tests?.testReason ?? ''

    // ---- Prescription (map 'food' -> remindWhen)
    const medicines = Array.isArray(t?.prescription?.medicines)
      ? t.prescription.medicines.map((m) => ({
        id: m?.id ?? `tmp-${Date.now()}-${Math.random()}`,
        name: m?.name ?? '',
        dose: m?.dose ?? '',
        duration: m?.duration ?? '',
        remindWhen: m?.food ?? m?.remindWhen ?? '', // <- important mapping
        note: m?.note ?? '',
        times: m?.times ?? m?.time ?? '',
      }))
      : []

    // ---- Treatments
    const generatedData = t?.treatments?.generatedData ?? {}
    const selectedTestTreatments =
      t?.treatments?.selectedTestTreatments ?? t?.treatments?.selectedTreatment ?? []
    const treatmentReason = t?.treatments?.reason ?? ''

    // ---- Follow up (note: API has followUpnote)
    const followUp = {
      durationValue: t?.followUp?.durationValue ?? '',
      durationUnit: t?.followUp?.durationUnit ?? '',
      nextFollowUpDate: t?.followUp?.nextFollowUpDate ?? '',
      followUpNote: t?.followUp?.followUpnote ?? t?.followUp?.followUpNote ?? '',
    }

    // ---- Final merged formData for the whole app
    return {
      symptoms: {
        symptomDetails: symptomStr, // show the template’s symptom text
        doctorObs, // keep whatever the doctor typed
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
  }

  return (
    <CCard className="border-1 bg-white mb-5 pb-5" style={{ backgroundColor: 'transparent' }}>
      <CForm className="w-100 " style={{ borderRadius: '10px' }}>
        <CRow className="gx-0">
          {/* LEFT */}
          <CCol lg={6}>
            <CCardBody>
              <div className="mb-3">
                <GradientTextCard text="Patient-Provided Symptoms" />
                <CFormTextarea
                  className="mt-2"
                  rows={3}
                  value={symptomDetails}
                  onChange={(e) => setSymptomDetails(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <GradientTextCard text="Duration of Symptoms" />
                <CFormInput
                  className="mt-2"
                  value={duration}
                  disabled
                // onChange={(e) => setDuration(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <GradientTextCard text="Doctor Additional Observations" />
                <CFormTextarea
                  className="mt-2"
                  rows={3}
                  value={doctorObs}
                  onChange={(e) => setDoctorObs(e.target.value)}
                />
              </div>

              <div className="mb-0">
                <GradientTextCard text="Probable Diagnosis / Disease" />

                {/* Field + right-side Add button */}
                <div className="mt-2 d-flex align-items-start gap-2">
                  <div className="flex-grow-1">
                    <Select
                      value={diagnosis ? { label: diagnosis, value: diagnosis } : null}
                      onChange={handleDiagnosisChange}
                      inputValue={inputValue}
                      onInputChange={(val, meta) => {
                        if (meta.action === 'input-change') setInputValue(val)
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
                          ? `No matches. Click Add to create "${inputValue}" as a diagnosis`
                          : 'Type to search...'
                      }
                      styles={{
                        input: (provided) => ({
                          ...provided,
                          color: 'black', // input text color
                        }),
                        singleValue: (provided) => ({
                          ...provided,
                          color: 'black', // selected value text color
                        }),
                        placeholder: (provided) => ({
                          ...provided,
                          color: '#000', // placeholder text color
                        }),
                      }}
                    />
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      disabled={!canShowAdd || adding}
                      onClick={handleAddClick}
                      style={{
                        backgroundColor: !canShowAdd || adding ? "#a5c4d4ff" : "#7e3a93", // disabled → light bg, enabled → purple bg
                        color: !canShowAdd || adding ? "#7e3a93" : "#fff",           // disabled → purple text, enabled → light text
                        cursor: !canShowAdd || adding ? "not-allowed" : "pointer",
                        border: "none",
                        padding: "6px 14px",
                        borderRadius: "6px",
                        fontWeight: "600",
                        transition: "all 0.3s ease",
                      }}
                      title={canShowAdd ? "Add new disease" : "Type a new disease name"}
                    >
                      {adding ? "Adding…" : "Add"}
                    </button>
                  </div>
                </div>
              </div>
            </CCardBody>
          </CCol>

          {/* RIGHT */}
          <CCol>
            <CCardBody>
              <div className="mb-1">
                <GradientTextCard text="Previous Reports & Prescriptions (if any)" />
                <FileUploader attachments={attachments} />
              </div>

              {tplLoading ? (
                <div className="d-flex align-items-center gap-2 text-body-secondary">
                  <CSpinner size="sm" />
                  <span>Loading recommendation…</span>
                </div>
              ) : hasTemplate ? (
                <div className="mb-3">
                  <CFormLabel className="mb-2">
                    <GradientTextCard text="Recommended Template:" />
                    <strong> {diagnosis}</strong>
                  </CFormLabel>
                  <CCard className="border-0 bg-light clickable-card">
                    <CCardBody className="d-flex align-items-center gap-3">
                      <CImage
                        src={temp}
                        alt="Template Preview"
                        width={72}
                        height={72}
                        style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }}
                      />
                      <Button
                        type="button"
                        size="small"
                        className="btn-reset w-100"
                        onClick={() => applyTemplate(diagnosis)}
                      >
                        Apply
                      </Button>
                    </CCardBody>
                  </CCard>
                </div>
              ) : (
                <div className="text-body-secondary small">No recommended template</div>
              )}
            </CCardBody>

            {/* {loadingAds ? (
              <div className="d-flex align-items-center gap-2 text-body-secondary p-3">
                <CSpinner size="sm" /> <span>Loading ads…</span>
              </div>
            ) : ads.length > 0 ? (
              <CCarousel controls indicators interval={3000} className="p-3">
                {ads.map((ad, idx) => (
                  <CCarouselItem key={ad.id || idx}>
                    {ad.type === "video" ? (
                      <video
                        className="d-block w-100"
                        src={ad.url}
                        height={150}
                        style={{ borderRadius: 8, objectFit: "cover" }}
                        autoPlay
                        loop
                        muted
                      />
                    ) : (
                      <CImage
                        className="d-block w-100"
                        src={ad.url}
                        alt={`Ad ${idx + 1}`}
                        height={150}
                        style={{ borderRadius: 8, objectFit: "cover" }}
                      />
                    )}
                  </CCarouselItem>
                ))}
              </CCarousel>
            ) : (
              <div className="text-body-secondary small p-3">
                No advertisements available
              </div>
            )} */}
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                height: 150,
                width: 500,                   // set the desired width
                borderRadius: 8,
                border: `1px dashed ${COLORS.primary}`,
                backgroundColor: COLORS.bgcolor,
                color: COLORS.black,
                fontWeight: 'bold',
                fontSize: '1rem',
              }}
            >
              Ad Space
            </div>
          </CCol>
        </CRow>
      </CForm>

      {/* Fixed bottom-right action */}
      <div
        className="position-fixed bottom-0 p-2"
        style={{
          left: 0,
          right: 0,
          // left: sidebarWidth || 'auto',
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

export default SymptomsDiseases
