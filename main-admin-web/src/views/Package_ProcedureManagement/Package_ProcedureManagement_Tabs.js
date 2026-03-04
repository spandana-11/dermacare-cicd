import React, { useState, Suspense } from "react";
import {
  CCard,
  CCardBody,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CButton
} from "@coreui/react";
import { useLocation, useNavigate } from "react-router-dom";
import PackageManagement from "../PackageManagement/PackageManagement";

// Lazy-load Procedures component
const ServiceManagement = React.lazy(() =>
  import("../MainProcedureManagement/ProcedureManagement")
);

const Package_ProcedureManagement_Tabs = () => {
  const [activeTab, setActiveTab] = useState(1);

  const location = useLocation();
  const navigate = useNavigate();

  // Get clinic data from route state
  const clinic = location.state || null;

  // ❗ If no clinic data, show fallback message
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
    <CCard>

      {/* ---------- HEADER ---------- */}
      <div
        className="text-white p-3 d-flex justify-content-between align-items-center rounded"
        style={{
          background: "linear-gradient(135deg, var(--color-black), var(--color-bgcolor))",
          color: "white"
        }}
      >
        <h5 className="mb-1" style={{ color: "white" }}>
          {clinic?.name || "Clinic"} — Procedures & Packages
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

        {/* ---------- TABS ---------- */}
        <CNav variant="tabs" role="tablist" className="mb-3">

          {/* PROCEDURES TAB */}
          <CNavItem>
            <CNavLink
              active={activeTab === 1}
              onClick={() => setActiveTab(1)}
              style={{ cursor: "pointer" }}
            >
              Procedures
            </CNavLink>
          </CNavItem>

          {/* PACKAGES TAB */}
          <CNavItem>
            <CNavLink
              active={activeTab === 2}
              onClick={() => setActiveTab(2)}
              style={{ cursor: "pointer" }}
            >
              Packages
            </CNavLink>
          </CNavItem>

        </CNav>

        {/* ---------- TAB CONTENT ---------- */}
        <CTabContent className="mt-3">

          {/* ===================== PROCEDURES TAB ========================= */}
          <CTabPane visible={activeTab === 1}>
            <Suspense fallback={<p>Loading Procedures...</p>}>
              <ServiceManagement clinic={clinic} />
            </Suspense>
          </CTabPane>

          {/* ===================== PACKAGES TAB ========================= */}
          <CTabPane visible={activeTab === 2}>
            <Suspense fallback={<p>Loading Packages...</p>}>
              <PackageManagement clinic={clinic} />
            </Suspense>
          </CTabPane>

        </CTabContent>

      </CCardBody>

    </CCard>
  );
};

export default Package_ProcedureManagement_Tabs;
