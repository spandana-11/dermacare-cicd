import React, { useState } from 'react'
import { CButton } from '@coreui/react'
import { useNavigation } from '../Usecontext/NavigationProvider'

const BackButton = () => {
  const { goBack } = useNavigation()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <CButton
      variant="outline"
      onClick={goBack} // go back one step in stack
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        borderColor: 'var(--color-black)',
        color: isHovered ? 'white' : 'var(--color-black)',
        backgroundColor: isHovered ? 'var(--color-black)' : 'transparent',
        transition: 'all 0.3s ease',
      }}
    >
      Back
    </CButton>
  )
}

export default BackButton
