import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CFormLabel,
  CFormInput,
  CFormFeedback,
  CFormSelect,
  CButton,
  CRow,
  CCol,
  CTooltip,
  CFormCheck,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import { BASE_URL, subService_URL, getService, ClinicAllData, getAllQuestions, postAllQuestionsAndAnswers } from '../../baseUrl'
import { CategoryData } from '../categoryManagement/CategoryAPI'
import Select from 'react-select'
import sendDermaCareOnboardingEmail from '../../Utils/Emailjs'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import FileInputWithRemove from './FileInputWithRemove'
import { getClinicTimings } from './AddClinicAPI'
// 🛠️ Add this array at the top of your component
// const nabhQuestions = [
//   "Are patient rights displayed prominently in the clinic?",
//   "Is informed consent taken for all procedures?",
//   "Is there a documented infection control policy?",
//   "Are hand hygiene practices followed by staff?",
//   "Is biomedical waste segregated and disposed of properly?",
//   "Are emergency exits clearly marked and accessible?",
//   "Is fire safety training conducted for staff?",
//   "Are patient records maintained and kept confidential?",
//   "Is staff trained in CPR and Basic Life Support?",
//   "Is there a system for handling patient complaints?",
//   "Are medicines stored as per guidelines with temperature monitoring?",
//   "Is there a valid pharmacist present in the clinic?",
//   "Are all medical equipment calibrated and maintained?",
//   "Are staff health checks done periodically?",
//   "Is there a documented disaster management plan?",
//   "Are safety drills conducted regularly?",
//   "Is there a system for continuous quality improvement (CQI)?",
//   "Are internal audits carried out and documented?",
//   "Are patients informed about estimated treatment costs?",
//   "Is data backup done regularly for patient records?",
// ];

