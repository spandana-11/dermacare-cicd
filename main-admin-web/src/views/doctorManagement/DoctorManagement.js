import React, { useEffect, useState } from 'react'
import {
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CButton,
  CModal,
  CModalHeader,
  CFormText,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CRow,
  CCol,
  CFormSelect,
  CHeader,
} from '@coreui/react'
import DataTable from 'react-data-table-component'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'

import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
  serviceData,
  CategoryData,
  postServiceData,
  updateServiceData,
  deleteServiceData,
} from './DoctorManagementAPI'
import { left } from '@popperjs/core'

const ServiceManagement = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [service, setService] = useState([])
  const [category, setCategory] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [viewService, setViewService] = useState(null)
  const [editServiceMode, setEditServiceMode] = useState(false)
  const [serviceToEdit, setServiceToEdit] = useState({
    serviceImage: '',
    viewImage: '',
  })

  const [newService, setNewService] = useState({
    categoryName: '',
    categoryId: '',
  })

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [serviceIdToDelete, setServiceIdToDelete] = useState(null)
  const [errors, setErrors] = useState({
    serviceName: '',
    categoryName: '',
    description: '',
    pricing: '',
    status: '',
    includes: '',
    tax: '',
    minTime: '',
    discount: '',
    readyPeriod: '',
    preparation: '',
    viewDescription: '',
    serviceImage: '',
    bannerImage: '',
  })

  const [editErrors, setEditErrors] = useState({})

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const categoryResponse = await CategoryData()
      if (categoryResponse.data && Array.isArray(categoryResponse.data)) {
        const categoryDetails = categoryResponse.data.map((category) => ({
          categoryId: category.categoryId,
          categoryName: category.categoryName,
        }))
        setCategory(categoryResponse.data)
      } else {
        throw new Error('Invalid category data format')
      }

      const serviceResponse = await serviceData()
      console.log(serviceResponse.data)

      // Sorting service data by serviceName alphabetically
      const sortedService = serviceResponse.data.sort((a, b) =>
        a.serviceName.localeCompare(b.serviceName),
      )

      setService(sortedService) // Set sorted service data
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to fetch data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const handleSearch = () => {
      const trimmedQuery = searchQuery.toLowerCase().trim()

      if (!trimmedQuery) {
        setFilteredData([]) // Reset the filtered data if search query is empty
        return
      }

      const filtered = service.filter((item) => {
        const serviceNameMatch = item.serviceName?.toLowerCase().includes(trimmedQuery)
        const categoryNameMatch = item.categoryName?.toLowerCase().includes(trimmedQuery)

        return serviceNameMatch || categoryNameMatch // Show items that match serviceName or categoryName
      })

      setFilteredData(filtered) // Set the filtered data
    }

    handleSearch() // Call the search function whenever searchQuery or service changes
  }, [searchQuery, service])

  const columns = [
    {
      name: 'ServiceName',
      selector: (row) => row.serviceName,
      width: '200px',
    },
    {
      name: 'CategoryName',
      selector: (row) => row.categoryName,
      width: '150px',
    },
    {
      name: 'Description',
      selector: (row) => row.description,
      width: '300px',
    },
    {
      name: 'Pricing',
      selector: (row) => row.pricing,
      width: '150px',
    },
    {
      name: 'Status',
      selector: (row) => row.status,
      width: '150px',
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '230px',
          }}
        >
          <CButton
            color="primary"
            onClick={() => setViewService(row)}
            style={{ marginRight: '5px', width: '80px' }}
          >
            View
          </CButton>
          <CButton
            color="primary"
            onClick={() => handleServiceEdit(row)}
            style={{ marginRight: '5px', width: '80px' }}
          >
            Edit
          </CButton>
          <CButton
            color="danger"
            onClick={() => handleServiceDelete(row.serviceId)}
            style={{ width: '80px' }}
          >
            Delete
          </CButton>

          <ConfirmationModal
            isVisible={isModalVisible}
            message="Are you sure you want to delete this service?"
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
          />
        </div>
      ),
      width: '150px',
      headerStyle: { textAlign: 'center' },
    },
  ]

  const ConfirmationModal = ({ isVisible, message, onConfirm, onCancel }) => {
    return (
      <CModal visible={isVisible} onClose={onCancel}>
        <CHeader style={{ marginLeft: '200px' }}> !Alert</CHeader>
        <CModalBody style={{ textAlign: 'center' }}>{message}</CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={onCancel}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={onConfirm}>
            Confirm
          </CButton>
        </CModalFooter>
      </CModal>
    )
  }

  const validateForm = () => {
    const newErrors = {}

    if (!newService.serviceName) {
      newErrors.serviceName = 'Service name is required.'
    }

    if (!newService.categoryName) {
      newErrors.categoryName = 'Category is required.'
    }

    if (!newService.description) {
      newErrors.description = 'Description is Required.'
    }

    if (!newService.pricing) {
      newErrors.pricing = 'Pricing is required.'
    } else if (isNaN(newService.pricing)) {
      newErrors.pricing = 'Pricing must be a valid number.'
    } else if (parseFloat(newService.pricing) < 0) {
      newErrors.pricing = 'Pricing cannot be a negative number.'
    }

    if (!newService.status) {
      newErrors.status = 'Status is required.'
    }

    if (!newService.includes) {
      newErrors.includes = 'Includes is Required.'
    }

    if (!newService.discount && newService.discount !== 0) {
      newErrors.discount = 'Discount is required.'
    } else if (parseFloat(newService.discount) < 0) {
      newErrors.discount = 'Discount cannot be a negative number.'
    }
    if (!newService.tax && newService.tax !== 0) {
      newErrors.tax = 'tax is required.'
    } else if (parseFloat(newService.tax) < 0) {
      newErrors.tax = 'tax cannot be a negative number.'
    }
    if (!newService.minTime || isNaN(newService.minTime)) {
      newErrors.minTime = 'Minimum time is required and must be a Minutes.'
    } else if (parseFloat(newService.minTime) <= 0) {
      newErrors.minTime = 'Minimum time must be greater than zero.'
    }

    if (!newService.readyPeriod) {
      newErrors.readyPeriod = 'Ready period  is Required.'
    }

    if (!newService.preparation) {
      newErrors.preparation = 'Preparation  is Required.'
    }

    if (!newService.viewDescription) {
      newErrors.viewDescription = 'View description is Required.'
    }

    if (!newService.serviceImage) {
      newErrors.serviceImage = 'Please upload a service image.'
    }

    if (!newService.viewImage) {
      newErrors.bannerImage = 'Please upload a banner image.'
    }

    if (!newService.categoryId) {
      newErrors.categoryId = 'Please select a valid category.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  const handleAddService = async () => {
    if (!validateForm()) return
    setModalVisible(false)

    try {
      const payload = {
        serviceName: newService.serviceName,
        categoryName: newService.categoryName,
        categoryId: newService.categoryId,
        description: newService.description,
        pricing: newService.pricing,
        discount: newService.discount,
        tax: newService.tax,
        minTime: newService.minTime,
        status: newService.status,
        includes: newService.includes,
        readyPeriod: newService.readyPeriod,
        preparation: newService.preparation,
        serviceImage: newService.serviceImage,
        viewImage: newService.viewImage,
        viewDescription: newService.viewDescription,
      }

      const response = await postServiceData(payload)

      if (response.status === 200) {
        toast.success('Service Added successfully!', { position: 'top-right' })
        fetchData()
      } else if (response.status === 500) {
        toast.error(error.response?.data?.message, { position: 'top-right' })
      }
    } catch (error) {
      console.error('Error response:', error.response)
    }

    setNewService({
      serviceName: '',
      categoryName: '',
      description: '',
      pricing: '',
      discount: 0,
      minTime: '',
      tax: 0,
      status: '',
      includes: '',
      readyPeriod: '',
      preparation: '',
      serviceImage: '',
      viewImage: '',
      viewDescription: '',
      categoryId: '',
    })
  }

  const generateTimeOptions = () => {
    const times = []
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hour = h.toString().padStart(2, '0')
        const minute = m.toString().padStart(2, '0')
        times.push(`${hour}:${minute}`)
      }
    }
    return times
  }

  const handleServiceEdit = (service) => {
    setServiceToEdit(service)
    setEditServiceMode(true)
  }

  const handleServiceFileChange = (e) => {
    const file = e.target.files[0]

    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        let base64String = reader.result
        if (base64String) {
          base64String = base64String.split(',')[1]
        }

        setNewService((prevService) => ({
          ...prevService,
          serviceImage: base64String,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBannerFileChange = (e) => {
    const file = e.target.files[0]

    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        let base64String = reader.result
        if (base64String) {
          base64String = base64String.split(',')[1]
        }

        setNewService((prevService) => ({
          ...prevService,
          viewImage: base64String,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const validateEditForm = () => {
    const newErrors = {}

    if (!serviceToEdit.serviceName?.trim()) newErrors.serviceName = 'Service name is required.'
    if (!serviceToEdit.description?.trim()) newErrors.description = 'Description is required.'
    if (!serviceToEdit.pricing || isNaN(serviceToEdit.pricing) || serviceToEdit.pricing <= 0) {
      newErrors.pricing = 'Pricing must be a valid positive number.'
    }
    if (!serviceToEdit.discount || isNaN(serviceToEdit.discount) || serviceToEdit.discount < 0) {
      newErrors.discount = 'Discount must be a valid number (0 or more).'
    }
    if (!serviceToEdit.tax || isNaN(serviceToEdit.tax) || serviceToEdit.tax < 0) {
      newErrors.tax = 'Tax must be a valid number (0 or more).'
    }
    if (!serviceToEdit.minTime?.trim()) newErrors.minTime = 'Minimum time is required.'
    if (!serviceToEdit.includes?.trim()) newErrors.includes = 'Includes field is required.'
    if (!serviceToEdit.preparation?.trim()) newErrors.preparation = 'Preparation field is required.'
    if (!serviceToEdit.readyPeriod?.trim()) newErrors.readyPeriod = 'Readiness period is required.'
    if (!serviceToEdit.viewDescription?.trim())
      newErrors.viewDescription = 'View description is required.'

    setEditErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleUpdateService = async () => {
    if (!validateEditForm()) {
      return
    }

    try {
      const updatedService = {
        ...serviceToEdit,
        serviceImage: serviceToEdit.serviceImage,
        viewImage: serviceToEdit.viewImage,
      }

      console.log('Updating service with ID:', serviceToEdit.serviceId)

      const updatedResponse = await updateServiceData(serviceToEdit.serviceId, updatedService)

      console.log('Updated service:', updatedResponse)

      setEditServiceMode(false)
      toast.success('Service Updated successfully!', { position: 'top-right' })

      fetchData()
    } catch (error) {
      console.error('Error updating service:', error)
      toast.error(error.message, { position: 'top-right' })
    }
  }

  const handleEditServiceFileChange = (e) => {
    const file = e.target.files[0]

    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        let base64String = reader.result
        if (base64String) {
          base64String = base64String.split(',')[1]
        }

        setNewService((prevService) => ({
          ...prevService,
          serviceImage: base64String,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditBannerFileChange = (e) => {
    const file = e.target.files[0]

    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        let base64String = reader.result
        if (base64String) {
          base64String = base64String.split(',')[1]
        }

        setNewService((prevService) => ({
          ...prevService,
          viewImage: base64String,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleServiceDelete = async (serviceId) => {
    setServiceIdToDelete(serviceId)
    setIsModalVisible(true)
  }

  const handleConfirmDelete = async () => {
    try {
      const result = await deleteServiceData(serviceIdToDelete)
      console.log('Service deleted:', result)
      toast.success('Service deleted successfully!', { position: 'top-right' })

      fetchData()
    } catch (error) {
      console.error('Error deleting service:', error)
    }
    setIsModalVisible(false)
  }

  const handleCancelDelete = () => {
    setIsModalVisible(false)
    console.log('Service deletion canceled')
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name === 'categoryName') {
      const selectedCategory = category.find((cat) => cat.categoryName === value)
      setNewService((prevState) => ({
        ...prevState,
        [name]: value,
        categoryId: selectedCategory ? selectedCategory.categoryId : '',
      }))
    } else {
      setNewService((prevState) => ({
        ...prevState,
        [name]: value,
      }))
    }
    setErrors({
      ...errors,
      [name]: '',
    })
  }

  const AddCancel = () => {
    setNewService({
      serviceName: '',
      categoryName: '',
      description: '',
      pricing: '',
      discount: 0,
      tax: 0,
      minTime: '',
      status: '',
      includes: '',
      readyPeriod: '',
      preparation: '',
      serviceImage: '',
      viewImage: '',
      viewDescription: '',
      categoryId: '',
    })
    setModalVisible(false)

    setErrors({})
  }

  return (
    <div style={{ overflow: 'hidden' }}>
      <ToastContainer />

      <div>
        <CForm className="d-flex justify-content-between mb-3">
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginLeft: '40px' }}>
            <CInputGroup className="mb-3" style={{ width: '350px' }}>
              <CFormInput
                type="text"
                placeholder="Search by CategoryName, ServiceName"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ height: '40px' }}
              />
              <CInputGroupText style={{ height: '40px' }}>
                <CIcon icon={cilSearch} />
              </CInputGroupText>
            </CInputGroup>
          </div>

          <CButton
            color="primary"
            style={{ height: '40px', marginRight: '100px' }}
            onClick={() => setModalVisible(true)}
          >
            Add Service
          </CButton>
        </CForm>
      </div>

      {viewService && (
        <CModal visible={!!viewService} onClose={() => setViewService(null)} size="lg">
          <CModalHeader>
            <CModalTitle style={{ textAlign: 'center', width: '100%' }}>
              Service Details
            </CModalTitle>
          </CModalHeader>
          <CModalBody >
            <CRow className="mb-2">
              <CCol sm={4}>
                <strong>Service Name :</strong>
              </CCol>
              <CCol sm={8}>{viewService.serviceName}</CCol>
            </CRow>

            <CRow className="mb-2">
              <CCol sm={4}>
                <strong>Category Name :</strong>
              </CCol>
              <CCol sm={8}>{viewService.categoryName}</CCol>
            </CRow>

            <CRow className="mb-2">
              <CCol sm={4}>
                <strong>Description :</strong>
              </CCol>
              <CCol sm={8}>{viewService.description}</CCol>
            </CRow>

            <CRow className="mb-2">
              <CCol sm={4}>
                <strong>Pricing :</strong>
              </CCol>
              <CCol sm={8}>{viewService.pricing}</CCol>
            </CRow>

            <CRow className="mb-2">
              <CCol sm={4}>
                <strong>Discount %:</strong>
              </CCol>
              <CCol sm={8}>{viewService.discount} </CCol>
            </CRow>

            <CRow className="mb-2">
              <CCol sm={4}>
                <strong>Discount Cost :</strong>
              </CCol>
              <CCol sm={8}>{viewService.discountCost}</CCol>
            </CRow>
            <CRow className="mb-2">
              <CCol sm={4}>
                <strong>Discounted Cost :</strong>
              </CCol>
              <CCol sm={8}>{viewService.discountedCost}</CCol>
            </CRow>
            <CRow className="mb-2">
              <CCol sm={4}>
                <strong>Tax % :</strong>
              </CCol>
              <CCol sm={8}>{viewService.tax}</CCol>
            </CRow>

            <CRow className="mb-2">
              <CCol sm={4}>
                <strong>Tax Amount :</strong>
              </CCol>
              <CCol sm={8}>{viewService.taxAmount}</CCol>
            </CRow>

            <CRow className="mb-2">
              <CCol sm={4}>
                <strong>Final Cost :</strong>
              </CCol>
              <CCol sm={8}>{viewService.finalCost}</CCol>
            </CRow>

            <CRow className="mb-2">
              <CCol sm={4}>
                <strong>Includes :</strong>
              </CCol>
              <CCol sm={8}>{viewService.includes}</CCol>
            </CRow>

            <CRow className="mb-2">
              <CCol sm={4}>
                <strong>Readiness Period :</strong>
              </CCol>
              <CCol sm={8}>{viewService.readyPeriod}</CCol>
            </CRow>

            <CRow className="mb-2">
              <CCol sm={4}>
                <strong>MinTime :</strong>
              </CCol>
              <CCol sm={8}>{viewService.minTime}</CCol>
            </CRow>

            <CRow className="mb-2">
              <CCol sm={4}>
                <strong>Status :</strong>
              </CCol>
              <CCol sm={8}>{viewService.status}</CCol>
            </CRow>

            {/* Service Image */}
            <CRow className="mb-2">
              <CCol sm={4}>
                <strong>Service Image :</strong>
              </CCol>
              <CCol sm={8}>
                {viewService.serviceImage ? (
                  <img
                    src={`data:image/png;base64,${viewService.serviceImage}`}
                    alt="Service"
                    style={{ width: '150px', height: 'auto' }}
                  />
                ) : (
                  <span>No service image available</span>
                )}
              </CCol>
            </CRow>

            {/* Banner Image */}
            <CRow className="mb-2">
              <CCol sm={4}>
                <strong>Banner Image :</strong>
              </CCol>
              <CCol sm={8}>
                {viewService.viewImage ? (
                  <img
                    src={`data:image/png;base64,${viewService.viewImage}`}
                    alt="Banner"
                    style={{ width: '150px', height: 'auto' }}
                  />
                ) : (
                  <span>No banner image available</span>
                )}
              </CCol>
            </CRow>

            {/* View Description */}
            <CRow className="mb-2">
              <CCol sm={4}>
                <strong>View Description :</strong>
              </CCol>
              <CCol sm={8}>{viewService.viewDescription}</CCol>
            </CRow>
          </CModalBody>
          <CModalFooter></CModalFooter>
        </CModal>
      )}

      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle style={{ textAlign: 'center', width: '100%' }}>Add New Service</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow className="mb-4">
              <CCol md={6}>
                <h6>
                  Service Name <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="text"
                  placeholder="Service Name"
                  value={newService.serviceName || ''}
                  name="serviceName"
                  onChange={handleChange}
                />
                {errors.serviceName && (
                  <CFormText className="text-danger">{errors.serviceName}</CFormText>
                )}
              </CCol>
              <CCol md={6}>
                <h6>
                  Category Name <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormSelect
                  value={newService.categoryName || ''}
                  onChange={handleChange}
                  aria-label="Select Category"
                  name="categoryName"
                >
                  <option value="">Select a Category</option>
                  {category?.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryName}>
                      {cat.categoryName}
                    </option>
                  ))}
                </CFormSelect>
                {errors.categoryName && (
                  <CFormText className="text-danger">{errors.categoryName}</CFormText>
                )}
              </CCol>
            </CRow>

            <CRow className="mb-4">
              <CCol md={6}>
                <h6>
                  Description <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="text"
                  placeholder="Description"
                  value={newService.description || ''}
                  name="description"
                  onChange={handleChange}
                  maxLength={100}
                />
                {errors.description && (
                  <CFormText className="text-danger">{errors.description}</CFormText>
                )}
              </CCol>

              <CCol md={6}>
                <h6>
                  Status <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormSelect value={newService.status || ''} onChange={handleChange} name="status">
                  <option value="">Select</option>
                  <option value="Active">Active</option>
                </CFormSelect>
                {errors.status && <CFormText className="text-danger">{errors.status}</CFormText>}
              </CCol>
            </CRow>
            <CRow className="mb-4">
              <CCol md={6}>
                <h6>
                  Pricing <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="number"
                  placeholder="Pricing"
                  value={newService.pricing || ''}
                  name="pricing"
                  onChange={handleChange}
                  min={1}
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === 'e') e.preventDefault()
                  }}
                />
                {errors.pricing && <CFormText className="text-danger">{errors.pricing}</CFormText>}
              </CCol>

              <CCol md={6}>
                <h6>
                  Discount % <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="number"
                  placeholder="Discount"
                  value={newService.discount || ''}
                  name="discount"
                  onChange={handleChange}
                  min={1}
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === 'e') e.preventDefault()
                  }}
                />
                {errors.discount && (
                  <CFormText className="text-danger">{errors.discount}</CFormText>
                )}
              </CCol>
            </CRow>

            <CRow className="mb-4">
              <CCol md={6}>
                <h6>
                  Tax % <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="number"
                  placeholder="tax"
                  value={newService.tax || ''}
                  name="tax"
                  onChange={handleChange}
                  min={1}
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === 'e') e.preventDefault()
                  }}
                />
                {errors.tax && <CFormText className="text-danger">{errors.tax}</CFormText>}
              </CCol>
              <CCol>
                <div>
                  <h6>
                    Min Time <span style={{ color: 'red' }}>*</span>
                  </h6>{' '}
                  <CFormInput
                    type="number"
                    name="minTime"
                    value={newService.minTime || ''}
                    onChange={(e) => setNewService({ ...newService, minTime: e.target.value })}
                    placeholder="Must be in Minutes"
                  />
                  {errors.minTime && (
                    <CFormText className="text-danger">{errors.minTime}</CFormText>
                  )}
                </div>
              </CCol>
            </CRow>

            <CRow className="mb-4">
              <CCol md={6}>
                <h6>
                  Includes <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="text"
                  placeholder="Includes"
                  value={newService.includes || ''}
                  name="includes"
                  onChange={handleChange}
                  maxLength={100}
                />
                {errors.includes && (
                  <CFormText className="text-danger">{errors.includes}</CFormText>
                )}
              </CCol>
              <CCol md={6}>
                <h6>
                  Preparation <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="text"
                  placeholder="Preparation"
                  value={newService.preparation || ''}
                  name="preparation"
                  onChange={handleChange}
                  maxLength={100}
                />
                {errors.preparation && (
                  <CFormText className="text-danger">{errors.preparation}</CFormText>
                )}
              </CCol>
            </CRow>

            <CRow className="mb-4">
              <CCol md={6}>
                <h6>
                  Ready Period <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="text"
                  placeholder="Ready Period"
                  value={newService.readyPeriod || ''}
                  name="readyPeriod"
                  onChange={handleChange}
                  maxLength={100}
                />
                {errors.readyPeriod && (
                  <CFormText className="text-danger">{errors.readyPeriod}</CFormText>
                )}
              </CCol>
              <CCol md={6}>
                <h6>
                  View Description <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="text"
                  placeholder="View Description"
                  value={newService.viewDescription || ''}
                  name="viewDescription"
                  onChange={handleChange}
                  maxLength={100}
                />
                {errors.viewDescription && (
                  <CFormText className="text-danger">{errors.viewDescription}</CFormText>
                )}
              </CCol>
            </CRow>

            <CRow className="mb-4">
              <CCol md={6}>
                <h6>
                  Service Image <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput type="file" onChange={handleServiceFileChange} />
                {errors.serviceImage && (
                  <CFormText className="text-danger">{errors.serviceImage}</CFormText>
                )}
              </CCol>
              <CCol md={6}>
                <h6>
                  Banner Image <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput type="file" onChange={handleBannerFileChange} />
                {errors.bannerImage && (
                  <CFormText className="text-danger">{errors.bannerImage}</CFormText>
                )}
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleAddService}>
            Add
          </CButton>
          <CButton color="secondary" onClick={AddCancel}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={editServiceMode} onClose={() => setEditServiceMode(false)} size="lg">
        <CModalHeader>
          <CModalTitle style={{ textAlign: 'center', width: '100%' }}>Edit Service</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow className="mb-4">
              <CCol md={6}>
                <h6>
                  Service Name <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="text"
                  placeholder="Service Name"
                  value={serviceToEdit?.serviceName || ''}
                  onChange={(e) =>
                    setServiceToEdit({ ...serviceToEdit, serviceName: e.target.value })
                  }
                />
                {editErrors.serviceName && (
                  <CFormText className="text-danger">{editErrors.serviceName}</CFormText>
                )}
              </CCol>
              <CCol md={6}>
                <h6>
                  Category Name <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="text"
                  placeholder="Category Name"
                  value={serviceToEdit?.categoryName || ''}
                  disabled
                />
              </CCol>
            </CRow>

            <CRow className="mb-4">
              <CCol md={6}>
                <h6>
                  Description <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="text"
                  placeholder="Description"
                  value={serviceToEdit?.description || ''}
                  onChange={(e) =>
                    setServiceToEdit({ ...serviceToEdit, description: e.target.value })
                  }
                />
                {editErrors.description && (
                  <CFormText className="text-danger">{editErrors.description}</CFormText>
                )}
              </CCol>
              <CCol md={6}>
                <h6>
                  Status <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormSelect
                  aria-label="Status"
                  value={serviceToEdit?.status || ''}
                  onChange={(e) => setServiceToEdit({ ...serviceToEdit, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                </CFormSelect>
              </CCol>
            </CRow>

            <CRow className="mb-4">
              <CCol md={6}>
                <h6>
                  Pricing <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="number"
                  placeholder="Pricing"
                  value={serviceToEdit?.pricing || ''}
                  onChange={(e) => setServiceToEdit({ ...serviceToEdit, pricing: e.target.value })}
                />
                {editErrors.pricing && (
                  <CFormText className="text-danger">{editErrors.pricing}</CFormText>
                )}
              </CCol>
              <CCol md={6}>
                <h6>
                  Discount % <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="number"
                  placeholder="Discount"
                  value={serviceToEdit?.discount || ''}
                  onChange={(e) => setServiceToEdit({ ...serviceToEdit, discount: e.target.value })}
                />
                {editErrors.discount && (
                  <CFormText className="text-danger">{editErrors.discount}</CFormText>
                )}
              </CCol>
            </CRow>

            <CRow className="mb-4">
              <CCol md={6}>
                <h6>
                  Tax % <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="number"
                  placeholder="Tax"
                  value={serviceToEdit?.tax || ''}
                  onChange={(e) => setServiceToEdit({ ...serviceToEdit, tax: e.target.value })}
                />
                {editErrors.tax && <CFormText className="text-danger">{editErrors.tax}</CFormText>}
              </CCol>
              <CCol md={6}>
                <h6>
                  Min Time <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="text"
                  placeholder="Minimum Time"
                  value={serviceToEdit?.minTime || ''}
                  onChange={(e) => setServiceToEdit({ ...serviceToEdit, minTime: e.target.value })}
                />
                {editErrors.minTime && (
                  <CFormText className="text-danger">{editErrors.minTime}</CFormText>
                )}
              </CCol>
            </CRow>

            {/* Additional Fields */}
            <CRow className="mb-4">
              <CCol md={6}>
                <h6>
                  Includes <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="text"
                  placeholder="Includes"
                  value={serviceToEdit?.includes || ''}
                  onChange={(e) => setServiceToEdit({ ...serviceToEdit, includes: e.target.value })}
                />
                {editErrors.includes && (
                  <CFormText className="text-danger">{editErrors.includes}</CFormText>
                )}
              </CCol>
              <CCol md={6}>
                <h6>
                  Preparation <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="text"
                  placeholder="Preparation"
                  value={serviceToEdit?.preparation || ''}
                  onChange={(e) =>
                    setServiceToEdit({ ...serviceToEdit, preparation: e.target.value })
                  }
                />
                {editErrors.preparation && (
                  <CFormText className="text-danger">{editErrors.preparation}</CFormText>
                )}
              </CCol>
            </CRow>

            <CRow className="mb-4">
              <CCol md={6}>
                <h6>
                  Readiness Period <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="text"
                  placeholder="Readiness Period"
                  value={serviceToEdit?.readyPeriod || ''}
                  onChange={(e) =>
                    setServiceToEdit({ ...serviceToEdit, readyPeriod: e.target.value })
                  }
                />
                {editErrors.readyPeriod && (
                  <CFormText className="text-danger">{editErrors.readyPeriod}</CFormText>
                )}
              </CCol>
              <CCol md={6}>
                <h6>
                  View Description <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="text"
                  placeholder="View Description"
                  value={serviceToEdit?.viewDescription || ''}
                  onChange={(e) =>
                    setServiceToEdit({ ...serviceToEdit, viewDescription: e.target.value })
                  }
                />
                {editErrors.viewDescription && (
                  <CFormText className="text-danger">{editErrors.viewDescription}</CFormText>
                )}
              </CCol>
            </CRow>

            {/* File Upload */}
            <CRow className="mb-4">
              <CCol md={6}>
                <h6>
                  Service Image <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput type="file" onChange={handleEditServiceFileChange} />
              </CCol>
              <CCol md={6}>
                <h6>
                  Banner Image <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput type="file" onChange={handleEditBannerFileChange} />
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleUpdateService}>
            Update
          </CButton>
          <CButton color="secondary" onClick={() => setEditServiceMode(false)}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>

      {loading ? (
        <div
          style={{ display: 'flex', justifyContent: 'center', height: '300px', fontSize: '1.5rem' }}
        >
          Loading...
        </div>
      ) : error ? (
        <div
          style={{ display: 'flex', justifyContent: 'center', height: '300px', fontSize: '1.5rem' }}
        >
          {error}
        </div>
      ) : (
        <>
          {filteredData.length > 0 ? (
            <DataTable
              columns={columns}
              data={filteredData.sort((a, b) => a.serviceName.localeCompare(b.serviceName))} // Sort filtered data alphabetically
              pagination
              highlightOnHover
              pointerOnHover
            />
          ) : searchQuery ? (
            <div style={{ textAlign: 'center', fontSize: '20px', color: 'gray ' }}>
              No Data found
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={service.sort((a, b) => a.serviceName.localeCompare(b.serviceName))} // Sort service data alphabetically
              pagination
              highlightOnHover
              pointerOnHover
            />
          )}
        </>
      )}
    </div>
  )
}

export default ServiceManagement
