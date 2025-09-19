import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHospital } from '../views/Usecontext/HospitalContext'

import { CSidebar, CSidebarHeader, CSidebarFooter, CSidebarToggler } from '@coreui/react'

import { AppSidebarNav } from './AppSidebarNav'
import navigation from '../_nav'
import { useNavigate } from 'react-router-dom'
import './sidebar.css'
import { COLORS } from '../Constant/Themes'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const { selectedHospital } = useHospital()
  const navigate = useNavigate()
  const hospitalName = localStorage.getItem('HospitalName') || 'Hospital Name'

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
        <div className="d-flex flex-column align-items-center">
          {/* Logo */}
          {selectedHospital?.data.hospitalLogo ? (
            <img
              className="profile-image"
              src={
                selectedHospital?.data.hospitalLogo.startsWith('data:')
                  ? selectedHospital?.data.hospitalLogo
                  : `data:image/jpeg;base64,${selectedHospital?.data.hospitalLogo}`
              }
              alt={selectedHospital?.data.name || 'Hospital Logo'}
              style={{ width: '50px', height: '50px', marginBottom: '0px' }}
            />
          ) : (
            <p>Loading logo...</p>
          )}

          {/* Hospital Name */}
          <div
            key={sidebarShow}
            className="text-center py-3 clinic-header"
            onClick={() => navigate('/dashboard')}
            style={{
              width: '80%', // control wrapping width
              wordWrap: 'break-word',
              textAlign: 'center',
              minHeight: '2.5em', // ensures at least 2 lines height
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
         
            }}
          >
            {hospitalName || 'Hospital Name'}
          </div>
        </div>
      </CSidebarHeader>

      <AppSidebarNav items={navigation} />

      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })} />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