const AddClinic = ({ mode = 'add', initialData = {}, onSubmit }) => {
  const navigate = useNavigate()
  const savedQuestionId = localStorage.getItem("savedQuestionId");

  const [errors, setErrors] = useState({})
  const [backendErrors, setBackendErrors] = ''
  const [categories, setCategories] = useState([])
  const [serviceOptions, setServiceOptions] = useState([])
  const [selectedOption, setSelectedOption] = useState('')
  const [selectedPharmacistOption, setSelectedPharmacistOption] = useState('')
  const [clinicTypeOption, setClinicTypeOption] = useState('')
  const [subscription, setSubscription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timings, setTimings] = useState([])
  const [loadingTimings, setLoadingTimings] = useState(false)
  const [nabhQuestions, setNabhQuestions] = useState([]);
  const [nabhAnswers, setNabhAnswers] = useState([]);
  const [showNabhModal, setShowNabhModal] = useState(false);
  const [nabhScore, setNabhScore] = useState(null);
  const [nabhSubmitted, setNabhSubmitted] = useState(false);
  // const [initialData,setInitialData ]=useState()
  const fileInputRefs = {
    others: useRef(null),
    hospitalDocuments: useRef(null),
    hospitalContract: useRef(null),
    clinicalEstablishmentCertificate: useRef(null),
    businessRegistrationCertificate: useRef(null),
    tradeLicense: useRef(null),
    fireSafetyCertificate: useRef(null),
    gstRegistrationCertificate: useRef(null),
    // ...add others if needed
  }

  // setSelectedPharmacistOption
  const fileInputRef = useRef(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    contactNumber: '',
    // hospitalRegistrations: '',
    openingTime: '',
    closingTime: '',
    hospitalLogo: null,
    emailAddress: '',
    website: '',
    licenseNumber: '',
    issuingAuthority: '',
    recommended: false,
    hospitalDocuments: null,
    // hospitalcategory: [],
    hospitalContract: null,
    freeFollowUps: '',
    clinicalEstablishmentCertificate: null,
    businessRegistrationCertificate: null,
    clinicType: '',
    medicinesSoldOnSite: '',
    drugLicenseCertificate: null,
    drugLicenseFormType: null,
    hasPharmacist: '',
    pharmacistCertificate: null,
    biomedicalWasteManagementAuth: null,
    tradeLicense: null,
    fireSafetyCertificate: null,
    professionalIndemnityInsurance: null,
    gstRegistrationCertificate: null,
    others: [],
    consultationExpiration: '',
    subscription: '',
    instagramHandle: '',
    twitterHandle: '',
    facebookHandle: '',
    latitude: "",
    longitude: "",
    walkthrough: "",
    branch: "",
    nabhScore: nabhScore,

  })
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData(initialData)
      setClinicTypeOption(initialData.clinicType)
      setSelectedOption(initialData.medicinesSoldOnSite)
      setSelectedPharmacistOption(initialData.hasPharmacist)
    }
  }, [initialData, mode])
  //get timings
  useEffect(() => {
    const fetchTimings = async () => {
      setLoadingTimings(true)
      const result = await getClinicTimings()
      if (result.success) {
        setTimings(result.data)
      } else {
        toast.error(result.message || 'Failed to fetch clinic timings')
      }
      setLoadingTimings(false)
    }

    fetchTimings()
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await CategoryData()

        if (response?.data) {
          setCategories(response.data)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

  const preventNumberInput = (e) => {
    const isNumber = /[0-9]/.test(e.key)
    if (isNumber) {
      e.preventDefault()
    }

  }
const handleWebsiteBlur = () => {
  const website = formData.website.trim()

  if (!website) {
    setErrors((prev) => ({ ...prev, website: 'Website is required' }))
  } else if (!/^https?:\/\//i.test(website)) {
    setErrors((prev) => ({
      ...prev,
      website: 'Website must start with http:// or https://',
    }))
  } else if (!/^https?:\/\/\S+$/i.test(website)) {  // 👈 updated regex
    setErrors((prev) => ({
      ...prev,
      website: 'Enter a valid website URL (no spaces allowed)',
    }))
  } else {
    setErrors((prev) => ({ ...prev, website: '' }))
  }
}




  const websiteRegex = /^(https?:\/\/)[\w\-]+(\.[\w\-]+)+[/#?]?.*$/
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/



  
  const validateForm = () => {
    const newErrors = {}

    // Hospital Name
    if (!formData.name?.trim()) {
      newErrors.name = 'Clinic name is required'
    } else if (!/^[a-zA-Z\s]{2,50}$/.test(formData.name)) {
      newErrors.name = 'Clinic name must contain only letters'
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }

    // City validation
    if (!formData.city?.trim()) {
      newErrors.city = 'City is required'
    } else if (!/^[a-zA-Z\s]{2,30}$/.test(formData.city)) {
      newErrors.city = 'City name must contain only letters'
    }
    // Email validation-
 if (!formData.emailAddress?.trim()) {
  newErrors.emailAddress = 'Email is required';
} else if (formData.emailAddress.includes(' ')) {
  newErrors.emailAddress = 'Email cannot contain spaces';
} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)) {
  newErrors.emailAddress = 'Email must contain "@" and "." in a valid format';
}

    // Contact Number
    const phoneRegex = /^[5-9][0-9]{9}$/ // This regex checks if the number starts with 5-9 and is followed by 9 digits

    if (!formData.contactNumber?.trim()) {
      newErrors.contactNumber = 'Contact number is required'
    } else {
      const contactNumber = formData.contactNumber.trim()
      if (contactNumber.length !== 10) {
        newErrors.contactNumber = 'Contact number must be exactly 10 digits long'
      } else if (!phoneRegex.test(contactNumber)) {
        newErrors.contactNumber = 'Contact number must start with a digit between 5 and 9'
      }
    }

    // Time validation
    // Time validation
    if (!formData.openingTime) {
      newErrors.openingTime = 'Opening time is required'
    }

    if (!formData.closingTime) {
      newErrors.closingTime = 'Closing time is required'
    } else if (formData.openingTime && formData.closingTime) {
      const parseTime = (timeStr) => {
        const [time, modifier] = timeStr.split(' ')
        let [hours, minutes] = time.split(':').map(Number)

        if (modifier === 'PM' && hours !== 12) {
          hours += 12
        } else if (modifier === 'AM' && hours === 12) {
          hours = 0
        }

        return new Date(0, 0, 0, hours, minutes)
      }

      const openingDate = parseTime(formData.openingTime)
      const closingDate = parseTime(formData.closingTime)

      if (closingDate <= openingDate) {
        newErrors.closingTime = 'Closing time must be after opening time'
      }
    }

    //consultation Expiration
    if (!formData.consultationExpiration) {
      newErrors.consultationExpiration = 'Consultation days are required'
    } else if (isNaN(formData.consultationExpiration) || formData.consultationExpiration <= 0) {
      newErrors.consultationExpiration = 'Enter a valid number greater than 0'
    }

    // License Number
    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required'
    }

    // Issuing Authority
    if (!formData.issuingAuthority.trim()) {
      newErrors.issuingAuthority = 'Issuing Authority is required'
    }

    // Hospital Logo
    if (!formData.hospitalLogo) {
      newErrors.hospitalLogo = 'Hospital logo is required'
    }

    // Hospital Documents
    if (!formData.hospitalDocuments) {
      newErrors.hospitalDocuments = 'Please upload the document'
    }
    if (!formData.hospitalContract) {
      newErrors.hospitalContract = 'Please upload the document'
    }
    if (!formData.clinicalEstablishmentCertificate) {
      newErrors.clinicalEstablishmentCertificate = 'Please upload at least one document'
    }
    if (!formData.businessRegistrationCertificate) {
      newErrors.businessRegistrationCertificate = 'Please upload at least one document'
    }
    if (!formData.drugLicenseCertificate && selectedOption === 'Yes') {
      newErrors.drugLicenseCertificate = 'Please upload at least one document'
    }
    if (!formData.drugLicenseFormType && selectedOption === 'Yes') {
      newErrors.drugLicenseFormType = 'Please upload at least one document'
    }
    if (
      selectedOption === 'Yes' &&
      selectedPharmacistOption === 'Yes' &&
      !formData.pharmacistCertificate
    ) {
      newErrors.pharmacistCertificate = 'Please upload at least one document'
    }

    if (!formData.biomedicalWasteManagementAuth) {
      newErrors.biomedicalWasteManagementAuth = 'Please upload at least one document'
    }
    if (!formData.tradeLicense) {
      newErrors.tradeLicense = 'Please upload at least one document'
    }
    if (!formData.fireSafetyCertificate) {
      newErrors.fireSafetyCertificate = 'Please upload at least one document'
    }
    // if (!formData.professionalIndemnityInsurance) {
    //   newErrors.professionalIndemnityInsurance = 'Please upload at least one document'
    // }
    if (!formData.gstRegistrationCertificate) {
      newErrors.gstRegistrationCertificate = 'Please upload at least one document'
    }

    if (!clinicTypeOption || clinicTypeOption.trim() === '') {
      newErrors.clinicType = 'Please select a clinic Type.'
    }
    if (!selectedOption || selectedOption.trim() === '') {
      newErrors.medicinesSoldOnSite = 'Please select  atleast one option'
    }
    if (!selectedPharmacistOption || selectedPharmacistOption.trim() === '') {
      newErrors.hasPharmacist = 'Please select whether clinic has a valid pharmacist.'
    }

    if (!formData.website.trim()) {
  newErrors.website = 'Website is required.'
} else {
  const cleanedWebsite = formData.website.replace(/\s+/g, '') // remove all spaces
  if (!websiteRegex.test(normalizeWebsite(cleanedWebsite))) {
    newErrors.website = 'Website must start with http:// or https:// and be a valid URL'
  }
}

    if (!formData.subscription || formData.subscription.trim() === '') {
      newErrors.subscription = 'Please select a subscription type'
    }
    // Latitude validation
    // Latitude
    if (!formData.latitude) {
      newErrors.latitude = "Latitude is required";
    } else {
      const lat = parseFloat(formData.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        newErrors.latitude = "Latitude must be between -90 and 90";
      } else {
        delete newErrors.latitude; // ✅ clear error if valid
      }
    }

    // Longitude
    if (!formData.longitude) {
      newErrors.longitude = "Longitude is required";
    } else {
      const lng = parseFloat(formData.longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        newErrors.longitude = "Longitude must be between -180 and 180";
      } else {
        delete newErrors.longitude; // ✅ clear error if valid
      }
    }



    // if (!formData.walkthrough?.trim()) {
    //   newErrors.walkthrough = "Walkthrough URL is required"
    // }

    if (!formData.branch?.trim()) {
      newErrors.branch = "Branch name is required"
    }
    if (!formData.nabhScore || !String(formData.nabhScore).trim()) {
      newErrors.nabhScore = "NABH Score is required";
    }
    if (!formData.freeFollowUps) {
      newErrors.freeFollowUps = "Free Follow Ups is required"
    } else if (isNaN(formData.freeFollowUps) || formData.freeFollowUps < 0) {
      newErrors.freeFollowUps = "Free Follow Ups must be a positive number"
    }
    // No `else { newErrors.website = '' }`

    console.log('Validation errors:', newErrors)

    // validate fields and set errors
    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fill all required fields', { position: 'top-right' })
      return false // stop form submit
    }

    return true // all good
  }

  // const downloadFile = (base64, filename, mime = 'application/pdf') => {
  //   const link = document.createElement('a')
  //   link.href = `data:${mime};base64,${base64}`
  //   link.download = filename
  //   link.click()
  // }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear the error once the field is updated
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }))
  }
 // ✅ File change handler
