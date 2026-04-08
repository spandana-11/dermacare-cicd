import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'
import { useNavigate, useLocation } from 'react-router-dom'
import { Eye } from 'lucide-react'
import {
  CCard, CCardBody, CCardHeader, CButton, CFormInput,
  CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell,
  CTableDataCell, CPagination, CPaginationItem, CFormSelect,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
} from '@coreui/react'
import { CategoryData } from '../categoryManagement/CategoryAPI'
import { BASE_URL, ClinicAllData, statusapi } from '../../baseUrl'
import { COLORS } from '../../Constant/Themes'
import LoadingIndicator from '../../Utils/loader'

/* ═══════════════════════════════════════════════════════
   STATUS MAPPING
   Backend enum  →  UI key
═══════════════════════════════════════════════════════ */
const mapBackendStatusToUI = (status) => {
  switch (status) {
    case 'PENDING':                 return 'pending'
    case 'VERIFICATION_IN_PROGRESS': return 'start'
    case 'VERIFIED':                return 'verified'
    case 'REJECTED':                return 'rejected'
    default:                        return 'pending'
  }
}

const UI_TO_BACKEND = {
  pending:  'PENDING',
  start:    'VERIFICATION_IN_PROGRESS',
  verified: 'VERIFIED',
  rejected: 'REJECTED',
}

const STATUS_LABEL = {
  pending:  'Pending',
  start:    'Started',
  verified: 'Verified',
  rejected: 'Rejected',
}

/* ═══════════════════════════════════════════════════════
   STATUS BADGE STYLES
═══════════════════════════════════════════════════════ */
const statusStyles = {
  pending:  { backgroundColor: '#FFE4B5', color: '#8B4513', fontWeight: '600' },
  start:    { backgroundColor: '#BEE3F8', color: '#0C4A6E', fontWeight: '600' },
  verified: { backgroundColor: '#C6F6D5', color: '#22543D', fontWeight: '600' },
  rejected: { backgroundColor: '#FED7D7', color: '#822727', fontWeight: '600' },
}

const badgeStyle = (uiStatus) => ({
  ...(statusStyles[uiStatus] || {}),
  padding: '2px 10px',
  borderRadius: '12px',
  fontSize: '13px',
  display: 'inline-block',
})

