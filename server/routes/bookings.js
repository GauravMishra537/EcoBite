const express = require('express');
const router = express.Router();
const {
    getAvailableSlots,
    createBooking,
    getMyBookings,
    getBooking,
    cancelBooking,
    confirmBooking,
    getRestaurantBookings,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

// Public
router.get('/slots/:restaurantId', getAvailableSlots);

// Protected — customer
router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/:id', protect, getBooking);
router.put('/:id/cancel', protect, cancelBooking);

// Protected — restaurant owner / admin
router.put('/:id/confirm', protect, authorize('restaurant', 'admin'), confirmBooking);
router.get('/restaurant/:restaurantId', protect, authorize('restaurant', 'admin'), getRestaurantBookings);

module.exports = router;
