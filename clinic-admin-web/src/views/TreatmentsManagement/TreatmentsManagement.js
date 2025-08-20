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
import {
  deleteTreatmentData,
  postTreatmentData,
  TreatmentData,

  TreatmentDataById,

  updateTreatmentData,
} from './TreatmentsManagementAPI'

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
  const [errors, setErrors] = useState({})

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [treatmentIdToDelete, setTreatmentIdToDelete] = useState(null)
  const [hospitalIdToDelete, setHospitalIdToDelete] = useState(null)

  const [newTreatment, setNewTreatment] = useState({ treatmentName: '' })

  const hospitalId = localStorage.getItem('HospitalId')

  // Normalize API data to have consistent IDs
  const normalizeTreatments = (data) =>
    data.map((item) => ({
      ...item,
      id: item.id || item._id,
    }))

  // Fetch data
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
  const fetchDataBy_HId = async (hospitalId) => {
    setLoading(true)
    try {
      const response = await TreatmentDataById(hospitalId)
      setTreatment(normalizeTreatments(response.data))
    } catch (error) {
      setError('Failed to fetch treatment data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // fetchData()
    fetchDataBy_HId(hospitalId)
  }, [])

  // Search filter
  useEffect(() => {
    const trimmedQuery = searchQuery.toLowerCase().trim()
    if (!trimmedQuery) {
      setFilteredData([])
      return
    }
    const filtered = treatment.filter((t) =>
      t.treatmentName?.toLowerCase().includes(trimmedQuery),
    )
    setFilteredData(filtered)
  }, [searchQuery, treatment])

  // Delete confirm
  const handleConfirmDelete = async () => {
    try {
      await deleteTreatmentData(treatmentIdToDelete, hospitalIdToDelete)
      toast.success('Treatment deleted successfully!', { position: 'top-right' })
      // fetchData()
      fetchDataBy_HId(hospitalId)
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

  // Add treatment
  const handleAddTreatment = async () => {
    if (!newTreatment.treatmentName.trim()) {
      setErrors({ treatmentName: 'Treatment name is required.' })
      return
    }

    try {
      const payload = {
        treatmentName: newTreatment.treatmentName,
        hospitalId: hospitalId,
      }

      await postTreatmentData(payload)
      toast.success('Treatment added successfully!')
      // fetchData()
      fetchDataBy_HId(hospitalId)
      setModalVisible(false)
      setNewTreatment({ treatmentName: '' })
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.statusText ||
        'An unexpected error occurred.'
      const statusCode = error.response?.status
      if (statusCode === 409 || errorMessage.toLowerCase().includes('duplicate')) {
        toast.error(
          `Error: Duplicate treatment name - ${newTreatment.treatmentName} already exists!`,
          { position: 'top-right' },
        )
      } else {
        toast.error(`Error adding treatment: ${errorMessage}`, { position: 'top-right' })
      }
    }
  }

  // Edit treatment
  const handleTreatmentEdit = (treatment) => {
    setTreatmentToEdit(treatment)
    setEditTreatmentMode(true)
  }

  const handleUpdateTreatment = async () => {
    const { id: treatmentId, hospitalId, treatmentName } = treatmentToEdit

    if (!treatmentName.trim()) {
      toast.error('Treatment name is required.')
      return
    }

    try {
      await updateTreatmentData(
        { treatmentName: treatmentName.trim(), hospitalId: hospitalId.trim() },
        treatmentId,
        hospitalId,
      )

      toast.success('Treatment updated successfully!')
      setEditTreatmentMode(false)
      // fetchData()
      fetchDataBy_HId(hospitalId)
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Failed to update treatment.')
    }
  }

  // Delete handler
  const handleTreatmentDelete = (treatment) => {
    setTreatmentIdToDelete(treatment.treatmentId || treatment.id || treatment._id)
    setHospitalIdToDelete(treatment.hospitalId)
    setIsModalVisible(true)
  }

  // Table columns
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
          <div
            onClick={() => handleTreatmentDelete(row)}
            style={{ color: 'red', cursor: 'pointer' }}
          >
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
        <CModal visible={!!viewTreatment} onClose={() => setViewTreatment(null)} backdrop="static">
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
            {/* <CRow className="mb-3">
              <CCol sm={4}>
                <strong>Hospital ID:</strong>
              </CCol>
              <CCol sm={8}>{viewTreatment.hospitalId}</CCol>
            </CRow> */}
          </CModalBody>
        </CModal>
      )}

      {/* Add Modal */}
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
              onChange={(e) => {
                const value = e.target.value
                setNewTreatment({ ...newTreatment, treatmentName: value })
                if (errors.treatmentName) {
                  setErrors((prev) => ({ ...prev, treatmentName: '' }))
                }
              }}
              placeholder="Enter Treatment Name"
              className={errors.treatmentName ? 'is-invalid' : ''}
            />
            {errors.treatmentName && (
              <div className="invalid-feedback" style={{ color: 'red' }}>
                {errors.treatmentName}
              </div>
            )}
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

      {/* Edit Modal */}
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
              onChange={(e) =>
                setTreatmentToEdit({ ...treatmentToEdit, treatmentName: e.target.value })
              }
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

      {/* Delete Confirmation */}
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
        <DataTable
          columns={columns}
          data={filteredData.length ? filteredData : treatment}
          pagination
        />
      )}
    </div>
  )
}
export default TreatmentsManagement
