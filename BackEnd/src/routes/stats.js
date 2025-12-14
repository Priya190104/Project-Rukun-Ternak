const express = require('express');
const router = express.Router();
const { attachUser, requireAuth } = require('../middleware/auth');
const { getSummary } = require('../controllers/statsController');

router.use(attachUser);
router.get('/', requireAuth, getSummary);

module.exports = router;
