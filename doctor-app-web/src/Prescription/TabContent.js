import React from 'react'
import PrescriptionTab from './PrescriptionTab'
import SymptomsDiseases from './SymptomsDiseases'
import TestsTreatments from './TestsTreatments'
import FollowUp from './FollowUp'
import VisitHistory from './VisitHistory'
import Summary from './Summary'
import Tests from './Tests'
import MultiImageUpload from './ClinicImages'
import { COLORS } from '../Themes'

/**
 * Props:
 * - activeTab, formData, onSaveTemplate, onNext, setActiveTab, patientData
 */
const TabContent = ({ activeTab, formData, onSaveTemplate, onNext, setActiveTab, patientData }) => {
  let content = null

  switch (activeTab) {
    case 'Symptoms':
      content = (
        <SymptomsDiseases
          seed={formData.symptoms}
          onNext={onNext}
          sidebarWidth={260}
          patientData={patientData}
        />
      )
      break
    case 'Tests':
      content = <Tests seed={formData.tests} onNext={onNext} sidebarWidth={260} />
      break
    case 'Prescription':
      content = <PrescriptionTab seed={formData.prescription} onNext={onNext} />
      break
    case 'Treatments':
      content = <TestsTreatments seed={formData.treatments} onNext={onNext} />
      break
    case 'Follow-up':
      content = <FollowUp seed={formData.followUp} onNext={onNext} patientData={patientData} />
      break
    case 'History':
      content = <VisitHistory seed={formData.history} onNext={onNext} />
      break
    case 'Summary':
      content = (
        <Summary
          onNext={onNext}
          onSaveTemplate={onSaveTemplate}
          patientData={patientData}
          formData={formData} // <-- important
          sidebarWidth={260}
        />
      )
      break
    case 'ClinicImages':
      content = <MultiImageUpload data={formData} onSubmit={onNext} patientData={patientData} />
      break
    default:
      content = null
  }

  return <div style={{ marginTop: '5%', backgroundColor: COLORS.theme }}>{content}</div>
}

export default TabContent
