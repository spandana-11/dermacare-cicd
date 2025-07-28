import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CTable,
  CTableBody,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CTableDataCell,
} from '@coreui/react'
import { ToastContainer, toast } from 'react-toastify'
import { Get_AllAdvData, Add_AdvData, delete_AdvData } from './AdsManagementAPI'
import { ConfirmationModal } from '../../Utils/ConfirmationDelete'

const CategoryAdvertisement = () => {
  const [advData, setAdvData] = useState([])
  const [visible, setVisible] = useState(false)
  const [mediaUrlOrImage, setMediaUrlOrImage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [carouselIdToDelete, setCarouselIdToDelete] = useState(null)

  const [loading, setLoading] = useState(true)

  // Load all advertisement data
  const fetchData = async () => {
  setLoading(true); // ✅ Start loading before fetching
    try {
    const data = await Get_AllAdvData();
    setAdvData(data);
    } catch (err) {
    toast.error('Failed to load advertisements.');
    } finally {
      setLoading(false) //  Stop loading after fetch
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (carouselId) => {
    // if (!window.confirm('Are you sure you want to delete this item?')) return
    if (!confirm) return
    console.log(carouselIdToDelete)
    try {
      const data = await delete_AdvData(carouselIdToDelete)
      toast.success(`${data || 'Advertisement deleted successfully!'}`)
      setIsModalVisible(false)
      await fetchData()
    } catch (err) {
      toast.error('Failed to delete advertisement.')
    }
  }
  const handleCarouselDelete = (carouselId) => {
    setCarouselIdToDelete(carouselId)
    setIsModalVisible(true)
  }

  const handleCancelDelete = () => {
    setIsModalVisible(false)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!selectedFile) {
      toast.warning('Please select an image or video file.')
      return
    }

    setIsSubmitting(true)

    try {
      const base64 = await convertToBase64(selectedFile)
      await Add_AdvData({ mediaUrlOrImage: base64 }) // send base64 as before
      toast.success('Advertisement added successfully!')
      setVisible(false)
      setSelectedFile(null)
      fetchData()
    } catch (err) {
      toast.error('Failed to add advertisement.')
    } finally {
      setIsSubmitting(false)
    }
  }
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  return (
    <>
      <ToastContainer />
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Category Advertisements</h4>
          <CButton color="primary" onClick={() => setVisible(true)}>
            Add Advertisement
          </CButton>
        </div>

        <CCard>
          <CCardBody>
            <CTable bordered hover>
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>Carousel ID</CTableHeaderCell>
                  <CTableHeaderCell>Image/URL</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {loading ? (
    // ✅ Show loading state first
                  <CTableRow>
                    <CTableDataCell colSpan="3" className="text-center text-primary fw-bold">
                      Loading advertisements...
                    </CTableDataCell>
                  </CTableRow>
                ) : advData?.length === 0 ? (
    // ✅ Show this only after loading finishes
                  <CTableRow>
                    <CTableDataCell colSpan="3" className="text-center text-muted">
                      No advertisements found
                    </CTableDataCell>
                  </CTableRow>
                ) : (
    // ✅ Show your actual rows
                  advData.map((item, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>{item.carouselId}</CTableDataCell>
                      <CTableDataCell>
                        {item.mediaUrlOrImage ? (
                          item.mediaUrlOrImage.startsWith('data:video') ? (
                            <video
                              src={item.mediaUrlOrImage}
                              height={50}
                              controls
                              style={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <img
                              src={item.mediaUrlOrImage}
                              alt="Ad"
                              height={50}
                              style={{ objectFit: 'cover' }}
                            />
                          )
                        ) : (
                          <span className="text-muted">No Media</span>
                        )}
                      </CTableDataCell>

                      <CTableDataCell>
                        <CButton
                          color="danger"
                          style={{ color: 'white' }}
                          size="sm"
                          onClick={() => handleCarouselDelete(item.carouselId)}
                        >
                          Delete
                        </CButton>
                        <ConfirmationModal
                          isVisible={isModalVisible}
                          message="Are you sure you want to delete this service?"
                          onConfirm={handleDelete}
                          onCancel={handleCancelDelete}
                        />
                      </CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>

        {/* Modal Form */}
        <CModal visible={visible} onClose={() => setVisible(false)} backdrop="static">
          <CModalHeader>
            <CModalTitle>Add Advertisement</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm onSubmit={handleAdd}>
              <CFormInput
                type="file"
                accept="image/*,video/mp4,video/webm"
                label="Select Image or Video"
                onChange={(e) => {
                  const file = e.target.files[0]
                  setSelectedFile(file)
                  if (file) {
                    const reader = new FileReader()
                    reader.onloadend = () => {
                      setMediaUrlOrImage(reader.result) // ✅ base64 preview
                    }
                    reader.readAsDataURL(file)
                  }
                }}
                //  onChange={(e) => {
                //   const file = e.target.files[0];
                //   if (file) {
                //     const ext = file.name.split('.').pop().toLowerCase();
                //     if (!['mp4','webm'].includes(ext)) {
                //       alert('⚠️ This video format may not play in browser. Please upload an MP4 or WebM.');
                //     }
                //     setSelectedFile(file);
                //     setMediaUrlOrImage(URL.createObjectURL(file));
                //   }
                // }}
                required
              />

              <CModalFooter>
                <CButton color="secondary" onClick={() => setVisible(false)}>
                  Cancel
                </CButton>
                <CButton type="submit" color="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add'}
                </CButton>
              </CModalFooter>
            </CForm>
          </CModalBody>
        </CModal>
      </div>
    </>
  )
}

export default CategoryAdvertisement
