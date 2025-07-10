import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  CButton,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CContainer,
  CRow,
  CCol,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Get_AllPayoutsData, postPayoutsData } from './PayoutsAPI'

// 🔧 Replace this with your real backend later
// const DUMMY_API = 'https://jsonplaceholder.typicode.com/posts'

const PayoutManagement = () => {
  const [payouts, setPayouts] = useState([])
  const [search, setSearch] = useState('')
  const [viewData, setViewData] = useState(null)
  // const [addModal, setAddModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    transactionId: '',
    amount: '',
    paymentMethod: '',
    paymentStatus: '',
    userEmail: '',
    userMobile: '',
    billingName: '',
    billingAddress: '',
  })

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const result = await Get_AllPayoutsData()
        setPayouts(result?.data ?? [])
      } catch (error) {
        console.error('Failed to fetch payouts:', error)
      }
    }

    fetchPayouts()
  }, [])

  const handleAdd = async () => {
    if (!formData.amount || !formData.paymentMethod || !formData.userEmail) {
      toast.error('Fill all required fields')
      return
    }

    try {
      const res = await postPayoutsData(formData)
      setPayouts([res.data, ...payouts])
      toast.success('Added successfully')
      // setAddModal(false)
      setFormData({
        transactionId: '',
        amount: '',
        paymentMethod: '',
        paymentStatus: '',
        userEmail: '',
        userMobile: '',
        billingName: '',
        billingAddress: '',
      })
    } catch (err) {
      toast.error(error?.response?.data?.message || 'Add failed')
    }
  }

  const filteredData = (payouts || []).filter(
    (item) =>
      item.billingName?.toLowerCase().includes(search.toLowerCase()) ||
      item.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
      item.userMobile?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <CContainer className="p-4">
      <ToastContainer />
    

      <h3 className="mb-4">Transaction List</h3>

      <CRow className="mb-3 align-items-center">
        <CCol md={6}>
          <CInputGroup>
            <CFormInput
              placeholder="Search by billing name, email, or mobile"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <CInputGroupText>
              <CIcon icon={cilSearch} />
            </CInputGroupText>
          </CInputGroup>
        </CCol>
        <CCol md={6} className="text-end">
          <strong>No. of Payouts: {filteredData.length}</strong>
        </CCol>
      </CRow>

      <CTable striped responsive>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>S.No</CTableHeaderCell>
            {/* <CTableHeaderCell>transactionId</CTableHeaderCell> */}
            <CTableHeaderCell>bookingId</CTableHeaderCell>
            <CTableHeaderCell>Billing Name</CTableHeaderCell>
            <CTableHeaderCell>Amount</CTableHeaderCell>
            <CTableHeaderCell>paymentMethod</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {filteredData.map((p, index) => (
            <CTableRow key={`${p.bookingId}-${index}`}>
              <CTableDataCell>{index + 1}</CTableDataCell>
              {/* <CTableDataCell>{p.transactionId}</CTableDataCell> */}
              <CTableDataCell>{p.bookingId}</CTableDataCell>
              <CTableDataCell>{p.billingName}</CTableDataCell>
              <CTableDataCell>{p.amount}</CTableDataCell>
              <CTableDataCell>{p.paymentMethod}</CTableDataCell>
              <CTableDataCell>
                <CButton
                  size="sm"
                  color="info"
                  className="text-white"
                  onClick={() => setViewData(p)}
                >
                  View
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      {/* Add Modal */}
      {/* <CModal visible={addModal} onClose={() => setAddModal(false)}>
        <CModalHeader>
          <CModalTitle>Add New Payout</CModalTitle>
        </CModalHeader>
        <CModalBody>
           <h6>User Id</h6>
          <CFormInput
            className="mb-2"
            placeholder="User ID"
            value={formData.userId}
            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
          />
           <h6>Doctor Id</h6>
          <CFormInput
            className="mb-2"
            placeholder="Doctor ID"
            value={formData.doctorId}
            onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
          />
          <h6>Booking Id</h6>
          <CFormInput
            className="mb-2"
            placeholder="Booking ID"
            value={formData.bookingId}
            onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
          />
          <h6>Currency</h6>
          <CFormInput
            className="mb-2"
            placeholder="Currency (e.g. INR)"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
          />
           <h6>Payment Status</h6>
          <CFormInput
            className="mb-2"
            placeholder="Payment Status"
            value={formData.paymentStatus}
            onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
          />
<h6>Amount</h6>
          <CFormInput
            className="mb-2"
            placeholder="Amount"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />
          <CFormInput
            className="mb-2"
            placeholder="Payment Method"
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
          />
          <CFormInput
            className="mb-2"
            placeholder="User Email"
            value={formData.userEmail}
            onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
          />
          <CFormInput
            className="mb-2"
            placeholder="User Mobile"
            value={formData.userMobile}
            onChange={(e) => setFormData({ ...formData, userMobile: e.target.value })}
          />
          <CFormInput
            className="mb-2"
            placeholder="Billing Name"
            value={formData.billingName}
            onChange={(e) => setFormData({ ...formData, billingName: e.target.value })}
          />
          <CFormInput
            placeholder="Billing Address"
            value={formData.billingAddress}
            onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setAddModal(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleAdd}>
            Submit
          </CButton>
        </CModalFooter>
      </CModal> */}

      {/* View Modal */}
      <CModal visible={!!viewData} onClose={() => setViewData(null)}>
        <CModalHeader>
          <CModalTitle>Transaction Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>
            <strong>Transaction ID:</strong> {viewData?.transactionId}
          </p>
          <p>
            <strong>User Email:</strong> {viewData?.userEmail}
          </p>
          <p>
            <strong>Mobile:</strong> {viewData?.userMobile}
          </p>
          <p>
            <strong>Amount:</strong> {viewData?.amount}
          </p>
          <p>
            <strong>Payment Method:</strong> {viewData?.paymentMethod}
          </p>
          <p>
            <strong>Billing Name:</strong> {viewData?.billingName}
          </p>
          <p>
            <strong>Billing Address:</strong> {viewData?.billingAddress}
          </p>
        </CModalBody>
      </CModal>
    </CContainer>
  )
}

export default PayoutManagement
