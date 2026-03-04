const Subscription = require('../models/Subscription');
const ErrorResponse = require('../utils/errorResponse');

// Plan configurations
const PLANS = {
    weekly: {
        name: 'Weekly Plan',
        price: 49,
        durationDays: 7,
        benefits: { freeDelivery: true, discountPercent: 0, prioritySupport: false },
    },
    monthly: {
        name: 'Monthly Plan',
        price: 149,
        durationDays: 30,
        benefits: { freeDelivery: true, discountPercent: 5, prioritySupport: false },
    },
    quarterly: {
        name: 'Quarterly Plan',
        price: 349,
        durationDays: 90,
        benefits: { freeDelivery: true, discountPercent: 10, prioritySupport: true },
    },
};

/**
 * @desc    Get available subscription plans
 * @route   GET /api/subscriptions/plans
 * @access  Public
 */
exports.getPlans = async (req, res) => {
    res.status(200).json({
        success: true,
        plans: Object.entries(PLANS).map(([key, plan]) => ({
            id: key,
            ...plan,
        })),
    });
};

/**
 * @desc    Subscribe to a plan
 * @route   POST /api/subscriptions/subscribe
 * @access  Private
 */
exports.subscribe = async (req, res, next) => {
    try {
        const { plan, paymentMethod = 'online' } = req.body;

        if (!plan || !PLANS[plan]) {
            return next(new ErrorResponse('Invalid plan. Choose: weekly, monthly, or quarterly', 400));
        }

        // Check for existing active subscription
        const existing = await Subscription.findActiveForUser(req.user.id);
        if (existing) {
            return next(new ErrorResponse('You already have an active subscription', 400));
        }

        const planConfig = PLANS[plan];
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + planConfig.durationDays * 24 * 60 * 60 * 1000);

        const subscription = await Subscription.create({
            user: req.user.id,
            plan,
            price: planConfig.price,
            startDate,
            endDate,
            benefits: planConfig.benefits,
            paymentMethod,
        });

        res.status(201).json({
            success: true,
            subscription,
            message: `Successfully subscribed to ${planConfig.name}!`,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get current user's active subscription
 * @route   GET /api/subscriptions/my
 * @access  Private
 */
exports.getMySubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findActiveForUser(req.user.id);

        res.status(200).json({
            success: true,
            hasSubscription: !!subscription,
            subscription: subscription || null,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Cancel subscription
 * @route   PUT /api/subscriptions/cancel
 * @access  Private
 */
exports.cancelSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findActiveForUser(req.user.id);

        if (!subscription) {
            return next(new ErrorResponse('No active subscription found', 404));
        }

        subscription.status = 'cancelled';
        subscription.cancelledAt = new Date();
        subscription.cancelReason = req.body.reason || 'User cancelled';
        await subscription.save();

        res.status(200).json({
            success: true,
            message: 'Subscription cancelled successfully',
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Check if user has free delivery benefit
 * @route   GET /api/subscriptions/check-delivery
 * @access  Private
 */
exports.checkFreeDelivery = async (req, res, next) => {
    try {
        const subscription = await Subscription.findActiveForUser(req.user.id);

        const hasFreeDelivery = subscription?.benefits?.freeDelivery || false;
        const discountPercent = subscription?.benefits?.discountPercent || 0;

        res.status(200).json({
            success: true,
            hasFreeDelivery,
            discountPercent,
            plan: subscription?.plan || null,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get subscription history
 * @route   GET /api/subscriptions/history
 * @access  Private
 */
exports.getHistory = async (req, res, next) => {
    try {
        const subscriptions = await Subscription.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);

        res.status(200).json({
            success: true,
            count: subscriptions.length,
            subscriptions,
        });
    } catch (err) {
        next(err);
    }
};

// Export plan configs for use in other modules
exports.PLANS = PLANS;
