import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CModal,
  CModalBody,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilLockLocked,
  cilUser,
  cilLockUnlocked,
  cilShieldAlt,
} from '@coreui/icons'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import LoginBg from '../../../assets/images/bg.jpg'
import { BASE_URL_API } from '../../../baseUrl'
import { NGK_COLORS } from '../../../Constant/Themes'

const Login = () => {
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [forgotModal, setForgotModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/clinic-management'

  useEffect(() => {
    localStorage.clear()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!userName || !password) {
      toast.error('Mobile number and password are required')
      return
    }

    setIsLoading(true)

    try {
      const response = await axios.post(
        `${BASE_URL_API}/login`,
        { mobileNumber: userName, password },
        { headers: { 'Content-Type': 'application/json' } }
      )

      if (response.data?.success) {
        const user = response.data.data
        localStorage.setItem('authentication', 'true')
        localStorage.setItem('userName', user.userName)
        localStorage.setItem('mobileNumber', user.mobileNumber)
        localStorage.setItem('userId', user.id)
        toast.success('Login successful')
        navigate(from, { replace: true })
      } else {
        toast.error(response.data?.message || 'Invalid credentials')
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message)
      } else if (!navigator.onLine) {
        toast.error('No internet connection')
      } else {
        toast.error('Server not responding. Try again later.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <ToastContainer />
      <div
        className="min-vh-100 d-flex flex-column"
        style={{
          backgroundImage: `url(${LoginBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* CENTER CONTENT */}
        <div className="flex-grow-1 d-flex align-items-center">
          <CContainer fluid className="px-3 px-md-5">
            <CRow className="align-items-center justify-content-center">
              {/* LEFT INFO – DESKTOP ONLY */}
              <CCol
                xs={12}
                lg={6}
                className="d-flex flex-column justify-content-center px-3 px-lg-5 mb-4 mb-lg-0 text-center text-lg-start"
              >
                <h2 className="fw-bold mb-3" style={{ color: NGK_COLORS.primary }}>
                  Welcome to Neeha’s GlowKart
                </h2>
                <p className="lead mb-4" style={{ opacity: 0.95, color: NGK_COLORS.textDark }}>
                  Manage dermatology operations seamlessly — appointments,
                  procedures, offers & more.
                </p>
              </CCol>


              {/* LOGIN CARD */}
              <CCol xs={12} sm={10} md={8} lg={5} xl={4}>
                <CCard className="shadow-lg border-0 w-100">
                  <CCardBody className="p-4 p-md-5">

                    <h3 className="text-center fw-bold mb-5" style={{ color: NGK_COLORS.primary }}>
                      NGK Login
                    </h3>

                    <CForm onSubmit={handleSubmit}>
                      {/* Username */}
                      <CInputGroup>
                        <CInputGroupText style={{ backgroundColor: NGK_COLORS.primary }}>
                          <CIcon icon={cilUser} style={{
                            cursor: 'pointer',
                            color: 'white',
                          }} />
                        </CInputGroupText>
                        <CFormInput
                          placeholder="Mobile Number"
                          value={userName}
                          style={{
                            cursor: 'pointer',
                            borderColor: NGK_COLORS.borderSoft,
                          }}
                          onChange={(e) => setUserName(e.target.value)}
                        />
                      </CInputGroup>

                      {/* Password */}
                      <CInputGroup className="mt-3">
                        <CInputGroupText
                          style={{ cursor: 'pointer', backgroundColor: NGK_COLORS.primary }}
                          role="button"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <CIcon icon={showPassword ? cilLockUnlocked : cilLockLocked} style={{ color: 'white' }} />
                        </CInputGroupText>
                        <CFormInput
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Password"
                          style={{
                            cursor: 'pointer',
                            borderColor: NGK_COLORS.borderSoft,
                          }}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </CInputGroup>

                      {/* Links */}
                      <div className="d-flex flex-column flex-sm-row justify-content-between mt-3">
                        <span
                          role="button"
                          style={{
                            cursor: 'pointer',
                            color: NGK_COLORS.primary,
                            textDecoration: 'underline',
                            fontSize: '14px',
                          }}
                          onClick={() => setForgotModal(true)}
                        >
                          Forgot Password?
                        </span>
                        <span
                          role="button"
                          style={{
                            color: NGK_COLORS.primary,
                            fontSize: '14px',
                          }}
                          onClick={() => setShowResetModal(true)}
                        >
                          Change Password?
                        </span>
                      </div>

                      {/* Button */}
                      <CButton
                        type="submit"
                        className="w-100 mt-4" style={{ backgroundColor: NGK_COLORS.primary, color: 'white' }}
                        disabled={isLoading}
                      >
                        {isLoading ? <CSpinner size="sm" /> : 'Login'}
                      </CButton>
                    </CForm>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          </CContainer>
        </div>

        {/* FOOTER */}
        <footer
          className="
    mt-auto
    py-2
    small
    opacity-75
    bg-light
  "
        >
          <CContainer>
            <div
              className="
        d-flex
        flex-column
        flex-md-row
        justify-content-between
        align-items-center
        gap-2
        text-center
        text-md-start
      "
              style={{ color: NGK_COLORS.primary }}
            >
              <span className="d-inline-flex align-items-center gap-2">
                <CIcon icon={cilShieldAlt} /> Secure by design
              </span>

              <span>
                © {new Date().getFullYear()} Uditcosmetech Pvt Ltd
              </span>

              <a
                href="https://uditcosmetech.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: NGK_COLORS.primary }}
              >
                About Uditcosmetech Private Limited
              </a>
            </div>
          </CContainer>
        </footer>


        {/* MODALS */}
        <CModal visible={forgotModal} onClose={() => setForgotModal(false)} alignment="center">
          <CModalBody className="text-center py-4">
            <h5 className="text-primary">Forgot Password</h5>
          </CModalBody>
        </CModal>

        <CModal visible={showResetModal} onClose={() => setShowResetModal(false)} alignment="center">
          <CModalBody className="text-center py-4">
            <h5 className="text-primary">Change Password</h5>
          </CModalBody>
        </CModal>
      </div>
    </>


  )
}

export default Login
