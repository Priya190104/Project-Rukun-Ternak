const express = require('express');
const router = express.Router();
const { attachUser, requireAuth, RoleGuard, ViewerReadOnlyGuard } = require('../middleware/auth');
const hewanController = require('../controllers/hewanController');
const updateTernakController = require('../controllers/updateTernakController');

// Middleware untuk user kelompok
const kelompokOnly = RoleGuard(['kelompok']);
const adminOnly = RoleGuard(['admin']);
const adminOrViewer = RoleGuard(['admin', 'viewer']);

// Attach user dan apply viewer read-only guard
router.use(attachUser);
router.use(ViewerReadOnlyGuard);

// ==================== HEWAN TERNAK ROUTES ====================

// Create hewan ternak (KELOMPOK - manual input with validation)
router.post('/hewan', requireAuth, kelompokOnly, hewanController.createHewan);

// Get list hewan ternak (KELOMPOK)
router.get('/hewan', requireAuth, kelompokOnly, hewanController.getHewanTernak);

// Get detail hewan (KELOMPOK)
router.get('/hewan/:id', requireAuth, kelompokOnly, hewanController.getDetailHewan);

// Get list semua hewan ternak (ADMIN & VIEWER - read-only)
router.get('/admin/hewan', requireAuth, adminOrViewer, hewanController.getAllHewanAdmin);

// Get detail hewan (ADMIN & VIEWER - read-only)
router.get('/admin/hewan/:id', requireAuth, adminOrViewer, hewanController.getDetailHewanAdmin);

// Get dropdown hewan aktif (untuk form)
router.get('/hewan-aktif', requireAuth, kelompokOnly, hewanController.getHewanAktif);

// Get candidates untuk pejantan (form kelahiran)
router.get('/candidates/pejantan', requireAuth, kelompokOnly, hewanController.getPejantanCandidates);

// Get candidates untuk induk (form kelahiran)
router.get('/candidates/induk', requireAuth, kelompokOnly, hewanController.getIndukCandidates);

// ==================== UPDATE TERNAK ROUTES ====================

// Submit update ternak
router.post('/update-ternak', requireAuth, kelompokOnly, updateTernakController.submitUpdateTernak);

// Get riwayat update ternak
router.get('/riwayat-update', requireAuth, kelompokOnly, updateTernakController.getRiwayatUpdateTernak);

module.exports = router;
