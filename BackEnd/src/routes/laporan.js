const express = require('express');
const router = express.Router();
const { attachUser, requireAuth } = require('../middleware/auth');
const { 
  getLaporanList, 
  getSummary, 
  getLaporanById, 
  createLaporan, 
  createLaporanBulk,
  updateLaporan, 
  deleteLaporan 
} = require('../controllers/laporanController');
const { generateSertifikatKelahiran } = require('../controllers/sertifikatController');

router.use(attachUser);

// =====================================================================
// OPTIMIZED ENDPOINTS - Phase 4
// =====================================================================
// Summary endpoint (lightweight counts only) - MUST come before /list
router.get('/summary', requireAuth, getSummary);

// List endpoint (paginated, with 2-step query optimization)
router.get('/list', requireAuth, getLaporanList);

// Detail endpoints
router.get('/:id', requireAuth, getLaporanById);
router.get('/:id/sertifikat', requireAuth, generateSertifikatKelahiran);

// Write endpoints
router.post('/', requireAuth, createLaporan);
router.post('/bulk', requireAuth, createLaporanBulk);
router.put('/:id', requireAuth, updateLaporan);
router.delete('/:id', requireAuth, deleteLaporan);

module.exports = router;
