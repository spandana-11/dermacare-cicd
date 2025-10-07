import React, { useState, useEffect ,useCallback} from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CFormCheck,
  CRow,
  CCol,
  CFormLabel,
  CFormSelect,
  CFormInput,
  CFormTextarea,
  CFormText,
  COffcanvas,
  COffcanvasHeader,
  COffcanvasTitle,
  COffcanvasBody,
  CButton,
  CCard ,
  CCardBody,
  CListGroup,
  CListGroupItem,
} from '@coreui/react'

import { GetClinicBranches } from '../Doctors/DoctorAPI'
import { getBookingsByPatientId } from '../../APIs/GetPatinetData'
// import fetchHospital from '../Usecontext/HospitalContext'

import {
  CategoryData,
  serviceData,
  subServiceData,
  getSubServiceById,
} from '../ProcedureManagement/ProcedureManagementAPI'
import { BASE_URL, wifiUrl } from '../../baseUrl'
import axios from 'axios'

const BookAppointmentModal = ({ visible, onClose }) => {
  const [visitType, setVisitType] = useState('first')
  const [appointmentType, setAppointmentType] = useState('services')
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [doctorData, setDoctorData] = useState([]); // initialize as empty array
  const [slotsForSelectedDate, setSlotsForSelectedDate] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [sloading, setSLoading] = useState(false)
    const [bookingData, setBookingData] = useState(null)

  const [selectedBooking, setSelectedBooking] = useState(null)
  const [mvisible, setMVisible] = useState(false)
    
  const [showAllSlots, setShowAllSlots] = useState(false)
  const [subServiceInfo, setSubServiceInfo] = useState([]);
  const [selectedSubServiceInfo, setSelectedSubServiceInfo] = useState(null);
  
  
  
// dropdown lists
  const [categories, setCategories] = useState([])
  const [selectedProcedure, setSelectedProcedure] = useState('')
  const [procedures, setProcedures] = useState([]) // for sub-services
  const [loading, setLoading] = useState([])


  const [services, setServices] = useState([])
  const [subServices, setSubServices] = useState([])
  const [branches, setBranches] = useState([])
  const [doctors, setDoctors] = useState([])
  const [allSlots, setAllSlots] = useState([]); // initialize as empty array
const [loadingDoctors, setLoadingDoctors] = useState(false);


  // selected values
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [selectedSubService, setSelectedSubService] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(false);


 const [bookingDetails, setBookingDetails] = useState({
  // Branch & clinic info
  branchId: localStorage.getItem('branchId') || '',
  branchname: localStorage.getItem('branchName') || '',

  clinicId: localStorage.getItem('HospitalId') || '',
  clinicName: localStorage.getItem('HospitalName') || '',

  clinicAddress: localStorage.getItem("address")|| '',

  // Service info
  categoryName: '',
  categoryId: '',
  servicename: '',
  serviceId: '',
  subServiceName: '',
  subServiceId: '',

  // Doctor info
  doctorId: '',
  doctorName: '',
  doctorDeviceId: '',
  doctorRefCode: '',

  // Consultation info
  consultationType: 'services',
  consultationFee: 0,
  consultationExpiration: '04 Days',
  paymentType: '',
  visitType: 'first',

  // Patient info
  bookingFor: 'Self',   // Self / Others
  name: '',
  relation: '',         // If booking for others
  patientAddress: '',
  patientMobileNumber: '',
  mobileNumber: '',     // optional, same as patientMobileNumber
  age: '',
  gender: '',
  symptomsDuration: '',
  problem: '',

  // Attachments & other fields
  attachments: [],      // array of File objects
  freeFollowUps: 0,
  consentFormPdf: '',
  customerId: '',
  customerDeviceId: '',

  // Service date/time
  // serviceDate: '',
  // servicetime: '',

  // Optional structured address
  address: {
    houseNo: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  },
});


  const [errors, setErrors] = useState({})
 const handlePatientSearch = async () => {
    if (!patientSearch.trim()) {
      alert('Please enter a valid Patient ID / Name / Mobile')
      return
    }

    setSLoading(true)
    try {
      const res = await getBookingsByPatientId(patientSearch)
      console.log(patientSearch)
      setBookingData(res.data.data || [])
      console.log(res.data.data)
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setBookingData([])
    } finally {
      setSLoading(false)
    }
  }

  const handleSelectBooking = (booking) => {
    setSelectedBooking(booking)
    setMVisible(true)
  }

const formatDate = (date) => {
  if (!date) return null
  const d = new Date(date)
  if (isNaN(d)) return null
  return d.toISOString().split('T')[0] // 'yyyy-mm-dd'
}
// 'yyyy-mm-dd'


useEffect(() => {
    if (!patientSearch) return

    getBookingsByPatientId(patientSearch)
      .then((res) => {
        setBookingData(res.data.data) // ✅ because response structure has { data: [...] }
      })
      .catch((err) => {
        console.error('Error fetching bookings:', err)
      })
      .finally(() => setLoading(false))
  }, [patientSearch])




  // ✅ Fetch Categories
  useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await CategoryData();
      console.log("Categories API response:", res.data);

      const categoriesList = Array.isArray(res.data) ? res.data : [];
      setCategories(categoriesList);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    }
  };

  fetchCategories();
}, []); // fetch once on mount

  // ✅ Fetch Services when Category changes
 useEffect(() => {
  if (!selectedCategory) {
    setServices([]);
    setSelectedService('');
    setSubServices([]);
    setSelectedSubService('');
    return;
  }

  const fetchServices = async () => {
    try {
      const res = await serviceData(selectedCategory);
      console.log("Services API response for category:", selectedCategory, res.data);

      const servicesList = Array.isArray(res.data) ? res.data : [];
      setServices(servicesList);

      // Reset downstream selections
      setSelectedService('');
      setSubServices([]);
      setSelectedSubService('');
    } catch (err) {
      console.error("Error fetching services:", err);
      setServices([]);
      setSubServices([]);
      setSelectedService('');
      setSelectedSubService('');
    }
  };

  fetchServices();
}, [selectedCategory]);
  // ✅ Fetch SubServices when Service changes



