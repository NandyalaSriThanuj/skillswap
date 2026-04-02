// routes/auth.js
const express = require('express');
const router = express.Router();
const { signup, login, getMe } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

router.post('/signup', signup);           // POST /api/auth/signup
router.post('/login', login);             // POST /api/auth/login
router.get('/me', authMiddleware, getMe); // GET  /api/auth/me (protected)

module.exports = router;
