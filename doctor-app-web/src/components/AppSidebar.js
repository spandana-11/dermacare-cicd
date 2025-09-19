import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CCloseButton,
  CImage,
  CSidebar,
  CSidebarFooter,
  CSidebarHeader,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CCol,
  CRow,
} from '@coreui/react'
import { AppSidebarNav } from './AppSidebarNav'
import './header/sidebar.css'
import navigation from '../_nav'
import { COLORS, SIZES } from '../Themes'
import doctor from '../assets/images/doctor.jpg'
import male from '../assets/images/male.png'
import female from '../assets/images/female.png'
import { useDoctorContext } from '../Context/DoctorContext'
import { getClinicDetails, getDoctorDetails, averageRatings, getPatientVitals } from '../Auth/Auth'
import { capitalizeFirst, capitalizeWords } from '../utils/CaptalZeWord'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const [doctorDetails, setDoctorDetails] = useState(null)
  const [clinicDetails, setClinicDetails] = useState(null)
  const { patientData, isPatientLoading, setPatientData } = useDoctorContext()
  const hasPatient = !!patientData
  const [ratings, setRatings] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [vitals, setVitals] = useState({ height: '—', weight: '—', bloodPressure: '—', temperature: '—', bmi: '—' });
  useEffect(() => {
    const fetchData = async () => {
      const doctor = await getDoctorDetails()
      const clinic = await getClinicDetails()
      setDoctorDetails(doctor)
      setClinicDetails(clinic)

      if (doctor?.doctorId && clinic?.hospitalId) {
        const ratingData = await averageRatings(clinic.hospitalId, doctor.doctorId)

        if (ratingData?.ratingStats?.length > 0) {
          setRatings(ratingData.ratingStats)
        } else {
          // store a "no ratings" message when data is empty
          setRatings([{ category: ratingData.message || 'No reviews found', percentage: 0 }])
        }
      }
    }
    fetchData()
  }, [])

  // Load patient vitals whenever patientData changes
  useEffect(() => {
    let isMounted = true; // flag to prevent state update if unmounted

    const fetchVitals = async () => {
      if (hasPatient && patientData?.bookingId && patientData?.patientId) {
        const data = await getPatientVitals(patientData.bookingId, patientData.patientId);
        if (data && isMounted) setVitals(data);
      }
    };

    fetchVitals();

    return () => {
      isMounted = false; // cleanup to prevent memory leaks
    };
  }, [hasPatient, patientData]);

  const genderImg = (patientData?.gender || '').toString().toLowerCase() === 'male' ? male : female

  const display = {
    name: patientData?.name || '—',
    age: patientData?.age || '—',
    gender: patientData?.gender || '—',
    mobile: patientData?.mobileNumber || '—',
    visitType: patientData?.consultationType || '—',
    visitCount: patientData?.visitCount || '—',
    followUp: patientData?.freeFollowUps || '—',
    symptom: patientData?.problem || '—',
    patientId: patientData?.patientId || '—',
    clinicName: patientData?.clinicName || '—',
    doctorName: patientData?.doctorName || '—',
    consultationFee: patientData?.consultationFee ?? '—',
    totalFee: patientData?.totalFee ?? '—',
    serviceDate: patientData?.serviceDate || '—',
    serviceTime: patientData?.serviceTime || patientData?.servicetime || '—',
    duration: patientData?.duration || '—',
    vitals,
  };
  // helpers (place above your return)
  const fmt = (n) => (n !== '—' && !isNaN(+n) ? `₹ ${Number(n).toFixed(2)}` : '—')

  // useEffect(() => {
  //   // clear context + localStorage so sidebar shows doctor data
  //   setPatientData(null)
  // }, [setPatientData])

  const imgSrc = doctorDetails?.doctorPicture.startsWith('data:image')
    ? doctorDetails?.doctorPicture
    : `data:image/png;base64,${doctorDetails?.doctorPicture}`

  return (
    <>
      <CSidebar
        className="border-end "
        //colorScheme="white"
        position="fixed"
        unfoldable={unfoldable}
        visible={sidebarShow}
        style={{ backgroundColor: COLORS.bgcolor }}
        onVisibleChange={(visible) => {
          dispatch({ type: 'set', sidebarShow: visible })
        }}

      >
        <CSidebarHeader className="border-bottom ">
          <div
            role="button"
            tabIndex={0}
            onClick={() => hasPatient && setShowModal(true)}
            onKeyDown={(e) =>
              hasPatient && (e.key === 'Enter' || e.key === ' ') && setShowModal(true)
            }
            className="d-flex flex-column align-items-center w-100 py-2"
            style={{ cursor: hasPatient ? 'pointer' : 'default' }}
            title={hasPatient ? 'View Patient Details' : undefined}
          >
            {isPatientLoading ? (
              // Skeleton while hydrating (prevents doctor flash)
              <div className="w-100 d-flex flex-column align-items-center">
                <div
                  className="rounded-circle border mb-2"
                  style={{ width: 88, height: 88, opacity: 0.3 }}
                />
                <div
                  className="mb-1"
                  style={{ width: '75%', height: 12, background: '#eee', borderRadius: 4 }}
                />
                <div style={{ width: '50%', height: 12, background: '#eee', borderRadius: 4 }} />
              </div>
            ) : hasPatient ? (
              <>
                <CImage
                  src={genderImg}
                  alt="Patient"
                  width={88}
                  className="rounded-circle border"
                  style={{ borderWidth: 2, padding: 5, color: COLORS.gray }}
                />
                <h4
                  className=" mb-2 mt-2"
                  style={{ color: COLORS.black, fontWeight: 'bold', fontSize: SIZES.large }}
                >
                  {capitalizeFirst(display.name)}
                </h4>
                <h6 className="mb-1" style={{ color: COLORS.black, fontSize: SIZES.small }}>
                  {display.age} Years / {display.gender}
                </h6>
                <h6 className="mb-1" style={{ color: COLORS.black, fontSize: SIZES.small }}>
                  {display.mobile}
                </h6>
                <h6 className="mb-1" style={{ color: COLORS.black, fontSize: SIZES.small }}>
                  Visit Type: {display.visitType}
                </h6>
                <h6 className="mb-1" style={{ color: COLORS.black, fontSize: SIZES.small }}>
                  Visit Count: {display.visitCount}
                </h6>
                <h6 className="mb-1" style={{ color: COLORS.black, fontSize: SIZES.small }}>
                  FollowUp Count: {display.followUp}
                </h6>

                <hr className="w-100 my-2" />

                <div className="w-100 px-2">
                  <h4
                    className=" mb-2 mt-2"
                    style={{ color: COLORS.black, fontWeight: 'bold', fontSize: SIZES.large }}
                  >
                    Vitals
                  </h4>
                  <h6 className="mb-1" style={{ color: COLORS.black, fontSize: SIZES.small }}>
                    Height: {display.vitals.height} cm
                  </h6>
                  <h6 className="mb-1" style={{ color: COLORS.black, fontSize: SIZES.small }}>
                    Weight: {display.vitals.weight} kg
                  </h6>
                  <h6 className="mb-1" style={{ color: COLORS.black, fontSize: SIZES.small }}>
                    Blood Pressure: {display.vitals.bloodPressure} mmHg
                  </h6>
                  <h6 className="mb-1" style={{ color: COLORS.black, fontSize: SIZES.small }}>
                    Temperature: {display.vitals.temperature} °C
                  </h6>
                  <h6 className="mb-1" style={{ color: COLORS.black, fontSize: SIZES.small }}>
                    BMI: {display.vitals.bmi} kg/m²
                  </h6>

                </div>
              </>
            ) : (
              <>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {doctorDetails?.doctorPicture ? (
                    <CImage
                      src={imgSrc}
                      alt="Doctor"
                      width={100}
                      height={100}
                      className="rounded-circle border"
                      style={{ borderWidth: 2, padding: 5, color: COLORS.gray, objectFit: 'cover' }}
                    />
                  ) : (
                    <p>Loading image...</p>
                  )}

                  {/*                  
<CImage
  src={`data:image/png;base64,${doctorDetails?.doctorPicture }`}
  alt="Doctor"
  width={100}
  className="rounded-circle border"
  style={{ borderWidth: 2, padding: 5, color: COLORS.gray }}
/> */}
                  <h4
                    className=" mb-0 mt-2 text-center"
                    style={{ color: COLORS.black, fontWeight: 'bold', fontSize: SIZES.large }}
                  >
                    {capitalizeWords(doctorDetails?.doctorName) || 'Doctor Name'}
                  </h4>
                  <h6
                    className="mb-0 mt-1 text-center"
                    style={{ color: COLORS.black, fontSize: SIZES.small }}
                  >
                    {doctorDetails?.qualification || 'Qualification'} ({' '}
                    {doctorDetails?.specialization || 'Specialization'})
                  </h6>
                </div>
              </>
            )}
          </div>

          <CCloseButton
            className="d-lg-none"
            dark
            onClick={() => dispatch({ type: 'set', sidebarShow: false })}
          />
        </CSidebarHeader>

        {/* Show navigation/footer only when NOT loading and no patient selected */}
        {!isPatientLoading && !hasPatient && <AppSidebarNav items={navigation} />}

        {!isPatientLoading && !hasPatient && (
          <CSidebarFooter className="border-top d-none d-lg-flex flex-column mt-2">
            <h6 style={{ color: COLORS.black, fontWeight: 600, marginBottom: '0.5rem' }}>
              Patient Reviews
            </h6>

            {ratings.length > 0 ? (
              ratings.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 8,
                    width: '100%',
                  }}
                >
                  {/* Fixed label width */}
                  <div
                    style={{
                      width: 100, // fixed width
                      flexShrink: 0, // prevent shrinking
                      textAlign: 'right',
                      marginRight: 10,
                    }}
                  >
                    <small style={{ color: COLORS.black, fontSize: SIZES.small }}>
                      {item.category}
                    </small>
                  </div>

                  {/* Progress bar fills remaining space */}
                  <div style={{ flexGrow: 1 }}>
                    <div
                      className="progress"
                      style={{ height: 8, borderRadius: 4, backgroundColor: '#e9ecef' }}
                    >
                      <div
                        className={`progress-bar ${item.category.toLowerCase().includes('excellent')
                          ? 'bg-success'
                          : item.category.toLowerCase().includes('good')
                            ? 'bg-primary'
                            : item.category.toLowerCase().includes('average')
                              ? 'bg-warning'
                              : 'bg-secondary'
                          }`}
                        role="progressbar"
                        style={{ width: `${item.percentage}%`, borderRadius: 4 }}
                        aria-valuenow={item.percentage}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div
                className="w-100 text-center py-2"
                style={{ color: COLORS.gray, fontSize: SIZES.small }}
              >
                No reviews yet
              </div>
            )}
          </CSidebarFooter>
        )}
      </CSidebar>

      {/* Modal with full patient details; opens when header is clicked */}
      <CModal visible={showModal} onClose={() => setShowModal(false)} alignment="center" size="lg">
        <CModalHeader onClose={() => setShowModal(false)}>
          <CModalTitle>Patient Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {/* ROW 1: Patient (left) | Clinic (right) */}
          <CRow className="g-3">
            <CCol lg={6}>
              <div className="d-flex align-items-start">
                <CImage
                  src={genderImg}
                  alt="Patient"
                  width={80}
                  className="rounded-circle border me-3"
                  style={{ borderWidth: 2, padding: 5, color: COLORS.gray }}
                />
                <div>
                  <h5 className="mb-1" style={{ color: COLORS.black, fontWeight: 'bold' }}>
                    {display.name}
                  </h5>
                  <div style={{ color: COLORS.black, fontSize: SIZES.small }}>
                    <div>
                      Age/Gender: {display.age} / {display.gender}
                    </div>
                    <div>Mobile: {display.mobile}</div>
                    <div>Booking For: {display.bookingFor}</div>
                    <div>Patient ID: {display.patientId}</div>
                    <div>Visit Type: {display.visitType}</div>
                    <div>Visit Count: {display.visitCount}</div>
                    <div>FollowUp Count: {display.followUp}</div>
                  </div>
                </div>
              </div>
            </CCol>

            <CCol lg={5}>
              <CCol>
                <CCol>
                  <h6 className="mb-2" style={{ color: COLORS.black, fontWeight: 600 }}>
                    Clinic
                  </h6>
                  <div className="mb-4" style={{ color: COLORS.black, fontSize: SIZES.small }}>
                    <div>
                      {display.clinicName} ({display.clinicId})
                    </div>
                    <div>Address: {display.clinicAddress}</div>
                  </div>
                </CCol>
                <CCol>
                  <h6 className="mb-2" style={{ color: COLORS.black, fontWeight: 600 }}>
                    Doctor
                  </h6>
                  <div className="mb-2" style={{ color: COLORS.black, fontSize: SIZES.small }}>
                    <div>
                      {display.doctorName} ({display.doctorId})
                    </div>
                  </div>
                </CCol>
              </CCol>
            </CCol>
          </CRow>

          <hr className="my-3" />

          {/* ROW 2: Duration | Problem */}
          <CRow className="g-3">
            <CCol lg={6}>
              <h6 className="mb-2" style={{ color: COLORS.black, fontWeight: 600 }}>
                Duration
              </h6>
              <div style={{ color: COLORS.black, fontSize: SIZES.small }}>
                <div>{display.duration}</div>
              </div>
            </CCol>
            <CCol lg={5}>
              <h6 className="mb-2" style={{ color: COLORS.black, fontWeight: 600 }}>
                Problem
              </h6>
              <div style={{ color: COLORS.black, fontSize: SIZES.small }}>
                <div>{display.symptom}</div>
              </div>
            </CCol>
          </CRow>

          <hr className="my-3" />

          {/* ROW 3: Appointment | Service (sub-service only if available) */}
          <CRow className="g-3">
            <CCol lg={6}>
              <h6 className="mb-2" style={{ color: COLORS.black, fontWeight: 600 }}>
                Appointment
              </h6>
              <div style={{ color: COLORS.black, fontSize: SIZES.small }}>
                <div>Date: {display.serviceDate}</div>
                <div>Time: {display.serviceTime}</div>
              </div>
            </CCol>
            <CCol lg={5}>
              <h6 className="mb-2" style={{ color: COLORS.black, fontWeight: 600 }}>
                Sub-Service
              </h6>
              <div style={{ color: COLORS.black, fontSize: SIZES.small }}>
                {display.subServiceName && display.subServiceName !== '—' ? (
                  <div> {display.subServiceName}</div>
                ) : (
                  <div>&nbsp;</div>
                )}
              </div>
            </CCol>
          </CRow>

          <hr className="my-3" />

          {/* ROW 4: Fees */}
          <CRow className="g-3">
            <CCol lg={12}>
              <h6 className="mb-2" style={{ color: COLORS.black, fontWeight: 600 }}>
                Fees
              </h6>
              <div style={{ color: COLORS.black, fontSize: SIZES.small }}>
                <div>Consultation Fee: {fmt(display.consultationFee)}</div>
                <div>Total Fee: {fmt(display.totalFee)}</div>
              </div>
            </CCol>
          </CRow>

          <hr className="my-3" />

          {/* ROW 5: Vitals */}
          <CRow className="g-3">
            <CCol lg={12}>
              <h6 className="mb-2" style={{ color: COLORS.black, fontWeight: 600 }}>
                Vitals
              </h6>
              <div style={{ color: COLORS.black, fontSize: SIZES.small }}>
                <div>Height: {display.vitals.height}</div>
                <div>Weight: {display.vitals.weight}</div>
                <div>Blood Pressure: {display.vitals.bp}</div>
                <div>Temperature: {display.vitals.temperature}</div>
                <div>BMI: {display.vitals.bmi}</div>
              </div>
            </CCol>
          </CRow>
        </CModalBody>
      </CModal>
    </>
  )
}

export default React.memo(AppSidebar)
