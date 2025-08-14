// src/components/PrescriptionPDF.jsx
import React from 'react'
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 11, fontFamily: 'Helvetica' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 10,
    borderBottom: '2 solid #e5e7eb',
    marginBottom: 12,
  },
  logoBox: {
    width: 64,
    height: 64,
    border: '1 solid #e5e7eb',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  logo: { width: 56, height: 56, objectFit: 'contain' },
  hospitalInfo: { marginLeft: 10, flexGrow: 1 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 2 },
  sub: { color: '#64748b', marginBottom: 5 },

  section: { marginBottom: 12 },
  card: { border: '1 solid #e5e7eb', borderRadius: 6, padding: 10, backgroundColor: '#ffffff' },
  cardTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 6, color: '#111827' },
  rowSpace: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  kvRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  kvCol: { width: '48%' },
  label: { color: '#64748b', marginBottom: 5 },
  value: { fontWeight: 'bold', marginBottom: 5 },

  dotRow: { flexDirection: 'row', marginBottom: 2 },
  dot: { width: 10, textAlign: 'center' },
  dotText: { flex: 1 },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderBottom: '1 solid #eeeeee',
  },
  cell: { paddingRight: 6, fontSize: 11, lineHeight: 1.2 },
  cellCenter: { textAlign: 'center' },
  zebra: { backgroundColor: '#fafafa' },

  smHeadRow: {
    flexDirection: 'row',
    backgroundColor: '#f2f4f7',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  smRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottom: '1 solid #f1f5f9',
  },
  smCell: { fontSize: 10 },

  signatureBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingTop: 10,
    borderTop: '1 solid #e5e7eb',
  },
  legend: { fontSize: 10, color: '#6b7280', marginTop: 6 },
})

const COLS = [
  { key: 'sno', label: 'S.No', w: 6, align: 'center' },
  { key: 'name', label: 'Medicine', w: 20 },
  { key: 'dose', label: 'Dose', w: 12 },
  { key: 'remind', label: 'Remind', w: 12 },
  { key: 'duration', label: 'Duration', w: 12 },
  { key: 'food', label: 'Food', w: 10 },
  { key: 'note', label: 'Note', w: 13 },
  { key: 'times', label: 'Timings', w: 18, align: 'center' },
]

const toInitials = (input) => {
  if (!input) return '—'
  const arr = Array.isArray(input) ? input : String(input).split(/[,|]/)
  const tokens = arr.map((s) => String(s).trim().toLowerCase()).filter(Boolean)
  const map = { morning: 'M', m: 'M', afternoon: 'A', a: 'A', evening: 'E', e: 'E', night: 'N', n: 'N' }
  return tokens.map((t) => map[t] ?? (t[0]?.toUpperCase() || '—')).join(',')
}

const freqLabel = (f) =>
  f === 'day' ? 'Daily' : f === 'week' ? 'Weekly' : f === 'month' ? 'Monthly' : f || '—'

/**
 * @param {object} props
 * @param {string} props.logoSrc - data URL or CORS-enabled URL
 * @param {object} props.doctorData
 * @param {object} props.clicniData
 * @param {object} props.formData
 * @param {object} props.patientData
 */