const handleHospitalLogoChange = async (e) => {
  const file = e.target.files?.[0];

  if (!file) {
    setErrors((prev) => ({ ...prev, hospitalLogo: "" }));
    setFormData((prev) => ({ ...prev, hospitalLogo: null }));
    return;
  }

  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  const allowedExtensions = ["jpeg", "jpg", "png"];
  const fileExtension = file.name.split(".").pop().toLowerCase();

  if (!allowedTypes.includes(file.type) || !allowedExtensions.includes(fileExtension)) {
    setErrors((prev) => ({
      ...prev,
      hospitalLogo: "Invalid file type (only JPEG, JPG, PNG allowed)",
    }));
    setFormData((prev) => ({ ...prev, hospitalLogo: null }));
    return;
  }

  const MAX_SIZE = 100 * 1024; // 100 KB
  if (file.size >= MAX_SIZE) {
    setErrors((prev) => ({
      ...prev,
      hospitalLogo: `File must be < 100 KB`,
    }));
    setFormData((prev) => ({ ...prev, hospitalLogo: null }));
    return;
  }

  try {
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file); // gives "data:image/png;base64,..."
      reader.onload = () => {
        const result = reader.result;
        const pureBase64 = result.split(",")[1]; // ✅ remove "data:image/...;base64,"
        resolve(pureBase64);
      };
      reader.onerror = (err) => reject(err);
    });

    setFormData((prev) => ({
      ...prev,
      hospitalLogo: base64, // ✅ only base64 string
    }));

    setErrors((prev) => ({ ...prev, hospitalLogo: "" }));
  } catch (err) {
    setErrors((prev) => ({ ...prev, hospitalLogo: "Failed to read file" }));
    setFormData((prev) => ({ ...prev, hospitalLogo: null }));
  }
};




  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    if (!files || !files[0]) return;

    const file = files[0];
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/zip',
    ];
    const allowedExtensions = ['pdf','doc','docx','jpeg','jpg','png','zip'];
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      setErrors((prev) => ({ ...prev, [name]: 'Invalid file type' }));
      return;
    }

    if (file.size > 102400) {
      setErrors((prev) => ({ ...prev, [name]: 'File must be < 100 KB' }));
      return;
    }

    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = (err) => reject(err);
      });

     setFormData((prev) => ({
  ...prev,
  [name]: base64,   // ✅ only raw base64 string
}));
      setErrors((prev) => ({ ...prev, [name]: '' }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [name]: 'Failed to read file' }));
    }
  };

