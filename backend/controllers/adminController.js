// controllers/adminController.js
// Admin-only operations: manage users, view all exchanges

const { query } = require('../config/database');

// GET /api/admin/stats - Dashboard statistics
const getStats = async (req, res) => {
  try {
    const [users, exchanges, skills, messages] = await Promise.all([
      query('SELECT COUNT(*) FROM users WHERE is_active = TRUE'),
      query('SELECT status, COUNT(*) FROM exchanges GROUP BY status'),
      query('SELECT COUNT(*) FROM skill_offers'),
      query('SELECT COUNT(*) FROM messages')
    ]);

    const exchangesByStatus = exchanges.rows.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count);
      return acc;
    }, {});

    res.json({
      success: true,
      stats: {
        totalUsers: parseInt(users.rows[0].count),
        totalSkillOffers: parseInt(skills.rows[0].count),
        totalMessages: parseInt(messages.rows[0].count),
        exchanges: exchangesByStatus
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/admin/users - List all users
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let values = [];
    
    if (search) {
      whereClause += ' AND (name ILIKE $1 OR email ILIKE $1)';
      values.push(`%${search}%`);
    }

    const result = await query(
      `SELECT id, name, email, rating, rating_count, is_admin, is_active, created_at
       FROM users ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      values
    );

    res.json({ 
      success: true, 
      users: result.rows,
      total: parseInt(countResult.rows[0].count)
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/admin/users/:id/toggle - Activate/deactivate user
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `UPDATE users SET is_active = NOT is_active 
       WHERE id = $1 RETURNING id, name, is_active`,
      [id]
    );

    const user = result.rows[0];
    res.json({ 
      success: true, 
      message: `User ${user.is_active ? 'activated' : 'deactivated'}.`,
      user
    });
  } catch (error) {
    console.error('Toggle user error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/admin/exchanges - All exchanges
const getAllExchanges = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = status ? 'WHERE e.status = $1' : '';
    let values = status ? [status] : [];

    const result = await query(
      `SELECT e.*, 
              r.name as requester_name, p.name as provider_name,
              s1.name as requester_skill, s2.name as provider_skill
       FROM exchanges e
       JOIN users r ON r.id = e.requester_id
       JOIN users p ON p.id = e.provider_id
       LEFT JOIN skills s1 ON s1.id = e.requester_skill_id
       LEFT JOIN skills s2 ON s2.id = e.provider_skill_id
       ${whereClause}
       ORDER BY e.created_at DESC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, limit, offset]
    );

    res.json({ success: true, exchanges: result.rows });
  } catch (error) {
    console.error('Admin get exchanges error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/admin/skills - Add a new skill to the platform
const addSkill = async (req, res) => {
  try {
    const { name, category, description } = req.body;
    
    const result = await query(
      `INSERT INTO skills (name, category, description) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (name) DO NOTHING
       RETURNING *`,
      [name, category, description]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Skill already exists.' });
    }

    res.status(201).json({ success: true, skill: result.rows[0] });
  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getStats, getAllUsers, toggleUserStatus, getAllExchanges, addSkill };
































