import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  CRow,
  CCol,
  CFormSelect,
  CFormInput,
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CModalTitle,
  CTable,
  CCard,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CPagination,
  CPaginationItem,
  CForm,
  CCardHeader,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import Select from 'react-select'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'


import { CategoryData } from '../categoryManagement/CategoryAPI'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { BASE_URL, subService_URL, updateSubservices, getService } from '../../baseUrl'
import { postSubService, getAllSubServices, deleteSubServiceData, getSubServiceId } from './ProcedureAPI'
import { getServiceByCategoryId } from '../servicesManagement/ServiceAPI'
import { ConfirmationModal } from '../../Utils/ConfirmationDelete'
import { Edit2, Eye, Trash2 } from 'lucide-react'

const ProcedureManagement = () => {
  const [category, setCategory] = useState([])
  const [serviceOptions, setServiceOptions] = useState([])
  const [selectedSubServices, setSelectedSubServices] = useState([])
  const [selectSubService, setSelectSubService] = useState(false)
  const [subServiceInput, setSubServiceInput] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [removeShowModal, setRemoveShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editSubServiceId, setEditSubServiceId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredSubServices, setFilteredSubServices] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteServiceId, setDeleteServiceId] = useState(null)
  const [selectedSub, setSelectedSub] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [viewModalVisible, setViewModalVisible] = useState(false)

  const [errors, setErrors] = useState({
    category: '',
    service: '',
    subService: '',
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const [newService, setNewService] = useState({
    categoryName: '',
    categoryId: '',
    serviceName: '',
    serviceId: '',
  })
  const [subServices, setSubServices] = useState([])

  useEffect(() => {
    fetchSubServices()
    fetchCategories()
  }, [])

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredSubServices.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredSubServices.length / itemsPerPage)

  // Handle Enter key submission
  useEffect(() => {
    const handleEnterKey = (e) => {
      if (e.key === 'Enter' && showModal) {
        e.preventDefault()
        handleSubmit()
      }
    }

    window.addEventListener('keydown', handleEnterKey)

    return () => {
      window.removeEventListener('keydown', handleEnterKey)
    }
  }, [showModal, newService, selectedSubServices, editMode])

  const fetchSubServices = async () => {
    try {
      const result = await getAllSubServices()

      // result should be an array of category objects
      const formattedSubServices = result.flatMap((category) =>
        Array.isArray(category.subServices)
          ? category.subServices.map((sub) => ({
            id: sub.subServiceId,
            name: sub.subServiceName,
            category: category.categoryName,  // ✅ from top level
            service: sub.serviceName,         // ✅ directly from subService
            serviceId: sub.serviceId,
          }))
          : []
      )

      setSubServices(formattedSubServices)
      setFilteredSubServices(formattedSubServices)
    } catch (err) {
      console.error("❌ Failed to fetch subservices:", err)
      setSubServices([])
      setFilteredSubServices([])
    }
  }

  const validateFields = () => {
    const newErrors = {}
    if (!newService.categoryId) newErrors.category = 'Please select a category'
    if (!newService.serviceId) newErrors.service = 'Please select a service'
    if (!editMode && selectedSubServices.length === 0) newErrors.subService = 'Please add at least one Procedure'
    if (editMode && selectedSubServices[0]?.subServiceName?.trim() === '') newErrors.subService = 'Procedure name cannot be empty'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  const handleViewService = async (subServiceId) => {
    console.log("👀 handleViewService called with:", subServiceId)
    try {
      const res = await getSubServiceId(subServiceId)
      console.log("🔎 Full API Response:", res)

      // ✅ set the actual data object

      setSelectSubService(res.data)
      setViewModalVisible(true)
    } catch (error) {
      console.error("❌ Failed to fetch SubService details:", error)
      toast.error("Failed to fetch SubService details")
    }
  }

  const handleRemoveClick = (sub) => {
    setSelectedSub(sub)
    setRemoveShowModal(true)
  }

  const handleConfirmRemove = () => {
    setSelectedSubServices((prev) => prev.filter((item) => item !== selectedSub))
    setRemoveShowModal(false)
  }

  const confirmDelete = (serviceId) => {
    setDeleteServiceId(serviceId)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteServiceId) return

    try {
      const res = await deleteSubServiceData(deleteServiceId)
      if (res?.success) {
        toast.success(res.message || 'Subservice deleted successfully!', { position: 'top-right' })
        await fetchSubServices()
      } else {
        toast.error('Failed to delete subservice.', { position: 'top-right' })
      }
    } catch (error) {
      console.error('❌ Delete error:', error)
      toast.error('Failed to delete subservice.', { position: 'top-right' })
    }

    setShowDeleteModal(false)
    setDeleteServiceId(null)
  }

  const handleCloseForm = () => {
    setNewService({
      categoryId: '',
      serviceId: '',
    })
    setSelectedSubServices([])   // clear procedures
    setErrors({})                // clear validation errors
    setEditMode(false)           // reset mode
    setShowModal(false)          // ✅ correct hook for closing modal
  }

  const handleCategoryEdit = async (row) => {
    setEditMode(true)
    setEditSubServiceId(row.id)
    setShowModal(true)

    const selectedCategory = category.find((c) => c.categoryName === row.category)
    const selectedCategoryId = selectedCategory?.categoryId || ''

    try {
      const res = await getServiceByCategoryId(selectedCategoryId)
      setServiceOptions(res)

      const selectedService = res.find((s) => s.serviceName === row.service)

      setNewService({
        categoryName: row.category,
        categoryId: selectedCategoryId,
        serviceName: row.service,
        serviceId: selectedService?.serviceId || '',
      })
    } catch (err) {
      console.error('❌ Failed to load services for edit:', err)
      setServiceOptions([])
    }

    setSelectedSubServices([
      {
        subServiceName: row.name,
        serviceName: row.service,
        serviceId: row.serviceId,
      },
    ])
  }

  const fetchCategories = async () => {
    try {
      const res = await CategoryData()
      if (res?.data) {
        setCategory(res.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err)
      setCategory([])
    }
  }

  const handleChanges = async (e) => {
    const { name, value } = e.target
    setErrors((prev) => ({ ...prev, [name === 'categoryName' ? 'category' : 'service']: '' }))

    if (name === 'categoryName') {
      const selectedCategory = category.find((cat) => cat.categoryId === value)
      setNewService((prev) => ({
        ...prev,
        categoryName: selectedCategory?.categoryName || '',
        categoryId: value,
        serviceName: '',
        serviceId: '',
      }))

      try {
        const res = await getServiceByCategoryId(value)
        setServiceOptions(res)
      } catch (err) {
        console.error('❌ Failed to fetch services:', err)
        setServiceOptions([])
      }
    } else if (name === 'serviceName') {
      const selectedService = serviceOptions.find((s) => s.serviceId === value)
      setNewService((prev) => ({
        ...prev,
        serviceName: selectedService?.serviceName || '',
        serviceId: value,
      }))
    }
  }

  const handleSubmit = async () => {
    if (!validateFields()) return

    try {
      if (editMode && editSubServiceId) {
        const normalize = (val) => (val ? val.toString().trim().toLowerCase() : '')
        const existingSubNames = Array.isArray(subServices)
          ? subServices
            .filter((s) => s.id !== editSubServiceId)
            .map((s) => normalize(s.name))
          : []

        for (const sub of selectedSubServices) {
          const normalized = normalize(sub.subServiceName)
          if (existingSubNames.includes(normalized)) {
            setErrors((prev) => ({
              ...prev,
              subService: `Procedure "${sub.subServiceName}" already exists.`,
            }));
            return;
          }
        }

        const payload = {
          subServices: selectedSubServices.map((subService) => ({
            serviceId: subService.serviceId,
            serviceName: subService.serviceName,
            subServiceName: subService.subServiceName,
          })),
        }

        try {
          const res = await axios.put(
            `${BASE_URL}/${updateSubservices}/${editSubServiceId}`,
            payload,
          )

          if (res?.data?.success) {
            fetchSubServices()
            toast.success('Procedure updated successfully!')
          } else {
            toast.error(res?.data?.message || 'Failed to update Procedure.')
          }
        } catch (err) {
          console.error('❌ Update error:', err)
          toast.error(err.response?.data?.message || 'Error updating Procedure')
        }
      } else {
        const normalize = (val) => (val ? val.toString().trim().toLowerCase() : '')
        const existingSubNames = Array.isArray(subServices)
          ? subServices.map((s) => normalize(s.name))
          : []

        for (const sub of selectedSubServices) {
          const normalized = normalize(sub.subServiceName)
          if (existingSubNames.includes(normalized)) {
            setErrors((prev) => ({
              ...prev,
              subService: `Procedure "${sub.subServiceName}" already exists.`,
            })); return
          }
        }

        const formattedSubServices = selectedSubServices.map((subService) => {
          const selectedService = serviceOptions.find(
            (s) => s.serviceName === subService.serviceName,
          )

          return {
            serviceId: selectedService?.serviceId || '',
            serviceName: subService.serviceName,
            subServiceName: subService.subServiceName,
          }
        })

        const payload = {
          categoryId: newService.categoryId,
          subServices: formattedSubServices,
        }

        try {
          const res = await postSubService(payload)
          if (res?.data?.success) {
            toast.success('Procedure added successfully')
          } else {
            toast.error(res?.data?.message || 'Submission failed')
          }
        } catch (err) {
          console.error('Error submitting Procedures:', err)
          toast.error(err.response?.data?.message || 'Error submitting Procedures')
        }
      }

      await fetchSubServices()
      setSelectedSubServices([])
      setSubServiceInput('')
      setNewService({
        categoryName: '',
        categoryId: '',
        serviceName: '',
        serviceId: '',
      })
      setEditMode(false)
      setEditSubServiceId(null)
      setShowModal(false)
    } catch (err) {
      console.error('Submission Error:', err)
      toast.error('Error submitting subservices')
    }
  }

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSubServices(subServices)
    } else {
      const lowerSearch = searchQuery.toLowerCase()
      const filtered = subServices.filter(
        (item) =>
          item.category?.toLowerCase()?.includes(lowerSearch) ||
          item.service?.toLowerCase()?.includes(lowerSearch) ||
          item.name?.toLowerCase()?.includes(lowerSearch),
      )
      setFilteredSubServices(filtered)
    }
    setCurrentPage(1) // Reset to first page when search changes
  }, [searchQuery, subServices])

  return (
    <div className="container-fluid p-4">
      <ToastContainer />
      <CCard>
        {/* <CRow>
        <CCol md={6}>
          <div className="d-flex justify-content-start mb-3">
            <CFormInput
              type="text"
              placeholder="Search by Category, Service, Procedure"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  // Focus on next element or trigger search if needed
                }
              }}
            />
          </div>
        </CCol>
      </CRow> */}

        <CCardHeader className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Procedure Management</h4>
          <div className="d-flex" style={{ gap: '1rem' }}>
            <CInputGroup style={{ width: '300px' }}>
              <CFormInput
                placeholder="Search Service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <CInputGroupText>
                <CIcon icon={cilSearch} />
              </CInputGroupText>
            </CInputGroup>
            <CButton
              color="primary"
              onClick={() => {
                setEditMode(false)
                setEditSubServiceId(null)
                setNewService({
                  categoryName: '',
                  categoryId: '',
                  serviceName: '',
                  serviceId: '',
                })
                setSelectedSubServices([])
                setSubServiceInput('')
                setShowModal(true)
              }}
            >
              + Add New Procedure
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
              <CTableHead className="pink-table">
                <CTableRow>
                  <CTableHeaderCell style={{ width: '120px' }}>S.No</CTableHeaderCell>
                  <CTableHeaderCell>Procedure</CTableHeaderCell>
                  <CTableHeaderCell>Category</CTableHeaderCell>
                  <CTableHeaderCell>Service</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody className="pink-table">
                {currentItems && currentItems.length > 0 ? (
                  currentItems.map((row, index) => (
                    <CTableRow key={row.id}>
                      <CTableDataCell>{(currentPage - 1) * itemsPerPage + index + 1}</CTableDataCell>
                      <CTableDataCell>{row.name}</CTableDataCell>
                      <CTableDataCell>{row.category}</CTableDataCell>
                      <CTableDataCell>{row.service}</CTableDataCell>
                      <CTableDataCell className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="actionBtn"
                            onClick={() => handleViewService(row.id)} // ✅ pass row.id directly
                            title="View">
                            <Eye size={18} />
                          </button>
                          <button
                            className="actionBtn"
                            onClick={() => handleCategoryEdit(row)}
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            className="actionBtn"
                            onClick={() => confirmDelete(row.id)}
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
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
            {filteredSubServices.length > 0 && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div>
                  <span className="me-2 ms-2">Rows per page:</span>
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
                  <span className="me-3">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredSubServices.length)} of {filteredSubServices.length} entries
                  </span>
                  <CPagination>
                    <CPaginationItem
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </CPaginationItem>
                    {[...Array(totalPages)].map((_, i) => (
                      <CPaginationItem
                        key={i + 1}
                        active={i + 1 === currentPage}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </CPaginationItem>
                    ))}
                    <CPaginationItem
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </CPaginationItem>
                  </CPagination>
                </div>
              </div>
            )}
          </>
        )}
        <CModal visible={showModal} onClose={handleCloseForm} size="lg" backdrop="static" className='custom-modal'>
          <CForm
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
            id="procedureForm"
          >
            <CModalHeader closeButton>
              <CModalTitle>{editMode ? 'Edit Procedure' : '➕ Add New Procedure'}</CModalTitle>
            </CModalHeader>
            <CModalBody>
              <CRow className="g-4">
                <CCol md={6}>
                  <h6>
                    Category <span className="text-danger">*</span>
                  </h6>
                  <CFormSelect
                    name="categoryName"
                    value={newService.categoryId || ''}
                    onChange={handleChanges}
                    // disabled={editMode}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        document.querySelector('select[name="serviceName"]').focus()
                      }
                    }}
                  >
                    <option value="">Select Category</option>
                    {category.map((cat) => (
                      <option key={cat.categoryId} value={cat.categoryId}>
                        {cat.categoryName}
                      </option>
                    ))}
                  </CFormSelect>
                  {errors.category && <div className="text-danger mt-1">{errors.category}</div>}
                </CCol>

                <CCol md={6}>
                  <h6>
                    Service <span className="text-danger">*</span>
                  </h6>
                  <CFormSelect
                    name="serviceName"
                    value={newService.serviceId || ''}
                    onChange={handleChanges}
                    // disabled={editMode}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (editMode) {
                          document.querySelector('input[placeholder="Edit Procedure"]').focus()
                        } else {
                          document.querySelector('input[placeholder="Enter Procedure"]').focus()
                        }
                      }
                    }}
                  >
                    <option value="">Select Service</option>
                    {serviceOptions.map((s) => (
                      <option key={s.serviceId} value={s.serviceId}>
                        {s.serviceName}
                      </option>
                    ))}
                  </CFormSelect>
                  {errors.service && <div className="text-danger mt-1">{errors.service}</div>}
                </CCol>

                <CCol md={12}>
                  <h6>{editMode ? 'Edit Procedure' : 'Add Procedure'} <span className="text-danger">*</span></h6>

                  {!editMode && (
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      <CFormInput
                        placeholder="Enter Procedure"
                        value={subServiceInput}
                        onChange={(e) => {
                          setSubServiceInput(e.target.value)
                          if (e.target.value.trim() !== '') {
                            setErrors((prev) => ({ ...prev, subService: '' }))
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            // Trigger the Add button click
                            document.querySelector('button[color="success"]').click()
                          }
                        }}
                        style={{ flexGrow: 1 }}
                      />

                      {errors.subService && <div className="text-danger mt-1">{errors.subService}</div>}
                      <CButton
                        color="success"
                        className="text-white"
                        onClick={() => {
                          const trimmedInput = subServiceInput.trim()
                          let errorMsg = '';
                          if (!trimmedInput) {
                            errorMsg = 'Procedure name is required.';
                          } else if (!/^[A-Za-z0-9\s]+$/.test(trimmedInput)) {
                            errorMsg = 'Procedure name can only contain letters, numbers, and spaces.';
                          } else if (/^\d+$/.test(trimmedInput)) {
                            errorMsg = 'Procedure name cannot contain only numbers.';
                          } else if (trimmedInput.length < 3) {
                            errorMsg = 'Procedure name must be at least 3 characters long.';
                          }
                          if (errorMsg) {
                            setErrors((prev) => ({ ...prev, subService: errorMsg }));
                            return;
                          }

                          const selectedService = serviceOptions.find(
                            (s) => s.serviceId === newService.serviceId,
                          )

                          if (!selectedService) {
                            toast.warn('Please select a service first!', {
                              position: 'top-right',
                              autoClose: 2000,
                            })
                            return
                          }

                          const newEntry = {
                            serviceName: selectedService.serviceName,
                            subServiceName: trimmedInput,
                          }

                          if (
                            selectedSubServices.some(
                              (sub) =>
                                sub.serviceName === newEntry.serviceName &&
                                sub.subServiceName === newEntry.subServiceName,
                            )
                          ) {
                            toast.warn('Procedure already added for this service!', {
                              position: 'top-right',
                              autoClose: 2000,
                            })
                            return
                          }

                          setSelectedSubServices((prev) => {
                            const updated = [...prev, newEntry]
                            if (updated.length > 0) {
                              setErrors((prevErrors) => ({ ...prevErrors, subService: '' }))
                            }
                            return updated
                          })
                          setSubServiceInput('')
                        }}
                      >
                        Add
                      </CButton>
                    </div>
                  )}

                  {editMode && (
                    <>
                      <CFormInput
                        placeholder="Edit Procedure"
                        value={selectedSubServices[0]?.subServiceName || ''}
                        onChange={(e) => {
                          const value = e.target.value
                          const trimmedValue = value.trim();
                          let errorMsg = '';

                          if (!trimmedValue) {
                            errorMsg = 'Procedure name is required.';
                          } else if (!/^[A-Za-z0-9\s]+$/.test(trimmedValue)) {
                            errorMsg = 'Procedure name can only contain letters, numbers, and spaces.';
                          } else if (/^\d+$/.test(trimmedValue)) {
                            errorMsg = 'Procedure name cannot contain only numbers.';
                          } else if (trimmedValue.length < 3) {
                            errorMsg = 'Procedure name must be at least 3 characters long.';
                          }
                          setErrors((prev) => ({ ...prev, subService: errorMsg }));

                          setSelectedSubServices([
                            { ...selectedSubServices[0], subServiceName: value },
                          ])
                          // Clear error while typing
                          // if (value.trim() !== '') {
                          //   setErrors((prev) => ({ ...prev, subService: '' }))
                          // }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleSubmit()
                          }
                        }}
                        invalid={!!errors.subService}
                      />
                      {errors.subService && <div className="text-danger mt-1">{errors.subService}</div>}
                    </>
                  )}

                  {!editMode && selectedSubServices.length > 0 && (
                    <ul className="list-group mt-3">
                      {selectedSubServices.map((sub, index) => (
                        <li
                          key={index}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <span>
                            <strong>{sub.serviceName}:</strong> {sub.subServiceName}
                          </span>
                          <CButton
                            size="sm"
                            color="danger"
                            variant="outline"
                            onClick={() => handleRemoveClick(sub)}
                          >
                            Remove
                          </CButton>
                        </li>
                      ))}
                    </ul>
                  )}

                  <CModal visible={removeShowModal} onClose={() => setRemoveShowModal(false)}>
                    <CModalHeader>Confirm Removal</CModalHeader>
                    <CModalBody>Are you sure you want to remove this item?</CModalBody>
                    <CModalFooter>
                      <CButton color="secondary" onClick={() => setRemoveShowModal(false)}>
                        No
                      </CButton>
                      <CButton color="danger" onClick={handleConfirmRemove}>
                        Yes
                      </CButton>
                    </CModalFooter>
                  </CModal>
                </CCol>
              </CRow>
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" variant="outline" onClick={handleCloseForm}>
                Cancel
              </CButton>
              <CButton
                type="submit"
                color="primary"
                className="text-white"
                form="procedureForm"
              >
                <h6 className="text-white">{editMode ? 'Update Procedure' : 'Add Procedure'}</h6>
              </CButton>
            </CModalFooter>
          </CForm>
        </CModal>
        {/* View Sub Service Modal */}
        <CModal visible={viewModalVisible} onClose={() => setViewModalVisible(false)}>
          <CModalHeader>
            <CModalTitle>Sub Service Details</CModalTitle>
          </CModalHeader>
          <CModalBody>
            {selectSubService?.subServices?.length > 0 ? (
              selectSubService.subServices.map((item) => (
                <div key={item.subServiceId} style={{ marginBottom: '1rem' }}>
                  <p>
                    <strong>Category Name:</strong> {selectSubService.categoryName || '-'}
                  </p>
                  <p>
                    <strong>Sub Service Name:</strong> {item.subServiceName || '-'}
                  </p>
                  <p>
                    <strong>Service Name:</strong> {item.serviceName || '-'}
                  </p>
                </div>
              ))
            ) : (
              <p>No sub-services found</p>
            )}
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setViewModalVisible(false)}>
              Close
            </CButton>
          </CModalFooter>
        </CModal>

        {showDeleteModal && (
          <ConfirmationModal
            isVisible={showDeleteModal}
            message="Are you sure you want to delete this service?"
            onConfirm={handleConfirmDelete}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}
      </CCard>
    </div>
  )
}

export default ProcedureManagement