const express = require('express');
const router = express.Router();
const { login, me } = require('../controllers/authController');
const { attachUser, requireAuth } = require('../middleware/auth');
const { 
  forgotPassword, 
  resetPassword, 
  verifyResetToken 
} = require('../controllers/passwordResetController');

// Authentication routes
router.post('/login', login);
router.get('/me', attachUser, requireAuth, me);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-reset-token/:token', verifyResetToken);

module.exports = router;
