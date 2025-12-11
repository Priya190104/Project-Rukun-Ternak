const express = require('express');
const router = express.Router();
const { login, me } = require('../controllers/authController');
const { attachUser, requireAuth } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', attachUser, requireAuth, me);

module.exports = router;
