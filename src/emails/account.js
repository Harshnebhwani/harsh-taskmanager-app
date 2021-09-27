const sgMail = require('@sendgrid/mail')

const SendGridApiKey = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(SendGridApiKey);

const welcomeEmail = (email, name) => {
  sgMail
    .send({
      to: email,
      from: 'harsh.nebhvani@codiste.com',
      subject: 'Thanks for joining in',
      html: `Welcome to tha app <strong>${name}</strong>`,
    })
    .then(() => {
      console.log('Email sent')
    })
    .catch((error) => {
      console.error(error)
    })
} 

const cancelEmail = (email, name) => {
  sgMail
    .send({
      to: email,
      from: 'harsh.nebhvani@codiste.com',
      subject: 'Goodbye',
      html: `Goodbye, <strong>${name}</strong>`,
    })
    .then(() => {
      console.log('Email sent')
    })
    .catch((error) => {
      console.error(error)
    })
} 

module.exports = {
  welcomeEmail,cancelEmail
}