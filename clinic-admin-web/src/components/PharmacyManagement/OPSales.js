// OPSales UI — integrated with functionality (no static/dummy data)
// Screenshot path (for reference only): /mnt/data/WhatsApp Image 2025-11-19 at 09.50.22.jpeg

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
import CIcon from '@coreui/icons-react'
import { cilSave, cilPrint, cilMagnifyingGlass, cilPencil, cilTrash } from '@coreui/icons'

// NOTE: This component preserves your existing state names and behaviour.
// It expects a function `getAllOpSales()` to be available in the scope where you import this component
// (you already used it earlier). Do NOT add hard-coded rows; data must come from API (OpsaleData).

const OPSales = ({ getAllOpSales }) => {
  const [OpsaleData, setOpSaleData] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [billNo, setBillNo] = useState('')
  const [financialYear, setFinancialYear] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusFilters, setStatusFilters] = useState('')
  const [patientDetails, setPatientDetails] = useState({})
  const [roomDetails, setRoomDetails] = useState({})
  const [opNo, setOpNo] = useState('')
  const [selectionType, setSelectionType] = useState('')
  const [selectionBy, setSelectionBy] = useState('')
  const [medName, setMedName] = useState('')
  const [editIndex, setEditIndex] = useState(null)
  const [rackNo, setRackNo] = useState('')
  const [vat, setVat] = useState('')
  const [vatAmount, setVatAmount] = useState('')
  const [currentStock, setCurrentStock] = useState('')
  const [batchNo, setBatchNo] = useState('')
  const [qty, setQty] = useState('')
  const [rate, setRate] = useState('')
  const [discPerc, setDiscPerc] = useState('')
  const [discAmt, setDiscAmt] = useState('')
  const [totalAmt, setTotalAmt] = useState('')
  const [expDate, setExpDate] = useState('')
  const [mrp, setMrp] = useState('')

  const [formRow, setFormRow] = useState({
    medicineName: '',
    batchNo: '',
    qty: '',
    rate: '',
    disc: '',
    vatPercent: '',
    paidAmt: '',
  })

  // Local derived totals
  const [totals, setTotals] = useState({ totalAmt: 0, totalTax: 0, netAmt: 0 })

  useEffect(() => {
    loadOpSales()
  }, [])

  // ---------------- GET ALL PURCHASES ----------------
  const loadOpSales = async () => {
    if (!getAllOpSales) return // function not provided
    setLoading(true)
    try {
      const data = await getAllOpSales()
      // Expecting `data` to be an array of rows matching the table shape
      setOpSaleData(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('loadOpSales error', err)
      setOpSaleData([])
    } finally {
      setLoading(false)
    }
  }

  // Handle input change for form row
  const handleRowChange = (e) => {
    const { name, value } = e.target
    setFormRow((prev) => ({ ...prev, [name]: value }))
  }

  // Add new row or update existing
  const handleAddOrUpdate = () => {
    // compute numeric fields carefully (digit-by-digit as required by instruction)
    const qty = Number(formRow.qty) || 0
    const rate = Number(formRow.rate) || 0
    const discPct = Number(formRow.disc) || 0
    const vatPct = Number(formRow.vatPercent) || 0

    const total = Number((qty * rate).toFixed(2))
    const discAmount = Number(((discPct / 100) * total).toFixed(2))
    const netBeforeVat = Number((total - discAmount).toFixed(2))
    const vatAmount = Number(((vatPct / 100) * netBeforeVat).toFixed(2))
    const netAmt = Number((netBeforeVat + vatAmount).toFixed(2))

    const newRow = {
      medicineName: formRow.medicineName,
      batchNo: formRow.batchNo,
      qty,
      rate,
      total,
      disc: discPct,
      discAmount,
      vatPercent: vatPct,
      vatAmount,
      netAmt,
      paidAmt: Number(formRow.paidAmt) || 0,
      // you can extend with additional fields returned by API later
    }

    if (editIndex !== null && editIndex >= 0 && editIndex < OpsaleData.length) {
      const updated = [...OpsaleData]
      updated[editIndex] = { ...updated[editIndex], ...newRow }
      setOpSaleData(updated)
      setEditIndex(null)
    } else {
      // append
      setOpSaleData((prev) => [...prev, newRow])
    }

    // reset form
    setFormRow({
      medicineName: '',
      batchNo: '',
      qty: '',
      rate: '',
      disc: '',
      vatPercent: '',
      paidAmt: '',
    })
  }

  const handleEdit = (index) => {
    const row = OpsaleData[index]
    if (!row) return
    setFormRow({
      medicineName: row.medicineName || '',
      batchNo: row.batchNo || '',
      qty: row.qty || '',
      rate: row.rate || '',
      disc: row.disc || '',
      vatPercent: row.vatPercent || '',
      paidAmt: row.paidAmt || '',
    })
    setEditIndex(index)
  }

  const handleDelete = (index) => {
    const filtered = OpsaleData.filter((_, i) => i !== index)
    setOpSaleData(filtered)
    // if we were editing that row, reset
    if (editIndex === index) {
      setEditIndex(null)
      setFormRow({
        medicineName: '',
        batchNo: '',
        qty: '',
        rate: '',
        disc: '',
        vatPercent: '',
        paidAmt: '',
      })
    }
  }

  // Recalculate totals whenever OpsaleData changes
  useEffect(() => {
    let totalAmt = 0
    let totalTax = 0
    let netAmt = 0
    OpsaleData.forEach((r) => {
      totalAmt += Number(r.total) || 0
      totalTax += Number(r.vatAmount) || 0
      netAmt += Number(r.netAmt) || 0
    })
    setTotals({
      totalAmt: Number(totalAmt.toFixed(2)),
      totalTax: Number(totalTax.toFixed(2)),
      netAmt: Number(netAmt.toFixed(2)),
    })
  }, [OpsaleData])

  return (
    <div
      className="p-3"
      style={{ background: '#E5F8FF', border: '3px solid #00AEEF', borderRadius: '10px' }}
    >
      {/* TOP HEADER */}
      <CRow className="align-items-center mb-2">
        <CCol sm={3}>
          <h5 className="fw-bold text-primary">Sales</h5>
        </CCol>
        <CCol sm={2} className="d-flex align-items-center">
          <CFormLabel className="me-2 fw-bold">Bill.No :</CFormLabel>
          <span style={{ fontWeight: 700 }}>{billNo || ''}</span>
        </CCol>

        <CCol sm={7} className="d-flex justify-content-end gap-2 align-items-center">
          <div className="d-flex align-items-center">
            <CFormLabel className="me-2">From</CFormLabel>
            <CFormInput
              type="date"
              size="sm"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{ width: 140 }}
            />
          </div>

          <div className="d-flex align-items-center">
            <CFormLabel className="me-2">To</CFormLabel>
            <CFormInput
              type="date"
              size="sm"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{ width: 140 }}
            />
          </div>

          <div className="d-flex align-items-center">
            <CFormLabel className="ms-2 fw-bold">Financial Year :</CFormLabel>
            <span style={{ marginLeft: 8 }}>{financialYear}</span>
          </div>

          <CFormInput
            type="date"
            size="sm"
            defaultValue={new Date().toISOString().slice(0, 10)}
            style={{ width: 140 }}
          />
          <CFormInput
            type="time"
            size="sm"
            defaultValue={new Date().toTimeString().slice(0, 8)}
            style={{ width: 110 }}
          />
        </CCol>
      </CRow>

      {/* OUT/IN PATIENT + OPNO + PAYCATEGORY + DATETIME */}
      <CRow className="mb-3">
        <CCol sm={3} className="d-flex align-items-center gap-3">
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="statusRadio"
              id="outPatient"
              value="outPatient"
              checked={statusFilters === 'outPatient'}
              onChange={() => setStatusFilters('outPatient')}
            />
            <label className="form-check-label ms-2" htmlFor="outPatient">
              Out Patient
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="statusRadio"
              id="inPatient"
              value="inPatient"
              checked={statusFilters === 'inPatient'}
              onChange={() => setStatusFilters('inPatient')}
            />
            <label className="form-check-label ms-2" htmlFor="inPatient">
              In Patient
            </label>
          </div>
        </CCol>

        <CCol sm={2} className="d-flex align-items-center">
          <CFormLabel className="mb-0 me-2" style={{ whiteSpace: 'nowrap' }}>
            OPNO:
          </CFormLabel>
          <CFormInput
            type="text"
            placeholder="Enter OPNO"
            style={{ height: 30, width: 120 }}
            value={opNo}
            onChange={(e) => setOpNo(e.target.value)}
          />
        </CCol>

        <CCol sm={3} className="d-flex align-items-center">
          <CFormLabel className="mb-0 me-2 fw-bold" style={{ whiteSpace: 'nowrap' }}>
            Pay Category:
          </CFormLabel>
          <CFormSelect
            disabled
            value="SELF PAY"
            className="bg-light"
            style={{ height: 30, width: 130 }}
          >
            <option>SELF PAY</option>
          </CFormSelect>
        </CCol>

        <CCol sm={4}>
          <div className="d-flex align-items-center justify-content-end">
            <CFormLabel className="fw-bold mb-0 me-2" style={{ whiteSpace: 'nowrap' }}>
              Bill Date & Time:
            </CFormLabel>
            <CFormInput
              type="datetime-local"
              defaultValue={new Date().toISOString().slice(0, 19)}
              style={{ height: 30, width: 220 }}
            />
          </div>
        </CCol>
      </CRow>

      {/* Patient blocks */}
      <div style={{ display: 'flex', gap: 12 }}>
        <div
          style={{
            position: 'relative',
            flex: 1,
            border: '2px solid #7DC2FF',
            borderRadius: 6,
            padding: 12,
            background: 'white',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -12,
              left: 16,
              background: 'white',
              padding: '0 8px',
              fontWeight: 'bold',
              color: '#007BFF',
            }}
          >
            Patient Details
          </div>
          <div className="d-flex mb-1 align-items-center">
            <CFormLabel className="fw-bold mb-0 me-2" style={{ width: 60 }}>
              Name:
            </CFormLabel>
            <span className="fw-semibold">{patientDetails?.name || '--'}</span>
          </div>
          <div className="d-flex mb-1 align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <CFormLabel className="fw-bold mb-0 me-2" style={{ width: 60 }}>
                Age:
              </CFormLabel>
              <span className="fw-semibold">{patientDetails?.age || '--'}</span>
            </div>
            <div className="d-flex align-items-center">
              <CFormLabel className="fw-bold mb-0 me-2">Sex:</CFormLabel>
              <span className="fw-semibold">{patientDetails?.sex || '--'}</span>
            </div>
          </div>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <CFormLabel className="fw-bold mb-0 me-2" style={{ width: 60 }}>
                M.Status:
              </CFormLabel>
              <span className="fw-semibold">{patientDetails?.maritalStatus || '--'}</span>
            </div>
            <div className="d-flex align-items-center">
              <CFormLabel className="fw-bold mb-0 me-2">Cons.Doc:</CFormLabel>
              <span className="fw-semibold">{patientDetails?.consultingDoctor || '--'}</span>
            </div>
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            flex: 1,
            border: '2px solid #7DC2FF',
            borderRadius: 6,
            padding: 12,
            background: 'white',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -12,
              left: 16,
              background: 'white',
              padding: '0 8px',
              fontWeight: 'bold',
              color: '#007BFF',
            }}
          >
            Patient Type & Room Details
          </div>
          <div className="d-flex mb-1 align-items-center">
            <CFormLabel className="fw-bold mb-0" style={{ width: 120 }}>
              Pat.Type:
            </CFormLabel>
            <span className="fw-semibold">{roomDetails?.patientType || '--'}</span>
          </div>
          <div className="d-flex mb-1 align-items-center">
            <CFormLabel className="fw-bold mb-0" style={{ width: 120 }}>
              Referral:
            </CFormLabel>
            <span className="fw-semibold">{roomDetails?.referral || '--'}</span>
          </div>
          <div className="d-flex align-items-center">
            <CFormLabel className="fw-bold mb-0" style={{ width: 120 }}>
              Reg.Date:
            </CFormLabel>
            <span className="fw-semibold">{roomDetails?.regDate || '--'}</span>
          </div>
        </div>
      </div>

      {/* Entry controls */}
      <CRow className="mb-3 mt-3">
        <CCol sm={3} className="d-flex align-items-center">
          <CFormLabel className="mb-0 me-2">Selection Type:</CFormLabel>
          <CFormSelect
            value={selectionType}
            onChange={(e) => setSelectionType(e.target.value)}
            className="bg-light"
            style={{ height: 30, width: 130 }}
          >
            <option value="">SINGLE</option>
          </CFormSelect>
        </CCol>
        <CCol sm={3} className="d-flex align-items-center">
          <CFormLabel className="mb-0 me-2">Selection by:</CFormLabel>
          <CFormSelect
            value={selectionBy}
            onChange={(e) => setSelectionBy(e.target.value)}
            className="bg-light"
            style={{ height: 30, width: 130 }}
          >
            <option value="">NAME</option>
          </CFormSelect>
        </CCol>

        <CCol sm={4} className="d-flex align-items-center">
          <CFormLabel className="mb-0 me-2">Med Name:</CFormLabel>
          <CFormInput
            value={medName}
            onChange={(e) => setMedName(e.target.value)}
            placeholder="Start typing med name"
            style={{
              border: 'none',
              borderBottom: '2px solid #9b9fa4',
              background: 'transparent',
              width: 260,
            }}
          />
        </CCol>

        <CCol sm={1} className="d-flex align-items-center">
          <CFormCheck id="returnsCheck" label="Include Returns" />
        </CCol>

        <CCol sm={1} className="d-flex align-items-center justify-content-end">
          <CButton color="primary" size="sm" onClick={handleAddOrUpdate}>
            {editIndex !== null ? 'Update' : 'Update Stock'}
          </CButton>
        </CCol>
      </CRow>
      <div
        className="p-2 mb-2"
        style={{
          border: '2px solid #7bbcff',
          background: '#eaf5ff',
          borderRadius: '4px',
        }}
      >
        <div className="d-flex align-items-end gap-3">
          {/* Left side labels */}
          <div className="text-center">
            <label className="fw-bold small">Rack No</label>
          </div>

          <div className="text-center">
            <label className="fw-bold small">VAT</label>
          </div>

          <div className="text-center">
            <label className="fw-bold small">VAT Amt</label>
          </div>

          <div className="text-center">
            <label className="fw-bold small">Curr. Stock</label>
          </div>

          {/* Batch No */}
          <div className="d-flex flex-column">
            <label className="fw-bold small">Batch No</label>
            <CFormInput
              value={batchNo}
              onChange={(e) => setBatchNo(e.target.value)}
              className="border border-secondary"
              style={{ width: '120px', height: '28px' }}
            />
          </div>

          {/* Req Qty */}
          <div className="d-flex flex-column">
            <label className="fw-bold small">Req Qty</label>
            <CFormInput
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="border border-secondary"
              style={{ width: '80px', height: '28px' }}
            />
          </div>

          {/* Rate */}
          <div className="d-flex flex-column">
            <label className="fw-bold small">Rate</label>
            <CFormInput
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="border border-secondary"
              style={{ width: '80px', height: '28px' }}
            />
          </div>

          {/* Disc % */}
          <div className="d-flex flex-column">
            <label className="fw-bold small">Disc %</label>
            <CFormInput
              value={discPerc}
              onChange={(e) => setDiscPerc(e.target.value)}
              className="border border-secondary"
              style={{ width: '80px', height: '28px' }}
            />
          </div>

          {/* Disc Amt */}
          <div className="d-flex flex-column">
            <label className="fw-bold small">Disc Amt</label>
            <CFormInput
              value={discAmt}
              onChange={(e) => setDiscAmt(e.target.value)}
              className="border border-secondary"
              style={{ width: '90px', height: '28px' }}
            />
          </div>

          {/* Total Amt */}
          <div className="d-flex flex-column">
            <label className="fw-bold small">Total Amt</label>
            <CFormInput
              value={totalAmt}
              onChange={(e) => setTotalAmt(e.target.value)}
              className="border border-secondary"
              style={{ width: '100px', height: '28px' }}
            />
          </div>

          {/* Exp Date */}
          <div className="d-flex flex-column">
            <label className="fw-bold small">Exp Date</label>
            <CFormInput
              type="date"
              value={expDate}
              onChange={(e) => setExpDate(e.target.value)}
              className="border border-secondary"
              style={{ width: '140px', height: '28px' }}
            />
          </div>

          {/* MRP */}
          <div className="text-center">
            <label className="fw-bold small">MRP</label>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div style={{ position: 'relative', marginTop: 8 }}>
        <CTable bordered hover>
          <CTableHead style={{ background: '#7DC2FF' }}>
            <CTableRow>
              <CTableHeaderCell style={{ width: '40px' }}>Sno</CTableHeaderCell>
              <CTableHeaderCell>Medicine Name</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '100px' }}>BatchNo</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '70px' }}>Qty</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '90px' }}>Rate</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '70px' }}>Total</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '60px' }}>Disc</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '70px' }}>DiscAmt</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '100px' }}>NetAmt</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '80px' }}>VAT%</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '60px' }}>PaidAmt</CTableHeaderCell>
              <CTableHeaderCell style={{ width: '80px' }}>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {loading && (
              <CTableRow>
                <CTableDataCell colSpan={12} className="text-center">
                  Loading Opsales...
                </CTableDataCell>
              </CTableRow>
            )}

            {!loading && OpsaleData.length === 0 && (
              <CTableRow>
                <CTableDataCell colSpan={12} className="text-center">
                  No records
                </CTableDataCell>
              </CTableRow>
            )}

            {!loading &&
              OpsaleData.map((item, index) => (
                <CTableRow key={index}>
                  <CTableDataCell>{index + 1}</CTableDataCell>
                  <CTableDataCell>{item.medicineName}</CTableDataCell>
                  <CTableDataCell>{item.batchNo}</CTableDataCell>
                  <CTableDataCell>{item.qty}</CTableDataCell>
                  <CTableDataCell>{item.rate}</CTableDataCell>
                  <CTableDataCell>{item.total}</CTableDataCell>
                  <CTableDataCell>{item.disc}</CTableDataCell>
                  <CTableDataCell>{item.discAmount}</CTableDataCell>
                  <CTableDataCell>{item.netAmt}</CTableDataCell>
                  <CTableDataCell>{item.vatPercent}</CTableDataCell>
                  <CTableDataCell>{item.paidAmt}</CTableDataCell>
                  <CTableDataCell>
                    <CButton size="sm" color="light" onClick={() => handleEdit(index)} title="Edit">
                      <CIcon icon={cilPencil} />
                    </CButton>
                    <CButton
                      size="sm"
                      color="danger"
                      onClick={() => handleDelete(index)}
                      className="ms-1"
                      title="Delete"
                    >
                      <CIcon icon={cilTrash} />
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
          </CTableBody>
        </CTable>

        {/* TOTALS */}
        <CCardBody style={{ padding: '10px 0 0 0' }}>
          <CRow className="g-2 border-bottom pb-2">
            <CCol md={3}>
              <CRow className="mb-2">
                <CCol xs={6}>
                  <CFormLabel className="text-end fw-bold mb-0">Total Amt</CFormLabel>
                </CCol>
                <CCol xs={6}>
                  <CFormInput disabled value={totals.totalAmt} className="text-end bg-light" />
                </CCol>
              </CRow>

              <CRow className="mb-2">
                <CCol xs={6}>
                  <CFormLabel className="text-end fw-bold mb-0">Disc(%)</CFormLabel>
                </CCol>
                <CCol xs={6}>
                  <CFormInput disabled value={0} className="text-end bg-light" />
                </CCol>
              </CRow>
              <CRow className="mb-2">
                <CCol xs={6}>
                  <CFormLabel className="text-end mb-0">DiscAmt</CFormLabel>
                </CCol>
                <CCol xs={6}>
                  <CFormInput disabled value={0} className="text-end bg-light" />
                </CCol>
              </CRow>

  <CRow>
                
              </CRow>
              <CRow className="mb-2">
                <CCol xs={6}>
                  <CFormLabel className="text-end fw-bold mb-0">Net Amt</CFormLabel>
                </CCol>
                <CCol xs={6}>
                  <CFormInput disabled value={totals.netAmt} className="text-end bg-light" />
                </CCol>
              </CRow>          
            </CCol>
                  <CCol md={3}>
              {['Paid Amt', 'Balance Amt', 'DuePaid','Total Tax'].map((item) => (
                <CRow className="mb-2" key={item}>
                  <CCol xs={6}>
                    <CFormLabel className="text-end fw-bold mb-0">{item}</CFormLabel>
                  </CCol>
                  <CCol xs={6}>
                    <CFormInput disabled value={0} className="text-end bg-light" />
                  </CCol>
                </CRow>
              ))}

              <CRow>
                <CCol xs={6}>
                  <CFormLabel className="fw-bold mb-0">Bill Due Date</CFormLabel>
                </CCol>
                <CCol xs={6}>
                  <CFormInput
                    type="date"
                    disabled
                    value={new Date().toISOString().slice(0, 10)}
                    className="bg-light"
                  />
                </CCol>
              </CRow>
            </CCol>

            <CCol md={3}>
              {['SGST', 'CGST', 'IGST', 'CST'].map((tax) => (
                <CRow className="mb-2" key={tax}>
                  <CCol xs={6}>
                    <CFormLabel className="text-end fw-bold mb-0">{tax}</CFormLabel>
                  </CCol>
                  <CCol xs={6}>
                    <CFormInput disabled value={0} className="text-end bg-light" />
                  </CCol>
                </CRow>
              ))}
            </CCol>

            <CCol md={3}>
              {['Total Tax', 'Final Total', 'Previous Adj', 'Net Payable'].map((item) => (
                <CRow className="mb-2" key={item}>
                  <CCol xs={6}>
                    <CFormLabel className="text-end fw-bold mb-0">{item}</CFormLabel>
                  </CCol>
                  <CCol xs={6}>
                    <CFormInput
                      disabled
                      value={item === 'Total Tax' ? totals.totalTax : 0}
                      className="text-end bg-light"
                    />
                  </CCol>
                </CRow>
              ))}
            </CCol>

      

            
          </CRow>
        </CCardBody>
      </div>

      {/* SEARCH / NAV */}
      <div
        className="d-flex align-items-center mt-3"
        style={{
          background: '#E8F3FF',
          padding: '6px 10px',
          borderRadius: 6,
          border: '1px solid #B5D9FF',
        }}
      >
        <CFormLabel className="fw-bold me-2 mb-0">Search</CFormLabel>
        <CFormInput
          type="text"
          placeholder="Search here..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 160, height: 30 }}
          className="me-3"
        />

        <CFormLabel className="fw-bold me-2 mb-0">From</CFormLabel>
        <CFormInput
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          style={{ width: 120, height: 30 }}
          className="me-3"
        />

        <CFormLabel className="fw-bold me-2 mb-0">To</CFormLabel>
        <CFormInput
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          style={{ width: 120, height: 30 }}
          className="me-3"
        />

        

        <CIcon icon={cilSave} size="lg" className="mx-1" style={{ cursor: 'pointer' }} />
        <CIcon icon={cilPrint} size="lg" className="mx-1" style={{ cursor: 'pointer' }} />
        <CIcon icon={cilMagnifyingGlass} size="lg" className="mx-1" style={{ cursor: 'pointer' }} />

 <CButton color="light" size="sm">
            {editIndex !== null ? 'Update' : 'PrintTextBill'}
          </CButton>
        <div className="ms-auto d-flex gap-2">
         <CFormCheck
              type="checkbox"
              id="displayOpSaleDetails"
              label="Include Returns"
              className="me-4 text-dark"
            />
        </div>
      </div>
    </div>
  )
}

export default OPSales
