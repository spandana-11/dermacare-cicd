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
import { getAllOpSales } from './OpSalesAPI'
import { Edit2, Trash } from 'lucide-react'



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
       style={{
    color: 'var(--color-black)', // your text color
      fontSize: '13px',
  }}
    >
      {/* TOP HEADER */}
<CRow className="align-items-center mb-2 flex-wrap">
  <CCol xs={12} sm={2} className="d-flex align-items-center mb-2 mb-sm-0">
    <CFormLabel className="me-2 fw-bold">BillNo :</CFormLabel>
    <span className="fw-bold">{billNo || ''}</span>
  </CCol>

  <CCol xs={12} sm={10} className="d-flex flex-wrap justify-content-end gap-2 align-items-center">
    <div className="d-flex align-items-center flex-grow-1 flex-sm-grow-0">
      <CFormLabel className="me-2 fw-bold">From</CFormLabel>
      <CFormInput
        type="date"
        size="sm"
        value={dateFrom}
        onChange={(e) => setDateFrom(e.target.value)}
        style={{ minWidth: 90, maxWidth: 140, flex: 1 }}
      />
    </div>

    <div className="d-flex align-items-center flex-grow-1 flex-sm-grow-0">
      <CFormLabel className="me-2 fw-bold">To</CFormLabel>
      <CFormInput
        type="date"
        size="sm"
        value={dateTo}
        onChange={(e) => setDateTo(e.target.value)}
        style={{ minWidth: 90, maxWidth: 140, flex: 1 }}
      />
    </div>

    <div className="d-flex align-items-center flex-grow-1 flex-sm-grow-0">
      <CFormLabel className="ms-2 fw-bold mb-0">Financial Year:</CFormLabel>
      <span className="ms-2">2025-2026</span>
    </div>

    <CFormInput
      type="date"
      size="sm"
      defaultValue={new Date().toISOString().slice(0, 10)}
      style={{ minWidth: 90, maxWidth: 140, flex: 1 }}
    />
    <CFormInput
      type="time"
      size="sm"
      defaultValue={new Date().toTimeString().slice(0, 8)}
      style={{ minWidth: 90, maxWidth: 140, flex: 1 }}
    />
  </CCol>
</CRow>







      {/* OUT/IN PATIENT + OPNO + PAYCATEGORY + DATETIME */}
   <CRow className="mb-3 g-3">

  {/* Out / In Patient */}
  <CCol xs={12} sm={4} md={3} className="d-flex flex-wrap align-items-center gap-3">
    <div className="form-check d-flex align-items-center fw-bold">
      <input
        className="form-check-input "
        type="radio"
        name="statusRadio"
        id="outPatient"
        value="outPatient"
        checked={statusFilters === 'outPatient'}
        onChange={() => setStatusFilters('outPatient')}
      />
      <label className="form-check-label ms-2 Fw-bold" htmlFor="outPatient">
        Out Patient
      </label>
    </div>

    {/* <div className="form-check d-flex align-items-center">
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
    </div> */}
  </CCol>

  {/* OPNO */}
  <CCol xs={12} sm={4} md={2} className="d-flex align-items-center">
    <CFormLabel className="mb-0 me-2 fw-bold" style={{ whiteSpace: "nowrap" }}>
      OPNO:
    </CFormLabel>
    <CFormInput
      type="text"
      placeholder="Enter OPNO"
      className="w-100"
      style={{ height: 30 ,fontSize:"12px"}}
      value={opNo}
      onChange={(e) => setOpNo(e.target.value)}
    />
  </CCol>

  {/* Pay Category */}
   <CCol xs={12} sm={6} md={3} className="d-flex align-items-center">
  <CFormLabel className="mb-0 me-2 fw-bold" style={{ whiteSpace: 'nowrap' }}>
    Pay Category:
  </CFormLabel>
  <CFormSelect
    // disabled
    value="SELF PAY"
    className="bg-light w-100"
    style={{ height: '30px', fontSize: '12px' }}
  >
    <option value="">Select Pay Category</option>
    <option value="SELF PAY">SELF PAY</option>
    <option value="INSURANCE">INSURANCE</option>
    <option value="CORPORATE">CORPORATE</option>
    <option value="GOVERNMENT SCHEME">GOVERNMENT SCHEME</option>
    <option value="OTHER">OTHER</option>
  </CFormSelect>
