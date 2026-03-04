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
  CCol,
  CFormSelect,
  CCardBody,
  CCard,

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
  subServiceData,
  GetSubServices_ByClinicId,
} from './ProcedureManagementAPI'
import {
  getservice,
  BASE_URL,
  BASE_URL_API,
} from '../../baseUrl'
import ProcedureQA from './QASection'
import { Edit2, Eye, Trash2, View } from 'lucide-react'

const ProcedureManagementDoctor = ({ clinicId }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [service, setService] = useState([])
  const [category, setCategory] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [viewService, setViewService] = useState(null)
  const [editServiceMode, setEditServiceMode] = useState(false)
  const [question, setQuestion] = useState('')
  const [answers, setAnswers] = useState([])
  const [qaList, setQaList] = useState([])
  const [serviceOptions, setServiceOptions] = useState([])
  const [subServiceOptions, setSubServiceOptions] = useState([])
  const [selectedSubService, setSelectedSubService] = useState('')
  const [subServiceId, setSubServiceId] = useState('')
  const [serviceToEdit, setServiceToEdit] = useState({
    subServiceImage: '',
    viewImage: '',
    subServiceName: '',
    serviceName: '',
    subServiceImageFile: null,
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
    categoryId: '',
    subServiceName: '',
    subServiceImage: '',
    serviceId: '',
    subServiceId: '',
    viewDescription: '',
    description: '',
    price: '',
    gst: 0,
    consultationFee: 0,
    procedureQA: [],
    preProcedureQA: [],
    postProcedureQA: [],
    sittings: 0,
    procedureLink: '',

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
      categoryId: '',
      serviceId: '',
      subServiceId: '',
      subServiceName: '',
      price: '',
      discount: 0,
      gst: 0,
      consultationFee: 0,
      minTime: '',
      taxPercentage: 0,
      subServiceImage: '',
      subServiceImageFile: null,
      viewImage: '',
      viewDescription: '',
      platformFeePercentage: 0,
      descriptionQA: [],
      sittings: 0,
      procedureLink: '',
    })
    setModalVisible(true)
  }

  // Open for editing
  const openEditModal = async (service) => {
    setSubServiceId(service.subServiceId)
    setModalMode('edit')
    setModalVisible(true)
    // 1. Set selected category
    const selectedCategory = category.find((cat) => cat.categoryName === service.categoryName)
    const categoryId = selectedCategory?.categoryId || ''
    // 2. Fetch services under this category
    let fetchedServiceOptions = []
    try {
      const res = await axios.get(`${BASE_URL_API}/${getservice}/${categoryId}`)
      fetchedServiceOptions = res.data?.data || []
      console.log(fetchedServiceOptions)
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
    const procedureQA = Array.isArray(service.procedureQA)
      ? service.procedureQA
      : JSON.parse(service.procedureQA || '[]')
    const preProcedureQA = Array.isArray(service.preProcedureQA)
      ? service.preProcedureQA
      : JSON.parse(service.preProcedureQA || '[]')
    const postProcedureQA = Array.isArray(service.postProcedureQA)
      ? service.postProcedureQA
      : JSON.parse(service.postProcedureQA || '[]')
    const rawImage = service.subServiceImage || ''
    const fullImage = rawImage.startsWith('data:') ? rawImage : `data:image/jpeg;base64,${rawImage}`
    // Prefill all fields
    setNewService({
      subServiceId: resolvedSubServiceId,
      subServiceName: resolvedSubServiceName,
      price: service.price || '',
      discount: service.discountPercentage || 0,
      gst: service.gst || 0,
      consultationFee: service.consultationFee || 0,
      taxPercentage: service.taxPercentage || 0,
      minTime: service.minTime || '',
      procedureLink: service.procedureLink || '',
      subServiceImage: rawImage,
      subServiceImageFile: null,
      viewDescription: service.viewDescription || '',
      platformFeePercentage: service.platformFeePercentage || 0,
      viewImage: service.viewImage || '',
      procedureQA: procedureQA,
      preProcedureQA: preProcedureQA,
      postProcedureQA: postProcedureQA,
      sittings: service.sittings || 0, // ✅ default to 0
    })
    setQaList(formattedQA)
  }
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [serviceIdToDelete, setServiceIdToDelete] = useState(null)
  const [errors, setErrors] = useState({
    subServiceName: '',
    serviceId: '',
    price: '',
    taxPercentage: '',
    descriptionQA: '',
    answers: '',
    minTime: '',
    discount: '',
    viewDescription: '',
    subServiceImage: '',
    bannerImage: '',
    procedureLink: '',
    sittings: '', // ✅ added for validation
  })
  const fetchData = async () => {
    // console.log('fetch dataaaaaaa', service.subServiceId)
    setLoading(true)
    setError(null)
    try {
      const categoryResponse = await CategoryData()
      if (categoryResponse.data && Array.isArray(categoryResponse.data)) {
        const categoryDetails = categoryResponse.data.map((category) => ({
          categoryId: category.categoryId,
          categoryName: category.categoryName,
        }))
        setCategory(categoryDetails) // ✅ use mapped array
      } else {
        throw new Error('Invalid category data format')
      }

      if (clinicId) {
        // console.log("clinic ID SUb ", subServiceId)
        const subServiceData = await GetSubServices_ByClinicId(clinicId)
        console.log('hi tehre ', subServiceData)
        if (Array.isArray(subServiceData)) {
          // you might need to flatten if response is nested
          // but usually GetSubServices_ByClinicId should return a clean array
          setService(subServiceData)
          console.log(subServiceData)
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
        return subServiceNameMatch || serviceNameMatch || categoryNameMatch
      })

      setFilteredData(filtered)
    }

    handleSearch()
  }, [searchQuery, service])

  const columns = [
    {
      name: "S.No",
      selector: (row, index) => index + 1,
      sortable: false,
      center: true,
      width: "10%",  // ✅ changed from px to %
    },
    {
      name: "Procedure Name",
      selector: (row) => row.subServiceName || "N/A",
      sortable: true,
      width: "40%",  // ✅ bigger, responsive
      cell: (row) => (
        <span style={{ color: "#7e3a93" }}>{row.subServiceName}</span>
      ),
    },
    {
      name: "Procedure Price",
      selector: (row) => `₹${row.price || "0"}`,
      width: "20%", // ✅ responsive width
      cell: (row) => (
        <span style={{ color: "#7e3a93" }}>{`₹${row.price || "0"}`}</span>
      ),
    },
    {
      name: "Actions",
      width: "30%", // ✅ large enough for buttons
      center: true,
      cell: (row) => (
        <div className="d-flex justify-content-center gap-2">
          <button className="actionBtn" title="View" onClick={() => setViewService(row)}>
            <Eye size={18} />
          </button>

          <button className="actionBtn" title="Edit" onClick={() => openEditModal(row)}>
            <Edit2 size={18} />
          </button>

          <button className="actionBtn" title="Delete" onClick={() => handleServiceDelete(row)}>
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];
  const minTimeValue = parseFloat(newService.minTime)
  const validateForm = () => {
    const newErrors = {}

    if (!newService.subServiceName) {
      newErrors.subServiceName = 'Procedure Name is required'
    }
    if (!newService.price) {
      newErrors.price = 'Price is required.'
    } else if (isNaN(newService.price)) {
      newErrors.price = 'Price must be a valid number.'
    } else if (parseFloat(newService.price) < 0) {
      newErrors.price = 'Price cannot be a negative number.'
    }
    if (newService.gst === '' || isNaN(newService.gst) || parseFloat(newService.gst) < 0) {
      newErrors.gst = 'GST must be a valid number and not negative.'
    }
    if (
      newService.consultationFee === '' ||
      isNaN(newService.consultationFee) ||
      parseFloat(newService.consultationFee) < 0
    ) {
      newErrors.consultationFee = 'Consultation fee must be a valid number and not negative.'
    }
    if (!newService.discount && newService.discount !== 0) {
      newErrors.discount = 'Discount is required.'
    } else if (parseFloat(newService.discount) < 0) {
      newErrors.discount = 'Discount cannot be a negative number.'
    }
    if (!newService.minTimeValue || isNaN(newService.minTimeValue)) {
      newErrors.minTime = 'Minimum time is required'
    } else if (parseFloat(newService.minTimeValue) <= 0) {
      newErrors.minTime = 'Minimum time must be greater than zero.'
    }
    if (!newService.viewDescription) {
      newErrors.viewDescription = 'View description is required.'
    }
    if (!newService.subServiceImage) {
      newErrors.subServiceImage = 'Please upload a service image.'
    }
    if (!newService.categoryId) {
      newErrors.categoryId = 'Please select a valid category.'
    }

    // ✅ Validation for sittings
    if (newService.sittings === '' || newService.sittings === null || isNaN(newService.sittings)) {
      newErrors.sittings = 'Sittings must be a number.'
    } else if (parseInt(newService.sittings) < 0) {
      newErrors.sittings = 'Sittings cannot be negative.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }


  const handleAddService = async () => {
    const isValid = validateForm(); // ✅ Call it here
    if (!isValid) return; // Stop if validation fails

    console.log('--- handleAddService START ---')

    // Calculate derived values before sending
    const discountAmount = (newService.price * newService.discount) / 100
    const discountedCost = newService.price - discountAmount
    const taxAmount = (discountedCost * newService.taxPercentage) / 100
    const gst = newService.gst || 0
    const platformFee = (discountedCost * (newService.platformFeePercentage || 0)) / 100
    const clinicPay = discountedCost + taxAmount - platformFee
    const finalCost = clinicPay + gst + (newService.consultationFee || 0)
    const formattedMinTime = `${newService.minTimeValue} ${newService.minTimeUnit}`

    console.log('Calculated values:', {
      discountAmount,
      discountedCost,
      taxAmount,
      platformFee,
      clinicPay,
      finalCost,
    })

    const payload = {
      hospitalId: clinicId,
      subServiceName: newService.subServiceName,
      subServiceId: newService.subServiceId,
      price: newService.price,
      discountPercentage: newService.discount,
      discountAmount,
      discountedCost,
      taxPercentage: newService.taxPercentage,
      taxAmount,
      platformFeePercentage: newService.platformFeePercentage,
      platformFee,
      clinicPay,
      finalCost,
      gst: newService.gst,
      consultationFee: newService.consultationFee,
      minTime: formattedMinTime,
      subServiceImage: newService.subServiceImage,
      procedureQA: newService.procedureQA,
      preProcedureQA: newService.preProcedureQA,
      postProcedureQA: newService.postProcedureQA,
      viewDescription: newService.viewDescription,
      sittings: newService.sittings || 0, // ✅ Default to 0 if not set
      procedureLink: newService.procedureLink,
    }

    console.log('Payload ready to submit:', payload)

    try {
      const response = await postServiceData(payload, newService.subServiceId)
      console.log('Response received:', response)
      if (response.status === 201) {
        toast.success(response.data.message, { position: 'top-right' })
        setModalVisible(false)
        fetchData()
        serviceData()
      }
    } catch (error) {
      console.error('Error in handleAddService:', error.response)
      toast.error(error.response?.data?.message, { position: 'top-right' })
    }

    // Reset form
    setNewService({
      hospitalId: '',
      subServiceId: '',
      subServiceName: '',
      procedureLink: '',
      price: 0,
      discount: 0,
      gst: 0,
      consultationFee: 0,
      taxPercentage: 0,
      minTimeValue: '',
      minTimeUnit: '',
      subServiceImage: '',
      subServiceImageFile: '',
      viewDescription: '',
      procedureQA: [],
      preProcedureQA: [],
      postProcedureQA: [],
      platformFeePercentage: 0,
      descriptionQA: [],
      sittings: 0, // ✅ Default reset
    })

    setQaList([])
    console.log('--- handleAddService END ---')
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

  const handleUpdateService = async () => {
    try {
      let base64ImageToSend = ''
      if (newService.serviceImageFile) {
        const fullBase64String = await toBase64(newService.serviceImageFile)
        base64ImageToSend = fullBase64String.split(',')[1]
      } else if (newService.subServiceImage?.startsWith('data:')) {
        base64ImageToSend = newService.subServiceImage.split(',')[1]
      } else {
        base64ImageToSend = newService.subServiceImage || ''
      }

      const updatedService = {
        clinicId,
        subServiceName: newService.subServiceName || '',
        viewDescription: newService.viewDescription || '',
        minTime: newService.minTimeValue
          ? `${newService.minTimeValue} ${newService.minTimeUnit}`
          : '',
        procedureQA: Array.isArray(newService.procedureQA) ? newService.procedureQA : [],
        preProcedureQA: Array.isArray(newService.preProcedureQA) ? newService.preProcedureQA : [],
        postProcedureQA: Array.isArray(newService.postProcedureQA) ? newService.postProcedureQA : [],
        price: newService.price || 0,
        discountPercentage: newService.discount || 0,
        taxPercentage: newService.taxPercentage || 0,
        platformFeePercentage: newService.platformFeePercentage || 0,
        subServiceImage: base64ImageToSend,
        gst: newService.gst || 0,
        consultationFee: newService.consultationFee || 0,
        sittings: newService.sittings || 0, // ✅ Default to 0 if not set
        procedureLink: newService.procedureLink || '', // ✅ added
      }

      console.log('Payload for updateSubServiceData:', updatedService)

      const response = await updateServiceData(subServiceId, clinicId, updatedService)

      toast.success('Procedure updated successfully!', { position: 'top-right' })
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
    // const hospitalId = localStorage.getItem('HospitalId')
    try {
      const result = await deleteServiceData(serviceIdToDelete, clinicId)
      console.log('Service deleted:', result)
      toast.success('Procedure deleted successfully!', { position: 'top-right' })

      fetchData()
    } catch (error) {
      console.error('Error deleting Procedure:', error)
    }
    setIsModalVisible(false)
  }


  const handleChange = (e) => {
    const { name, value } = e.target

    setNewService((prev) => {
      // If categoryName, also update categoryId
      if (name === 'categoryName') {
        const selectedCategory = category.find((cat) => cat.categoryName === value)
        return {
          ...prev,
          [name]: value,
          categoryId: selectedCategory ? selectedCategory.categoryId : '',
        }
      }

      // For numeric fields, parseFloat
      if (
        name === 'gst' ||
        name === 'consultationFee' ||
        name === 'price' ||
        name === 'discount' ||
        name === 'taxPercentage' ||
        name === 'minTime' ||
        name === 'sittings'
      ) {
        return {
          ...prev,
          [name]: parseFloat(value) || 0,
        }
      }
      // Default: just update value
      return {
        ...prev,
        [name]: value,
      }
    })

    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }))
  }
  const AddCancel = () => {
    setNewService({
      price: '',
      discount: 0,
      taxPercentage: 0,
      minTime: '',
      minTimeValue: '', //reset value
      minTimeUnit: 'minutes', // reset unit
      subServiceImage: '',
      viewImage: '',
      viewDescription: '',
      sittings: 0,
      categoryId: '',
    })
    setModalVisible(false)
    setErrors({})
  }

  return (
    <div style={{ overflow: 'hidden' }}>
      <ToastContainer />
      <div>
        <CForm className="d-flex justify-content-end mb-3">
          <CInputGroup className="mb-3" style={{ marginRight: '20px', width: '400px' }}>
            <CFormInput
              type="text"
              placeholder="Search by Procedure Name, Category"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ height: '40px', bborder: '1px solid var(--color-black)', }}
            />
            <CInputGroupText style={{ height: '40px', border: '1px solid var(--color-black)', }}>
              <CIcon icon={cilSearch} />
            </CInputGroupText>
          </CInputGroup>

          <CButton
            color="info"
            className="text-white"
            style={{ height: '40px' }}
            onClick={() => openAddModal()}
          >
            Add Procedure Details
          </CButton>
        </CForm>
      </div>
      {viewService && (
        <CModal
          visible={!!viewService}
          onClose={() => setViewService(null)}
          size="xl"
          backdrop="static"
          className="procedure-modal"
        >
          <CModalHeader className="justify-content-center bg-light border-bottom">
            <CModalTitle className="text-primary fw-bold fs-4">
              Procedure Details
            </CModalTitle>
          </CModalHeader>

          <CModalBody className="p-4">
            {/* Basic Info */}
            <CCard className="shadow-sm mb-4 border-0">
              <CCardBody>
                <h6 className="text-info fw-semibold mb-3">Basic Information</h6>
                <CRow className="gy-3">
                  <CCol sm={6}>
                    <strong>Procedure Name:</strong> {viewService.subServiceName}

                  </CCol>
                  <CCol sm={6}>
                    <strong>Procedure ID:</strong> {viewService.subServiceId}
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>

            {/* Pricing Info */}
            <CCard className="shadow-sm mb-4 border-0">
              <CCardBody>
                <h6 className="text-info fw-semibold mb-3">Pricing & Fees</h6>
                <CRow className="gy-3">
                  <CCol sm={4}><strong>Procedure Price:</strong> ₹ {viewService.price ? Math.round(viewService.price) : '—'}</CCol>
                  <CCol sm={4}><strong>Discount %:</strong> {viewService.discountPercentage ? Math.round(viewService.discountPercentage) + '%' : '—'}</CCol>
                  <CCol sm={4}><strong>Discount Amount:</strong> ₹ {viewService.discountAmount ? Math.round(viewService.discountAmount) : '—'}</CCol>
                  <CCol sm={4}><strong>Discounted Cost:</strong> ₹ {viewService.discountedCost ? Math.round(viewService.discountedCost) : '—'}</CCol>
                  <CCol sm={4}><strong>Tax %:</strong> {viewService.taxPercentage ? Math.round(viewService.taxPercentage) + '%' : '—'}</CCol>
                  <CCol sm={4}><strong>Tax Amount:</strong> ₹ {viewService.taxAmount ? Math.round(viewService.taxAmount) : '—'}</CCol>
                  <CCol sm={4}><strong>platform Fee Percentage %:</strong> {viewService.platformFeePercentage ? Math.round(viewService.platformFeePercentage) + '%' : '—'}</CCol>
                  <CCol sm={4}><strong>Platform Fee:</strong> ₹ {viewService.platformFee ? Math.round(viewService.platformFee) : '—'}</CCol>
                  <CCol sm={4}><strong>Clinic Pay:</strong> ₹ {viewService.clinicPay ? Math.round(viewService.clinicPay) : '—'}</CCol>
                  <CCol sm={4}><strong>GST:</strong> ₹ {viewService.gst ? Math.round(viewService.gst) : '—'}</CCol>
                  <CCol sm={4}><strong>Consultation Fee:</strong> ₹ {viewService.consultationFee ?? '—'}</CCol>
                  <CCol sm={4}><strong>Final Cost:</strong> ₹ {viewService.finalCost ? Math.round(viewService.finalCost) : '—'}</CCol>
                  <CCol sm={4}><strong>Service Time:</strong> {viewService.minTime ? (viewService.minTime) : '—'}</CCol>
                  <CCol sm={4}><strong>Sittings:</strong> {viewService.sittings ?? 0}</CCol>
                  <CCol sm={4}><strong>Procedure Link:</strong> {viewService.procedureLink || 'N/A'}</CCol>

                </CRow>
              </CCardBody>
            </CCard>
            {/* Q&A Sections */}
            {["preProcedureQA", "procedureQA", "postProcedureQA"].map((qaType, i) => {
              const titles = {
                preProcedureQA: "Pre-Procedure Q&A",
                procedureQA: "Procedure Q&A",
                postProcedureQA: "Post-Procedure Q&A",
              };
              const qaData = viewService[qaType];

              return (
                <CCard key={i} className="shadow-sm mb-4 border-0">
                  <CCardBody>
                    <h6 className="text-info fw-semibold mb-3">{titles[qaType]}</h6>
                    {Array.isArray(qaData) && qaData.length > 0 ? (
                      qaData.map((qa, index) => {
                        const question = Object.keys(qa)[0];
                        const answers = qa[question];
                        return (
                          <div key={index} className="mb-2">
                            <strong>{question}</strong>
                            <ul className="ms-3">
                              {answers.map((ans, i) => (
                                <li key={i}>{ans}</li>
                              ))}
                            </ul>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-muted fst-italic">No Q&A available</div>
                    )}
                  </CCardBody>
                </CCard>
              );
            })}

            {/* Image & Description */}
            <CCard className="shadow-sm border-0">
              <CCardBody>
                <h6 className="text-info fw-semibold mb-3">Additional Details</h6>
                <CRow>
                  <CCol sm={6}>
                    <strong>Sub Service Image:</strong>
                    <div className="mt-2">
                      {viewService.subServiceImage ? (
                        <img
                          src={`data:image/png;base64,${viewService.subServiceImage}`}
                          alt="Service"
                          className="img-fluid rounded border"
                          style={{ maxWidth: "250px" }}
                        />
                      ) : (
                        <div className="text-muted">No image available</div>
                      )}
                    </div>
                  </CCol>
                  <CCol sm={6}>
                    <strong>View Description:</strong>
                    <div className="mt-2">{viewService.viewDescription || "N/A"}</div>
                  </CCol>

                </CRow>
              </CCardBody>
            </CCard>
          </CModalBody>

          <CModalFooter className="justify-content-center border-top bg-light">
            <CButton color="secondary" variant="outline" onClick={() => setViewService(null)}>
              Close
            </CButton>
          </CModalFooter>
        </CModal>
      )}
      <CModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        size="xl"
        backdrop="static" className='custom-modal'
      >
        <CModalHeader>
          <CModalTitle style={{ textAlign: 'center', width: '100%' }}>
            {modalMode === 'edit' ? 'Edit Procedure Details' : 'Add New Procedure Details'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow className="mb-4">
              <CCol md={6}>
                <h6>
                  Procedure Name <span className="text-danger">*</span>
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
                      preProcedureQA: service.preProcedureQA || [],
                      procedureQA: service.procedureQA || [],
                      postProcedureQA: service.postProcedureQA || [],
                    }))
                  }}
                >
                  <option value="">Select Procedure</option>
                  {Array.isArray(subServiceOptions?.subServices) &&
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
                  Procedure Image <span className="text-danger">*</span>
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
                          subServiceImage: base64String,
                          subServiceImageFile: file,
                        }))
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                />
                {newService?.subServiceImage && (
                  <img
                    src={
                      newService.subServiceImage.startsWith('data:')
                        ? newService.subServiceImage
                        : `data:image/jpeg;base64,${newService.subServiceImage}`
                    }
                    alt="Preview"
                    style={{ width: 100, height: 100, marginTop: 10 }}
                  />
                )}
              </CCol>
              <CCol md={6}>
                <h6>
                  Sittings <span className="text-danger">*</span>
                </h6>
                <CFormInput
                  type="number"
                  min={1}
                  placeholder="Enter number of sittings"
                  value={newService.sittings || 0}
                  name="sittings"
                  onChange={handleChange}
                />
                {errors.sittings && (
                  <CFormText className="text-danger">{errors.sittings}</CFormText>
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
              <CCol md={3}>
                <h6>
                  Procedure Price <span className="text-danger">*</span>
                </h6>
                <CFormInput
                  type="number"
                  value={newService.price || ''}
                  onChange={(e) => setNewService((prev) => ({ ...prev, price: e.target.value }))}
                />

                {errors.price && <CFormText className="text-danger">{errors.price}</CFormText>}
              </CCol>

              <CCol md={3}>
                <h6>
                  Discount (%) <span className="text-danger">*</span>
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
              <CCol md={3}>
                <h6>
                  GST (%)<span className="text-danger">*</span>
                </h6>
                <CFormInput
                  type="number"
                  value={newService.gst || ''}
                  onChange={(e) =>
                    setNewService((prev) => ({ ...prev, gst: Number(e.target.value) }))
                  }
                />
              </CCol>
              <CCol md={3}>
                <h6>Other Taxes(%)</h6>
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
            <h6 className="m-3">Procedure (Optional)</h6>
            <ProcedureQA
              preQAList={newService.preProcedureQA}
              setPreQAList={(data) => setNewService((prev) => ({ ...prev, preProcedureQA: data }))}
              procedureQAList={newService.procedureQA}
              setProcedureQAList={(data) =>
                setNewService((prev) => ({ ...prev, procedureQA: data }))
              }
              postQAList={newService.postProcedureQA}
              setPostQAList={(data) =>
                setNewService((prev) => ({ ...prev, postProcedureQA: data }))
              }
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={AddCancel}>
            Cancel
          </CButton>
          <CButton
            color="info"
            className="text-white"
            onClick={modalMode === 'edit' ? handleUpdateService : handleAddService}
          >
            {modalMode === 'edit' ? 'Update' : 'Add'}
          </CButton>
        </CModalFooter>
      </CModal>
      {loading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '300px',
            fontSize: '1.5rem',
            color: '#555',
          }}
        >
          Loading...
        </div>
      ) : error ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '300px',
            fontSize: '1.2rem',
            color: 'red',
          }}
        >
          {error}
        </div>
      ) : (
        <div
          className="border rounded p-3 shadow-sm"
          style={{
            backgroundColor: "#fff",
            borderColor: "#e0e0e0",
            width: "100%",
            maxWidth: "100%",
          }}
        >
          <DataTable
            columns={columns}
            data={filteredData.length > 0 ? filteredData : service}
            pagination
            paginationPerPage={5} // 👈 Default number of rows per page
            paginationRowsPerPageOptions={[5, 10, 15, 20, 30, 40, 50]} // 👈 Dropdown options
            highlightOnHover
            pointerOnHover
            customStyles={{
              table: {
                style: {
                  backgroundColor: '#fff',

                },
              },
              headRow: {
                style: {
                  backgroundColor: '#a5c4d4ff',
                  minHeight: '52px',
                },
              },
              headCells: {
                style: {
                  color: '#7e3a93',
                  fontWeight: '600',
                  fontSize: '0.95rem',


                },
              },

              cells: {
                style: {

                  fontSize: '0.9rem',
                  color: '#7e3a93',
                  padding: '12px 14px',
                },
              },
              pagination: {
                style: {
                  borderTop: '1px solid #e0e0e0',
                  color: '#7e3a93',
                  fontWeight: 500,
                  padding: '10px',
                },
              },
            }}
          />

        </div>
      )}
    </div>
  )
}

export default ProcedureManagementDoctor