import React from 'react'
import { Navigate } from 'react-router-dom'
import { useHospital } from '../views/Usecontext/HospitalContext'
import { CSpinner } from '@coreui/react'

const ProtectedRoute = ({ children }) => {
  const { loading, selectedHospital } = useHospital()
  const hospitalId = localStorage.getItem('HospitalId')

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <CSpinner size="sm" color="primary" />
      </div>
    )
  }

  // ✅ Just check localStorage
  const isAuthenticated = !!hospitalId && (selectedHospital !== null || selectedHospital !== '')

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default ProtectedRoute