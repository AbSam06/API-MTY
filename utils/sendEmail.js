const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, html) => {
  const msg = {
    to,
    from: 'chatgptgrasset@gmail.com', // ⚠️ Adresse vérifiée chez SendGrid
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log('📧 Email envoyé à', to);
  } catch (error) {
    console.error('Erreur envoi e-mail:', error.response?.body || error.message);
  }
};

module.exports = sendEmail;
