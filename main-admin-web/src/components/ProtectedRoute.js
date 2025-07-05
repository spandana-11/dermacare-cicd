// src/components/ProtectedRoute.js
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
  const isAuthenticated =
    !!localStorage.getItem('userName') && !!localStorage.getItem('authentication')

  const location = useLocation()

  if (!isAuthenticated) {
    // Redirect to login with intended route preserved
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

export default ProtectedRoute
