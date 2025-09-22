import React, { useEffect, useState, useCallback, useRef } from 'react'
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
  CustomerByCustomerId,
  updateCustomerData,
} from './CustomerManagementAPI'

import { ToastContainer, toast } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css'
import { Edit2, Eye, Trash2 } from 'lucide-react'
import LoadingIndicator from '../../Utils/loader'
import { useGlobalSearch } from '../Usecontext/GlobalSearchContext'
import ConfirmationModal from '../../components/ConfirmationModal'
const CustomerManagement = () => {
  const navigate = useNavigate()
  const [customerData, setCustomerData] = useState([])
  // const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentMobile, setCurrentMobile] = useState(null)
  const [formattedDisplayDate, setFormattedDisplayDate] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [customerIdToDelete, setCustomerIdToDelete] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const { searchQuery, setSearchQuery } = useGlobalSearch()
  const [isAdding, setIsAdding] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isViewModalVisible, setIsViewModalVisible] = useState(false)
const [viewCustomerData, setViewCustomerData] = useState(null)

  const [formData, setFormData] = useState({
    customerId: '',
    title: '',
    firstName: '',
    lastName: '',
    fullName: '',
    mobileNumber: '',
    gender: '',
    email: '',
    dateOfBirth: '',
    referralCode: '',
    age: '',
    hospitalId: localStorage.getItem('HospitalId') || '',
    hospitalName: localStorage.getItem('HospitalName') || '',
    branchId: localStorage.getItem('branchId') || '',
    address: {
      // ✅ Always keep this object ready
      houseNo: '',
      street: '',
      landmark: '',
      city: '',
      state: '',
      country: 'India',
      postalCode: '',
    },
  })

  // ======= state for states + helper refs =======
  const [states, setStates] = useState([])
  const [statesLoading, setStatesLoading] = useState(false)
  const pincodeTimer = useRef(null)

  // Fallback list of Indian states + UTs (used if remote fetch fails / CORS)
  const staticStates = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
    'Andaman and Nicobar Islands',
    'Chandigarh',
    'Dadra and Nagar Haveli and Daman & Diu',
    'Delhi',
    'Jammu and Kashmir',
    'Ladakh',
    'Lakshadweep',
    'Puducherry',
  ]

  // fetch states on mount (try public API, fallback to static list)
  useEffect(() => {
    let mounted = true
    // Fetch states globally
    // const fetchStates = async (country) => {
    //   const res = await fetch("https://countriesnow.space/api/v0.1/countries/states", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ country }),
    //   });
    //   const data = await res.json();
    //   return data.data.states.map((s) => s.name);
    // };

    // Fetch cities globally
    const fetchCities = async (country, state) => {
      const res = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country, state }),
      })
      const data = await res.json()
      return data.data
    }

    // fetchStates()
    return () => {
      mounted = false
    }
  }, [])

  // ======= nested change handler (if you haven't already) =======
  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }))
  }

  // ======= pincode handler with debounce + postal API =======
  const handlePincodeChange = (value) => {
    // only allow digits
    if (!/^\d*$/.test(value)) return
    // always update postalCode immediately
    handleNestedChange('address', 'postalCode', value)

    // clear any pending timer
    if (pincodeTimer.current) {
      clearTimeout(pincodeTimer.current)
    }

    // only call API when exactly 6 digits
    if (value.length === 6) {
      pincodeTimer.current = setTimeout(async () => {
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${value}`)
          if (!res.ok) throw new Error(`pincode API ${res.status}`)
          const data = await res.json()
          if (
            data?.[0]?.Status === 'Success' &&
            Array.isArray(data[0].PostOffice) &&
            data[0].PostOffice.length
          ) {
            const po = data[0].PostOffice[0]

            handleNestedChange('address', 'street', po.Name || '')
            handleNestedChange('address', 'city', po.Region || '')
            handleNestedChange('address', 'landmark', po.Block || '')
            handleNestedChange('address', 'state', po.State || '')
          } else {
            console.warn('No PostOffice data returned for pincode', value, data)
          }
        } catch (err) {
          console.warn('Error fetching pincode data:', err)
        }
      }, 300) // 300ms debounce
    }
  }

  // clear timer on unmount
  useEffect(() => {
    return () => {
      if (pincodeTimer.current) clearTimeout(pincodeTimer.current)
    }
  }, [])

  const getISODate = (date) => date.toISOString().split('T')[0]

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
    } catch (error) {
      console.error('Error fetching customers:', error)
      setError('Failed to fetch customer data.')
      setCustomerData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const capitalizeWords = (str) => {
    if (!str) return ''
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
  }
  const handleCustomerViewDetails = async (customerId) => {
    try {
      setLoading(true)
      const response = await CustomerByCustomerId(customerId)
      const customer = Array.isArray(response) ? response[0] : response

      setViewCustomerData(customer)
      setIsViewModalVisible(true)
    } catch (error) {
      console.error('Failed to fetch customer:', error)
      toast.error('Failed to load customer data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCustomer = async (customerId) => {
    // const confirmed = window.confirm('Are you sure you want to delete this customer?')
    setCustomerIdToDelete(customerId)
    setIsModalVisible(true)

    try {
      await deleteCustomerData(customerId)
      toast.success('Customer deleted successfully')
      const updatedData = customerData.filter((customer) => customer?.customerId !== customerId)
      setCustomerData(updatedData)
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('Failed to delete customer')
    }
  }

  const handleEditCustomer = async (customerId) => {
    try {
      setLoading(true)
      const response = await CustomerByCustomerId(customerId)
      const customer = Array.isArray(response) ? response[0] : response

      // Format date to YYYY-MM-DD for <input type="date">
      let formattedDate = ''
      if (customer.dateOfBirth) {
        const dob = customer.dateOfBirth
        if (/^\d{2}-\d{2}-\d{4}$/.test(dob)) {
          const [day, month, year] = dob.split('-')
          formattedDate = `${year}-${month}-${day}`
        } else {
          const dateObj = new Date(dob)
          if (!isNaN(dateObj)) {
            const y = dateObj.getFullYear()
            const m = String(dateObj.getMonth() + 1).padStart(2, '0')
            const d = String(dateObj.getDate()).padStart(2, '0')
            formattedDate = `${y}-${m}-${d}`
          }
        }
      }

 let title = ''
    let firstName = ''
    let lastName = ''

    if (customer.fullName) {
      const parts = customer.fullName.trim().split(' ')
      if (parts.length >= 3) {
        title = parts[0]
        firstName = parts[1]
        lastName = parts.slice(2).join(' ') // handles middle/last names
      } else if (parts.length === 2) {
        title = parts[0]
        firstName = parts[1]
      } else if (parts.length === 1) {
        firstName = parts[0]
      }
    }

    setFormData({
      customerId: customer.customerId || '',
      title,
      firstName,
      lastName,
      fullName: customer.fullName || '',
      mobileNumber: customer.mobileNumber || '',
      gender: customer.gender || '',
      email: customer.email || '',
      dateOfBirth: formattedDate,
      referralCode: customer.referralCode || '',
      age: customer.age || '',
      hospitalId: localStorage.getItem('HospitalId') || '',
      hospitalName: localStorage.getItem('HospitalName') || '',
      branchId: localStorage.getItem('branchId') || '',
      address: {
        houseNo: customer.address?.houseNo || '',
        street: customer.address?.street || '',
        landmark: customer.address?.landmark || '',
        city: customer.address?.city || '',
        state: customer.address?.state || '',
        country: customer.address?.country || 'India',
        postalCode: customer.address?.postalCode || '',
      },
    })


      setIsAdding(true)
      setIsEditing(true)
      setCurrentMobile(customer.mobileNumber)
      setViewCustomerData(customer)
// setIsViewModalVisible(true)

    } catch (error) {
      console.error('Failed to fetch customer:', error)
      toast.error('Failed to load customer data')
    } finally {
      setLoading(false)
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
  useEffect(() => {
    if (isEditing && formData.address.postalCode) {
      handlePincodeChange(formData.address.postalCode)
    }
  }, [isEditing])

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    console.log('Submitting form', formData)
    // ✅ Validate the form first
    if (!validateForm()) return

    try {
      const updatedFormData = { ...formData }

      // Combine Title + First Name + Last Name
      updatedFormData.fullName =
        `${formData.title} ${formData.firstName} ${formData.lastName}`.trim()

      // Format DOB to DD-MM-YYYY
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
        await updateCustomerData(formData.customerId, updatedFormData)
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
  // Reset editing and adding state
  setIsAdding(false)
  setIsEditing(false)
  setCurrentMobile(null)

  // Close view modal only if we are canceling from "view" mode, 
  // not when canceling from "edit"
  if (!isEditing) {
    setIsViewing(false)
  }

  // Reset form
  setFormData({
    customerId: '',
    title: '',
    firstName: '',
    lastName: '',
    fullName: '',
    mobileNumber: '',
    gender: '',
    email: '',
    dateOfBirth: '',
    referralCode: '',
    age: '',
    hospitalId: localStorage.getItem('HospitalId') || '',
    hospitalName: localStorage.getItem('HospitalName') || '',
    branchId: localStorage.getItem('branchId') || '',
    address: {
      houseNo: '',
      street: '',
      landmark: '',
      city: '',
      state: '',
      country: 'India',
      postalCode: '',
    },
  })
}


  const filteredData = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return customerData
    return customerData.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(q)),
    )
  }, [searchQuery, customerData])

  const displayData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

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
        (customer) => customer?.customerId !== customerIdToDelete,
      )

      setCustomerData(updatedData)
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('Failed to delete customer')
    } finally {
      setIsModalVisible(false)
      setCustomerIdToDelete(null)
    }
  }

  const validateForm = () => {
    const errors = {}

    // Title
    if (!formData.title.trim()) {
      errors.title = 'Title is required'
    } else if (/\d/.test(formData.title)) {
      errors.title = 'Title should not contain numbers'
    }

    // First Name
    if (!formData.firstName.trim()) {
      errors.firstName = 'First Name is required'
    } else if (/\d/.test(formData.firstName)) {
      errors.firstName = 'First Name should not contain numbers'
    }

    // Mobile Number
    if (!formData.mobileNumber.trim()) {
      errors.mobileNumber = 'Mobile number is required'
    } else if (!/^[1-9]\d{9}$/.test(formData.mobileNumber)) {
      errors.mobileNumber = 'Mobile number must be 10 digits (starting from 1-9)'
    }

    // ✅ Email validation — make it required
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email must be valid and contain @'
    }

    // Date of Birth
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
        oldestAllowedDate.setFullYear(today.getFullYear() - 120)
        if (date < oldestAllowedDate) {
          errors.dateOfBirth = 'Date of Birth must not be more than 120 years ago'
        }
      }
    }

    // Gender
    if (!formData.gender) {
      errors.gender = 'Gender is required'
    }

    // Referral Code (optional)
    if (formData.referralCode && /[^a-zA-Z0-9]/.test(formData.referralCode)) {
      errors.referralCode = 'Refer code must contain only letters and numbers'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  return (
    <>
    
      {!isAdding ? (
        <>
          <CRow className="d-flex align-items-center mb-3">
            <ToastContainer />
            <div
              className="mb-3 w-100"
              style={{
                display: 'flex',
                justifyContent: 'end',
                alignContent: 'end',
                alignItems: 'end',
              }}
            >
              <CButton
                style={{
                  color: 'var(--color-black)',
                  backgroundColor: 'var(--color-bgcolor)',
                }}
                onClick={() => setIsAdding(true)}
              >
                Add New Customer
              </CButton>
            </div>

            {/* <div className="col-md-3 d-flex justify-content-end">
              <CButton className="btn btn-primary w-auto" onClick={() => setIsAdding(true)}>
                Add New Customer
              </CButton>
            </div> */}
          </CRow>

          <ConfirmationModal
            isVisible={isModalVisible}
            title="Delete Customer"
            message="Are you sure you want to delete this Customer? This action cannot be undone."
            confirmText="Yes, Delete"
            cancelText="Cancel"
            confirmColor="danger"
            cancelColor="secondary"
            onConfirm={confirmDeleteCustomer}
            onCancel={() => {
              setIsModalVisible(false)
              setCustomerIdToDelete(null)
            }}
          />

          {loading ? (
            <div className="d-flex justify-content-center align-items-center">
              <LoadingIndicator message="Loading customers..." />
            </div>
          ) : error ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{
                height: '50vh', // full screen height

                color: 'var(--color-black)',
              }}
            >
              {error}
            </div>
          ) : filteredData.length === 0 ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{
                height: '50vh', // full screen height

                color: 'var(--color-black)',
              }}
            >
              No Customer Data Found
            </div>
          ) : (
            <>
              <CTable hover striped responsive>
                <CTableHead className="pink-table  w-auto">
                  <CTableRow>
                    <CTableHeaderCell>S.No</CTableHeaderCell>
                    <CTableHeaderCell>Full Name</CTableHeaderCell>
                    <CTableHeaderCell>Mobile Number</CTableHeaderCell>
                    <CTableHeaderCell>Gender</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody className="pink-table">
                  {displayData.length > 0 ? (
                    displayData.map((customer, index) => (
                      <CTableRow key={customer.mobileNumber || index}>
                        <CTableDataCell>
                          {' '}
                          {(currentPage - 1) * rowsPerPage + index + 1}
                        </CTableDataCell>
                        <CTableDataCell>{customer?.fullName || '-'}</CTableDataCell>
                        <CTableDataCell>{customer?.mobileNumber || '-'}</CTableDataCell>
                        <CTableDataCell>{customer?.gender || '-'}</CTableDataCell>

                        <CTableDataCell className="text-end">
                          <div className="d-flex justify-content-end gap-2  ">
                            <button
                              className="actionBtn"
                              onClick={() => handleCustomerViewDetails(customer?.customerId)}
                              title="View"
                            >
                              <Eye size={18} />
                            </button>

                            <button
                              className="actionBtn"
                              onClick={() => handleEditCustomer(customer?.customerId)}
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>

                            <button
                              className="actionBtn"
                              onClick={() => {
                                setCustomerIdToDelete(customer?.customerId)
                                setIsModalVisible(true)
                              }}
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </CTableDataCell>

                        {/* <CTableDataCell>
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
                      </CTableDataCell> */}
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan={5} className="text-center text-muted">
                        🔍 No diseases found matching "<b>{searchQuery}</b>"
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
<CModal
  visible={isViewModalVisible}
  onClose={() => setIsViewModalVisible(false)}
  size="lg"
>
  <CModalHeader>
    <CModalTitle>Customer Details</CModalTitle>
  </CModalHeader>
  <CModalBody>
    {loading ? (
      <div className="text-center">Loading...</div>
    ) : viewCustomerData ? (
      <CRow className="mb-2">
        <CCol md={6}>
          <strong>Full Name:</strong> {viewCustomerData.fullName || "-"}
        </CCol>
        <CCol md={6}>
          <strong>Mobile:</strong> {viewCustomerData.mobileNumber || "-"}
        </CCol>
        <CCol md={6}>
          <strong>Email:</strong> {viewCustomerData.email || "-"}
        </CCol>
        <CCol md={6}>
          <strong>Gender:</strong> {viewCustomerData.gender || "-"}
        </CCol>
        <CCol md={6}>
          <strong>DOB:</strong> {viewCustomerData.dateOfBirth || "-"}
        </CCol>
        <CCol md={6}>
          <strong>Age:</strong> {viewCustomerData.age || "-"}
        </CCol>
        <CCol md={12} className="mt-3">
          <h6>Address</h6>
          <p>
            {viewCustomerData.address?.houseNo || ""},{" "}
            {viewCustomerData.address?.street || ""},{" "}
            {viewCustomerData.address?.landmark || ""},{" "}
            {viewCustomerData.address?.city || ""},{" "}
            {viewCustomerData.address?.state || ""},{" "}
            {viewCustomerData.address?.postalCode || ""},{" "}
            {viewCustomerData.address?.country || ""}
          </p>
        </CCol>
      </CRow>
    ) : (
      <p>No customer data available.</p>
    )}
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => setIsViewModalVisible(false)}>
      Close
    </CButton>
  </CModalFooter>
</CModal>

              {!loading && (
                <div className="d-flex justify-content-end mt-3" style={{ marginRight: '40px' }}>
                  {Array.from(
                    { length: Math.ceil(filteredData.length / rowsPerPage) },
                    (_, index) => (
                      <CButton
                        key={index}
                        style={{
                          backgroundColor:
                            currentPage === index + 1 ? 'var(--color-black)' : '#fff',
                          color: currentPage === index + 1 ? '#fff' : 'var(--color-black)',
                          border: '1px solid #ccc',
                          borderRadius: '5px',
                          cursor: 'pointer',
                        }}
                        className="ms-2"
                        onClick={() => setCurrentPage(index + 1)}
                      >
                        {index + 1}
                      </CButton>
                    ),
                  )}
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
              {/* Title Dropdown */}
              <CCol md={2}>
                <CFormLabel>
                  Title <span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  invalid={!!formErrors.title}
                >
                  <option value="">Select Title</option>
                  {/* Common Personal Titles */}
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Miss">Miss.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Mx.">Mx.</option>

                  {/* Professional Titles */}
                  <option value="Dr.">Dr.</option>
                  <option value="Prof.">Prof.</option>
                  <option value="Rev.">Rev.</option>
                  <option value="Sir">Sir.</option>
                  <option value="Dame">Dame.</option>
                  <option value="Lord">Lord</option>
                  <option value="Lady">Lady</option>

                  {/* Other Titles */}
                  <option value="Capt.">Capt.</option>
                  <option value="Col.">Col.</option>
                  <option value="Gen.">Gen.</option>
                  <option value="Hon.">Hon.</option>
                </CFormSelect>
                {formErrors.title && <div className="text-danger small">{formErrors.title}</div>}
              </CCol>

              {/* First Name */}
              <CCol md={4}>
                <CFormLabel>
                  First Name <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  invalid={!!formErrors.firstName}
                />
                {formErrors.firstName && (
                  <div className="text-danger small">{formErrors.firstName}</div>
                )}
              </CCol>

              {/* Last Name */}
              <CCol md={3}>
                <CFormLabel>Last Name</CFormLabel>
                <CFormInput
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </CCol>
              <CCol md={3}>
                <CFormLabel>
                  Date of Birth <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={(e) => {
                    handleInputChange(e)
                    const dob = new Date(e.target.value)
                    if (!isNaN(dob)) {
                      const diff = Date.now() - dob.getTime()
                      const ageDt = new Date(diff)
                      const age = Math.abs(ageDt.getUTCFullYear() - 1970)
                      setFormData((prev) => ({ ...prev, age: age.toString() }))
                    } else {
                      setFormData((prev) => ({ ...prev, age: '' }))
                    }
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  invalid={!!formErrors.dateOfBirth}
                />
                {formErrors.dateOfBirth && (
                  <div className="text-danger small">{formErrors.dateOfBirth}</div>
                )}
              </CCol>
            </CRow>

            <CRow className="mb-3">
              {/* Age (same row, not downside) */}
              <CCol md={2}>
                <CFormLabel>Age</CFormLabel>
                <CFormInput name="age" value={formData.age || ''} readOnly />
              </CCol>
              <CCol md={4}>
                <CFormLabel>
                  Email <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  invalid={!!formErrors.email}
                />
                {formErrors.email && (
                  <div className="text-danger small">{formErrors.email}</div>
                )}
              </CCol>
              <CCol md={3}>
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
              {/* Gender */}
              <CCol md={3}>
                <CFormLabel>
                  Gender <span className="text-danger">*</span>
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
                  <option value="Others">Others</option>
                </CFormSelect>
                {formErrors.gender && <div className="text-danger small">{formErrors.gender}</div>}
              </CCol>
            </CRow>

            <CRow className="mt-3">
              {/* <h5 className="mb-3">Address</h5> */}
              {/* House No */}
              <CCol md={2}>
                <CFormLabel>
                  House No <span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  value={formData.address?.houseNo || ''}
                  onChange={(e) => handleNestedChange('address', 'houseNo', e.target.value)}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>
                  Postal Code <span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  maxLength={6}
                  value={formData.address?.postalCode || ''}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  placeholder="6-digit PIN"
                />
              </CCol>

              {/* Street */}
              <CCol md={3}>
                <CFormLabel>
                  Street <span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  value={capitalizeWords(formData.address.street)}
                  onChange={(e) => handleNestedChange('address', 'street', e.target.value)}
                />
              </CCol>

              {/* Landmark */}
              <CCol md={3}>
                <CFormLabel>Landmark</CFormLabel>
                <CFormInput
                  type="text"
                  value={capitalizeWords(formData.address.landmark)}
                  onChange={(e) => handleNestedChange('address', 'landmark', e.target.value)}
                />
              </CCol>
            </CRow>
            <CRow>
              {/* City */}
              <CCol md={2}>
                <CFormLabel>
                  City <span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  value={capitalizeWords(formData.address.city)}
                  onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
                />
              </CCol>
              {/* State */}
              <CCol md={4}>
                <CFormLabel>
                  State <span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  value={capitalizeWords(formData.address.state)}
                  onChange={(e) => handleNestedChange('address', 'state', e.target.value)}
                />
                {/* <CFormSelect
                  value={formData.address.state}
                  onChange={(e) => handleNestedChange('address', 'state', e.target.value)}
                > */}
                {/* <option value="">Select State</option>
                  {states.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))} */}
                {/* </CFormSelect> */}
              </CCol>

              {/* Country */}
              <CCol md={3}>
                <CFormLabel>
                  Country <span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  value={capitalizeWords(formData.address.country)}
                  onChange={(e) => handleNestedChange('address', 'country', e.target.value)}
                />
              </CCol>

              {/* Referral Code */}
              <CCol md={3}>
                <CFormLabel>Referral Code</CFormLabel>
                <CFormInput
                  name="referralCode"
                  value={formData.referralCode}
                  onChange={handleInputChange}
                />
                {formErrors.referralCode && <div className="text-danger">{formErrors.referralCode}</div>}
              </CCol>
            </CRow>
            <br />
            <div className="d-flex justify-content-end">
              <CButton color="secondary" className="me-2" onClick={handleCancel}>
                Cancel
              </CButton>
              <CButton
                type="submit"
                color="success"
                style={{ backgroundColor: 'var(--color-black)', color: 'white', border: 'none' }}
              >
                {isEditing ? 'Update' : 'Submit'}
              </CButton>
            </div>
          </CForm>
       {/* ====== VIEW CUSTOMER MODAL ====== */}

        </>
        
      )}
    </>
  )
}

export default React.memo(CustomerManagement)