useEffect(() => {
  if (!selectedSubService) {
    setSubServices([]);
    setBookingDetails(prev => ({
      ...prev,
      consultationFee: 0,
      discountAmount: 0,
      discountPercentage: 0,
      totalAmount: 0,
    }));
    return;
  }

  const fetchSubServiceInfo = async () => {
  
    
    try {
       const clinicId = localStorage.getItem('HospitalId')
      
      const url = `${BASE_URL}/getSubService/${clinicId}/${selectedSubService}`;
      console.log("Fetching sub-service info from URL:", url);

      const res = await axios.get(url);
      console.log("Sub-service API response:", res.data);

      // ✅ Extract first object from array
      const subServiceInfo = res.data?.data || {};

      // ✅ Update booking details from API fields
      setBookingDetails(prev => ({
        ...prev,
        consultationFee: subServiceInfo.consultationFee || 0,
        discountAmount: subServiceInfo.discountedCost || 0,
        discountPercentage: subServiceInfo.discountPercentage || 0,
        totalAmount:
          (subServiceInfo.discountedCost || 0) +
          (subServiceInfo.taxAmount || 0), // Adjust formula as needed
      }));

      // Optional: store the subservice info
      setSubServices(res.data.data);

    } catch (err) {
      console.error("Error fetching sub-service info:", err);
      setSubServices([]);
      setBookingDetails(prev => ({
        ...prev,
        consultationFee: '',
        discountAmount: '',
        discountPercentage: '',
        totalAmount: '',
      }));
    }
  };

  fetchSubServiceInfo();
}, [selectedSubService]);








useEffect(() => {
  console.log("useEffect triggered with service ID:", selectedService);

  if (!selectedService) {
    setSubServices([]);
    setSelectedSubService('');
    return;
  }

  const fetchSubServices = async () => {
    try {
      const res = await subServiceData(selectedService); 
      console.log("API response for service ID:", selectedService, res.data);

      const blocks = Array.isArray(res.data) ? res.data : [];
      const allSubServices = blocks.flatMap(block => block.subServices || []);

      setSubServices(allSubServices);
      setSelectedSubService('');
    } catch (err) {
      console.error("Error fetching sub-services:", err);
      setSubServices([]);
      setSelectedSubService('');
    }
  };

  fetchSubServices();
}, [selectedService]);
const slotsToShow = slotsForSelectedDate
    .filter(s => formatDate(s.day || s.date) === selectedDate)
    .flatMap(s => s.availableSlots || [])

  // initially show only 2 rows (6 slots per row => 12 slots)
  const visibleSlots = showAllSlots ? slotsToShow : slotsToShow.slice(0, 12)





  // ✅ Fetch Branches (when modal opens)
  useEffect(() => {
    if (!visible) return

    const fetchBranches = async () => {
      try {
        const clinicId = localStorage.getItem('HospitalId')
        const response = await GetClinicBranches(clinicId)
        const branchList = Array.isArray(response.data) ? response.data : []
        const formattedBranches = branchList.map((b) => ({
          branchId: b.branchId || b.id,
          branchName: b.branchName || b.name,
        }))
        setBranches(formattedBranches)
      } catch {
        setBranches([])
      }
    }

    fetchBranches()
  }, [visible])

  // ✅ Example: Fetch Doctors when Branch & SubService are chosen
  // ✅ Fetch Doctors when Branch & SubService are chosen




