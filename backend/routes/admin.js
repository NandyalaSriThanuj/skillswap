// routes/admin.js
const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { getStats, getAllUsers, toggleUserStatus, getAllExchanges, addSkill } = require('../controllers/adminController');

// All admin routes require authentication AND admin privileges
router.use(authMiddleware, adminMiddleware);

router.get('/stats', getStats);                    // GET dashboard stats
router.get('/users', getAllUsers);                 // GET all users
router.put('/users/:id/toggle', toggleUserStatus); // PUT toggle user active/inactive
router.get('/exchanges', getAllExchanges);          // GET all exchanges
router.post('/skills', addSkill);                  // POST add new skill

module.exports = router;
