import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import Logo from './header/GlowKaart.png'

import {
  CSidebar,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'

import { AppSidebarNav } from './AppSidebarNav'
import './sidebar.css'
import { COLORS } from '../Constant/Themes'

// sidebar nav config
import navigation from '../_nav'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const location = useLocation() // get current path

  // Hide sidebar only on /clinicRegistration
  if (location.pathname === '/clinic-Registration') return null

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
        <div to="/">
          <div className="d-flex justify-content-center">
            <img
              src={Logo}
              alt="Glowkart Logo"
              style={{ height: '120px', marginBottom: '0px' }}
            />
          </div>
          <div
            className="d-flex justify-content-center underline-none"
            style={{ marginLeft: '20px' }}
          >

          </div>
        </div>
      </CSidebarHeader>

      <AppSidebarNav items={navigation} />
      <CSidebarFooter className="border-top d-none d-lg-flex flex-column align-items-center py-2">
        <div
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: ` var(--color-black)`,
            lineHeight: '1.2',
          }}
        >
          Neeha&apos;s GlowKart
        </div>

        <div
          style={{
            fontSize: '12px',
            fontWeight: 'bold',
            color: `var(--color-black)`,
            marginBottom: '6px',
          }}
        >
         Udit Cosmetech Private Limited
        </div>

        <CSidebarToggler
          onClick={() =>
            dispatch({ type: 'set', sidebarShow: !sidebarShow })
          }
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