useEffect(() => {
  const fetchDoctors = async () => {
    if (!bookingDetails.branchId || !selectedSubService) {
      setDoctors([]);
      return;
    }

    setLoadingDoctors(true);
    try {
      const clinicId = localStorage.getItem('HospitalId');
      const branchId = bookingDetails.branchId;
      const subServiceId = selectedSubService;

      const url = `${BASE_URL}/doctors/${clinicId}/${branchId}/${subServiceId}`;
      console.log("Doctors API URL:", url);

      const response = await axios.get(url);
      console.log("Response data:", response.data);

      // ✅ Use response.data.data
      setDoctors(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  fetchDoctors(); 
}, [bookingDetails.branchId, selectedSubService]);

 const fetchSlots = async (doctorId) => {
  try {
    const hospitalId = localStorage.getItem('HospitalId');
    const branchId = bookingDetails.branchId;

    const response = await axios.get(
      `${BASE_URL}/getDoctorSlots/${hospitalId}/${branchId}/${doctorId}`
    );

    if (response.data.success) {
      console.log('Fetched Slots Data:', response.data.data);  // ✅ Check console
      setSlotsForSelectedDate(response.data.data);
    } else {
      setSlotsForSelectedDate([]);
    }
  } catch (error) {
    console.error('Error fetching slots:', error);
    setSlotsForSelectedDate([]);
  } finally {
    setLoadingSlots(false);
  }
};





// Fetch available slots for a doctor

const handleBookingChange = (e) => {
  const { name, value } = e.target;

  setBookingDetails((prev) => {
    let updatedDetails = { ...prev, [name]: value };

    if (name === 'dob' && value) {
      // DOB → Age
      const today = new Date();
      const dob = new Date(value);
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
      updatedDetails.age = age >= 1 ? age : 0;
    }

    if (name === 'age' && value) {
      // Age → DOB (assume birthday today)
      const today = new Date();
      const dob = new Date();
      dob.setFullYear(today.getFullYear() - parseInt(value));
      updatedDetails.dob = dob.toISOString().split('T')[0]; // format YYYY-MM-DD
    }

    return updatedDetails;
  });

  // Remove errors
  setErrors((prev) => {
    const updatedErrors = { ...prev };
    if (name === 'dob' || name === 'age') {
      delete updatedErrors.dob;
      delete updatedErrors.age;
    }
    return updatedErrors;
  });
};






const handleNestedChange = (section, field, value) => {
  // Update the bookingDetails
  setBookingDetails((prev) => ({
    ...prev,
    [section]: {
      ...prev[section],
      [field]: value,
    },
  }));

  // Real-time validation: remove error if value is valid
  setErrors((prev) => {
    const updatedErrors = { ...prev };

    if (section === "address") {
      if (!updatedErrors.address) return prev;

      // Check postalCode specific validation
      if (field === "postalCode") {
        if (/^\d{6}$/.test(value)) {
          delete updatedErrors.address[field];
        }
      } else {
        if (value.trim() !== "") {
          delete updatedErrors.address[field];
        }
      }

      // Remove address key if empty
      if (Object.keys(updatedErrors.address).length === 0) {
        delete updatedErrors.address;
      }
    }

    return updatedErrors;
  });
};


 const validate = () => {
  const newErrors = {};
   const addressErrors = {}
   

  // Name
  if (!bookingDetails.name?.trim()) newErrors.name = 'Name is required.';
  else if (!/^[A-Za-z\s]+$/.test(bookingDetails.name))
    newErrors.name = 'Name must contain only letters.';
  else if (bookingDetails.name.length < 3 || bookingDetails.name.length > 50)
    newErrors.name = 'Name must be 3-50 characters.';

//   if (!bookingDetails.patientId?.trim()) {
//   newErrors.patientId = 'Patient ID is required.';
// } else if (bookingDetails.patientId.length < 3 || bookingDetails.patientId.length > 20) {
//   newErrors.patientId = 'Patient ID must be 3-20 characters.';
// }
  

  // Address
  // if (!bookingDetails.patientAddress?.trim())
  //   newErrors.patientAddress = 'Address is required.';
  // else if (bookingDetails.patientAddress.length < 5 || bookingDetails.patientAddress.length > 200)
  //   newErrors.patientAddress = 'Address must be 5-200 characters.';

  // Mobile Number
  if (!bookingDetails.patientMobileNumber?.trim())
    newErrors.patientMobileNumber = 'Mobile number is required.';
  else if (!/^[6-9]\d{9}$/.test(bookingDetails.patientMobileNumber))
    newErrors.patientMobileNumber = 'Enter a valid 10-digit mobile number starting with 6-9.';

  // Age
 

  // Gender
  if (!bookingDetails.gender) newErrors.gender = 'Gender is required.';

  // Branch
  // if (!bookingDetails.branchname) newErrors.branchname = 'Branch selection is required.';

  // Doctor Name
  if (!bookingDetails.doctorName) newErrors.doctorName = 'Doctor name is required.';

  // Service Selection
  if (appointmentType === 'services') {
    if (!selectedCategory) newErrors.selectedCategory = 'Category selection is required.';
    // if (!selectedService) newErrors.selectedService = 'Service selection is required.';
    if (!selectedSubService) newErrors.subServiceName = 'Sub-service selection is required.';
  }

  // Slot Selection
  // if (!bookingDetails.slot) newErrors.slot = 'Please select a slot.';

if (!bookingDetails.paymentType) newErrors.paymentType = 'Payment type is required.';

  // Optional: Doctor Referral Code
  if (bookingDetails.doctorRefCode) {
    if (bookingDetails.doctorRefCode.length < 4 || bookingDetails.doctorRefCode.length > 10)
      newErrors.doctorRefCode = 'Referral code must be 4-10 characters.';
  }
  Object.keys(bookingDetails.address || {}).forEach((field) => {
    const value = bookingDetails.address[field]?.trim() || ""

    if (!value) {
      addressErrors[field] = `${field} is required`
    } else {
      // Specific validations
      if (field === "postalCode" && !/^\d{6}$/.test(value)) {
        addressErrors[field] = "Postal code must be 6 digits"
      }
      if (field === "phone" && !/^[6-9]\d{9}$/.test(value)) {
        addressErrors[field] = "Enter a valid 10-digit phone number"
      }
    }
  })

  if (Object.keys(addressErrors).length > 0) {
    newErrors.address = addressErrors
  }

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0


};



const handleSubmit = async () => {
  console.log("Validating bookingDetails...", bookingDetails);
  if (!validate()) {
    console.log("Validation failed. Errors:", errors);
    return;
  }

  try {
    const clinicId = localStorage.getItem('HospitalId');

    // ✅ Fetch hospital details
    const hospital = await fetchHospital(clinicId);

    const payload = {
      ...bookingDetails,
      clinicName: hospital?.clinicName || '',
      clinicAddress: hospital?.clinicAddress || '',
      patientAddress: `${bookingDetails.address.houseNo}, ${bookingDetails.address.street}, ${bookingDetails.address.landmark}, ${bookingDetails.address.city}, ${bookingDetails.address.state}, ${bookingDetails.address.postalCode}, ${bookingDetails.address.country}`,
    };

    console.log("Payload with clinic info:", payload);

    const res = await axios.post(`${wifiUrl}/api/customer/bookService`, payload);
    console.log('Booking submitted successfully:', res.data);
  } catch (err) {
    console.error('Error submitting booking:', err);
  }
};



  const handleServicesSubmit = () => {
  if (validate()) {
    console.log("Submitting Services Appointment:", bookingDetails);
    // Call your API for services appointment
  }
};

const handleInClinicSubmit = () => {
  if (validate()) {
    console.log("Submitting In-Clinic Appointment:", bookingDetails);
    // Call your API for in-clinic appointment
  }
};

const handleOnlineSubmit = () => {
  if (validate()) {
    console.log("Submitting Online Appointment:", bookingDetails);
    // Call your API for online appointment
  }
};
const handleFollowupServicesSubmit = () => {
  if (validate()) {
    console.log("Submitting Services for Follow-Up:", bookingDetails);
    // Call your API for Services + Follow-Up appointment
  }
};


console.log(`appointmenttype ${appointmentType}`);
  return (
 <COffcanvas
  placement="end"
  visible={visible}
  onHide={onClose}
  className="w-50"
  backdrop="static"
>
  <COffcanvasHeader>
    <COffcanvasTitle>📅 Book Appointment</COffcanvasTitle>
    <button className="btn-close" onClick={onClose}></button>
  </COffcanvasHeader>

  <COffcanvasBody>
    {/* SECTION: Visit Type */}
    <h5 className="mb-3 border-bottom pb-2">Visit Type</h5>
    <CRow className="mb-4">
      <CCol md={6}>
        <CFormCheck
          type="radio"
          label="First Visit"
          name="visitTypeRadio"
          value="first"
          checked={visitType === 'first'}
          onChange={() => {
            setVisitType('first')
            setBookingDetails((prev) => ({ ...prev, visitType: 'first' }))
          }}
        />
      </CCol>
      <CCol md={6}>
        <CFormCheck
          type="radio"
          label="Follow-Up"
          name="visitTypeRadio"
          value="followup"
          checked={visitType === 'followup'}
          onChange={() => {
            setVisitType('followup')
            setBookingDetails((prev) => ({ ...prev, visitType: 'followup' }))
          }}
        />
      </CCol>
    </CRow>

    {/* SECTION: Appointment Type */}
  {visitType !== 'followup' && (
          <div>
            <h5 className="mb-3 border-bottom pb-2">Appointment Type</h5>
         <CRow className="mb-4">
  <CCol md={4}>
    <CFormCheck
      type="radio"
      label="Services & Treatment"
      name="appointmentTypeRadio"
      value="services"
      checked={appointmentType === 'services'}
      onChange={() => {
        setAppointmentType('services');
        setBookingDetails(prev => ({ ...prev, consultationType: 'services' }));
      }}
    />
  </CCol>
  <CCol md={4}>
    <CFormCheck
      type="radio"
      label="In-Clinic"
      name="appointmentTypeRadio"
      value="inclinic"
      checked={appointmentType === 'inclinic'}
      onChange={() => {
        setAppointmentType('inclinic');
        setBookingDetails(prev => ({ ...prev, consultationType: 'inclinic' }));
      }}
    />
  </CCol>
  <CCol md={4}>
    <CFormCheck
      type="radio"
      label="Online"
      name="appointmentTypeRadio"
      value="online"
      checked={appointmentType === 'online'}
      onChange={() => {
        setAppointmentType('online');
        setBookingDetails(prev => ({ ...prev, consultationType: 'online' }));
      }}
    />
  </CCol>
</CRow>
          </div>
        )}
    {visitType === 'followup' && (
 <div>
            {/* 🔍 Search Bar */}
            <CRow className="mb-3">
              <CCol md={10}>
                <CFormInput
                  type="text"
                  placeholder="Search by Name / Patient ID / Mobile"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                />
              </CCol>
              <CCol md={2}>
                <CButton color="primary" onClick={handlePatientSearch} disabled={loading}>
                  {sloading ? 'Searching...' : 'Search'}
                </CButton>
              </CCol>
            </CRow>

            {/* 🔽 Dropdown List */}
            {/* {bookingData.length > 0 && ( */}
            {Array.isArray(bookingData) && bookingData.length > 0 ? (
              <CListGroup className="shadow-sm mb-4">
                {bookingData.map((item) => (
                  <CListGroupItem
                    key={item.bookingId}
                    action
                    onClick={() => handleSelectBooking(item)}
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>
                      <strong>{item.name}</strong>
                    </span>
                    <span className="text-muted">{item.patientId}</span>
                  </CListGroupItem>
                ))}
              </CListGroup>
            ) : (
              !loading && <p className="text-muted">No bookings found</p>
            )}

            {/* )} */}

            {/* 🧾 Modal for Full Details */}
            <CModal visible={mvisible} onClose={() => setMVisible(false)} size="lg">
              <CModalHeader>
                <CModalTitle>Booking Details</CModalTitle>
              </CModalHeader>
              <CModalBody>
                {selectedBooking && (
                  <div>
                    <p>
                      <strong>Name:</strong> {selectedBooking.name}
                    </p>
                    <p>
                      <strong>Patient ID:</strong> {selectedBooking.patientId}
                    </p>

                    <p>
                      <strong>Gender:</strong> {selectedBooking.gender}
                    </p>
                    <p>
                      <strong>Mobile:</strong> {selectedBooking.mobileNumber}
                    </p>
                    <p>
                      <strong>Address:</strong> {selectedBooking.patientAddress}
                    </p>
                  </div>
                )}
              </CModalBody>
            </CModal>
          </div>

)}

    {/* SECTION: Services Selection */}
    {appointmentType === 'services' && visitType!=="followup" &&(
      <>
        <h5 className="mb-3 border-bottom pb-2">Select Service</h5>
        <CRow className="mb-4">
      <CCol md={4}>
  <h6>
    Category Name <span className="text-danger">*</span>
  </h6>
 <CFormSelect
  value={selectedCategory}
  onChange={(e) => {
    const selectedId = e.target.value;
    const selectedObj = categories.find((cat) => cat.categoryId === selectedId);
    
    setSelectedCategory(selectedId);

    setBookingDetails((prev) => ({
      ...prev,
      categoryId: selectedObj?.categoryId || '',
      categoryName: selectedObj?.categoryName || '',
    
    }));

    // Remove error when selected
    setErrors((prev) => ({ ...prev, selectedCategory: '' }));
  }}
>
  <option value="">Select Category</option>
  {categories.map((cat) => (
    <option key={cat.categoryId} value={cat.categoryId}>
      {cat.categoryName}
    </option>
  ))}
</CFormSelect>

  {errors.selectedCategory && (
    <div className="text-danger mt-1">{errors.selectedCategory}</div>
  )}
</CCol>



       <CCol md={4}>
  <h6>
    Service <span className="text-danger">*</span>
  </h6>
 <CFormSelect
  value={selectedService}
  onChange={(e) => {
    const selectedId = e.target.value;
    const selectedObj = services.find(
      (service) => service.serviceId === selectedId
    );

    console.log("Selected service:", selectedObj);

    setSelectedService(selectedId);

    // ✅ Update bookingDetails for backend
    setBookingDetails((prev) => ({
      ...prev,
      serviceId: selectedObj?.serviceId || '',
      servicename: selectedObj?.serviceName || '',
    }));

    // ✅ Optional: clear subservices when service changes
    setSelectedSubService('');
    setSubServices([]);
  }}
>
  <option value="">Select Service</option>
  {services.map((service) => (
    <option key={service.serviceId} value={service.serviceId}>
      {service.serviceName}
    </option>
  ))}
</CFormSelect>


  {errors.selectedService && (
    <div className="text-danger mt-1">{errors.selectedService}</div>
  )}
</CCol>


 <CCol md={4}>
  <h6>
    Procedure Name <span className="text-danger">*</span>
  </h6>
 <CFormSelect
  value={selectedSubService}
  onChange={(e) => {
    const selectedId = e.target.value;
    const selectedObj = subServices.find(
      (sub) => sub.subServiceId === selectedId
    );

    setSelectedSubService(selectedId);

    // ✅ Update bookingDetails with sub-service info
    setBookingDetails((prev) => ({
      ...prev,
      subServiceId: selectedObj?.subServiceId || '',
      subServiceName: selectedObj?.subServiceName || '',
    }));
  }}
  disabled={!selectedService || !subServices || subServices.length === 0}
>
  <option value="">Select Sub-Service</option>
  {subServices && subServices.length > 0 ? (
    subServices.map((sub) => (
      <option key={sub.subServiceId} value={sub.subServiceId}>
        {sub.subServiceName}
      </option>
    ))
  ) : (
    <option value="" disabled>
      No sub-services available
    </option>
  )}
</CFormSelect>

</CCol>






        </CRow>
      </>
    )}

    {/* SECTION: Patient & Booking Details */}
  {visitType !== 'followup' && (
          <div>
            <h5 className="mb-3 border-bottom pb-2">Patient & Booking Details</h5>
            <CRow className="mb-4">
              <CCol md={4}>
                <h6>
                  Branch <span className="text-danger">*</span>
                </h6>
                <CFormSelect
                  name="branchId"
                  value={bookingDetails.branchId || ''}
             onChange={(e) => {
  const selectedBranch = branches.find(branch => branch.branchId === e.target.value);
  setBookingDetails(prev => ({
    ...prev,
    branchId: selectedBranch?.branchId || '',
    branchname: selectedBranch?.branchName || ''
  }));
}}

                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch.branchId} value={branch.branchId}>
                      {branch.branchName}
                    </option>
                  ))}
                </CFormSelect>

                {errors.branchname && (
                  <CFormText className="text-danger">{errors.branchname}</CFormText>
                )}

                {errors.branchname && <div className="text-danger">{errors.branchname}</div>}
              </CCol>

              <CCol md={4}>
                <h6>
                  Doctor Name <span className="text-danger">*</span>
                </h6>
             <CFormSelect
  name="doctorName"
  value={bookingDetails.doctorId || ''}
  onChange={(e) => {
    const selectedDoctorId = e.target.value;
    const selectedDoctor = doctors.find((doc) => doc.doctorId === selectedDoctorId);

    if (selectedDoctor) {
      setBookingDetails((prev) => ({
        ...prev,
        doctorId: selectedDoctor.doctorId,       
        doctorName: selectedDoctor.doctorName, 
        doctorDeviceId: selectedDoctor.doctorDeviceId  
      }));

      // fetch slots for the selected doctor
      fetchSlots(selectedDoctorId);

      // clear any previous errors
      setErrors((prev) => ({ ...prev, doctorName: '' }));
    } else {
      setBookingDetails((prev) => ({
        ...prev,
        doctorId: '',
        doctorName: '',
        doctorDeviceId: ''
      }));
      setErrors((prev) => ({ ...prev, doctorName: 'Please select a valid doctor' }));
    }
  }}
  disabled={loadingDoctors}
  required
>
  <option value="">Select Doctor</option>
  {doctors.map((doc) => (
    <option 
      key={doc.doctorId} 
      value={doc.doctorId}
    >
      {doc.doctorName} 
    </option>
  ))}
</CFormSelect>



                {errors.doctorName && <div className="text-danger">{errors.doctorName}</div>}
              </CCol>
            </CRow>
          </div>
        )}


