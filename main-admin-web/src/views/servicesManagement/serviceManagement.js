import React, { useState, useEffect } from 'react'
import {
  CButton,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CRow,
  CCol,
  CFormSelect,
  CHeader,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'
import DataTable from 'react-data-table-component'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { getAllServices, postServiceData, updateServiceData, deleteServiceData } from './ServiceAPI'
import { CategoryData } from '../categoryManagement/CategoryAPI'
import Select from 'react-select'
import '../../Utils/CreateTheme'
import { ConfirmationModal } from '../../Utils/ConfirmationDelete'
const ServiceManagement = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [service, setService] = useState([])
  const [categories, setCategories] = useState([])

  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [viewService, setViewService] = useState(null)
  const [editServiceMode, setEditServiceMode] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [serviceIdToDelete, setServiceIdToDelete] = useState(null)
  const [categoryIdToDelete, setCategoryIdToDelete] = useState(null)
  const [isCategoryDisabled, setIsCategoryDisabled] = useState(false)
  const [errors, setErrors] = useState({
    serviceName: '',
    categoryId: '',
    categoryName: '',
    description: '',
    ServiceImage: '',
  })

  const [newService, setNewService] = useState({
    serviceName: '',
    categoryId: '',
    categoryName: '',
    description: '',
    serviceImage: null,
  })

  const [updatedService, setUpdatedService] = useState({
    ServiceId: '',
    ServiceName: '',
    categoryId: '',
    categoryName: '',
    description: '',
    ServiceImage: null,
  })

  const fetchData = async () => {
    setLoading(true)
    console.log('fetchData')

    try {
      const servicesResponse = await getAllServices()
      if (!servicesResponse || !servicesResponse.data) {
        throw new Error('Invalid services response')
      }

      const categoriesResponse = await CategoryData()
      if (!categoriesResponse || !categoriesResponse.data) {
        throw new Error('Invalid categories response')
      }

      setService(servicesResponse.data.data) // ← if data is wrapped
      setCategories(categoriesResponse.data)
      console.log(categoriesResponse.data)
    } catch (error) {
      console.error('Fetch error:', error)
      setError('Failed to fetch data')
      toast.error('Error loading data')
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
        setFilteredData(service)
        return
      }
      const filtered = service.filter((services) => {
        const serviceNameMatch = services.serviceName.toLowerCase().startsWith(trimmedQuery)
        const categoryMatch = services.categoryName?.toLowerCase().startsWith(trimmedQuery)

        return serviceNameMatch || categoryMatch
      })
      setFilteredData(filtered)
    }

    handleSearch()
  }, [searchQuery, service])

  const handleFileChange = (e) => {
    const file = e.target.files[0]

    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result

        // Strip the MIME prefix to get just the raw Base64 string
        const cleanedBase64 = base64String.split(',')[1] // Removes "data:image/jpeg;base64,"

        // Update the state with the cleaned Base64 string
        setNewService((prev) => ({
          ...prev,
          serviceImage: cleanedBase64,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  // const handleServiceChange = (e) => {
  //   const { name, value } = e.target;

  //   setNewService((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };
  const categoryOptions =
    categories?.map((cat) => ({
      value: cat.categoryId,
      label: cat.categoryName,
    })) || []

  const handleServiceChange = (e) => {
    const { name, value } = e.target

    if (name === 'categoryId') {
      const selectedCategory = categories.find((cat) => cat.categoryId === value)

      setNewService((prev) => ({
        ...prev,
        categoryId: value,
        categoryName: selectedCategory?.categoryName || '',
      }))
    } else {
      setNewService((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    console.log('Validating form with data:', newService)

    if (!newService.serviceName?.trim()) {
      newErrors.serviceName = 'Service name is required'
      console.log('Validation error: serviceName is missing')
    }

    if (!newService.description?.trim()) {
      newErrors.description = 'Description is required'
      console.log('Validation error: description is missing')
    }

    if (!newService.serviceImage) {
      newErrors.serviceImage = 'Service image is required'
      console.log('Validation error: serviceImage is missing')
    }

    setErrors(newErrors)
    console.log('Errors after validation:', newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleAddService = async () => {
    if (!validateForm()) {
      return
    }

    const newName = (newService.serviceName || '').trim().toLowerCase()
    const duplicate = service.some((s) => (s.serviceName || '').trim().toLowerCase() === newName)

    if (duplicate) {
      toast.error('Service already exists!')
      setModalVisible(false) // 👈 closes modal immediately
      return
    }

    try {
      const payload = {
        ...newService,
        serviceName: newService.serviceName.trim(),
      }
      await postServiceData(payload)
      toast.success('Service added successfully!')
      setModalVisible(false) // 👈 closes modal immediately
      setNewService({
        serviceName: '',
        categoryId: '',
        categoryName: '',
        description: '',
        serviceImage: null,
      })
      await fetchData()
    } catch (error) {
      console.error('Failed to add service:', error)
      toast.error('Failed to add service')
    }
  }

  const [serviceToEdit, setServiceToEdit] = useState(null)
  const handleServiceEdit = (service) => {
    console.log(service)
    setServiceToEdit(service)
    setUpdatedService({
      ServiceId: service.serviceId,
      ServiceName: service.serviceName,
      categoryId: service.categoryId || '',
      categoryName: service.categoryName || '',
      description: service.description || '',
      ServiceImage: service.serviceImage, // Will upload new one if needed
    })
    setEditServiceMode(true)
  }

  const handleUpdateService = async () => {
    try {
      // Normalize the name
      const newName = (updatedService.ServiceName || '').trim().toLowerCase()

      // Check duplicates (exclude current editing service)
      const duplicate = service.some(
        (s) =>
          (s.serviceName || '').trim().toLowerCase() === newName &&
          s.serviceId !== updatedService.ServiceId,
      )

      if (duplicate) {
        toast.error('Service with this name already exists!')
        return // stop update
      }

      let imageBase64 = updatedService.ServiceImage

      // Convert file to base64 if new image file is selected
      if (updatedService.ServiceImage && updatedService.ServiceImage instanceof File) {
        imageBase64 = await toBase64(updatedService.ServiceImage)
      }

      const payload = {
        serviceId: updatedService.ServiceId,
        serviceName: updatedService.ServiceName.trim(),
        categoryId: updatedService.categoryId,
        description: updatedService.description,
        serviceImage: imageBase64?.includes('base64,') ? imageBase64.split(',')[1] : imageBase64,
      }

      console.log('Update Payload:', payload)

      await updateServiceData(payload, updatedService.ServiceId)
      toast.success('Service updated successfully!')
      setEditServiceMode(false)
      await fetchData()
    } catch (error) {
      console.error(error)
      toast.error('Failed to update service')
    }
  }

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })

  // const handleDeleteService = (serviceId) => {
  //   setServiceIdToDelete(serviceId)
  //   setIsModalVisible(true)
  // }

  const handleConfirmDelete = async () => {
    // const confirm = window.confirm('Are you sure you want to delete this service?')
    if (!confirm) return
    console.log(serviceIdToDelete)
    try {
      const data = await deleteServiceData(serviceIdToDelete)
      toast.success(`${data.data || 'Service deleted successfully!'}`)
      setIsModalVisible(false)
      await fetchData()
    } catch (error) {
      toast.error('Failed to delete service')
    }
  }

  const columns = [
    {
      name: (
        <div
          style={{
            fontSize: '16px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          S.No
        </div>
      ),
      selector: (row, index) => index + 1,
      sortable: true,
      width: '7%',
    },
    {
      name: (
        <div
          style={{
            fontSize: '16px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          Service Name
        </div>
      ),
      selector: (row) => row.serviceName,
      sortable: true,
      width: '20%',
      cell: (row) => <div style={{ textAlign: 'start', fontSize: '16px' }}>{row.serviceName}</div>,
      headerStyle: { textAlign: 'center' },
    },
    {
      name: (
        <div
          style={{
            fontSize: '16px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          Category
        </div>
      ),
      selector: (row) => row.categoryName,
      sortable: true,
      width: '20%',
      cell: (row) => <div style={{ textAlign: 'start', fontSize: '16px' }}>{row.categoryName}</div>,
      headerStyle: { textAlign: 'center' },
    },
    {
      name: (
        <div
          style={{
            fontSize: '16px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          Description
        </div>
      ),
      selector: (row) => row.description,
      sortable: true,
      width: '25%',
      cell: (row) => (
        <div
          style={{
            textAlign: 'start',
            fontSize: '16px',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            WebkitLineClamp: 2, // 👈 limits to 2 lines
            lineHeight: '1.4em',
            maxHeight: '2.8em', // line-height × 2
          }}
          title={row.description} // optional: show full text on hover
        >
          {row.description}
        </div>
      ),
      headerStyle: { textAlign: 'center' },
    },
    {
      name: (
        <div
          style={{
            fontSize: '16px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          Actions
        </div>
      ),
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
            className="text-primary p-0"
            onClick={() => setViewService(row)}
            style={{ marginRight: '10px', width: '80px' }}
          >
            View
          </CButton>

          <CButton
            color="link"
            className="text-success p-0"
            onClick={() => handleServiceEdit(row)}
            style={{ marginRight: '10px', width: '80px' }}
          >
            Edit
          </CButton>

          <CButton
            color="link"
            className="text-danger p-0"
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

  const handleServiceDelete = (serviceId) => {
    setServiceIdToDelete(serviceId)
    setIsModalVisible(true)
  }

  const handleCancelDelete = () => {
    setIsModalVisible(false)
  }
  return (
    <div className="container-fluid p-4">
      <ToastContainer />

      <CForm className="d-flex justify-content-between mb-3">
        <CInputGroup style={{ width: '50%' }}>
          <CFormInput
            placeholder="Search by Service Name and Category Name...."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <CInputGroupText>
            <CIcon icon={cilSearch} />
          </CInputGroupText>
        </CInputGroup>

        <CButton color="primary" onClick={() => setModalVisible(true)}>
          Add Service
        </CButton>
      </CForm>

      <DataTable
        columns={columns}
        data={filteredData}
        pagination
        progressPending={loading}
        noDataComponent={error || 'No services found'}
        // theme="darkCustom" // ✅ apply the dark theme here
      />

      {/* Add Service Modal */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Add New Service</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <label className="form-label">
              Category <span style={{ color: 'red' }}>*</span>
            </label>
            <Select
              name="categoryId"
              options={categoryOptions}
              value={categoryOptions.find((opt) => opt.value === newService.categoryId) || null}
              onChange={(selectedOption) =>
                handleServiceChange({
                  target: {
                    name: 'categoryId',
                    value: selectedOption ? selectedOption.value : '',
                  },
                })
              }
              placeholder="Search or select a category"
              isClearable
              className={errors.categoryId ? 'is-invalid' : ''}
            />
            {errors.categoryId && (
              <div className="invalid-feedback d-block">{errors.categoryId}</div>
            )}
          </div>

          {/* <select
  name="categoryId"
  value={newService.categoryId}
  onChange={handleServiceChange}
  className="form-select mb-3"
>
  <option value="">Select Category</option>
  {(categories || []).map((cat) => (
    <option key={cat.id} value={cat.id}>
      {cat.name}
    </option>
  ))}
</select> */}

          <CFormInput
            type="text"
            name="serviceName" // fix casing
            label="Service Name"
            value={newService.serviceName} // fix casing
            onChange={handleServiceChange}
            error={errors.serviceName} // fix casing
            className="mb-3"
          />

          <CFormInput
            type="text"
            name="description"
            label="Description"
            value={newService.description}
            onChange={handleServiceChange}
            className="mb-3"
            feedbackInvalid={errors.description}
          />

          <CFormInput
            type="file"
            name="ServiceImage"
            label="Service Image"
            onChange={handleFileChange}
            error={errors.ServiceImage}
            accept="image/*"
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleAddService}>
            Add Service
          </CButton>
        </CModalFooter>
      </CModal>

      {/* View Service Modal */}
      <CModal visible={!!viewService} onClose={() => setViewService(null)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Service Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow className="mb-3">
            <CCol sm={4}>
              <strong>Category Id:</strong>
            </CCol>
            <CCol sm={8}>{viewService?.categoryId}</CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol sm={4}>
              <strong>Category Name:</strong>
            </CCol>
            <CCol sm={8}>{viewService?.categoryName}</CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol sm={4}>
              <strong>Service Name:</strong>
            </CCol>
            <CCol sm={8}>{viewService?.serviceName}</CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol sm={4}>
              <strong>Description:</strong>
            </CCol>
            <CCol sm={8}>{viewService?.description}</CCol>
          </CRow>
          <CRow>
            <CCol sm={4}>
              <strong>Service Image:</strong>
            </CCol>
            <CCol sm={8}>
              {viewService?.serviceImage && (
                <img
                  src={`data:image/png;base64,${viewService?.serviceImage}`}
                  alt="Service"
                  style={{ maxWidth: '200px' }}
                />
              )}
            </CCol>
          </CRow>
        </CModalBody>
      </CModal>

      <CModal visible={editServiceMode} onClose={() => setEditServiceMode(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Edit Service</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              label="Service Name"
              value={updatedService.ServiceName}
              onChange={(e) =>
                setUpdatedService({ ...updatedService, ServiceName: e.target.value })
              }
            />
            <CFormInput
              label="Description"
              value={updatedService.description}
              onChange={(e) =>
                setUpdatedService({ ...updatedService, description: e.target.value })
              }
            />

            <CFormSelect
              label="Category"
              value={updatedService.categoryId}
              disabled={true} // or a state variable like isCategoryDisabled
              onChange={(e) =>
                setUpdatedService({
                  ...updatedService,
                  categoryId: e.target.value,
                })
              }
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.categoryName}
                </option>
              ))}
            </CFormSelect>
            <h6>
              Service Image <span style={{ color: 'red' }}>*</span>
            </h6>

            {/* Image file input for new selection */}
            <CFormInput
              type="file"
              accept="image/*"
              onChange={(e) =>
                setUpdatedService({
                  ...updatedService,
                  ServiceImage: e.target.files[0],
                  existingImageName: e.target.files[0]?.name || updatedService.existingImageName,
                })
              }
            />

            {updatedService?.ServiceImage ? (
              // Show preview for base64 or direct URL
              <img
                src={
                  typeof updatedService.ServiceImage === 'string'
                    ? updatedService.ServiceImage.startsWith('data:image')
                      ? updatedService.ServiceImage
                      : `data:image/png;base64,${updatedService.ServiceImage}`
                    : URL.createObjectURL(updatedService.ServiceImage)
                }
                alt="Service"
                style={{ width: '200px', height: 'auto', marginTop: '10px' }}
              />
            ) : (
              <span style={{ display: 'block', marginTop: '10px' }}>No image available</span>
            )}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setEditServiceMode(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleUpdateService}>
            Update
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default ServiceManagement
