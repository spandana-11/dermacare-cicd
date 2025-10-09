import React, { useState } from 'react'
import { CButton } from '@coreui/react'
import { useNavigate } from 'react-router-dom'

const BackButton = () => {
  const navigate = useNavigate()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <CButton
      variant="outline"
      onClick={() => navigate(-1)} // ✅ Go back
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        borderColor: 'var(--color-black)',
        color: isHovered ? 'white' : 'var(--color-black)',
        backgroundColor: isHovered ? 'var(--color-black)' : 'transparent', // purple hover
        transition: 'all 0.3s ease',
      }}
    >
      Back
    </CButton>
  )
}

export default BackButton
