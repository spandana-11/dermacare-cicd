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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import { useParams } from 'react-router-dom'
import {
  CustomerData,
  updateBasicData,
  getBasicProfileByID,
  getQualificationID,
  getExperienceID,
  getCourseCertification,
  getBankID,
  postExperienceData,
  updateProviderData,
  updateQualificationData,
  updateExperienceData,
  updateCourseData,
  updateBankData,
  deleteExperienceData,
  deleteCourseData,
  getVerificationID,
  updateVerificationData,
  getProviderAppointment,
  postCourseData,
} from './providerAPIs'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const PersonalViewDetails = () => {
  const { id } = useParams()
  const [error, setError] = useState('')

  const [Basic, setBasic] = useState('')
  const [editBasic, setEditedBasic] = useState({})
  const [editBasicMode, setEditBasicMode] = useState(false)

  const [Personal, setPersonal] = useState('')
  const [editedPersonal, setEditedPersonal] = useState({})
  const [editMode, setEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  const [errors, setErrors] = useState({
    mobileNumber: '',
    aadhaarCardNumber: '',
    emailId: '',
    pinCode: '',
    fatherName: '',
    city: '',
    state: '',
  })

  const [Qualification, setQualification] = useState(null)
  const [editedQualification, setEditedQualification] = useState(null)
  const [loading, setLoading] = useState(false)
  const [QulErrors, setQulErrors] = useState({
    institution: '',
    highestQualification: '',
    yearOfPassing: '',
    specialization: '',
  })

  const [newQualifications, setNewQualifications] = useState([])
  const [editQualificationMode, setEditQualificationMode] = useState(false)

  const [experience, setExperience] = useState([])
  const [editedExperience, setEditedExperience] = useState([])
  const [expUploadedFile, setExpUploadedFile] = useState([])

  const [editExperienceMode, setEditExperienceMode] = useState(
    new Array(experience.length).fill(false),
  )
  const [expError, setExpError] = useState({
    jobTitleRole: '',
    organizationName: '',
    specialization: '',
    yearsOfExperience: '',
  })

  const [isAddingNewExperience, setIsAddingNewExperience] = useState(false)
  const [newExperience, setNewExperience] = useState({
    jobTitleRole: '',
    organizationName: '',
    yearsOfExperience: '',
    startDate: '',
    endDate: '',
    uploadExperienceCertificates: [],
  })

  const [course, setCourse] = useState([])
  const [editedCourse, setEditedCourse] = useState([])
  const [editCourseMode, setEditCourseMode] = useState(new Array(experience.length).fill(false))
  const [courseError, setCourseError] = useState({
    courseCertification: '',
    institution: '',
    duration: '',
    specialization: '',
    yearsOfPassing: '',
  })

  const [CourseFileName, setCourseFileName] = useState('')
  const [isAddingNewCourse, setIsAddingNewCourse] = useState(false)
  const [newCourse, setNewCourse] = useState({
    courseCertification: '',
    institution: '',
    duration: '',
    specialization: '',
    yearOfPassing: '',
    uploadCourseCertificates: [],
  })
  const [NewCourseErrors, setNewCourseErrors] = useState({})

  const [bank, setBank] = useState(null)
  const [editedBank, setEditedBank] = useState({})
  const [editBankMode, setEditBankMode] = useState(false)
  const [uploadedBankFile, setUploadedBankFile] = useState(null)
  const [base64File, setBase64File] = useState(null)

  const [bankError, setBankError] = useState({
    accountHolderName: '',
    bankAccountNumber: '',
    confirmBankAccountNumber: '',
    bankName: '',
    ifscCode: '',
    pancardNumber: '',
    uploadPanCard: '',
  })

  const [Verification, setVerification] = useState(null)
  const [editedVerification, setEditedVerification] = useState({})
  const [editVerificationMode, setEditVerificationMode] = useState(false)

  const [appointments, setAppointments] = useState({
    activeAppointments: [],
    upcomingAppointments: [],
    pastAppointments: [],
  })

  const fetchAllData = async (id) => {
    try {
      setLoading(true)
      setError(null)

      const [
        BasicData,
        personalData,
        qualificationData,
        experienceData,
        courseCertificateData,
        bankData,
        verificationData,
      ] = await Promise.all([
        CustomerData(id),
        getBasicProfileByID(id),
        getQualificationID(id),
        getExperienceID(id),
        getCourseCertification(id),
        getBankID(id),
        getVerificationID(id),
      ])

      if (BasicData) {
        setBasic(BasicData)
      } else {
        console.error('No basic data found in the response:', BasicData)
      }

      if (personalData) {
        setPersonal(personalData)
        setEditedPersonal(personalData)
      } else {
        console.error('No personal data found in the response:', personalData)
      }

      if (qualificationData) {
        setQualification(qualificationData)
      } else {
        console.error('No qualification data found in the response:', qualificationData)
      }

      if (Array.isArray(experienceData)) {
        setExperience(experienceData)
      } else if (experienceData) {
        console.error('Experience data is not an array:', experienceData)
        setExperience([])
      } else {
        console.error('No experience data found in the response:', experienceData)
        setExperience([])
      }

      if (Array.isArray(courseCertificateData)) {
        setCourse(courseCertificateData)
      } else if (courseCertificateData) {
        console.error('Course certificate data is not an array:', courseCertificateData)
        setCourse([])
      } else {
        console.error('No course certificate data found in the response:', courseCertificateData)
        setCourse([])
      }

      if (bankData) {
        setBank(bankData)
      } else {
        console.error('No bank data found in the response:', bankData)
      }

      if (verificationData?.data) {
        setVerification(verificationData.data)
      } else {
        console.error('No verification data found in the response:', verificationData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to fetch data. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const fetchAppointments = async () => {
    try {
      const AppointmentData = await getProviderAppointment(id)
      console.log('Full Appointment Data:', AppointmentData)

      const activeAppointments = Array.isArray(AppointmentData.activeAppointments)
        ? AppointmentData.activeAppointments
        : []
      const upcomingAppointments = Array.isArray(AppointmentData.upcomingAppointments)
        ? AppointmentData.upcomingAppointments
        : []
      const pastAppointments = Array.isArray(AppointmentData.pastAppointments)
        ? AppointmentData.pastAppointments
        : []

      setAppointments({
        activeAppointments,
        upcomingAppointments,
        pastAppointments,
      })
    } catch (error) {
      console.error('Error fetching appointments:', error)

      setAppointments({
        activeAppointments: [],
        upcomingAppointments: [],
        pastAppointments: [],
      })
    }
  }

  useEffect(() => {
    if (id) {
      fetchAllData(id)
      fetchAppointments(id)
    }
  }, [id])

  const handleTabClick = (tab) => {
    setActiveTab(tab)
  }

  //============== Basic Details=============================//

  const handleEditBasic = (e) => {
    const { name, value } = e.target
    setEditedBasic((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleBasicEditClick = () => {
    setEditedBasic({ ...Basic })
    setEditBasicMode(true)
  }

  const handleBasicUpdateClick = async () => {
    setLoading(true)
    try {
      console.log('Updating caregiver with ID:', id)

      const providerData = {
        fullName: editBasic.fullName,
        dob: editBasic.dob,
        gender: editBasic.gender,
      }

      console.log('Provider Data being sent to API:', providerData)

      const result = await updateBasicData(id, providerData)

      if (result) {
        console.log('Updated data received:', result)
        setBasic(result)
        setEditBasicMode(false)
        fetchAllData(id)
      } else {
        console.error('Mobile number (ID) is undefined or invalid')
      }
    } catch (error) {
      toast.error(error.message, { position: 'top-right' })
      setError('Failed to update caregiver details.')
    } finally {
      setLoading(false)
    }
  }

  const handleBasicCancelClick = () => {
    setEditedBasic({})
    setEditBasicMode(false)
  }

  // =================Basic Information===================//

  const handleEditClick = () => {
    setEditMode(!editMode)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditedPersonal((prev) => ({ ...prev, [name]: value }))

    let errorMessage = ''

    if (name === 'mobileNumber') {
      if (!/^\d{10}$/.test(value)) {
        errorMessage = 'Mobile number must be exactly 10 digits.'
      }
    }

    if (name === 'emailId') {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/
      if (!emailRegex.test(value)) {
        errorMessage = 'Please enter a valid Gmail address.'
      }
    }

    if (name === 'aadhaarCardNumber') {
      const aadhaarRegex = /^\d{12}$/
      if (!aadhaarRegex.test(value)) {
        errorMessage = 'Aadhar card number must be in the number format (12 digits).'
      }
    }

    if (name === 'pinCode') {
      if (!/^\d{6}$/.test(value)) {
        errorMessage = 'Pin code must be exactly 6 digits.'
      }
    }

    if (name === 'fatherName' || name === 'city' || name === 'state') {
      if (!/^[A-Za-z\s]+$/.test(value)) {
        errorMessage = 'Input must contain only alphabetic characters and spaces.'
      }
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: errorMessage,
    }))
  }

  const handleUpdateClick = async () => {
    const hasErrors = Object.values(errors).some((error) => error !== '')

    if (hasErrors) {
      toast.error('Please correct validation errors before submitting.', { position: 'top-right' })
      return
    }

    try {
      const sanitizedData = Object.fromEntries(
        Object.entries(editedPersonal).map(([key, value]) => [key, value === '' ? null : value]),
      )

      const providerData = {
        ...sanitizedData,
        uploadAadharCard: uploadedFile?.base64File ? [uploadedFile.base64File] : null,
        uploadAadharCardName: uploadedFile?.name ? [uploadedFile?.name] : null,
        uploadAadharCardType: uploadedFile?.type ? [uploadedFile.type] : null,
      }

      console.log('Provider Data being sent:', providerData)

      const updatedProvider = await updateProviderData(id, providerData)

      setPersonal((prevPersonal) => ({
        ...prevPersonal,
        ...updatedProvider,
      }))

      setEditMode(false)
      fetchAllData(id)
    } catch (error) {
      console.error('Error updating Basic details:', error.response ? error.response.data : error)
      toast.error(error.message, { position: 'top-right' })
    }
  }

  const handleFileChange = (e) => {
    const files = e.target.files

    if (files && files.length > 0) {
      const file = files[0]

      const reader = new FileReader()

      reader.onloadend = () => {
        const base64File = reader.result.split(',')[1]

        setUploadedFile({
          base64File: base64File,
          name: file.name,
          type: file.type,
        })

        console.log('Uploaded file details:', {
          base64File,
          name: file.name,
          type: file.type,
        })
      }

      reader.onerror = (error) => {
        console.error('Error reading file:', error)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCancelClick = () => {
    setEditMode(false)
    setEditedPersonal(Personal)
  }

  //==================== Qualifications Details======================//

  const handleQualificationEditClick = () => {
    setEditQualificationMode(!editQualificationMode)
    if (!editQualificationMode) {
      setEditedQualification(Qualification)
    }
  }

  const handleQualificationInputChange = (index, e) => {
    const { name, value } = e.target

    setEditedQualification((prev) => ({ ...prev, [name]: value }))

    let errorMessage = ''

    if (name === 'institution' || name === 'highestQualification') {
      if (!/^[A-Za-z\s]+$/.test(value)) {
        errorMessage = 'Input must contain only alphabetic characters and spaces.'
      } else {
        errorMessage = ''
      }
    }

    if (name === 'yearOfPassing') {
      if (!/^\d{4}$/.test(value)) {
        errorMessage = 'Year of passing must be a 4-digit number.'
      } else {
        errorMessage = ''
      }
    }

    if (name === 'specialization' && value !== '' && !/^[A-Za-z\s]+$/.test(value)) {
      errorMessage = 'Specialization must contain only alphabetic characters and spaces.'
    }

    setQulErrors((prevErrors) => ({
      ...prevErrors,
      [name]: errorMessage,
    }))

    if (index !== undefined) {
      const updatedQualification = [...newQualifications]
      updatedQualification[index][name] = value
      setNewQualifications(updatedQualification)
    }
  }

  const handleQualificationUpdateClick = async () => {
    const hasErrors = Object.values(QulErrors).some((error) => error !== '')
    if (hasErrors) {
      toast.error('Please correct validation errors before submitting.', { position: 'top-right' })
      return
    }

    try {
      const providerData = {
        ...editedQualification,
        uploadQualificationCertificates: uploadedFile?.base64File
          ? [uploadedFile.base64File]
          : Qualification?.uploadQualificationCertificates || null,

        uploadQualificationCertificateNames: uploadedFile?.name
          ? [uploadedFile.name]
          : Qualification?.uploadQualificationCertificateNames || null,

        uploadQualificationCertificateTypes: uploadedFile?.type
          ? [uploadedFile.type]
          : Qualification?.uploadQualificationCertificateTypes || null,
      }

      console.log('Data being sent to API:', providerData)

      const updatedQualification = await updateQualificationData(id, providerData)

      setQualification((prevQualification) => ({
        ...prevQualification,
        ...updatedQualification,
      }))

      setEditQualificationMode(false)
      fetchAllData(id)

      toast.success('Qualification details updated successfully!', {
        position: 'top-right',
        autoClose: 3000,
      })
    } catch (error) {
      console.error(
        'Error updating Qualifications details:',
        error.response ? error.response.data : error,
      )
      toast.error(error.message, { position: 'top-right' })
    }
  }

  const handleQulFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        setUploadedFile({
          name: file.name,
          type: file.type,
          base64File: reader.result.split(',')[1],
        })
      }
    }
  }

  const handleQualificationCancelClick = () => {
    setEditQualificationMode(false)
  }

  // =====================Experience Details=====================//

  const handleExperienceEditClick = (index) => {
    const newEditExperienceMode = [...editExperienceMode]
    newEditExperienceMode[index] = true
    setEditExperienceMode(newEditExperienceMode)

    const newEditedExperience = [...editedExperience]
    newEditedExperience[index] = experience[index]
    setEditedExperience(newEditedExperience)
  }

  const handleExperienceInputChange = (index, e) => {
    const { name, value } = e.target

    setEditedExperience((prev) => {
      const updatedExperience = [...prev]
      updatedExperience[index][name] = value
      return updatedExperience
    })

    let errorMessage = ''

    if (name === 'jobTitleRole') {
      if (!value) {
        errorMessage = 'Job title is required.'
      } else if (!/^[A-Za-z\s]+$/.test(value)) {
        errorMessage = 'Job title must contain only alphabetic characters and spaces.'
      }
    } else if (name === 'organizationName') {
      if (!value) {
        errorMessage = 'Organization name is required.'
      } else if (!/^[A-Za-z\s]+$/.test(value)) {
        errorMessage = 'Organization name must contain only alphabetic characters and spaces.'
      }
    } else if (name === 'yearsOfExperience') {
      if (!value) {
        errorMessage = 'Years of experience are required.'
      } else if (!/^\d+$/.test(value)) {
        errorMessage = 'Years of experience must be a number.'
      }
    }

    setExpError((prev) => ({
      ...prev,
      [name]: errorMessage,
    }))
  }

  const handleExpFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        setUploadedFile({
          name: file.name,
          type: file.type,
          base64File: reader.result.split(',')[1],
        })
      }
    }
  }

  const handleUpdateExperience = async (index, id) => {
    const hasErrors = Object.values(expError).some((error) => error !== '')
    if (hasErrors) {
      toast.error('Please correct validation errors before submitting.', { position: 'top-right' })
      return
    }

    try {
      const existingExperience = experience[index] || {}
      const updatedExperienceEntry = editedExperience[index] || {}

      const experienceData = {
        experienceList: [
          {
            ...existingExperience,
            ...updatedExperienceEntry,
            uploadExperienceCertificates: uploadedFile?.base64File
              ? [uploadedFile.base64File]
              : existingExperience.uploadExperienceCertificates || null,

            uploadExperienceCertificateNames: uploadedFile?.name
              ? [uploadedFile.name]
              : existingExperience.uploadExperienceCertificateNames || null,

            uploadExperienceCertificateTypes: uploadedFile?.type
              ? [uploadedFile.type]
              : existingExperience.uploadExperienceCertificateTypes || null,
          },
        ],
      }

      console.log('Experience Data being sent:', experienceData)

      if (!experienceData.experienceList || experienceData.experienceList.length === 0) {
        console.error('Error: experienceData is empty or incorrectly structured')
        return
      }

      const updatedExperienceData = await updateExperienceData(id, index, experienceData)

      setExperience((prevExperience) => {
        const updatedList = [...prevExperience]
        updatedList[index] = { ...updatedList[index], ...updatedExperienceData }
        return updatedList
      })

      setEditExperienceMode((prevModes) => {
        const updatedModes = [...prevModes]
        updatedModes[index] = false
        return updatedModes
      })

      fetchAllData(id) // Refresh data

      toast.success('Experience details updated successfully!', {
        position: 'top-right',
        autoClose: 3000,
      })
    } catch (error) {
      console.error('Error updating experience data:', error.response?.data || error.message)
      toast.error(error.message, { position: 'top-right' })
    }
  }

  const handleExperienceCancelClick = (index) => {
    const newEditExperienceMode = [...editExperienceMode]
    newEditExperienceMode[index] = false
    setEditExperienceMode(newEditExperienceMode)

    const newEditedExperience = [...editedExperience]
    newEditedExperience[index] = null
    setEditedExperience(newEditedExperience)
    setExpError((prev) => {
      const updatedErrors = { ...prev }
      delete updatedErrors[`jobTitleRole`]
      delete updatedErrors[`organizationName`]
      delete updatedErrors[`yearsOfExperience`]
      return updatedErrors
    })
    fetchAllData(id)
  }

  const removeExperience = async (index) => {
    if (index === undefined || index < 0) {
      console.error('Invalid index:', index)
      alert('Experience index is missing or invalid!')
      return
    }

    const mobileNumber = id

    try {
      const result = await deleteExperienceData(mobileNumber, index)

      if (result && result.success) {
        console.log('Experience deleted successfully')

        const updatedExperience = experience.filter((_, i) => i !== index)
        setExperience(updatedExperience)

        const updatedEditMode = editExperienceMode.filter((_, i) => i !== index)
        setEditExperienceMode(updatedEditMode)

        toast.success('Experience details deleted successfully!', {
          position: 'top-right',
          autoClose: 3000,
        })
        await fetchAllData(id)
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('Error removing experience:', error)
      toast.error(error.message, { position: 'top-right' })
    }
  }

  // add new experience

  const handleExperienceInputChanges = (e) => {
    const { name, value } = e.target

    setNewExperience((prevExp) => ({
      ...prevExp,
      [name]: value,
    }))

    const validationErrors = validateExperienceFields()
    setErrors(validationErrors)
  }

  const validateExperienceFields = () => {
    const errors = {}

    if (!newExperience.jobTitleRole) {
      errors.jobTitleRole = 'Job title is required.'
    } else if (!/^[A-Za-z\s]+$/.test(newExperience.jobTitleRole)) {
      errors.jobTitleRole = 'Job title must contain only alphabetic characters and spaces.'
    }

    if (!newExperience.organizationName) {
      errors.organizationName = 'Organization name is required.'
    } else if (!/^[A-Za-z\s]+$/.test(newExperience.organizationName)) {
      errors.organizationName =
        'Organization name must contain only alphabetic characters and spaces.'
    }

    if (!newExperience.yearsOfExperience) {
      errors.yearsOfExperience = 'Years of experience are required.'
    } else if (!/^\d+$/.test(newExperience.yearsOfExperience)) {
      errors.yearsOfExperience = 'Years of experience must be a number.'
    }

    if (!newExperience.startDate) {
      errors.startDate = 'Start date is required.'
    }

    if (!newExperience.endDate) {
      errors.endDate = 'End date is required.'
    }
    if (!newExperience.uploadExperienceCertificates) {
      errors.endDate = 'file is required.'
    }

    return errors
  }

  const handleDateChange = (e) => {
    const { name, value } = e.target

    setNewExperience((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNewExpFileChange = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64File = reader.result.split(',')[1]

        setNewExperience((prev) => ({
          ...prev,
          uploadExperienceCertificates: [base64File],
          uploadExperienceCertificateNames: [file.name],
          uploadExperienceCertificateTypes: [file.type],
        }))

        console.log('File uploaded:', {
          base64File,
          name: file.name,
          type: file.type,
        })
      }

      reader.onerror = (error) => {
        console.error('Error reading file:', error)
      }

      reader.readAsDataURL(file)
    }
  }

  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const year = d.getFullYear()
    return `${day}-${month}-${year}`
  }

  const handleSaveNewExperience = async () => {
    const validationErrors = validateExperienceFields()
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      toast.error('Fill all the fields!', { position: 'top-right' })
      return
    }

    try {
      if (isAddingNewExperience) {
        const experienceData = {
          experienceList: [
            {
              jobTitleRole: newExperience.jobTitleRole,
              organizationName: newExperience.organizationName,
              yearsOfExperience: newExperience.yearsOfExperience,
              startDate: formatDate(newExperience.startDate),
              endDate: formatDate(newExperience.endDate),
              uploadExperienceCertificates: newExperience.uploadExperienceCertificates,
              uploadExperienceCertificateNames: newExperience.uploadExperienceCertificateNames,
              uploadExperienceCertificateTypes: newExperience.uploadExperienceCertificateTypes,
            },
          ],
        }

        console.log('Sending data to API:', experienceData)

        const response = await postExperienceData(id, experienceData)

        setNewExperience({
          jobTitleRole: '',
          organizationName: '',
          yearsOfExperience: '',
          startDate: '',
          endDate: '',
          uploadExperienceCertificates: [],
          uploadExperienceCertificateNames: '',
          uploadExperienceCertificateTypes: '',
        })

        setIsAddingNewExperience(false)
        toast.success('Experience Added successfully!', {
          position: 'top-right',
          autoClose: 3000,
        })
        await fetchAllData(id)
      } else {
        const ExperienceData = editedExperience[editAddressMode]
        const response = await updateExperienceData(id, ExperienceData)

        const updatedExperience = [...editedExperience]
        updatedExperience[editAddressMode] = { ...response.data }
        setEditedExperience(updatedExperience)
        setEditExperienceMode(null)

        await fetchAllData(id)
      }
    } catch (error) {
      toast.error(error.message, { position: 'top-right' })

      if (error.response) {
        console.error('API response error:', error.response.data)
      }
    }
  }

  const addNewExperience = () => {
    setIsAddingNewExperience(true)
  }

  const handleCancelAddExperience = () => {
    setIsAddingNewExperience(false)

    setNewExperience({
      jobTitleRole: '',
      organizationName: '',
      yearsOfExperience: '',
      startDate: '',
      endDate: '',
      uploadExperienceCertificates: [],
    })

    setErrors({})
    fetchAllData(id)
  }

  //=========================== course Certification========================//

  const handleCourseEditClick = (index) => {
    const newEditCourseMode = [...editCourseMode]
    newEditCourseMode[index] = true
    setEditCourseMode(newEditCourseMode)

    const newEditedCourse = [...editedCourse]
    newEditedCourse[index] = course[index]
    setEditedCourse(newEditedCourse)
  }

  const handleCourseInputChange = (index, e) => {
    const { name, value } = e.target

    setEditedCourse((prev) => {
      const updatedCourse = [...prev]
      updatedCourse[index][name] = value
      return updatedCourse
    })

    let errorMessage = ''

    if (name === 'courseCertification') {
      if (!value) {
        errorMessage = 'courseCertification is required.'
      } else if (!/^[A-Za-z\s]+$/.test(value)) {
        errorMessage = 'Job title must contain only alphabetic characters and spaces.'
      }
    } else if (name === 'institution') {
      if (!value) {
        errorMessage = 'institution name is required.'
      } else if (!/^[A-Za-z\s]+$/.test(value)) {
        errorMessage = 'institution name must contain only alphabetic characters and spaces.'
      }
    } else if (name === 'yearsOfExperience') {
      if (!value) {
        errorMessage = 'Years of experience are required.'
      } else if (!/^\d+$/.test(value)) {
        errorMessage = 'Years of experience must be a number.'
      }
    }

    setCourseError((prev) => ({
      ...prev,
      [name]: errorMessage,
    }))
  }

  const handleCourseFileChanges = (e, index) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64File = reader.result.split(',')[1]

        setCourseFileName((prev) => {
          const updatedCourses = [...prev]
          updatedCourses[index] = {
            base64File,
            name: file.name,
            type: file.type,
          }
          return updatedCourses
        })

        console.log('File uploaded:', { base64File, name: file.name, type: file.type })
      }

      reader.onerror = (error) => {
        console.error('Error reading file:', error)
      }

      reader.readAsDataURL(file)
    }
  }

  const handleUpdateCourse = async (index) => {
    const errorsExist = Object.values(expError).some((error) => error !== '');
    if (errorsExist) {
      alert('Please fix the errors before submitting.');
      return;
    }

    // Ensure course data exists before updating
    const courseData = editedCourse[index] || course[index];

    if (!courseData) {
      console.error('No course data available for index:', index);
      alert('Course data is not available for update.');
      return;
    }

    const courseFile = CourseFileName?.[index] || null;

    // Validate course details and preserve existing data
    const updatedCourseList = [
      {
        courseCertification: courseData.courseCertification || '',
        institution: courseData.institution || '',
        duration: courseData.duration || '',
        specialization: courseData.specialization || '',
        yearOfPassing: courseData.yearOfPassing || '',

        uploadCourseCertificates: courseFile?.base64File
          ? [courseFile.base64File]
          : courseData.uploadCourseCertificates || null,

        uploadCourseCertificateNames: courseFile?.name
          ? [courseFile.name]
          : courseData.uploadCourseCertificateNames || null,

        uploadCourseCertificateTypes: courseFile?.type
          ? [courseFile.type]
          : courseData.uploadCourseCertificateTypes || null,
      },
    ];

    // Ensure courseList is not empty before API call
    if (!updatedCourseList || updatedCourseList.length === 0) {
      console.error('Error: Course data is empty');
      alert('No course data available to update.');
      return;
    }

    // Structure request data
    const CourseData = { courseList: updatedCourseList };

    console.log('Course Data Before API Call:', JSON.stringify(CourseData, null, 2));
    console.log('Index:', index);
    console.log('Mobile Number:', id);

    try {
      const updatedCourseResponse = await updateCourseData(id, index, CourseData);

      if (updatedCourseResponse.success) {
        setCourse((prevCourses) => {
          const updatedCourses = [...prevCourses];
          updatedCourses[index] = CourseData.courseList[0];
          return updatedCourses;
        });

        setEditCourseMode((prevModes) => {
          const updatedModes = [...prevModes];
          updatedModes[index] = false;
          return updatedModes;
        });

        toast.success('Course updated successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        alert('Failed to update the course.');
      }
    } catch (error) {
      console.error('Error updating course:', error.response?.data || error.message);
      toast.error(error.message, { position: 'top-right' })
    }
  };


  const handleCourseCancelClick = (index) => {
    const newEditCourseMode = [...editCourseMode]
    newEditCourseMode[index] = false
    setEditCourseMode(newEditCourseMode)

    const newEditedCourse = [...editedCourse]
    newEditedCourse[index] = null
    setEditedCourse(newEditedCourse)
    setCourseError((prev) => {
      const updatedErrors = { ...prev }
      delete updatedErrors[`courseCertification`]
      delete updatedErrors[`institution`]
      delete updatedErrors[`duration`]
      delete updatedErrors[`specialization`]
      delete updatedErrors[`yearOfPassing`]
      return updatedErrors
    })
    fetchAllData(id)
  }

  const removeCourse = async (index) => {
    if (index === undefined || index < 0) {
      console.error('Invalid index:', index)
      alert('Course index is missing or invalid!')
      return
    }

    const mobileNumber = id

    try {
      const result = await deleteCourseData(mobileNumber, index)

      if (result && result.success) {
        console.log('Course deleted successfully')

        const updatedCourse = course.filter((_, i) => i !== index)
        setCourse(updatedCourse)

        const updatedEditMode = editCourseMode.filter((_, i) => i !== index)
        setEditCourseMode(updatedEditMode)
        toast.success('Course details deleted successfully!', {
          position: 'top-right',
          autoClose: 3000,
        })

        await fetchAllData(mobileNumber)
      }
    } catch (error) {
      console.error('Error removing course:', error)
      toast.error(error.message, { position: 'top-right' })
    }
  }

  /////////////////// add new Course/////////////////////

  const handleCourseInputChanges = (e) => {
    const { name, value } = e.target

    setNewCourse((prevExp) => ({
      ...prevExp,
      [name]: value,
    }))

    const validationErrors = validateExperienceFields()
    setCourseError(validationErrors)
  }

  const validateNewCourseForm = () => {
    const newErrors = {}

    // Course Certification
    if (!newCourse.courseCertification) {
      newErrors.courseCertification = 'Course Certification is required.'
    }

    // Institution
    if (!newCourse.institution) {
      newErrors.institution = 'Institution is required.'
    }

    // Duration
    if (!newCourse.duration) {
      newErrors.duration = 'Duration is required.'
    } else if (isNaN(newCourse.duration)) {
      newErrors.duration = 'Duration must be a valid number.'
    }

    // Specialization
    if (!newCourse.specialization) {
      newErrors.specialization = 'Specialization is required.'
    }

    // Year of Passing
    if (!newCourse.yearOfPassing) {
      newErrors.yearOfPassing = 'Year of Passing is required.'
    } else if (!/^\d{4}$/.test(newCourse.yearOfPassing)) {
      newErrors.yearOfPassing = 'Year of Passing must be a valid 4-digit year.'
    }

    setNewCourseErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveNewCourse = async () => {
    const validationErrors = validateNewCourseForm()
    setCourseError(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      toast.error('Fill all the fields!', { position: 'top-right' })
      return
    }

    try {
      if (isAddingNewCourse) {
        const courseData = {
          courseList: [
            {
              courseCertification: newCourse.courseCertification,
              institution: newCourse.institution,
              duration: newCourse.duration,
              specialization: newCourse.specialization,
              yearOfPassing: newCourse.yearOfPassing,
              uploadCourseCertificates: newCourse.uploadCourseCertificates,
              uploadCourseCertificateNames: newCourse.uploadCourseCertificateNames,
              uploadCourseCertificateTypes: newCourse.uploadCourseCertificateTypes,
            },
          ],
        }

        console.log('Sending data to API:', courseData)

        const response = await postCourseData(id, courseData)

        setNewCourse({
          courseCertification: '',
          institution: '',
          duration: '',
          specialization: '',
          yearOfPassing: '',
          uploadCourseCertificates: [],
          uploadCourseCertificateNames: '',
          uploadCourseCertificateTypes: '',
        })

        setIsAddingNewCourse(false)
        toast.success('Course details added successfully!', {
          position: 'top-right',
          autoClose: 3000,
        })
        await fetchAllData(id)
      }
    } catch (error) {
      toast.error(error.message, { position: 'top-right' })

      if (error.response) {
        console.error('API response error:', error.response.data)
      }
    }
  }

  const addNewCourse = () => {
    setIsAddingNewCourse(true)
  }

  const handleCourseFileChange = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64File = reader.result.split(',')[1]

        setNewCourse((prev) => ({
          ...prev,
          uploadCourseCertificates: [base64File],
          uploadCourseCertificateNames: [file.name],
          uploadCourseCertificateTypes: [file.type],
        }))

        console.log('File uploaded:', {
          base64File,
          name: file.name,
          type: file.type,
        })
      }

      reader.onerror = (error) => {
        console.error('Error reading file:', error)
      }

      reader.readAsDataURL(file)
    }
  }

  const handleCancelAddCourse = () => {
    setIsAddingNewCourse(false)

    setNewCourse({
      courseCertification: '',
      institution: '',
      duration: '',
      specialization: '',
      yearOfPassing: '',
      upload_Course_Certificate: [],
    })

    setErrors({})
    fetchAllData(id)
  }

  // Bank Details

  const handleBankEditClick = () => {
    setEditBankMode(!editBankMode)
    if (!editBankMode) {
      setEditedBank(bank)
    }
  }

  const handleBankInputChange = (e) => {
    const { name, value } = e.target
    let errorMessage = ''

    if (name === 'accountHolderName') {
      if (!value) {
        errorMessage = 'Account holder name is required.'
      } else if (!/^[A-Za-z\s]+$/.test(value)) {
        errorMessage = 'Account holder name must contain only alphabetic characters and spaces.'
      }
    }

    if (name === 'bankAccountNumber') {
      if (!value) {
        errorMessage = 'Bank account number is required.'
      } else if (!/^\d+$/.test(value)) {
        errorMessage = 'Bank account number must be numeric.'
      } else if (value.length < 8 || value.length > 16) {
        errorMessage = 'Bank account number must be between 8 and 16 digits.'
      }
    }

    if (name === 'confirmBankAccountNumber') {
      if (!value) {
        errorMessage = 'Confirm bank account number is required.'
      } else if (value !== editedBank?.bankAccountNumber) {
        errorMessage = 'Confirm bank account number must match the bank account number.'
      }
    }

    if (name === 'bankName') {
      if (!value) {
        errorMessage = 'Bank name is required.'
      }
    }

    if (name === 'ifscCode') {
      if (!value) {
        errorMessage = 'IFSC code is required.'
      } else if (!/^[A-Za-z]{4}\d{7}$/.test(value)) {
        errorMessage = 'Invalid IFSC code format.'
      }
    }

    if (name === 'pancardNumber') {
      if (!value) {
        errorMessage = 'PAN card number is required.'
      } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
        errorMessage = 'Invalid PAN card number format.'
      }
    }

    if (name === 'certificationFile') {
      if (!e.target.files.length) {
        errorMessage = 'Please upload a PAN card.'
      } else {
        const file = e.target.files[0]
        const fileExtension = file.name.split('.').pop().toLowerCase()
        if (!['pdf', 'doc', 'docx'].includes(fileExtension)) {
          errorMessage = 'Only PDF, DOC, or DOCX files are allowed.'
        }
      }
    }

    setBankError((prevState) => ({
      ...prevState,
      [name]: errorMessage,
    }))

    setEditedBank((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleBankUpdateClick = async () => {
    const hasErrors = Object.values(bankError).some((error) => error !== '')
    if (hasErrors) {
      toast.error('Please correct validation errors before submitting.', { position: 'top-right' })
      return
    }

    try {
      const providerData = {
        ...editedBank,
        uploadPanCard: base64File,
        uploadPanCardName: editedBank.uploadPanCardName,
        uploadPanCardType: editedBank.uploadPanCardType,
      }
      console.log(providerData)
      const updatedBank = await updateBankData(id, providerData)

      setBank((prevBank) => ({
        ...prevBank,
        ...updatedBank,
      }))

      setEditBankMode(false)
      fetchAllData(id)
      toast.success('Bank details updated successfully!', {
        position: 'top-right',
        autoClose: 3000,
      })
    } catch (error) {
      console.error('Error updating bank details:', error.response ? error.response.data : error)
      toast.error(error.message, { position: 'top-right' })
    }
  }

  const handleBankFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setUploadedBankFile(file)
      console.log(`File selected: ${file.name}`)

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64File = reader.result.split(',')[1]
        setBase64File(base64File)

        setEditedBank((prev) => ({
          ...prev,
          uploadPanCardName: file.name,
          uploadPanCardType: file.type,
        }))

        console.log('Base64 file:', base64File)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBankCancelClick = () => {
    setEditBankMode(false)
    setEditedBank(bank)
  }

  // verification status

  const handleVerificationEditClick = () => {
    setEditVerificationMode(!editVerificationMode)
    if (!editBankMode) {
      setEditedVerification(Verification)
    }
  }

  const handleVerificationInputChange = (e) => {
    const { name, value } = e.target
    setEditedVerification((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleVerificationUpdateClick = async () => {
    try {
      const VerificationData = {
        ...editedVerification,
      }

      console.log('Verification Data to be sent:', VerificationData)

      const updatedVerification = await updateVerificationData(id, VerificationData)

      setBank((prevVerification) => ({
        ...prevVerification,
        ...updatedVerification,
      }))

      await fetchAllData(id)
      toast.success('Verification details updated successfully!', {
        position: 'top-right',
        autoClose: 3000,
      })
      setEditVerificationMode(false)
    } catch (error) {
      console.error(
        'Error updating Verification details:',
        error.response ? error.response.data : error,
      )
      toast.error(error.message, { position: 'top-right' })
    }
  }

  const handleVerificationCancelClick = () => {
    setEditVerificationMode(false)
    setEditedVerification(Verification)
  }

  const renderAppointments = (appointmentList) => {
    if (!Array.isArray(appointmentList)) {
      return (
        <div
          style={{
            textAlign: 'center',
            padding: '2rem',
            fontSize: '1.2rem',
            color: 'gray',
            fontStyle: 'italic',
          }}
        >
          Error: Invalid appointment data.
        </div>
      )
    }

    if (appointmentList.length === 0) {
      return (
        <div
          style={{
            textAlign: 'center',
            padding: '2rem',
            fontSize: '1.2rem',
            color: 'gray',
            fontStyle: 'italic',
          }}
        >
          No appointments available.
        </div>
      )
    }

    return appointmentList.map((appointment, index) => (
      <CCard key={`appointment-${index}`} style={{ marginBottom: '1rem' }}>
        <CCardBody>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              marginTop: '1rem',
            }}
          >
            <div>
              <strong>Category Name : </strong> {appointment.categoryName || 'NA'}
            </div>
            <div>
              <strong>Patient Name : </strong> {appointment.patientName || 'NA'}
            </div>
            <div>
              <strong>Relationship : </strong> {appointment.relationShip || 'NA'}
            </div>
            <div>
              <strong>Gender : </strong> {appointment.gender || 'NA'}
            </div>
            <div>
              <strong>Email : </strong> {appointment.emailId || 'NA'}
            </div>
            <div>
              <strong>Age : </strong> {appointment.age || 'NA'}
            </div>
            <div>
              <strong>Patient Number : </strong> {appointment.patientNumber || 'NA'}
            </div>
            <div>
              <strong>Address : </strong>{' '}
              {appointment.addressDto
                ? `${appointment.addressDto.houseNo},
                     ${appointment.addressDto.street},
                     ${appointment.addressDto.city},
                     ${appointment.addressDto.state},
                     ${appointment.addressDto.postalCode},
                     ${appointment.addressDto.country}`
                : 'NA'}
            </div>
            <div>
              <strong>Status : </strong> {appointment.status || 'NA'}
            </div>
            <div>
              <strong>Services Added : </strong>{' '}
              {appointment.servicesAdded && appointment.servicesAdded.length > 0
                ? appointment.servicesAdded.map((service, serviceIndex) => (
                  <div key={`service-${serviceIndex}`}>
                    <span>
                      {service.serviceName} - ${service.price}
                    </span>
                  </div>
                ))
                : 'NA'}
            </div>
            <div>
              <strong>Total Cost : </strong> {appointment.totalCost || 'NA'}
            </div>
            <div>
              <strong>Service Start Date : </strong> {appointment.serviceStartDate || 'NA'}
            </div>
            <div>
              <strong>Service End Date : </strong> {appointment.serviceEndDate || 'NA'}
            </div>
            <div>
              <strong>Number of Hours : </strong> {appointment.numberOfHours || 'NA'}
            </div>
            <div>
              <strong>Number of Days : </strong> {appointment.numberOfDays || 'NA'}
            </div>
            <div>
              <strong>Start Time : </strong> {appointment.startTime || 'NA'}
            </div>
            <div>
              <strong>End Time : </strong> {appointment.endTime || 'NA'}
            </div>
          </div>
        </CCardBody>
      </CCard>
    ))
  }

  // girds

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
  //////////////Basic///////////////////////
  const download = () => {
    const base64Data = Personal?.uploadAadharCard[0]
    const fileName = Personal?.uploadAadharCardName[0] || 'AadhaarCard.jpg'

    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)
      .fill(0)
      .map((_, i) => byteCharacters.charCodeAt(i))
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'image/jpeg' })

    const blobUrl = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = blobUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(blobUrl)
  }

  const preview = () => {
    const base64Data = Personal?.uploadAadharCard[0]
    if (!base64Data) {
      alert('No Certificate available for preview.')
      return
    }

    const mimeType = 'image/jpeg'
    const previewBlobUrl = `data:${mimeType};base64,${base64Data}`
    setPreviewUrl(previewBlobUrl)
  }

  ////////////Qul //////////////////
  const handleDownload = (base64Data, fileName) => {
    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)
      .fill(0)
      .map((_, i) => byteCharacters.charCodeAt(i))
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'application/octet-stream' })
    const blobUrl = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = blobUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(blobUrl)
  }

  const handlePreview = (base64Data, fileType) => {
    if (!base64Data) {
      alert('No data available for preview.')
      return
    }

    const mimeType =
      fileType?.toLowerCase() === 'jpg' || fileType?.toLowerCase() === 'jpeg'
        ? 'image/jpeg'
        : fileType?.toLowerCase() === 'png'
          ? 'image/png'
          : fileType?.toLowerCase() === 'pdf'
            ? 'application/pdf'
            : fileType

    const previewUrl = `data:${mimeType};base64,${base64Data}`
    setPreviewUrl(previewUrl)
  }

  const isImageOrPdf = (fileType) => {
    return (
      fileType?.toLowerCase() === 'image/jpeg' ||
      fileType?.toLowerCase() === 'image/png' ||
      fileType?.toLowerCase() === 'application/pdf'
    )
  }

  const handleAllPreview = (base64Data, fileType) => {
    if (!base64Data) {
      alert('No data available for preview.')
      return
    }

    const mimeType = fileType || 'application/octet-stream'
    const previewUrl = `data:${mimeType};base64,${base64Data}`
    setPreviewUrl(previewUrl)
  }

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return ''
    const [year, month, day] = dateString.split('-')
    return `${day}-${month}-${year}`
  }
  const formatDateForStorage = (dateString) => {
    if (!dateString) return ''
    const [day, month, year] = dateString.split('-')
    return `${year}-${month}-${day}`
  }

  return (
    <div>
      <CModal visible={!!previewUrl} onClose={() => setPreviewUrl(null)}>
        <CModalHeader>
          <CModalTitle>Preview Certificate </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <img src={previewUrl} alt="Preview Certificate" style={{ width: '100%' }} />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setPreviewUrl(null)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      <ToastContainer />
      {Personal ? (
        <>
          <CCard>
            <CCardHeader>Personal Details</CCardHeader>
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
                  <CNavLink
                    href="#"
                    active={activeTab === 'basic'}
                    onClick={() => handleTabClick('basic')}
                  >
                    Additional Details
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    href="#"
                    active={activeTab === 'doctorsDetails'}
                    onClick={() => handleTabClick('doctorsDetails')}
                  >
                    Doctor's Details
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
              <CAccordionItem itemKey={0}>
                <CAccordionHeader>
                  <span>Basic Details</span>
                </CAccordionHeader>
                <CAccordionBody>
                  {Basic && Object.keys(Basic).length > 0 ? (
                    <>
                      <div className="mt-3">
                        {editBasicMode ? (
                          <>
                            <CButton color="primary" onClick={handleBasicUpdateClick}>
                              Update
                            </CButton>
                            <CButton
                              color="warning"
                              style={{ marginLeft: '10px', color: 'white' }}
                              onClick={handleBasicCancelClick}
                            >
                              Cancel
                            </CButton>
                          </>
                        ) : (
                          <CButton color="secondary" onClick={handleBasicEditClick}>
                            Edit
                          </CButton>
                        )}
                      </div>
                      <div
                        className="personal-details-grid mt-3"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '20px',
                        }}
                      >
                        {/* Clinic ID (Read-only) */}
                        <div>
                          <strong>Clinic ID : </strong>
                          {Basic.clinicId || 'NA'}
                        </div>

                        {/* Clinic Name */}
                        <div>
                          <strong>Clinic Name {editBasicMode && <span style={{ color: 'red' }}>*</span>} : </strong>
                          {editBasicMode ? (
                            <CFormInput
                              name="clinicName"
                              value={editBasic.clinicName || ''}
                              onChange={handleEditBasic}
                            />
                          ) : (
                            Basic.clinicName || 'NA'
                          )}
                        </div>

                        {/* Email */}
                        <div>
                          <strong>Email {editBasicMode && <span style={{ color: 'red' }}>*</span>} : </strong>
                          {editBasicMode ? (
                            <CFormInput
                              type="email"
                              name="email"
                              value={editBasic.email || ''}
                              onChange={handleEditBasic}
                            />
                          ) : (
                            Basic.email || 'NA'
                          )}
                        </div>

                        {/* Contact Number */}
                        <div>
                          <strong>Contact Number {editBasicMode && <span style={{ color: 'red' }}>*</span>} : </strong>
                          {editBasicMode ? (
                            <CFormInput
                              type="tel"
                              name="contactNumber"
                              value={editBasic.contactNumber || ''}
                              onChange={handleEditBasic}
                            />
                          ) : (
                            Basic.contactNumber || 'NA'
                          )}
                        </div>

                        {/* Location */}
                        <div>
                          <strong>Location {editBasicMode && <span style={{ color: 'red' }}>*</span>} : </strong>
                          {editBasicMode ? (
                            <CFormInput
                              name="location"
                              value={editBasic.location || ''}
                              onChange={handleEditBasic}
                            />
                          ) : (
                            Basic.location || 'NA'
                          )}
                        </div>
                      </div>

                    </>
                  ) : (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '1rem',
                        fontSize: '1.2rem',
                        color: 'gray',
                        fontStyle: 'italic',
                      }}
                    >
                      No basic details available.
                    </div>
                  )}
                </CAccordionBody>
              </CAccordionItem>

              
            </CAccordion>
          )}



