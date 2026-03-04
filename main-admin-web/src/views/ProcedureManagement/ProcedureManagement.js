import React, { useEffect, useState } from 'react'
import {
  CFormInput,
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CModalTitle,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CPagination,
  CPaginationItem,
  CCard,
  CCardHeader, CFormSelect,
  CInputGroupText,
  CForm,
  CInputGroup
} from '@coreui/react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
  createProcedure,
  getAllProcedures,
  updateProcedure,
  deleteProcedure,
} from './ProcedureAPI'
import LoadingIndicator from '../../Utils/loader'
import ConfirmationModal from '../../components/ConfirmationModal'
import { Edit2, Eye, Trash2 } from 'lucide-react'
import { COLORS } from '../../Constant/Themes'
import CIcon from '@coreui/icons-react'
import { cilSearch } from '@coreui/icons'

const ProcedureManagement = () => {
  const [procedures, setProcedures] = useState([])
  const [procedureInput, setProcedureInput] = useState('')
  const [tempProcedures, setTempProcedures] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [viewModal, setViewModal] = useState(false)
  const [selectedProcedure, setSelectedProcedure] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [editProcedureId, setEditProcedureId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [errors, setErrors] = useState({ procedure: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [delloading, setDelLoading] = useState(false)

  const PROCEDURE_REGEX = /^[A-Za-z0-9]+([A-Za-z0-9\s\-\&\/\+\(\)\.\,\:\%\']*)$/;

  useEffect(() => {
    fetchProcedures()
  }, [])

  const fetchProcedures = async () => {
    setLoading(true)
    try {
      const response = await getAllProcedures()
      const formatted = response.map((proc) => ({ id: proc.procedureId, name: proc.procedureName }))
      setProcedures(formatted)
    } catch (error) {
      toast.error('Failed to fetch procedures')
    }
    setLoading(false)
  }

  /* ===========================
      ADD PROCEDURE TO TEMP LIST
     =========================== */
  const handleAddToTemp = () => {
    const trimmed = procedureInput.trim()
    if (!trimmed) {
      setErrors({ procedure: 'Procedure name is required' })
      return
    }
    if (!PROCEDURE_REGEX.test(trimmed)) {
      setErrors({
        procedure:
          'Only letters, spaces, -, /, + and () are allowed.',
      })
      return
    }

    // ❗ In EDIT MODE → do NOT use temp list
    if (editMode) return

    if (tempProcedures.some(p => p.toLowerCase() === trimmed.toLowerCase())) {
      setErrors({ procedure: 'Procedure already added' })
      return
    }

    setTempProcedures([...tempProcedures, trimmed])
    setProcedureInput('')
    setErrors({ procedure: '' })
  }

  const handleUpdateProcedure = async () => {
    if (!procedureInput.trim()) {
      setErrors({ procedure: 'Procedure name is required' })
      return
    }

    try {
      const res = await updateProcedure(editProcedureId, {
        procedureName: procedureInput.trim(),
      })
      // ✅ Use backend success message
      if (res?.success === false) {
        toast.error(res.message || 'Failed to update procedure')
        return
      }
      toast.success(res?.message || 'Procedure updated successfully')
      fetchProcedures()
      setShowModal(false)
      setEditMode(false)
      setProcedureInput('')
    } catch (err) {
      // ✅ Use backend error message
      toast.error(
        err?.response?.data?.message || 'Failed to update procedure'
      )
    }
  }
  /* ===========================
      SUBMIT ALL TEMP PROCEDURES
     =========================== */
  const handleSubmitAll = async () => {
    if (tempProcedures.length === 1) {
      try {
        const name = tempProcedures[0];
        const res = await createProcedure({ procedureName: name });

        if (res?.success === false) {
          toast.error(res.message || `${name} failed`);
        } else {
          toast.success(res?.message || 'Procedure added successfully');
        }
      } catch (err) {
        toast.error(err?.response?.data?.message || `Failed to add ${name}`);
      }
    } else {
      // multiple add (same code you already wrote)
      let successCount = 0;
      let failCount = 0;
      let failedMessages = [];

      for (const name of tempProcedures) {
        try {
          const res = await createProcedure({ procedureName: name });

          if (res?.success === false) {
            failCount++;
            failedMessages.push(res.message || `${name} failed`);
          } else {
            successCount++;
          }
        } catch (err) {
          failCount++;
          failedMessages.push(err?.response?.data?.message || `Failed to add ${name}`);
        }
      }

      if (successCount > 0 && failCount === 0) {
        toast.success(`${successCount} procedures added successfully`);
      } else if (successCount > 0) {
        toast.warn(`${successCount} added, errors: ${failedMessages.join(', ')}`);
      } else {
        toast.error(failedMessages.join(', '));
      }
    }

    fetchProcedures();
    setTempProcedures([]);
    setShowModal(false);
  };

  const handleView = (procedure) => {
    setSelectedProcedure(procedure)
    setViewModal(true)
  }

  const handleEdit = (procedure) => {
    setEditMode(true)
    setEditProcedureId(procedure.id)
    setProcedureInput(procedure.name)
    setShowModal(true)
  }

  const confirmDelete = (id) => {
    setDeleteId(id)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    try {
      setDelLoading(true)
      await deleteProcedure(deleteId)
      toast.success('Procedure deleted successfully')
      fetchProcedures()
    } catch {
      toast.error('Failed to delete procedure')
    }
    setDelLoading(false)
    setShowDeleteModal(false)
  }
  const filteredProcedures = procedures.filter((proc) =>
    proc.name.toLowerCase().includes(searchTerm.toLowerCase())
  )


  const totalPages = Math.max(
    1,
    Math.ceil(filteredProcedures.length / itemsPerPage)
  )

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage

  const currentItems = filteredProcedures.slice(
    indexOfFirstItem,
    indexOfLastItem
  )
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages])


  return (
    <>
      <ToastContainer />

      <CCard className="mt-4">
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
            <h2 className="mb-0">
              Procedure Management
            </h2>

            <div className="d-flex align-items-center gap-2">
              <CForm style={{ width: "50%" }}>
                <CInputGroup>
                  {/* Global Search */}
                  <CFormInput
                    placeholder="Search procedure..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setCurrentPage(1)
                    }}
                    type="text"
                    style={{ border: '1px solid var(--color-black)', }}
                  />
                  <CInputGroupText style={{ border: '1px solid var(--color-black)', }}>
                    <CIcon icon={cilSearch} />
                  </CInputGroupText>
                </CInputGroup>
              </CForm>
              {/* Add Button */}
              <CButton
                color="secondary"
                style={{ backgroundColor: 'var(--color-black)', color: COLORS.white }}
                onClick={() => {
                  setEditMode(false)
                  setProcedureInput('')
                  setTempProcedures([])
                  setShowModal(true)
                }}
              >
                + Add New Procedure
              </CButton>
            </div>
          </div>

        </CCardHeader>

        {loading ? (
          <LoadingIndicator message="Fetching Procedure Details, Please wait..." />
        ) : (
          <CTable striped hover responsive >
            <CTableHead className='pink-table'>
              <CTableRow className="text-center">
                <CTableHeaderCell style={{ width: "10%" }}>S.No</CTableHeaderCell>
                <CTableHeaderCell style={{ width: "60%" }}>Procedure</CTableHeaderCell>
                <CTableHeaderCell style={{ width: "30%" }}>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody className='pink-table'>
              {currentItems.length > 0 ? (
                currentItems.map((row, index) => (
                  <CTableRow key={row.id} className="text-center align-middle">
                    <CTableDataCell>{indexOfFirstItem + index + 1}</CTableDataCell>
                    <CTableDataCell>{row.name}</CTableDataCell>
                    <CTableDataCell>
                      <div className="d-flex justify-content-center gap-2">
                        <button className="actionBtn" onClick={() => handleView(row)}><Eye size={18} /></button>
                        <button className="actionBtn" onClick={() => handleEdit(row)}><Edit2 size={18} /></button>
                        <button className="actionBtn" onClick={() => confirmDelete(row.id)}><Trash2 size={18} /></button>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan={3} className="text-center">No procedures found</CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>

        )}
        {/* Pagination */}
        {filteredProcedures.length > 0 && (
          <div className="d-flex justify-content-between px-3 pb-3 mt-3">

            {/* Rows Per Page */}
            <div>
              <label className="me-2">Rows per page:</label>
              <CFormSelect
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                style={{ width: '80px', display: 'inline-block' }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </CFormSelect>
            </div>

            {/* Pagination */}
            <div>
              <div>
                Showing {filteredProcedures.length === 0 ? 0 : indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, filteredProcedures.length)} of{" "}
                {filteredProcedures.length} entries
              </div>

              <CPagination align="end" className="mt-2 themed-pagination">
                <CPaginationItem
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Prev
                </CPaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    if (totalPages <= 5) return true
                    if (currentPage <= 3) return page <= 5
                    if (currentPage >= totalPages - 2) return page >= totalPages - 4
                    return page >= currentPage - 2 && page <= currentPage + 2
                  })
                  .map((page) => (
                    <CPaginationItem
                      key={page}
                      active={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </CPaginationItem>
                  ))}

                <CPaginationItem
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </CPaginationItem>
              </CPagination>
            </div>
          </div>
        )}

      </CCard>

      {/* Add Procedures Modal */}
      <CModal visible={showModal} onClose={() => setShowModal(false)}>
        <CModalHeader closeButton>
          <CModalTitle>Add Procedures</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <CFormInput
            placeholder="Enter procedure"
            value={procedureInput}
            onChange={(e) => {
              const value = e.target.value;

              // Allow typing only valid characters
              if (value === '' || PROCEDURE_REGEX.test(value)) {
                setProcedureInput(value);
                setErrors({ procedure: '' });
              }
            }}
            invalid={!!errors.procedure}
          />
          {errors.procedure && <p className="text-danger mt-1">{errors.procedure}</p>}<br />

          <CButton
            color="secondary"
            onClick={handleAddToTemp}
            disabled={editMode}
            style={{
              backgroundColor: editMode ? '#bdbdbd' : 'var(--color-black)',
              borderColor: editMode ? '#bdbdbd' : 'var(--color-black)',
              cursor: editMode ? 'not-allowed' : 'pointer',
              opacity: editMode ? 0.7 : 1,
            }}
            title={editMode ? 'Add is disabled in edit mode' : ''}
          >
            Add
          </CButton>
          {tempProcedures.length > 0 && (
            <div className="mt-3">
              <h6>Procedures to be added:</h6>
              <ul>{tempProcedures.map((p, i) => <li key={i}>{p}</li>)}</ul>
            </div>
          )}
        </CModalBody>


        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </CButton>

          {editMode ? (
            <CButton color="primary" onClick={handleUpdateProcedure}>
              Update
            </CButton>
          ) : (
            <>
              {tempProcedures.length > 0 && (
                <CButton
                  color="primary"
                  onClick={handleSubmitAll}
                  disabled={tempProcedures.length === 0}
                >
                  {tempProcedures.length === 1 ? 'Submit' : 'Submit All'}
                </CButton>
              )}
            </>
          )}
        </CModalFooter>
      </CModal>

      {/* View Modal */}
      <CModal visible={viewModal} onClose={() => setViewModal(false)}>
        <CModalHeader closeButton>
          <CModalTitle>Procedure Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p><strong>ID:</strong> {selectedProcedure?.id}</p>
          <p><strong>Name:</strong> {selectedProcedure?.name}</p>
        </CModalBody>
        <CModalFooter>
          <CButton onClick={() => setViewModal(false)}>Close</CButton>
        </CModalFooter>
      </CModal>


      <ConfirmationModal
        isVisible={showDeleteModal}
        message="Are you sure you want to delete this procedure?"
        confirmText={
          delloading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2 text-white" role="status" />
              Deleting...
            </>
          ) : (
            'Yes, Delete'
          )
        }
        cancelText="Cancel"
        confirmColor="danger"
        cancelColor="secondary"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

    </>
  )
}

export default ProcedureManagement