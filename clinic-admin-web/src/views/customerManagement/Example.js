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
  CRow,
  CCol,
  CFormSelect,
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
import { service } from '../../baseUrl'

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
  const [addressErrors, setAddressErrors] = useState({})

  const [appointments, setAppointments] = useState([])
  const [editedAppointments, setEditedAppointments] = useState([])
  const [editAppointmentMode, setEditAppointmentMode] = useState([])

  const [isAddingNewAppointment, setIsAddingNewAppointment] = useState(false)
  const [newAppointment, setNewAppointment] = useState({})

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
    servicesAdded: [],
    totalCost: '',
    serviceStartDate: '',
    serviceEndDate: '',
    numberOfDays: '',
    startTime: '',
    endTime: '',
    numberOfHours: '',
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
      console.log(data.data)
      setCategoryList(data.data)
      setServiceList(data.data.map((category) => category.services))
    } catch (error) {
      setError('Failed to fetch category data.')
    }
  }

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

    if (name === 'mobileNumber') {
      if (value.length !== 10) {
        setMobileError('Mobile number must be 10 digits long.')
      } else {
        setMobileError('')
      }
    }

    if (name === 'emailId') {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/
      if (!emailRegex.test(value)) {
        setEmailError('Please enter a valid Gmail address.')
      } else {
        setEmailError('')
      }
    }

    if (name === 'status') {
      setPendingStatus(value)
    }
  }

  const handleUpdateClick = async () => {
    if (mobileError || emailError) {
      toast.error('Please fix the errors before updating the customer.', {
        position: 'top-right',
      })
      return
    }

    const mobileNumber = editedCustomer?.mobileNumber
    if (!mobileNumber || isNaN(Number(mobileNumber))) {
      console.error('Mobile number is missing or invalid in editedCustomer:', editedCustomer)
      toast.error('Invalid mobile number.', { position: 'top-right' })
      return
    }

    const { id, ...updatedCustomerData } = editedCustomer

    updatedCustomerData.status = pendingStatus || updatedCustomerData.status

    console.log(mobileNumber, updatedCustomerData)

    try {
      await updateCustomerData(mobileNumber, updatedCustomerData)
      setCustomer(updatedCustomerData)
      setEditMode(false)
      toast.success('Customer details updated successfully!', {
        position: 'top-right',
        autoClose: 3000,
      })
    } catch (error) {
      toast.error('Failed to update customer details.', { position: 'top-right' })
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
      toast.error('Failed to update customer status.', { position: 'top-right' })
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

  const handleAddressInputChange = (e, index) => {
    const { name, value } = e.target
    const updatedAddresses = [...editedAddress]
    updatedAddresses[index] = {
      ...updatedAddresses[index],
      [name]: value,
    }
    setEditedAddress(updatedAddresses)
  }

  const handleAddressUpdateClick = async (index) => {
    try {
      const updatedAddress = editedAddress[index]
      console.log('Sending data to API for update:', id, updatedAddress)

      const addressData = [updatedAddress]

      await updateAddressData(id, index, addressData)

      console.log('Address updated successfully')

      const updatedEditAddressMode = [...editAddressMode]
      updatedEditAddressMode[index] = false
      setEditAddressMode(updatedEditAddressMode)
      toast.success(' Address Updated successfully!', { position: 'top-right' })

      await fetchCustomer()
    } catch (error) {
      console.error('Error updating address:', error)
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

  // Appointments Details

  ////////////////add New Appointments /////////////////

  const handleCategoryChange = (e) => {
    const { name, value } = e.target

    setAppointmentErrors((prevErrors) => {
      const newErrors = { ...prevErrors }
      if (newErrors[name]) {
        delete newErrors[name]
      }
      return newErrors
    })
    setService((prevState) => ({
      ...prevState,
      categoryName: value,
      serviceName: '',
    }))

    const selectedCategory = categoryList.find((category) => category.categoryName === value)

    console.log('Selected Category:', selectedCategory)

    if (selectedCategory && selectedCategory.categoryId) {
      const filteredServices = serviceList.filter((service) => {
        return service.categoryId === selectedCategory.categoryId
      })

      console.log('Filtered Services:', filteredServices)

      if (filteredServices.length > 0) {
        setFilteredServiceList(filteredServices)
      } else {
        console.log('No matching services for this category.')
        setFilteredServiceList([])
      }
    } else {
      console.log('No matching category found or categoryId is missing.')
      setFilteredServiceList([])
    }

    setNewAppointment((prevState) => ({
      ...prevState,
      categoryName: value,
    }))
  }

  const handleServiceChange = async (e, index) => {
    const selectedServiceName = e.target.value
    const { name, value } = e.target

    console.log('Selected service:', selectedServiceName)

    const selectedService = filteredServiceList.find(
      (service) => service.serviceName === selectedServiceName,
    )

    // Update errors
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
          startDate: '', // Reset Start Date
          endDate: '', // Reset End Date
          startTime: '', // Reset Start Time
          endTime: '', // Reset End Time
        }

        // Calculate totals
        const { totalPrice, totalDiscountAmount, totalTax, totalPayAmount } =
          calculateTotals(updatedServices)

        return {
          ...prev,
          servicesAdded: updatedServices,
          totalCost: totalPayAmount,
          totalPrice: totalPrice,
          totalDiscountAmount: totalDiscountAmount,
          totalTax: totalTax,
          payAmount: totalPayAmount,
        }
      })

      setIsServiceChanged(true)
    }

    // Handle change for startDate, endDate, startTime, endTime
    if (name === 'startDate' || name === 'endDate' || name === 'startTime' || name === 'endTime') {
      const updatedServices = [...servicesAdded]
      updatedServices[index] = {
        ...updatedServices[index],
        [name]: value,
      }

      // Calculate number of days and hours if dates or times are changed
      if (
        name === 'startDate' ||
        name === 'endDate' ||
        name === 'startTime' ||
        name === 'endTime'
      ) {
        const { numberOfDays, numberOfHours } = calculateDaysAndHours(updatedServices[index])
        updatedServices[index].numberOfDays = numberOfDays
        updatedServices[index].numberOfHours = numberOfHours
      }

      setServicesAdded(updatedServices)
    }
  }

  const calculateTotals = (services) => {
    const totalPrice = services.reduce((total, service) => total + (service.finalCost || 0), 0)
    const totalDiscountAmount = services.reduce(
      (total, service) => total + (service.discountAmount || 0),
      0,
    )
    const totalTax = services.reduce((total, service) => total + (service.taxAmount || 0), 0)
    const totalPayAmount = services.reduce((total, service) => total + (service.payAmount || 0), 0) 

    return { totalPrice, totalDiscountAmount, totalTax, totalPayAmount }
  }

  const handleRemoveService = (index) => {
    setNewAppointment((prev) => {
      const updatedServices = prev.servicesAdded.filter((_, i) => i !== index)

      const updatedTotalCost = calculateTotalCost(updatedServices)

      return {
        ...prev,
        servicesAdded: updatedServices,
        totalCost: updatedTotalCost,
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

  const calculateDaysAndHours = (service) => {
    const { startDate, endDate, startTime, endTime } = service

    const startDateTime = new Date(`${startDate}T${startTime}:00Z`)
    const endDateTime = new Date(`${endDate}T${endTime}:00Z`)

    const diffMilliseconds = Math.abs(endDateTime - startDateTime)

    const numberOfDays = Math.floor(diffMilliseconds / (1000 * 60 * 60 * 24))

    const remainingMilliseconds = diffMilliseconds % (1000 * 60 * 60 * 24)

    const numberOfHours = Math.floor(remainingMilliseconds / (1000 * 60 * 60))

    return { numberOfDays, numberOfHours }
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
      status: 'pending',
      servicesAdded: [
        {
          serviceId: '',
          serviceName: '',
          price: 0,
          discount: 0,
          discountCost: 0,
          finalCost: 0,
        },
      ],
      totalCost: 0,
      serviceStartDate: '',
      serviceEndDate: '',
      numberOfHours: 0,
      numberOfDays: 0,
      startTime: '',
      endTime: '',
    })
    setIsAddingNewAppointment(true)
  }

  const validateFields = () => {
    const newErrors = {}

    if (!newAppointment.categoryName) newErrors.categoryName = 'Category Name is required'

    if (!newAppointment.patientName) newErrors.patientName = 'Patient Name is required'

    if (!newAppointment.relationShip) newErrors.relationShip = 'Relationship is required'

    // Validate Gender (String)
    if (!newAppointment.gender) newErrors.gender = 'Gender is required'

    if (!newAppointment.emailId) {
      newErrors.emailId = 'Email ID is required'
    } else if (!/\S+@\S+\.\S+/.test(newAppointment.emailId)) {
      newErrors.emailId = 'Email ID is invalid'
    }

    if (!newAppointment.age) {
      newErrors.age = 'Age is required'
    } else if (isNaN(newAppointment.age) || newAppointment.age <= 0) {
      newErrors.age = 'Age must be a valid number greater than 0'
    }

    if (!newAppointment.patientNumber) {
      newErrors.patientNumber = 'Patient Number is required'
    } else if (isNaN(newAppointment.patientNumber) || newAppointment.patientNumber <= 0) {
      newErrors.patientNumber = 'Patient Number must be a valid number greater than 0'
    }

    if (newAppointment.servicesAdded.length === 0) {
      newErrors.servicesAdded = 'At least one service must be added'
    } else {
      newAppointment.servicesAdded.forEach((service, index) => {
        if (!service.serviceName) {
          newErrors[`serviceName-${index}`] = 'Service Name is required'
        }
        if (!service.pricing) {
          newErrors[`servicePrice-${index}`] = 'Price is required'
        } else if (isNaN(service.pricing) || service.pricing <= 0) {
          newErrors[`servicePrice-${index}`] = 'Price must be a valid number greater than 0'
        }
      })
    }

    if (!newAppointment.serviceStartDate) {
      newErrors.serviceStartDate = 'Service Start Date is required'
    } else if (new Date(newAppointment.serviceStartDate).toString() === 'Invalid Date') {
      newErrors.serviceStartDate = 'Service Start Date is invalid'
    }

    if (!newAppointment.serviceEndDate) {
      newErrors.serviceEndDate = 'Service End Date is required'
    } else if (new Date(newAppointment.serviceEndDate).toString() === 'Invalid Date') {
      newErrors.serviceEndDate = 'Service End Date is invalid'
    }

    if (!newAppointment.startTime) {
      newErrors.startTime = 'Start Time is required'
    }

    if (!newAppointment.endTime) {
      newErrors.endTime = 'End Time is required'
    }

    if (!newAppointment.addressDto.houseNo) newErrors.houseNo = 'House No is required'
    if (!newAppointment.addressDto.apartment) newErrors.apartment = 'Apartment is required'
    if (!newAppointment.addressDto.street) newErrors.street = 'Street is required'
    if (!newAppointment.addressDto.city) newErrors.city = 'City is required'
    if (!newAppointment.addressDto.state) newErrors.state = 'State is required'
    if (!newAppointment.addressDto.postalCode) newErrors.postalCode = 'Postal Code is required'
    if (!newAppointment.addressDto.country) newErrors.country = 'Country is required'

    if (!newAppointment.addressDto.latitude) newErrors.latitude = 'Latitude is required'
    else if (isNaN(newAppointment.addressDto.latitude))
      newErrors.latitude = 'Latitude must be a valid number'

    if (!newAppointment.addressDto.longitude) newErrors.longitude = 'Longitude is required'
    else if (isNaN(newAppointment.addressDto.longitude))
      newErrors.longitude = 'Longitude must be a valid number'

    if (!newAppointment.addressDto.direction) newErrors.direction = 'Direction is required'

    setAppointmentErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSaveNewAppointment = async () => {
    // const isValid = validateFields()
    // if (!isValid) {
    //   toast.error('Please fill in all required fields', { position: 'top-right' })
    //   return
    // }

    const appointmentData = {
      patientName: newAppointment.patientName,
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
      categoryName: newAppointment.categoryName,
      servicesAdded:
        newAppointment.servicesAdded?.map((service) => ({
          status: 'pending',
          serviceId: service.serviceId,
          serviceName: service.serviceName,
          startDate: newAppointment.serviceStartDate
            ? new Date(newAppointment.serviceStartDate).toISOString()
            : '',
          endDate: newAppointment.serviceEndDate
            ? new Date(newAppointment.serviceEndDate).toISOString()
            : '',
          numberOfHours: newAppointment.numberOfHours,
          numberOfDays: newAppointment.numberOfDays,
          startTime: newAppointment.startTime,
          endTime: newAppointment.endTime,
          price: parseFloat(service.price),
          discount: service.discount,
          discountAmount: parseFloat(service.discountAmount),
          discountedCost: parseFloat(service.discountedCost),
          tax: service.tax,
          taxAmount: parseFloat(service.taxAmount),
          finalCost: parseFloat(service.finalCost),
        })) || [],
      totalPrice: parseFloat(newAppointment.totalPrice),
      totalDiscountAmount: parseFloat(newAppointment.totalDiscountAmount),
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
      toast.error('Failed to book appointment.', { position: 'top-right' })
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
      servicesAdded: [],
      serviceStartDate: '',
      serviceEndDate: '',
      startTime: '',
      endTime: '',
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

///////////////edit Appointment///////////////////

  const toggleEditMode = (index) => {
    const newEditMode = [...editAppointmentMode]
    newEditMode[index] = !newEditMode[index]
    setEditAppointmentMode(newEditMode)
  }
  const calculateNumberOfDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
  
    const start = new Date(startDate);
    const end = new Date(endDate);
  
    const timeDifference = end - start;
    const days = timeDifference / (1000 * 3600 * 24);
  
    return days >= 0 ? Math.max(Math.ceil(days), 1) : 0;
  };
  

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

  const handleUpdateAppointment = async (index) => {
    const appointment = appointments[index]; 
  
    const updatedAppointment = {
      categoryName: appointment.categoryName,
      patientName: appointment.patientName,
      relationShip: appointment.relationShip,
      gender: appointment.gender,
      emailId: appointment.emailId,
      age: appointment.age,
      patientNumber: appointment.patientNumber,
      addressDto: {
        houseNo: appointment.addressDto?.houseNo || '',
        street: appointment.addressDto?.street || '',
        city: appointment.addressDto?.city || '',
        state: appointment.addressDto?.state || '',
        postalCode: appointment.addressDto?.postalCode || '',
        country: appointment.addressDto?.country || '',
        latitude: appointment.addressDto?.latitude || '',
        longitude: appointment.addressDto?.longitude || '',
      },
      servicesAdded: appointment.servicesAdded.map((service) => ({
        serviceName: service.serviceName,
        price: service.price,
        discount: service.discount,
        discountAmount: service.discountAmount,
        discountedCost: service.discountedCost,
        tax: service.tax,
        taxAmount: service.taxAmount,
        finalCost: service.finalCost,
        startDate: service.startDate,
        endDate: service.endDate,
        numberOfDays: service.numberOfDays,
        startTime: service.startTime,
        endTime: service.endTime,
        numberOfHours: service.numberOfHours,
      })),
    };
    
  
    try {
      console.log(updatedAppointment)
      const result = await updateAppointmentAPI(appointment.appointmentId, updatedAppointment);
      console.log('Update successful:', result);
  
    } catch (error) {
      console.error('Failed to update appointment:', error.message);
    }
  };
  

  const cancelEdit = (index) => {
    const updatedAppointments = [...appointments]
    setEditedAppointments(updatedAppointments)
    setEditAppointmentMode(editAppointmentMode.map((mode, idx) => (idx === index ? false : mode)))
  }

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

  // const handleFieldChange = (index, field, value) => {
  //   const updatedAppointments = [...appointments]
  //   updatedAppointments[index] = {
  //     ...updatedAppointments[index],
  //     [field]: value,
  //   }
  //   setAppointments(updatedAppointments)
  // }

 

  const activeAppointments = appointments.filter((appointment) =>
    appointment.servicesAdded.some((service) => service.status === 'pending'),
  )
  const completedAppointments = appointments.filter((appointment) =>
    appointment.servicesAdded.some((service) => service.status === 'completed'),
  )
  const upcomingAppointments = appointments.filter((appointment) =>
    appointment.servicesAdded.some((service) => service.status === 'accepted'),
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
              <CCol xs="12" className="d-flex justify-content-between mb-3">
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
                )}
              </CCol>

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
                        <CFormInput
                          type="text"
                          name="fullName"
                          value={editedCustomer.fullName}
                          onChange={handleInputChange}
                        />
                      ) : (
                        editedCustomer.fullName
                      )}
                    </p>
                    <p>
                      <strong>Email : </strong>{' '}
                      {editMode ? (
                        <CFormInput
                          type="text"
                          name="emailId"
                          value={editedCustomer.emailId || ''}
                          onChange={handleInputChange}
                        />
                      ) : (
                        editedCustomer.emailId
                      )}
                      {emailError && <span className="text-danger">{emailError}</span>}
                    </p>

                    <p>
                      <strong>Age : </strong>{' '}
                      {editMode ? (
                        <CFormInput
                          type="number"
                          name="age"
                          value={editedCustomer.age}
                          onChange={handleInputChange}
                        />
                      ) : (
                        editedCustomer.age
                      )}
                    </p>
                    <p>
                      <strong>Mobile Number : </strong>{' '}
                      {editMode ? (
                        <CFormInput
                          type="number"
                          name="mobileNumber"
                          value={editedCustomer.mobileNumber}
                          onChange={handleInputChange}
                        />
                      ) : (
                        editedCustomer.mobileNumber
                      )}
                      {mobileError && <span className="text-danger">{mobileError}</span>}
                    </p>
                    <p>
                      <strong>Gender : </strong>{' '}
                      {editMode ? (
                        <CFormSelect
                          name="gender"
                          value={editedCustomer.gender || ''}
                          onChange={(e) => {
                            const selectedGender = e.target.value
                            setEditedCustomer({ ...editedCustomer, gender: selectedGender })
                          }}
                        >
                          <option value="">Select Gender</option> <option value="male">Male</option>
                          <option value="female">Female</option>{' '}
                        </CFormSelect>
                      ) : (
                        customer.gender || 'NA'
                      )}
                    </p>

                    <p>
                      <strong>Status : </strong>{' '}
                      {editMode ? (
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
                      ) : (
                        customer.status || 'NA'
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
                    {/* Button to add a new address */}
                    <CButton color="success" onClick={addNewAddress} style={{ float: 'right' }}>
                      + Add Address
                    </CButton>

                    {/* Show address form when adding new address */}
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

                            {/* Address Fields with Validation Errors */}
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
                    {editedAddress.map((address, index) => (
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
                              }}
                            >
                              {editAddressMode[index] && (
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
                              )}

                              {!editAddressMode[index] && (
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
                            <div>
                              <strong>House No : </strong>
                              {editAddressMode[index] ? (
                                <CFormInput
                                  type="text"
                                  name="houseNo"
                                  value={editedAddress[index]?.houseNo || ''}
                                  onChange={(e) => handleAddressInputChange(e, index)}
                                />
                              ) : (
                                address.houseNo || 'NA'
                              )}
                            </div>

                            <div>
                              <strong>Apartment : </strong>
                              {editAddressMode[index] ? (
                                <CFormInput
                                  type="text"
                                  name="apartment"
                                  value={editedAddress[index]?.apartment || ''}
                                  onChange={(e) => handleAddressInputChange(e, index)}
                                />
                              ) : (
                                address.apartment || 'NA'
                              )}
                            </div>

                            <div>
                              <strong>Street : </strong>
                              {editAddressMode[index] ? (
                                <CFormInput
                                  type="text"
                                  name="street"
                                  value={editedAddress[index]?.street || ''}
                                  onChange={(e) => handleAddressInputChange(e, index)}
                                />
                              ) : (
                                address.street || 'NA'
                              )}
                            </div>

                            <div>
                              <strong>City : </strong>
                              {editAddressMode[index] ? (
                                <CFormInput
                                  type="text"
                                  name="city"
                                  value={editedAddress[index]?.city || ''}
                                  onChange={(e) => handleAddressInputChange(e, index)}
                                />
                              ) : (
                                address.city || 'NA'
                              )}
                            </div>

                            <div>
                              <strong>Latitude : </strong>
                              {editAddressMode[index] ? (
                                <CFormInput
                                  type="text"
                                  name="latitude"
                                  value={editedAddress[index]?.latitude || ''}
                                  onChange={(e) => handleAddressInputChange(e, index)}
                                />
                              ) : (
                                address.latitude || 'NA'
                              )}
                            </div>

                            <div>
                              <strong>Longitude : </strong>
                              {editAddressMode[index] ? (
                                <CFormInput
                                  type="text"
                                  name="longitude"
                                  value={editedAddress[index]?.longitude || ''}
                                  onChange={(e) => handleAddressInputChange(e, index)}
                                />
                              ) : (
                                address.longitude || 'NA'
                              )}
                            </div>

                            <div>
                              <strong>State : </strong>
                              {editAddressMode[index] ? (
                                <CFormInput
                                  type="text"
                                  name="state"
                                  value={editedAddress[index]?.state || ''}
                                  onChange={(e) => handleAddressInputChange(e, index)}
                                />
                              ) : (
                                address.state || 'NA'
                              )}
                            </div>

                            <div>
                              <strong>Postal Code : </strong>
                              {editAddressMode[index] ? (
                                <CFormInput
                                  type="text"
                                  name="postalCode"
                                  value={editedAddress[index]?.postalCode || ''}
                                  onChange={(e) => handleAddressInputChange(e, index)}
                                />
                              ) : (
                                address.postalCode || 'NA'
                              )}
                            </div>

                            <div>
                              <strong>Country : </strong>
                              {editAddressMode[index] ? (
                                <CFormInput
                                  type="text"
                                  name="country"
                                  value={editedAddress[index]?.country || ''}
                                  onChange={(e) => handleAddressInputChange(e, index)}
                                />
                              ) : (
                                address.country || 'NA'
                              )}
                            </div>
                          </div>
                        </CCardBody>
                      </CCard>
                    ))}
                  </div>
                </CAccordionBody>
              </CAccordionItem>
            </CAccordion>
          )}

          {activeTab === 'Appointments' && (
            <CAccordion className="mt-4" activeItemKey={0}>
              <CAccordionItem itemKey={0}>
                <CAccordionHeader>Appointment Details</CAccordionHeader>
                <div>
                  <CButton
                    color="success"
                    style={{
                      float: 'right',
                      marginTop: '1rem',
                      marginBottom: '1rem',
                    }}
                    onClick={addNewAppointment}
                  >
                    Book Appointment
                  </CButton>

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
                            <CCardHeader>Patient Details</CCardHeader>
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
                                  {categoryList &&
                                    categoryList.map((categoryItem, index) => (
                                      <option key={index} value={categoryItem.categoryName}>
                                        {categoryItem.categoryName}
                                      </option>
                                    ))}
                                </CFormSelect>
                                {AppointmentErrors.categoryName && (
                                  <span style={{ color: 'red' }}>
                                    {AppointmentErrors.categoryName}
                                  </span>
                                )}
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
                            <CCardHeader>Patient Appointment</CCardHeader>
                            <div style={{ gridColumn: 'span 3', position: 'relative' }}>
                              <CButton
                                color="secondary"
                                onClick={() =>
                                  setNewAppointment((prev) => ({
                                    ...prev,
                                    servicesAdded: [
                                      ...prev.servicesAdded,
                                      { serviceName: '', pricing: 0 },
                                    ],
                                  }))
                                }
                                style={{
                                  position: 'absolute',
                                  top: '10px',
                                  right: '10px',
                                  zIndex: 10,
                                  marginBottom: '10px',
                                }}
                              >
                                Add Service
                              </CButton>
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
                                    {AppointmentErrors[`serviceName-${index}`] && (
                                      <span style={{ color: 'red' }}>
                                        {AppointmentErrors[`serviceName-${index}`]}
                                      </span>
                                    )}
                                  </div>

                                  {/* Price */}
                                  <div>
                                    <h6>Price</h6>
                                    <CFormInput
                                      type="number"
                                      name={`price-${index}`}
                                      value={service.price || ''}
                                      onChange={(e) => handleServiceChange(e, index)}
                                      readOnly
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

                                  {/* Start Date */}
                                  <div>
                                    <h6>
                                      Start Date <span style={{ color: 'red' }}>*</span>
                                    </h6>
                                    <CFormInput
                                      type="date"
                                      name={`serviceStartDate-${index}`}
                                      value={service.serviceStartDate || ''}
                                      onChange={(e) => handleServiceChange(e, index)}
                                    />
                                  </div>

                                  {/* End Date */}
                                  <div>
                                    <h6>
                                      End Date <span style={{ color: 'red' }}>*</span>
                                    </h6>
                                    <CFormInput
                                      type="date"
                                      name={`serviceEndDate-${index}`}
                                      value={service.serviceEndDate || ''}
                                      onChange={(e) => handleServiceChange(e, index)}
                                    />
                                  </div>

                                  {/* Number of Days */}
                                  <div>
                                    <h6>Number of Days</h6>
                                    <CFormInput
                                      type="number"
                                      name={`numberOfDays-${index}`}
                                      value={service.numberOfDays || ''}
                                      readOnly
                                    />
                                  </div>

                                  {/* Start Time */}
                                  <div>
                                    <h6>
                                      Start Time <span style={{ color: 'red' }}>*</span>
                                    </h6>
                                    <CFormInput
                                      type="time"
                                      name={`startTime-${index}`}
                                      value={service.startTime || ''}
                                      onChange={(e) => handleServiceChange(e, index)}
                                    />
                                  </div>

                                  {/* End Time */}
                                  <div>
                                    <h6>
                                      End Time <span style={{ color: 'red' }}>*</span>
                                    </h6>
                                    <CFormInput
                                      type="time"
                                      name={`endTime-${index}`}
                                      value={service.endTime || ''}
                                      onChange={(e) => handleServiceChange(e, index)}
                                    />
                                  </div>

                                  {/* Number of Hours */}
                                  <div>
                                    <h6>Number of Hours</h6>
                                    <CFormInput
                                      type="number"
                                      name={`numberOfHours-${index}`}
                                      value={service.numberOfHours || ''}
                                      readOnly
                                    />
                                  </div>

                                  {/* Remove Service Button */}
                                  <CButton
                                    color="danger"
                                    onClick={() => handleRemoveService(index)}
                                    style={{ alignSelf: 'center' }}
                                  >
                                    Cancel
                                  </CButton>
                                </div>
                              ))}

                              <div>
                                <strong>Total Cost </strong>
                                <CFormInput
                                  type="text"
                                  name="totalCost"
                                  style={{ width: '100px' }}
                                  value={newAppointment.totalCost || ''}
                                  onChange={handleNewAppointmentInputChanges}
                                />
                                {AppointmentErrors.totalCost && (
                                  <span style={{ color: 'red' }}>
                                    {AppointmentErrors.totalCost}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Address Section */}
                          <div style={{ gridColumn: 'span 3' }}>
                            <CCardHeader>Patient Address</CCardHeader>
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
