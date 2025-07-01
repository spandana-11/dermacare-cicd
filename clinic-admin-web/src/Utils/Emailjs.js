import emailjs from 'emailjs-com'

const sendDermaCareOnboardingEmail = ({ name, email, password, userID }) => {
  const templateParams = {
    name: `${name}`,
    email,
    userID,
    password,
    downloadLink: 'https://play.google.com/store/apps/details?id=com.dermacare.app', // Your Play Store link
  }

  emailjs.send(
    'service_xx8z5p5',      //EmailJS dashboard exactly
    'template_x57efme',    
    templateParams,
    'csbSLIKhSrOUjeqsQ' 
  )
  .then((res) => {
    console.log('Email sent successfully:', res)
  })
  .catch((err) => {
    console.error('Failed to send email:', err)
  })
}

export default sendDermaCareOnboardingEmail
