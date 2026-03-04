const express = require('express');
const router = express.Router();
const {
    getPlans,
    subscribe,
    getMySubscription,
    cancelSubscription,
    checkFreeDelivery,
    getHistory,
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

// Public
router.get('/plans', getPlans);

// Protected
router.post('/subscribe', protect, subscribe);
router.get('/my', protect, getMySubscription);
router.put('/cancel', protect, cancelSubscription);
router.get('/check-delivery', protect, checkFreeDelivery);
router.get('/history', protect, getHistory);

module.exports = router;
