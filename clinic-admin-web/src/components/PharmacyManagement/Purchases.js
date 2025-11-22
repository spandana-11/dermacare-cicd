import React, { useEffect, useState } from 'react'
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

// import { getAllPurchases, getPurchaseById } from '../api/PurchasesAPI'
import { getAllPurchases, getPurchaseById } from '../PharmacyManagement/PurchasesAPI'

const Purchases = () => {
  const [purchaseData, setPurchaseData] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState([])

  // ---------------- GET ALL PURCHASES ----------------
  const loadPurchases = async () => {
    setLoading(true)
    const data = await getAllPurchases()
    setPurchaseData(data)
    setLoading(false)
  }

  useEffect(() => {
    loadPurchases()
  }, [])

  const [payload, setPayload] = useState({
    purchaseDetails: {
      supplierType: '',
      date: '',
      time: '',
      purchaseBillNo: '',
      invoiceNo: '',
      supplier: '',
      invoiceDate: '',
      receivingDate: '',
      department: '',
      financialYear: '',
      taxType: 'Exclusive Tax',
      isDuePaidBill: false,
    },
    medicineDetails: [
      {
        sno: 1,
        productName: '',
        batchNo: '',
        expDate: '',
        quantity: 0,
        packSize: 0,
        free: 0,
        gstPercent: 0,
        costPrice: 0,
        mrp: 0,
        discPercent: 0,
      },
    ],
    financialSummary: {
      totalAmt: 0,
      discAmt: 0,
      netAmt: 0,
      sgstAmt: 0,
      cgstAmt: 0,
      igstAmt: 0,
      cstAmt: 0,
      totalTax: 0,
      finalTotal: 0,
      previousAdj: 0,
      netPayable: 0,
      paidAmt: 0,
      balAmt: 0,
      duePaid: 0,
      postDisc: 0,
      payMode: '',
      billDueDate: '',
      creditDays: 0,
    },
    searchDetails: {
      searchFromDate: '',
      searchToDate: '',
    },
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
          quantity: 0,
          packSize: 0,
          free: 0,
          gstPercent: 0,
          costPrice: 0,
          mrp: 0,
          discPercent: 0,
          isSaved: false,
        },
      ],
    }))
  }
  const updateProductField = (index, field, value) => {
    setPayload((prev) => {
      const updated = [...prev.medicineDetails]
      updated[index][field] = value

      return { ...prev, medicineDetails: updated }
    })
  }
  const handleSavePurchase = async () => {
    try {
      const res = await axios.post('/purchase/save', payload)
      console.log('Saved:', res.data)
    } catch (err) {
      console.error('Error saving:', err)
    }
  }
  const handleFinalSave = () => {
    // Remove empty rows
    const filteredRows = payload.medicineDetails.filter(
      (row) =>
        row.productName.trim() !== '' || row.batchNo.trim() !== '' || row.expDate.trim() !== '',
    )

    const finalPayload = {
      ...payload,
      medicineDetails: filteredRows,
    }

    console.log('FINAL PAYLOAD READY TO POST:', finalPayload)

    axios
      .post('/api/purchase/save', finalPayload)
      .then(() => alert('Purchase Saved Successfully'))
      .catch(() => alert('Save Failed'))
  }

  // const isRowComplete = (row) => {
  //   return (
  //     row.productName.trim() !== "" &&
  //     row.batchNo.trim() !== "" &&
  //     row.expDate !== "" &&
  //     Number(row.quantity) > 0 &&
  //     Number(row.costPrice) > 0
  //   );
  // };
  // const handleBlur = (index) => {
  //   setPayload(prev => {
  //     const updated = [...prev.medicineDetails];

  //     const row = updated[index];

  //     // If row is already saved → do nothing
  //     if (row.isSaved) return prev;

  //     // Check if row is complete → save it and add new blank row
  //     if (isRowComplete(row)) {
  //       row.isSaved = true;

  //       updated.push({
  //         sno: updated.length + 1,
  //         productName: "",
  //         batchNo: "",
  //         expDate: "",
  //         quantity: 0,
  //         packSize: 0,
  //         free: 0,
  //         gstPercent: 0,
  //         costPrice: 0,
  //         mrp: 0,
  //         discPercent: 0,
  //         isSaved: false,
  //       });

  //       return { ...prev, medicineDetails: updated };
  //     }

  //     return prev;
  //   });
  // };

  return (
    <div style={{ border: '1px solid #9b9fa4ff', borderRadius: 6, padding: '10px' }}>
      <div className="d-flex flex-wrap justify-content-between align-items-center ">
        <CFormCheck id="nonLocal" label="Non-Local Supplier (IGST)" />

        <div className="d-flex align-items-center gap-2">
          <div>
            <label className="small mb-1">Date</label>
            <CFormInput
              type="date"
              size="sm"
              defaultValue={new Date().toISOString().slice(0, 10)}
            />
          </div>
          <div>
            <label className="small mb-1">Time</label>
            <CFormInput
              type="time"
              size="sm"
              defaultValue={new Date().toTimeString().slice(0, 5)}
            />
          </div>
        </div>
      </div>

      {/* ----------------------- TOP BILLING DETAILS ----------------------- */}
      <div
        style={{
          marginBottom: '15px',
          padding: '10px',
          border: '1px solid #7DC2FF',
          background: '#F0F8FF',
        }}
      >
        <CRow>
          <CCol sm={3} className="d-flex align-items-start">
            <CFormLabel
              htmlFor="purchaseBillNo"
              className="me-2 mt-2"
              style={{ whiteSpace: 'nowrap' }}
            >
              Purchase BillNo
            </CFormLabel>
            <CFormInput
              id="purchaseBillNo"
              style={{ backgroundColor: '#fff', borderColor: '#ccc' }}
            />
          </CCol>

          <CCol sm={3} className="d-flex align-items-start">
            <CFormLabel htmlFor="invoiceDateInput" style={{ whiteSpace: 'nowrap' }}>
              Invoice Date
            </CFormLabel>
            <CFormInput
              id="invoiceDateInput"
              type="date"
              value="2025-11-13"
              style={{ backgroundColor: '#fff', borderColor: '#ccc', width: '130px' }}
            />
          </CCol>

          <CCol sm={2} className="d-flex align-items-start">
            <CFormLabel className="me-2 mt-2" style={{ whiteSpace: 'nowrap' }}>
              Department:
            </CFormLabel>
          </CCol>

          <CCol sm={2}>
            <CFormCheck type="radio" name="taxOptions" id="inclusiveTax" label="Inclusive Tax" />
            <CFormCheck
              type="radio"
              name="taxOptions"
              id="exclusiveTax"
              label="Exclusive Tax"
              defaultChecked
            />
            <CFormCheck type="radio" name="taxOptions" id="automatic" label="Automatic" />
          </CCol>

          <CCol sm={2}>
            <CFormLabel htmlFor="duePaidBillNosTextarea">Due Paid BillNos</CFormLabel>
            <CFormTextarea
              id="duePaidBillNosTextarea"
              rows={2}
              placeholder="Enter multiple bill numbers..."
              style={{ backgroundColor: '#fff', borderColor: '#ccc' }}
            />
          </CCol>
        </CRow>

        <CRow>
          <CCol sm={3} className="d-flex align-items-start">
            <CFormLabel htmlFor="invoiceNo" className="me-2 mt-2" style={{ whiteSpace: 'nowrap' }}>
              Invoice No
            </CFormLabel>
            <CFormInput id="invoiceNo" style={{ backgroundColor: '#fff', borderColor: '#ccc' }} />
          </CCol>

          <CCol sm={3} className="d-flex align-items-start">
            <CFormLabel htmlFor="receivingDateInput" style={{ whiteSpace: 'nowrap' }}>
              Receiving Date
            </CFormLabel>
            <CFormInput
              id="receivingDateInput"
              type="date"
              value="2025-11-13"
              style={{ backgroundColor: '#fff', borderColor: '#ccc', width: '130px' }}
            />
          </CCol>

          <CCol sm={2}>
            <CFormLabel>Financial Year:</CFormLabel>
          </CCol>
        </CRow>

        <CRow className="g-2 mt-1">
          <CCol md={6} className="d-flex align-items-center">
            <CFormLabel
              htmlFor="supplierSelect"
              className="me-2 mb-0"
              style={{ whiteSpace: 'nowrap', width: '80px' }}
            >
              Supplier
            </CFormLabel>
            <CFormSelect
              id="supplierSelect"
              style={{ backgroundColor: '#fff', borderColor: '#ccc' }}
            >
              <option>-- Select Supplier --</option>
              <option value="supplierA">Non-Local Supplier (IGST)</option>
              <option value="supplierB">Local Supplier (CGST/SGST)</option>
              <option value="supplierC">Pharma Distributors Ltd.</option>
            </CFormSelect>
          </CCol>

          <CCol sm={5}>
            <div className="d-flex gap-2 mt-4">
              <CButton size="sm" color="secondary">
                New Supplier
              </CButton>
              <CButton size="sm" color="secondary" onClick={handleAddProduct}>
                New Products
              </CButton>
              <CButton size="sm" color="secondary">
                Update Product List
              </CButton>
            </div>
          </CCol>
        </CRow>
      </div>

      {/* ----------------------- PURCHASE TABLE ----------------------- */}
      <div style={{ position: 'relative', marginTop: '20px' }}>
        <div
          style={{
            position: 'absolute',
            top: '-12px',
            left: '20px', // ⭐ MOVE TITLE TO RIGHT
            background: 'white',
            padding: '0 10px',
            fontWeight: 'bold',
            color: '#007BFF',
            fontSize: '1.1rem',
          }}
        >
          Purchase Details
        </div>
        <fieldset
          style={{
            border: '2px solid #7DC2FF',
            borderRadius: '6px',
            padding: '15px',
          }}
        >
          {/* ----- Your TABLE ----- */}
          <CTable bordered hover>
            <CTableHead style={{ background: '#7DC2FF' }}>
              <CTableRow>
                <CTableHeaderCell style={{ width: '40px' }}>Sno</CTableHeaderCell>
                <CTableHeaderCell>Product Name</CTableHeaderCell>
                <CTableHeaderCell style={{ width: '100px' }}>BatchNo</CTableHeaderCell>
                <CTableHeaderCell style={{ width: '50px' }}>Exp.Date</CTableHeaderCell>
                <CTableHeaderCell style={{ width: '70px' }}>Quantity</CTableHeaderCell>
                <CTableHeaderCell style={{ width: '70px' }}>PackSize</CTableHeaderCell>
                <CTableHeaderCell style={{ width: '60px' }}>Free</CTableHeaderCell>
                <CTableHeaderCell style={{ width: '70px' }}>GST%</CTableHeaderCell>
                <CTableHeaderCell style={{ width: '100px' }}>Cost Price</CTableHeaderCell>
                <CTableHeaderCell style={{ width: '80px' }}>MRP</CTableHeaderCell>
                <CTableHeaderCell style={{ width: '60px' }}>Disc%</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {loading && (
                <CTableRow>
                  <CTableDataCell colSpan={11} className="text-center">
                    Loading purchases...
                  </CTableDataCell>
                </CTableRow>
              )}

              {!loading &&
                payload.medicineDetails.map((item, index) => (
                  <CTableRow key={index}>
                    <CTableDataCell>{item.sno}</CTableDataCell>

                    <CTableDataCell>
                      <input
                        className="form-control"
                        value={item.productName}
                        onChange={(e) => updateProductField(index, 'productName', e.target.value)}
                      />
                    </CTableDataCell>

                    {/* Batch No */}
                    <CTableDataCell>
                      <input
                        className="form-control"
                        value={item.batchNo}
                        onChange={(e) => updateProductField(index, 'batchNo', e.target.value)}
                      />
                    </CTableDataCell>

                    <CTableDataCell>
                      <input
                        type="date"
                        className="form-control"
                        value={item.expDate}
                        onChange={(e) => updateProductField(index, 'expDate', e.target.value)}
                      />
                    </CTableDataCell>

                    <CTableDataCell>
                      <input
                        type="number"
                        className="form-control"
                        value={item.quantity}
                        onChange={(e) => updateProductField(index, 'quantity', e.target.value)}
                      />
                    </CTableDataCell>

                    <CTableDataCell>
                      
                        <input
                          type="number"
                          className="form-control"
                          value={item.packSize}
                          onChange={(e) => updateProductField(index, 'packSize', e.target.value)}
                        />
                    
                    </CTableDataCell>

                    <CTableDataCell>
                   
                        <input
                          type="number"
                          className="form-control"
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
                          className="form-control"
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
                          className="form-control"
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
                          className="form-control"
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
                          className="form-control"
                          value={item.discPercent}
                          onChange={(e) => updateProductField(index, 'discPercent', e.target.value)}
                        />
                      )}
                    </CTableDataCell>
                  </CTableRow>
                ))}
            </CTableBody>
          </CTable>

          {/* ----- TOTALS SECTION ----- */}
          <CCardBody style={{ padding: '10px 0 0 0' }}>
            <CRow className="g-2 border-bottom pb-2">
              {/* Column Group 1 */}
              <CCol md={3}>
                {['Total Amt', 'Disc %', 'Net Amt', 'Credit Days'].map((label) => (
                  <CRow className="mb-2" key={label}>
                    <CCol xs={6}>
                      <CFormLabel className="text-end fw-bold mb-0">{label}</CFormLabel>
                    </CCol>
                    <CCol xs={6}>
                      <CFormInput disabled value="0" className="text-end bg-light" />
                    </CCol>
                  </CRow>
                ))}
                <CRow>
                  <CCol xs={6}>
                    <CFormLabel className="fw-bold mb-0">PayMode</CFormLabel>
                  </CCol>
                  <CCol xs={6}>
                    <CFormSelect disabled value="CASH" className="bg-light">
                      <option>CASH</option>
                    </CFormSelect>
                  </CCol>
                </CRow>
              </CCol>

              {/* Column Group 2 */}
              <CCol md={3}>
                {['SGST', 'CGST', 'IGST', 'CST'].map((tax) => (
                  <CRow className="mb-2" key={tax}>
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
              <CCol md={3}>
                {['Total Tax', 'Final Total', 'Previous Adj', 'Net Payable'].map((item) => (
                  <CRow className="mb-2" key={item}>
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
              <CCol md={3}>
                {['Bal. Amt', 'Due Paid', 'PostDisc'].map((item) => (
                  <CRow className="mb-2" key={item}>
                    <CCol xs={6}>
                      <CFormLabel className="text-end fw-bold mb-0">{item}</CFormLabel>
                    </CCol>
                    <CCol xs={6}>
                      <CFormInput disabled value="0" className="text-end bg-light" />
                    </CCol>
                  </CRow>
                ))}
                <CRow>
                  <CCol xs={6}>
                    <CFormLabel className="fw-bold mb-0">Bill Due Date</CFormLabel>
                  </CCol>
                  <CCol xs={6}>
                    <CFormInput type="date" disabled value="2025-11-13" className="bg-light" />
                  </CCol>
                </CRow>
              </CCol>

              <CFormCheck
                type="checkbox"
                id="displayPurchaseDetails"
                label="Display Previous Purchase Details"
                className="me-4 text-dark"
              />
            </CRow>
          </CCardBody>
        </fieldset>
      </div>

      {/* ----------------------- SEARCH / NAVIGATION BAR ----------------------- */}

      <div
        className="d-flex align-items-center"
        style={{
          background: '#E8F3FF',
          padding: '6px 10px',
          borderRadius: '6px',
          border: '1px solid #B5D9FF',
        }}
      >
        {/* 🔍 Search Label */}
        <CFormLabel className="fw-bold me-2 mb-0">Search</CFormLabel>

        {/* 🔍 Search Input */}
        <CFormInput
          type="text"
          placeholder="Search here..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '160px', height: '25px', padding: '0 5px' }}
          className="me-3"
        />

        <CFormLabel className="fw-bold  me-2 mb-0">From</CFormLabel>
        <CFormInput
          type="date"
          value="2025-11-12"
          style={{ width: '120px', height: '25px', padding: '0 5px' }}
          className="me-3"
        />

        <CFormLabel className="fw-bold  me-2 mb-0">To</CFormLabel>
        <CFormInput
          type="date"
          value="2025-11-13"
          style={{ width: '120px', height: '25px', padding: '0 5px' }}
          className="me-3"
        />

        <CButton
          size="sm"
          color="light"
          className="me-2"
          style={{ height: '25px', padding: '0 5px' }}
        >
          Move first
        </CButton>

        <CButton
          size="sm"
          color="light"
          className="me-2"
          style={{ height: '25px', padding: '0 5px' }}
        >
          Move previous
        </CButton>

        <CButton
          size="sm"
          color="light"
          className="me-2"
          style={{ height: '25px', padding: '0 5px' }}
        >
          Move next
        </CButton>

        <CButton
          size="sm"
          color="light"
          className="me-2"
          style={{ height: '25px', padding: '0 5px' }}
        >
          Move last
        </CButton>

        <CIcon
          icon={cilSave}
          size="lg"
          className="mx-1"
          style={{ cursor: 'pointer' }}
          onClick={handleFinalSave}
        />
        <CIcon icon={cilPrint} size="lg" className="mx-1" style={{ cursor: 'pointer' }} />
        <CIcon icon={cilMagnifyingGlass} size="lg" className="mx-1" style={{ cursor: 'pointer' }} />

        <div className="ms-auto d-flex gap-2">
          <CButton color="secondary" size="sm">
            Close
          </CButton>
          <CButton color="success" size="sm">
            Print
          </CButton>
        </div>
      </div>
    </div>
  )
}

export default Purchases
