import React from 'react'
import { toast } from 'react-toastify'
import '../views/Style/CustomToast.css'
import { useHospital } from '../views/Usecontext/HospitalContext'

/* ---------------- CUSTOM TOAST UI ---------------- */

const CustomToast = ({ message, type = 'success' }) => {
  const { selectedHospital } = useHospital()

  return (
    <div className={`custom-toast ${type}`}>
      {selectedHospital?.data?.hospitalLogo ? (
        <img
          className="profile-image"
          src={
            selectedHospital.data.hospitalLogo.startsWith('data:')
              ? selectedHospital.data.hospitalLogo
              : `data:image/jpeg;base64,${selectedHospital.data.hospitalLogo}`
          }
          alt={selectedHospital?.data?.name || 'Hospital Logo'}
          style={{ width: '20px', height: '20px' }}
        />
      ) : (
        <div className="spinner" />
      )}

      <div className="toast-message">{message}</div>
    </div>
  )
}

/* ---------------- FIXED CLOSE BUTTON ---------------- */

const CloseButton = ({ closeToast }) => (
  <span
    onClick={closeToast}
    style={{
      color: 'white',
      fontWeight: 'bold',
      fontSize: '18px',
      marginRight: '10px',
      cursor: 'pointer',
      lineHeight: '1',
    }}
  >
    ×
  </span>
)

/* ---------------- EXPORT FUNCTION ---------------- */

export const showCustomToast = (message, type = 'success') => {
  toast(<CustomToast message={message} type={type} />, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    closeButton: CloseButton, // ✅ FIXED
  })
}
