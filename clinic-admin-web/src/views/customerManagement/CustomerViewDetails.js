import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CNav,
  CNavItem,
  CNavLink,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CButton,
  CFormInput,
  CFormSelect,
  CRow,
  CCol,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
} from '@coreui/react'
import { serviceData } from '../serviceManagement/ServiceManagementAPI'
import { useParams } from 'react-router-dom'
import {
  getCustomerDataByID,
  updateCustomerData,
  addAddressData,
  updateAddressData,
  deleteAddressData,
  AppointmentsData,
  bookAppointment,
  updateAppointmentAPI,
  deleteAppointment,
  CategoryData,
} from './CustomerAPI'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const CustomerViewDetails = () => {
  const { id } = useParams()
  const [customer, setCustomer] = useState(null)
  const [editedCustomer, setEditedCustomer] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [mobileError, setMobileError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [pendingStatus, setPendingStatus] = useState('')
  const [remark, setRemark] = useState('')
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [error, setError] = useState({
    mobileNumber: '',
    fullName: '',
    emailId: '',
    age: '',
    gender: '',
    status: '',
  })

  const [editedAddress, setEditedAddress] = useState(customer?.addresses || [])
  const [editAddressMode, setEditAddressMode] = useState(
    Array(customer?.addresses?.length).fill(false),
  )
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false)

  const [newAddress, setNewAddress] = useState({
    houseNo: '',
    apartment: '',
    street: '',
    city: '',
    latitude: '',
    longitude: '',
    state: '',
    postalCode: '',
    country: '',
  })
  const [addressErrors, setAddressErrors] = useState([])

  const [appointments, setAppointments] = useState([])
  const [editedAppointments, setEditedAppointments] = useState([])
  const [editAppointmentMode, setEditAppointmentMode] = useState([])
  const [isAddingNewAppointment, setIsAddingNewAppointment] = useState(false)
  const [newAppointment, setNewAppointment] = useState({
    servicesAdded: [
      { serviceStartDate: '', serviceEndDate: '', startTime: '', endTime: '', numberOfDays: 0 },
    ],
  })

  const [serviceList, setServiceList] = useState([])
  const [isServiceChanged, setIsServiceChanged] = useState(false)
  const [filteredServiceList, setFilteredServiceList] = useState([])
  const [categoryList, setCategoryList] = useState([])
  const [service, setService] = useState({
    categoryName: '',
    serviceName: '',
  })

  const [AppointmentErrors, setAppointmentErrors] = useState({
    patientName: '',
    relationShip: '',
    gender: '',
    emailId: '',
    age: '',
    patientNumber: '',
    servicesName: '',
    totalCost: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    houseNo: '',
    apartment: '',
    street: '',
    latitude: '',
    longitude: '',
    direction: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  })
  const fetchCustomer = async () => {
    try {
      const customerData = await getCustomerDataByID(id)
      setCustomer(customerData)
      setEditedCustomer(customerData)
      setEditedAddress(customerData.addresses)
    } catch (error) {
      console.error('Error fetching customer data:', error)
    }
  }

  const fetchAppointments = async () => {
    try {
      const AppointmentData = await AppointmentsData(id)
      console.log(AppointmentData.data)
      setAppointments(AppointmentData.data)
      setEditedAppointments(AppointmentData.data)
      setEditAddressMode(new Array(AppointmentData.data.length).fill(false))
    } catch (error) {
      console.error('Error fetching customer data:', error)
    }
  }

  const fetchService = async () => {
    try {
      const ServicesData = await serviceData(id)
      console.log('Fetched services:', ServicesData.data)
      setServiceList(ServicesData.data)
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }

  const fetchData = async () => {
    try {
      const data = await CategoryData()
      console.log('Full API Response:', data)

      if (data?.data && Array.isArray(data.data)) {
        console.log('Categories Data:', data.data)

        // Set category list
        setCategoryList(data.data)

        // Extract services ensuring categoryId is included
        const extractedServices = data.data.flatMap((category) =>
          category?.services
            ? category.services.map((service) => ({
                ...service,
                categoryId: category.categoryId,
              }))
            : [],
        )

        setServiceList(extractedServices)
      } else {
        console.warn('Received empty or invalid category data.')
        setCategoryList([])
        setServiceList([])
      }
    } catch (error) {
      console.error('Error fetching category data:', error)
      setError('Failed to fetch category data.')
    }
  }

  useEffect(() => {
    fetchData()
    fetchService()
  }, [])

  useEffect(() => {
    if (id) {
      fetchCustomer()
      fetchAppointments()
      fetchService()
      fetchData()
    }
  }, [id])

  const handleTabClick = (tab) => {
    setActiveTab(tab)
  }

  const handleEditClick = () => {
    setEditMode(!editMode)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target

    setEditedCustomer((prevState) => ({
      ...prevState,
      [name]: value,
    }))

    setError((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }))
  }

  const validateBasicFields = () => {
    const newErrors = {}

    if (!editedCustomer.fullName?.trim()) {
      newErrors.fullName = 'Full Name is required.'
    }

    if (!editedCustomer.emailId?.trim()) {
      newErrors.emailId = 'Email is required.'
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/
      if (!emailRegex.test(editedCustomer.emailId)) {
        newErrors.emailId = 'Please enter a valid Gmail address.'
      }
    }

    if (!editedCustomer.age) {
      newErrors.age = 'Age is required.'
    } else if (isNaN(editedCustomer.age) || editedCustomer.age <= 0) {
      newErrors.age = 'Age must be a positive number.'
    }

    if (!editedCustomer.mobileNumber) {
      newErrors.mobileNumber = 'Mobile number is required.'
    } else if (editedCustomer.mobileNumber.toString().length !== 10) {
      newErrors.mobileNumber = 'Mobile number must be 10 digits long.'
    }

    if (!editedCustomer.gender?.trim()) {
      newErrors.gender = 'Gender is required.'
    }

    if (!editedCustomer.status?.trim()) {
      newErrors.status = 'Status is required.'
    }

    setError(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleUpdateClick = async () => {
    if (!validateBasicFields()) {
      return
    }

    const { id, ...updatedCustomerData } = editedCustomer

    updatedCustomerData.status = pendingStatus || updatedCustomerData.status

    try {
      await updateCustomerData(updatedCustomerData.mobileNumber, updatedCustomerData)
      setCustomer(updatedCustomerData)
      setEditMode(false)
      toast.success('Customer details updated successfully!', {
        position: 'top-right',
        autoClose: 3000,
      })
    } catch (error) {
      toast.error(error.message, { position: 'top-right' })
    }
  }

  const handleSuspendSubmit = async () => {
    if (!remark) {
      toast.error('Please enter remarks for suspension.', { position: 'top-right' })
      return
    }

    const mobileNumber = editedCustomer.mobileNumber
    if (!mobileNumber) {
      toast.error('Invalid mobile number.', { position: 'top-right' })
      return
    }

    try {
      console.log('Submitting suspension with data:', {
        ...editedCustomer,
        status: 'suspended',
        remark,
      })

      await updateCustomerData(mobileNumber, {
        ...editedCustomer,
        status: 'suspended',
        remark,
      })

      toast.success('Customer suspended successfully!', { position: 'top-right' })
    } catch (error) {
      console.error('Error suspending customer:', error)
      toast.error('Failed to suspend customer.', { position: 'top-right' })
    } finally {
      setShowSuspendModal(false)
      setRemark('')
      fetchCustomer()
    }
  }

  const handleStatusSubmit = async () => {
    if (!pendingStatus) {
      toast.error('Please select a status.', { position: 'top-right' })
      return
    }

    const mobileNumber = editedCustomer.mobileNumber
    if (!mobileNumber) {
      toast.error('Invalid mobile number.', { position: 'top-right' })
      return
    }

    try {
      console.log('Submitting status update with data:', {
        ...editedCustomer,
        status: pendingStatus,
        remark,
      })

      await updateCustomerData(mobileNumber, {
        ...editedCustomer,
        status: pendingStatus,
        remark,
      })

      setCustomer((prev) => ({ ...prev, status: pendingStatus }))
      toast.success('Customer status updated successfully!', { position: 'top-right' })
    } catch (error) {
      console.error('Error updating customer status:', error)
      toast.error(error.message, { position: 'top-right' })
    } finally {
      setShowStatusModal(false)
      setRemark('')
    }
  }

  const handleRemarkChange = (e) => {
    setRemark(e.target.value)
  }

  const handleCancelModal = () => {
    setShowStatusModal(false)
    setPendingStatus('')
    setRemark('')
  }

  const handleSuspendClick = () => {
    setRemark(customer.remark || '')
    setShowSuspendModal(true)
  }
  const handleCancelClick = () => {
    setEditMode(false)
    setEditedCustomer(customer)
    setMobileError('')
    setEmailError('')
  }

  //////////////// Address ////////////////////////////

  ///// New Address///////////////////////

  const handleAddressInputChanges = (e) => {
    const { name, value } = e.target
    setNewAddress((prevState) => ({
      ...prevState,
      [name]: value,
    }))

    setAddressErrors((prevState) => ({
      ...prevState,
      [name]: '',
    }))
  }

  const addNewAddress = () => {
    setIsAddingNewAddress(true)
  }

  const handleSaveNewAddress = async () => {
    try {
      const errors = {}
      if (!newAddress.houseNo) {
        errors.houseNo = 'House No is required'
      }

      if (!newAddress.apartment) {
        errors.apartment = 'Apartment is required'
      }

      if (!newAddress.street) {
        errors.street = 'Street is required'
      }

      if (!newAddress.city) {
        errors.city = 'City is required'
      }

      if (!newAddress.latitude) {
        errors.latitude = 'Latitude is required'
      } else if (isNaN(newAddress.latitude)) {
        errors.latitude = 'Latitude must be a number'
      }

      if (!newAddress.longitude) {
        errors.longitude = 'Longitude is required'
      } else if (isNaN(newAddress.longitude)) {
        errors.longitude = 'Longitude must be a number'
      }

      if (!newAddress.state) {
        errors.state = 'State is required'
      }

      if (!newAddress.postalCode) {
        errors.postalCode = 'Postal Code is required'
      }

      if (!newAddress.country) {
        errors.country = 'Country is required'
      }
      if (Object.keys(errors).length > 0) {
        setAddressErrors(errors)
        return
      }
      if (isAddingNewAddress) {
        console.log('New address to be saved:', newAddress)

        const response = await addAddressData(id, newAddress)
        toast.success('New Address added successfully!', { position: 'top-right' })
        setNewAddress({
          houseNo: '',
          apartment: '',
          street: '',
          city: '',
          latitude: '',
          longitude: '',
          state: '',
          postalCode: '',
          country: '',
        })

        setIsAddingNewAddress(false)
        await fetchCustomer()
      }
    } catch (error) {
      console.error('Error saving address:', error)
      alert('Failed to save address')
    }
  }

  const handleCancelAddAddress = () => {
    setIsAddingNewAddress(false)
    setNewAddress({
      houseNo: '',
      apartment: '',
      street: '',
      city: '',
      latitude: '',
      longitude: '',
      state: '',
      postalCode: '',
      country: '',
    })
    setAddressErrors({})
  }
  /////// edit Address//////////////////

  const handleAddressInputChange = (e, index) => {
    const { name, value } = e.target
    const updatedAddresses = [...editedAddress]
    updatedAddresses[index] = {
      ...updatedAddresses[index],
      [name]: value,
    }
    setEditedAddress(updatedAddresses)

    const updatedErrors = [...addressErrors]
    if (updatedErrors[index]) {
      updatedErrors[index] = {
        ...updatedErrors[index],
        [name]: '',
      }
      setAddressErrors(updatedErrors)
    }
  }

  const validateAddress = (address) => {
    const errors = {}

    if (!address.houseNo?.trim()) errors.houseNo = 'House number is required.'
    if (!address.apartment?.trim()) errors.apartment = 'Apartment is required.'
    if (!address.street?.trim()) errors.street = 'Street is required.'
    if (!address.city?.trim()) errors.city = 'City is required.'
    if (!address.state?.trim()) errors.state = 'State is required.'
    if (!address.postalCode?.trim()) errors.postalCode = 'Postal code is required.'
    if (!/^\d{5,6}$/.test(address.postalCode)) {
      errors.postalCode = 'Postal code must be 5-6 digits.'
    }
    if (!address.country?.trim()) errors.country = 'Country is required.'
    if (address.latitude && isNaN(address.latitude)) {
      errors.latitude = 'Latitude must be a number.'
    }
    if (address.longitude && isNaN(address.longitude)) {
      errors.longitude = 'Longitude must be a number.'
    }

    return errors
  }

  const handleAddressUpdateClick = async (index) => {
    const updatedAddress = editedAddress[index]
    const validationErrors = validateAddress(updatedAddress)

    if (Object.keys(validationErrors).length > 0) {
      const newAddressErrors = [...addressErrors]
      newAddressErrors[index] = validationErrors
      setAddressErrors(newAddressErrors)

      return
    }

    try {
      console.log('Sending data to API for update:', id, updatedAddress)

      const addressData = [updatedAddress]

      await updateAddressData(id, index, addressData)

      console.log('Address updated successfully')

      const updatedEditAddressMode = [...editAddressMode]
      updatedEditAddressMode[index] = false
      setEditAddressMode(updatedEditAddressMode)

      toast.success('Address updated successfully!', { position: 'top-right' })

      await fetchCustomer()
    } catch (error) {
      toast.error(error.message, { position: 'top-right' })
    }
  }

  const handleAddressEditClick = (index) => {
    const updatedEditAddressMode = [...editAddressMode]
    updatedEditAddressMode[index] = true
    setEditAddressMode(updatedEditAddressMode)
  }

  const handleAddressCancelClick = (index) => {
    const updatedEditAddressMode = [...editAddressMode]
    const updatedEditedAddress = [...editedAddress]

    const isEmptyAddress = Object.values(updatedEditedAddress[index]).every((value) => value === '')

    if (updatedEditAddressMode[index] && isEmptyAddress) {
      updatedEditedAddress.splice(index, 1)
      updatedEditAddressMode.splice(index, 1)
    } else {
      updatedEditAddressMode[index] = false
    }
    setEditedAddress(updatedEditedAddress)
    setEditAddressMode(updatedEditAddressMode)
  }

  const removeAddress = async (index) => {
    const addressToRemove = editedAddress[index]

    try {
      const result = await deleteAddressData(id, index)

      if (result && result.success) {
        console.log('Address deleted successfully')

        const updatedAddresses = editedAddress.filter((_, i) => i !== index)
        setEditedAddress(updatedAddresses)
        const updatedEditMode = editAddressMode.filter((_, i) => i !== index)
        setEditAddressMode(updatedEditMode)

        toast.success(' Address removed successfully!', { position: 'top-right' })
        await fetchCustomer()
        console.log('Fetched customer data:', customer)
      }
    } catch (error) {
      console.error('Error removing address:', error)
      alert('Failed to remove address')
    }
  }

  // Appointments Details ///////////////////////////

  ////////////////add New Appointments /////////////////
  const handleCategoryChange = async (e) => {
    const { value } = e.target

    setAppointmentErrors((prevErrors) => {
      const { categoryName, ...remainingErrors } = prevErrors
      return remainingErrors
    })

    const selectedCategory = categoryList.find((category) => category?.categoryName === value)

    if (!selectedCategory || !selectedCategory.categoryId) {
      console.warn('No matching category found OR categoryId is missing.')
      setFilteredServiceList([])
      return
    }

    console.log('Selected Category:', selectedCategory)

    try {
      const ServicesData = await serviceData(selectedCategory.categoryId)
      console.log('Fetched services:', ServicesData.data)

      if (!ServicesData.data || ServicesData.data.length === 0) {
        console.warn('No services available for this category.')
        setFilteredServiceList([])
        return
      }

      const filteredServices = ServicesData.data.filter(
        (service) => service.categoryId === selectedCategory.categoryId,
      )

      console.log('Filtered Services:', filteredServices)

      const defaultService = filteredServices.length > 0 ? filteredServices[0] : null

      setFilteredServiceList(filteredServices)
      setService((prevState) => ({
        ...prevState,
        categoryName: value,
        serviceName: defaultService ? defaultService.serviceName : '',
      }))

      setNewAppointment((prevState) => ({
        ...prevState,
        categoryName: value,
      }))
    } catch (error) {
      console.error('Error fetching services:', error)
      setFilteredServiceList([])
    }
  }

  const handleServiceChange = async (e, index) => {
    const selectedServiceName = e.target.value
    console.log('Selected service:', selectedServiceName)

    const selectedService = filteredServiceList.find(
      (service) => service.serviceName === selectedServiceName,
    )

    setAppointmentErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors }
      delete updatedErrors[`serviceName-${index}`]
      delete updatedErrors[`servicePrice-${index}`]
      return updatedErrors
    })

    if (selectedService) {
      const { serviceId, categoryId, pricing, discount, tax } = selectedService

      const discountAmount = pricing * (discount / 100)
      const discountedCost = pricing - discountAmount
      const taxAmount = discountedCost * (tax / 100)
      const finalCost = discountedCost + taxAmount
      const payAmount = finalCost

      setNewAppointment((prev) => {
        const updatedServices = [...prev.servicesAdded]
        updatedServices[index] = {
          ...updatedServices[index],
          serviceName: selectedServiceName,
          categoryId: categoryId,
          serviceId: serviceId,
          price: pricing,
          discount: discount,
          tax: tax,
          discountAmount: discountAmount,
          discountedCost: discountedCost,
          taxAmount: taxAmount,
          finalCost: finalCost,
          payAmount: payAmount,
          serviceStartDate: '',
          serviceEndDate: '',
          startTime: '',
          endTime: '',
        }

        const { totalPrice, totalDiscountAmount, totalDiscountedAmount, totalTax, totalPayAmount } =
          calculateTotals(updatedServices)

        return {
          ...prev,
          servicesAdded: updatedServices,
          totalCost: totalPayAmount,
          totalPrice: totalPrice,
          totalDiscountAmount: totalDiscountAmount,
          totalDiscountedAmount: totalDiscountedAmount,
          totalTax: totalTax,
          payAmount: totalPayAmount,
        }
      })

      setIsServiceChanged(true)
    }
  }

  const calculateDaysAndHours = (appointment) => {
    const { serviceStartDate, serviceEndDate, startTime, endTime } = appointment

    const startDateTime = new Date(`${serviceStartDate}T${startTime}`)
    const endDateTime = new Date(`${serviceEndDate}T${endTime}`)

    const diffMilliseconds = endDateTime - startDateTime

    const numberOfDays = Math.floor(diffMilliseconds / (1000 * 60 * 60 * 24))

    const remainingMilliseconds = diffMilliseconds % (1000 * 60 * 60 * 24)

    const numberOfHours = Math.floor(remainingMilliseconds / (1000 * 60 * 60))

    return {
      numberOfDays,
      numberOfHours,
    }
  }

  const calculateTotals = (services) => {
    const totalPrice = services.reduce((total, service) => total + (service.price || 0), 0)
    const totalDiscountAmount = services.reduce(
      (total, service) => total + (service.discountAmount || 0),
      0,
    )
    const totalTax = services.reduce((total, service) => total + (service.taxAmount || 0), 0)
    const totalPayAmount = services.reduce((total, service) => total + (service.payAmount || 0), 0)

    const totalDiscountedAmount = totalPrice - totalDiscountAmount

    return { totalPrice, totalDiscountAmount, totalDiscountedAmount, totalTax, totalPayAmount }
  }

  const handleRemoveService = (index) => {
    setNewAppointment((prev) => {
      const updatedServices = prev.servicesAdded.filter((_, i) => i !== index)
      const updatedTotals = calculateTotals(updatedServices)

      return {
        ...prev,
        servicesAdded: updatedServices,
        totalCost: updatedTotals.totalPrice,
        totalDiscountAmount: updatedTotals.totalDiscountAmount,
        totalDiscountedAmount: updatedTotals.totalDiscountedAmount,
        totalTax: updatedTotals.totalTax,
        payAmount: updatedTotals.totalPayAmount,
      }
    })
  }

  const handleNewAppointmentInputChanges = (e) => {
    const { name, value } = e.target
    setAppointmentErrors((prevErrors) => {
      const newErrors = { ...prevErrors }
      if (newErrors[name]) {
        delete newErrors[name]
      }
      return newErrors
    })
    setNewAppointment((prevState) => {
      const updatedAppointment = { ...prevState }
      if (name in updatedAppointment.addressDto) {
        updatedAppointment.addressDto[name] = value
      } else {
        updatedAppointment[name] = value
      }
      if (
        updatedAppointment.serviceStartDate &&
        updatedAppointment.serviceEndDate &&
        updatedAppointment.startTime &&
        updatedAppointment.endTime
      ) {
        const { numberOfDays, numberOfHours } = calculateDaysAndHours(updatedAppointment)
        updatedAppointment.numberOfDays = numberOfDays
        updatedAppointment.numberOfHours = numberOfHours
      }

      return updatedAppointment
    })
  }

  const handleDateChange = (e, index, field) => {
    const { value } = e.target

    setNewAppointment((prev) => {
      const updatedServices = [...prev.servicesAdded]
      updatedServices[index] = {
        ...updatedServices[index],
        [field]: value,
      }

      const { serviceStartDate, serviceEndDate } = updatedServices[index]
      if (serviceStartDate && serviceEndDate) {
        const startDate = new Date(serviceStartDate)
        const endDate = new Date(serviceEndDate)

        const diffMilliseconds = endDate - startDate
        const numberOfDays = Math.floor(diffMilliseconds / (1000 * 60 * 60 * 24))

        updatedServices[index].numberOfDays = numberOfDays >= 0 ? numberOfDays : 0
      } else {
        updatedServices[index].numberOfDays = 0
      }

      return {
        ...prev,
        servicesAdded: updatedServices,
      }
    })
  }

  const handleTimeChange = (e, index, field) => {
    const { value } = e.target

    setNewAppointment((prev) => {
      const updatedServices = [...prev.servicesAdded]
      updatedServices[index] = {
        ...updatedServices[index],
        [field]: value,
      }

      const { startTime, endTime } = updatedServices[index]
      if (startTime && endTime) {
        const startDateTime = new Date(`1970-01-01T${startTime}`)
        const endDateTime = new Date(`1970-01-01T${endTime}`)

        let diffMilliseconds = endDateTime - startDateTime

        if (diffMilliseconds < 0) {
          diffMilliseconds += 24 * 60 * 60 * 1000
        }

        const numberOfHours = Math.floor(diffMilliseconds / (1000 * 60 * 60))
        const numberOfMinutes = Math.floor((diffMilliseconds % (1000 * 60 * 60)) / (1000 * 60))
        const totalMinutes = Math.floor(diffMilliseconds / (1000 * 60))

        updatedServices[index].numberOfHours = numberOfHours
        updatedServices[index].numberOfMinutes = numberOfMinutes
        updatedServices[index].totalMinutes = totalMinutes
      } else {
        updatedServices[index].numberOfHours = 0
        updatedServices[index].numberOfMinutes = 0
        updatedServices[index].totalMinutes = 0
      }

      return {
        ...prev,
        servicesAdded: updatedServices,
      }
    })
  }

  const addNewAppointment = () => {
    setNewAppointment({
      categoryName: '',
      patientName: '',
      relationShip: '',
      patientNumber: '',
      gender: '',
      emailId: '',
      age: '',
      customerNumber: '',
      addressDto: {
        houseNo: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        apartment: '',
        direction: '',
        latitude: '',
        longitude: '',
      },
      servicesAdded: [
        {
          status: 'pending',
          serviceId: '',
          serviceName: '',
          price: 0,
          discount: 0,
          discountCost: 0,
          finalCost: 0,
          startDate: '',
          endDate: '',
          numberOfHours: 0,
          numberOfDays: 0,
          startTime: '',
          endTime: '',
        },
      ],
      totalPrice: 0,
      totalDiscountAmount: 0,
      totalDiscountedAmount: 0,
      totalTax: 0,
      payAmount: 0,
    })
    setIsAddingNewAppointment(true)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
  
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0'); 
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const year = date.getFullYear();
  
    return `${day}-${month}-${year}`;
  };
  

  const validateAppointmentForm = (formData) => {
    const errors = {}

    // Required Field Validation
    if (!formData.categoryName) errors.categoryName = 'Category Name is required.'
    if (!formData.patientName) errors.patientName = 'Patient Name is required.'
    if (!formData.relationShip) errors.relationShip = 'Relationship is required.'
    if (!formData.gender) errors.gender = 'Gender is required.'
    if (!formData.emailId) errors.emailId = 'Email ID is required.'
    if (!formData.age) errors.age = 'Age is required.'
    if (!formData.patientNumber) errors.patientNumber = 'Patient Number is required.'
    if (!formData.addressDto.houseNo) errors.houseNo = 'House No is required.'
    if (!formData.addressDto.street) errors.street = 'Street is required.'
    if (!formData.addressDto.city) errors.city = 'City is required.'
    if (!formData.addressDto.state) errors.state = 'State is required.'
    if (!formData.addressDto.postalCode) errors.postalCode = 'Postal Code is required.'
    if (!formData.addressDto.country) errors.country = 'Country is required.'

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.emailId && !emailRegex.test(formData.emailId)) {
      errors.emailId = 'Invalid email format.'
    }

    // Numeric Validations
    if (formData.age && (isNaN(formData.age) || formData.age <= 0)) {
      errors.age = 'Age must be a positive number.'
    }

    if (formData.patientNumber && (isNaN(formData.patientNumber) || formData.patientNumber <= 0)) {
      errors.patientNumber = 'Patient Number must be a positive number.'
    }

    // Latitude/Longitude Range
    if (
      formData.addressDto.latitude &&
      (formData.addressDto.latitude < -90 || formData.addressDto.latitude > 90)
    ) {
      errors.latitude = 'Latitude must be between -90 and 90.'
    }

    if (
      formData.addressDto.longitude &&
      (formData.addressDto.longitude < -180 || formData.addressDto.longitude > 180)
    ) {
      errors.longitude = 'Longitude must be between -180 and 180.'
    }

    formData.servicesAdded.forEach((service, index) => {
      if (!service.serviceStartDate) {
        errors[`serviceStartDate-${index}`] = 'Service Start Date is required.'
      }
      if (!service.serviceEndDate) {
        errors[`serviceEndDate-${index}`] = 'Service End Date is required.'
      }
      if (
        service.serviceStartDate &&
        service.serviceEndDate &&
        new Date(service.serviceStartDate) > new Date(service.serviceEndDate)
      ) {
        errors[`serviceEndDate-${index}`] = 'End Date must be after Start Date.'
      }
    })

    return errors
  }

  const handleSaveNewAppointment = async () => {
    const validationErrors = validateAppointmentForm(newAppointment)
    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please fill in all required fields', { position: 'top-right' })

      setAppointmentErrors(validationErrors)
    }

    const appointmentData = {
      categoryName: service.categoryName,
      patientName: String(newAppointment.patientName),
      relationShip: newAppointment.relationShip,
      patientNumber: newAppointment.patientNumber,
      gender: newAppointment.gender,
      emailId: newAppointment.emailId,
      age: String(newAppointment.age),
      customerNumber: String(customer.mobileNumber),
      addressDto: {
        houseNo: newAppointment.addressDto?.houseNo,
        apartment: newAppointment.addressDto?.apartment,
        street: newAppointment.addressDto?.street,
        city: newAppointment.addressDto?.city,
        state: newAppointment.addressDto?.state,
        postalCode: newAppointment.addressDto?.postalCode,
        country: newAppointment.addressDto?.country,
        direction: newAppointment.addressDto?.direction,
        latitude: newAppointment.addressDto?.latitude
          ? parseFloat(newAppointment.addressDto.latitude)
          : 0,
        longitude: newAppointment.addressDto?.longitude
          ? parseFloat(newAppointment.addressDto.longitude)
          : 0,
      },
      servicesAdded:
        newAppointment.servicesAdded?.length > 0
          ? newAppointment.servicesAdded.map((service) => ({
              serviceId: service.serviceId,
              status: 'pending',
              serviceName: service.serviceName,
              price: parseFloat(service.price),
              discount: service.discount,
              discountedCost: parseFloat(service.discountedCost),
              discountAmount: parseFloat(service.discountAmount),
              tax: parseFloat(service.tax),
              taxAmount: parseFloat(service.taxAmount),
              finalCost: parseFloat(service.finalCost),
              startDate: service.serviceStartDate ? formatDate(service.serviceStartDate) : '',
              endDate: service.serviceEndDate ? formatDate(service.serviceEndDate) : '',
              numberOfHours: service.numberOfHours,
              numberOfDays: service.numberOfDays,
              startTime: service.startTime,
              endTime: service.endTime,
              latitude: newAppointment.addressDto?.latitude
                ? parseFloat(newAppointment.addressDto.latitude)
                : 0,
              longitude: newAppointment.addressDto?.longitude
                ? parseFloat(newAppointment.addressDto.longitude)
                : 0,
            }))
          : [],
      totalPrice: parseFloat(newAppointment.totalPrice),
      totalDiscountAmount: parseFloat(newAppointment.totalDiscountAmount),
      totalDiscountedAmount: parseFloat(newAppointment.totalDiscountedAmount),
      totalTax: parseFloat(newAppointment.totalTax),
      payAmount: parseFloat(newAppointment.payAmount),
    }

    console.log('Appointment data being sent:', appointmentData)
    try {
      const response = await bookAppointment(appointmentData)
      console.log('Appointment booked successfully:', response.data)
      setIsAddingNewAppointment(false)
      fetchAppointments()
      toast.success('Appointment booked successfully!', { position: 'top-right' })
    } catch (error) {
      console.error('Error booking appointment:', error)
      toast.error(error.message, { position: 'top-right' })
    }
  }

  const handleCancelAddAppointment = () => {
    setIsAddingNewAppointment(false)
    setNewAppointment({
      categoryName: '',
      patientName: '',
      relationShip: '',
      gender: '',
      emailId: '',
      age: '',
      patientNumber: '',
      servicesAdded: [
        {
          startDate: '',
          endDate: '',
          startTime: 0,
          endTime: 0,
        },
      ],

      addressDto: {
        houseNo: '',
        apartment: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        latitude: '',
        longitude: '',
        direction: '',
      },
    })

    setAppointmentErrors({})
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  }

  const centeredMessageStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '300px',
    fontSize: '1.5rem',
    color: '#808080',
  }

  // const toggleEditMode = (index) => {
  //   const newEditMode = [...editAppointmentMode]
  //   newEditMode[index] = !newEditMode[index]
  //   setEditAppointmentMode(newEditMode)
  // }
  const calculateNumberOfDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0

    const start = new Date(startDate)
    const end = new Date(endDate)

    const timeDifference = end - start
    const days = timeDifference / (1000 * 3600 * 24)

    return days >= 0 ? Math.max(Math.ceil(days), 1) : 0
  }

  const calculateNumberOfHours = (startTime, endTime) => {
    if (!startTime || !endTime) return 0

    const start = new Date(`1970-01-01T${startTime}Z`)
    const end = new Date(`1970-01-01T${endTime}Z`)
    const timeDifference = end - start

    return Math.max(timeDifference / (1000 * 3600), 0)
  }

  const handleServiceFieldChange = (appointmentIndex, serviceIndex, fieldName, value) => {
    const updatedAppointments = [...appointments]

    const updatedService = {
      ...updatedAppointments[appointmentIndex].servicesAdded[serviceIndex],
      [fieldName]: value,
    }

    updatedAppointments[appointmentIndex].servicesAdded[serviceIndex] = updatedService

    const { startDate, endDate, startTime, endTime } = updatedService

    if (fieldName === 'startDate' || fieldName === 'endDate') {
      updatedService.numberOfDays = calculateNumberOfDays(startDate, endDate)
    }

    if (fieldName === 'startTime' || fieldName === 'endTime') {
      updatedService.numberOfHours = calculateNumberOfHours(startTime, endTime)
    }
    setAppointments(updatedAppointments)
  }

  // const handleUpdateAppointment = async (index) => {
  //   const appointment = appointments[index]

  //   const updatedAppointment = {
  //     categoryName: appointment.categoryName,
  //     patientName: appointment.patientName,
  //     relationShip: appointment.relationShip,
  //     gender: appointment.gender,
  //     emailId: appointment.emailId,
  //     age: appointment.age,
  //     patientNumber: appointment.patientNumber,
  //     addressDto: {
  //       houseNo: appointment.addressDto?.houseNo || '',
  //       street: appointment.addressDto?.street || '',
  //       city: appointment.addressDto?.city || '',
  //       state: appointment.addressDto?.state || '',
  //       postalCode: appointment.addressDto?.postalCode || '',
  //       country: appointment.addressDto?.country || '',
  //       latitude: appointment.addressDto?.latitude || '',
  //       longitude: appointment.addressDto?.longitude || '',
  //     },
  //     servicesAdded: appointment.servicesAdded.map((service) => ({
  //       serviceName: service.serviceName,
  //       price: service.price,
  //       discount: service.discount,
  //       discountAmount: service.discountAmount,
  //       discountedCost: service.discountedCost,
  //       tax: service.tax,
  //       taxAmount: service.taxAmount,
  //       finalCost: service.finalCost,
  //       startDate: service.startDate,
  //       endDate: service.endDate,
  //       numberOfDays: service.numberOfDays,
  //       startTime: service.startTime,
  //       endTime: service.endTime,
  //       numberOfHours: service.numberOfHours,
  //     })),
  //   }

  //   try {
  //     console.log(updatedAppointment)
  //     const result = await updateAppointmentAPI(appointment.appointmentId, updatedAppointment)
  //     console.log('Update successful:', result)
  //   } catch (error) {
  //     console.error('Failed to update appointment:', error.message)
  //   }
  // }

  // const cancelEdit = (index) => {
  //   const updatedAppointments = [...appointments]
  //   setEditedAppointments(updatedAppointments)
  //   setEditAppointmentMode(editAppointmentMode.map((mode, idx) => (idx === index ? false : mode)))
  // }

  const handleDeleteAppointment = async (appointmentIndex, appointmentId, serviceId) => {
    try {
      console.log('Deleting Service from Appointment:', { appointmentId, serviceId })
      await deleteAppointment(appointmentId, serviceId)

      const updatedAppointments = appointments.map((appointment, index) => {
        if (index === appointmentIndex) {
          appointment.servicesAdded = appointment.servicesAdded.filter(
            (service) => service.serviceId !== serviceId,
          )
        }
        return appointment
      })

      setAppointments(updatedAppointments)
      setEditedAppointments(updatedAppointments)
    } catch (error) {
      console.error('Error deleting service from appointment:', error)
    }
  }

  const activeAppointments = appointments.filter((appointment) =>
    appointment.servicesAdded.some((service) => service.status.toLowerCase() === 'pending'),
  )

  const completedAppointments = appointments.filter((appointment) =>
    appointment.servicesAdded.some((service) => service.status.toLowerCase() === 'completed'),
  )

  const upcomingAppointments = appointments.filter((appointment) =>
    appointment.servicesAdded.some((service) => service.status.toLowerCase() === 'accepted'),
  )

  const renderAppointmentList = (appointments) => {
    if (appointments.length === 0) {
      return <div>No appointments available</div>
    }

    const renderField = (label, value, isEditable, onChange, type = 'text') => (
      <div>
        <strong>{label} : </strong>
        {isEditable ? (
          <CFormInput type={type} value={value || ''} onChange={onChange} />
        ) : (
          value || 'NA'
        )}
      </div>
    )

    return appointments.map((appointment, index) => {
      const isEditable = editAppointmentMode[index]

      return (
        <CCard key={`appointment-${index}`} style={{ marginBottom: '1rem' }}>
          <CCardBody>
            <CRow>
              {/* Action Buttons */}
              {/* <CCol xs="12" className="d-flex justify-content-between mb-3">
                  {isEditable ? (
                    <>
                      <CButton
                        color="primary"
                        onClick={() => handleUpdateAppointment(index)}
                        style={{ marginRight: '10px' }}
                      >
                        Update
                      </CButton>
                      <CButton color="warning" onClick={() => cancelEdit(index)}>
                        Cancel
                      </CButton>
                    </>
                  ) : (
                    <CButton
                      color="secondary"
                      onClick={() => toggleEditMode(index)}
                      style={{ marginRight: '10px' }}
                    >
                      Edit
                    </CButton>
                  ) }
                </CCol> */}

              {/* Appointment Fields */}
              <CRow className="mb-3">
                <CCol md="4">
                  {renderField('Category Name', appointment.categoryName, false, null)}
                </CCol>
                <CCol md="4">
                  {renderField('Patient Name', appointment.patientName, false, null)}
                </CCol>
                <CCol md="4">
                  {renderField('Relationship', appointment.relationShip, false, null)}
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md="4">{renderField('Gender', appointment.gender, false, null)}</CCol>
                <CCol md="4">{renderField('Email', appointment.emailId, false, null)}</CCol>
                <CCol md="4">{renderField('Age', appointment.age, false, null)}</CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md="4">
                  {renderField('Patient Number', appointment.patientNumber, false, null)}
                </CCol>
              </CRow>

              {/* Address Fields */}
              <CRow className="mb-3">
                <CCol md="4">
                  {renderField('House No.', appointment.addressDto?.houseNo || '', false, null)}
                </CCol>
                <CCol md="4">
                  {renderField('Street', appointment.addressDto?.street || '', false, null)}
                </CCol>
                <CCol md="4">
                  {renderField('City', appointment.addressDto?.city || '', false, null)}
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md="4">
                  {renderField('State', appointment.addressDto?.state || '', false, null)}
                </CCol>
                <CCol md="4">
                  {renderField(
                    'Postal Code',
                    appointment.addressDto?.postalCode || '',
                    false,
                    null,
                  )}
                </CCol>
                <CCol md="4">
                  {renderField('Country', appointment.addressDto?.country || '', false, null)}
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md="4">
                  {renderField('Latitude', appointment.addressDto?.latitude || '', false, null)}
                </CCol>
                <CCol md="4">
                  {renderField('Longitude', appointment.addressDto?.longitude || '', false, null)}
                </CCol>
              </CRow>

              {/* Services */}
              {appointment.servicesAdded.map((service, serviceIndex) => (
                <CRow key={`service-${serviceIndex}`} className="mb-3">
                  <CRow className="mb-3">
                    <CCol md="4">
                      {renderField('Service Name', service.serviceName, false, null)}
                    </CCol>
                    <CCol md="4">{renderField('Price', service.price, false, null)}</CCol>
                    <CCol md="4">{renderField('Discount (%)', service.discount, false, null)}</CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol md="4">
                      {renderField(
                        'Start Date',
                        service.startDate,
                        isEditable,
                        (e) =>
                          handleServiceFieldChange(
                            index,
                            serviceIndex,
                            'startDate',
                            e.target.value,
                          ),
                        'date',
                      )}
                    </CCol>
                    <CCol md="4">
                      {renderField(
                        'End Date',
                        service.endDate,
                        isEditable,
                        (e) =>
                          handleServiceFieldChange(index, serviceIndex, 'endDate', e.target.value),
                        'date',
                      )}
                    </CCol>
                    <CCol md="4">
                      {renderField(
                        'Number of Days',
                        service.numberOfDays ||
                          calculateNumberOfDays(service.startDate, service.endDate),
                        false,
                        null,
                        'number',
                      )}
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol md="4">
                      {renderField(
                        'Start Time',
                        service.startTime,
                        isEditable,
                        (e) =>
                          handleServiceFieldChange(
                            index,
                            serviceIndex,
                            'startTime',
                            e.target.value,
                          ),
                        'time',
                      )}
                    </CCol>
                    <CCol md="4">
                      {renderField(
                        'End Time',
                        service.endTime,
                        isEditable,
                        (e) =>
                          handleServiceFieldChange(index, serviceIndex, 'endTime', e.target.value),
                        'time',
                      )}
                    </CCol>
                    <CCol md="4">
                      {renderField(
                        'Number of Hours',
                        service.numberOfHours ||
                          calculateNumberOfHours(service.startTime, service.endTime),
                        false,
                        null,
                        'number',
                      )}
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol md="4">
                      {renderField('Discount Amount', service.discountAmount, false, null)}
                    </CCol>
                    <CCol md="4">
                      {renderField('Discounted Cost', service.discountedCost, false, null)}
                    </CCol>
                    <CCol md="4">{renderField('Tax (%)', service.tax, false, null)}</CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol md="4">{renderField('Tax Amount', service.taxAmount, false, null)}</CCol>
                    <CCol md="4">{renderField('Final Cost', service.finalCost, false, null)}</CCol>
                    <CCol md="4">{renderField('Status ', service.status, false, null)}</CCol>
                  </CRow>
                  <CCol xs="12" className="text-end">
                    <CButton
                      color="danger"
                      onClick={() =>
                        handleDeleteAppointment(index, appointment.appointmentId, service.serviceId)
                      }
                    >
                      Delete Service
                    </CButton>
                  </CCol>
                </CRow>
              ))}
            </CRow>
          </CCardBody>
        </CCard>
      )
    })
  }

  return (
    <div>
      <ToastContainer />
      {customer ? (
        <>
          <CCard>
            <CCardHeader>Customer Details</CCardHeader>
            <CCardBody>
              <CNav variant="tabs">
                <CNavItem>
                  <CNavLink
                    href="#"
                    active={activeTab === 'basic'}
                    onClick={() => handleTabClick('basic')}
                  >
                    Basic Details
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    href="#"
                    active={activeTab === 'address'}
                    onClick={() => handleTabClick('address')}
                  >
                    Address
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    href="#"
                    active={activeTab === 'Appointments'}
                    onClick={() => handleTabClick('Appointments')}
                  >
                    Appointments
                  </CNavLink>
                </CNavItem>
              </CNav>
            </CCardBody>
          </CCard>

          {activeTab === 'basic' && (
            <CAccordion className="mt-4" activeItemKey={1}>
              <CAccordionItem itemKey={1}>
                <CAccordionHeader>
                  <span>Basic Profile</span>
                  <span
                    style={{
                      marginLeft: '10px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      display: 'inline-block',
                      backgroundColor:
                        customer.status === 'active'
                          ? 'green'
                          : customer.status === 'inactive'
                            ? 'orange'
                            : customer.status === 'suspended'
                              ? 'red'
                              : 'gray',
                    }}
                  />
                </CAccordionHeader>
                <CAccordionBody>
                  <div className="position-relative mt-3">
                    {editMode && (
                      <CButton
                        color="warning"
                        style={{ position: 'absolute', top: 0, right: 0 }}
                        onClick={handleCancelClick}
                      >
                        Cancel
                      </CButton>
                    )}
                    {editMode ? (
                      <>
                        <CButton color="primary" onClick={handleUpdateClick}>
                          Update
                        </CButton>
                      </>
                    ) : (
                      <CButton color="secondary" onClick={handleEditClick}>
                        Edit
                      </CButton>
                    )}
                    <CButton color="danger" className="m-3" onClick={handleSuspendClick}>
                      Suspend
                    </CButton>
                  </div>
                  <div className="customer-details-grid mt-4" style={gridStyle}>
                    <p>
                      <strong>Full Name : </strong>{' '}
                      {editMode ? (
                        <>
                          <CFormInput
                            type="text"
                            name="fullName"
                            value={editedCustomer.fullName}
                            onChange={handleInputChange}
                          />
                          {error.fullName && <span className="text-danger">{error.fullName}</span>}
                        </>
                      ) : (
                        editedCustomer.fullName
                      )}
                    </p>

                    <p>
                      <strong>Email : </strong>{' '}
                      {editMode ? (
                        <>
                          <CFormInput
                            type="text"
                            name="emailId"
                            value={editedCustomer.emailId || ''}
                            onChange={handleInputChange}
                          />
                          {error.emailId && <span className="text-danger">{error.emailId}</span>}
                        </>
                      ) : (
                        editedCustomer.emailId
                      )}
                    </p>

                    <p>
                      <strong>Age : </strong>{' '}
                      {editMode ? (
                        <>
                          <CFormInput
                            type="number"
                            name="age"
                            value={editedCustomer.age}
                            onChange={handleInputChange}
                          />
                          {error.age && <span className="text-danger">{error.age}</span>}
                        </>
                      ) : (
                        editedCustomer.age
                      )}
                    </p>

                    <p>
                      <strong>Mobile Number : </strong>{' '}
                      {editMode ? (
                        <>
                          <CFormInput
                            type="tel"
                            name="mobileNumber"
                            value={editedCustomer.mobileNumber}
                            onChange={handleInputChange}
                          />
                          {error.mobileNumber && (
                            <span className="text-danger">{error.mobileNumber}</span>
                          )}
                        </>
                      ) : (
                        editedCustomer.mobileNumber
                      )}
                    </p>

                    <p>
                      <strong>Gender : </strong>{' '}
                      {editMode ? (
                        <>
                          <CFormSelect
                            name="gender"
                            value={editedCustomer.gender || ''}
                            onChange={handleInputChange}
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </CFormSelect>
                          {error.gender && <span className="text-danger">{error.gender}</span>}
                        </>
                      ) : (
                        editedCustomer.gender || 'NA'
                      )}
                    </p>

                    <p>
                      <strong>Status : </strong>{' '}
                      {editMode ? (
                        <>
                          <CFormSelect
                            name="status"
                            value={pendingStatus || editedCustomer.status}
                            onChange={(e) => {
                              setPendingStatus(e.target.value)
                              setEditedCustomer({ ...editedCustomer, status: e.target.value })
                            }}
                          >
                            <option value="">Select Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </CFormSelect>
                          {error.status && <span className="text-danger">{error.status}</span>}
                        </>
                      ) : (
                        editedCustomer.status || 'NA'
                      )}
                    </p>

                    <p>
                      <strong>Remarks : </strong>{' '}
                      {editMode ? (
                        <CFormInput
                          type="text"
                          name="remark"
                          value={editedCustomer.remark}
                          onChange={handleInputChange}
                        />
                      ) : (
                        customer.remark
                      )}
                    </p>
                  </div>
                </CAccordionBody>
              </CAccordionItem>
            </CAccordion>
          )}

          {activeTab === 'address' && (
            <CAccordion className="mt-4" activeItemKey={2}>
              <CAccordionItem itemKey={2}>
                <CAccordionHeader>Address Details</CAccordionHeader>
                <CAccordionBody>
                  <div>
                    <CButton color="success" onClick={addNewAddress} style={{ float: 'right' }}>
                      + Add Address
                    </CButton>
                  </div>
                  <div style={{ marginTop: '40px' }}>
                    {isAddingNewAddress && (
                      <CCard style={{ marginBottom: '1rem' }}>
                        <CCardBody>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(3, 1fr)', // 3 columns
                              gap: '1rem',
                              marginTop: '1rem',
                            }}
                          >
                            <div
                              style={{
                                gridColumn: 'span 3',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                marginTop: '10px',
                              }}
                            >
                              <CButton
                                color="warning"
                                style={{ marginRight: '10px' }}
                                onClick={handleCancelAddAddress}
                              >
                                Cancel
                              </CButton>
                              <CButton color="primary" onClick={handleSaveNewAddress}>
                                Save
                              </CButton>
                            </div>

                            <div>
                              <h6>
                                House No : <span style={{ color: 'red' }}>*</span>
                              </h6>
                              <CFormInput
                                type="text"
                                name="houseNo"
                                value={newAddress.houseNo}
                                onChange={handleAddressInputChanges}
                              />
                              {addressErrors.houseNo && (
                                <div style={{ color: 'red' }}>{addressErrors.houseNo}</div>
                              )}
                            </div>

                            <div>
                              <h6>
                                Appointment : <span style={{ color: 'red' }}>*</span>
                              </h6>
                              <CFormInput
                                type="text"
                                name="apartment"
                                value={newAddress.apartment}
                                onChange={handleAddressInputChanges}
                              />
                              {addressErrors.apartment && (
                                <div style={{ color: 'red' }}>{addressErrors.apartment}</div>
                              )}
                            </div>

                            <div>
                              <h6>
                                Street <span style={{ color: 'red' }}>*</span>
                              </h6>
                              <CFormInput
                                type="text"
                                name="street"
                                value={newAddress.street}
                                onChange={handleAddressInputChanges}
                              />
                              {addressErrors.street && (
                                <div style={{ color: 'red' }}>{addressErrors.street}</div>
                              )}
                            </div>

                            <div>
                              <h6>
                                City : <span style={{ color: 'red' }}>*</span>
                              </h6>
                              <CFormInput
                                type="text"
                                name="city"
                                value={newAddress.city}
                                onChange={handleAddressInputChanges}
                              />
                              {addressErrors.city && (
                                <div style={{ color: 'red' }}>{addressErrors.city}</div>
                              )}
                            </div>

                            <div>
                              <h6>
                                Latitude : <span style={{ color: 'red' }}>*</span>
                              </h6>
                              <CFormInput
                                type="number"
                                name="latitude"
                                value={newAddress.latitude}
                                onChange={handleAddressInputChanges}
                              />
                              {addressErrors.latitude && (
                                <div style={{ color: 'red' }}>{addressErrors.latitude}</div>
                              )}
                            </div>

                            <div>
                              <h6>
                                Longitude : <span style={{ color: 'red' }}>*</span>
                              </h6>
                              <CFormInput
                                type="number"
                                name="longitude"
                                value={newAddress.longitude}
                                onChange={handleAddressInputChanges}
                              />
                              {addressErrors.longitude && (
                                <div style={{ color: 'red' }}>{addressErrors.longitude}</div>
                              )}
                            </div>

                            <div>
                              <h6>
                                State : <span style={{ color: 'red' }}>*</span>
                              </h6>
                              <CFormInput
                                type="text"
                                name="state"
                                value={newAddress.state}
                                onChange={handleAddressInputChanges}
                              />
                              {addressErrors.state && (
                                <div style={{ color: 'red' }}>{addressErrors.state}</div>
                              )}
                            </div>

                            <div>
                              <h6>
                                Postal Code : <span style={{ color: 'red' }}>*</span>
                              </h6>
                              <CFormInput
                                type="number"
                                name="postalCode"
                                value={newAddress.postalCode}
                                onChange={handleAddressInputChanges}
                              />
                              {addressErrors.postalCode && (
                                <div style={{ color: 'red' }}>{addressErrors.postalCode}</div>
                              )}
                            </div>

                            <div>
                              <h6>
                                Country <span style={{ color: 'red' }}>*</span>
                              </h6>
                              <CFormInput
                                type="text"
                                name="country"
                                value={newAddress.country}
                                onChange={handleAddressInputChanges}
                              />
                              {addressErrors.country && (
                                <div style={{ color: 'red' }}>{addressErrors.country}</div>
                              )}
                            </div>
                          </div>
                        </CCardBody>
                      </CCard>
                    )}
                  </div>

                  <div style={{ marginTop: '50px' }}>
                    {Array.isArray(editedAddress) && editedAddress.length > 0 ? (
                      editedAddress.map((address, index) => (
                        <CCard key={`address-${index}`} style={{ marginBottom: '1rem' }}>
                          <CCardBody>
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '1rem',
                                marginTop: '1rem',
                              }}
                            >
                              <div
                                style={{
                                  gridColumn: 'span 3',
                                  display: 'flex',
                                  justifyContent: 'flex-end',
                                  marginTop: '10px',
                                }}
                              >
                                {editAddressMode[index] ? (
                                  <>
                                    <CButton
                                      color="warning"
                                      style={{ position: 'absolute', top: '10px', right: '10px' }}
                                      onClick={() => handleAddressCancelClick(index)}
                                    >
                                      Cancel
                                    </CButton>
                                    <CButton
                                      color="primary"
                                      style={{ position: 'absolute', top: '10px', left: '10px' }}
                                      onClick={() => handleAddressUpdateClick(index)}
                                    >
                                      Update
                                    </CButton>
                                  </>
                                ) : (
                                  <CButton
                                    color="secondary"
                                    style={{
                                      position: 'absolute',
                                      top: '10px',
                                      left: '10px',
                                      marginBottom: '20px',
                                    }}
                                    onClick={() => handleAddressEditClick(index)}
                                  >
                                    Edit
                                  </CButton>
                                )}

                                {!editAddressMode[index] && (
                                  <CButton
                                    color="danger"
                                    style={{ position: 'absolute', top: '10px', right: '10px' }}
                                    onClick={() => removeAddress(index)}
                                  >
                                    Remove
                                  </CButton>
                                )}
                              </div>
                              {/* Address Fields */}
                              <div>
                                <strong>House No: </strong>
                                {editAddressMode[index] ? (
                                  <>
                                    <CFormInput
                                      type="text"
                                      name="houseNo"
                                      value={editedAddress[index]?.houseNo || ''}
                                      onChange={(e) => handleAddressInputChange(e, index)}
                                    />
                                    {addressErrors[index]?.houseNo && (
                                      <span className="text-danger">
                                        {addressErrors[index].houseNo}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  address.houseNo || 'NA'
                                )}
                              </div>

                              <div>
                                <strong>Apartment: </strong>
                                {editAddressMode[index] ? (
                                  <>
                                    <CFormInput
                                      type="text"
                                      name="apartment"
                                      value={editedAddress[index]?.apartment || ''}
                                      onChange={(e) => handleAddressInputChange(e, index)}
                                    />
                                    {addressErrors[index]?.apartment && (
                                      <span className="text-danger">
                                        {addressErrors[index].apartment}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  address.apartment || 'NA'
                                )}
                              </div>

                              <div>
                                <strong>Street: </strong>
                                {editAddressMode[index] ? (
                                  <>
                                    <CFormInput
                                      type="text"
                                      name="street"
                                      value={editedAddress[index]?.street || ''}
                                      onChange={(e) => handleAddressInputChange(e, index)}
                                    />
                                    {addressErrors[index]?.street && (
                                      <span className="text-danger">
                                        {addressErrors[index].street}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  address.street || 'NA'
                                )}
                              </div>

                              <div>
                                <strong>City: </strong>
                                {editAddressMode[index] ? (
                                  <>
                                    <CFormInput
                                      type="text"
                                      name="city"
                                      value={editedAddress[index]?.city || ''}
                                      onChange={(e) => handleAddressInputChange(e, index)}
                                    />
                                    {addressErrors[index]?.city && (
                                      <span className="text-danger">
                                        {addressErrors[index].city}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  address.city || 'NA'
                                )}
                              </div>

                              <div>
                                <strong>State: </strong>
                                {editAddressMode[index] ? (
                                  <>
                                    <CFormInput
                                      type="text"
                                      name="state"
                                      value={editedAddress[index]?.state || ''}
                                      onChange={(e) => handleAddressInputChange(e, index)}
                                    />
                                    {addressErrors[index]?.state && (
                                      <span className="text-danger">
                                        {addressErrors[index].state}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  address.state || 'NA'
                                )}
                              </div>

                              <div>
                                <strong>Postal Code: </strong>
                                {editAddressMode[index] ? (
                                  <>
                                    <CFormInput
                                      type="text"
                                      name="postalCode"
                                      value={editedAddress[index]?.postalCode || ''}
                                      onChange={(e) => handleAddressInputChange(e, index)}
                                    />
                                    {addressErrors[index]?.postalCode && (
                                      <span className="text-danger">
                                        {addressErrors[index].postalCode}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  address.postalCode || 'NA'
                                )}
                              </div>

                              <div>
                                <strong>Country: </strong>
                                {editAddressMode[index] ? (
                                  <>
                                    <CFormInput
                                      type="text"
                                      name="country"
                                      value={editedAddress[index]?.country || ''}
                                      onChange={(e) => handleAddressInputChange(e, index)}
                                    />
                                    {addressErrors[index]?.country && (
                                      <span className="text-danger">
                                        {addressErrors[index].country}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  address.country || 'NA'
                                )}
                              </div>

                              <div>
                                <strong>Latitude: </strong>
                                {editAddressMode[index] ? (
                                  <>
                                    <CFormInput
                                      type="number"
                                      name="latitude"
                                      value={editedAddress[index]?.latitude || ''}
                                      onChange={(e) => handleAddressInputChange(e, index)}
                                    />
                                    {addressErrors[index]?.latitude && (
                                      <span className="text-danger">
                                        {addressErrors[index].latitude}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  address.latitude || 'NA'
                                )}
                              </div>

                              <div>
                                <strong>Longitude: </strong>
                                {editAddressMode[index] ? (
                                  <>
                                    <CFormInput
                                      type="number"
                                      name="longitude"
                                      value={editedAddress[index]?.longitude || ''}
                                      onChange={(e) => handleAddressInputChange(e, index)}
                                    />
                                    {addressErrors[index]?.longitude && (
                                      <span className="text-danger">
                                        {addressErrors[index].longitude}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  address.longitude || 'NA'
                                )}
                              </div>
                            </div>
                          </CCardBody>
                        </CCard>
                      ))
                    ) : (
                      <div>No address data available</div>
                    )}
                  </div>
                </CAccordionBody>
              </CAccordionItem>
            </CAccordion>
          )}

          {activeTab === 'Appointments' && (
            <CAccordion className="mt-4" activeItemKey={0}>
              <CAccordionItem itemKey={0}>
                <CAccordionHeader>Appointment Details</CAccordionHeader>

                <div style={{ marginTop: '20px' }}>
                  <CButton
                    color="success"
                    style={{
                      float: 'right',
                      marginBottom: '1rem',
                      marginRight: '30px',
                    }}
                    onClick={addNewAppointment}
                  >
                    Book Appointment
                  </CButton>
                </div>
                <div style={{ marginTop: '80px' }}>
                  {isAddingNewAppointment && (
                    <CCard style={{ marginBottom: '1rem' }}>
                      <CCardBody>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '1rem',
                            marginTop: '1rem',
                          }}
                        >
                          <div
                            style={{
                              gridColumn: 'span 3',
                              display: 'flex',
                              justifyContent: 'space-between',
                              marginTop: '1rem',
                            }}
                          >
                            <CButton color="primary" onClick={handleSaveNewAppointment}>
                              Save
                            </CButton>
                            <CButton color="warning" onClick={handleCancelAddAppointment}>
                              Cancel
                            </CButton>
                          </div>

                          {/* Patient Details Section */}
                          <div style={{ gridColumn: 'span 3' }}>
                            <CCardHeader
                              style={{
                                textAlign: 'center',
                                fontWeight: 'bold',
                                fontSize: '20px',
                              }}
                            >
                              Patient Details
                            </CCardHeader>
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '1rem',
                              }}
                            >
                              <div>
                                <h6>
                                  Category Name <span style={{ color: 'red' }}>*</span>
                                </h6>
                                <CFormSelect
                                  name="categoryName"
                                  value={service.categoryName || ''}
                                  onChange={handleCategoryChange}
                                >
                                  <option value="">Select Category</option>
                                  {categoryList.length > 0 ? (
                                    categoryList.map((categoryItem, index) => (
                                      <option key={index} value={categoryItem.categoryName}>
                                        {categoryItem.categoryName}
                                      </option>
                                    ))
                                  ) : (
                                    <option disabled>Loading categories...</option>
                                  )}
                                </CFormSelect>
                              </div>

                              <div>
                                <h6>
                                  Patient Name <span style={{ color: 'red' }}>*</span>
                                </h6>
                                <CFormInput
                                  type="text"
                                  name="patientName"
                                  value={newAppointment.patientName}
                                  onChange={handleNewAppointmentInputChanges}
                                />
                                {AppointmentErrors.patientName && (
                                  <span style={{ color: 'red' }}>
                                    {AppointmentErrors.patientName}
                                  </span>
                                )}
                              </div>

                              <div>
                                <h6>
                                  Relationship <span style={{ color: 'red' }}>*</span>
                                </h6>
                                <CFormInput
                                  type="text"
                                  name="relationShip"
                                  value={newAppointment.relationShip}
                                  onChange={handleNewAppointmentInputChanges}
                                />
                                {AppointmentErrors.relationShip && (
                                  <span style={{ color: 'red' }}>
                                    {AppointmentErrors.relationShip}
                                  </span>
                                )}
                              </div>

                              <div>
                                <h6>
                                  Gender <span style={{ color: 'red' }}>*</span>
                                </h6>
                                <CFormSelect
                                  name="gender"
                                  value={newAppointment.gender}
                                  onChange={handleNewAppointmentInputChanges}
                                >
                                  <option value="">Select Gender</option>
                                  <option value="male">Male</option>
                                  <option value="female">Female</option>
                                </CFormSelect>
                                {AppointmentErrors.gender && (
                                  <span style={{ color: 'red' }}>{AppointmentErrors.gender}</span>
                                )}
                              </div>

                              <div>
                                <h6>
                                  Email ID <span style={{ color: 'red' }}>*</span>
                                </h6>
                                <CFormInput
                                  type="email"
                                  name="emailId"
                                  value={newAppointment.emailId}
                                  onChange={handleNewAppointmentInputChanges}
                                />
                                {AppointmentErrors.emailId && (
                                  <span style={{ color: 'red' }}>{AppointmentErrors.emailId}</span>
                                )}
                              </div>

                              <div>
                                <h6>
                                  Age <span style={{ color: 'red' }}>*</span>
                                </h6>
                                <CFormInput
                                  type="text"
                                  name="age"
                                  value={newAppointment.age}
                                  onChange={handleNewAppointmentInputChanges}
                                />
                                {AppointmentErrors.age && (
                                  <span style={{ color: 'red' }}>{AppointmentErrors.age}</span>
                                )}
                              </div>

                              <div>
                                <h6>
                                  Patient Number <span style={{ color: 'red' }}>*</span>
                                </h6>
                                <CFormInput
                                  type="number"
                                  name="patientNumber"
                                  value={newAppointment.patientNumber}
                                  onChange={handleNewAppointmentInputChanges}
                                />
                                {AppointmentErrors.patientNumber && (
                                  <span style={{ color: 'red' }}>
                                    {AppointmentErrors.patientNumber}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div style={{ gridColumn: 'span 3' }}>
                            <CCardHeader
                              style={{
                                textAlign: 'center',
                                fontWeight: 'bold',
                                fontSize: '20px',
                              }}
                            >
                              Patient Appointment
                            </CCardHeader>
                            <div style={{ gridColumn: 'span 3', position: 'relative' }}>
                              <CButton
                                color="secondary"
                                onClick={() =>
                                  setNewAppointment((prev) => ({
                                    ...prev,
                                    servicesAdded: [
                                      ...prev.servicesAdded,
                                      {
                                        serviceName: '',
                                        pricing: 0,
                                        discount: 0,
                                        discountAmount: 0,
                                        discountedCost: 0,
                                        tax: 0,
                                        taxAmount: 0,
                                        finalCost: 0,
                                        serviceStartDate: '',
                                        serviceEndDate: '',
                                        startTime: '',
                                        endTime: '',
                                        numberOfDays: 0,
                                        numberOfHours: 0,
                                      },
                                    ],
                                  }))
                                }
                                style={{
                                  position: 'absolute',
                                  marginTop: '-25px',
                                  right: '10px',
                                  zIndex: 10,
                                  marginBottom: '10px',
                                }}
                              >
                                Add Service
                              </CButton>
                              <div style={{ marginTop: '30px' }}>
                                {newAppointment.servicesAdded.map((service, index) => (
                                  <div
                                    key={index}
                                    style={{
                                      display: 'grid',
                                      gridTemplateColumns: 'repeat(4, 1fr)',
                                      gap: '1rem',
                                      marginBottom: '1rem',
                                      paddingTop: '30px',
                                    }}
                                  >
                                    {/* Service Name */}
                                    <div>
                                      <h6>
                                        Service Name <span style={{ color: 'red' }}>*</span>
                                      </h6>
                                      <CFormSelect
                                        name={`serviceName-${index}`}
                                        value={service.serviceName || ''}
                                        onChange={(e) => handleServiceChange(e, index)}
                                      >
                                        <option value="">Select Service</option>
                                        {filteredServiceList && filteredServiceList.length > 0 ? (
                                          filteredServiceList.map((serviceOption, i) => (
                                            <option key={i} value={serviceOption.serviceName}>
                                              {serviceOption.serviceName}
                                            </option>
                                          ))
                                        ) : (
                                          <option value="">
                                            No services available for this category
                                          </option>
                                        )}
                                      </CFormSelect>
                                    </div>

                                    {/* Price */}
                                    <div>
                                      <h6>Price</h6>
                                      <CFormInput
                                        type="number"
                                        name={`price-${index}`}
                                        value={service.price || ''}
                                        onChange={(e) => handleServiceChange(e, index)}
                                      />
                                    </div>

                                    {/* Discount */}
                                    <div>
                                      <h6>Discount (%)</h6>
                                      <CFormInput
                                        type="number"
                                        name={`discount-${index}`}
                                        value={service.discount || ''}
                                        onChange={(e) => handleServiceChange(e, index)}
                                      />
                                    </div>

                                    {/* Discount Amount */}
                                    <div>
                                      <h6>Discount Amount</h6>
                                      <CFormInput
                                        type="number"
                                        name={`discountAmount-${index}`}
                                        value={service.discountAmount || ''}
                                        onChange={(e) => handleServiceChange(e, index)}
                                        readOnly
                                      />
                                    </div>

                                    {/* Discounted Cost */}
                                    <div>
                                      <h6>Discounted Cost</h6>
                                      <CFormInput
                                        type="number"
                                        name={`discountedCost-${index}`}
                                        value={service.discountedCost || ''}
                                        onChange={(e) => handleServiceChange(e, index)}
                                        readOnly
                                      />
                                    </div>

                                    {/* Tax */}
                                    <div>
                                      <h6>Tax (%)</h6>
                                      <CFormInput
                                        type="number"
                                        name={`tax-${index}`}
                                        value={service.tax || ''}
                                        onChange={(e) => handleServiceChange(e, index)}
                                      />
                                    </div>

                                    {/* Tax Amount */}
                                    <div>
                                      <h6>Tax Amount</h6>
                                      <CFormInput
                                        type="number"
                                        name={`taxAmount-${index}`}
                                        value={service.taxAmount || ''}
                                        onChange={(e) => handleServiceChange(e, index)}
                                        readOnly
                                      />
                                    </div>

                                    {/* Final Cost */}
                                    <div>
                                      <h6>Final Cost</h6>
                                      <CFormInput
                                        type="number"
                                        name={`finalCost-${index}`}
                                        value={service.finalCost || ''}
                                        onChange={(e) => handleServiceChange(e, index)}
                                        readOnly
                                      />
                                    </div>

                                    <div>
                                      <h6>
                                        Start Date <span style={{ color: 'red' }}>*</span>
                                      </h6>
                                      <CFormInput
                                        type="date"
                                        name={`serviceStartDate-${index}`}
                                        value={service.serviceStartDate || ''}
                                        onChange={(e) =>
                                          handleDateChange(e, index, 'serviceStartDate')
                                        }
                                      />
                                      {AppointmentErrors[`serviceStartDate-${index}`] && (
                                        <span style={{ color: 'red' }}>
                                          {AppointmentErrors[`serviceStartDate-${index}`]}
                                        </span>
                                      )}
                                    </div>

                                    <div>
                                      <h6>
                                        End Date <span style={{ color: 'red' }}>*</span>
                                      </h6>
                                      <CFormInput
                                        type="date"
                                        name={`serviceEndDate-${index}`}
                                        value={service.serviceEndDate || ''}
                                        onChange={(e) =>
                                          handleDateChange(e, index, 'serviceEndDate')
                                        }
                                      />
                                      {AppointmentErrors[`serviceEndDate-${index}`] && (
                                        <span style={{ color: 'red' }}>
                                          {AppointmentErrors[`serviceEndDate-${index}`]}
                                        </span>
                                      )}
                                    </div>

                                    <div>
                                      <h6>Number of Days : </h6>
                                      <CFormInput
                                        type="number"
                                        name={`numberOfDays-${index}`}
                                        value={service.numberOfDays || 0}
                                        readOnly
                                      />
                                    </div>

                                    <div>
                                      <h6>
                                        Start Time <span style={{ color: 'red' }}>*</span>
                                      </h6>
                                      <CFormInput
                                        type="time"
                                        name={`startTime-${index}`}
                                        value={service.startTime || ''}
                                        onChange={(e) => handleTimeChange(e, index, 'startTime')}
                                      />
                                    </div>

                                    <div>
                                      <h6>
                                        End Time <span style={{ color: 'red' }}>*</span>
                                      </h6>
                                      <CFormInput
                                        type="time"
                                        name={`endTime-${index}`}
                                        value={service.endTime || ''}
                                        onChange={(e) => handleTimeChange(e, index, 'endTime')}
                                      />
                                    </div>

                                    <div>
                                      <h6>Number of Hours and Minutes: </h6>
                                      <CFormInput
                                        type="text"
                                        name={`numberOfHoursAndMinutes-${index}`}
                                        value={
                                          service.numberOfHours !== undefined &&
                                          service.numberOfMinutes !== undefined
                                            ? `${service.numberOfHours} hrs ${service.numberOfMinutes} mins`
                                            : ''
                                        }
                                        readOnly
                                      />
                                    </div>

                                    {/* Remove Service Button */}
                                    <CButton
                                      color="danger"
                                      onClick={() => handleRemoveService(index)}
                                      style={{
                                        position: 'absolute',
                                        right: '10px',
                                        marginTop: '260px',
                                        zIndex: 10,
                                      }}
                                    >
                                      Cancel
                                    </CButton>
                                  </div>
                                ))}
                              </div>
                              <div>
                                <strong>Total Cost </strong>
                                <CFormInput
                                  type="text"
                                  name="totalCost"
                                  style={{ width: '100px' }}
                                  value={newAppointment.totalCost || ''}
                                  onChange={handleNewAppointmentInputChanges}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Address Section */}
                          <div style={{ gridColumn: 'span 3' }}>
                            <CCardHeader
                              style={{
                                textAlign: 'center',
                                fontWeight: 'bold',
                                fontSize: '20px',
                              }}
                            >
                              Patient Address
                            </CCardHeader>
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '1rem',
                              }}
                            >
                              <div>
                                <h6>
                                  House No <span style={{ color: 'red' }}>*</span>
                                </h6>
                                <CFormInput
                                  type="text"
                                  name="houseNo"
                                  value={newAppointment.addressDto.houseNo}
                                  onChange={handleNewAppointmentInputChanges}
                                />
                                {AppointmentErrors.houseNo && (
                                  <span style={{ color: 'red' }}>{AppointmentErrors.houseNo}</span>
                                )}
                              </div>

                              <div>
                                <h6>
                                  Apartment <span style={{ color: 'red' }}>*</span>
                                </h6>
                                <CFormInput
                                  type="text"
                                  name="apartment"
                                  value={newAppointment.addressDto.apartment}
                                  onChange={handleNewAppointmentInputChanges}
                                />
                                {AppointmentErrors.apartment && (
                                  <span style={{ color: 'red' }}>
                                    {AppointmentErrors.apartment}
                                  </span>
                                )}
                              </div>

                              <div>
                                <h6>
                                  Street <span style={{ color: 'red' }}>*</span>
                                </h6>
                                <CFormInput
                                  type="text"
                                  name="street"
                                  value={newAppointment.addressDto.street}
                                  onChange={handleNewAppointmentInputChanges}
                                />
                                {AppointmentErrors.street && (
                                  <span style={{ color: 'red' }}>{AppointmentErrors.street}</span>
                                )}
                              </div>

                              <div>
                                <h6>
                                  Latitude <span style={{ color: 'red' }}>*</span>
                                </h6>
                                <CFormInput
                                  type="number"
                                  name="latitude"
                                  value={newAppointment.addressDto.latitude}
                                  onChange={handleNewAppointmentInputChanges}
                                />
                                {AppointmentErrors.latitude && (
                                  <span style={{ color: 'red' }}>{AppointmentErrors.latitude}</span>
                                )}
                              </div>

                              <div>
                                <h6>
                                  longitude <span style={{ color: 'red' }}>*</span>
                                </h6>
                                <CFormInput
                                  type="number"
                                  name="longitude"
                                  value={newAppointment.addressDto.longitude}
                                  onChange={handleNewAppointmentInputChanges}
                                />
                                {AppointmentErrors.longitude && (
                                  <span style={{ color: 'red' }}>
                                    {AppointmentErrors.longitude}
                                  </span>
                                )}
                              </div>

                              <div>
                                <h6>
                                  Direction <span style={{ color: 'red' }}>*</span>
                                </h6>
                                <CFormInput
                                  type="text"
                                  name="direction"
                                  value={newAppointment.addressDto.direction}
                                  onChange={handleNewAppointmentInputChanges}
                                />
                                {AppointmentErrors.direction && (
                                  <span style={{ color: 'red' }}>
                                    {AppointmentErrors.direction}
                                  </span>
                                )}
                              </div>

                              <div>
                                <h6>
                                  City <span style={{ color: 'red' }}>*</span>
                                </h6>
                                <CFormInput
                                  type="text"
                                  name="city"
                                  value={newAppointment.addressDto.city}
                                  onChange={handleNewAppointmentInputChanges}
                                />
                                {AppointmentErrors.city && (
                                  <span style={{ color: 'red' }}>{AppointmentErrors.city}</span>
                                )}
                              </div>

                              <div>
                                <h6>
                                  State <span style={{ color: 'red' }}>*</span>
                                </h6>
                                <CFormInput
                                  type="text"
                                  name="state"
                                  value={newAppointment.addressDto.state}
                                  onChange={handleNewAppointmentInputChanges}
                                />
                                {AppointmentErrors.state && (
                                  <span style={{ color: 'red' }}>{AppointmentErrors.state}</span>
                                )}
                              </div>

                              <div>
                                <h6>
                                  Postal Code <span style={{ color: 'red' }}>*</span>
                                </h6>
                                <CFormInput
                                  type="number"
                                  name="postalCode"
                                  value={newAppointment.addressDto.postalCode}
                                  onChange={handleNewAppointmentInputChanges}
                                />
                                {AppointmentErrors.postalCode && (
                                  <span style={{ color: 'red' }}>
                                    {AppointmentErrors.postalCode}
                                  </span>
                                )}
                              </div>

                              <div>
                                <h6>
                                  Country <span style={{ color: 'red' }}>*</span>
                                </h6>
                                <CFormInput
                                  type="text"
                                  name="country"
                                  value={newAppointment.addressDto.country}
                                  onChange={handleNewAppointmentInputChanges}
                                />
                                {AppointmentErrors.country && (
                                  <span style={{ color: 'red' }}>{AppointmentErrors.country}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CCardBody>
                    </CCard>
                  )}
                </div>

                <CAccordionItem itemKey={4}>
                  <CAccordionHeader>Past Appointments</CAccordionHeader>
                  <CAccordionBody>
                    {renderAppointmentList(completedAppointments, 'Past Appointments')}
                  </CAccordionBody>
                </CAccordionItem>
                <CAccordionItem itemKey={2}>
                  <CAccordionHeader>Active Appointments</CAccordionHeader>
                  <CAccordionBody>
                    {renderAppointmentList(activeAppointments, 'Active Appointments')}
                  </CAccordionBody>
                </CAccordionItem>

                <CAccordionItem itemKey={3}>
                  <CAccordionHeader>Upcoming Appointments</CAccordionHeader>
                  <CAccordionBody>
                    {renderAppointmentList(upcomingAppointments, 'Upcoming Appointments')}
                  </CAccordionBody>
                </CAccordionItem>
              </CAccordionItem>
            </CAccordion>
          )}

          <CModal visible={showStatusModal} onClose={handleCancelModal}>
            <CModalHeader>Update Customer Status</CModalHeader>
            <CModalBody>
              <CFormSelect
                name="status"
                value={pendingStatus}
                onChange={(e) => setPendingStatus(e.target.value)}
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </CFormSelect>
              <CFormInput
                type="text"
                placeholder="Enter remarks (optional)"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="mt-2"
              />
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={handleCancelModal}>
                Cancel
              </CButton>
              <CButton color="primary" onClick={handleStatusSubmit}>
                Update Status
              </CButton>
            </CModalFooter>
          </CModal>
          <CModal visible={showSuspendModal} onClose={() => setShowSuspendModal(false)}>
            <CModalHeader>Suspend Customer</CModalHeader>
            <CModalBody>
              <CFormInput
                type="text"
                placeholder="Remarks"
                value={remark}
                onChange={handleRemarkChange}
              />
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setShowSuspendModal(false)}>
                Close
              </CButton>
              <CButton color="danger" onClick={handleSuspendSubmit}>
                Suspend Customer
              </CButton>
            </CModalFooter>
          </CModal>
        </>
      ) : (
        <div style={centeredMessageStyle}>Loading customer details...</div>
      )}
    </div>
  )
}

export default CustomerViewDetails
