import React, { useEffect, useState } from 'react'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'
import ClinicAPI from './ClinicAPI'
import { ClinicAllData } from '../../baseUrl'
import { BASE_URL } from '../../baseUrl'
import { ClipLoader } from 'react-spinners'
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
import { CategoryData } from '../categoryManagement/CategoryAPI'

const ClinicManagement = ({ service, onBack }) => {
  const navigate = useNavigate()
  const [clinics, setClinics] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [categories, setCategories] = useState([])
  const location = useLocation()

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const handleAddClinic = () => {
    navigate('/add-clinic', {
      state: {
        categoryName: service?.categoryName,
        categoryId: service?.id,
      },
    })
  }

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await CategoryData()
      setCategories(res.data)
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchClinics()
    if (location.state?.newClinic) {
      setClinics((prev) => [...prev, location.state.newClinic])
    }
  }, [location.state?.newClinic, filterCategory])

  const fetchClinics = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${BASE_URL}/${ClinicAllData}`)
      const clinicList = Array.isArray(response.data)
        ? response.data
        : response.data.hospitalCategory || response.data.data || []

      const filteredClinics = filterCategory
        ? clinicList.filter(
            (clinic) =>
              Array.isArray(clinic.hospitalCategory) &&
              clinic.hospitalCategory.some((cat) => cat.categoryId === filterCategory),
          )
        : clinicList

      setClinics(filteredClinics)
    } catch (error) {
      console.error('Error fetching clinics:', error)
      setError('Failed to load clinics')
    } finally {
      setLoading(false)
    }
  }

  // Search filter
  const filteredClinics = clinics.filter(
    (clinic) =>
      clinic.name?.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
      clinic.contactNumber?.startsWith(searchTerm) ||
      clinic.emailAddress?.toLowerCase().startsWith(searchTerm.toLowerCase()),
  )

  // Reset to page 1 when filters/search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterCategory])

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredClinics.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredClinics.length / itemsPerPage)

  return (
    <CCard className="mt-4">
      <CCardHeader>
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="mb-0">{service?.categoryName} Clinics</h2>
          <CButton color="primary" onClick={handleAddClinic}>
            Add Clinic
          </CButton>
        </div>
      </CCardHeader>

      <CCardBody>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="col-4 mx-2">
            <CFormInput
              type="text"
              placeholder="Search by full name, mobile, or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-4 ">
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

          <div className="col-2 text-end">No.of Hospitals: {filteredClinics?.length || 0}</div>
        </div>

        {error && <p className="text-center text-danger">{error}</p>}

        <CTable hover responsive>
          <CTableHead className="pink-table">
            <CTableRow>
              <CTableHeaderCell>S.No</CTableHeaderCell>
              <CTableHeaderCell>Clinic Name</CTableHeaderCell>
              <CTableHeaderCell>Contact Number</CTableHeaderCell>
              <CTableHeaderCell>Email Address</CTableHeaderCell>
              <CTableHeaderCell>City</CTableHeaderCell>
              <CTableHeaderCell>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody className="pink-table">
            {currentItems?.length > 0
              ? currentItems.map((clinic, index) => (
                  <CTableRow key={clinic?.id || index}>
                    <CTableDataCell>{indexOfFirstItem + index + 1}</CTableDataCell>
                    <CTableDataCell>{clinic?.name}</CTableDataCell>
                    <CTableDataCell>{clinic?.contactNumber}</CTableDataCell>
                    <CTableDataCell>{clinic?.emailAddress}</CTableDataCell>
                    <CTableDataCell>{clinic?.city}</CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        color="primary"
                        size="sm"
                        onClick={() => navigate(`/clinic-Management/${clinic.hospitalId}`)}
                      >
                        View
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))
              : !loading && (
                  <CTableRow>
                    <CTableDataCell colSpan="6" className="text-center">
                      No clinics found
                    </CTableDataCell>
                  </CTableRow>
                )}
          </CTableBody>
        </CTable>

        {/* Pagination Controls */}
        {filteredClinics.length > 0 && (
          <div className="d-flex justify-content-between align-items-center mt-3">
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
              Showing {indexOfFirstItem + 1} to{' '}
              {Math.min(indexOfLastItem, filteredClinics.length)} of {filteredClinics.length} entries
            </div>

            <CPagination align="end" aria-label="Page navigation">
              <CPaginationItem
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </CPaginationItem>

              {[...Array(totalPages)].map((_, idx) => (
                <CPaginationItem
                  key={idx + 1}
                  active={currentPage === idx + 1}
                  onClick={() => setCurrentPage(idx + 1)}
                >
                  {idx + 1}
                </CPaginationItem>
              ))}

              <CPaginationItem
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              >
                Next
              </CPaginationItem>
            </CPagination>
          </div>
        )}
      </CCardBody>

      {loading && (
        <div className="text-center">
          <ClipLoader color="#3498db" loading={loading} size={50} />
          <p>Loading...</p>
        </div>
      )}
    </CCard>
  )
}

export default ClinicManagement
