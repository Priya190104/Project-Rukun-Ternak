const express = require('express');
const router = express.Router();
const { getKelompok, getKelompokById, createKelompok, updateKelompok, deleteKelompok } = require('../controllers/kelompokController');
const { attachUser, ViewerReadOnlyGuard, RoleGuard } = require('../middleware/auth');

// Public GET routes - no auth required
router.get('/', getKelompok);
router.get('/:id', getKelompokById);

// Protected write routes - auth required
router.use(attachUser);
router.use(ViewerReadOnlyGuard);

// Admin-only kelompok management
router.post('/', RoleGuard(['admin', 'kelompok']), createKelompok);
router.put('/:id', RoleGuard(['admin', 'kelompok']), updateKelompok);
router.delete('/:id', RoleGuard(['admin']), deleteKelompok);

module.exports = router;
