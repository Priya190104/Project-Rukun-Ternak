const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole, updateUserKelompok, deleteUser, createUser } = require('../controllers/usersController');
const { attachUser, requireAuth } = require('../middleware/auth');

router.use(attachUser);
router.get('/', requireAuth, getUsers);
router.post('/', requireAuth, createUser);

// Admin routes to manage users
router.put('/:id/role', requireAuth, updateUserRole);
router.put('/:id/kelompok', requireAuth, updateUserKelompok);
router.delete('/:id', requireAuth, deleteUser);

module.exports = router;
