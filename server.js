const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: ['https://elimfilters.com', 'http://localhost:3000'],
  methods: ['GET','POST'],
  credentials: true
}));

app.use(express.json());

const filterRoutes = require('./src/routes/filterRoutes');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Error:', err));

app.get('/', (req, res) => {
  res.json({ 
    service: 'ELIMFILTERS World Catalogue API',
    version: '7.0.0',
    status: 'operational',
    endpoints: {
      health: 'GET /health',
      search: 'POST /api/search'
    }
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.use('/api', filterRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 ELIMFILTERS API v7.0 running on port ${PORT}`);
  console.log(`📚 Docs: http://localhost:${PORT}/`);
});
