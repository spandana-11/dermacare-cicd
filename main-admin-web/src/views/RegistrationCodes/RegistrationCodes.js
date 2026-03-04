import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CFormInput,
  CTooltip,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CCol,
  CContainer,
  CRow,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
} from '@coreui/react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { getAllRegistrationCodes } from './RegistrationCodesApi'
import { cilCopy, cilLockUnlocked } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import { BASE_URL_API } from '../../baseUrl'
import axios from 'axios'
import CIcon from '@coreui/icons-react'
import { cilUser, cilLockLocked } from '@coreui/icons'
import { NGK_COLORS } from '../../Constant/Themes'
import NgkLogo from '../../assets/images/GlowKaart.png' // adjust path

const RegistrationCodeManagement = () => {
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [filterType, setFilterType] = useState('all') // <- add this
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(100)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedCode, setSelectedCode] = useState('')
  const [name, setName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const brandRanges = [
    { from: 1, to: 10, label: 'Sephora' },
    { from: 11, to: 20, label: 'Nars' },
    { from: 21, to: 30, label: 'Fenty Beauty' },
    { from: 31, to: 40, label: 'MAC' },
    { from: 41, to: 50, label: 'Benefit' },
    { from: 51, to: 60, label: 'Anastasia Beverly hills ' },
    { from: 61, to: 70, label: 'Nykaa/Faces Canada' },
    { from: 71, to: 80, label: 'Lakme/Color Bar' },
    { from: 81, to: 100, label: 'Bath & Body Works (Mens)' },
    { from: 101, to: 120, label: 'Forest Essentials (Mens)' },

    { from: 121, to: 140, label: 'Nykaa' },
    { from: 141, to: 160, label: 'Lakme' },
    { from: 161, to: 180, label: 'Color Bar' },
    { from: 181, to: 200, label: 'Faces Canada' },
    { from: 201, to: 220, label: 'Bath & Body Works (Mens)' },
    { from: 221, to: 240, label: 'Forest Essentials (Mens)' },
  ]

  // ===== LOGIN STATE =====
  const [showLogin, setShowLogin] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [customLink, setCustomLink] = useState('https://registration.ngkderma.com')

  useEffect(() => {
    fetchCodes()
  }, [])
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!userName || !password) {
      setLoginError('Mobile number and password are required.')
      return
    }

    setLoginLoading(true)
    setLoginError('')

    try {
      const response = await axios.post(
        `${BASE_URL_API}/login`,
        { mobileNumber: userName, password },
        { headers: { 'Content-Type': 'application/json' } },
      )

      if (response.data.success) {
        sessionStorage.setItem('registration-auth', 'true')
        setIsAuthenticated(true)

        setShowLogin(false)
      } else {
        setLoginError(response.data.message || 'Invalid credentials')
      }
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoginLoading(false)
    }
  }

  // Scroll page to top whenever page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  const fetchCodes = async () => {
    setLoading(true)
    try {
      const response = await getAllRegistrationCodes()
      setCodes(response)
    } catch (err) {
      toast.error('Failed to load registration codes')
    }
    setLoading(false)
  }

  const filteredCodes = codes
    .filter((item) => {
      const search = searchText.toLowerCase()

      return item.code.toLowerCase().includes(search) || String(item.rank ?? '').includes(search)
    })
    .filter((item) => {
      if (filterType === 'used') return item.used
      if (filterType === 'unused') return !item.used
      return true
    })
  const usedCount = codes.filter((code) => code.used).length
  const unusedCount = codes.filter((code) => !code.used).length
  const indexOfLast = currentPage * itemsPerPage
  const indexOfFirst = indexOfLast - itemsPerPage
  const currentItems = filteredCodes.slice(indexOfFirst, indexOfLast)
  const totalPages = Math.ceil(filteredCodes.length / itemsPerPage)

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  const openSendModal = (code) => {
    setSelectedCode(code)
    setName('')
    setMobileNumber('')
    setCustomLink('https://registration.ngkderma.com')
    setModalVisible(true)
  }

  const sendWhatsApp = () => {
    if (!name || !mobileNumber || !customLink) {
      toast.error('Please fill all fields')
      return
    }

    if (mobileNumber.length !== 10) {
      toast.error('Mobile number must be 10 digits')
      return
    }

    const fullNumber = `91${mobileNumber}`

    const message = `Hi ${name},

We are excited to welcome you to *Neeha’s GlowKart Family*.

Here is your *Registration Code:*  
${selectedCode}

To join and claim your welcome gifts, complete your registration here:
${customLink}

If you need help, feel free to message anytime.

Warm regards,  
*Neeha’s GlowKart Team*`

    const encoded = encodeURIComponent(message)
    const url = `https://wa.me/${fullNumber}?text=${encoded}`
    window.open(url, '_blank')

    setModalVisible(false)
  }
  const handleCopyCode = (code) => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        toast.success('Registration code copied')
      })
      .catch(() => {
        toast.error('Failed to copy code')
      })
  }
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('registration-auth')
    if (isLoggedIn === 'true') {
      setIsAuthenticated(true)
      setShowLogin(false)
    }
  }, [])

  return (
    <>
      <ToastContainer />
      {isAuthenticated && (
        <>
          <CCard className="mb-3 shadow-sm">
            <CCardBody className="d-flex justify-content-end align-items-center flex-wrap gap-2">

              <div className="d-flex gap-2">
                <CButton className="theme-primary-btn" active>
                  Registration Codes
                </CButton>

                <CButton
                  className="theme-outline-btn"
                  onClick={() => navigate('/Customer-info')}
                  style={{ border: '1px solid var(--color-black)' }}
                >
                  Customer Data
                </CButton>
              </div>
            </CCardBody>
          </CCard>

          <CCard className="mt-1">
            <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap">
              <div>
                <h4 className="mb-0">Registration Codes</h4>
                <div style={{ fontSize: '0.9rem', marginTop: '5px' }}>
                  <span
                    style={{
                      color: '#198754',
                      fontWeight: 500,
                      marginRight: '15px',
                      cursor: 'pointer',
                      textDecoration: filterType === 'unused' ? 'underline' : 'none',
                    }}
                    onClick={() => {
                      setFilterType('unused')
                      setCurrentPage(1)
                    }}
                  >
                    Unused: {unusedCount}
                  </span>
                  <span
                    style={{
                      color: '#dc3545',
                      fontWeight: 500,
                      cursor: 'pointer',
                      textDecoration: filterType === 'used' ? 'underline' : 'none',
                    }}
                    onClick={() => {
                      setFilterType('used')
                      setCurrentPage(1)
                    }}
                  >
                    Used: {usedCount}
                  </span>
                </div>
              </div>
              <CFormInput
                placeholder="Search by code or rank..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value)
                  setCurrentPage(1)
                }}
                style={{
                  maxWidth: '250px',
                  marginTop: '5px',
                  color: '#aaa',
                  border: '1px solid var(--color-black)',
                }}
              />
            </CCardHeader>
            <CCardBody style={{ flex: 1, position: 'relative' }}>
              {loading ? (
                <p className="text-center">Loading codes...</p>
              ) : (
                <>
                  {!loading && filteredCodes.length > 0 && (
                    <>
                      <CAccordion alwaysOpen>
                        {/* ===== FIRST HALF ===== */}
                        <CAccordionItem itemKey="firstHalf">
                          <CAccordionHeader>Registration Codes (1–120) - YES </CAccordionHeader>

                          <CAccordionBody>
                            <CAccordion alwaysOpen>
                              {brandRanges
                                .filter((range) => range.to <= 120)
                                .map((range, idx) => {
                                  const rangeCodes = filteredCodes.filter(
                                    (item) => item.rank >= range.from && item.rank <= range.to,
                                  )

                                  if (rangeCodes.length === 0) return null

                                  return (
                                    <CAccordionItem key={idx} itemKey={`first-${idx}`}>
                                      <CAccordionHeader>
                                        {range.label} ({range.from} – {range.to})
                                      </CAccordionHeader>

                                      <CAccordionBody>
                                        <div
                                          style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, 200px)',
                                            justifyContent: 'center',
                                            gap: '20px',
                                          }}
                                        >
                                          {rangeCodes.map((item, i) => {
                                            const isUsed = item.used

                                            return (
                                              <CTooltip
                                                key={i}
                                                content={
                                                  isUsed
                                                    ? 'This code has already been used'
                                                    : 'This code is unused'
                                                }
                                                placement="top"
                                              >
                                                <div
                                                  style={{
                                                    width: '200px',
                                                    background: '#fff',
                                                    border: '1px solid #dee2e6',
                                                    borderRadius: '12px',
                                                    padding: '15px',
                                                    height: '120px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                                                    opacity: isUsed ? 0.45 : 1,
                                                  }}
                                                >
                                                  <h6
                                                    style={{
                                                      fontSize: '14px',
                                                      fontWeight: 600,
                                                      textAlign: 'center',
                                                    }}
                                                  >
                                                    {item.code}
                                                  </h6>

                                                  {!isUsed ? (
                                                    <div
                                                      style={{
                                                        display: 'flex',
                                                        gap: '8px',
                                                      }}
                                                    >
                                                      <button
                                                        style={{
                                                          background: "#adb5bd",
                                                          color: "#000",
                                                          border: "none",
                                                          borderRadius: "6px",
                                                          padding: "4px 10px",
                                                          fontSize: "0.7rem",
                                                          fontWeight: 500,
                                                          cursor: "not-allowed",
                                                          opacity: 0.7,
                                                          whiteSpace: "nowrap",
                                                        }}
                                                        disabled
                                                      >
                                                        Rank ({item.rank ?? 0})
                                                      </button>

                                                      <button
                                                        onClick={() => openSendModal(item.code)}
                                                        style={{
                                                          background: "var(--color-bgcolor)",
                                                          color: "var(--color-black)",
                                                          border: "none",
                                                          borderRadius: "6px",
                                                          padding: "4px 12px",
                                                          fontSize: "0.75rem",
                                                          fontWeight: 500,
                                                          cursor: "pointer",
                                                          whiteSpace: "nowrap",
                                                        }}
                                                      >
                                                        Send
                                                      </button>

                                                      <CIcon
                                                        icon={cilCopy}
                                                        size="sm"
                                                        onClick={() => handleCopyCode(item.code)}
                                                        style={{
                                                          cursor: "pointer",
                                                          color: "#000",
                                                          width: "16px",
                                                          height: "16px",
                                                        }}
                                                      />
                                                    </div>
                                                  ) : (
                                                    <div
                                                      style={{
                                                        display: 'flex',
                                                        gap: '6px',
                                                      }}
                                                    >
                                                      <button
                                                        style={{
                                                          background: "#adb5bd",   // gray background
                                                          color: "#000",
                                                          border: "none",
                                                          borderRadius: "6px",
                                                          padding: "4px 12px",
                                                          fontSize: "0.75rem",
                                                          fontWeight: 500,
                                                          cursor: "not-allowed",
                                                          opacity: 0.7,
                                                        }}
                                                        disabled
                                                      >
                                                        Rank ({item.rank ?? 0})
                                                      </button>

                                                      <button
                                                        style={{
                                                          background: "#ffe6e6",
                                                          color: "#cc0000",
                                                          border: "1px solid #cc0000",
                                                          borderRadius: "6px",
                                                          padding: "4px 12px",
                                                          fontSize: "0.75rem",
                                                          fontWeight: 500,
                                                          cursor: "not-allowed",
                                                        }}
                                                        disabled
                                                      >
                                                        Used
                                                      </button>
                                                    </div>
                                                  )}
                                                </div>
                                              </CTooltip>
                                            )
                                          })}
                                        </div>
                                      </CAccordionBody>
                                    </CAccordionItem>
                                  )
                                })}
                            </CAccordion>
                          </CAccordionBody>
                        </CAccordionItem>

                        {/* ===== SECOND HALF ===== */}
                        <CAccordionItem itemKey="secondHalf">
                          <CAccordionHeader>Registration Codes (121–240) - NO</CAccordionHeader>

                          <CAccordionBody>
                            <CAccordion alwaysOpen>
                              {brandRanges
                                .filter((range) => range.from >= 121)
                                .map((range, idx) => {
                                  const rangeCodes = filteredCodes.filter(
                                    (item) => item.rank >= range.from && item.rank <= range.to,
                                  )

                                  if (rangeCodes.length === 0) return null

                                  return (
                                    <CAccordionItem key={idx} itemKey={`second-${idx}`}>
                                      <CAccordionHeader>
                                        {range.label} ({range.from} – {range.to})
                                      </CAccordionHeader>

                                      <CAccordionBody>
                                        <div
                                          style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, 200px)',
                                            justifyContent: 'center',
                                            gap: '20px',
                                          }}
                                        >
                                          {rangeCodes.map((item, i) => {
                                            const isUsed = item.used
                                            return (
                                              <div
                                                key={i}
                                                style={{
                                                  width: '200px',
                                                  background: '#fff',
                                                  border: '1px solid #dee2e6',
                                                  borderRadius: '12px',
                                                  padding: '15px',
                                                  height: '120px',
                                                  display: 'flex',
                                                  flexDirection: 'column',
                                                  justifyContent: 'space-between',
                                                  alignItems: 'center',
                                                  boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                                                  opacity: isUsed ? 0.45 : 1,
                                                }}
                                              >
                                                <h6>{item.code}</h6>
                                                <small>Rank ({item.rank})</small>
                                              </div>
                                            )
                                          })}
                                        </div>
                                      </CAccordionBody>
                                    </CAccordionItem>
                                  )
                                })}
                            </CAccordion>
                          </CAccordionBody>
                        </CAccordionItem>
                      </CAccordion>
                    </>
                  )}
                </>
              )}
            </CCardBody>
          </CCard>
        </>
      )}
      {/* SEND CODE MODAL */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Send Registration Code</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <CFormInput
            label="Name"
            placeholder="Enter recipient's name"
            value={name}
            onChange={(e) => {
              // Allow only alphabets and spaces
              const onlyAlphabets = e.target.value.replace(/[^a-zA-Z ]/g, '')
              setName(onlyAlphabets)
            }}
            className="mb-3"
          />

          <div className="mb-3">
            <label className="form-label" style={{ fontWeight: 500 }}>
              Mobile Number
            </label>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  background: '#e9ecef',
                  padding: '8px 12px',
                  border: '1px solid #ced4da',
                  borderRight: 'none',
                  borderRadius: '6px 0 0 6px',
                  fontWeight: 600,
                }}
              >
                +91
              </span>

              <input
                type="text"
                maxLength={10}
                placeholder="Enter 10-digit number"
                value={mobileNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  setMobileNumber(val)
                }}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  border: '1px solid #ced4da',
                  borderRadius: '0 6px 6px 0',
                }}
              />
            </div>
          </div>

          <CFormInput
            label="Link"
            placeholder="Enter link"
            value={customLink}
            onChange={(e) => setCustomLink(e.target.value)}
          />
        </CModalBody>

        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancel
          </CButton>
          <CButton
            style={{ color: 'var(--color-black)', backgroundColor: 'var(--color-bgcolor)' }}
            onClick={sendWhatsApp}
          >
            Send
          </CButton>
        </CModalFooter>
      </CModal>

      {!isAuthenticated && (
        <CContainer fluid className="min-vh-100 d-flex align-items-center justify-content-center">
          <CRow className="w-100 justify-content-center">
            <CCol xs={12} sm={10} md={8} lg={5} xl={4}>
              <CCard
                className="shadow-lg w-100"
                style={{
                  border: `1.5px solid ${NGK_COLORS.primary}`,
                  borderRadius: '14px',
                }}
              >
                <CCardBody className="p-4 p-md-5">
                  <div className="text-center mb-3">
                    <img
                      src={NgkLogo}
                      alt="NGK Logo"
                      style={{
                        height: '55px',
                        objectFit: 'contain',
                      }}
                    />
                  </div>
                  {/* TITLE */}
                  <h5
                    className="text-center fw-semibold mb-4"
                    style={{
                      background: `linear-gradient(90deg, ${NGK_COLORS.primary}, #000)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      letterSpacing: '0.4px',
                    }}
                  >
                    Login to Manage Registration Codes
                  </h5>

                  <CForm onSubmit={handleLogin}>
                    {/* ===== MOBILE NUMBER ===== */}
                    <div
                      className="input-group"
                      style={{
                        borderRadius: '8px',
                        overflow: 'hidden',
                      }}
                    >
                      <span
                        className="input-group-text text-white"
                        style={{ backgroundColor: NGK_COLORS.primary }}
                      >
                        <CIcon
                          icon={cilUser}
                          style={{
                            cursor: 'pointer',
                            color: 'white',
                          }}
                        />
                      </span>

                      <input
                        className="form-control border-0"
                        placeholder="Mobile Number"
                        maxLength={10}
                        value={userName}
                        onChange={(e) => setUserName(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>

                    {/* ===== PASSWORD ===== */}
                    <div
                      className="input-group mt-3"
                      style={{
                        borderRadius: '8px',
                        overflow: 'hidden',
                      }}
                    >
                      <span
                        className="input-group-text text-white"
                        role="button"
                        style={{
                          cursor: 'pointer',
                          backgroundColor: NGK_COLORS.primary,
                        }}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <CIcon icon={showPassword ? cilLockUnlocked : cilLockLocked} />
                      </span>

                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control border-0"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>

                    {/* ERROR MESSAGE */}
                    {loginError && <p className="text-danger mt-2 text-center">{loginError}</p>}

                    {/* LOGIN BUTTON */}
                    <CButton
                      type="submit"
                      className="w-100 mt-4"
                      style={{
                        backgroundColor: NGK_COLORS.primary,
                        color: 'white',
                      }}
                      disabled={loginLoading}
                    >
                      {loginLoading ? 'Logging in...' : 'Login'}
                    </CButton>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CContainer>
      )}
    </>
  )
}

export default RegistrationCodeManagement
