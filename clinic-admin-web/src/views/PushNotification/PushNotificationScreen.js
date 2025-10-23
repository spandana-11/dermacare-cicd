import React, { useCallback, useEffect, useState } from 'react'
import { BASE_URL } from '../../baseUrl'
import { useHospital } from '../Usecontext/HospitalContext'
import { Edit2, Eye, Trash2 } from 'lucide-react'
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
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CAlert,
} from '@coreui/react'
import Select from 'react-select'
import { CustomerData } from '../customerManagement/CustomerManagementAPI'

const FCMNotification = () => {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [sendToAll, setSendToAll] = useState(false)
  const [image, setImage] = useState(null)
  const [responseLog, setResponseLog] = useState(null)
  const [sentNotifications, setSentNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [customerOptions, setCustomerOptions] = useState([])
  const [selectedCustomers, setSelectedCustomers] = useState([])
  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)

  // 🖼️ Handle Image
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setImage(reader.result)
      reader.readAsDataURL(file)
    }
  }

  // 📩 Send Notification
  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      setResponseLog({ error: 'Title and Body are required!' })
      return
    }

    if (!sendToAll && selectedCustomers.length === 0) {
      setResponseLog({ error: 'Please select at least one customer!' })
      return
    }

    const tokens = sendToAll ? 'ALL_USERS' : selectedCustomers.map((c) => c.value)

    try {
      const payload = {
        title,
        body,
        image,
        sendToAll,
        tokens,
      }

      // 👇 Add this line to log what’s being sent
      console.log('📦 Notification Payload:', payload)

      const res = await fetch(`${BASE_URL}/pricedrop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      console.log('📩 Server Response:', data) // 👈 also log response
      setResponseLog(data)

      // Save notification in log table
      setSentNotifications((prev) => [
        {
          title,
          body,
          image,
          sendToAll,
          token: sendToAll ? 'All Users' : selectedCustomers.map((c) => c.label).join(', '),
          status: data?.success ? '✅ Sent' : '❌ Failed',
          time: new Date().toLocaleString(),
        },
        ...prev,
      ])

      // Reset fields
      setTitle('')
      setBody('')
      setImage(null)
      setSelectedCustomers([])
      setSendToAll(false)
    } catch (error) {
      console.error('Error:', error)
      setResponseLog({ error: error.message })
    }
  }

  // 👥 Fetch Customers
  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const response = await CustomerData()
      console.log('API Response:', response) // 👈 Add this line
      const customers = response || []
      const options = customers
        .filter((c) => c.fullName && c.deviceId)
        .map((c) => ({
          value: c.deviceId,
          label: `${c.fullName} (${c.patientId})`,
        }))
      console.log('Dropdown Options:', options) // 👈 Add this line
      setCustomerOptions(options)
    } catch (error) {
      console.error('Error fetching customers:', error)
      setCustomerOptions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  console.log(selectedCustomers)

  return (
    <div className="container mt-1" style={{ maxWidth: '900px', color: 'var(--color-black)' }}>
      {/* 🟦 Send Notification Section */}
      <CCard className="shadow-sm border-0 mb-4" style={{ color: 'var(--color-black)' }}>
        <CCardBody>
          <CRow>
            {/* LEFT: Title + Image */}
            <CCol md={5}>
              <CFormLabel>Title</CFormLabel>
              <CFormInput
                placeholder="Enter notification title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <CFormLabel className="mt-3">Image (Optional)</CFormLabel>
              <CFormInput type="file" accept="image/*" onChange={handleImageChange} />
              {image && (
                <img
                  src={image}
                  alt="preview"
                  style={{
                    width: '100%',
                    borderRadius: 8,
                    marginTop: 10,
                    boxShadow: '0 0 5px rgba(0,0,0,0.2)',
                  }}
                />
              )}
            </CCol>

            {/* RIGHT: Body + Target */}
            <CCol md={7}>
              <CFormLabel>Body</CFormLabel>
              <CFormTextarea
                rows="4"
                placeholder="Enter notification message"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />

              <CFormCheck
                className="mt-3"
                type="checkbox"
                label="Send to all users"
                checked={sendToAll}
                onChange={(e) => setSendToAll(e.target.checked)}
              />
            </CCol>
            {!sendToAll && (
              <div className=" p-3 ">
                <CFormLabel>Select Customers</CFormLabel>
                <Select
                  classNamePrefix="select"
                  isMulti
                  isSearchable
                  placeholder="Search and select patients..."
                  options={customerOptions}
                  value={selectedCustomers}
                  onChange={setSelectedCustomers}
                  isLoading={loading}
                />
              </div>
            )}
          </CRow>

          {responseLog && (
            <CAlert color={responseLog?.error ? 'danger' : 'success'} className="mt-3" dismissible>
              {responseLog?.error
                ? `Error: ${responseLog.error}`
                : 'Notification sent successfully!'}
            </CAlert>
          )}

          <CButton
            style={{ color: 'white', backgroundColor: 'var(--color-black)' }}
            className="mt-4 w-100"
            onClick={handleSend}
          >
            🚀 Send Notification
          </CButton>
        </CCardBody>
      </CCard>

      {/* 🧾 Sent Notifications Log */}
      <CCard >
        <CCardHeader className="bg-light">
          <h6 className="mb-0">📋 Sent Notifications Log</h6>
        </CCardHeader>
        <CCardBody style={{ overflowX: 'auto' }}>
          {sentNotifications.length === 0 ? (
            <p className="text-center   my-3" style={{ color: 'var(--color-black)' }}>
              No notifications sent yet.
            </p>
          ) : (
            <CTable bordered hover responsive align="middle">
              <CTableHead className="custom-modal">
                <CTableRow className="pink-table  w-auto">
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>Title</CTableHeaderCell>
                  <CTableHeaderCell>Body</CTableHeaderCell>
                  <CTableHeaderCell>Target</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Time</CTableHeaderCell>

                  <CTableHeaderCell>Image</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody className="pink-table">
                {sentNotifications.map((n, index) => (
                  <CTableRow key={index}>
                    <CTableDataCell>{index + 1}</CTableDataCell>
                    <CTableDataCell>{n.title}</CTableDataCell>
                    <CTableDataCell>{n.body}</CTableDataCell>
                    <CTableDataCell>{n.token}</CTableDataCell>
                    <CTableDataCell>{n.status}</CTableDataCell>
                    <CTableDataCell>{n.time}</CTableDataCell>
                    <CTableDataCell>
                      {n.image ? (
                        <img
                          src={n.image}
                          alt="img"
                          style={{ width: 50, height: 50, borderRadius: 5 }}
                        />
                      ) : (
                        '-'
                      )}
                    </CTableDataCell>
                    <CTableDataCell className="text-end">
                      <div className="d-flex justify-content-end gap-2  ">
                        {can('Push Notification', 'read') && (
                          <button
                            className="actionBtn"
                            // onClick={() => {
                            //   setSelectedTech(tech)
                            //   setViewMode(true)
                            //   setModalVisible(true)
                            // }}
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                        )}
                        {can('Push Notification', 'update') && (
                          <button
                            className="actionBtn"
                            // onClick={() => {
                            //   setSelectedTech(tech)
                            //   setViewMode(false)
                            //   setModalVisible(true)
                            // }}
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                        )}
                        {can('Push Notification', 'delete') && (
                          <button
                            className="actionBtn"
                            // onClick={() => {
                            //   setDeleteId(tech.id) // store id
                            //   setIsModalVisible(true) // show confirmation modal
                            // }}
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>
    </div>
  )
}

export default FCMNotification
