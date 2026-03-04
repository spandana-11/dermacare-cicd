import React, { useState, useEffect } from 'react'
import {
    CCard,
    CCardBody,
    CNav,
    CNavItem,
    CNavLink,
    CTabContent,
    CTabPane,
    CRow,
    CCol,
    CSpinner,
    CButton, CTable,
    CTableHead,
    CTableBody,
    CTableRow,
    CTableHeaderCell,
    CTableDataCell
} from '@coreui/react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCustomerByMobileProd } from './CustomerAPI'


const CustomerViewDetailsProd = () => {
    const navigate = useNavigate()
    const { mobileNumber } = useParams()
    const [activeTab, setActiveTab] = useState(0)
    const [customerData, setCustomerData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!mobileNumber) return

        const fetchCustomer = async () => {
            try {
                setLoading(true)
                const response = await getCustomerByMobileProd(mobileNumber)
                const data = response?.data || response

                setCustomerData({
                    ...data,
                    email: data.email || data.emailId,
                    appointments: data.appointments || [],
                    serviceStatus: Number(data.serviceStatus || data.service_status),
                    skinTone: data.skinTone || null,
                    concern: data.concern || null,
                    category: data.category || null,
                    photo: data.photo || null,
                    prescription: data.prescription || null
                })
            } catch (err) {
                setError('Failed to load customer details.')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchCustomer()
    }, [mobileNumber])

    // -------------------------
    // RENDER FIELD FUNCTION
    // -------------------------
    const renderField = (label, value) => {
        if (!value) return null

        // Image (jpg/png)
        if (typeof value === 'string' && value.startsWith('data:image')) {
            return (
                <CCol sm="6">
                    <strong>{label}:</strong>
                    <div>
                        <img
                            src={value}
                            alt={label}
                            style={{ width: '80px', height: '80px', borderRadius: '8px' }}
                        />
                    </div>
                </CCol>
            )
        }

        // PDF
        if (typeof value === 'string' && value.startsWith('data:application/pdf')) {
            const base64Data = value.split(',')[1]
            const byteCharacters = atob(base64Data)
            const byteNumbers = new Array(byteCharacters.length)
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i)
            }
            const byteArray = new Uint8Array(byteNumbers)
            const blob = new Blob([byteArray], { type: 'application/pdf' })
            const blobUrl = URL.createObjectURL(blob)

            return (
                <CCol sm="6">
                    <strong>{label}:</strong>
                    <div>
                        <a href={blobUrl} target="_blank" rel="noopener noreferrer">
                            View PDF
                        </a>
                    </div>
                </CCol>
            )
        }

        // Normal text
        return (
            <CCol sm="6">
                <strong>{label}:</strong>
                <div>{value}</div>
            </CCol>
        )
    }

    const cleanBase64Image = (value) => {
        if (!value) return null
        const clean = value
            .replace(/^data:image\/(png|jpeg|jpg);base64,/i, '')
            .replace(/^data:image\/(png|jpeg|jpg);base64,/i, '')
        return `data:image/jpeg;base64,${clean}`
    }

    // -------------------------
    // TAB VISIBILITY CONDITIONS
    // -------------------------
    const tabs = [
        {
            id: 0,
            title: 'Basic',
            visible: customerData && (
                customerData.fullName ||
                customerData.email ||
                customerData.mobile ||
                customerData.gender ||
                customerData.city
            )
        },
        {
            id: 1,
            title: 'Clinic',
            visible: customerData && (
                customerData.clinicName ||
                customerData.clinicCityArea ||
                customerData.dateOfLastVisit ||
                customerData.serviceType ||
                customerData.serviceStatus
            )
        },
        {
            id: 2,
            title: 'Spin Wheel',
            visible: customerData && (
                customerData.spinRewardId ||
                customerData.spinRewardValue ||
                customerData.spinWheelCompleted
            )
        },
        {
            id: 3,
            title: 'KYC',
            visible: customerData && (
                customerData.aadharNumber ||
                customerData.registrationCode ||
                customerData.registrationCompleted ||
                customerData.registrationRank
            )
        },
        {
            id: 4,
            title: 'Images',
            visible: customerData && (
                customerData.photo ||
                customerData.prescription
            )
        },
        {
            id: 5,
            title: 'Other',
            visible: customerData && (
                customerData.referBy ||
                customerData.userProfileCompleted
            )
        },
        {
            id: 6,
            title: 'Referred',
            visible:
                customerData &&
                Array.isArray(customerData.referredCustomers) &&
                customerData.referredCustomers.length > 0
        }

    ]

    const visibleTabs = tabs.filter(t => t.visible)

    if (loading) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '70vh' }}>
                <CSpinner color="primary" />
                <p className="mt-2 fw-semibold">Loading customer details...</p>
            </div>
        )
    }

    if (error || !customerData) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '70vh' }}>
                <p className="text-danger fw-bold">{error || 'Customer not found.'}</p>
            </div>
        )
    }

    return (
        <CCard >

            {/* HEADER */}
            <div
                className="text-white p-3 d-flex justify-content-between align-items-center rounded"
                style={{ background: 'linear-gradient(135deg, var(--color-black), var(--color-bgcolor))', color: 'white' }}
            >
                <h5 className="mb-1" style={{ color: "white" }}>
                    Customer Details: {customerData.fullName}
                </h5>

                <CButton
                    size="sm"
                    style={{
                        background: '#fff',
                        color: 'var(--color-black)',
                        border: '1px solid var(--color-black)',
                        fontWeight: 600,
                        borderRadius: 8,
                        padding: '6px 14px',
                    }}
                    onClick={() => navigate(-1)}
                >
                    Back
                </CButton>
            </div>

            <CCardBody>

                {/* TABS */}
                <CNav variant="tabs" className="mt-3 themed-tabs">
                    {visibleTabs.map(tab => (
                        <CNavItem key={tab.id}>
                            <CNavLink
                                active={activeTab === tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="theme-tab"
                            >
                                {tab.title}
                            </CNavLink>
                        </CNavItem>
                    ))}
                </CNav>
                <br /><br />
                {/* TAB CONTENT */}
                <CTabContent>

                    {/* BASIC */}
                    <CTabPane visible={activeTab === 0}>
                        <CCard className="p-3 shadow-sm">
                            <CRow className="gy-3">
                                {renderField('Customer ID', customerData.customerId)}
                                {renderField('Full Name', customerData.fullName)}
                                {renderField('Mobile Number', customerData.mobile)}
                                {renderField('Gender', customerData.gender)}
                                {renderField('DOB', customerData.dob)}
                                {renderField('City', customerData.city)}
                                {renderField('Address', customerData.address)}
                            </CRow>
                        </CCard>
                    </CTabPane>

                    {/* CLINIC */}
                    <CTabPane visible={activeTab === 1}>
                        <CCard className="p-3 shadow-sm">
                            <CRow className="gy-3">
                                {renderField('Clinic Name', customerData.clinicName)}
                                {renderField('Clinic Area', customerData.clinicCityArea)}
                                {renderField('Last Visit', customerData.dateOfLastVisit)}
                                {renderField(
                                    'Service Type',
                                    Array.isArray(customerData.serviceType)
                                        ? customerData.serviceType.join(', ')
                                        : customerData.serviceType
                                )}
                                {renderField(
                                    'Did you take any procedure?',
                                    customerData.serviceStatus === 1
                                        ? 'YES'
                                        : customerData.serviceStatus === 2
                                            ? 'NO'
                                            : 'N/A' // optional fallback for other values
                                )}

                                {/* serviceStatus = 1 → show prescription */}
                                {customerData.serviceStatus === 1 && renderField('Prescription', customerData.prescription)}

                                {/* serviceStatus = 2 → show skinTone, concern, category */}
                                {customerData.serviceStatus === 2 && (
                                    <>
                                        {renderField('Skin Tone', customerData.skinTone)}
                                        {renderField(
                                            'Concern',
                                            Array.isArray(customerData.concern)
                                                ? customerData.concern.join(', ')
                                                : customerData.concern
                                        )}
                                        {renderField(
                                            'Category',
                                            Array.isArray(customerData.category)
                                                ? customerData.category.join(', ')
                                                : customerData.category
                                        )}
                                    </>
                                )}
                            </CRow>
                        </CCard>
                    </CTabPane>

                    {/* SPIN WHEEL */}
                    <CTabPane visible={activeTab === 2}>
                        <CCard className="p-3 shadow-sm">
                            <CRow className="gy-3">
                                {renderField('Spin Reward Id', customerData.spinRewardId)}
                                {renderField('Spin Reward Value', customerData.spinRewardValue)}
                                {renderField('Spin Wheel Completed', customerData.spinWheelCompleted ? 'Yes' : 'No')}
                                {renderField(
                                    'Spin Reward Image',
                                    customerData.spinRewardImage
                                        ? `data:image/png;base64,${customerData.spinRewardImage}`
                                        : null
                                )}
                            </CRow>
                        </CCard>
                    </CTabPane>

                    {/* KYC */}
                    <CTabPane visible={activeTab === 3}>
                        <CCard className="p-3 shadow-sm">
                            <CRow className="gy-3">
                                {renderField('Aadhaar Number', customerData.aadharNumber)}
                                {renderField(
                                    'Aadhaar Consent',
                                    customerData.aadhaarConsent === null
                                        ? null
                                        : customerData.aadhaarConsent
                                            ? 'Yes'
                                            : 'No'
                                )}
                                {renderField(
                                    'User Consent',
                                    customerData.userConsent === null
                                        ? null
                                        : customerData.userConsent
                                            ? 'Yes'
                                            : 'No'
                                )}
                                {renderField(
                                    'Privacy Consent',
                                    customerData.privacyConsent === null
                                        ? null
                                        : customerData.privacyConsent
                                            ? 'Yes'
                                            : 'No'
                                )}
                                {renderField('Registration Code', customerData.registrationCode)}
                                {renderField('Registration Rank', customerData.registrationRank)}
                                {renderField('Registration Verified', customerData.registrationCodeVerified ? 'Yes' : 'No')}
                                {renderField('Registration Completed', customerData.registrationCompleted ? 'Yes' : 'No')}
                            </CRow>
                        </CCard>
                    </CTabPane>

                    {/* IMAGES */}
                    <CTabPane visible={activeTab === 4}>
                        <CCard className="p-3 shadow-sm">
                            <CRow className="gy-3">
                                {customerData.serviceStatus === 1 && renderField('Receipt', customerData.prescription)}
                                {customerData.serviceStatus === 2 && renderField('Receipt', cleanBase64Image(customerData.photo))}
                            </CRow>
                        </CCard>
                    </CTabPane>

                    {/* OTHER */}
                    <CTabPane visible={activeTab === 5}>
                        <CCard className="p-3 shadow-sm">
                            <CRow className="gy-3">
                                {renderField('Referral By', customerData.referBy)}
                                {renderField(
                                    'User Profile Completed',
                                    customerData.userProfileCompleted ? 'Yes' : 'No',
                                )}
                            </CRow>
                        </CCard>
                    </CTabPane>
                    {/* REFERRED */}

                    <CTabPane visible={activeTab === 6}>
                        <CCard className="p-3 shadow-sm">
                            <CRow className="gy-3">

                                {Array.isArray(customerData.referredCustomers) &&
                                    customerData.referredCustomers.length > 0 ? (

                                    /* ✅ SHOW TABLE ONLY */
                                    <CCol sm="12">
                                        <CTable striped hover responsive>
                                            <CTableHead className="pink-table">
                                                <CTableRow className="text-center">
                                                    <CTableHeaderCell>S.No</CTableHeaderCell>
                                                    <CTableHeaderCell>Customer ID</CTableHeaderCell>
                                                    <CTableHeaderCell>Customer Name</CTableHeaderCell>
                                                </CTableRow>
                                            </CTableHead>

                                            <CTableBody className="pink-table">
                                                {customerData.referredCustomers.map((customer, index) => (
                                                    <CTableRow
                                                        key={customer.customerId}
                                                        className="text-center align-middle"
                                                    >
                                                        <CTableDataCell>{index + 1}</CTableDataCell>
                                                        <CTableDataCell>{customer.customerId}</CTableDataCell>
                                                        <CTableDataCell>{customer.fullName}</CTableDataCell>
                                                    </CTableRow>
                                                ))}
                                            </CTableBody>
                                        </CTable>
                                    </CCol>

                                ) : (

                                    /* ❌ NO DATA UI */
                                    <CCol sm="12" className="text-center py-4">
                                        <p className="text-muted fw-semibold mb-1">
                                            No referral details available
                                        </p>
                                        <small className="text-muted">
                                            This customer was not referred by anyone.
                                        </small>
                                    </CCol>

                                )}

                            </CRow>
                        </CCard>
                    </CTabPane>


                </CTabContent>
            </CCardBody>
        </CCard>
    )
}

export default CustomerViewDetailsProd
