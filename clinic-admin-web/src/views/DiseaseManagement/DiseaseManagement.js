import React, { useState } from 'react'
import {
  CButton,
  CForm,
  CFormInput,
  CFormSelect,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const DiseaseManagement = () => {
  const [diseases, setDiseases] = useState([])

  const [newDisease, setNewDisease] = useState({
    diseaseName: '',
    symptoms: '',
    diagnosisMethod: '',
    treatmentPlan: '',
    severity: '',
    status: 'Active',
  })

  const [errors, setErrors] = useState({})
  const [modalVisible, setModalVisible] = useState(false)
  const [editIndex, setEditIndex] = useState(null)
  const [viewDisease, setViewDisease] = useState(null)

  const departments = ['General Medicine', 'Pediatrics', 'Dermatology']

  const handleChange = (e) => {
    const { name, value } = e.target
    setNewDisease((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!newDisease.diseaseName.trim()) newErrors.diseaseName = 'Disease Name is required'
    if (!newDisease.symptoms.trim()) newErrors.symptoms = 'Symptoms are required'
    if (!newDisease.diagnosisMethod.trim())
      newErrors.diagnosisMethod = 'Diagnosis method is required'
    if (!newDisease.treatmentPlan.trim()) newErrors.treatmentPlan = 'Treatment plan is required'
    if (!newDisease.severity) newErrors.severity = 'Severity is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddOrUpdate = () => {
    if (!validateForm()) return

    if (editIndex !== null) {
      const updatedList = [...diseases]
      updatedList[editIndex] = {
        ...updatedList[editIndex],
        ...newDisease,
      }
      setDiseases(updatedList)
      toast.success('Disease updated successfully!')
    } else {
      const newEntry = {
        diseaseId: `D_${Math.floor(Math.random() * 10000)}`,
        ...newDisease,
      }
      setDiseases([...diseases, newEntry])
      toast.success('Disease added successfully!')
    }

    setNewDisease({
      diseaseName: '',
      description: '',
      department: '',
      status: 'Active',
    })
    setErrors({})
    setModalVisible(false)
    setEditIndex(null)
  }

  const handleOpenAddModal = () => {
    setNewDisease({
      diseaseName: '',
      description: '',
      department: '',
      status: 'Active',
    })
    setEditIndex(null)
    setModalVisible(true)
  }

  const handleEdit = (index) => {
    setNewDisease(diseases[index])
    setEditIndex(index)
    setModalVisible(true)
  }

  const handleDelete = (index) => {
    const updated = diseases.filter((_, i) => i !== index)
    setDiseases(updated)
    toast.success('Disease deleted')
  }

  return (
    <div className="container mt-4">
      <ToastContainer />
      <div className="d-flex justify-content-between mb-3">
        <h4>Disease Management</h4>
        <CButton color="primary" onClick={handleOpenAddModal}>
          Add Disease
        </CButton>
      </div>

      {/* Data Table */}
      <CTable bordered striped>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>Disease Name</CTableHeaderCell>
            <CTableHeaderCell>Symptoms</CTableHeaderCell>
            <CTableHeaderCell>Diagnosis</CTableHeaderCell>
            <CTableHeaderCell>Treatment</CTableHeaderCell>
            <CTableHeaderCell>Severity</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {diseases.length === 0 ? (
            <CTableRow>
              <CTableDataCell colSpan={4} className="text-center">
                No disease records found.
              </CTableDataCell>
            </CTableRow>
          ) : (
            diseases.map((disease, index) => (
              <CTableRow key={index}>
                <CTableDataCell>{disease.diseaseName}</CTableDataCell>
                <CTableDataCell>{disease.symptoms}</CTableDataCell>
                <CTableDataCell>{disease.diagnosisMethod}</CTableDataCell>
                <CTableDataCell>{disease.treatmentPlan}</CTableDataCell>
                <CTableDataCell>{disease.severity}</CTableDataCell>
                <CTableDataCell>{disease.status}</CTableDataCell>
                <CTableDataCell>
                  <CButton size="sm" color="info" onClick={() => setViewDisease(disease)}>
                    View
                  </CButton>{' '}
                  <CButton size="sm" color="warning" onClick={() => handleEdit(index)}>
                    Edit
                  </CButton>{' '}
                  <CButton size="sm" color="danger" onClick={() => handleDelete(index)}>
                    Delete
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))
          )}
        </CTableBody>
      </CTable>

      {/* Add/Edit Modal */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>{editIndex !== null ? 'Edit Disease' : 'Add Disease'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <label>Disease Name</label>
            <CFormInput name="diseaseName" value={newDisease.diseaseName} onChange={handleChange} />
            {errors.diseaseName && <p className="text-danger">{errors.diseaseName}</p>}

            <label>Symptoms</label>
            <CFormInput name="symptoms" value={newDisease.symptoms} onChange={handleChange} />
            {errors.symptoms && <p className="text-danger">{errors.symptoms}</p>}

            <label>Diagnosis Method</label>
            <CFormInput
              name="diagnosisMethod"
              value={newDisease.diagnosisMethod}
              onChange={handleChange}
            />
            {errors.diagnosisMethod && <p className="text-danger">{errors.diagnosisMethod}</p>}

            <label>Treatment Plan</label>
            <CFormInput
              name="treatmentPlan"
              value={newDisease.treatmentPlan}
              onChange={handleChange}
            />
            {errors.treatmentPlan && <p className="text-danger">{errors.treatmentPlan}</p>}

            <label>Severity</label>
            <CFormSelect name="severity" value={newDisease.severity} onChange={handleChange}>
              <option value="">Select Severity</option>
              <option value="Mild">Mild</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe">Severe</option>
            </CFormSelect>
            {errors.severity && <p className="text-danger">{errors.severity}</p>}

            <label>Status</label>
            <CFormSelect name="status" value={newDisease.status} onChange={handleChange}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </CFormSelect>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleAddOrUpdate}>
            {editIndex !== null ? 'Update' : 'Add'}
          </CButton>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>

      {/* View Modal */}
      {viewDisease && (
        <CModal visible={!!viewDisease} onClose={() => setViewDisease(null)}>
          <CModalHeader>
            <CModalTitle>Disease Details</CModalTitle>
          </CModalHeader>
          <CModalBody>
          <p><strong>Disease Name:</strong> {viewDisease.diseaseName}</p>
<p><strong>Symptoms:</strong> {viewDisease.symptoms}</p>
<p><strong>Diagnosis:</strong> {viewDisease.diagnosisMethod}</p>
<p><strong>Treatment:</strong> {viewDisease.treatmentPlan}</p>
<p><strong>Severity:</strong> {viewDisease.severity}</p>
<p><strong>Status:</strong> {viewDisease.status}</p>

          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setViewDisease(null)}>
              Close
            </CButton>
          </CModalFooter>
        </CModal>
      )}
    </div>
  )
}

export default DiseaseManagement
