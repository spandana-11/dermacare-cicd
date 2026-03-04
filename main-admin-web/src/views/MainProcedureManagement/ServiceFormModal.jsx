// ServiceFormModal.jsx
import React, { useState } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CRow,
  CCol,
  CFormInput,
  CFormText,
  CFormSelect,
  CFormTextarea,
  CButton, CInputGroup, CInputGroupText
} from '@coreui/react'

import ProcedureQA from './QASection'
import CIcon from '@coreui/icons-react'
import Select from 'react-select'
const ServiceFormModal = ({
  visible,
  mode, // 'add' | 'edit'
  onClose,
  onSave,
  onUpdate,
  saveloading,
  newService,
  errors,
  isProcedure,
  onChange,
  onSubServiceChange,
}) => {
  const isEdit = mode === 'edit'
  const procedureOptions = isProcedure.map((p) => ({
    value: p.procedureId,
    label: p.procedureName,
  }))


  return (
    <CModal
      visible={visible}
      onClose={onClose}
      size="xl"
      backdrop="static"
      className="custom-modal"
    >
      <CModalHeader>
        <CModalTitle style={{ textAlign: 'center', width: '100%' }}>
          {isEdit ? 'Edit Procedure Details' : 'Add New Procedure Details'}
        </CModalTitle>
      </CModalHeader>

      <CModalBody>
        <CForm>
          {/* Procedure Name + Price + Discount + GST */}
          <CRow>
            <CCol md={3} className="mb-4 ">
              <h6>
                Procedure Name <span className="text-danger">*</span>
              </h6>

              <Select
                options={procedureOptions}
                isSearchable
                placeholder="Select Procedure"
                isDisabled={isEdit}   // ✅ DISABLE IN EDIT MODE
                menuPortalTarget={document.body}
                menuPosition="fixed"
                value={
                  procedureOptions.find(
                    (opt) => String(opt.value) === String(newService.subServiceId),
                  ) || null
                }
                onChange={onSubServiceChange}
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: '38px',
                    backgroundColor: isEdit ? '#e9ecef' : base.backgroundColor, // optional UI hint
                    cursor: isEdit ? 'not-allowed' : 'pointer',
                  }),
                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
              />


              {errors.subServiceName && (
                <CFormText className="text-danger">{errors.subServiceName}</CFormText>
              )}
            </CCol>
            <CCol md={3} className="mb-4">
              <h6>
                Procedure Price <span className="text-danger">*</span>
              </h6>
              <CFormInput
                type="text"
                placeholder="Procedure Price"
                name="price"
                value={newService.price || ''}
                onChange={onChange}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9.]/g, '')
                }}
              />
              {errors.price && <CFormText className="text-danger">{errors.price}</CFormText>}
            </CCol>

            <CCol md={3} className="mb-4">
              <h6>Discount / Offer (%)</h6>
              <CFormInput
                type="text"
                name="discount"
                placeholder="Discount"
                value={newService.discount || ''}
                onChange={onChange}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9.]/g, '')
                }}
              />
            </CCol>

            <CCol md={3} className="mb-4">
              <h6>GST (%)</h6>
              <CFormInput
                type="text"
                name="gst"
                placeholder="GST (%)"
                value={newService.gst || ''}
                onChange={onChange}
              />
            </CCol>
          </CRow>

          {/* Taxes, Offers, Sittings */}
          <CRow>
            <CCol md={3} className="mb-4">
              <h6>Other Taxes (%)</h6>
              <CFormInput
                type="text"
                name="taxPercentage"
                placeholder="Tax Percentage"
                value={newService.taxPercentage || ''}
                onChange={onChange}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9.]/g, '')
                }}
              />
            </CCol>

            <CCol md={3} className="mb-4">
              <h6>Offer Start Date</h6>
              <CFormInput
                type="date"
                name="offerValidDate"
                min={new Date().toISOString().split('T')[0]}
                value={newService.offerValidDate || ''}
                onChange={onChange}
              />
              {errors.offerValidDate && (
                <CFormText className="text-danger">{errors.offerValidDate}</CFormText>
              )}
            </CCol>

            <CCol md={3} className="mb-4">
              <h6>Offer End Date</h6>
              <CFormInput
                type="date"
                name="offerEndDate"
                min={new Date().toISOString().split('T')[0]}
                value={newService.offerEndDate || ''}
                onChange={onChange}
              />
            </CCol>

            <CCol md={3} className="mb-4">
              <h6>
                No of Sittings <span className="text-danger">*</span>
              </h6>
              <CFormInput
                type="text"
                name="sittings"
                value={newService.sittings || ''}
                onChange={onChange}
                placeholder="Enter no of sittings"
              />
              {errors.sittings && (
                <CFormText className="text-danger">{errors.sittings}</CFormText>
              )}
            </CCol>
          </CRow>

          {/* Consultation Fee + Min Time + Image + Description */}
          <CRow>
            <CCol md={3} className="mb-4">
              <h6>
                Consultation Fee <span className="text-danger">*</span>
              </h6>
              <CFormInput
                type="text"
                name="consultationFee"
                value={newService.consultationFee || ''}
                onChange={onChange}
                placeholder="Enter Consultation Fee"
              />
              {errors.consultationFee && (
                <CFormText className="text-danger">{errors.consultationFee}</CFormText>
              )}
            </CCol>
            <CCol md={3} className="mb-4">
              <h6>
                Payment Type <span className="text-danger">*</span>
              </h6>

              {/* Payment Type Dropdown */}
              <CFormSelect
                name="paymentType"
                value={newService.paymentType || ''}
                onChange={onChange}
              >
                <option value="">Select Payment Type</option>
                <option value="FULL_PAYMENT">Full Payment</option>
                <option value="PARTIAL_PAYMENT">Partial Payment</option>
              </CFormSelect>

              {errors.paymentType && (
                <CFormText className="text-danger">{errors.paymentType}</CFormText>
              )}
            </CCol>
            {newService.paymentType === 'PARTIAL_PAYMENT' && (
              <CCol md={4} className="mb-4">
                <h6>
                  Partial Payment Percentage <span className="text-danger">*</span>
                </h6>

                <CFormInput
                  type="number"
                  name="partialPaymentPercentage"
                  placeholder="Enter percentage (e.g. 30)"
                  min={1}
                  max={99}
                  value={newService.partialPaymentPercentage || ''}
                  onChange={onChange}
                />

                {errors.partialPaymentPercentage && (
                  <CFormText className="text-danger">{errors.partialPaymentPercentage}</CFormText>
                )}
              </CCol>
            )}
            <CCol md={3} className="mb-4">
              <h6>
                Min Time <span className="text-danger">*</span>
              </h6>

              <CFormInput
                type="text"
                name="minTimeValue"
                placeholder="Enter time"
                value={newService.minTimeValue || ''}
                onChange={onChange}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, '')
                }}
              />

              {errors.minTimeValue && (
                <CFormText className="text-danger">{errors.minTimeValue}</CFormText>
              )}
            </CCol>

            <CCol md={3} className="mb-4">
              <h6>
                Min Value <span className="text-danger">*</span>
              </h6>

              <CFormSelect
                name="minTimeUnit"
                className="ms-2"
                value={newService.minTimeUnit || ''}
                onChange={onChange}
              >
                <option value="" disabled>
                  Select Value
                </option>
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
              </CFormSelect>

              {errors.minTimeUnit && (
                <CFormText className="text-danger">{errors.minTimeUnit}</CFormText>
              )}
            </CCol>

            <CCol md={3} className="mb-4">
              <h6>Procedure Link / Url (Optional)</h6>
              <CFormInput
                type="text"
                name="procedureLink"
                placeholder="Youtube, Facebook, Instagram, etc.."
                value={newService.procedureLink || ''}
                onChange={onChange}
              />
            </CCol>
            <CCol md={3} className="mb-4">
              <h6>
                View Description <span className="text-danger">*</span>
              </h6>
              <CFormTextarea
                type="text"
                placeholder="View Description"
                name="viewDescription"
                value={newService.viewDescription || ''}
                onChange={onChange}
              />
              {errors.viewDescription && (
                <CFormText className="text-danger">{errors.viewDescription}</CFormText>
              )}
            </CCol>

            <CCol md={4} className="mb-4">
              <h6>
                Procedure Image <span className="text-danger">*</span>
              </h6>
              <CFormInput type="file" accept="image/*" name="serviceImage" onChange={onChange} />
              {newService?.serviceImage && (
                <img
                  src={
                    newService.serviceImage.startsWith('data:')
                      ? newService.serviceImage
                      : `data:image/jpeg;base64,${newService.serviceImage}`
                  }
                  alt="Preview"
                  style={{ width: 100, height: 100, marginTop: 10, objectFit: 'cover' }}
                />
              )}
              {errors.serviceImage && (
                <CFormText className="text-danger">{errors.serviceImage}</CFormText>
              )}
            </CCol>
            {isEdit && (
              <CCol md={4} className="mb-4">
                <h6>NGK Discount Percentage</h6>

                <CInputGroup>
                  <CFormInput
                    type="number"
                    placeholder="NGK Discount"
                    name="ngkDiscountAmount"
                    value={newService.ngkDiscountAmount || 'N/A'}
                    onChange={onChange}
                    min={0}
                  />
                  <CInputGroupText>%</CInputGroupText>
                </CInputGroup>
              </CCol>
            )}
          </CRow>

          {/* QA Section */}
          <h6 className="mt-3">Procedure (Optional)</h6>
          <ProcedureQA
            preQAList={newService.preProcedureQA}
            setPreQAList={(data) =>
              onChange({ target: { name: 'preProcedureQA', value: data, type: 'text' } })
            }
            procedureQAList={newService.procedureQA}
            setProcedureQAList={(data) =>
              onChange({ target: { name: 'procedureQA', value: data, type: 'text' } })
            }
            postQAList={newService.postProcedureQA}
            setPostQAList={(data) =>
              onChange({ target: { name: 'postProcedureQA', value: data, type: 'text' } })
            }
          />
        </CForm>
      </CModalBody>

      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          Cancel
        </CButton>
        <CButton
          color="info"
          className="pink-Btn"
          onClick={isEdit ? onUpdate : onSave}
          disabled={saveloading}
        >
          {saveloading && (
            <span className="spinner-border text-white spinner-border-sm me-2"></span>
          )}
          {saveloading ? (isEdit ? 'Updating...' : 'Saving...') : isEdit ? 'Update' : 'Save'}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ServiceFormModal
