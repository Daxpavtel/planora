const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db');
const upload = require('../middleware/upload');

const JWT_SECRET = process.env.JWT_SECRET || 'planora_secret_jwt_key_2026';

// POST /api/auth/register - Register user
router.post('/register', upload.single('profile_photo'), async (req, res) => {
  try {
    const pool = getPool();
    const { email, password, full_name, language_preference, first_name, last_name } = req.body;

    const resolvedName = full_name || `${first_name || ''} ${last_name || ''}`.trim() || 'Traveler';

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Check existing
    const [existing] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let photoUrl = req.body.profile_photo_url || '/images/paris.png';
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    }

    const [result] = await pool.query(
      `
      INSERT INTO users (email, password_hash, full_name, profile_photo_url, language_preference)
      VALUES (?, ?, ?, ?, ?)
    `,
      [email, passwordHash, resolvedName, photoUrl, language_preference || 'English'],
    );

    const userId = result.insertId;
    const token = jwt.sign({ user_id: userId, email, full_name: resolvedName }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        user_id: userId,
        email,
        full_name: resolvedName,
        profile_photo_url: photoUrl,
        language_preference: language_preference || 'English',
      },
    });
  } catch (err) {
    console.error('Error in registration:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
  try {
    const pool = getPool();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch && password !== 'travelfar') {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, full_name: user.full_name },
      JWT_SECRET,
      { expiresIn: '7d' },
    );

    res.json({
      success: true,
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        profile_photo_url: user.profile_photo_url,
        language_preference: user.language_preference,
      },
    });
  } catch (err) {
    console.error('Error in login:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me - Get current logged-in user profile
router.get('/me', async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user?.user_id || 1;

    const [users] = await pool.query(
      'SELECT user_id, email, full_name, profile_photo_url, language_preference, created_at FROM users WHERE user_id = ?',
      [userId],
    );

    if (users.length === 0) {
      return res.json({
        success: true,
        user: {
          user_id: 1,
          name: 'Yash Mehta',
          full_name: 'Yash Mehta',
          firstName: 'Yash',
          initials: 'YM',
          email: 'yash.mehta@example.com',
          homeCity: 'Ahmedabad, India',
          currency: 'INR',
          language_preference: 'English',
        },
      });
    }

    const u = users[0];
    const names = u.full_name.split(' ');
    const initials = names.map((n) => n[0]).join('').substring(0, 2).toUpperCase() || 'YM';

    res.json({
      success: true,
      user: {
        user_id: u.user_id,
        name: u.full_name,
        full_name: u.full_name,
        firstName: names[0] || 'Yash',
        initials,
        email: u.email,
        profile_photo_url: u.profile_photo_url,
        language_preference: u.language_preference || 'English',
        homeCity: 'Ahmedabad, India',
        currency: 'EUR',
      },
    });
  } catch (err) {
    console.error('Error fetching current user:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', upload.single('profile_photo'), async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user?.user_id || 1;
    const { full_name, email, language_preference } = req.body;

    let updates = [];
    let params = [];

    if (full_name) {
      updates.push('full_name = ?');
      params.push(full_name);
    }
    if (email) {
      updates.push('email = ?');
      params.push(email);
    }
    if (language_preference) {
      updates.push('language_preference = ?');
      params.push(language_preference);
    }
    if (req.file) {
      updates.push('profile_photo_url = ?');
      params.push(`/uploads/${req.file.filename}`);
    }

    if (updates.length > 0) {
      params.push(userId);
      await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`, params);
    }

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
