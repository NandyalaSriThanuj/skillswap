// config/database.js
// Connects to PostgreSQL using the pg library

const { Pool } = require('pg');

// Create a connection pool (reuses connections for better performance)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // If DATABASE_URL is not set, use individual fields
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'skillswap',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10, // Maximum 10 connections in pool
});

// Test the connection when the app starts
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('✅ Database connected successfully');
    release(); // Release the test connection back to pool
  }
});

// Helper function to run queries
// Usage: const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
