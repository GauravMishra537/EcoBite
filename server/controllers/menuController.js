const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Get all menu items for a restaurant
 * @route   GET /api/restaurants/:restaurantId/menu
 * @access  Public
 */
exports.getMenuItems = async (req, res, next) => {
    try {
        const { category, isVeg, search, sortBy } = req.query;

        const query = { restaurant: req.params.restaurantId };

        if (category) {
            query.category = category;
        }

        if (isVeg !== undefined) {
            query.isVeg = isVeg === 'true';
        }

        if (search) {
            query.$text = { $search: search };
        }

        let sort = { category: 1, name: 1 };
        if (sortBy === 'price_low') sort = { price: 1 };
        if (sortBy === 'price_high') sort = { price: -1 };
        if (sortBy === 'name') sort = { name: 1 };

        const menuItems = await MenuItem.find(query).sort(sort);

        res.status(200).json({
            success: true,
            count: menuItems.length,
            menuItems,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get single menu item
 * @route   GET /api/menu/:id
 * @access  Public
 */
exports.getMenuItem = async (req, res, next) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id).populate(
            'restaurant',
            'name'
        );

        if (!menuItem) {
            return next(new ErrorResponse('Menu item not found', 404));
        }

        res.status(200).json({
            success: true,
            menuItem,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Create menu item
 * @route   POST /api/restaurants/:restaurantId/menu
 * @access  Private (restaurant owner / admin)
 */
exports.createMenuItem = async (req, res, next) => {
    try {
        const restaurant = await Restaurant.findById(req.params.restaurantId);

        if (!restaurant) {
            return next(new ErrorResponse('Restaurant not found', 404));
        }

        // Check ownership
        if (
            restaurant.owner.toString() !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return next(
                new ErrorResponse('Not authorized to add items to this restaurant', 403)
            );
        }

        req.body.restaurant = req.params.restaurantId;
        const menuItem = await MenuItem.create(req.body);

        res.status(201).json({
            success: true,
            menuItem,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Update menu item
 * @route   PUT /api/menu/:id
 * @access  Private (restaurant owner / admin)
 */
exports.updateMenuItem = async (req, res, next) => {
    try {
        let menuItem = await MenuItem.findById(req.params.id);

        if (!menuItem) {
            return next(new ErrorResponse('Menu item not found', 404));
        }

        const restaurant = await Restaurant.findById(menuItem.restaurant);

        if (
            restaurant.owner.toString() !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return next(
                new ErrorResponse('Not authorized to update this item', 403)
            );
        }

        menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            menuItem,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Delete menu item
 * @route   DELETE /api/menu/:id
 * @access  Private (restaurant owner / admin)
 */
exports.deleteMenuItem = async (req, res, next) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);

        if (!menuItem) {
            return next(new ErrorResponse('Menu item not found', 404));
        }

        const restaurant = await Restaurant.findById(menuItem.restaurant);

        if (
            restaurant.owner.toString() !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return next(
                new ErrorResponse('Not authorized to delete this item', 403)
            );
        }

        await MenuItem.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Menu item deleted',
        });
    } catch (err) {
        next(err);
    }
};
