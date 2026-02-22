const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api.routes');

const app = express();

// =====================
// Middleware
// =====================
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// =====================
// MongoDB Connection
// =====================
mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('MongoDB error:', err.message));

// =====================
// Health Endpoints
// =====================
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ELIMFILTERS Backend API',
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// =====================
// API Routes
// =====================
app.use('/api', apiRoutes);

// =====================
// 404 Handler
// =====================
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path
  });
});

// =====================
// Start Server
// =====================
const PORT = process.env.PORT || 8080;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ELIMFILTERS Backend API running on port ${PORT}`);
});