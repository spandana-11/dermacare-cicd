import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import {
  CCard,
  CCardBody,
  CRow,
  CCol,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormCheck,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CFormTextarea,
} from '@coreui/react'

import CIcon from '@coreui/icons-react'
import { cilMagnifyingGlass, cilPrint, cilSave } from '@coreui/icons'

import { postPurchaseData, PurchaseData } from '../PharmacyManagement/PurchasesAPI'
import { SupplierData } from './SupplierInfoAPI'
import { showCustomToast } from '../../Utils/Toaster'

const Purchases = ({ goToSupplier }) => {
  const [purchaseData, setPurchaseData] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [suppliers, setSuppliers] = useState([])
  const [error, setError] = useState([])

  const fetchPurchase = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await PurchaseData()
      const safeData = Array.isArray(data)
        ? data.filter((item) => item && typeof item === 'object')
        : []
      setPurchaseData(safeData)
    } catch (error) {
      console.error('Error fetching purchase:', error)
      setError('Failed to fetch purchase data.')
      setPurchaseData([])
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    fetchPurchase()
  }, [])

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const list = await SupplierData()
        // Expecting SupplierData to return items with supplierId and supplierName
        const uniqueSuppliers = [
          ...new Map(list.map((p) => [p.supplierId, p.supplierName])).entries(),
        ].map(([id, name]) => ({ id, name }))
        setSuppliers(uniqueSuppliers)
      } catch (err) {
        console.error('Fetch suppliers error:', err)
      }
    }
    fetchSuppliers()
  }, [])

  const [payload, setPayload] = useState({
    purchaseBillNo: '',
    invoiceNo: '',
    supplierName: '',
    invoiceDate: '',
    receivingDate: '',
    taxType: '',
    paymentMode: '',
    billDueDate: '',
    creditDays: '',
    duePaidBillNo: '',
    department: '',
    financialYear: '',
    paidAmount: '',
    previousAdjustment: '',
    postDiscount: '',
    medicineDetails: [
      {
        // UI fields retained as you requested:
        sno: 1,
        productName: '',
        batchNo: '',
        expDate: '', // maps to expiryDate on POST
        hsnCode: '',
        quantity: '',
        packSize: '', // kept in UI but ignored on POST (commented where used)
        free: '', // maps to freeQuantity on POST
        mrp: '',
        costPrice: '',
        discPercent: '', // maps to discountPercent on POST
        gstPercent: '',
        isSaved: false,
      },
    ],
  })

  const handleAddProduct = () => {
    setPayload((prev) => ({
      ...prev,
      medicineDetails: [
        ...prev.medicineDetails,
        {
          sno: prev.medicineDetails.length + 1,
          productName: '',
          batchNo: '',
          expDate: '',
          hsnCode: '',
          quantity: '',
          packSize: '', // packSize kept in UI but will be ignored during POST
          free: '',
          mrp: '',
          costPrice: '',
          discPercent: '',
          gstPercent: '',
          isSaved: false,
        },
      ],
    }))
  }
  const handleRemoveProduct = (index) => {
    setPayload((prev) => {
      const updated = prev.medicineDetails.filter((_, i) => i !== index)
      // reassign sno
      const renumbered = updated.map((r, idx) => ({ ...r, sno: idx + 1 }))
      return { ...prev, medicineDetails: renumbered }
    })
  }
  const updateProductField = (index, field, value) => {
    setPayload((prev) => {
      const updated = [...prev.medicineDetails]
      const numericFields = ['quantity', 'free', 'mrp', 'costPrice', 'discPercent', 'gstPercent']

      updated[index][field] = numericFields.includes(field)
        ? value === ''
          ? ''
          : Number(value)
        : value

      return { ...prev, medicineDetails: updated }
    })
  }

  const handleSavePurchase = async () => {
    try {
      const res = await postPurchaseData(payload)
      console.log('Saved:', res)
      showCustomToast('Purchase added successfully!', 'success')
      loadPurchases()
    } catch (err) {
      showCustomToast('Failed to add purchase! ', 'error')
    }
  }

  // Update top form fields
  const updateTopField = (field, value) => {
    setPayload((prev) => ({ ...prev, [field]: value }))
  }

  // When supplier is selected, set supplierName (backend expects supplierName)
  const handleSupplierSelect = (e) => {
    // set supplierName to selected text (not id)
    const selectedText = e.target.selectedOptions?.[0]?.text || ''
    const val = e.target.value
    // if placeholder selected (value === ''), clear supplierName
    if (!val) {
      updateTopField('supplierName', '')
    } else {
      updateTopField('supplierName', selectedText)
    }
  }

  // Final save: map UI fields to backend JSON exactly as you specified and POST
  const handleFinalSave = async () => {
    // Remove empty rows
    const filteredRows = payload.medicineDetails.filter(
      (row) =>
        (row.productName && row.productName.trim() !== '') ||
        (row.batchNo && row.batchNo.trim() !== '') ||
        (row.expDate && row.expDate.trim() !== ''),
    )

    // Map UI fields → backend fields
    const mappedMedicineDetails = filteredRows.map((item) => ({
      productName: item.productName || '',
      batchNo: item.batchNo || '',
      expiryDate: item.expDate || '', // UI expDate → backend expiryDate (correct)
      hsnCode: item.hsnCode || '',
      quantity: item.quantity === '' ? 0 : Number(item.quantity),
      freeQuantity: item.free === '' ? 0 : Number(item.free),
      mrp: item.mrp === '' ? 0 : Number(item.mrp),
      costPrice: item.costPrice === '' ? 0 : Number(item.costPrice),
      discountPercent: item.discPercent === '' ? 0 : Number(item.discPercent),
      gstPercent: item.gstPercent === '' ? 0 : Number(item.gstPercent),
    }))

    // Build final payload EXACTLY LIKE BACKEND JSON
    const finalPayload = {
      purchaseBillNo: payload.purchaseBillNo || '',
      invoiceNo: payload.invoiceNo || '',
      supplierName: payload.supplierName || '',
      invoiceDate: payload.invoiceDate || '',
      receivingDate: payload.receivingDate || '',
      taxType: payload.taxType || '',
      paymentMode: payload.paymentMode || '',
      billDueDate: payload.billDueDate || '',
      creditDays: payload.creditDays || '',
      duePaidBillNo: payload.duePaidBillNo || '',
      department: payload.department || '',
      financialYear: payload.financialYear || '',
      paidAmount: payload.paidAmount === '' ? 0 : Number(payload.paidAmount),
      previousAdjustment:
        payload.previousAdjustment === '' ? 0 : Number(payload.previousAdjustment),
      postDiscount: payload.postDiscount === '' ? 0 : Number(payload.postDiscount),
      medicineDetails: mappedMedicineDetails,
    }

    console.log('FINAL PAYLOAD READY TO POST >>>>', finalPayload)

    try {
      const response = await postPurchaseData(finalPayload)
      console.log('Saved:', response)

      showCustomToast('Purchase saved successfully!', 'success')

      fetchPurchase()
    } catch (err) {
      console.error('Save Failed:', err)
      showCustomToast('Failed to save purchase!', 'error')
    }
  }

  // // optional: same as handleFinalSave but kept for backward compatibility
  // const handleSavePurchase = handleFinalSave
  return (
    <div style={{ border: '1px solid #9b9fa4ff', borderRadius: 6, padding: '8px' }}>
      <div
        className="d-flex flex-wrap justify-content-between align-items-center"
        style={{
          color: 'var(--color-black)',
        }}
      >
        <CFormCheck id="nonLocal" label="Non-Local Supplier (IGST)" />

        <div className="d-flex align-items-center gap-3">
          <CRow className="mb-2">
            <CCol md={2}>
              <label className="small mb-1">Date</label>
            </CCol>
            <CCol md={8}>
              <CFormInput
                type="date"
                size="sm"
                value={payload.invoiceDate || new Date().toISOString().slice(0, 10)}
                onChange={(e) => updateTopField('invoiceDate', e.target.value)}
              />
            </CCol>
          </CRow>

          <CRow className="mb-2 gap-2">
            <CCol md={2}>
              <label className="small mb-1">Time</label>
            </CCol>
            <CCol md={8}>
              <CFormInput
                type="time"
                size="sm"
                defaultValue={new Date().toTimeString().slice(0, 5)}
              />
            </CCol>
          </CRow>
        </div>
      </div>

      {/* ----------------------- TOP BILLING DETAILS ----------------------- */}
      <div
        style={{
          marginBottom: '15px',
          padding: '5px',
          border: '1px solid #7DC2FF',
          borderRadius: '4px',
          color: 'var(--color-black)',
        }}
      >
        {/* First Row */}
        <CRow className="gy-1">
          <CCol xs={12} sm={6} md={2}>
            <CFormLabel htmlFor="purchaseBillNo" className="me-2">
              Purchase BillNo
            </CFormLabel>
            <CFormInput
              id="purchaseBillNo"
              className="w-100"
              value={payload.purchaseBillNo}
              onChange={(e) => updateTopField('purchaseBillNo', e.target.value)}
              style={{ color: 'var(--color-black)' }}
            />
          </CCol>

          <CCol xs={12} sm={6} md={2}>
            <CFormLabel htmlFor="invoiceDateInput">Invoice Date</CFormLabel>
            <CFormInput
              id="invoiceDateInput"
              type="date"
              value={payload.invoiceDate}
              onChange={(e) => updateTopField('invoiceDate', e.target.value)}
              style={{ color: 'var(--color-black)' }}
            />
          </CCol>
          <CCol xs={12} sm={6} md={2}>
            <CFormLabel htmlFor="receivingDateInput">Receiving Date</CFormLabel>
            <CFormInput
              id="receivingDateInput"
              type="date"
              value={payload.receivingDate}
              onChange={(e) => updateTopField('receivingDate', e.target.value)}
              style={{ color: 'var(--color-black)' }}
            />
          </CCol>

          <CCol xs={12} sm={6} md={2}>
            <CFormLabel>Department:</CFormLabel>
            <CFormInput
              value={payload.department}
              onChange={(e) => updateTopField('department', e.target.value)}
              placeholder="Department"
            />
          </CCol>
          <CCol xs={12} sm={6} md={2}>
            <CFormLabel htmlFor="invoiceNo">Invoice No</CFormLabel>
            <CFormInput
              id="invoiceNo"
              className="w-100"
              value={payload.invoiceNo}
              onChange={(e) => updateTopField('invoiceNo', e.target.value)}
              style={{ color: 'var(--color-black)' }}
            />
          </CCol>
          <CCol xs={12} sm={6} md={2}>
            <CFormCheck
              type="radio"
              name="taxOptions"
              id="inclusiveTax"
              label="Inclusive Tax"
              onChange={() => updateTopField('taxType', 'Inclusive')}
              checked={payload.taxType === 'Inclusive'}
            />
            <CFormCheck
              type="radio"
              name="taxOptions"
              id="exclusiveTax"
              label="Exclusive Tax"
              onChange={() => updateTopField('taxType', 'Exclusive')}
              checked={payload.taxType === 'Exclusive' || payload.taxType === ''}
            />
            <CFormCheck
              type="radio"
              name="taxOptions"
              id="automatic"
              label="Automatic"
              onChange={() => updateTopField('taxType', 'Automatic')}
              checked={payload.taxType === 'Automatic'}
            />
          </CCol>

          {/* <CCol xs={12} md={2}>
            <CFormLabel htmlFor="duePaidBillNosTextarea">Due Paid BillNos</CFormLabel>
            <CFormTextarea
              id="duePaidBillNosTextarea"
              rows={2}
              value={payload.duePaidBillNo}
              onChange={(e) => updateTopField('duePaidBillNo', e.target.value)}
              placeholder="Enter multiple bill numbers..."
              style={{ color: 'var(--color-black)' }}
            />
          </CCol> */}
        </CRow>

        {/* Second Row */}
        <CRow className="gy-2 align-items-center">
          {/* New Product */}
          <CCol xs={12} sm={6} md={2}>
            <CButton
              size="sm"
              onClick={handleAddProduct}
              className="w-100"
              style={{
                color: 'var(--color-black)',
                backgroundColor: 'var(--color-bgcolor)',
              }}
            >
              New Product
            </CButton>
          </CCol>

          {/* Update Product List */}
          <CCol xs={12} sm={6} md={2}>
            <CButton
              size="sm"
              className="w-100"
              style={{
                color: 'var(--color-black)',
                backgroundColor: 'var(--color-bgcolor)',
              }}
            >
              Update Product List
            </CButton>
          </CCol>

          {/* New Supplier */}
          <CCol xs={12} sm={6} md={2}>
            <CButton
              size="sm"
              onClick={goToSupplier}
              className="w-100"
              style={{
                color: 'var(--color-black)',
                backgroundColor: 'var(--color-bgcolor)',
              }}
            >
              New Supplier
            </CButton>
          </CCol>

          {/* Financial Year Input */}
          <CCol xs={12} sm={6} md={3}>
            <CFormLabel htmlFor="financialYear">Financial Year:</CFormLabel>
            <CFormInput
              id="financialYear"
              value={payload.financialYear}
              onChange={(e) => updateTopField('financialYear', e.target.value)}
              placeholder="2025-2026"
              className="w-100"
            />
          </CCol>

          {/* Supplier Select */}
          <CCol xs={12} sm={6} md={3}>
            <CFormLabel htmlFor="supplierSelect" className="me-2 mb-0">
              Supplier
            </CFormLabel>
            <CFormSelect
              id="supplierSelect"
              className="w-100"
              value={suppliers.find((s) => s.name === payload.supplierName)?.id || ''}
              onChange={handleSupplierSelect}
              style={{ color: 'var(--color-black)' }}
            >
              <option value="">-- Select Supplier --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </CFormSelect>
          </CCol>
        </CRow>
      </div>

      {/* ----------------------- PURCHASE TABLE ----------------------- */}
      <div style={{ position: 'relative', marginTop: '20px', marginBottom: '10px' }}>
        <div
          style={{
            position: 'absolute',
            top: '-12px',
            left: '20px', 
            padding: '0 10px',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            color: 'var(--color-black)',
            backgroundColor: 'var(--color-bgcolor)',
          }}
        >
          Purchase Details
        </div>
        <fieldset
          style={{
            border: '2px solid #939ba3d4',
            borderRadius: '6px',
            padding: '15px',
            color: 'var(--color-black)',
          }}
        >
          {/* ----- Your TABLE ----- */}
          <div
            style={{
              maxHeight: '150px', // height for approx 3 rows
              overflowY: 'auto', // vertical scroll
              overflowX: 'auto', // horizontal scroll
              color: 'var(--color-black)',
              border: '1px solid #ccc',
            }}
          >
            <CTable bordered hover responsive>
              <CTableHead style={{ backgroundColor: 'var(--color-bgcolor)' }}>
                <CTableRow>
                  <CTableHeaderCell style={{ minWidth: '40px', color: 'var(--color-black)' }}>
                    Sno
                  </CTableHeaderCell>
                  <CTableHeaderCell style={{ minWidth: '160px', color: 'var(--color-black)' }}>
                    Product Name
                  </CTableHeaderCell>
                  <CTableHeaderCell style={{ minWidth: '100px', color: 'var(--color-black)' }}>
                    Batch No
                  </CTableHeaderCell>
                  <CTableHeaderCell style={{ minWidth: '110px', color: 'var(--color-black)' }}>
                    Exp. Date
                  </CTableHeaderCell>
                  <CTableHeaderCell style={{ minWidth: '90px', color: 'var(--color-black)' }}>
                    Quantity
                  </CTableHeaderCell>
                  <CTableHeaderCell style={{ minWidth: '90px', color: 'var(--color-black)' }}>
                    Pack Size
                  </CTableHeaderCell>
                  <CTableHeaderCell style={{ minWidth: '80px', color: 'var(--color-black)' }}>
                    Free
                  </CTableHeaderCell>
                  <CTableHeaderCell style={{ minWidth: '90px', color: 'var(--color-black)' }}>
                    GST%
                  </CTableHeaderCell>
                  <CTableHeaderCell style={{ minWidth: '120px', color: 'var(--color-black)' }}>
                    Cost Price
                  </CTableHeaderCell>
                  <CTableHeaderCell style={{ minWidth: '100px', color: 'var(--color-black)' }}>
                    MRP
                  </CTableHeaderCell>
                  <CTableHeaderCell style={{ minWidth: '90px', color: 'var(--color-black)' }}>
                    Disc%
                  </CTableHeaderCell>
                  <CTableHeaderCell style={{ minWidth: '80px', color: 'var(--color-black)' }}>
                    Actions
                  </CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>
                {payload.medicineDetails.map((item, index) => (
                  <CTableRow
                    key={index}
                    style={{
                      color: 'var(--color-black)',
                    }}
                  >
                    <CTableDataCell>{item.sno}</CTableDataCell>
                    <CTableDataCell>
                      <input
                        className="form-control w-100"
                        value={item.productName}
                        onChange={(e) => updateProductField(index, 'productName', e.target.value)}
                      />
                    </CTableDataCell>
                    <CTableDataCell>
                      <input
                        className="form-control w-100"
                        value={item.batchNo}
                        onChange={(e) => updateProductField(index, 'batchNo', e.target.value)}
                      />
                    </CTableDataCell>
                    <CTableDataCell>
                      <input
                        type="date"
                        className="form-control w-100"
                        value={item.expDate}
                        onChange={(e) => updateProductField(index, 'expDate', e.target.value)}
                        style={{
                          color: 'var(--color-black)',
                        }}
                      />
                    </CTableDataCell>
                    <CTableDataCell>
                      <input
                        type="number"
                        className="form-control w-100 text-end"
                        value={item.quantity}
                        onChange={(e) => updateProductField(index, 'quantity', e.target.value)}
                      />
                    </CTableDataCell>
                    <CTableDataCell>
                      <input
                        type="text"
                        className="form-control w-100 text-end"
                        value={item.packSize}
                        onChange={(e) => updateProductField(index, 'packSize', e.target.value)}
                        // packSize kept in UI but will be ignored when sending payload to backend
                      />
                    </CTableDataCell>
                    <CTableDataCell>
                      <input
                        type="number"
                        className="form-control w-100 text-end"
                        value={item.free}
                        onChange={(e) => updateProductField(index, 'free', e.target.value)}
                      />
                    </CTableDataCell>
                    <CTableDataCell>
                      {item.isSaved ? (
                        item.gstPercent
                      ) : (
                        <input
                          type="number"
                          className="form-control w-100 text-end"
                          value={item.gstPercent}
                          onChange={(e) => updateProductField(index, 'gstPercent', e.target.value)}
                        />
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      {item.isSaved ? (
                        item.costPrice
                      ) : (
                        <input
                          type="number"
                          className="form-control w-100 text-end"
                          value={item.costPrice}
                          onChange={(e) => updateProductField(index, 'costPrice', e.target.value)}
                        />
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      {item.isSaved ? (
                        item.mrp
                      ) : (
                        <input
                          type="number"
                          className="form-control w-100 text-end"
                          value={item.mrp}
                          onChange={(e) => updateProductField(index, 'mrp', e.target.value)}
                        />
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      {item.isSaved ? (
                        item.discPercent
                      ) : (
                        <input
                          type="number"
                          className="form-control w-100 text-end"
                          value={item.discPercent}
                          onChange={(e) => updateProductField(index, 'discPercent', e.target.value)}
                        />
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      <div className="d-flex gap-1">
                        <CButton size="sm" onClick={() => handleRemoveProduct(index)}>
                          Remove
                        </CButton>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </div>

          {/* ----- TOTALS SECTION ----- */}
          <CCardBody style={{ padding: '5px 0' }}>
            <CRow className="g-2 border-bottom pb-2">
              {/* Column Group 1 */}
              <CCol md={2}>
                {['Total Amt', 'Disc %', 'Net Amt'].map((label) => (
                  <CRow key={label} style={{ marginBottom: '4px' }}>
                    <CCol xs={6}>
                      <CFormLabel className="text-end fw-bold mb-0">{label}</CFormLabel>
                    </CCol>
                    <CCol xs={6}>
                      <CFormInput disabled value="0" className="text-end bg-light" />
                    </CCol>
                  </CRow>
                ))}
              </CCol>

              {/* Column Group 2 */}
              <CCol md={2}>
                {['SGST', 'CGST', 'IGST'].map((tax) => (
                  <CRow key={tax} style={{ marginBottom: '4px' }}>
                    <CCol xs={6}>
                      <CFormLabel className="text-end fw-bold mb-0">{tax}</CFormLabel>
                    </CCol>
                    <CCol xs={6}>
                      <CFormInput disabled value="0" className="text-end bg-light" />
                    </CCol>
                  </CRow>
                ))}
              </CCol>

              {/* Column Group 3 */}
              <CCol md={2}>
                {['Total Tax', 'Final Total', 'Previous Adj'].map((item) => (
                  <CRow key={item} style={{ marginBottom: '4px' }}>
                    <CCol xs={6}>
                      <CFormLabel className="text-end fw-bold mb-0">{item}</CFormLabel>
                    </CCol>
                    <CCol xs={6}>
                      <CFormInput disabled value="0" className="text-end bg-light" />
                    </CCol>
                  </CRow>
                ))}
              </CCol>

              {/* Column Group 4 */}
              <CCol md={2}>
                {['Bal. Amt', 'Due Paid', 'PostDisc'].map((item) => (
                  <CRow key={item} style={{ marginBottom: '4px' }}>
                    <CCol xs={6}>
                      <CFormLabel className="text-end fw-bold mb-0">{item}</CFormLabel>
                    </CCol>
                    <CCol xs={6}>
                      <CFormInput disabled value="0" className="text-end bg-light" />
                    </CCol>
                  </CRow>
                ))}

                {/* <CRow style={{ marginBottom: '4px' }}>
                  <CCol xs={6}>
                    <CFormLabel className="fw-bold mb-0">Bill Due Date</CFormLabel>
                  </CCol>
                  <CCol xs={6}>
                    <CFormInput
                      type="date"
                      disabled
                      value={payload.billDueDate}
                      onChange={(e) => updateTopField('billDueDate', e.target.value)}
                      className="bg-light"
                      style={{ color: 'var(--color-black)' }}
                    />
                  </CCol>
                </CRow> */}
              </CCol>
              {/* Column Group 5 */}
              <CCol md={2}>
                <CRow style={{ marginBottom: '4px' }}>
                  <CCol xs={6}>
                    <CFormLabel className="fw-bold mb-0">PayMode</CFormLabel>
                  </CCol>
                  <CCol xs={6}>
                    <CFormSelect
                      disabled
                      value={payload.paymentMode}
                      onChange={(e) => updateTopField('paymentMode', e.target.value)}
                      className="bg-light"
                      style={{ color: 'var(--color-black)' }}
                    >
                      <option value="">Select</option>
                      <option value="cash">CASH</option>
                      <option value="card">CARD</option>
                      <option value="bank">BANK</option>
                    </CFormSelect>
                  </CCol>
                </CRow>
                {['CreditDays','NetPayable'].map((label) => (
                  <CRow key={label} style={{ marginBottom: '4px' }}>
                    <CCol xs={6}>
                      <CFormLabel className="text-end fw-bold mb-0">{label}</CFormLabel>
                    </CCol>
                    <CCol xs={6}>
                      <CFormInput disabled value="0" className="text-end bg-light" />
                    </CCol>
                  </CRow>
                ))}
              </CCol>
              {/* Column Group 6 */}
              <CCol md={2}>
                {['CST'].map((label) => (
                  <CRow key={label} style={{ marginBottom: '4px' }}>
                    <CCol xs={6}>
                      <CFormLabel className="text-end fw-bold mb-0">{label}</CFormLabel>
                    </CCol>
                    <CCol xs={6}>
                      <CFormInput disabled value="0" className="text-end bg-light" />
                    </CCol>
                  </CRow>
                ))}
              </CCol>
              {/* Checkbox */}
              <CFormCheck
                type="checkbox"
                id="displayPurchaseDetails"
                label="Display Previous Purchase Details"
                className="me-4 mt-2"
                style={{ color: 'var(--color-black)' }}
              />
            </CRow>
          </CCardBody>
        </fieldset>
      </div>

      {/* ----------------------- SEARCH / NAVIGATION BAR ----------------------- */}
      <div
        className="d-flex align-items-center"
        style={{
          color: 'var(--color-black)',
          background: '#E8F3FF',
          padding: '6px 10px',
          borderRadius: '6px',
          border: '1px solid #B5D9FF',
          overflowX: 'auto', // Keeps the entire bar horizontally scrollable if content overflows
        }}
      >
        {/* 🔍 Search Label and Input */}
        <CFormLabel
          className="fw-bold me-2 mb-0"
          style={{
            color: 'var(--color-black)',
          }}
        >
          Search
        </CFormLabel>
        <CFormInput
          type="text"
          placeholder="Search here..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '160px', height: '25px', padding: '0 5px' }}
          className="me-3"
        />

        {/* Date Range Inputs */}
        <CFormLabel className="fw-bold me-2 mb-0">From</CFormLabel>
        <CFormInput
          type="date"
          value={payload.invoiceDate || '2025-11-12'}
          style={{ width: '120px', height: '25px', padding: '0 5px', color: 'var(--color-black)' }}
          className="me-3"
        />

        <CFormLabel className="fw-bold me-2 mb-0">To</CFormLabel>
        <CFormInput
          type="date"
          value={payload.receivingDate || '2025-11-13'}
          style={{ width: '120px', height: '25px', padding: '0 5px', color: 'var(--color-black)' }}
          className="me-3"
        />

        {/* Navigation Buttons */}
        <CButton
          size="sm"
          className="me-2"
          style={{
            height: '25px',
            padding: '0 5px',
            whiteSpace: 'nowrap',
            color: 'var(--color-black)',
            backgroundColor: 'var(--color-bgcolor)',
          }}
        >
          Move first
        </CButton>
        <CButton
          size="sm"
          className="me-2"
          style={{
            height: '25px',
            padding: '0 5px',
            whiteSpace: 'nowrap',
            color: 'var(--color-black)',
            backgroundColor: 'var(--color-bgcolor)',
          }}
        >
          Move previous
        </CButton>
        <CButton
          size="sm"
          className="me-2"
          style={{
            height: '25px',
            padding: '0 5px',
            whiteSpace: 'nowrap',
            color: 'var(--color-black)',
            backgroundColor: 'var(--color-bgcolor)',
          }}
        >
          Move next
        </CButton>
        <CButton
          size="sm"
          className="me-3" // Increased margin here to separate from icons
          style={{
            height: '25px',
            padding: '0 5px',
            whiteSpace: 'nowrap',
            color: 'var(--color-black)',
            backgroundColor: 'var(--color-bgcolor)',
          }}
        >
          Move last
        </CButton>

        {/* Tool Icons (Save, Print, Search/Find) */}
        <CIcon
          icon={cilSave}
          size="lg"
          className="mx-1"
          style={{ cursor: 'pointer', flexShrink: 0 }} // Prevent icons from shrinking
          onClick={handleFinalSave}
        />
        <CIcon
          icon={cilPrint}
          size="lg"
          className="mx-1"
          style={{ cursor: 'pointer', flexShrink: 0 }}
        />
        <CIcon
          icon={cilMagnifyingGlass}
          size="lg"
          className="mx-3" // Increased margin here to separate from action buttons
          style={{ cursor: 'pointer', flexShrink: 0 }}
        />

        {/* Action Buttons (Close, Print) - Pushed to the far right */}
        <div className="ms-auto d-flex gap-2" style={{ flexShrink: 0 }}>
          <CButton
            color="light
          "
            size="sm"
            style={{ height: '25px', padding: '0 5px', color: 'var(--color-black)' }}
          >
            Close
          </CButton>
          <CButton
            size="sm"
            style={{
              height: '25px',
              padding: '0 5px',
              color: 'var(--color-black)',
              backgroundColor: 'var(--color-bgcolor)',
            }}
          >
            Print
          </CButton>
        </div>
      </div>
    </div>
  )
}

export default Purchases
