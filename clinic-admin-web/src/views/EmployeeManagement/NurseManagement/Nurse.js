import React, { useEffect, useState } from 'react'
import {
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import NurseForm from './NurseForm'
import capitalizeWords from '../../../Utils/capitalizeWords'
import { useGlobalSearch } from '../../Usecontext/GlobalSearchContext'
import ConfirmationModal from '../../../components/ConfirmationModal'
import LoadingIndicator from '../../../Utils/loader'
import { addNurse, deleteNurse, getAllNurses, updateNurse } from './NurseAPI'
import { toast } from 'react-toastify'
import { useHospital } from '../../Usecontext/HospitalContext'
import { Edit2, Eye, Trash2 } from 'lucide-react'

const NurseManagement = () => {
  const [nurses, setNurses] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedNurse, setSelectedNurse] = useState(null)
  const [viewMode, setViewMode] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage] = useState(10)
  const { searchQuery } = useGlobalSearch()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)

  // New state for credentials modal
  const [credentialsModalVisible, setCredentialsModalVisible] = useState(false)
  const [credentials, setCredentials] = useState(null)

  // Fetch nurses
  const fetchNurses = async () => {
    setLoading(true)
    try {
      const clinicID = localStorage.getItem('HospitalId')
      if (clinicID) {
        const res = await getAllNurses(clinicID)
        setNurses(res.data?.data || [])
      }
    } catch (err) {
      console.error('Error fetching nurses:', err)
      setNurses([])
      setError('Failed to load nurses.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNurses()
  }, [])

  // Save nurse (Add / Edit)
  const handleSave = async (formData) => {
    setLoading(true)
    try {
      const hospitalId = localStorage.getItem('HospitalId')
      if (selectedNurse) {
        // Update nurse
        await updateNurse(hospitalId, selectedNurse.nurseId, formData)
        toast.success('Nurse updated successfully!')
      } else {
        // Add new nurse
        const res = await addNurse(formData)
        if (res.data?.data?.userName && res.data?.data?.password) {
          setCredentials({
            username: res.data.data.userName,
            password: res.data.data.password,
          })
          setCredentialsModalVisible(true) // Open credentials modal
        }
        toast.success('Nurse added successfully!')
      }
      fetchNurses() // Refresh the list
      setModalVisible(false) // Close the form modal
      setSelectedNurse(null) // Reset selected nurse
      setViewMode(false) // Reset view mode
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data?.message || 'Failed to save nurse.')
      } else {
        toast.error('Failed to save nurse.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Delete nurse
  const handleDelete = async (nurseId) => {
    try {
      const hospitalId = localStorage.getItem('HospitalId')
      if (!hospitalId || !nurseId) {
        toast.error('Missing hospitalId or nurseId')
        return
      }
      await deleteNurse(hospitalId, nurseId)
      setNurses((prev) => prev.filter((n) => n.nurseId !== nurseId))
      toast.success('Nurse deleted successfully!')
    } catch (err) {
      toast.error('Failed to delete nurse.')
      console.error('Delete error:', err)
    } finally {
      setIsConfirmationModalVisible(false)
    }
  }

  // Filter & search
  const filteredData = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return nurses
    return nurses.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(q)),
    )
  }, [searchQuery, nurses])

  const displayData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  const decodeImage = (data) => {
    try {
      return atob(data)
    } catch {
      return null
    }
  }

  return (
    <div>
      {/* Add Nurse Button */}
      {can('Nurses', 'create') && (
        <div className="mb-3 d-flex justify-content-end">
          <CButton
            style={{ color: 'var(--color-black)', backgroundColor: 'var(--color-bgcolor)' }}
            onClick={() => {
              setSelectedNurse(null)
              setViewMode(false)
              setModalVisible(true)
            }}
          >
            Add Nurse
          </CButton>
        </div>
      )}

      {/* Credentials Modal */}
      <CModal visible={credentialsModalVisible} backdrop="static" keyboard={false}>
        <CModalHeader>
          <h5>Nurse Credentials</h5>
        </CModalHeader>
        <CModalBody>
          {credentials ? (
            <div>
              <p>
                <strong>Username:</strong> {credentials.username}
              </p>
              <p>
                <strong>Password:</strong> {credentials.password}
              </p>
              <small className="text-danger">
                ⚠️ Please save these credentials securely. They will not be shown again.
              </small>
            </div>
          ) : (
            <p>No data available</p>
          )}
        </CModalBody>
        <CModalFooter>
         <CButton
  color="primary"
  onClick={() => {
    setCredentialsModalVisible(false)
    setCredentials(null) // Clear credentials after showing
  }}
>
  Close
</CButton>

        </CModalFooter>
      </CModal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isVisible={isConfirmationModalVisible}
        title="Delete Nurse"
        message="Are you sure you want to delete this nurse? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmColor="danger"
        cancelColor="secondary"
        onConfirm={() => handleDelete(deleteId)}
        onCancel={() => setIsConfirmationModalVisible(false)}
      />

      {/* Loading / Error / Table */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center">
          <LoadingIndicator message="Loading nurses..." />
        </div>
      ) : error ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          {error}
        </div>
      ) : (
        <CTable className="mt-3" striped hover responsive>
          <CTableHead>
            <CTableRow className="pink-table">
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Photo</CTableHeaderCell>
              <CTableHeaderCell>Name</CTableHeaderCell>
              <CTableHeaderCell>Contact</CTableHeaderCell>
              <CTableHeaderCell>Sex</CTableHeaderCell>
              <CTableHeaderCell>Qualification</CTableHeaderCell>
              <CTableHeaderCell>Date Of Joining</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody>
            {displayData.length > 0 ? (
              displayData.map((nurse, index) => (
                <CTableRow key={nurse.nurseId}>
                  <CTableDataCell>{(currentPage - 1) * rowsPerPage + index + 1}</CTableDataCell>
                  <CTableDataCell>
                    {nurse.profilePicture ? (
                    <img
  src={
    nurse.profilePicture
      ? (nurse.profilePicture.startsWith("data:")
          ? nurse.profilePicture // already full data URL
          : `data:image/png;base64,${nurse.profilePicture}`) // add prefix
      : "/assets/images/default-avatar.png"
  }
  alt={nurse.fullName || "No profile"}
  width="40"
  height="40"
  style={{
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid var(--color-black)",
  }}
/>

                    ) : (
                      <img
                        src="/assets/images/default-avatar.png"
                        alt="No profile"
                        width="40"
                        height="40"
                        style={{
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '1px solid var(--color-black)',
                        }}
                      />
                    )}
                  </CTableDataCell>
                  <CTableDataCell>{capitalizeWords(nurse.fullName)}</CTableDataCell>
                  <CTableDataCell>{capitalizeWords(nurse.nurseContactNumber)}</CTableDataCell>
                  <CTableDataCell>{capitalizeWords(nurse.gender)}</CTableDataCell>
                  <CTableDataCell>{nurse.qualifications || 'NA'}</CTableDataCell>
                  <CTableDataCell>{nurse.dateOfJoining}</CTableDataCell>
                  <CTableDataCell className="text-end">
                    <div className="d-flex justify-content-end gap-2">
                      {can('Nurses', 'read') && (
                        <button
                          className="actionBtn"
                          onClick={() => {
                            setSelectedNurse(nurse)
                            setViewMode(true)
                            setModalVisible(true)
                          }}
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                      )}
                      {can('Nurses', 'update') && (
                        <button
                          className="actionBtn"
                          onClick={() => {
                            setSelectedNurse(nurse)
                            setViewMode(false)
                            setModalVisible(true)
                          }}
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                      )}
                      {can('Nurses', 'delete') && (
                        <button
                          className="actionBtn"
                          onClick={() => {
                            setDeleteId(nurse.nurseId)
                            setIsConfirmationModalVisible(true)
                          }}
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ))
            ) : (
              <CTableRow>
                <CTableDataCell colSpan="8" className="text-center">
                  No nurse found.
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

      {/* Nurse Form Modal */}
      <NurseForm
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false)
          setSelectedNurse(null)
          setViewMode(false)
        }}
        onSave={handleSave}
        initialData={selectedNurse}
        viewMode={viewMode}
      />
    </div>
  )
}

export default NurseManagement