require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./utils/prismaClient');

const tripRoutes = require('./routes/tripRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Step 8: Strict CORS configuration via Environment Variables
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/trips', tripRoutes);

// Step 10 & 11: Health check & DB verification
app.get('/api/health', async (req, res) => {
  try {
    // Attempt a trivial query to verify DB connectivity without leaking credentials
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected', message: 'Planora API is running' });
  } catch (error) {
    // Return 503 Service Unavailable if DB is down, do not leak error details
    console.error('Database connection failed during health check');
    res.status(503).json({ status: 'error', database: 'disconnected', message: 'Service Unavailable' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port $`);
});
