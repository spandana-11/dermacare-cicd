import React, { useState, useEffect } from 'react'
import {
  CRow,
  CCol,
  CFormLabel,
  CFormInput,
  CFormCheck,
  CFormSelect,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CCardBody,
} from '@coreui/react'
import { Edit2, Trash } from 'lucide-react'

const SalesReturns = () => {
  const [patientType, setPatientType] = useState('DIRECT')
  const [billNo, setBillNo] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [batchWise, setBatchWise] = useState(false)

  const [patientDetails] = useState({
   
  })

  const [rows, setRows] = useState([])
  const [form, setForm] = useState({
    medicineName: '',
    qty: '',
    rate: '',
    disc: '',
    vat: '',
  })

  const [editIndex, setEditIndex] = useState(null)

  // ---------------- CALCULATIONS ----------------
  const calculateRow = (row) => {
    const qty = Number(row.qty || 0)
    const rate = Number(row.rate || 0)
    const disc = Number(row.disc || 0)
    const vat = Number(row.vat || 0)

    const total = qty * rate
    const discAmt = (total * disc) / 100
    const netBeforeVat = total - discAmt
    const vatAmt = (netBeforeVat * vat) / 100
    const netAmt = netBeforeVat + vatAmt

    return {
      ...row,
      total: total.toFixed(2),
      discAmt: discAmt.toFixed(2),
      netAmt: netAmt.toFixed(2),
    }
  }

  const totals = rows.reduce(
    (acc, r) => {
      acc.total += Number(r.total || 0)
      acc.vat += (Number(r.netAmt || 0) - Number(r.total || 0))
      acc.net += Number(r.netAmt || 0)
      return acc
    },
    { total: 0, vat: 0, net: 0 },
  )

  // ---------------- HANDLERS ----------------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleAdd = () => {
    const newRow = calculateRow(form)

    if (editIndex !== null) {
      const updated = [...rows]
      updated[editIndex] = newRow
      setRows(updated)
      setEditIndex(null)
    } else {
      setRows([...rows, newRow])
    }

    setForm({ medicineName: '', qty: '', rate: '', disc: '', vat: '' })
  }

  const handleEdit = (index) => {
    setForm(rows[index])
    setEditIndex(index)
  }

  const handleDelete = (index) => {
    setRows(rows.filter((_, i) => i !== index))
  }

  // ---------------- UI ----------------
  return (
    <div className="p-3" style={{ fontSize: '13px' }}>
      <h5 className="fw-bold mb-3">Sales Returns</h5>

      {/* HEADER */}
      <CRow className="mb-3 align-items-center">
        <CCol md={3}>
          <CFormLabel className="fw-bold">Bill No</CFormLabel>
          <CFormSelect size="sm" value={billNo} onChange={(e) => setBillNo(e.target.value)}>
            <option>Select</option>
            <option>3212</option>
            <option>3213</option>
          </CFormSelect>
        </CCol>

       

        <CCol md={3}>
          <CFormLabel className="fw-bold">From</CFormLabel>
          <CFormInput type="date" size="sm" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </CCol>

        <CCol md={3}>
          <CFormLabel className="fw-bold">To</CFormLabel>
          <CFormInput type="date" size="sm" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </CCol>
      </CRow>

      {/* PATIENT TYPE */}
      <CRow className="mb-2">
        {['DIRECT', 'OUT PATIENT'].map((type) => (
          <CCol md={2} key={type}>
            <CFormCheck
              type="radio"
              name="patientType"
              label={type}
              checked={patientType === type}
              onChange={() => setPatientType(type)}
            />
          </CCol>
        ))}
        
      </CRow>

      {/* PATIENT DETAILS */}
      <div className="border p-2 mb-3">
        <div><strong>Name :</strong> {patientDetails.name}</div>
        <div><strong>Address :</strong> {patientDetails.address}</div>
        <div><strong>Mobile No :</strong> {patientDetails.mobile}</div>
      </div>

      {/* ENTRY FORM */}
     <CRow className="g-2 mb-3 align-items-end">

  {/* Medicine Name */}
  <CCol md={3}>
    <CFormLabel className="fw-bold small">Medicine Name</CFormLabel>
    <CFormInput
      name="medicineName"
      value={form.medicineName}
      onChange={handleChange}
      placeholder="Medicine Name"
      size="sm"
    />
  </CCol>

  {/* Issued Qty */}
  <CCol md={1}>
    <CFormLabel className="fw-bold small">Issued Qty</CFormLabel>
    <CFormInput
      name="issuedQty"
      value={form.issuedQty}
      disabled
      size="sm"
    />
  </CCol>

  {/* Return Qty */}
  <CCol md={1}>
    <CFormLabel className="fw-bold small">Return Qty</CFormLabel>
    <CFormInput
      name="returnQty"
      value={form.returnQty}
      onChange={handleChange}
      size="sm"
    />
  </CCol>

  {/* Rate */}
  <CCol md={1}>
    <CFormLabel className="fw-bold small">Rate</CFormLabel>
    <CFormInput
      name="rate"
      value={form.rate}
      onChange={handleChange}
      size="sm"
    />
  </CCol>

  {/* Disc % */}
  <CCol md={1}>
    <CFormLabel className="fw-bold small">Disc %</CFormLabel>
    <CFormInput
      name="disc"
      value={form.disc}
      onChange={handleChange}
      size="sm"
    />
  </CCol>

  {/* Disc Amt */}
  <CCol md={1}>
    <CFormLabel className="fw-bold small">Disc Amt</CFormLabel>
    <CFormInput
      name="discAmt"
      value={form.discAmt}
      disabled
      size="sm"
    />
  </CCol>

  {/* Total Amt */}
  <CCol md={1}>
    <CFormLabel className="fw-bold small">Total Amt</CFormLabel>
    <CFormInput
      name="totalAmt"
      value={form.totalAmt}
      disabled
      size="sm"
    />
  </CCol>

  {/* Batch No */}
  <CCol md={2}>
    <CFormLabel className="fw-bold small">Batch No</CFormLabel>
    <CFormInput
      name="batchNo"
      value={form.batchNo}
      onChange={handleChange}
      size="sm"
    />
  </CCol>

  {/* Exp Date */}
  <CCol md={1}>
    <CFormLabel className="fw-bold small">Exp Date</CFormLabel>
    <CFormInput
      type="date"
      name="expDate"
      value={form.expDate}
      onChange={handleChange}
      size="sm"
    />
  </CCol>

</CRow>


      <CButton size="sm" color="dark" onClick={handleAdd}>
        {editIndex !== null ? 'Update' : 'Add'}
      </CButton>

      {/* TABLE */}
      <div className="mt-3">
        <CTable bordered hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>S.No</CTableHeaderCell>
              <CTableHeaderCell>Medicine Name</CTableHeaderCell>
              <CTableHeaderCell>Qty</CTableHeaderCell>
              <CTableHeaderCell>Rate</CTableHeaderCell>
               <CTableHeaderCell>Disc(%)</CTableHeaderCell>
              <CTableHeaderCell>DiscAmt</CTableHeaderCell>

              <CTableHeaderCell>Total</CTableHeaderCell>
              <CTableHeaderCell>NetAmt</CTableHeaderCell>
              <CTableHeaderCell>VAT %</CTableHeaderCell>

              <CTableHeaderCell>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {rows.length === 0 && (
              <CTableRow>
                <CTableDataCell colSpan={8} className="text-center">
                  No records found
                </CTableDataCell>
              </CTableRow>
            )}

            {rows.map((r, i) => (
              <CTableRow key={i}>
                <CTableDataCell>{i + 1}</CTableDataCell>
                <CTableDataCell>{r.medicineName}</CTableDataCell>
                <CTableDataCell>{r.qty}</CTableDataCell>
                <CTableDataCell>{r.rate}</CTableDataCell>
                <CTableDataCell>{r.total}</CTableDataCell>
                <CTableDataCell>{r.disc}</CTableDataCell>

                <CTableDataCell>{r.discAmt}</CTableDataCell>
                <CTableDataCell>{r.netAmt}</CTableDataCell>
                <CTableDataCell>{r.vat}</CTableDataCell>

                <CTableDataCell>
                  <Edit2 size={16} onClick={() => handleEdit(i)} style={{ cursor: 'pointer' }} />
                  <Trash size={16} className="ms-2" onClick={() => handleDelete(i)} style={{ cursor: 'pointer' }} />
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </div>

      {/* SUMMARY */}
    <CCardBody className="mt-3 border-top pt-3">
  <CRow className="g-3">

    {/* LEFT BLOCK */}
    <CCol md={4}>
      <CRow className="mb-2">
        <CCol xs={6}>
          <CFormLabel className="fw-bold text-end mb-0">Total Amt</CFormLabel>
        </CCol>
        <CCol xs={6}>
          <CFormInput
            disabled
            value={totals.total.toFixed(2)}
            className="text-end bg-light"
            size="sm"
          />
        </CCol>
      </CRow>

      <CRow className="mb-2">
        <CCol xs={6}>
          <CFormLabel className="fw-bold text-end mb-0">Disc (%)</CFormLabel>
        </CCol>
        <CCol xs={6}>
          <CFormInput
            disabled
            value={0}
            className="text-end bg-light"
            size="sm"
          />
        </CCol>
      </CRow>

      <CRow className="mb-2">
        <CCol xs={6}>
          <CFormLabel className="fw-bold text-end mb-0">Disc Amt</CFormLabel>
        </CCol>
        <CCol xs={6}>
          <CFormInput
            disabled
            value={0}
            className="text-end bg-light"
            size="sm"
          />
        </CCol>
      </CRow>

      <CRow>
        <CCol xs={6}>
          <CFormLabel className="fw-bold text-end mb-0">Net Amt</CFormLabel>
        </CCol>
        <CCol xs={6}>
          <CFormInput
            disabled
            value={totals.net.toFixed(2)}
            className="text-end bg-light"
            size="sm"
          />
        </CCol>
      </CRow>
    </CCol>

    {/* MIDDLE BLOCK */}
    <CCol md={4}>
      <CRow className="mb-2">
        <CCol xs={6}>
          <CFormLabel className="fw-bold text-end mb-0">Paid Amt</CFormLabel>
        </CCol>
        <CCol xs={6}>
          <CFormInput
            disabled
            value={0}
            className="text-end bg-light"
            size="sm"
          />
        </CCol>
      </CRow>

      <CRow className="mb-2">
        <CCol xs={6}>
          <CFormLabel className="fw-bold text-end mb-0">Balance Amt</CFormLabel>
        </CCol>
        <CCol xs={6}>
          <CFormInput
            disabled
            value={0}
            className="text-end bg-light"
            size="sm"
          />
        </CCol>
      </CRow>

      <CRow>
        <CCol xs={6}>
          <CFormLabel className="fw-bold text-end mb-0">Return Amt</CFormLabel>
        </CCol>
        <CCol xs={6}>
          <CFormInput
            disabled
            value={totals.net.toFixed(2)}
            className="text-end bg-light"
            size="sm"
          />
        </CCol>
      </CRow>
    </CCol>

    {/* RIGHT BLOCK */}
    <CCol md={4}>
      <CRow className="mb-2">
        <CCol xs={5}>
          <CFormLabel className="fw-bold mb-0">VAT Amt</CFormLabel>
        </CCol>
        <CCol xs={7}>
          <CFormInput
            disabled
            value={totals.vat.toFixed(2)}
            className="bg-light"
            size="sm"
          />
        </CCol>
      </CRow>

      <CRow className="mb-2">
        <CCol xs={5}>
          <CFormLabel className="fw-bold mb-0">Reason</CFormLabel>
        </CCol>
        <CCol xs={7}>
          <CFormSelect size="sm">
            <option>RETURN</option>
            <option>DAMAGED</option>
            <option>EXPIRED</option>
          </CFormSelect>
        </CCol>
      </CRow>

      <CRow>
        <CCol xs={5}>
          <CFormLabel className="fw-bold mb-0">Auth Name</CFormLabel>
        </CCol>
        <CCol xs={7}>
          <CFormSelect size="sm">
            <option>DR. KUMAR</option>
            <option>DR. SURESH</option>
          </CFormSelect>
        </CCol>
      </CRow>
    </CCol>

  </CRow>
</CCardBody>


      {/* ACTIONS */}
      <div className="d-flex justify-content-end gap-2 mt-3">
        <CButton color="secondary">Print</CButton>
        <CButton color="info">Tracking</CButton>
        <CButton color="danger">Close</CButton>
      </div>
    </div>
  )
}

export default SalesReturns