// ✅ Clear handler (X button click)
const handleClearFile = (name, inputRef) => {
  if (inputRef?.current) {
    inputRef.current.value = '' // clear actual input
  }
  setFormData((prev) => ({
    ...prev,
    [name]: { fileName: '', base64: '' },
  }))
  setErrors((prev) => ({ ...prev, [name]: '' }))
}
  const handleProfessionalIndemnityFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
    ];
    const MAX_SIZE_BYTES = 102400; // 100 KB

    const base64Files = [];

    for (let file of files) {
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          professionalIndemnityInsurance: 'Invalid file type',
        }));
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setErrors((prev) => ({
          ...prev,
          professionalIndemnityInsurance: 'File must be < 100 KB',
        }));
        return;
      }

      // Convert to Base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          // Remove 'data:*/*;base64,' prefix
          const base64 = reader.result.split(',')[1]
          setFormData(prev => ({ ...prev, [name]: base64 }))
          setErrors(prev => ({ ...prev, [name]: '' }))
        }
        reader.onerror = () => {
          setErrors(prev => ({ ...prev, [name]: 'Failed to read file' }))
        }
      });
      base64Files.push(base64);
    }

    setFormData((prev) => ({
      ...prev,
      professionalIndemnityInsurance: base64Files.length === 1 ? base64Files[0] : base64Files,
    }));

    setErrors((prev) => ({ ...prev, professionalIndemnityInsurance: '' }));
  };



  // const handleMultipleFilesChange = async (e) => {
  //   const { name, files } = e.target
  //   if (!files || files.length === 0) return

  //   const allowedTypes = [
  //     'application/pdf',
  //     'application/msword',
  //     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  //     'image/jpeg',
  //     'image/jpg',
  //     'image/png',
  //     'application/zip',
  //   ]

  //   const base64Files = []

  //   for (const file of files) {
  //     if (!allowedTypes.includes(file.type)) {
  //       setErrors(prev => ({ ...prev, [name]: 'Invalid file type in selection' }))
  //       return
  //     }
  //     if (file.size > 102400) {
  //       setErrors(prev => ({ ...prev, [name]: 'Each file must be < 100 KB' }))
  //       return
  //     }

  //     const base64 = await new Promise((resolve, reject) => {
  //       const reader = new FileReader()
  //       reader.readAsDataURL(file)
  //       reader.onload = () => resolve(reader.result)
  //       reader.onerror = (err) => reject(err)
  //     })
  //     base64Files.push(base64)
  //   }

  //   setFormData(prev => ({ ...prev, [name]: base64Files }))
  //   setErrors(prev => ({ ...prev, [name]: '' }))
  // }

  const handleAppendFiles = async (e, fieldName, maxFiles = 6) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (!selectedFiles.length) return

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/zip',
    ]
    const MAX_SIZE_BYTES = 102400 // 100 KB

    // Validate each selected file
    for (let file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, [fieldName]: 'Invalid file type' }))
        return
      }
      if (file.size > MAX_SIZE_BYTES) {
        setErrors(prev => ({ ...prev, [fieldName]: 'File must be < 100 KB' }))
        return
      }
    }

    // Convert files to raw Base64
    const base64Files = await Promise.all(
      selectedFiles.slice(0, maxFiles).map(file =>
        new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = () => {
            // Strip the prefix: "data:application/pdf;base64,"
            const rawBase64 = reader.result.split(',')[1]
resolve({ name: file.name, base64: rawBase64 })          }
          reader.onerror = err => reject(err)
        })
      )
    )

    // Append to existing files in state
    setFormData(prev => {
      const existingFiles = Array.isArray(prev[fieldName]) ? prev[fieldName] : []
      const combinedFiles = [...existingFiles, ...base64Files].slice(0, maxFiles)
      return { ...prev, [fieldName]: combinedFiles }
    })

    setErrors(prev => ({ ...prev, [fieldName]: '' }))
  }


  const normalizeWebsite = (url) => {
    // If starts with www. or does not have protocol, prepend https://
    if (!/^https?:\/\//i.test(url)) {
      return 'https://' + url
    }
    return url
  }
  console.log('submit button clicked')

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        // Only keep the part after comma (raw Base64)
        const base64 = reader.result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = (error) => reject(error)
    })
  }

  const [existingDoctors, setExistingDoctors] = useState([])
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/${ClinicAllData}`)
        const clinicList = Array.isArray(response.data) // your actual API
        // const data = await response.json()
        console.log('Fetched doctor data:', response.data) // <-- CHECK THIS STRUCTURE
        setExistingDoctors(response.data.data)
      } catch (err) {
        console.error('Failed to load existing doctor data', err)
      }
    }

    fetchDoctors()
  }, [])
  useEffect(() => {
    const storedConsultation = localStorage.getItem('consultationExpiration')
    if (storedConsultation) {
      const onlyNumber = storedConsultation.replace(/\D/g, '')
      setFormData((prev) => ({
        ...prev,
        consultationExpiration: onlyNumber,
      }))
    }
  }, [])

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/${getAllQuestions}`, {
          params: { id: savedQuestionId }
        });

        console.log("Fetched data:", response.data);

        if (response.data.success && response.data.data) {
          const qaList = response.data.data.questionsAndAnswers || [];

          // Extract questions
          setNabhQuestions(qaList.map((item) => item.question));

          // Extract existing answers (boolean values)
          setNabhAnswers(qaList.map((item) => item.answer));
        }
      } catch (err) {
        console.error("Error fetching NABH questions:", err);
      }
    };

    fetchQuestions();
  }, [savedQuestionId]);



  const handleNabhSubmit = async () => {
    try {
      const payload = {
        questionsAndAnswers: nabhQuestions.map((q, index) => ({
          question: q,
          answer: nabhAnswers[index] === true,
        })),
      };

      const response = await axios.post(
        `${BASE_URL}/${postAllQuestionsAndAnswers}`,
        payload
      );

      if (response.data.success) {
        const score = response.data.data?.score ?? 0;

        setNabhScore(score);
        setFormData(prev => ({
          ...prev,
          nabhScore: score,
        }));
        setNabhSubmitted(true);
        setShowNabhModal(false);
        setErrors(prev => ({ ...prev, nabhScore: '' }));

      }
    } catch (error) {
      console.error("Error saving NABH answers:", error);
    }
  };


  // ✅ Save to localStorage for frontend-only preview/debug
  const formattedConsultationDays = `${formData.consultationExpiration} days`
  const previewData = {
    ...formData,
    consultationExpiration: formattedConsultationDays,
  }
  localStorage.setItem('clinicFormPreview', JSON.stringify(previewData))
  console.log('👁️ Clinic Form Preview (Frontend only):', previewData)

  const previewFromLocalStorage = JSON.parse(localStorage.getItem('clinicFormPreview'))
  console.log('📦 Loaded from localStorage for preview:', previewFromLocalStorage)

  const handleSubmit = async (e) => {
  e.preventDefault();

  const isValid = validateForm();
  if (!isValid) return;

  setIsSubmitting(true);

 const { emailAddress, contactNumber, licenseNumber } = formData;
const safeExistingDoctors = Array.isArray(existingDoctors) ? existingDoctors : [];

const isEmailDuplicate = safeExistingDoctors.some(
  (doc) => doc.emailAddress?.toLowerCase() === emailAddress?.toLowerCase()
);
const isMobileDuplicate = safeExistingDoctors.some(
  (doc) => doc.contactNumber === contactNumber
);
const isLicenseDuplicate = safeExistingDoctors.some(
  (doc) => doc.licenseNumber?.toLowerCase() === licenseNumber?.toLowerCase()
);

if (isEmailDuplicate || isMobileDuplicate || isLicenseDuplicate) {
  const newErrors = {};
  
  if (isEmailDuplicate) {
    newErrors.emailAddress = "Email already exists";
  }
  if (isMobileDuplicate) {
    newErrors.contactNumber = "Mobile number already exists";
  }
  if (isLicenseDuplicate) {
    newErrors.licenseNumber = "License Number already exists";
  }

  setErrors((prev) => ({ ...prev, ...newErrors }));
  setIsSubmitting(false);
  return;
}


  try {
    // 🔹 Helper functions
    const convertIfExists = async (file) => {
      if (!file) return "";
      if (file instanceof Blob) return await convertFileToBase64(file);
      return file; // already Base64
    };

    const convertMultipleIfExists = async (files) => {
      if (!Array.isArray(files)) return [];
      return Promise.all(
        files.map(async (file) => {
          if (file?.base64) return file.base64;
          if (file instanceof Blob) return await convertFileToBase64(file);
          return file;
        })
      );
    };

    // 🔹 Convert files
    const hospitalLogoBase64 = await convertIfExists(formData.hospitalLogo);
    const hospitalDocumentsBase64 = await convertIfExists(formData.hospitalDocuments);
    const hospitalContractBase64 = await convertIfExists(formData.hospitalContract);
    const clinicalEstablishmentCertificateBase64 = await convertIfExists(
      formData.clinicalEstablishmentCertificate
    );
    const businessRegistrationCertificateBase64 = await convertIfExists(
      formData.businessRegistrationCertificate
    );
    const drugLicenseCertificateBase64 = await convertIfExists(formData.drugLicenseCertificate);
    const drugLicenseFormTypeBase64 = await convertIfExists(formData.drugLicenseFormType);
    const pharmacistCertificateBase64 = await convertIfExists(formData.pharmacistCertificate);
    const biomedicalWasteManagementAuthBase64 = await convertIfExists(
      formData.biomedicalWasteManagementAuth
    );
    const tradeLicenseBase64 = await convertIfExists(formData.tradeLicense);
    const fireSafetyCertificateBase64 = await convertIfExists(formData.fireSafetyCertificate);
    const professionalIndemnityInsuranceBase64 = await convertIfExists(
      formData.professionalIndemnityInsurance
    );
    const gstRegistrationCertificateBase64 = await convertIfExists(
      formData.gstRegistrationCertificate
    );
    const othersBase64 = await convertMultipleIfExists(formData.others);

    // 🔹 Prepare payload
    const clinicData = {
      name: formData.name,
      address: formData.address,
      city: formData.city,
      contactNumber: formData.contactNumber,
      openingTime: formData.openingTime,
      closingTime: formData.closingTime,
      hospitalLogo: hospitalLogoBase64,
      emailAddress: formData.emailAddress,
      website: normalizeWebsite(formData.website.trim()),
      licenseNumber: formData.licenseNumber,
      issuingAuthority: formData.issuingAuthority,
      hospitalDocuments: hospitalDocumentsBase64,
      contractorDocuments: hospitalContractBase64,
      clinicalEstablishmentCertificate: clinicalEstablishmentCertificateBase64,
      businessRegistrationCertificate: businessRegistrationCertificateBase64,
      clinicType: clinicTypeOption,
      medicinesSoldOnSite: selectedOption,
      drugLicenseCertificate: drugLicenseCertificateBase64,
      drugLicenseFormType: drugLicenseFormTypeBase64,
      hasPharmacist: selectedPharmacistOption,
      pharmacistCertificate: pharmacistCertificateBase64,
      biomedicalWasteManagementAuth: biomedicalWasteManagementAuthBase64,
      tradeLicense: tradeLicenseBase64,
      fireSafetyCertificate: fireSafetyCertificateBase64,
      professionalIndemnityInsurance: professionalIndemnityInsuranceBase64,
      gstRegistrationCertificate: gstRegistrationCertificateBase64,
      others: othersBase64,
      freeFollowUps: formData.freeFollowUps,
      instagramHandle: formData.instagramHandle,
      twitterHandle: formData.twitterHandle,
      facebookHandle: formData.facebookHandle,
      recommended: !!formData.recommended,
      consultationExpiration: formData.consultationExpiration
        ? `${formData.consultationExpiration} days`
        : "",
      subscription: formData.subscription,
      latitude: formData.latitude,
      longitude: formData.longitude,
      walkthrough: formData.walkthrough,
      nabhScore: formData.nabhScore,
      branch: formData.branch,
    };

    // 🔹 API Call
    const response = await axios.post(`${BASE_URL}/admin/CreateClinic`, clinicData);
    const savedClinicData = response.data;

    if (savedClinicData.success) {
      toast.success(savedClinicData.message || "Clinic Added Successfully", {
        position: "top-right",
      });

      // 🔹 Send onboarding email + navigate after small delay
      setTimeout(() => {
        sendDermaCareOnboardingEmail({
          name: formData.name,
          email: formData.emailAddress,
          password: savedClinicData.data.clinicTemporaryPassword,
          userID: savedClinicData.data.clinicUsername,
        });

        navigate("/clinic-management", {
          state: {
            refresh: true,
            newClinic: savedClinicData,
          },
        });
      }, 1000);
    } else {
      toast.error(savedClinicData.message || "Something went wrong", {
        position: "top-right",
      });
    }
  } catch (error) {
    console.error("Error submitting clinic data:", error);
    toast.error(error.message || "Something went wrong", { position: "top-right" });
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className="container mt-4">
      <ToastContainer />
      <CCard>
        <CCardHeader>
          <h3 className="mb-0">Add New Clinic</h3>
        </CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSubmit}>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>
                  Clinic Name
                  <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setFormData((prev) => ({ ...prev, [name]: value }));  // <-- save the value

                    // validate dynamically
                    const error =
                      !value.trim()
                        ? "Clinic name is required"
                        : !/^[a-zA-Z\s]{2,50}$/.test(value)
                          ? "Clinic name must contain only letters (2–50 chars)"
                          : "";

                    setErrors((prev) => ({ ...prev, [name]: error || undefined }));
                  }}
                  onKeyDown={preventNumberInput}
                  invalid={!!errors.name}
                />
                {errors.name && <CFormFeedback invalid>{errors.name}</CFormFeedback>}
              </CCol>
               <CCol md={6}>
                 <CFormLabel>
    Email Address<span style={{ color: 'red' }}>*</span>
  </CFormLabel>
                
  <CFormInput
    type="email"
    name="emailAddress"
 
    value={formData.emailAddress}
    onChange={(e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev)=>({...prev, [name]:''}))
    }}
    // onBlur={EmailBlur}
    invalid={!!errors.emailAddress}
  />
  {errors.emailAddress && (
    <CFormFeedback invalid>{errors.emailAddress}</CFormFeedback>
  )}
