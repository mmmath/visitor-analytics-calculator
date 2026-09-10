const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const geoip = require('geoip-lite');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialize SQLite Database
const db = new sqlite3.Database('./data.db', (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS visitor_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip_address TEXT NOT NULL,
      country TEXT,
      city TEXT,
      timezone TEXT,
      latitude REAL,
      longitude REAL,
      user_agent TEXT,
      visit_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS calculations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visitor_ip TEXT NOT NULL,
      calculator_type TEXT NOT NULL,
      input_data TEXT NOT NULL,
      result TEXT NOT NULL,
      calculation_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(visitor_ip) REFERENCES visitor_sessions(ip_address)
    )
  `);

  console.log('Database tables initialized');
}

// Get client IP address
function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         req.ip ||
         '0.0.0.0';
}

// API endpoint to get visitor info
app.get('/api/visitor-info', (req, res) => {
  const clientIp = getClientIp(req);
  const geo = geoip.lookup(clientIp);
  const userAgent = req.headers['user-agent'] || 'Unknown';

  const visitorInfo = {
    ip: clientIp,
    country: geo?.country || 'Unknown',
    city: geo?.city || 'Unknown',
    timezone: geo?.timezone || 'Unknown',
    latitude: geo?.ll?.[0] || null,
    longitude: geo?.ll?.[1] || null
  };

  // Store visitor session in database
  db.run(
    `INSERT INTO visitor_sessions (ip_address, country, city, timezone, latitude, longitude, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [visitorInfo.ip, visitorInfo.country, visitorInfo.city, visitorInfo.timezone, 
     visitorInfo.latitude, visitorInfo.longitude, userAgent],
    (err) => {
      if (err) console.error('Error inserting visitor:', err);
    }
  );

  res.json(visitorInfo);
});

// API endpoint to get server time
app.get('/api/server-time', (req, res) => {
  res.json({
    serverTime: new Date().toISOString(),
    timestamp: Date.now()
  });
});

// API endpoint to store calculations
app.post('/api/store-calculation', (req, res) => {
  const { visitorIp, calculatorType, inputData, result } = req.body;

  db.run(
    `INSERT INTO calculations (visitor_ip, calculator_type, input_data, result)
     VALUES (?, ?, ?, ?)`,
    [visitorIp, calculatorType, JSON.stringify(inputData), JSON.stringify(result)],
    (err) => {
      if (err) {
        console.error('Error storing calculation:', err);
        res.status(500).json({ error: 'Failed to store calculation' });
      } else {
        res.json({ success: true, message: 'Calculation stored' });
      }
    }
  );
});

// API endpoint to get all visitor data (for admin purposes)
app.get('/api/all-data', (req, res) => {
  db.all(
    `SELECT * FROM visitor_sessions ORDER BY visit_timestamp DESC`,
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: 'Failed to fetch data' });
      } else {
        res.json({ sessions: rows });
      }
    }
  );
});

// API endpoint to get all calculations
app.get('/api/all-calculations', (req, res) => {
  db.all(
    `SELECT * FROM calculations ORDER BY calculation_timestamp DESC`,
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: 'Failed to fetch calculations' });
      } else {
        res.json({ calculations: rows });
      }
    }
  );
});

// Serve main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) console.error('Error closing database:', err);
    console.log('Database closed');
    process.exit(0);
  });
});
