import React, { useState, useCallback, useMemo, useEffect } from 'react'
import TabContent from '../Prescription/TabContent'
import Snackbar from '../components/Snackbar'
import AppSidebar from './AppSidebar'
import { COLORS } from '../Themes'
import { CCard, CCardBody, CNav, CNavItem, CNavLink, CContainer } from '@coreui/react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useDoctorContext } from '../Context/DoctorContext'
import { SavePatientPrescription } from '../Auth/Auth'
import { useToast } from '../utils/Toaster'

const PatientAppointmentDetails = ({ defaultTab, tabs, fromDoctorTemplate = false }) => {
  const { id } = useParams()
  const { state } = useLocation()
  const { patientData } = useDoctorContext()
  const [patient, setPatient] = useState(patientData || state?.patient || null)
  const navigate = useNavigate()
  const { success, info } = useToast()

  // Tabs (with default fallback)
  const ALL_TABS = tabs || [
    'Symptoms',
    'Tests',
    'Medication',
    'Treatments',
    'Follow-up',
    'Prescription',
    'Images',
    'History',
    'Reports',
  ]

  const [activeTab, setActiveTab] = useState(defaultTab || ALL_TABS[0])
  const [snackbar, setSnackbar] = useState({ show: false, message: '', type: '' })

  // Fetch patient if not in state/context
  useEffect(() => {
    if (!patient && id) {
      ;(async () => {
        try {
          const res = await fetch(`/api/patients/${id}`)
          if (!res.ok) throw new Error('Failed to fetch patient')
          const data = await res.json()
          setPatient(data)
        } catch (err) {
          console.error('Error fetching patient:', err)
        }
      })()
    }
  }, [id, patient])

  // Form Data
  const [formData, setFormData] = useState({
    symptoms: {},
    tests: {},
    prescription: {},
    treatments: {},
    followUp: {},
    summary: {},
    history: {},
    ClinicImages: {},
  })

  // Go to next tab
  const goToNext = useCallback(
    (current) => {
      const i = ALL_TABS.indexOf(current)
      if (i > -1 && i < ALL_TABS.length - 1) setActiveTab(ALL_TABS[i + 1])
    },
    [ALL_TABS],
  )

  // Tab-specific next actions
  const onNextMap = {
    Symptoms: (data) => {
      setFormData((prev) => ({ ...prev, symptoms: { ...prev.symptoms, ...data } }))
      goToNext('Symptoms')
    },
    Tests: (data) => {
      setFormData((prev) => ({ ...prev, tests: { ...prev.tests, ...data } }))
      goToNext('Tests')
    },
    Medication: (data) => {
      setFormData((prev) => ({ ...prev, prescription: { ...prev.prescription, ...data } }))
      goToNext('Medication')
    },
    Treatments: (data) => {
      setFormData((prev) => ({ ...prev, treatments: { ...prev.treatments, ...data } }))
      goToNext('Treatments')
    },
    'Follow-up': (data) => {
      setFormData((prev) => ({ ...prev, followUp: { ...prev.followUp, ...data } }))
      goToNext('Follow-up')
    },
    Summary: async (data) => {
      const payload = { ...formData, summary: { ...formData.summary, ...data } }
      goToNext('Prescription')
      console.log('FINAL SUBMIT (Summary):', payload)
    },
    Images: (data) => {
      setFormData((prev) => ({ ...prev, ClinicImages: { ...prev.ClinicImages, ...data } }))
      goToNext('Images')
    },
    History: (data) => {
      const payload = { ...formData, history: { ...formData.history, ...data } }
      setFormData((prev) => ({ ...prev, history: payload.history }))
      console.log('FINAL SUBMIT (History):', payload)
    },
  }

  // ✅ Filter tabs based on doctor mode
  const TABS = useMemo(() => {
    if (!fromDoctorTemplate) return ALL_TABS

    const hasDisease =
      formData?.symptoms?.diagnosis && formData.symptoms.diagnosis.trim() !== ''

    if (hasDisease) return ALL_TABS
    return ['Symptoms']
  }, [ALL_TABS, fromDoctorTemplate, formData?.symptoms?.diagnosis])

  // Badge counts
  const counts = useMemo(
    () => ({
      Tests: formData?.tests?.selectedTests?.length || 0,
      Prescription: formData.prescription?.medicines?.length || 0,
      Treatments: formData.treatments?.selectedTreatments?.length || 0,
      Images: formData.ClinicImages?.items?.length || 0,
    }),
    [formData],
  )

  // Save prescription template
  const savePrescriptionTemplate = async () => {
    try {
      const title = formData.symptoms.diagnosis || 'NA'
      if (!title) {
        alert('Diagnosis is missing. Cannot save template.')
        return
      }
      const clinicId = localStorage.getItem('hospitalId')
      const template = {
        clinicId,
        title,
        symptoms: formData.symptoms.diagnosis,
        tests: formData.tests,
        prescription: formData.prescription,
        treatments: formData.treatments,
        followUp: formData.followUp,
      }
      console.log('✅ Saved template response:', template)
      if (
        template.title !== '' &&
        template.title !== 'NA' &&
        template.title !== undefined &&
        template.title !== null
      ) {
        const res = await SavePatientPrescription(template)
        console.log('✅ Saved template response:', template.title)

        if (res.status == 200) {
          success(`${res.message || 'Prescription Template saved successfully to server!'}`, {
            title: 'Success',
          })
        } else {
          info(`${res.message || 'A prescription template updated successfully'}`, {
            title: 'Info',
          })
        }
      } else {
        info('Provide the probable diagnosis/disease before creating the template.', {
          title: 'Info',
        })
      }
    } catch (error) {
      console.error('❌ Error saving template:', error)
      alert('Failed to save prescription template. Please try again.')
    }
  }

  // 🔹 Scroll to top when active tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' }) // or 'auto' for instant
  }, [activeTab])

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppSidebar />

      {/* Tabs */}
      <div className="w-100" style={{ position: 'sticky', top: 110, zIndex: 10 }}>
        <CContainer fluid className="p-0">
          <CCard style={{ border: 0, borderRadius: 0, backgroundColor: `${COLORS.theme}` }}>
            <CCardBody className="p-0 pt-3">
              <CNav variant="tabs" role="tablist" style={{ whiteSpace: 'nowrap' }}>
                {TABS.map((t) => {
                  const active = t === activeTab
                  const label = fromDoctorTemplate && t === 'Symptoms' ? 'Diseases' : t

                  return (
                    <CNavItem key={t}>
                      <CNavLink
                        active={active}
                        role="tab"
                        aria-selected={active}
                        onClick={() => setActiveTab(t)}
                        className="d-inline-flex align-items-center position-relative"
                        style={{
                          padding: '.5rem .850rem',
                          cursor: 'pointer',
                          borderRadius: '6px 6px 0 0',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '16px',
                            color: active ? COLORS.black : COLORS.black,
                            fontWeight: active ? '700' : '500',
                            backgroundColor: 'transparent',
                          }}
                        >
                          {label}
                        </span>
                      </CNavLink>
                    </CNavItem>
                  )
                })}
              </CNav>
            </CCardBody>
          </CCard>
        </CContainer>
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <TabContent
          activeTab={activeTab}
          formData={formData}
          onNext={onNextMap[activeTab]}
          setActiveTab={setActiveTab}
          onSaveTemplate={savePrescriptionTemplate}
          patientData={patient}
          setFormData={setFormData}
          fromDoctorTemplate={fromDoctorTemplate}
          setImage={true}
        />
      </div>

      {snackbar.show && <Snackbar message={snackbar.message} type={snackbar.type} />}
    </div>
  )
}

export default PatientAppointmentDetails
