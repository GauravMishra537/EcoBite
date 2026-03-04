const express = require('express');
const router = express.Router();
const {
    placeOrder,
    getMyOrders,
    getOrder,
    getRestaurantOrders,
    updateOrderStatus,
    cancelOrder,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// All order routes are private
router.use(protect);

// Customer routes
router.post('/', placeOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrder);
router.put('/:id/cancel', cancelOrder);

// Restaurant owner / admin routes
router.get('/restaurant/:restaurantId', authorize('restaurant', 'admin'), getRestaurantOrders);
router.put('/:id/status', authorize('restaurant', 'admin'), updateOrderStatus);

module.exports = router;
