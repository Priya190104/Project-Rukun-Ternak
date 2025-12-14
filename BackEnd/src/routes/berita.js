const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { attachUser } = require('../middleware/auth');
const {
  getAllBerita,
  getBeritaById,
  updateBerita,
  deleteBerita,
} = require('../controllers/beritaController');

const router = express.Router();

// Setup multer storage
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
    cb(null, `${Date.now()}_${base}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG/PNG images are allowed'));
    }
  },
});

// Public routes
router.get('/', getAllBerita);
router.get('/:id', getBeritaById);

// Admin only routes
router.post('/', attachUser, upload.single('image'), (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
  }
  const file = req.file;
  const { caption } = req.body || {};
  if (!file || !caption) {
    return res.status(400).json({ success: false, message: 'Image file and caption are required' });
  }
  // Build public URL path
  const imageUrl = `/uploads/${file.filename}`;
  req.body.imageUrl = imageUrl;
  next();
}, require('../controllers/beritaController').createBerita);

router.put('/:id', attachUser, upload.single('image'), (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
  }
  // Optional new image
  if (req.file) {
    req.body.imageUrl = `/uploads/${req.file.filename}`;
  }
  next();
}, updateBerita);

router.delete('/:id', attachUser, (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
  }
  next();
}, deleteBerita);

module.exports = router;
