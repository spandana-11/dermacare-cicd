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
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
// import '../widgets/Widget.css'
import {
  deleteDiseaseData,
  postDiseaseData,
  DiseaseData,
  updateDiseaseData,
  TestdDiseaseByHId,
} from './DiseaseManagementAPI'
import ConfirmationModal from '../../components/ConfirmationModal'
import { useGlobalSearch } from '../Usecontext/GlobalSearchContext'
import capitalizeWords from '../../Utils/capitalizeWords'
import { Eye, Edit2, Trash2 } from 'lucide-react' // modern icons
import { Button } from 'bootstrap'
import LoadingIndicator from '../../Utils/loader'
const DiseasesManagement = () => {
  // const [searchQuery, setSearchQuery] = useState('')
  const [diseases, setDiseases] = useState([])
  // const [filteredData, setFilteredData] = useState([])
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
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [newDisease, setNewDisease] = useState({
    diseaseName: '',
    probableSymptoms: '',
    notes: '',
  })
  const { searchQuery, setSearchQuery } = useGlobalSearch()
  const hospitalId = localStorage.getItem('HospitalId')
  const normalizeDiseases = (data) =>
    data.map((item) => ({
      id: item.id || item._id,
      diseaseName: item.diseaseName || '',
      probableSymptoms: item.probableSymptoms || '',
      notes: item.notes || '',
      hospitalId: item.hospitalId,
    }))

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

  // ✅ Apply global search filtering
  const filteredData = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return diseases
    return diseases.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(q)),
    )
  }, [searchQuery, diseases])

  const validateForm = () => {
    const newErrors = {}
    if (!newDisease.diseaseName.trim()) newErrors.disease = 'Disease name is required.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nameRegex = /^[A-Za-z\s.]+$/

  const handleAddDisease = async () => {
    const trimmedName = newDisease.diseaseName.trim()

    // Empty check
    if (!trimmedName) {
      setErrors({ diseaseName: 'Disease name is required.' })
      return
    }

    // Regex validation
    if (!nameRegex.test(trimmedName)) {
      setErrors({ diseaseName: 'Only alphabets, spaces, and "." are allowed.' })
      return
    }

    // ✅ Duplicate check before API call
    const duplicate = diseases.some(
      (t) => t.diseaseName.trim().toLowerCase() === trimmedName.toLowerCase(),
    )
    if (duplicate) {
      toast.error(`Duplicate disease name - ${trimmedName} already exists!`, {
        position: 'top-right',
      })
      setModalVisible(false)
      return
    }

    try {
      const payload = {
        diseaseName: trimmedName,
        hospitalId,
        probableSymptoms: newDisease.probableSymptoms,
        notes: newDisease.notes,
      }

      const response = await postDiseaseData(payload)

      const newDiseaseRow = {
        id: response.data.id || response.id,
        diseaseName: response.data.diseaseName,
        probableSymptoms: response.data.probableSymptoms,
        notes: response.data.notes,
        hospitalId: response.data.hospitalId,
      }

      setDiseases((prev) => [newDiseaseRow, ...prev])
      setNewDisease({ diseaseName: '', probableSymptoms: '', notes: '' })
      fetchDataByHid(hospitalId)
      toast.success('Disease added successfully!')
      setModalVisible(false)
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.statusText ||
        'An unexpected error occurred.'
      toast.error(`Error adding disease: ${errorMessage}`)
    }
  }

  const handleUpdateDisease = async () => {
    if (!diseaseToEdit?.diseaseName?.trim()) {
      setErrors({ diseaseName: 'Disease name is required.' })
      // toast.error('Disease name cannot be empty!', { position: 'top-right' })
      return
    }
    if (!nameRegex.test(diseaseToEdit.diseaseName.trim())) {
      setErrors({ diseaseName: 'Only alphabets, spaces, and "." are allowed.' })
      return
    }

    const duplicate = diseases.some(
      (d) =>
        d.diseaseName.trim().toLowerCase() === diseaseToEdit.diseaseName.trim().toLowerCase() &&
        d.id !== diseaseToEdit.id,
    )
    if (duplicate) {
      toast.error(`Duplicate disease name - ${diseaseToEdit.diseaseName} already exists!`, {
        position: 'top-right',
      })
      return
    }

    try {
      await updateDiseaseData(
        {
          diseaseName: diseaseToEdit.diseaseName,
          probableSymptoms: diseaseToEdit.probableSymptoms,
          notes: diseaseToEdit.notes,
          hospitalId: diseaseToEdit.hospitalId,
        },
        diseaseToEdit.id,
        diseaseToEdit.hospitalId,
      )

      setDiseases((prev) =>
        prev.map((d) => (d.id === diseaseToEdit.id ? { ...d, ...diseaseToEdit } : d)),
      )

      toast.success('Disease updated successfully!')
      setEditDiseaseMode(false)
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Failed to update disease.')
    }
  }

  const handleDiseaseEdit = (disease) => {
    setDiseaseToEdit({ ...disease, hospitalId })
    setEditDiseaseMode(true)
  }

  const handleDiseaseDelete = (disease) => {
    setDiseaseIdToDelete(disease.diseaseId || disease.id || disease._id)
    setHospitalIdToDelete(disease.hospitalId)
    setIsModalVisible(true)
  }
  // Always show filteredData
  const displayData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  return (
    <div>
      <ToastContainer />
      <div
        className="mb-3 w-100"
        style={{ display: 'flex', justifyContent: 'end', alignContent: 'end', alignItems: 'end' }}
      >
        <CButton
          style={{
            color: 'var(--color-black)',
            backgroundColor: 'var(--color-bgcolor)',
          }}
          onClick={() => {
            setErrors({})
            setModalVisible(true)
          }}
        >
          Add Disease
        </CButton>
      </div>

      {viewDisease && (
        <CModal visible={!!viewDisease} onClose={() => setViewDisease(null)} backdrop="static">
          <CModalHeader>
            <CModalTitle>Disease Details</CModalTitle>
          </CModalHeader>
          <CModalBody style={{ color: 'var(--color-black)' }}>
            <CRow className="mb-3">
              <CCol sm={4}>
                <strong>Disease Name:</strong>
              </CCol>
              <CCol sm={8}>{viewDisease.diseaseName}</CCol>
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
            <h6>
              Disease Name <span style={{ color: 'red' }}>*</span>
            </h6>
            <CFormInput
              type="text"
              value={newDisease.diseaseName}
              onChange={(e) => {
                setNewDisease({ ...newDisease, diseaseName: e.target.value })
                if (errors.diseaseName) {
                  setErrors({ ...errors, diseaseName: '' }) // clear error when typing
                }
              }}
            />
            {errors.diseaseName && (
              <p style={{ color: 'red', fontSize: '0.9rem', marginTop: '5px' }}>
                {errors.diseaseName}
              </p>
            )}

            <h6 className="mt-3">Probable Symptoms</h6>
            <CFormInput
              type="text"
              value={newDisease.probableSymptoms}
              onChange={(e) => setNewDisease({ ...newDisease, probableSymptoms: e.target.value })}
            />
            <h6 className="mt-3">Notes</h6>
            <CFormInput
              type="text"
              value={newDisease.notes}
              onChange={(e) => setNewDisease({ ...newDisease, notes: e.target.value })}
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancel
          </CButton>
          <CButton
            style={{ backgroundColor: 'var(--color-black)' }}
            className="text-white"
            onClick={handleAddDisease}
          >
            Add
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
            <h6>
              Disease Name <span style={{ color: 'red' }}>*</span>
            </h6>
            <CFormInput
              type="text"
              value={diseaseToEdit?.diseaseName || ''}
              onChange={(e) => {
                setDiseaseToEdit({ ...diseaseToEdit, diseaseName: e.target.value })
                if (errors.diseaseName) {
                  setErrors({ ...errors, diseaseName: '' }) // clear error when typing
                }
              }}
            />
            {errors.diseaseName && (
              <p style={{ color: 'red', fontSize: '0.9rem', marginTop: '5px' }}>
                {errors.diseaseName}
              </p>
            )}

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
          {/* <CButton color="info" className="text-white" onClick={handleUpdateDisease}>
            Update
          </CButton> */}
          <CButton color="secondary" onClick={() => setEditDiseaseMode(false)}>
            Cancel
          </CButton>
          <CButton
            style={{ backgroundColor: 'var(--color-black)' }}
            className="text-white"
            onClick={handleUpdateDisease}
          >
            Update
          </CButton>
        </CModalFooter>
      </CModal>

      <ConfirmationModal
        isVisible={isModalVisible}
        title="Delete Doctor"
        message="Are you sure you want to delete this disease? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmColor="danger"
        cancelColor="secondary"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {loading ? (
        <div className="d-flex justify-content-center align-items-center">
          <LoadingIndicator message="Loading Disease..." />
        </div>
      ) : error ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{
            height: '50vh', // full screen height

            color: 'var(--color-black)',
          }}
        >
          {error}
        </div>
      ) : (
        <CTable striped hover responsive>
          <CTableHead className="pink-table  w-auto">
            <CTableRow>
              <CTableHeaderCell>S.No</CTableHeaderCell>
              <CTableHeaderCell>Name</CTableHeaderCell>
              <CTableHeaderCell>Probable Symptoms</CTableHeaderCell>
              <CTableHeaderCell>Notes</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Action</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody className="pink-table">
            {displayData.length > 0 ? (
              displayData.map((disease, index) => (
                <CTableRow key={disease.id}>
                  <CTableDataCell>{(currentPage - 1) * rowsPerPage + index + 1}</CTableDataCell>
                  <CTableDataCell>{capitalizeWords(disease.diseaseName)}</CTableDataCell>
                  <CTableDataCell>
                    {capitalizeWords(disease.probableSymptoms || 'NA')}
                  </CTableDataCell>
                  <CTableDataCell>{capitalizeWords(disease.notes || 'NA')}</CTableDataCell>

                  {/* Actions */}
                  <CTableDataCell className="text-end">
                    <div className="d-flex justify-content-end gap-2  ">
                      <button
                        className="actionBtn"
                        onClick={() => setViewDisease(disease)}
                        title="View"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        className="actionBtn"
                        onClick={() => handleDiseaseEdit(disease)}
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>

                      <button
                        className="actionBtn"
                        onClick={() => handleDiseaseDelete(disease)}
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
                <CTableDataCell colSpan={5} className="text-center text-muted">
                  🔍 No diseases found matching "<b>{searchQuery}</b>"
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>
      )}
      {/* Pagination */}
      {!loading && (
        <div className="d-flex justify-content-end mt-3" style={{ marginRight: '40px' }}>
          {Array.from({ length: Math.ceil(filteredData.length / rowsPerPage) }, (_, index) => (
            <CButton
              key={index}
              style={{
                backgroundColor: currentPage === index + 1 ? 'var(--color-black)' : '#fff',
                color: currentPage === index + 1 ? '#fff' : 'var(--color-black)',
                border: '1px solid #ccc',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
              className="ms-2"
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </CButton>
          ))}
        </div>
      )}
    </div>
  )
}

export default DiseasesManagement