</CCol>

            </CRow>
            <CRow className="mb-3">
           <CCol md={6}>
  <CFormLabel>
    Contact Number<span style={{ color: 'red' }}>*</span>
  </CFormLabel>
<CFormInput
  type="tel"
  name="contactNumber"
  value={formData.contactNumber}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    handleInputChange({ target: { name: 'contactNumber', value } });
  }}
  maxLength={10}
  invalid={!!errors.contactNumber}
/>
  {errors.contactNumber && (
    <CFormFeedback invalid>{errors.contactNumber}</CFormFeedback>
  )}
</CCol>

              <CCol md={6}>
                <CFormLabel>
                  Website<span style={{ color: 'red' }}>*</span>
                </CFormLabel>
              <CFormInput
  type="text"
  name="website"
  value={formData.website}
  onChange={(e) => {
    const { name, value } = e.target;

    // Update form data
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time validation
    let error = '';
    if (!value.trim()) {
      error = 'Website is required';
    } else if (!/^https?:\/\/[^\s]+$/.test(value.trim())) {
      error = 'Website must start with http:// or https:// and contain no spaces';
    }

    setErrors((prev) => ({ ...prev, [name]: error || undefined }));
  }}
  invalid={!!errors.website}
/>
{errors.website && (
  <div style={{ color: 'red', fontSize: '0.9rem' }}>{errors.website}</div>
)}

              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel>
                    Opening Time<span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormSelect
                    name="openingTime"
                    value={formData.openingTime}
                    onChange={handleInputChange}
                    invalid={!!errors.openingTime}
                    disabled={loadingTimings}
                  >
                    <option value="">Select Opening Time</option>
                    {timings.map((slot, idx) => (
                      <option key={idx} value={slot.openingTime}>
                        {slot.openingTime}
                      </option>
                    ))}
                  </CFormSelect>
                  {errors.openingTime && (
                    <CFormFeedback invalid>{errors.openingTime}</CFormFeedback>
                  )}
                </CCol>

                <CCol md={6}>
                  <CFormLabel>
                    Closing Time<span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormSelect
                    name="closingTime"
                    value={formData.closingTime}
                    onChange={handleInputChange}
                    invalid={!!errors.closingTime}
                    disabled={loadingTimings}
                  >
                    <option value="">Select Closing Time</option>

                    {timings.map((slot, idx) => (
                      <option key={idx} value={slot.closingTime}>
                        {slot.closingTime}
                      </option>
                    ))}
                  </CFormSelect>
                  {errors.closingTime && (
                    <CFormFeedback invalid>{errors.closingTime}</CFormFeedback>
                  )}
                </CCol>
              </CRow>
            </CRow>
            <CRow>
              <CCol md={6}>
                <CFormLabel>
                  License Number<span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  invalid={!!errors.licenseNumber}
                />
                {errors.licenseNumber && (
                  <CFormFeedback invalid>{errors.licenseNumber}</CFormFeedback>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel>
                  Issuing Authority<span style={{ color: 'red' }}>*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="issuingAuthority"
                  value={formData.issuingAuthority}
                  onChange={handleInputChange}
                  onKeyDown={preventNumberInput}
                  invalid={!!errors.issuingAuthority}
                />
                {errors.issuingAuthority && (
                  <CFormFeedback invalid>{errors.issuingAuthority}</CFormFeedback>
                )}
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>
                  Address<span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  invalid={!!errors.address}
                />
                {errors.address && <CFormFeedback invalid>{errors.address}</CFormFeedback>}
              </CCol>
              <CCol md={6}>
                <CFormLabel>
                  Recommendation Status
                  {/* <span className="text-danger">*</span> */}
                </CFormLabel>
                <CFormSelect
                  name="recommended"
                  value={formData.recommended}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      recommended: e.target.value === 'true',
                    }))
                  }
                >
                  <option value="true">Yes, Recommend</option>
                  <option value="false">No, Don't Recommend</option>
                </CFormSelect>
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>
                  City<span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  onKeyDown={preventNumberInput}
                  invalid={!!errors.city}
                />
                {errors.city && <CFormFeedback invalid>{errors.city}</CFormFeedback>}
              </CCol>

              <CCol md={6}>
                <CTooltip content="Issued by Local Fire Department">
                  <CFormLabel>
                    Clinic Contract<span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                </CTooltip>
                <CFormInput
                  type="file"
                  name="hospitalContract"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpeg,.png"
                  invalid={!!errors.hospitalContract}
                />
                {errors.hospitalContract && (
                  <CFormFeedback invalid>{errors.hospitalContract}</CFormFeedback>
                )}
              </CCol>
            </CRow>
            <CRow className="mb-3">
              {/* <CCol md={6}>
    <CFormLabel>
      Hospital Logo<span className="text-danger">*</span>
    </CFormLabel>
    <FileInputWithRemove
      name="hospitalLogo"
      file={formData.hospitalLogo}
      error={errors.hospitalLogo}
      onChange={handleFileChange}
      accept=".pdf,.doc,.docx,.jpeg,.png"
      onRemove={(name) => {
        setFormData((prev) => ({ ...prev, [name]: '' }))  // 👈 clear the field
        setErrors((prev) => ({ ...prev, [name]: '' }))
      }}
     
      invalid={!!errors.hospitalLogo}
    />
  </CCol> */}
               
