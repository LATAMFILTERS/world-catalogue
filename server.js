const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api.routes');

const app = express();

// CORS explícito para WordPress
app.use(cors({
  origin: ['https://elimfilters.com', 'https://www.elimfilters.com'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use('/api', apiRoutes);

// Conectar MongoDB
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 ELIMFILTERS Backend API');
    console.log(`📍 Server running on port ${PORT}`);
    console.log('📋 Available endpoints:');
    console.log('   GET  /api/scraper/donaldson/:sku');
    console.log('   GET  /api/scraper/fram/:sku');
    console.log('   POST /api/import/crossref');
    console.log('   GET  /api/search?q=:code');
});
