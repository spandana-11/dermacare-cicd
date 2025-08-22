import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCol,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import DataTable from 'react-data-table-component'
import {
  deleteDiseaseData,
  postDiseaseData,
  DiseaseData,
  updateDiseaseData,
  TestdDiseaseByHId,
} from './DiseaseManagementAPI'

const DiseasesManagement = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [diseases, setDiseases] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [viewDisease, setViewDisease] = useState(null)
  const [editDiseaseMode, setEditDiseaseMode] = useState(false)
  const [diseaseToEdit, setDiseaseToEdit] = useState(null)
  const [errors, setErrors] = useState({})
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [diseaseIdToDelete, setDiseaseIdToDelete] = useState(null)
  const [hospitalIdToDelete, setHospitalIdToDelete] = useState(null)
  const [newDisease, setNewDisease] = useState({ disease: '' })

  const hospitalId = localStorage.getItem('HospitalId')
  const randomSymptoms = [
    'Fever, cough',
    'Headache, fatigue',
    'Nausea, dizziness',
    'Joint pain, swelling',
    'Shortness of breath, chest pain',
    'Skin rash, itching',
  ]

  const randomNotes = [
    'Monitor symptoms closely.',
    'Patient should rest.',
    'Follow-up required in 2 weeks.',
    'Medication may be needed.',
    'Symptoms usually mild.',
    'Consult specialist if persists.',
  ]

  const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)]

  const normalizeDiseases = (data) =>
    data.map((item) => ({
      ...item,
      id: item.id || item._id,
      disease: item.disease || '',
      probableSymptoms: getRandomItem(randomSymptoms),
      notes: getRandomItem(randomNotes),
    }))

  // const normalizeDiseases = (data) =>
  //   data.map((item) => ({
  //     ...item,
  //     id: item.id || item._id,
  //     disease: item.disease || '',
  //   }))

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await DiseaseData()
      setDiseases(normalizeDiseases(response.data))
    } catch (error) {
      setError('Failed to fetch disease data.')
    } finally {
      setLoading(false)
    }
  }
  const fetchDataByHid = async (hospitalId) => {
    setLoading(true)
    try {
      const response = await TestdDiseaseByHId(hospitalId)
      setDiseases(normalizeDiseases(response.data))
    } catch (error) {
      setError('Failed to fetch disease data.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteDiseaseData(diseaseIdToDelete, hospitalIdToDelete)
      toast.success('Disease deleted successfully!', { position: 'top-right' })
      // fetchData()
      fetchDataByHid(hospitalId)
    } catch (error) {
      toast.error('Failed to delete disease.')
      console.error('Delete error:', error)
    }
    setIsModalVisible(false)
  }

  const handleCancelDelete = () => {
    setDiseaseIdToDelete(null)
    setHospitalIdToDelete(null)
    setIsModalVisible(false)
  }

  useEffect(() => {
    // fetchData()
    fetchDataByHid(hospitalId)
  }, [])

  useEffect(() => {
    const trimmedQuery = searchQuery.toLowerCase().trim()
    if (!trimmedQuery) {
      setFilteredData([])
      return
    }
    const filtered = diseases.filter((d) => d.disease?.toLowerCase().includes(trimmedQuery))
    setFilteredData(filtered)
  }, [searchQuery, diseases])

  const validateForm = () => {
    const newErrors = {}
    if (!newDisease.disease.trim()) newErrors.disease = 'Disease name is required.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

const handleAddDisease = async () => {
  if (!validateForm()) return
  try {
    const payload = {
      disease: newDisease.disease,
      hospitalId: hospitalId,
      // probableSymptoms:probableSymptoms,
      // notes:notes
    }

    await postDiseaseData(payload)

    // Add row to table with dummy fields if modal fields are empty
    const newDiseaseRow = {
      id: Date.now(),
      disease: newDisease.disease,
      probableSymptoms:
        newDisease.probableSymptoms || getRandomItem(randomSymptoms),
      notes: newDisease.notes || getRandomItem(randomNotes),
      hospitalId: hospitalId,
    }

    setDiseases((prev) => [newDiseaseRow, ...prev])
    setNewDisease({ disease: '', probableSymptoms: '', notes: '' })
    setSearchQuery('')
    toast.success('Disease added successfully!')
    setModalVisible(false)
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.statusText ||
      'An unexpected error occurred.'
    const statusCode = error.response?.status
    if (statusCode === 409 || errorMessage.toLowerCase().includes('duplicate')) {
      toast.error(`Error: Duplicate disease name - ${newDisease.disease} already exists!`, {
        position: 'top-right',
      })
    } else {
      toast.error(`Error adding disease: ${errorMessage}`, { position: 'top-right' })
    }
  }
}



  const handleDiseaseEdit = (disease) => {
    setDiseaseToEdit({
      ...disease,
      hospitalId, // Always from localStorage
    })
    setEditDiseaseMode(true)
  }

const handleUpdateDisease = async () => {
  if (!diseaseToEdit || !diseaseToEdit.id) {
    toast.error('Missing disease data to update.');
    return;
  }

  setLoading(true);

  try {
    // Only send required fields to backend
    await updateDiseaseData(
      {
        disease: diseaseToEdit.disease,
        hospitalId: hospitalId,
      },
      diseaseToEdit.id, // must match backend ID (_id)
      hospitalId
    );

    // Update table locally including dummy fields
    setDiseases((prev) =>
      prev.map((d) =>
        d.id === diseaseToEdit.id
          ? {
              ...d,
              disease: diseaseToEdit.disease,
              probableSymptoms: diseaseToEdit.probableSymptoms || '',
              notes: diseaseToEdit.notes || '',
            }
          : d
      )
    );

    toast.success('Disease updated successfully!');
    setEditDiseaseMode(false);
  } catch (error) {
    console.error('Update error:', error);
    toast.error('Failed to update disease.');
  } finally {
    setLoading(false);
  }
};




  const handleDiseaseDelete = (disease) => {
    setDiseaseIdToDelete(disease.diseaseId || disease.id || disease._id)
    setHospitalIdToDelete(disease.hospitalId)
    setIsModalVisible(true)
  }

  const columns = [
    { name: 'S.No', selector: (row, index) => index + 1, width: '5%' },
    { name: 'Disease Name', selector: (row) => row.disease, sortable: true, width: '20%' },
    { name: 'Probable Symptoms', selector: (row) => row.probableSymptoms, width: '25%' },
    { name: 'Notes', selector: (row) => row.notes, width: '30%' },
    {
      name: 'Actions',
      cell: (row) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '180px' }}>
          <div onClick={() => setViewDisease(row)} style={{ color: 'green', cursor: 'pointer' }}>
            View
          </div>
          <div onClick={() => handleDiseaseEdit(row)} style={{ color: 'blue', cursor: 'pointer' }}>
            Edit
          </div>
          <div onClick={() => handleDiseaseDelete(row)} style={{ color: 'red', cursor: 'pointer' }}>
            Delete
          </div>
        </div>
      ),
    },
  ]

  const ConfirmationModal = ({ isVisible, message, onConfirm, onCancel }) => {
    return (
      <CModal visible={isVisible} onClose={onCancel} backdrop="static">
        <CModalHeader>
          <CModalTitle>Confirmation</CModalTitle>
        </CModalHeader>
        <CModalBody>{message}</CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={onCancel}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={onConfirm}>
            Confirm
          </CButton>
        </CModalFooter>
      </CModal>
    )
  }

  return (
    <div>
      <ToastContainer />
      <CForm className="d-flex justify-content-between mb-3">
        <CInputGroup className="mb-3" style={{ width: '300px', marginLeft: '40px' }}>
          <CFormInput
            type="text"
            placeholder="Search by Disease Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <CInputGroupText>
            <CIcon icon={cilSearch} />
          </CInputGroupText>
        </CInputGroup>
        <CButton
          color="primary"
          style={{ marginRight: '100px' }}
          onClick={() => setModalVisible(true)}
        >
          Add Disease
        </CButton>
      </CForm>

      {viewDisease && (
        <CModal visible={!!viewDisease} onClose={() => setViewDisease(null)}>
          <CModalHeader>
            <CModalTitle>Disease Details</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CRow className="mb-3">
              <CCol sm={4}>
                <strong>Disease Name:</strong>
              </CCol>
              <CCol sm={8}>{viewDisease.disease}</CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={4}>
                <strong>Probable Symptoms:</strong>
              </CCol>
              <CCol sm={8}>{viewDisease.probableSymptoms}</CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={4}>
                <strong>Notes:</strong>
              </CCol>
              <CCol sm={8}>{viewDisease.notes}</CCol>
            </CRow>
          </CModalBody>
        </CModal>
      )}

      {/* Add Disease Modal */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Add New Disease</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
  {/* Disease Name */}
  <h6>
    Disease Name <span style={{ color: 'red' }}>*</span>
  </h6>
  <CFormInput
    type="text"
    name="disease"
    value={newDisease.disease}
    onChange={(e) => {
      const value = e.target.value
      setNewDisease({ ...newDisease, disease: value })
      if (errors.disease) setErrors((prev) => ({ ...prev, disease: '' }))
    }}
    placeholder="Enter disease name"
    className={errors.disease ? 'is-invalid' : ''}
  />
  {errors.disease && (
    <div className="invalid-feedback" style={{ color: 'red' }}>
      {errors.disease}
    </div>
  )}

  {/* Probable Symptoms */}
  <h6 className="mt-3">Probable Symptoms</h6>
  <CFormInput
    type="text"
    name="probableSymptoms"
    value={newDisease.probableSymptoms || ''}
    onChange={(e) =>
      setNewDisease({ ...newDisease, probableSymptoms: e.target.value })
    }
    placeholder="Enter probable symptoms (optional)"
  />

  {/* Notes */}
  <h6 className="mt-3">Notes</h6>
  <CFormInput
    type="text"
    name="notes"
    value={newDisease.notes || ''}
    onChange={(e) => setNewDisease({ ...newDisease, notes: e.target.value })}
    placeholder="Enter notes (optional)"
  />
</CForm>

        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleAddDisease}>
            Add
          </CButton>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Edit Disease Modal */}
      <CModal visible={editDiseaseMode} onClose={() => setEditDiseaseMode(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Edit Disease</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <h6>Disease Name</h6>
            <CFormInput
              type="text"
              value={diseaseToEdit?.disease || ''}
              onChange={(e) => setDiseaseToEdit({ ...diseaseToEdit, disease: e.target.value })}
            />

            <h6 className="mt-2">Probable Symptoms</h6>
           <CFormInput
  type="text"
  value={diseaseToEdit?.probableSymptoms || ''}
  onChange={(e) =>
    setDiseaseToEdit({ ...diseaseToEdit, probableSymptoms: e.target.value })
  }
/>
            <h6 className="mt-2">Notes</h6>
            <CFormInput
  type="text"
  value={diseaseToEdit?.notes || ''}
  onChange={(e) => setDiseaseToEdit({ ...diseaseToEdit, notes: e.target.value })}
/>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleUpdateDisease}>
            Update
          </CButton>
          <CButton color="secondary" onClick={() => setEditDiseaseMode(false)}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>

      <ConfirmationModal
        isVisible={isModalVisible}
        message="Are you sure you want to delete this disease?"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {loading ? (
        <div style={{ textAlign: 'center' }}>Loading...</div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredData.length ? filteredData : diseases}
          pagination
        />
      )}
    </div>
  )
}

export default DiseasesManagement
