require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { attachUser, requireAuth } = require('./src/middleware/auth');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/laporan', require('./src/routes/laporan'));
app.use('/api/users', require('./src/routes/users'));
app.use('/api/kelompok', require('./src/routes/kelompok'));
app.use('/api/notifikasi', require('./src/routes/notifikasi'));

app.get('/api/health', (req, res) => res.json({ success: true, data: 'ok' }));

app.use('/api', (req, res) => res.status(404).json({ success: false, message: 'API route not found' }));

app.listen(port, () => console.log(`Backend listening on ${port}`));
