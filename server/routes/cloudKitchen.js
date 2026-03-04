const express = require('express');
const router = express.Router();
const {
    registerCloudKitchen,
    getDashboard,
    getKitchenOrders,
    updateKitchen,
    toggleKitchenStatus,
    addMenuItem,
    getMenuItems,
} = require('../controllers/cloudKitchenController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Registration (any authenticated user can register)
router.post('/register', registerCloudKitchen);

// Dashboard & management (restaurant owners or admins)
router.get('/dashboard', authorize('restaurant', 'admin'), getDashboard);
router.get('/orders', authorize('restaurant', 'admin'), getKitchenOrders);
router.put('/update', authorize('restaurant', 'admin'), updateKitchen);
router.put('/toggle-status', authorize('restaurant', 'admin'), toggleKitchenStatus);

// Menu management
router.get('/menu', authorize('restaurant', 'admin'), getMenuItems);
router.post('/menu', authorize('restaurant', 'admin'), addMenuItem);

module.exports = router;