{activeTab === 'doctorsDetails' && (
  <CAccordion className="mt-4" activeItemKey={1}>
    <CAccordionItem itemKey={0}>
      <CAccordionHeader>
        <span>Clinic Details</span>
      </CAccordionHeader>
      <CAccordionBody>
        {Basic && Object.keys(Basic).length > 0 ? (
          <div
            className="clinic-details-grid mt-3"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '20px',
            }}
          >
            {/* Administrator Name */}
            <div>
              <strong>Administrator Name:</strong><br />
              {Basic.adminName || 'NA'}
            </div>

            {/* Clinic Registration No */}
            <div>
              <strong>Clinic Registration No:</strong><br />
              {Basic.registrationNo || 'NA'}
            </div>

            {/* GST No */}
            <div>
              <strong>GST No:</strong><br />
              {Basic.gstNumber || 'NA'}
            </div>

            {/* Clinic Logo */}
            <div>
              <strong>Clinic Logo:</strong><br />
              {Basic.logoUrl ? (
                <img src={Basic.logoUrl} alt="Clinic Logo" style={{ width: '100px', height: '100px' }} />
              ) : (
                'No Logo Available'
              )}
            </div>

            {/* Clinic Description */}
            <div>
              <strong>Clinic Description:</strong><br />
              {Basic.description || 'NA'}
            </div>

            {/* Working Days & Timings */}
            <div>
              <strong>Working Days & Timings:</strong><br />
              {Basic.workingHours || 'NA'}
            </div>

            {/* Status */}
            <div>
              <strong>Status:</strong><br />
              {Basic.status || 'NA'}
            </div>
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '1rem',
              fontSize: '1.2rem',
              color: 'gray',
              fontStyle: 'italic',
            }}
          >
            No clinic details available.
          </div>
        )}
      </CAccordionBody>
    </CAccordionItem>
  </CAccordion>
)}

          

          {activeTab === 'Appointments' && (
            <CAccordion className="mt-4" activeItemKey={0}>
              <CAccordion>
                <CAccordionItem itemKey={1}>
                  <CAccordionHeader>Past Appointments</CAccordionHeader>
                  <CAccordionBody>
                    {renderAppointments(appointments.pastAppointments)}
                  </CAccordionBody>
                </CAccordionItem>
                <CAccordionItem itemKey={2}>
                  <CAccordionHeader>Active Appointments</CAccordionHeader>
                  <CAccordionBody>
                    {renderAppointments(appointments.activeAppointments)}
                  </CAccordionBody>
                </CAccordionItem>
                <CAccordionItem itemKey={3}>
                  <CAccordionHeader>Upcoming Appointments</CAccordionHeader>
                  <CAccordionBody>
                    {renderAppointments(appointments.upcomingAppointments)}
                  </CAccordionBody>
                </CAccordionItem>
              </CAccordion>
            </CAccordion>
          )}
        </>
      ) : (
        <div style={centeredMessageStyle}>No personal details available.</div>
      )}
    </div>
  )
}

export default PersonalViewDetails