<CCol md={6} className="position-relative">
  <CFormLabel>
    Clinic Logo<span className="text-danger">*</span>
  </CFormLabel>
  <div className="position-relative">
    <CFormInput
      type="file"
      name="hospitalLogo"
      onChange={handleHospitalLogoChange}
      accept=".jpeg,.jpg,.png"
      invalid={!!errors.hospitalLogo} // red border
      ref={fileInputRef}
    />

    {formData?.hospitalLogo?.fileName && (
      <CButton
        type="button"
        size="sm"
        color="danger"
        className="position-absolute end-0 top-50 translate-middle-y me-2"
        onClick={() => handleClearFile('hospitalLogo', fileInputRef)}
      >
        ✕
      </CButton>
    )}
  </div>

  {/* Red error text explicitly */}
  {errors.hospitalLogo && (
    <div style={{ color: 'red', marginTop: '0.25rem', fontSize: '0.875rem' }}>
      {errors.hospitalLogo}
    </div>
  )}
</CCol>




              <CCol md={6}>
                <CTooltip content="Issued by Local Fire Department">
                  <CFormLabel>
                    Clinic Documents<span className="text-danger">*</span>
                  </CFormLabel>
                </CTooltip>
                <CFormInput
                  type="file"
                  name="hospitalDocuments"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpeg,.png"
                  invalid={!!errors.hospitalDocuments}
                />
                {errors.hospitalDocuments && (
                  <CFormFeedback invalid>{errors.hospitalDocuments}</CFormFeedback>
                )}
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6} className="mb-2">
                <CTooltip content="Issued by Registrar of Companies or local municipal body">
                  <CFormLabel>
                    Clinical Establishment Registration Certificate
                    <span className="text-danger">*</span>
                  </CFormLabel>
                </CTooltip>
                <CFormInput
                  type="file"
                  name="clinicalEstablishmentCertificate"
                  id="clinicalReg"
                  onChange={handleFileChange}   // 🔥 reuse one function
                  accept=".pdf,.doc,.docx,.jpeg,.png"
                  invalid={!!errors.clinicalEstablishmentCertificate}
                />
                {errors.clinicalEstablishmentCertificate && (
                  <CFormFeedback invalid>{errors.clinicalEstablishmentCertificate}</CFormFeedback>
                )}
              </CCol>

              <CCol md={6}>
                <CTooltip content="Issued by Registrar of Companies or local municipal body">
                  <CFormLabel>
                    Business Registration Certificate <span className="text-danger">*</span>
                  </CFormLabel>
                </CTooltip>
                <CFormInput
                  type="file"
                  id="businessReg"
                  name="businessRegistrationCertificate"
                  onChange={handleFileChange}   // 🔥 reuse one handler
                  accept=".pdf,.doc,.docx,.jpeg,.png"
                  invalid={!!errors.businessRegistrationCertificate}
                />
                {errors.businessRegistrationCertificate && (
                  <CFormFeedback invalid>
                    {errors.businessRegistrationCertificate}
                  </CFormFeedback>
                )}

              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>
                  Clinic Type <span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect
                  className="form-select"
                  value={clinicTypeOption}
                  onChange={(e) => {
                    setClinicTypeOption(e.target.value)
                    setErrors((prev) => ({ ...prev, clinicType: '' })) // clear error on change
                  }}
                  invalid={!!errors.clinicType} // this is critical!
                >
                  <option value="">Select Type</option>
                  <option value="Proprietorship">Proprietorship</option>
                  <option value="Partnership">Partnership</option>
                  <option value="LLP">LLP</option>
                  <option value="Private Limited">Private Limited</option>
                </CFormSelect>

                {errors.clinicType && <CFormFeedback invalid>{errors.clinicType}</CFormFeedback>}
              </CCol>

              <CCol>
                <CTooltip content="Issued by Insurance Companies">
                  <CFormLabel>
                    Professional Indemnity Insurance
                  </CFormLabel>
                </CTooltip>
                <CFormInput
                  type="file"
                  id="indemnity"
                  name="professionalIndemnityInsurance"
                  onChange={handleFileChange} // ✅ single-file handler
                  accept=".pdf,.doc,.docx,.jpeg,.png" // no `multiple`
                  invalid={!!errors.professionalIndemnityInsurance}
                />

                {errors.professionalIndemnityInsurance && (
                  <CFormFeedback invalid>
                    {errors.professionalIndemnityInsurance}
                  </CFormFeedback>
                )}


              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>
                  Medicines sold on-site
                  <span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect
                  className="form-select"
                  value={selectedOption}
                  onChange={(e) => {
                    setSelectedOption(e.target.value)
                    setErrors((prev) => ({ ...prev, medicinesSoldOnSite: '' })) // clear error on change
                  }}
                  invalid={!!errors.medicinesSoldOnSite}
                >
                  <option value="">Select an option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </CFormSelect>
                {errors.medicinesSoldOnSite && (
                  <CFormFeedback invalid>{errors.medicinesSoldOnSite}</CFormFeedback>
                )}
              </CCol>
              <CCol md={6}>
                <CTooltip content="Issued by State Pollution Control Board (SPCB)">
                  <CFormLabel>
                    Biomedical Waste Management Authorization
                    <span className="text-danger">*</span>
                  </CFormLabel>
                </CTooltip>
                <CFormInput
                  type="file"
                  id="biomedicalWaste"
                  name="biomedicalWasteManagementAuth"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpeg,.png"
                  invalid={!!errors.biomedicalWasteManagementAuth}
                />
                {errors.biomedicalWasteManagementAuth && (
                  <CFormFeedback invalid>{errors.biomedicalWasteManagementAuth}</CFormFeedback>
                )}

              </CCol>
            </CRow>

            {selectedOption === 'Yes' && (
              <CRow className="mb-3">
                <CCol md={6}>
                  <CTooltip content="Issued by State Drug Control Department">
                    <CFormLabel>Drug License Certificate <span className="text-danger">*</span></CFormLabel>
                  </CTooltip>
                  <CFormInput
                    type="file"
                    id="drugLicenseCertificate"
                    name="drugLicenseCertificate"
                    onChange={handleFileChange}   // 🔥 universal handler
                    accept=".pdf,.doc,.docx,.jpeg,.png"
                    invalid={!!errors.drugLicenseCertificate}
                  />
                  {errors.drugLicenseCertificate && (
                    <CFormFeedback invalid>{errors.drugLicenseCertificate}</CFormFeedback>
                  )}

                </CCol>

                <CCol md={6}>
                  <CTooltip content="Issued by State Drug Control Department">
                    <CFormLabel>DrugLicenseFormType 20/21 <span className="text-danger">*</span></CFormLabel>
                  </CTooltip>
                  <CFormInput
                    type="file"
                    id="Form20/21"
                    name="drugLicenseFormType"
                    onChange={handleFileChange}   // 🔥 reuse one function
                    accept=".pdf,.doc,.docx,.jpeg,.png"
                    invalid={!!errors.drugLicenseFormType}
                  />
                  {errors.drugLicenseFormType && (
                    <CFormFeedback invalid>{errors.drugLicenseFormType}</CFormFeedback>
                  )}

                </CCol>
              </CRow>
            )}
            <CRow className="mb-3">
              <CCol md={6}>
                <CTooltip content="Issued by Local Municipality">
                  <CFormLabel>
                    Trade License / Shop & Establishment License
                    <span className="text-danger">*</span>
                  </CFormLabel>
                </CTooltip>
                <CFormInput
                  type="file"
                  name="tradeLicense"
                  onChange={handleFileChange}   // 🔥 centralized handler
                  accept=".pdf,.doc,.docx,.jpeg,.png"
                  invalid={!!errors.tradeLicense}
                />
                {errors.tradeLicense && (
                  <CFormFeedback invalid>{errors.tradeLicense}</CFormFeedback>
                )}

              </CCol>

              <CCol md={6}>
                <CTooltip content="Issued by Local Fire Department">
                  <CFormLabel>
                    Fire Safety Certificate
                    <span className="text-danger">*</span>
                  </CFormLabel>
                </CTooltip>
                <CFormInput
                  type="file"
                  id="fireSafety"
                  name="fireSafetyCertificate"
                  onChange={handleFileChange}   // 🔥 centralized handler
                  accept=".pdf,.doc,.docx,.jpeg,.png"
                  invalid={!!errors.fireSafetyCertificate}
                />
                {errors.fireSafetyCertificate && (
                  <CFormFeedback invalid>{errors.fireSafetyCertificate}</CFormFeedback>
                )}

              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CTooltip content="Issued by GST Department">
                  <CFormLabel>
                    GST Registration Certificate
                    <span className="text-danger">*</span>
                  </CFormLabel>
                </CTooltip>
                <CFormInput
                  type="file"
                  id="gstCert"
                  name="gstRegistrationCertificate"
                  onChange={handleFileChange}   // 🔥 centralized handler
                  accept=".pdf,.doc,.docx,.jpeg,.png"
                  invalid={!!errors.gstRegistrationCertificate}
                />
                {errors.gstRegistrationCertificate && (
                  <CFormFeedback invalid>{errors.gstRegistrationCertificate}</CFormFeedback>
                )}

              </CCol>

              <CCol md={6}>
                <CTooltip content="NABH Accreditation / Aesthetic Procedure Training Certificate">
                  <CFormLabel>Others (NABH / Aesthetic Training)</CFormLabel>
                </CTooltip>
          <CFormInput
  type="file"
  name="others"
  multiple
  onChange={(e) => handleAppendFiles(e, 'others', 6)}
  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
  invalid={!!errors.others}
