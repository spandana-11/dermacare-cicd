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
  CCard,
  CCardHeader,
  CFormSelect,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CPagination,
  CPaginationItem
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { getAllServices, postServiceData, updateServiceData, deleteServiceData, getServiceByServiceId } from './ServiceAPI'
import { CategoryData } from '../categoryManagement/CategoryAPI'
import Select from 'react-select'

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
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
    const [selectedService, setSelectedService] = useState(null)
  const [viewModalVisible, setViewModalVisible] = useState(false)

  const [errors, setErrors] = useState({
    serviceName: '',
    categoryId: '',
    description: '',
    serviceImage: '',
  })

  const [newService, setNewService] = useState({
    serviceName: '',
    categoryId: '',
    description: '',
    serviceImage: null,
  })

  const [updatedService, setUpdatedService] = useState({
    ServiceId: '',
    ServiceName: '',
    categoryId: '',
    description: '',
    serviceImage: null,
    existingImageName: ''
  })

  const [editErrors, setEditErrors] = useState({})

  const fetchData = async () => {
    setLoading(true)
    try {
      const servicesResponse = await getAllServices()
      if (!servicesResponse || !servicesResponse.data) {
        throw new Error('Invalid services response')
      }

      const categoriesResponse = await CategoryData()
      if (!categoriesResponse || !categoriesResponse.data) {
        throw new Error('Invalid categories response')
      }

      setService(servicesResponse.data.data || servicesResponse.data)
      setCategories(categoriesResponse.data)
    } catch (error) {
      console.error('Fetch error:', error)
      setError('Failed to fetch data')
      toast.error('Error loading data')
    } finally {
      setLoading(false)
    }
  }
  const handleViewService=async(serviceId)=>{
    const data=await getServiceByServiceId(serviceId);
    setSelectedService(data);
    setViewModalVisible(true);
  };

  useEffect(() => {
    fetchData()
  }, [])

// Replace the useEffect with the search functionality:
useEffect(() => {
  const handleSearch = () => {
    const trimmedQuery = searchQuery.toLowerCase().trim()
    if (!trimmedQuery) {
      setFilteredData(service)
      return
    }
    const filtered = service.filter((services) => {
      const serviceNameMatch = services.serviceName?.toLowerCase().includes(trimmedQuery)
      const categoryMatch = services.categoryName?.toLowerCase().includes(trimmedQuery)

      return serviceNameMatch || categoryMatch
    })
    setFilteredData(filtered)
  }

  handleSearch()
}, [searchQuery, service])


  // Calculate pagination values
