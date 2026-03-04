// services/apiService.js
export const registerUser = async (userData) => {
  try {
    const response = await fetch('http://your-base-url.com/saveBasicDetails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })

    const data = await response.json()
    if (response.ok) {
      return data
    } else {
      throw new Error(`Server Error: ${data.message || response.status}`)
    }
  } catch (error) {
    console.error('Registration failed:', error)
    throw error
  }
}
