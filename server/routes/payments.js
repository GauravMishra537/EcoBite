const express = require('express');
const router = express.Router();
const {
    createPaymentIntent,
    confirmPayment,
    getStripeConfig,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Public
router.get('/config', getStripeConfig);

// Private
router.post('/create-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmPayment);

module.exports = router;
