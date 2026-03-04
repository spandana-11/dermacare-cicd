import React, { useEffect, useState } from 'react'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'
import { AllClinicData } from '../../baseUrl'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CFormInput,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CPagination,
  CPaginationItem,
  CFormSelect,
} from '@coreui/react'
import LoadingIndicator from '../../Utils/loader'
import { toast } from 'react-toastify'
import capitalizeWords from '../../Utils/capitalizeWords'

const Clinic_getDetails = ({ service }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [clinics, setClinics] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    fetchClinics()
    if (location.state?.newClinic) {
      setClinics(prev => [...prev, location.state.newClinic])
    }
  }, [location.state?.newClinic])

  const fetchClinics = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${AllClinicData}/verified`)
      const clinicList = Array.isArray(response.data)
        ? response.data
        : response.data.hospitalCategory || response.data.data || []

      setClinics(clinicList)
    } catch (error) {
      console.error(error)
      toast.error('Failed to load clinics')
    } finally {
      setLoading(false)
    }
  }

  // Filter by search
  const filteredClinics = clinics.filter(
    clinic =>
      clinic.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.contactNumber?.startsWith(searchTerm) ||
      clinic.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => { setCurrentPage(1) }, [searchTerm])

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredClinics.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredClinics.length / itemsPerPage)
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  return (
    <div className="d-flex justify-content-center mt-4">
      <div style={{ width: '95%', maxWidth: '1200px' }}>
        <CCard>
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">{service?.categoryName} Packages & Procedures Management</h4>
            </div>
          </CCardHeader>

          <CCardBody>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="col-4 mx-2">
                <CFormInput
                  type="text"
                  autoComplete="off"
                  style={{ border: '1px solid var(--color-black)', }}
                  placeholder="Search by Clinic Name, Mobile, or Email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="col-2 text-end">
                No. of Verified Clinics: {filteredClinics.length}
              </div>
            </div>

            {loading ? (
              <LoadingIndicator message="Fetching Clinic Details..." />
            ) : (
              <div>
                <CTable striped hover responsive>
                  <CTableHead className="pink-table">
                    <CTableRow className="text-center">
                      <CTableHeaderCell >S.No</CTableHeaderCell>
                      <CTableHeaderCell>Clinic Name</CTableHeaderCell>
                      <CTableHeaderCell>Contact Number</CTableHeaderCell>
                      <CTableHeaderCell>Email</CTableHeaderCell>
                      <CTableHeaderCell>City</CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>

                  <CTableBody className="pink-table">
                    {currentItems.length > 0 ? (
                      currentItems.map((clinic, index) => (
                        <CTableRow key={clinic?.clinicId || index} className="text-center align-middle">
                          <CTableDataCell>{indexOfFirstItem + index + 1}</CTableDataCell>
                          <CTableDataCell>{capitalizeWords(clinic?.name || "N/A")}</CTableDataCell>
                          <CTableDataCell>{clinic?.contactNumber || "N/A"}</CTableDataCell>
                          <CTableDataCell>{clinic?.email || "N/A"}</CTableDataCell>
                          <CTableDataCell>{capitalizeWords(clinic?.city || "N/A")}</CTableDataCell>
                          <CTableDataCell>
                            {clinic?.status ? (
                              <CButton
                                color="success"
                                size="sm"
                                variant="outline"
                                style={{
                                  backgroundColor: 'transparent',
                                  color: '#198754', // match success color
                                  borderColor: '#198754',
                                  boxShadow: 'none',
                                }}
                                onMouseOver={(e) => e.preventDefault()}
                                onMouseDown={(e) => e.preventDefault()}
                                onFocus={(e) => e.preventDefault()}
                              >
                                Verified
                              </CButton>
                            ) : (
                              <CButton
                                color="danger"

                                size="sm"
                                variant="outline"
                                style={{
                                  backgroundColor: 'transparent',
                                  color: '#dc3545', // match danger color
                                  borderColor: '#dc3545',
                                  boxShadow: 'none',
                                }}
                                onMouseOver={(e) => e.preventDefault()}
                                onMouseDown={(e) => e.preventDefault()}
                                onFocus={(e) => e.preventDefault()}
                              >
                                Not Verified
                              </CButton>
                            )}
                          </CTableDataCell>

                          <CTableDataCell className="text-center">
                            <button
                              className="actionBtn"
                              title="View"
                              onClick={() => navigate(`/Package_ProcedureManagement_Tabs/${clinic.clinicId}`, { state: clinic })}
                            >
                              View
                            </button>
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    ) : (
                      <CTableRow>
                        <CTableDataCell colSpan="7" className="text-center">
                          No Verified Clinics Found
                        </CTableDataCell>
                      </CTableRow>
                    )}
                  </CTableBody>
                </CTable>
              </div>
            )}

            {/* Pagination */}
            {filteredClinics.length > 0 && (
              <div className="d-flex justify-content-between px-3 pb-3 mt-3">
                <div>
                  <label className="me-2">Rows per page:</label>
                  <CFormSelect
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    style={{ width: '80px', display: 'inline-block' }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </CFormSelect>
                </div>
                <div>
                  <div>
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredClinics.length)} of {filteredClinics.length}entries
                  </div>

                  <CPagination align="end" className="mt-2 themed-pagination">
                    <CPaginationItem
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Previous
                    </CPaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        if (totalPages <= 5) return true;
                        if (currentPage <= 3) return page <= 5;
                        if (currentPage >= totalPages - 2)
                          return page >= totalPages - 4;
                        return page >= currentPage - 2 && page <= currentPage + 2;
                      })
                      .map((page) => (
                        <CPaginationItem
                          key={page}
                          active={page === currentPage}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </CPaginationItem>
                      ))}

                    <CPaginationItem
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Next
                    </CPaginationItem>
                  </CPagination>
                </div>
              </div>
            )}
          </CCardBody>
        </CCard>
      </div>
    </div>
  )
}

export default Clinic_getDetails
