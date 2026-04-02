// controllers/exchangeController.js
// Handles skill exchange requests between users

const { query } = require('../config/database');

// Helper: Create a notification for a user
const createNotification = async (userId, type, title, body, relatedId) => {
  await query(
    `INSERT INTO notifications (user_id, type, title, body, related_id) 
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, type, title, body, relatedId]
  );
};

// ==========================================
// SEND EXCHANGE REQUEST - POST /api/exchanges
// ==========================================
const sendExchangeRequest = async (req, res) => {
  try {
    const { provider_id, requester_skill_id, provider_skill_id, message } = req.body;
    const requesterId = req.user.id;

    // Can't request an exchange with yourself
    if (provider_id === requesterId) {
      return res.status(400).json({ 
        success: false, 
        message: "You can't create an exchange with yourself!" 
      });
    }

    // Check if there's already a pending exchange between these users
    const existing = await query(
      `SELECT id FROM exchanges 
       WHERE (requester_id = $1 AND provider_id = $2) 
          OR (requester_id = $2 AND provider_id = $1)
       AND status = 'pending'`,
      [requesterId, provider_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have a pending exchange request with this user.' 
      });
    }

    // Create the exchange
    const result = await query(
      `INSERT INTO exchanges 
         (requester_id, provider_id, requester_skill_id, provider_skill_id, message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [requesterId, provider_id, requester_skill_id, provider_skill_id, message]
    );

    const exchange = result.rows[0];

    // Notify the provider
    const requesterName = req.user.name;
    await createNotification(
      provider_id,
      'exchange_request',
      'New Skill Exchange Request!',
      `${requesterName} wants to exchange skills with you.`,
      exchange.id
    );

    res.status(201).json({ 
      success: true, 
      message: 'Exchange request sent!',
      exchange 
    });
  } catch (error) {
    console.error('Send exchange error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ==========================================
// GET MY EXCHANGES - GET /api/exchanges
// Returns all exchanges for current user
// ==========================================
const getMyExchanges = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let whereClause = `WHERE (e.requester_id = $1 OR e.provider_id = $1)`;
    let values = [userId];

    if (status) {
      whereClause += ` AND e.status = $2`;
      values.push(status);
    }

    const result = await query(
      `SELECT e.*,
              -- Requester info
              r.name as requester_name, r.profile_photo as requester_photo,
              -- Provider info
              p.name as provider_name, p.profile_photo as provider_photo,
              -- Skills involved
              s1.name as requester_skill_name,
              s2.name as provider_skill_name,
              -- Unread message count
              (SELECT COUNT(*) FROM messages m 
               WHERE m.exchange_id = e.id 
               AND m.sender_id != $1 
               AND m.is_read = FALSE) as unread_count
       FROM exchanges e
       JOIN users r ON r.id = e.requester_id
       JOIN users p ON p.id = e.provider_id
       LEFT JOIN skills s1 ON s1.id = e.requester_skill_id
       LEFT JOIN skills s2 ON s2.id = e.provider_skill_id
       ${whereClause}
       ORDER BY e.updated_at DESC`,
      values
    );

    res.json({ success: true, exchanges: result.rows });
  } catch (error) {
    console.error('Get exchanges error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ==========================================
// GET SINGLE EXCHANGE - GET /api/exchanges/:id
// ==========================================
const getExchange = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(
      `SELECT e.*,
              r.name as requester_name, r.profile_photo as requester_photo, r.rating as requester_rating,
              p.name as provider_name, p.profile_photo as provider_photo, p.rating as provider_rating,
              s1.name as requester_skill_name, s2.name as provider_skill_name
       FROM exchanges e
       JOIN users r ON r.id = e.requester_id
       JOIN users p ON p.id = e.provider_id
       LEFT JOIN skills s1 ON s1.id = e.requester_skill_id
       LEFT JOIN skills s2 ON s2.id = e.provider_skill_id
       WHERE e.id = $1 AND (e.requester_id = $2 OR e.provider_id = $2)`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Exchange not found.' });
    }

    res.json({ success: true, exchange: result.rows[0] });
  } catch (error) {
    console.error('Get exchange error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ==========================================
// UPDATE EXCHANGE STATUS - PUT /api/exchanges/:id/status
// Accept, reject, complete, or cancel
// ==========================================
const updateExchangeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const validStatuses = ['accepted', 'rejected', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status.' 
      });
    }

    // Get the exchange
    const exchangeResult = await query(
      'SELECT * FROM exchanges WHERE id = $1',
      [id]
    );

    if (exchangeResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Exchange not found.' });
    }

    const exchange = exchangeResult.rows[0];

    // Only provider can accept/reject, either party can cancel
    if ((status === 'accepted' || status === 'rejected') && exchange.provider_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only the recipient can accept or reject this request.' 
      });
    }

    if (status === 'cancelled' && exchange.requester_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only the requester can cancel this request.' 
      });
    }

    if (status === 'completed' && exchange.provider_id !== userId && exchange.requester_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Update the status
    await query(
      'UPDATE exchanges SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, id]
    );

    // Send notification to the other party
    const otherUserId = exchange.requester_id === userId ? exchange.provider_id : exchange.requester_id;
    const statusMessages = {
      accepted: 'Your exchange request was accepted! 🎉',
      rejected: 'Your exchange request was declined.',
      completed: 'An exchange has been marked as completed.',
      cancelled: 'An exchange request was cancelled.'
    };

    await createNotification(
      otherUserId,
      `exchange_${status}`,
      `Exchange ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      statusMessages[status],
      id
    );

    res.json({ 
      success: true, 
      message: `Exchange ${status} successfully.` 
    });
  } catch (error) {
    console.error('Update exchange error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ==========================================
// SUBMIT RATING - POST /api/exchanges/:id/rate
// ==========================================
const submitRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating must be between 1 and 5.' 
      });
    }

    const exchangeResult = await query(
      'SELECT * FROM exchanges WHERE id = $1 AND status = $2',
      [id, 'completed']
    );

    if (exchangeResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Completed exchange not found.' 
      });
    }

    const exchange = exchangeResult.rows[0];

    let ratingField, reviewField, ratedUserId;
    
    if (exchange.requester_id === userId) {
      ratingField = 'requester_rating';
      reviewField = 'requester_review';
      ratedUserId = exchange.provider_id;
    } else if (exchange.provider_id === userId) {
      ratingField = 'provider_rating';
      reviewField = 'provider_review';
      ratedUserId = exchange.requester_id;
    } else {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Save rating to exchange
    await query(
      `UPDATE exchanges SET ${ratingField} = $1, ${reviewField} = $2 WHERE id = $3`,
      [rating, review, id]
    );

    // Update the rated user's average rating
    await query(
      `UPDATE users SET 
        rating = (rating * rating_count + $1) / (rating_count + 1),
        rating_count = rating_count + 1
       WHERE id = $2`,
      [rating, ratedUserId]
    );

    res.json({ success: true, message: 'Rating submitted successfully!' });
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { 
  sendExchangeRequest, getMyExchanges, getExchange,
  updateExchangeStatus, submitRating 
};
