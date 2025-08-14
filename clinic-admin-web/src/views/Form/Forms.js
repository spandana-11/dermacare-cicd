import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CNav,
  CNavItem,
  CNavLink,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormSelect,
  CFormInput,
  CFormTextarea,
  CRow,
  CCol,
} from '@coreui/react'
import { toast } from 'react-toastify'

// Import your APIs
import {
  AllPreProcedureForms,
  AllProcedureForms,
  AllPostProcedureForms,
  AddPreProcedureData,
  AddProcedureData,
  AddPostProcedureData,
  deletePreProcedureData,
  deleteProcedureData,
  deletePostProcedureData,
} from './FormAPI'

import {
  CategoryData,
  serviceData,
  subServiceData,
} from '../serviceManagement/ServiceManagementAPI'

const Forms = () => {
  const [activeTab, setActiveTab] = useState(0)

  // Data lists for table (not filtered by modal dropdowns)
  const [preProcedures, setPreProcedures] = useState([])
  const [procedures, setProcedures] = useState([])
  const [postProcedures, setPostProcedures] = useState([])

  // Modal visibility and new form state
  const [modalVisible, setModalVisible] = useState(false)
  const [newForm, setNewForm] = useState({
    procedureName: '',
    totalDuration: '',
    procedureDetails: '',
  })

  // Dropdowns inside modal
  const [modalCategories, setModalCategories] = useState([])
  const [modalServices, setModalServices] = useState([])
  const [modalSubServices, setModalSubServices] = useState([])

  const [modalCategoryId, setModalCategoryId] = useState('')
  const [modalServiceId, setModalServiceId] = useState('')
  const [modalSubServiceId, setModalSubServiceId] = useState('')

  const hospitalId = localStorage.getItem('HospitalId') || '' // adjust as needed

  const tabs = [
    { key: 'preProcedure', label: 'Pre Procedure' },
    { key: 'procedure', label: 'Procedure' },
    { key: 'postProcedure', label: 'Post Procedure' },
  ]

  // Fetch all procedure forms without filters on mount and after add/delete
  const fetchAllForms = async () => {
    try {
      const [preRes, procRes, postRes] = await Promise.all([
        AllPreProcedureForms(),
        AllProcedureForms(),
        AllPostProcedureForms(),
      ])

      setPreProcedures(preRes.data || [])
      setProcedures(procRes.data || [])
      setPostProcedures(postRes.data || [])
    } catch (error) {
      toast.error('Failed to fetch procedure forms')
    }
  }

  useEffect(() => {
    fetchAllForms()
  }, [])

  // Fetch modal categories on modal open
  useEffect(() => {
    if (!modalVisible) return

    const fetchModalCategories = async () => {
      try {
        const res = await CategoryData()
        if (res.data) setModalCategories(res.data)
      } catch {
        toast.error('Failed to fetch categories')
      }
    }
    fetchModalCategories()
  }, [modalVisible])

  // Fetch modal services when modalCategoryId changes
  useEffect(() => {
    if (!modalCategoryId) {
      setModalServices([])
      setModalServiceId('')
      setModalSubServices([])
      setModalSubServiceId('')
      return
    }
    const fetchServicesByCategory = async () => {
      try {
        const res = await serviceData()
        if (res.data) {
          const filtered = res.data.filter((s) => s.categoryId === modalCategoryId)
          setModalServices(filtered)
          setModalServiceId('')
          setModalSubServices([])
          setModalSubServiceId('')
        }
      } catch {
        toast.error('Failed to fetch services')
      }
    }
    fetchServicesByCategory()
  }, [modalCategoryId])

  // Fetch modal subservices when modalServiceId changes
useEffect(() => {
  if (!modalServiceId) {
    setModalSubServices([]);
    setModalSubServiceId('');
    return;
  }

  const fetchSubServicesByService = async () => {
    try {
      const res = await subServiceData(modalServiceId); // pass serviceId
      // Check correct structure of response
      if (res.data && Array.isArray(res.data)) {
        setModalSubServices(res.data);
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        setModalSubServices(res.data.data);
      }
      setModalSubServiceId('');
    } catch {
      toast.error('Failed to fetch sub services');
    }
  };

  fetchSubServicesByService();
}, [modalServiceId]);

  // Handle modal dropdown changes
  const handleModalCategoryChange = (e) => setModalCategoryId(e.target.value)
  const handleModalServiceChange = (e) => setModalServiceId(e.target.value)
  const handleModalSubServiceChange = (e) => setModalSubServiceId(e.target.value)

  // Modal form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewForm((prev) => ({ ...prev, [name]: value }))
  }

  // Modal label texts by activeTab
  const getLabels = () => {
    switch (activeTab) {
      case 0:
        return { name: 'Pre Procedure Name', details: 'Pre Procedure Details' }
      case 1:
        return { name: 'Procedure Name', details: 'Procedure Details' }
      case 2:
        return { name: 'Post Procedure Name', details: 'Post Procedure Details' }
      default:
        return { name: 'Name', details: 'Details' }
    }
  }
  const { name: nameLabel, details: detailsLabel } = getLabels()

  // Add new form submit handler
  const handleAddForm = async () => {
    if (!modalCategoryId || !modalServiceId || !modalSubServiceId) {
      toast.error('Please select Category, Service and Sub Service')
      return
    }
    if (!newForm.procedureName || !newForm.totalDuration) {
      toast.error('Please fill procedure name and duration')
      return
    }

    const payloadBase = {
      totalDuration: newForm.totalDuration,
      subServiceId: modalSubServiceId,
      hospitalId,
    }

    try {
      if (activeTab === 0) {
        await AddPreProcedureData(
          {
            ...payloadBase,
            preProcedureName: newForm.procedureName,
            preProcedureDetails: newForm.procedureDetails,
          },
          hospitalId,
          modalSubServiceId,
        )
      } else if (activeTab === 1) {
        await AddProcedureData(
          {
            ...payloadBase,
            procedureName: newForm.procedureName,
            procedureDetails: newForm.procedureDetails,
          },
          hospitalId,
          modalSubServiceId,
        )
      } else {
        await AddPostProcedureData(
          {
            ...payloadBase,
            postProcedureName: newForm.procedureName,
            postProcedureDetails: newForm.procedureDetails,
          },
          hospitalId,
          modalSubServiceId,
        )
      }
      toast.success('Form added successfully')
      setModalVisible(false)
      setNewForm({ procedureName: '', totalDuration: '', procedureDetails: '' })
      setModalCategoryId('')
      setModalServiceId('')
      setModalSubServiceId('')
      fetchAllForms()
    } catch (error) {
      toast.error('Failed to add form')
      console.error(error)
    }
  }

  // Delete handler omitted for brevity (same as your code)

  // Helper functions omitted (same as your code)

  return (
    <CCard>
      <CCardHeader>
        <strong>Procedure Form Management</strong>
      </CCardHeader>
      <CCardBody>
        {/* Tabs */}
        <CNav variant="tabs" className="mb-3">
          {tabs.map((tab, idx) => (
            <CNavItem key={tab.key}>
              <CNavLink active={activeTab === idx} onClick={() => setActiveTab(idx)}>
                {tab.label}
              </CNavLink>
            </CNavItem>
          ))}
        </CNav>

        {/* Add form button */}
        <CButton
          color="primary"
          className="mb-3"
          onClick={() => setModalVisible(true)}
        >
          Add {tabs[activeTab].label}
        </CButton>

        {/* Data Table */}
        {/* Your table rendering code here same as your current code */}

        {/* Modal for Add Form */}
        <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
          <CModalHeader>
            <CModalTitle>Add {tabs[activeTab].label}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            {/* Dropdowns inside modal */}
            <CRow className="mb-3">
              <CCol md={4}>
                <label>Category</label>
                <CFormSelect
                  value={modalCategoryId}
                  onChange={handleModalCategoryChange}
                >
                  <option value="">-- Select Category --</option>
                  {modalCategories.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryName}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={4}>
                <label>Service</label>
                <CFormSelect
                  value={modalServiceId}
                  onChange={handleModalServiceChange}
                  disabled={!modalServices.length}
                >
                  <option value="">-- Select Service --</option>
                  {modalServices.map((serv) => (
                    <option key={serv.serviceId} value={serv.serviceId}>
                      {serv.serviceName}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={4}>
                <label>Sub Service</label>
               <CFormSelect
  value={modalSubServiceId}
  onChange={(e) => setModalSubServiceId(e.target.value)}
  disabled={!modalSubServices.length}
>
  <option value="">Select Sub Service</option>
  {modalSubServices
    .filter((sub, index, self) =>
      index === self.findIndex(s => s.id === sub.id)
    )
    .map(sub => (
      <option key={sub.id} value={sub.id}>
        {sub.serviceName || 'Unnamed Subservice'}
      </option>
    ))}
</CFormSelect>


              </CCol>
            </CRow>

            {/* Procedure name, duration, details */}
            <CRow className="mb-3">
              <CCol md={12}>
                <label>{nameLabel}</label>
                <CFormInput
                  name="procedureName"
                  value={newForm.procedureName}
                  onChange={handleInputChange}
                  placeholder={`Enter ${nameLabel}`}
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={12}>
                <label>Duration</label>
                <CFormInput
                  name="totalDuration"
                  value={newForm.totalDuration}
                  onChange={handleInputChange}
                  placeholder="Enter duration"
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md={12}>
                <label>{detailsLabel}</label>
                <CFormTextarea
                  rows={4}
                  name="procedureDetails"
                  value={newForm.procedureDetails}
                  onChange={handleInputChange}
                  placeholder={`Enter ${detailsLabel}`}
                />
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setModalVisible(false)}>
              Cancel
            </CButton>
            <CButton color="primary" onClick={handleAddForm}>
              Add
            </CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  )
}

export default Forms
