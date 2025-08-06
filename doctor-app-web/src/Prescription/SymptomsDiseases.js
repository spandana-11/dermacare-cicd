import React, { useEffect, useState } from 'react'
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CForm,
  CFormLabel,
  CFormTextarea,
  CFormSelect,
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

const SymptomsDiseases = ({ seed = {}, onNext, sidebarWidth = 0, patientData }) => {
  const [symptomDetails, setSymptomDetails] = useState(
    seed.symptomDetails ?? patientData?.problem ?? ''
  )
  const [doctorObs, setDoctorObs] = useState(seed.doctorObs ?? '')
  const [diagnosis, setDiagnosis] = useState(seed.diagnosis ?? '')
  const [duration, setDuration] = useState(seed.duration ?? patientData?.symptomsDuration ?? '')
  const [attachments, setAttachments] = useState(
    Array.isArray(seed.attachments)
      ? seed.attachments
      : Array.isArray(patientData?.attachments)
      ? patientData.attachments
      : []
  )
  const [snackbar, setSnackbar] = useState({ show: false, message: '', type: '' })
  const [tplLoading, setTplLoading] = useState(false)

  const handleNext = () => {
    // const payload = { symptomDetails, doctorObs, diagnosis, duration, attachments }
    const payload = { symptomDetails, doctorObs, diagnosis, duration }
    console.log('🚀 Submitting payload:', payload)
    onNext?.(payload)
  }

  const showSnackbar = (message, type) => {
    setSnackbar({ show: true, message, type })
    setTimeout(() => setSnackbar({ show: false, message: '', type: '' }), 3000)
  }

  useEffect(() => {
    if (!diagnosis) return
    setTplLoading(true)
    const timer = setTimeout(() => setTplLoading(false), 800)
    return () => clearTimeout(timer)
  }, [diagnosis])

  const applyTemplate = (dx) => {
    showSnackbar('Template applied successfully!', 'success')
    const payload = { symptomDetails, doctorObs, diagnosis: dx, duration, attachments }
    onNext?.(payload)
  }


  return (
    <CCard className="border-1 mb-5" style={{ backgroundColor: 'transparent' }}>
      <CForm className="w-100 bg-white" style={{ borderRadius: '10px' }}>
        <CRow className="gx-0">
          {/* LEFT */}
          <CCol lg={6}>
            <CCardBody>
              <div className="mb-3">
                <GradientTextCard text="Patient-Provided Symptom" />
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
                  onChange={(e) => setDuration(e.target.value)}
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
                <CFormSelect
                  className="mt-2"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                >
                  <option value="">NA</option>
                  <option>Atopic Dermatitis</option>
                  <option>Psoriasis</option>
                  <option>Eczema</option>
                </CFormSelect>
              </div>
            </CCardBody>
          </CCol>

          {/* RIGHT */}
          <CCol>
            <CCardBody>
              <div className="mb-1">
                <GradientTextCard text="Previous Reports & Prescriptions (if any)" />
           
                <FileUploader attachments={attachments}/>
              </div>

              {tplLoading ? (
                <div className="d-flex align-items-center gap-2 text-body-secondary">
                  <CSpinner size="sm" />
                  <span>Loading recommendation…</span>
                </div>
              ) : diagnosis ? (
                <div className="mb-3">
                  <CFormLabel className="mb-2">
                    <GradientTextCard text="Recommended Template:" />
                    <strong> {diagnosis}</strong>
                  </CFormLabel>
                  <CCard
                    className="border-0 bg-light clickable-card"
                    onClick={() => applyTemplate(diagnosis)}
                  >
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

            <CCarousel controls indicators interval={3000} className="p-3">
              {[
                'https://tse2.mm.bing.net/th/id/OIP.Qt6GFcp7On1UC1_IuSp71QHaDt?rs=1&pid=ImgDetMain&o=7&rm=3',
                'https://getkuwa.com/cdn/shop/collections/Derma_Co_1920x.png?v=1718355215',
                'https://dermasense.pk/wp-content/uploads/2021/07/DermaSense-Skin-Care-Slider.jpg',
              ].map((ad, idx) => (
                <CCarouselItem key={idx}>
                  <CImage
                    className="d-block w-100"
                    src={ad}
                    alt={`Ad ${idx + 1}`}
                    height={150}
                    style={{ borderRadius: 8, objectFit: 'cover' }}
                  />
                </CCarouselItem>
              ))}
            </CCarousel>
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
        <Button onClick={handleNext}>Next</Button>
      </div>

      {snackbar.show && <Snackbar message={snackbar.message} type={snackbar.type} />}
    </CCard>
  )
}

export default SymptomsDiseases
