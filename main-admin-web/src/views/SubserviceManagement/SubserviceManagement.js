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
} from '@coreui/react'
import Select from 'react-select'

import { CategoryData } from '../categoryManagement/CategoryAPI'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { BASE_URL, subService_URL, updateSubservices, getService } from '../../baseUrl'
import DataTable from 'react-data-table-component'
import { postSubService } from '../SubserviceManagement/SUbServiceAPI'
import { getAllSubServices, deleteSubServiceData } from '../SubserviceManagement/SUbServiceAPI'
import { getServiceByCategoryId } from '../servicesManagement/ServiceAPI'
import { ConfirmationModal } from '../../Utils/ConfirmationDelete'

const AddSubService = () => {
  const [category, setCategory] = useState([])
  const [serviceOptions, setServiceOptions] = useState([])
  const [subServiceOptions, setSubServiceOptions] = useState([])
  const [selectedSubServices, setSelectedSubServices] = useState([])
  const [subServiceInput, setSubServiceInput] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [removeShowModal, setRemoveShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editSubServiceId, setEditSubServiceId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredSubServices, setFilteredSubServices] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteServiceId, setDeleteServiceId] = useState(null)
  const [itemToRemove, setItemToRemove] = useState(null)
  const [selectedSub, setSelectedSub] = useState(null)
  const [errors, setErrors] = useState({
    category: '',
    service: '',
    subService: '',
  })

  const handleRemoveClick = (sub) => {
    setSelectedSub(sub) // Store the item to be removed
    setRemoveShowModal(true) // Show confirmation modal
  }

  const handleConfirmRemove = () => {
    setSelectedSubServices((prev) => prev.filter((item) => item !== selectedSub))
    setRemoveShowModal(false) // Close modal after removal
  }
  const confirmDelete = (serviceId) => {
    setDeleteServiceId(serviceId) // Store the service ID to delete
    setShowDeleteModal(true) // Open the modal
  }

  const [newService, setNewService] = useState({
    categoryName: '',
    categoryId: '',
    serviceName: '',
    serviceId: '',
  })
  const [subServices, setSubServices] = useState([]) // will be filled by API
  // ✅ Remove duplicates in case they somehow exist
  const uniqueSubServices = selectedSubServices.filter(
    (item, index, self) =>
      index ===
      self.findIndex(
        (t) => t.serviceName === item.serviceName && t.subServiceName === item.subServiceName,
      ),
  )
  useEffect(() => {
    fetchSubServices()
  }, [])
  const fetchSubServices = async () => {
    const result = await getAllSubServices()

    console.log('API Response:', result) // 🔍 Debug API response

    // Correctly map subServices
    const formattedSubServices = result.flatMap((item) =>
      Array.isArray(item.subServices)
        ? item.subServices.map((sub) => ({
            id: sub.subServiceId,
            name: sub.subServiceName,
            category: item.categoryName, // ✅ Correctly mapped
            service: sub.serviceName, // ✅ Fix: Get serviceName from sub
            serviceId: sub.serviceId, // ✅ Fix: Get serviceId from sub
          }))
        : [],
    )

    console.log('Formatted SubServices:', formattedSubServices) // 🔍 Debug formatted data
    setSubServices(formattedSubServices) // ✅ Update state correctly
  }
  const validateFields = () => {
  const newErrors = {};
  if (!newService.categoryId) newErrors.category = 'Please select a category';
  if (!newService.serviceId) newErrors.service = 'Please select a service';
  if (!editMode && selectedSubServices.length === 0) newErrors.subService = 'Please add at least one subservice';
  if (editMode && selectedSubServices[0]?.subServiceName?.trim() === '') newErrors.subService = 'Subservice name cannot be empty';

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};


  useEffect(() => {
    console.log('SubServices State:', subServices) // 🔍 Debug table data
  }, [subServices])

  const handleCategoryEdit = async (row) => {
    setEditMode(true)
    setEditSubServiceId(row.id)
    setShowModal(true)

    // Get the categoryId from name
    const selectedCategory = category.find((c) => c.categoryName === row.category)
    const selectedCategoryId = selectedCategory?.categoryId || ''

    // Fetch services for that category
    try {
      const res = await getServiceByCategoryId(selectedCategoryId)

      setServiceOptions(res)

      // Find the selected service by name
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

    // Set the subservice being edited
    setSelectedSubServices([
      {
        subServiceName: row.name, // ✅ Prefill sub-service name
        serviceName: row.service,
        serviceId: row.serviceId,
      },
    ])
    console.log('Selected SubService:', selectedSubServices)
  }

  const handleConfirmDelete = async (serviceId) => {
    // const confirmed = window.confirm('Are you sure you want to delete this subservice?')
    if (!deleteServiceId) return

    try {
      const res = await deleteSubServiceData(deleteServiceId)
      console.log('🧪 Delete Response:', res)

      if (res?.data?.success === true) {
        toast.success(`${res.data.message || 'Subservice deleted successfully!'}`, {
          position: 'top-right',
        })
        await fetchSubServices()
      } else {
        toast.error('Failed to delete subservice.', { position: 'top-right' })
      }
    } catch (error) {
      console.error('❌ Delete error:', error)
      toast.error('Failed to delete subservice.', { position: 'top-right' })
    }
    setShowDeleteModal(false) // Close the modal after deletion
    setDeleteServiceId(null)
  }

  const columns = [
    {
      name: 'S.No',
      selector: (row, index) => index + 1,
      sortable: true,
      width: '120px',
    },
    {
      name: (
        <div
          style={{
            fontSize: '14px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          SubService
        </div>
      ),
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: (
        <div
          style={{
            fontSize: '14px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          Category
        </div>
      ),
      selector: (row) => row.category,
      sortable: true,
    },
    {
      name: (
        <div
          style={{
            fontSize: '14px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          Service
        </div>
      ),
      selector: (row) => row.service,
      sortable: true,
    },
    {
      name: (
        <div
          style={{
            fontSize: '14px',
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
            color="link"
            className="text-success p-0"
            onClick={() => handleCategoryEdit(row)}
            style={{ marginRight: '10px', width: '80px' }}
          >
            Edit
          </CButton>

          <CButton
            color="link"
            className="text-danger p-0"
            onClick={() => confirmDelete(row.id)}
            style={{ width: '80px' }}
          >
            Delete
          </CButton>
        </div>
      ),
    },
  ]

  // Load Categories on mount
  useEffect(() => {
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

    fetchCategories()
  }, [])

  const handleChanges = async (e) => {
    const { name, value } = e.target
    setErrors((prev) => ({ ...prev, [name === 'categoryName' ? 'category' : 'service']: '' }))
    console.log(name)
    if (name === 'categoryName') {
      console.log('Selected category ID:', value)
      const selectedCategory = category.find((cat) => cat.categoryId === value)
      console.log('Selected category:', selectedCategory)

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
    console.log('Edit Mode:', editMode)
    console.log('Edit SubService ID:', editSubServiceId)
    console.log('Selected SubServices:', selectedSubServices)

    try {
      if (editMode && editSubServiceId) {
        if (editMode && editSubServiceId) {
          const normalize = (val) => (val ? val.toString().trim().toLowerCase() : '')

          // 👇 Adjust the key below according to your actual data structure!
          const existingSubNames = Array.isArray(subServices)
            ? subServices
                .filter((s) => {
                  // Exclude the one you're currently editing
                  return (
                    s.subServiceId !== editSubServiceId &&
                    s._id !== editSubServiceId &&
                    s.id !== editSubServiceId
                  )
                })
                .map((s) => normalize(s.subServiceName))
            : []

          console.log('✅ Existing normalized names (excluding current):', existingSubNames)

          // Check each subService you're trying to save
          for (const sub of selectedSubServices) {
            const normalized = normalize(sub.subServiceName)
            if (existingSubNames.includes(normalized)) {
              toast.error(`SubService "${sub.subServiceName}" already exists!`)
              return // 🚫 Stop submission
            }
          }

          // ✅ If no duplicates found, proceed with update
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
              toast.success('SubService updated successfully!')
            } else {
              toast.error(res?.data?.message || 'Failed to update subservice.')
            }
          } catch (err) {
            console.error('❌ Update error:', err)
            toast.error(err.response?.data?.message || 'Error updating subservice')
          }

          return // ✅ Exit handleSubmit after edit logic
        } else {
          toast.error(res?.data?.message || 'Failed to update subservice.')
        }
      } else {
        // ✅ Before adding, check duplicates
        // normalize function
        const normalize = (val) => (val ? val.toString().trim().toLowerCase() : '')

        // ✅ make sure subServices array exists and is an array
        const existingSubNames = Array.isArray(subServices)
          ? subServices.map((s) => normalize(s.subServiceName))
          : []

        // new subservices to be added
        for (const sub of selectedSubServices) {
          const normalized = normalize(sub.subServiceName)
          if (existingSubNames.includes(normalized)) {
            toast.error(`SubService "${sub.subServiceName}" already exists!`)
            return // 🚫 Stop submission
          }
        }

        // ✅ if no duplicates found, continue
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
            toast.success('SubServices added successfully')
          } else {
            toast.error(res?.data?.message || 'Submission failed')
          }
        } catch (err) {
          console.error('Error submitting subservices:', err)
          toast.error(err.response?.data?.message || 'Error submitting subservices')
        }
      }

      // ✅ Reset fields after success
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

  console.log(subServices)

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSubServices(subServices)
    } else {
      const lowerSearch = searchQuery.toLowerCase()
      console.log(lowerSearch)
      const filtered = subServices.filter(
        (item) =>
          item.category?.toLowerCase()?.startsWith(lowerSearch) ||
          item.service?.toLowerCase()?.startsWith(lowerSearch) ||
          item.name?.toLowerCase()?.startsWith(lowerSearch),
      )
      console.log(filtered)
      setFilteredSubServices(filtered)
    }
  }, [searchQuery, subServices])

  return (
    <div className="container-fluid p-4">
      <ToastContainer />
      <CRow>
        <CCol md={6}>
          <div className="d-flex justify-content-start mb-3">
            <CFormInput
              type="text"
              placeholder="Search by Category, Service, SubService"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CCol>
      </CRow>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>SubService Management</h4>
        <CButton
          color="primary"
          onClick={() => {
            setEditMode(false) // ✅ Reset edit mode
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
          + Add New SubService
        </CButton>
      </div>
      {/* Modal Form */}
      <DataTable
        columns={columns}
        data={filteredSubServices}
        pagination
        highlightOnHover
        striped
        dense
      />

      <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg" backdrop="static">
        <div className="p-4">
          {/* <h5 className="mb-4">➕ Add New SubService</h5> */}
          <h5 className="mb-4">{editMode ? 'Edit Sub Service' : '➕ Add New SubService'}</h5>
          <CRow className="g-4">
            {/* Category Select */}
            <CCol md={6}>
              <h6>
                Category <span className="text-danger">*</span>
              </h6>
              <CFormSelect
                name="categoryName"
                value={newService.categoryId || ''}
                onChange={handleChanges}
                disabled={editMode}
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

            {/* Service Select */}
            <CCol md={6}>
              <h6>
                Service <span className="text-danger">*</span>
              </h6>
              <CFormSelect
                name="serviceName"
                value={newService.serviceId || ''}
                onChange={handleChanges}
                disabled={editMode}
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

            {/* SubService Entry */}
            <CCol md={12}>
              <h6>{editMode ? 'Edit Sub Service' : 'Add Sub Services'}</h6>

              {/* Add Mode: Input + Button */}
              {!editMode && (
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <CFormInput
                    placeholder="Enter Sub Service"
                    value={subServiceInput}
                    onChange={(e) => {
                      setSubServiceInput(e.target.value)
                      if (e.target.value.trim() !== '') {
                        setErrors((prev) => ({ ...prev, subService: '' }))
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
                      if (!trimmedInput) return

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
                        toast.warn('Subservice already added for this service!', {
                          position: 'top-right',
                          autoClose: 2000,
                        })
                        return
                      }

                   setSelectedSubServices((prev) => {
  const updated = [...prev, newEntry];
  if (updated.length > 0) {
    setErrors((prevErrors) => ({ ...prevErrors, subService: '' }));
  }
  return updated;
});
                      setSubServiceInput('')
                    }}
                  >
                    Add
                  </CButton>
                </div>
              )}

              {/* Edit Mode: Single Input Field */}
              {editMode && (
                <CFormInput
                  placeholder="Edit Sub Service"
                  value={
                    selectedSubServices.length > 0 ? selectedSubServices[0].subServiceName : ''
                  }
                  onChange={(e) =>
                    setSelectedSubServices([
                      { ...selectedSubServices[0], subServiceName: e.target.value },
                    ])
                  }
                />
              )}

              {/* Show List of Subservices only in Add Mode */}
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

              {/* Confirmation Modal */}
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

          {/* Modal Footer Buttons */}
          <div className="d-flex justify-content-end gap-2 mt-4">
            <CButton color="secondary" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </CButton>

            <CButton
              color="primary"
              className="text-white"
              onClick={async () => {
                // ✅ validate first
                const isValid = validateFields()
                if (!isValid) return // 🚫 stop here if validation fails

                // ✅ if valid, then submit
                await handleSubmit()
                setShowModal(false) // close only after success
              }}
            >
              <h6>{editMode ? 'Update Sub Service' : 'Add SubService'}</h6>
            </CButton>
          </div>
        </div>
      </CModal>

      {showDeleteModal && (
        <ConfirmationModal
          isVisible={showDeleteModal}
          message="Are you sure you want to delete this service?"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
       
      )}
    </div>
  )
}

export default AddSubService
