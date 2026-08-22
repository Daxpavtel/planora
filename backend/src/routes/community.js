const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');

// In-memory reviews store for community feed enhancement
let communityReviews = [
  { id: 'r1', trip_id: 'c-1', user: 'Sam K.', avatar: 'SK', rating: 5, comment: 'Followed the Paris days step-by-step. Saved us so much time!', date: '2 days ago' },
  { id: 'r2', trip_id: 'c-1', user: 'Yash M.', avatar: 'YM', rating: 5, comment: 'Super well structured and seamless transfer timings.', date: '1 week ago' },
  { id: 'r3', trip_id: 'c-2', user: 'Nina P.', avatar: 'NP', rating: 5, comment: 'Early morning temple walks were magical.', date: '3 days ago' },
];

// GET /api/community/trips - Fetch community shared itineraries
router.get('/trips', async (req, res) => {
  try {
    const pool = getPool();

    // Fetch public trips
    const [trips] = await pool.query(`
      SELECT t.*, u.full_name AS author, u.email
      FROM trips t
      JOIN users u ON u.user_id = t.user_id
      ORDER BY t.trip_id DESC
    `);

    const formatted = trips.map((t, idx) => {
      const tripKey = `c-${t.trip_id}`;
      const revs = communityReviews.filter((r) => r.trip_id === tripKey || r.trip_id === 'c-1');
      const rating = 4.8 + (idx % 3) * 0.1;

      return {
        id: tripKey,
        trip_id: t.trip_id,
        title: t.trip_name,
        author: t.author || 'Aarti Rao',
        authorAvatar: (t.author || 'AR').split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase(),
        authorRole: 'Pro Traveler · 14 trips',
        rating: Number(rating.toFixed(1)),
        reviewsCount: revs.length + 12,
        cover: t.cover_photo_url || '/images/paris.png',
        cities: ['Paris', 'Tokyo', 'Rome'],
        days: 12,
        budget: 2840,
        style: 'Balanced',
        bookmarked: idx % 2 === 0,
        likes: 328 + idx * 15,
        description: t.description || 'A classic route with walk-friendly days, food markets, and night trains.',
        reviews: revs,
      };
    });

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    console.error('Error fetching community trips:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/community/trips/:id/reviews - Add review
router.post('/trips/:id/reviews', (req, res) => {
  const tripId = req.params.id;
  const { rating, comment, user } = req.body;

  if (!comment) {
    return res.status(400).json({ success: false, message: 'Comment is required' });
  }

  const reviewObj = {
    id: `r-${Date.now()}`,
    trip_id: tripId,
    user: user || 'Yash Mehta',
    avatar: 'YM',
    rating: parseInt(rating, 10) || 5,
    comment,
    date: 'Just now',
  };

  communityReviews.unshift(reviewObj);
  res.status(201).json({ success: true, data: reviewObj });
});

module.exports = router;
