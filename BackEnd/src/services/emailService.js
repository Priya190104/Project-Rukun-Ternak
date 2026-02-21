/**
 * Email Service
 * 
 * Handles all email sending operations using Nodemailer
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Create transporter for sending emails
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * Send password reset email
 * @param {string} email - Recipient email address
 * @param {string} resetToken - Password reset token
 * @param {string} username - User's username
 * @returns {Promise<void>}
 */
async function sendPasswordResetEmail(email, resetToken, username) {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Rukun Ternak <noreply@rukunternak.com>',
      to: email,
      subject: 'Reset Password - Rukun Ternak',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c5f2d;">Reset Password - Rukun Ternak</h2>
          <p>Halo <strong>${username}</strong>,</p>
          <p>Anda menerima email ini karena ada permintaan untuk mereset password akun Anda di Rukun Ternak.</p>
          <p>Klik tombol di bawah ini untuk mereset password Anda:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #2c5f2d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Atau salin dan tempel link berikut ke browser Anda:</p>
          <p style="word-break: break-all; color: #666;">
            <a href="${resetUrl}">${resetUrl}</a>
          </p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            <strong>Catatan:</strong> Link ini akan kadaluarsa dalam 1 jam. Jika Anda tidak meminta reset password, abaikan email ini.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Email ini dikirim secara otomatis. Mohon jangan membalas email ini.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[EmailService] Password reset email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('[EmailService] Error sending password reset email:', error);
    throw new Error('Gagal mengirim email reset password');
  }
}

/**
 * Send test email (for debugging)
 * @param {string} email - Recipient email address
 * @returns {Promise<void>}
 */
async function sendTestEmail(email) {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Rukun Ternak <noreply@rukunternak.com>',
      to: email,
      subject: 'Test Email - Rukun Ternak',
      html: '<p>This is a test email from Rukun Ternak.</p>',
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[EmailService] Test email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('[EmailService] Error sending test email:', error);
    throw error;
  }
}

module.exports = {
  sendPasswordResetEmail,
  sendTestEmail,
};
