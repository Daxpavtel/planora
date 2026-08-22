const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '4000', 10),
  user: process.env.DB_USERNAME || process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD ? process.env.DB_PASSWORD.replace(/'/g, "") : '',
  database: process.env.DB_DATABASE || process.env.DB_NAME || 'planora',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  decimalNumbers: true,
  dateStrings: true,
  ssl: {
    rejectUnauthorized: false
  }
};

let pool = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

// Ensure database tables and initial baseline data exist
async function initializeDatabase() {
  try {
    // 1. Create DB if not exists
    const rootConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    await rootConnection.end();

    const p = getPool();

    // 2. Create tables
    await p.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INT(11) AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        profile_photo_url VARCHAR(512) NULL,
        language_preference VARCHAR(50) DEFAULT 'English',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS cities (
        city_id INT(11) AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        country VARCHAR(255) NOT NULL,
        cost_index DECIMAL(3,2) NOT NULL,
        popularity_score INT(11) DEFAULT 0
      );
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS activities (
        activity_id INT(11) AUTO_INCREMENT PRIMARY KEY,
        city_id INT(11) NOT NULL,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        duration_hours DECIMAL(4,2) NULL,
        description TEXT NULL,
        image_url VARCHAR(512) NULL,
        FOREIGN KEY (city_id) REFERENCES cities(city_id) ON DELETE CASCADE
      );
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS trips (
        trip_id INT(11) AUTO_INCREMENT PRIMARY KEY,
        user_id INT(11) NOT NULL,
        trip_name VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        description TEXT NULL,
        cover_photo_url VARCHAR(512) NULL,
        public_share_token VARCHAR(36) NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      );
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS trip_stops (
        stop_id INT(11) AUTO_INCREMENT PRIMARY KEY,
        trip_id INT(11) NOT NULL,
        city_id INT(11) NOT NULL,
        arrival_date DATE NOT NULL,
        departure_date DATE NOT NULL,
        sequence_order INT(11) NOT NULL,
        FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE,
        FOREIGN KEY (city_id) REFERENCES cities(city_id) ON DELETE CASCADE
      );
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS itinerary_activities (
        itinerary_activity_id INT(11) AUTO_INCREMENT PRIMARY KEY,
        stop_id INT(11) NOT NULL,
        activity_id INT(11) NOT NULL,
        scheduled_date DATE NOT NULL,
        sequence_order INT(11) NOT NULL,
        FOREIGN KEY (stop_id) REFERENCES trip_stops(stop_id) ON DELETE CASCADE,
        FOREIGN KEY (activity_id) REFERENCES activities(activity_id) ON DELETE CASCADE
      );
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        expense_id INT(11) AUTO_INCREMENT PRIMARY KEY,
        trip_id INT(11) NOT NULL,
        category ENUM('Transport', 'Stay', 'Activities', 'Meals') NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        expense_date DATE NOT NULL,
        FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE
      );
    `);

    await p.query(`
      CREATE TABLE IF NOT EXISTS saved_destinations (
        saved_id INT(11) AUTO_INCREMENT PRIMARY KEY,
        user_id INT(11) NOT NULL,
        city_id INT(11) NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (city_id) REFERENCES cities(city_id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_city (user_id, city_id)
      );
    `);

    // 3. Seed baseline users if empty
    const [users] = await p.query('SELECT COUNT(*) as count FROM users');
    if (users[0].count === 0) {
      await p.query(`
        INSERT INTO users (user_id, email, password_hash, full_name, profile_photo_url, language_preference)
        VALUES 
        (1, 'yash.mehta@example.com', '$2a$10$wN1rD47wXoOq4s9sK7Hj..KkG3W15kC/a7U/ZqPzUv8XQv9mNlYmC', 'Yash Mehta', '/images/paris.png', 'English');
      `);
    }

    // 4. Seed baseline Indian cities
    const [cityRows] = await p.query('SELECT COUNT(*) as count FROM cities');
    if (cityRows[0].count === 0) {
      await p.query(`
        INSERT INTO cities (city_id, name, country, cost_index, popularity_score)
        VALUES 
        (1, 'Jaipur', 'India', 2.60, 98),
        (2, 'Udaipur', 'India', 2.40, 96),
        (3, 'Varanasi', 'India', 1.80, 94),
        (4, 'Goa', 'India', 3.20, 97),
        (5, 'Mumbai', 'India', 3.80, 95),
        (6, 'Delhi', 'India', 2.80, 96),
        (7, 'Bengaluru', 'India', 3.00, 91),
        (8, 'Kochi', 'India', 2.40, 93),
        (9, 'Manali', 'India', 2.60, 94),
        (10, 'Kolkata', 'India', 1.90, 90),
        (11, 'Agra', 'India', 2.20, 98),
        (12, 'Amritsar', 'India', 1.90, 95);
      `);
    }

    // 5. Seed baseline Indian activities
    const [actRows] = await p.query('SELECT COUNT(*) as count FROM activities');
    if (actRows[0].count === 0) {
      await p.query(`
        INSERT INTO activities (activity_id, city_id, title, type, cost, duration_hours, description, image_url)
        VALUES 
        (1, 1, 'Amber Fort Guided Heritage Walk', 'Heritage', 500.00, 2.50, 'Explore Sheesh Mahal and grand Rajput palace architecture.', 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80'),
        (2, 1, 'Rawat Mishthan Bhandar Pyaaz Kachori & Lassi', 'Food', 180.00, 1.00, 'Crispy onion kachoris and rich clay-pot lassi in Jaipur.', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80'),
        (3, 1, 'Chokhi Dhani Rajasthani Village Feast', 'Food', 1100.00, 3.50, 'Unlimited royal Dal Baati Churma, folk dance, and cultural village show.', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80'),
        (4, 2, 'Lake Pichola Sunset Boat Cruise', 'Sightseeing', 450.00, 1.25, 'Sail past Jag Mandir Island with sunset reflections over Lake Pichola.', 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=600&q=80'),
        (5, 2, 'Udaipur City Palace & Crystal Gallery', 'Heritage', 350.00, 2.50, 'Marvel at peacock mosaics, mirror work galleries, and royal courtyards.', 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=600&q=80'),
        (6, 3, 'Dashashwamedh Ghat Evening Ganga Aarti', 'Spiritual', 300.00, 2.00, 'Witness the grand fire prayer ritual from a boat on the sacred river Ganga.', 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=600&q=80'),
        (7, 3, 'Kashi Street Food & Banarasi Paan Trail', 'Food', 250.00, 2.00, 'Taste legendary Tamatar Chaat, Malaiyo, and sweet Banarasi Paan.', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80'),
        (8, 4, 'Authentic Goan Fish Curry Thali & Bebinca', 'Food', 450.00, 1.50, 'Fresh kingfish curry with kokum, red rice, and multi-layered Bebinca.', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80'),
        (9, 5, 'Girgaon Chowpatty Street Food Safari', 'Food', 220.00, 2.00, 'Authentic Mumbai Vada Pav, buttery Pav Bhaji, Sev Puri, and Kulfi.', 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80'),
        (10, 6, 'Old Delhi Chandni Chowk Food Trail', 'Food', 350.00, 2.50, 'Ghee-fried parathas, succulent kebabs, Jalebi-Rabri and spiced chai.', 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80'),
        (11, 7, 'Vidyarthi Bhavan Crispy Masala Dosa & Filter Kaapi', 'Food', 140.00, 1.25, 'Heritage eatery serving crispy butter masala dosa and filter coffee.', 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80'),
        (12, 12, 'Golden Temple Darshan & Sacred Community Langar', 'Spiritual', 0.00, 3.00, 'Experience peace at Harmandir Sahib and partake in the world’s largest community kitchen.', 'https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?auto=format&fit=crop&w=600&q=80');
      `);
    }

    // 6. Seed a default Indian trip if none exist
    const [tripRows] = await p.query('SELECT COUNT(*) as count FROM trips');
    if (tripRows[0].count === 0) {
      const [tripResult] = await p.query(`
        INSERT INTO trips (user_id, trip_name, start_date, end_date, description, cover_photo_url, public_share_token)
        VALUES 
        (1, 'Royal Rajasthan & Golden Triangle', '2026-10-15', '2026-10-25', 'Grand palaces, lakeside sunset dinners, heritage fort walks and iconic street food.', 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80', 'rajasthan-royal-heritage');
      `);
      const tripId = tripResult.insertId;

      // Add stops: Jaipur, Udaipur
      const [stop1] = await p.query(`
        INSERT INTO trip_stops (trip_id, city_id, arrival_date, departure_date, sequence_order)
        VALUES (${tripId}, 1, '2026-10-15', '2026-10-17', 1);
      `);
      const [stop2] = await p.query(`
        INSERT INTO trip_stops (trip_id, city_id, arrival_date, departure_date, sequence_order)
        VALUES (${tripId}, 2, '2026-10-17', '2026-10-20', 2);
      `);

      // Add activities
      await p.query(`
        INSERT INTO itinerary_activities (stop_id, activity_id, scheduled_date, sequence_order)
        VALUES 
        (${stop1.insertId}, 1, '2026-10-15', 1),
        (${stop1.insertId}, 2, '2026-10-15', 2),
        (${stop1.insertId}, 3, '2026-10-16', 3),
        (${stop2.insertId}, 4, '2026-10-17', 1),
        (${stop2.insertId}, 5, '2026-10-18', 2);
      `);

      // Seed 4-category expenses: Transport, Stay, Activities, Meals
      await p.query(`
        INSERT INTO expenses (trip_id, category, amount, expense_date)
        VALUES 
        (${tripId}, 'Transport', 14200.00, '2026-10-15'),
        (${tripId}, 'Stay', 21500.00, '2026-10-15'),
        (${tripId}, 'Activities', 6800.00, '2026-10-16'),
        (${tripId}, 'Meals', 4800.00, '2026-10-17');
      `);

      // Seed saved destinations
      await p.query(`
        INSERT IGNORE INTO saved_destinations (user_id, city_id)
        VALUES (1, 1), (1, 2);
      `);
    }

    console.log('✅ Database schema and seed data verified successfully.');
  } catch (err) {
    console.error('⚠️ Database initialization error:', err.message);
  }
}

module.exports = {
  getPool,
  initializeDatabase,
};


