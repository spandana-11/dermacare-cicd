// components/CustomInput.js
import React from 'react'

const CustomInput = ({ label, value, onChange, disabled, type = 'text', placeholder, error }) => (
  <div style={{ marginBottom: '1rem' }}>
    <label>{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="form-control"
    />
    {error && <span style={{ color: 'red', fontSize: '0.8rem' }}>{error}</span>}
  </div>
)

export default CustomInput
