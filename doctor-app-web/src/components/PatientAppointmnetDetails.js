// PatientAppointmentDetails.jsx
import React, { useState, useCallback, useMemo } from 'react'
import TabContent from '../Prescription/TabContent'
import Snackbar from '../components/Snackbar'
import AppSidebar from './AppSidebar'
import { COLORS } from '../Themes'
// import { toast } from 'react-toastify';
import { CCard, CCardBody, CNav, CNavItem, CNavLink, CBadge, CContainer } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilNotes,
  // cilFlask,
  cilMedicalCross,
  cilHealing,
  cilCalendarCheck,
  cilListRich,
  cilHistory,
  cilImage,
} from '@coreui/icons'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useDoctorContext } from '../Context/DoctorContext'
import { SavePatientPrescription } from '../Auth/Auth'
import { useToast } from '../utils/Toaster'

const TABS = [
  'Symptoms',
  'Tests',
  'Prescription',
  'Treatments',
  'Follow-up',
  'Summary',
  'History',
  'ClinicImages',
]

const ICONS = {
  Symptoms: cilNotes,
  Tests: '',
  Prescription: cilMedicalCross,
  Treatments: cilHealing,
  'Follow-up': cilCalendarCheck,
  Summary: cilListRich,
  History: cilHistory,
  ClinicImages: cilImage,
}

const PatientAppointmentDetails = () => {
  const { id } = useParams()
  const { state } = useLocation()
  const { patientData } = useDoctorContext()
  const [patient, setPatient] = useState(patientData || state?.patient || null)
  const navigate = useNavigate()
 const { success, error, info, warning } = useToast()
  const [activeTab, setActiveTab] = useState(TABS[0])
  const [snackbar, setSnackbar] = useState({ show: false, message: '', type: '' })
  console.log(patient?.name || 'NS')

  if (!patient || !state?.patient) {
    return (
      <div style={{ padding: 16 }}>
        <p>Loading patient {id}…</p>
        <button onClick={() => navigate(-1)}>Go back</button>
      </div>
    )
  }

  // return <PatientAppointmentDetails patientData={patient} />
  // all form slices live here
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

  const showSnackbar = (message, type) => {
    setSnackbar({ show: true, message, type })
    setTimeout(() => setSnackbar({ show: false, message: '', type: '' }), 3000)
  }

  const goToNext = useCallback((current) => {
    const i = TABS.indexOf(current)
    if (i > -1 && i < TABS.length - 1) setActiveTab(TABS[i + 1])
  }, [])

  // onNext handlers for each tab
  const onNextMap = {
    Symptoms: (data) => {
      setFormData((prev) => ({ ...prev, symptoms: { ...prev.symptoms, ...data } }))
      goToNext('Symptoms')
    },
    Tests: (data) => {
      setFormData((prev) => ({ ...prev, tests: { ...prev.tests, ...data } }))
      goToNext('Tests')
    },
    Prescription: (data) => {
      setFormData((prev) => ({ ...prev, prescription: { ...prev.prescription, ...data } }))
      goToNext('Prescription')
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
      goToNext('Summary')
      console.log('FINAL SUBMIT (Summary):', payload)
      // TODO: send to backend
    },
    History: (data) => {
      const payload = { ...formData, history: { ...formData.history, ...data } }
      setFormData((prev) => ({ ...prev, history: payload.history }))
      goToNext('History')
      console.log('FINAL SUBMIT (History):', payload)
    },
  }

  // Optional counts (progress badges)
  const counts = useMemo(
    () => ({
      Tests: formData.tests?.selectedTests?.length || 0,
      Prescription: formData.prescription?.medicines?.length || 0,
      Treatments: formData.treatments?.selectedTreatments?.length || 0,
      ClinicImages: formData.ClinicImages?.items?.length || 0,
    }),
    [formData],
  )



const savePrescriptionTemplate = async () => {
  try {
  const  title = formData.symptoms.diagnosis || "NA";
    // Validate formData before proceeding
    if (!title) {
      alert("Diagnosis is missing. Cannot save template.");
      return;
    }

    // Create a single template object
    const template = {
      title: title,
      symptoms: formData.symptoms,
      tests: formData.tests,
      prescription: formData.prescription,
      treatments: formData.treatments,
      followUp: formData.followUp,
    };

    // Save to server
    const res = await SavePatientPrescription(template);
    console.log('✅ Saved template response:', res);
    console.log('✅ Template sent:', template);

    if (res) {
            success('Prescription Template saved successfully to server!', { title: 'Success' })
 

      // // Optional: Save to localStorage
      // const key = 'visit_templates';
      // const existing = JSON.parse(localStorage.getItem(key) || '[]');
      // const updated = [template, ...existing];
      // localStorage.setItem(key, JSON.stringify(updated));
    } else {
      alert('Server did not return a success response.');
    }
  } catch (error) {
    console.error('❌ Error saving template:', error);
    alert('Failed to save prescription template. Please try again.');
  }
};




  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: COLORS.theme,
      }}
    >
      {/* If you use a sidebar, render it here (or in your layout) */}
      <AppSidebar />

      {/* Sticky, scrollable tabs */}
      <div
        className="w-100"
        style={{
          position: 'sticky',
          top: 110, // match your header height
          zIndex: 1000,
        }}
      >
        <CContainer fluid className="p-0">
          <CCard
            style={{
              border: 0,
              borderRadius: 0,
              backgroundColor: `${COLORS.theme}`,
              cursor: 'pointer',
            }}
          >
            <CCardBody className="py-1">
              <CNav variant="tabs" role="tablist" style={{ whiteSpace: 'nowrap' }}>
                {TABS.map((t) => {
                  const active = t === activeTab
                  const count = counts?.[t]
                  return (
                    <CNavItem key={t}>
                      <CNavLink
                        active={active}
                        role="tab"
                        aria-selected={active}
                        onClick={() => setActiveTab(t)}
                        className="d-inline-flex align-items-center position-relative"
                        style={{ padding: '.5rem .850rem' }}
                      >
                        {/* <CIcon icon={ICONS[t]} className="me-1" /> */}
                        <span
                          style={{ fontSize: '17px', color: COLORS.primary, fontWeight: '600' }}
                        >
                          {t}
                        </span>
                        {/* {!!count && (
                          <CBadge color={active ? 'primary' : 'secondary'} className="ms-2">
                            {count}
                          </CBadge>
                        )} */}
                        {active && (
                          <span
                            style={{
                              position: 'absolute',
                              left: 12,
                              right: 12,
                              bottom: 0,
                              height: 3,
                              borderRadius: 2,
                              background: 'linear-gradient(90deg, #0d6efd, #42a5f5)',
                            }}
                          />
                        )}
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
          patientData={patientData || state?.patient}
        />
      </div>

      {snackbar.show && <Snackbar message={snackbar.message} type={snackbar.type} />}
    </div>
  )
}

export default PatientAppointmentDetails
