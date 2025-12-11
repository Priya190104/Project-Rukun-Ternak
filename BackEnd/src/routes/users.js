const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/usersController');
const { attachUser, requireAuth } = require('../middleware/auth');

router.use(attachUser);
router.get('/', requireAuth, getUsers);

module.exports = router;
