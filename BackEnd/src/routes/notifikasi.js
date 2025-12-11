const express = require('express');
const router = express.Router();
const { getNotifikasi } = require('../controllers/notifikasiController');
const { attachUser, requireAuth } = require('../middleware/auth');

router.use(attachUser);
router.get('/', requireAuth, getNotifikasi);

module.exports = router;
