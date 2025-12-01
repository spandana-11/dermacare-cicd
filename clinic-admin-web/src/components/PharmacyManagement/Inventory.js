import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  CRow, CCol, CFormLabel, CFormInput, CFormCheck, CFormSelect, CButton,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CCardBody
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPrint, cilMagnifyingGlass, cilSave } from '@coreui/icons'
import { Edit2, Trash } from 'lucide-react'
import { fetchStockAPI } from './InventoryAPI'


const Inventory = () => {

  const primaryColor = '#3c4b64'
   const onPrint = () => {
    window.print()
  }

  const [fromDate, setFromDate] = useState('')
  const [fromTime, setFromTime] = useState('')
  const [toDate, setToDate] = useState('')
  const [toTime, setToTime] = useState('')
  const [reportType, setReportType] = useState('STOCK REPORT')
  const [searchBy, setSearchBy] = useState('')
  const [fieldValue, setFieldValue] = useState('')
  const [productCategory, setProductCategory] = useState('ALL')
  const [excludeZeroStock, setExcludeZeroStock] = useState(false)
  const [displayBatchwise, setDisplayBatchwise] = useState(false)
  const [showCompanyWise, setShowCompanyWise] = useState(false)

  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState([])

  const [totals, setTotals] = useState({
    totalValueRate: 0,
    totalValueMrp: 0,
    totalStock: 0,
  })

  const [search, setSearch] = useState('')

  
  const loadStock = async () => {
    setLoading(true)

    try {
      const filters = {
        fromDate,
        fromTime,
        toDate,
        toTime,
        reportType,
        searchBy,
        fieldValue,
        productCategory,
        excludeZeroStock,
        displayBatchwise,
        showCompanyWise,
      }

      const data = await fetchStockAPI(filters)
      setRows(data)

    } catch (error) {
      console.error("API ERROR:", error)
      setRows([])

    } finally {
      setLoading(false)
    }
  }

  // load once
  useEffect(() => {
    loadStock()
  }, [])

  // recompute totals
  useEffect(() => {
    let totalRate = 0
    let totalMrp = 0
    let totalStock = 0

    rows.forEach((r) => {
      totalRate += Number(r.valueRate) || 0
      totalMrp += Number(r.valueMrp) || 0
      totalStock += Number(r.stock) || 0
    })

    setTotals({
      totalValueRate: Number(totalRate.toFixed(2)),
      totalValueMrp: Number(totalMrp.toFixed(2)),
      totalStock,
    })
  }, [rows])

  const onSearch = () => {
    loadStock() // 🔥 Now server-side filtering
  }

  const onReset = () => {
    setFromDate('')
    setFromTime('')
    setToDate('')
    setToTime('')
    setSearchBy('')
    setFieldValue('')
    setProductCategory('ALL')
    setExcludeZeroStock(false)
    setDisplayBatchwise(false)
    setShowCompanyWise(false)
    loadStock()
  }

  const handleDelete = (index) => {
    const filtered = rows.filter((_, i) => i !== index)
    setRows(filtered)
  }

  const displayRows = rows.filter((r) => {
    if (!search) return true
    return String(r.productName || r.prodCode || r.id).toLowerCase().includes(search.toLowerCase())
  })


  return (
    <div
      className="p-3"
      style={{
        color: 'var(--color-black)',
        fontSize: '13px',
      }}
    >
    {/* Header / Date-Time */}
<CRow className="g-3 align-items-center mb-2">

  {/* From / To Section */}
  <CCol xs={12} md={7} lg={8}>
    <div className="d-flex flex-wrap align-items-center gap-2">

      {/* From */}
      <CFormLabel className="fw-bold mb-0">From</CFormLabel>

      <CFormInput
        type="date"
        size="sm"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        className="w-auto"
        style={{ height: 30, fontSize: '12px' }}
      />

      <CFormInput
        type="time"
        size="sm"
        value={fromTime}
        onChange={(e) => setFromTime(e.target.value)}
        className="w-auto"
        style={{ height: 30, fontSize: '12px' }}
      />

      {/* To */}
      <CFormLabel className="fw-bold mb-0 ms-2">To</CFormLabel>

      <CFormInput
        type="date"
        size="sm"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
        className="w-auto"
        style={{ height: 30, fontSize: '12px' }}
      />

      <CFormInput
        type="time"
        size="sm"
        value={toTime}
        onChange={(e) => setToTime(e.target.value)}
        className="w-auto"
        style={{ height: 30, fontSize: '12px' }}
      />

    </div>
  </CCol>

  {/* Report Type */}
  <CCol xs={12} md={5} lg={4}>
    <div className="d-flex justify-content-md-end align-items-center gap-2 flex-wrap">
      <CFormLabel className="fw-bold mb-0">Report Type:</CFormLabel>

      <CFormSelect
        size="sm"
        value={reportType}
        onChange={(e) => setReportType(e.target.value)}
        className="w-auto"
        style={{ height: 30, fontSize: '12px', minWidth: 150 }}
      >
        <option value="STOCK REPORT">STOCK REPORT</option>
        <option value="BATCH REPORT">BATCH REPORT</option>
        <option value="COMPANY REPORT">COMPANY REPORT</option>
      </CFormSelect>
    </div>
  </CCol>

</CRow>


      {/* Filter row */}
      <div className="border rounded p-3 mb-3" style={{ borderColor: '#d8dbe0', background: '#f8f9fa' }}>
        <CRow className="g-3">
          <CCol xs={12} md={3} lg={3}>
            <CFormLabel className="fw-semibold">Search By</CFormLabel>
            <CFormSelect
              size="sm"
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value)}
              style={{ height: 30, fontSize: '12px' }}
            >
              <option value="">Select Field</option>
              <option value="productName">Product Name</option>
              <option value="prodCode">Prod Code</option>
              <option value="category">Category</option>
              <option value="batchNo">Batch No</option>
              <option value="company">Company</option>
            </CFormSelect>
          </CCol>

          <CCol xs={12} md={3} lg={3}>
            <CFormLabel className="fw-semibold">Field Value</CFormLabel>
            <CFormInput
              size="sm"
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
              placeholder="Enter value"
              style={{ height: 30, fontSize: '12px' }}
            />
          </CCol>

          <CCol xs={12} md={3} lg={3}>
            <CFormLabel className="fw-semibold">Product Category</CFormLabel>
            <CFormSelect
              size="sm"
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
              style={{ height: 30, fontSize: '12px' }}
            >
              <option value="ALL">ALL</option>
              <option value="TABLET">TABLET</option>
              <option value="CAPSULE">CAPSULE</option>
              <option value="SYRUP">SYRUP</option>
              <option value="INJECTION">INJECTION</option>
              <option value="SUTURES">SUTURES</option>
            </CFormSelect>
          </CCol>

          <CCol xs={12} md={3} lg={3} className="d-flex flex-column justify-content-between">
            <div className="d-flex gap-3 align-items-center">
              <CFormCheck
                type="checkbox"
                id="excludeZeroStock"
                label="Exclude Zero Stock Items"
                checked={excludeZeroStock}
                onChange={(e) => setExcludeZeroStock(e.target.checked)}
              />
              <CFormCheck
                type="checkbox"
                id="displayBatchwise"
                label="Display Batchwise"
                checked={displayBatchwise}
                onChange={(e) => setDisplayBatchwise(e.target.checked)}
              />
              <CFormCheck
                type="checkbox"
                id="showCompanyWise"
                label="Show Company Wise"
                checked={showCompanyWise}
                onChange={(e) => setShowCompanyWise(e.target.checked)}
              />
            </div>

            <div className="d-flex gap-2 mt-2 justify-content-end">
              <CButton
                size="sm"
                style={{  
                    color: 'var(--color-black)',
                    backgroundColor: 'var(--color-bgcolor)',
                 minWidth: 88, fontSize: '12px' }}
                onClick={onSearch}
              >
                <CIcon icon={cilMagnifyingGlass} /> &nbsp; Search
              </CButton>
              <CButton
                color="secondary"
                size="sm"
                 style={{  
                    color: 'var(--color-black)',
                    backgroundColor: 'var(--color-bgcolor)',
                 minWidth: 78, fontSize: '12px' }}
                onClick={onReset}
              >
                Reset
              </CButton>
              <CButton
                size="sm"
                 style={{  
                    color: 'var(--color-black)',
                    backgroundColor: 'var(--color-bgcolor)',
                 minWidth: 150, fontSize: '12px' }}
                onClick={onPrint}
              >
                <CIcon icon={cilPrint} /> &nbsp; Print Category Wise
              </CButton>
            </div>
          </CCol>
        </CRow>
      </div>

      {/* Top quick search / actions */}
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <div className="d-flex align-items-center gap-2">
          <CFormLabel className="fw-bold mb-0">Search</CFormLabel>
          <CFormInput
            size="sm"
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 200, height: 30, fontSize: '12px' }}
          />
        </div>

        <div className="ms-auto d-flex gap-2 align-items-center">
          <CIcon icon={cilSave} style={{ cursor: 'pointer' }} />
          <CIcon icon={cilPrint} style={{ cursor: 'pointer' }} />
          <CIcon icon={cilMagnifyingGlass} style={{ cursor: 'pointer' }} />
        </div>
      </div>

      {/* Table with fixed height + scroll */}
      <div style={{ position: 'relative', marginTop: 4 }}>
        <div
          style={{
            maxHeight: '300px',
            overflowY: 'auto',
            overflowX: 'auto',
            border: '1px solid #ddd',
            borderRadius: 4,
          }}
        >
          <CTable bordered hover responsive="sm" style={{ minWidth: 900 }}>
            <CTableHead className="pink-table w-auto">
              <CTableRow style={{ backgroundColor: primaryColor, color: 'white' }}>
                <CTableHeaderCell style={{ width: 50 }}>S.No</CTableHeaderCell>
                <CTableHeaderCell>Product Name</CTableHeaderCell>
                <CTableHeaderCell style={{ width: 110 }}>Prod Code</CTableHeaderCell>
                <CTableHeaderCell style={{ width: 110 }}>Category</CTableHeaderCell>
                <CTableHeaderCell style={{ width: 90 }}>Stock</CTableHeaderCell>
                <CTableHeaderCell style={{ width: 110 }}>Value @ Rate</CTableHeaderCell>
                <CTableHeaderCell style={{ width: 110 }}>Value @ MRP</CTableHeaderCell>
                <CTableHeaderCell style={{ width: 120 }}>Batch No</CTableHeaderCell>
                <CTableHeaderCell style={{ width: 120 }}>Company</CTableHeaderCell>
                <CTableHeaderCell style={{ width: 120 }}>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {loading && (
                <CTableRow>
                  <CTableDataCell colSpan={10} className="text-center">
                    Loading...
                  </CTableDataCell>
                </CTableRow>
              )}

              {!loading && displayRows.length === 0 && (
                <CTableRow>
                  <CTableDataCell colSpan={10} className="text-center" style={{ color: 'var(--color-black)' }}>
                    No records found.
                  </CTableDataCell>
                </CTableRow>
              )}

              {!loading &&
                displayRows.map((item, idx) => (
                  <CTableRow key={item.id || idx}>
                    <CTableDataCell>{idx + 1}</CTableDataCell>
                    <CTableDataCell style={{ textAlign: 'left', paddingLeft: 12 }}>{item.productName}</CTableDataCell>
                    <CTableDataCell>{item.prodCode}</CTableDataCell>
                    <CTableDataCell>{item.category}</CTableDataCell>
                    <CTableDataCell>{item.stock}</CTableDataCell>
                    <CTableDataCell>{Number(item.valueRate).toFixed(2)}</CTableDataCell>
                    <CTableDataCell>{Number(item.valueMrp).toFixed(2)}</CTableDataCell>
                    <CTableDataCell>{item.batchNo || '--'}</CTableDataCell>
                    <CTableDataCell>{item.company || '--'}</CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        color="info"
                        size="sm"
                        className="me-1"
                         style={{  
                    color: 'var(--color-black)',
                    backgroundColor: 'var(--color-bgcolor)'
                }}
                        onClick={() => handleEdit(idx)}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </CButton>

                      <CButton
                        color="danger"
                        size="sm"
                        onClick={() => handleDelete(idx)}
                        style={{  
                    color: 'var(--color-black)',
                    backgroundColor: 'var(--color-bgcolor)' }}
                        title="Delete"
                      >
                        <Trash size={16} />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
            </CTableBody>
          </CTable>
        </div>

        {/* Totals block below table (CCardBody style) */}
        <CCardBody style={{ padding: '10px 0 0 0' }}>
          <CRow className="g-2 border-top pt-2">
            <CCol md={4}>
              <CRow className="mb-2">
                <CCol xs={6}>
                  <CFormLabel className="text-end fw-bold mb-0">Total Stock</CFormLabel>
                </CCol>
                <CCol xs={6}>
                  <CFormInput disabled value={totals.totalStock} className="text-end bg-light" style={{ fontSize: '12px' }} />
                </CCol>
              </CRow>

              <CRow className="mb-2">
                <CCol xs={6}>
                  <CFormLabel className="text-end fw-bold mb-0">Value @ Rate</CFormLabel>
                </CCol>
                <CCol xs={6}>
                  <CFormInput disabled value={totals.totalValueRate} className="text-end bg-light" style={{ fontSize: '12px' }} />
                </CCol>
              </CRow>

              <CRow className="mb-2">
                <CCol xs={6}>
                  <CFormLabel className="text-end fw-bold mb-0">Value @ MRP</CFormLabel>
                </CCol>
                <CCol xs={6}>
                  <CFormInput disabled value={totals.totalValueMrp} className="text-end bg-light" style={{ fontSize: '12px' }} />
                </CCol>
              </CRow>
            </CCol>

            <CCol md={8}>
              {/* placeholder for other summary fields if required */}
            </CCol>
          </CRow>
        </CCardBody>
      </div>
    </div>
  )
}

export default Inventory
