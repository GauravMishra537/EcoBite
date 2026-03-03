const express = require('express');
const router = express.Router();
const {
    getRestaurants,
    getRestaurant,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    getMyRestaurants,
} = require('../controllers/restaurantController');
const {
    getMenuItems,
    createMenuItem,
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getRestaurants);
router.get('/my', protect, authorize('restaurant', 'admin'), getMyRestaurants);
router.get('/:id', getRestaurant);

// Restaurant CRUD (owner / admin)
router.post('/', protect, authorize('restaurant', 'admin'), createRestaurant);
router.put('/:id', protect, authorize('restaurant', 'admin'), updateRestaurant);
router.delete('/:id', protect, authorize('restaurant', 'admin'), deleteRestaurant);

// Menu items nested under restaurant
router.get('/:restaurantId/menu', getMenuItems);
router.post('/:restaurantId/menu', protect, authorize('restaurant', 'admin'), createMenuItem);

module.exports = router;
