// routes/exchanges.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { 
  sendExchangeRequest, getMyExchanges, getExchange,
  updateExchangeStatus, submitRating 
} = require('../controllers/exchangeController');

router.use(authMiddleware);

router.post('/', sendExchangeRequest);                    // POST send exchange request
router.get('/', getMyExchanges);                          // GET all my exchanges
router.get('/:id', getExchange);                          // GET single exchange
router.put('/:id/status', updateExchangeStatus);          // PUT update status
router.post('/:id/rate', submitRating);                   // POST submit rating

module.exports = router;