const PrescriptionPDF = ({ logoSrc, doctorData, clicniData, formData, patientData }) => {
  const date = new Date().toLocaleDateString()

  const tests = Array.isArray(formData?.tests?.selectedTests) ? formData.tests.selectedTests : []
  const testsReason = formData?.tests?.testReason ?? ''

  const treatments = Array.isArray(formData?.treatments?.selectedTestTreatments)
    ? formData.treatments.selectedTestTreatments
    : []
  const treatmentReason = formData?.treatments?.treatmentReason ?? ''
  const treatmentSchedules = formData?.treatments?.generatedData || {}

  const meds = Array.isArray(formData?.prescription?.medicines)
    ? formData.prescription.medicines
    : []

  const followUp = {
    durationValue: Number(formData?.followUp?.durationValue) || 0,
    durationUnit: (formData?.followUp?.durationUnit || '').trim(),
    date: (formData?.followUp?.nextFollowUpDate || '').trim(),
    note: (formData?.followUp?.followUpNote || '').trim(),
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            {logoSrc ? <Image style={styles.logo} src={logoSrc} /> : null}
          </View>

          <View style={styles.hospitalInfo}>
            <Text style={styles.title}>{clicniData?.name ?? 'Clinic Name'}</Text>
            <Text style={styles.sub}>{clicniData?.address ?? 'Clinic Address'}</Text>
            <Text style={styles.sub}>Phone: {clicniData?.contactNumber ?? 'NA'}</Text>
          </View>

          <Text style={styles.sub}>{date}</Text>
        </View>

        {/* Patient */}
        <View style={[styles.section, styles.card]}>
          <View style={styles.kvRow}>
            <View style={styles.kvCol}>
              <Text style={styles.label}>Patient</Text>
              <Text style={styles.value}>{patientData?.name ?? '—'}</Text>
            </View>
            <View style={styles.kvCol}>
              <Text style={styles.label}>Mobile</Text>
              <Text style={styles.value}>{patientData?.mobileNumber ?? '—'}</Text>
            </View>
          </View>
          <View style={styles.kvRow}>
            <View style={styles.kvCol}>
              <Text style={styles.label}>Age / Sex</Text>
              <Text style={styles.value}>
                {patientData?.age ?? '—'} / {patientData?.gender ?? '—'}
              </Text>
            </View>
            <View style={styles.kvCol}>
              <Text style={styles.label}>Symptoms Duration</Text>
              <Text style={styles.value}>{patientData?.duration ?? '—'}</Text>
            </View>
          </View>
        </View>

        {/* Symptoms */}
        <View style={[styles.section, styles.card]}>
          <Text style={styles.cardTitle}>Symptoms</Text>
          <View style={{ marginTop: 2, marginBottom: 2 }}>
            <View>
              <Text style={styles.label}>Diagnosis</Text>
              <Text style={styles.value}>{formData?.symptoms?.diagnosis ?? 'NA'}</Text>
            </View>
            <View>
              <Text style={styles.label}>Doctor Obs</Text>
              <Text style={styles.value}>{formData?.symptoms?.doctorObs ?? 'NA'}</Text>
            </View>
            <View>
              <Text style={styles.label}>Symptoms Details</Text>
              <Text style={styles.value}>{formData?.symptoms?.symptomDetails ?? 'NA'}</Text>
            </View>
          </View>
        </View>

        {/* Tests */}
        {tests.length > 0 && (
          <View style={[styles.section, styles.card]}>
            <Text style={styles.cardTitle}>Tests Recommended</Text>
            <View style={{ marginTop: 4 }}>
              {tests.map((t, i) => (
                <View key={`test-${i}`} style={styles.dotRow}>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.dotText}>{t || '—'}</Text>
                </View>
              ))}
            </View>
            {testsReason ? (
              <View style={{ marginTop: 6 }}>
                <Text style={styles.label}>Reason</Text>
                <Text>{testsReason}</Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Treatments */}
        {treatments.length > 0 && (
          <View style={[styles.section, styles.card]}>
            <Text style={styles.cardTitle}>Treatments</Text>
            <View style={{ marginTop: 4 }}>
              {treatments.map((t, i) => (
                <View key={`treat-${i}`} style={styles.dotRow}>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.dotText}>{typeof t === 'string' ? t : t?.name || '—'}</Text>
                </View>
              ))}
            </View>
            {treatmentReason ? (
              <View style={{ marginTop: 6 }}>
                <Text style={styles.label}>Reason</Text>
                <Text>{treatmentReason}</Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Treatment schedules */}
        {treatmentSchedules && Object.keys(treatmentSchedules).length > 0 && (
          <View style={[styles.section, styles.card]}>
            <Text style={styles.cardTitle}>Treatment Schedule</Text>
            {Object.entries(treatmentSchedules).map(([name, meta]) => (
              <View key={name} style={{ marginTop: 8 }}>
                <Text style={{ fontWeight: 'bold' }}>
                  {name} — {freqLabel(meta?.frequency)} ({meta?.sittings ?? 0} sittings from{' '}
                  {meta?.startDate ?? '—'})
                </Text>

                <View style={{ marginTop: 4 }}>
                  <View style={styles.smHeadRow}>
                    <Text style={[styles.smCell, { width: '8%' }]}>#</Text>
                    <Text style={[styles.smCell, { width: '46%' }]}>Date</Text>
                    <Text style={[styles.smCell, { width: '46%' }]}>Sitting</Text>
                  </View>
                  {(meta?.dates || []).map((d, i) => (
                    <View key={`${name}-row-${i}`} style={styles.smRow}>
                      <Text style={[styles.smCell, { width: '8%' }]}>{i + 1}</Text>
                      <Text style={[styles.smCell, { width: '46%' }]}>{d?.date ?? '—'}</Text>
                      <Text style={[styles.smCell, { width: '46%' }]}>{d?.sitting ?? '—'}</Text>
                    </View>
                  ))}
                </View>

                {meta?.reason ? <Text style={{ marginTop: 4 }}>{`Reason: ${meta.reason}`}</Text> : null}
              </View>
            ))}
          </View>
        )}

        {/* Prescription */}
        {Array.isArray(meds) && meds.length > 0 && (
          <View style={styles.section}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 6 }}>Prescription</Text>

            <View style={[styles.tableHeader, { borderTopLeftRadius: 6, borderTopRightRadius: 6 }]}>
              {COLS.map((c) => (
                <Text
                  key={c.key}
                  style={[
                    styles.cell,
                    c.align === 'center' && styles.cellCenter,
                    { width: `${c.w}%` },
                  ]}
                >
                  {c.label}
                </Text>
              ))}
            </View>

            {meds.map((med, index) => {
              const timings = toInitials(med?.times, ',')
              const zebra = index % 2 === 0 ? styles.zebra : null
              return (
                <View key={`med-${index}`} style={[styles.tableRow, zebra]}>
                  <Text style={[styles.cell, styles.cellCenter, { width: `${COLS[0].w}%` }]}>
                    {index + 1}
                  </Text>
                  <Text style={[styles.cell, { width: `${COLS[1].w}%` }]}>{med?.name ?? '—'}</Text>
                  <Text style={[styles.cell, { width: `${COLS[2].w}%` }]}>{med?.dose ?? '—'}</Text>
                  <Text style={[styles.cell, { width: `${COLS[3].w}%` }]}>{med?.remindWhen ?? '—'}</Text>
                  <Text style={[styles.cell, { width: `${COLS[4].w}%` }]}>{med?.duration ?? '—'}</Text>
                  <Text style={[styles.cell, { width: `${COLS[5].w}%` }]}>{med?.food ?? '—'}</Text>
                  <Text style={[styles.cell, { width: `${COLS[6].w}%` }]}>{med?.note ?? '—'}</Text>
                  <Text style={[styles.cell, styles.cellCenter, { width: `${COLS[7].w}%` }]}>
                    {timings}
                  </Text>
                </View>
              )
            })}

            <Text style={styles.legend}>Legend: M = Morning, A = Afternoon, E = Evening, N = Night</Text>
          </View>
        )}

        {/* Follow-up */}
        {(followUp.durationValue > 0 || followUp.date || followUp.note) && (
          <View style={[styles.section, styles.card]}>
            <Text style={styles.cardTitle}>Follow-up Plan</Text>
            <View style={{ marginTop: 4 }}>
              <View style={styles.rowSpace}>
                <Text style={styles.label}>Next Follow Up</Text>
                <Text style={styles.value}>
                  {followUp.durationValue > 0 && followUp.durationUnit
                    ? `After ${followUp.durationValue} ${followUp.durationUnit}`
                    : '—'}
                  {followUp.date ? ` (${followUp.date})` : ''}
                </Text>
              </View>

              {followUp.note && (
                <View style={{ marginTop: 6 }}>
                  <Text style={styles.label}>Note</Text>
                  <Text>{followUp.note}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Signature */}
        <View style={styles.signatureBlock}>
          <View>
            <Text style={{ marginBottom: 5 }}>{doctorData?.doctorName ?? ''}</Text>
            <Text style={{ marginBottom: 5 }}>
              {doctorData?.qualification ?? ''}
              {doctorData?.specialization ? ` (${doctorData.specialization})` : ''}
            </Text>
            <Text>Licence: {doctorData?.doctorLicence ?? ''}</Text>
          </View>
          <View style={{ marginTop: 15 }}>
            <Text>Doctor's Signature</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

export default PrescriptionPDF
