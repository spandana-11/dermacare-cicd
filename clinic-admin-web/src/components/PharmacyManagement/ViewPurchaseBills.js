import React, { useEffect, useState, useCallback } from 'react'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CRow,
  CCol,
} from '@coreui/react'
import { Eye, Edit2 } from 'lucide-react'

import { PurchaseData } from '../PharmacyManagement/PurchasesAPI'

const ViewPurchaseBills = () => {
  const [purchaseData, setPurchaseData] = useState([])
  const [loading, setLoading] = useState(false)

  const [viewModal, setViewModal] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState(null)

  const fetchPurchaseBills = useCallback(async () => {
    setLoading(true)
    try {
      const res = await PurchaseData()
      setPurchaseData(Array.isArray(res?.data) ? res.data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPurchaseBills()
  }, [fetchPurchaseBills])

  return (
    <div className="p-3">
      {loading ? (
        <p>Loading purchases...</p>
      ) : (
        <CTable bordered hover responsive style={{ fontSize: '0.78rem' }}>
          <CTableHead className='pink-table w-auto'>
            <CTableRow>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Bill No</CTableHeaderCell>
              <CTableHeaderCell>Supplier</CTableHeaderCell>
              <CTableHeaderCell>Invoice No</CTableHeaderCell>
              <CTableHeaderCell>Date</CTableHeaderCell>
              <CTableHeaderCell>Final Total</CTableHeaderCell>
              <CTableHeaderCell>Action</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody className='pink-table'>
            {purchaseData.map((p, i) => (
              <CTableRow key={p.id}>
                <CTableDataCell>{i + 1}</CTableDataCell>
                <CTableDataCell>{p.purchaseBillNo}</CTableDataCell>
                <CTableDataCell>{p.supplierName}</CTableDataCell>
                <CTableDataCell>{p.invoiceNo}</CTableDataCell>
                <CTableDataCell>{p.invoiceDate}</CTableDataCell>
                <CTableDataCell>{p.finalTotal}</CTableDataCell>
                <CTableDataCell>
                  <CButton
  color="info"
  size="sm"
  className="actionBtn"
  onClick={() => {
    setSelectedPurchase(p)
    setViewModal(true)
  }}
>
  <Eye size={18} />
</CButton>

                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      )}

      {/* ================= VIEW MODAL ================= */}
      <CModal
        visible={viewModal}
        size="lg"
        alignment="center"
        onClose={() => {
          setViewModal(false)
          setSelectedPurchase(null)
        }}
      >
        <CModalHeader>
          <CModalTitle>Purchase Bill</CModalTitle>
        </CModalHeader>

       <CModalBody style={{ color: 'var(--color-black)' }}>
  {!selectedPurchase ? (
    <p className="text-center">Loading...</p>
  ) : (
    <>
      {/* ===== BASIC INFO ===== */}
      <div className="mb-3 p-3 border rounded">
        <h6 className="fw-bold mb-3 border-bottom pb-1">
          Basic Information
        </h6>

        <CRow className="gy-2">
          <CCol md={4}><b>Bill No:</b> {selectedPurchase.purchaseBillNo || '-'}</CCol>
          <CCol md={4}><b>Date:</b> {selectedPurchase.date || '-'}</CCol>
          <CCol md={4}><b>Time:</b> {selectedPurchase.time || '-'}</CCol>
          <CCol md={4}><b>Supplier:</b> {selectedPurchase.supplierName || '-'}</CCol>
          <CCol md={4}><b>Department:</b> {selectedPurchase.department || '-'}</CCol>
          <CCol md={4}><b>Financial Year:</b> {selectedPurchase.financialYear || '-'}</CCol>
        </CRow>
      </div>

      {/* ===== INVOICE ===== */}
      <div className="mb-3 p-3 border rounded">
        <h6 className="fw-bold mb-3 border-bottom pb-1">
          Invoice Details
        </h6>

        <CRow className="gy-2">
          <CCol md={4}><b>Invoice No:</b> {selectedPurchase.invoiceNo || '-'}</CCol>
          <CCol md={4}><b>Invoice Date:</b> {selectedPurchase.invoiceDate || '-'}</CCol>
          <CCol md={4}><b>Receiving Date:</b> {selectedPurchase.receivingDate || '-'}</CCol>
          <CCol md={4}><b>Tax Type:</b> {selectedPurchase.taxType || '-'}</CCol>
        </CRow>
      </div>

      {/* ===== MEDICINES ===== */}
      <div className="mb-3 p-3 border rounded">
        <h6 className="fw-bold mb-3 border-bottom pb-1">
          Medicine Details
        </h6>

        <CTable bordered small responsive>
          <CTableHead>
            <CTableRow className='pink-table w-auto'>
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Product</CTableHeaderCell>
              <CTableHeaderCell>Batch</CTableHeaderCell>
              <CTableHeaderCell>Expiry</CTableHeaderCell>
              <CTableHeaderCell>Qty</CTableHeaderCell>
              <CTableHeaderCell>Free</CTableHeaderCell>
              <CTableHeaderCell>Cost</CTableHeaderCell>
              <CTableHeaderCell>MRP</CTableHeaderCell>
              <CTableHeaderCell>GST%</CTableHeaderCell>
              <CTableHeaderCell>Base</CTableHeaderCell>
              <CTableHeaderCell>Line Total</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody className='pink-table'>
            {selectedPurchase.medicineDetails.map((m, i) => (
              <CTableRow key={i}>
                <CTableDataCell>{i + 1}</CTableDataCell>
                <CTableDataCell>{m.productName || '-'}</CTableDataCell>
                <CTableDataCell>{m.batchNo || '-'}</CTableDataCell>
                <CTableDataCell>{m.expiryDate || '-'}</CTableDataCell>
                <CTableDataCell>{m.quantity || 0}</CTableDataCell>
                <CTableDataCell>{m.freeQty || 0}</CTableDataCell>
                <CTableDataCell>{m.costPrice || 0}</CTableDataCell>
                <CTableDataCell>{m.mrp || 0}</CTableDataCell>
                <CTableDataCell>{m.gstPercent || 0}</CTableDataCell>
                <CTableDataCell>{m.baseAmount || 0}</CTableDataCell>
                <CTableDataCell>{m.lineTotal || 0}</CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </div>

      {/* ===== TOTALS ===== */}
      <div className="mb-3 p-3 border rounded">
        <h6 className="fw-bold mb-3 border-bottom pb-1">
          Totals & Taxes
        </h6>

        <CRow className="gy-2">
          <CCol md={4}><b>Total Amount:</b> {selectedPurchase.totalAmount || 0}</CCol>
          <CCol md={4}><b>Discount %:</b> {selectedPurchase.discountPercentage || 0}</CCol>
          <CCol md={4}><b>Discount Amt:</b> {selectedPurchase.discountAmountTotal || 0}</CCol>
          <CCol md={4}><b>CGST:</b> {selectedPurchase.totalCGST || 0}</CCol>
          <CCol md={4}><b>SGST:</b> {selectedPurchase.totalSGST || 0}</CCol>
          <CCol md={4}><b>Total Tax:</b> {selectedPurchase.totalTax || 0}</CCol>
        </CRow>
      </div>

      {/* ===== PAYMENT ===== */}
      <div className="p-3 border rounded">
        <h6 className="fw-bold mb-3 border-bottom pb-1">
          Payment Details
        </h6>

        <CRow className="gy-2">
          <CCol md={4}><b>Final Total:</b> {selectedPurchase.finalTotal || 0}</CCol>
          <CCol md={4}><b>Paid:</b> {selectedPurchase.paidAmount || 0}</CCol>
          <CCol md={4}><b>Balance:</b> {selectedPurchase.balanceAmount || 0}</CCol>
          <CCol md={4}><b>Payment Mode:</b> {selectedPurchase.paymentMode || '-'}</CCol>
          <CCol md={4}><b>Bill Due Date:</b> {selectedPurchase.billDueDate || '-'}</CCol>
          <CCol md={4}><b>Credit Days:</b> {selectedPurchase.creditDays || '-'}</CCol>
          <CCol md={6}><b>Due Paid Bill No:</b> {selectedPurchase.duePaidBillNo || '-'}</CCol>
        </CRow>
      </div>
    </>
  )}
</CModalBody>


        <CModalFooter>
          <CButton color="secondary" onClick={() => setViewModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default ViewPurchaseBills
