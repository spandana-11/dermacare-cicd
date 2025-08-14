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
import { deleteTestData, postTestData, TestData, updateTestData } from './TestsManagementAPI'

const TestsManagement = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [test, setTest] = useState([])

  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [viewTest, setViewTest] = useState(null)
  const [editTestMode, setEditTestMode] = useState(false)
  const [testToEdit, setTestToEdit] = useState(null)
 const [errors, setErrors] = useState({})
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [testIdToDelete, setTestIdToDelete] = useState(null)
  const [newTest, setNewTest] = useState({ testName: '', hospitalId: '' })
const [hospitalIdToDelete, setHospitalIdToDelete] = useState(null)

  const normalizeTests = (data) =>
    data.map((item) => ({
      ...item,
      id: item.id || item._id, // fallback
    }))

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await TestData()
      setTest(normalizeTests(response.data))
    } catch (error) {
      setError('Failed to fetch test data.')
    } finally {
      setLoading(false)
    }
  }

const handleConfirmDelete = async () => {
  try {
    await deleteTestData(testIdToDelete, hospitalIdToDelete)
    toast.success('Test deleted successfully!', { position: 'top-right' })
    fetchData()
  } catch (error) {
    toast.error('Failed to delete test.')
    console.error('Delete error:', error)
  }
  setIsModalVisible(false)
}

  const handleCancelDelete = () => {
  setTestIdToDelete(null)
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
    const filtered = test.filter((t) => t.testName?.toLowerCase().includes(trimmedQuery))
    setFilteredData(filtered)
  }, [searchQuery, test])

 const validateForm = () => {
  const newErrors = {}
  if (!newTest.testName.trim()) newErrors.testName = 'Test name is required.'
  if (!newTest.hospitalId.trim()) newErrors.hospitalId = 'Hospital ID is required.'
  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}

  const handleEditClick = (test) => {
    setSelectedTest({
      ...test, // includes testId
      hospitalId,
    })
    setModalVisible(true)
  }
  const isValidObjectId = (id) => /^[a-f\d]{24}$/i.test(id)

  const handleAddTest = async () => {
    if (!validateForm()) return
    try {
      const payload = {
        testName: newTest.testName,
        hospitalId: newTest.hospitalId,
      }

      await postTestData(payload)
      toast.success('Test added successfully!')
      fetchData()
      setModalVisible(false)
      setNewTest({ testName: '', hospitalId: '' })
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.statusText ||
        'An unexpected error occurred.'
      const statusCode = error.response?.status
      if (statusCode === 409 || errorMessage.toLowerCase().includes('duplicate')) {
        toast.error(`Error: Duplicate test name - ${newTest.testName} already exists!`, {
          position: 'top-right',
        })
      } else {
        toast.error(`Error adding test: ${errorMessage}`, { position: 'top-right' })
      }
    }
  }

  const handleTestEdit = (test) => {
    setTestToEdit(test) // test should have `id` and `hospitalId`
    setEditTestMode(true)
  }

  const handleUpdateTest = async () => {
    const { id: testId, hospitalId } = testToEdit

    try {
      await updateTestData(testToEdit, testId, hospitalId)
      toast.success('Test updated successfully!')
      setEditTestMode(false)
      fetchData()
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Failed to update test.')
    }
  }

 const handleTestDelete = (test) => {
  setTestIdToDelete(test.testId || test.id || test._id) // depending on your API structure
  setHospitalIdToDelete(test.hospitalId)
  setIsModalVisible(true)
}


  const columns = [
    {
      name: 'S.No',
      selector: (row, index) => index + 1,
      width: '10%',
    },
    {
      name: 'Test Name',
      selector: (row) => row.testName,
      sortable: true,
      width: '45%',
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '250px' }}>
          <div onClick={() => setViewTest(row)} style={{ color: 'green', cursor: 'pointer' }}>
            View
          </div>
          <div onClick={() => handleTestEdit(row)} style={{ color: 'blue', cursor: 'pointer' }}>
            Edit
          </div>
          <div onClick={() => handleTestDelete(row)} style={{ color: 'red', cursor: 'pointer' }}>
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
            placeholder="Search by Test Name"
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
          Add Test
        </CButton>
      </CForm>

      {viewTest && (
        <CModal visible={!!viewTest} onClose={() => setViewTest(null)}>
          <CModalHeader>
            <CModalTitle>Test Details</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CRow className="mb-3">
              <CCol sm={4}>
                <strong>Test Name:</strong>
              </CCol>
              <CCol sm={8}>{viewTest.testName}</CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol sm={4}>
                <strong>Hospital ID:</strong>
              </CCol>
              <CCol sm={8}>{viewTest.hospitalId}</CCol>
            </CRow>
          </CModalBody>
        </CModal>
      )}

      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Add New Test</CModalTitle>
        </CModalHeader>
        <CModalBody>
       <CForm>
  <h6>
    Test Name <span style={{ color: 'red' }}>*</span>
  </h6>
  <CFormInput
    type="text"
    name="testName"
    value={newTest.testName}
  
     onChange={(e) => {
                const value = e.target.value
                setNewTest({ ...newTest, testName: value })

                // Clear error for this field as the user types
                if (errors.testName) {
                  setErrors((prev) => ({ ...prev, testName: '' }))
                }
              }}
              placeholder="Enter test name"
              className={errors.testName ? 'is-invalid' : ''}
            />
            {errors.testName && (
              <div className="invalid-feedback" style={{ color: 'red' }}>
                {errors.testName}
              </div>
            )}

  <h6 className="mt-3">
    Hospital ID <span style={{ color: 'red' }}>*</span>
  </h6>
  <CFormInput
    type="text"
    name="hospitalId"
    value={newTest.hospitalId}
  //   onChange={(e) => setNewTest({ ...newTest, hospitalId: e.target.value })}
  // />
  onChange={(e) => {
                const value = e.target.value
                setNewTest({ ...newTest, hospitalId: value })

                // Clear error for this field as the user types
                if (errors.hospitalId) {
                  setErrors((prev) => ({ ...prev, hospitalId: '' }))
                }
              }}
              placeholder="Enter Hospital Id"
              className={errors.hospitalId ? 'is-invalid' : ''}
            />
            {errors.hospitalId && (
              <div className="invalid-feedback" style={{ color: 'red' }}>
                {errors.hospitalId}
              </div>
            )}
</CForm>

        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleAddTest}>
            Add
          </CButton>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={editTestMode} onClose={() => setEditTestMode(false)} backdrop="static">
        <CModalHeader>
          <CModalTitle>Edit Test</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <h6>Test Name</h6>
            <CFormInput
              type="text"
              value={testToEdit?.testName || ''}
              onChange={(e) => setTestToEdit({ ...testToEdit, testName: e.target.value })}
            />
            <h6 className="mt-3">Hospital ID</h6>
            <CFormInput
  type="text"
  value={testToEdit?.hospitalId || ''}
  onChange={(e) => setTestToEdit({ ...testToEdit, hospitalId: e.target.value })}
/>
   </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleUpdateTest}>
            Update
          </CButton>
          <CButton color="secondary" onClick={() => setEditTestMode(false)}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>

      <ConfirmationModal
        isVisible={isModalVisible}
        message="Are you sure you want to delete this test?"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {loading ? (
        <div style={{ textAlign: 'center' }}>Loading...</div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <DataTable columns={columns} data={filteredData.length ? filteredData : test} pagination />
      )}
    </div>
  )
}

export default TestsManagement
