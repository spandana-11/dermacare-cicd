import React, { useState } from 'react'
import {
  CContainer,
  CRow,
  CCol,
  CInputGroup,
  CFormInput,
  CInputGroupText,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilPlus, cilTrash, cilPencil } from '@coreui/icons'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const NurseManagement = () => {
  // ✅ Dummy Data
  const [nurses, setNurses] = useState([
    { id: 1, name: 'Anita Rao', email: 'anita@nurse.com', phone: '9876543210', shift: 'Morning' },
    { id: 2, name: 'Suresh Patel', email: 'suresh@nurse.com', phone: '9123456789', shift: 'Evening' },
    { id: 3, name: 'Fatima Khan', email: 'fatima@nurse.com', phone: '9988776655', shift: 'Night' },
  ])

  const [search, setSearch] = useState('')
  const [formData, setFormData] = useState({ id: null, name: '', email: '', phone: '', shift: '' })
  const [modalVisible, setModalVisible] = useState(false)
  const [viewData, setViewData] = useState(null)

  // ✅ Add / Edit
  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill required fields')
      return
    }
    if (formData.id) {
      // Edit
      setNurses(nurses.map((n) => (n.id === formData.id ? formData : n)))
      toast.success('Nurse updated successfully')
    } else {
      // Add
      setNurses([{ ...formData, id: Date.now() }, ...nurses])
      toast.success('Nurse added successfully')
    }
    setFormData({ id: null, name: '', email: '', phone: '', shift: '' })
    setModalVisible(false)
  }

  // ✅ Delete
  const handleDelete = (id) => {
    setNurses(nurses.filter((n) => n.id !== id))
    toast.info('Nurse deleted')
  }

  // ✅ Filter by search
  const filtered = nurses.filter(
    (n) =>
      n.name.toLowerCase().includes(search.toLowerCase()) ||
      n.email.toLowerCase().includes(search.toLowerCase()) ||
      n.phone.includes(search),
  )

  return (
    <CContainer className="p-4">
      <ToastContainer />
      <CRow className="mb-3 align-items-center">
        <CCol md={6}>
          <CInputGroup>
            <CFormInput
              placeholder="Search nurses by name, email or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <CInputGroupText>
              <CIcon icon={cilSearch} />
            </CInputGroupText>
          </CInputGroup>
        </CCol>
        <CCol md={6} className="text-end">
          <CButton
  color="info"
  className="text-white"
  onClick={() => {
    setFormData({ id: null, name: '', email: '', phone: '', shift: '' }) // reset form
    setModalVisible(true)
  }}
>
  <CIcon icon={cilPlus} /> Add Nurse
</CButton>

        </CCol>
      </CRow>

      <CTable striped responsive>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>Name</CTableHeaderCell>
            <CTableHeaderCell>Email</CTableHeaderCell>
            <CTableHeaderCell>Phone</CTableHeaderCell>
            <CTableHeaderCell>Shift</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {filtered.length > 0 ? (
            filtered.map((n, idx) => (
              <CTableRow key={n.id}>
                <CTableDataCell>{idx + 1}</CTableDataCell>
                <CTableDataCell>{n.name}</CTableDataCell>
                <CTableDataCell>{n.email}</CTableDataCell>
                <CTableDataCell>{n.phone}</CTableDataCell>
                <CTableDataCell>{n.shift}</CTableDataCell>
                <CTableDataCell>
                  <CButton
                    size="sm"
                    color="info"
                    className="me-2 text-white"
                    onClick={() => setViewData(n)}
                  >
                    View
                  </CButton>
                  <CButton
                    size="sm"
                    color="warning"
                    className="me-2 text-white"
                    onClick={() => {
                      setFormData(n)
                      setModalVisible(true)
                    }}
                  >
                    <CIcon icon={cilPencil} />
                  </CButton>
                  <CButton size="sm" color="danger" onClick={() => handleDelete(n.id)}>
                    <CIcon icon={cilTrash} />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))
          ) : (
            <CTableRow>
              <CTableDataCell colSpan={6} className="text-center text-danger">
                No nurses found.
              </CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable>

      {/* Add/Edit Modal */}
 {/* Add/Edit Modal */}
<CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
  <CModalHeader>
    <CModalTitle>{formData.id ? 'Edit Nurse' : 'Add Nurse'}</CModalTitle>
  </CModalHeader>
  <CModalBody>
    <div className="mb-3">
      <label className="form-label">Name</label>
      <CFormInput
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
    </div>

    <div className="mb-3">
      <label className="form-label">Email</label>
      <CFormInput
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
    </div>

    <div className="mb-3">
      <label className="form-label">Phone</label>
      <CFormInput
        type="tel"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
      />
    </div>

    <div className="mb-3">
      <label className="form-label">Shift</label>
      <CFormInput
        value={formData.shift}
        onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
      />
    </div>
  </CModalBody>
  <CModalFooter>
    <CButton color="secondary" onClick={() => setModalVisible(false)}>
      Cancel
    </CButton>
    <CButton color="info" className="text-white" onClick={handleSave}>
      Save
    </CButton>
  </CModalFooter>
</CModal>


      {/* View Modal */}
      <CModal visible={!!viewData} onClose={() => setViewData(null)}>
        <CModalHeader>
          <CModalTitle>Nurse Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p><strong>Name:</strong> {viewData?.name}</p>
          <p><strong>Email:</strong> {viewData?.email}</p>
          <p><strong>Phone:</strong> {viewData?.phone}</p>
          <p><strong>Shift:</strong> {viewData?.shift}</p>
        </CModalBody>
      </CModal>
    </CContainer>
  )
}

export default NurseManagement
