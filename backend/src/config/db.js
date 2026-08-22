const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'planora',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  decimalNumbers: true,
  dateStrings: true,
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

    // 4. Seed baseline cities from PDF if empty
    const [cityRows] = await p.query('SELECT COUNT(*) as count FROM cities');
    if (cityRows[0].count === 0) {
      await p.query(`
        INSERT INTO cities (city_id, name, country, cost_index, popularity_score)
        VALUES 
        (1, 'Paris', 'France', 4.50, 95),
        (2, 'Tokyo', 'Japan', 4.00, 92),
        (3, 'Rome', 'Italy', 3.80, 88),
        (4, 'Bangkok', 'Thailand', 2.50, 96),
        (5, 'New York City', 'USA', 5.00, 94);
      `);
    }

    // 5. Seed baseline activities from PDF if empty
    const [actRows] = await p.query('SELECT COUNT(*) as count FROM activities');
    if (actRows[0].count === 0) {
      await p.query(`
        INSERT INTO activities (activity_id, city_id, title, type, cost, duration_hours, description, image_url)
        VALUES 
        (1, 1, 'Eiffel Tower Summit Tour', 'sightseeing', 35.00, 2.50, 'Skip-the-line guided tour to the top of the iconic Eiffel Tower.', '/uploads/act_6a893338c17ac3.48635009.jpeg'),
        (2, 1, 'Seine River Dinner Cruise', 'food tours', 85.00, 3.00, 'Enjoy a romantic multi-course French dinner while cruising the Seine at sunset.', '/uploads/act_6a8934ce631a20.56796200.jpeg'),
        (3, 1, 'Louvre Museum Entry', 'sightseeing', 20.00, 4.00, 'Access the world-renowned Louvre to see the Mona Lisa and classical sculptures.', '/uploads/act_6a893523923fa7.30896839.jpeg'),
        (8, 2, 'Tsukiji Market Sushi Tour', 'food tours', 45.00, 3.00, 'Taste fresh local street food and premium sushi at the historic outer market.', '/uploads/act_6a893faa0ee745.49346684.jpg'),
        (9, 2, 'Mount Fuji Day Trip', 'adventure', 120.00, 10.00, 'Full-day excursion to view Mount Fuji, including a stop at Lake Kawaguchi.', '/uploads/act_6a893fea3becd9.50152812.jpg'),
        (10, 2, 'Senso-ji Temple Visit', 'sightseeing', 12.00, 1.50, 'Explore Tokyo’s oldest Buddhist temple and the bustling Nakamise shopping street.', '/uploads/act_6a89401552f258.24179289.jpeg'),
        (11, 3, 'Colosseum Underground', 'sightseeing', 55.00, 1.00, 'Exclusive access to the Colosseum arena floor and underground gladiator tunnels.', '/uploads/act_6a8940502d8bd8.57504743.jpg'),
        (12, 3, 'Authentic Pasta Making Class', 'food tours', 65.00, 2.00, 'Learn to make traditional Italian pasta from scratch with a local chef.', '/uploads/act_6a894073c81881.06023112.jpg'),
        (13, 4, 'Grand Palace Tour', 'sightseeing', 25.00, 3.00, 'Visit the stunning Grand Palace complex and the Temple of the Emerald Buddha.', '/uploads/act_6a894098ec6067.30870775.jpg'),
        (14, 4, 'Ayutthaya Ruins Excursion', 'adventure', 40.00, 1.50, 'Explore the ancient, UNESCO-listed temple ruins of the former Siamese capital.', '/uploads/act_6a8940be48e8f6.18688898.jpg'),
        (15, 5, 'Statue of Liberty Cruise', 'sightseeing', 30.00, 1.50, 'Ferry ride to Liberty Island with spectacular views of the Manhattan skyline.', '/uploads/act_6a8940dd604f65.07023522.jpg'),
        (16, 5, 'Broadway Show Ticket', 'entertainment', 150.00, 3.00, 'Premium seating for a world-class theatrical performance on Broadway.', '/uploads/act_6a894107d61c00.29570705.jpg');
      `);
    }

    // 6. Seed a default trip if none exist
    const [tripRows] = await p.query('SELECT COUNT(*) as count FROM trips');
    if (tripRows[0].count === 0) {
      const [tripResult] = await p.query(`
        INSERT INTO trips (user_id, trip_name, start_date, end_date, description, cover_photo_url, public_share_token)
        VALUES 
        (1, 'European Summer Escape', '2026-06-12', '2026-06-24', 'Three capitals, slow mornings, gallery afternoons and long dinners.', '/images/paris.png', 'european-summer-escape');
      `);
      const tripId = tripResult.insertId;

      // Add stops: Paris, Tokyo, Rome
      const [stop1] = await p.query(`
        INSERT INTO trip_stops (trip_id, city_id, arrival_date, departure_date, sequence_order)
        VALUES (${tripId}, 1, '2026-06-12', '2026-06-16', 1);
      `);
      const [stop2] = await p.query(`
        INSERT INTO trip_stops (trip_id, city_id, arrival_date, departure_date, sequence_order)
        VALUES (${tripId}, 3, '2026-06-16', '2026-06-20', 2);
      `);

      // Add activities
      await p.query(`
        INSERT INTO itinerary_activities (stop_id, activity_id, scheduled_date, sequence_order)
        VALUES 
        (${stop1.insertId}, 1, '2026-06-12', 1),
        (${stop1.insertId}, 2, '2026-06-13', 2),
        (${stop1.insertId}, 3, '2026-06-14', 3),
        (${stop2.insertId}, 11, '2026-06-17', 1),
        (${stop2.insertId}, 12, '2026-06-18', 2);
      `);

      // Seed 4-category expenses: Transport, Stay, Activities, Meals
      await p.query(`
        INSERT INTO expenses (trip_id, category, amount, expense_date)
        VALUES 
        (${tripId}, 'Transport', 742.00, '2026-06-12'),
        (${tripId}, 'Stay', 1080.00, '2026-06-12'),
        (${tripId}, 'Activities', 486.00, '2026-06-13'),
        (${tripId}, 'Meals', 402.00, '2026-06-14');
      `);

      // Seed saved destination
      await p.query(`
        INSERT IGNORE INTO saved_destinations (user_id, city_id)
        VALUES (1, 2), (1, 3);
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
