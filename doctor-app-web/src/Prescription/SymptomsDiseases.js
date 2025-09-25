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
import { useDoctorContext } from '../Context/DoctorContext'
import SymptomsModal from '../components/DisaesModal'
import Select, { components } from 'react-select';

const SymptomsDiseases = ({ seed = {}, onNext, sidebarWidth = 0, patientData, setFormData }) => {
  const [symptomDetails, setSymptomDetails] = useState(
    seed.symptomDetails ?? patientData?.problem ?? '',
  )
  const { setUpdateTemplate } = useDoctorContext()

  const [doctorObs, setDoctorObs] = useState(seed.doctorObs ?? '')
  const [diagnosis, setDiagnosis] = useState(
    seed.diagnosis ?? (patientData?.subServiceName && patientData.subServiceName !== 'NA'
      ? patientData.subServiceName
      : '')
  )
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
  // Add these states near the top
  const [probableSymptoms, setProbableSymptoms] = useState('')
  const [keyNotes, setKeyNotes] = useState('')
  const [modalOpen, setmodalOpen] = useState(false)
  const [clearDiagnosis, setClearDiagnosis] = useState(false);
  // Update probableSymptoms and keyNotes whenever diagnosis changes
  useEffect(() => {
    if (!diagnosis) {
      setProbableSymptoms('')
      setKeyNotes('')
      return
    }

    const matched = diseases.find(
      (d) => d.diseaseName && d.diseaseName.toLowerCase() === diagnosis.toLowerCase()
    )

    if (matched) {
      setProbableSymptoms(matched.probableSymptoms || '')
      setKeyNotes(matched.notes || '')
    } else {
      setProbableSymptoms('')
      setKeyNotes('')
    }
  }, [diagnosis, diseases])


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
    const payload = {
      symptomDetails,
      doctorObs,
      diagnosis,
      duration,
      attachments,
      prescription: templateData.prescription, // include current template medicines
      tests: templateData.tests,
      treatments: templateData.treatments,
      followUp: templateData.followUp,

    }
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
  // --- move this above useEffect
  const fetchDiseases = async () => {
    try {
      const data = await getAllDiseases() || []

      // Normalize: ensure each disease has a `diseaseName` for frontend
      const normalized = data.map(d => ({
        diseaseName: d.diseaseName || '',
        probableSymptoms: d.probableSymptoms || '',
        notes: d.notes || '',
        hospitalId: d.hospitalId,

      }))

      setDiseases(normalized)
    } catch (err) {
      console.error('❌ Failed to fetch diseases:', err)
    }
  }


  const openMadal = () => {
    setmodalOpen(true)

  }

  // --- useEffect to fetch once on mount
  useEffect(() => {
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

    // ✅ include prescription & tests & followUp in payload
    const payload = {
      symptomDetails,
      doctorObs,
      diagnosis: dx,
      duration,
      attachments,
      prescription: merged.prescription,
      tests: merged.tests,
      treatments: merged.treatments,
      followUp: merged.followUp,
    }

    console.log("🚀 Final Payload:", payload) // debug log
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
    !options.some(
      (opt) =>
        (opt?.value || '').toLowerCase() === inputValue.trim().toLowerCase()
    )

  // NEW: Add-to-backend handler
  const handleAddClick = async () => {
    const name = inputValue.trim()
    const symptoms = probableSymptoms.trim()  // assuming you have a state for this
    const notesText = notes.trim()             // assuming you have a state for this

    if (!name || adding) return

    try {
      setAdding(true)

      // Pass additional fields to addDisease
      const created = await addDisease({
        diseaseName: name,
        probableSymptoms: symptoms,
        notes: notesText,
      })

      if (created) {
        success?.(`Saved "${name}" to diagnoses`, { title: 'Success' })
        setInputValue('')
        setProbableSymptoms('')  // clear symptoms input
        setNotes('')             // clear notes input

        // Reload fresh list from backend
        await fetchDiseases()

        // Optionally, auto-select the newly added diagnosis
        setDiagnosis(name)
      } else {
        info?.(created?.message || "Could not add disease", { title: 'Info' })
      }
    } catch (e) {
      console.error(e)
      error?.('Could not add disease. Please try again.')
    } finally {
      setAdding(false)
    }
  }
  // Custom Clear Button
  const ClearInput = (props) => {
    return (
      <components.ClearIndicator {...props}>
        <span
          style={{ cursor: 'pointer', color: '#7e3a93', fontWeight: 'bold' }}
          onClick={() => props.clearValue()}
        >
          ✕
        </span>
      </components.ClearIndicator>
    )
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
      ? t.prescription.medicines.map((m) => {
        const dur = m?.duration ? `${m.duration}`.trim() : "NA";
        let unit = m?.durationUnit ? m.durationUnit.trim() : "";

        // 🔹 Auto pluralize if duration > 1
        if (dur !== "NA" && unit) {
          const num = parseInt(dur, 10);
          if (!isNaN(num) && num > 1 && !unit.endsWith("s")) {
            unit = `${unit}s`;
          }
        }

        return {
          id: m?.id ?? `tmp-${Date.now()}-${Math.random()}`,
          medicineType: m?.medicineType?.trim() || "NA",
          name: m?.name || "",
          dose: m?.dose || "",
          remindWhen: m?.remindWhen || "Once A Day",
          others: m?.others || "",
          duration: dur !== "NA" && unit ? `${dur} ${unit}` : dur, // 👈 duration + unit (with plural if needed)
          food: m?.food || "",
          note: m?.note || "",
          times: Array.isArray(m?.times)
            ? m.times.map((t) => `${t}`.trim()).filter(Boolean)
            : m?.times && typeof m.times === "string"
              ? m.times.split(",").map((t) => t.trim()).filter(Boolean)
              : [],
        };
      })
      : [];



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
                  placeholder="NA"   // show NA if empty
                />
              </div>

              <div className="mb-3">
                <GradientTextCard text="Duration of Symptoms" />
                <CFormInput
                  className="mt-2"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="NA"   // show NA if empty
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

                <div className="mt-2 d-flex align-items-start gap-2">
                  <div className="flex-grow-1">
                    <Select
                      value={
                        diagnosis
                          ? { label: diagnosis, value: diagnosis }
                          : patientData?.subServiceName && patientData.subServiceName !== 'NA'
                            ? { label: patientData.subServiceName, value: patientData.subServiceName }
                            : null
                      }
                      onChange={(selected) => {
                        if (!selected) {
                          if (patientData?.subServiceName && patientData.subServiceName !== 'NA') {
                            setDiagnosis(patientData.subServiceName);
                          } else {
                            setDiagnosis('');
                          }
                          setInputValue('');
                        } else {
                          setDiagnosis(selected.value);
                          setInputValue('');
                        }
                      }}
                      inputValue={inputValue}
                      onInputChange={(val, meta) => {
                        if (meta.action === 'input-change') setInputValue(val);
                      }}
                      options={options}
                      isClearable
                      components={{ ClearIndicator: ClearInput }}
                      placeholder="Select diagnosis..."
                      menuPlacement="auto"          // auto decides top/bottom
                      menuPosition="fixed"          // fix dropdown position
                      menuPortalTarget={document.body}  // render at top-level
                      noOptionsMessage={() =>
                        inputValue
                          ? `No matches. Click Add to create "${inputValue}" as a diagnosis`
                          : 'Type to search...'
                      }
                      styles={{
                        input: (provided) => ({ ...provided, color: 'black' }),
                        singleValue: (provided) => ({ ...provided, color: 'black' }),
                        placeholder: (provided) => ({ ...provided, color: '#000' }),
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }), // ensure dropdown is on top
                      }}
                    />


                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      disabled={!canShowAdd || adding}
                      onClick={openMadal}
                      style={{
                        backgroundColor: !canShowAdd || adding ? "#a5c4d4ff" : "#7e3a93",
                        color: !canShowAdd || adding ? "#7e3a93" : "#fff",
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

                  <SymptomsModal
                    visible={modalOpen}
                    onClose={() => setmodalOpen(false)}
                    addDisease={addDisease}
                    fetchDiseases={fetchDiseases}
                    setDiagnosis={(val) => {
                      setDiagnosis(val);
                      setClearDiagnosis(false);
                    }}
                    success={success}
                    info={info}
                    error={error}
                    defaultDiseaseName={inputValue}
                  />
                </div>
              </div>
              {/* Display probableSymptoms and keyNotes automatically */}
              {diagnosis && probableSymptoms && (
                <div className="mt-3">
                  <div>
                    <strong>Category : </strong> <span>{probableSymptoms}</span>

                  </div>

                  <div className="mt-2">
                    <strong>Key Notes : </strong> <p>{keyNotes}</p>

                  </div>
                </div>
              )}

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
                        variant="outline"
                        sx={{
                          backgroundColor: COLORS.bgcolor,
                          color: COLORS.black,
                          border: "2px solid #000",
                        }}
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
