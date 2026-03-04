// ServiceViewModal.jsx
import React from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CRow,
  CCol,
  CButton,
} from '@coreui/react'

const ServiceViewModal = ({ visible, data, onClose, formatMinutes }) => {
  if (!data) return null

  return (
    <CModal
      visible={visible}
      onClose={onClose}
      size="xl"
      backdrop="static"
      className="custom-modal"
    >
      <CModalHeader >
        <CModalTitle className="w-100 text-center fs-5 fw-bold">Procedure Details</CModalTitle>
      </CModalHeader>

      <CModalBody className="bg-light text-dark">
        {/* Basic Details */}
        <div className="p-3 mb-4 bg-white rounded shadow-sm">
          <h6 className="fw-bold border-bottom pb-2 mb-3">
            Basic Information
          </h6>

          <CRow className="gy-3">
            {/* IDs */}
            <CCol sm={6}>
              <p className="mb-1 fw-semibold">Clinic ID</p>
              <span className="text-muted">{data.clinicId || 'N/A'}</span>
            </CCol>

            <CCol sm={6}>
              <p className="mb-1 fw-semibold">Procedure ID</p>
              <span className="text-muted">{data.procedureId || 'N/A'}</span>
            </CCol>

            {/* Name */}
            <CCol sm={6}>
              <p className="mb-1 fw-semibold">Procedure Name</p>
              <span className="text-muted">{data.procedureName || 'N/A'}</span>
            </CCol>

            {/* Status */}
            <CCol sm={6}>
              <p className="mb-1 fw-semibold">Offer Active</p>
              <span
                className={`fw-semibold ${data.offerActive ? 'text-success' : 'text-danger'
                  }`}
              >
                {data.offerActive ? 'Yes' : 'No'}
              </span>
            </CCol>

            {/* Dates */}
            <CCol sm={6}>
              <p className="mb-1 fw-semibold">Offer Start Date</p>
              <span className="text-muted">
                {data.offerStart
                  ? new Date(data.offerStart).toLocaleDateString('en-GB')
                  : 'N/A'}
              </span>
            </CCol>

            <CCol sm={6}>
              <p className="mb-1 fw-semibold">Offer End Date</p>
              <span className="text-muted">
                {data.offerValidDate
                  ? new Date(data.offerValidDate).toLocaleDateString('en-GB')
                  : 'N/A'}
              </span>
            </CCol>
          </CRow>
        </div>

        {/* Pricing Details */}
        <div className="p-3 mb-4 bg-white rounded shadow-sm">
          <h6 className="fw-bold border-bottom pb-2 mb-3">
            Pricing Details
          </h6>

          <CRow className="gy-3">
            {/* Base Pricing */}
            <CCol sm={4}>
              <span className="fw-semibold">Price:</span>
              <span className="text-muted"> ₹ {Math.round(data.price || 0)}</span>
            </CCol>

            <CCol sm={4}>
              <span className="fw-semibold">Consultation Fee:</span>
              <span className="text-muted"> ₹ {Math.round(data.consultationFee || 0)}</span>
            </CCol>

            <CCol sm={4}>
              <span className="fw-semibold">Service Time:</span>
              <span className="text-muted"> {data.minTime || 'N/A'}</span>
            </CCol>

            <CCol sm={4}>
              <span className="fw-semibold">No. of Sittings:</span>
              <span className="text-muted"> {data.sittings || 'N/A'}</span>
            </CCol>

            {/* Discounts */}
            <CCol sm={4}>
              <span className="fw-semibold">Discount Percentage:</span>
              <span className="text-muted"> {Math.round(data.discountPercentage || 0)}%</span>
            </CCol>

            <CCol sm={4}>
              <span className="fw-semibold">Discount Amount:</span>
              <span className="text-muted"> ₹ {Math.round(data.discountAmount || 0)}</span>
            </CCol>

            <CCol sm={4}>
              <span className="fw-semibold">Discounted Cost:</span>
              <span className="text-muted"> ₹ {Math.round(data.discountedCost || 0)}</span>
            </CCol>

            {data.ngkDiscountPercentage > 0 && (
              <CCol sm={4}>
                <span className="fw-semibold">NGK Discount %:</span>
                <span className="text-muted"> {data.ngkDiscountPercentage}%</span>
              </CCol>
            )}

            <CCol sm={4}>
              <span className="fw-semibold">Total Discount %:</span>
              <span className="text-muted"> {data.totalDiscountPercentage || 0}%</span>
            </CCol>

            <CCol sm={4}>
              <span className="fw-semibold">Total Discount Amount:</span>
              <span className="text-muted"> ₹ {Math.round(data.totalDiscountAmount || 0)}</span>
            </CCol>

            <CCol sm={4}>
              <span className="fw-semibold">Total Discounted Amount:</span>
              <span className="text-muted"> ₹ {Math.round(data.totalDiscountedAmount || 0)}</span>
            </CCol>

            {/* Tax */}
            <CCol sm={4}>
              <span className="fw-semibold">Tax Percentage:</span>
              <span className="text-muted"> {Math.round(data.taxPercentage || 0)}%</span>
            </CCol>

            <CCol sm={4}>
              <span className="fw-semibold">Tax Amount:</span>
              <span className="text-muted"> ₹ {Math.round(data.taxAmount || 0)}</span>
            </CCol>

            <CCol sm={4}>
              <span className="fw-semibold">GST:</span>
              <span className="text-muted"> {data.gst ? `${Math.round(data.gst)}%` : 'N/A'}</span>
            </CCol>

            <CCol sm={4}>
              <span className="fw-semibold">GST Amount:</span>
              <span className="text-muted"> ₹ {Math.round(data.gstAmount || 0)}</span>
            </CCol>

            {/* Final */}
            <CCol sm={4}>
              <span className="fw-semibold">Clinic Pay:</span>
              <span className="text-muted"> ₹ {Math.round(data.clinicPay || 0)}</span>
            </CCol>

            <CCol sm={4}>
              <span className="fw-semibold">Final Cost:</span>
              <span className="text-muted"> ₹ {Math.round(data.finalCost || 0)}</span>
            </CCol>
            <CCol sm={4}>
              <span className="fw-semibold">Platform Fee:</span>
              <span className="text-muted"> ₹ {Math.round(data.platformFee || 0)}</span>
            </CCol>

            <CCol sm={4}>
              <span className="fw-semibold">Platform Fee Percentage %:</span>
              <span className="text-muted"> {data.platformFeePercentage ? `${Math.round(data.platformFeePercentage)}%` : 'N/A'}</span>
            </CCol>
          </CRow>
        </div>

        {/* Payment Details */}
        <div className="p-3 mb-4 bg-white rounded shadow-sm">
          <h6 className="fw-bold border-bottom pb-2 mb-3">
            Payment Details
          </h6>

          <CRow className="gy-3">
            <CCol sm={4}>
              <span className="fw-semibold">Payment Type:</span>
              <span className="text-muted"> {data.paymentType || 'N/A'}</span>
            </CCol>

            {data?.partialPaymentPercentage != null && (
              <CCol sm={4}>
                <span className="fw-semibold">Partial Payment %:</span>
                <span className="text-muted"> {data.partialPaymentPercentage}%</span>
              </CCol>
            )}

            <CCol sm={4}>
              <span className="fw-semibold">Partial Amount:</span>
              <span className="text-muted"> ₹ {Math.round(data.partialAmount || 0)}</span>
            </CCol>

            <CCol sm={4}>
              <span className="fw-semibold">Due Amount:</span>
              <span className="text-muted"> ₹ {Math.round(data.dueAmount || 0)}</span>
            </CCol>
          </CRow>
        </div>


        {/* Q&A Sections */}
        <div className="p-3 mb-4 bg-white rounded shadow-sm">
          <h6 className="fw-bold border-bottom pb-2 mb-3">Pre-Procedure QA</h6>
          {Array.isArray(data.preProcedureQA) && data.preProcedureQA.length > 0 ? (
            data.preProcedureQA.map((qa, index) => {
              const question = Object.keys(qa)[0]
              const answers = qa[question]
              return (
                <div key={index} className="mb-2">
                  <strong style={{ color: 'var(--color-black)' }} className="fw-semibold">
                    {question}
                  </strong>
                  <ul className="mb-1 text-muted ps-3">
                    {answers.map((ans, i) => (
                      <li key={i}>{ans}</li>
                    ))}
                  </ul>
                </div>
              )
            })
          ) : (
            <p className="text-muted">No Pre-Procedure Q&A available.</p>
          )}
        </div>

        <div className="p-3 mb-4 bg-white rounded shadow-sm">
          <h6 className="fw-bold border-bottom pb-2 mb-3">Procedure QA</h6>
          {Array.isArray(data.procedureQA) && data.procedureQA.length > 0 ? (
            data.procedureQA.map((qa, index) => {
              const question = Object.keys(qa)[0]
              const answers = qa[question]
              return (
                <div key={index} className="mb-2">
                  <strong>{question}</strong>
                  <ul className="mb-1 text-muted ps-3">
                    {answers.map((ans, i) => (
                      <li key={i}>{ans}</li>
                    ))}
                  </ul>
                </div>
              )
            })
          ) : (
            <p className="text-muted">No Procedure Q&A available.</p>
          )}
        </div>

        <div className="p-3 mb-4 bg-white rounded shadow-sm">
          <h6 className="fw-bold border-bottom pb-2 mb-3">Post-Procedure QA</h6>
          {Array.isArray(data.postProcedureQA) && data.postProcedureQA.length > 0 ? (
            data.postProcedureQA.map((qa, index) => {
              const question = Object.keys(qa)[0]
              const answers = qa[question]
              return (
                <div key={index} className="mb-2">
                  <strong>{question}</strong>
                  <ul className="mb-1 text-muted ps-3">
                    {answers.map((ans, i) => (
                      <li key={i}>{ans}</li>
                    ))}
                  </ul>
                </div>
              )
            })
          ) : (
            <p className="text-muted">No Post-Procedure Q&A available.</p>
          )}
        </div>

        {/* Image & Description */}
        <div className="p-3 bg-white rounded shadow-sm">
          <h6 className="fw-bold border-bottom pb-2 mb-3">
            Additional Details
          </h6>

          <CRow className="gy-3">
            {/* Procedure Image */}
            <CCol sm={6}>
              <p className="fw-semibold mb-2">Procedure Image</p>
              {data.procedureImage ? (
                <img
                  src={`data:image/png;base64,${data.procedureImage}`}
                  alt="Procedure"
                  style={{
                    width: '100%',
                    maxWidth: '250px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                  }}
                />
              ) : (
                <p className="text-muted mb-0">No image available</p>
              )}
            </CCol>

            {/* Procedure Link */}
            <CCol sm={6}>
              <p className="fw-semibold mb-2">Procedure Link</p>
              {data.procedureLink ? (
                <a
                  href={data.procedureLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-decoration-none"
                >
                  {data.procedureLink}
                </a>
              ) : (
                <p className="text-muted mb-0">N/A</p>
              )}
            </CCol>

            {/* Description */}
            <CCol sm={12}>
              <p className="fw-semibold mb-1">Description</p>
              <p className="text-muted mb-0">
                {data.description || 'N/A'}
              </p>
            </CCol>
          </CRow>
        </div>

      </CModalBody>

      <CModalFooter className="bg-light">
        <CButton color="secondary" onClick={onClose}>
          Close
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ServiceViewModal
