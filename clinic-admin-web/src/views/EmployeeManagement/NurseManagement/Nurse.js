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
import { Edit2, Eye, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'

import NurseForm from './NurseForm'
import capitalizeWords from '../../../Utils/capitalizeWords'
import { useGlobalSearch } from '../../Usecontext/GlobalSearchContext'
import ConfirmationModal from '../../../components/ConfirmationModal'
import LoadingIndicator from '../../../Utils/loader'
import { addNurse, deleteNurse, getAllNurses, updateNurse } from './NurseAPI'
import { useHospital } from '../../Usecontext/HospitalContext'

const NurseManagement = () => {
  const [nurses, setNurses] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedNurse, setSelectedNurse] = useState(null)
  const [viewMode, setViewMode] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [modalData, setModalData] = useState(null)
  const [modalTVisible, setModalTVisible] = useState(false)

  const { searchQuery } = useGlobalSearch()
  const { user } = useHospital()
  const hospitalId = localStorage.getItem('HospitalId')

  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)

  // ---------------- Fetch Nurses ----------------
  const fetchNurses = async () => {
    setLoading(true)
    try {
      if (hospitalId) {
        const res = await getAllNurses(hospitalId)
        setNurses(res.data?.data || [])
      }
    } catch (err) {
      console.error('Error fetching nurses:', err)
      setNurses([])
      setError('Failed to fetch nurses.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNurses()
  }, [])

  // const cleanPayload = (data) => {
  //   const payload = { ...data }

  //   // Remove empty strings in top-level fields
  //   Object.keys(payload).forEach((key) => {
  //     if (
  //       payload[key] === '' ||
  //       payload[key] === null ||
  //       (Array.isArray(payload[key]) && payload[key].length === 0)
  //     ) {
  //       delete payload[key]
  //     }
  //   })

  //   // Nested objects (address, bankAccountDetails)
  //   if (payload.address) {
  //     Object.keys(payload.address).forEach((key) => {
  //       if (!payload.address[key]) delete payload.address[key]
  //     })
  //     if (Object.keys(payload.address).length === 0) delete payload.address
  //   }

  //   if (payload.bankAccountDetails) {
  //     Object.keys(payload.bankAccountDetails).forEach((key) => {
  //       if (!payload.bankAccountDetails[key]) delete payload.bankAccountDetails[key]
  //     })
  //     if (Object.keys(payload.bankAccountDetails).length === 0) delete payload.bankAccountDetails
  //   }

  //   return payload
  // }

  // ---------------- Save Nurse (Add / Edit) ----------------
  const handleSave = async (formData) => {
    try {
      if (selectedNurse) {
        // Update nurse
        // Construct full payload before PUT
        // const payload = {
        //   fullName: formData.fullName || null,
        //   gender: formData.gender || null,
        //   dateOfBirth: formData.dateOfBirth || null,
        //   nurseContactNumber: formData.nurseContactNumber || null,
        //   emailId: formData.emailId || null,
        //   governmentId: formData.governmentId || null,
        //   qualifications: formData.qualifications || null,
        //   dateOfJoining: formData.dateOfJoining || null,
        //   department: formData.department || null,
        //   yearsOfExperience: formData.yearsOfExperience || null,

        //   shiftTimingOrAvailability: formData.shiftTimingOrAvailability || null,
        //   emergencyContactNumber: formData.emergencyContactNumber || null,
        //   vaccinationStatus: formData.vaccinationStatus || null,
        //   previousEmploymentHistory: formData.previousEmploymentHistory || null,

        //   // Nested Address
        //   address: {
        //     houseNo: formData.address?.houseNo || null,
        //     street: formData.address?.street || null,
        //     landmark: formData.address?.landmark || null,
        //     city: formData.address?.city || null,
        //     state: formData.address?.state || null,
        //     postalCode: formData.address?.postalCode || null,
        //     country: formData.address?.country || null,
        //   },

        //   // Nested Bank Account Details
        //   bankAccountDetails: {
        //     accountNumber: formData.bankAccountDetails?.accountNumber || null,
        //     accountHolderName: formData.bankAccountDetails?.accountHolderName || null,
        //     ifscCode: formData.bankAccountDetails?.ifscCode || null,
        //     bankName: formData.bankAccountDetails?.bankName || null,
        //     branchName: formData.bankAccountDetails?.branchName || null,
        //     panCardNumber: formData.bankAccountDetails?.panCardNumber || null,
        //   },

        //   // Documents / Files
        //   medicalFitnessCertificate: decodeImage(formData.medicalFitnessCertificate || null),
        //   profilePicture: decodeImage(formData.profilePicture || null),
        //   nursingLicense: formData.nursingLicense || null,
        //   nursingDegreeOrDiplomaCertificate: formData.nursingDegreeOrDiplomaCertificate || null,
        //   nursingCouncilRegistration: formData.nursingCouncilRegistration || null,

        //   // Permissions
        //   permissions: formData.permissions || {},

        //   // You can include any other optional fields your backend expects
        // }

        // const payload = {
        //   fullName: formData.fullName || '',
        //   emailId: formData.emailId || '',
        //   nurseContactNumber: formData.nurseContactNumber || '',
        //   gender: formData.gender || '',
        //   dateOfBirth: formData.dateOfBirth || '',
        //   department: formData.department || '',
        //   yearsOfExperience: formData.yearsOfExperience || '',
        //   shiftTimingOrAvailability: formData.shiftTimingOrAvailability || '',
        //   vaccinationStatus: formData.vaccinationStatus || '',
        //   address: formData.address || {},
        //   bankAccountDetails: formData.bankAccountDetails || {},
        //   previousEmploymentHistory: formData.previousEmploymentHistory || '',
        //   governmentId: formData.governmentId || '',
        //   nursingCouncilRegistration: formData.nursingCouncilRegistration || '',
        //   dateOfJoining: formData.dateOfJoining || '',
        //   // medicalFitnessCertificate: formData.medicalFitnessCertificate || null,
        //   // profilePicture: formData.profilePicture || null,
        //   // nursingLicense: formData.nursingLicense || null,
        //   // nursingDegreeOrDiplomaCertificate: formData.nursingDegreeOrDiplomaCertificate || null,
        //   nursingCouncilRegistration: formData.nursingCouncilRegistration || null,

        //   // Permissions
        //   permissions: formData.permissions || {},
        // }

        // updateNurse(hospitalId, formData.id, payload)

        await updateNurse(hospitalId, selectedNurse.nurseId, formData)
        toast.success('Nurse updated successfully!')
      } else {
        // Add new nurse
        const res = await addNurse({ ...formData, hospitalId: hospitalId })
        toast.success('Nurse added successfully!')
        setModalData({
          username: res.data.data.userName,
          password: res.data.data.password,
        })
        setModalVisible(false)
        setModalTVisible(true)
      }

      fetchNurses()
      setSelectedNurse(null)
      setViewMode(false)
    } catch (err) {
      console.error('API error:', err)
      toast.error('❌ Failed to save nurse.')
    }
  }

  // ---------------- Delete Nurse ----------------
  const handleDelete = async (nurseId) => {
    const hospitalId = localStorage.getItem('HospitalId')
    try {
      await deleteNurse(hospitalId, nurseId)
      setNurses((prev) => prev.filter((n) => n.nurseId !== nurseId))
      toast.success('Nurse deleted successfully!')
    } catch (err) {
      console.error('Delete error:', err)
      toast.error('Failed to delete nurse.')
    } finally {
      setIsModalVisible(false)
      setDeleteId(null)
    }
  }

  // ---------------- Filter & Search ----------------
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
      // decode base64 string into normal string
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
            onClick={() => setModalVisible(true)}
          >
            Add Nurse
          </CButton>
        </div>
      )}

      {/* Credentials Modal */}
      <CModal visible={modalTVisible} backdrop="static" keyboard={false}>
        <CModalHeader>
          <h5>Nurse Credentials</h5>
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isVisible={isModalVisible}
        title="Delete Nurse"
        message="Are you sure you want to delete this nurse? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmColor="danger"
        cancelColor="secondary"
        onConfirm={() => handleDelete(deleteId)}
        onCancel={() => setIsModalVisible(false)}
      />

      {/* Loading / Error / Table */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center">
          <LoadingIndicator message="Loading nurses..." />
        </div>
      ) : error ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: '50vh' }}
        >
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

          <CTableBody style={{ color: 'var(--color-black)' }}>
            {displayData.length > 0 ? (
              displayData.map((nurse, index) => (
                <CTableRow key={nurse.nurseId} style={{ color: 'var(--color-black)' }}>
                  <CTableDataCell>{(currentPage - 1) * rowsPerPage + index + 1}</CTableDataCell>
                  <CTableDataCell>
                    {nurse.profilePicture ? (
                      <img
                        src={nurse.profilePicture} // ✅ decode first
                        alt={nurse.fullName}
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
                  <CTableDataCell style={{ color: 'var(--color-black)' }}>
                    {capitalizeWords(nurse.fullName)}
                  </CTableDataCell>
                  <CTableDataCell style={{ color: 'var(--color-black)' }}>
                    {capitalizeWords(nurse.nurseContactNumber)}
                  </CTableDataCell>
                  <CTableDataCell style={{ color: 'var(--color-black)' }}>
                    {capitalizeWords(nurse.gender)}
                  </CTableDataCell>
                  <CTableDataCell style={{ color: 'var(--color-black)' }}>
                    {nurse.qualifications || 'NA'}
                  </CTableDataCell>
                  <CTableDataCell style={{ color: 'var(--color-black)' }}>
                    {nurse.dateOfJoining}
                  </CTableDataCell>
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
                            setIsModalVisible(true)
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
                  colSpan="8"
                  className="text-center"
                  style={{ color: 'var(--color-black)' }}
                >
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
        nurses={nurses}
        fetchNurses={fetchNurses}
        viewMode={viewMode}
      />
    </div>
  )
}

export default NurseManagement
