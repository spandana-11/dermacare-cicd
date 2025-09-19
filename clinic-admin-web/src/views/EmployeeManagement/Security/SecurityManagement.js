import React from 'react'
import { Shield } from 'lucide-react'

const SecurityManagement = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <Shield size={72} className="text-green-600 mb-4" />
      <h1 className="text-2xl font-semibold text-gray-700">Security Management</h1>
      <p className="text-gray-500 mt-2">Under Development</p>
    </div>
  )
}

export default SecurityManagement
