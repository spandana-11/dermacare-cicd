import React, { useEffect, useState } from 'react'
import axios from 'axios'
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
  CModalFooter,
  CForm, CFormSelect, CPagination, CPaginationItem
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useNavigate } from 'react-router-dom'
import LoadingIndicator from '../../Utils/loader'
import { BASE_URL_API } from '../../baseUrl'
import { Eye } from 'lucide-react'
import { COLORS } from '../../Constant/Themes'

const PayoutManagement = () => {
  const navigate = useNavigate()

  // ===== Login state =====
  const [showLogin, setShowLogin] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)

  // ===== Payout state =====
  const [payouts, setPayouts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [viewData, setViewData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // ===== Dummy API fetch for payouts =====
  const Get_AllPayoutsData = async () => {
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
              billingAddress:
                'Flat 204, Prestige Towers, Koramangala, Bangalore, India - 560034',
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
            },
          ],
        })
      }, 1000)
    })
  }

  // ===== Fetch payouts after login =====
  useEffect(() => {
    if (isAuthenticated) {
      const fetchPayouts = async () => {
        try {
          setLoading(true)
          const result = await Get_AllPayoutsData()
          setPayouts(result.data ?? [])
        } catch (err) {
          console.error('Failed to fetch payouts:', err)
        } finally {
          setLoading(false)
        }
      }
      fetchPayouts()
    }
  }, [isAuthenticated])

  // ===== Login handler =====
  const handleLogin = async (e) => {
    e.preventDefault()
    if (!userName || !password) {
      setLoginError('Mobile number and password are required.')
      return
    }
    setIsLoading(true)
    setLoginError('')
    try {
      const response = await axios.post(
        `${BASE_URL_API}/login`,
        { mobileNumber: userName, password: password },
        { headers: { 'Content-Type': 'application/json' } }
      )

      if (response.data.success) {
        const userData = response.data.data
        localStorage.setItem('authentication', 'true')
        localStorage.setItem('userName', userData.userName)
        localStorage.setItem('mobileNumber', userData.mobileNumber)
        localStorage.setItem('userId', userData.id)
        setIsAuthenticated(true)
        setShowLogin(false)
        setFailedAttempts(0)
      } else {
        const attempts = failedAttempts + 1
        setFailedAttempts(attempts)
        setLoginError(response.data.message || 'Invalid login credentials.')

        if (attempts >= 3) {
          await axios.post(`${BASE_URL_API}/send-alert-email`, {
            userName,
            message: 'Failed login attempts exceeded 3',
          })
          toast.error('Too many failed login attempts! Admin notified via email.')
        }
      }
    } catch (err) {
      setLoginError(err.response?.data?.message || 'An unexpected error occurred.')
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // ===== Filtered & paginated data =====
  const filteredData = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return payouts
    return payouts.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(q))
    )
  }, [searchQuery, payouts])

  const displayData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  )

  return (
    <CContainer className="p-4">
      <ToastContainer />

      {/* Login Modal */}
      <CModal
        visible={showLogin}
        alignment="center"
        backdrop="static"
        onClose={() => {
          if (!isAuthenticated) navigate(-1) // Navigate back only if not logged in
          setShowLogin(false)
        }}
      >
        <CModalHeader>
          <CModalTitle>Payout Login</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleLogin}>
            <CFormInput
              type="text"
              placeholder="Mobile Number"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="mb-3"
            />
            <CFormInput
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {loginError && <p className="text-danger mt-2">{loginError}</p>}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() => {
              if (!isAuthenticated) navigate(-1)
              setShowLogin(false)
            }}
          >
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleLogin} disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Submit'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Payout Table */}
      {isAuthenticated && (
        <>
          <CRow className="mb-3 align-items-center">
            <CCol md={4}>
              <CInputGroup>
                <CFormInput
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <CInputGroupText>
                  <CIcon icon={cilSearch} />
                </CInputGroupText>
              </CInputGroup>
            </CCol>
            <CCol md={8} className="text-end">
              <CButton
                color="secondary"
                style={{ backgroundColor: 'var(--color-black)', color: COLORS.white }}
              >
                No. of Payouts: {filteredData.length}
              </CButton>
            </CCol>
          </CRow>

          {loading ? (
            <div className="d-flex justify-content-center align-items-center">
              <LoadingIndicator message="Loading payouts..." />
            </div>
          ) : (
            <CTable striped hover responsive>
              <CTableHead className="pink-table">
                <CTableRow className="text-center">
                  <CTableHeaderCell >S.No</CTableHeaderCell>
                  <CTableHeaderCell>Booking ID</CTableHeaderCell>
                  <CTableHeaderCell >Billing Name</CTableHeaderCell>
                  <CTableHeaderCell>Amount</CTableHeaderCell>
                  <CTableHeaderCell >Payment Method</CTableHeaderCell>
                  <CTableHeaderCell >Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody className="pink-table">
                {displayData.length > 0 ? (
                  displayData.map((p, index) => (
                    <CTableRow key={`${p.bookingId}-${index}`} className="text-center align-middle">
                      <CTableDataCell>
                        {(currentPage - 1) * rowsPerPage + index + 1}
                      </CTableDataCell>
                      <CTableDataCell>{p.bookingId}</CTableDataCell>
                      <CTableDataCell>{p.billingName}</CTableDataCell>
                      <CTableDataCell>{p.amount}</CTableDataCell>
                      <CTableDataCell>{p.paymentMethod}</CTableDataCell>
                      <CTableDataCell>
                        <div className="d-flex justify-content-center align-items-center gap-2">
                          <button
                            className="actionBtn view"
                            title="View"
                            onClick={() => setViewData(p)}
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell colSpan={6} className="text-center text-muted">
                      No payouts found.
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          )}

          {filteredData.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mt-3">

              {/* Rows per page */}
              <div>
                <label className="me-2">Rows per page:</label>
                <CFormSelect
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  style={{ width: '80px', display: 'inline-block' }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </CFormSelect>
              </div>

              {/* Display info + pagination */}
              <div>
                <div>
                  Showing {(currentPage - 1) * rowsPerPage + 1} to{' '}
                  {Math.min(currentPage * rowsPerPage, filteredData.length)} of{' '}
                  {filteredData.length} entries
                </div>

                <CPagination align="end" className="mt-2 themed-pagination">
                  <CPaginationItem
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </CPaginationItem>

                  {Array.from(
                    { length: Math.ceil(filteredData.length / rowsPerPage) },
                    (_, i) => i + 1
                  )
                    .filter((page) => {
                      const totalPages = Math.ceil(filteredData.length / rowsPerPage)

                      if (totalPages <= 5) return true
                      if (currentPage <= 3) return page <= 5
                      if (currentPage >= totalPages - 2) return page >= totalPages - 4
                      return page >= currentPage - 2 && page <= currentPage + 2
                    })
                    .map((page) => (
                      <CPaginationItem
                        key={page}
                        active={page === currentPage}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </CPaginationItem>
                    ))}

                  <CPaginationItem
                    disabled={currentPage === Math.ceil(filteredData.length / rowsPerPage)}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </CPaginationItem>
                </CPagination>
              </div>
            </div>
          )}


          {/* View Modal */}
          <CModal visible={!!viewData} onClose={() => setViewData(null)} alignment="center">
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
        </>
      )}
    </CContainer>
  )
}

export default PayoutManagement
