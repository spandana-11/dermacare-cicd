import React, { useState } from 'react'
import {
  CCard,
  CCardBody,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CButton,
  CRow,
  CCol,
} from '@coreui/react'

const Payouts = () => {
  const [activeKey, setActiveKey] = useState(1)

  const sampleData = [
    { id: 1, name: 'Dr. Ayesha Khan', amount: '₹3,200', date: '2025-10-25', status: 'Pending' },
    { id: 2, name: 'Dr. Raj Patel', amount: '₹5,800', date: '2025-10-24', status: 'Completed' },
    { id: 3, name: 'Dr. Sneha Rao', amount: '₹2,100', date: '2025-10-23', status: 'Failed' },
  ]

  const getBadgeColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'warning'
      case 'Completed':
        return 'success'
      case 'Failed':
        return 'danger'
      default:
        return 'secondary'
    }
  }

  const renderTable = (statusFilter) => {
    const filtered = sampleData.filter((item) => item.status === statusFilter)
    return (
      <CTable  striped hover responsive>
        <CTableHead className='pink-table'>
          <CTableRow>
            <CTableHeaderCell>S.No</CTableHeaderCell>
            <CTableHeaderCell>Doctor Name</CTableHeaderCell>
            <CTableHeaderCell>Amount</CTableHeaderCell>
            <CTableHeaderCell>Date</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell className="text-center">Action</CTableHeaderCell>
          </CTableRow>
        </CTableHead >
        <CTableBody className='pink-table'>
          {filtered.length > 0 ? (
            filtered.map((item, index) => (
              <CTableRow key={item.id}>
                <CTableDataCell>{index + 1}</CTableDataCell>
                <CTableDataCell>{item.name}</CTableDataCell>
                <CTableDataCell>{item.amount}</CTableDataCell>
                <CTableDataCell>{item.date}</CTableDataCell>
                <CTableDataCell>
                  <CBadge color={getBadgeColor(item.status)}>{item.status}</CBadge>
                </CTableDataCell>
                <CTableDataCell className="text-center">
                  {statusFilter === 'Pending' ? (
                    <CButton color="success" size="sm" className="me-2">
                      Release
                    </CButton>
                  ) : (
                    <CButton color="info" size="sm">
                      View
                    </CButton>
                  )}
                </CTableDataCell>
              </CTableRow>
            ))
          ) : (
            <CTableRow>
              <CTableDataCell colSpan="6" className="text-center text-muted">
                No records found
              </CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable>
    )
  }

  return (
    <CCard className="shadow-sm border-light">
      <CCardBody>
        <h4 className="text-primary fw-bold mb-4 text-center">Payout Management</h4>

        <CRow className="mb-3 text-center">
          <CCol md={4}>
            <CCard className="bg-light shadow-sm p-3 border-0">
              <h6>Total Payouts</h6>
              <h5 className="fw-bold text-primary">₹11,100</h5>
            </CCard>
          </CCol>
          <CCol md={4}>
            <CCard className="bg-light shadow-sm p-3 border-0">
              <h6>Pending</h6>
              <h5 className="fw-bold text-warning">₹3,200</h5>
            </CCard>
          </CCol>
          <CCol md={4}>
            <CCard className="bg-light shadow-sm p-3 border-0">
              <h6>Completed</h6>
              <h5 className="fw-bold text-success">₹5,800</h5>
            </CCard>
          </CCol>
        </CRow>

        <CNav variant="tabs" role="tablist" className="mb-3">
          <CNavItem>
            <CNavLink active={activeKey === 1} onClick={() => setActiveKey(1)}>
              Pending
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={activeKey === 2} onClick={() => setActiveKey(2)}>
              Completed
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={activeKey === 3} onClick={() => setActiveKey(3)}>
              Failed
            </CNavLink>
          </CNavItem>
        </CNav>

        <CTabContent>
          <CTabPane visible={activeKey === 1}>{renderTable('Pending')}</CTabPane>
          <CTabPane visible={activeKey === 2}>{renderTable('Completed')}</CTabPane>
          <CTabPane visible={activeKey === 3}>{renderTable('Failed')}</CTabPane>
        </CTabContent>
      </CCardBody>
    </CCard>
  )
}

export default Payouts
