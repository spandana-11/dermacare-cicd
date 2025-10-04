import React, { useState, useEffect } from 'react'
import {
  CTabs,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CCard,
  CCardBody,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CFormInput,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormSelect,
  CFormTextarea,
  CRow,
  CCol,
} from '@coreui/react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './PharmacyManagement.css'
import CreatableSelect from 'react-select/creatable'
import {
  addMedicineType,
  deletePrescriptionById,
  getMedicineTypes,
  getPrescriptionsByClinicId,
  saveMedicineTemplate,
  updateMedicine,
} from './PharmacyManagementAPI'
import { Edit2, Eye, Trash2 } from 'lucide-react'

const PharmacyManagement = () => {
  const [activeKey, setActiveKey] = useState(0)
  const [medicines, setMedicines] = useState([])
  const [medicineType, setMedicineType] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [viewModal, setViewModal] = useState(false)
  const [viewData, setViewData] = useState(null)
  const [formErrors, setFormErrors] = useState({})

  const slotOptions = [
    { value: 'morning', label: 'Morning' },
    { value: 'afternoon', label: 'Afternoon' },
    { value: 'evening', label: 'Evening' },
    { value: 'night', label: 'Night' },
    { value: 'NA', label: 'NA' },
  ]

  const initialFormData = {
    id: null,
    serialNumber: '',
    name: '',
    brandName: '',
    manufacturingLicenseNumber: '',
    batchNumber: '',
    dateOfManufacturing: '',
    dateOfExpriy: '',
    nameAndAddressOfTheManufacturer: '',
    stock: 0,
    dose: '',
    medicineType: '',
    duration: '',
    durationUnit: '',
    frequency: '',
    remindWhen: '',
    times: [],
    food: '',
    note: '',
    others: '',
  }

  const [formData, setFormData] = useState(initialFormData)
  const showOthersField = () => {
    return formData.durationUnit === 'Hour' || formData.durationUnit === 'NA'
  }
  // Fetch medicine types
  useEffect(() => {
    const fetchTypes = async () => {
      const clinicId = localStorage.getItem('HospitalId')
      if (!clinicId) return
      const types = await getMedicineTypes(clinicId)
      setMedicineType(types || [])
    }
    fetchTypes()
  }, [])

  // Fetch medicines
  useEffect(() => {
    fetchMedicines()
  }, [])

  const fetchMedicines = async () => {
    const prescriptions = await getPrescriptionsByClinicId()
    if (prescriptions && prescriptions.length > 0) {
      const allMeds = prescriptions.flatMap((p) => p.medicines)
      setMedicines(allMeds)
    } else {
      setMedicines([])
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setFormErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.name?.trim()) errors.name = 'Medicine Name is required'
    if (!formData.dose?.trim()) errors.dose = 'Dosage is required'
    if (!formData.medicineType?.trim()) errors.medicineType = 'Medicine Type is required'
    if (!formData.duration) errors.duration = 'Duration is required'
    if (!formData.durationUnit) errors.durationUnit = 'Unit is required'
    if (!formData.frequency) errors.frequency = 'Frequency is required'
    if (!formData.times || formData.times.filter(Boolean).length === 0)
      errors.times = 'At least one Time Slot is required'
    if (!formData.food) errors.food = 'Food Instructions are required'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return
    try {
      if (formData.id) {
        const updatedMedicine = await updateMedicine(formData.id, formData)
        setMedicines((prev) => prev.map((med) => (med.id === formData.id ? updatedMedicine : med)))
      } else {
        const newMedicine = await saveMedicineTemplate(formData)
        setMedicines((prev) => [...prev, newMedicine])
      }
      setShowModal(false)
      setFormData(initialFormData)
      setFormErrors({})
      fetchMedicines()
    } catch (error) {
      console.error(error)
      toast.error('Failed to save medicine!')
    }
  }

  const handleEdit = (medicine) => {
    setFormData(medicine)
    setShowModal(true)
  }

  const handleView = (medicine) => {
    setViewData(medicine)
    setViewModal(true)
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this medicine?')
    if (!confirmed) return
    const success = await deletePrescriptionById(id)
    if (success) {
      setMedicines((prev) => prev.filter((med) => med.id !== id))
      toast.success('Medicine deleted successfully!')
    } else {
      toast.error('Failed to delete medicine!')
    }
  }

  const handleCreateMedicineType = async (inputValue) => {
    try {
      const clinicId = localStorage.getItem('HospitalId')
      if (!clinicId) return toast.error('Clinic ID missing!')
      const savedType = await addMedicineType({ clinicId, typeName: inputValue })
      if (savedType?.typeName) {
        const newType = savedType.typeName
        if (!medicineType.includes(newType)) setMedicineType((prev) => [...prev, newType])
        handleChange('medicineType', newType)
        toast.success('New medicine type added!')
      }
    } catch (error) {
      console.error(error)
      toast.error('Error adding medicine type!')
    }
  }

  const filteredMedicines = medicines.filter((med) =>
    (med.name || '').toLowerCase().includes(search.toLowerCase()),
  )

  const slotCount = () => {
    switch (formData.frequency) {
      case 'Once a day':
        return 1
      case 'Twice a day':
        return 2
      case 'Thrice a day':
        return 3
      default:
        return 3
    }
  }
  const showFrequencyAndTimes = () => {
    const unit = formData.durationUnit
    return unit !== 'Hour' && unit !== '' && unit !== 'NA'
  }
  const getFrequencyOptions = (unit) => {
    switch (unit) {
      case 'Day':
        return ['Once a day', 'Twice a day', 'Thrice a day']
      case 'Week':
        return ['Once a week', 'Twice a week', 'Thrice a week']
      case 'Month':
        return ['Once a month', 'Twice a month']
      default:
        return ['Once', 'Twice', 'Thrice'] // For custom/other
    }
  }
  const isFrequencyDisabled = () => {
    const unit = formData.durationUnit
    return unit === 'Hour' || unit === 'NA' || !unit
  }

  const isTimeslotDisabled = () => {
    return isFrequencyDisabled() // same logic
  }

  return (
    <div className="pharmacy-management p-4 w-100">
      <h5 className="pm-title mb-4">Pharmacy Management</h5>

      <CTabs activeKey={activeKey}>
        <CNav
          variant="tabs"
          className="pm-tabs"
          style={{ color: 'var(--color-black)', cursor: 'pointer' }}
        >
          <CNavItem>
            <CNavLink
              active={activeKey === 0}
              onClick={() => setActiveKey(0)}
              style={{ color: 'var(--color-black)' }}
            >
              Medicine Template
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={activeKey === 1}
              onClick={() => setActiveKey(1)}
              style={{ color: 'var(--color-black)', cursor: 'pointer' }}
            >
              Inventory
            </CNavLink>
          </CNavItem>
        </CNav>

        <CTabContent className="mt-3 w-100">
          <CTabPane visible={activeKey === 0}>
            <div
              className="mb-3 w-100"
              style={{
                display: 'flex',
                justifyContent: 'end',
                alignContent: 'end',
                alignItems: 'end',
              }}
            >
              <CButton
                style={{
                  color: 'var(--color-black)',
                  backgroundColor: 'var(--color-bgcolor)',
                }}
                onClick={() => {
                  setFormData(initialFormData) // Reset form for adding
                  setFormErrors({}) // Clear previous errors
                  setShowModal(true) // Open modal
                }}
              >
                Add Medicine
              </CButton>
            </div>
            {/* <div className="d-flex align-items-end mb-3 w-100">
              <CButton
                onClick={() => setShowModal(true)}
                style={{
                  height: '40px',
                  lineHeight: '1',
                  padding: '0 12px',
                  whiteSpace: 'nowrap',
                  backgroundColor: '#a5c4d4ff',
                  color: '#7e3a93',
                }}
              >
                Add Medicine
              </CButton>
            </div> */}
            <div className="table-responsive w-100">
              <CTable striped hover responsive bordered className="pink-table w-100">
                <CTableHead>
                  <CTableRow className="text-center">
                    <CTableHeaderCell>S.No</CTableHeaderCell>
                    <CTableHeaderCell>Medicine Name</CTableHeaderCell>
                    <CTableHeaderCell>Dosage</CTableHeaderCell>
                    <CTableHeaderCell>Medicine Type</CTableHeaderCell>
                    <CTableHeaderCell>Duration</CTableHeaderCell>
                    <CTableHeaderCell>Frequency</CTableHeaderCell>
                    <CTableHeaderCell>Time</CTableHeaderCell>
                    <CTableHeaderCell>Instructions</CTableHeaderCell>
                    <CTableHeaderCell>Notes</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>

                <CTableBody className="text-center">
                  {filteredMedicines.length > 0 ? (
                    filteredMedicines.map((med, index) => (
                      <CTableRow key={med.id}>
                        <CTableDataCell>{index + 1}</CTableDataCell> {/* Serial Number */}
                        <CTableDataCell>{med.name}</CTableDataCell>
                        <CTableDataCell>{med.dose}</CTableDataCell>
                        <CTableDataCell>{med.medicineType}</CTableDataCell>
                        <CTableDataCell>
                          {med.duration}{' '}
                          {med.duration > 1
                            ? med.durationUnit.endsWith('s')
                              ? med.durationUnit
                              : `${med.durationUnit}s`
                            : med.durationUnit}
                        </CTableDataCell>
                        <CTableDataCell>{med.remindWhen}</CTableDataCell>
                        <CTableDataCell>{med.times?.join(', ')}</CTableDataCell>
                        <CTableDataCell>{med.food}</CTableDataCell>
                        <CTableDataCell>{med.note}</CTableDataCell>
                        <CTableDataCell className="text-center">
                          {' '}
                          {/* Change from text-end to text-center */}
                          <div className="d-flex justify-content-center gap-2">
                            {/* View */}
                            <button
                              className="actionBtn"
                              onClick={() => handleView(med)}
                              title="View"
                            >
                              <Eye size={18} />
                            </button>

                            {/* Edit */}
                            <button
                              className="actionBtn"
                              onClick={() => handleEdit(med)}
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>

                            {/* Delete */}
                            <button
                              className="actionBtn"
                              onClick={() => handleDelete(med.id)}
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan={10} className="text-center">
                        No data available
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </div>
          </CTabPane>

          <CTabPane
            visible={activeKey === 1}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center', // vertical center
              alignItems: 'center', // horizontal center
              height: '300px', // or 100% if parent has height
              textAlign: 'center',
            }}
          >
            <h3>Inventory</h3>
            <p>In Progress...</p>
          </CTabPane>
        </CTabContent>
      </CTabs>

      {/* Modal for Add/Edit Medicine */}
      <CModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        size="lg"
        className="custom-modal"
        backdrop="static"
      >
        <CModalHeader className="bg-light border-bottom">
          <CModalTitle className="fw-bold">
            {formData.id ? '✏️ Edit Medicine' : '➕ Add Medicine'}
          </CModalTitle>
        </CModalHeader>

        <CModalBody>
          {/* Medicine Info Section */}
          <h6 className="fw-bold mb-3" style={{ color: 'var(--color-black)' }}>
            Medicine Information
          </h6>
          <CRow className="g-3 mb-3">
            <CCol md={6}>
              <CFormInput
                label={
                  <>
                    Medicine Name <span className="text-danger">*</span>
                  </>
                }
                placeholder="Enter medicine name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
              {formErrors.name && <small className="text-danger">{formErrors.name}</small>}
            </CCol>
            <CCol md={6}>
              <CFormInput
                label={
                  <>
                    Dosage <span className="text-danger">*</span>
                  </>
                }
                placeholder="100mg or Pea-sized"
                value={formData.dose}
                onChange={(e) => handleChange('dose', e.target.value)}
              />
              {formErrors.dose && <small className="text-danger">{formErrors.dose}</small>}
            </CCol>
            <CCol md={6}>
              <label className="form-label">
                Medicine Type<span className="text-danger">*</span>
              </label>
              <CreatableSelect
                isClearable
                options={medicineType.map((t) => ({ label: t, value: t }))}
                value={
                  formData.medicineType
                    ? { label: formData.medicineType, value: formData.medicineType }
                    : null
                }
                onChange={(selected) =>
                  handleChange('medicineType', selected ? selected.value : '')
                }
                onCreateOption={handleCreateMedicineType}
                placeholder="Choose or create type..."
              />
              {formErrors.medicineType && (
                <small className="text-danger">{formErrors.medicineType}</small>
              )}
            </CCol>
          </CRow>

          {/* Prescription Section */}
          <h6 className="fw-bold mb-3" style={{ color: 'var(--color-black)' }}>
            Prescription Details
          </h6>
          <CRow className="g-3 mb-3">
            <CCol md={4}>
              <CFormInput
                type="number"
                label={
                  <>
                    Duration <span className="text-danger">*</span>
                  </>
                }
                placeholder="e.g., 7"
                value={formData.duration}
                onChange={(e) => handleChange('duration', e.target.value)}
              />
              {formErrors.duration && <small className="text-danger">{formErrors.duration}</small>}
            </CCol>
            <CCol md={4}>
              <CFormSelect
                label="Duration Unit *"
                value={formData.durationUnit}
                onChange={(e) => handleChange('durationUnit', e.target.value)}
              >
                <option value="">-- Select Unit --</option>
                <option value="Hour">Hour</option>
                <option value="Day">Day</option>
                <option value="Week">Week</option>
                <option value="Month">Month</option>
                <option value="NA">NA</option>
              </CFormSelect>
            </CCol>

            <CCol md={4}>
              <CFormInput
                label="Others"
                placeholder="Enter details..."
                value={formData.others}
                onChange={(e) => handleChange('others', e.target.value)}
              />
            </CCol>

            <CCol md={4}>
              <CFormSelect
                label="Frequency *"
                value={formData.frequency}
                onChange={(e) => handleChange('frequency', e.target.value)}
                disabled={isFrequencyDisabled()} // ✅ disabled when Hour or NA
              >
                <option value="">-- Select Frequency --</option>
                {getFrequencyOptions(formData.durationUnit).map((freq, idx) => (
                  <option key={idx} value={freq}>
                    {freq}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={4}>
              <CFormSelect
                label={
                  <>
                    Food Instructions <span className="text-danger">*</span>
                  </>
                }
                value={formData.food}
                onChange={(e) => handleChange('food', e.target.value)}
              >
                <option value="">Select</option>
                <option value="Before Food">Before Food</option>
                <option value="After Food">After Food</option>
                <option value="With Food">With Food</option>
                <option value="NA">NA</option>
              </CFormSelect>
              {formErrors.food && <small className="text-danger">{formErrors.food}</small>}
            </CCol>
          </CRow>

          {/* Time Slots */}
          <CRow className="g-3 mb-3">
            {[...Array(3)].map((_, i) => {
              const taken = new Set((formData.times || []).filter(Boolean))
              return (
                <CCol md={4} key={i}>
                  <CFormSelect
                    label={`Time Slot ${i + 1} *`}
                    value={formData.times?.[i] || ''}
                    onChange={(e) => {
                      const updatedTimes = [...(formData.times || [])]
                      updatedTimes[i] = e.target.value
                      handleChange('times', updatedTimes)
                    }}
                    disabled={i >= slotCount() || isTimeslotDisabled()} // ✅ disable instead of hide
                  >
                    <option value="">Select Time…</option>
                    {slotOptions.map((opt) => (
                      <option
                        key={opt.value}
                        value={opt.value}
                        disabled={formData.times?.[i] !== opt.value && taken.has(opt.value)}
                      >
                        {opt.label}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
              )
            })}
          </CRow>

          {/* Instructions */}
          <CRow className="g-3 mb-3">
            <CCol md={6}>
              <CFormTextarea
                label="Notes / Special Instructions"
                placeholder="Enter details..."
                rows={2}
                value={formData.note}
                onChange={(e) => handleChange('note', e.target.value)}
              />
            </CCol>
          </CRow>

          {/* Inventory Section */}
          <h6 className="fw-bold mb-3" style={{ color: 'var(--color-black)' }}>
            Inventory Information
          </h6>
          <CRow className="g-3">
            <CCol md={4}>
              <CFormInput
                label="Serial Number"
                value={formData.serialNumber}
                onChange={(e) => {
                  const onlyNums = e.target.value.replace(/[^0-9]/g, '') // keep digits only
                  handleChange('serialNumber', onlyNums)
                }}
              />
            </CCol>
            <CCol md={4}>
              <CFormInput
                label="Brand Name"
                value={formData.brandName}
                onChange={(e) => handleChange('brandName', e.target.value)}
              />
            </CCol>
            <CCol md={4}>
              <CFormInput
                label="Manufacturer"
                value={formData.nameAndAddressOfTheManufacturer}
                onChange={(e) => handleChange('nameAndAddressOfTheManufacturer', e.target.value)}
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                type="month"
                label="Manufacturing Date"
                value={formData.dateOfManufacturing}
                onChange={(e) => handleChange('dateOfManufacturing', e.target.value)}
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                type="month"
                label="Expiry Date"
                value={formData.dateOfExpriy}
                onChange={(e) => handleChange('dateOfExpriy', e.target.value)}
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                label="License Number"
                value={formData.manufacturingLicenseNumber || ''}
                onChange={(e) => {
                  const onlyNums = e.target.value.replace(/[^0-9]/g, '') // allow digits only
                  handleChange('manufacturingLicenseNumber', onlyNums)
                }}
              />
            </CCol>
            <CCol md={6}>
              <CFormInput
                type="number"
                label="Stock"
                min="0"
                value={formData.stock}
                onChange={(e) => handleChange('stock', e.target.value)}
              />
            </CCol>
          </CRow>
        </CModalBody>

        <CModalFooter className="d-flex justify-content-between">
          <CButton color="secondary" variant="outline" onClick={() => setShowModal(false)}>
            Cancel
          </CButton>
          <CButton onClick={handleSave} style={{ backgroundColor: '#a5c4d4ff', color: '#7e3a93' }}>
            Save Medicine
          </CButton>
        </CModalFooter>
      </CModal>
      <CModal visible={viewModal} onClose={() => setViewModal(false)} size="lg" backdrop="static">
        <CModalHeader>
          <CModalTitle>
            <span role="img" aria-label="pill">
              💊
            </span>{' '}
            Medicine Details
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {viewData && (
            <div className="p-3">
              <CCard className="mb-3 shadow-sm border-0">
                <CCardBody>
                  <CRow className="mb-2">
                    <CCol md={6}>
                      <strong>📌 Name:</strong> <span>{viewData.name}</span>
                    </CCol>
                    <CCol md={6}>
                      <strong>💊 Dosage:</strong> <span>{viewData.dose}</span>
                    </CCol>
                  </CRow>

                  <CRow className="mb-2">
                    <CCol md={6}>
                      <strong>🔖 Type:</strong> <span>{viewData.medicineType}</span>
                    </CCol>
                    <CCol md={6}>
                      <strong>⏳ Duration:</strong>{' '}
                      <span>
                        {viewData.duration} {viewData.durationUnit}
                      </span>
                    </CCol>
                  </CRow>

                  <CRow className="mb-2">
                    <CCol md={6}>
                      <strong>⏰ Frequency:</strong> <span>{viewData.remindWhen}</span>
                    </CCol>
                    <CCol md={6}>
                      <strong>🕑 Times:</strong> <span>{viewData.times?.join(', ')}</span>
                    </CCol>
                  </CRow>

                  <CRow className="mb-2">
                    <CCol md={6}>
                      <strong>🍽 Instructions:</strong> <span>{viewData.food}</span>
                    </CCol>
                    <CCol md={6}>
                      <strong>📝 Notes:</strong> <span>{viewData.note}</span>
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>

              <h6 className="fw-bold mb-3">📦 Stock & Manufacturer Details</h6>
              <CCard className="shadow-sm border-0">
                <CCardBody>
                  <CRow className="mb-2">
                    <CCol md={6}>
                      <strong>🔢 Serial No:</strong> <span>{viewData.serialNumber}</span>
                    </CCol>
                    <CCol md={6}>
                      <strong>🏷 Brand:</strong> <span>{viewData.brandName}</span>
                    </CCol>
                  </CRow>

                  <CRow className="mb-2">
                    <CCol md={6}>
                      <strong>📜 License No:</strong>{' '}
                      <span>{viewData.manufacturingLicenseNumber}</span>
                    </CCol>
                    <CCol md={6}>
                      <strong>🏭 Manufacturer:</strong>{' '}
                      <span>{viewData.nameAndAddressOfTheManufacturer}</span>
                    </CCol>
                  </CRow>

                  <CRow className="mb-2">
                    <CCol md={6}>
                      <strong>📅 MFG Date:</strong> <span>{viewData.dateOfManufacturing}</span>
                    </CCol>
                    <CCol md={6}>
                      <strong>⏳ Expiry Date:</strong> <span>{viewData.dateOfExpriy}</span>
                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol>
                      <strong>📦 Stock:</strong> <span>{viewData.stock}</span>
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setViewModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default PharmacyManagement
