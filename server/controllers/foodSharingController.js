const FoodListing = require('../models/FoodListing');
const Restaurant = require('../models/Restaurant');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    List available food (for NGOs/users to browse)
 * @route   GET /api/food-sharing
 * @access  Public
 */
exports.getAvailableListings = async (req, res, next) => {
    try {
        const { city, category, page = 1, limit = 20 } = req.query;
        const query = {
            status: { $in: ['available', 'partially_claimed'] },
            expiresAt: { $gt: new Date() },
        };
        if (city) query['pickupAddress.city'] = { $regex: city, $options: 'i' };
        if (category) query.category = category;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await FoodListing.countDocuments(query);

        const listings = await FoodListing.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('restaurant', 'name coverImage address')
            .populate('listedBy', 'name');

        res.status(200).json({
            success: true,
            count: listings.length,
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            listings,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Create a food listing (restaurant owner)
 * @route   POST /api/food-sharing
 * @access  Private (restaurant owner)
 */
exports.createListing = async (req, res, next) => {
    try {
        const {
            restaurantId, title, description, items,
            totalServings, nominalCost, category,
            pickupWindow, expiresAt, image,
        } = req.body;

        if (!title || !totalServings) {
            return next(new ErrorResponse('Title and total servings are required', 400));
        }

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return next(new ErrorResponse('Restaurant not found', 404));
        }

        if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse('Not authorized', 403));
        }

        // Default expiry: 6 hours from now
        const expiry = expiresAt ? new Date(expiresAt) : new Date(Date.now() + 6 * 60 * 60 * 1000);

        const listing = await FoodListing.create({
            restaurant: restaurantId,
            listedBy: req.user.id,
            title,
            description: description || '',
            items: items || [],
            totalServings,
            remainingServings: totalServings,
            nominalCost: nominalCost !== undefined ? nominalCost : 10,
            category: category || 'leftover',
            pickupAddress: restaurant.address || {},
            pickupWindow: pickupWindow || {},
            expiresAt: expiry,
            image: image || '',
        });

        res.status(201).json({ success: true, listing });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Claim food servings (NGO or user)
 * @route   POST /api/food-sharing/:id/claim
 * @access  Private
 */
exports.claimServings = async (req, res, next) => {
    try {
        const { servings, ngoName } = req.body;
        const listing = await FoodListing.findById(req.params.id);

        if (!listing) {
            return next(new ErrorResponse('Food listing not found', 404));
        }

        if (listing.expiresAt <= new Date()) {
            listing.status = 'expired';
            await listing.save();
            return next(new ErrorResponse('This listing has expired', 400));
        }

        const requestedServings = servings || 1;
        if (requestedServings > listing.remainingServings) {
            return next(
                new ErrorResponse(`Only ${listing.remainingServings} servings remaining`, 400)
            );
        }

        listing.claims.push({
            claimedBy: req.user.id,
            ngoName: ngoName || '',
            servingsClaimed: requestedServings,
        });

        listing.remainingServings -= requestedServings;
        await listing.save();

        res.status(200).json({
            success: true,
            message: `Successfully claimed ${requestedServings} serving(s)`,
            listing,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get single listing
 * @route   GET /api/food-sharing/:id
 * @access  Public
 */
exports.getListing = async (req, res, next) => {
    try {
        const listing = await FoodListing.findById(req.params.id)
            .populate('restaurant', 'name coverImage address phone')
            .populate('listedBy', 'name')
            .populate('claims.claimedBy', 'name email');

        if (!listing) {
            return next(new ErrorResponse('Listing not found', 404));
        }

        res.status(200).json({ success: true, listing });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get restaurant's food listings
 * @route   GET /api/food-sharing/restaurant/:restaurantId
 * @access  Private (restaurant owner)
 */
exports.getRestaurantListings = async (req, res, next) => {
    try {
        const restaurant = await Restaurant.findById(req.params.restaurantId);
        if (!restaurant) {
            return next(new ErrorResponse('Restaurant not found', 404));
        }

        if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse('Not authorized', 403));
        }

        const listings = await FoodListing.find({ restaurant: req.params.restaurantId })
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({
            success: true,
            count: listings.length,
            listings,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get impact stats (total servings donated, etc.)
 * @route   GET /api/food-sharing/stats
 * @access  Public
 */
exports.getImpactStats = async (req, res, next) => {
    try {
        const stats = await FoodListing.aggregate([
            {
                $group: {
                    _id: null,
                    totalListings: { $sum: 1 },
                    totalServingsListed: { $sum: '$totalServings' },
                    totalServingsClaimed: {
                        $sum: { $subtract: ['$totalServings', '$remainingServings'] },
                    },
                    totalRestaurants: { $addToSet: '$restaurant' },
                },
            },
            {
                $project: {
                    _id: 0,
                    totalListings: 1,
                    totalServingsListed: 1,
                    totalServingsClaimed: 1,
                    totalRestaurants: { $size: '$totalRestaurants' },
                },
            },
        ]);

        res.status(200).json({
            success: true,
            stats: stats[0] || {
                totalListings: 0,
                totalServingsListed: 0,
                totalServingsClaimed: 0,
                totalRestaurants: 0,
            },
        });
    } catch (err) {
        next(err);
    }
};
