const express = require('express');
const router = express.Router();
const { attachUser, requireAuth } = require('../middleware/auth');
const { getSummary, getDashboardSummary, getDashboardKelompok, getAdminDashboard, getLaporanByMonth, getKelahiranStats } = require('../controllers/statsController');

router.use(attachUser);
router.get('/admin/dashboard', requireAuth, getAdminDashboard);
router.get('/kelahiran', requireAuth, getKelahiranStats);
router.get('/dashboard/kelompok', requireAuth, getDashboardKelompok);
router.get('/dashboard', requireAuth, getDashboardSummary);
router.get('/monthly', requireAuth, getLaporanByMonth);
router.get('/', requireAuth, getSummary);

module.exports = router;
