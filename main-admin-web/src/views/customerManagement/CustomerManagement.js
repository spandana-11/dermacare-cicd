import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CButton,
  CRow,
  CCol,
  CFormSelect,
  CFormLabel,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { Eye, Trash2 } from 'lucide-react'
import { cilSearch } from '@coreui/icons'
import {
  CustomerData,
  deleteCustomerData,
  addCustomer,
  updateCustomerData,
} from './CustomerAPI'
import { ToastContainer, toast } from 'react-toastify'
import ConfirmationModal from '../../components/ConfirmationModal'
import { COLORS } from '../../Constant/Themes'
import LoadingIndicator from '../../Utils/loader'

const CustomerManagement = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [customerData, setCustomerData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [isAdding, setIsAdding] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentMobile, setCurrentMobile] = useState(null)
  const [formattedDisplayDate, setFormattedDisplayDate] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [customerIdToDelete, setCustomerIdToDelete] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [selectedMobiles, setSelectedMobiles] = useState([])
  const [isMultiDelete, setIsMultiDelete] = useState(false)
  const [delloading, setDelLoading] = useState(false)
  const [customerNameToDelete, setCustomerNameToDelete] = useState('')

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    gender: '',
    emailId: '',
    dob: '',
    referCode: '',
  })

  const getISODate = (date) => date.toISOString().split('T')[0]
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)



  const centeredMessageStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '300px',
    fontSize: '1.5rem',
    color: '#808080',
  }

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await CustomerData()
      const safeData = Array.isArray(data)
        ? data.filter((item) => item && typeof item === 'object')
        : []
      setCustomerData(safeData)
      setFilteredData(safeData)
    } catch (error) {
      console.error('Error fetching customers:', error)
      setError('Failed to fetch customer data.')
      setCustomerData([])
      setFilteredData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredData(customerData)
      setCurrentPage(1)
      return
    }

    const trimmedQuery = searchQuery.toLowerCase().trim()

    const filtered = customerData.filter((customer) => {
      const fullName = (customer?.fullName || '').toLowerCase()
      const mobile = (customer?.mobile || '').toString()
      const registrationCode = (customer?.registrationCode || '').toLowerCase()
      const customerId = (customer?.customerId || '').toLowerCase()
      const addressPincode = (customer?.address?.pincode || '').toString()

      const serviceTypeMatch = (customer?.serviceType || []).some((type) =>
        type.toLowerCase().includes(trimmedQuery)
      )

      return (
        fullName.includes(trimmedQuery) ||
        mobile.includes(trimmedQuery) ||
        registrationCode.includes(trimmedQuery) ||
        customerId.includes(trimmedQuery) ||
        addressPincode.includes(trimmedQuery) ||
        serviceTypeMatch
      )
    })

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchQuery, customerData])


  const handleCustomerViewDetails = (mobile) => {
    navigate(`/customer-management/${mobile}`)
  }


  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSelectOne = (mobile) => {
    setSelectedMobiles((prev) =>
      prev.includes(mobile)
        ? prev.filter((m) => m !== mobile)
        : [...prev, mobile]
    )
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    const errors = { ...formErrors }
    if (errors[name]) {
      delete errors[name]
      setFormErrors(errors)
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      // toast.error('Please fix the form errors')
      return
    }
    if (!isEditing) {
      const alreadyExists = customerData.some((cust) => cust.mobile === formData.mobile)
      const alreadyExistsEmial = customerData.some((cust) => cust.emailId === formData.emailId)
      if (alreadyExists) {
        toast.error('Mobile Number already exists.')
        return
      } else if (alreadyExistsEmial) {
        toast.error('Customer email id already exists.')
        return
      }
    }

    try {
      const updatedFormData = { ...formData }

      // Format DOB if exists
      if (updatedFormData.dob) {
        const dateObj = new Date(updatedFormData.dob)
        if (!isNaN(dateObj)) {
          const day = String(dateObj.getDate()).padStart(2, '0')
          const month = String(dateObj.getMonth() + 1).padStart(2, '0')
          const year = dateObj.getFullYear()
          updatedFormData.dob = `${day}-${month}-${year}`
        }
      }

      if (isEditing) {
        await updateCustomerData(updatedFormData.mobile, updatedFormData)
        toast.success('Customer updated successfully')
      } else {
        await addCustomer(updatedFormData)
        toast.success('Customer added successfully')
      }

      await fetchCustomers()
      handleCancel()
    } catch (error) {
      console.error('Error submitting customer:', error)
      if (error?.response?.status === 409) {
        toast.error('Customer already exists with this mobile number or email.')
      } else {
        toast.error('Something went wrong while submitting.')
      }
    }
  }


  const handleCancel = () => {
    setIsAdding(false)
    setIsEditing(false)
    setCurrentMobile(null)
    setFormData({
      fullName: '',
      mobile: '',
      gender: '',
      emailId: '',
      dob: '',
      referCode: '',
    })
    setFormErrors({})

    // Preserve search filtered data
    if (searchQuery.trim()) {
      // If search query exists, keep filteredData as is
      setFilteredData(
        customerData.filter((customer) => {
          const trimmedQuery = searchQuery.toLowerCase().trim()
          const fullNameMatch = (customer?.fullName || '').toLowerCase().startsWith(trimmedQuery)
          const mobileMatch = (customer?.mobile || '').toString().startsWith(trimmedQuery)
          const emailMatch = (customer?.emailId || '').toLowerCase().startsWith(trimmedQuery)

          const addressPincode = customer?.address?.match(/\b\d{6}\b/)?.[0] || ''
          const pincodeMatch = addressPincode.startsWith(trimmedQuery)

          const serviceTypeMatch = (customer?.serviceType || []).some(
            (type) => type.toLowerCase().startsWith(trimmedQuery)
          )

          return fullNameMatch || mobileMatch || emailMatch || pincodeMatch || serviceTypeMatch
        })
      )
    } else {
      // If no search query, show all data
      setFilteredData(customerData)
    }
    setCurrentPage(1)
  }


  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )
  const formatDateToDDMMYYYY = (dateStr) => {
    const date = new Date(dateStr)
    if (!isNaN(date)) {
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      return `${day}-${month}-${year}`
    }
    return ''
  }
  useEffect(() => {
    if (formData.dob) {
      const dateObj = new Date(formData.dob)
      if (!isNaN(dateObj)) {
        const day = String(dateObj.getDate()).padStart(2, '0')
        const month = String(dateObj.getMonth() + 1).padStart(2, '0')
        const year = dateObj.getFullYear()
        setFormattedDisplayDate(`${day}-${month}-${year}`)
      } else {
        setFormattedDisplayDate('')
      }
    } else {
      setFormattedDisplayDate('')
    }
  }, [formData.dob])


  const adjustCurrentPageAfterDelete = (updatedLength) => {
    const newTotalPages = Math.ceil(updatedLength / itemsPerPage)

    setCurrentPage((prevPage) =>
      prevPage > newTotalPages ? Math.max(newTotalPages, 1) : prevPage
    )
  }

  const confirmDeleteCustomer = async () => {
    try {
      setDelLoading(true)
      if (isMultiDelete) {
        await Promise.all(
          selectedMobiles.map((mobile) => deleteCustomerData(mobile))
        )

        toast.success('Selected customers deleted successfully')

        setCustomerData((prev) => {
          const updated = prev.filter((c) => !selectedMobiles.includes(c.mobile))
          adjustCurrentPageAfterDelete(updated.length)
          return updated
        })

        setFilteredData((prev) => {
          const updated = prev.filter((c) => !selectedMobiles.includes(c.mobile))
          adjustCurrentPageAfterDelete(updated.length)
          return updated
        })

        setSelectedMobiles([])
        setIsMultiDelete(false)
      } else {
        await deleteCustomerData(customerIdToDelete)
        toast.success('Customer deleted successfully')

        setCustomerData((prev) => {
          const updated = prev.filter((c) => c.mobile !== customerIdToDelete)
          adjustCurrentPageAfterDelete(updated.length)
          return updated
        })

        setFilteredData((prev) => {
          const updated = prev.filter((c) => c.mobile !== customerIdToDelete)
          adjustCurrentPageAfterDelete(updated.length)
          return updated
        })
      }
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('Failed to delete customer')
    } finally {
      setDelLoading(false)
      setIsModalVisible(false)
      setCustomerIdToDelete(null)
      setCustomerNameToDelete('')
    }
  }


  const validateForm = () => {
    const errors = {}

    // Full Name Validation
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full Name is required'
    } else if (/\d/.test(formData.fullName)) {
      errors.fullName = 'Name should not contain numbers'
    }

    // Mobile Number Validation
    if (!formData.mobile.trim()) {
      errors.mobile = 'Mobile number is required'
    } else if (!/^[1-9]\d{9}$/.test(formData.mobile)) {
      errors.mobile = 'Mobile number must be 10 digits (starting from 1-9)'
    }

    // ✅ Email ID Validation
    if (!formData.emailId.trim()) {
      errors.emailId = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailId)) {
      errors.emailId = 'Email must contain @ and be valid'
    }

    // ✅ Date of Birth Validation
    if (!formData.dob.trim()) {
      errors.dob = 'Date of Birth is required'
    } else {
      const date = new Date(formData.dob)
      const year = date.getFullYear()
      const today = new Date()

      if (isNaN(date)) {
        errors.dob = 'Invalid Date of Birth'
      } else if (year.toString().length !== 4) {
        errors.dob = 'Year must be 4 digits'
      } else if (date > today) {
        errors.dob = 'Date of Birth cannot be in the future'
      } else {
        const oldestAllowedDate = new Date()
        oldestAllowedDate.setFullYear(today.getFullYear() - 100)

        if (date < oldestAllowedDate) {
          errors.dob = 'Date of Birth must not be more than 120 years ago'
        }
      }
    }

    // ✅ Refer Code Validation (Optional but validate if entered)
    if (formData.referCode && /[^a-zA-Z0-9]/.test(formData.referCode)) {
      errors.referCode = 'Refer code must contain only letters and numbers'
    }

    // Gender
    if (!formData.gender) {
      errors.gender = 'Gender is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  return (
    <>
      <ToastContainer />
      {!isAdding ? (
        <>
          <CRow className="d-flex align-items-center mb-3">
            <div className="col-md-9 d-flex">
              <CForm style={{ width: "50%" }}>
                <CInputGroup>
                  <CFormInput
                    type="text"
                    style={{ border: '1px solid var(--color-black)', }}
                    placeholder="Search by name, mobile, or registrationcode"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <CInputGroupText style={{ border: '1px solid var(--color-black)', }}>
                    <CIcon icon={cilSearch} />
                  </CInputGroupText>
                </CInputGroup>
              </CForm>


            </div>


            {/* 🗑 Delete Selected */}
            <div className="col-md-3 d-flex justify-content-end">
              {selectedMobiles.length > 0 && (
                <CButton
                  color="secondary"
                  style={{ backgroundColor: 'var(--color-black)', color: COLORS.white }}
                  disabled={selectedMobiles.length === 0}
                  onClick={() => {
                    setIsMultiDelete(true)
                    setIsModalVisible(true)
                  }}
                >
                  Delete Selected ({selectedMobiles.length})
                </CButton>
              )}
            </div>
          </CRow>


          {loading ? (
            <CTable >
              <CTableHead >
                <CTableRow className="text-center" >
                  <CTableHeaderCell colSpan={6} className="text-center">
                    <LoadingIndicator message="Loading customer data..." />
                  </CTableHeaderCell>
                </CTableRow>
              </CTableHead>
            </CTable>
          ) : error ? (
            <div style={centeredMessageStyle}>{error}</div>
          ) : filteredData.length === 0 ? (
            <div style={centeredMessageStyle}>No Customer Data Found</div>
          ) : (
            <>
              <CTable striped hover responsive>
                <CTableHead className='pink-table'>
                  <CTableRow className="text-center">

                    <CTableHeaderCell >
                      Select
                    </CTableHeaderCell>
                    <CTableHeaderCell >S.No</CTableHeaderCell>
                    <CTableHeaderCell >Full Name</CTableHeaderCell>
                    <CTableHeaderCell >Mobile Number</CTableHeaderCell>
                    <CTableHeaderCell >Gender</CTableHeaderCell>
                    <CTableHeaderCell >Date Of Birth</CTableHeaderCell>
                    <CTableHeaderCell >Registration Code</CTableHeaderCell>
                    <CTableHeaderCell >Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <CTableBody className='pink-table'>
                  {currentItems.map((customer, index) => (
                    <CTableRow key={customer.mobile || index} className="text-center align-middle">
                      {/* Row Checkbox */}
                      <CTableDataCell>
                        <input
                          type="checkbox"
                          checked={selectedMobiles.includes(customer.mobile)}
                          onChange={() => handleSelectOne(customer.mobile)}
                        />
                      </CTableDataCell>

                      <CTableDataCell>{indexOfFirstItem + index + 1}</CTableDataCell>
                      <CTableDataCell>{customer?.fullName || '-'}</CTableDataCell>
                      <CTableDataCell>{customer?.mobile || '-'}</CTableDataCell>
                      <CTableDataCell>{customer?.gender || '-'}</CTableDataCell>
                      <CTableDataCell>{customer?.dob || '-'}</CTableDataCell>
                      <CTableDataCell>{customer?.registrationCode || 'NA'}</CTableDataCell>

                      <CTableDataCell>
                        <div className="d-flex justify-content-center align-items-center gap-2">
                          <button
                            className="actionBtn view"
                            onClick={() => handleCustomerViewDetails(customer?.mobile)}
                            title="View"
                          >
                            <Eye size={18} />
                          </button>


                          <button
                            className="actionBtn delete"
                            onClick={() => {
                              setCustomerIdToDelete(customer?.mobile)
                              setCustomerNameToDelete(customer?.fullName || 'this customer')
                              setIsMultiDelete(false)
                              setIsModalVisible(true)
                            }}
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>

              <ConfirmationModal
                isVisible={isModalVisible}
                message={
                  <div style={{ lineHeight: 1.6 }}>
                    <div style={{ fontSize: '16px' }}>
                      {isMultiDelete ? (
                        <>
                          Are you sure you want to delete{' '}
                          <strong>{selectedMobiles.length} customers</strong>?
                        </>
                      ) : (
                        <>
                          Are you sure you want to delete{' '}
                          <strong style={{ color: 'var(--color-black)' }}>
                            {customerNameToDelete}
                          </strong>
                          ?
                        </>
                      )}
                    </div>
                  </div>
                }
                confirmText={
                  delloading ? (
                    <span className="d-flex align-items-center">
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      />
                      Deleting...
                    </span>
                  ) : (
                    'Yes, Delete'
                  )
                }
                onConfirm={confirmDeleteCustomer}
                onCancel={() => {
                  setIsModalVisible(false)
                  setCustomerIdToDelete(null)
                  setCustomerNameToDelete('')
                  setIsMultiDelete(false)
                }}
              />


              {filteredData.length > 0 && (
                <div className="d-flex justify-content-between px-3 pb-3 mt-3">
                  {/* Rows per page dropdown */}
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
                    {/* Showing info */}
                    <div>
                      Showing {indexOfFirstItem + 1} to{' '}
                      {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
                    </div>

                    {/* Pagination */}
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
            </>
          )}

        </>
      ) : (
        <>
          <h4 className="mb-4">{isEditing ? 'Edit Customer' : 'Add New Customer'}</h4>
          <CForm onSubmit={handleFormSubmit}>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>
                  Full Name
                  <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  invalid={!!formErrors.fullName}
                  style={{ textTransform: "capitalize" }}
                />
                {formErrors.fullName && (
                  <div className="text-danger small">{formErrors.fullName}</div>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel>
                  Mobile Number
                  <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  // disabled
                  onKeyDown={(e) => {
                    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
                      e.preventDefault()
                    }
                  }}
                  onPaste={(e) => e.preventDefault()}
                  maxLength={10}
                  invalid={!!formErrors.mobile}
                  disabled={isEditing}
                />

                {formErrors.mobile && (
                  <div className="text-danger small">{formErrors.mobile}</div>
                )}
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>
                  Email ID
                  <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  name="emailId"
                  value={formData.emailId}
                  onChange={handleInputChange}
                  type="email"
                  invalid={!!formErrors.emailId}
                />
                {formErrors.emailId && (
                  <div className="text-danger small">{formErrors.emailId}</div>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel>
                  Date of Birth
                  <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  type="date"
                  max={new Date().toISOString().split('T')[0]} // 🚫 Future dates disabled
                  invalid={!!formErrors.dob}
                />

                {formErrors.dob && (
                  <div className="text-danger small">{formErrors.dob}</div>
                )}

                {formattedDisplayDate && (
                  <div className="text-muted mt-1">Selected Date: {formattedDisplayDate}</div>
                )}
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>
                  Gender
                  <span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  invalid={!!formErrors.gender}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Female">Others</option>
                </CFormSelect>
                {formErrors.gender && <div className="text-danger small">{formErrors.gender}</div>}
              </CCol>
              <CCol md={6}>
                <CFormLabel>Referral Code</CFormLabel>
                <CFormInput
                  name="referCode"
                  value={formData.referCode}
                  onChange={handleInputChange}
                />
                {formErrors.referCode && (
                  <div className="text-danger">{formErrors.referCode}</div>
                )}
              </CCol>
            </CRow>

            <div className="d-flex justify-content-end">
              <CButton
                type="submit"
                color="success"
                style={{ backgroundColor: 'var(--color-black)', color: 'white', border: 'none', marginRight: '5px' }}
              >
                {isEditing ? 'Update' : 'Submit'}
              </CButton>
              <CButton color="secondary" onClick={handleCancel}>
                Cancel
              </CButton>
            </div>
          </CForm>
        </>
      )}
    </>
  )
}

export default React.memo(CustomerManagement)
