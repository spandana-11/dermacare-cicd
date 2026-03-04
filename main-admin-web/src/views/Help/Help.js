import React, { useEffect, useState, useMemo } from 'react'
import {
  CButton,
  CFormInput,
  CPagination,
  CPaginationItem,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormSelect,
  CCard,
  CCardHeader,
  CCardBody
} from '@coreui/react'

import axios from 'axios'
import { useHospital } from '../../views/Usecontext/HospitalContext'
import { showCustomToast } from '../../Utils/Toaster'
import LoadingIndicator from '../../Utils/loader'
import { BASE_URL_API } from '../../baseUrl'

const Help = () => {
  const { selectedHospital } = useHospital()
  const [enquiries, setEnquiries] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const mainBranch = useMemo(() => ({
    name: selectedHospital?.hospitalName || 'SureCare Support',
    phone: selectedHospital?.contact || '+91 9876543210',
    email: 'support@ngk.com'
  }), [selectedHospital])

  const fetchData = async () => {
    try {
      const res = await axios.get(`${BASE_URL_API}/clinic-enquiries/getAll`)
      setEnquiries(res.data?.data || [])
    } catch {
      showCustomToast('Failed to load enquiries', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const filteredData = enquiries.filter(
    x =>
      x.contactName?.toLowerCase().includes(search.toLowerCase()) ||
      x.contactMobile?.includes(search)
  )

  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)

  // 📌 FIXED — NOW ACCEPTS THE FULL ITEM, NOT JUST EMAIL
  const handleSendEmail = (item) => {
    const subject = encodeURIComponent("Response to your Clinic Enquiry");

    const body = encodeURIComponent(
      `Hello ${item.contactName || ''},

Thank you for contacting us. We have received your enquiry and our team will get in touch with you shortly.

-------------------------------
ENQUIRY DETAILS
-------------------------------
Clinic Name: ${item.clinicName || 'N/A'}
Clinic Address: ${item.clinicAddress || 'N/A'}
Clinic Mobile: ${item.clinicMobile || 'N/A'}

Contact Person: ${item.contactName || 'N/A'}
Contact Mobile: ${item.contactMobile || 'N/A'}
Email: ${item.contactEmail || 'N/A'}

Message:
${item.message || 'No message provided'}

Submitted On: ${item.createdAt ? new Date(item.createdAt).toLocaleString("en-GB") : 'N/A'}
-------------------------------

If you have any further questions, feel free to reply to this email.

Regards,
NGK Support Team`
    );

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${item.contactEmail}&su=${subject}&body=${body}`

    window.open(gmailUrl, "_blank")
  }


  return (
    <div className="row g-4">

      <div className="d-flex justify-content-center mt-4">
        <CCard style={{ width: '95%', maxWidth: '1200px' }}>

          <CCardHeader className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
            <div>
              <h5 className="mb-1">Clinic Enquiries</h5>
              <span className="text-muted small">Oversee and handle enquiries across all clinics</span>
            </div>

            <CFormInput
              placeholder="Search by name or mobile"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              style={{
                width: '260px',
                borderRadius: '6px',
                border: '1px solid var(--color-black)',
                background: '#fafbfc'
              }}
            />
          </CCardHeader>

          <CCardBody>

            {loading ? (
              <div className="text-center py-4">
                <LoadingIndicator />
                <div className="text-muted mt-2">Loading enquiries...</div>
              </div>
            ) : totalItems === 0 ? (
              <CTableDataCell className="text-center text-muted">No enquiries found</CTableDataCell>
            ) : (
              <>
                <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                  <CTable striped hover responsive>
                    <CTableHead className="pink-table">
                      <CTableRow className="text-center">
                        <CTableHeaderCell>S.No</CTableHeaderCell>
                        <CTableHeaderCell>Clinic Name</CTableHeaderCell>
                        <CTableHeaderCell>Contact Name</CTableHeaderCell>
                        <CTableHeaderCell>Mobile</CTableHeaderCell>
                        <CTableHeaderCell>Action</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>

                    <CTableBody className="pink-table">
                      {currentItems.map((item, index) => (
                        <CTableRow key={index} className="text-center align-middle">
                          <CTableDataCell>{indexOfFirstItem + index + 1}</CTableDataCell>
                          <CTableDataCell>{item.clinicName}</CTableDataCell>
                          <CTableDataCell>{item.contactName}</CTableDataCell>
                          <CTableDataCell>{item.contactMobile}</CTableDataCell>
                          <CTableDataCell>
                            <CButton
                              className="actionBtn"
                              title="View"
                              onClick={() => {
                                setSelectedItem(item)
                                setShowModal(true)
                              }}
                            >
                              View
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted small">Rows per page:</span>
                    <CFormSelect
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value))
                        setCurrentPage(1)
                      }}
                      style={{ width: '80px' }}
                    >
                      {[5, 10, 25, 50].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </CFormSelect>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <span className="text-muted small">
                      Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
                    </span>

                    <CPagination align="end" className="mt-2 themed-pagination">
                      <CPaginationItem
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      >
                        Prev
                      </CPaginationItem>

                      {[...Array(totalPages)].map((_, i) => (
                        <CPaginationItem
                          key={i}
                          active={currentPage === i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </CPaginationItem>
                      ))}

                      <CPaginationItem
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                      >
                        Next
                      </CPaginationItem>
                    </CPagination>
                  </div>
                </div>
              </>
            )}
          </CCardBody>
        </CCard>
      </div>

      {showModal && selectedItem && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">Enquiry Details</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <div className="modal-body">
                {[
                  { label: "ID", value: selectedItem.id },
                  { label: "Clinic ID", value: selectedItem.clinicId },
                  { label: "Clinic Name", value: selectedItem.clinicName },
                  { label: "Clinic Address", value: selectedItem.clinicAddress },
                  { label: "Clinic Mobile", value: selectedItem.clinicMobile },
                  { label: "Contact Name", value: selectedItem.contactName },
                  { label: "Contact Mobile", value: selectedItem.contactMobile },
                  // 👇 EMAIL WILL ONLY SHOW IF EXISTS
                  ...(selectedItem.contactEmail ? [{ label: "Email", value: selectedItem.contactEmail }] : []),

                  { label: "Message", value: selectedItem.message },
                ].map((x, i) => (
                  <div className="mb-2" key={i} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    <strong>{x.label}:</strong> <span>{x.value}</span>
                  </div>
                ))}
              </div>


              <div className="modal-footer d-flex justify-content-between">
                {selectedItem.contactEmail && (
                  <CButton color="primary" onClick={() => handleSendEmail(selectedItem)}>
                    Send Mail
                  </CButton>
                )}
                <CButton color="secondary" onClick={() => setShowModal(false)}>
                  Close
                </CButton>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Help