{/* ==================== Available Slots ==================== */}
<h5 className="mb-3 border-bottom pb-2">Available Slots</h5>
<CCol md={12}>
  {/* Date Buttons */}
  <div className="d-flex gap-2 flex-wrap mb-3">
    {[...new Set(slotsForSelectedDate.map(s => formatDate(s.day || s.date)))].map((dateValue, idx) => {
      if (!dateValue) return null
      const isSelected = selectedDate === dateValue

      const d = new Date(dateValue)
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' })
      const dateLabel = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })

      return (
        <CButton
          key={idx}
          onClick={() => {
            setSelectedDate(dateValue)
            // Update serviceDate in bookingDetails
            setBookingDetails(prev => ({
              ...prev,
              serviceDate: dateValue
            }))
          }}
          style={{
            backgroundColor: isSelected ? 'var(--color-black)' : '#fff',
            color: isSelected ? '#fff' : 'var(--color-black)',
            border: '1px solid var(--color-black)',
            minWidth: '80px',
          }}
        >
          <div style={{ fontSize: '14px' }}>{dayLabel}</div>
          <div style={{ fontSize: '12px' }}>{dateLabel}</div>
        </CButton>
      )
    })}
  </div>

  {/* Time Slots for Selected Date */}
  <div className="slot-grid mt-3">
    <CCard className="mb-4">
      <CCardBody>
        {loadingSlots ? (
          <div className="text-center py-3">Loading slots...</div>
        ) : slotsToShow.length === 0 ? (
          <p className="text-center text-dark">No available slots for this date</p>
        ) : (
          <>
            <div
              className="slots-container"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '10px',
              }}
            >
              {visibleSlots.map((slotObj, i) => {
                const slotLabel = slotObj.slot
                const isSelectedSlot = selectedSlots.includes(slotLabel)

                return (
                  <div
                    key={i}
                    className={`slot-item text-center border rounded px-2 py-1 transition-all duration-200
                      ${slotObj.slotbooked ? 'bg-secondary text-white cursor-not-allowed opacity-60' : ''}
                      ${isSelectedSlot && !slotObj.slotbooked ? 'bg-primary text-white' : ''}
                      ${!isSelectedSlot && !slotObj.slotbooked ? 'bg-light text-dark hover:bg-gray-200 cursor-pointer' : ''}
                    `}
                    onClick={() => {
                      if (slotObj.slotbooked) return

                      let updatedSlots
                      if (isSelectedSlot) {
                        updatedSlots = selectedSlots.filter(s => s !== slotLabel)
                      } else {
                        updatedSlots = [...selectedSlots, slotLabel]
                      }

                      setSelectedSlots(updatedSlots)

                      // Update bookingDetails with selected slots
                      setBookingDetails(prev => ({
                        ...prev,
                        serviceTime: updatedSlots // send as comma-separated string or array based on backend
                      }))
                    }}
                  >
                    {slotLabel}
                  </div>
                )
              })}
            </div>

            {/* Show More / Show Less button */}
            {slotsToShow.length > 12 && (
              <div className="text-center mt-2">
                <CButton
                  color="secondary"
                  size="sm"
                  onClick={() => setShowAllSlots(prev => !prev)}
                >
                  {showAllSlots ? 'Show Less' : 'Show More'}
                </CButton>
              </div>
            )}
          </>
        )}
      </CCardBody>
    </CCard>
  </div>

  {/* Error message */}
  {errors.slot && <div className="text-danger mt-2">{errors.slot}</div>}
