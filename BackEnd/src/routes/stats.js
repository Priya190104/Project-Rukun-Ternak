const express = require('express');
const router = express.Router();
const { attachUser, requireAuth } = require('../middleware/auth');
const { getSummary, getDashboardSummary } = require('../controllers/statsController');

router.use(attachUser);
router.get('/dashboard', requireAuth, getDashboardSummary);
router.get('/', requireAuth, getSummary);

module.exports = router;
