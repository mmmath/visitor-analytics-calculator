# Visitor Analytics & Multi-Function Calculator

A single-page web application that captures visitor information, displays server time in the visitor's timezone, and includes multiple calculators. All data is stored in a local SQLite database.

## ✨ Features

### 🌍 Visitor Analytics
- **IP Address Detection**: Captures visitor's IP address automatically
- **Geolocation**: Displays country, city, and GPS coordinates
- **Timezone Detection**: Shows visitor's detected timezone from IP geolocation
- **Server Time Display**: Real-time server time adjusted to visitor's local timezone
- **User Agent**: Tracks browser and device information

### 🧮 Multi-Function Calculator
1. **Basic Calculator**: Standard arithmetic operations (+, −, ×, ÷)
2. **Scientific Calculator**: Advanced functions (sin, cos, tan, √, log, x², x³, n!)
3. **Mortgage Calculator**: Calculate monthly payments, total interest, and amortization
4. **Radiant Calculator**: Circle (area, circumference) and square (perimeter, area, diagonal) calculations

### 💾 Data Storage
- All visitor sessions stored in local SQLite database
- All calculations tracked with visitor IP and timestamp
- Persistent data across page reloads
- Admin API endpoints to query all stored data

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mmmath/visitor-analytics-calculator.git
   cd visitor-analytics-calculator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open in browser**
   Navigate to: `http://localhost:3000`

### Development Mode
For auto-reload on file changes:
```bash
npm run dev
```
*(Requires nodemon - included in devDependencies)*

## 📊 Database Schema

### visitor_sessions Table
```sql
- id                INTEGER PRIMARY KEY
- ip_address        TEXT (visitor's IP)
- country           TEXT (from geolocation)
- city              TEXT (from geolocation)
- timezone          TEXT (from geolocation)
- latitude          REAL (coordinates)
- longitude         REAL (coordinates)
- user_agent        TEXT (browser info)
- visit_timestamp   DATETIME (when visited)
```

### calculations Table
```sql
- id                    INTEGER PRIMARY KEY
- visitor_ip            TEXT (foreign key)
- calculator_type       TEXT (basic/scientific/mortgage/radiant)
- input_data            TEXT (JSON format)
- result                TEXT (JSON format)
- calculation_timestamp DATETIME (when calculated)
```

## 🔌 API Endpoints

### GET `/api/visitor-info`
Returns visitor's IP, location, and timezone information.

**Response:**
```json
{
  "ip": "203.0.113.45",
  "country": "US",
  "city": "Mountain View",
  "timezone": "America/Los_Angeles",
  "latitude": 37.4192,
  "longitude": -122.0574
}
```

### GET `/api/server-time`
Returns current server time in ISO format.

**Response:**
```json
{
  "serverTime": "2024-01-15T14:30:45.123Z",
  "timestamp": 1705334445123
}
```

### POST `/api/store-calculation`
Stores a calculation result in the database.

**Request Body:**
```json
{
  "visitorIp": "203.0.113.45",
  "calculatorType": "basic",
  "inputData": {
    "num1": 5,
    "num2": 3,
    "operation": "+"
  },
  "result": 8
}
```

### GET `/api/all-data`
Returns all visitor sessions (admin endpoint).

**Response:**
```json
{
  "sessions": [
    {
      "id": 1,
      "ip_address": "203.0.113.45",
      "country": "US",
      ...
    }
  ]
}
```

### GET `/api/all-calculations`
Returns all stored calculations (admin endpoint).

**Response:**
```json
{
  "calculations": [
    {
      "id": 1,
      "visitor_ip": "203.0.113.45",
      "calculator_type": "basic",
      ...
    }
  ]
}
```

## 📁 Project Structure

```
visitor-analytics-calculator/
├── public/
│   ├── index.html          # Main HTML page
│   ├── styles.css          # CSS styling
│   └── app.js              # JavaScript functionality
├── server.js               # Express server & API
├── package.json            # Dependencies
├── data.db                 # SQLite database (auto-created)
├── .gitignore              # Git ignore file
└── README.md               # This file
```

## 🛠️ Technologies Used

| Component | Technology |
|-----------|-----------|
| Backend | Node.js, Express.js |
| Database | SQLite3 |
| Geolocation | geoip-lite |
| Frontend | Vanilla JavaScript, HTML5, CSS3 |
| Middleware | CORS, Body Parser |

## 📱 Features Breakdown

### Basic Calculator
- Addition, subtraction, multiplication, division
- Clear and backspace functions
- Real-time display updates
- Single operation at a time

### Scientific Calculator
- **Trigonometric**: sin, cos, tan (angle in degrees)
- **Power Functions**: x², x³, and factorial
- **Utility**: √ (square root), log (base 10)
- **Advanced**: Parentheses support for complex expressions

### Mortgage Calculator
- **Inputs**:
  - Principal loan amount
  - Annual interest rate (%)
  - Loan term (years)
- **Outputs**:
  - Monthly payment amount
  - Total payment over life of loan
  - Total interest paid

### Radiant Calculator
- **Circle Operations**:
  - Calculate area from radius
  - Calculate circumference
- **Square Operations**:
  - Calculate perimeter from side length
  - Calculate area
  - Calculate diagonal

## 🔒 Privacy & Security

- ✓ All data stored locally in SQLite database
- ✓ No external data transmission (except GeoIP lookup)
- ✓ Database file (`data.db`) is local to server
- ✓ Admin endpoints should be protected in production
- ✓ CORS enabled for cross-origin requests

## 🌐 Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome/Edge | ✅ Latest |
| Firefox | ✅ Latest |
| Safari | ✅ Latest |
| Mobile Browsers | ✅ Full support |

## ⚡ Performance

- Single-page application for instant interactions
- Lightweight SQLite database for fast queries
- Responsive design for all screen sizes
- CSS animations for smooth transitions
- Real-time timezone conversion in browser

## 🚢 Deployment

### Local Server
```bash
npm start
```
Runs on `http://localhost:3000`

### Production Deployment
1. Set environment variables: `PORT`, database path
2. Use process manager (PM2, systemd, etc.)
3. Set up reverse proxy (Nginx, Apache)
4. Enable HTTPS
5. Protect admin endpoints with authentication

### Docker Deployment
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📈 Future Enhancements

- [ ] User authentication system
- [ ] Data export (CSV, PDF)
- [ ] Advanced analytics dashboard
- [ ] Dark mode toggle
- [ ] Multi-language support
- [ ] Database backup automation
- [ ] API rate limiting
- [ ] Real-time visitor counter
- [ ] Graph visualization of calculations
- [ ] Mobile app wrapper

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in server.js or use:
PORT=3001 npm start
```

### Database Issues
```bash
# Delete old database and restart
rm data.db
npm start
```

### GeoIP Lookup Failing
- Install geoip-lite database: `npm install geoip-lite`
- Restart server

## 📝 License

MIT License - feel free to use this project for educational and personal purposes.

## 💬 Support

For issues, questions, or suggestions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include error messages and steps to reproduce

---

**Built with ❤️ for visitor analytics and multi-functional calculations**
