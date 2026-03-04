import React, { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CPagination,
  CPaginationItem,
  CSpinner,
  CButton,
  CButtonGroup
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'
import { Eye } from 'lucide-react'
import MembershipViewModal from './MembershipViewModal'
import { BASE_URL_API, CustomerAllData } from '../../baseUrl'

const MEMBERSHIPS = ['ALL', 'BASIC', 'SILVER', 'GOLD', 'PLATINUM']

const MembershipTable = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selectedMember, setSelectedMember] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [membershipFilter, setMembershipFilter] = useState('ALL')
  const indexOfLastItem = currentPage * rowsPerPage
  const indexOfFirstItem = indexOfLastItem - rowsPerPage

  // 📡 Fetch Data
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`${BASE_URL_API}/${CustomerAllData}`)
        setData(res.data?.data || res.data || [])
      } catch {
        setError('Failed to load membership data')
      } finally {
        setLoading(false)
      }
    }
    fetchMembers()
  }, [])

  // 🔍 Filter + Search (optimized)
  const filteredData = useMemo(() => {
    return data.filter((member) => {
      const membershipMatch =
        membershipFilter === 'ALL' ||
        member.walletSummary?.membership?.toUpperCase() === membershipFilter

      const searchMatch =
        !searchTerm ||
        Object.values(member).some((v) =>
          v?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )

      return membershipMatch && searchMatch
    })
  }, [data, membershipFilter, searchTerm])

  // 📄 Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  )

  return (
    <div>

      {/* 🔥 FILTER BAR */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">

        {/* Membership Filters */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            background: 'var(--color-bgcolor)',
            padding: '6px',
            borderRadius: '12px',
          }}
        >
          {['ALL', 'BASIC', 'SILVER', 'GOLD', 'PLATINUM'].map((type) => {
            const isActive = membershipFilter === type

            return (
              <button
                key={type}
                onClick={() => {
                  setMembershipFilter(type)
                  setCurrentPage(1)
                }}
                style={{
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',

                  /* 🔥 THEME-BASED COLORS */
                  backgroundColor: isActive
                    ? 'var(--color-black)'
                    : 'transparent',

                  color: isActive
                    ? '#fff'
                    : 'var(--color-black)',

                  boxShadow: isActive
                    ? '0 3px 8px rgba(0,0,0,0.25)'
                    : 'none',

                  transition: 'all 0.25s ease',
                }}
              >
                {type}
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div style={{ width: 280 }}>
          <CInputGroup>
            <CFormInput
              placeholder="Search customer..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
            <CInputGroupText>
              <CIcon icon={cilSearch} />
            </CInputGroupText>
          </CInputGroup>
        </div>
      </div>



      {/* ⏳ Loading */}
      {loading && (
        <div className="text-center py-4">
          <CSpinner />
        </div>
      )}

      {/* ❌ Error */}
      {error && <div className="text-danger text-center">{error}</div>}

      {/* 📋 Table */}
      {!loading && !error && (
        <CTable striped hover responsive>
          <CTableHead className='pink-table'>
            <CTableRow className="text-center">
              <CTableHeaderCell>S.No</CTableHeaderCell>
              <CTableHeaderCell>Name</CTableHeaderCell>
              <CTableHeaderCell>Phone</CTableHeaderCell>
              <CTableHeaderCell>Coins</CTableHeaderCell>
              <CTableHeaderCell>Membership</CTableHeaderCell>
              <CTableHeaderCell>Referral</CTableHeaderCell>
              <CTableHeaderCell>Joined</CTableHeaderCell>
              <CTableHeaderCell>Action</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody className='pink-table'>
            {paginatedData.length ? (
              paginatedData.map((item, i) => (
                <CTableRow key={item.customerId} className="text-center align-middle">
                  <CTableDataCell>{startIndex + i + 1}</CTableDataCell>
                  <CTableDataCell>{item.fullName}</CTableDataCell>
                  <CTableDataCell>{item.mobile}</CTableDataCell>
                  <CTableDataCell>{item.walletSummary?.balance ?? 0}</CTableDataCell>
                  <CTableDataCell>
                    <span className={`tag ${item.walletSummary?.membership?.toLowerCase()}`}>
                      {item.walletSummary?.membership || '-'}
                    </span>
                  </CTableDataCell>
                  <CTableDataCell>{item.referId || '-'}</CTableDataCell>
                  <CTableDataCell>
                    {item.dob
                      ? new Date(item.dob).toLocaleDateString('en-GB')
                      : '-'}
                  </CTableDataCell>
                  <CTableDataCell>
                    <button className="actionBtn" onClick={() => setSelectedMember(item)}>
                      <Eye size={18} />
                    </button>
                  </CTableDataCell>
                </CTableRow>
              ))
            ) : (
              <CTableRow>
                <CTableDataCell colSpan={8} className="text-center text-muted">
                  No data found
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>
      )}

      {/* 📑 Pagination */}
      {/* 📑 Pagination */}
      {filteredData.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-3">

          {/* Rows per page */}
          <div>
            <span className="me-2">Rows per page:</span>
            <select
              className="form-select form-select-sm d-inline"
              style={{ width: '80px' }}
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Showing info + Pagination */}
          <div>
            <span className="me-3">
              Showing {indexOfFirstItem + 1} to{' '}
              {Math.min(indexOfLastItem, filteredData.length)} of{' '}
              {filteredData.length} entries
            </span>

            <CPagination align="end" className="mt-2 themed-pagination">
              <CPaginationItem
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              >
                Previous
              </CPaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
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
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
              >
                Next
              </CPaginationItem>
            </CPagination>
          </div>
        </div>
      )}

      {/* 👁️ Modal */}
      {selectedMember && (
        <MembershipViewModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  )
}

export default MembershipTable
