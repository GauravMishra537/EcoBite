const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Get all restaurants (with search, filter, pagination)
 * @route   GET /api/restaurants
 * @access  Public
 */
exports.getRestaurants = async (req, res, next) => {
    try {
        const {
            search,
            cuisine,
            isVeg,
            isCloudKitchen,
            rating,
            sortBy,
            page = 1,
            limit = 12,
        } = req.query;

        const query = { isActive: true };

        // Text search
        if (search) {
            query.$text = { $search: search };
        }

        // Filter by cuisine
        if (cuisine) {
            query.cuisines = { $in: cuisine.split(',') };
        }

        // Cloud kitchen filter
        if (isCloudKitchen !== undefined) {
            query.isCloudKitchen = isCloudKitchen === 'true';
        }

        // Minimum rating filter
        if (rating) {
            query.rating = { $gte: parseFloat(rating) };
        }

        // Sort options
        let sort = {};
        switch (sortBy) {
            case 'rating':
                sort = { rating: -1 };
                break;
            case 'deliveryTime':
                sort = { 'deliveryTime.min': 1 };
                break;
            case 'name':
                sort = { name: 1 };
                break;
            case 'newest':
                sort = { createdAt: -1 };
                break;
            default:
                sort = { rating: -1, createdAt: -1 };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Restaurant.countDocuments(query);

        const restaurants = await Restaurant.find(query)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('owner', 'name email');

        res.status(200).json({
            success: true,
            count: restaurants.length,
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            restaurants,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get single restaurant with menu items
 * @route   GET /api/restaurants/:id
 * @access  Public
 */
exports.getRestaurant = async (req, res, next) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id).populate(
            'owner',
            'name email'
        );

        if (!restaurant) {
            return next(new ErrorResponse('Restaurant not found', 404));
        }

        // Get menu items grouped by category
        const menuItems = await MenuItem.find({
            restaurant: req.params.id,
            isAvailable: true,
        }).sort({ category: 1, name: 1 });

        // Group by category
        const menuByCategory = {};
        menuItems.forEach((item) => {
            if (!menuByCategory[item.category]) {
                menuByCategory[item.category] = [];
            }
            menuByCategory[item.category].push(item);
        });

        res.status(200).json({
            success: true,
            restaurant,
            menu: menuByCategory,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Create restaurant
 * @route   POST /api/restaurants
 * @access  Private (restaurant owner / admin)
 */
exports.createRestaurant = async (req, res, next) => {
    try {
        req.body.owner = req.user.id;

        const restaurant = await Restaurant.create(req.body);

        res.status(201).json({
            success: true,
            restaurant,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Update restaurant
 * @route   PUT /api/restaurants/:id
 * @access  Private (owner / admin)
 */
exports.updateRestaurant = async (req, res, next) => {
    try {
        let restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return next(new ErrorResponse('Restaurant not found', 404));
        }

        // Check ownership (unless admin)
        if (
            restaurant.owner.toString() !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return next(
                new ErrorResponse('Not authorized to update this restaurant', 403)
            );
        }

        restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            restaurant,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Delete restaurant
 * @route   DELETE /api/restaurants/:id
 * @access  Private (owner / admin)
 */
exports.deleteRestaurant = async (req, res, next) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return next(new ErrorResponse('Restaurant not found', 404));
        }

        if (
            restaurant.owner.toString() !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return next(
                new ErrorResponse('Not authorized to delete this restaurant', 403)
            );
        }

        // Delete all menu items for this restaurant
        await MenuItem.deleteMany({ restaurant: req.params.id });
        await Restaurant.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Restaurant deleted successfully',
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get restaurants owned by current user
 * @route   GET /api/restaurants/my
 * @access  Private (restaurant owner)
 */
exports.getMyRestaurants = async (req, res, next) => {
    try {
        const restaurants = await Restaurant.find({ owner: req.user.id }).sort({
            createdAt: -1,
        });

        res.status(200).json({
            success: true,
            count: restaurants.length,
            restaurants,
        });
    } catch (err) {
        next(err);
    }
};
