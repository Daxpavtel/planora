const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');
const upload = require('../middleware/upload');

// Helper to format duration string
function formatDuration(hours) {
  if (!hours) return '2h';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

// GET /api/activities - Fetch activities with filters
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const { city_id, city, category, type, search, max_cost, min_cost, sort } = req.query;

    let query = `
      SELECT 
        a.activity_id,
        a.city_id,
        a.title,
        a.type,
        a.cost,
        a.duration_hours,
        a.description,
        a.image_url,
        c.name AS city_name,
        c.country AS city_country
      FROM activities a
      JOIN cities c ON c.city_id = a.city_id
      WHERE 1=1
    `;
    const params = [];

    if (city_id) {
      query += ` AND a.city_id = ?`;
      params.push(parseInt(city_id, 10));
    }

    if (city && city.trim()) {
      query += ` AND LOWER(c.name) = LOWER(?)`;
      params.push(city.trim());
    }

    const cat = category || type;
    if (cat && cat.toLowerCase() !== 'all') {
      query += ` AND LOWER(a.type) LIKE ?`;
      params.push(`%${cat.trim().toLowerCase()}%`);
    }

    if (search && search.trim()) {
      const s = `%${search.trim()}%`;
      query += ` AND (a.title LIKE ? OR a.description LIKE ? OR a.type LIKE ?)`;
      params.push(s, s, s);
    }

    if (min_cost !== undefined && min_cost !== '') {
      query += ` AND a.cost >= ?`;
      params.push(parseFloat(min_cost));
    }

    if (max_cost !== undefined && max_cost !== '') {
      query += ` AND a.cost <= ?`;
      params.push(parseFloat(max_cost));
    }

    if (sort === 'cost_asc') {
      query += ` ORDER BY a.cost ASC`;
    } else if (sort === 'cost_desc') {
      query += ` ORDER BY a.cost DESC`;
    } else if (sort === 'duration') {
      query += ` ORDER BY a.duration_hours ASC`;
    } else {
      query += ` ORDER BY a.activity_id ASC`;
    }

    const [rows] = await pool.query(query, params);

    const formatted = rows.map((a) => {
      const hours = a.duration_hours ? parseFloat(a.duration_hours) : 2.0;
      const categoryName = a.type
        ? a.type.charAt(0).toUpperCase() + a.type.slice(1)
        : 'Sightseeing';

      return {
        id: String(a.activity_id),
        activity_id: a.activity_id,
        city_id: a.city_id,
        city: a.city_name,
        country: a.city_country,
        title: a.title,
        type: a.type,
        category: categoryName,
        cost: parseFloat(a.cost),
        duration_hours: hours,
        duration: formatDuration(hours),
        description: a.description || 'No description provided.',
        image_url: a.image_url,
        image: a.image_url || '/images/paris.png',
        rating: 4.8,
        location: `${a.city_name} Center`,
        bestTime: hours > 4 ? 'Morning' : a.type === 'food tours' ? 'Evening' : 'Afternoon',
        indoor: a.type === 'sightseeing' && a.title.toLowerCase().includes('museum'),
      };
    });

    res.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (err) {
    console.error('Error fetching activities:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/activities/:id - Quick View API Endpoint
router.get('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const activityId = parseInt(req.params.id, 10);

    if (isNaN(activityId)) {
      return res.status(400).json({ success: false, message: 'Invalid activity ID' });
    }

    const [rows] = await pool.query(
      `
      SELECT 
        a.activity_id,
        a.city_id,
        a.title,
        a.type,
        a.cost,
        a.duration_hours,
        a.description,
        a.image_url,
        c.name AS city_name,
        c.country AS city_country
      FROM activities a
      JOIN cities c ON c.city_id = a.city_id
      WHERE a.activity_id = ?
    `,
      [activityId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    const a = rows[0];
    const hours = a.duration_hours ? parseFloat(a.duration_hours) : 2.0;

    res.json({
      success: true,
      data: {
        id: String(a.activity_id),
        activity_id: a.activity_id,
        city_id: a.city_id,
        city: a.city_name,
        country: a.city_country,
        title: a.title,
        type: a.type,
        category: a.type ? a.type.charAt(0).toUpperCase() + a.type.slice(1) : 'Sightseeing',
        cost: parseFloat(a.cost),
        duration_hours: hours,
        duration: formatDuration(hours),
        description: a.description,
        image_url: a.image_url,
        image: a.image_url || '/images/paris.png',
        rating: 4.8,
        location: `${a.city_name} Center`,
        bestTime: hours > 4 ? 'Morning' : a.type === 'food tours' ? 'Evening' : 'Afternoon',
        indoor: a.type === 'sightseeing' && a.title.toLowerCase().includes('museum'),
      },
    });
  } catch (err) {
    console.error('Error fetching activity details:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/activities - Create new activity with optional image upload
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const pool = getPool();
    const { city_id, title, type, cost, duration_hours, description } = req.body;

    if (!city_id || !title || !type) {
      return res.status(400).json({
        success: false,
        message: 'city_id, title, and type are required',
      });
    }

    let imageUrl = req.body.image_url || null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const [result] = await pool.query(
      `
      INSERT INTO activities (city_id, title, type, cost, duration_hours, description, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        parseInt(city_id, 10),
        title,
        type,
        parseFloat(cost || '0.00'),
        duration_hours ? parseFloat(duration_hours) : null,
        description || null,
        imageUrl,
      ],
    );

    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      data: {
        activity_id: result.insertId,
        city_id: parseInt(city_id, 10),
        title,
        type,
        cost: parseFloat(cost || '0.00'),
        duration_hours: duration_hours ? parseFloat(duration_hours) : null,
        description,
        image_url: imageUrl,
      },
    });
  } catch (err) {
    console.error('Error creating activity:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