</CCol>



{visitType !== 'followup' && (
          <div>
            <h5 className="mb-3 border-bottom pb-2">Contact Information</h5>
            <CRow className="mb-4">
              {/* Patient ID - only for followup */}
              {visitType === 'followup' && (
                <CCol md={6} className="mb-3">
                  <h6>
                    Patient ID <span className="text-danger">*</span>
                  </h6>
                  <CFormInput
                    name="patientId"
                    value={bookingDetails.patientId || ''}
                    onChange={handleBookingChange}
                  />
                  {errors.patientId && <p className="text-danger">{errors.patientId}</p>}
                </CCol>
              )}

              {/* Name */}
              <CCol md={6} className="mb-3">
                <h6>
                  Name <span className="text-danger">*</span>
                </h6>
                <CFormInput
                  name="name"
                  value={bookingDetails.name || ''}
                  onChange={handleBookingChange}
                  minLength={3}
                  maxLength={50}
                />
                {errors.name && <p className="text-danger">{errors.name}</p>}
              </CCol>

              {/* DOB */}
             <CCol md={6} className="mb-3">
    <h6>
      Date of Birth <span className="text-danger">*</span>
    </h6>
    <CFormInput
      type="date"
      name="dob"
      value={bookingDetails.dob || ''}
      onChange={handleBookingChange}
      max={new Date().toISOString().split('T')[0]} // Prevent future dates
    />
    {errors.dob && <p className="text-danger">{errors.dob}</p>}
  </CCol>

  {/* Age (calculated automatically) */}
  <CCol md={2} className="mb-3">
    <h6>
      Age 
    </h6>
    <CFormInput
      type="number"
      name="age"
      value={bookingDetails.age || 0}
      onChange={handleBookingChange} // Optional: can keep for form handling
      min={0}
      max={120}
      readOnly
    />
    {errors.age && <p className="text-danger">{errors.age}</p>}
  </CCol>

              {/* Gender */}
              <CCol md={4} className="mb-3">
                <h6>
                  Gender <span className="text-danger">*</span>
                </h6>
                <CFormSelect
                  name="gender"
                  value={bookingDetails.gender || ''}
                  onChange={handleBookingChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </CFormSelect>
                {errors.gender && <p className="text-danger">{errors.gender}</p>}
              </CCol>

              {/* Mobile Number */}
              <CCol md={6} className="mb-3">
                <h6>
                  Mobile Number <span className="text-danger">*</span>
                </h6>
                <CFormInput
                  type="tel"
                  name="patientMobileNumber"
                  value={bookingDetails.patientMobileNumber || ''}
                  onChange={handleBookingChange}
                />
                {errors.patientMobileNumber && (
                  <p className="text-danger">{errors.patientMobileNumber}</p>
                )}
              </CCol>

              {/* Followups - only for followup */}
              {visitType === 'followup' && (
                <>
                  <CCol md={4} className="mb-3">
                    <h6>Followups Left</h6>
                    <CFormInput
                      type="number"
                      name="followupsLeft"
                      value={bookingDetails.followupsLeft || ''}
                      readOnly
                    />
                  </CCol>

                  <CCol md={4} className="mb-3">
                    <h6>Free Followups Left</h6>
                    <CFormInput
                      type="number"
                      name="freeFollowupsLeft"
                      value={bookingDetails.freeFollowupsLeft || ''}
                      readOnly
                    />
                  </CCol>
                </>
              )}

              {/* Address Section */}
              <CCol md={12}>
                <h5 className="mt-3">Address</h5>
                {Object.keys(bookingDetails.address || {})
                  .reduce((rows, field, index) => {
                    if (index % 3 === 0) rows.push([])
                    rows[rows.length - 1].push(field)
                    return rows
                  }, [])
                  .map((rowFields, rowIndex) => (
                    <CRow className="mb-3" key={rowIndex}>
                      {rowFields.map((field) => (
                        <CCol md={4} key={field}>
                          <CFormLabel className="text-capitalize">
                            {field} <span className="text-danger">*</span>
                          </CFormLabel>
                          <CFormInput
                            type="text"
                            maxLength={field === 'postalCode' ? 6 : undefined}
                            value={bookingDetails.address[field] || ''}
                            onChange={(e) => handleNestedChange('address', field, e.target.value)}
                          />
                          {errors.address?.[field] && (
                            <div className="text-danger mt-1">{errors.address[field]}</div>
                          )}
                        </CCol>
                      ))}
                    </CRow>
                  ))}
              </CCol>
            </CRow>
          </div>
        )}




    {/* SECTION: Symptoms */}
   {/* ==================== Symptoms & Attachment Sections ==================== */}
{visitType !== 'followup' && (
  <>
    {/* SECTION: Symptoms */}
    <h5 className="mb-3 border-bottom pb-2">Symptoms (optional)</h5>
    <CRow className="mb-4">
    <CCol md={5}>
  <h6>Symptoms/Problem</h6>
  <CFormTextarea
    name="problem"
    value={bookingDetails.problem}
    onChange={handleBookingChange}
    minLength={5}   // ✅ Minimum 5 characters
    maxLength={300} // ✅ Maximum 300 characters
  />
</CCol>

     <CCol md={4}>
  <h6>Symptoms/Duration</h6>
  <CFormInput
    type="number"
    name="symptomsDuration"
    value={bookingDetails.symptomsDuration}
    onChange={(e) => {
      const value = e.target.value;
      // Prevent entering 0
      if (value === "0") return;
      setBookingDetails((prev) => ({
        ...prev,
        symptomsDuration: value,
      }));
    }}
    min={1}
    max={365}
  />
</CCol>

      <CCol md={3}>
        <h6>Unit</h6>
        <CFormSelect
          name="unit"
          value={bookingDetails.unit || ''}
          onChange={handleBookingChange}
        >
          <option value="">Select Unit</option>
          <option value="Day">Day</option>
          <option value="Week">Week</option>
          <option value="Month">Month</option>
          <option value="Year">Year</option>
        </CFormSelect>
      </CCol>
    </CRow>

    {/* SECTION: Attachment */}
    <CRow className="mb-3">
      <CCol md={6}>
        <h6>Attachment</h6>
        <CFormInput
          type="file"
          name="attachments"
          multiple
          accept=".jpg,.png,.pdf,.doc,.docx"
          onChange={(e) => {
            const files = Array.from(e.target.files)
            setBookingDetails((prev) => ({
              ...prev,
              attachments: files,
            }))
          }}
        />
      </CCol>
    </CRow>
  </>
)}


    {/* SECTION: Consultation & Payment */}
{visitType !== 'followup' && (
  <>
    <h5 className="mb-3 border-bottom pb-2">Consultation & Payment</h5>
    <CRow className="mb-4 g-3">

      {/* Consultation Fee */}
 <CCol md={4}>
  <h6>Consultation Fee</h6>
  <CFormInput
    type="number"
    value={bookingDetails.consultationFee || 0}
    disabled
  />
</CCol>

<CCol md={4}>
  <h6>Discount Amount</h6>
  <CFormInput
    type="number"
    value={bookingDetails.discountAmount || 0}
    disabled
  />
</CCol>

<CCol md={4}>
  <h6>Discount(%)</h6>
  <CFormInput
    type="number"
    value={bookingDetails.discountPercentage || 0}
    disabled
  />
</CCol>

<CCol md={4}>
  <h6>Total Amount</h6>
  <CFormInput
    type="number"
    value={bookingDetails.totalAmount || 0}
  disabled
  />
</CCol>


      {/* Payment Type */}
      <CCol md={5}>
        <h6>
          Payment Type <span className="text-danger">*</span>
        </h6>
        <CFormSelect
          name="paymentType"
          value={bookingDetails.paymentType}
          onChange={handleBookingChange}
        >
          <option value="">Select Payment Type</option>
          <option value="Cash">Cash</option>
          <option value="Card">Card</option>
          <option value="UPI">UPI</option>
        </CFormSelect>
        {errors.paymentType && (
          <div className="text-danger">{errors.paymentType}</div>
        )}
      </CCol>

      {/* Doctor Referral Code */}
      <CCol md={4}>
        <h6>Doctor Referral Code</h6>
        <CFormInput
          type="text"
          name="doctorRefCode"
          value={bookingDetails.doctorRefCode || ''}
          onChange={handleBookingChange}
          minLength={4}
          maxLength={10}
        />
        {errors.doctorRefCode && (
          <div className="text-danger">{errors.doctorRefCode}</div>
        )}
      </CCol>

    </CRow>

    {/* Buttons */}
    <div className="mt-4 text-end d-flex justify-content-end gap-2">
      <CButton color="secondary" onClick={onClose}>
        Cancel
      </CButton>
      <CButton
        onClick={handleSubmit}
        style={{ backgroundColor: 'var(--color-bgcolor)', color: 'var(--color-black)' }}
      >
        Submit
      </CButton>
    </div>
  </>
)}



{visitType === 'followup' && (appointmentType === 'services' || appointmentType === 'inclinic') && (
  <div className="followup-ui p-3 border rounded bg-light">

    {/* ==================== HEADER ==================== */}
    

    {/* ==================== SUBMIT / CANCEL BUTTONS ==================== */}
  <div className="mt-4 text-end d-flex justify-content-end gap-2">
  <CButton color="secondary" onClick={onClose}>
    Cancel
  </CButton>

  {appointmentType === 'services' && visitType !== 'followup' && (
    <CButton
      onClick={handleServicesSubmit}
      style={{ backgroundColor: 'var(--color-bgcolor)', color: 'var(--color-black)' }}
    >
      Submit
    </CButton>
  )}
   {appointmentType === 'services' && visitType === 'followup' && (
    <CButton
      onClick={handleFollowupServicesSubmit }
      style={{ backgroundColor: 'var(--color-bgcolor)', color: 'var(--color-black)' }}
    >
      Submit
    </CButton>
  )}

  {appointmentType === 'inclinic' && (
    <CButton
      onClick={handleInClinicSubmit}
      style={{ backgroundColor: 'var(--color-bgcolor)', color: 'var(--color-black)' }}
    >
      Submit
    </CButton>
  )}

  {appointmentType === 'online' && (
    <CButton
      onClick={handleOnlineSubmit}
      style={{ backgroundColor: 'var(--color-bgcolor)', color: 'var(--color-black)' }}
    >
      Submit
    </CButton>
  )}
</div>

  </div>
)}

 




    {/* SECTION: Submit */}
  

   

  

   

   
   
  




    
  </COffcanvasBody>
</COffcanvas>


  )

  // return (
  //   <CModal alignment="center" visible={visible} onClose={onClose} size="xl">
  //     <CModalHeader>
  //       <CModalTitle>Book Appointment</CModalTitle>
  //     </CModalHeader>
  //     <CModalBody>

  //     </CModalBody>
  //   </CModal>
  // )
}

export default BookAppointmentModal
