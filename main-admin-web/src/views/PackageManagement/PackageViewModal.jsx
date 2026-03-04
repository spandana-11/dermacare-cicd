
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

const PackageViewModal = ({ visible, data, onClose, formatMinutes }) => {
  if (!data) return null

  return (
    <CModal
      visible={visible}
      onClose={onClose}
      size="xl"
      backdrop="static"
      className="custom-modal"
    >
      <CModalHeader className="text-white">
        <CModalTitle className="w-100 text-center fs-5 fw-bold">Package Details</CModalTitle>
      </CModalHeader>

      <CModalBody className="bg-light text-dark">
        {/* Basic Details */}
        <div className="p-3 mb-4 bg-white rounded shadow-sm">
          <h6 className="fw-bold border-bottom pb-2 mb-3">Basic Information</h6>
          <CRow className="gy-2">
            <CCol sm={6}>
              <p className="mb-1 fw-semibold">Procedure Name:</p>
              <span className="text-muted">{data.packageName || 'N/A'}</span>
            </CCol>
            <CCol sm={6}>
              <p className="mb-1 fw-semibold">Procedure ID:</p>
              <span className="text-muted">{data.packageId || 'N/A'}</span>
            </CCol>
            <CCol sm={6}>
              <p className="mb-1 fw-semibold">Offer Start Date:</p>
              <span className="text-muted">
                {data.offerStart
                  ? new Date(data.offerStart).toLocaleDateString('en-GB')
                  : 'N/A'}
              </span>
            </CCol>
            <CCol sm={6}>
              <p className="mb-1 fw-semibold">Offer End Date:</p>
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
          <h6 className="fw-bold border-bottom pb-2 mb-3">Pricing Details</h6>
          <CRow className="gy-2">
            <CCol sm={4}>
              <span className="mb-1 fw-semibold">Price: </span>
              <span className="text-muted"> ₹{Math.round(data.price || 0)}</span>
            </CCol>
            <CCol sm={4}>
              <span className="mb-1 fw-semibold">Discount: </span>
              <span className="text-muted"> {Math.round(data.discountPercentage || 0)}%</span>
            </CCol>
            <CCol sm={4}>
              <span className="mb-1 fw-semibold">Discount Amount: </span>
              <span className="text-muted"> ₹{Math.round(data.discountAmount || 0)}</span>
            </CCol>
            <CCol sm={4}>
              <span className="mb-1 fw-semibold">Discounted Cost: </span>
              <span className="text-muted"> ₹{Math.round(data.discountedCost || 0)}</span>
            </CCol>
            <CCol sm={4}>
              <span className="mb-1 fw-semibold">Tax: </span>
              <span className="text-muted"> {Math.round(data.taxPercentage || 0)}%</span>
            </CCol>
            <CCol sm={4}>
              <span className="mb-1 fw-semibold">Tax Amount: </span>
              <span className="text-muted"> ₹{Math.round(data.taxAmount || 0)}</span>
            </CCol>
            <CCol sm={4}>
              <span className="mb-1 fw-semibold">Clinic Pay: </span>
              <span className="text-muted"> ₹{Math.round(data.clinicPay || 0)}</span>
            </CCol>
            <CCol sm={4}>
              <span className="mb-1 fw-semibold">GST: </span>
              <span className="text-muted">
                {data.gst ? Math.round(data.gst) + '%' : 'N/A'}
              </span>
            </CCol>
            <CCol sm={4}>
              <span className="mb-1 fw-semibold">Consultation Fee: </span>
              <span className="text-muted"> ₹ {data.consultationFee || 0}</span>
            </CCol>
            <CCol sm={4}>
              <span className="mb-1 fw-semibold">Final Cost: </span>
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
            <CCol sm={4}>
              <span className="mb-1 fw-semibold">Payment Type:</span>
              <span className="text-muted"> {data.paymentType ? data.paymentType : 'N/A'}</span>
            </CCol>
            {data?.partialPaymentPercentage != null && (
              <CCol sm={4}>
                <span className="mb-1 fw-semibold">Partial Payment Percentage:</span>
                <span className="text-muted"> {data.partialPaymentPercentage}%</span>
              </CCol>
            )}
            <CCol sm={4}>
              <span className="mb-1 fw-semibold">No. of Total Sittings: </span>
              <span className="text-muted"> {data.sittings ? data.sittings : 'N/A'}</span>
            </CCol>
            {Number(data.ngkDiscountPercentage) > 0 && (
              <CCol sm={4}>
                <span className="mb-1 fw-semibold">NGK Discount Percentage: </span>
                <span className="text-muted">
                  {data.ngkDiscountPercentage}%
                </span>
              </CCol>
            )}
          </CRow>
        </div>

        <div className="p-3 mb-4 bg-white rounded shadow-sm">
          <h6 className="fw-bold border-bottom pb-2 mb-3">Procedures</h6>

          {Array.isArray(data.procedures) && data.procedures.length > 0 ? (
            <div className="row">
              {data.procedures.map((item, index) => (
                <div key={index} className="col-12 col-md-3 mb-3">
                  <div className="p-2  bg-light rounded border" style={{ minHeight: '90px' }}>
                    <p className="fw-semibold mb-1" style={{ color: 'var(--color-black)' }}>
                      {item.procedureName}
                    </p>
                    <p className="text-muted mb-0">No. of Sittings: {item.noOfSittings}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No Procedure available.</p>
          )}
        </div>

        {/* Image & Description */}
        <div className="p-3 bg-white rounded shadow-sm">
          <h6 className="fw-bold border-bottom pb-2 mb-3">Additional Details</h6>
          <CRow>

            <CCol sm={6}>
              <p className="fw-semibold">Description:</p>
              <p className="text-muted">{data.description || 'N/A'}</p>
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

export default PackageViewModal