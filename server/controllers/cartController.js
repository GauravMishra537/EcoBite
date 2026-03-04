const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Get current user's cart
 * @route   GET /api/cart
 * @access  Private
 */
exports.getCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id }).populate(
            'restaurant',
            'name coverImage deliveryFee deliveryTime minOrderAmount'
        );

        if (!cart) {
            cart = await Cart.create({ user: req.user.id, items: [] });
        }

        res.status(200).json({
            success: true,
            cart,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/cart/add
 * @access  Private
 */
exports.addToCart = async (req, res, next) => {
    try {
        const { menuItemId, quantity = 1 } = req.body;

        if (!menuItemId) {
            return next(new ErrorResponse('Menu item ID is required', 400));
        }

        const menuItem = await MenuItem.findById(menuItemId);
        if (!menuItem) {
            return next(new ErrorResponse('Menu item not found', 404));
        }

        if (!menuItem.isAvailable) {
            return next(new ErrorResponse('This item is currently unavailable', 400));
        }

        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            cart = await Cart.create({ user: req.user.id, items: [] });
        }

        // Check if adding from a different restaurant
        if (
            cart.restaurant &&
            cart.items.length > 0 &&
            cart.restaurant.toString() !== menuItem.restaurant.toString()
        ) {
            return next(
                new ErrorResponse(
                    'Your cart contains items from another restaurant. Clear your cart first to order from a different restaurant.',
                    400
                )
            );
        }

        // Set restaurant on cart
        cart.restaurant = menuItem.restaurant;

        // Check if item already exists in cart
        const existingIndex = cart.items.findIndex(
            (item) => item.menuItem.toString() === menuItemId
        );

        if (existingIndex > -1) {
            // Update quantity
            cart.items[existingIndex].quantity += quantity;
        } else {
            // Add new item
            cart.items.push({
                menuItem: menuItem._id,
                name: menuItem.name,
                price: menuItem.price,
                image: menuItem.image || '',
                quantity,
            });
        }

        await cart.save();

        // Populate restaurant info for response
        cart = await Cart.findById(cart._id).populate(
            'restaurant',
            'name coverImage deliveryFee deliveryTime minOrderAmount'
        );

        res.status(200).json({
            success: true,
            cart,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Update item quantity in cart
 * @route   PUT /api/cart/item/:itemId
 * @access  Private
 */
exports.updateCartItem = async (req, res, next) => {
    try {
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return next(new ErrorResponse('Quantity must be at least 1', 400));
        }

        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return next(new ErrorResponse('Cart not found', 404));
        }

        const itemIndex = cart.items.findIndex(
            (item) => item._id.toString() === req.params.itemId
        );

        if (itemIndex === -1) {
            return next(new ErrorResponse('Item not found in cart', 404));
        }

        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        cart = await Cart.findById(cart._id).populate(
            'restaurant',
            'name coverImage deliveryFee deliveryTime minOrderAmount'
        );

        res.status(200).json({
            success: true,
            cart,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/item/:itemId
 * @access  Private
 */
exports.removeCartItem = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return next(new ErrorResponse('Cart not found', 404));
        }

        cart.items = cart.items.filter(
            (item) => item._id.toString() !== req.params.itemId
        );

        // Clear restaurant if cart is empty
        if (cart.items.length === 0) {
            cart.restaurant = null;
        }

        await cart.save();

        cart = await Cart.findById(cart._id).populate(
            'restaurant',
            'name coverImage deliveryFee deliveryTime minOrderAmount'
        );

        res.status(200).json({
            success: true,
            cart,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart
 * @access  Private
 */
exports.clearCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return next(new ErrorResponse('Cart not found', 404));
        }

        cart.items = [];
        cart.restaurant = null;
        await cart.save();

        res.status(200).json({
            success: true,
            cart,
        });
    } catch (err) {
        next(err);
    }
};
