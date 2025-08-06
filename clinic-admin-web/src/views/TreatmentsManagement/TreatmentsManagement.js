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
  CHeader,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import DataTable from 'react-data-table-component'
import { deleteTreatmentData, postTreatmentData, TreatmentData, updateTreatmentData } from './TreatmentsManagementAPI'

const TreatmentsManagement = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [treatment, setTreatment] = useState([])

  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [viewTreatment, setViewTreatment] = useState(null)
  const [editTreatmentMode, setEditTreatmentMode] = useState(false)
  const [treatmentToEdit, setTreatmentToEdit] = useState(null)
  const [errors, setErrors] = useState({ treatmentName: '', hospitalId: '' })
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [treatmentIdToDelete, setTreatmentIdToDelete] = useState(null)
  const [newTreatment, setNewTreatment] = useState({ treatmentName: '', hospitalId: '' })
  const [hospitalIdToDelete, setHospitalIdToDelete] = useState(null)

  const normalizeTreatments = (data) =>
    data.map((item) => ({
      ...item,
      id: item.id || item._id, // fallback
    }))

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await TreatmentData()
      setTreatment(normalizeTreatments(response.data))
    } catch (error) {
      setError('Failed to fetch treatment data.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteTreatmentData(treatmentIdToDelete, hospitalIdToDelete)
      toast.success('Treatment deleted successfully!', { position: 'top-right' })
      fetchData()
    } catch (error) {
      toast.error('Failed to delete treatment.')
      console.error('Delete error:', error)
    }
    setIsModalVisible(false)
  }

  const handleCancelDelete = () => {
    setTreatmentIdToDelete(null)
    setHospitalIdToDelete(null)
    setIsModalVisible(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const trimmedQuery = searchQuery.toLowerCase().trim()
    if (!trimmedQuery) {
      setFilteredData([])
      return
    }
    const filtered = treatment.filter((t) => t.treatmentName?.toLowerCase().includes(trimmedQuery))
    setFilteredData(filtered)
  }, [searchQuery, treatment])

  const validateForm = () => {
    const newErrors = {}
    if (!newTreatment.treatmentName.trim()) newErrors.treatmentName = 'Treatment name is required.'
    if (!newTreatment.hospitalId.trim()) newErrors.hospitalId = 'Hospital ID is required.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidObjectId = (id) => /^[a-f\d]{24}$/i.test(id)

  const handleAddTreatment = async () => {
    if (!validateForm()) return
    try {
      const payload = {
        treatmentName: newTreatment.treatmentName,
        hospitalId: newTreatment.hospitalId,
      }

      await postTreatmentData(payload)
      toast.success('Treatment added successfully!')
      fetchData()
      setModalVisible(false)
      setNewTreatment({ treatmentName: '', hospitalId: '' })
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.statusText ||
        'An unexpected error occurred.'
      const statusCode = error.response?.status
      if (statusCode === 409 || errorMessage.toLowerCase().includes('duplicate')) {
        toast.error(`Error: Duplicate treatment name - ${newTreatment.treatmentName} already exists!`, {
          position: 'top-right',
        })
      } else {
        toast.error(`Error adding treatment: ${errorMessage}`, { position: 'top-right' })
      }
    }
  }

  const handleTreatmentEdit = (treatment) => {
    setTreatmentToEdit(treatment)
    setEditTreatmentMode(true)
  }

  const handleUpdateTreatment = async () => {
    const { id: treatmentId, hospitalId } = treatmentToEdit

    try {
      await updateTreatmentData(treatmentToEdit, treatmentId, hospitalId)
      toast.success('Treatment updated successfully!')
      setEditTreatmentMode(false)
      fetchData()
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Failed to update treatment.')
    }
  }

  const handleTreatmentDelete = (treatment) => {
    setTreatmentIdToDelete(treatment.treatmentId || treatment.id || treatment._id)
    setHospitalIdToDelete(treatment.hospitalId)
    setIsModalVisible(true)
  }

  const columns = [
    {
      name: 'S.No',
      selector: (row, index) => index + 1,
      width: '10%',
    },
    {
      name: 'Treatment Name',
      selector: (row) => row.treatmentName,
      sortable: true,
      width: '45%',
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '250px' }}>
          <div onClick={() => setViewTreatment(row)} style={{ color: 'green', cursor: 'pointer' }}>
            View
          </div>
          <div onClick={() => handleTreatmentEdit(row)} style={{ color: 'blue', cursor: 'pointer' }}>
            Edit
          </div>
          <div onClick={() => handleTreatmentDelete(row)} style={{ color: 'red', cursor: 'pointer' }}>
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
            placeholder="Search by Treatment Name"
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
          Add Treatment
        </CButton>
      </CForm>

      {viewTreatment && (
        <CModal visible={!!viewTreatment} onClose={() => setViewTreatment(null)}>
          <CModalHeader>
            <CModalTitle>Treatment Details</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CRow className="mb-3">
              <CCol sm={4}>
                <strong>Treatment Name:</strong>
              </CCol>
              <CCol sm={8}>{viewTreatment.treatmentName}</CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={4}>
                <strong>Hospital ID:</strong>
              </CCol>
              <CCol sm={8}>{viewTreatment.hospitalId}</CCol>
            </CRow>
          </CModalBody>
        </CModal>
      )}

      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Add New Treatment</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <h6>
              Treatment Name <span style={{ color: 'red' }}>*</span>
            </h6>
            <CFormInput
              type="text"
              name="treatmentName"
              value={newTreatment.treatmentName}
              onChange={(e) => setNewTreatment({ ...newTreatment, treatmentName: e.target.value })}
            />

            <h6 className="mt-3">
              Hospital ID <span style={{ color: 'red' }}>*</span>
            </h6>
            <CFormInput
              type="text"
              name="hospitalId"
              value={newTreatment.hospitalId}
              onChange={(e) => setNewTreatment({ ...newTreatment, hospitalId: e.target.value })}
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleAddTreatment}>
            Add
          </CButton>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={editTreatmentMode} onClose={() => setEditTreatmentMode(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Edit Treatment</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <h6>Treatment Name</h6>
            <CFormInput
              type="text"
              value={treatmentToEdit?.treatmentName || ''}
              onChange={(e) => setTreatmentToEdit({ ...treatmentToEdit, treatmentName: e.target.value })}
            />
            <h6 className="mt-3">Hospital ID</h6>
            <CFormInput
              type="text"
              value={treatmentToEdit?.hospitalId || ''}
              onChange={(e) => setTreatmentToEdit({ ...treatmentToEdit, hospitalId: e.target.value })}
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleUpdateTreatment}>
            Update
          </CButton>
          <CButton color="secondary" onClick={() => setEditTreatmentMode(false)}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>

      <ConfirmationModal
        isVisible={isModalVisible}
        message="Are you sure you want to delete this treatment?"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {loading ? (
        <div style={{ textAlign: 'center' }}>Loading...</div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <DataTable columns={columns} data={filteredData.length ? filteredData : treatment} pagination />
      )}
    </div>
  )
}

export default TreatmentsManagement
