const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  return transporter;
}

async function sendMail({ to, subject, html }) {
  if (!to) return { skipped: true, reason: 'no_recipient' };
  const t = getTransporter();
  if (!t) {
    console.log(`[mailer] SMTP not configured — skipping email to ${to}: ${subject}`);
    return { skipped: true, reason: 'smtp_not_configured' };
  }
  try {
    await t.sendMail({ from: process.env.SMTP_FROM || 'no-reply@example.com', to, subject, html });
    return { sent: true };
  } catch (err) {
    console.error('[mailer] failed to send email:', err.message);
    return { sent: false, error: err.message };
  }
}

module.exports = { sendMail };
