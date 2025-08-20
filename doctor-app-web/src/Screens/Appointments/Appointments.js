import React, { useEffect, useState } from 'react'
import {
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
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react'
import Button from '../../components/CustomButton/CustomButton'
import { COLORS, SIZES } from '../../Themes'
import TooltipButton from '../../components/CustomButton/TooltipButton'
import { getAppointments, getAppointmentsCount } from '../../Auth/Auth'

const tabLabels = {
  upcoming: 'Upcoming',
  completed: 'Completed',
}

const tabToNumberMap = {
  upcoming: 1,
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
        getAppointments(tabNumber),
        getAppointmentsCount(tabNumber),
      ])

      setAppointments(appointmentsData || [])
      const totalCount = countData?.completedAppointmentsCount ?? 0
      setPatientCount(totalCount)
      setLoading(false)
    }

    fetchData()
  }, [activeTab])

  const safeSearch = searchTerm.toLowerCase()
  const filteredPatients = Array.isArray(appointments)
    ? appointments.filter((p) => {
        const matchesSearch = p.name?.toLowerCase().includes(safeSearch)
        const matchesFilter = filter === 'All' || p.consultationType === filter
        return matchesSearch && matchesFilter
      })
    : []

  return (
    <CContainer>
      <CRow>
        <CCol>
          <div
            className="position-sticky z-3 w-100 pt-4"
            style={{ top: 105, backgroundColor: `${COLORS.theme}` }}
          >
            <h5 style={{ fontSize: SIZES.medium }} className="pb-3">
              Appointments
            </h5>
            <CRow className="w-100 d-flex justify-content-between align-items-center mb-2">
              <CCol xs={12} md={8}>
                <div className="d-flex align-items-center gap-2 flex-wrap pb-2">
                  {/* Dropdown for Upcoming / Completed */}
                  <CDropdown style={{ cursor: 'pointer' }}>
                    <CDropdownToggle
                      size="sm"
                      className="d-flex align-items-center gap-2"
                      style={{
                        border: `1px solid ${COLORS.logocolor}`,
                        borderRadius: '6px',
                        color: COLORS.logocolor,
                        fontWeight: '600',
                      }}
                    >
                      <span>{tabLabels[activeTab]}</span>
                      <span style={{ color: COLORS.logocolor, fontWeight: '600' }}>
                        ({filteredPatients.length})
                      </span>
                    </CDropdownToggle>

                    {/* Align dropdown menu to the right */}
                    <CDropdownMenu placement="end">
                      {Object.keys(tabLabels).map((key) => (
                        <CDropdownItem
                          key={key}
                          active={activeTab === key}
                          onClick={() => {
                            setActiveTab(key)
                            setFilter('All') // reset filter when tab changes
                          }}
                        >
                          {tabLabels[key]}
                        </CDropdownItem>
                      ))}
                    </CDropdownMenu>
                  </CDropdown>

                  {/* Consultation Filters */}
                  <>
                    <Button
                      variant={filter === 'Services & Treatments' ? 'primary' : 'outline'}
                      onClick={() => setFilter('Services & Treatments')}
                      customColor={
                        filter === 'Services & Treatments' ? COLORS.bgcolor : COLORS.logocolor
                      }
                      size="small"
                    >
                      Services & Treatments
                    </Button>

                    <Button
                      variant={filter === 'In-Clinic Consultation' ? 'primary' : 'outline'}
                      onClick={() => setFilter('In-Clinic Consultation')}
                      customColor={
                        filter === 'In-Clinic Consultation' ? COLORS.bgcolor : COLORS.logocolor
                      }
                      size="small"
                    >
                      In-Clinic Consultation
                    </Button>

                    {/* ✅ Online Consultation only for Upcoming & Completed */}
                    {(activeTab === 'upcoming' || activeTab === 'completed') && (
                      <Button
                        variant={filter === 'Online Consultation' ? 'primary' : 'outline'}
                        onClick={() => setFilter('Online Consultation')}
                        customColor={
                          filter === 'Online Consultation' ? COLORS.bgcolor : COLORS.logocolor
                        }
                        size="small"
                      >
                        Online Consultation
                      </Button>
                    )}
                  </>
                </div>
              </CCol>
            </CRow>
          </div>

          {/* Table */}
          <CCard
            className="mb-5 border"
            style={{
              border: '2px solid #0d6efd',
              borderRadius: '8px',
              boxShadow: '0 0 10px rgba(13, 110, 253, 0.1)',
            }}
          >
            <CCardBody style={{ padding: '0', overflowY: 'auto' }}>
              <CTable hover responsive className="mb-0 table-horizontal-lines striped">
                <CTableHead>
                  <CTableRow className="text-nowrap" style={{ fontSize: '0.875rem' }}>
                    {[
                      'S.No',
                      'Patient ID',
                      'Name',
                      'Mobile',
                      'Date',
                      'Time',
                      'Consultation',
                      'Status',
                      'Action',
                    ].map((header) => (
                      <CTableHeaderCell
                        key={header}
                        style={{
                          backgroundColor: COLORS.bgcolor,
                          color: COLORS.black,
                          fontWeight: 'bold',
                        }}
                      >
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
                      <CTableDataCell
                        colSpan={9}
                        className="text-center text-muted py-4"
                        style={{ color: COLORS.logocolor }}
                      >
                        No appointments found
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    filteredPatients.map((p, i) => (
                      <CTableRow
                        key={p.id || `${p.patientId}-${i}`}
                        style={{ fontSize: '0.85rem' }}
                      >
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
                            {p.status}
                          </span>
                        </CTableDataCell>
                        <CTableDataCell>
                          <TooltipButton patient={p} tab={p.status} />
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
