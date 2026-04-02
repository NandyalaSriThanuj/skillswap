// controllers/userController.js
// Handles user profiles, skill management, and search

const { query } = require('../config/database');

// ==========================================
// GET USER PROFILE - GET /api/users/:id
// ==========================================
const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT u.id, u.name, u.email, u.bio, u.location, u.profile_photo,
              u.rating, u.rating_count, u.created_at,
              COALESCE(
                json_agg(DISTINCT jsonb_build_object(
                  'id', so.id, 'skill_id', s1.id, 'skill_name', s1.name,
                  'category', s1.category, 'proficiency_level', so.proficiency_level,
                  'description', so.description
                )) FILTER (WHERE so.id IS NOT NULL), '[]'
              ) as skills_offered,
              COALESCE(
                json_agg(DISTINCT jsonb_build_object(
                  'id', sr.id, 'skill_id', s2.id, 'skill_name', s2.name,
                  'category', s2.category
                )) FILTER (WHERE sr.id IS NOT NULL), '[]'
              ) as skills_wanted
       FROM users u
       LEFT JOIN skill_offers so ON so.user_id = u.id
       LEFT JOIN skills s1 ON s1.id = so.skill_id
       LEFT JOIN skill_requests sr ON sr.user_id = u.id
       LEFT JOIN skills s2 ON s2.id = sr.skill_id
       WHERE u.id = $1 AND u.is_active = TRUE
       GROUP BY u.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ==========================================
