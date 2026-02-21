const express = require('express');
const router = express.Router();
const {
  getMitraKelompok,
  getMitraKelompokById,
  createMitraKelompok,
  updateMitraKelompok,
  updateMitraKelompokKode,
  deleteMitraKelompok,
  getMitraUsers,
  createMitraUser,
  updateMitraUserRole,
  deleteMitraUser
} = require('../controllers/mitraKelompokController');
const { attachUser, requireAuth, RoleGuard, ViewerReadOnlyGuard } = require('../middleware/auth');

// All routes require authentication
router.use(attachUser);
router.use(requireAuth);
router.use(ViewerReadOnlyGuard);

// Mitra Kelompok CRUD (admin & kelompok)
router.get('/', RoleGuard(['admin', 'kelompok', 'viewer']), getMitraKelompok);
router.get('/:id', RoleGuard(['admin', 'kelompok', 'viewer']), getMitraKelompokById);
router.post('/', RoleGuard(['admin', 'kelompok']), createMitraKelompok);
router.put('/:id', RoleGuard(['admin', 'kelompok']), updateMitraKelompok);
router.patch('/:id/kode', RoleGuard(['admin', 'kelompok']), updateMitraKelompokKode);
router.delete('/:id', RoleGuard(['admin', 'kelompok']), deleteMitraKelompok);

// Mitra Kelompok User Management — kelompok only (admin tidak memiliki akses)
router.get('/:id/users', RoleGuard(['kelompok']), getMitraUsers);
router.post('/:id/users', RoleGuard(['kelompok']), createMitraUser);
router.put('/:id/users/:userId/role', RoleGuard(['kelompok']), updateMitraUserRole);
router.delete('/:id/users/:userId', RoleGuard(['kelompok']), deleteMitraUser);

module.exports = router;
