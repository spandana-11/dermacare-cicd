import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CForm,
  CFormInput,
  CButton,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilLowVision, cilEyedropper } from '@coreui/icons'
import launcherIcon from '../../../assets/images/ic_launcher.png'
import Doctor from '../../../assets/images/Group 11.png'
import logo from '../../../assets/images/sat.png'
import api from '../../../Auth/axiosInterceptor'
import { useDoctorContext } from '../../../Context/DoctorContext'
import { getClinicDetails, getDoctorDetails } from '../../../Auth/Auth'
import { COLORS } from '../../../Themes'
import { useToast } from '../../../utils/Toaster'

const Login = () => {
  // Login form state
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // Password reset state
  const [resetStep, setResetStep] = useState(0) // 0 = hidden, 1 = mobile input, 2 = password form
  const [resetFormData, setResetFormData] = useState({
    mobile: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [resetError, setResetError] = useState('')

  const navigate = useNavigate()
  const { success } = useToast()
  const { setDoctorId, setHospitalId, setDoctorDetails, setClinicDetails } = useDoctorContext()

  const validateLogin = () => {
    const newErrors = {}
    if (!username.trim()) newErrors.username = 'Username is required'
    if (!password.trim()) newErrors.password = 'Password is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!validateLogin()) return

    setLoading(true)
    setErrors({})

    try {
      const response = await api.post('/login', {
        username,
        password,
        fcmToken: 'fcmToken',
      })

      if (response.data.success) {
        const { doctorId, hospitalId } = response.data.data
        localStorage.setItem('doctorId', doctorId)
        localStorage.setItem('hospitalId', hospitalId)

        const doctorDetails = await getDoctorDetails()
        const clinicDetails = await getClinicDetails()
        console.log(response)
        if (doctorDetails) {
          localStorage.setItem('doctorDetails', JSON.stringify(doctorDetails))
          localStorage.setItem('clinicDetails', JSON.stringify(clinicDetails))
          setDoctorId(doctorId)
          setHospitalId(hospitalId)
          setDoctorDetails(doctorDetails)
          setClinicDetails(clinicDetails)
          success(`${response.data.message || `Login successful!`}`)
          navigate('/dashboard')
        }
      } else {
        setErrors({ login: response.data.message || 'Login failed' })
      }
    } catch (err) {
      setErrors({ login: err.response?.data?.message || 'Login error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const handleResetPasswordClick = () => {
    setResetStep(1)
    setResetError('')
    setResetFormData({
      mobile: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
  }

  const validateMobile = (mobile) => {
    if (!mobile.trim()) return 'Mobile number is required'
    if (!/^\d{10}$/.test(mobile)) return 'Please enter a valid 10-digit mobile number'
    return ''
  }

  const handleMobileSubmit = async (e) => {
    e.preventDefault()

    const mobileError = validateMobile(resetFormData.mobile)
    if (mobileError) {
      setResetError(mobileError)
      return
    }

    setLoading(true)
    try {
      // In production, replace with actual API call:
      // const exists = await api.post('/verify-mobile', { mobile: resetFormData.mobile })
      const exists = true // For testing

      if (exists) {
        setResetStep(2)
        setResetError('')
      } else {
        setResetError('Mobile number not found')
      }
    } catch (err) {
      setResetError('Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const validatePasswordReset = () => {
    if (resetFormData.newPassword.length < 6) {
      return 'Password must be at least 6 characters'
    }
    if (resetFormData.newPassword !== resetFormData.confirmPassword) {
      return 'New passwords do not match'
    }
    return ''
  }

  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault()

    const passwordError = validatePasswordReset()
    if (passwordError) {
      setResetError(passwordError)
      return
    }

    setLoading(true)
    console.log(typeof username)
    console.log({
      username: resetFormData.mobile,
      currentPassword: resetFormData.currentPassword,
      newPassword: resetFormData.newPassword,
      confirmPassword: resetFormData.confirmPassword,
    })
    try {
      const response = await api.put(`/update-password/${resetFormData.mobile}`, {
        currentPassword: resetFormData.currentPassword,
        newPassword: resetFormData.newPassword,
        confirmPassword: resetFormData.confirmPassword,
      })

      if (response.data.success) {
        success('Password updated successfully!')
        setResetStep(0)
      } else {
        setResetError(response.data.message || 'Password update failed')
      }
    } catch (err) {
      setResetError(err.response?.data?.message || 'Password reset error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => (document.body.style.overflow = 'auto')
  }, [])

  return (
    <>
      {/* Main Login Page */}
      <CContainer
        fluid
        className="login-page d-flex align-items-center"
        style={{
          backgroundColor: '#f6f9fc',
          minHeight: '100vh',
          position: 'relative',
        }}
      >
        <img
          src={Doctor}
          alt="Doctor"
          className="d-none d-md-block"
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            maxHeight: '100%',
            objectFit: 'contain',
            zIndex: 0,
            opacity: 0.3,
          }}
        />

        <CRow className="w-100 g-0">
          {/* Left Side - Branding */}
          <CCol
            xs={12}
            md={6}
            className="d-flex flex-column align-items-center justify-content-center text-center px-4"
            style={{ zIndex: 1 }}
          >
            <div style={{ maxWidth: 500 }}>
              <img src={launcherIcon} alt="Logo" style={{ height: 120 }} />
              <h1
                style={{
                  backgroundImage: 'linear-gradient(90deg, #0061c2, #0196ee)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '40px',
                  margin: '1rem 0',
                  fontWeight: 'bolder',
                }}
              >
                Derma Care, Hyderabad
              </h1>
              <p style={{ color: COLORS.gray, fontSize: '20px' }}>
                Powered By Chiselon Technologies
              </p>
            </div>
          </CCol>

          {/* Right Side - Login Form */}
          <CCol
            xs={12}
            md={5}
            className="d-flex align-items-center justify-content-start px-4"
            style={{ zIndex: 1 }}
          >
            <CCard
              className="w-100 border-1 shadow-sm"
              style={{ maxWidth: 420, background: 'transparent' }}
            >
              <CCardBody className="p-4 text-center">
                <img src={logo} alt="Logo" height={60} className="mb-3" />
                <h4
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #0061c2, #0196ee)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: '26px',
                    marginBottom: '1.5rem',
                  }}
                >
                  Doctor Login
                </h4>

                {errors.login && <CAlert color="danger">{errors.login}</CAlert>}

                <CForm onSubmit={handleLogin}>
                  <div className="mb-3">
                    <div className="position-relative">
                      <CFormInput
                        type="text"
                        placeholder="Username or Mobile"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value)
                          setErrors((p) => ({ ...p, username: '', login: '' }))
                        }}
                        style={{
                          paddingRight: '2.5rem',
                          borderColor: errors.username ? '#dc3545' : COLORS.primary,
                          borderRadius: '0.5rem',
                          paddingTop: '0.75rem',
                          paddingBottom: '0.75rem',
                          color: COLORS.primary,
                        }}
                      />
                      <CIcon
                        icon={cilUser}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          right: '0.75rem',
                          transform: 'translateY(-50%)',
                          pointerEvents: 'none',
                          color: COLORS.primary,
                        }}
                      />
                    </div>
                    {errors.username && (
                      <div className="text-start text-danger mt-1" style={{ fontSize: '0.875rem' }}>
                        {errors.username}
                      </div>
                    )}
                  </div>
                  {/* Password */}
                  <div className="mb-3">
                    <div className="position-relative">
                      <CFormInput
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          setErrors((p) => ({ ...p, password: '', login: '' }))
                        }}
                        style={{
                          paddingRight: '2.5rem',
                          borderColor: errors.password ? '#dc3545' : COLORS.primary,
                          borderRadius: '0.5rem',
                          paddingTop: '0.75rem',
                          paddingBottom: '0.75rem',
                        }}
                      />
                      <CIcon
                        icon={showPassword ? cilLowVision : cilEyedropper}
                        onClick={() => setShowPassword((v) => !v)}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          right: '0.75rem',
                          transform: 'translateY(-50%)',
                          color: COLORS.primary,
                          cursor: 'pointer',
                        }}
                      />
                    </div>
                    {errors.password && (
                      <div className="text-start text-danger mt-1" style={{ fontSize: '0.875rem' }}>
                        {errors.password}
                      </div>
                    )}
                  </div>

                  <div className="text-end mb-3">
                    <button
                      type="button"
                      className="btn btn-link p-0"
                      style={{ color: COLORS.primary }}
                      onClick={handleResetPasswordClick}
                    >
                      Reset password?
                    </button>
                  </div>

                  <CButton
                    type="submit"
                    color="primary"
                    className="w-100"
                    disabled={loading}
                    style={{
                      background: 'linear-gradient(90deg, #0061c2, #0196ee)',
                      padding: '0.75rem',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                    }}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </CButton>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>

      {/* Password Reset Modals (outside main form) */}

      {/* Mobile Verification Modal */}
      {resetStep === 1 && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CCard style={{ width: '90%', maxWidth: '400px' }}>
            <CCardBody>
              <h5 className="text-center mb-4">Enter Your Mobile Number</h5>
              {resetError && <CAlert color="danger">{resetError}</CAlert>}

              <CForm onSubmit={handleMobileSubmit}>
                <div className="mb-3">
                  <CFormInput
                    type="tel"
                    placeholder="Mobile Number"
                    value={resetFormData.mobile}
                    onChange={(e) =>
                      setResetFormData({
                        ...resetFormData,
                        mobile: e.target.value,
                      })
                    }
                    maxLength={10}
                  />
                </div>

                <div className="d-flex justify-content-between">
                  <CButton color="secondary" onClick={() => setResetStep(0)} disabled={loading}>
                    Cancel
                  </CButton>
                  <CButton color="primary" type="submit" disabled={loading}>
                    {loading ? 'Verifying...' : 'Continue'}
                  </CButton>
                </div>
              </CForm>
            </CCardBody>
          </CCard>
        </div>
      )}

      {/* Password Reset Modal */}
      {resetStep === 2 && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CCard style={{ width: '90%', maxWidth: '400px' }}>
            <CCardBody>
              <h5 className="text-center mb-4">Reset Password for {resetFormData.mobile}</h5>
              {resetError && <CAlert color="danger">{resetError}</CAlert>}

              <CForm onSubmit={handlePasswordResetSubmit}>
                <div className="mb-3">
                  <CFormInput
                    type="password"
                    placeholder="Current Password"
                    value={resetFormData.currentPassword}
                    onChange={(e) =>
                      setResetFormData({
                        ...resetFormData,
                        currentPassword: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="mb-3">
                  <CFormInput
                    type="password"
                    placeholder="New Password (min 6 characters)"
                    value={resetFormData.newPassword}
                    onChange={(e) =>
                      setResetFormData({
                        ...resetFormData,
                        newPassword: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="mb-3">
                  <CFormInput
                    type="password"
                    placeholder="Confirm New Password"
                    value={resetFormData.confirmPassword}
                    onChange={(e) =>
                      setResetFormData({
                        ...resetFormData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="d-flex justify-content-between">
                  <CButton color="secondary" onClick={() => setResetStep(1)} disabled={loading}>
                    Back
                  </CButton>
                  <CButton color="primary" type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Password'}
                  </CButton>
                </div>
              </CForm>
            </CCardBody>
          </CCard>
        </div>
      )}
    </>
  )
}

export default Login
