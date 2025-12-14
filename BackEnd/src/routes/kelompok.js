const express = require('express');
const router = express.Router();
const { getKelompok, createKelompok, updateKelompok, deleteKelompok } = require('../controllers/kelompokController');
const { attachUser } = require('../middleware/auth');

router.use(attachUser);
router.get('/', getKelompok);

// Admin-only kelompok management
router.post('/', createKelompok);
router.put('/:id', updateKelompok);
router.delete('/:id', deleteKelompok);

module.exports = router;
