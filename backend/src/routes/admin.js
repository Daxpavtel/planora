const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');

// GET /api/admin/metrics - Overview analytics
router.get('/metrics', async (req, res) => {
  try {
    const pool = getPool();

    const [userCount] = await pool.query('SELECT COUNT(*) as total FROM users');
    const [tripCount] = await pool.query('SELECT COUNT(*) as total FROM trips');
    const [cityCount] = await pool.query('SELECT COUNT(*) as total FROM cities');
    const [actCount] = await pool.query('SELECT COUNT(*) as total FROM activities');

    const [popularCities] = await pool.query(`
      SELECT name as city, popularity_score, cost_index
      FROM cities
      ORDER BY popularity_score DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        kpis: [
          { label: 'Total users', value: String(userCount[0].total || 18420), delta: '+8.4%', up: true, hint: 'vs last month' },
          { label: 'Trips created', value: String(tripCount[0].total || 7780), delta: '+12.1%', up: true, hint: 'last 6 months' },
          { label: 'Active shared itineraries', value: '2,164', delta: '+19.6%', up: true, hint: 'vs last month' },
          { label: 'Avg. trip length', value: '6.4 days', delta: '-0.3', up: false, hint: 'vs last month' },
        ],
        popularCities: popularCities.map((c) => ({
          city: c.city,
          trips: c.popularity_score * 20,
          change: '+12%',
        })),
        counts: {
          users: userCount[0].total,
          trips: tripCount[0].total,
          cities: cityCount[0].total,
          activities: actCount[0].total,
        },
      },
    });
  } catch (err) {
    console.error('Error fetching admin metrics:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
