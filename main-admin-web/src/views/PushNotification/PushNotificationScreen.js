import React, { useCallback, useEffect, useState } from 'react'
import {
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CButton,
  CFormCheck,
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CAlert,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CPaginationItem,
  CPagination, CFormSelect,
} from '@coreui/react'
import Select from 'react-select'
import ConfirmationModal from '../../components/ConfirmationModal'
import { Edit2, Eye, Trash2 } from 'lucide-react'
import { CustomerData } from '../customerManagement/CustomerAPI'
import { showCustomToast } from '../../Utils/Toaster'
import { ToastContainer } from 'react-toastify'
import '../Style/CustomModal.css'
import { useLocation } from 'react-router-dom'
import axios from 'axios'

const FCMNotification = () => {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [image, setImage] = useState(null)
  const [sendAll, setSendAll] = useState(false)
  const [responseMessage, setResponseMessage] = useState(null)
  const [sentNotifications, setSentNotifications] = useState([])
  const [customerOptions, setCustomerOptions] = useState([])
  const [selectedCustomers, setSelectedCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [viewMode, setViewMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const location = useLocation();
  const clinicId = location.state?.clinicId;   // ⬅️ get clinicId from state
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)
  const filteredData = sentNotifications
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const paginatedNotifications = filteredData.slice(indexOfFirstItem, indexOfLastItem)


  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // 🖼 Handle image
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setImage(reader.result)
      reader.readAsDataURL(file)
    }
  }

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`/priceDropNotification/${clinicId}`);

      if (res.data.success) {
        const dataList = Array.isArray(res.data.data) ? res.data.data : [res.data.data];

        const mapped = dataList.map((n) => {
          let selectedCustomers = [];

          if (n.tokens && Array.isArray(n.tokens)) {
            selectedCustomers = n.tokens
              .map((token) => customerOptions.find((c) => c.value === token))
              .filter(Boolean);
          } else if (n.customerData && Array.isArray(n.customerData)) {
            selectedCustomers = n.customerData.map((c) => {
              const name = Object.keys(c)[0];
              const data = c[name];

              return {
                value: data.customerId || data.patientId || name,
                label: `${name} (${data.patientId || data.customerId || ''})`,
              };
            });
          }

          return { ...n, selectedCustomers };
        });

        setSentNotifications(mapped);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };



  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await CustomerData(clinicId);
      console.log("API Response:", response)
      const customers = response || [];

      console.log("Customer API Response:", customers);

      const options = customers
        .filter((c) => c.fullName)
        .map((c) => ({
          value: c.deviceId || c.registrationCode,
          label: `${c.fullName} (${c.registrationCode})`,
        }));

      console.log("Customer Options:", options);
      setCustomerOptions(options);

    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);


  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  useEffect(() => {
    if (customerOptions.length > 0) {
      fetchNotifications()
    }
  }, [customerOptions])


  // Submit form (send or update)
  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) {
      showCustomToast(`Title and Body are required!`, 'error');
      return;
    }
    const tokens = sendAll ? [] : selectedCustomers.map((c) => c.value);
    const payload = {
      clinicId,
      title,
      body,
      image,
      sendAll,
      tokens,
    };
    try {
      setIsLoading(true);
      let res;
      if (isEditing && editId) {
        res = await axios.put(`${PushNotificationBaseUrl}/pricedrop/${editId}`, payload);
      } else {
        res = await axios.post(`${PushNotificationBaseUrl}/pricedrop`, payload);
      }
      if (res.data.success) {
        showCustomToast(isEditing ? 'Updated successfully!' : 'Sent successfully!');
        fetchNotifications();
        setTitle('');
        setBody('');
        setImage(null);
        setSelectedCustomers([]);
        setSendAll(false);
        setIsEditing(false);
        setEditId(null);
      } else {
        showCustomToast(`Operation failed!`, 'error');
      }
    } catch (error) {
      showCustomToast(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };


  // Delete notification
  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const res = await axios.delete(
        `${PushNotificationBaseUrl}/deletePriceDropNotification/${clinicId}/${selectedItem}`
      );

      if (res.data.success) {
        showCustomToast('Notification deleted successfully!');
        fetchNotifications();
      } else {
        showCustomToast('Failed to delete notification', 'error');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      showCustomToast('Error while deleting notification', 'error');
    } finally {
      setIsLoading(false);
      setDeleteConfirm(false);
    }
  };
  // Load notification into form for editing
  const handleEdit = (n) => {
    setTitle(n.title)
    setBody(n.body)
    setImage(n.image || null)
    setSendAll(n.sendAll || false)
    setSelectedCustomers(n.sendAll ? [] : n.selectedCustomers || [])
    setIsEditing(true)
    setEditId(n._id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // View notification
  const handleView = (n) => {
    setSelectedItem(n)
    setViewMode(true)
  }

  return (
    <div className="container-xl py-3">
      <ToastContainer />
      {/* Form */}
      <CCard className="mb-4 shadow-sm border-0">
        <CCardHeader className="bg-white border-bottom">
          <h5 className="mb-0 fw-semibold">
            {isEditing ? 'Edit Push Notification' : 'Create Push Notification'}
          </h5>
        </CCardHeader>

        <CCardBody>
          <CRow className="gy-4">
            {/* Left */}
            <CCol lg={5} md={12}>
              <CFormLabel className="fw-semibold">Title</CFormLabel>
              <CFormInput
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title"
              />

              <CFormLabel className="fw-semibold mt-3">Image (optional)</CFormLabel>
              <CFormInput type="file" accept="image/*" onChange={handleImageChange} />

              {image && (
                <div className="mt-3 text-center">
                  <img
                    src={image}
                    alt="preview"
                    className="img-fluid rounded border"
                    style={{ maxHeight: 180 }}
                  />
                </div>
              )}
            </CCol>

            {/* Right */}
            <CCol lg={7} md={12}>
              <CFormLabel className="fw-semibold">Message</CFormLabel>
              <CFormTextarea
                rows={5}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter notification message"
              />

              <div className="mt-3">
                <CFormCheck
                  label="Send to all users"
                  checked={sendAll}
                  onChange={(e) => setSendAll(e.target.checked)}
                />
              </div>
            </CCol>
          </CRow>

          {!sendAll && (
            <div className="mt-4">
              <CFormLabel className="fw-semibold">Select Customers</CFormLabel>
              <Select
                isMulti
                options={customerOptions}
                value={selectedCustomers}
                onChange={(v) => setSelectedCustomers(v || [])}
                placeholder="Search customers"
                menuPortalTarget={document.body}
              />
            </div>
          )}

          <div className="d-grid mt-4">
            <CButton
              style={{ backgroundColor: 'var(--color-black)', color: 'white' }}
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  {isEditing ? 'Updating...' : 'Sending...'}
                </>
              ) : (
                isEditing ? 'Update Notification' : 'Send Notification'
              )}
            </CButton>
          </div>
        </CCardBody>
      </CCard>


      {/* Table */}
      <CCard className="mb-2">
        <CCardHeader className="bg-light">
          <h6 className="mb-0">📋 Sent Notifications Log</h6>
        </CCardHeader>

        <CCardBody>
          {responseMessage && (
            <CAlert color={responseMessage.error ? 'danger' : 'success'}>
              {responseMessage.error || responseMessage.success}
            </CAlert>
          )}

          <CTable striped hover responsive>
            <CTableHead className="pink-table">
              <CTableRow className="text-center">
                <CTableHeaderCell >#</CTableHeaderCell>
                <CTableHeaderCell>Title</CTableHeaderCell>
                <CTableHeaderCell>Body</CTableHeaderCell>
                <CTableHeaderCell>Date</CTableHeaderCell>
                <CTableHeaderCell>Image</CTableHeaderCell>
                <CTableHeaderCell>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody className="pink-table">
              {paginatedNotifications.length > 0 ? (
                paginatedNotifications.map((n, idx) => (
                  <CTableRow key={idx} className="text-center align-middle">
                    <CTableDataCell>
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </CTableDataCell>
                    <CTableDataCell>{n.title}</CTableDataCell>
                    <CTableDataCell>{n.body}</CTableDataCell>
                    <CTableDataCell>
                      {new Date(n.createdAt || Date.now()).toLocaleString()}
                    </CTableDataCell>
                    <CTableDataCell>
                      {n.image ? (
                        <img src={n.image} alt="notif" style={{ width: 50, borderRadius: 5 }} />
                      ) : (
                        '-'
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      <div className="d-flex justify-content-end gap-2">
                        <button className="actionBtn view" onClick={() => handleView(n)}>
                          <Eye size={18} />
                        </button>
                        <button className="actionBtn edit" onClick={() => handleEdit(n)}>
                          <Edit2 size={18} />
                        </button>
                        <button
                          className="actionBtn delete"
                          onClick={() => {
                            setSelectedItem(n.id);
                            setDeleteConfirm(true);
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan={6} className="text-center py-4 text-muted">
                    No data found
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>

          {filteredData.length > 0 && (
            <div className="d-flex justify-content-between px-3 pb-3 mt-3">

              {/* Rows per Page */}
              <div>
                <label className="me-2">Rows per page:</label>
                <CFormSelect
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{ width: '80px' }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </CFormSelect>
              </div>

              {/* Pagination */}
              <div className="text-end">
                <div className="mb-1 text-muted">
                  Showing {indexOfFirstItem + 1} to{' '}
                  {Math.min(indexOfLastItem, filteredData.length)} of{' '}
                  {filteredData.length} entries
                </div>

                <CPagination align="end" className="mt-2 themed-pagination">
                  <CPaginationItem
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </CPaginationItem>

                  {/* Smart page logic */}
                  {(() => {
                    const pages = [];
                    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

                    for (let page = 1; page <= totalPages; page++) {
                      if (
                        totalPages <= 7 ||
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(currentPage - page) <= 2
                      ) {
                        pages.push(page);
                      } else if (
                        page === currentPage - 3 ||
                        page === currentPage + 3
                      ) {
                        pages.push('...');
                      }
                    }

                    return pages.map((page, i) =>
                      page === '...' ? (
                        <CPaginationItem key={`ellipsis-${i}`} disabled>
                          ...
                        </CPaginationItem>
                      ) : (
                        <CPaginationItem
                          key={page}
                          active={page === currentPage}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </CPaginationItem>
                      )
                    );
                  })()}

                  <CPaginationItem
                    disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </CPaginationItem>
                </CPagination>
              </div>
            </div>
          )}
        </CCardBody>
      </CCard>


      {/* View Modal */}
      <CModal visible={viewMode} size="lg" onClose={() => setViewMode(false)}>
        <CModalHeader>
          <CModalTitle>Notification Details</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <CRow className="mb-3">
            <CCol md={6}><strong>Title:</strong> {selectedItem?.title}</CCol>
            <CCol md={6}><strong>Send All:</strong> {selectedItem?.sendAll ? 'Yes' : 'No'}</CCol>
          </CRow>

          <p><strong>Message:</strong></p>
          <p className="text-muted">{selectedItem?.body}</p>

          {selectedItem?.image && (
            <img
              src={selectedItem.image}
              alt=""
              className="img-fluid rounded border mt-3"
            />
          )}
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={() => setViewMode(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>


      {/* Delete Modal */}
      <ConfirmationModal
        isVisible={deleteConfirm}
        title="Delete Notification"
        message={`Are you sure you want to delete this notification? This action cannot be undone.`}
        isLoading={isLoading}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        confirmColor="danger"
        cancelColor="secondary"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(false)}
      />
    </div>
  )
}

export default FCMNotification
