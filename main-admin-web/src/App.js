import React, { Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { CSpinner, useColorModes } from '@coreui/react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ProtectedRoute from './components/ProtectedRoute'
import { injectTheme } from './Constant/Themes'
import './scss/style.scss'
import ClinicOnboardingSuccess from './views/clinicManagement/SuccessOnboradClinic'
import RegistrationCodeManagement from './views/RegistrationCodes/RegistrationCodes'
import ClinicRegistration from './views/clinicManagement/GlowKartClinicRegistration'
import CustomerManagementProd from './views/customerManagement/CustomerManagementProd'
import CustomerViewDetailsProd from './views/customerManagement/CustomerViewDetailsProd'

// Lazy-loaded pages
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

const App = () => {
  const { setColorMode } = useColorModes(
    'coreui-free-react-admin-template-theme'
  )

  // ✅ FORCE LIGHT THEME
  useEffect(() => {
    injectTheme()
    setColorMode('light')
  }, [setColorMode])
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      <Suspense fallback={<CSpinner color="primary" variant="grow" />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/clinic-registration"
            element={<ClinicRegistration />}
          />
          <Route
            path="/registration-codes"
            element={<RegistrationCodeManagement />}
          />
          <Route
            path="/Customer-info"
            element={<CustomerManagementProd />}
          />
          <Route
            path="/Customer-ManagementProd/:mobileNumber"
            element={<CustomerViewDetailsProd />}
          />
          <Route
            path="/clinic-onboarding-success"
            element={<ClinicOnboardingSuccess />}
          />

          {/* ===== ERROR PAGES ===== */}
          <Route path="/404" element={<Page404 />} />
          <Route path="/500" element={<Page500 />} />

          {/* 🚫 BLOCK DASHBOARD */}
          <Route
            path="/dashboard"
            element={<Navigate to="/login" replace />}
          />

          {/* ===== PROTECTED ROUTES ===== */}
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <DefaultLayout />
              </ProtectedRoute>
            }
          />

        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
