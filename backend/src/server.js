const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const { initializeDatabase } = require('./config/db');
const authMiddleware = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const citiesRoutes = require('./routes/cities');
const activitiesRoutes = require('./routes/activities');
const tripsRoutes = require('./routes/trips');
const expensesRoutes = require('./routes/expenses');
const communityRoutes = require('./routes/community');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Planora GlobeTrotter Backend API',
    database: process.env.DB_NAME || 'planora',
  });
});

// Authentication middleware applied to all routes
app.use(authMiddleware);

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/cities', citiesRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api', expensesRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/admin', adminRoutes);

// Global 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Start Server
async function startServer() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 Planora Backend Server running on http://localhost:${PORT}`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  });
}

startServer();

module.exports = app;
