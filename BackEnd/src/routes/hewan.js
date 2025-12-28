const express = require('express');
const router = express.Router();
const { requireAuth, RoleGuard } = require('../middleware/auth');
const hewanController = require('../controllers/hewanController');
const updateTernakController = require('../controllers/updateTernakController');

// Middleware untuk user kelompok
const kelompokOnly = RoleGuard(['kelompok']);
const adminOnly = RoleGuard(['admin']);

// ==================== HEWAN TERNAK ROUTES ====================

// Get list hewan ternak (KELOMPOK)
router.get('/hewan', requireAuth, kelompokOnly, hewanController.getHewanTernak);

// Get detail hewan (KELOMPOK)
router.get('/hewan/:id', requireAuth, kelompokOnly, hewanController.getDetailHewan);

// Get list semua hewan ternak (ADMIN)
router.get('/admin/hewan', requireAuth, adminOnly, hewanController.getAllHewanAdmin);

// Get detail hewan (ADMIN)
router.get('/admin/hewan/:id', requireAuth, adminOnly, hewanController.getDetailHewanAdmin);

// Get dropdown hewan aktif (untuk form)
router.get('/hewan-aktif', requireAuth, kelompokOnly, hewanController.getHewanAktif);

// ==================== UPDATE TERNAK ROUTES ====================

// Submit update ternak
router.post('/update-ternak', requireAuth, kelompokOnly, updateTernakController.submitUpdateTernak);

// Get riwayat update ternak
router.get('/riwayat-update', requireAuth, kelompokOnly, updateTernakController.getRiwayatUpdateTernak);

module.exports = router;
