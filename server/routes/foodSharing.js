const express = require('express');
const router = express.Router();
const {
    getAvailableListings,
    createListing,
    claimServings,
    getListing,
    getRestaurantListings,
    getImpactStats,
} = require('../controllers/foodSharingController');
const { protect, authorize } = require('../middleware/auth');

// Public
router.get('/', getAvailableListings);
router.get('/stats', getImpactStats);
router.get('/:id', getListing);

// Protected
router.post('/', protect, authorize('restaurant', 'admin'), createListing);
router.post('/:id/claim', protect, claimServings);
router.get('/restaurant/:restaurantId', protect, authorize('restaurant', 'admin'), getRestaurantListings);

module.exports = router;
