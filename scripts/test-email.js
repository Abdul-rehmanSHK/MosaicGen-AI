const fs = require('fs');
const nodemailer = require('nodemailer');

function getEnv(key) {
  try {
    const data = fs.readFileSync('.env', 'utf8');
    for (const line of data.split(/\r?\n/)) {
      const parts = line.split('=');
      if (parts[0]?.trim() === key) {
        return parts.slice(1).join('=').replace(/^["']|["']$/g, '').trim();
      }
    }
  } catch (e) {}
  return '';
}

async function testEmail() {
  const user = getEnv('SMTP_USER');
  const pass = getEnv('SMTP_PASS');

  console.log('Testing SMTP with User:', user);
  if (!pass) {
    console.log('ERROR: SMTP_PASS is currently empty in .env!');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user,
      pass: pass.replace(/\s+/g, '')
    }
  });

  try {
    const info = await transporter.sendMail({
      from: `"MEC AI Mosaic Studio" <${user}>`,
      to: user,
      subject: 'MEC AI Mosaic - SMTP Test Email',
      html: '<h2>Congratulations!</h2><p>Your Gmail SMTP is working properly.</p>'
    });
    console.log('SUCCESS! Real email sent:', info.messageId);
 } catch (err) {
 console.error('SMTP Error:', err.message);
 }
}

testEmail();
