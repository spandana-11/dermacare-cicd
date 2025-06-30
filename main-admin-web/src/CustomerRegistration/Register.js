// pages/Register.js
import React, { useState } from 'react'
import CustomInput from '../components/CustomInput'
import { registerUser } from '../services/apiService'
import { capitalizeEachWord, validateEmail, validateDOB } from '../utils/helpers'

const Register = ({ fullName = '', mobileNumber = '' }) => {
  const [name, setName] = useState(capitalizeEachWord(fullName))
  const [email, setEmail] = useState('')
  const [dob, setDob] = useState('')
  const [referral, setReferral] = useState('')
  const [gender, setGender] = useState('Male')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const genderOptions = ['Male', 'Female', 'Others']

  const handleSubmit = async () => {
    const newErrors = {}

    if (!validateEmail(email)) newErrors.email = 'Invalid email'
    if (!validateDOB(dob)) newErrors.dob = 'Invalid DOB (DD/MM/YYYY)'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const payload = {
      fullName: name,
      emailId: email,
      mobileNumber,
      dob,
      referralCode: referral,
      gender,
    }

    setLoading(true)
    try {
      const response = await registerUser(payload)
      alert('Registration successful!')
      console.log(response)
    } catch (err) {
      alert('Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: '500px', marginTop: '2rem' }}>
      <h2>Basic Details</h2>
      <img src="/assets/DermaText.png" alt="Logo" width="120" />
      <CustomInput label="Full Name" value={name} onChange={() => {}} disabled />
      <CustomInput
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        error={errors.email}
      />
      <CustomInput
        label="Date of Birth (DD/MM/YYYY)"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
        error={errors.dob}
        placeholder="DD/MM/YYYY"
      />
      <CustomInput
        label="Referral Code (Optional)"
        value={referral}
        onChange={(e) => setReferral(e.target.value)}
      />
      <div style={{ marginBottom: '1rem' }}>
        <label>Gender</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          {genderOptions.map((g) => (
            <button
              key={g}
              type="button"
              style={{
                padding: '8px 16px',
                background: g === gender ? '#0d6efd' : '#fff',
                color: g === gender ? '#fff' : '#000',
                border: '1px solid #ccc',
                borderRadius: '5px',
              }}
              onClick={() => setGender(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
      <button className="btn btn-primary w-100" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Submitting...' : 'SUBMIT'}
      </button>
    </div>
  )
}

export default Register
