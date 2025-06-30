import React, { useEffect, useState } from 'react'
import axios from 'axios'
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
  CListGroup,
  CCol,
  CFormSelect,
  CHeader,
  CListGroupItem,
} from '@coreui/react'
import DataTable from 'react-data-table-component'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'
import { FaTrash, FaPlus } from 'react-icons/fa'

import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
  serviceData,
  CategoryData,
  postServiceData,
  updateServiceData,
  deleteServiceData,
  subServiceData,
} from './ServiceManagementAPI'
import {
  // subService_URL,
  getservice,
  MainAdmin_URL,
  getadminSubServicesbyserviceId,
  BASE_URL,
} from '../../baseUrl'

const ServiceManagement = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [service, setService] = useState([])
  const [category, setCategory] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [timeInput, setTimeInput] = useState('')
  const [timeSlots, setTimeSlots] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [viewService, setViewService] = useState(null)
  const [editServiceMode, setEditServiceMode] = useState(false)
  const [question, setQuestion] = useState('')
  const [answerInput, setAnswerInput] = useState('')
  const [answers, setAnswers] = useState([])
  const [qaList, setQaList] = useState([])
  const [serviceOptions, setServiceOptions] = useState([])
  const [subServiceOptions, setSubServiceOptions] = useState([])
  const [selectedSubService, setSelectedSubService] = useState('')

  const [serviceToEdit, setServiceToEdit] = useState({
    serviceImage: '',
    viewImage: '',
    subServiceName: '',
  })

  const [newService, setNewService] = useState({
    categoryName: '',
    categoryId: '',
    subServiceName: '',
  })
  const [modalMode, setModalMode] = useState('add') // or 'edit'

  // Open for adding
  const openAddModal = () => {
    setModalMode('add')
    setNewService({})
    setModalVisible(true)
  }

  // Open for editing
  const openEditModal = (service) => {
    setModalMode('edit')
    setNewService(service) // Load existing data
    setSelectedSubService(service.subServiceId)
    setModalVisible(true)
  }

  const addAnswer = () => {
    if (answerInput.trim()) {
      setAnswers([...answers, answerInput.trim()])
      setAnswerInput('')
    }
  }

  const removeAnswer = (answerToRemove) => {
    setAnswers(answers.filter((ans) => ans !== answerToRemove))
  }
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [serviceIdToDelete, setServiceIdToDelete] = useState(null)
  const [errors, setErrors] = useState({
    subServiceName: '',
    serviceName: '',
    serviceId: '',
    categoryName: '',
    // description: '',
    price: '',
    status: '',
    taxPercentage: '',
    descriptionQA: '',
    answers: '',
    minTime: '',
    discount: '',
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
      setService(serviceResponse.data)
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to fetch data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // serviceData()
  }, [])
  const addTimeSlot = () => {
    // Split input by commas, trim whitespace, convert to uppercase
    const newSlots = timeInput
      .split(',')
      .map((slot) => slot.trim().toUpperCase())
      .filter((slot) => slot !== '')

    // Filter out duplicates
    const uniqueNewSlots = newSlots.filter((slot) => !timeSlots.startsWith(slot))

    // Add the new unique slots
    if (uniqueNewSlots.length > 0) {
      setTimeSlots([...timeSlots, ...uniqueNewSlots])
    }

    setTimeInput('')
  }

  useEffect(() => {
    const handleSearch = () => {
      const trimmedQuery = searchQuery.toLowerCase().trim()

      if (!trimmedQuery) {
        setFilteredData([])
        return
      }

      const filtered = service.filter((item) => {
        const subServiceNameMatch = item.subServiceName?.toLowerCase().startsWith(trimmedQuery)
        const serviceNameMatch = item.serviceName?.toLowerCase().startsWith(trimmedQuery)
        const categoryNameMatch = item.categoryName?.toLowerCase().startsWith(trimmedQuery)
        // const priceMatch = item.price?.toLowerCase().startsWith(trimmedQuery)

        return subServiceNameMatch || serviceNameMatch || categoryNameMatch
      })

      setFilteredData(filtered)
    }

    handleSearch()
  }, [searchQuery, service])

  const columns = [
    {
      name: 'S.No',
      selector: (row, index) => index + 1,
      width: '50px',
      sortable: false,
    },
    {
      name: 'SubService Name',
      selector: (row) => row.subServiceName,
      sortable: true,
      width: '200px',
    },
    {
      name: 'Service Name',
      selector: (row) => row.serviceName,
      width: '200px',
    },
    {
      name: 'Category Name',
      selector: (row) => row.categoryName,
      width: '180px',
    },
    {
      name: 'Price',
      selector: (row) => row.price,
      width: '100px',
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
          <div
            color="primary"
            onClick={() => setViewService(row)}
            style={{ marginRight: '5px', width: '50px', color: 'green' }}
          >
            View
          </div>
          <div
            color="primary"
            onClick={() => openEditModal(row)}
            style={{ marginRight: '5px', width: '50px', color: 'blue' }}
          >
            Edit
          </div>
          <div
            color="danger"
            onClick={() => handleServiceDelete(row)}
            style={{ width: '50px', color: 'red' }}
          >
            Delete
          </div>

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
      <CModal visible={isVisible} onClose={onCancel} backdrop={false}>
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

    // if (!newService.description) {
    //   newErrors.description = 'Description is Required.'
    // }

    if (!newService.price) {
      newErrors.price = 'price is required.'
    } else if (isNaN(newService.price)) {
      newErrors.price = 'price must be a valid number.'
    } else if (parseFloat(newService.price) < 0) {
      newErrors.price = 'price cannot be a negative number.'
    }

    if (!newService.status) {
      newErrors.status = 'Status is required.'
    }

    if (!newService.discount && newService.discount !== 0) {
      newErrors.discount = 'Discount is required.'
    } else if (parseFloat(newService.discount) < 0) {
      newErrors.discount = 'Discount cannot be a negative number.'
    }
    if (!newService.taxPercentage && newService.taxPercentage !== 0) {
      newErrors.taxPercentage = 'taxPercentage is required.'
    } else if (parseFloat(newService.taxPercentage) < 0) {
      newErrors.taxPercentage = 'taxPercentage cannot be a negative number.'
    }
    if (!newService.minTime || isNaN(newService.minTime)) {
      newErrors.minTime = 'Minimum time is required and must be a Minutes.'
    } else if (parseFloat(newService.minTime) <= 0) {
      newErrors.minTime = 'Minimum time must be greater than zero.'
    }

    if (!newService.viewDescription) {
      newErrors.viewDescription = 'View description is Required.'
    }

    if (!newService.serviceImage) {
      console.log('Service Image in Form:', newService.serviceImage)
      newErrors.serviceImage = 'Please upload a service image.'
    }

    if (!newService.categoryId) {
      newErrors.categoryId = 'Please select a valid category.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const saveCurrentQA = () => {
    if (question.trim() && answers.length > 0) {
      const newQA = { [question.trim()]: [...answers] }
      setQaList((prev) => [...prev, newQA])
      setQuestion('')
      setAnswers([])
    }
  }

  const buildDescriptionQA = () => {
    const finalQA = [...qaList]

    // Include the latest unsaved input, if any
    if (question.trim() && answers.length > 0) {
      finalQA.push({ [question.trim()]: [...answers] })
    }

    return finalQA
  }

  const handleAddService = async () => {
    console.log('iam from handleAddService calling')

    console.log('Calling validateForm...')
    if (!validateForm()) {
      console.log('Validation failed')
      setModalVisible(true)
      return
    }
    setModalVisible(false)
    try {
      console.log('iam from try calling')
      const payload = {
        hospitalId: localStorage.getItem('HospitalId'),
        subServiceName: newService.subServiceName,
        // serviceID: newService.serviceId,
        // serviceName: newService.serviceName,
        // categoryName: newService.categoryName,
        // categoryId: newService.categoryId,
        // description: newService.description,//
        price: newService.price,
        discountPercentage: newService.discount,
        taxPercentage: newService.taxPercentage,
        minTime: newService.minTime,
        status: newService.status,
        subServiceImage: newService.serviceImage,
        descriptionQA: buildDescriptionQA(),
        viewDescription: newService.viewDescription,
        platformFeePercentage: '10',
      }
      console.log(payload)
      console.log(newService.subServiceId)

      const response = await postServiceData(payload, newService.subServiceId)

      if (response.status === 201) {
        toast.success(response.data.message, { position: 'top-right' })
        fetchData()
        serviceData()
      } else if (response.status === 500) {
        toast.error(error.response?.data?.message, { position: 'top-right' })
      }
    } catch (error) {
      console.error('Error response:', error.response)
      toast.error(error.response?.data?.message, { position: 'top-right' })
    }

    setNewService({
      subServiceName: '',
      serviceName: '',
      serviceid: '',
      categoryName: '',
      // description: '',
      price: '',
      discount: 0,
      minTime: '',
      taxPercentage: 0,
      status: '',
      serviceImage: '',
      viewImage: '',
      viewDescription: '',
      categoryId: '',
    })
    setQaList([]) // reset Q&A
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
    setTimeout(() => {
      document.querySelector('#serviceNameInput')?.focus()
    }, 100) // or use useRef
  }

  const handleServiceFileChange = (e) => {
    const file = e.target.files[0]

    if (file) {
      const reader = new FileReader()

      reader.onloadend = () => {
        console.log('Base64 String:', reader.result)
        // let base64String = reader.result
        // if (base64String) {
        //   base64String = base64String.split(',')[1]
        // }
        let base64String = reader.result.split(',')[1]
        setNewService((prev) => ({
          ...prev,
          serviceImage: base64String,
          serviceImageFile: file, // Keep original file reference
        }))

        setServiceToEdit((prev) => ({
          ...prev,
          serviceImage: base64String,
          serviceImageFile: file, // optional if you show file name
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
    // if (!serviceToEdit.description?.trim()) newErrors.description = 'Description is required.'
    if (!serviceToEdit.price || isNaN(serviceToEdit.price) || serviceToEdit.price <= 0) {
      newErrors.price = 'price must be a valid positive number.'
    }
    if (!serviceToEdit.discount || isNaN(serviceToEdit.discount) || serviceToEdit.discount < 0) {
      newErrors.discount = 'Discount must be a valid number (0 or more).'
    }
    if (
      !serviceToEdit.taxPercentage ||
      isNaN(serviceToEdit.taxPercentage) ||
      serviceToEdit.taxPercentage < 0
    ) {
      newErrors.taxPercentage = 'taxPercentage must be a valid number (0 or more).'
    }
    if (!serviceToEdit.minTime?.trim()) newErrors.minTime = 'Minimum time is required.'
    if (!serviceToEdit.viewDescription?.trim())
      newErrors.viewDescription = 'View description is required.'

    setEditErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleUpdateService = async () => {
    console.log('Updated calling')
    // if (!validateEditForm()) return

    try {
      const updatedService = {
        ...serviceToEdit,
        serviceImage: serviceToEdit.serviceImage, // base64 string already
        viewImage: serviceToEdit.viewImage || '', // optional fallback
      }
      const hospitalId = localStorage.getItem('hospitalId')

      console.log('Updating service:', hospitalId, serviceToEdit.serviceId)

      const response = await updateServiceData(serviceToEdit.serviceId, hospitalId, updatedService)

      console.log('Updated response:', response)
      toast.success('Service updated successfully!', { position: 'top-right' })
      setEditServiceMode(false)
      fetchData() // refresh list
    } catch (error) {
      console.error('Update failed:', error)
      toast.error('Error updating service.', { position: 'top-right' })
    }
  }

  const handleEditServiceFileChange = (e) => {
    const file = e.target.files[0]

    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        let base64String = reader.result
        if (base64String) {
          base64String = base64String.split(',')[1] // remove prefix
        }

        setServiceToEdit((prev) => ({
          ...prev,
          serviceImage: base64String,
          serviceImageFile: file, // optional if you want to show file name
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
    console.log(serviceId)

    setServiceIdToDelete(serviceId.subServiceId)
    setIsModalVisible(true)
  }

  const handleConfirmDelete = async () => {
    console.log(serviceIdToDelete)
    const hospitalId = localStorage.getItem('HospitalId')
    try {
      const result = await deleteServiceData(serviceIdToDelete, hospitalId)
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
      // description: '',
      price: '',
      discount: 0,
      taxPercentage: 0,
      minTime: '',
      status: '',
      serviceImage: '',
      viewImage: '',
      viewDescription: '',
      categoryId: '',
    })
    setModalVisible(false)

    setErrors({})
  }

  const handleChanges = async (e) => {
    const { name, value } = e.target

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
        const res = await axios.get(`${BASE_URL}/${getservice}/${value}`)
        const serviceList = res.data?.data || []
        setServiceOptions(serviceList)
      } catch (err) {
        console.error('Failed to fetch services:', err)
        setServiceOptions([])
      }
    } else if (name === 'serviceName') {
      const selectedService = serviceOptions.find((s) => s.serviceName === value)

      const serviceId = selectedService?.serviceId || ''
      setNewService((prev) => ({
        ...prev,
        serviceName: value,
        serviceId,
      }))

      // ✅ Fetch subservices now
      if (serviceId) {
        const subRes = await subServiceData(serviceId)
        const subList = subRes.data

        let allSubServices = []
        if (Array.isArray(subList)) {
          allSubServices = subList.flatMap((item) => item.subServices || [])
        } else if (subList && subList.subServices) {
          allSubServices = subList.subServices
        }
        setSubServiceOptions({ subServices: allSubServices })
      }
    } else {
      setNewService((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  return (
    <div style={{ overflow: 'hidden' }}>
      <ToastContainer />

      <div>
        <CForm className="d-flex justify-content-end mb-3">
          <CInputGroup className="mb-3" style={{ marginRight: '20px', width: '400px' }}>
            <CFormInput
              type="text"
              placeholder="Search by ServiceName, Category"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ height: '40px' }}
            />
            <CInputGroupText style={{ height: '40px' }}>
              <CIcon icon={cilSearch} />
            </CInputGroupText>
          </CInputGroup>
          {/* <CButton
            color="success"
            style={{ height: '40px', marginRight: '10px', color: 'white' }}
            onClick={() => setModalVisible(true)}
          >
            Add SubService
          </CButton> */}
          <CButton color="primary" style={{ height: '40px' }} onClick={() => openAddModal()}>
            Add SubService Details
          </CButton>
        </CForm>
      </div>

      {viewService && (
        <CModal visible={!!viewService} onClose={() => setViewService(null)} size="xl">
          <CModalHeader>
            <CModalTitle className="w-100 text-center text-primary fs-4">
              SubService Details
            </CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CRow className="mb-3">
              <CCol sm={6}>
                <strong>SubService Name:</strong>
                <div>{viewService.subServiceName}</div>
              </CCol>
              <CCol sm={6}>
                <strong>SubService ID:</strong>
                <div>{viewService.subServiceId}</div>
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={6}>
                <strong>Service Name:</strong>
                <div>{viewService.serviceName}</div>
              </CCol>
              <CCol sm={6}>
                <strong>Service Id:</strong>
                <div>{viewService.serviceID}</div>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol sm={6}>
                <strong>Category Name:</strong>
                <div>{viewService.categoryName}</div>
              </CCol>
              <CCol sm={6}>
                <strong>Category Id:</strong>
                <div>{viewService.categoryId}</div>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol sm={6}>
                <strong>Status:</strong>
                <div>{viewService.status}</div>
              </CCol>
              {/* <CCol sm={6}>
                <strong>Description:</strong>
                <div>{viewService.description}</div>
              </CCol> */}
            </CRow>

            <hr />

            <CRow className="mb-3">
              <CCol sm={4}>
                <strong>Price:</strong>
                <div>₹{Number(viewService.price).toFixed(0)}</div>
              </CCol>
              <CCol sm={4}>
                <strong>Discount %:</strong>
                <div>{viewService.discountPercentage}%</div>
              </CCol>
              <CCol sm={4}>
                <strong>Discount Amount:</strong>
                <div>₹{viewService.discountAmount}</div>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol sm={4}>
                <strong>Discounted Cost:</strong>
                <div>₹{viewService.discountedCost}</div>
              </CCol>
              <CCol sm={4}>
                <strong>Tax %:</strong>
                <div>{viewService.taxPercentage}%</div>
              </CCol>
              <CCol sm={4}>
                <strong>Tax Amount:</strong>
                <div>₹{viewService.taxAmount}</div>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol sm={4}>
                <strong>Platform Fee %:</strong>
                <div>{viewService.platformFeePercentage}%</div>
              </CCol>
              <CCol sm={4}>
                <strong>Platform Fee:</strong>
                <div>₹{viewService.platformFee}</div>
              </CCol>
              <CCol sm={4}>
                <strong>Clinic Pay:</strong>
                <div>₹{viewService.clinicPay}</div>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol sm={4}>
                <strong>Final Cost:</strong>
                <div>₹{viewService.finalCost}</div>
              </CCol>
            </CRow>

            <hr />

            <CRow className="mb-3">
              <CCol sm={12}>
                <strong className="mb-3">Description QA:</strong>
                {Array.isArray(viewService.descriptionQA) &&
                viewService.descriptionQA.length > 0 ? (
                  viewService.descriptionQA.map((qa, index) => {
                    const question = Object.keys(qa)[0]
                    const answers = qa[question]
                    return (
                      <div key={index} style={{ marginBottom: '10px' }}>
                        <strong>{question}</strong>
                        <ul>
                          {answers.map((ans, i) => (
                            <li key={i}>{ans}</li>
                          ))}
                        </ul>
                      </div>
                    )
                  })
                ) : (
                  <div>No Q&A available</div>
                )}
              </CCol>
            </CRow>

            <hr />

            <CRow>
              <CCol sm={6}>
                <strong>Service Image:</strong>
                {viewService.subServiceImage ? (
                  <div className="mt-2">
                    <img
                      src={`data:image/png;base64,${viewService.subServiceImage}`}
                      alt="Service"
                      style={{ width: '100%', maxWidth: '250px', borderRadius: '8px' }}
                    />
                  </div>
                ) : (
                  <div>No image available</div>
                )}
              </CCol>
              <CCol sm={6}>
                <strong>View Description:</strong>
                <div>{viewService.viewDescription}</div>
              </CCol>
            </CRow>
          </CModalBody>

          <CModalFooter>
            <CButton color="secondary" onClick={() => setViewService(null)}>
              Close
            </CButton>
          </CModalFooter>
        </CModal>
      )}

      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="xl">
        <CModalHeader>
          <CModalTitle style={{ textAlign: 'center', width: '100%' }}>
            {modalMode === 'edit' ? 'Edit SubService Details' : 'Add New SubService Details'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow className="mb-4">
              <CCol md={6}>
                <h6>
                  Category Name <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormSelect
                  value={newService.categoryId || ''}
                  onChange={handleChanges}
                  aria-label="Select Category"
                  name="categoryName"
                  disabled={modalMode === 'edit'} // 🔒 Disable in edit mode
                >
                  <option value="">Select a Category</option>
                  {category?.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryName}
                    </option>
                  ))}
                </CFormSelect>

                {errors.categoryName && (
                  <CFormText className="text-danger">{errors.categoryName}</CFormText>
                )}
              </CCol>
              <CCol md={6}>
                <h6>
                  Service Name <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormSelect
                  name="serviceName"
                  value={newService.serviceName || ''}
                  onChange={handleChanges}
                  disabled={modalMode === 'edit'} // 🔒 Disable in edit mode
                >
                  <option value="">Select Service</option>
                  {serviceOptions.map((service) => (
                    <option key={service.serviceId} value={service.serviceName}>
                      {service.serviceName}
                    </option>
                  ))}
                </CFormSelect>

                {errors.serviceName && (
                  <CFormText className="text-danger">{errors.serviceName}</CFormText>
                )}
              </CCol>
            </CRow>
            <CRow className="mb-4">
              <CCol md={6}>
                <h6>
                  Sub Service <span className="text-danger">*</span>
                </h6>
                <CFormSelect
                  name="subServiceId"
                  value={selectedSubService}
                  onChange={(e) => {
                    const selectedId = e.target.value
                    setSelectedSubService(selectedId)

                    // Find selected sub-service object
                    const selectedObj = subServiceOptions?.subServices?.find(
                      (s) => s.subServiceId === selectedId,
                    )

                    setNewService((prev) => ({
                      ...prev,
                      subServiceId: selectedId,
                      subServiceName: selectedObj?.subServiceName || '',
                    }))
                  }}
                >
                  <option value="">Select Sub Service</option>
                  {Array.isArray(subServiceOptions.subServices) &&
                    subServiceOptions.subServices.map((sub) => (
                      <option key={sub.subServiceId} value={sub.subServiceId}>
                        {sub.subServiceName}
                      </option>
                    ))}
                </CFormSelect>

                {errors.description && (
                  <CFormText className="text-danger">{errors.subServiceName}</CFormText>
                )}
              </CCol>
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
            </CRow>

            <CRow className="mb-4">
              <CCol md={6}>
                <h6>
                  Status <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormSelect value={newService.status || ''} onChange={handleChange} name="status">
                  <option value="">Select</option>
                  <option value="Active">Active</option>
                  <option value="Active">Inactive</option>
                </CFormSelect>
                {errors.status && <CFormText className="text-danger">{errors.status}</CFormText>}
              </CCol>
              <CCol md={6}>
                <h6>
                  Price <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="number"
                  placeholder="Price"
                  value={newService.price || ''}
                  name="price"
                  onChange={handleChange}
                  min={1}
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === 'e') e.preventDefault()
                  }}
                />
                {errors.price && <CFormText className="text-danger">{errors.price}</CFormText>}
              </CCol>
            </CRow>
            <CRow className="mb-4">
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
              <CCol md={6}>
                <h6>
                  TaxPercentage % <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput
                  type="number"
                  placeholder="Tax Percentage"
                  value={newService.taxPercentage || ''}
                  name="taxPercentage"
                  onChange={handleChange}
                  min={1}
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === 'e') e.preventDefault()
                  }}
                />
                {errors.taxPercentage && (
                  <CFormText className="text-danger">{errors.taxPercentage}</CFormText>
                )}
              </CCol>
            </CRow>

            <CRow className="mb-4">
              <CCol>
                <div className="mb-4">
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
              <CCol md={12}>
                <h6>
                  Service Image <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput type="file" onChange={handleServiceFileChange} />
                {errors.serviceImage && (
                  <CFormText className="text-danger">{errors.serviceImage}</CFormText>
                )}
              </CCol>
              {/* <CCol md={6}>
                <h6>
                  Banner Image <span style={{ color: 'red' }}>*</span>
                </h6>
                <CFormInput type="file" onChange={handleBannerFileChange} />
                {errors.bannerImage && (
                  <CFormText className="text-danger">{errors.bannerImage}</CFormText>
                )}
              </CCol> */}
            </CRow>
            <CCol md={12}>
              <label className="mb-2">Question</label>
              <CFormInput
                placeholder="Enter your question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />

              <label className="mt-3">Answers</label>
              <CInputGroup className="mb-2">
                <CFormInput
                  placeholder="Enter answer"
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                />
                <CButton color="success" onClick={addAnswer} className="text-white">
                  <FaPlus />
                </CButton>
              </CInputGroup>

              {answers.length > 0 && (
                <CListGroup className="mb-3">
                  {answers.map((ans, idx) => (
                    <CListGroupItem
                      key={idx}
                      className="d-flex justify-content-between align-items-center"
                    >
                      {ans}
                      <FaTrash
                        onClick={() => removeAnswer(ans)}
                        style={{ color: 'gray', cursor: 'pointer' }}
                      />
                    </CListGroupItem>
                  ))}
                </CListGroup>
              )}
              <CButton color="info" className="mb-3 text-white" onClick={saveCurrentQA}>
                Save Q&A
              </CButton>

              {qaList.length > 0 && (
                <>
                  <h6 className="mt-4">Saved Questions & Answers</h6>
                  {qaList.map((qaItem, index) => {
                    const questionText = Object.keys(qaItem)[0]
                    const answerList = qaItem[questionText]

                    return (
                      <div key={index} className="mb-3">
                        <strong>{questionText}</strong>
                        <ul>
                          {answerList.map((ans, idx) => (
                            <li key={idx}>{ans}</li>
                          ))}
                        </ul>
                        <FaTrash
                          onClick={() => removeQA(index)}
                          style={{ color: 'red', cursor: 'pointer' }}
                        />
                      </div>
                    )
                  })}
                </>
              )}
            </CCol>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={AddCancel}>
            Cancel
          </CButton>
          <CButton
            color="primary"
            onClick={modalMode === 'edit' ? handleUpdateService : handleAddService}
          >
            {modalMode === 'edit' ? 'Update' : 'Add'}
          </CButton>
        </CModalFooter>
      </CModal>
      <CModal visible={editServiceMode} onClose={() => setEditServiceMode(false)} size="xl">
        <CModalHeader>
          <CModalTitle style={{ textAlign: 'center', width: '100%' }}>Edit Service</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow className="mb-4">
              <CCol md={6}>
                <h6>Sub Service Name</h6>
                <CFormInput type="text" value={serviceToEdit?.subServiceName || ''} disabled />
              </CCol>
              <CCol md={6}>
                <h6>Service Name</h6>
                <CFormInput
                  type="text"
                  value={serviceToEdit?.serviceName || ''}
                  onChange={(e) =>
                    setServiceToEdit({ ...serviceToEdit, serviceName: e.target.value })
                  }
                />
              </CCol>
            </CRow>

            <CRow className="mb-4">
              <CCol md={6}>
                <h6>Description</h6>
                <CFormInput
                  type="text"
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
                <h6>Status</h6>
                <CFormSelect
                  value={serviceToEdit?.status || ''}
                  onChange={(e) => setServiceToEdit({ ...serviceToEdit, status: e.target.value })}
                >
                  <option value="">Select</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </CFormSelect>
              </CCol>
            </CRow>

            <CRow className="mb-4">
              <CCol md={6}>
                <h6>Price</h6>
                <CFormInput
                  type="number"
                  value={serviceToEdit?.price || ''}
                  onChange={(e) => setServiceToEdit({ ...serviceToEdit, price: e.target.value })}
                />
                {editErrors.price && (
                  <CFormText className="text-danger">{editErrors.price}</CFormText>
                )}
              </CCol>

              <CCol md={6}>
                <h6>Discount %</h6>
                <CFormInput
                  type="number"
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
                <h6>Tax Percentage %</h6>
                <CFormInput
                  type="number"
                  value={serviceToEdit?.taxPercentage || ''}
                  onChange={(e) =>
                    setServiceToEdit({ ...serviceToEdit, taxPercentage: e.target.value })
                  }
                />
                {editErrors.taxPercentage && (
                  <CFormText className="text-danger">{editErrors.taxPercentage}</CFormText>
                )}
              </CCol>

              <CCol md={6}>
                <h6>Min Time (in minutes)</h6>
                <CFormInput
                  type="number"
                  value={serviceToEdit?.minTime || ''}
                  onChange={(e) => setServiceToEdit({ ...serviceToEdit, minTime: e.target.value })}
                />
                {editErrors.minTime && (
                  <CFormText className="text-danger">{editErrors.minTime}</CFormText>
                )}
              </CCol>
            </CRow>

            <CRow className="mb-4">
              <CCol md={6}>
                <h6>View Description</h6>
                <CFormInput
                  type="text"
                  value={serviceToEdit?.viewDescription || ''}
                  onChange={(e) =>
                    setServiceToEdit({ ...serviceToEdit, viewDescription: e.target.value })
                  }
                />
                {editErrors.viewDescription && (
                  <CFormText className="text-danger">{editErrors.viewDescription}</CFormText>
                )}
              </CCol>

              <CCol md={6}>
                <h6>Q&A Description</h6>
                <CFormInput
                  type="text"
                  value={serviceToEdit?.descriptionQA || ''}
                  onChange={(e) =>
                    setServiceToEdit({ ...serviceToEdit, descriptionQA: e.target.value })
                  }
                />
              </CCol>
            </CRow>

            <CRow className="mb-4">
              <CCol md={6}>
                <h6>Answers</h6>
                <CFormInput
                  type="text"
                  value={serviceToEdit?.answers || ''}
                  onChange={(e) => setServiceToEdit({ ...serviceToEdit, answers: e.target.value })}
                />
              </CCol>

              <CCol md={6}>
                <h6>Service Image</h6>
                <CFormInput type="file" onChange={handleEditServiceFileChange} />
                {serviceToEdit?.serviceImageFile?.name && (
                  <CFormText>Selected: {serviceToEdit.serviceImageFile.name}</CFormText>
                )}
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
        <DataTable
          columns={columns}
          data={filteredData.length > 0 ? filteredData : service}
          pagination
          highlightOnHover
          pointerOnHover
        />
      )}
    </div>
  )
}

export default ServiceManagement
