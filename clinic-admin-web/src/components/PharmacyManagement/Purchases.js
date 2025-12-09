import React, { useEffect, useState, useCallback } from 'react'
import {
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
} from '@coreui/react'

import CIcon from '@coreui/icons-react'
import { cilMagnifyingGlass, cilPrint, cilSave } from '@coreui/icons'

import { postPurchaseData, PurchaseData } from '../PharmacyManagement/PurchasesAPI'
import { SupplierData } from './SupplierInfoAPI'
import { showCustomToast } from '../../Utils/Toaster'
import { BASE_URL, wifiUrl } from '../../baseUrl'
import axios from 'axios'
import { Trash2 } from 'lucide-react'

const Purchases = ({ goToSupplier }) => {
  // top-level states
  const [purchaseData, setPurchaseData] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [suppliers, setSuppliers] = useState([])
  const [error, setError] = useState(null)

  // totals returned by backend
  const [totals, setTotals] = useState({
    totalAmount: 0,
    discountAmountTotal: 0,
    netAmount: 0,
    totalIGST: 0,
    totalCGST: 0,
    totalSGST: 0,
    totalTax: 0,
    finalTotal: 0,
    paidAmount: 0,
    balanceAmount: 0,
    previousAdjustment: 0,
    postDiscount: 0,
    netPayable: 0,
  })

  // fetch purchases (list)
  const fetchPurchase = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await PurchaseData()
      const safeData = Array.isArray(data)
        ? data.filter((item) => item && typeof item === 'object')
        : []
      setPurchaseData(safeData)
    } catch (err) {
      console.error('Error fetching purchase:', err)
      setError('Failed to fetch purchase data.')
      setPurchaseData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPurchase()
  }, [fetchPurchase])

  // fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get(`${wifiUrl}/api/pharmacy/supplier/getAll`)
        const list = response.data?.data || []

        const supplierList = list.map((item) => ({
          id: item.supplierId,
          name: item.supplierName,
        }))

        setSuppliers(supplierList)
      } catch (err) {
        console.error('Error fetching suppliers:', err)
      }
    }

    fetchSuppliers()
  }, [])

  // payload (UI state)
  const [payload, setPayload] = useState({
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toTimeString().slice(0, 5),
    purchaseBillNo: '',
    invoiceNo: '',
    supplierName: '',
    invoiceDate: '',
    receivingDate: '',
    taxType: 'GST',
    paymentMode: 'cash',
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
        sno: 1,
        productId: '',
        productName: '',
        batchNo: '',
        expiryDate: '',
        hsnCode: '',
        quantity: '',
        packSize: '',
        free: '',
        mrp: '',
        costPrice: '',
        discPercent: '',
        gstPercent: '',
        category: '',
      },
    ],
  })

  // errors state: top-level + per-product rows
  const [errors, setErrors] = useState({
    top: {},
    products: [], // index-aligned with medicineDetails
  })

  // ---------- Validation helpers ----------
  const todayStart = () => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }

  const validateField = (field, value) => {
    switch (field) {
      case 'purchaseBillNo':
        if (!value || value.toString().trim() === '') return 'Purchase Bill No is required'
        return ''
      case 'invoiceNo':
        if (!value || value.toString().trim() === '') return 'Invoice No is required'
        return ''
      case 'supplierName':
        if (!value || value.toString().trim() === '') return 'Supplier is required'
        return ''
      case 'invoiceDate':
        if (!value) return 'Invoice Date is required'
        return ''
      case 'receivingDate':
        if (!value) return 'Receiving Date is required'
        return ''
      case 'financialYear':
        if (!value || value.toString().trim() === '') return 'Financial Year is required'
        return ''
      default:
        return ''
    }
  }

  const validateProductRow = (item, rowIndex, existingKeys = null) => {
    const rowErrors = {}
    const isRowEmpty =
      (!item.productName || item.productName.toString().trim() === '') &&
      (!item.batchNo || item.batchNo.toString().trim() === '')&&  (!item.expDate || item.expDate.trim() === '')
   

    if (isRowEmpty) return {}

    // productId (optional: you can make this required if needed)
    if (item.productId && item.productId.toString().trim().length === 0) {
      rowErrors.productId = 'Product ID is required'
    }
    if (!item.expDate) {
  rowErrors.expDate = 'Required'
}


    // productName
    if (!item.productName || item.productName.toString().trim() === '') {
      rowErrors.productName = 'Required'
    } else if (item.productName.toString().length < 2) {
      rowErrors.productName = 'Too short'
    }

    // batchNo
    if (!item.batchNo || item.batchNo.toString().trim() === '') {
      rowErrors.batchNo = 'Required'
    }

    // duplicate product+batch
    if (existingKeys) {
      const key = `${(item.productName || '')
        .toString()
        .trim()
        .toLowerCase()}__${(item.batchNo || '').toString().trim().toLowerCase()}`
      if (existingKeys.has(key)) {
        rowErrors.batchNo = 'Duplicate product & batch'
      }
    }

    // expDate
    if (!item.expDate) {
      rowErrors.expDate = 'Required'
    } else {
      const exp = new Date(item.expDate)
      exp.setHours(0, 0, 0, 0)
      if (exp < todayStart()) {
        rowErrors.expDate = 'Expiry cannot be in the past'
      }
    }

    // hsnCode
    const hsnString = (item.hsnCode || '').toString().trim()
    if (!/^[0-9]{4,8}$/.test(hsnString)) {
      rowErrors.hsnCode = 'HSN should be 4–8 digits'
    }

    // quantity > 0
    if (
      item.quantity === '' ||
      item.quantity === null ||
      isNaN(Number(item.quantity)) ||
      Number(item.quantity) <= 0
    ) {
      rowErrors.quantity = 'Enter quantity > 0'
    }

    // costPrice > 0
    if (
      item.costPrice === '' ||
      item.costPrice === null ||
      isNaN(Number(item.costPrice)) ||
      Number(item.costPrice) <= 0
    ) {
      rowErrors.costPrice = 'Enter valid cost'
    }

    // mrp > 0
    if (
      item.mrp === '' ||
      item.mrp === null ||
      isNaN(Number(item.mrp)) ||
      Number(item.mrp) <= 0
    ) {
      rowErrors.mrp = 'Enter valid MRP'
    }

    // gstPercent 0–28
    if (item.gstPercent !== '' && item.gstPercent !== null && !isNaN(Number(item.gstPercent))) {
      const g = Number(item.gstPercent)
      if (g < 0 || g > 28) rowErrors.gstPercent = 'GST% must be 0–28'
    } else {
      rowErrors.gstPercent = 'Enter GST%'
    }

    // discPercent 0–100
    if (item.discPercent !== '' && item.discPercent !== null && !isNaN(Number(item.discPercent))) {
      const d = Number(item.discPercent)
      if (d < 0 || d > 100) rowErrors.discPercent = 'Disc% must be 0–100'
    }

    return rowErrors
  }

  // ---------- update helpers (real-time validation) ----------
  const updateTopField = (field, value) => {
    setPayload((prev) => ({ ...prev, [field]: value }))
    const message = validateField(field, value)
    setErrors((prev) => ({ ...prev, top: { ...(prev.top || {}), [field]: message } }))
  }

  const numericProductFields = ['quantity', 'freeQty', 'mrp', 'costPrice', 'discountPercent', 'gstPercent']


  const updateProductField = (index, field, value) => {
    // update payload
    setPayload((prev) => {
      const updated = [...prev.medicineDetails]
      updated[index][field] = numericProductFields.includes(field)
        ? value === ''
          ? ''
          : Number(value)
        : value
      return { ...prev, medicineDetails: updated }
    })

    // validate row
    setErrors((prev) => {
      const prodErrors = Array.isArray(prev.products) ? [...prev.products] : []
      const currentRow = { ...(payload.medicineDetails[index] || {}) }
      currentRow[field] = numericProductFields.includes(field)
        ? value === ''
          ? ''
          : Number(value)
        : value

      const existingKeys = new Set()
      payload.medicineDetails.forEach((r, i) => {
        if (i === index) return
        const key = `${(r.productName || '').toString().trim().toLowerCase()}__${(
          r.batchNo || ''
        )
          .toString()
          .trim()
          .toLowerCase()}`
        if (r.productName || r.batchNo) existingKeys.add(key)
      })

      const rowValidation = validateProductRow(currentRow, index, existingKeys)
      prodErrors[index] = rowValidation
      return { ...prev, products: prodErrors }
    })
  }

  const handleAddProduct = () => {
    setPayload((prev) => ({
      ...prev,
      medicineDetails: [
        ...prev.medicineDetails,
        {
          sno: prev.medicineDetails.length + 1,
          productId: '',
          productName: '',
          batchNo: '',
          expDate: '',
          hsnCode: '',
          quantity: '',
          packSize: '',
          freeQty: '',
          mrp: '',
          costPrice: '',
          discountPercent: '',
          gstPercent: '',
          category: '',
          isSaved: false,
        },
      ],
    }))

    setErrors((prev) => {
      const prod = Array.isArray(prev.products) ? [...prev.products] : []
      prod.push({})
      return { ...prev, products: prod }
    })
  }

  const handleRemoveProduct = (index) => {
    setPayload((prev) => {
      const updated = prev.medicineDetails.filter((_, i) => i !== index)
      const renumbered = updated.map((r, idx) => ({ ...r, sno: idx + 1 }))
      return { ...prev, medicineDetails: renumbered }
    })

    setErrors((prev) => {
      const prod = Array.isArray(prev.products) ? [...prev.products] : []
      prod.splice(index, 1)
      return { ...prev, products: prod }
    })
  }

  const handleSupplierSelect = (e) => {
    const selectedText = e.target.selectedOptions?.[0]?.text || ''
    updateTopField('supplierName', selectedText)
  }

  // ---------- run full validation ----------
  const runFullValidation = () => {
    const topFields = [
      'purchaseBillNo',
      'invoiceNo',
      'supplierName',
      'invoiceDate',
      'receivingDate',
      'financialYear',
    ]

    const topErrors = {}
    topFields.forEach((f) => {
      const msg = validateField(f, payload[f])
      if (msg) topErrors[f] = msg
    })

    // invoice vs receiving date
    if (payload.invoiceDate && payload.receivingDate) {
      const inv = new Date(payload.invoiceDate)
      inv.setHours(0, 0, 0, 0)
      const rec = new Date(payload.receivingDate)
      rec.setHours(0, 0, 0, 0)
      if (rec < inv) {
        topErrors.receivingDate = 'Receiving Date cannot be earlier than Invoice Date'
      }
    }

    // at least one non-empty product row
    const nonEmptyRows = payload.medicineDetails.filter(
      (row) =>
        (row.productName && row.productName.toString().trim() !== '') ||
        (row.batchNo && row.batchNo.toString().trim() !== '') ||
        (row.expDate && row.expDate.toString().trim() !== ''),
    )
    if (nonEmptyRows.length === 0) {
      topErrors.products = 'Add at least one product'
    }

    const productErrorsArr = payload.medicineDetails.map(() => ({}))
    const seen = new Set()

    payload.medicineDetails.forEach((item, idx) => {
      const key = `${(item.productName || '').toString().trim().toLowerCase()}__${(
        item.batchNo || ''
      )
        .toString()
        .trim()
        .toLowerCase()}`

      const otherKeys = new Set()
      payload.medicineDetails.forEach((r, j) => {
        if (j === idx) return
        const k = `${(r.productName || '').toString().trim().toLowerCase()}__${(
          r.batchNo || ''
        )
          .toString()
          .trim()
          .toLowerCase()}`
        if (r.productName || r.batchNo) otherKeys.add(k)
      })

      const rowErrors = validateProductRow(item, idx, otherKeys)
      productErrorsArr[idx] = rowErrors

      if (key && (item.productName || item.batchNo)) {
        if (seen.has(key)) {
          productErrorsArr[idx] = {
            ...(productErrorsArr[idx] || {}),
            batchNo: 'Duplicate product & batch',
          }
        } else {
          seen.add(key)
        }
      }
    })

    setErrors({ top: topErrors, products: productErrorsArr })

    const hasTopErrors = Object.keys(topErrors).length > 0
    const hasProductErr = productErrorsArr.some((r) => Object.keys(r || {}).length > 0)

    return !(hasTopErrors || hasProductErr)
  }

  // ---------- final save ----------
  const handleFinalSave = async () => {
    const ok = runFullValidation()
    if (!ok) {
      showCustomToast('Fix errors before saving', 'error')
      return
    }

    // filter out entirely empty rows
    const filteredRows = payload.medicineDetails.filter(
      (row) =>
        (row.productName && row.productName.toString().trim() !== '') ||
        (row.batchNo && row.batchNo.toString().trim() !== '') ||
        (row.expDate && row.expDate.toString().trim() !== ''),
    )

 const mappedMedicineDetails = filteredRows.map((item) => ({
  productId: item.productId?.trim() || "NA",
  productName: item.productName || "",
  batchNo: item.batchNo || "",
 expiryDate: item.expDate || "",  

  packSize: item.packSize || "",
  category: item.category || "",
  hsnCode: item.hsnCode || "",
  quantity: Number(item.quantity) || 0,
 freeQty: Number(item.free) || 0,

  costPrice: Number(item.costPrice) || 0,
  mrp: Number(item.mrp) || 0,
  discountPercent: Number(item.discPercent) || 0, // FIXED NAME
  gstPercent: Number(item.gstPercent) || 0,
}));





  const finalPayload = {
  date: payload.date,
  time: payload.time,
  purchaseBillNo: payload.purchaseBillNo,
  invoiceNo: payload.invoiceNo,
  supplierName: payload.supplierName,
  invoiceDate: payload.invoiceDate,
  receivingDate: payload.receivingDate,
  taxType: payload.taxType,
  paymentMode: payload.paymentMode,
  billDueDate: payload.billDueDate,
  creditDays: payload.creditDays || "0",
  duePaidBillNo: payload.duePaidBillNo,
  department: payload.department,
  financialYear: payload.financialYear,
  paidAmount: Number(payload.paidAmount) || 0,
  previousAdjustment: Number(payload.previousAdjustment) || 0,
  postDiscount: Number(payload.postDiscount) || 0,
  medicineDetails: mappedMedicineDetails,
};


    console.log('FINAL PAYLOAD READY TO POST >>>>', finalPayload)

    try {
      const response = await postPurchaseData(finalPayload)
      const respData = response?.data?.data || response?.data || {}
      showCustomToast('Purchase saved successfully!', 'success')

      setTotals({
        totalAmount: respData.totalAmount || 0,
        discountAmountTotal: respData.discountAmountTotal || 0,
        netAmount: respData.netAmount || 0,
        totalIGST: respData.totalIGST || 0,
        totalCGST: respData.totalCGST || 0,
        totalSGST: respData.totalSGST || 0,
        totalTax: respData.totalTax || 0,
        finalTotal: respData.finalTotal || 0,
        paidAmount: respData.paidAmount || 0,
        balanceAmount: respData.balanceAmount || 0,
        previousAdjustment: respData.previousAdjustment || 0,
        postDiscount: respData.postDiscount || 0,
        netPayable: respData.netPayable || 0,
      })

      fetchPurchase()
    } catch (err) {
      console.error('Save Failed:', err)
      const msg = err?.response?.data?.message || 'Failed to save purchase!'
      showCustomToast(msg, 'error')
    }
  }

  // -------------------- Render --------------------
  return (
    <div style={{ border: '1px solid #9b9fa4ff', borderRadius: 6, padding: '12px' }}>
      <div
        className="d-flex flex-wrap justify-content-between align-items-center"
        style={{ color: 'var(--color-black)' }}
      >
        <div className="d-flex align-items-center gap-3">
          <CRow className="mb-2">
            <CCol md={2}>
              <label className="small mb-1">Date</label>
            </CCol>
            <CCol md={8}>
              <CFormInput type="date" size="sm" value={payload.date} readOnly />
            </CCol>
          </CRow>

          <CRow className="mb-2">
            <CCol md={2}>
              <label className="small mb-1">Time</label>
            </CCol>
            <CCol md={8}>
              <CFormInput type="time" size="sm" value={payload.time} readOnly />
            </CCol>
          </CRow>
        </div>
      </div>

      {/* TOP BILLING DETAILS */}
      <div
        style={{
          marginBottom: '15px',
          padding: '8px',
          border: '1px solid #7DC2FF',
          borderRadius: '4px',
          color: 'var(--color-black)',
        }}
      >
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
            />
            {errors.top.purchaseBillNo && (
              <div className="text-danger small mt-1">{errors.top.purchaseBillNo}</div>
            )}
          </CCol>

          <CCol xs={12} sm={6} md={2}>
            <CFormLabel htmlFor="invoiceDateInput">Invoice Date</CFormLabel>
            <CFormInput
              id="invoiceDateInput"
              type="date"
              value={payload.invoiceDate}
              onChange={(e) => updateTopField('invoiceDate', e.target.value)}
            />
            {errors.top.invoiceDate && (
              <div className="text-danger small mt-1">{errors.top.invoiceDate}</div>
            )}
          </CCol>

          <CCol xs={12} sm={6} md={2}>
            <CFormLabel htmlFor="receivingDateInput">Receiving Date</CFormLabel>
            <CFormInput
              id="receivingDateInput"
              type="date"
              value={payload.receivingDate}
              onChange={(e) => updateTopField('receivingDate', e.target.value)}
            />
            {errors.top.receivingDate && (
              <div className="text-danger small mt-1">{errors.top.receivingDate}</div>
            )}
          </CCol>

          <CCol xs={12} sm={6} md={2}>
            <CFormLabel htmlFor="taxType" className="mb-0">
              Tax Type
            </CFormLabel>
            <CFormSelect
              id="taxType"
              size="sm"
              value={payload.taxType || ''}
              onChange={(e) => updateTopField('taxType', e.target.value)}
              className="w-100"
            >
              <option value="">Select Tax Type</option>
              <option value="GST">GST</option>
              <option value="IGST">IGST</option>
            </CFormSelect>
          </CCol>

          <CCol xs={12} sm={6} md={2}>
            <CFormLabel htmlFor="departmentSelect" className="mb-0">
              Tax(Inc or Exc)
            </CFormLabel>
            <CFormSelect
              id="departmentSelect"
              size="sm"
              value={payload.department || ''}
              onChange={(e) => updateTopField('department', e.target.value)}
              className="w-100"
            >
              <option value="">Select</option>
              <option value="Inclusive Tax">Inclusive Tax</option>
              <option value="Exclusive Tax">Exclusive Tax</option>
              <option value="Automatic">Automatic</option>
            </CFormSelect>
          </CCol>

          <CCol xs={12} sm={6} md={2}>
            <CFormLabel htmlFor="invoiceNo">Invoice No</CFormLabel>
            <CFormInput
              id="invoiceNo"
              className="w-100"
              value={payload.invoiceNo}
              onChange={(e) => updateTopField('invoiceNo', e.target.value)}
            />
            {errors.top.invoiceNo && (
              <div className="text-danger small mt-1">{errors.top.invoiceNo}</div>
            )}
          </CCol>
        </CRow>

        {/* second row */}
        <CRow className="gy-2 align-items-center mt-2">
          <CCol xs={12} sm={6} md={2}>
            <CButton
              size="sm"
              onClick={handleAddProduct}
              className="w-100"
              style={{ color: 'var(--color-black)', backgroundColor: 'var(--color-bgcolor)' }}
            >
              New Product
            </CButton>
          </CCol>

          <CCol xs={12} sm={6} md={2}>
            <CButton
              size="sm"
              className="w-100"
              style={{ color: 'var(--color-black)', backgroundColor: 'var(--color-bgcolor)' }}
            >
              Update Product
            </CButton>
          </CCol>

          <CCol xs={12} sm={6} md={2}>
            <CButton
              size="sm"
              onClick={goToSupplier}
              className="w-100"
              style={{ color: 'var(--color-black)', backgroundColor: 'var(--color-bgcolor)' }}
            >
              New Supplier
            </CButton>
          </CCol>

          <CCol xs={12} sm={6} md={3}>
            <CFormLabel htmlFor="financialYear">Financial Year:</CFormLabel>
            <CFormInput
              id="financialYear"
              value={payload.financialYear}
              onChange={(e) => updateTopField('financialYear', e.target.value)}
              placeholder="2025-2026"
              className="w-100"
            />
            {errors.top.financialYear && (
              <div className="text-danger small mt-1">{errors.top.financialYear}</div>
            )}
          </CCol>

          <CCol xs={12} sm={6} md={3}>
            <CFormLabel htmlFor="supplierSelect" className="me-2 mb-0">
              Supplier
            </CFormLabel>

            <CFormSelect
              id="supplierSelect"
              className="w-100"
              value={suppliers.find((s) => s.name === payload.supplierName)?.id || ''}
              onChange={handleSupplierSelect}
            >
              <option value="">-- Select Supplier --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </CFormSelect>
            {errors.top.supplierName && (
              <div className="text-danger small mt-1">{errors.top.supplierName}</div>
            )}
          </CCol>
        </CRow>

        {/* extra backend fields row */}
        <CRow className="gy-2 mt-2">
          <CCol xs={12} sm={6} md={2}>
            <CFormLabel htmlFor="billDueDate">Bill Due Date</CFormLabel>
            <CFormInput
              id="billDueDate"
              type="date"
              value={payload.billDueDate}
              onChange={(e) => updateTopField('billDueDate', e.target.value)}
            />
          </CCol>

          <CCol xs={12} sm={6} md={2}>
            <CFormLabel htmlFor="creditDays">Credit Days</CFormLabel>
            <CFormInput
              id="creditDays"
              placeholder="10 Days"
              value={payload.creditDays}
              onChange={(e) => updateTopField('creditDays', e.target.value)}
            />
          </CCol>

          <CCol xs={12} sm={6} md={2}>
            <CFormLabel htmlFor="duePaidBillNo">Due Paid Bill No</CFormLabel>
            <CFormInput
              id="duePaidBillNo"
              placeholder="Enter bill number"
              value={payload.duePaidBillNo}
              onChange={(e) => updateTopField('duePaidBillNo', e.target.value)}
            />
          </CCol>

          <CCol xs={12} sm={6} md={2}>
            <CFormLabel htmlFor="paymentMode">Payment Mode</CFormLabel>
            <CFormSelect
              id="paymentMode"
              value={payload.paymentMode}
              onChange={(e) => updateTopField('paymentMode', e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank">Bank</option>
            </CFormSelect>
          </CCol>

          <CCol xs={12} sm={6} md={2}>
            <CFormLabel htmlFor="paidAmount">Paid Amount</CFormLabel>
            <CFormInput
              id="paidAmount"
              type="number"
              value={payload.paidAmount}
              onChange={(e) => updateTopField('paidAmount', e.target.value)}
            />
          </CCol>

          <CCol xs={12} sm={6} md={2}>
            <CFormLabel htmlFor="previousAdjustment">Previous Adjustment</CFormLabel>
            <CFormInput
              id="previousAdjustment"
              type="number"
              value={payload.previousAdjustment}
              onChange={(e) => updateTopField('previousAdjustment', e.target.value)}
            />
          </CCol>

          <CCol xs={12} sm={6} md={2}>
            <CFormLabel htmlFor="postDiscount">Post Discount</CFormLabel>
            <CFormInput
              id="postDiscount"
              type="number"
              value={payload.postDiscount}
              onChange={(e) => updateTopField('postDiscount', e.target.value)}
            />
          </CCol>
        </CRow>
      </div>

      {/* PURCHASE TABLE */}
      <div style={{ position: 'relative', marginTop: '18px', marginBottom: '10px' }}>
        <div
          style={{
            position: 'absolute',
            top: '-12px',
            left: '20px',
            padding: '0 10px',
            fontSize: '1.05rem',
            color: 'var(--color-black)',
          }}
        >
          Purchase Details
        </div>

        {/* PURCHASE TABLE CARD */}
        <div
          style={{
            borderRadius: 8,
            padding: '16px',
            background: '#fff',
            color: 'var(--color-black)',
          }}
        >
          <div
            style={{
              maxHeight: 250,
              overflowY: 'auto',
              border: '1px solid #d8d8d8',
              borderRadius: 6,
              background: '#fafafa',
            }}
          >
            <CTable bordered hover responsive className="m-0" style={{ fontSize: '0.78rem' }}>
              <CTableHead
                style={{
                  background: 'var(--color-bgcolor)',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                }}
              >
                <CTableRow className="pink-table w-auto">
                  {[
                    'S.No',
                    'Product ID',
                    'Product Name',
                    'Batch No',
                    'Exp. Date',
                    'HSN Code',
                    'Category',
                    'Qty',
                    'Pack Size',
                    'Free',
                    'GST%',
                    'Cost Price',
                    'MRP',
                    'Disc%',
                    'Actions',
                  ].map((h, index) => (
                    <CTableHeaderCell
                      key={index}
                      className="text-center fw-semibold"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {h}
                    </CTableHeaderCell>
                  ))}
                </CTableRow>
              </CTableHead>

              <CTableBody>
                {payload.medicineDetails.map((item, index) => (
                  <CTableRow key={index}>
                    <CTableDataCell className="text-center">{item.sno}</CTableDataCell>

                    {/* Product ID */}
                    <CTableDataCell>
                      <CFormInput
                        size="sm"
                        className="py-0"
                        value={item.productId}
                        onChange={(e) => updateProductField(index, 'productId', e.target.value)}
                      />
                      {errors.products[index]?.productId && (
                        <div className="text-danger small mt-1">
                          {errors.products[index].productId}
                        </div>
                      )}
                    </CTableDataCell>

                    {/* Product Name */}
                    <CTableDataCell>
                      <CFormInput
                        size="sm"
                        className="py-0"
                        value={item.productName}
                        onChange={(e) => updateProductField(index, 'productName', e.target.value)}
                      />
                      {errors.products[index]?.productName && (
                        <div className="text-danger small mt-1">
                          {errors.products[index].productName}
                        </div>
                      )}
                    </CTableDataCell>

                    {/* Batch No */}
                    <CTableDataCell>
                      <CFormInput
                        size="sm"
                        className="py-0"
                        value={item.batchNo}
                        onChange={(e) => updateProductField(index, 'batchNo', e.target.value)}
                      />
                      {errors.products[index]?.batchNo && (
                        <div className="text-danger small mt-1">
                          {errors.products[index].batchNo}
                        </div>
                      )}
                    </CTableDataCell>

                    {/* Exp Date */}
                    <CTableDataCell>
                      <CFormInput
                        type="date"
                        size="sm"
                        className="py-0"
                        value={item.expDate}
                        onChange={(e) => updateProductField(index, 'expDate', e.target.value)}
                      />
                      {errors.products[index]?.expDate && (
                        <div className="text-danger small mt-1">
                          {errors.products[index].expDate}
                        </div>
                      )}
                    </CTableDataCell>

                    {/* HSN */}
                    <CTableDataCell>
                      <CFormInput
                        size="sm"
                        className="py-0"
                        placeholder="e.g. 30045010"
                        value={item.hsnCode}
                        onChange={(e) => updateProductField(index, 'hsnCode', e.target.value)}
                      />
                      {errors.products[index]?.hsnCode && (
                        <div className="text-danger small mt-1">
                          {errors.products[index].hsnCode}
                        </div>
                      )}
                    </CTableDataCell>

                    {/* Category */}
                    <CTableDataCell>
                      <CFormInput
                        size="sm"
                        className="py-0"
                        value={item.category}
                        onChange={(e) => updateProductField(index, 'category', e.target.value)}
                      />
                      {errors.products[index]?.category && (
                        <div className="text-danger small mt-1">
                          {errors.products[index].category}
                        </div>
                      )}
                    </CTableDataCell>

                    {/* Qty */}
                    <CTableDataCell>
                      <CFormInput
                        type="number"
                        size="sm"
                        className="text-end py-0"
                        value={item.quantity}
                        onChange={(e) => updateProductField(index, 'quantity', e.target.value)}
                      />
                      {errors.products[index]?.quantity && (
                        <div className="text-danger small mt-1">
                          {errors.products[index].quantity}
                        </div>
                      )}
                    </CTableDataCell>

                    {/* Pack Size */}
                    <CTableDataCell>
                      <CFormInput
                        size="sm"
                        className="text-end py-0"
                        value={item.packSize}
                        onChange={(e) => updateProductField(index, 'packSize', e.target.value)}
                      />
                    </CTableDataCell>

                    {/* Free */}
                    <CTableDataCell>
                      <CFormInput
                        type="number"
                        size="sm"
                        className="text-end py-0"
                        value={item.free}
                        onChange={(e) => updateProductField(index, 'freeQty', e.target.value)}
                      />
                    </CTableDataCell>

                    {/* GST */}
                    <CTableDataCell>
                      <CFormInput
                        type="number"
                        size="sm"
                        className="text-end py-0"
                        value={item.gstPercent}
                        onChange={(e) => updateProductField(index, 'gstPercent', e.target.value)}
                      />
                      {errors.products[index]?.gstPercent && (
                        <div className="text-danger small mt-1">
                          {errors.products[index].gstPercent}
                        </div>
                      )}
                    </CTableDataCell>

                    {/* Cost Price */}
                    <CTableDataCell>
                      <CFormInput
                        type="number"
                        size="sm"
                        className="text-end py-0"
                        value={item.costPrice}
                        onChange={(e) => updateProductField(index, 'costPrice', e.target.value)}
                      />
                      {errors.products[index]?.costPrice && (
                        <div className="text-danger small mt-1">
                          {errors.products[index].costPrice}
                        </div>
                      )}
                    </CTableDataCell>

                    {/* MRP */}
                    <CTableDataCell>
                      <CFormInput
                        type="number"
                        size="sm"
                        className="text-end py-0"
                        value={item.mrp}
                        onChange={(e) => updateProductField(index, 'mrp', e.target.value)}
                      />
                      {errors.products[index]?.mrp && (
                        <div className="text-danger small mt-1">{errors.products[index].mrp}</div>
                      )}
                    </CTableDataCell>

                    {/* Disc% */}
                    <CTableDataCell>
                      <CFormInput
                        type="number"
                        size="sm"
                        className="text-end py-0"
                        value={item.discPercent}
                       onChange={(e) => updateProductField(index, 'discountPercent', e.target.value)}
                      />
                      {errors.products[index]?.discPercent && (
                        <div className="text-danger small mt-1">
                          {errors.products[index].discPercent}
                        </div>
                      )}
                    </CTableDataCell>

                    {/* Remove Button */}
                    <CTableDataCell className="text-center">
                      <button
                        className="actionBtn"
                        onClick={() => handleRemoveProduct(index)}
                        title="Delete"
                        type="button"
                      >
                        <Trash2 size={18} />
                      </button>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </div>

          {/* product-level top error */}
          {errors.top.products && (
            <div className="text-danger small mt-2">{errors.top.products}</div>
          )}

          {/* TOTALS GRID */}
          <div
            className="mt-3 p-3"
            style={{
              background: '#F6F8FA',
              borderRadius: 6,
              border: '1px solid #DFE3E8',
            }}
          >
            <CRow className="g-3">
              {[
                ['Total Amt', totals.totalAmount],
                ['Disc %', totals.discountAmountTotal],
                ['Net Amt', totals.netAmount],
                ['Total Tax', totals.totalTax],
                ['Final Total', totals.finalTotal],
                ['Net Payable', totals.netPayable],
                ['Credit Days', payload.creditDays],
                ['Paid Amount', totals.paidAmount],
              ].map(([label, value], i) => (
                <CCol md={3} key={i}>
                  <CFormLabel className="fw-bold small mb-1">{label}</CFormLabel>
                  <CFormInput size="sm" disabled value={value} className="bg-light text-end" />
                </CCol>
              ))}
            </CRow>
          </div>
        </div>
      </div>

      {/* SEARCH / NAV BAR */}
      <div
        className="d-flex align-items-center"
        style={{
          color: 'var(--color-black)',
          background: '#E8F3FF',
          padding: '6px 10px',
          borderRadius: '6px',
          border: '1px solid #B5D9FF',
          overflowX: 'auto',
        }}
      >
        <CFormLabel className="fw-bold me-2 mb-0">Search</CFormLabel>
        <CFormInput
          type="text"
          placeholder="Search here..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '160px', height: '25px', padding: '0 5px' }}
          className="me-3"
        />

        <CFormLabel className="fw-bold me-2 mb-0">From</CFormLabel>
        <CFormInput
          type="date"
          value={payload.invoiceDate || ''}
          style={{ width: '120px', height: '25px', padding: '0 5px' }}
          className="me-3"
        />

        <CFormLabel className="fw-bold me-2 mb-0">To</CFormLabel>
        <CFormInput
          type="date"
          value={payload.receivingDate || ''}
          style={{ width: '120px', height: '25px', padding: '0 5px' }}
          className="me-3"
        />

        <CButton
          size="sm"
          className="d-flex align-items-center gap-1"
          style={{
            height: '25px',
            padding: '0 10px',
            color: 'var(--color-black)',
            backgroundColor: 'var(--color-bgcolor)',
            borderRadius: '4px',
          }}
          onClick={handleFinalSave}
        >
          <CIcon icon={cilSave} size="sm" />
          Save
        </CButton>

        <CIcon icon={cilPrint} size="lg" className="mx-1" style={{ cursor: 'pointer' }} />
        <CIcon icon={cilMagnifyingGlass} size="lg" className="mx-3" style={{ cursor: 'pointer' }} />

        <div className="ms-auto d-flex gap-2">
          <CButton
            color="light"
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
