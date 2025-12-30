import React from 'react'
import { useNavigate } from 'react-router-dom'
import { CButton } from '@coreui/react'
import { ArrowLeft } from 'lucide-react'

const BackButton = ({ to = '/employee-management', label = 'Back to Employee Management' }) => {
  const navigate = useNavigate()

  return (
    <div style={{ marginBottom: '1rem' }}>
      <CButton
        color="secondary"
        variant="outline"
        onClick={() => navigate(to)}
        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
      >
   
        {label}
      </CButton>
    </div>
  )
}

export default BackButton
