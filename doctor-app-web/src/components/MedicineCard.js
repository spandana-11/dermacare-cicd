import React from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CRow,
  CCol,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CButton,
  CBadge,
  CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilTrash } from '@coreui/icons'
import './MedicineCard.css'
import GradientTextCard from './GradintColorText'
import Button from './CustomButton/CustomButton'
import { COLORS } from '../Themes'

const slotOptions = [
  { value: 'morning', label: 'Morning (8–9 AM)' },
  { value: 'afternoon', label: 'Afternoon (1–2 PM)' },
  { value: 'evening', label: 'Evening (6–7 PM)' },
  { value: 'night', label: 'Night (9–10 PM)' },
  { value: 'NA', label: 'NA' },
]

const foodOptions = ['Before Food', 'After Food', 'With Food', 'NA']

const MedicineCard = ({
  index,
  medicine,
  updateMedicine,
  removeMedicine,
  onAdd,
  isDuplicateName,
}) => {
  const handleChange = (field, value) => {
    updateMedicine({ ...medicine, [field]: value })
  }

  // Reuse medicine.times but store slot ids instead of exact times
  const handleSlotChange = (i, value) => {
    const updated = Array.isArray(medicine.times) ? [...medicine.times] : []
    updated[i] = value
    updateMedicine({ ...medicine, times: updated })
  }

  const disabledSlot = (i) =>
    (medicine.remindWhen === 'Once A Day' && i > 0) ||
    (medicine.remindWhen === 'Twice A Day' && i > 1)

  // Optional: prevent choosing the same slot twice
  const timesArray = Array.isArray(medicine.times) ? medicine.times : []
  const taken = new Set(timesArray.filter(Boolean))

  // helper for a fresh editable medicine row
  const createBlankMedicine = () => ({
    name: '',
    dose: '',
    remindWhen: 'Once A Day',
    food: '',
    duration: '',
    note: '',
    times: ['', '', ''],
  })

  // const canAdd = (m) =>
  //   (m?.name || '').trim() && (m?.dose || '').trim() && (m?.duration || '').trim()

  const canAdd = (m) =>
    (m?.name || '').trim() && (m?.dose || '').trim() && (m?.duration || '').trim()

  const isDup = isDuplicateName?.(medicine?.name)

  return (
    <CCard
      className="w-100 mb-3 shadow-sm p-3"
      // Use 70vh so it works without a fixed-height parent. If you truly want 70% of parent, change to '70%'.
      style={{ marginInline: '5px' }} // outer side gap only (optional)
    >
      <CCardHeader
        className="d-flex align-items-center justify-content-between"
        style={{ paddingInline: '5px', paddingBlock: '8px' }}
      >
        <div className="d-flex align-items-center gap-2">
          <CBadge color="secondary" shape="rounded-pill">
            #{index + 1}
          </CBadge>
          <strong>{medicine.name || 'Medicine'}</strong>
        </div>

        <div className="d-flex align-items-center gap-1">
          {/* Add to Table */}
          <CTooltip content="Add to table">
            <span>
              <Button
               customColor={COLORS.primary}
                variant="primary"
                size="sm"
                // disabled={!canAdd(medicine)}// TODO:vaildation
                //  disabled={!canAdd(medicine) || isDup}
                onClick={() => onAdd?.(medicine)}
              >
                <CIcon icon={cilPlus} />
              </Button>
            </span>
          </CTooltip>

          {/* Remove card */}
          <CTooltip content="Remove card">
            <Button customColor={COLORS.danger} variant="primary" size="sm" onClick={removeMedicine}>
              <CIcon icon={cilTrash} />
            </Button>
          </CTooltip>
        </div>
      </CCardHeader>

      <CCardBody style={{ paddingTop: 5, paddingBottom: 0 }}>
        <CRow className=" ">
          {/* Dose */}
          <CCol style={{ width: '25%' }}>
            <GradientTextCard text={'Dosage'} />

            <CFormInput
              value={medicine.dose || ''}
              placeholder="e.g. 1 tablet"
              onChange={(e) => handleChange('dose', e.target.value)}
            />
          </CCol>

          {/* Remind When */}
          <CCol style={{ width: '25%' }}>
            <GradientTextCard text={'Frequency'} />

            <CFormSelect
              value={medicine.remindWhen || 'Once A Day'}
              onChange={(e) => handleChange('remindWhen', e.target.value)}
            >
              <option>Once A Day</option>
              <option>Twice A Day</option>
              <option>Thrice A Day</option>
              <option>NA</option>
            </CFormSelect>
          </CCol>

          {/* Food */}
          <CCol style={{ width: '25%' }}>
            <GradientTextCard text={'Food'} />

            <CFormSelect
              value={medicine.food || ''}
              onChange={(e) => handleChange('food', e.target.value)}
            >
              <option value="">Select…</option>
              {foodOptions.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </CFormSelect>
          </CCol>

          {/* Duration */}
          <CCol style={{ width: '25%' }}>
            <GradientTextCard text={'Duration '} />

            <CFormInput
              type="number"
              value={medicine.duration || ''}
              placeholder="e.g. 5 days"
              onChange={(e) => handleChange('duration', e.target.value)}
            />
          </CCol>
        </CRow>

        {/* Time-of-day slots */}
        <CRow className="gx-2 gy-2 mt-1">
          {[0, 1, 2].map((i) => (
            <CCol xs={12} md={3} key={i}>
              <GradientTextCard text={`Time ${i + 1}`} />

              <CFormSelect
                value={(medicine.times && medicine.times[i]) || ''}
                onChange={(e) => handleSlotChange(i, e.target.value)}
                disabled={disabledSlot(i)}
              >
                <option value="">Select slot…</option>
                {slotOptions.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    disabled={medicine.times?.[i] !== opt.value && taken.has(opt.value)}
                  >
                    {opt.label}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
          ))}
        </CRow>

        {/* Notes */}
        <div className="mt-3">
          <GradientTextCard text={`Notes`} />

          <CFormTextarea
            rows={2}
            placeholder="Add any special instructions…"
            value={medicine.note || ''}
            onChange={(e) => handleChange('note', e.target.value)}
          />
        </div>
      </CCardBody>
    </CCard>
  )
}

export default MedicineCard
