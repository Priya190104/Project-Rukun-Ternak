const express = require('express');
const router = express.Router();
const { attachUser, requireAuth } = require('../middleware/auth');
const { getLaporan, getLaporanById, createLaporan, updateLaporan, deleteLaporan } = require('../controllers/laporanController');

router.use(attachUser);
router.get('/', requireAuth, getLaporan);
router.get('/:id', requireAuth, getLaporanById);
router.post('/', requireAuth, createLaporan);
router.put('/:id', requireAuth, updateLaporan);
router.delete('/:id', requireAuth, deleteLaporan);

module.exports = router;
