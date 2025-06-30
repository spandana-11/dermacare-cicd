import emailjs from 'emailjs-com'

const sendDermaCareOnboardingEmail = ({ name, email, password, userID }) => {
  const templateParams = {
    name,
    email,
    userID,
    password,
  }

  emailjs
    .send(
      'service_96x6r1u', // Replace with your EmailJS service ID
      'template_n4ghlyo', // Replace with your EmailJS template ID
      templateParams,
      'CBOIAGyBpGzdM93XU', // Your EmailJS public key
    )
    .then((response) => {
      console.log('✅ Email sent!', response.status, response.text)
    })
    .catch((error) => {
      console.error('Email send failed:', error)
    })
}

export default sendDermaCareOnboardingEmail
