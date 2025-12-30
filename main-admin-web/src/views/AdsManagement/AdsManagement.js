import React, { useState } from 'react'
import {
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CCard,
  CCardBody,
  CCardHeader,
} from '@coreui/react'

const AdsManagement = () => {
  const [activeKey, setActiveKey] = useState(1)

  return (
    <CCard className="shadow-sm border-0">
      <CCardHeader className="bg-primary text-white fw-bold text-center">
        Advertisement Management
      </CCardHeader>
      <CCardBody>
        {/* Navigation Tabs */}
        <CNav variant="tabs" role="tablist" className="mb-3">
          <CNavItem>
            <CNavLink
              active={activeKey === 1}
              onClick={() => setActiveKey(1)}
              className="cursor-pointer"
            >
              Dashboard Ads
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={activeKey === 2}
              onClick={() => setActiveKey(2)}
              className="cursor-pointer"
            >
              Service Ads
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={activeKey === 3}
              onClick={() => setActiveKey(3)}
              className="cursor-pointer"
            >
              Clinic Ads
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={activeKey === 4}
              onClick={() => setActiveKey(4)}
              className="cursor-pointer"
            >
              Doctor Web Ads
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={activeKey === 5}
              onClick={() => setActiveKey(5)}
              className="cursor-pointer"
            >
              Doctor Web Vertical
            </CNavLink>
          </CNavItem>
        </CNav>

        {/* Tabs Content */}
        <CTabContent>
          {/* Tab 1: Dashboard Ads */}
          <CTabPane visible={activeKey === 1}>
            <CCard className="border-light shadow-sm">
              <CCardBody>
                <h5 className="fw-bold text-primary mb-3">Dashboard Ads</h5>
                <p>
                  Manage all advertisements displayed on the main dashboard here.
                </p>
                {/* Add your table or upload section here */}
              </CCardBody>
            </CCard>
          </CTabPane>

          {/* Tab 2: Service Ads */}
          <CTabPane visible={activeKey === 2}>
            <CCard className="border-light shadow-sm">
              <CCardBody>
                <h5 className="fw-bold text-success mb-3">Service Ads</h5>
                <p>
                  Upload and manage ads specific to services shown in the app.
                </p>
              </CCardBody>
            </CCard>
          </CTabPane>

          {/* Tab 3: Clinic Ads */}
          <CTabPane visible={activeKey === 3}>
            <CCard className="border-light shadow-sm">
              <CCardBody>
                <h5 className="fw-bold text-warning mb-3">Clinic Ads</h5>
                <p>View and manage all clinic-related promotional content.</p>
              </CCardBody>
            </CCard>
          </CTabPane>

          {/* Tab 4: Doctor Web Ads */}
          <CTabPane visible={activeKey === 4}>
            <CCard className="border-light shadow-sm">
              <CCardBody>
                <h5 className="fw-bold text-info mb-3">Doctor Web Ads</h5>
                <p>Manage advertisements shown on the Doctor Web interface.</p>
              </CCardBody>
            </CCard>
          </CTabPane>

          {/* Tab 5: Doctor Web Vertical */}
          <CTabPane visible={activeKey === 5}>
            <CCard className="border-light shadow-sm">
              <CCardBody>
                <h5 className="fw-bold text-danger mb-3">Doctor Web Vertical</h5>
                <p>
                  Manage vertical ad banners displayed on Doctor Web pages.
                </p>
              </CCardBody>
            </CCard>
          </CTabPane>
        </CTabContent>
      </CCardBody>
    </CCard>
  )
}

export default AdsManagement
