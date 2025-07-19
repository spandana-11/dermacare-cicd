import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHospital } from '../views/Usecontext/HospitalContext'

import { CSidebar, CSidebarHeader, CSidebarFooter, CSidebarToggler } from '@coreui/react'

import { AppSidebarNav } from './AppSidebarNav'
import navigation from '../_nav'
import { useNavigate } from 'react-router-dom'
import './sidebar.css'

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
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="border-bottom">
        <div
          key={sidebarShow}
          className="text-center py-3 clinic-header "
          onClick={() => navigate('/dashboard')}
        >
          {hospitalName}
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
