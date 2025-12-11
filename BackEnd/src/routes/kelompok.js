const express = require('express');
const router = express.Router();
const { getKelompok } = require('../controllers/kelompokController');
const { attachUser } = require('../middleware/auth');

router.use(attachUser);
router.get('/', getKelompok);

module.exports = router;
