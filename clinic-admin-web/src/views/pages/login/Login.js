import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilLockUnlocked } from '@coreui/icons'
import dermalogo from '../../../components/header/dermalogo.png'
import { BASE_URL } from '../../../baseUrl' // Ensure wifiUrl is defined correctly
import axios from 'axios'
import { useHospital } from '../../Usecontext/HospitalContext'
import ResetPassword from '../../../views/Resetpassword'
const Login = () => {
  const [userName, setuserName] = useState('')
  const [doctors, setDoctors] = useState([])
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [backenduserName, setBackenduserName] = useState('')
  const [backendPassword, setBackendPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { setDoctorData, fetchHospitalDetails } = useHospital()
  const [showResetModal, setShowResetModal] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      console.log('hi')
      const response = await axios.post(
        `${BASE_URL}/clinicLogin`,
        {
          userName: userName,
          password: password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
      console.log(response)

      // If success
      if (response.data.success) {
        const HospitalId = response.data.hospitalId // or adjust to match your API structure
        const HospitalName = response.data.hospitalName // or adjust to match your API structure
        localStorage.setItem('HospitalId', HospitalId)
        localStorage.setItem('HospitalName', HospitalName)
        console.log(HospitalId)
        console.log(HospitalName)

        await fetchHospitalDetails(HospitalId)

        if (
          HospitalId == undefined ||
          HospitalId == '' ||
          HospitalName == undefined ||
          HospitalName == ''
        ) {
          setErrorMessage('No hospital found.')
        } else {
          setErrorMessage(null)
          navigate('/dashboard')
        }
      }
    } catch (error) {
      const backendMessage = error.response?.data?.message || 'An unexpected error occurred.'

      if (backendMessage.toLowerCase().includes('username')) {
        setErrorMessage('Invalid username.')
      } else if (backendMessage.toLowerCase().includes('password')) {
        setErrorMessage('Invalid password.')
      } else {
        setErrorMessage(backendMessage)
      }

      console.error('Error details:', error.response || error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-vh-100 d-flex flex-row align-items-center"
      style={{
        backgroundImage: `url("/assets/bg.jpg")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <h1
              className="position-absolute top-0 end-0 me-5 mt-3 text-center"
              style={{ right: '10px' }}
            >
              <strong style={{ color: 'white', fontWeight: 'bold', display: 'block' }}>
                Derma Care, Hyderabad
              </strong>
              <p
                style={{ color: '#99C5F4', fontSize: '25px', marginTop: '8px', marginBottom: '0' }}
              >
                Powered By Chiselon Technologies
              </p>
            </h1>

            <CCardBody>
              <CForm onSubmit={handleSubmit}>
                <h2 className="text-center mb-4" style={{ color: 'white', fontSize: '25px' }}>
                  Admin Login
                </h2>
                {errorMessage && <p className="text-danger text-center">{errorMessage}</p>}

                <CInputGroup className="mb-3 w-50 mx-auto">
                  <CInputGroupText>
                    <CIcon icon={cilUser} />
                  </CInputGroupText>
                  <CFormInput
                    placeholder="Username"
                    autoComplete="userName"
                    value={userName}
                    onChange={(e) => setuserName(e.target.value)}
                  />
                </CInputGroup>

                <CInputGroup className="mb-3 w-50 mx-auto">
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

                <CRow className="mt-4 text-center">
                  <CCol>
                    <a
                      href="#"
                      className="text-decoration-none text-white"
                      style={{ fontWeight: 'bold' }}
                      onClick={(e) => {
                        e.preventDefault()
                        setShowResetModal(true)
                        // navigate('/reset-password') // Replace with your actual reset password route
                      }}
                    >
                      Change password?
                    </a>
                  </CCol>
                </CRow>

                <CCol xs={12} className="text-center">
                  <CButton
                    style={{ backgroundColor: '#0A6FDBFF', fontWeight: 'bold' }}
                    className="px-4 text-white mt-3"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </CButton>
                </CCol>
              </CForm>
            </CCardBody>
          </CCol>
        </CRow>
      </CContainer>
      <CModal visible={showResetModal} onClose={() => setShowResetModal(false)}>
        <CModalHeader>
          <CModalTitle>Reset Password</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <ResetPassword onClose={() => setShowResetModal(false)} />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowResetModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default Login
