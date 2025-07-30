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
  GetSubServices_ByClinicId,
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
  const [subServiceId, setSubServiceId] = useState('')
  const [previewImage, setPreviewImage] = useState(null)
  const [serviceToEdit, setServiceToEdit] = useState({
    serviceImage: '',
    viewImage: '',
    subServiceName: '',
    serviceName: '',
    serviceImageFile: null,
  })

  let descriptionQA = []
  try {
    if (typeof service.descriptionQA === 'string') {
      descriptionQA = JSON.parse(service.descriptionQA)
    } else {
      descriptionQA = service.descriptionQA || []
    }
  } catch (err) {
    console.error('Invalid descriptionQA format:', err)
  }

  const [newService, setNewService] = useState({
    categoryName: '',
    categoryId: '',
    serviceName: '',
    subServiceName: '',
  })
  const [modalMode, setModalMode] = useState('add') // or 'edit'

  // Open for adding
  const openAddModal = () => {
    setModalMode('add')
    setQaList([])
    setAnswers([])
    setQuestion('')
    setSelectedSubService('')
    setNewService({
      categoryName: '',
      categoryId: '',
      serviceName: '',
      serviceId: '',
      subServiceId: '',
      subServiceName: '',

      price: '',
      discount: 0,
      minTime: '',
      taxPercentage: 0,
      status: '',
      serviceImage: '',
      serviceImageFile: null,
      viewImage: '',
      viewDescription: '',
      platformFeePercentage: 0,
      descriptionQA: [],
    })
    setModalVisible(true)
  }

  // Open for editing

  const openEditModal = async (service) => {
    console.log(service.subServiceId)
    setSubServiceId(service.subServiceId)
    setModalMode('edit')
    setModalVisible(true)

    // 1. Set selected category
    const selectedCategory = category.find((cat) => cat.categoryName === service.categoryName)
    const categoryId = selectedCategory?.categoryId || ''

    // 2. Fetch services under this category
    let fetchedServiceOptions = []
    try {
      const res = await axios.get(`${BASE_URL}/${getservice}/${categoryId}`)
      fetchedServiceOptions = res.data?.data || []
      setServiceOptions(fetchedServiceOptions)
    } catch (err) {
      console.error('Error fetching service list:', err)
    }

    const selectedService = fetchedServiceOptions.find((s) => s.serviceName === service.serviceName)
    const serviceId = selectedService?.serviceId || ''

    // 3. Fetch subservices
    let subServiceList = []
    if (serviceId) {
      try {
        const subRes = await subServiceData(serviceId)
        const subList = subRes.data
        if (Array.isArray(subList)) {
          subServiceList = subList.flatMap((item) => item.subServices || [])
        } else if (subList?.subServices) {
          subServiceList = subList.subServices
        }
      } catch (err) {
        console.error('Error fetching subservices:', err)
      }
    }

    setSubServiceOptions({ subServices: subServiceList })

    // Get valid subServiceId and name
    const selectedSubServiceObj = subServiceList.find(
      (s) => s.subServiceName === service.subServiceName,
    )

    const resolvedSubServiceId = selectedSubServiceObj?.subServiceId || ''
    const resolvedSubServiceName = selectedSubServiceObj?.subServiceName || ''

    setSelectedSubService(resolvedSubServiceId)
    const formattedQA = Array.isArray(service.descriptionQA)
      ? service.descriptionQA
      : JSON.parse(service.descriptionQA || '[]')

    const rawImage = service.serviceImage || ''
    const fullImage = rawImage.startsWith('data:') ? rawImage : `data:image/jpeg;base64,${rawImage}`

    // Prefill all fields
    setNewService({
      subServiceId: resolvedSubServiceId,
      subServiceName: resolvedSubServiceName,
      serviceName: service.serviceName || '',
      serviceId: serviceId,
      categoryName: service.categoryName || '',
      categoryId: categoryId || '',
      price: service.price || '',
      discount: service.discountPercentage || 0,
      taxPercentage: service.taxPercentage || 0,
      minTime: service.minTime || '',
      serviceImage: rawImage,

      serviceImageFile: null,
      status: service.status || '',
      viewDescription: service.viewDescription || '',

      platformFeePercentage: service.platformFeePercentage || 0,
      descriptionQA: formattedQA,
      viewImage: service.viewImage || '',
    })
    setQaList(formattedQA)
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

      const hospitalId = localStorage.getItem('HospitalId') // ✅ current hospital
      if (hospitalId) {
        const subServiceData = await GetSubServices_ByClinicId(hospitalId)

        if (Array.isArray(subServiceData)) {
          // you might need to flatten if response is nested
          // but usually GetSubServices_ByClinicId should return a clean array
          setService(subServiceData)
        } else {
          setService([])
          console.warn('No subservices found for this hospital.')
        }
      } else {
        console.warn('No hospitalId found in localStorage.')
        setService([])
      }
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

  useEffect(() => {
    if (
      editServiceMode &&
      serviceToEdit?.descriptionQA &&
      typeof serviceToEdit.descriptionQA === 'string'
    ) {
      try {
        setServiceToEdit((prev) => ({
          ...prev,
          descriptionQA: JSON.parse(prev.descriptionQA),
        }))
      } catch (e) {
        console.error('Invalid QA format')
      }
    }
  }, [editServiceMode])

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

  const handleEditClick = (serviceItem) => {
    setServiceToEdit(serviceItem)
    setEditServiceMode(true)
  }

  const columns = [
    {
      name: 'S.No',
      selector: (row, index) => index + 1,
      width: '70px',
      sortable: false,
    },
    {
      name: 'SubService Name',
      selector: (row) => row.subServiceName,
      sortable: true,
      width: '230px',
    },
    {
      name: 'Service Name',
      selector: (row) => row.serviceName,
      width: '230px',
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
            width: '250px',
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

      // Add to local qaList
      const updatedQaList = [...qaList, newQA]
      setQaList(updatedQaList)

      // Also update the newService object
      setNewService((prev) => ({
        ...prev,
        descriptionQA: updatedQaList,
      }))

      // Clear input fields
      setQuestion('')
      setAnswers([])
    }
  }

  const removeQA = (indexToRemove) => {
    const updatedQAList = qaList.filter((_, index) => index !== indexToRemove)

    // Update both qaList and newService.descriptionQA
    setQaList(updatedQAList)
    setNewService((prev) => ({
      ...prev,
      descriptionQA: updatedQAList,
    }))
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
    console.log('iam from handleAddSubService calling')

    const fullBase64String = await toBase64(newService.serviceImageFile)
    const base64ImageToSend = fullBase64String?.split(',')[1] || ''

    // const payload = {
    //   ...otherFields,
    //   subServiceImage: base64ImageToSend,
    // }

    console.log('Calling validateForm...')
    if (!validateForm()) {
      toast.error('Validation failed', { position: 'top-right' })
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
        subServiceId: newService.subServiceId,
        serviceId: newService.serviceId,
        serviceName: newService.serviceName,
        categoryName: newService.categoryName,
        categoryId: newService.categoryId,

        price: newService.price,
        discountPercentage: newService.discount,
        taxPercentage: newService.taxPercentage,
        minTime: newService.minTime,
        status: newService.status,
        subServiceImage: base64ImageToSend,
        descriptionQA: buildDescriptionQA(),
        viewDescription: newService.viewDescription,
        platformFeePercentage: newService.platformFeePercentage,
        discountAmount: newService.discount,
        taxAmount: newService.taxAmount,
        discountedCost: newService.discountedCost,
        clinicPay: newService.clinicPay,
        finalCost: newService.finalCost,
      }
      console.log(payload)
      console.log(newService.subServiceId)

      if (!/^[a-f\d]{24}$/i.test(newService.subServiceId)) {
        toast.error('SubService ID is invalid. Please re-select sub-service.', {
          position: 'top-right',
        })
        return
      }
      console.log(payload)
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

  const formatMinutes = (minTime) => {
    const minutes = parseInt(minTime, 10)

    if (isNaN(minutes)) return 'Invalid time'

    if (minutes < 60) return `${minutes} min`

    const hours = Math.floor(minutes / 60)
    const remainingMins = minutes % 60

    return remainingMins === 0
      ? `${hours} hour${hours > 1 ? 's' : ''}`
      : `${hours} hour${hours > 1 ? 's' : ''} ${remainingMins} min`
  }

  const handleServiceFileChange = (e) => {
    const file = e.target.files[0]

    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result?.split(',')[1] || ''
        setNewService((prev) => ({
          ...prev,
          serviceImage: base64String,
          serviceImageFile: file,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpdateService = async () => {
    try {
      const hospitalId = localStorage.getItem('HospitalId')

      let base64ImageToSend = ''

      if (newService.serviceImageFile) {
        const fullBase64String = await toBase64(newService.serviceImageFile)
        base64ImageToSend = fullBase64String.split(',')[1]
      } else if (newService.serviceImage?.startsWith('data:')) {
        base64ImageToSend = newService.serviceImage.split(',')[1]
      } else {
        base64ImageToSend = newService.serviceImage || ''
      }

      // Ensure numeric values are numbers, not empty strings or null
      const price = newService.price > 0 ? Number(newService.price) : 0

      // build only the expected payload (no extra keys)
      const updatedService = {
        hospitalId,
        subServiceName: newService.subServiceName || '',
        viewDescription: newService.viewDescription || '',
        status: newService.status || '',
        minTime: newService.minTime || '',
        descriptionQA: Array.isArray(newService.descriptionQA) ? newService.descriptionQA : [],
        price,
        discountPercentage: newService.discount || 0,
        taxPercentage: newService.taxPercentage || 0,
        platformFeePercentage: newService.platformFeePercentage || 0,
        subServiceImage: base64ImageToSend,
      }

      // Log the payload to verify it before sending
      console.log('Payload for updateSubServiceData:', updatedService)

      // send cleaned payload
      const response = await updateServiceData(subServiceId, hospitalId, updatedService)

      toast.success('SubService updated successfully!', { position: 'top-right' })
      setEditServiceMode(false)
      setModalVisible(false)
      fetchData()
    } catch (error) {
      console.error('Update failed:', error)
      toast.error('Error updating service.', { position: 'top-right' })
    }
  }

  // Convert file to base64
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })

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
      toast.success('SubService deleted successfully!', { position: 'top-right' })

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

      // Fetch subservices now
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
                <div>{viewService.serviceId}</div>
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
            </CRow>

            <hr />

            <CRow className="mb-3">
              <CCol sm={4}>
                <strong>Price:</strong>
                <div>₹ {Math.round(viewService.price)}</div>
              </CCol>
              <CCol sm={4}>
                <strong>Discount %:</strong>
                <div>{Math.round(viewService.discountPercentage)}%</div>
              </CCol>
              <CCol sm={4}>
                <strong>Discount Amount:</strong>
                <div>₹ {Math.round(viewService.discountAmount)}</div>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol sm={4}>
                <strong>Discounted Cost:</strong>
                <div>₹ {Math.round(viewService.discountedCost)}</div>
              </CCol>
              <CCol sm={4}>
                <strong>Tax %:</strong>
                <div>{Math.round(viewService.taxPercentage)}%</div>
              </CCol>
              <CCol sm={4}>
                <strong>Tax Amount:</strong>
                <div>₹ {Math.round(viewService.taxAmount)}</div>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol sm={4}>
                <strong>Platform Fee %:</strong>
                <div>{Math.round(viewService.platformFeePercentage)}%</div>
              </CCol>
              <CCol sm={4}>
                <strong>Platform Fee:</strong>
                <div>₹ {Math.round(viewService.platformFee)}</div>
              </CCol>
              <CCol sm={4}>
                <strong>Clinic Pay:</strong>
                <div>₹ {Math.round(viewService.clinicPay)}</div>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol sm={4}>
                <strong>Final Cost:</strong>
                <div>₹ {Math.round(viewService.finalCost)}</div>
              </CCol>
              <CCol sm={4}>
                <strong>Service Time:</strong>
                <div>{formatMinutes(viewService.minTime)}</div>
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

                    {previewImage && (
                      <img src={previewImage} alt="Preview" height="80" className="mt-2" />
                    )}
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

      <CModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        size="xl"
        backdrop="static"
      >
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
                  Category Name <span className="text-danger">*</span>
                </h6>
                <CFormSelect
                  value={newService.categoryId || ''}
                  onChange={handleChanges}
                  aria-label="Select Category"
                  name="categoryName"
                  disabled={modalMode === 'edit'}
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
                  Service Name <span className="text-danger">*</span>
                </h6>
                <CFormSelect
                  name="serviceName"
                  value={newService.serviceName || ''}
                  onChange={handleChanges}
                  disabled={modalMode === 'edit'}
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

                {errors.subServiceName && (
                  <CFormText className="text-danger">{errors.subServiceName}</CFormText>
                )}
              </CCol>

              <CCol md={6}>
                <h6>
                  View Description <span className="text-danger">*</span>
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
                  Status <span className="text-danger">*</span>
                </h6>
                <CFormSelect value={newService.status || ''} onChange={handleChange} name="status">
                  <option value="">Select</option>
                  <option value="Active">Active</option>
                  <option value="InActive">Inactive</option>
                </CFormSelect>
                {errors.status && <CFormText className="text-danger">{errors.status}</CFormText>}
              </CCol>
              <CCol md={6}>
                <h6>
                  Price <span className="text-danger">*</span>
                </h6>
                <CFormInput
                  type="number"
                  value={newService.price || ''}
                  onChange={(e) => setNewService((prev) => ({ ...prev, price: e.target.value }))}
                />

                {errors.price && <CFormText className="text-danger">{errors.price}</CFormText>}
              </CCol>
            </CRow>
            <CRow className="mb-4">
              <CCol md={4}>
                <h6>
                  Discount % <span className="text-danger">*</span>
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
              <CCol md={4}>
                <h6>
                  TaxPercentage % <span className="text-danger">*</span>
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
              <CCol>
                <div className="mb-4">
                  <h6>
                    Min Time <span className="text-danger">*</span>
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

            <CCol md={12}>
              <h6>
                Service Image <span className="text-danger">*</span>
              </h6>
              <CFormInput
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onloadend = () => {
                      const base64String = reader.result?.split(',')[1] || ''
                      setNewService((prev) => ({
                        ...prev,
                        serviceImage: base64String,
                        serviceImageFile: file,
                      }))
                    }
                    reader.readAsDataURL(file)
                  }
                }}
              />

              {newService?.serviceImage && (
                <img
                  src={
                    newService.serviceImage.startsWith('data:')
                      ? newService.serviceImage
                      : `data:image/jpeg;base64,${newService.serviceImage}`
                  }
                  alt="Preview"
                  style={{ width: 100, height: 100, marginTop: 10 }}
                />
              )}
            </CCol>

            <CCol md={12} className="mt-3">
              <label className="mb-2">
                Question
                <span className="text-danger">*</span>
              </label>
              <CFormInput
                placeholder="Enter your question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />

              <label className="mt-3">
                Answers
                <span className="text-danger">*</span>
              </label>
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
