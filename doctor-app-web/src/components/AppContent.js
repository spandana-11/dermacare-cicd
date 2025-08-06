import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'
const PatientAppointmnetDetails = React.lazy(
  () => import('../components/PatientAppointmnetDetails'),
)
// routes config
import routes from '../routes'
import Dashboard from '../views/dashboard/Dashboard'
import { COLORS } from '../Themes'

const AppContent = () => {
  return (
    <CContainer className="px-4" lg style={{backgroundColor:COLORS.theme}}>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {routes.map((route, idx) => {
            return (
              route.element && (
                <Route
                  key={idx}
                  path={route.path}
                  exact={route.exact}
                  name={route.name}
                  element={<route.element />}
                />
              )
            )
          })}
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="/tab-content/:id" element={<PatientAppointmnetDetails />} />
        </Routes>
      </Suspense>
    </CContainer>
  )
}

export default React.memo(AppContent)
