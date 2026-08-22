const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');

// Helper to map country to region
function getRegion(country) {
  const c = (country || '').toLowerCase();
  if (['france', 'italy', 'germany', 'netherlands', 'portugal', 'spain', 'uk'].includes(c)) return 'Europe';
  if (['japan', 'thailand', 'indonesia', 'india', 'vietnam', 'china'].includes(c)) return 'Asia';
  if (['usa', 'united states', 'canada', 'mexico'].includes(c)) return 'North America';
  if (['south africa', 'egypt', 'morocco', 'kenya'].includes(c)) return 'Africa';
  return 'Global';
}

// Helper to map city image
function getCityImage(cityName) {
  const n = (cityName || '').toLowerCase();
  if (n.includes('paris')) return '/images/paris.png';
  if (n.includes('kyoto') || n.includes('tokyo')) return '/images/kyoto.png';
  if (n.includes('rome')) return '/images/lisbon.png';
  if (n.includes('bangkok')) return '/images/bali.png';
  if (n.includes('new york')) return '/images/berlin.png';
  if (n.includes('lisbon')) return '/images/lisbon.png';
  if (n.includes('amsterdam')) return '/images/amsterdam.png';
  if (n.includes('berlin')) return '/images/berlin.png';
  if (n.includes('udaipur')) return '/images/udaipur.png';
  if (n.includes('istanbul')) return '/images/istanbul.png';
  if (n.includes('bali')) return '/images/bali.png';
  if (n.includes('cape town')) return '/images/capetown.png';
  return '/images/paris.png';
}