</CCol>


  {/* Bill Date & Time */}
 <CCol xs={12} md={4}>
  <div className="d-flex flex-wrap align-items-center justify-content-md-end gap-2">
    <CFormLabel className="fw-bold mb-0" style={{ whiteSpace: "nowrap" }}>
      Bill Date & Time:
    </CFormLabel>

    <CFormInput
      type="datetime-local"
      defaultValue={new Date().toISOString().slice(0, 19)}
      style={{
        height: 28,
        width: 170,     // reduced width
       fontSize:"12px" ,// smaller text
        padding: "2px 6px",
      }}
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
            border: '2px solid var(--color-black)',
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
              color: 'var(--color-black)',
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

        {/* <div
          style={{
            position: 'relative',
            flex: 1,
            border: '2px solid var(--color-black)',
            borderRadius: 6,
            padding: 12,
            background: 'white',
          }}
        > */}
          {/* <div
            style={{
              position: 'absolute',
              top: -12,
              left: 16,
              background: 'white',
              padding: '0 8px',
              fontWeight: 'bold',
              color: 'var(--color-black)',
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
          </div> */}
        {/* </div> */}
      </div>

      {/* Entry controls */}
    <CRow className="mb-3 mt-3 g-3">

  {/* Selection Type */}
  <CCol xs={12} sm={6} md={3} className="d-flex align-items-center">
    <CFormLabel className="mb-0 me-2">Selection Type:</CFormLabel>
   <CFormSelect
  value={selectionType}
  onChange={(e) => setSelectionType(e.target.value)}
  className="bg-light"
  style={{ height: 30, fontSize: "12px" }}
>
  <option value="single">SINGLE</option>
  <option value="multiple">MULTIPLE</option>
  <option value="all">ALL</option>
</CFormSelect>

  </CCol>

  {/* Selection By */}
  <CCol xs={12} sm={6} md={3} className="d-flex align-items-center">
    <CFormLabel className="mb-0 me-2">Selection By:</CFormLabel>

  <CFormSelect
  value={selectionBy}
  onChange={(e) => setSelectionBy(e.target.value)}
  className="bg-light"
  style={{ height: 30, fontSize: "12px" }}
>
  <option value="name">NAME</option>
  <option value="code">CODE</option>
  <option value="generic">GENERIC</option>
  <option value="barcode">BARCODE</option>
  <option value="rackno">RACK NO</option>
</CFormSelect>

  </CCol>

  {/* Med Name */}
  <CCol xs={12} md={4} className="d-flex align-items-center">
    <CFormLabel className="mb-0 me-2">Med Name:</CFormLabel>
    <CFormInput
      value={medName}
      onChange={(e) => setMedName(e.target.value)}
      placeholder="Enter medicine name"
      className="flex-grow-1"
      style={{
        // border: 'none',
        // borderBottom: '2px solid var(--color-black)',
        background: 'transparent',fontSize:"12px"
      }}
    />
  </CCol>

  {/* Include Returns */}
  <CCol xs={6} sm={4} md={1} className="d-flex align-items-center">
    <CFormCheck id="returnsCheck" label="Include Returns" />
  </CCol>

  {/* Button */}
  <CCol xs={6} sm={4} md={1} className="d-flex align-items-center justify-content-end">
    <CButton   style={{ backgroundColor: 'var(--color-black)', color: 'white' }}  size="sm" onClick={handleAddOrUpdate}>
      {editIndex !== null ? 'Update' : 'Update Stock'}
    </CButton>
  </CCol>

</CRow>

   <div
  className="p-2 mb-2"
  // style={{
  //   border: "2px solid var(--color-black)",
  //   borderRadius: "4px",
  // }}
