import React, { useState, useEffect } from 'react'
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
  CCardBody
} from '@coreui/react'

import { GetClinicBranches } from '../Doctors/DoctorAPI'

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
  branchId: localStorage.getItem('branchId'),
  clinicId: localStorage.getItem('HospitalId'),
  bookingFor: 'Self',
  name: '',
   dob: '',  
  patientMobileNumber: '',
  age: '',
  gender: '',
  branchname: '',
  doctorName: '',
  categoryName: '',
  serviceName: '',
  subServiceName: '',
  serviceDate: '',
  servicetime: '',
  notes: '',
  doctorRefCode: '',
  consultationFee:0.0,
  totalFee:0.0,
  address: {            
    houseNo: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  }
})

  const [errors, setErrors] = useState({})
 const handlePatientSearch = (e) => {
  const query = e.target.value;
  setPatientSearch(query);

  if (query.trim() === "") {
    setFilteredPatients([]);
    return;
  }

  const filtered = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(query.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(query.toLowerCase()) ||
      patient.mobileNumber.includes(query)
  );

  setFilteredPatients(filtered);
};
const formatDate = (date) => {
  if (!date) return null
  const d = new Date(date)
  if (isNaN(d)) return null
  return d.toISOString().split('T')[0] // 'yyyy-mm-dd'
}
// 'yyyy-mm-dd'


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
  consultationFee: subServiceInfo.consultationFee || 0,
}));// Reset fee
    return;
  }

  const fetchSubServiceInfo = async () => {
    try {
      const url = `${wifiUrl}/api/customer/getSubServiceInfo/${selectedSubService}`;
      console.log("Fetching sub-service info from URL:", url);

      const res = await axios.get(url);
      console.log("Sub-service API response:", res.data);

      const subServiceInfo = res.data?.data || {};
      
      // Update the consultation fee in bookingDetails
      setBookingDetails(prev => ({
        ...prev,
        consultationFee: subServiceInfo.consultationFee || 0, // Assuming API returns `consultationFee`
      }));

      // Optionally, store other sub-service info if needed
      setSubServices([subServiceInfo]);

    } catch (err) {
      console.error("Error fetching sub-service info:", err);
      setSubServices([]);
      setBookingDetails(prev => ({ ...prev, consultationFee: '' }));
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

    // If DOB changes, calculate age
    if (name === "dob" && value) {
      const today = new Date();
      const dob = new Date(value);
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      updatedDetails.age = age;
    }

    return updatedDetails;
  });

  // Remove errors if user selects DOB or age is now valid
  setErrors((prev) => {
    const updatedErrors = { ...prev };
    if (name === "dob") delete updatedErrors.dob;
    if (name === "dob") delete updatedErrors.age; // remove age error since it will auto-populate
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

  if (!bookingDetails.patientId?.trim()) {
  newErrors.patientId = 'Patient ID is required.';
} else if (bookingDetails.patientId.length < 3 || bookingDetails.patientId.length > 20) {
  newErrors.patientId = 'Patient ID must be 3-20 characters.';
}
  

  // Address
  if (!bookingDetails.patientAddress?.trim())
    newErrors.patientAddress = 'Address is required.';
  else if (bookingDetails.patientAddress.length < 5 || bookingDetails.patientAddress.length > 200)
    newErrors.patientAddress = 'Address must be 5-200 characters.';

  // Mobile Number
  if (!bookingDetails.patientMobileNumber?.trim())
    newErrors.patientMobileNumber = 'Mobile number is required.';
  else if (!/^[6-9]\d{9}$/.test(bookingDetails.patientMobileNumber))
    newErrors.patientMobileNumber = 'Enter a valid 10-digit mobile number starting with 6-9.';

  // Age
  if (!bookingDetails.age) newErrors.age = 'Age is required.';
  else if (bookingDetails.age < 0 || bookingDetails.age > 120)
    newErrors.age = 'Age must be between 0 and 120.';

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
  if (!bookingDetails.slot) newErrors.slot = 'Please select a slot.';


 

  // Consultation & Payment
 // Consultation Fee
const fee = Number(subServiceInfo.consultationFee);

if (!bookingDetails.consultationFee) {
  newErrors.consultationFee = 'Consultation Fee is required.';
} else if (isNaN(fee) || fee <= 0) {
  newErrors.consultationFee = 'Consultation Fee must be greater than zero.';
} else if (fee > 100000) {
  newErrors.consultationFee = 'Consultation Fee cannot exceed 100,000.';
}



const discountAmount = Number(bookingDetails.discountAmount);

if (bookingDetails.discountAmount === '' || bookingDetails.discountAmount === null) {
  newErrors.discountAmount = 'Discount amount is required.';

} else if (discountAmount < 0) {
  newErrors.discountAmount = 'Discount cannot be negative.';
} else if (discountAmount > 50000) {
  newErrors.discountAmount = 'Discount cannot exceed 50,000.';
}


  // Total Amount Validation
 const totalAmount = Number(bookingDetails.totalAmount);

if (bookingDetails.totalAmount === '' || bookingDetails.totalAmount === null) {
  newErrors.totalAmount = 'Total amount is required.';
} else if (isNaN(totalAmount)) {
  newErrors.totalAmount = 'Total amount must be a number.';
} else if (totalAmount < 0) {
  newErrors.totalAmount = 'Total Amount cannot be negative.';
} else if (totalAmount > 200000) {
  newErrors.totalAmount = 'Total Amount cannot exceed 200,000.';
}

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



const handleSubmit = () => {
  if (validate()) {
    // Convert address object to JSON string
    const payload = {
      ...bookingDetails,
      patientAddress: JSON.stringify(bookingDetails.address), // send as string
    };

    console.log('Submitting booking details:', payload);

    // Example API call
    axios.post(`${wifiUrl}/api/customer/bookService`, payload)
      .then((res) => {
        console.log('Booking submitted successfully:', res.data);
      })
      .catch((err) => {
        console.error('Error submitting booking:', err);
      });
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
                  onChange={() => setAppointmentType('services')}
                />
              </CCol>
              <CCol md={4}>
                <CFormCheck
                  type="radio"
                  label="In-Clinic"
                  name="appointmentTypeRadio"
                  value="inclinic"
                  checked={appointmentType === 'inclinic'}
                  onChange={() => setAppointmentType('inclinic')}
                />
              </CCol>
              <CCol md={4}>
                <CFormCheck
                  type="radio"
                  label="Online"
                  name="appointmentTypeRadio"
                  value="online"
                  checked={appointmentType === 'online'}
                  onChange={() => setAppointmentType('online')}
                />
              </CCol>
            </CRow>
          </div>
        )}
    {visitType === 'followup' && (
  <CRow className="mb-4">  {/* increased from mb-3 to mb-4 for more gap */}
  <CCol md={10}>
    <CFormInput
      type="text"
      placeholder="Search by Name / Patient ID / Mobile"
      value={patientSearch}
      onChange={(e) => setPatientSearch(e.target.value)}
    />
  </CCol>
  <CCol md={2}>
    <CButton color="primary" onClick={handlePatientSearch}>
      Search
    </CButton>
  </CCol>
</CRow>

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
      const value = e.target.value;
      setSelectedCategory(value);

      // Remove error when a value is selected
      setErrors((prev) => ({
        ...prev,
        selectedCategory: value ? '' : prev.selectedCategory,
      }));
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
    console.log("Selected service ID:", e.target.value); // <-- check here
    setSelectedService(e.target.value);
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
    Procedure Name<span className="text-danger">*</span>
  </h6>
 <CFormSelect
  value={selectedSubService}
  onChange={(e) => setSelectedSubService(e.target.value)}
  disabled={!selectedService || subServices.length === 0}
>
  <option value="">Select Sub-Service</option>
  {subServices.map((sub) => (
    <option key={sub.subServiceId} value={sub.subServiceId}>
      {sub.subServiceName}
    </option>
  ))}
</CFormSelect>



  {errors.selectedSubService && (
    <div className="text-danger mt-1">{errors.selectedSubService}</div>
  )}
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
                    const selectedBranch = branches.find(
                      (branch) => branch.branchId === e.target.value,
                    )

                    setBookingDetails((prev) => ({
                      ...prev,
                      branchId: selectedBranch?.branchId || '',
                      branchname: selectedBranch?.branchName || '',
                    }))

                    // Clear error only if a valid branch is selected
                    if (selectedBranch) {
                      setErrors((prev) => ({ ...prev, branchname: '' }))
                    }
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
                  value={bookingDetails.doctorName || ''}
                  onChange={(e) => {
                    const selectedDoctorId = e.target.value

                    setBookingDetails((prev) => ({
                      ...prev,
                      doctorName: selectedDoctorId, // store doctorId
                    }))

                    // clear any slot selection
                    setBookingDetails((prev) => ({ ...prev, slot: '' }))

                    // fetch slots for that doctor
                    if (selectedDoctorId) {
                      fetchSlots(selectedDoctorId)
                    }

                    if (errors.doctorName) {
                      setErrors((prev) => ({ ...prev, doctorName: '' }))
                    }
                  }}
                  disabled={loadingDoctors}
                  required
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((doc) => (
                    <option key={doc.doctorId} value={doc.doctorId}>
                      {doc.doctorName || doc.doctorEmail}
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
          onClick={() => setSelectedDate(dateValue)}
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
                  gridTemplateColumns: 'repeat(6, 1fr)', // 6 slots per row
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
                        if (isSelectedSlot) {
                          setSelectedSlots(prev =>
                            prev.filter(s => s !== slotLabel)
                          )
                        } else {
                          setSelectedSlots(prev => [...prev, slotLabel])
                        }
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
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.dob && <p className="text-danger">{errors.dob}</p>}
              </CCol>

              {/* Age */}
              <CCol md={2} className="mb-3">
                <h6>
                  Age <span className="text-danger">*</span>
                </h6>
                <CFormInput
                  type="number"
                  name="age"
                  value={bookingDetails.age || ''}
                  onChange={handleBookingChange}
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
    {/* ==================== Consultation & Payment ==================== */}
{visitType !== 'followup' && (
  <>
    <h5 className="mb-3 border-bottom pb-2">Consultation & Payment</h5>
    <CRow className="mb-4 g-3">

      {/* Consultation Fee */}
   <CCol md={4}>
    <h6>Consultation Fee</h6>
    <CFormInput
      type="number"
      value={bookingDetails.consultationFee }
      readOnly
    />
  </CCol>


      {/* Discount Amount */}
      <CCol md={4}>
        <h6>
          Discount Amount 
        </h6>
        <CFormInput
          type="number"
          name="discountAmount"
          value={bookingDetails.discountAmount || ''}
          onChange={handleBookingChange}
          min={0}
          max={50000}
        />
        {errors.discountAmount && (
          <div className="text-danger">{errors.discountAmount}</div>
        )}
      </CCol>

      {/* Total Amount */}
      <CCol md={4}>
        <h6>
          Total Amount <span className="text-danger">*</span>
        </h6>
        <CFormInput
          type="number"
          name="totalAmount"
          value={bookingDetails.totalAmount || ''}
          onChange={handleBookingChange}
          min={0}
          max={200000}
        />
        {errors.totalAmount && (
          <div className="text-danger">{errors.totalAmount}</div>
        )}
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