/* ═══════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════ */
const ClinicManagement = ({ service }) => {
  const navigate  = useNavigate()
  const location  = useLocation()

  const [clinics,       setClinics]       = useState([])
  const [categories,    setCategories]    = useState([])
  const [loading,       setLoading]       = useState(false)
  const [statusLoading, setStatusLoading] = useState(false) // separate loader for status change
  const [error,         setError]         = useState(null)
  const [apiLog,        setApiLog]        = useState([])   // debug log visible on screen

  const [searchTerm,      setSearchTerm]      = useState('')
  const [filterCategory,  setFilterCategory]  = useState('')
  const [currentPage,     setCurrentPage]     = useState(1)
  const [itemsPerPage,    setItemsPerPage]    = useState(5)

  const [confirmModal, setConfirmModal] = useState({
    visible:    false,
    clinicId:   null,
    clinicName: '',
    fromStatus: '',
    toStatus:   '',
  })

  /* ─── helper: add a line to the debug log ─── */
  const log = (msg) => setApiLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 19)])

  /* ─── Fetch Categories ─── */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await CategoryData()
        setCategories(res.data || [])
      } catch (err) {
        console.error('Failed to fetch categories', err)
      }
    }
    fetchCategories()
  }, [])

  /* ─── Fetch Clinics ─── */
  const fetchClinics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      log(`GET ${BASE_URL}/${ClinicAllData}`)
      const response = await axios.get(`${BASE_URL}/${ClinicAllData}`)

      const clinicList = Array.isArray(response.data)
        ? response.data
        : response.data.data || []

      log(`Fetched ${clinicList.length} clinics`)

      const filtered = filterCategory
        ? clinicList.filter(
            (clinic) =>
              Array.isArray(clinic.hospitalCategory) &&
              clinic.hospitalCategory.some((cat) => cat.categoryId === filterCategory)
          )
        : clinicList

      setClinics(filtered)
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Unknown error'
      setError(`Failed to load clinics: ${msg}`)
      log(`ERROR fetching clinics: ${msg}`)
    } finally {
      setLoading(false)
    }
  }, [filterCategory])

  /* ─── Initial load + new clinic from navigation state ─── */
  useEffect(() => {
    fetchClinics()
  }, [fetchClinics])

  /* ─── If a new clinic was just added via navigation, append it without re-fetch ─── */
  useEffect(() => {
    if (location.state?.newClinic) {
      setClinics((prev) => {
        // avoid duplicate if it already exists
        const exists = prev.some(
          (c) => c.hospitalId === location.state.newClinic.hospitalId
        )
        return exists ? prev : [...prev, location.state.newClinic]
      })
      // clear the navigation state so it doesn't re-trigger
      window.history.replaceState({}, '')
    }
  }, [location.state?.newClinic])

  /* ─── Open confirmation modal on dropdown change ─── */
  const handleDropdownChange = (uiStatus, clinicId) => {
    const clinic = clinics.find((c) => c.hospitalId === clinicId)
    if (!clinic) return

    const currentUI = mapBackendStatusToUI(clinic.status)
    if (currentUI === uiStatus) return // no change

    setConfirmModal({
      visible:    true,
      clinicId,
      clinicName: clinic.name,
      fromStatus: currentUI,
      toStatus:   uiStatus,
    })
  }

  const closeModal = () =>
    setConfirmModal({ visible: false, clinicId: null, clinicName: '', fromStatus: '', toStatus: '' })

  /* ─── Confirm status change → call API → refetch ─── */
  const handleConfirmStatusChange = async () => {
    const { clinicId, toStatus, clinicName } = confirmModal
    closeModal()

    if (toStatus === 'pending') {
      alert('Cannot reset to Pending — no backend API available for this transition.')
      return
    }

    setStatusLoading(true)
    try {
      log(`Changing "${clinicName}" (id=${clinicId}) → ${UI_TO_BACKEND[toStatus]}`)

      if (toStatus === 'start') {
        const res = await statusapi.startClinic(clinicId)
        log(`startClinic response: ${res.status} ${JSON.stringify(res.data)}`)
      } else if (toStatus === 'verified') {
        const res = await statusapi.verifyClinic(clinicId)
        log(`verifyClinic response: ${res.status} ${JSON.stringify(res.data)}`)
      } else if (toStatus === 'rejected') {
        const reason = window.prompt(
          `Enter rejection reason for "${clinicName}":`,
          'Invalid documents submitted'
        ) || 'Invalid documents submitted'
        const res = await statusapi.rejectClinic(clinicId, reason)
        log(`rejectClinic response: ${res.status} ${JSON.stringify(res.data)}`)
      }

      // ✅ Always re-fetch so UI reflects true server state
      await fetchClinics()
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || err.message
      log(`ERROR changing status: ${JSON.stringify(msg)}`)
      console.error('Status update failed:', err?.response || err)
      alert(
        `Failed to update status.\n\nReason: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}\n\nCheck the debug log below for details.`
      )
      await fetchClinics()
    } finally {
      setStatusLoading(false)
    }
  }

  /* ─── Filter & Pagination ─── */
  const filteredClinics = clinics.filter(
    (clinic) =>
      clinic.name?.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      clinic.contactNumber?.startsWith(searchTerm) ||
      clinic.emailAddress?.toLowerCase().startsWith(searchTerm.toLowerCase())
  )

  useEffect(() => { setCurrentPage(1) }, [searchTerm, filterCategory])

  const indexOfLastItem  = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems     = filteredClinics.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages       = Math.ceil(filteredClinics.length / itemsPerPage)

  /* ═══════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════ */
  return (
    <>
      {/* ══ Confirmation Modal ══ */}
      <CModal visible={confirmModal.visible} onClose={closeModal} alignment="center">
        <CModalHeader>
          <CModalTitle>Confirm Status Change</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p style={{ marginBottom: 0 }}>
            Are you sure you want to change{' '}
            <strong>{confirmModal.clinicName}</strong>'s status from{' '}
            <span style={badgeStyle(confirmModal.fromStatus)}>
              {STATUS_LABEL[confirmModal.fromStatus]}
            </span>{' '}
            to{' '}
            <span style={badgeStyle(confirmModal.toStatus)}>
              {STATUS_LABEL[confirmModal.toStatus]}
            </span>
            ?
          </p>
          {confirmModal.toStatus === 'verified' && (
            <p className="mt-2 text-success" style={{ fontSize: 13 }}>
              ✅ A verification confirmation email will be sent to the clinic's registered email.
            </p>
          )}
          {confirmModal.toStatus === 'rejected' && (
            <p className="mt-2 text-danger" style={{ fontSize: 13 }}>
              ❌ You will be asked to enter a rejection reason. A rejection email will be sent to the clinic.
            </p>
          )}
          {confirmModal.toStatus === 'start' && (
            <p className="mt-2 text-info" style={{ fontSize: 13 }}>
              🔍 A "verification in progress" notification email will be sent to the clinic.
            </p>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={closeModal}>
            No, Cancel
          </CButton>
          <CButton
            style={{ backgroundColor: 'var(--color-black)', color: '#fff' }}
            onClick={handleConfirmStatusChange}
            disabled={statusLoading}
          >
            {statusLoading ? 'Updating...' : 'Yes, Change'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* ══ Main Card ══ */}
      <CCard className="mt-4">
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">{service?.categoryName} Clinics</h2>
            <CButton
              style={{ backgroundColor: 'var(--color-black)', color: COLORS.white }}
              onClick={() =>
                navigate('/add-clinic', {
                  state: {
                    categoryName: service?.categoryName,
                    categoryId:   service?.id,
                  },
                })
              }
            >
              Add Clinic
            </CButton>
          </div>
        </CCardHeader>

        <CCardBody>

          {/* ── Search & Filter ── */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="col-4 mx-2">
              <CFormInput
                placeholder="Search by Clinic Name, Mobile, or Email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">Filter by Categories</option>
                {categories.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-2 text-end">
              No. of Clinics: <strong>{filteredClinics.length}</strong>
            </div>
          </div>

          {/* ── Table ── */}
          {loading ? (
            <LoadingIndicator message="Fetching Clinic Details..." />
          ) : error ? (
            <p className="text-danger text-center">{error}</p>
          ) : (
            <CTable striped hover responsive>
              <CTableHead className="pink-table">
                <CTableRow>
                  <CTableHeaderCell>S.No</CTableHeaderCell>
                  <CTableHeaderCell>Clinic Name</CTableHeaderCell>
                  <CTableHeaderCell>Contact Number</CTableHeaderCell>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableHeaderCell>City</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody className="pink-table">
                {currentItems.length > 0 ? (
                  currentItems.map((clinic, index) => {
                    const uiStatus = mapBackendStatusToUI(clinic.status)
                    return (
                      <CTableRow key={clinic.hospitalId}>
                        <CTableDataCell>{indexOfFirstItem + index + 1}</CTableDataCell>
                        <CTableDataCell>{clinic.name}</CTableDataCell>
                        <CTableDataCell>{clinic.contactNumber}</CTableDataCell>
                        <CTableDataCell>{clinic.emailAddress}</CTableDataCell>
                        <CTableDataCell>{clinic.city}</CTableDataCell>

                        {/* ── Status Dropdown ── */}
                        <CTableDataCell>
                          <CFormSelect
                            value={uiStatus}
                            onChange={(e) =>
                              handleDropdownChange(e.target.value, clinic.hospitalId)
                            }
                            style={{
                              ...statusStyles[uiStatus],
                              borderRadius: '6px',
                              cursor: statusLoading ? 'not-allowed' : 'pointer',
                            }}
                            disabled={statusLoading}
                          >
                            <option value="pending">Pending</option>
                            <option value="start">Started</option>
                            <option value="verified">Verified</option>
                            <option value="rejected">Rejected</option>
                          </CFormSelect>
                        </CTableDataCell>

                        {/* ── View Button ── */}
                        <CTableDataCell className="text-center">
                          <button
                            className="actionBtn"
                            onClick={() =>
                              navigate(`/clinic-Management/${clinic.hospitalId}`)
                            }
                          >
                            <Eye size={18} />
                          </button>
                        </CTableDataCell>
                      </CTableRow>
                    )
                  })
                ) : (
                  <CTableRow>
                    <CTableDataCell colSpan="7" className="text-center">
                      No clinics found
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          )}

          {/* ── Pagination ── */}
          {filteredClinics.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <CFormSelect
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                style={{ width: '80px' }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </CFormSelect>

              <CPagination>
                <CPaginationItem
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Previous
                </CPaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <CPaginationItem
                    key={i}
                    active={currentPage === i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </CPaginationItem>
                ))}
                <CPaginationItem
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </CPaginationItem>
              </CPagination>
            </div>
          )}

      

        </CCardBody>
      </CCard>
    </>
  )
}

export default ClinicManagement