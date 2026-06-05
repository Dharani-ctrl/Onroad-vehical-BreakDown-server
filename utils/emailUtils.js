// Mock email utility for resetting passwords and alerts
// In production, use nodemailer with SendGrid or SMTP
exports.sendEmail = async ({ to, subject, text }) => {
  console.log(`[Email Mock] Sending to: ${to}`);
  console.log(`[Email Mock] Subject: ${subject}`);
  console.log(`[Email Mock] Text: ${text}`);
  return true;
};
