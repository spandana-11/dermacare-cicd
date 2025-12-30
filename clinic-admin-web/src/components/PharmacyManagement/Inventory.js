import React, { useEffect, useState } from 'react'
import axios from 'axios'
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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPrint, cilMagnifyingGlass, cilSave } from '@coreui/icons'
import { Edit2, Trash } from 'lucide-react'
import { deleteInventoryData, fetchStockAPI } from './InventoryAPI'
import { showCustomToast } from '../../Utils/Toaster'

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
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)
  const [itemIdToDelete, setItemIdToDelete] = useState(null)
  const [delLoading, setDelLoading] = useState(false)
  const [deleteIndex, setDeleteIndex] = useState(null)

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
      }

      const data = await fetchStockAPI(filters)

      // Normalize data so search works for UI fields
      const normalized = data.map((item) => ({
        ...item,
        prodCode: item.prodCode || item.productId, // map productId → prodCode
        productName: item.productName || item.name,
        category: item.category || item.productCategory,
        stock: item.stock || item.stockIn,
        valueRate: item.valueRate || item.costPrice,
        valueMrp: item.valueMrp || item.mrp,
        batchNo: item.batchNo || item.batchNumber,
      }))
      setRows(normalized)
    } catch (error) {
      console.error('API ERROR:', error)
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
    // 1. **Client-side text search (using the separate 'search' input, if any)**
    const quickSearchMatch =
      !search ||
      String(r.productName || '')
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      String(r.prodCode || '')
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      String(r.category || '')
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      String(r.batchNo || '')
        .toLowerCase()
        .includes(search.toLowerCase())

    if (!quickSearchMatch) return false

    // 2. **Specific SearchBy/FieldValue filtering**
    const specificSearchMatch = (() => {
      // If no searchBy field is selected, or no value is entered, this filter passes
      if (!searchBy || !fieldValue) return true

      // Get the value of the selected field from the current row
      const fieldToSearch = r[searchBy] || ''

      // Check if the field value includes the user's input
      return String(fieldToSearch).toLowerCase().includes(fieldValue.toLowerCase())
    })()

    if (!specificSearchMatch) return false

    // 3. **Product Category filtering**
    const categoryMatch = (() => {
      // If ALL is selected, this filter passes
      if (productCategory === 'ALL') return true

      // Check if the row's category matches the selected category
      const rowCategory = String(r.category || '').toUpperCase()
      const selectedCategory = productCategory.toUpperCase()

      return rowCategory === selectedCategory
    })()

    return categoryMatch
  })
  const confirmDeleteInventory = async () => {
    if (itemIdToDelete == null) return

    setDelLoading(true)

    try {
      const success = await deleteInventoryData(itemIdToDelete)

      if (success) {
        // Remove from UI
        setRows((prev) => prev.filter((_, index) => index !== deleteIndex))

        showCustomToast('Item deleted successfully!', 'success')
      } else {
        showCustomToast('Failed to delete item!', 'error')
      }
    } catch (error) {
      console.error('Delete Error:', error)
      showCustomToast('An unexpected error occurred.', 'error')
    } finally {
      setIsDeleteModalVisible(false)
      setItemIdToDelete(null)
      setDeleteIndex(null)
      setDelLoading(false)
    }
  }

  return (
    <div
      className="p-3"
      style={{
        color: 'var(--color-black)',
        fontSize: '13px',
      }}
    >
      {/* Header / Date-Time */}
      {/* <CRow className="g-3 align-items-center mb-2">
        {/* From / To Section */}
        {/* <CCol xs={12} md={7} lg={8}>
          <div className="d-flex flex-wrap align-items-center gap-2">
            {/* From */}
            {/* <CFormLabel className="fw-bold mb-0">From</CFormLabel>

            <CFormInput
              type="date"
              size="sm"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-auto"
              style={{ height: 30, fontSize: '12px' }}
            /> */}

            {/* <CFormInput
              type="time"
              size="sm"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
              className="w-auto"
              style={{ height: 30, fontSize: '12px' }}
            /> */}

            {/* To */}
            {/* <CFormLabel className="fw-bold mb-0 ms-2">To</CFormLabel>

            <CFormInput
              type="date"
              size="sm"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-auto"
              style={{ height: 30, fontSize: '12px' }}
            /> */}

            {/* <CFormInput
              type="time"
              size="sm"
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
              className="w-auto"
              style={{ height: 30, fontSize: '12px' }}
            />
          </div> */}
        {/* </CCol> */}

        {/* Report Type */}
        {/* <CCol xs={12} md={5} lg={4}>
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
            </CFormSelect>
          </div>
        </CCol> */}
      {/* </CRow> */}

      {/* Filter row */}
      {/* <div
        className="border rounded p-3 mb-3"
        style={{ borderColor: '#d8dbe0', background: '#f8f9fa' }}
      >
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
            </div>

            <div className="d-flex gap-2 mt-2 justify-content-end">
              <CButton
                size="sm"
                style={{
                  color: 'var(--color-black)',
                  backgroundColor: 'var(--color-bgcolor)',
                  minWidth: 88,
                  fontSize: '12px',
                }}
                onClick={loadStock}
              >
                <CIcon icon={cilMagnifyingGlass} /> &nbsp; Search
              </CButton>
              <CButton
                color="secondary"
                size="sm"
                style={{
                  color: 'var(--color-black)',
                  backgroundColor: 'var(--color-bgcolor)',
                  minWidth: 78,
                  fontSize: '12px',
                }}
                onClick={onReset}
              >
                Reset
              </CButton>
              <CButton
                size="sm"
                style={{
                  color: 'var(--color-black)',
                  backgroundColor: 'var(--color-bgcolor)',
                  minWidth: 150,
                  fontSize: '12px',
                }}
                onClick={onPrint}
              >
                <CIcon icon={cilPrint} /> &nbsp; Print Category Wise
              </CButton>
            </div>
          </CCol>
        </CRow>
      </div> */}

      {/* Top quick search / actions */}
      {/* <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <div className="ms-auto d-flex gap-2 align-items-center">
          <CIcon icon={cilSave} style={{ cursor: 'pointer' }} />
          <CIcon icon={cilPrint} style={{ cursor: 'pointer' }} />
          <CIcon icon={cilMagnifyingGlass} style={{ cursor: 'pointer' }} />
        </div>
      </div> */}

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
                <CTableHeaderCell style={{ width: 120 }}>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody className='pink-table'>
              {loading && (
                <CTableRow>
                  <CTableDataCell colSpan={10} className="text-center">
                    Loading...
                  </CTableDataCell>
                </CTableRow>
              )}

              {!loading && displayRows.length === 0 && (
                <CTableRow>
                  <CTableDataCell
                    colSpan={10}
                    className="text-center"
                    style={{ color: 'var(--color-black)' }}
                  >
                    No records found.
                  </CTableDataCell>
                </CTableRow>
              )}

              {!loading &&
                displayRows.map((item, idx) => (
                  <CTableRow key={item.id || idx}>
                    <CTableDataCell >{idx + 1}</CTableDataCell>
                    <CTableDataCell style={{ textAlign: 'left', paddingLeft: 12 }}>
                      {item.productName}
                    </CTableDataCell>
                    <CTableDataCell>{item.productId}</CTableDataCell>
                    <CTableDataCell>{item.category}</CTableDataCell>
                    <CTableDataCell>{item.stockIn}</CTableDataCell>
                    <CTableDataCell>{Number(item.costPrice).toFixed(2)}</CTableDataCell>
                    <CTableDataCell>{Number(item.mrp).toFixed(2)}</CTableDataCell>
                    <CTableDataCell>{item.batchNo || '--'}</CTableDataCell>
                    <CTableDataCell>
                      {/* <CButton
                        color="info"
                        size="sm"
                        className="me-1"
                        style={{
                          color: 'var(--color-black)',
                          backgroundColor: 'var(--color-bgcolor)',
                        }}
                        onClick={() => handleEdit(idx)}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </CButton> */}

                      <CButton
                        color="danger"
                        size="sm"
                        onClick={() => {
                          setItemIdToDelete(item.id) // Store item ID
                          setDeleteIndex(idx) // Store row index
                          setIsDeleteModalVisible(true)
                        }}
                        style={{
                          color: 'var(--color-black)',
                          backgroundColor: 'var(--color-bgcolor)',
                        }}
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
        <CModal visible={isDeleteModalVisible} onClose={() => setIsDeleteModalVisible(false)}>
          <CModalHeader>
            <CModalTitle>Confirm Delete</CModalTitle>
          </CModalHeader>
          <CModalBody>Are you sure you want to delete this item?</CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setIsDeleteModalVisible(false)}>
              Cancel
            </CButton>
            <CButton color="danger" onClick={confirmDeleteInventory} disabled={delLoading}>
              {delLoading ? 'Deleting...' : 'Delete'}
            </CButton>
          </CModalFooter>
        </CModal>

        {/* Totals block below table (CCardBody style) */}
        <CCardBody style={{ padding: '10px 0 0 0' }} >
          <CRow className="g-2 border-top pt-2">
            <CCol md={4}>
              <CRow className="mb-2">
                <CCol xs={6}>
                  <CFormLabel className="text-end fw-bold mb-0 ">Total Stock</CFormLabel>
                </CCol>
                <CCol xs={6}>
                  <CFormInput
                    disabled
                    value={totals.totalStock}
                    className="text-end bg-light"
                    style={{ fontSize: '14px' ,  color: 'var(--color-black)'}}
                    
                  />
                </CCol>
              </CRow>

              <CRow className="mb-2">
                <CCol xs={6}>
                  <CFormLabel className="text-end fw-bold mb-0">Value @ Rate</CFormLabel>
                </CCol>
                <CCol xs={6}>
                  <CFormInput
                    disabled
                    value={totals.totalValueRate}
                    className="text-end bg-light"
                    style={{ fontSize: '14px' ,  color: 'var(--color-black)'}}
                  />
                </CCol>
              </CRow>

              <CRow className="mb-2">
                <CCol xs={6}>
                  <CFormLabel className="text-end fw-bold mb-0">Value @ MRP</CFormLabel>
                </CCol>
                <CCol xs={6}>
                  <CFormInput
                    disabled
                    value={totals.totalValueMrp}
                    className="text-end bg-light"
                    style={{ fontSize: '14px' ,  color: 'var(--color-black)'}}
                  />
                </CCol>
              </CRow>
            </CCol>

            <CCol md={8}>{/* placeholder for other summary fields if required */}</CCol>
          </CRow>
        </CCardBody>
      </div>
    </div>
  )
}

export default Inventory
