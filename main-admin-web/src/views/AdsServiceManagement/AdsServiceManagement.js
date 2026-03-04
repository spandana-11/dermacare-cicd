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
import { Get_AllServAdvData, Add_ServAdvData, delete_ServAdvData } from './AdsServiceManagementAPI'
import { ConfirmationModal } from '../../Utils/ConfirmationDelete'
import { Trash2 } from 'lucide-react' // ✅ IMPORT FIXED ICON HERE
import LoadingIndicator from '../../Utils/loader'
import { COLORS } from '../../Constant/Themes'

const ServiceAdvertisement = () => {
  const [advData, setAdvData] = useState([])
  const [visible, setVisible] = useState(false)
  const [mediaUrlOrImage, setMediaUrlOrImage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [carouselIdToDelete, setCarouselIdToDelete] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load all advertisement data
  // const fetchData = async () => {
  //   try {
  //     const data = await Get_AllServAdvData()
  //     setAdvData(data)
  //   } catch (err) {
  //     toast.error('Failed to load advertisements.')
  //   }
  // }
  // Load all advertisement data
  const fetchData = async () => {
    setLoading(true) // ✅ start loading
    try {
      const data = await Get_AllServAdvData()
      if (Array.isArray(data)) {
        setAdvData(data)
      } else {
        console.warn('API returned non-array data for advertisements:', data)
        setAdvData([])
      }
    } catch (err) {
      toast.error('Failed to load advertisements.')
      setAdvData([])
    } finally {
      setLoading(false) // ✅ stop loading
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
      const data = await delete_ServAdvData(carouselIdToDelete)
      console.log(data)
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
      await Add_ServAdvData({ mediaUrlOrImage: base64 }) // send base64 as before
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
          <h4>Service Advertisements</h4>
          <CButton color="secondary"
                        style={{ backgroundColor: 'var(--color-black)', color: COLORS.white }} onClick={() => setVisible(true)}>
            Add Advertisement
          </CButton>
        </div>


        <CTable striped hover responsive >
          <CTableHead className="pink-table">
            <CTableRow>
              <CTableHeaderCell>Carousel ID</CTableHeaderCell>
              <CTableHeaderCell>Image / Video</CTableHeaderCell>
              <CTableHeaderCell className="text-center">
                Actions
              </CTableHeaderCell>
            </CTableRow>
          </CTableHead>

          <CTableBody className="pink-table">
            {loading ? (
              <CTableRow>

                <CTableDataCell colSpan="3" className="text-center py-4">
                  <div className="d-flex justify-content-center align-items-center">
                    <LoadingIndicator message=" Loading advertisements..." />
                  </div>
                </CTableDataCell>
              </CTableRow>
            ) : advData?.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan="3" className="text-center text-muted py-4">
                  <i>No advertisements found</i>
                </CTableDataCell>
              </CTableRow>
            ) : (
              advData.map((item, index) => (
                <CTableRow key={index} >
                  <CTableDataCell>
                    {item.carouselId}
                  </CTableDataCell>
                  <CTableDataCell>
                    {item.mediaUrlOrImage ? (
                      item.mediaUrlOrImage.startsWith('data:video') ? (
                        <video
                          src={item.mediaUrlOrImage}
                          height={60}
                          controls
                          className="rounded shadow-sm"
                          style={{ objectFit: 'cover', border: '1px solid #f1f1f1' }}
                        />
                      ) : (
                        <img
                          src={item.mediaUrlOrImage}
                          alt="Ad"
                          height={60}
                          className="rounded shadow-sm"
                          style={{ objectFit: 'cover', border: '1px solid #f1f1f1' }}
                        />
                      )
                    ) : (
                      <span className="text-muted fst-italic">No Media</span>
                    )}
                  </CTableDataCell>

                  <CTableDataCell className="text-center">
                    <div className="d-flex justify-content-center align-items-center gap-2">
                      <butto className="actionBtn" onClick={() => handleCarouselDelete(item.carouselId)}
                        title="Delete Advertisement">
                        <Trash2 size={18} />
                      </butto>
                    </div>


                    <ConfirmationModal
                      isVisible={isModalVisible}
                      message="Are you sure you want to delete this advertisement?"
                      onConfirm={handleDelete}
                      onCancel={handleCancelDelete}
                    />
                  </CTableDataCell>
                </CTableRow>
              ))
            )}
          </CTableBody>
        </CTable>


        {/* Modal Form */}
        <CModal visible={visible} onClose={() => setVisible(false)} backdrop="static" className='custom-modal'>
          <CModalHeader>
            <CModalTitle>Add Advertisement</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm onSubmit={handleAdd}>
              <CFormInput
                type="file"
                accept="image/*,video/*"
                label="Select Image or Video"
                onChange={(e) => setSelectedFile(e.target.files[0])}
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

export default ServiceAdvertisement