>
  <CRow className="g-2">

    {/* Rack No */}
    <CCol xs={6} sm={4} md={2}>
      <label className="fw-bold small d-block">Rack No</label>
      <CFormInput className="border border-secondary" disabled />
    </CCol>

    {/* VAT */}
    <CCol xs={6} sm={4} md={2}>
      <label className="fw-bold small d-block">VAT</label>
      <CFormInput className="border border-secondary" disabled />
    </CCol>

    {/* VAT Amount */}
    <CCol xs={6} sm={4} md={2}>
      <label className="fw-bold small d-block">VAT Amt</label>
      <CFormInput className="border border-secondary" disabled />
    </CCol>

    {/* Current Stock */}
    <CCol xs={6} sm={4} md={2}>
      <label className="fw-bold small d-block">Current Stock</label>
      <CFormInput className="border border-secondary" disabled />
    </CCol>

    {/* Batch No */}
    <CCol xs={6} sm={4} md={2}>
      <label className="fw-bold small d-block">Batch No</label>
      <CFormInput
        value={batchNo}
        onChange={(e) => setBatchNo(e.target.value)}
        className="border border-secondary"
      />
    </CCol>

    {/* Req Qty */}
    <CCol xs={6} sm={4} md={2}>
      <label className="fw-bold small d-block">Req Qty</label>
      <CFormInput
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        className="border border-secondary"
      />
    </CCol>

    {/* Rate */}
    <CCol xs={6} sm={4} md={2}>
      <label className="fw-bold small d-block">Rate</label>
      <CFormInput
        value={rate}
        onChange={(e) => setRate(e.target.value)}
        className="border border-secondary"
      />
    </CCol>

    {/* Disc % */}
    <CCol xs={6} sm={4} md={2}>
      <label className="fw-bold small d-block">Disc %</label>
      <CFormInput
        value={discPerc}
        onChange={(e) => setDiscPerc(e.target.value)}
        className="border border-secondary"
      />
    </CCol>

    {/* Disc Amt */}
    <CCol xs={6} sm={4} md={2}>
      <label className="fw-bold small d-block">Disc Amt</label>
      <CFormInput
        value={discAmt}
        onChange={(e) => setDiscAmt(e.target.value)}
        className="border border-secondary"
      />
    </CCol>

    {/* Total Amt */}
    <CCol xs={6} sm={4} md={2}>
      <label className="fw-bold small d-block">Total Amt</label>
      <CFormInput
        value={totalAmt}
        onChange={(e) => setTotalAmt(e.target.value)}
        className="border border-secondary"
      />
    </CCol>

    {/* Exp Date */}
    <CCol xs={6} sm={4} md={2}>
      <label className="fw-bold small d-block">Exp Date</label>
      <CFormInput
        type="date"
        value={expDate}
        onChange={(e) => setExpDate(e.target.value)}
        className="border border-secondary"
      />
    </CCol>

    {/* MRP */}
    <CCol xs={6} sm={4} md={2}>
      <label className="fw-bold small d-block">MRP</label>
      <CFormInput className="border border-secondary" disabled />
    </CCol>

  </CRow>
</div>



      {/* TABLE */}
      <div style={{ position: 'relative', marginTop: 8 }}>
    <div
  style={{
    maxHeight: "260px", // adjust height as needed
    overflowY: "auto",
    overflowX: "auto",
    border: "1px solid #ddd",
    borderRadius: "4px",
  }}
>
  <CTable bordered hover responsive="sm">

    <CTableHead className="pink-table w-auto">
      <CTableRow style={{ color: 'var(--color-black)' }}>
        <CTableHeaderCell style={{ width: '40px' }}>S.No</CTableHeaderCell>
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
  <CTableDataCell colSpan={12} className="text-center"  style={{ color: 'var(--color-black)' }}>
    No OP Sales records found.
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
             {/* Edit Button */}
<CButton
  color="info"
  size="sm"
  className="actionBtn"
  style={{ color: 'var(--color-black)' }}
  onClick={() => handleEdit(index)}
  title="Edit"
>
  <Edit2 size={18} />
</CButton>

{/* Delete Button */}
<CButton
  color="danger"
  size="sm"
  className="actionBtn ms-1"
  style={{ color: 'var(--color-black)' }}
  onClick={() => handleDelete(index)}
  title="Delete"
>
  <Trash size={18} />
</CButton>

            </CTableDataCell>
          </CTableRow>
        ))}
    </CTableBody>
  </CTable>
