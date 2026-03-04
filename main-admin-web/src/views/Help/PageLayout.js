import React, { useEffect, useState } from 'react'
import { CContainer } from '@coreui/react'
import { useHospital } from '../../views/Usecontext/HospitalContext'
import HospitalDetailsTabs from './HospitalDetailsTabs'

const PageLayout = ({ title, children, branch }) => {
  const { selectedHospital } = useHospital()
  const hospital = selectedHospital?.data

  return (
    <CContainer fluid>
      {/* 🔸 Page Title */}
      {title && (
        <h2
          className="mb-4"
          style={{
            fontWeight: 600,
            color: 'var(--color-black)',
            borderBottom: '2px solid #e6e6e6',
            paddingBottom: '8px',
          }}
        >
          {title}
        </h2>
      )}

      {/* 🔸 Hospital Information Card */}
      {branch && hospital && (
        <div>
          <div className="d-flex align-items-start" style={{ gap: '16px', flexWrap: 'wrap' }}>
           
            {hospital && (
              <div style={{ border: '1px solid #f1f1f1', padding: '16px 0' }}>
                {/* TOP SECTION */}
                <div
                  className="p-3 rounded mb-4"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-black), var(--color-bgcolor))',
                    color: 'white',
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    {/* Logo */}
                    {hospital.hospitalLogo ? (
                      <img
                        src={
                          hospital.hospitalLogo.startsWith('data:')
                            ? hospital.hospitalLogo
                            : `data:image/jpeg;base64,${hospital.hospitalLogo}`
                        }
                        alt="Logo"
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 10,
                          objectFit: 'cover',
                          border: '2px solid white',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 80,
                          height: 80,
                          background: '#fff',
                          borderRadius: 10,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--color-black)',
                          fontWeight: 600,
                          border: '1px solid #fff',
                        }}
                      >
                        No Logo
                      </div>
                    )}

                    <div className="text-white">
                      <h3 className="mb-1 fw-bold text-white">{hospital.name}</h3>
                      <p className="mb-0 text-white">{hospital.clinicType}</p>
                      <p className="mb-0 text-white" style={{ fontSize: '0.9rem' }}>
                        {hospital.address}, {hospital.city}
                      </p>
                    </div>
                  </div>
                </div>

                {/* DETAIL GRID */}
                <HospitalDetailsTabs hospital={hospital} />
              </div>
            )}
          </div>
        </div>
      )}
      {/* 🔸 Page Main Content */}
      <div>{children}</div>
    </CContainer>
  )
}

export default PageLayout
