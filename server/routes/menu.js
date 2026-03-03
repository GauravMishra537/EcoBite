const express = require('express');
const router = express.Router();
const {
    getMenuItem,
    updateMenuItem,
    deleteMenuItem,
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');

// Public
router.get('/:id', getMenuItem);

// Protected (owner / admin)
router.put('/:id', protect, authorize('restaurant', 'admin'), updateMenuItem);
router.delete('/:id', protect, authorize('restaurant', 'admin'), deleteMenuItem);

module.exports = router;
