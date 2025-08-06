import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import Button from '../../components/CustomButton/CustomButton'
import { COLORS } from '../../Themes'

import TooltipButton from '../../components/CustomButton/TooltipButton'
import { getAppointments,getAppointmentsCount } from '../../Auth/Auth'

const tabLabels = {
  upcoming: 'UPCOMING',
  online: 'ONLINE APPOINTMENTS',
  completed: 'COMPLETED',
}

const tabToNumberMap = {
  upcoming: 1,
  online: 2,
  completed: 3,
}

const Appointments = ({ searchTerm = '' }) => {
  const [activeTab, setActiveTab] = useState('upcoming')
const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('All')
  const [patientCount, setPatientCount] = useState(0)

useEffect(() => {
  const fetchData = async () => {
    setLoading(true)
    const tabNumber = tabToNumberMap[activeTab]

    const [appointmentsData, countData] = await Promise.all([
      getAppointments(tabNumber), // ✅ No filter passed
      getAppointmentsCount(tabNumber),
    ])

    setAppointments(appointmentsData || [])
    const totalCount = countData?.completedAppointmentsCount ?? 0
    setPatientCount(totalCount)
    setLoading(false)
  }

  fetchData()
}, [activeTab]) // ✅ Only tab changes trigger refetch



  const safeSearch = searchTerm.toLowerCase()
const filteredPatients = Array.isArray(appointments)
  ? appointments.filter((p) => {
      const matchesSearch = p.name?.toLowerCase().includes(safeSearch)
      const matchesFilter =
        filter === 'All' || p.consultationType === filter
      return matchesSearch && matchesFilter
    })
  : []

  const renderTab = (key) => (
    <div
      key={key}
      onClick={() => {
        setActiveTab(key)
        setFilter('All')
      }}
      style={{
        fontWeight: 'bold',
        background:
          activeTab === key
            ? `linear-gradient(145deg, ${COLORS.primary}, ${COLORS.secondary})`
            : `${COLORS.white}`,
        color: activeTab === key ? '#ffffff' : '#444',
        borderRadius: '10px',
        padding: '10px 22px',
        marginRight: 12,
        fontSize: '0.75rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow:
          activeTab === key
            ? '0 8px 16px rgba(12, 131, 248, 0.3)'
            : 'inset 0 1px 2px rgba(0,0,0,0.05)',
        border: activeTab === key ? 'none' : '1px solid #ddd',
      }}
    >
      {tabLabels[key]}
    </div>
  )

  return (
    <CContainer>
      <CRow>
        <CCol>
          <div
            className="position-sticky z-3 w-100 p-1 pt-4"
            style={{ top: 105, backgroundColor: `${COLORS.theme}` }}
          >
            <CRow className="w-100 d-flex justify-content-between align-items-center mb-3">
              <CCol xs={12} md={8}>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  {Object.keys(tabLabels).map(renderTab)}
                </div>
              </CCol>
              <CCol xs={12} md={3} className="text-md-end text-start">
     <Button
  className="mb-3"
  customGradient={`linear-gradient(145deg, ${COLORS.primary}, ${COLORS.secondary})`}
>
  Total Patients: <strong>{patientCount}</strong>
</Button>
              </CCol>
            </CRow>

            {/* Filters */}
            {activeTab !== 'online' && (
              <CRow className="align-items-center mb-2 w-100">
                <CCol xs={12} md={9}>
                  <div className="d-flex align-items-center gap-3 flex-wrap">
                    <Button
                      variant={filter === 'All' ? 'primary' : 'outline'}
                      onClick={() => setFilter('All')}
                      customColor={filter === 'All' ? COLORS.primary : COLORS.gray}
                      size="small"
                    >
                      All
                    </Button>
                    <Button
                      variant={filter === 'Services & Treatments' ? 'primary' : 'outline'}
                      onClick={() => setFilter('Services & Treatments')}
                      customColor={
                        filter === 'Services & Treatments' ? COLORS.orange : COLORS.gray
                      }
                      size="small"
                    >
                      Services & Treatments
                    </Button>
                    <Button
                      variant={filter === 'In-Clinic Consultation' ? 'primary' : 'outline'}
                      onClick={() => setFilter('In-Clinic Consultation')}
                      customColor={
                        filter === 'In-Clinic Consultation' ? COLORS.primary : COLORS.gray
                      }
                      size="small"
                    >
                      In-Clinic Consultation
                    </Button>
                    {activeTab === 'completed' && (
                      <Button
                        variant={filter === 'Online Consultation' ? 'primary' : 'outline'}
                        onClick={() => setFilter('Online Consultation')}
                        customColor={
                          filter === 'Online Consultation' ? COLORS.teal : COLORS.gray
                        }
                        size="small"
                      >
                        Online Consultation
                      </Button>
                    )}
                  </div>
                </CCol>

                <CCol xs={12} md={2} className="text-md-end text-start mb-2">
                  <span className="badge bg-primary text-white px-3 py-2 rounded-pill">
                    Patient Count: {filteredPatients.length}
                  </span>
                </CCol>
              </CRow>
            )}
          </div>

          <CCard className="mb-5 border" style={{ marginTop: '2%', border: '2px solid #0d6efd', borderRadius: '8px', boxShadow: '0 0 10px rgba(13, 110, 253, 0.1)' }}>
            <CCardBody style={{ padding: '0', overflowY: 'auto' }}>
              <CTable hover responsive className="mb-0 table-horizontal-lines striped">
                <CTableHead>
                  <CTableRow className="text-nowrap" style={{ fontSize: '0.875rem' }}>
                    {['S.No', 'Patient ID', 'Name', 'Mobile', 'Date', 'Time', 'Consultation', 'Status', 'Action'].map(header => (
                      <CTableHeaderCell key={header} style={{ backgroundColor: '#dee2e6', color: '#000', fontWeight: 'bold' }}>
                        {header}
                      </CTableHeaderCell>
                    ))}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {loading ? (
                    <CTableRow>
                      <CTableDataCell colSpan={9} className="text-center py-4">
                        Loading...
                      </CTableDataCell>
                    </CTableRow>
                  ) : filteredPatients.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan={9} className="text-center text-muted py-4">
                        No appointments found
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    filteredPatients.map((p, i) => (
                      <CTableRow key={p.id} style={{ fontSize: '0.85rem' }}>
                        <CTableDataCell>{i + 1}</CTableDataCell>
                        <CTableDataCell>{p.patientId}</CTableDataCell>
                        <CTableDataCell>{p.name}</CTableDataCell>
                        <CTableDataCell>{p.mobileNumber}</CTableDataCell>
                        <CTableDataCell>{p.serviceDate}</CTableDataCell>
                        <CTableDataCell>{p.servicetime}</CTableDataCell>
                        <CTableDataCell>{p.consultationType}</CTableDataCell>
                        <CTableDataCell>
                          <span
                            className="px-2 py-1 rounded"
                            style={{
                              backgroundColor: p.status === 'Confirmed' ? '#e8f9f2' : '#e0e0e0',
                              color: p.status === 'Confirmed' ? '#27ae60' : '#7f8c8d',
                              fontWeight: '500',
                              fontSize: '0.8rem',
                            }}
                          >
                            {p.status === 'Confirmed' && activeTab === 'online' ? p.status : p.status}
                          </span>
                        </CTableDataCell>
                        <CTableDataCell>
                          <TooltipButton patient={p} />
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  )}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default Appointments
