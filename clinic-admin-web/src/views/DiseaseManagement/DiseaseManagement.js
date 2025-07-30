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
    description: '',
    department: '',
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
    if (!newDisease.description.trim()) newErrors.description = 'Description is required'
    if (!newDisease.department) newErrors.department = 'Department is required'
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
            <CTableHeaderCell>Description</CTableHeaderCell>
            <CTableHeaderCell>Department</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {diseases.length === 0 ? (
            <CTableRow>
              <CTableDataCell colSpan={5} className="text-center">
                No disease records found.
              </CTableDataCell>
            </CTableRow>
          ) : (
            diseases.map((disease, index) => (
              <CTableRow key={index}>
                <CTableDataCell>{disease.diseaseName}</CTableDataCell>
                <CTableDataCell>{disease.description}</CTableDataCell>
                <CTableDataCell>{disease.department}</CTableDataCell>
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
            <CFormInput
              name="diseaseName"
              value={newDisease.diseaseName}
              onChange={handleChange}
              placeholder="Enter Disease Name"
            />
            {errors.diseaseName && <p className="text-danger">{errors.diseaseName}</p>}

            <label>Description</label>
            <CFormInput
              name="description"
              value={newDisease.description}
              onChange={handleChange}
              placeholder="Enter Description"
            />
            {errors.description && <p className="text-danger">{errors.description}</p>}

            <label>Department</label>
            <CFormSelect name="department" value={newDisease.department} onChange={handleChange}>
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </CFormSelect>
            {errors.department && <p className="text-danger">{errors.department}</p>}

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
            <p><strong>Name:</strong> {viewDisease.diseaseName}</p>
            <p><strong>Description:</strong> {viewDisease.description}</p>
            <p><strong>Department:</strong> {viewDisease.department}</p>
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
