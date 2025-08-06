// VisitHistory.jsx
import React, { useState } from 'react'
import './VisitHistory.css'
import GradientTextCard from '../components/GradintColorText'
import FileUploader from './FileUploader'
import { CImage } from '@coreui/react'

// Reusable Accordion
const AccordionItem = ({ id, title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="vh-acc-item">
      <button
        className="vh-acc-header"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        id={`${id}-button`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="vh-acc-title">{title}</span>
        <span className="vh-acc-icon">{open ? '−' : '+'}</span>
      </button>
      <div
        className={`vh-acc-panel ${open ? 'open' : ''}`}
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-button`}
      >
        {children}
      </div>
    </div>
  )
}
const sampleFiles = [
  { name: 'javascript.pdf', type: 'application/pdf', path: '/files/ReactJS- PWA.pdf' },
  { name: 'mounika.png', type: 'image/png', path: '/files/mounika.png' },
  { name: 'Hospital.png', type: 'image/png', path: '/files/Hospital.png' },
]

const VisitHistory = ({
  visits = [
    {
      id: 'visit-1',
      title: 'FIRST VISIT (29–07–2025)',
      symptoms: [
        'Red itchy patches on arms and legs.',
        'Symptoms worsen with sun exposure.',
        'Mild burning sensation at night.',
        'No signs of pus or bleeding.',
      ],
      diagnosis: 'Atopic Dermatitis',
      tests: [
        {
          name: 'KOH Mount',
          reason: 'Suspected fungal infection on groin area, hence KOH mount advised.',
        },
        {
          name: 'CBC',
          reason: 'Hair loss and dry skin observed – thyroid and vitamin D evaluation recommended.',
        },
        {
          name: 'TSH',
          reason: 'Autoimmune reaction suspected due to chronic rash – ANA test suggested.',
        },
      ],
      treatments: [
        {
          name: 'Clobetasol Propionate 0.05%',
          reason: 'Topical steroid for inflammation and itching control.',
        },
        {
          name: 'Clotrimazole 1% Cream',
          reason: 'If fungal overlap is suspected in affected areas.',
        },
        { name: 'Levocetirizine 5mg', reason: 'Night-time itching relief; improves sleep.' },
      ],
      reports: [
        {
          date: '29-07-2025',
          name: 'CBC',
          result: 'Within normal limits',
          unit: '',
          referenceRange: '',
        },
        {
          date: '29-07-2025',
          name: 'TSH',
          result: '3.1',
          unit: 'µIU/mL',
          referenceRange: '0.4–4.5',
        },
      ],
      prescription: [
        {
          medicine: 'Clobetasol 0.05% cream',
          dose: 'Thin layer',
          frequency: 'OD (night)',
          duration: '7 days',
          notes: 'Apply on affected areas only',
        },
        {
          medicine: 'Levocetirizine',
          dose: '5 mg',
          frequency: 'HS',
          duration: '5 days',
          notes: 'If itching severe',
        },
        {
          medicine: 'Moisturizer (ceramide-based)',
          dose: '—',
          frequency: 'BID',
          duration: '2 weeks',
          notes: 'After bath & before bed',
        },
      ],
    },
    {
      id: 'visit-2',
      title: 'SECOND VISIT (02–08–2025)',
      symptoms: [
        'Itching reduced by ~60%, patches less inflamed.',
        'Occasional dryness after evening bath.',
        'No secondary infection signs.',
      ],
      diagnosis: 'Atopic Dermatitis (improving)',
      tests: [
        {
          name: 'Vitamin D',
          reason: 'Assess deficiency contributing to dryness and flare frequency.',
        },
        { name: 'IgE Levels', reason: 'Evaluate atopy load given recurrent history.' },
      ],
      treatments: [
        {
          name: 'Emollient (ceramide-based), bid',
          reason: 'Barrier repair to maintain symptom control.',
        },
        { name: 'Clobetasol 0.05% (taper)', reason: 'Reduce to once daily for 5 days, then stop.' },
        { name: 'Levocetirizine 5mg (prn)', reason: 'Use only if night-time itch recurs.' },
      ],
      reports: [
        {
          date: '02-08-2025',
          name: 'Vitamin D (25-OH)',
          result: '18',
          unit: 'ng/mL',
          referenceRange: '30–100',
        },
        { date: '02-08-2025', name: 'IgE', result: '240', unit: 'IU/mL', referenceRange: '<100' },
      ],
      prescription: [
        {
          medicine: 'Emollient (ceramide-based)',
          dose: '—',
          frequency: 'BID',
          duration: '4 weeks',
          notes: 'Continue regularly',
        },
        {
          medicine: 'Clobetasol 0.05% cream',
          dose: 'Thin layer',
          frequency: 'OD',
          duration: '5 days',
          notes: 'Then stop',
        },
      ],
    },
  ],
}) => {
  return (
    <div className="visit-history">
      <h4 className="visit-title">Visit History</h4>

      {/* TOP-LEVEL: Each visit as an accordion */}
      <div className="vh-accordion pb-3">
        {visits.map((v, idx) => (
          <AccordionItem key={v.id} id={v.id} title={v.title} defaultOpen={idx === 0}>
            {/* Symptoms */}
            <p className="symptoms-text">
              {v.symptoms.map((s, i) => (
                <span key={i}>
                  {s}
                  {i < v.symptoms.length - 1 && (
                    <>
                      <br />
                    </>
                  )}
                </span>
              ))}
            </p>

            {/* Diagnosis */}
            <div className="section">
              <h6 className="section-title">Probable Diagnosis / Disease</h6>
              <p className="diagnosis">{v.diagnosis}</p>
            </div>

            {/* Nested accordion: Tests, Treatments, Reports, Prescription */}
            <div className="vh-accordion" style={{ marginTop: 10 }}>
              <AccordionItem
                id={`${v.id}-tests`}
                title="Tests Recommended (With Reasons)"
                defaultOpen
              >
                <ul className="item-list">
                  {v.tests?.map((t, i) => (
                    <li key={i}>
                      <span style={{ fontWeight: 600 }}>{t.name}</span> ({t.reason})
                    </li>
                  ))}
                </ul>
              </AccordionItem>

              <AccordionItem
                id={`${v.id}-treatments`}
                title="Treatments (With Reasons)"
                defaultOpen={false}
              >
                <ul className="item-list">
                  {v.treatments?.map((t, i) => (
                    <li key={i}>
                      <span style={{ fontWeight: 600 }}>{t.name}</span> ({t.reason})
                    </li>
                  ))}
                </ul>
              </AccordionItem>

              <AccordionItem
                id={`${v.id}-reports`}
                title="Reports & Prescrpition"
                defaultOpen={false}
              >
                {/* Uploader always visible */}
                <div style={{ marginTop: 10 }}>
                  <CImage
                    src="https://media.graphcms.com/output=format:jpg/resize=height:900,width:1600/Xhf2u9QQEO7d8LLIIXgp" // Replace with your image URL or base64 string
                    alt="Sample"
                    width={150}
                    className="border rounded mb-2"
                  />
                  {/* <FileUploader accept=".pdf,image/*" attachments={sampleFiles} /> */}
                </div>
              </AccordionItem>
            </div>
          </AccordionItem>
        ))}
      </div>
    </div>
  )
}

export default VisitHistory
