const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');

// GET /api/trips/:id/budget - Strict 4-Bucket Budget Categorization
router.get('/trips/:id/budget', async (req, res) => {
  try {
    const pool = getPool();
    const tripId = parseInt(req.params.id, 10);

    if (isNaN(tripId)) {
      return res.status(400).json({ success: false, message: 'Invalid trip ID' });
    }

    // 1. Fetch trip
    const [trips] = await pool.query('SELECT * FROM trips WHERE trip_id = ?', [tripId]);
    if (trips.length === 0) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    const trip = trips[0];

    // 2. Fetch recorded expenses
    const [expenseRows] = await pool.query(
      `
      SELECT expense_id, category, amount, expense_date
      FROM expenses
      WHERE trip_id = ?
      ORDER BY expense_date ASC, expense_id ASC
    `,
      [tripId],
    );

    // 3. Fetch stops and activities to calculate dynamic estimates if needed
    const [stops] = await pool.query(
      `
      SELECT ts.*, c.name AS city_name, c.cost_index
      FROM trip_stops ts
      JOIN cities c ON c.city_id = ts.city_id
      WHERE ts.trip_id = ?
      ORDER BY ts.sequence_order ASC
    `,
      [tripId],
    );

    const [scheduledActivities] = await pool.query(
      `
      SELECT ia.*, a.title, a.cost, a.type, c.name AS city_name
      FROM itinerary_activities ia
      JOIN trip_stops ts ON ts.stop_id = ia.stop_id
      JOIN activities a ON a.activity_id = ia.activity_id
      JOIN cities c ON c.city_id = a.city_id
      WHERE ts.trip_id = ?
      ORDER BY ia.scheduled_date ASC, ia.sequence_order ASC
    `,
      [tripId],
    );

    // Strict 4 buckets calculation
    const categoryTotals = {
      Transport: 0,
      Stay: 0,
      Activities: 0,
      Meals: 0,
    };

    // Calculate from DB expenses table
    if (expenseRows.length > 0) {
      for (const row of expenseRows) {
        const amt = parseFloat(row.amount);
        const cat = row.category;
        if (categoryTotals[cat] !== undefined) {
          categoryTotals[cat] += amt;
        } else if (cat === 'Stays') {
          categoryTotals.Stay += amt;
        } else {
          categoryTotals.Activities += amt;
        }
      }
    } else {
      // Automatic baseline estimation based on trip stops & activities
      const totalDays = Math.max(
        1,
        Math.round(
          (new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      );

      const activityCostSum = scheduledActivities.reduce((sum, a) => sum + parseFloat(a.cost), 0);
      categoryTotals.Activities = Math.round(activityCostSum > 0 ? activityCostSum * 2 : 486);
      categoryTotals.Transport = Math.round(stops.length * 150 + 140);
      categoryTotals.Stay = Math.round(totalDays * 90);
      categoryTotals.Meals = Math.round(totalDays * 45);
    }

    const totalSpent =
      categoryTotals.Transport +
      categoryTotals.Stay +
      categoryTotals.Activities +
      categoryTotals.Meals;

    const targetBudget = Math.round(totalSpent * 1.15);
    const remainingBudget = targetBudget - totalSpent;

    // Format strictly for Recharts & UI
    const budgetByCategory = [
      { category: 'Transport', amount: categoryTotals.Transport, fill: 'var(--chart-1)' },
      { category: 'Stay', amount: categoryTotals.Stay, fill: 'var(--chart-2)' },
      { category: 'Activities', amount: categoryTotals.Activities, fill: 'var(--chart-3)' },
      { category: 'Meals', amount: categoryTotals.Meals, fill: 'var(--chart-4)' },
    ];

    // Build daily spend
    const dailySpendMap = new Map();
    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);
    let cur = new Date(startDate);

    while (cur <= endDate) {
      const dStr = cur.toISOString().split('T')[0];
      const label = cur.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailySpendMap.set(dStr, { day: label, date: dStr, amount: 0 });
      cur.setDate(cur.getDate() + 1);
    }

    for (const exp of expenseRows) {
      const dStr = String(exp.expense_date);
      if (dailySpendMap.has(dStr)) {
        dailySpendMap.get(dStr).amount += parseFloat(exp.amount);
      }
    }

    // If daily spend amounts are 0, distribute gracefully for visualization
    const dailySpend = Array.from(dailySpendMap.values());
    const hasDaily = dailySpend.some((d) => d.amount > 0);
    if (!hasDaily && dailySpend.length > 0) {
      const basePerDay = Math.round(totalSpent / dailySpend.length);
      dailySpend.forEach((d, i) => {
        d.amount = Math.round(basePerDay * (0.8 + ((i % 3) * 0.25)));
      });
    }

    // Budget by city
    const budgetByCity = stops.map((stop) => {
      const start = new Date(stop.arrival_date);
      const end = new Date(stop.departure_date);
      const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      const citySpend = Math.round((totalSpent / (stops.length || 1)));
      return {
        city: stop.city_name,
        nights,
        amount: citySpend,
        share: Math.round((citySpend / (totalSpent || 1)) * 100),
      };
    });

    res.json({
      success: true,
      data: {
        trip_id: trip.trip_id,
        trip_name: trip.trip_name,
        target_budget: targetBudget,
        total_spent: totalSpent,
        remaining_budget: remainingBudget,
        percentage_used: Math.round((totalSpent / (targetBudget || 1)) * 100),
        categories: categoryTotals,
        budgetByCategory,
        dailySpend,
        budgetByCity,
      },
    });
  } catch (err) {
    console.error('Error calculating budget:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/trips/:id/expenses - List all expenses for a trip
router.get('/trips/:id/expenses', async (req, res) => {
  try {
    const pool = getPool();
    const tripId = parseInt(req.params.id, 10);

    const [rows] = await pool.query(
      `
      SELECT e.*, t.trip_name
      FROM expenses e
      JOIN trips t ON t.trip_id = e.trip_id
      WHERE e.trip_id = ?
      ORDER BY e.expense_date DESC, e.expense_id DESC
    `,
      [tripId],
    );

    const formatted = rows.map((r) => ({
      id: `e-${r.expense_id}`,
      expense_id: r.expense_id,
      trip_id: r.trip_id,
      item: `${r.category} Expense`,
      category: r.category,
      day: new Date(r.expense_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      expense_date: r.expense_date,
      amount: parseFloat(r.amount),
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/trips/:id/expenses - Add an expense
router.post('/trips/:id/expenses', async (req, res) => {
  try {
    const pool = getPool();
    const tripId = parseInt(req.params.id, 10);
    const { category, amount, expense_date } = req.body;

    const validCategories = ['Transport', 'Stay', 'Activities', 'Meals'];
    let cat = category;
    if (cat === 'Stays') cat = 'Stay';
    if (!validCategories.includes(cat)) {
      return res.status(400).json({
        success: false,
        message: `Category must strictly be one of: Transport, Stay, Activities, Meals`,
      });
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive amount required' });
    }

    const dateVal = expense_date || new Date().toISOString().split('T')[0];

    const [result] = await pool.query(
      `
      INSERT INTO expenses (trip_id, category, amount, expense_date)
      VALUES (?, ?, ?, ?)
    `,
      [tripId, cat, parseFloat(amount), dateVal],
    );

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      data: {
        expense_id: result.insertId,
        trip_id: tripId,
        category: cat,
        amount: parseFloat(amount),
        expense_date: dateVal,
      },
    });
  } catch (err) {
    console.error('Error adding expense:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/expenses/:id - Delete an expense
router.delete('/expenses/:id', async (req, res) => {
  try {
    const pool = getPool();
    const expenseId = parseInt(req.params.id, 10);

    await pool.query('DELETE FROM expenses WHERE expense_id = ?', [expenseId]);
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
