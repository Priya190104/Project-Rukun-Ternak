const express = require('express');
const router = express.Router();
const { attachUser, requireAuth, RoleGuard, ViewerReadOnlyGuard } = require('../middleware/auth');
const { getHewanTernak, getDetailHewan, getHewanAktif, getAllHewanAdmin, getDetailHewanAdmin, createHewan, getPejantanCandidates, getIndukCandidates, getNextBisnisId, getHewanTernakMitra } = require('../controllers/hewanController');
const updateTernakController = require('../controllers/updateTernakController');

// Middleware untuk user kelompok
const kelompokOnly = RoleGuard(['kelompok', 'mitra_kelompok']);
const kelompokRoleOnly = RoleGuard(['kelompok']);
const adminOnly = RoleGuard(['admin']);
const adminOrViewer = RoleGuard(['admin', 'viewer']);

// Attach user dan apply viewer read-only guard
router.use(attachUser);
router.use(ViewerReadOnlyGuard);

// ==================== HEWAN TERNAK ROUTES ====================

// Create hewan ternak (KELOMPOK - manual input with validation)
router.post('/hewan', requireAuth, kelompokOnly, createHewan);

// Get list hewan ternak (KELOMPOK)
router.get('/hewan', requireAuth, kelompokOnly, getHewanTernak);

// Generate next ID bisnis hewan ternak (harus SEBELUM /hewan/:id agar tidak tertangkap oleh :id)
router.get('/hewan/next-bisnis-id', requireAuth, kelompokOnly, getNextBisnisId);

// Get semua hewan ternak dari mitra kelompok (KELOMPOK role - tab mitra)
router.get('/hewan/mitra', requireAuth, kelompokRoleOnly, getHewanTernakMitra);

// Get detail hewan (KELOMPOK)
router.get('/hewan/:id', requireAuth, kelompokOnly, getDetailHewan);

// Get list semua hewan ternak (ADMIN & VIEWER - read-only)
router.get('/admin/hewan', requireAuth, adminOrViewer, getAllHewanAdmin);

// Get detail hewan (ADMIN & VIEWER - read-only)
router.get('/admin/hewan/:id', requireAuth, adminOrViewer, getDetailHewanAdmin);

// Get dropdown hewan aktif (untuk form)
router.get('/hewan-aktif', requireAuth, kelompokOnly, getHewanAktif);

// Get candidates untuk pejantan (form kelahiran)
router.get('/candidates/pejantan', requireAuth, kelompokOnly, getPejantanCandidates);

// Get candidates untuk induk (form kelahiran)
router.get('/candidates/induk', requireAuth, kelompokOnly, getIndukCandidates);

// ==================== UPDATE TERNAK ROUTES ====================

// Submit update ternak
router.post('/update-ternak', requireAuth, kelompokOnly, updateTernakController.submitUpdateTernak);

// Get riwayat update ternak
router.get('/riwayat-update', requireAuth, kelompokOnly, updateTernakController.getRiwayatUpdateTernak);

module.exports = router;
