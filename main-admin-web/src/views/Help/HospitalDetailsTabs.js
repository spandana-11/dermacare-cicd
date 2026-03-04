import { CNav, CNavItem, CNavLink, CTabContent, CTabPane } from '@coreui/react'
import { useState } from 'react'

const HospitalDetailsTabs = ({ hospital }) => {
  const [activeKey, setActiveKey] = useState(1)

  return (
    <div
      style={{
        border: '1px solid grey',
        padding: '10px',
        borderRadius: '8px',
        marginTop: '10px',
        backgroundColor: 'white',
      }}
    >
      {/* TAB HEADERS */}
      <CNav variant="tabs" role="tablist" style={{ cursor: 'pointer' }}>
        <CNavItem>
          <CNavLink active={activeKey === 1} onClick={() => setActiveKey(1)}>
            Basic Details
          </CNavLink>
        </CNavItem>

        <CNavItem>
          <CNavLink active={activeKey === 2} onClick={() => setActiveKey(2)}>
            Contact
          </CNavLink>
        </CNavItem>

        <CNavItem>
          <CNavLink active={activeKey === 3} onClick={() => setActiveKey(3)}>
            Timings
          </CNavLink>
        </CNavItem>

        <CNavItem>
          <CNavLink active={activeKey === 4} onClick={() => setActiveKey(4)}>
            Bank Information
          </CNavLink>
        </CNavItem>

        <CNavItem>
          <CNavLink active={activeKey === 5} onClick={() => setActiveKey(5)}>
            License Information
          </CNavLink>
        </CNavItem>

        <CNavItem>
          <CNavLink active={activeKey === 6} onClick={() => setActiveKey(6)}>
            Social Media
          </CNavLink>
        </CNavItem>

        <CNavItem>
          <CNavLink active={activeKey === 7} onClick={() => setActiveKey(7)}>
            Location
          </CNavLink>
        </CNavItem>
      </CNav>

      {/* TAB BODY */}
      <CTabContent>
        <CTabPane visible={activeKey === 1} style={{ color: 'var(--color-black)' }}>
          <DetailCard
            title="📌 Basic Details"
            fields={{
              'Clinic ID': hospital.clinicId,
              'Clinic Type': hospital.clinicType,
              Recommended: hospital.recommended ? 'Yes' : 'No',
              Subscription: hospital.subscription,
              Status: hospital.status,
            }}
          />
        </CTabPane>

        <CTabPane visible={activeKey === 2} style={{ color: 'var(--color-black)' }}>
          <DetailCard
            title="📞 Contact Information"
            fields={{
              Phone: hospital.contactNumber,
              WhatsApp: hospital.whatsappNumber,
              Email: hospital.email,
              Website: hospital.website,
              'Primary Contact Person': hospital.primaryContactPerson,
            }}
          />
        </CTabPane>

        <CTabPane visible={activeKey === 3} style={{ color: 'var(--color-black)' }}>
          <DetailCard
            title="⏰ Clinic Timings"
            fields={{
              'Opening Time': hospital.openingTime,
              'Closing Time': hospital.closingTime,
            }}
          />
        </CTabPane>

        <CTabPane visible={activeKey === 4} style={{ color: 'var(--color-black)' }}>
          <DetailCard
            title="🏦 Bank Information"
            fields={{
              'Account Name': hospital.bankAccountName,
              'Account Number': hospital.bankAccountNumber,
              'IFSC Code': hospital.ifscCode,
              Branch: hospital.branch,
              'UPI ID': hospital.upiId,
            }}
          />
        </CTabPane>

        <CTabPane visible={activeKey === 5} style={{ color: 'var(--color-black)' }}>
          <DetailCard
            title="📄 License Information"
            fields={{
              'License Number': hospital.licenseNumber,
              'Issuing Authority': hospital.issuingAuthority,
              'Form Type': hospital.drugLicenseFormType,
              'Has Pharmacist': hospital.hasPharmacist,
              'Medicines Sold On-Site': hospital.medicinesSoldOnSite === 'true' ? 'Yes' : 'No',
            }}
          />
        </CTabPane>

        <CTabPane visible={activeKey === 6} style={{ color: 'var(--color-black)' }}>
          <DetailCard
            title="🌐 Social Media Links"
            fields={{
              Instagram: hospital.instagramHandle,
              Facebook: hospital.facebookHandle,
              Twitter: hospital.twitterHandle,
            }}
          />
        </CTabPane>

        <CTabPane visible={activeKey === 7} style={{ color: 'var(--color-black)' }}>
          <DetailCard
            title="📍 Location Coordinates"
            fields={{
              Latitude: hospital.latitude,
              Longitude: hospital.longitude,
            }}
          />
        </CTabPane>
      </CTabContent>
    </div>
  )
}

export default HospitalDetailsTabs

const DetailCard = ({ title, fields }) => {
  return (
    <div className="row g-3 mt-2">
      {Object.entries(fields).map(([label, value]) => (
        <div key={label} className="col-12 col-md-4">
          <div className="p-2">
            <strong className="text-muted">{label}:</strong>{' '}
            {value || <span className="text-muted">—</span>}
          </div>
        </div>
      ))}
    </div>
  )
}