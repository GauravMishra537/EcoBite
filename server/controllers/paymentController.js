const Stripe = require('stripe');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Restaurant = require('../models/Restaurant');
const ErrorResponse = require('../utils/errorResponse');
const env = require('../config/env');

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

/**
 * @desc    Create a Stripe Payment Intent for an order
 * @route   POST /api/payments/create-intent
 * @access  Private
 */
exports.createPaymentIntent = async (req, res, next) => {
    try {
        const { deliveryAddress, notes } = req.body;

        // Validate address
        if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state) {
            return next(new ErrorResponse('Delivery address with street, city, and state is required', 400));
        }

        // Get cart
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart || cart.items.length === 0) {
            return next(new ErrorResponse('Your cart is empty', 400));
        }

        // Get restaurant
        const restaurant = await Restaurant.findById(cart.restaurant);
        if (!restaurant) {
            return next(new ErrorResponse('Restaurant not found', 404));
        }

        // Calculate pricing
        const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        if (subtotal < restaurant.minOrderAmount) {
            return next(
                new ErrorResponse(`Minimum order amount is ₹${restaurant.minOrderAmount}`, 400)
            );
        }

        const deliveryFee = restaurant.deliveryFee || 0;
        const tax = Math.round(subtotal * 0.05 * 100) / 100;
        const total = subtotal + deliveryFee + tax;

        // Stripe amount is in paisa (smallest currency unit)
        const amountInPaisa = Math.round(total * 100);

        // Create Stripe PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInPaisa,
            currency: 'inr',
            metadata: {
                userId: req.user.id,
                restaurantId: cart.restaurant.toString(),
                itemCount: cart.items.length.toString(),
            },
        });

        // Create the order in "pending" payment status
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
            paymentMethod: 'online',
            paymentStatus: 'pending',
            stripePaymentIntentId: paymentIntent.id,
            subtotal,
            deliveryFee,
            tax,
            total,
            notes: notes || '',
            estimatedDelivery: new Date(Date.now() + (restaurant.deliveryTime?.max || 40) * 60 * 1000),
        });

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            orderId: order._id,
            total,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Confirm payment was successful (called after Stripe confirmation on frontend)
 * @route   POST /api/payments/confirm
 * @access  Private
 */
exports.confirmPayment = async (req, res, next) => {
    try {
        const { orderId, paymentIntentId } = req.body;

        if (!orderId || !paymentIntentId) {
            return next(new ErrorResponse('Order ID and Payment Intent ID are required', 400));
        }

        // Verify with Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            return next(new ErrorResponse(`Payment not successful. Status: ${paymentIntent.status}`, 400));
        }

        // Update order
        const order = await Order.findById(orderId);
        if (!order) {
            return next(new ErrorResponse('Order not found', 404));
        }

        if (order.user.toString() !== req.user.id) {
            return next(new ErrorResponse('Not authorized', 403));
        }

        order.paymentStatus = 'paid';
        order.status = 'placed';
        await order.save();

        // Clear cart
        const cart = await Cart.findOne({ user: req.user.id });
        if (cart) {
            cart.items = [];
            cart.restaurant = null;
            await cart.save();
        }

        const populatedOrder = await Order.findById(order._id)
            .populate('restaurant', 'name coverImage')
            .populate('user', 'name email');

        res.status(200).json({
            success: true,
            order: populatedOrder,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get Stripe publishable key
 * @route   GET /api/payments/config
 * @access  Public
 */
exports.getStripeConfig = async (req, res) => {
    res.status(200).json({
        success: true,
        publishableKey: env.STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY,
    });
};
