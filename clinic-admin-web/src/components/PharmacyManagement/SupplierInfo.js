import React, { useEffect, useState, useCallback } from 'react'
import {
  CCard,
  CCardBody,
  CRow,
  CCol,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormCheck,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CFormTextarea,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMagnifyingGlass, cilPrint, cilSave } from '@coreui/icons'

import { showCustomToast } from '../../Utils/Toaster'
import { SupplierData, postSupplierData } from '../PharmacyManagement/SupplierInfoAPI'
import { Citydata, postCityData } from './CityAPIs'
import { Areadata, getAreabyCityId, postAreaData } from './AreaAPI'

const SupplierInfo = () => {
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [cities, setCities] = useState([])
  const [areas, setAreas] = useState([])
  const [supplierData, setSupplierData] = useState([])
  const [error, setError] = useState([])
  const [showCityModal, setShowCityModal] = useState(false)
  const [showAreaModal, setShowAreaModal] = useState(false)

  const [newCityName, setNewCityName] = useState('')
  const [newAreaName, setNewAreaName] = useState('')

  const [newArea, setNewArea] = useState('') // input for new area
  const [currentDate, setCurrentDate] = useState('')
  const [currentTime, setCurrentTime] = useState('')

  // ---------- FORM STATE ----------
  const [form, setForm] = useState({
    supplierName: '',
    gstNumber: '',
    registrationNumber: '',
    cstNumber: '',
    tinNumber: '',
    form20B: '',
    form21B: '',
    address: '',
    city: '',
    area: '',
    nonLocalSupplier: false,
    active: true,

    contactDetails: {
      state: '',
      zipCode: '',
      telephoneNumber: '',
      faxNumber: '',
      contactPerson: '',
      mobileNumber1: '',
      mobileNumber2: '',
      designation: '',
      department: '',
      website: '',
      email: '',
    },
  })

  // ---------- HANDLE INPUT CHANGE ----------
  const updateForm = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
    //  NEW: Clear the specific error when the field is updated
    setError((prevErrors) => {
      const newErrors = { ...prevErrors }
      delete newErrors[field]
      return newErrors
    })
  }

  const updateContact = (field, value) => {
    setForm((prev) => ({
      ...prev,
      contactDetails: {
        ...prev.contactDetails,
        [field]: value,
      },
    }))
    setError((prevErrors) => {
      const newErrors = { ...prevErrors }
      delete newErrors[field] // Note: The errors object uses the flat field name (e.g., 'state', not 'contactDetails.state')
      return newErrors
    })
  }

  // ---------- FETCH SUPPLIERS ----------
  const fetchSupplier = useCallback(async () => {
    try {
      const data = await SupplierData()
      setSupplierData(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching suppliers:', err)
    }
  }, [])

  useEffect(() => {
    fetchSupplier()
  }, [fetchSupplier])

  // ---------- FETCH CITIES ----------
  useEffect(() => {
    const loadCities = async () => {
      try {
        const data = await Citydata()
        setCities(data || [])
      } catch (e) {
        console.error('Error loading cities:', e)
      }
    }
    loadCities()
  }, [])

  // ---------- DATE & TIME ----------
  useEffect(() => {
    const now = new Date()
    setCurrentDate(now.toISOString().split('T')[0])
    setCurrentTime(now.toTimeString().slice(0, 5))
  }, [])

  // ---------- ON CITY CHANGE ----------
  const handleCityChange = async (cityId) => {
    console.log('Selected cityId:', cityId)
    const selectedCityObj = cities.find((c) => c.id === cityId)
    console.log('Selected city object:', selectedCityObj)

    setForm((prev) => ({
      ...prev,
      city: selectedCityObj?.cityName || '',
      area: '', // reset area when city changes
    }))
    setError((prevErrors) => {
      const newErrors = { ...prevErrors }
      delete newErrors.city
      delete newErrors.area
      return newErrors
    })
    if (selectedCityObj) {
      try {
        const areaResponse = await getAreabyCityId(selectedCityObj.id)
        console.log('Fetched area response:', areaResponse)

        // ✅ backend returns { success, data: { areaNames: [...] } }
        setAreas(areaResponse?.data?.areaNames || [])
      } catch (error) {
        console.error('Error fetching areas:', error)
        setAreas([])
      }
    } else {
      setAreas([])
    }
  }

  // ---------- SAVE SUPPLIER ----------
  const handleFinalSave = async () => {
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setError(errors)
      showCustomToast('Please fill all required fields', 'error')
      return
    }
    const payload = { ...form }

    try {
      const res = await postSupplierData(payload)
      showCustomToast('Supplier Added Successfully', 'success')

      fetchSupplier()

      // RESET FORM
      setForm({
        supplierName: '',
        gstNumber: '',
        registrationNumber: '',
        cstNumber: '',
        tinNumber: '',
        form20B: '',
        form21B: '',
        address: '',
        city: '',
        area: '',
        nonLocalSupplier: false,
        active: true,
        contactDetails: {
          state: '',
          zipCode: '',
          telephoneNumber: '',
          faxNumber: '',
          contactPerson: '',
          mobileNumber1: '',
          mobileNumber2: '',
          designation: '',
          department: '',
          website: '',
          email: '',
        },
      })
    } catch (error) {
      console.error('Save failed:', error)
      showCustomToast('Failed to Save', 'error')
    }
  }

  // ---------- ADD NEW CITY ----------
  const handleAddCity = async () => {
    if (!newCityName.trim()) {
      showCustomToast('City name is required', 'error')
      return
    }

    const response = await postCityData({ cityName: newCityName.trim() })
    const addedCity = response?.data

    showCustomToast('City Added', 'success')

    // reload all cities so they include id + cityName
    const allCities = await Citydata()
    setCities(allCities)

    // set form to new cityName
    setForm((prev) => ({
      ...prev,
      city: addedCity.cityName,
      area: '',
    }))

    setNewCityName('')
    setShowCityModal(false)
  }

  // ---------- ADD NEW AREA ----------
  const handleAddArea = async () => {
    if (!newAreaName.trim()) {
      showCustomToast('Area name is required', 'error')
      return
    }

    const cityObj = cities.find((c) => c.cityName === form.city)
    if (!cityObj) {
      showCustomToast('Select a city first', 'error')
      return
    }

    await postAreaData({
      cityId: cityObj.id,
      cityName: cityObj.cityName,
      areaNames: [newAreaName.trim()], // ✅ array of strings
    })

    showCustomToast('Area Added', 'success')

    // ✅ fetch updated areas from backend
    const areaResponse = await getAreabyCityId(cityObj.id)
    setAreas(areaResponse?.data?.areaNames || [])

    // ✅ auto-select the new area
    setForm((prev) => ({
      ...prev,
      area: newAreaName.trim(),
    }))

    setNewAreaName('')
    setShowAreaModal(false)
  }
 const validateForm = () => {
  const errors = {};
  const mobileRegex = /^[6-9]\d{9}$/;

  if (!form.supplierName?.trim()) errors.supplierName = 'Supplier Name is required';
  if (!form.gstNumber?.trim()) errors.gstNumber = 'GST Number is required';
  if (!form.registrationNumber?.trim())
    errors.registrationNumber = 'Registration Number is required';
  
  if (!form.form20B?.trim()) errors.form20B = 'Form 20B is required';
  if (!form.cstNumber?.trim()) errors.cstNumber = 'CST number is required';
  if (!form.form21B?.trim()) errors.form21B = 'Form 21B is required';
  if (!form.address?.trim()) errors.address = 'Address is required';
  if (!form.city?.trim()) errors.city = 'City is required';
  if (!form.area?.trim()) errors.area = 'Area is required';

  // Contact Person
  if (!form.contactDetails?.contactPerson?.trim()) {
    errors.contactPerson = 'Contact Person is required';
  }

  // ✅ Mobile Number 1 (REQUIRED)
  if (!form.contactDetails?.mobileNumber1?.trim()) {
    errors.mobileNumber1 = 'Mobile number is required';
  } else if (!mobileRegex.test(form.contactDetails.mobileNumber1)) {
    errors.mobileNumber1 = 'Enter a valid 10-digit mobile number';
  }

  // Mobile Number 2 (OPTIONAL)
  if (form.contactDetails?.mobileNumber2?.trim()) {
    if (!mobileRegex.test(form.contactDetails.mobileNumber2)) {
      errors.mobileNumber2 = 'Enter a valid 10-digit mobile number';
    }
  }

  // Email
  if (!form.contactDetails?.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(form.contactDetails.email)) {
    errors.email = 'Invalid email format';
  }

  return errors;
};


  return (
    <div
      style={{
        border: '1px solid #9b9fa4ff',
        borderRadius: 6,
        padding: '10px',
        color: 'var(--color-black)',
        // backgroundColor: 'var(--color-bgcolor)',
      }}
    >
      {/* ---------- SUPPLIER DETAILS BOX ---------- */}
      <div className="d-flex flex-wrap justify-content-between align-items-center ">
        <div className="d-flex align-items-center gap-2 ms-auto mb-3">
          {/* Date */}
          <div className="d-flex align-items-center gap-1">
            <label className="small fw-bold mb-0">Date</label>
            <div className="position-relative">
              <CFormInput
                type="date"
                size="sm"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                style={{ color: 'var(--color-black)', width: 150 }}
              />

              {/* Calendar Icon */}
              <i
                className="bi bi-calendar3 position-absolute"
                style={{
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  fontSize: '14px',
                }}
              ></i>
            </div>
          </div>

          {/* Time */}
          <div className="d-flex align-items-center gap-1">
            <label className="small fw-bold mb-0">Time</label>
            <div className="position-relative">
              <CFormInput
                type="time"
                size="sm"
                value={currentTime}
                onChange={(e) => setCurrentTime(e.target.value)}
                style={{ color: 'var(--color-black)', width: 130 }}
              />

              {/* Time Icon */}
              <i
                className="bi bi-clock position-absolute"
                style={{
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  fontSize: '14px',
                }}
              ></i>
            </div>
          </div>
        </div>
      </div>
      <div className="d-flex gap-3">
        {/* LEFT BOX */}
        <div className="flex-fill border p-3 rounded">
          <h6 className="fw-bold">Supplier Details</h6>
          <CFormLabel>
            Supplier Name <span className="text-danger">*</span>
          </CFormLabel>
          <CFormInput
            value={form.supplierName}
            onChange={(e) => updateForm('supplierName', e.target.value)}
            invalid={!!error.supplierName}
          />
          {error.supplierName && <div className="invalid-feedback">{error.supplierName}</div>}
          <CFormLabel className="mt-2">
            GST No <span className="text-danger">*</span>
          </CFormLabel>
          <CFormInput
            value={form.gstNumber}
            onChange={(e) => updateForm('gstNumber', e.target.value)}
            invalid={!!error.gstNumber}
          />
          {error.gstNumber && <div className="invalid-feedback">{error.gstNumber}</div>}
          <CFormLabel className="mt-2">
             Reg No <span className="text-danger">*</span>
          </CFormLabel>
          <CFormInput
            value={form.registrationNumber}
            onChange={(e) => updateForm('registrationNumber', e.target.value)}
            invalid={!!error.registrationNumber}
          />
          {error.registrationNumber && (
            <div className="invalid-feedback">{error.registrationNumber}</div>
          )}
          <CFormLabel className="mt-2">
            CST No <span className="text-danger">*</span>
          </CFormLabel>
          <CFormInput
            value={form.cstNumber}
            onChange={(e) => updateForm('cstNumber', e.target.value)}
            invalid={!!error.cstNumber}
          />
          {error.cstNumber && <div className="invalid-feedback">{error.cstNumber}</div>}
          <CFormLabel className="mt-2">TIN No</CFormLabel>
          <CFormInput
            value={form.tinNumber}
            onChange={(e) => updateForm('tinNumber', e.target.value)}
            // Since it's optional, only apply invalid style if we add a format validation
            invalid={!!error.tinNumber}
          />
          {error.tinNumber && <div className="invalid-feedback">{error.tinNumber}</div>}
          <CFormLabel className="mt-2">
            Form 20B <span className="text-danger">*</span>
          </CFormLabel>
          <CFormInput
            value={form.form20B}
            onChange={(e) => updateForm('form20B', e.target.value)}
            invalid={!!error.form20B}
          />
          {error.form20B && <div className="invalid-feedback">{error.form20B}</div>}
          <CFormLabel className="mt-2">
            Form 21B <span className="text-danger">*</span>
          </CFormLabel>
          <CFormInput
            value={form.form21B}
            onChange={(e) => updateForm('form21B', e.target.value)}
            invalid={!!error.form21B}
          />
          {error.form21B && <div className="invalid-feedback">{error.form21B}</div>}
          <CFormLabel className="mt-2">
            Address <span className="text-danger">*</span>
          </CFormLabel>
          <CFormTextarea
            rows={3}
            value={form.address}
            onChange={(e) => updateForm('address', e.target.value)}
            invalid={!!error.address} // <-- ADDED
          />
          {error.address && <div className="invalid-feedback">{error.address}</div>}{' '}
          {/* <-- ADDED */}
          <CFormLabel className="fw-bold mb-0" style={{ width: 130 }}>
            City <span className="text-danger">*</span>
          </CFormLabel>
          <div className="d-flex align-items-start gap-2">
            <CFormSelect
              onChange={(e) => handleCityChange(e.target.value)}
              value={cities.find((c) => c.cityName === form.city)?.id || ''}
              invalid={!!error.city}
            >
              <option value="">Select City</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.cityName}
                </option>
              ))}
            </CFormSelect>

            <CButton
              size="sm"
              onClick={() => setShowCityModal(true)}
              style={{
                color: 'var(--color-black)',
                backgroundColor: 'var(--color-bgcolor)',
              }}
            >
              New
            </CButton>
          </div>
          {error.city && <div className="invalid-feedback d-block">{error.city}</div>}
          <CFormLabel className="fw-bold mb-0" style={{ width: 130 }}>
            Area <span className="text-danger">*</span>
          </CFormLabel>
          <div className="d-flex align-items-start gap-2">
            <CFormSelect
              value={form.area}
              onChange={(e) => setForm((prev) => ({ ...prev, area: e.target.value }))}
              invalid={!!error.area} // <-- ADDED
            >
              <option value="">Select Area</option>
              {areas.map((a, i) => (
                <option key={i} value={a}>
                  {a}
                </option>
              ))}
            </CFormSelect>
            <CButton
              className="mt-1"
              size="sm"
              onClick={() => setShowAreaModal(true)}
              style={{
                color: 'var(--color-black)',
                backgroundColor: 'var(--color-bgcolor)',
              }}
            >
              New
            </CButton>
          </div>
          {error.area && <div className="invalid-feedback">{error.area}</div>} {/* <-- ADDED */}
        </div>

        {/* RIGHT BOX */}
        <div className="flex-fill border p-3 rounded">
          <h6 className="fw-bold">
            Contact Details 
          </h6>
          <CFormLabel>State</CFormLabel>
          <CFormInput
            value={form.contactDetails.state}
            onChange={(e) => updateContact('state', e.target.value)}
            // invalid={!!error.state} // <-- ADDED
          />
          <CFormLabel className="mt-2">Zip Code</CFormLabel>
          <CFormInput
            value={form.contactDetails.zipCode}
            onChange={(e) => updateContact('zipCode', e.target.value)}
            // invalid={!!error.zipCode} // <-- ADDED
          />
          {/* <-- ADDED */}
          <CFormLabel className="mt-2">Telephone</CFormLabel>
          <CFormInput
            value={form.contactDetails.telephoneNumber}
            onChange={(e) => updateContact('telephoneNumber', e.target.value)}
          />
          <CFormLabel className="mt-2">Fax</CFormLabel>
          <CFormInput
            value={form.contactDetails.faxNumber}
            onChange={(e) => updateContact('faxNumber', e.target.value)}
          />
          <CFormLabel className="mt-2">
            Contact Person <span className="text-danger">*</span>
          </CFormLabel>
          <CFormInput
            value={form.contactDetails.contactPerson}
            onChange={(e) => updateContact('contactPerson', e.target.value)}
            invalid={!!error.contactPerson} // <-- ADDED
          />
          {error.contactPerson && <div className="invalid-feedback">{error.contactPerson}</div>}{' '}
          {/* <-- ADDED */}
          <CFormLabel className="mt-2">
            Mobile Number 1 <span className="text-danger">*</span>
          </CFormLabel>
       <CFormInput
  type="text"
  value={form.contactDetails.mobileNumber1}
  maxLength={10}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, '');

    setForm((prev) => ({
      ...prev,
      contactDetails: {
        ...prev.contactDetails,
        mobileNumber1: value,
      },
    }));
  }}