// UPDATE PROFILE - PUT /api/users/profile
// ==========================================
const updateProfile = async (req, res) => {
  try {
    const { name, bio, location } = req.body;
    const userId = req.user.id;
    const profilePhoto = req.file ? req.file.filename : undefined;

    // Build dynamic query based on what fields were provided
    let setClauses = [];
    let values = [];
    let paramCount = 1;

    if (name) { setClauses.push(`name = $${paramCount++}`); values.push(name); }
    if (bio !== undefined) { setClauses.push(`bio = $${paramCount++}`); values.push(bio); }
    if (location !== undefined) { setClauses.push(`location = $${paramCount++}`); values.push(location); }
    if (profilePhoto) { setClauses.push(`profile_photo = $${paramCount++}`); values.push(profilePhoto); }
    
    setClauses.push(`updated_at = NOW()`);
    values.push(userId);

    const result = await query(
      `UPDATE users SET ${setClauses.join(', ')} 
       WHERE id = $${paramCount} 
       RETURNING id, name, email, bio, location, profile_photo, rating`,
      values
    );

    res.json({ 
      success: true, 
      message: 'Profile updated successfully!',
      user: result.rows[0] 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ==========================================
// SEARCH USERS - GET /api/users/search
// Find users by skill they offer or want
// ==========================================
const searchUsers = async (req, res) => {
  try {
    const { skill, category, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    const currentUserId = req.user?.id;

    let whereClause = 'WHERE u.is_active = TRUE';
    let values = [];
    let paramCount = 1;

    // Filter by skill name if provided
    if (skill) {
      whereClause += ` AND EXISTS (
        SELECT 1 FROM skill_offers so2 
        JOIN skills s ON s.id = so2.skill_id 
        WHERE so2.user_id = u.id 
        AND LOWER(s.name) LIKE LOWER($${paramCount++})
      )`;
      values.push(`%${skill}%`);
    }

    // Filter by category if provided
    if (category) {
      whereClause += ` AND EXISTS (
        SELECT 1 FROM skill_offers so3 
        JOIN skills s ON s.id = so3.skill_id 
        WHERE so3.user_id = u.id 
        AND s.category = $${paramCount++}
      )`;
      values.push(category);
    }

    // Exclude current user from results
    if (currentUserId) {
      whereClause += ` AND u.id != $${paramCount++}`;
      values.push(currentUserId);
    }

    // Get total count for pagination
    const countResult = await query(
      `SELECT COUNT(DISTINCT u.id) FROM users u ${whereClause}`,
      values
    );

    // Get paginated users with their skills
    const usersResult = await query(
      `SELECT DISTINCT u.id, u.name, u.bio, u.location, u.profile_photo,
              u.rating, u.rating_count, u.created_at,
              COALESCE(
                json_agg(DISTINCT jsonb_build_object(
                  'skill_name', s1.name, 'category', s1.category,
                  'proficiency_level', so.proficiency_level
                )) FILTER (WHERE so.id IS NOT NULL), '[]'
              ) as skills_offered,
              COALESCE(
                json_agg(DISTINCT jsonb_build_object(
                  'skill_name', s2.name, 'category', s2.category
                )) FILTER (WHERE sr.id IS NOT NULL), '[]'
              ) as skills_wanted
       FROM users u
       LEFT JOIN skill_offers so ON so.user_id = u.id
       LEFT JOIN skills s1 ON s1.id = so.skill_id
       LEFT JOIN skill_requests sr ON sr.user_id = u.id
       LEFT JOIN skills s2 ON s2.id = sr.skill_id
       ${whereClause}
       GROUP BY u.id
       ORDER BY u.rating DESC
       LIMIT $${paramCount++} OFFSET $${paramCount++}`,
      [...values, parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      users: usersResult.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ==========================================
// ADD SKILL OFFER - POST /api/users/skills/offer
// ==========================================
const addSkillOffer = async (req, res) => {
  try {
    const { skill_id, proficiency_level, description } = req.body;
    const userId = req.user.id;

    const result = await query(
      `INSERT INTO skill_offers (user_id, skill_id, proficiency_level, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, skill_id) DO UPDATE 
         SET proficiency_level = $3, description = $4
       RETURNING *`,
      [userId, skill_id, proficiency_level || 'intermediate', description]
    );

    // Get skill name for response
    const skillInfo = await query('SELECT name, category FROM skills WHERE id = $1', [skill_id]);
    
    res.status(201).json({ 
      success: true, 
      message: 'Skill added to your offerings!',
      skill: { ...result.rows[0], ...skillInfo.rows[0] }
    });
  } catch (error) {
    console.error('Add skill offer error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ==========================================
// REMOVE SKILL OFFER - DELETE /api/users/skills/offer/:id
// ==========================================
const removeSkillOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await query(
      'DELETE FROM skill_offers WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    res.json({ success: true, message: 'Skill removed from offerings.' });
  } catch (error) {
    console.error('Remove skill offer error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ==========================================
// ADD SKILL REQUEST - POST /api/users/skills/want
// ==========================================
const addSkillRequest = async (req, res) => {
  try {
    const { skill_id, description, urgency } = req.body;
    const userId = req.user.id;

    const result = await query(
      `INSERT INTO skill_requests (user_id, skill_id, description, urgency)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, skill_id) DO UPDATE 
         SET description = $3, urgency = $4
       RETURNING *`,
      [userId, skill_id, description, urgency || 'normal']
    );

    const skillInfo = await query('SELECT name, category FROM skills WHERE id = $1', [skill_id]);

    res.status(201).json({ 
      success: true, 
      message: 'Skill added to your wanted list!',
      skill: { ...result.rows[0], ...skillInfo.rows[0] }
    });
  } catch (error) {
    console.error('Add skill request error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ==========================================
// REMOVE SKILL REQUEST - DELETE /api/users/skills/want/:id
// ==========================================
const removeSkillRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await query(
      'DELETE FROM skill_requests WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    res.json({ success: true, message: 'Skill removed from wanted list.' });
  } catch (error) {
    console.error('Remove skill request error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ==========================================
// GET ALL SKILLS - GET /api/users/skills/all
// Returns all available skills for dropdown menus
// ==========================================
const getAllSkills = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM skills ORDER BY category, name'
    );

    // Group by category for easy frontend use
    const grouped = result.rows.reduce((acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
    }, {});

    res.json({ success: true, skills: result.rows, grouped });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ==========================================
// GET MATCHES - GET /api/users/matches
// Find users whose skills match what you want and vice versa
// ==========================================
const getMatches = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find users who have skills you want AND want skills you have
    const result = await query(
      `SELECT DISTINCT u.id, u.name, u.bio, u.profile_photo, u.rating,
              -- Skills they offer that you want
              json_agg(DISTINCT s_they_offer.name) FILTER (WHERE s_they_offer.id IS NOT NULL) as matching_offers,
              -- Skills you offer that they want
              json_agg(DISTINCT s_you_offer.name) FILTER (WHERE s_you_offer.id IS NOT NULL) as matching_wants
       FROM users u
       -- They offer skills you want
       JOIN skill_offers their_offers ON their_offers.user_id = u.id
       JOIN skill_requests your_wants ON your_wants.user_id = $1 
         AND your_wants.skill_id = their_offers.skill_id
       JOIN skills s_they_offer ON s_they_offer.id = their_offers.skill_id
       -- You offer skills they want
       LEFT JOIN skill_requests their_wants ON their_wants.user_id = u.id
       LEFT JOIN skill_offers your_offers ON your_offers.user_id = $1
         AND your_offers.skill_id = their_wants.skill_id
       LEFT JOIN skills s_you_offer ON s_you_offer.id = your_offers.skill_id
       WHERE u.id != $1 AND u.is_active = TRUE
       GROUP BY u.id
       ORDER BY u.rating DESC
       LIMIT 20`,
      [userId]
    );

    res.json({ success: true, matches: result.rows });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { 
  getUserProfile, updateProfile, searchUsers,
  addSkillOffer, removeSkillOffer, 
  addSkillRequest, removeSkillRequest,
  getAllSkills, getMatches
};
