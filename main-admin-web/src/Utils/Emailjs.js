// import emailjs from 'emailjs-com'

// const sendDermaCareOnboardingEmail = ({ name, email, password, userID }) => {
//   const templateParams = {
//     name,
//     email,
//     userID,
//     password,
//   }

//   emailjs
//     .send(
//       'service_96x6r1u', // Replace with your EmailJS service ID
//       'template_n4ghlyo', // Replace with your EmailJS template ID
//       templateParams,
//       'CBOIAGyBpGzdM93XU', // Your EmailJS public key
//     )
//     .then((response) => {
//       console.log('✅ Email sent!', response.status, response.text)
//     })
//     .catch((error) => {
//       console.error('Email send failed:', error)
//     })
// }

// export default sendDermaCareOnboardingEmail


import emailjs from 'emailjs-com'

const sendDermaCareOnboardingEmail = ({ name, email, password, clinicName,userID }) => {
  const templateParams = {
    name: `${name}`,
    email,
    userID,
    password,
    clinicName:`${clinicName}`,
    downloadLink: 'https://play.google.com/store/apps/details?id=com.whatsapp', // Your Play Store link
  }

  emailjs
    .send(
      'service_xx8z5p5', //EmailJS dashboard exactly
      'template_x57efme',
      templateParams,
      'csbSLIKhSrOUjeqsQ',
    )
    .then((res) => {
      console.log('Email sent successfully:', res)
    })
    .catch((err) => {
      console.error('Failed to send email:', err)
    })
}

export default sendDermaCareOnboardingEmail