/>

{/* ✅ THIS IS REQUIRED */}
{error.mobileNumber1 && (
  <div className="text-danger mt-1">{error.mobileNumber1}</div>
)}


          {/* <-- ADDED */}
          <CFormLabel className="mt-2">Mobile Number 2</CFormLabel>
         <CFormInput
  type="text"
  value={form.contactDetails.mobileNumber2}
  maxLength={10}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, ''); // allow only numbers

    setForm((prev) => ({
      ...prev,
      contactDetails: {
        ...prev.contactDetails,
        mobileNumber2: value,
      },
    }));
  }}
/>

          {/* <-- ADDED */}
          <CFormLabel className="mt-2">Designation</CFormLabel>
          <CFormInput
            value={form.contactDetails.designation}
            onChange={(e) => updateContact('designation', e.target.value)}
            invalid={!!error.designation} // <-- ADDED (Based on previous validation logic)
          />
          {error.designation && <div className="invalid-feedback">{error.designation}</div>}{' '}
          {/* <-- ADDED */}
          <CFormLabel className="mt-2">Department</CFormLabel>
          <CFormInput
            value={form.contactDetails.department}
            onChange={(e) => updateContact('department', e.target.value)}
            invalid={!!error.department} // <-- ADDED (Based on previous validation logic)
          />
          {error.department && <div className="invalid-feedback">{error.department}</div>}{' '}
          {/* <-- ADDED */}
          <CFormLabel className="mt-2">Website</CFormLabel>
          <CFormInput
            value={form.contactDetails.website}
            onChange={(e) => updateContact('website', e.target.value)}
            invalid={!!error.website} // <-- ADDED
          />
          {error.website && <div className="invalid-feedback">{error.website}</div>}{' '}
          {/* <-- ADDED */}
          <CFormLabel className="mt-2">
            Email <span className="text-danger">*</span>
          </CFormLabel>
          <CFormInput
            value={form.contactDetails.email}
            onChange={(e) => updateContact('email', e.target.value)}
            invalid={!!error.email} // <-- ADDED
          />
          {error.email && <div className="invalid-feedback">{error.email}</div>} {/* <-- ADDED */}
        </div>
      </div>

      {/* SAVE BUTTON */}
      {/* <CButton className="mt-3" color="primary" onClick={handleFinalSave}>
        Save Supplier
      </CButton> */}
      <div
        className="d-flex align-items-center mt-3"
        style={{
          background: '#E8F3FF',
          padding: '6px 10px',
          borderRadius: '6px',
          border: '1px solid #B5D9FF',
        }}
      >
        {/* <CFormLabel className="fw-bold me-2 mb-0">Search</CFormLabel>

        <CFormInput
          type="text"
          placeholder="Search here..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '160px', height: '25px', padding: '0 5px' }}
          className="me-3"
        /> */}