/>


                {errors.others && <CFormFeedback invalid>{errors.others}</CFormFeedback>}

                {/* Display selected file names below input */}
                {Array.isArray(formData.others) && formData.others.length > 0 && (
                  <div className="mt-2">
                    {formData.others.map((file, index) => (
                      <div
                        key={index}
                        className="d-flex justify-content-between align-items-center border rounded px-2 py-1 mb-1"
                      >
                        <small className="text-dark">{file.name}</small>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => {
                            const updatedFiles = formData.others.filter((_, i) => i !== index)
                            setFormData((prev) => ({
                              ...prev,
                              others: updatedFiles,
                            }))
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CCol>

            </CRow>
            <CRow>
              <CCol md={6}>
                <CRow >

                  <CCol md={6}>
                    <CFormLabel>
                      Consultation Expiration (in days) <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      name="consultationExpiration"
                      value={formData.consultationExpiration}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, ""); // allow only digits
                        if (value.length > 2) value = value.slice(0, 2); // limit to 2 digits

                        setFormData((prev) => ({
                          ...prev,
                          consultationExpiration: value,
                        }));

                        // Clear error if valid
                        if (value) {
                          setErrors((prev) => ({
                            ...prev,
                            consultationExpiration: "",
                          }));
                        } else {
                          // Add error again if empty
                          setErrors((prev) => ({
                            ...prev,
                            consultationExpiration: "Consultation Expiration is required",
                          }));
                        }
                      }}
                      onBlur={(e) => {
                        let value = e.target.value;
                        if (value.length === 1) {
                          value = value.padStart(2, "0"); // add leading zero
                        }

                        setFormData((prev) => ({
                          ...prev,
                          consultationExpiration: value,
                        }));

                        // Double check on blur (so if user tabs away empty field, error comes back)
                        if (!value) {
                          setErrors((prev) => ({
                            ...prev,
                            consultationExpiration: "Consultation Expiration is required",
                          }));
                        }
                      }}
                      placeholder="Enter consultation days (01-99)"
                      invalid={!!errors.consultationExpiration}
                    />
                    {errors.consultationExpiration && (
                      <CFormFeedback invalid>{errors.consultationExpiration}</CFormFeedback>
                    )}
                  </CCol>



                  <CCol md={6}>
                    <CFormLabel>
                      No. of Free Follow Ups <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="number"
                      name="freeFollowUps"
                      value={formData.freeFollowUps}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="Enter next visit consultation count"
                      invalid={!!errors.freeFollowUps}
                    />
                    {errors.freeFollowUps && (
                      <CFormFeedback invalid>{errors.freeFollowUps}</CFormFeedback>
                    )}
                  </CCol>
                </CRow>
              </CCol>
              <CCol md={6}>
                <CFormLabel>
                  Subscription<span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect
                  name="subscription" // ✅ Must match key in formData
                  className="form-select"
                  value={formData.subscription}
                  onChange={handleInputChange} // ✅ Uses generic input handler
                  invalid={!!errors.subscription}
                >
                  <option value="">Select Subscription</option>
                  <option value="Free">Free</option>
                  <option value="Basic">Basic</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                </CFormSelect>
                {errors.subscription && <div className="text-danger">{errors.subscription}</div>}
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel>Instagram</CFormLabel>
                <CFormInput
                  type="text"
                  id="instagram"
                  placeholder="@clinic_handle"
                  name="instagramHandle"
                  value={formData.instagramHandle}
                  onChange={handleInputChange}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Facebook</CFormLabel>
                <CFormInput
                  type="text"
                  id="facebook"
                  placeholder="facebook.com/clinic"
                  name="facebookHandle"
                  value={formData.facebookHandle}
                  onChange={handleInputChange}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Twitter</CFormLabel>
                <CFormInput
                  type="text"
                  id="twitter"
                  placeholder="@clinic_tweet"
                  name="twitterHandle"
                  value={formData.twitterHandle}
                  onChange={handleInputChange}
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>
                  Clinic has a valid pharmacist
                  <span className="text-danger">*</span>
                </CFormLabel>
                <CFormSelect
                  className="form-select"
                  value={selectedPharmacistOption}
                  onChange={(e) => {
                    setSelectedPharmacistOption(e.target.value)
                    setErrors((prev) => ({ ...prev, hasPharmacist: '' })) // clear error on change
                  }}
                  invalid={!!errors.hasPharmacist}
                >
                  <option value="">Select an option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  {/* <option value="n/a">N/A</option> */}
                </CFormSelect>
                {errors.hasPharmacist && (
                  <CFormFeedback invalid>{errors.hasPharmacist}</CFormFeedback>
                )}
              </CCol>
              {selectedPharmacistOption === 'Yes' && (
                <CCol md={6}>
                  <CTooltip content="Valid Pharmacist Registration Certificate">
                    <CFormLabel>
                      Pharmacist Certificate <span className="text-danger">*</span>
                    </CFormLabel>
                  </CTooltip>

                  <CFormInput
                    type="file"
                    id="pharmacistCert"
                    name="pharmacistCertificate"
                    onChange={handleFileChange} // ✅ reuse function
                    accept=".pdf,.doc,.docx,.jpeg,.png"
                    invalid={!!errors.pharmacistCertificate}
                  />

                  {errors.pharmacistCertificate && (
                    <CFormFeedback invalid>{errors.pharmacistCertificate}</CFormFeedback>
                  )}
                </CCol>
              )}

            </CRow>
            {/* ✅ Clinic Coordinates */}
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>
                  Clinic Latitude <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="number"
                  step="any"
                  placeholder="Enter latitude"
                  value={formData.latitude || ""}
                  onChange={(e) => {
                    const { value } = e.target;
                    setFormData((prev) => ({ ...prev, latitude: value }));

                    // validate immediately
                    const lat = parseFloat(value);
                    let error = "";
                    if (!value) {
                      error = "Latitude is required";
                    } else if (isNaN(lat) || lat < -90 || lat > 90) {
                      error = "Latitude must be between -90 and 90";
                    }

                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      if (error) {
                        newErrors.latitude = error;
                      } else {
                        delete newErrors.latitude; // ✅ remove error when valid
                      }
                      return newErrors;
                    });
                  }}
                  invalid={!!errors.latitude}
                />
                {errors.latitude && (
                  <CFormFeedback invalid>{errors.latitude}</CFormFeedback>
                )}

              </CCol>

              <CCol md={6}>
                <CFormLabel>
                  Clinic Longitude <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="number"
                  step="any"
                  placeholder="Enter longitude"
                  value={formData.longitude || ""}
                  onChange={(e) => {
                    const { value } = e.target;
                    setFormData((prev) => ({ ...prev, longitude: value }));

                    // validate immediately
                    const lng = parseFloat(value);
                    let error = "";
                    if (!value) {
                      error = "Longitude is required";
                    } else if (isNaN(lng) || lng < -180 || lng > 180) {
                      error = "Longitude must be between -180 and 180";
                    }

                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      if (error) {
                        newErrors.longitude = error;
                      } else {
                        delete newErrors.longitude; // ✅ remove error when valid
                      }
                      return newErrors;
                    });
                  }}
                  invalid={!!errors.longitude}
                />
                {errors.longitude && (
                  <CFormFeedback invalid>{errors.longitude}</CFormFeedback>
                )}

              </CCol>
            </CRow>


            {/* ✅ Walkthrough URL */}
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>
                  Virtual Clinic Tour <span className="text-danger"></span>
                </CFormLabel>
               <CFormInput
  type="url"
  placeholder="https://example.com/VirtualClinicTour"
  value={formData.walkthrough || ""}
  onChange={(e) => {
    const { value } = e.target;

    // Update form data
    setFormData((prev) => ({ ...prev, walkthrough: value }));

    // Real-time validation
    let error = "";

  if (value.trim()) {
  try {
    new URL(value); // throws if invalid
  } catch {
    error = "Enter a valid URL (e.g. https://example.com)";
  }
}

    // Set or clear error
    setErrors((prev) => ({
      ...prev,
      walkthrough: error || undefined,
    }));
  }}
  invalid={!!errors.walkthrough}
