import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CListGroup,
  CListGroupItem,
  CButton,
  CBadge,
} from '@coreui/react'

// Dummy data export (can be imported elsewhere)
export const helpCenterData = {
  clinicName: 'Dermacare Clinic',
  support: {
    whatsapp: '+919876543210',
    email: 'support@dermacareclinic.com',
    phone: '+91-98765-43210',
    hours: 'Mon - Sat, 9:00 AM - 6:00 PM (IST)',
  },
  dermaCareSupport: {
    page: 'https://www.dermacareclinic.com/support',
    faqs: 'https://www.dermacareclinic.com/faqs',
  },
  branches: [
    {
      id: 1,
      name: 'Dermacare - Jubilee Hills',
      address: '12/A Road, Jubilee Hills, Hyderabad, Telangana',
      phone: '+91-98765-43211',
      mapLink: 'https://maps.google.com/?q=Jubilee+Hills+Hyderabad',
    },
    {
      id: 2,
      name: 'Dermacare - Banjara Hills',
      address: '45/2 Street, Banjara Hills, Hyderabad, Telangana',
      phone: '+91-98765-43212',
      mapLink: 'https://maps.google.com/?q=Banjara+Hills+Hyderabad',
    },
    {
      id: 3,
      name: 'Dermacare - Secunderabad',
      address: '88 Green Lane, Secunderabad, Telangana',
      phone: '+91-98765-43213',
      mapLink: 'https://maps.google.com/?q=Secunderabad',
    },
  ],
}

const makeWhatsAppLink = (number, text = '') => {
  const cleaned = number.replace(/[^+0-9]/g, '')
  const encoded = encodeURIComponent(text)
  // wa.me requires phone in international format without +
  const pure = cleaned.replace(/^\+/, '')
  return `https://wa.me/${pure}${text ? `?text=${encoded}` : ''}`
}

export default function HelpCenter() {
  const data = helpCenterData

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <CCard className="mb-4">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">{data.clinicName} — Help Center</h4>
          <CBadge color="info">Support</CBadge>
        </CCardHeader>
        <CCardBody>
          <p className="mb-3">Need help? Choose a contact method below — WhatsApp, phone, or email. For dermatology-specific questions see Derma Care Support.</p>

          <CRow className="g-3">
            <CCol sm={12} md={6} lg={4}>
              <CCard className="h-100">
                <CCardHeader>WhatsApp</CCardHeader>
                <CCardBody>
                  <p className="mb-2">Chat with our support team on WhatsApp for quick assistance.</p>
                  <div className="d-flex gap-2">
                    <a
                      href={makeWhatsAppLink(data.support.whatsapp, 'Hello%20Dermacare%20Support')}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <CButton color="success">Open WhatsApp</CButton>
                    </a>
                    <a href={`tel:${data.support.phone}`}>
                      <CButton color="secondary" variant="outline">Call</CButton>
                    </a>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>

            <CCol sm={12} md={6} lg={4}>
              <CCard className="h-100">
                <CCardHeader>Email</CCardHeader>
                <CCardBody>
                  <p className="mb-2">Send us an email with your query and attachments (if any).</p>
                  <a href={`mailto:${data.support.email}`}>
                    <CButton color="primary">Email Support</CButton>
                  </a>
                  <div className="mt-2 small text-muted">Typical response: within 24-48 hours</div>
                </CCardBody>
              </CCard>
            </CCol>

            <CCol sm={12} md={12} lg={4}>
              <CCard className="h-100">
                <CCardHeader>Phone</CCardHeader>
                <CCardBody>
                  <p className="mb-2">Call us for appointment bookings and urgent consultations.</p>
                  <a href={`tel:${data.support.phone}`}>
                    <CButton color="danger">{data.support.phone}</CButton>
                  </a>
                  <div className="mt-2 small text-muted">Hours: {data.support.hours}</div>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>

          <hr />

          <h5>Derma Care Support</h5>
          <p>If you have dermatology-specific questions (treatments, postop care, product recommendations), visit our Derma Care Support pages:</p>
          <div className="d-flex gap-2 mb-3">
            <a href={data.dermaCareSupport.page} target="_blank" rel="noreferrer">
              <CButton color="dark">Derma Care Support Page</CButton>
            </a>
            <a href={data.dermaCareSupport.faqs} target="_blank" rel="noreferrer">
              <CButton color="outline">FAQs</CButton>
            </a>
          </div>

          <h5>Branches</h5>
          <CListGroup flush>
            {data.branches.map((b) => (
              <CListGroupItem key={b.id} className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="fw-bold">{b.name}</div>
                  <div className="small">{b.address}</div>
                  <div className="small">Phone: <a href={`tel:${b.phone}`}>{b.phone}</a></div>
                </div>
                <div className="d-flex flex-column align-items-end">
                  <a href={b.mapLink} target="_blank" rel="noreferrer">Open on map</a>
                  <a className="mt-2" href={makeWhatsAppLink(b.phone, 'Hello%20from%20branch') } target="_blank" rel="noreferrer">WhatsApp branch</a>
                </div>
              </CListGroupItem>
            ))}
          </CListGroup>

        </CCardBody>
      </CCard>

      <div className="text-center small text-muted">This is dummy data for UI/demo purposes. Replace <code>helpCenterData</code> with your real support info.</div>
    </div>
  )
}
