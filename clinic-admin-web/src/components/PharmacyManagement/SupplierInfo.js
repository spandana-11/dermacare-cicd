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
  }

  const updateContact = (field, value) => {
    setForm((prev) => ({
      ...prev,
      contactDetails: {
        ...prev.contactDetails,
        [field]: value,
      },
    }))
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

          <CFormLabel>Supplier Name *</CFormLabel>
          <CFormInput
            value={form.supplierName}
            onChange={(e) => updateForm('supplierName', e.target.value)}
          />

          <CFormLabel className="mt-2">GST No</CFormLabel>
          <CFormInput
            value={form.gstNumber}
            onChange={(e) => updateForm('gstNumber', e.target.value)}
          />

          <CFormLabel className="mt-2">APGST / Reg No</CFormLabel>
          <CFormInput
            value={form.registrationNumber}
            onChange={(e) => updateForm('registrationNumber', e.target.value)}
          />

          <CFormLabel className="mt-2">CST No</CFormLabel>
          <CFormInput
            value={form.cstNumber}
            onChange={(e) => updateForm('cstNumber', e.target.value)}
          />
          <CFormLabel className="mt-2">Form 20B</CFormLabel>
          <CFormInput
            value={form.form20B}
            onChange={(e) => updateForm('form20B', e.target.value)}
          />
          <CFormLabel className="mt-2">Form 21B</CFormLabel>
          <CFormInput
            value={form.form21B}
            onChange={(e) => updateForm('form21B', e.target.value)}
          />

          <CFormLabel className="mt-2">Address</CFormLabel>
          <CFormTextarea
            rows={3}
            value={form.address}
            onChange={(e) => updateForm('address', e.target.value)}
          />

          <CFormLabel className="fw-bold mb-0" style={{ width: 130 }}>
            City
          </CFormLabel>
          <CFormSelect
            onChange={(e) => handleCityChange(e.target.value)}
            value={cities.find((c) => c.cityName === form.city)?.id || ''}
          >
            <option value="">Select City</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.cityName}
              </option>
            ))}
          </CFormSelect>

          <CButton className="mt-1" size="sm" onClick={() => setShowCityModal(true)}>
            New
          </CButton>

          <CFormLabel className="mt-3">Area</CFormLabel>
          <CFormSelect
            value={form.area}
            onChange={(e) => setForm((prev) => ({ ...prev, area: e.target.value }))}
          >
            <option value="">Select Area</option>
            {areas.map((a, i) => (
              <option key={i} value={a}>
                {a}
              </option>
            ))}
          </CFormSelect>

          <CButton className="mt-1" size="sm" onClick={() => setShowAreaModal(true)}>
            New
          </CButton>
        </div>

        {/* RIGHT BOX */}
        <div className="flex-fill border p-3 rounded">
          <h6 className="fw-bold">Contact Details</h6>

          <CFormLabel>State</CFormLabel>
          <CFormInput
            value={form.contactDetails.state}
            onChange={(e) => updateContact('state', e.target.value)}
          />

          <CFormLabel className="mt-2">Zip Code</CFormLabel>
          <CFormInput
            value={form.contactDetails.zipCode}
            onChange={(e) => updateContact('zipCode', e.target.value)}
          />

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

          <CFormLabel className="mt-2">Contact Person</CFormLabel>
          <CFormInput
            value={form.contactDetails.contactPerson}
            onChange={(e) => updateContact('contactPerson', e.target.value)}
          />

          <CFormLabel className="mt-2">Mobile Number 1</CFormLabel>
          <CFormInput
            value={form.contactDetails.mobileNumber1}
            onChange={(e) => updateContact('mobileNumber1', e.target.value)}
          />

          <CFormLabel className="mt-2">Mobile Number 2</CFormLabel>
          <CFormInput
            value={form.contactDetails.mobileNumber2}
            onChange={(e) => updateContact('mobileNumber2', e.target.value)}
          />

          <CFormLabel className="mt-2">Designation</CFormLabel>
          <CFormInput
            value={form.contactDetails.designation}
            onChange={(e) => updateContact('designation', e.target.value)}
          />

          <CFormLabel className="mt-2">Department</CFormLabel>
          <CFormInput
            value={form.contactDetails.department}
            onChange={(e) => updateContact('department', e.target.value)}
          />

          <CFormLabel className="mt-2">Website</CFormLabel>
          <CFormInput
            value={form.contactDetails.website}
            onChange={(e) => updateContact('website', e.target.value)}
          />

          <CFormLabel className="mt-2">Email</CFormLabel>
          <CFormInput
            value={form.contactDetails.email}
            onChange={(e) => updateContact('email', e.target.value)}
          />
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
        <CFormLabel className="fw-bold me-2 mb-0">Search</CFormLabel>

        <CFormInput
          type="text"
          placeholder="Search here..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '160px', height: '25px', padding: '0 5px' }}
          className="me-3"
        />

        <CIcon
          icon={cilSave}
          size="lg"
          className="mx-1"
          style={{ cursor: 'pointer' }}
          onClick={handleFinalSave}
        />
        <CIcon icon={cilPrint} size="lg" className="mx-1" style={{ cursor: 'pointer' }} />
        <CIcon icon={cilMagnifyingGlass} size="lg" className="mx-1" style={{ cursor: 'pointer' }} />
      </div>

      {/* CITY MODAL */}
      <CModal visible={showCityModal} onClose={() => setShowCityModal(false)}>
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
          <CButton onClick={handleAddCity}>Save</CButton>
        </CModalFooter>
      </CModal>

      {/* AREA MODAL */}
      <CModal visible={showAreaModal} onClose={() => setShowAreaModal(false)}>
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
          <CButton onClick={handleAddArea}>Save</CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default SupplierInfo
