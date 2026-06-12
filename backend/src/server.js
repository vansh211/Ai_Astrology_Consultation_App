const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const { checkAndSendReminders } = require('./utils/email');

// Import routers
const authRouter = require('./routes/auth.routes');
const astrologerRouter = require('./routes/astrologer.routes');
const bookingRouter = require('./routes/booking.routes');
const consultationRouter = require('./routes/consultation.routes');
const reviewRouter = require('./routes/review.routes');
const dashboardRouter = require('./routes/dashboard.routes');
const notificationRouter = require('./routes/notification.routes');

const app = express();

// Database Connection
connectDB();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded audio recordings statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes Mount
app.use('/api/auth', authRouter);
app.use('/api/astrologers', astrologerRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/consultations', consultationRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/dashboards', dashboardRouter);
app.use('/api/notifications', notificationRouter);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error Hook:', err);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Tumhara Pandit backend server running on port ${PORT}`);
  
  // Run 24h reminders scanner immediately on startup
  checkAndSendReminders();
  
  // Scan for 24h reminders every 1 hour (3600000 ms)
  setInterval(checkAndSendReminders, 60 * 60 * 1000);
});
