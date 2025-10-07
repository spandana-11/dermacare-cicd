import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHospital } from '../views/Usecontext/HospitalContext'

import { CSidebar, CSidebarHeader, CSidebarFooter, CSidebarToggler } from '@coreui/react'

import { AppSidebarNav } from './AppSidebarNav'
import { getNavigation } from '../_nav'
import { useNavigate } from 'react-router-dom'
import './sidebar.css'
import { COLORS } from '../Constant/Themes'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const { selectedHospital, hydrated, user } = useHospital()
  const navigate = useNavigate()

  if (!hydrated) return null // show spinner if needed

  const hospitalName = selectedHospital?.data.name || 'Hospital Name'
  const hospitalLogo = selectedHospital?.data.hospitalLogo || null
  const navItems = getNavigation(user?.permissions || {})
  return (
    <CSidebar
      className="border-end"
      style={{ background: 'var(--color-bgcolor)' }}
      color={COLORS.teal}
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="border-bottom">
        <div
          className="d-flex flex-column align-items-center justify-content-center"
          style={{ width: '100%', padding: '12px 0', textAlign: 'center' }}
        >
          {hospitalLogo ? (
            <img
              className="profile-image"
              src={
                hospitalLogo.startsWith('data:')
                  ? hospitalLogo
                  : `data:image/jpeg;base64,${hospitalLogo}`
              }
              alt={hospitalName}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                objectFit: 'cover',
                marginBottom: '8px',
              }}
            />
          ) : (
            <p>Loading logo...</p>
          )}

          <div
            className="clinic-header"
            onClick={() => navigate('/dashboard')}
            style={{
              width: '80%',
              wordWrap: 'break-word',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              lineHeight: '1.2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {hospitalName}
          </div>
        </div>
      </CSidebarHeader>

      <AppSidebarNav items={navItems} />

      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })} />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
