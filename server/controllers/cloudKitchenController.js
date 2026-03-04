const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Register a new cloud kitchen
 * @route   POST /api/cloud-kitchen/register
 * @access  Private
 */
exports.registerCloudKitchen = async (req, res, next) => {
    try {
        const {
            name, description, cuisines, phone, email,
            address, operatingHours, deliveryFee, minOrderAmount, deliveryTime,
        } = req.body;

        if (!name || !phone || !address) {
            return next(new ErrorResponse('Name, phone, and address are required', 400));
        }

        // Check if user already has a cloud kitchen
        const existing = await Restaurant.findOne({ owner: req.user.id, isCloudKitchen: true });
        if (existing) {
            return next(new ErrorResponse('You already have a registered cloud kitchen', 400));
        }

        const kitchen = await Restaurant.create({
            name,
            description: description || '',
            owner: req.user.id,
            cuisines: cuisines || [],
            phone,
            email: email || '',
            address: address || {},
            isCloudKitchen: true,
            operatingHours: operatingHours || { open: '09:00', close: '23:00' },
            deliveryFee: deliveryFee || 0,
            minOrderAmount: minOrderAmount || 99,
            deliveryTime: deliveryTime || { min: 20, max: 40 },
            isOpen: true,
        });

        // Upgrade user role to 'restaurant' if they are a regular user
        if (req.user.role === 'user') {
            const User = require('../models/User');
            await User.findByIdAndUpdate(req.user.id, { role: 'restaurant' });
        }

        res.status(201).json({
            success: true,
            kitchen,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get dashboard analytics for a cloud kitchen
 * @route   GET /api/cloud-kitchen/dashboard
 * @access  Private (restaurant owner)
 */
exports.getDashboard = async (req, res, next) => {
    try {
        const kitchen = await Restaurant.findOne({ owner: req.user.id, isCloudKitchen: true });
        if (!kitchen) {
            return next(new ErrorResponse('No cloud kitchen found for this user', 404));
        }

        // Get order stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalOrders,
            todayOrders,
            pendingOrders,
            totalRevenue,
            menuItemCount,
            avgRating,
        ] = await Promise.all([
            Order.countDocuments({ restaurant: kitchen._id }),
            Order.countDocuments({ restaurant: kitchen._id, createdAt: { $gte: today } }),
            Order.countDocuments({
                restaurant: kitchen._id,
                status: { $in: ['placed', 'confirmed', 'preparing'] },
            }),
            Order.aggregate([
                { $match: { restaurant: kitchen._id, paymentStatus: 'paid' } },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
            MenuItem.countDocuments({ restaurant: kitchen._id }),
            Restaurant.findById(kitchen._id).select('rating ratingCount'),
        ]);

        const recentOrders = await Order.find({ restaurant: kitchen._id })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('user', 'name email')
            .select('status total items createdAt paymentMethod paymentStatus');

        res.status(200).json({
            success: true,
            kitchen,
            stats: {
                totalOrders,
                todayOrders,
                pendingOrders,
                totalRevenue: totalRevenue[0]?.total || 0,
                menuItemCount,
                rating: avgRating?.rating || 0,
                ratingCount: avgRating?.ratingCount || 0,
            },
            recentOrders,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get kitchen's pending/active orders
 * @route   GET /api/cloud-kitchen/orders
 * @access  Private (restaurant owner)
 */
exports.getKitchenOrders = async (req, res, next) => {
    try {
        const kitchen = await Restaurant.findOne({ owner: req.user.id, isCloudKitchen: true });
        if (!kitchen) {
            return next(new ErrorResponse('No cloud kitchen found', 404));
        }

        const { status, page = 1, limit = 20 } = req.query;
        const query = { restaurant: kitchen._id };
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
 * @desc    Update cloud kitchen details
 * @route   PUT /api/cloud-kitchen/update
 * @access  Private (restaurant owner)
 */
exports.updateKitchen = async (req, res, next) => {
    try {
        const kitchen = await Restaurant.findOne({ owner: req.user.id, isCloudKitchen: true });
        if (!kitchen) {
            return next(new ErrorResponse('No cloud kitchen found', 404));
        }

        const allowedFields = [
            'name', 'description', 'cuisines', 'phone', 'email',
            'address', 'operatingHours', 'deliveryFee', 'minOrderAmount',
            'deliveryTime', 'isOpen', 'coverImage',
        ];

        const updates = {};
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const updated = await Restaurant.findByIdAndUpdate(kitchen._id, updates, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            kitchen: updated,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Toggle kitchen open/closed status
 * @route   PUT /api/cloud-kitchen/toggle-status
 * @access  Private (restaurant owner)
 */
exports.toggleKitchenStatus = async (req, res, next) => {
    try {
        const kitchen = await Restaurant.findOne({ owner: req.user.id, isCloudKitchen: true });
        if (!kitchen) {
            return next(new ErrorResponse('No cloud kitchen found', 404));
        }

        kitchen.isOpen = !kitchen.isOpen;
        await kitchen.save();

        res.status(200).json({
            success: true,
            isOpen: kitchen.isOpen,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Add menu item to cloud kitchen
 * @route   POST /api/cloud-kitchen/menu
 * @access  Private (restaurant owner)
 */
exports.addMenuItem = async (req, res, next) => {
    try {
        const kitchen = await Restaurant.findOne({ owner: req.user.id, isCloudKitchen: true });
        if (!kitchen) {
            return next(new ErrorResponse('No cloud kitchen found', 404));
        }

        const item = await MenuItem.create({
            ...req.body,
            restaurant: kitchen._id,
        });

        res.status(201).json({
            success: true,
            item,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get all menu items for the cloud kitchen
 * @route   GET /api/cloud-kitchen/menu
 * @access  Private (restaurant owner)
 */
exports.getMenuItems = async (req, res, next) => {
    try {
        const kitchen = await Restaurant.findOne({ owner: req.user.id, isCloudKitchen: true });
        if (!kitchen) {
            return next(new ErrorResponse('No cloud kitchen found', 404));
        }

        const items = await MenuItem.find({ restaurant: kitchen._id }).sort({ category: 1, name: 1 });

        res.status(200).json({
            success: true,
            count: items.length,
            items,
        });
    } catch (err) {
        next(err);
    }
};
