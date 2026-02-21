/**
 * Password Reset Controller
 * 
 * Handles forgot password and reset password requests
 */

const db = require('../db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../services/emailService');

/**
 * POST /api/auth/forgot-password
 * Request password reset by username or email
 * 
 * Request body:
 *   - usernameOrEmail: string (required) - Username or email address
 * 
 * Response:
 *   - success: true/false
 *   - message: string
 *   - email: string (masked) - Masked email address where reset link was sent
 */
async function forgotPassword(req, res) {
  try {
    const { usernameOrEmail } = req.body;

    // Validation
    if (!usernameOrEmail || !usernameOrEmail.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Username atau email harus diisi',
      });
    }

    // Find user by username or email
    const userResult = await db.query(
      `SELECT id, username, email, full_name 
       FROM users 
       WHERE username = $1 OR email = $1`,
      [usernameOrEmail.trim()]
    );

    // Security: Always return same message even if user not found
    // to prevent enumeration attacks
    if (userResult.rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Jika akun ditemukan, email reset password telah dikirim.',
      });
    }

    const user = userResult.rows[0];

    // Check if user has email
    if (!user.email || user.email.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Akun ini tidak memiliki email terdaftar. Silakan hubungi administrator.',
      });
    }

    // Generate reset token (random 32 bytes hex string)
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Save token to database
    await db.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, resetToken, expiresAt]
    );

    // Send email
    try {
      await sendPasswordResetEmail(user.email, resetToken, user.username);
      console.log(`[ForgotPassword] Reset email sent to user ${user.id} (${user.email})`);
    } catch (emailError) {
      console.error('[ForgotPassword] Failed to send email:', emailError);
      // Delete the token since email failed
      await db.query('DELETE FROM password_reset_tokens WHERE token = $1', [resetToken]);
      
      return res.status(500).json({
        success: false,
        message: 'Gagal mengirim email. Silakan coba lagi nanti.',
      });
    }

    // Mask email for security (show only first 2 chars and domain)
    const maskedEmail = maskEmail(user.email);

    return res.status(200).json({
      success: true,
      message: 'Email reset password telah dikirim.',
      email: maskedEmail,
    });

  } catch (error) {
    console.error('[ForgotPassword] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memproses permintaan reset password.',
    });
  }
}

/**
 * POST /api/auth/reset-password
 * Reset password using token
 * 
 * Request body:
 *   - token: string (required) - Reset token from email
 *   - newPassword: string (required) - New password (min 6 characters)
 * 
 * Response:
 *   - success: true/false
 *   - message: string
 */
async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    // Validation
    if (!token || !token.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Token reset password tidak valid',
      });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password baru harus minimal 6 karakter',
      });
    }

    // Find token in database
    const tokenResult = await db.query(
      `SELECT id, user_id, expires_at, used
       FROM password_reset_tokens
       WHERE token = $1`,
      [token.trim()]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Token reset password tidak valid atau sudah kadaluarsa',
      });
    }

    const resetTokenData = tokenResult.rows[0];

    // Check if token is expired
    if (new Date() > new Date(resetTokenData.expires_at)) {
      return res.status(400).json({
        success: false,
        message: 'Token reset password sudah kadaluarsa. Silakan minta token baru.',
      });
    }

    // Check if token has been used
    if (resetTokenData.used) {
      return res.status(400).json({
        success: false,
        message: 'Token reset password sudah digunakan. Silakan minta token baru.',
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await db.query(
      `UPDATE users 
       SET password = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [hashedPassword, resetTokenData.user_id]
    );

    // Mark token as used
    await db.query(
      `UPDATE password_reset_tokens
       SET used = TRUE, used_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [resetTokenData.id]
    );

    console.log(`[ResetPassword] Password reset successful for user ${resetTokenData.user_id}`);

    return res.status(200).json({
      success: true,
      message: 'Password berhasil direset. Silakan login dengan password baru Anda.',
    });

  } catch (error) {
    console.error('[ResetPassword] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mereset password.',
    });
  }
}

/**
 * GET /api/auth/verify-reset-token/:token
 * Verify if reset token is valid
 * 
 * Response:
 *   - success: true/false
 *   - message: string
 *   - valid: boolean
 */
async function verifyResetToken(req, res) {
  try {
    const { token } = req.params;

    if (!token || !token.trim()) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Token tidak valid',
      });
    }

    // Find token in database
    const tokenResult = await db.query(
      `SELECT id, expires_at, used
       FROM password_reset_tokens
       WHERE token = $1`,
      [token.trim()]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(200).json({
        success: true,
        valid: false,
        message: 'Token tidak ditemukan atau sudah kadaluarsa',
      });
    }

    const resetTokenData = tokenResult.rows[0];

    // Check if token is expired
    if (new Date() > new Date(resetTokenData.expires_at)) {
      return res.status(200).json({
        success: true,
        valid: false,
        message: 'Token sudah kadaluarsa',
      });
    }

    // Check if token has been used
    if (resetTokenData.used) {
      return res.status(200).json({
        success: true,
        valid: false,
        message: 'Token sudah digunakan',
      });
    }

    return res.status(200).json({
      success: true,
      valid: true,
      message: 'Token valid',
    });

  } catch (error) {
    console.error('[VerifyResetToken] Error:', error);
    return res.status(500).json({
      success: false,
      valid: false,
      message: 'Terjadi kesalahan saat memverifikasi token',
    });
  }
}

/**
 * Helper: Mask email address for security
 * Example: user@example.com -> us***@example.com
 */
function maskEmail(email) {
  if (!email || !email.includes('@')) return '***';
  
  const [username, domain] = email.split('@');
  const maskedUsername = username.length > 2 
    ? username.substring(0, 2) + '***'
    : username[0] + '***';
  
  return `${maskedUsername}@${domain}`;
}

module.exports = {
  forgotPassword,
  resetPassword,
  verifyResetToken,
};