/>
{errors.walkthrough && (
  <div style={{ color: 'red', fontSize: '0.9rem' }}>{errors.walkthrough}</div>
)}


              </CCol>
              {/* ✅ Branch Input */}

              <CCol md={6}>
                <CFormLabel>
                  Branch <span className="text-danger">*</span>
                </CFormLabel>
                <CFormInput
                  type="text"
                  placeholder="Enter branch name"
                  value={formData.branch || ""}
                  onChange={(e) => {
                    const value = e.target.value;

                    setFormData((prev) => ({ ...prev, branch: value }));
                    if (!value) {
                      setErrors((prev) => ({ ...prev, branch: "Branch name is required" }))
                    }
                    else {
                      setErrors((prev) => ({ ...prev, branch: "" }))
                    }
                  }}

                  invalid={!!errors.branch}
                />
                {errors.branch && <CFormFeedback invalid>{errors.branch}</CFormFeedback>}
              </CCol>

            </CRow>

            {/* ✅ NABH Score - Opens Modal */}
            <CRow className="mb-3">
              <CCol md={12} className='d-flex align-items-center'>
                <CFormLabel className="me-3">NABH Score <span className="text-danger">*</span></CFormLabel>
                {nabhScore !== null && (
                  <span className="me-3 fw-bold text-success">{nabhScore}</span>
                )}
                <CButton
                  color="primary"
                  onClick={() => !nabhSubmitted && setShowNabhModal(true)}
                  disabled={nabhSubmitted}
                >
                  Open NABH Questionnaire
                </CButton>
              </CCol>
              {errors.nabhScore && (
                <CCol md={12}>
                  <div className="text-danger mt-1">{errors.nabhScore}</div>
                </CCol>
              )}
            </CRow>

            <CModal visible={showNabhModal} onClose={() => setShowNabhModal(false)} size="lg">
              <CModalHeader>
                <CModalTitle>NABH Questionnaire</CModalTitle>
              </CModalHeader>
              <CModalBody>
                {nabhQuestions.map((question, index) => (
                  <CRow key={index} className="mb-4">
                    {/* Question with number */}
                    <CCol md={12}>
                      <CFormLabel>
                        {index + 1}. {question}
                      </CFormLabel>
                    </CCol>

                    {/* Radio buttons below the question */}
                    <CCol md={12} className="d-flex mt-2">
                      <CFormCheck
                        type="radio"
                        name={`nabh-${index}`}
                        id={`nabh-${index}-yes`}
                        label="Yes"
                        checked={nabhAnswers[index] === true}
                        onChange={() => {
                          const updated = [...nabhAnswers];
                          updated[index] = true;
                          setNabhAnswers(updated);
                        }}
                        className="me-4"
                      />
                      <CFormCheck
                        type="radio"
                        name={`nabh-${index}`}
                        id={`nabh-${index}-no`}
                        label="No"
                        checked={nabhAnswers[index] === false}
                        onChange={() => {
                          const updated = [...nabhAnswers];
                          updated[index] = false;
                          setNabhAnswers(updated);
                        }}
                      />

                    </CCol>
                  </CRow>
                ))}
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setShowNabhModal(false)}>
                  Close
                </CButton>
                <CButton color="primary" onClick={handleNabhSubmit}>
                  Save
                </CButton>
              </CModalFooter>
            </CModal>

            {errors.submit && <div className="alert alert-danger">{errors.submit}</div>}

            <div className="d-flex justify-content-end gap-2 mt-4">
              <CButton color="secondary" onClick={() => navigate('/clinic-management')}>
                Cancel
              </CButton>
              <CButton type="submit" color="success" className="me-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Saving Data...
                  </>
                ) : (
                  'Save Clinic'
                )}
              </CButton>
            </div>
          </CForm>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default AddClinic