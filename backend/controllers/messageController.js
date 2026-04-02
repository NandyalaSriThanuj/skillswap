// controllers/messageController.js
// Handles the messaging system between matched users

const { query } = require('../config/database');

// ==========================================
// GET MESSAGES FOR EXCHANGE - GET /api/messages/:exchangeId
// ==========================================
const getMessages = async (req, res) => {
  try {
    const { exchangeId } = req.params;
    const userId = req.user.id;

    // Verify user is part of this exchange
    const exchangeCheck = await query(
      `SELECT id FROM exchanges 
       WHERE id = $1 AND (requester_id = $2 OR provider_id = $2)`,
      [exchangeId, userId]
    );

    if (exchangeCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Get all messages for this exchange
    const result = await query(
      `SELECT m.*, u.name as sender_name, u.profile_photo as sender_photo
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.exchange_id = $1
       ORDER BY m.created_at ASC`,
      [exchangeId]
    );

    // Mark messages from the other user as read
    await query(
      `UPDATE messages SET is_read = TRUE 
       WHERE exchange_id = $1 AND sender_id != $2 AND is_read = FALSE`,
      [exchangeId, userId]
    );

    res.json({ success: true, messages: result.rows });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ==========================================
// SEND MESSAGE - POST /api/messages/:exchangeId
// ==========================================
const sendMessage = async (req, res) => {
  try {
    const { exchangeId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
    }

    // Verify user is part of this exchange and it's active
    const exchangeCheck = await query(
      `SELECT id, requester_id, provider_id, status FROM exchanges 
       WHERE id = $1 AND (requester_id = $2 OR provider_id = $2)`,
      [exchangeId, userId]
    );

    if (exchangeCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const exchange = exchangeCheck.rows[0];

    // Only allow messaging for accepted or pending exchanges
    if (!['pending', 'accepted'].includes(exchange.status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot send messages to closed exchanges.' 
      });
    }

    // Insert message
    const result = await query(
      `INSERT INTO messages (exchange_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [exchangeId, userId, content.trim()]
    );

    const message = result.rows[0];

    // Get sender info to include in response
    const senderInfo = await query(
      'SELECT name, profile_photo FROM users WHERE id = $1',
      [userId]
    );

    res.status(201).json({
      success: true,
      message: {
        ...message,
        sender_name: senderInfo.rows[0]?.name,
        sender_photo: senderInfo.rows[0]?.profile_photo
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ==========================================
// GET NOTIFICATIONS - GET /api/notifications
// ==========================================
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [userId]
    );

    const unreadCount = result.rows.filter(n => !n.is_read).length;

    res.json({ 
      success: true, 
      notifications: result.rows,
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ==========================================
// MARK NOTIFICATIONS AS READ - PUT /api/notifications/read
// ==========================================
const markNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notification_ids } = req.body;

    if (notification_ids && notification_ids.length > 0) {
      // Mark specific notifications as read
      await query(
        `UPDATE notifications SET is_read = TRUE 
         WHERE user_id = $1 AND id = ANY($2::uuid[])`,
        [userId, notification_ids]
      );
    } else {
      // Mark all as read
      await query(
        'UPDATE notifications SET is_read = TRUE WHERE user_id = $1',
        [userId]
      );
    }

    res.json({ success: true, message: 'Notifications marked as read.' });
  } catch (error) {
    console.error('Mark notifications read error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getMessages, sendMessage, getNotifications, markNotificationsRead };
