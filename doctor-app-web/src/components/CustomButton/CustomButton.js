// src/components/Button.js
import React from 'react'
import styles from './Button.module.css'
import { COLORS } from '../../Themes'

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  onClick,
  disabled = false,
  customColor = `${COLORS.primary}`,
  customGradient = '',
  title,
}) => {
  const customStyle = {}

  if (variant === 'primary' && customGradient) {
    customStyle.background = customGradient
    customStyle.color = '#fff'
  } else if (variant === 'primary' && customColor) {
    customStyle.background = customColor
    customStyle.color = '#fff'
  }

  if (variant === 'outline' && customColor) {
    customStyle.border = `1.5px solid ${customColor}`
    customStyle.color = customColor
  }

  return (
    <button
      className={`${styles.btn} ${styles[variant]} ${styles[size]}`}
      onClick={onClick}
      disabled={disabled}
      style={customStyle}
      title={title}
    >
      {children}
    </button>
  )
}

export default Button
