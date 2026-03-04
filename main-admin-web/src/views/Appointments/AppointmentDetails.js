import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CCard,
  CCardBody,
  CButton,
  CBadge,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane
} from "@coreui/react";

const AppointmentDetails = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [activeTab, setActiveTab] = useState(0);

  if (!state) {
    return (
      <CCard className="p-4 mt-4 text-center">
        <h4 className="text-danger mb-2">⚠ No Appointment Data Found!</h4>
        <CButton color="primary" onClick={() => navigate(-1)}>Go Back</CButton>
      </CCard>
    );
  }
  const getStatusStyle = (status) => {
    switch (status) {
      case "CONFIRMED":
        return { backgroundColor: "#CCE5FF", color: "#084298" };
      case "COMPLETED":
        return { backgroundColor: "#E5E7EB", color: "#6B7280" };
      case "HOLD":
        return { backgroundColor: "#F8D7DA", color: "#842029" };
      default:
        return { backgroundColor: "#E2E3E5", color: "#41464b" };
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-GB", options); // e.g. 15 Jan 2026
  };
  return (
    <div className="p-3">
      <CCard>

        {/* Header */}
        <div
          className="text-white p-3 d-flex justify-content-between align-items-center rounded"
          style={{
            background: "linear-gradient(135deg, var(--color-black), var(--color-bgcolor))",
          }}
        >
          <h5 className="mb-1" style={{ color: "white" }}>
            {state.fullName} —{" "}
            <CBadge
              style={{
                ...getStatusStyle(state.status),
                padding: "6px 12px",
                borderRadius: "6px",
                fontWeight: 600,

              }}
            >
              {state.status}
            </CBadge>
          </h5>

          <CButton
            size="sm"
            style={{
              background: '#fff',
              color: 'var(--color-black)',
              border: '1px solid var(--color-black)',
              fontWeight: 600,
              borderRadius: 8,
              padding: '6px 14px',
            }}
            onClick={() => navigate(-1)}
          >
            Back
          </CButton>
        </div>
      </CCard>

      {/* Tabs */}
      <CNav variant="tabs" className="mt-3 themed-tabs">
        <CNavItem>
          <CNavLink
            className="theme-tab"
            active={activeTab === 0}
            onClick={() => setActiveTab(0)}
          >
            Patient
          </CNavLink>
        </CNavItem>

        <CNavItem>
          <CNavLink
            className="theme-tab"
            active={activeTab === 1}
            onClick={() => setActiveTab(1)}
          >
            Clinic
          </CNavLink>
        </CNavItem>

        <CNavItem>
          <CNavLink
            className="theme-tab"
            active={activeTab === 2}
            onClick={() => setActiveTab(2)}
          >
            Appointment
          </CNavLink>
        </CNavItem>

        <CNavItem>
          <CNavLink
            className="theme-tab"
            active={activeTab === 3}
            onClick={() => setActiveTab(3)}
          >
            Payment
          </CNavLink>
        </CNavItem>
      </CNav>


      {/* Card Starts BELOW Tabs */}
      <CCard className="mt-2">
        <CCardBody>
          <CTabContent>

            {/* Patient */}
            <CTabPane visible={activeTab === 0}>

              <div className="row mb-2">
                <div className="col-6"><strong style={{ color: 'var(--color-black)' }}>Name:</strong> {state.fullName}</div>
                <div className="col-6"><strong style={{ color: 'var(--color-black)' }}>Gender:</strong> {state.gender}</div>
              </div>
              <div className="row mb-2">
                <div className="col-6"><strong style={{ color: 'var(--color-black)' }}>DOB:</strong> {formatDate(state.dob)}</div>
                <div className="col-6"><strong style={{ color: 'var(--color-black)' }}>Age:</strong> {state.ageLabel}</div>
              </div>
              <div className="row mb-2">
                <div className="col-6"><strong style={{ color: 'var(--color-black)' }}>Mobile:</strong> {state.mobileNumber}</div>
                <div className="col-6"><strong style={{ color: 'var(--color-black)' }}>City:</strong> {state.city}</div>
              </div>
            </CTabPane>

            {/* Clinic */}
            <CTabPane visible={activeTab === 1}>
              <div className="row mb-2">
                <div className="col-6"><strong style={{ color: 'var(--color-black)' }}>Clinic:</strong> {state.clinicName}</div>
                <div className="col-6"><strong style={{ color: 'var(--color-black)' }}>Booking ID:</strong> {state.bookingId}</div>
              </div>
              <div className="row mb-2">
                <div className="col-12"><strong style={{ color: 'var(--color-black)' }}>Address:</strong> {state.clinicAddress}</div>
              </div>
            </CTabPane>

            {/* Appointment */}
            <CTabPane visible={activeTab === 2}>
         
              <div className="row mb-2">
                <div className="col-6"><strong style={{ color: 'var(--color-black)' }}>Date:</strong> {formatDate(state.appointmentDate)}</div>
                <div className="col-6">
                  <strong style={{ color: 'var(--color-black)' }}>Status:</strong>{" "}
                  <span
                    style={{
                      ...getStatusStyle(state.status),
                      padding: "4px 10px",
                      fontSize: "12px",
                      borderRadius: "6px",
                      fontWeight: 600,
                      display: "inline-block",
                    }}
                  >
                    {state.status}
                  </span>
                </div>

              </div>
              <div className="row mb-2">
                <div className="col-6"><strong style={{ color: 'var(--color-black)' }}>Service:</strong> {state.serviceName}</div>
                <div className="col-6"><strong style={{ color: 'var(--color-black)' }}>Type:</strong> {state.serviceType}</div>
              </div>
              <div className="row mb-2">
                <div className="col-6"><strong style={{ color: 'var(--color-black)' }}>Customer ID:</strong> {state.customerId}</div>
                <div className="col-6"><strong style={{ color: 'var(--color-black)' }}>Service ID:</strong> {state.serviceId}</div>
              </div>
            </CTabPane>

            {/* Payment */}
            <CTabPane visible={activeTab === 3}>
           
              <div className="row mb-2">
                <div className="col-6"><strong style={{ color: 'var(--color-black)' }}>Base Price:</strong> ₹{state.price}</div>
                <div className="col-6"><strong style={{ color: 'var(--color-black)' }}>Consultation Fee:</strong> ₹{state.consultationFee}</div>
              </div>
              <div className="row mb-2">
                <div className="col-6"><strong style={{ color: 'var(--color-black)' }}>Payment Type:</strong> {state.paymentType}</div>
                <div className="col-6"><strong style={{ color: 'var(--color-black)' }}>Payment Status:</strong> {state.paymentStatus}</div>
              </div>
              <div className="row mb-2">
                <div className="col-6"><strong style={{ color: 'var(--color-black)' }}>Payment Mode:</strong> {state.paymentMode ?? "N/A"}</div>
                <div className="col-6"><strong style={{ color: 'var(--color-black)' }}>Discount:</strong> {state.totalDiscountPercentage}% (₹{state.totalDiscountAmount})</div>
              </div>
              <div className="row mb-2">
                <div className="col-6"><strong style={{ color: 'var(--color-black)' }}>Discounted Cost:</strong> ₹{state.discountedCost}</div>
                <div className="col-6"><strong style={{ color: 'var(--color-black)' }}>NGK Discount:</strong> {state.ngkDiscountPercentage}% (₹{state.ngkDiscount})</div>
              </div>
              <div className="row mb-2">
                <div className="col-6"><strong style={{ color: 'var(--color-black)' }}>Tax :</strong> {state.taxPercentage}% (₹{state.taxAmount})</div>
                <div className="col-6"><strong style={{ color: 'var(--color-black)' }}>GST:</strong> {state.gst}% (₹{state.gstAmount})</div>
              </div>
              <div className="row mb-2">
                <div className="col-6"><strong style={{ color: 'var(--color-black)' }}>Redeemed Points:</strong> {state.redeemedPoints}</div>
                <div className="col-6"><strong style={{ color: 'var(--color-black)' }}>Partial Amount:</strong> ₹{state.partialAmount}</div>
              </div>
              <div className="row mb-2">
                <div className="col-6"><strong style={{ color: 'var(--color-black)' }}>Due Amount:</strong> ₹{state.dueAmount}</div>
                <div className="col-6"><strong style={{ color: 'var(--color-black)' }}>Final Amount:</strong> <strong>₹{state.finalAmount}</strong></div>
              </div>
            </CTabPane>

          </CTabContent>
        </CCardBody>
      </CCard>
    </div>
  );
};

export default AppointmentDetails;
