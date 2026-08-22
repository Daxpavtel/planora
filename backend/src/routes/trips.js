const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');
const upload = require('../middleware/upload');

// Helper to calculate date label
function formatDateRange(startStr, endStr) {
  if (!startStr || !endStr) return '';
  const s = new Date(startStr);
  const e = new Date(endStr);
  const sDay = s.getDate();
  const sMonth = s.toLocaleDateString('en-US', { month: 'short' });
  const eDay = e.getDate();
  const eMonth = e.toLocaleDateString('en-US', { month: 'short' });
  const eYear = e.getFullYear();

  if (sMonth === eMonth) {
    return `${sDay} – ${eDay} ${eMonth} ${eYear}`;
  }
  return `${sDay} ${sMonth} – ${eDay} ${eMonth} ${eYear}`;
}

// Helper to determine status
function getTripStatus(startStr, endStr) {
  const now = new Date();
  const s = new Date(startStr);
  const e = new Date(endStr);

  if (now >= s && now <= e) return 'ongoing';
  if (now > e) return 'completed';
  return 'upcoming';
}

// GET /api/trips - List user trips
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user?.user_id || 1;

    const [trips] = await pool.query(
      `
      SELECT 
        t.*,
        u.full_name AS owner_name,
        u.email AS owner_email
      FROM trips t
      JOIN users u ON u.user_id = t.user_id
      WHERE t.user_id = ?
      ORDER BY t.start_date DESC
    `,
      [userId],
    );

    const formattedTrips = await Promise.all(
      trips.map(async (t) => {
        // Fetch stops for this trip
        const [stops] = await pool.query(
          `
          SELECT ts.*, c.name AS city_name, c.country AS city_country
          FROM trip_stops ts
          JOIN cities c ON c.city_id = ts.city_id
          WHERE ts.trip_id = ?
          ORDER BY ts.sequence_order ASC
        `,
          [t.trip_id],
        );

        // Fetch expenses sum
        const [expenses] = await pool.query(
          'SELECT COALESCE(SUM(amount), 0) AS total_spent FROM expenses WHERE trip_id = ?',
          [t.trip_id],
        );
        const spent = parseFloat(expenses[0].total_spent) || 1200;

        // Fetch activities count
        const [acts] = await pool.query(
          `
          SELECT COUNT(*) AS act_count 
          FROM itinerary_activities ia
          JOIN trip_stops ts ON ts.stop_id = ia.stop_id
          WHERE ts.trip_id = ?
        `,
          [t.trip_id],
        );
        const actCount = acts[0].act_count || 0;

        const cityNames = stops.map((s) => s.city_name);
        const status = getTripStatus(t.start_date, t.end_date);
        const estimatedBudget = Math.round(spent * 1.15);
        const progress = Math.min(100, Math.max(20, Math.round(actCount * 18 + 25)));

        return {
          id: String(t.trip_id),
          trip_id: t.trip_id,
          name: t.trip_name,
          trip_name: t.trip_name,
          cover: t.cover_photo_url || '/images/paris.png',
          cover_photo_url: t.cover_photo_url,
          start: t.start_date,
          end: t.end_date,
          start_date: t.start_date,
          end_date: t.end_date,
          dateLabel: formatDateRange(t.start_date, t.end_date),
          cities: cityNames.length > 0 ? cityNames : ['Paris'],
          stops: stops,
          travellers: 2,
          estimated: spent,
          budget: estimatedBudget,
          progress: progress,
          status: status,
          style: 'Balanced',
          summary: t.description || 'Explore scenic cities and local culture.',
          description: t.description,
          public_share_token: t.public_share_token,
          collaborators: ['YM', 'AR'],
        };
      }),
    );

    res.json({
      success: true,
      count: formattedTrips.length,
      data: formattedTrips,
    });
  } catch (err) {
    console.error('Error fetching trips:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/trips/:id - Get full trip details with stops & itinerary days
router.get('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const tripIdParam = req.params.id;

    let tripQuery = 'SELECT * FROM trips WHERE trip_id = ? OR public_share_token = ?';
    let [tripRows] = await pool.query(tripQuery, [parseInt(tripIdParam, 10) || 0, tripIdParam]);

    if (tripRows.length === 0) {
      // Fallback to first available trip if requested ID does not exist
      const [all] = await pool.query('SELECT * FROM trips LIMIT 1');
      if (all.length > 0) {
        tripRows = all;
      } else {
        return res.status(404).json({ success: false, message: 'Trip not found' });
      }
    }

    const t = tripRows[0];
    const tripId = t.trip_id;

    // 1. Fetch stops
    const [stops] = await pool.query(
      `
      SELECT ts.*, c.name AS city_name, c.country AS city_country, c.cost_index
      FROM trip_stops ts
      JOIN cities c ON c.city_id = ts.city_id
      WHERE ts.trip_id = ?
      ORDER BY ts.sequence_order ASC
    `,
      [tripId],
    );

    // 2. Fetch scheduled activities
    const [scheduledActs] = await pool.query(
      `
      SELECT 
        ia.itinerary_activity_id,
        ia.stop_id,
        ia.activity_id,
        ia.scheduled_date,
        ia.sequence_order,
        a.title,
        a.type,
        a.cost,
        a.duration_hours,
        a.description,
        a.image_url,
        c.name AS city_name
      FROM itinerary_activities ia
      JOIN trip_stops ts ON ts.stop_id = ia.stop_id
      JOIN activities a ON a.activity_id = ia.activity_id
      JOIN cities c ON c.city_id = a.city_id
      WHERE ts.trip_id = ?
      ORDER BY ia.scheduled_date ASC, ia.sequence_order ASC
    `,
      [tripId],
    );

    // 3. Build day-by-day itinerary
    const startDate = new Date(t.start_date);
    const endDate = new Date(t.end_date);
    const itineraryDays = [];
    let cur = new Date(startDate);
    let dayNum = 1;

    while (cur <= endDate) {
      const dateStr = cur.toISOString().split('T')[0];
      const dateFormatted = cur.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });

      // Find which city stop this date belongs to
      const activeStop = stops.find((s) => {
        const arr = new Date(s.arrival_date);
        const dep = new Date(s.departure_date);
        return cur >= arr && cur <= dep;
      }) || stops[0] || { city_name: 'Paris', stop_id: 1 };

      const dayActivities = scheduledActs
        .filter((a) => a.scheduled_date === dateStr)
        .map((a, idx) => ({
          id: `ia-${a.itinerary_activity_id}`,
          itinerary_activity_id: a.itinerary_activity_id,
          stop_id: a.stop_id,
          activity_id: a.activity_id,
          slot: idx === 0 ? 'Morning' : idx === 1 ? 'Afternoon' : 'Evening',
          time: idx === 0 ? '09:30' : idx === 1 ? '14:00' : '19:30',
          title: a.title,
          category: a.type ? a.type.charAt(0).toUpperCase() + a.type.slice(1) : 'Sightseeing',
          duration: a.duration_hours ? `${parseFloat(a.duration_hours)}h` : '2h',
          cost: parseFloat(a.cost),
          location: `${a.city_name} Central`,
          booked: idx % 2 === 0,
        }));

      itineraryDays.push({
        id: `day-${dayNum}`,
        label: `Day ${dayNum}`,
        date: dateFormatted,
        date_iso: dateStr,
        city: activeStop.city_name,
        stop_id: activeStop.stop_id,
        travelNote:
          dayNum === 3
            ? 'Vande Bharat Express connection · 3h 20m · ₹1,250'
            : dayNum === 5
            ? 'Express transfer · 1h 25m · ₹2,450'
            : undefined,
        activities: dayActivities,
      });

      cur.setDate(cur.getDate() + 1);
      dayNum++;
    }

    // 4. Fetch unscheduled pool
    const [allActivities] = await pool.query(
      `
      SELECT a.*, c.name AS city_name
      FROM activities a
      JOIN cities c ON c.city_id = a.city_id
      WHERE a.activity_id NOT IN (
        SELECT ia.activity_id 
        FROM itinerary_activities ia
        JOIN trip_stops ts ON ts.stop_id = ia.stop_id
        WHERE ts.trip_id = ?
      )
      LIMIT 6
    `,
      [tripId],
    );

    const unscheduled = allActivities.map((a) => ({
      id: `u-${a.activity_id}`,
      activity_id: a.activity_id,
      title: a.title,
      city: a.city_name,
      cost: parseFloat(a.cost),
      duration: a.duration_hours ? `${parseFloat(a.duration_hours)}h` : '2h',
    }));

    const cityNames = stops.map((s) => s.city_name);
    const dateLabel = formatDateRange(t.start_date, t.end_date);

    res.json({
      success: true,
      data: {
        id: String(t.trip_id),
        trip_id: t.trip_id,
        name: t.trip_name,
        trip_name: t.trip_name,
        cover: t.cover_photo_url || '/images/paris.png',
        cover_photo_url: t.cover_photo_url,
        start: t.start_date,
        end: t.end_date,
        start_date: t.start_date,
        end_date: t.end_date,
        dateLabel: dateLabel,
        cities: cityNames.length > 0 ? cityNames : ['Paris'],
        stops: stops,
        travellers: 3,
        estimated: 2840,
        budget: 3200,
        progress: 68,
        status: getTripStatus(t.start_date, t.end_date),
        style: 'Balanced',
        summary: t.description || 'Three capitals, slow mornings, gallery afternoons and long dinners.',
        description: t.description,
        public_share_token: t.public_share_token,
        collaborators: ['YM', 'AR', 'SK'],
        itinerary: itineraryDays,
        unscheduled: unscheduled,
      },
    });
  } catch (err) {
    console.error('Error fetching trip details:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/trips - Create new trip
router.post('/', upload.single('cover_image'), async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user?.user_id || 1;
    const { trip_name, start_date, end_date, description, stops, style } = req.body;

    if (!trip_name || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'trip_name, start_date, and end_date are required',
      });
    }

    let coverPhotoUrl = req.body.cover_photo_url || '/images/paris.png';
    if (req.file) {
      coverPhotoUrl = `/uploads/${req.file.filename}`;
    }

    const shareToken = `trip-${Date.now()}`;

    const [tripResult] = await pool.query(
      `
      INSERT INTO trips (user_id, trip_name, start_date, end_date, description, cover_photo_url, public_share_token)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [userId, trip_name, start_date, end_date, description || null, coverPhotoUrl, shareToken],
    );

    const newTripId = tripResult.insertId;

    // Insert stops if provided
    let stopList = [];
    if (stops) {
      try {
        stopList = typeof stops === 'string' ? JSON.parse(stops) : stops;
      } catch (e) {
        stopList = [];
      }
    }

    if (Array.isArray(stopList) && stopList.length > 0) {
      for (let i = 0; i < stopList.length; i++) {
        const item = stopList[i];
        let cityId = typeof item === 'number' ? item : item.city_id;

        // If passed as string like "lisbon", find ID
        if (typeof item === 'string' && isNaN(parseInt(item, 10))) {
          const [c] = await pool.query('SELECT city_id FROM cities WHERE LOWER(name) LIKE ?', [
            `%${item.toLowerCase()}%`,
          ]);
          cityId = c.length > 0 ? c[0].city_id : 1;
        } else if (typeof item === 'string') {
          cityId = parseInt(item, 10);
        }

        if (cityId) {
          await pool.query(
            `
            INSERT INTO trip_stops (trip_id, city_id, arrival_date, departure_date, sequence_order)
            VALUES (?, ?, ?, ?, ?)
          `,
            [newTripId, cityId, start_date, end_date, i + 1],
          );
        }
      }
    } else {
      // Default stop
      await pool.query(
        `
        INSERT INTO trip_stops (trip_id, city_id, arrival_date, departure_date, sequence_order)
        VALUES (?, 1, ?, ?, 1)
      `,
        [newTripId, start_date, end_date],
      );
    }

    // Initialize baseline 4-bucket expenses for budget calculation
    await pool.query(
      `
      INSERT INTO expenses (trip_id, category, amount, expense_date)
      VALUES 
      (?, 'Transport', 250.00, ?),
      (?, 'Stay', 450.00, ?),
      (?, 'Activities', 180.00, ?),
      (?, 'Meals', 200.00, ?)
    `,
      [newTripId, start_date, newTripId, start_date, newTripId, start_date, newTripId, start_date],
    );

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: {
        trip_id: newTripId,
        id: String(newTripId),
        trip_name,
        start_date,
        end_date,
        description,
        cover_photo_url: coverPhotoUrl,
        public_share_token: shareToken,
      },
    });
  } catch (err) {
    console.error('Error creating trip:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/trips/:id - Update trip
router.put('/:id', upload.single('cover_image'), async (req, res) => {
  try {
    const pool = getPool();
    const tripId = parseInt(req.params.id, 10);
    const { trip_name, start_date, end_date, description } = req.body;

    let updates = [];
    let params = [];

    if (trip_name) {
      updates.push('trip_name = ?');
      params.push(trip_name);
    }
    if (start_date) {
      updates.push('start_date = ?');
      params.push(start_date);
    }
    if (end_date) {
      updates.push('end_date = ?');
      params.push(end_date);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (req.file) {
      updates.push('cover_photo_url = ?');
      params.push(`/uploads/${req.file.filename}`);
    }

    if (updates.length > 0) {
      params.push(tripId);
      await pool.query(`UPDATE trips SET ${updates.join(', ')} WHERE trip_id = ?`, params);
    }

    res.json({ success: true, message: 'Trip updated successfully' });
  } catch (err) {
    console.error('Error updating trip:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/trips/:id - Delete trip
router.delete('/:id', async (req, res) => {
  try {
    const pool = getPool();
    const tripId = parseInt(req.params.id, 10);

    await pool.query('DELETE FROM trips WHERE trip_id = ?', [tripId]);
    res.json({ success: true, message: 'Trip deleted successfully' });
  } catch (err) {
    console.error('Error deleting trip:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/trips/:id/stops - Add city stop
router.post('/:id/stops', async (req, res) => {
  try {
    const pool = getPool();
    const tripId = parseInt(req.params.id, 10);
    const { city_id, arrival_date, departure_date, sequence_order } = req.body;

    if (!city_id) {
      return res.status(400).json({ success: false, message: 'city_id is required' });
    }

    const [trip] = await pool.query('SELECT * FROM trips WHERE trip_id = ?', [tripId]);
    if (trip.length === 0) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    const [maxSeq] = await pool.query(
      'SELECT COALESCE(MAX(sequence_order), 0) AS max_s FROM trip_stops WHERE trip_id = ?',
      [tripId],
    );
    const seq = sequence_order || maxSeq[0].max_s + 1;

    const arrDate = arrival_date || trip[0].start_date;
    const depDate = departure_date || trip[0].end_date;

    const [result] = await pool.query(
      `
      INSERT INTO trip_stops (trip_id, city_id, arrival_date, departure_date, sequence_order)
      VALUES (?, ?, ?, ?, ?)
    `,
      [tripId, parseInt(city_id, 10), arrDate, depDate, seq],
    );

    res.status(201).json({
      success: true,
      message: 'Stop added to trip',
      data: { stop_id: result.insertId, trip_id: tripId, city_id, sequence_order: seq },
    });
  } catch (err) {
    console.error('Error adding stop:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/trips/:id/stops/reorder - Reorder stops
router.put('/:id/stops/reorder', async (req, res) => {
  try {
    const pool = getPool();
    const tripId = parseInt(req.params.id, 10);
    const { order } = req.body; // Array of stop_ids in desired order

    if (!Array.isArray(order)) {
      return res.status(400).json({ success: false, message: 'order must be an array of stop IDs' });
    }

    for (let i = 0; i < order.length; i++) {
      const stopId = parseInt(order[i], 10);
      await pool.query(
        'UPDATE trip_stops SET sequence_order = ? WHERE stop_id = ? AND trip_id = ?',
        [i + 1, stopId, tripId],
      );
    }

    res.json({ success: true, message: 'Stops reordered successfully' });
  } catch (err) {
    console.error('Error reordering stops:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/trips/:id/stops/:stopId - Remove stop
router.delete('/:id/stops/:stopId', async (req, res) => {
  try {
    const pool = getPool();
    const tripId = parseInt(req.params.id, 10);
    const stopId = parseInt(req.params.stopId, 10);

    await pool.query('DELETE FROM trip_stops WHERE stop_id = ? AND trip_id = ?', [stopId, tripId]);
    res.json({ success: true, message: 'Stop removed from trip' });
  } catch (err) {
    console.error('Error removing stop:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/trips/:id/activities - Schedule activity to a stop
router.post('/:id/activities', async (req, res) => {
  try {
    const pool = getPool();
    const tripId = parseInt(req.params.id, 10);
    const { stop_id, activity_id, scheduled_date, sequence_order } = req.body;

    if (!activity_id) {
      return res.status(400).json({ success: false, message: 'activity_id is required' });
    }

    let targetStopId = stop_id;
    if (!targetStopId) {
      const [stops] = await pool.query(
        'SELECT stop_id FROM trip_stops WHERE trip_id = ? ORDER BY sequence_order ASC LIMIT 1',
        [tripId],
      );
      if (stops.length === 0) {
        // create default stop
        const [c] = await pool.query('SELECT city_id FROM activities WHERE activity_id = ?', [
          activity_id,
        ]);
        const cityId = c.length > 0 ? c[0].city_id : 1;
        const [ns] = await pool.query(
          'INSERT INTO trip_stops (trip_id, city_id, arrival_date, departure_date, sequence_order) VALUES (?, ?, CURRENT_DATE, CURRENT_DATE + INTERVAL 5 DAY, 1)',
          [tripId, cityId],
        );
        targetStopId = ns.insertId;
      } else {
        targetStopId = stops[0].stop_id;
      }
    }

    const dateVal = scheduled_date || new Date().toISOString().split('T')[0];
    const seq = sequence_order || 1;

    const [result] = await pool.query(
      `
      INSERT INTO itinerary_activities (stop_id, activity_id, scheduled_date, sequence_order)
      VALUES (?, ?, ?, ?)
    `,
      [targetStopId, parseInt(activity_id, 10), dateVal, seq],
    );

    res.status(201).json({
      success: true,
      message: 'Activity scheduled successfully',
      data: {
        itinerary_activity_id: result.insertId,
        stop_id: targetStopId,
        activity_id,
        scheduled_date: dateVal,
        sequence_order: seq,
      },
    });
  } catch (err) {
    console.error('Error scheduling activity:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/trips/:id/activities/:itineraryActivityId - Unschedule activity
router.delete('/:id/activities/:itineraryActivityId', async (req, res) => {
  try {
    const pool = getPool();
    const actId = parseInt(req.params.itineraryActivityId.replace('ia-', ''), 10);

    await pool.query('DELETE FROM itinerary_activities WHERE itinerary_activity_id = ?', [actId]);
    res.json({ success: true, message: 'Activity unscheduled' });
  } catch (err) {
    console.error('Error unscheduling activity:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
