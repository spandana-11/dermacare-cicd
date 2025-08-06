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
  CFormFeedback,
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
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { success, error, info, warning } = useToast()
  const validate = () => {
    const newErrors = {}
    if (!username.trim()) newErrors.username = 'Username is required'
    if (!password.trim()) newErrors.password = 'Password is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  const { setDoctorId, setHospitalId, setDoctorDetails, setClinicDetails } = useDoctorContext();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const payload = {
        username,
        password,
        fcmToken: 'fcmToken', // optional
      };

      // Step 1: Login
      console.log('🔄 Logging in with payload:', payload);
      const loginResponse = await api.post('/login', payload);
      console.log('✅ Login response:', loginResponse.data);

      if (loginResponse.status === 200 && loginResponse.data.success) {
        const { doctorId, hospitalId } = loginResponse.data.data;
        localStorage.setItem("doctorId", doctorId);
        localStorage.setItem("hospitalId", hospitalId);
        success('Login successfully!', { title: 'Success' })
        if (!doctorId || !hospitalId) {
          console.warn('❗ Missing doctorId or hospitalId in login response');
          setErrors({ login: 'Missing doctorId or hospitalId in response.' });
          return;
        }

        console.log('🆔 doctorId:', doctorId);
        console.log('🏥 hospitalId:', hospitalId);

        // Step 2: Fetch doctor details
        const doctorDetails = await getDoctorDetails();
        console.log('✅ Doctor Details fetched:', doctorDetails);

        if (doctorDetails?.hospitalId !== hospitalId) {
          console.warn('🚫 Doctor does not belong to this hospital');
          setErrors({ login: 'Doctor does not belong to the hospital.' });
          return;
        }
        // ✅ Store doctor details in localStorage
        localStorage.setItem("doctorDetails", JSON.stringify(doctorDetails));
        // Step 3: Fetch clinic details
        const clinicDetails = await getClinicDetails();
        console.log('✅ Clinic Details fetched:', clinicDetails);
        // ✅ Store clinic details in localStorage
        localStorage.setItem("clinicDetails", JSON.stringify(clinicDetails));
        // Step 4: Store in Context
        setDoctorId(doctorId);
        setHospitalId(hospitalId);
        setDoctorDetails(doctorDetails);
        setClinicDetails(clinicDetails);
        console.log('🧠 Context updated with doctor and clinic data');

        // Step 5: Navigate to dashboard
        navigate('/dashboard');
      } else {
        console.warn('❌ Login failed:', loginResponse.data.message);
        setErrors({ login: loginResponse.data.message || 'Login failed.' });
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      if (error.response) {
        const { status, data } = error.response;
        console.warn(`⚠️ Error ${status}:`, data?.message);
        setErrors({ login: data?.message || `Error: ${status}` });
      } else {
        setErrors({ login: 'Cannot connect to server.' });
      }
    } finally {
      setLoading(false);
      console.log('🔚 Login flow complete');
    }
  };


  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => (document.body.style.overflow = 'auto')
  }, [])

  return (
    <CContainer
      fluid
      className="login-page no-scrollbar "
      style={{ backgroundColor: 'transparent', marginTop: '-50px' }}
    >
      <img
        src={Doctor}
        alt="Doctor"
        style={{
          position: 'absolute',
          bottom: 0,
          left: '40%',
          maxWidth: 320,
          maxHeight: 'calc(100vh)',
          objectFit: 'contain',
          height: '50%',
        }}
      />
      <CRow className="w-100 h-100 g-0">
        {/* LEFT */}
        <CCol
          md={6}
          className="d-flex flex-column align-items-center justify-content-center text-center  "
        >
          <div className="p-4 w-100 d-flex flex-column align-items-center  ">
            <img src={launcherIcon} alt="Derma Logo" style={{ height: 120 }} height={100} />
            <h1
              className="mt-3 mb-1 fw-bold"
              style={{
                backgroundImage: 'linear-gradient(90deg, #0061c2, #0196ee)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent', // Safari/Chrome
                color: 'transparent', // Fallback
                fontSize: '40px',
              }}
            >
              Derma Care, Hyderabad
            </h1>
            <p className="mb-4" style={{ color: COLORS.gray, fontSize: '26px' }}>
              Powered By Chiselon Technologies
            </p>
          </div>
        </CCol>

        {/* RIGHT */}
        <CCol md={6} className="d-flex align-items-center justify-content-center ">
          <CCard className="w-100 border-0" style={{ maxWidth: 420, background: 'transparent' }}>
            <CCardBody className="p-4   text-center">
              <img
                src={logo}
                alt="Logo"
                height={100}
                className="position-relative"
                style={{ top: 45, left: -105 }}
              />
              <div className="align-items-center  mb-4">
                <h4
                  className="mb-0 fw-bold"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #0061c2, #0196ee)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent', // Safari/Chrome
                    color: 'transparent', // Fallback
                    fontSize: '30px',
                  }}
                >
                  Doctor Login
                </h4>
              </div>

              {errors.login && <CAlert color="danger">{errors.login}</CAlert>}

              <CForm onSubmit={handleLogin}>
                {/* Username */}
                <div className="position-relative mb-3">
                  <CFormInput
                    type="text"
                    placeholder="Username or Mobile"
                    value={username}
                    invalid={!!errors.username}
                    onChange={(e) => {
                      setUsername(e.target.value)
                      setErrors((p) => ({ ...p, username: '', login: '' }))
                    }}
                    style={{
                      paddingRight: '2.5rem',
                      borderColor: COLORS.primary,
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
                      borderColor: COLORS.primary,
                      pointerEvents: 'none',
                      color: COLORS.primary,
                    }}
                  />
                  <CFormFeedback invalid>{errors.username}</CFormFeedback>
                </div>

                {/* Password */}
                <div className="position-relative mb-3">
                  <CFormInput
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    invalid={!!errors.password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setErrors((p) => ({ ...p, password: '', login: '' }))
                    }}
                    style={{
                      paddingRight: '2.5rem',
                      borderColor: COLORS.primary,
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
                  <CFormFeedback invalid>{errors.password}</CFormFeedback>
                </div>

                <div className="text-end mb-3">
                  <a href="#" className="text-decoration-none" style={{ color: COLORS.primary }}>
                    Reset password?
                  </a>
                </div>

                <CButton
                  type="submit"
                  color="primary"
                  className="w-100"
                  style={{
                    background: 'linear-gradient(90deg, #0061c2, #0196ee)',
                    // borderRadius: '1rem',
                    padding: '0.75rem',
                    fontWeight: 'bold',
                    boxShadow: '0 8px 16px rgba(0, 170, 255, 0.3)',
                  }}
                >
                  Login
                </CButton>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default Login