// ==========================================
// Smart Internship Tracker - Backend Server
// ==========================================
// Using Node.js + Express with in-memory data storage

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Initialize Express app
const app = express();

// ===== MIDDLEWARE =====
// Enable CORS (Cross-Origin Resource Sharing) to allow frontend to communicate with backend
app.use(cors());

// Parse incoming request bodies as JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from frontend folder (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../frontend')));

// ===== IMPORT ROUTES =====
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

// ===== REGISTER ROUTES =====
// All routes are prefixed with /api
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

// ===== API INFO ENDPOINT =====
// GET /api/info - Returns server info (doesn't conflict with static files)
app.get('/api/info', (req, res) => {
  res.json({
    message: 'Welcome to Smart Internship Tracker API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      jobs: '/api/jobs',
      applications: '/api/applications',
    },
  });
});

// ===== ROOT ROUTE =====
// Serve splash page at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/splash.html'));
});

// ===== 404 HANDLER =====
// Handle requests to non-existent routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `${req.method} ${req.path} does not exist`,
  });
});

// ===== ERROR HANDLER =====
// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Server error',
    message: err.message,
  });
});

// ===== START SERVER =====
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  Smart Internship Tracker - Started!   ║
╠════════════════════════════════════════╣
║  Server running at: http://localhost:${PORT}  ║
║  Frontend: Open in browser as needed   ║
╚════════════════════════════════════════╝
  `);
  console.log('\nAvailable API Routes:');
  console.log('─────────────────────');
  console.log('Users:');
  console.log('  POST   /api/users/register          - Register new user');
  console.log('  POST   /api/users/login             - Login user');
  console.log('  GET    /api/users/profile/:id       - Get user profile');
  console.log('  PUT    /api/users/profile/:id/resume - Update resume');
  console.log('');
  console.log('Jobs:');
  console.log('  POST   /api/jobs                    - Post new job');
  console.log('  GET    /api/jobs                    - Get all jobs');
  console.log('  GET    /api/jobs/:id                - Get job by ID');
  console.log('  PUT    /api/jobs/:id                - Update job');
  console.log('  DELETE /api/jobs/:id                - Delete job');
  console.log('');
  console.log('Applications:');
  console.log('  POST   /api/applications            - Submit application');
  console.log('  GET    /api/applications            - Get all applications');
  console.log('  GET    /api/applications/:id        - Get application by ID');
  console.log('  GET    /api/applications/job/:jobId - Get applications for job');
  console.log('  GET    /api/applications/student/:studentId - Get student applications');
  console.log('  PUT    /api/applications/:id/status - Update application status');
  console.log('');
});

module.exports = app;
