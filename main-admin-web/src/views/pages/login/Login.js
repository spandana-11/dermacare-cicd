import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilLockUnlocked } from '@coreui/icons'
import Logo from '../login/derma2.png'
import { BASE_URL, endPoint } from '../../../baseUrl'

const Login = () => {
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [errorMessage, setErrorMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const location = useLocation()

  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!userName && !password) {
      setErrorMessage('Username and password are required.')
      return
    }

    if (!userName) {
      setErrorMessage('Username is required.')
      return
    }

    if (!password) {
      setErrorMessage('Password is required.')
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const data = { userName, password }
      const response = await axios.post(`${BASE_URL}/${endPoint}`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Log response to verify backend format
      console.log('API Response:', response.data)

      // Check for success message (correct spelling!)
      if (response.status === 200) {
        console.log('Login successful')
        navigate('/dashboard')
        localStorage.setItem('userName', userName)
        localStorage.setItem('authentication', true) //flag
        navigate(from, { replace: true })
      } else {
        setErrorMessage(response.data || 'Invalid login credentials.')
      }
    } catch (error) {
      const backendMessage = error.response?.data?.message || 'An unexpected error occurred.'

      const lowerMessage = backendMessage.toLowerCase()

      if (lowerMessage.includes('both')) {
        setErrorMessage('Both Username and Password are Invalid.')
      } else if (lowerMessage.includes('username') && lowerMessage.includes('password')) {
        // in case backend sends a combined message
        setErrorMessage('Both Username and Password are Invalid.')
      } else if (lowerMessage.includes('username')) {
        setErrorMessage('Invalid username.')
      } else if (lowerMessage.includes('password')) {
        setErrorMessage('Invalid password.')
      } else {
        // generic or unexpected
        setErrorMessage(backendMessage)
      }

      console.error('Error details:', error.response || error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to your account</p>
                    {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Username"
                        autoComplete="username"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ cursor: 'pointer' }}
                      >
                        <CIcon icon={showPassword ? cilLockUnlocked : cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </CInputGroup>

                    <CRow>
                      <CCol xs={12} className="text-end">
                        <CButton
                          color="primary"
                          className="px-4"
                          type="submit"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Logging in...' : 'Login'}
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-success py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Welcome</h2>
                    <p>
                      Discover the secret to glowing skin—sign in to DermaCare and explore expert
                      dermatological care.
                    </p>
                    <div className="d-flex justify-content-center">
                      <img
                        src={Logo}
                        alt="DermaCare Logo"
                        style={{ width: '130px', height: 'auto', marginBottom: '10px' }}
                      />
                    </div>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
