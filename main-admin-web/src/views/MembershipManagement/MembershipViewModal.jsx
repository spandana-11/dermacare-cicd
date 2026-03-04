import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CButton,
  CSpinner,
} from '@coreui/react'
import { BASE_URL_API } from '../../baseUrl'

export default function MembershipViewModal({ member, onClose }) {
  if (!member) return null

  const wallet = member.walletSummary || {}

  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedReason, setSelectedReason] = useState('ALL')

  const formatNumber = (value) => Number(value || 0).toLocaleString()

  const membershipColors = {
    BASIC: '#6c757d',
    SILVER: '#bfc6d1',
    GOLD: '#f7c400',
    PLATINUM: '#af8de5',
  }

  // 🔥 Fetch Transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true)
        const res = await axios.get(
         `${BASE_URL_API}/customers/${member.mobile}/reward-transactions` 
        )
        setTransactions(res.data?.data || [])
      } catch (error) {
        setTransactions([])
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [member.mobile])

  // 🔽 Reason options
  const reasonOptions = useMemo(() => {
    const reasons = transactions.map((t) => t.reason)
    return ['ALL', ...new Set(reasons)]
  }, [transactions])

  // 🔍 Filtered transactions
  const filteredTransactions =
    selectedReason === 'ALL'
      ? transactions
      : transactions.filter((t) => t.reason === selectedReason)

  return (
    <CModal visible onClose={onClose} size="lg" backdrop="static" className="custom-modal">
      {/* HEADER */}
      <CModalHeader
        style={{
          background: 'linear-gradient(135deg, var(--color-black), var(--color-bgcolor))',
          color: 'white',
          borderBottom: 'none',
        }}
      >
        <CModalTitle style={{ fontWeight: 700, color: 'white' }}>
          Membership Details
        </CModalTitle>
      </CModalHeader>

      <CModalBody style={{ padding: '25px' }}>
        {/* PROFILE */}
        <div
          style={{
            background: 'linear-gradient(135deg, #ffe3ef, #ffd2e7)',
            padding: '20px',
            borderRadius: '16px',
            marginBottom: '25px',
          }}
        >
          <h3 style={{ marginBottom: 5, fontWeight: 700 }}>
            {member.fullName}
          </h3>
          <p style={{ margin: 0 }}>{member.mobile}</p>
        </div>

        {/* DETAILS */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '18px',
            marginBottom: '20px',
          }}
        >
          <div>
            <label>Membership</label>
            <div
              style={{
                background: membershipColors[wallet.membership] || '#999',
                padding: '6px 12px',
                color: 'white',
                width: 'fit-content',
                borderRadius: '8px',
                fontWeight: 600,
              }}
            >
              {wallet.membership || '-'}
            </div>
          </div>

          <div>
            <label>Coins</label>
            <p>{formatNumber(wallet.balance)}</p>
          </div>

          <div>
            <label>Referral Code</label>
            <p>{member.referId || '-'}</p>
          </div>

          <div>
            <label>Date of Birth</label>
            <p>
              {member.dob
                ? new Date(member.dob).toLocaleDateString('en-GB')
                : '-'}
            </p>
          </div>
        </div>

        <hr />

        {/* TRANSACTION HEADER + FILTER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 style={{ fontWeight: 700, color: '#d81b60' }}>
            Transaction History
          </h5>

          <div style={{ width: '240px' }}>
            <label className="fw-semibold">Filter by Reason</label>
            <select
              className="form-select"
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
            >
              {reasonOptions.map((reason) => (
                <option key={reason} value={reason}>
                  {reason === 'ALL'
                    ? 'All Reasons'
                    : reason.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* TRANSACTION TABLE */}
        {loading ? (
          <div className="text-center py-4">
            <CSpinner />
          </div>
        ) : (
          <div
            style={{
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid #f3c4d9',
            }}
          >
            <table className="table mb-0">
              <thead style={{ background: '#ffe3ef' }}>
                <tr>
                  <th>Date</th>
                  <th>Reason</th>
                  <th>Points</th>
                  <th>Balance After</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((t) => (
                    <tr key={t.id}>
                      <td>
                        {new Date(t.createdAt).toLocaleDateString('en-GB')}
                      </td>
                      <td>{t.reason.replaceAll('_', ' ')}</td>
                      <td
                        style={{
                          fontWeight: 700,
                          color: t.type === 'CREDIT' ? 'green' : 'red',
                        }}
                      >
                        {t.type === 'CREDIT' ? '+' : '-'}
                        {formatNumber(t.points)}
                      </td>
                      <td>{formatNumber(t.balanceAfter)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center text-muted py-3">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* CLOSE */}
        <div className="text-end mt-4">
          <CButton
            style={{
              background: 'var(--color-black)',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '10px',
              color: 'white',
              fontWeight: 600,
            }}
            onClick={onClose}
          >
            Close
          </CButton>
        </div>
      </CModalBody>
    </CModal>
  )
}