<div className="d-flex justify-content-end">
  <CButton
    onClick={handleFinalSave}
    style={{
      color: 'var(--color-black)',
      backgroundColor: 'var(--color-bgcolor)',
    }}
  >
    Save
  </CButton>
</div>



        {/* <CIcon icon={cilPrint} size="lg" className="mx-1" style={{ cursor: 'pointer' }} /> */}
        {/* <CIcon icon={cilMagnifyingGlass} size="lg" className="mx-1" style={{ cursor: 'pointer' }} /> */}
      </div>

      {/* CITY MODAL */}
      <CModal visible={showCityModal} onClose={() => setShowCityModal(false)} backdrop="static" >
        <CModalHeader>
          <CModalTitle>Add City</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            placeholder="City Name"
            value={newCityName}
            onChange={(e) => setNewCityName(e.target.value)}
          />
        </CModalBody>
        <CModalFooter>
          <CButton onClick={handleAddCity} style={{backgroundColor:"var(--color-black)" ,color:"white"}}>Save</CButton>
        </CModalFooter>
      </CModal>

      {/* AREA MODAL */}
      <CModal visible={showAreaModal} onClose={() => setShowAreaModal(false)} backdrop="static" >
        <CModalHeader>
          <CModalTitle>Add Area</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            placeholder="Area Name"
            value={newAreaName}
            onChange={(e) => setNewAreaName(e.target.value)}
          />
        </CModalBody>
        <CModalFooter>
          <CButton onClick={handleAddArea} style={{backgroundColor:"var(--color-black)" ,color:"white"}}>Save</CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default SupplierInfo
