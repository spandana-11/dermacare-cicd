import React, { useEffect, useState } from 'react'
import classNames from 'classnames'
import 'bootstrap/dist/css/bootstrap.min.css'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
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
import TooltipButton from '../../components/CustomButton/TooltipButton'

import { COLORS, SIZES } from '../../Themes'
import { useDoctorContext } from '../../Context/DoctorContext'
import { getTodayAppointments } from '../../Auth/Auth'
import CalendarModal from '../../utils/CalenderModal'

// Helper function
const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1)

const Dashboard = () => {
  const {
    setPatientData,
    doctorId,
    setTodayAppointments,
    todayAppointments, doctorDetails
  } = useDoctorContext()

  const [selectedType, setSelectedType] = useState(null)
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const [branches, setBranches] = useState([]) // Fetch from backend if needed
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const allBranches = doctorDetails?.branches || []
  // Filtered patients based on type and branch
  const filteredPatients = todayAppointments.filter((item) => {
    let typeMatch = selectedType ? item.consultationType === selectedType : true
    let branchMatch = selectedBranch ? item.branchId === selectedBranch.branchId : true
    return typeMatch && branchMatch
  })

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage)
  const currentPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Count consultations for buttons
  const consultationCounts = todayAppointments.reduce((acc, item) => {
    acc[item.consultationType] = (acc[item.consultationType] || 0) + 1
    return acc
  }, {})



  const fetchAppointments = async () => {
    const response = await getTodayAppointments()
    if (response.statusCode === 200) {
      setTodayAppointments(response.data)

      // Extract unique branchIds from appointments
      const uniqueBranchIds = [...new Set(response.data.map((item) => item.branchId))]

      // Match with doctorDetails branches to get branchName
      const matchedBranches = allBranches.filter((b) => uniqueBranchIds.includes(b.branchId))

      setBranches(matchedBranches)
    }
  }


useEffect(() => {
  setPatientData(null); // Clear patient context
  fetchAppointments();   // Fetch initially

  // Auto-fetch every 10 seconds
  const interval = setInterval(() => {
    fetchAppointments();
  }, 10000); // Adjust time (ms) as needed

  return () => clearInterval(interval); // Cleanup interval on unmount
}, []);


  return (
    <div className="container-fluid mt-3">
      <h5 className="mb-4" style={{ fontSize: SIZES.medium, color: COLORS.black }}>
        Today Appointments
      </h5>

      <div className="d-flex flex-wrap flex-md-nowrap gap-3">
        {/* LEFT SIDE */}
        <div className="flex-grow-1" style={{ flexBasis: '60%' }}>
          {/* Filters */}
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
            <div className="d-flex gap-2 flex-wrap">
              <Button
                variant={selectedType === null ? 'primary' : 'outline'}
                customColor={COLORS.bgcolor}
                color={COLORS.black}
                onClick={() => setSelectedType(null)}
                size="small"
              >
                All ({todayAppointments.length})
              </Button>
              {Object.entries(consultationCounts).map(([type, count]) => (
                <Button
                  key={type}
                  variant="outline"
                  customColor={COLORS.bgcolor}
                  color={COLORS.black}
                  size="small"
                  onClick={() => setSelectedType(type)}
                >
                  {type} ({count})
                </Button>
              ))}
            </div>

            <div className="d-flex gap-2">
              {/* Branch Dropdown */}
              <CDropdown>
                <CDropdownToggle
                  style={{
                    backgroundColor: COLORS.bgcolor,
                    color: COLORS.black,
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                    textAlign: 'left',
                  }}
                >
                  {selectedBranch ? selectedBranch.branchName : 'Select Branch'}
                </CDropdownToggle>
                <CDropdownMenu>
                  {branches.length > 0 ? (
                    branches.map((branch) => (
                      <CDropdownItem
                        key={branch.branchId}
                        onClick={() => setSelectedBranch(branch)}
                      >
                        {branch.branchName}({branch.branchId})
                      </CDropdownItem>
                    ))
                  ) : (
                    <CDropdownItem disabled>No branches available</CDropdownItem>
                  )}
                </CDropdownMenu>
              </CDropdown>

              <Button
                variant="outline"
                customColor={COLORS.bgcolor}
                color={COLORS.black}
                size="small"
                onClick={() => setShowCalendar(true)}
              >
                My Calendar
              </Button>
            </div>
          </div>

          {/* Appointments Table */}
          <div style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto', borderRadius: '8px' }}>
            <CTable className="border">
              <CTableHead>
                <CTableRow>
                  {['S.No', 'Patient ID', 'Name', 'Mobile', 'Date', 'Time', 'Consultation', 'Action'].map(
                    (header, i) => (
                      <CTableHeaderCell
                        key={i}
                        className={header === 'Action' ? 'text-center' : ''}
                        style={{ backgroundColor: COLORS.bgcolor, color: COLORS.black }}
                      >
                        {header}
                      </CTableHeaderCell>
                    )
                  )}
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {currentPatients.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan="8" className="text-center py-4 text-muted">
                      No Appointments Available
                    </CTableDataCell>
                  </CTableRow>
                ) : (
                  currentPatients.map((item, idx) => (
                    <CTableRow key={idx}>
                      <CTableDataCell>{idx + 1}</CTableDataCell>
                      <CTableDataCell>{item.patientId}</CTableDataCell>
                      <CTableDataCell>{capitalizeFirst(item.name)}</CTableDataCell>
                      <CTableDataCell>{item.mobileNumber}</CTableDataCell>
                      <CTableDataCell>{item.serviceDate}</CTableDataCell>
                      <CTableDataCell>{item.servicetime}</CTableDataCell>
                      <CTableDataCell>{item.consultationType}</CTableDataCell>
                      <CTableDataCell className="text-center">
                        <TooltipButton patient={item} tab={item.status} />
                      </CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>

            {/* Pagination */}
            <div className="d-flex justify-content-end align-items-center mt-2 gap-2">
              <Button
                size="small"
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Prev
              </Button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                size="small"
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Ad */}
        <div
          className="d-flex align-items-start justify-content-start bg-dark"
          style={{ height: '60vh', width: '200px', overflow: 'hidden', borderRadius: '10px' }}
        >
          <CCard
            className="w-100 h-100 d-flex justify-content-center align-items-center"
            style={{ backgroundColor: COLORS.bgcolor }}
          >
            <span style={{ color: COLORS.black, fontWeight: 'bold', textAlign: 'center' }}>
              Ad Space
            </span>
          </CCard>
        </div>
      </div>

      {/* Calendar Modal */}
      {showCalendar && (
        <CalendarModal
          visible={showCalendar}
          onClose={() => setShowCalendar(false)}
          todayAppointments={todayAppointments}
          defaultBookedSlots={[]}
          handleClick={() => { }}
          fetchAppointments={fetchAppointments}
        />
      )}
    </div>
  )
}

export default Dashboard
