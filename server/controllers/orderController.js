const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Restaurant = require('../models/Restaurant');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Place order from cart
 * @route   POST /api/orders
 * @access  Private
 */
exports.placeOrder = async (req, res, next) => {
    try {
        const { deliveryAddress, paymentMethod, notes } = req.body;

        // Validate delivery address
        if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state) {
            return next(new ErrorResponse('Delivery address with street, city, and state is required', 400));
        }

        // Validate payment method
        if (!paymentMethod || !['online', 'cod'].includes(paymentMethod)) {
            return next(new ErrorResponse('Payment method must be "online" or "cod"', 400));
        }

        // Get user's cart
        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart || cart.items.length === 0) {
            return next(new ErrorResponse('Your cart is empty', 400));
        }

        // Get restaurant for delivery fee
        const restaurant = await Restaurant.findById(cart.restaurant);
        if (!restaurant) {
            return next(new ErrorResponse('Restaurant not found', 404));
        }

        // Calculate pricing
        const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // Check minimum order amount
        if (subtotal < restaurant.minOrderAmount) {
            return next(
                new ErrorResponse(
                    `Minimum order amount is ₹${restaurant.minOrderAmount}. Your subtotal is ₹${subtotal}.`,
                    400
                )
            );
        }

        const deliveryFee = restaurant.deliveryFee || 0;
        const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
        const total = subtotal + deliveryFee + tax;

        // Calculate estimated delivery time
        const maxDeliveryMin = restaurant.deliveryTime?.max || 40;
        const estimatedDelivery = new Date(Date.now() + maxDeliveryMin * 60 * 1000);

        // Create order
        const order = await Order.create({
            user: req.user.id,
            restaurant: cart.restaurant,
            items: cart.items.map((item) => ({
                menuItem: item.menuItem,
                name: item.name,
                price: item.price,
                image: item.image,
                quantity: item.quantity,
            })),
            deliveryAddress,
            paymentMethod,
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
            subtotal,
            deliveryFee,
            tax,
            total,
            notes: notes || '',
            estimatedDelivery,
        });

        // Clear cart after order
        cart.items = [];
        cart.restaurant = null;
        await cart.save();

        // Populate restaurant info
        const populatedOrder = await Order.findById(order._id)
            .populate('restaurant', 'name coverImage phone')
            .populate('user', 'name email phone');

        res.status(201).json({
            success: true,
            order: populatedOrder,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get current user's orders
 * @route   GET /api/orders
 * @access  Private
 */
exports.getMyOrders = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        const query = { user: req.user.id };
        if (status) query.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Order.countDocuments(query);

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('restaurant', 'name coverImage');

        res.status(200).json({
            success: true,
            count: orders.length,
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            orders,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get single order
 * @route   GET /api/orders/:id
 * @access  Private
 */
exports.getOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('restaurant', 'name coverImage phone address')
            .populate('user', 'name email phone');

        if (!order) {
            return next(new ErrorResponse('Order not found', 404));
        }

        // Only order owner, restaurant owner, or admin can view
        if (
            order.user._id.toString() !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            // Check if restaurant owner
            const restaurant = await Restaurant.findById(order.restaurant._id);
            if (!restaurant || restaurant.owner.toString() !== req.user.id) {
                return next(new ErrorResponse('Not authorized to view this order', 403));
            }
        }

        res.status(200).json({
            success: true,
            order,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get restaurant's orders (for restaurant owner)
 * @route   GET /api/orders/restaurant/:restaurantId
 * @access  Private (restaurant owner / admin)
 */
exports.getRestaurantOrders = async (req, res, next) => {
    try {
        const restaurant = await Restaurant.findById(req.params.restaurantId);

        if (!restaurant) {
            return next(new ErrorResponse('Restaurant not found', 404));
        }

        if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(new ErrorResponse('Not authorized', 403));
        }

        const { status, page = 1, limit = 20 } = req.query;
        const query = { restaurant: req.params.restaurantId };
        if (status) query.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Order.countDocuments(query);

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('user', 'name email phone');

        res.status(200).json({
            success: true,
            count: orders.length,
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
            orders,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private (restaurant owner / admin)
 */
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        const validStatuses = ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return next(new ErrorResponse(`Status must be one of: ${validStatuses.join(', ')}`, 400));
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return next(new ErrorResponse('Order not found', 404));
        }

        // Check authorization
        const restaurant = await Restaurant.findById(order.restaurant);
        if (
            restaurant.owner.toString() !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return next(new ErrorResponse('Not authorized to update this order', 403));
        }

        // Prevent invalid transitions
        if (order.status === 'delivered' || order.status === 'cancelled') {
            return next(new ErrorResponse(`Cannot update a ${order.status} order`, 400));
        }

        order.status = status;

        if (status === 'delivered') {
            order.deliveredAt = new Date();
            if (order.paymentMethod === 'cod') {
                order.paymentStatus = 'paid';
            }
        }

        if (status === 'cancelled') {
            order.cancelledAt = new Date();
            order.cancelReason = req.body.cancelReason || '';
            if (order.paymentStatus === 'paid') {
                order.paymentStatus = 'refunded';
            }
        }

        await order.save();

        const updatedOrder = await Order.findById(order._id)
            .populate('restaurant', 'name coverImage')
            .populate('user', 'name email phone');

        res.status(200).json({
            success: true,
            order: updatedOrder,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Cancel order (by customer)
 * @route   PUT /api/orders/:id/cancel
 * @access  Private
 */
exports.cancelOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return next(new ErrorResponse('Order not found', 404));
        }

        if (order.user.toString() !== req.user.id) {
            return next(new ErrorResponse('Not authorized', 403));
        }

        // Only allow cancellation if order is placed or confirmed
        if (!['placed', 'confirmed'].includes(order.status)) {
            return next(
                new ErrorResponse('Order can only be cancelled before preparation starts', 400)
            );
        }

        order.status = 'cancelled';
        order.cancelledAt = new Date();
        order.cancelReason = req.body.reason || 'Cancelled by customer';

        if (order.paymentStatus === 'paid') {
            order.paymentStatus = 'refunded';
        }

        await order.save();

        const updatedOrder = await Order.findById(order._id)
            .populate('restaurant', 'name coverImage');

        res.status(200).json({
            success: true,
            order: updatedOrder,
        });
    } catch (err) {
        next(err);
    }
};
