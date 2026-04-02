// server.js
// Main entry point for the SkillSwap backend server

require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// ==========================================
// SOCKET.IO SETUP (Real-time messaging)
// ==========================================
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Socket.IO connection handling
// This enables real-time chat without page refresh
io.on('connection', (socket) => {
  console.log('👤 User connected via WebSocket:', socket.id);

  // User joins a room specific to their exchange
  socket.on('join_exchange', (exchangeId) => {
    socket.join(`exchange_${exchangeId}`);
    console.log(`User joined exchange room: ${exchangeId}`);
  });

  // User sends a message - broadcast to everyone in the same exchange room
  socket.on('send_message', (data) => {
    // Broadcast to others in the same exchange room
    socket.to(`exchange_${data.exchangeId}`).emit('receive_message', data);
  });

  // User joins their personal notification room
  socket.on('join_user', (userId) => {
    socket.join(`user_${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('👤 User disconnected:', socket.id);
  });
});

// Make io accessible in controllers if needed
app.set('io', io);

// ==========================================
// MIDDLEWARE
// ==========================================

// CORS - Allow requests from frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (profile photos)
// Files in /uploads folder will be accessible at /uploads/filename.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads folder if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// ==========================================
// ROUTES
// ==========================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/exchanges', require('./routes/exchanges'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/admin', require('./routes/admin'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'SkillSwap API is running!',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'An unexpected error occurred.' 
  });
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║   🚀 SkillSwap API Server Running    ║
  ║   Port: ${PORT}                          ║
  ║   Mode: ${process.env.NODE_ENV || 'development'}                ║
  ║   Health: http://localhost:${PORT}/api/health ║
  ╚═══════════════════════════════════════╝
  `);
});
