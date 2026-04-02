// controllers/authController.js
// Handles user registration, login, and profile retrieval

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// ==========================================
// SIGN UP - POST /api/auth/signup
// ==========================================
const signup = async (req, res) => {
  try {
    const { name, email, password, bio, location } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and password are required.' 
      });
    }

    // Check if email already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered. Please login.' 
      });
    }

    // Hash the password (never store plain text passwords!)
    // 10 = salt rounds (higher = more secure but slower)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user into database
    const result = await query(
      `INSERT INTO users (name, email, password_hash, bio, location) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, email, bio, location, rating, created_at`,
      [name, email.toLowerCase(), passwordHash, bio || null, location || null]
    );

    const newUser = result.rows[0];

    // Create JWT token
    const token = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: newUser
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error during signup.' });
  }
};

// ==========================================
// LOGIN - POST /api/auth/login
// ==========================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required.' 
      });
    }

    // Find user by email
    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND is_active = TRUE',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password.' 
      });
    }

    const user = result.rows[0];

    // Compare provided password with stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password.' 
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Don't send password hash to client
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// ==========================================
// GET CURRENT USER - GET /api/auth/me
// ==========================================
const getMe = async (req, res) => {
  try {
    // req.user is set by the authMiddleware
    const result = await query(
      `SELECT u.id, u.name, u.email, u.bio, u.location, u.profile_photo,
              u.rating, u.rating_count, u.is_admin, u.created_at,
              -- Get skills offered as JSON array
              COALESCE(
                json_agg(DISTINCT jsonb_build_object(
                  'id', so.id,
                  'skill_id', s1.id,
                  'skill_name', s1.name,
                  'category', s1.category,
                  'proficiency_level', so.proficiency_level
                )) FILTER (WHERE so.id IS NOT NULL), '[]'
              ) as skills_offered,
              -- Get skills wanted as JSON array
              COALESCE(
                json_agg(DISTINCT jsonb_build_object(
                  'id', sr.id,
                  'skill_id', s2.id,
                  'skill_name', s2.name,
                  'category', s2.category
                )) FILTER (WHERE sr.id IS NOT NULL), '[]'
              ) as skills_wanted
       FROM users u
       LEFT JOIN skill_offers so ON so.user_id = u.id
       LEFT JOIN skills s1 ON s1.id = so.skill_id
       LEFT JOIN skill_requests sr ON sr.user_id = u.id
       LEFT JOIN skills s2 ON s2.id = sr.skill_id
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.user.id]
    );

    res.json({
      success: true,
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { signup, login, getMe };