</div>


        {/* TOTALS */}
        <CCardBody style={{ padding: '10px 0 0 0' }}>
          <CRow className="g-2 border-bottom pb-2">
            <CCol md={3}>
              <CRow className="mb-2">
                <CCol xs={6}>
                  <CFormLabel className="text-end fw-bold mb-0">Total Amt</CFormLabel>
                </CCol>
                <CCol xs={6}>
                  <CFormInput disabled value={totals.totalAmt} className="text-end bg-light"  style={{fontSize:'12px'}}/>
                </CCol>
              </CRow>

              <CRow className="mb-2">
                <CCol xs={6}>
                  <CFormLabel className="text-end fw-bold mb-0">Disc(%)</CFormLabel>
                </CCol>
                <CCol xs={6}>
                  <CFormInput disabled value={0} className="text-end bg-light"   style={{fontSize:'12px'}}/>
                </CCol>
              </CRow>
              <CRow className="mb-2">
                <CCol xs={6}>
                  <CFormLabel className="text-end mb-0 fw-bold">DiscAmt</CFormLabel>
                </CCol>
                <CCol xs={6}>
                  <CFormInput disabled value={0} className="text-end bg-light"  style={{fontSize:'12px'}}/>
                </CCol>
              </CRow>

  <CRow>
                
              </CRow>
              <CRow className="mb-2">
                <CCol xs={6}>
                  <CFormLabel className="text-end fw-bold mb-0">Net Amt</CFormLabel>
                </CCol>
                <CCol xs={6}>
                  <CFormInput disabled value={totals.netAmt} className="text-end bg-light"  style={{fontSize:'12px'}}/>
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
                    <CFormInput disabled value={0} className="text-end bg-light"  style={{fontSize:'12px'}}/>
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
                     style={{fontSize:'12px',}}
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
                    <CFormInput disabled value={0} className="text-end bg-light"  style={{fontSize:'12px'}}/>
                  </CCol>
                </CRow>
              ))}
            </CCol>

            <CCol md={3}>
              {['Total Tax', 'Final Total', 'Previous Adj', 'Net Payable'].map((item) => (
                <CRow className="mb-2" key={item}>
                  <CCol xs={6}>
                    <CFormLabel className="text-end fw-bold mb-0" >{item}</CFormLabel>
                  </CCol>
                  <CCol xs={6}>
                    <CFormInput
                      disabled
                      value={item === 'Total Tax' ? totals.totalTax : 0}
                      className="text-end bg-light"
                       style={{fontSize:'12px'}}
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
  className="d-flex flex-wrap align-items-center mt-3 gap-3 p-2"
  style={{
    // border: '1px solid var(--color-black)',
    borderRadius: 6,
  }}
>
  <div className="d-flex align-items-center gap-2">
    <CFormLabel className="fw-bold mb-0">Search</CFormLabel>
    <CFormInput
      type="text"
      placeholder="Search here..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      style={{ width: 160, height: 30 ,fontSize:"12px" }}
    />
  </div>

  <div className="d-flex align-items-center gap-2">
    <CFormLabel className="fw-bold mb-0">From</CFormLabel>
    <CFormInput
      type="date"
      value={dateFrom}
      onChange={(e) => setDateFrom(e.target.value)}
      style={{ width: 130, height: 30 ,fontSize:"12px",color:'var(--color-black)'}}
    />
  </div>

  <div className="d-flex align-items-center gap-2">
    <CFormLabel className="fw-bold mb-0">To</CFormLabel>
    <CFormInput
      type="date"
      value={dateTo}
      onChange={(e) => setDateTo(e.target.value)}
      style={{ width: 130, height: 30 ,fontSize:"12px"}}
    />
  </div>

  {/* Icons */}
  <div className="d-flex align-items-center gap-3">
    <CIcon icon={cilSave} size="lg" style={{ cursor: 'pointer' }} />
    <CIcon icon={cilPrint} size="lg" style={{ cursor: 'pointer' }} />
    <CIcon icon={cilMagnifyingGlass} size="lg" style={{ cursor: 'pointer' }} />
  </div>

  {/* Button */}
  <CButton color="light" size="sm" style={{fontSize:"12px"}}>
    {editIndex !== null ? 'Update' : 'PrintTextBill'}
    
  </CButton>

  {/* Checkbox (push to right on large screens) */}
  <div className="ms-lg-auto d-flex align-items-center">
    <CFormCheck
      type="checkbox"
      id="displayOpSaleDetails"
      label="Include Returns"
      className="text-dark"
    />
  </div>
</div>

    </div>
  )
}

export default OPSales