// Make sure these variables use filteredData instead of filteredServices:
const indexOfLastItem = currentPage * itemsPerPage
const indexOfFirstItem = indexOfLastItem - itemsPerPage
const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)
const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const handleFileChange = (e) => {
    const file = e.target.files[0]

    if (!file) return

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, serviceImage: "Only image files are allowed" }))
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, serviceImage: "File size must be < 2MB" }))
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      let base64String = reader.result.split(",")[1]
      setNewService((prev) => ({ ...prev, serviceImage: base64String }))
      setErrors((prev) => ({ ...prev, serviceImage: '' }))
    }
    reader.readAsDataURL(file)
  }

  const handleServiceChange = (e) => {
    const { name, value } = e.target

    setNewService((prev) => ({
      ...prev,
      [name]: value,
    }))

    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!newService.categoryId) {
      newErrors.categoryId = 'Category is required'
    }

    if (!newService.serviceName?.trim()) {
      newErrors.serviceName = 'Service name is required'
    }

    if (!newService.description?.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!newService.serviceImage) {
      newErrors.serviceImage = 'Service image is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateEditForm = () => {
    const newErrors = {}

    if (!updatedService.ServiceName?.trim()) {
      newErrors.ServiceName = "Service name is required"
    }

    if (!updatedService.description?.trim()) {
      newErrors.description = "Description is required"
    }

    if (!updatedService.categoryId) {
      newErrors.categoryId = "Category is required"
    }

    if (!updatedService.serviceImage && !updatedService.existingImageName) {
      newErrors.serviceImage = "Service image is required"
    }

    setEditErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateEditField = (name, value) => {
    let error = ""

    if (name === "ServiceName") {
      if (!value.trim()) {
        error = "Service name is required"
      }
    }

    if (name === "description") {
      if (!value.trim()) {
        error = "Description is required"
      }
    }

    if (name === "categoryId") {
      if (!value) {
        error = "Category is required"
      }
    }

    if (name === "serviceImage") {
      if (!value && !updatedService.existingImageName) {
        error = "Service image is required"
      }
    }

    setEditErrors((prev) => ({
      ...prev,
      [name]: error,
    }))
  }

  const handleAddService = async () => {
    if (!validateForm()) {
      return
    }

    const newName = (newService.serviceName || '').trim().toLowerCase()
    const duplicate = service.some((s) => (s.serviceName || '').trim().toLowerCase() === newName)

    if (duplicate) {
      toast.error('Service already exists!')
      return
    }

    try {
      const payload = {
        ...newService,
        serviceName: newService.serviceName.trim(),
      }
      await postServiceData(payload)
      toast.success('Service added successfully!')
      setModalVisible(false)
      setNewService({
        serviceName: '',
        categoryId: '',
        description: '',
        serviceImage: null,
      })
      setErrors({})
      await fetchData()
    } catch (error) {
      console.error('Failed to add service:', error)
      toast.error('Failed to add service')
    }
  }
  const handleServiceView = (service) => {
    console.log("Clicked Service", service)
    setSelectedService(service)
    setViewModalVisible(true)
  }
  const handleServiceEdit = (service) => {
    setUpdatedService({
      ServiceId: service.serviceId,
      ServiceName: service.serviceName,
      categoryId: service.categoryId || '',
      description: service.description || '',
      serviceImage: service.serviceImage,
      existingImageName: service.serviceImage ? "Existing image" : ''
    })
    setEditServiceMode(true)
  }

  const handleUpdateService = async () => {
    if (!validateEditForm()) return

    try {
      const newName = (updatedService.ServiceName || '').trim().toLowerCase()

      const duplicate = service.some(
        (s) =>
          (s.serviceName || '').trim().toLowerCase() === newName &&
          s.serviceId !== updatedService.ServiceId
      )

      if (duplicate) {
        toast.error('Service with this name already exists!')
        return
      }

      let imageBase64 = updatedService.serviceImage
      if (updatedService.serviceImage && typeof updatedService.serviceImage !== 'string') {
        imageBase64 = await toBase64(updatedService.serviceImage)
      }

      const payload = {
        serviceId: updatedService.ServiceId,
        serviceName: updatedService.ServiceName.trim(),
        categoryId: updatedService.categoryId,
        description: updatedService.description,
        serviceImage: imageBase64?.includes('base64,')
          ? imageBase64.split(',')[1]
          : imageBase64,
      }

      await updateServiceData(payload, updatedService.ServiceId)
      toast.success('Service updated successfully!')
      setEditServiceMode(false)
      setEditErrors({})
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

  const handleServiceDelete = (serviceId) => {
    setServiceIdToDelete(serviceId)
    setIsModalVisible(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteServiceData(serviceIdToDelete)
      toast.success('Service deleted successfully!')
      setIsModalVisible(false)
      await fetchData()
    } catch (error) {
      toast.error('Failed to delete service')
    }
  }

  const handleCancelDelete = () => {
    setIsModalVisible(false)
  }

  const handleCancelAdd = () => {
    setNewService({
      serviceName: '',
      categoryId: '',
      description: '',
      serviceImage: null,
    })
    setErrors({})
    setModalVisible(false)
  }

  const categoryOptions =
    categories?.map((cat) => ({
      value: cat.categoryId,
      label: cat.categoryName,
    })) || []

  return (
    <div className="container-fluid p-4">
      <ToastContainer />
      <CCard>

      <CCardHeader className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Service Management</h5>
          <div className="d-flex" style={{ gap: '1rem' }}>
            <CInputGroup style={{ width: '300px' }}>
              <CFormInput
                placeholder="Search Service / Category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <CInputGroupText>
                <CIcon icon={cilSearch} />
              </CInputGroupText>
            </CInputGroup>

            <CButton color="primary" onClick={() => setModalVisible(true)}>
              + Add Service
            </CButton>
          </div>
        </CCardHeader>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <>
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell style={{width:'80px'}}>S.No</CTableHeaderCell>
                <CTableHeaderCell>Service Name</CTableHeaderCell>
                <CTableHeaderCell>Category Name</CTableHeaderCell>
                <CTableHeaderCell>Description</CTableHeaderCell>
                <CTableHeaderCell  style={{width:'80px'}}>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {currentItems && currentItems.length > 0 ? (
                currentItems.map((row, index) => (
                  <CTableRow key={row.serviceId || index}>
                    <CTableDataCell>{(currentPage-1)* itemsPerPage + index+1}</CTableDataCell>
                    <CTableDataCell>{row.serviceName}</CTableDataCell>
                    <CTableDataCell>{row.categoryName}</CTableDataCell>
                    <CTableDataCell>{row.description}</CTableDataCell>
                    <CTableDataCell>
                      <div
                        style={{
                          display:'flex',
                          justifyContent:'space-between',
                          alignItems:'center',
                          width:'230px',
                        }}
                      >
                           <CButton
                          color="primary"
                          className="ms-2"
                          size="sm"
                          onClick={() => handleViewService(row.serviceId)}
                          style={{width:'80px'}}
                        >
                          View
                        </CButton>
                        <CButton
                          color='warning'
                          className="ms-2"
                          size="sm"
                          onClick={() => handleServiceEdit(row)}
                          style={{marginRight:'10px', width:'80px'}}
                        >
                          Edit
                        </CButton>
                        <CButton
                          color="danger"
                          className="ms-2"
                          size="sm"
                          onClick={() => handleServiceDelete(row.serviceId)}
                          style={{width:'80px', color:'white'}}
                        >
                          Delete
                        </CButton>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan={5} className="text-center">
                    No records found
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>

          {/* Pagination Controls */}
{filteredData.length > 0 && (
  <div className="d-flex justify-content-between align-items-center mt-3">
    <div>
      <span className="me-2 ms-2">Rows per page:</span>
      <CFormSelect
        value={itemsPerPage}
        onChange={(e) => {
          setItemsPerPage(Number(e.target.value))
          setCurrentPage(1)
        }}
        style={{width:'80px', display:'inline-block'}}
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={25}>25</option>
        <option value={50}>50</option>
      </CFormSelect>
    </div>
    <div>
      <span className="me-3">
        Showing {indexOfFirstItem+1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
      </span>
      <CPagination>
        <CPaginationItem
          onClick={() => setCurrentPage(prev => Math.max(prev-1, 1))}
          disabled={currentPage===1}
        >
          Previous
        </CPaginationItem>
        {[...Array(totalPages)].map((_, i) => (
          <CPaginationItem
            key={i+1}
            active={i+1===currentPage}
            onClick={() => setCurrentPage(i+1)}
          >
            {i+1}
          </CPaginationItem>
        ))}
        <CPaginationItem
          onClick={() => setCurrentPage(prev => Math.min(prev+1, totalPages))}
          disabled={currentPage===totalPages}
        >
          Next
        </CPaginationItem>
      </CPagination>
    </div>
  </div>
)}
        </>
      )}

      {/* Add Service Modal */}
<CModal visible={modalVisible} onClose={handleCancelAdd} backdrop="static">
  <CModalHeader>
    <CModalTitle>Add New Service</CModalTitle>
  </CModalHeader>
  <CModalBody>
    <CForm 
      onSubmit={(e) => {
        e.preventDefault();
        handleAddService();
      }}
      id="addServiceForm"
    >
      {/* Category */}
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

      {/* Service Name */}
      <div className="mb-3">
        <label className="form-label">
          Service Name <span style={{ color: 'red' }}>*</span>
        </label>
        <CFormInput
          type="text"
          name="serviceName"
          value={newService.serviceName || ''}
          onChange={handleServiceChange}
          className={errors.serviceName ? 'is-invalid' : ''}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddService();
            }
          }}
        />
        {errors.serviceName && (
          <div className="invalid-feedback d-block">{errors.serviceName}</div>
        )}
      </div>

      {/* Description */}
      <div className="mb-3">
        <label className="form-label">
          Description <span style={{ color: 'red' }}>*</span>
        </label>
        <CFormInput
          type="text"
          name="description"
          value={newService.description || ''}
          onChange={handleServiceChange}
          className={errors.description ? 'is-invalid' : ''}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddService();
            }
          }}
        />
        {errors.description && (
          <div className="invalid-feedback d-block">{errors.description}</div>
        )}
      </div>

      {/* Service Image */}
      <div className="mb-3">
        <label className="form-label">
          Service Image <span style={{ color: 'red' }}>*</span>
        </label>
        <CFormInput
          type="file"
          name="serviceImage"
          onChange={handleFileChange}
          accept="image/*"
          className={errors.serviceImage ? 'is-invalid' : ''}
        />
        {errors.serviceImage && (
          <div className="invalid-feedback d-block">{errors.serviceImage}</div>
        )}
      </div>
    </CForm>
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={handleCancelAdd}>
      Cancel
    </CButton>
    <CButton 
      type="submit" 
      color="primary" 
      form="addServiceForm"
    >
      Add Service
    </CButton>
  </CModalFooter>
</CModal>

        {/* View Service Modal */}
      <CModal visible={viewModalVisible} onClose={()=>setViewModalVisible(false)}>
        <CModalHeader closeButton>
            <CModalTitle>Service Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedService ? (
            <>
              <p><strong>Service Name : </strong>{selectedService.serviceName}</p>
              <p><strong>Category Name : </strong>{selectedService.categoryName}</p>
              <p><strong>Description : </strong>{selectedService.description || 'N/A'}</p>
              {selectedService.serviceImage &&(
                <div className="text-center my-3">
                  <img
                    src={`data:image/jpeg;base64,${selectedService.serviceImage}`}
                    alt={selectedService.serviceName}
                    style={{maxWidth:"100%", borderRadius:"8px"}}
                    />
                </div>
              )}
            </>
          ):(
            <p>No details available</p>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={()=>setViewModalVisible(false)}>
            Close
          </CButton>
        </CModalFooter>
        </CModal>

      {/* Edit Service Modal */}
      <CModal
  visible={editServiceMode}
  onClose={() => {
    setEditServiceMode(false)
    setEditErrors({})
  }}
  backdrop="static"
>
  <CModalHeader>
    <CModalTitle>Edit Service</CModalTitle>
  </CModalHeader>
  <CModalBody>
    <CForm
      onSubmit={(e) => {
        e.preventDefault();
        handleUpdateService();
      }}
      id="editServiceForm"
    >
      {/* Service Name */}
      <div className="mb-3">
        <label className="form-label">Service Name</label>
        <CFormInput
          value={updatedService.ServiceName}
          onChange={(e) => {
            const value = e.target.value
            setUpdatedService({ ...updatedService, ServiceName: value })
            validateEditField("ServiceName", value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleUpdateService();
            }
          }}
        />
        {editErrors.ServiceName && (
          <div className="text-danger">{editErrors.ServiceName}</div>
        )}
      </div>

      {/* Description */}
      <div className="mb-3">
        <label className="form-label">Description</label>
        <CFormInput
          value={updatedService.description}
          onChange={(e) => {
            const value = e.target.value
            setUpdatedService({ ...updatedService, description: value })
            validateEditField("description", value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleUpdateService();
            }
          }}
        />
        {editErrors.description && (
          <div className="text-danger">{editErrors.description}</div>
        )}
      </div>

      {/* Category */}
      <div className="mb-3">
        <label className="form-label">Category</label>
        <CFormSelect
          value={updatedService.categoryId}
          onChange={(e) => {
            const value = e.target.value
            setUpdatedService({ ...updatedService, categoryId: value })
            validateEditField("categoryId", value)
          }}
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.categoryId} value={cat.categoryId}>
              {cat.categoryName}
            </option>
          ))}
        </CFormSelect>
        {editErrors.categoryId && (
          <div className="text-danger">{editErrors.categoryId}</div>
        )}
      </div>

      {/* Service Image */}
      <div className="mb-3">
        <label className="form-label">Service Image</label>
        <CFormInput
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0]
            setUpdatedService({
              ...updatedService,
              serviceImage: file,
              existingImageName: file?.name || updatedService.existingImageName,
            })
            validateEditField("serviceImage", file)
          }}
        />
        {editErrors.serviceImage && (
          <div className="text-danger">{editErrors.serviceImage}</div>
        )}
      </div>

      {/* Preview */}
      {updatedService?.serviceImage ? (
        <img
          src={
            typeof updatedService.serviceImage === 'string'
              ? updatedService.serviceImage.startsWith('data:image')
                ? updatedService.serviceImage
                : `data:image/png;base64,${updatedService.serviceImage}`
              : URL.createObjectURL(updatedService.serviceImage)
          }
          alt="Service"
          style={{ width: '200px', height: 'auto', marginTop: '10px' }}
        />
      ) : (
        <span style={{ display: 'block', marginTop: '10px' }}>
          No image available
        </span>
      )}
    </CForm>
  </CModalBody>
  <CModalFooter>
    <CButton
      color="secondary"
      onClick={() => {
        setEditServiceMode(false)
        setEditErrors({})
      }}
    >
      Cancel
    </CButton>
    <CButton
      type="submit"
      color="primary"
      form="editServiceForm"
    >
      Update
    </CButton>
  </CModalFooter>
</CModal>

      {/* Delete Confirmation Modal */}
      <CModal visible={isModalVisible} onClose={handleCancelDelete}>
        <CModalHeader>
          <CModalTitle>Confirm Delete</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to delete this service?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={handleCancelDelete}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleConfirmDelete}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>
      </CCard>
    </div>
  )
}

export default ServiceManagement