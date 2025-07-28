import React, { useEffect, useState } from 'react'
import {
  CContainer,
  CRow,
  CCol,
  CInputGroup,
  CFormInput,
  CInputGroupText,
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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// ✅ Dummy API methods
// replace these with your real API methods
const Get_AllPayoutsData = async () => {
  // simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: [
  {
    transactionId: 'TXN2025072801',
    bookingId: 'BKG9011',
    billingName: 'Ankit Sharma',
    amount: '₹2,499.00',
    paymentMethod: 'Credit Card (HDFC)',
    userEmail: 'ankit.sharma@example.com',
    userMobile: '9876543210',
    billingAddress: 'Flat 204, Prestige Towers, Koramangala, Bangalore, India - 560034',
  },
  {
    transactionId: 'TXN2025072802',
    bookingId: 'BKG9012',
    billingName: 'Priya Menon',
    amount: '₹3,200.00',
    paymentMethod: 'UPI (priya@ybl)',
    userEmail: 'priya.menon@example.com',
    userMobile: '9833012345',
    billingAddress: 'C-16, Orchid Residency, Andheri West, Mumbai, India - 400058',
  },
  {
    transactionId: 'TXN2025072803',
    bookingId: 'BKG9013',
    billingName: 'Rahul Verma',
    amount: '₹1,750.00',
    paymentMethod: 'Net Banking (SBI)',
    userEmail: 'rahul.v@example.com',
    userMobile: '9123456789',
    billingAddress: 'A-10, Gaur City, Sector 121, Noida, India - 201301',
  }
        ],
      })
    }, 2000) // 2s delay to simulate loading
  })
}

const postPayoutsData = async (data) => {
  // simulate post
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { ...data, bookingId: 'NEW-BKG' } })
    }, 500)
  })
}

const PayoutManagement = () => {
  // ✅ Sample initial data to show immediately in UI
  const samplePayouts = [
    {
      transactionId: 'TXN-1001',
      bookingId: 'BKG-001',
      billingName: 'Local User1',
      amount: '1200',
      paymentMethod: 'Cash',
      userEmail: 'local1@example.com',
      userMobile: '9876543210',
      billingAddress: 'Hyderabad, India',
    },
    {
      transactionId: 'TXN-1002',
      bookingId: 'BKG-002',
      billingName: 'Local User2',
      amount: '1800',
      paymentMethod: 'Card',
      userEmail: 'local2@example.com',
      userMobile: '9876543211',
      billingAddress: 'Mumbai, India',
    },
    {
      transactionId: 'TXN-1003',
      bookingId: 'BKG-003',
      billingName: 'Local User3',
      amount: '2000',
      paymentMethod: 'UPI',
      userEmail: 'local3@example.com',
      userMobile: '9876543212',
      billingAddress: 'Delhi, India',
    },
  ]

  const [payouts, setPayouts] = useState(samplePayouts) // ✅ start with sample data
  const [search, setSearch] = useState('')
  const [viewData, setViewData] = useState(null)
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

  // ✅ Fetch server payouts
  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        setLoading(true)
        const result = await Get_AllPayoutsData()
        // Merge or replace sample data with server data:
        // If you want to replace: use setPayouts(result.data)
        // If you want to append: use [...payouts, ...result.data]
        // setPayouts((prev) => [...prev, ...(result?.data ?? [])])
        setPayouts(result?.data ?? [])
      } catch (error) {
        console.error('Failed to fetch payouts:', error)
      } finally {
        setLoading(false)
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
      toast.error(err?.response?.data?.message || 'Add failed')
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
            <CTableHeaderCell>bookingId</CTableHeaderCell>
            <CTableHeaderCell>Billing Name</CTableHeaderCell>
            <CTableHeaderCell>Amount</CTableHeaderCell>
            <CTableHeaderCell>Payment Method</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {loading ? (
            <CTableRow>
              <CTableDataCell colSpan={6} className="text-center text-primary">
                Loading payouts...
              </CTableDataCell>
            </CTableRow>
          ) : filteredData.length > 0 ? (
            filteredData.map((p, index) => (
              <CTableRow key={`${p.bookingId}-${index}`}>
                <CTableDataCell>{index + 1}</CTableDataCell>
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
            ))
          ) : (
            <CTableRow>
              <CTableDataCell colSpan={6} className="text-center text-danger">
                No payouts found.
              </CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable>

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