// GET /api/cities - Search & Discovery with filters & sorting
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const { search, country, region, sort, budget, min_cost, max_cost } = req.query;
    const userId = req.user?.user_id || 1;

    let query = `
      SELECT 
        c.city_id,
        c.name,
        c.country,
        c.cost_index,
        c.popularity_score,
        COUNT(DISTINCT a.activity_id) AS total_activities,
        EXISTS(
          SELECT 1 FROM saved_destinations sd 
          WHERE sd.city_id = c.city_id AND sd.user_id = ?
        ) AS is_saved
      FROM cities c
      LEFT JOIN activities a ON a.city_id = c.city_id
      WHERE 1=1
    `;
    const params = [userId];

    if (search && search.trim()) {
      const s = `%${search.trim()}%`;
      query += ` AND (c.name LIKE ? OR c.country LIKE ?)`;
      params.push(s, s);
    }

    if (country && country.trim() && country.toLowerCase() !== 'all') {
      query += ` AND LOWER(c.country) = LOWER(?)`;
      params.push(country.trim());
    }

    if (min_cost) {
      query += ` AND c.cost_index >= ?`;
      params.push(parseFloat(min_cost));
    }
    if (max_cost) {
      query += ` AND c.cost_index <= ?`;
      params.push(parseFloat(max_cost));
    }

    query += ` GROUP BY c.city_id, c.name, c.country, c.cost_index, c.popularity_score`;

    // Sorting
    if (sort === 'cost_asc') {
      query += ` ORDER BY c.cost_index ASC`;
    } else if (sort === 'cost_desc') {
      query += ` ORDER BY c.cost_index DESC`;
    } else if (sort === 'name') {
      query += ` ORDER BY c.name ASC`;
    } else if (sort === 'country') {
      query += ` ORDER BY c.country ASC, c.name ASC`;
    } else {
      query += ` ORDER BY c.popularity_score DESC, c.name ASC`;
    }

    const [rows] = await pool.query(query, params);

    // Format output with additional attributes for frontend compatibility
    let formatted = rows.map((r) => {
      const reg = getRegion(r.country);
      const dailyCost = Math.round(parseFloat(r.cost_index) * 20); // standard daily cost calculation
      const budgetLevel = dailyCost < 50 ? 'Low' : dailyCost < 90 ? 'Medium' : 'High';
      return {
        id: String(r.city_id),
        city_id: r.city_id,
        name: r.name,
        country: r.country,
        region: reg,
        cost_index: parseFloat(r.cost_index),
        popularity_score: r.popularity_score,
        popularity: r.popularity_score,
        dailyCost: dailyCost,
        budgetLevel: budgetLevel,
        suggestedDays: `${Math.max(2, Math.round(r.popularity_score / 25))} – ${Math.max(4, Math.round(r.popularity_score / 18))} days`,
        image: getCityImage(r.name),
        description: `Explore ${r.name}, ${r.country} with world-class attractions, authentic dining, and memorable culture.`,
        tags: ['Culture', 'Sightseeing', 'Food'],
        climate: 'Mild',
        total_activities: r.total_activities,
        is_saved: Boolean(r.is_saved),
      };
    });

    // Client-side region filter if specified
    if (region && region.toLowerCase() !== 'all') {
      formatted = formatted.filter((c) => c.region.toLowerCase().includes(region.toLowerCase()));
    }

    // Budget filter
    if (budget && budget.toLowerCase() !== 'any') {
      formatted = formatted.filter((c) => c.budgetLevel.toLowerCase() === budget.toLowerCase());
    }

    res.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (err) {
    console.error('Error fetching cities:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/cities/saved - Fetch saved destinations for logged-in user
router.get('/saved', async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user?.user_id || 1;

    const [rows] = await pool.query(
      `
      SELECT 
        c.city_id,
        c.name,
        c.country,
        c.cost_index,
        c.popularity_score,
        sd.saved_id
      FROM saved_destinations sd
      JOIN cities c ON c.city_id = sd.city_id
      WHERE sd.user_id = ?
      ORDER BY sd.saved_id DESC
    `,
      [userId],
    );

    const data = rows.map((r) => ({
      id: String(r.city_id),
      city_id: r.city_id,
      name: r.name,
      country: r.country,
      region: getRegion(r.country),
      cost_index: parseFloat(r.cost_index),
      popularity_score: r.popularity_score,
      popularity: r.popularity_score,
      dailyCost: Math.round(parseFloat(r.cost_index) * 20),
      image: getCityImage(r.name),
      is_saved: true,
    }));

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error('Error fetching saved destinations:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/cities/:id/save - Toggle / bookmark city to saved destinations
router.post('/:id/save', async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user?.user_id || 1;
    const cityId = parseInt(req.params.id, 10);

    if (isNaN(cityId)) {
      return res.status(400).json({ success: false, message: 'Invalid city ID' });
    }

    // Check if city exists
    const [city] = await pool.query('SELECT * FROM cities WHERE city_id = ?', [cityId]);
    if (city.length === 0) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }

    // Check if already saved
    const [existing] = await pool.query(
      'SELECT * FROM saved_destinations WHERE user_id = ? AND city_id = ?',
      [userId, cityId],
    );

    if (existing.length > 0) {
      // If already saved, remove it (toggle off)
      await pool.query('DELETE FROM saved_destinations WHERE user_id = ? AND city_id = ?', [
        userId,
        cityId,
      ]);
      return res.json({
        success: true,
        saved: false,
        message: `Removed ${city[0].name} from saved destinations`,
      });
    }

    // Insert to saved
    await pool.query('INSERT INTO saved_destinations (user_id, city_id) VALUES (?, ?)', [
      userId,
      cityId,
    ]);

    res.json({
      success: true,
      saved: true,
      message: `Saved ${city[0].name} to your destinations`,
    });
  } catch (err) {
    console.error('Error toggling saved destination:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/cities/:id/save - Explicitly remove from saved
router.delete('/:id/save', async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user?.user_id || 1;
    const cityId = parseInt(req.params.id, 10);

    await pool.query('DELETE FROM saved_destinations WHERE user_id = ? AND city_id = ?', [
      userId,
      cityId,
    ]);
    res.json({ success: true, saved: false, message: 'Removed from saved destinations' });
  } catch (err) {
    console.error('Error deleting saved destination:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/cities/:id - Get single city details & activities
router.get('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const cityId = parseInt(req.params.id, 10);
    const userId = req.user?.user_id || 1;

    const [rows] = await pool.query(
      `
      SELECT 
        c.*,
        EXISTS(
          SELECT 1 FROM saved_destinations sd 
          WHERE sd.city_id = c.city_id AND sd.user_id = ?
        ) AS is_saved
      FROM cities c
      WHERE c.city_id = ?
    `,
      [userId, cityId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }

    const city = rows[0];

    // Fetch activities for this city
    const [activities] = await pool.query(
      `
      SELECT activity_id, title, type, cost, duration_hours, description, image_url
      FROM activities
      WHERE city_id = ?
      ORDER BY activity_id ASC
    `,
      [cityId],
    );

    const dailyCost = Math.round(parseFloat(city.cost_index) * 20);

    res.json({
      success: true,
      data: {
        id: String(city.city_id),
        city_id: city.city_id,
        name: city.name,
        country: city.country,
        region: getRegion(city.country),
        cost_index: parseFloat(city.cost_index),
        popularity_score: city.popularity_score,
        popularity: city.popularity_score,
        dailyCost: dailyCost,
        budgetLevel: dailyCost < 50 ? 'Low' : dailyCost < 90 ? 'Medium' : 'High',
        suggestedDays: `${Math.max(2, Math.round(city.popularity_score / 25))} – ${Math.max(4, Math.round(city.popularity_score / 18))} days`,
        image: getCityImage(city.name),
        description: `Explore ${city.name}, ${city.country} with world-class attractions, authentic dining, and memorable culture.`,
        tags: ['Culture', 'Sightseeing', 'Food'],
        climate: 'Mild',
        is_saved: Boolean(city.is_saved),
        activities: activities.map((a) => ({
          id: String(a.activity_id),
          activity_id: a.activity_id,
          city_id: cityId,
          title: a.title,
          type: a.type,
          category: a.type.charAt(0).toUpperCase() + a.type.slice(1),
          cost: parseFloat(a.cost),
          duration_hours: a.duration_hours ? parseFloat(a.duration_hours) : 2.0,
          duration: a.duration_hours ? `${parseFloat(a.duration_hours)}h` : '2h',
          description: a.description,
          image_url: a.image_url,
          image: a.image_url || getCityImage(city.name),
        })),
      },
    });
  } catch (err) {
    console.error('Error fetching city details:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/cities - Add new city
router.post('/', async (req, res) => {
  try {
    const pool = getPool();
    const { name, country, cost_index, popularity_score } = req.body;

    if (!name || !country || cost_index === undefined) {
      return res.status(400).json({
        success: false,
        message: 'name, country, and cost_index are required fields',
      });
    }

    const [result] = await pool.query(
      'INSERT INTO cities (name, country, cost_index, popularity_score) VALUES (?, ?, ?, ?)',
      [name, country, parseFloat(cost_index), parseInt(popularity_score || '50', 10)],
    );

    res.status(201).json({
      success: true,
      message: 'City created successfully',
      data: {
        city_id: result.insertId,
        name,
        country,
        cost_index: parseFloat(cost_index),
        popularity_score: parseInt(popularity_score || '50', 10),
      },
    });
  } catch (err) {
    console.error('Error adding city:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
