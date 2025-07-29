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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'
import {
  CustomerData,
  deleteCustomerData,
  addCustomer,
  getCustomerByMobile,
  updateCustomerData,
} from './CustomerAPI'
import { toast } from 'react-toastify'
import { ConfirmationModal } from '../../Utils/ConfirmationDelete'

const CustomerManagement = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [customerData, setCustomerData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const [isAdding, setIsAdding] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentMobile, setCurrentMobile] = useState(null)
  const [formattedDisplayDate, setFormattedDisplayDate] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [customerIdToDelete, setCustomerIdToDelete] = useState(null)
  const [formErrors, setFormErrors] = useState({})

  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    gender: '',
    emailId: '',
    dateOfBirth: '',
    referCode: '',
  })
  const getISODate = (date) => date.toISOString().split('T')[0]

  // Calculate today's date for minimum date restriction in the form
  // const today = new Date()
  // const todayISO = getISODate(today)
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
    const trimmedQuery = searchQuery.toLowerCase().trim()
    if (!trimmedQuery) {
      setFilteredData(customerData)
      setCurrentPage(1)
      return
    }

    const filtered = customerData.filter((customer) => {
      return (
        (customer?.fullName || '').toLowerCase().startsWith(trimmedQuery) ||
        (customer?.mobileNumber || '').toString().startsWith(trimmedQuery) ||
        (customer?.emailId || '').toLowerCase().startsWith(trimmedQuery)
      )
    })

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchQuery, customerData])

  const handleCustomerViewDetails = (mobileNumber) => {
    navigate(`/customer-management/${mobileNumber}`)
  }

  const handleDeleteCustomer = async (mobileNumber) => {
    // const confirmed = window.confirm('Are you sure you want to delete this customer?')
    setCustomerIdToDelete(mobileNumber)
    setIsModalVisible(true)

    try {
      await deleteCustomerData(mobileNumber)
      toast.success('Customer deleted successfully')
      const updatedData = customerData.filter((customer) => customer?.mobileNumber !== mobileNumber)
      setCustomerData(updatedData)
      setFilteredData(updatedData)
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('Failed to delete customer')
    }
  }

  const handleEditCustomer = async (mobileNumber) => {
    try {
      setLoading(true)
      const response = await getCustomerByMobile(mobileNumber)
      const customer = response.data || response

      console.log('Customer data:', customer)

      let formattedDate = ''

      if (customer.dateOfBirth) {
        const dobStr = customer.dateOfBirth.trim()

        if (/^\d{2}-\d{2}-\d{4}$/.test(dobStr)) {
          // Format: DD-MM-YYYY — safely parse manually
          const [day, month, year] = dobStr.split('-')
          formattedDate = `${year}-${month}-${day}` // convert to input-friendly format
        } else {
          // Try parsing YYYY-MM-DD or ISO string
          const parsedDate = new Date(dobStr)
          if (!isNaN(parsedDate)) {
            const year = parsedDate.getFullYear().toString().padStart(4, '0')
            const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
            const day = String(parsedDate.getDate()).padStart(2, '0')
            formattedDate = `${year}-${month}-${day}`
          }
        }
      }

      setFormData({
        fullName: customer.fullName || '',
        mobileNumber: customer.mobileNumber || '',
        gender: customer.gender || '',
        emailId: customer.emailId || '',
        dateOfBirth: formattedDate,
        referCode: customer.referCode || '',
      })

      setCurrentMobile(mobileNumber)
      setIsEditing(true)
      setIsAdding(true)
    } catch (error) {
      console.error('Failed to fetch customer:', error)
      toast.error('Failed to load customer data')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= Math.ceil(filteredData.length / itemsPerPage)) {
      setCurrentPage(page)
    }
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
      const alreadyExists = customerData.some((cust) => cust.mobileNumber === formData.mobileNumber)
      const alreadyExistsEmial = customerData.some((cust) => cust.emailId === formData.emailId)
      if (alreadyExists) {
        toast.error('Customer already exists.')
        return
      } else if (alreadyExistsEmial) {
        toast.error('Customer email id already exists.')
        return
      }
    }

    try {
      const updatedFormData = { ...formData }

      // Format DOB if exists
      if (updatedFormData.dateOfBirth) {
        const dateObj = new Date(updatedFormData.dateOfBirth)
        if (!isNaN(dateObj)) {
          const day = String(dateObj.getDate()).padStart(2, '0')
          const month = String(dateObj.getMonth() + 1).padStart(2, '0')
          const year = dateObj.getFullYear()
          updatedFormData.dateOfBirth = `${day}-${month}-${year}`
        }
      }

      if (isEditing) {
        await updateCustomerData(updatedFormData.mobileNumber, updatedFormData)
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

  // const alreadyExists = customerData.some((cust) => cust.mobileNumber === formData.mobileNumber)
  // if (!isEditing && alreadyExists) {
  //   toast.error('Customer already exists.')
  //   return
  // }

  const handleCancel = () => {
    setIsAdding(false)
    setIsEditing(false)
    setCurrentMobile(null)
    setFormData({
      fullName: '',
      mobileNumber: '',
      gender: '',
      emailId: '',
      dateOfBirth: '',
      referCode: '',
    })
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
    if (formData.dateOfBirth) {
      const dateObj = new Date(formData.dateOfBirth)
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
  }, [formData.dateOfBirth])

  const confirmDeleteCustomer = async () => {
    try {
      await deleteCustomerData(customerIdToDelete)
      toast.success('Customer deleted successfully')

      const updatedData = customerData.filter(
        (customer) => customer?.mobileNumber !== customerIdToDelete,
      )

      setCustomerData(updatedData)
      setFilteredData(updatedData)
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('Failed to delete customer')
    } finally {
      setIsModalVisible(false)
      setCustomerIdToDelete(null)
    }
  }
  // ConfirmationModal.jsx
  const ConfirmationModal = ({ isVisible, message, onConfirm, onCancel }) => {
    return (
      <CModal visible={isVisible} onClose={onCancel}>
        <CModalHeader>
          <CModalTitle>Confirm Deletion</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>{message}</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="danger" onClick={onConfirm}>
            Confirm
          </CButton>
          <CButton color="secondary" onClick={onCancel}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>
    )
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
    if (!formData.mobileNumber.trim()) {
      errors.mobileNumber = 'Mobile number is required'
    } else if (!/^[1-9]\d{9}$/.test(formData.mobileNumber)) {
      errors.mobileNumber = 'Mobile number must be 10 digits (starting from 1-9)'
    }

    // ✅ Email ID Validation
    if (!formData.emailId.trim()) {
      errors.emailId = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailId)) {
      errors.emailId = 'Email must contain @ and be valid'
    }

    // ✅ Date of Birth Validation
    if (!formData.dateOfBirth.trim()) {
      errors.dateOfBirth = 'Date of Birth is required'
    } else {
      const date = new Date(formData.dateOfBirth)
      const year = date.getFullYear()
      const today = new Date()

      if (isNaN(date)) {
        errors.dateOfBirth = 'Invalid Date of Birth'
      } else if (year.toString().length !== 4) {
        errors.dateOfBirth = 'Year must be 4 digits'
      } else if (date > today) {
        errors.dateOfBirth = 'Date of Birth cannot be in the future'
      } else {
        const oldestAllowedDate = new Date()
        oldestAllowedDate.setFullYear(today.getFullYear() - 100)

        if (date < oldestAllowedDate) {
          errors.dateOfBirth = 'Date of Birth must not be more than 120 years ago'
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
      {!isAdding ? (
        <>
          <CRow className="d-flex align-items-center mb-3">
            <div className="col-md-9 d-flex">
              <CForm className="w-100">
                <CInputGroup>
                  <CFormInput
                    type="text"
                    placeholder="Search by name, mobile, or email"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <CInputGroupText>
                    <CIcon icon={cilSearch} />
                  </CInputGroupText>
                </CInputGroup>
              </CForm>
            </div>

            <div className="col-md-3 d-flex justify-content-end">
              <CButton className="btn btn-primary w-auto" onClick={() => setIsAdding(true)}>
                Add New Customer
              </CButton>
            </div>
          </CRow>

          {loading ? (
            <div style={centeredMessageStyle}>Loading...</div>
          ) : error ? (
            <div style={centeredMessageStyle}>{error}</div>
          ) : filteredData.length === 0 ? (
            <div style={centeredMessageStyle}>No Customer Data Found</div>
          ) : (
            <>
              <CTable hover striped responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>S.No</CTableHeaderCell>
                    <CTableHeaderCell>Full Name</CTableHeaderCell>
                    <CTableHeaderCell>Mobile Number</CTableHeaderCell>
                    <CTableHeaderCell>Gender</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {paginatedData.map((customer, index) => (
                    <CTableRow key={customer.mobileNumber || index}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{customer?.fullName || '-'}</CTableDataCell>
                      <CTableDataCell>{customer?.mobileNumber || '-'}</CTableDataCell>
                      <CTableDataCell>{customer?.gender || '-'}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="primary"
                          size="sm"
                          onClick={() => handleCustomerViewDetails(customer?.mobileNumber)}
                        >
                          View
                        </CButton>
                        <CButton
                          className="ms-3 text-white"
                          color="warning"
                          size="sm"
                          onClick={() => handleEditCustomer(customer?.mobileNumber)}
                        >
                          Edit
                        </CButton>
                        <CButton
                          className="ms-3 text-white"
                          color="danger"
                          size="sm"
                          onClick={() => {
                            setCustomerIdToDelete(customer?.mobileNumber)
                            setIsModalVisible(true)
                          }}
                        >
                          Delete
                        </CButton>

                        <ConfirmationModal
                          isVisible={isModalVisible}
                          message="Are you sure you want to delete this customer?"
                          onConfirm={confirmDeleteCustomer}
                          onCancel={() => {
                            setIsModalVisible(false)
                            setCustomerIdToDelete(null)
                          }}
                        />
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>

              {Math.ceil(filteredData.length / itemsPerPage) > 1 && (
                <div className="d-flex justify-content-center mt-3">
                  <CPagination align="center">
                    <CPaginationItem
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Previous
                    </CPaginationItem>

                    {Array.from(
                      { length: Math.ceil(filteredData.length / itemsPerPage) },
                      (_, i) => i + 1,
                    ).map((page) => (
                      <CPaginationItem
                        key={page}
                        active={page === currentPage}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </CPaginationItem>
                    ))}

                    <CPaginationItem
                      disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Next
                    </CPaginationItem>
                  </CPagination>
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
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  // disabled
                  onKeyDown={(e) => {
                    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
                      e.preventDefault()
                    }
                  }}
                  onPaste={(e) => e.preventDefault()}
                  maxLength={10}
                  invalid={!!formErrors.mobileNumber}
                  disabled={isEditing}
                />

                {formErrors.mobileNumber && (
                  <div className="text-danger small">{formErrors.mobileNumber}</div>
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
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  type="date"
                  max={new Date().toISOString().split('T')[0]} // 🚫 Future dates disabled
                  invalid={!!formErrors.dateOfBirth}
                />

                {formErrors.dateOfBirth && (
                  <div className="text-danger small">{formErrors.dateOfBirth}</div>
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
                </CFormSelect>
                {formErrors.gender && <div className="text-danger small">{formErrors.gender}</div>}
              </CCol>
              <CCol md={6}>
                <CFormLabel>Refer Code</CFormLabel>
                <CFormInput
                  name="referCode"
                  value={formData.referCode}
                  onChange={handleInputChange}
                />
              </CCol>
            </CRow>

            <div className="d-flex justify-content-end">
              <CButton type="submit" color="success" className="me-2" style={{ color: 'white' }}>
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
