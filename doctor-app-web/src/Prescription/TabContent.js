import React from 'react'
import PrescriptionTab from './PrescriptionTab'
import SymptomsDiseases from './SymptomsDiseases'
import DoctorSymptoms from './DoctorSymptoms'
import TestsTreatments from './TestsTreatments'
import FollowUp from './FollowUp'
import DoctorFollowUp from './DoctorFollowUp' // <-- NEW
import VisitHistory from './VisitHistory'
import Summary from './Summary'
import DoctorSummary from './DoctorSummary' // <-- NEW
import Tests from './Tests'
import MultiImageUpload from './ClinicImages'
import { COLORS } from '../Themes'

const TabContent = ({
  activeTab,
  formData,
  onSaveTemplate,
  onNext,
  setActiveTab,
  patientData,
  setFormData,
  fromDoctorTemplate,
}) => {
  let content = null

  switch (activeTab) {
    case 'Symptoms':
      content = fromDoctorTemplate ? (
        <DoctorSymptoms
          seed={formData.symptoms}
          onNext={onNext}
          sidebarWidth={260}
          patientData={patientData}
          setFormData={setFormData}
          formData={formData}
        />
      ) : (
        <SymptomsDiseases
          seed={formData.symptoms}
          onNext={onNext}
          sidebarWidth={260}
          patientData={patientData}
          setFormData={setFormData}
          formData={formData}
        />
      )
      break

    case 'Tests':
      content = (
        <Tests
          seed={formData.tests}
          onNext={onNext}
          sidebarWidth={260}
          formData={formData}
        />
      )
      break

    case 'Prescription':
      content = (
        <PrescriptionTab
          seed={formData.prescription}
          onNext={onNext}
          formData={formData}
        />
      )
      break

    case 'Treatments':
      content = (
        <TestsTreatments
          seed={formData.treatments}
          onNext={onNext}
          formData={formData}
        />
      )
      break

    case 'Follow-up':
      content = fromDoctorTemplate ? (
        <DoctorFollowUp
          seed={formData.followUp}
          onNext={onNext}
          patientData={patientData}
          formData={formData}
          setFormData={setFormData}
        />
      ) : (
        <FollowUp
          seed={formData.followUp}
          onNext={onNext}
          patientData={patientData}
          formData={formData}
          setFormData={setFormData}
        />
      )
      break

    case 'History':
      content = (
        <VisitHistory
          seed={formData.history}
          onNext={onNext}
          patientId={patientData?.patientId || formData.patientId}
          doctorId={patientData?.doctorId || formData.doctorId}
        />
      )
      break

    case 'Summary':
      content = fromDoctorTemplate ? (
        <DoctorSummary
          onNext={onNext}
          onSaveTemplate={onSaveTemplate}
          patientData={patientData}
          formData={formData}
          setFormData={setFormData}
          sidebarWidth={260}
        />
      ) : (
        <Summary
          onNext={onNext}
          onSaveTemplate={onSaveTemplate}
          patientData={patientData}
          formData={formData}
          sidebarWidth={260}
        />
      )
      break

    case 'Images':
      content = (
        <MultiImageUpload
          data={formData}
          onSubmit={onNext}
          patientData={patientData}
        />
      )
      break

    default:
      content = null
  }

  return (
    <div style={{ marginTop: '5%', backgroundColor: COLORS.theme ,}}>
      {content}
    </div>
  )
}

export default TabContent
