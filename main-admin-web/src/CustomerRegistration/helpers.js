// utils/helpers.js
export const capitalizeEachWord = (str) => str.replace(/\b\w/g, (char) => char.toUpperCase())

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export const validateDOB = (dob) => {
  const parts = dob.split('/')
  if (parts.length !== 3) return false
  const [day, month, year] = parts.map(Number)
  const now = new Date().getFullYear()
  return (
    day >= 1 &&
    day <= 31 &&
    month >= 1 &&
    month <= 12 &&
    year.toString().length === 4 &&
    year <= now
  )
}
