import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import dermalogo from '../components/header/dermalogo.png'
import { useHospital } from '../views/Usecontext/HospitalContext'

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import { AppSidebarNav } from './AppSidebarNav'

// sidebar nav config
import navigation from '../_nav'
import Logo from './header/DermaLogoP.png'
const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const { selectedHospital } = useHospital()

  // console.log('Selected hospital:', selectedHospital.data.hospitalLogo)

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
        <div to="/">
          <div className="d-flex justify-content-center">
            {selectedHospital?.data.hospitalLogo ? (
              <img
                src={
                  selectedHospital?.data.hospitalLogo.startsWith('data:')
                    ? selectedHospital?.data.hospitalLogo
                    : `data:image/jpeg;base64,${selectedHospital?.data.hospitalLogo}`
                }
                alt={selectedHospital?.data.name || 'Hospital Logo'}
                style={{ width: '80px', height: '80px', marginBottom: '0px', marginLeft: '30px' }}
              />
            ) : (
              <p>Loading logo...</p>
            )}
          </div>
          <div
            className="text-center py-3"
            style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#0d6efd', // Bootstrap primary

              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            {localStorage.getItem('HospitalName') || 'Hospital Name'}
          </div>

          <div
            className="d-flex justify-content-center underline-none"
            style={{ marginLeft: '20px' }}
          ></div>
        </div>
        {/* <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        /> */}
      </CSidebarHeader>
      <AppSidebarNav items={navigation} />
      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })} />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
