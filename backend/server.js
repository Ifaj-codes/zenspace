require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, getMongoStatus } = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const eventRoutes = require('./routes/eventRoutes');
const noteRoutes = require('./routes/noteRoutes');
const syncRoutes = require('./routes/syncRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: '*', // Allow all origins during development and preview
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger for development
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    project: 'ZenSpace: Unified Minimalist Productivity Web Platform',
    course: 'CSE 324 – Web Technologies Sessional',
    institution: 'BAIUST',
    student: 'Nesar Uddin Ifag (ID: 1119004)',
    supervisor: 'Yeakob Ali (Lecturer)',
    databaseStatus: getMongoStatus() ? 'MongoDB Atlas / Local Connected' : 'Embedded Zero-Config Store Active',
    serverTime: new Date().toISOString(),
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/sync', syncRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found.`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error occurred.',
  });
});

// Start Server & Connect to Database
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  ZenSpace API Server running on http://localhost:${PORT}`);
    console.log(`  Course: CSE 324 | BAIUST | Student ID: 1119004`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
};

startServer();

module.exports = app;
