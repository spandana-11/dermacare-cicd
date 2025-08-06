// GradientTextCard.jsx
import { CFormLabel } from '@coreui/react'
import React from 'react'
import { COLORS } from '../Themes'

const GradientTextCard = ({ text }) => {
  return (
    <div
      style={{
         marginBottom:"5px",
        alignItems: 'start',
        background: `linear-gradient(to right,${COLORS.lowgray},${COLORS.white})`, // blue → white
      }}
    >
      <CFormLabel className='text-dark ps-1 '>{text}</CFormLabel>
      {/* <h1 style={{ color: '#ffffff', textShadow: '1px 1px 4px rgba(0,0,0,0.3)' }}>
       {text}
      </h1> */}
    </div>
  )
}

export default GradientTextCard
