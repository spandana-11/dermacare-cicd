import React, { useEffect, useMemo, useState } from 'react'
import { CButton } from '@coreui/react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import {
  addPackageData,
  deletePackageData,
  getpackagePricingByClinicId,
  updatePackageData,
} from './PackageManagementAPI'
import { useGlobalSearch } from '../Usecontext/GlobalSearchContext'
import { useHospital } from '../Usecontext/HospitalContext'
import { showCustomToast } from '../../Utils/Toaster'
import LoadingIndicator from '../../Utils/loader'
import Pagination from '../../Utils/Pagination'
import { getProcedurePricingByClinicId } from '../MainProcedureManagement/procedureService'
import PackageViewModal from './PackageViewModal'
import PackageFormModal from './PackageFormModal'
import PackageTableData from './PackageTable'
import { useLocation, useParams } from 'react-router-dom'
import ConfirmationModal from '../../components/ConfirmationModal'

const PackageManagement = () => {
  const { clinicId } = useParams();
  const { state: clinic } = useLocation();
  const [isProcedure, setIsProcedure] = useState([]) // All procedures for dropdown
  const [procedurePricing, setProcedurePricing] = useState([]) // Clinic pricing list
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' | 'edit'
  const [viewService, setViewService] = useState(null)
  const [saveloading, setSaveLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [serviceIdToDelete, setServiceIdToDelete] = useState(null)
  const [delloading, setDelLoading] = useState(false)

  // ---------- FORM STATE ----------
  const [newService, setNewService] = useState({
    price: '',
    discount: '',
    gst: '',
    gstAmount: 0,
    taxPercentage: '',
    consultationFee: '',
    minTimeValue: '',
    minTimeUnit: '',
    sittings: '',
    offerValidDate: '',
    offerEndDate: '',
    serviceImage: '',
    serviceImageFile: null,
    viewDescription: '',
    procedureQA: [],
    preProcedureQA: [],
    postProcedureQA: [],
    packageName: '',
    packageId: '',
    ngkDiscountAmount: '',
    paymentType: 'FULL_PAYMENT',
    partialPaymentPercentage: '',
    packageProcedures: [],
  })

  const [errors, setErrors] = useState({
    subServiceName: '',
    price: '',
    discount: '',
    taxPercentage: '',
    consultationFee: '',
    minTimeValue: '',
    minTimeUnit: '',
    viewDescription: '',
    serviceImage: '',
  })

  // ---------- GLOBAL SEARCH & PAGINATION ----------
  const { searchQuery, setSearchQuery } = useGlobalSearch()
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const { user } = useHospital()
  const can = (feature, action) => user?.permissions?.[feature]?.includes(action)

  // ---------- HELPERS ----------

  // Filter list by global search
  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return procedurePricing
    return procedurePricing.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().startsWith(q)),
    )
  }, [searchQuery, procedurePricing])

  // Paginated data
  const displayData = useMemo(
    () => filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage),
    [filteredData, currentPage, rowsPerPage],
  )
  // ✅ ADD THIS LINE
  const totalItems = filteredData.length
  // Format minutes into "1 hr 30 min"
  const formatMinutes = (minTime) => {
    const minutes = parseInt(minTime, 10)
    if (isNaN(minutes)) return 'Invalid time'
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainingMins = minutes % 60
    return remainingMins === 0
      ? `${hours} hour${hours > 1 ? 's' : ''}`
      : `${hours} hour${hours > 1 ? 's' : ''} ${remainingMins} min`
  }

  // ---------- API CALLS ----------

  // Get master procedures for dropdown
  const fetchProcedurePricing = async () => {

    try {
      setLoading(true)
      setError(null)
      const res = await getpackagePricingByClinicId(clinic.clinicId)
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
      console.log(list)
      // setIsProcedure(list)
      setProcedurePricing(list)
      if (!list.length) console.warn('Procedures not found.')
    } catch (err) {
      console.error('Error fetching procedures:', err)
      setError('Failed to fetch procedures. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  // Get clinic pricing by clinicId
  const fetchProcedures = async () => {
    try {

      const data = await getProcedurePricingByClinicId(clinic.clinicId)
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      setIsProcedure(list)
      // setProcedurePricing()
    } catch (err) {
      console.error('Failed to load pricing:', err)
    }
  }

  useEffect(() => {
    fetchProcedures()
    fetchProcedurePricing()
  }, [])

  // ---------- VALIDATION ----------

  const validateForm = () => {
    const newErrors = {}

    // Package name
    if (!newService.packageName || newService.packageName.trim() === '') {
      newErrors.packageName = 'Package name is required.'
    }

    if (!newService.price || !/^\d+(\.\d{1,2})?$/.test(newService.price)) {
      newErrors.price = 'Procedure Price must be a valid number.'
    } else if (Number(newService.price) < 100) {
      newErrors.price = 'Procedure Price must be at least 100.'
    }

    if (!newService.consultationFee || newService.consultationFee.trim() === '') {
      newErrors.consultationFee = 'Consultation Fee is required.'
    } else if (!/^\d+(\.\d{1,2})?$/.test(newService.consultationFee)) {
      newErrors.consultationFee = 'Consultation Fee must be a valid number.'
    } else if (Number(newService.consultationFee) < 0) {
      newErrors.consultationFee = 'Consultation Fee must be greater than or equal to 0.'
    }

    // ----- DISCOUNT + OFFER DATE VALIDATION -----
    if (newService.discount && newService.discount.trim() !== '') {
      // discount exists → validate dates
      if (!newService.offerValidDate) {
        newErrors.offerValidDate = 'Offer Start Date is required when discount is applied.'
      }
    }
    if (newService.offerValidDate && newService.offerEndDate) {
      const start = new Date(newService.offerValidDate)
      const end = new Date(newService.offerEndDate)

      if (start > end) {
        newErrors.offerValidDate = 'Start date cannot be greater than End date.'
        newErrors.offerEndDate = 'End date must be after Start date.'
      }
    }
    if (newService.discount && Number(newService.discount) > 100) {
      newErrors.discount = 'Discount cannot exceed 100%.'
    }

    if (!newService.viewDescription || newService.viewDescription.trim() === '') {
      newErrors.viewDescription = 'View description is required.'
    }

    // --- Validate at least 2 procedures ---
    if (!newService.packageProcedures || newService.packageProcedures.length < 2) {
      newErrors.packageProcedures = 'Please select at least two procedures.'
    }
    if (!newService.paymentType) {
      newErrors.paymentType = 'Payment type is required'
    }

    if (
      newService.paymentType === 'PARTIAL_PAYMENT' &&
      (!newService.partialPaymentPercentage ||
        Number(newService.partialPaymentPercentage) < 1 ||
        Number(newService.partialPaymentPercentage) > 99)
    ) {
      newErrors.partialPaymentPercentage = 'Enter valid percentage between 1 and 99'
    }
    // Validate individual procedures
    newService.packageProcedures.forEach((p, idx) => {
      if (!p.procedureId) {
        newErrors[`procedureId_${idx}`] = 'Select a procedure.'
      }
      if (!p.sittings || Number(p.sittings) <= 0) {
        newErrors[`sittings_${idx}`] = 'Enter valid sittings.'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ---------- HANDLERS: FORM FIELDS ----------

  const handleChange = (e) => {
    const { name, value, files, type } = e.target

    if (type === 'custom') {
      if (name === 'addProcedure') {
        setNewService((prev) => ({
          ...prev,
          packageProcedures: [...prev.packageProcedures, { procedureId: '', sittings: '' }],
        }))
        setErrors((prev) => ({
          ...prev,
          packageProcedures: '',
        }))
      }

      if (name === 'updateProcedure') {
        setNewService((prev) => {
          const updated = [...prev.packageProcedures]
          updated[value.index].procedureId = value.procedureId
          return { ...prev, packageProcedures: updated }
        })
        setErrors((prev) => ({
          ...prev,
          [`procedureId_${value.index}`]: '',
        }))
        setErrors((prev) => ({
          ...prev,
          packageProcedures: '',
        }))
      }

      if (name === 'updateSitting') {
        setNewService((prev) => {
          const updated = [...prev.packageProcedures]
          updated[value.index].sittings = value.sittings
          return { ...prev, packageProcedures: updated }
        })
        setErrors((prev) => ({
          ...prev,
          [`sittings_${value.index}`]: '',
        }))
      }

      if (name === 'removeProcedure') {
        setNewService((prev) => {
          const updated = [...prev.packageProcedures]
          updated.splice(value, 1)
          return { ...prev, packageProcedures: updated }
        })
      }

      return
    }

    if (type === 'file' && files && files[0]) {
      const file = files[0]
      const reader = new FileReader()

      reader.onloadend = () => {
        setNewService((prev) => ({
          ...prev,
          [name]: reader.result,
          serviceImageFile: file,
        }))

        // ✅ CLEAR ERROR WHEN IMAGE IS SELECTED
        setErrors((prev) => ({
          ...prev,
          serviceImage: '',
        }))
      }

      reader.readAsDataURL(file)
      return
    }

    const numericFields = [
      'consultationFee',
      'minTimeValue',
      'price',
      'discount',
      'gst',
      'taxPercentage',
      'partialPaymentPercentage',
    ]

    let newValue = value

    if (numericFields.includes(name)) {
      if (name === 'minTimeValue') {
        newValue = newValue.replace(/\D/g, '')
      } else {
        newValue = newValue.replace(/[^0-9.]/g, '')
        const parts = newValue.split('.')
        if (parts.length > 2) newValue = parts[0] + '.' + parts[1]
      }

      let error = ''
      if (newValue === '') {
        error = 'Must be a valid number.'
      } else if (isNaN(Number(newValue))) {
        error = 'Must be a valid number.'
      } else if (Number(newValue) < 0) {
        error = 'Must be greater than or equal to 0.'
      }

      setErrors((prev) => ({ ...prev, [name]: error }))
    } else {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }

    // ---------- UPDATE STATE ----------
    setNewService((prev) => ({
      ...prev,
      [name]: newValue,
      // ✅ Reset percentage if FULL PAYMENT selected
      ...(name === 'paymentType' && newValue === 'FULL_PAYMENT'
        ? { partialPaymentPercentage: '' }
        : {}),
    }))
  }

  const handleSubServiceChange = (e) => {
    const selectedId = e.target.value
    const selectedItem = isProcedure.find((p) => p.procedureId === selectedId)

    setNewService((prev) => ({
      ...prev,
      subServiceId: selectedId,
      subServiceName: selectedItem?.procedureName || '',
    }))
  }

  // ---------- HANDLERS: MODAL OPEN/CLOSE ----------

  const resetForm = () => {
    setNewService({
      subServiceId: '',
      subServiceName: '',
      price: '',
      discount: '',
      gst: '',
      gstAmount: 0,
      taxPercentage: '',
      consultationFee: '',
      minTimeValue: '',
      minTimeUnit: '',
      sittings: '',
      offerValidDate: '',
      offerEndDate: '',
      serviceImage: '',
      serviceImageFile: null,
      viewDescription: '',
      procedureQA: [],
      preProcedureQA: [],
      postProcedureQA: [],
      paymentType: 'FULL_PAYMENT',
      partialPaymentPercentage: '',
      packageProcedures: [],
    })

    setErrors({})
  }

  const openAddModal = () => {
    setModalMode('add')
    resetForm()
    setModalVisible(true)
  }

  // Prefill form for edit
  const openEditModal = (service) => {
    setModalMode('edit')
    setModalVisible(true)

    const rawImage = service.procedureImage || ''
    const fullImage = rawImage.startsWith('data:')
      ? rawImage
      : rawImage
        ? `data:image/jpeg;base64,${rawImage}`
        : ''

    const [timeValue, timeUnit] = service.minTime ? service.minTime.split(' ') : ['', '']

    const mappedProcedures = (service.procedures || []).map((p) => {
      const findProc = isProcedure.find((x) => x.procedureName === p.procedureName)

      return {
        procedureId: findProc?.procedureId || '',
        sittings: p.noOfSittings || '',
      }
    })
    setNewService({
      packageId: service.packageId,
      packageName: service.packageName,
      ngkDiscountAmount: service.ngkDiscountPercentage,  //TODO:
      price: String(service.price ?? ''),
      discount: String(service.discountPercentage ?? ''),
      gst: String(service.gst ?? ''),
      gstAmount: service.gstAmount ?? 0,
      taxPercentage: String(service.taxPercentage ?? ''),
      consultationFee: String(service.consultationFee ?? ''),
      minTimeValue: timeValue,
      minTimeUnit: timeUnit || '',
      sittings: String(service.sittings ?? ''),
      offerValidDate: service.offerStart || '',
      offerEndDate: service.offerValidDate || '',
      viewDescription: service.description || '',
      procedureQA: service.procedureQA || [],
      preProcedureQA: service.preProcedureQA || [],
      postProcedureQA: service.postProcedureQA || [],
      paymentType: service.paymentType || 'FULL_PAYMENT',
      partialPaymentPercentage: service.partialPaymentPercentage || '',
      packageProcedures: mappedProcedures,
    })

    setErrors({})
  }

  const handleCloseFormModal = () => {
    setModalVisible(false)
    resetForm()
  }

  // ---------- ADD / UPDATE / DELETE ----------

  const handleAddService = async () => {
    if (!validateForm()) return

    try {
      setSaveLoading(true)

      const price = Number(newService.price || 0)
      const discount = Number(newService.discount || 0)
      const gst = Number(newService.gst || 0)
      const taxPercentage = Number(newService.taxPercentage || 0)
      const consultationFee = Number(newService.consultationFee || 0)
      const discountAmount = (price * discount) / 100
      const gstAmount = (price * gst) / 100
      const discountedCost = price - discountAmount
      const taxAmount = (discountedCost * taxPercentage) / 100
      const clinicPay = discountedCost + taxAmount
      const finalCost = clinicPay + gstAmount + consultationFee
      const formattedMinTime = `${newService.minTimeValue} ${newService.minTimeUnit}`
      const payload = {
        clinicId: clinicId,
        packageName: newService.packageName,
        procedures: newService.packageProcedures.map((p) => ({
          procedureName:
            isProcedure.find((x) => x.procedureId === p.procedureId)?.procedureName || '',
          noOfSittings: Number(p.sittings),
        })),
        ngkDiscountPercentage: newService.ngkDiscountAmount,
        description: newService.viewDescription,
        price: Number(newService.price),
        discountPercentage: Number(newService.discount),
        taxPercentage: Number(newService.taxPercentage),
        gst: Number(newService.gst),
        platformFeePercentage: 2, // static or dynamic
        consultationFee: Number(newService.consultationFee),
        offerStart: newService.offerValidDate || '',
        offerValidDate: newService.offerEndDate || '',
        paymentType: newService.paymentType || 'FULL_PAYMENT', // ✅
        partialPaymentPercentage:
          newService.paymentType === 'PARTIAL_PAYMENT'
            ? Number(newService.partialPaymentPercentage)
            : 0, // ✅
      }

      const response = await addPackageData(payload) // imported from ProcedureManagementAPI
      if (response.data.success || response.status === 200) {
        showCustomToast(response.data.message, 'success')
        handleCloseFormModal()
        fetchProcedurePricing()
      } else {
        showCustomToast(response.data.message, 'error')
      }
    } catch (error) {
      console.error('Error in handleAddService:', error?.response || error)
    } finally {
      setSaveLoading(false)
    }
  }

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })

  const handleUpdateService = async () => {
    try {
      setSaveLoading(true)
      let base64ImageToSend = ''
      if (newService.serviceImageFile) {
        const fullBase64String = await toBase64(newService.serviceImageFile)
        base64ImageToSend = fullBase64String.split(',')[1]
      } else if (newService.serviceImage?.startsWith('data:')) {
        base64ImageToSend = newService.serviceImage.split(',')[1]
      } else {
        base64ImageToSend = newService.serviceImage || ''
      }

      const proceduresPayload = newService.packageProcedures.map((p) => {
        const found = isProcedure.find((x) => x.procedureId === p.procedureId)
        return {
          procedureName: found?.procedureName || '',
          noOfSittings: Number(p.sittings || 0),
        }
      })
      console.log('packageProcedures:', newService.packageProcedures)

      const updatedService = {
        clinicId: clinicId,
        packageName: newService.packageName || '',
        packageId: newService.packageId || '',
        description: newService.viewDescription || '',
        procedures: proceduresPayload,
        ngkDiscountPercentage: newService.ngkDiscountAmount,
        offerStart: newService.offerValidDate || '',
        offerValidDate: newService.offerEndDate || '',
        price: Number(newService.price || 0),
        discountPercentage: Number(newService.discount || 0),
        taxPercentage: Number(newService.taxPercentage || 0),
        procedureImage: base64ImageToSend,
        gst: Number(newService.gst || 0),
        consultationFee: Number(newService.consultationFee || 0),
        paymentType: newService.paymentType || 'FULL_PAYMENT',
        partialPaymentPercentage:
          newService.paymentType === 'PARTIAL_PAYMENT'
            ? Number(newService.partialPaymentPercentage)
            : 0,
      }

      const response = await updatePackageData(newService.packageId, clinicId, updatedService)
      if (response.success) {
        showCustomToast(`${response.message}` || 'Procedure updated successfully!', 'success')
        handleCloseFormModal()
        fetchProcedurePricing()
      } else {
        showCustomToast(`${result.message}`, 'error')
      }
    } catch (error) {
      console.error('Update failed:', error)
      showCustomToast(error?.response?.data?.message || 'Error updating service.', 'error')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleServiceDelete = (item) => {
    setServiceIdToDelete(item.packageId)
    setIsModalVisible(true)
  }

  const handleConfirmDelete = async () => {
    try {
      setDelLoading(true)
      const result = await deletePackageData(serviceIdToDelete, clinicId)
      if (result.success) {
        console.log('Service deleted:', result)
        showCustomToast(`${result.message}` || 'Package deleted successfully!', 'success')
        fetchProcedurePricing()
      } else {
        showCustomToast(`${result.message}`, 'error')
      }
    } catch (error) {
      console.error('Error deleting Procedure:', error)
    } finally {
      setDelLoading(false)
      setIsModalVisible(false)
    }
  }

  const handleCancelDelete = () => setIsModalVisible(false)

  // ---------- RENDER ----------

  return (
    <div style={{ overflow: 'hidden' }}>
      <ToastContainer />
      <div>
        <div className="w-100 mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <input
              type="text"
              placeholder="Search by name, price, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{
                width: "350px",
                border: '1px solid var(--color-black)',
              }}
            />

            {/* ➕ ADD BUTTON */}
            <CButton
              style={{
                color: 'var(--color-black)',
                backgroundColor: 'var(--color-bgcolor)',
              }}
              onClick={openAddModal}
            >
              Add Package Details
            </CButton>
          </div>
        </div>

      </div>

      {/* View Modal */}
      {viewService && (
        <PackageViewModal
          visible={!!viewService}
          data={viewService}
          onClose={() => setViewService(null)}
          formatMinutes={formatMinutes}
        />
      )}

      {/* Add / Edit Modal */}
      <PackageFormModal
        visible={modalVisible}
        mode={modalMode}
        onClose={handleCloseFormModal}
        onSave={handleAddService}
        onUpdate={handleUpdateService}
        saveloading={saveloading}
        newService={newService}
        errors={errors}
        isProcedure={isProcedure}
        onChange={handleChange}
        onSubServiceChange={handleSubServiceChange}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isVisible={isModalVisible}
        title="Delete Procedure"
        message="Are you sure you want to delete this procedure? This action cannot be undone."
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
        onCancel={handleCancelDelete}
      />

      {/* List / Table */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center">
          <LoadingIndicator message="Loading Packages..." />
        </div>
      ) : error ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: '50vh', color: 'var(--color-black)' }}
        >
          {error}
        </div>
      ) : (
        <>
          <PackageTableData
            data={displayData}
            canRead={can('Procedure Management', 'read')}
            canUpdate={can('Procedure Management', 'update')}
            canDelete={can('Procedure Management', 'delete')}
            onView={setViewService}
            onEdit={openEditModal}
            onDelete={handleServiceDelete}
          />

          {totalItems > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalItems / rowsPerPage)}
              pageSize={rowsPerPage}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setRowsPerPage(size)
                setCurrentPage(1) // reset to page 1
              }}
            />
          )}
        </>
      )}
    </div>
  )
}

export default PackageManagement
