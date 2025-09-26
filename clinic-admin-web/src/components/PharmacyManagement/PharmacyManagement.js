import React, { useState, useEffect } from 'react'
import { CButton, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow, CFormInput, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter } from '@coreui/react'
import { toast } from 'react-toastify'

// Sample data placeholder
const sampleMedicines = [
  {
    id: 1,
    serialNumber: 'GJPPACZKF',
    genericName: 'Montelukast Sodium and Levocetirizine Hydrochloride Tablets IP',
    brandName: 'Montek LC',
    manufacturer: 'Sun Pharma Laboratories Ltd. Vill: Kokjhar, Mirza Palashbari Road, P.O.:Palashbari, Dist:Kamrup, Assam-781128',
    batchNumber: 'GTG1877A',
    dateOfManufacturing: 'Jun-2025',
    dateOfExpiry: 'Nov-2027',
    licenseNumber: 'M.L.:374/DR/Mfg/201'
  },
]

const PharmacyManagement = () => {
  const [medicines, setMedicines] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    id: null,
    serialNumber: '',
    genericName: '',
    brandName: '',
    manufacturer: '',
    batchNumber: '',
    dateOfManufacturing: '',
    dateOfExpiry: '',
    licenseNumber: ''
  })

  useEffect(() => {
    // Fetch medicines from backend (placeholder)
    setMedicines(sampleMedicines)
  }, [])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    if (!formData.serialNumber || !formData.genericName || !formData.brandName) {
      toast.error('Please fill all required fields')
      return
    }

    if (formData.id) {
      // Update existing
      setMedicines(prev => prev.map(med => med.id === formData.id ? formData : med))
      toast.success('Medicine updated!')
    } else {
      // Add new
      setMedicines(prev => [...prev, { ...formData, id: Date.now() }])
      toast.success('Medicine added!')
    }

    setShowModal(false)
    setFormData({
      id: null,
      serialNumber: '',
      genericName: '',
      brandName: '',
      manufacturer: '',
      batchNumber: '',
      dateOfManufacturing: '',
      dateOfExpiry: '',
      licenseNumber: ''
    })
  }

  const handleEdit = (medicine) => {
    setFormData(medicine)
    setShowModal(true)
  }

  const handleDelete = (id) => {
    setMedicines(prev => prev.filter(med => med.id !== id))
    toast.info('Medicine deleted!')
  }

  return (
    <div className="p-4">
      <h3>Pharmacy Management</h3>
      <CButton color="primary" className="mb-3" onClick={() => setShowModal(true)}>Add Medicine</CButton>

      <CTable striped hover responsive>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>Serial Number</CTableHeaderCell>
            <CTableHeaderCell>Generic Name</CTableHeaderCell>
            <CTableHeaderCell>Brand Name</CTableHeaderCell>
            <CTableHeaderCell>Manufacturer</CTableHeaderCell>
            <CTableHeaderCell>Batch Number</CTableHeaderCell>
            <CTableHeaderCell>Mfg Date</CTableHeaderCell>
            <CTableHeaderCell>Expiry Date</CTableHeaderCell>
            <CTableHeaderCell>License No.</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {medicines.map(med => (
            <CTableRow key={med.id}>
              <CTableDataCell>{med.serialNumber}</CTableDataCell>
              <CTableDataCell>{med.genericName}</CTableDataCell>
              <CTableDataCell>{med.brandName}</CTableDataCell>
              <CTableDataCell>{med.manufacturer}</CTableDataCell>
              <CTableDataCell>{med.batchNumber}</CTableDataCell>
              <CTableDataCell>{med.dateOfManufacturing}</CTableDataCell>
              <CTableDataCell>{med.dateOfExpiry}</CTableDataCell>
              <CTableDataCell>{med.licenseNumber}</CTableDataCell>
              <CTableDataCell>
                <CButton size="sm" color="info" className="me-2" onClick={() => handleEdit(med)}>Edit</CButton>
                <CButton size="sm" color="danger" onClick={() => handleDelete(med.id)}>Delete</CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      {/* Modal for Add/Edit */}
      <CModal visible={showModal} onClose={() => setShowModal(false)}>
        <CModalHeader>
          <CModalTitle>{formData.id ? 'Edit Medicine' : 'Add Medicine'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {[
            { label: 'Serial Number', field: 'serialNumber' },
            { label: 'Generic Name', field: 'genericName' },
            { label: 'Brand Name', field: 'brandName' },
            { label: 'Manufacturer', field: 'manufacturer' },
            { label: 'Batch Number', field: 'batchNumber' },
            { label: 'Date of Manufacturing', field: 'dateOfManufacturing', type: 'month' },
            { label: 'Date of Expiry', field: 'dateOfExpiry', type: 'month' },
            { label: 'License Number', field: 'licenseNumber' },
          ].map((input) => (
            <CFormInput
              key={input.field}
              className="mb-2"
              type={input.type || 'text'}
              placeholder={input.label}
              value={formData[input.field]}
              onChange={(e) => handleChange(input.field, e.target.value)}
            />
          ))}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>Cancel</CButton>
          <CButton color="primary" onClick={handleSave}>{formData.id ? 'Update' : 'Add'}</CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default PharmacyManagement
