import React, { Suspense } from "react";
import {
  CCard,
  CCardBody,
  CButton
} from "@coreui/react";
import { useLocation, useNavigate } from "react-router-dom";
import AppointmentsTable from "./AppointmentsTable";

const Appointments_Tabs = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const clinic = location.state || null;

  if (!clinic) {
    return (
      <CCard className="p-4 mt-3 text-center">
        <h4 className="text-danger">⚠ No Clinic Data Found!</h4>
        <p>Please go back and select a clinic from the list.</p>
        <CButton onClick={() => navigate(-1)} color="primary">
          Go Back
        </CButton>
      </CCard>
    );
  }

  return (
    <CCard className="shadow-sm">
      {/* Header */}
      <div
        className="p-3 d-flex justify-content-between align-items-center rounded"
        style={{
          background: "linear-gradient(135deg, var(--color-black), var(--color-bgcolor))",
          color: "white",
        }}
      >
        <h5 className="mb-1" style={{ color: "white" }}>
          {clinic?.name || "Clinic"} — Appointments
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

      <CCardBody>
        <Suspense fallback={<p>Loading Appointments...</p>}>
          {/* passes clinicId if needed */}
          <AppointmentsTable bookingId={clinic?.bookingId} clinic={clinic} />
        </Suspense>
      </CCardBody>
    </CCard>
  );
};

export default Appointments_Tabs;
