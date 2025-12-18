const db = require('../db');
const fs = require('fs');
const path = require('path');

// Helper function to convert image URLs to full absolute URLs
const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  // If it's already a full URL, return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  // If it's a relative path, convert to full URL
  const baseUrl = process.env.BACKEND_URL || 'http://localhost:4000';
  return `${baseUrl}${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`;
};

// Helper function to process berita data and convert image URLs
const processBeritaData = (berita) => {
  if (Array.isArray(berita)) {
    return berita.map((item) => ({
      ...item,
      imageUrl: getFullImageUrl(item.imageUrl),
    }));
  }
  if (berita) {
    return {
      ...berita,
      imageUrl: getFullImageUrl(berita.imageUrl),
    };
  }
  return null;
};

// Get all berita (sorted by newest first)
const getAllBerita = async (req, res) => {
  try {
    console.log('[Berita] GET ALL');
    const { rows } = await db.query('SELECT id, caption, image_url AS "imageUrl", published_at AS "publishedAt", created_at AS "createdAt", updated_at AS "updatedAt" FROM berita ORDER BY COALESCE(published_at, created_at) DESC');
    const berita = processBeritaData(rows);
    console.log('[Berita] GET ALL returned', berita.length, 'records');
    res.json({ success: true, data: berita });
  } catch (err) {
    console.error('[Berita] GET ALL error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch berita', error: err.message });
  }
};

// Get single berita
const getBeritaById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT id, caption, image_url AS "imageUrl", published_at AS "publishedAt", created_at AS "createdAt", updated_at AS "updatedAt" FROM berita WHERE id=$1', [parseInt(id,10)]);
    const berita = rows[0];
    if (!berita) {
      return res.status(404).json({ success: false, message: 'Berita not found' });
    }
    const processedBerita = processBeritaData(berita);
    res.json({ success: true, data: processedBerita });
  } catch (err) {
    console.error('Error fetching berita:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch berita', error: err.message });
  }
};

// Create berita
const createBerita = async (req, res) => {
  try {
    const { caption, imageUrl, publishedAt } = req.body;
    
    console.log('[Berita] CREATE request:', { caption: !!caption, imageUrl: !!imageUrl, publishedAt, bodyKeys: Object.keys(req.body) });

    // Validation
    if (!caption || !imageUrl) {
      console.log('[Berita] CREATE validation failed:', { caption: !!caption, imageUrl: !!imageUrl });
      return res.status(400).json({ success: false, message: 'Caption and image URL are required' });
    }

    if (!publishedAt) {
      console.log('[Berita] CREATE validation failed: publishedAt is required');
      return res.status(400).json({ success: false, message: 'Tanggal & waktu publikasi wajib diisi' });
    }

    console.log('[Berita] Inserting to database:', { caption, imageUrl, publishedAt });
    const { rows } = await db.query('INSERT INTO berita (caption, image_url, published_at, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id, caption, image_url AS "imageUrl", published_at AS "publishedAt", created_at AS "createdAt", updated_at AS "updatedAt"', [caption, imageUrl, publishedAt]);
    const berita = rows[0];
    const processedBerita = processBeritaData(berita);

    console.log('[Berita] CREATE success:', berita.id);
    res.status(201).json({ success: true, message: 'Berita created successfully', data: processedBerita });
  } catch (err) {
    console.error('[Berita] CREATE error:', err.message, err.code);
    res.status(500).json({ success: false, message: 'Failed to create berita', error: err.message });
  }
};

// Update berita
const updateBerita = async (req, res) => {
  try {
    const { id } = req.params;
    const { caption, imageUrl, publishedAt } = req.body;

    console.log('[Berita] UPDATE request:', { id, caption: !!caption, imageUrl: !!imageUrl, publishedAt });

    // Validation
    if (!caption) {
      return res.status(400).json({ success: false, message: 'Caption is required' });
    }

    if (!publishedAt) {
      return res.status(400).json({ success: false, message: 'Tanggal & waktu publikasi wajib diisi' });
    }

    let query;
    let params;

    if (imageUrl) {
      // Update with new image
      query = 'UPDATE berita SET caption=$1, image_url=$2, published_at=$3, updated_at=NOW() WHERE id=$4 RETURNING id, caption, image_url AS "imageUrl", published_at AS "publishedAt", created_at AS "createdAt", updated_at AS "updatedAt"';
      params = [caption, imageUrl, publishedAt, parseInt(id, 10)];
    } else {
      // Update only caption and publishedAt
      query = 'UPDATE berita SET caption=$1, published_at=$2, updated_at=NOW() WHERE id=$3 RETURNING id, caption, image_url AS "imageUrl", published_at AS "publishedAt", created_at AS "createdAt", updated_at AS "updatedAt"';
      params = [caption, publishedAt, parseInt(id, 10)];
    }

    const { rows } = await db.query(query, params);
    const berita = rows[0];

    if (!berita) {
      return res.status(404).json({ success: false, message: 'Berita not found' });
    }

    const processedBerita = processBeritaData(berita);
    console.log('[Berita] UPDATE success:', berita.id);
    res.json({ success: true, message: 'Berita updated successfully', data: processedBerita });
  } catch (err) {
    console.error('[Berita] UPDATE error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update berita', error: err.message });
  }
};

// Delete berita
const deleteBerita = async (req, res) => {
  try {
    const { id } = req.params;

    // fetch image path first
    const existing = await db.query('SELECT image_url FROM berita WHERE id=$1', [parseInt(id,10)]);
    if (!existing.rows[0]) {
      return res.status(404).json({ success: false, message: 'Berita not found' });
    }
    const imageUrl = existing.rows[0].image_url; // e.g., /uploads/filename.jpg
    const absolutePath = path.join(__dirname, '../../', imageUrl.replace(/^[\/]+/, ''));

    const { rowCount } = await db.query('DELETE FROM berita WHERE id=$1', [parseInt(id,10)]);
    if (rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Berita not found' });
    }

    // attempt to delete file
    if (imageUrl) {
      fs.unlink(absolutePath, (err) => {
        if (err) {
          console.warn('Failed to delete image file:', absolutePath, err?.message);
        }
      });
    }

    res.json({ success: true, message: 'Berita deleted successfully' });
  } catch (err) {
    console.error('Error deleting berita:', err);
    res.status(500).json({ success: false, message: 'Failed to delete berita', error: err.message });
  }
};

module.exports = {
  getAllBerita,
  getBeritaById,
  createBerita,
  updateBerita,
  deleteBerita,
};
