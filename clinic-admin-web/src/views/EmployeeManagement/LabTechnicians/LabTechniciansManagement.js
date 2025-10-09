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
import LabTechnicianForm from './LabTechnicianForm '
import { Edit2, Eye, Trash2 } from 'lucide-react'
import capitalizeWords from '../../../Utils/capitalizeWords'
import { useGlobalSearch } from '../../Usecontext/GlobalSearchContext'
import ConfirmationModal from '../../../components/ConfirmationModal'
import LoadingIndicator from '../../../Utils/loader'
import {
  addLabTechnician,
  deleteLabTechnician,
  getAllLabTechnicians,
  updateLabTechnician,
} from './LabTechnicianAPI'
import { toast } from 'react-toastify'
import { useHospital } from '../../Usecontext/HospitalContext'
import { showToast } from '../../../Utils/Toaster'

const LabTechnicianManagement = () => {
  const [technicians, setTechnicians] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedTech, setSelectedTech] = useState(null)
  const [viewMode, setViewMode] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const { searchQuery, setSearchQuery } = useGlobalSearch()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  // ✅ Load from localStorage on mount
  const [modalData, setModalData] = useState(null) // store username & password
  const [modalTVisible, setModalTVisible] = useState(false)
  const fetchTechs = async () => {
    setLoading(true)
    try {
      const clinicID = localStorage.getItem('HospitalId')
      if (clinicID) {
        const res = await getAllLabTechnicians(clinicID) // wait for API
        console.log('API Response:', res)
        setLoading(false)
        // ✅ update state with actual data, not Promise
        setTechnicians(res.data?.data || [])
      }
    } catch (err) {
      console.error('❌ Error fetching Laboratorys:', err)
      setTechnicians([])
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchTechs()
  }, [])
  // ✅ Save (Add / Edit)

  // const handleSave = async (formData) => {
  //   try {
  //     if (selectedTech) {
  //       await updateLabTechnician(selectedTech.id, formData)
  //       fetchTechs()

  //       // setTechnicians((prev) => [...prev, res.data.data])
  //       toast.success('Technician updated successfully!')
  //     } else {
  //       const res = await addLabTechnician(formData)
  //       await fetchTechs() // refresh from API
  //       console.log(res)
  //       setModalData({
  //         username: res.data.data.userName,
  //         password: res.data.data.password,
  //       })
  //       if (res.status == 200) {
  //         setModalVisible(false)
  //         setModalTVisible(true)
  //         toast.success('Technician added successfully!')
  //       }
  //     }
  //   } catch (err) {
  //     toast.error('❌ Failed to save technician.')
  //     console.error('API error:', err)
  //   }
  // }

  const handleSave = async (formData) => {
    try {
      let res

      if (selectedTech) {
        // ✅ Update Technician
        res = await updateLabTechnician(selectedTech.id, formData)
        await fetchTechs()
        setModalVisible(false)
      } else {
        // ✅ Add Technician
        res = await addLabTechnician(formData)
      }

      // ✅ Handle Success (backend must explicitly return success)
      if (res.status === 201 || (res.status === 200 && res.data?.success)) {
        await fetchTechs()

        // ✅ If new technician, show credentials modal
        if (!selectedTech) {
          setModalData({
            username: res.data.data?.userName,
            password: res.data.data?.password,
          })
          setModalTVisible(true)
        }

        showToast(res.data?.message || 'Technician saved successfully!')

        setModalVisible(false)
        return
      }

      // ❌ Backend responded but with an error (e.g. status 409)
      showToast(res.data?.message || 'Failed to save technician.')
    } catch (err) {
      // ❌ API or network failure
      const backendMessage =
        err.response?.data?.message || err.response?.data?.error || '❌ Failed to save technician.'
      // showToast(backendMessage)
      console.error('API error:', err)
    }
  }

  // ✅ Delete
  const handleDelete = async (id) => {
    try {
      await deleteLabTechnician(id) // ✅ call backend
      setTechnicians((prev) => prev.filter((t) => t.id !== id))
      toast.success('Technician deleted successfully!')
    } catch (err) {
      toast.error('❌ Failed to delete technician.')
      console.error('Delete error:', err)
    } finally {
      setIsModalVisible(false) // close modal after action
    }
  }
  //permission
  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)
  //search
  const filteredData = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return technicians
    return technicians.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(q)),
    )
  }, [searchQuery, technicians])

  const displayData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
  //decode image
  const decodeImage = (data) => {
    try {
      // First decode the outer layer (the backend double-encoded it)
      const decoded = atob(data)

      // Now decoded string itself already includes 'data:image/jpeg;base64,...'
      return decoded
    } catch (e) {
      console.error('Error decoding image:', e)
      return '/assets/images/avatars/Laboratory.png'
    }
  }

  return (
    <div>
      {can('Lab Technician', 'create') && (
        <div
          className="mb-3 w-100"
          style={{ display: 'flex', justifyContent: 'end', alignContent: 'end', alignItems: 'end' }}
        >
          <CButton
            style={{
              color: 'var(--color-black)',
              backgroundColor: 'var(--color-bgcolor)',
            }}
            onClick={() => setModalVisible(true)}
          >
            Add Technician
          </CButton>
        </div>
      )}
      <CModal visible={modalTVisible} backdrop="static" keyboard={false}>
        <CModalHeader>
          <h5>Technician Credentials</h5>
        </CModalHeader>
        <CModalBody>
          {modalData ? (
            <div>
              <p>
                <strong>Username:</strong> {modalData.username}
              </p>
              <p>
                <strong>Password:</strong> {modalData.password}
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
              setModalTVisible(false)
              setModalData(null)
            }}
          >
            Close
          </CButton>
        </CModalFooter>
      </CModal>
      <ConfirmationModal
        isVisible={isModalVisible}
        title="Delete Technician"
        message="Are you sure you want to delete this technician? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmColor="danger"
        cancelColor="secondary"
        onConfirm={() => handleDelete(deleteId)} // ✅ pass id here
        onCancel={() => setIsModalVisible(false)} // ✅ just close modal
      />
      {/* <CButton color="primary" onClick={() => setModalVisible(true)}>
  
      </CButton> */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center">
          <LoadingIndicator message="Loading technician..." />
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
        <CTable className="mt-3" striped hover responsive>
          <CTableHead>
            <CTableRow className="pink-table  w-auto">
              <CTableHeaderCell>#</CTableHeaderCell>
              <CTableHeaderCell>Photo</CTableHeaderCell> {/* 👈 New Column */}
              <CTableHeaderCell>Name</CTableHeaderCell>
              <CTableHeaderCell>Contact</CTableHeaderCell>
              <CTableHeaderCell>Sex</CTableHeaderCell>
              <CTableHeaderCell>Specialization</CTableHeaderCell>
              <CTableHeaderCell>Date Of Joining</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody className="pink-table">
            {displayData.length > 0 ? (
              displayData.map((tech, index) => (
                <CTableRow key={tech.id}>
                  <CTableDataCell>{(currentPage - 1) * rowsPerPage + index + 1}</CTableDataCell>
                  <CTableDataCell>
                    {tech.profilePicture ? (
                      <img
                        src={tech.profilePicture} // ✅ use directly, no decodeImage()
                        alt={tech.fullName}
                        width="40"
                        height="40"
                        style={{
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '1px solid var(--color-black)',
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

                  <CTableDataCell>{capitalizeWords(tech.fullName)}</CTableDataCell>
                  <CTableDataCell>{capitalizeWords(tech.contactNumber)}</CTableDataCell>
                  <CTableDataCell>{capitalizeWords(tech.gender)}</CTableDataCell>
                  <CTableDataCell>{tech.specialization || 'NA'}</CTableDataCell>

                  <CTableDataCell>{tech.dateOfJoining}</CTableDataCell>

                  <CTableDataCell className="text-end">
                    <div className="d-flex justify-content-end gap-2  ">
                      {can('Lab Technician', 'read') && (
                        <button
                          className="actionBtn"
                          onClick={() => {
                            setSelectedTech(tech)
                            setViewMode(true)
                            setModalVisible(true)
                          }}
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                      )}
                      {can('Lab Technician', 'update') && (
                        <button
                          className="actionBtn"
                          onClick={() => {
                            setSelectedTech(tech)
                            setViewMode(false)
                            setModalVisible(true)
                          }}
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                      )}
                      {can('Lab Technician', 'delete') && (
                        <button
                          className="actionBtn"
                          onClick={() => {
                            setDeleteId(tech.id) // store id
                            setIsModalVisible(true) // show confirmation modal
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
                <CTableDataCell
                  colSpan="9"
                  className="text-center"
                  style={{ color: 'var(--color-black)' }}
                >
                  No Laboratory found.
                </CTableDataCell>
              </CTableRow>
              //   <CTableRow>
              //     <CTableDataCell colSpan={5} className="text-center text-muted">
              //       🔍 No technician found matching "<b>{searchQuery}</b>"
              //     </CTableDataCell>
              //   </CTableRow>
            )}
          </CTableBody>
        </CTable>
      )}
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
      <LabTechnicianForm
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false)
          setSelectedTech(null)
          setViewMode(false)
        }}
        onSave={handleSave}
        initialData={selectedTech}
        viewMode={viewMode}
        technicians={technicians}
        fetchTechs={fetchTechs}
      />
    </div>
  )
}

export default LabTechnicianManagement
